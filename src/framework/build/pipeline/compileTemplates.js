// src/framework/utils/build/compileTemplates.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { compose } from '../../core/compose.js';

/**
 * Generates pre-compiled templates for SPA components
 * This runs at BUILD TIME and outputs ACTUAL HTML strings (not component configs)
 * 
 * Key insight: Static templates → HTML, Dynamic templates → keep as functions
 */
export const generateCompiledTemplates = async (spaComponentPath, outputPath, options = {}) => {
    const { verbose = false, mode = 'bundle' } = options;
    const templatesDir = path.join(spaComponentPath, 'templates');
    
    if (!fs.existsSync(templatesDir)) {
        if (verbose) console.warn(`⚠️  No templates directory found at: ${templatesDir}`);
        return null;
    }
    
    const templateFiles = fs.readdirSync(templatesDir).filter(f => f.endsWith('.js'));
    
    if (templateFiles.length === 0) {
        if (verbose) console.warn(`⚠️  No template files found in: ${templatesDir}`);
        return null;
    }
    
    if (verbose) {
        console.log(`   📄 Found ${templateFiles.length} template(s) in ${path.relative(process.cwd(), templatesDir)}`);
    }
    
    const compiledTemplates = {};
    const dynamicTemplates = new Set();
    
    for (const file of templateFiles) {
        const templatePath = path.join(templatesDir, file);
        const templateName = path.basename(file, '.js');
        
        try {
            const templateUrl = pathToFileURL(templatePath).href;
            const module = await import(templateUrl);
            
            if (!module.components) {
                console.warn(`   ⚠️  Template ${templateName} doesn't export 'components'`);
                continue;
            }
            
            const components = module.components;
            
            if (typeof components === 'function') {
                dynamicTemplates.add(templateName);
                compiledTemplates[templateName] = { type: 'dynamic', fn: components };
                if (verbose) console.log(`   ⚡ Dynamic template: ${templateName}`);
            } else {
                const html = compose(components);
                compiledTemplates[templateName] = { type: 'static', html };
                if (verbose) console.log(`   ✅ Compiled static template: ${templateName}`);
            }
        } catch (error) {
            console.error(`   ❌ Failed to compile ${templateName}:`, error.message);
        }
    }
    
    if (Object.keys(compiledTemplates).length === 0) {
        return null;
    }

    if (mode === 'individual') {
        // Output each template as an individual file in the outputPath directory
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }

        for (const [name, data] of Object.entries(compiledTemplates)) {
            const filePath = path.join(outputPath, `${name}.js`);
            let content = '';

            if (data.type === 'static') {
                content = `// 🦴 b0nes Compiled Template: ${name} (Static)
export const components = ${JSON.stringify(data.html)};
export default components;
`;
            } else {
                // For dynamic templates, we preserve the function
                // But we need to make sure the client knows it returns a config that needs composing
                // OR we can try to wrap it if possible. 
                // For now, let's just export the original function as 'components'
                const originalSource = fs.readFileSync(path.join(templatesDir, `${name}.js`), 'utf8');
                content = `// 🦴 b0nes Compiled Template: ${name} (Dynamic - Proxy)
${originalSource}
`;
            }

            fs.writeFileSync(filePath, content, 'utf8');
            if (verbose) console.log(`   📦 Generated: ${path.relative(process.cwd(), filePath)}`);
        }
        return compiledTemplates;
    }
    
    // Bundle mode (original behavior)
    const staticEntries = Object.entries(compiledTemplates)
        .filter(([_, data]) => data.type === 'static');
    
    const dynamicEntries = Array.from(dynamicTemplates);
    
    const outputCode = `// 🦴 b0nes Pre-compiled SPA Templates
// ⚠️  DO NOT EDIT - Auto-generated at build time
// Generated: ${new Date().toISOString()}

// === STATIC TEMPLATES (Pre-rendered HTML) ===
const staticTemplates = {
${staticEntries.map(([name, data]) => 
    `  ${name}: ${JSON.stringify(data.html)}`
).join(',\n')}
};

// === DYNAMIC TEMPLATES (Need runtime data) ===
// These are currently markers or original functions
const dynamicTemplates = {
${dynamicEntries.map(name => `  ${name}: () => { console.warn('Dynamic template ${name} requires client-side loading or manual import'); return '<!-- Dynamic Template Placeholder -->'; }`).join(',\n')}
};

export const templates = {
  ...staticTemplates,
  ...dynamicTemplates
};

export default templates;
`;
    
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, outputCode, 'utf8');
    return compiledTemplates;
};