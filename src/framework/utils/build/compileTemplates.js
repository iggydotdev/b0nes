// src/framework/utils/build/compileTemplates.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { compose } from '../../compose.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates a compiled templates module for SPA components
 * This runs at BUILD TIME and outputs pre-rendered HTML strings
 * 
 * @param {string} spaComponentPath - Path to SPA component directory
 * @param {string} outputPath - Where to write the compiled templates
 * @returns {Object} Compiled templates object
 */
export const generateCompiledTemplates = async (spaComponentPath, outputPath) => {
    const templatesDir = path.join(spaComponentPath, 'templates');
    
    if (!fs.existsSync(templatesDir)) {
        console.warn(`⚠️  No templates directory found at: ${templatesDir}`);
        return null;
    }
    
    const templateFiles = fs.readdirSync(templatesDir)
        .filter(f => f.endsWith('.js'));
    
    if (templateFiles.length === 0) {
        console.warn(`⚠️  No template files found in: ${templatesDir}`);
        return null;
    }
    
    console.log(`   📄 Found ${templateFiles.length} template(s) to compile`);
    
    const compiledTemplates = {};
    
    for (const file of templateFiles) {
        const templatePath = path.join(templatesDir, file);
        const templateName = path.basename(file, '.js');
        
        try {
            // Import the template module
            const templateUrl = pathToFileURL(templatePath).href;
            const module = await import(templateUrl);
            
            // Check if it exports components (it should!)
            if (!module.components) {
                console.warn(`   ⚠️  Template ${templateName} doesn't export 'components'`);
                continue;
            }
            
            // Compile the component config to HTML
            let compiled;
            if (typeof module.components === 'function') {
                // Template is a function - we'll compile a wrapper
                // Store the function as a string so it can be eval'd on client
                compiled = `__FUNCTION__${module.components.toString()}__FUNCTION__`;
            } else {
                // Template is static - compile it now
                compiled = compose(module.components);
            }
            
            compiledTemplates[templateName] = compiled;
            console.log(`   ✅ Compiled template: ${templateName}`);
        } catch (error) {
            console.error(`   ❌ Failed to compile ${templateName}:`, error.message);
            // Continue with other templates
        }
    }
    
    if (Object.keys(compiledTemplates).length === 0) {
        console.warn('   ⚠️  No templates were successfully compiled');
        return null;
    }
    
    // Generate the output module
    // We need to handle both static HTML and functions
    const staticTemplates = {};
    const functionTemplates = {};
    
    Object.entries(compiledTemplates).forEach(([name, value]) => {
        if (typeof value === 'string' && value.startsWith('__FUNCTION__')) {
            const funcStr = value.replace(/^__FUNCTION__|__FUNCTION__$/g, '');
            functionTemplates[name] = funcStr;
        } else {
            staticTemplates[name] = value;
        }
    });
    
    const outputCode = `// 🦴 b0nes Pre-compiled SPA Templates
// ⚠️  DO NOT EDIT - This file is auto-generated at build time
// Generated: ${new Date().toISOString()}

// Static templates (pre-compiled HTML)
const staticTemplates = ${JSON.stringify(staticTemplates, null, 2)};

// Dynamic templates (functions that return HTML)
const dynamicTemplates = {
${Object.entries(functionTemplates).map(([name, funcStr]) => 
  `  ${name}: ${funcStr}`
).join(',\n')}
};

// Export all templates (static + dynamic)
export const templates = {
  ...staticTemplates,
  ...dynamicTemplates
};

// Individual exports for convenience
${Object.keys(compiledTemplates).map(name => 
  `export const ${name} = templates.${name};`
).join('\n')}

export default templates;
`;
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write the file
    fs.writeFileSync(outputPath, outputCode, 'utf8');
    console.log(`   📦 Generated compiled templates: ${path.relative(process.cwd(), outputPath)}\n`);
    
    return compiledTemplates;
};