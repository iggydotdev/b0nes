// src/framework/utils/build/compileTemplates.js
import fs from 'node:fs';
import path from 'node:path';
import { compose } from '../../compose.js';

/**
 * Compiles component configs to HTML strings at build time
 * @param {Array} components - Component configs
 * @returns {string} Compiled HTML
 */
export const compileTemplate = (components) => {
    return compose(components);
};

/**
 * Processes a template file and returns compiled HTML
 * @param {string} templatePath - Path to template file
 * @returns {Promise<string>} Compiled HTML string
 */
export const compileTemplateFile = async (templatePath) => {
    try {
        // Dynamic import of the template
        const module = await import(templatePath);
        
        // If it exports components, compile them
        if (module.components) {
            return compileTemplate(module.components);
        }
        
        // If it already exports a template string, use it
        if (module.template) {
            return module.template;
        }
        
        throw new Error('Template must export either "components" or "template"');
    } catch (error) {
        console.error(`Failed to compile template: ${templatePath}`, error);
        throw error;
    }
};

/**
 * Generates a compiled templates module for a SPA component
 * @param {string} spaComponentPath - Path to SPA component directory
 * @param {string} outputPath - Where to write the compiled templates
 */
export const generateCompiledTemplates = async (spaComponentPath, outputPath) => {
    const templatesDir = path.join(spaComponentPath, 'templates');
    
    if (!fs.existsSync(templatesDir)) {
        console.warn(`No templates directory found at: ${templatesDir}`);
        return null;
    }
    
    const templateFiles = fs.readdirSync(templatesDir)
        .filter(f => f.endsWith('.js'));
    
    const compiledTemplates = {};
    
    for (const file of templateFiles) {
        const templatePath = path.join(templatesDir, file);
        const templateName = path.basename(file, '.js');
        
        try {
            const compiled = await compileTemplateFile(templatePath);
            compiledTemplates[templateName] = compiled;
            console.log(`  ✓ Compiled template: ${templateName}`);
        } catch (error) {
            console.error(`  ✗ Failed to compile ${templateName}:`, error.message);
        }
    }
    
    // Generate the output module
    const outputCode = `
// Auto-generated compiled templates
// DO NOT EDIT - This file is generated at build time

export const templates = ${JSON.stringify(compiledTemplates, null, 2)};

// Individual exports for convenience
${Object.keys(compiledTemplates).map(name => 
    `export const ${name} = templates.${name};`
).join('\n')}
`;
    
    fs.writeFileSync(outputPath, outputCode, 'utf8');
    console.log(`  ✓ Generated compiled templates at: ${outputPath}`);
    
    return compiledTemplates;
};