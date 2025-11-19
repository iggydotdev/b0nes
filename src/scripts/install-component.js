/**
 * b0nes Component Installer
 * Install community components from URLs or package registries
 * 
 * Usage:
 *   npm run install-component https://example.com/components/my-card
 *   npm run install-component @username/card-gallery
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Component manifest structure
 * @typedef {Object} ComponentManifest
 * @property {string} name - Component name
 * @property {string} version - Semantic version
 * @property {string} type - Component type (atom/molecule/organism)
 * @property {string} description - Brief description
 * @property {string} author - Author name/email
 * @property {string} license - License type
 * @property {Object} files - File URLs
 * @property {string} files.component - Main component file URL
 * @property {string} files.test - Test file URL
 * @property {string} [files.client] - Client-side behavior URL (optional)
 * @property {string[]} [dependencies] - Other b0nes components needed
 * @property {string[]} [tags] - Search tags
 */

/**
 * Fetches content from a URL
 */
const fetchContent = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: ${error.message}`);
  }
};

/**
 * Parses component manifest from index.js or manifest.json
 */
const parseManifest = async (url) => {
  let manifestUrl = url;
  
  // If URL points to a directory, try to find manifest
  if (!url.endsWith('.json') && !url.endsWith('.js')) {
    // Try manifest.json first
    try {
      const manifestContent = await fetchContent(`${url}/b0nes.manifest.json`);
      return JSON.parse(manifestContent);
    } catch {
      // Try index.js with embedded manifest
      manifestUrl = `${url}/index.js`;
    }
  }
  
  // Extract manifest from JavaScript file
  if (manifestUrl.endsWith('.js')) {
    const content = await fetchContent(manifestUrl);
    
    // Look for manifest comment block
    const manifestMatch = content.match(/\/\*\*\s*@b0nes-manifest\s*([\s\S]*?)\*\//);
    if (manifestMatch) {
      const manifestText = manifestMatch[1]
        .split('\n')
        .map(line => line.replace(/^\s*\*\s?/, ''))
        .join('\n')
        .trim();
      return JSON.parse(manifestText);
    }
    
    throw new Error('No b0nes manifest found in component file');
  }
  
  // Parse JSON manifest
  const content = await fetchContent(manifestUrl);
  return JSON.parse(content);
};

/**
 * Validates component manifest
 */
const validateManifest = (manifest) => {
  const required = ['name', 'version', 'type', 'files'];
  const missing = required.filter(field => !manifest[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  const validTypes = ['atom', 'molecule', 'organism'];
  if (!validTypes.includes(manifest.type)) {
    throw new Error(`Invalid type: ${manifest.type}. Must be one of: ${validTypes.join(', ')}`);
  }
  
  if (!manifest.files.component) {
    throw new Error('Manifest must include files.component URL');
  }
  
  return true;
};

/**
 * Resolves relative URLs to absolute
 */
const resolveUrl = (baseUrl, relativeUrl) => {
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  
  const base = new URL(baseUrl);
  return new URL(relativeUrl, base.origin + base.pathname + '/').href;
};

/**
 * Installs a component from a URL
 */
export const installComponent = async (url, options = {}) => {
  const {
    force = false,           // Overwrite if exists
    dryRun = false,         // Preview without installing
  } = options;
  
  console.log(`\n📦 Installing component from: ${url}\n`);
  
  try {
    // Step 1: Parse manifest
    console.log('→ Parsing manifest...');
    const manifest = await parseManifest(url);
    validateManifest(manifest);
    
    console.log(`✓ Found: ${manifest.name} v${manifest.version} (${manifest.type})`);
    if (manifest.description) {
      console.log(`  ${manifest.description}`);
    }
    
    // Step 2: Check if component already exists
    const targetDir = path.join(
      __dirname,
      `../../components/${manifest.type}s`,
      manifest.name
    );
    
    if (fs.existsSync(targetDir) && !force) {
      throw new Error(
        `Component "${manifest.name}" already exists at ${targetDir}\n` +
        `Use --force to overwrite`
      );
    }
    
    // Step 3: Check dependencies
    if (manifest.dependencies && manifest.dependencies.length > 0) {
      console.log(`\n→ Checking dependencies:`);
      for (const dep of manifest.dependencies) {
        const depExists = checkDependency(dep);
        console.log(`  ${depExists ? '✓' : '✗'} ${dep}`);
        if (!depExists && !dryRun) {
          console.log(`    ⚠️  Dependency not found. Install it first.`);
        }
      }
    }
    
    if (dryRun) {
      console.log(`\n✓ Dry run complete. Component is valid and ready to install.`);
      return { success: true, manifest, dryRun: true };
    }
    
    // Step 4: Install component
    if (reference) {
      // Create reference file instead of copying
      console.log(`\n→ Creating URL reference...`);
      await installReference(targetDir, url, manifest);
    } else {
      // Download and copy files
      console.log(`\n→ Downloading files...`);
      await installFiles(targetDir, url, manifest);
    }
    
    // Step 5: Update component index
    console.log(`→ Updating component registry...`);
    await updateComponentIndex(manifest);
    
    console.log(`\n✅ Successfully installed ${manifest.name}!`);
    console.log(`\nUsage:`);
    console.log(`  {`);
    console.log(`    type: '${manifest.type}',`);
    console.log(`    name: '${manifest.name}',`);
    console.log(`    props: { /* ... */ }`);
    console.log(`  }`);
    
    return { success: true, manifest, path: targetDir };
    
  } catch (error) {
    console.error(`\n❌ Installation failed: ${error.message}\n`);
    return { success: false, error: error.message };
  }
};

/**
 * Downloads and saves component files
 */
const installFiles = async (targetDir, baseUrl, manifest) => {
  // Create directory
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Download main component file
  const componentUrl = resolveUrl(baseUrl, manifest.files.component);
  const componentContent = await fetchContent(componentUrl);
  const componentFileName = manifest.name + '.js';
  fs.writeFileSync(
    path.join(targetDir, componentFileName),
    componentContent,
    'utf8'
  );
  console.log(`  ✓ ${componentFileName}`);
  
  // Download test file
  if (manifest.files.test) {
    const testUrl = resolveUrl(baseUrl, manifest.files.test);
    const testContent = await fetchContent(testUrl);
    const testFileName = manifest.name + '.test.js';
    fs.writeFileSync(
      path.join(targetDir, testFileName),
      testContent,
      'utf8'
    );
    console.log(`  ✓ ${testFileName}`);
  }
  
  // Download client file if exists
  if (manifest.files.client) {
    const clientUrl = resolveUrl(baseUrl, manifest.files.client);
    const clientContent = await fetchContent(clientUrl);
    const clientFileName = `${manifest.type}.${manifest.name}.client.js`;
    fs.writeFileSync(
      path.join(targetDir, clientFileName),
      clientContent,
      'utf8'
    );
    console.log(`  ✓ ${clientFileName}`);
  }
  
  // Create index.js
  const indexContent = generateIndexFile(manifest);
  fs.writeFileSync(
    path.join(targetDir, 'index.js'),
    indexContent,
    'utf8'
  );
  console.log(`  ✓ index.js`);
  
  // Save manifest
  fs.writeFileSync(
    path.join(targetDir, 'b0nes.manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );
  console.log(`  ✓ b0nes.manifest.json`);
};

/**
 * Generates index.js file
 */
const generateIndexFile = (manifest) => {
  const hasClient = !!manifest.files.client;
  
  return `import { ${manifest.name} as ${manifest.name}Render } from './${manifest.name}.js';
${hasClient ? `import { client } from './${manifest.type}.${manifest.name}.client.js';\n` : ''}
export const ${manifest.name} = {
  render: ${manifest.name}Render${hasClient ? ',\n  client' : ''}
};

export default ${manifest.name}.render;
`;
};

/**
 * Checks if a dependency exists
 */
const checkDependency = (depName) => {
  const types = ['atoms', 'molecules', 'organisms'];
  
  for (const type of types) {
    const depPath = path.join(
      __dirname,
      `../../components/${type}/${depName}`
    );
    if (fs.existsSync(depPath)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Updates component index to register new component
 */
const updateComponentIndex = async (manifest) => {
  const indexPath = path.join(
    __dirname,
    `../../components/${manifest.type}s/index.js`
  );
  
  if (!fs.existsSync(indexPath)) {
    console.warn(`⚠️  Index file not found: ${indexPath}`);
    return;
  }
  
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Check if already imported
  if (content.includes(`from './${manifest.name}/index.js'`)) {
    console.log(`  Component already in index`);
    return;
  }
  
  // Add import
  const importLine = `import ${manifest.name} from './${manifest.name}/index.js';`;
  const importSection = content.match(/^import.*$/gm);
  
  if (importSection) {
    const lastImport = importSection[importSection.length - 1];
    content = content.replace(lastImport, `${lastImport}\n${importLine}`);
  } else {
    content = `${importLine}\n\n${content}`;
  }
  
  // Add to exports object
  const exportsMatch = content.match(/export const \w+ = \{([\s\S]*?)\};/);
  if (exportsMatch) {
    const exportsList = exportsMatch[1].trim();
    const updatedExports = exportsList 
      ? `${exportsList},\n    ${manifest.name}`
      : `    ${manifest.name}`;
    
    content = content.replace(
      /export const \w+ = \{[\s\S]*?\};/,
      `export const ${manifest.type}s = {\n${updatedExports}\n};`
    );
  }
  
  // Add to named exports
  const namedExportsMatch = content.match(/export \{([\s\S]*?)\};/);
  if (namedExportsMatch) {
    const exportsList = namedExportsMatch[1].trim();
    const updatedExports = exportsList
      ? `${exportsList},\n    ${manifest.name}`
      : `    ${manifest.name}`;
    
    content = content.replace(
      /export \{[\s\S]*?\};/,
      `export {\n${updatedExports}\n};`
    );
  }
  
  fs.writeFileSync(indexPath, content, 'utf8');
  console.log(`  ✓ Updated ${manifest.type}s/index.js`);
};

/**
 * CLI entry point
 */
const main = async () => {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
b0nes Component Installer

Usage:
  npm run install-component <url> [options]

Options:
  --force         Overwrite existing component
  --dry-run       Preview without installing
  --reference     Use URL reference instead of copying files

Examples:
  # Install from URL
  npm run install-component https://example.com/components/my-card

  # Preview installation
  npm run install-component https://example.com/card --dry-run

Component Manifest Format:
  Create a b0nes.manifest.json file:
  {
    "name": "my-card",
    "version": "1.0.0",
    "type": "molecule",
    "description": "A custom card component",
    "author": "Your Name <you@example.com>",
    "license": "MIT",
    "files": {
      "component": "./my-card.js",
      "test": "./my-card.test.js",
      "client": "./molecule.my-card.client.js"
    },
    "dependencies": [],
    "tags": ["card", "layout"]
  }
    `);
    process.exit(0);
  }
  
  const url = args[0];
  const options = {
    force: args.includes('--force'),
    dryRun: args.includes('--dry-run'),
  };
  
  const result = await installComponent(url, options);
  process.exit(result.success ? 0 : 1);
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default { installComponent };