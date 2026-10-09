// src/framework/utils/build/compileTemplates.js
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { compose } from '../../core/compose.js';
import { assertSafeSourcePath, ensureSafeOutputDirectory, writeOutputFile } from './outputPath.js';
import { emitTemplateModules, relativeModuleURL } from './templateModules.js';

/**
 * Generates pre-compiled templates for SPA components
 * This runs at BUILD TIME and outputs ACTUAL HTML strings (not component configs)
 * 
 * Key insight: Static templates → HTML, Dynamic templates → keep as functions
 */
export const generateCompiledTemplates = async (spaComponentPath, outputPath, options = {}) => {
    const { verbose = false, mode = 'bundle', outputDir = mode === 'individual' ? outputPath : path.dirname(outputPath) } = options;
    const templatesDir = path.join(spaComponentPath, 'templates');
    
    if (!fs.existsSync(templatesDir)) {
        if (verbose) console.warn(`⚠️  No templates directory found at: ${templatesDir}`);
        return null;
    }
    
    const sourceRoot = path.resolve(spaComponentPath);
    assertSafeSourcePath(sourceRoot, templatesDir);
    const templateFiles = fs.readdirSync(templatesDir).filter(f => f.endsWith('.js') && !/\.(test|spec)\.js$/.test(f));
    
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
        assertSafeSourcePath(sourceRoot, templatePath);
        
        try {
            const templateUrl = pathToFileURL(templatePath).href;
            const module = await import(templateUrl);
            
            if (!module.components) {
                throw new Error(`Template ${templateName} does not export components`);
            }
            
            const components = module.components;
            
            if (typeof components === 'function') {
                dynamicTemplates.add(templateName);
                compiledTemplates[templateName] = { type: 'dynamic', fn: components };
                if (verbose) console.log(`   ⚡ Dynamic template: ${templateName}`);
            } else {
                const html = compose(components, { strict: !options.allowRenderErrors });
                compiledTemplates[templateName] = { type: 'static', html };
                if (verbose) console.log(`   ✅ Compiled static template: ${templateName}`);
            }
        } catch (error) {
            throw new Error(`Failed to compile ${templateName}: ${error.message}`, { cause: error });
        }
    }
    
    if (Object.keys(compiledTemplates).length === 0) {
        return null;
    }

    const dynamicEntries = Array.from(dynamicTemplates);
    const emittedModules = dynamicEntries.length
        ? await emitTemplateModules(dynamicEntries.map(name => path.join(templatesDir, `${name}.js`)), spaComponentPath, outputDir, options)
        : new Map();

    if (mode === 'individual') {
        // Output each template as an individual file in the outputPath directory
        ensureSafeOutputDirectory(outputDir, outputPath);

        for (const [name, data] of Object.entries(compiledTemplates)) {
            const filePath = path.join(outputPath, `${name}.js`);
            let content = '';

            if (data.type === 'static') {
                content = `// 🦴 b0nes Compiled Template: ${name} (Static)
export const components = ${JSON.stringify(data.html)};
export default components;
`;
            } else {
                const modulePath = emittedModules.get(path.resolve(templatesDir, `${name}.js`));
                content = `// b0nes dynamic template: imports retain their source layout
export { components, components as default } from ${JSON.stringify(relativeModuleURL(filePath, modulePath))};
`;
            }

            writeOutputFile(outputDir, filePath, content);
            if (verbose) console.log(`   📦 Generated: ${path.relative(process.cwd(), filePath)}`);
        }
        return compiledTemplates;
    }
    
    // Bundle mode (original behavior)
    const staticEntries = Object.entries(compiledTemplates)
        .filter(([_, data]) => data.type === 'static');
    
    const outputCode = `// 🦴 b0nes Pre-compiled SPA Templates
// ⚠️  DO NOT EDIT - Auto-generated at build time
// Generated: ${new Date().toISOString()}

${dynamicEntries.map((name, index) => `import { components as dynamic${index} } from ${JSON.stringify(relativeModuleURL(outputPath, emittedModules.get(path.resolve(templatesDir, `${name}.js`))))};`).join('\n')}

// === STATIC TEMPLATES (Pre-rendered HTML) ===
const staticTemplates = {
${staticEntries.map(([name, data]) => 
    `  ${JSON.stringify(name)}: ${JSON.stringify(data.html)}`
).join(',\n')}
};

// === DYNAMIC TEMPLATES (Need runtime data) ===
const dynamicTemplates = {
${dynamicEntries.map((name, index) => `  ${JSON.stringify(name)}: dynamic${index}`).join(',\n')}
};

export const templates = {
  ...staticTemplates,
  ...dynamicTemplates
};

export default templates;
`;
    
    writeOutputFile(outputDir, outputPath, outputCode);
    return compiledTemplates;
};
