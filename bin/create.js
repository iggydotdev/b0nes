#!/usr/bin/env node

/**
 * b0nes CLI - Project scaffolding tool
 * Creates new b0nes projects with zero dependencies
 * 
 * Usage:
 *   npx b0nes my-app
 *   npx b0nes my-blog --template blog
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import readline from 'node:readline';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the source directory (where b0nes package is installed)
const getSourceDir = () => {
  // When running via npx, we're in node_modules/b0nes/bin/
  // Source code is in node_modules/b0nes/src/
  return path.resolve(__dirname, '..');
};

// Template registry
const TEMPLATES = {
  basic: {
    name: 'Basic Site',
    description: 'Simple landing page with header, hero, and footer',
    pages: 'basic'
  },
  blog: {
    name: 'Blog',
    description: 'Blog with posts, categories, and dynamic routes',
    pages: 'blog'
  },
  docs: {
    name: 'Documentation',
    description: 'Documentation site with navigation',
    pages: 'documentation'
  }
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

/**
 * Parse CLI arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const projectName = args[0];
  const templateFlag = args.indexOf('--template') !== -1 ? args[args.indexOf('--template') + 1] : null;
  const skipGit = args.includes('--skip-git');

  return { projectName, templateFlag, skipGit };
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
${colors.bright}${colors.cyan}b0nes${colors.reset} - Zero-dependency web framework

${colors.bright}Usage:${colors.reset}
  npx b0nes <project-name> [options]

${colors.bright}Options:${colors.reset}
  --template <name>    Use a specific template (basic, blog, docs)
  --skip-git          Skip git initialization
  -h, --help          Show this help message

${colors.bright}Examples:${colors.reset}
  npx b0nes my-site
  npx b0nes my-blog --template blog
  npx b0nes my-docs --template docs --skip-git

${colors.bright}Available Templates:${colors.reset}
${Object.entries(TEMPLATES).map(([key, t]) => 
  `  ${colors.cyan}${key.padEnd(12)}${colors.reset} ${t.description}`
).join('\n')}
  `);
}

/**
 * Prompt user for input
 */
async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Select template interactively
 */
async function selectTemplate() {
  log.title('Select a template:');
  
  const templateKeys = Object.keys(TEMPLATES);
  templateKeys.forEach((key, index) => {
    const template = TEMPLATES[key];
    console.log(`  ${colors.cyan}${index + 1}${colors.reset}. ${colors.bright}${template.name}${colors.reset}`);
    console.log(`     ${template.description}\n`);
  });

  const answer = await prompt('Enter template number (default: 1): ');
  const index = parseInt(answer || '1') - 1;

  if (index < 0 || index >= templateKeys.length) {
    log.error('Invalid template selection');
    process.exit(1);
  }

  return templateKeys[index];
}

/**
 * Create project directory
 */
function createProjectDir(projectName) {
  const projectPath = path.join(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    log.error(`Directory "${projectName}" already exists`);
    process.exit(1);
  }

  fs.mkdirSync(projectPath, { recursive: true });
  return projectPath;
}



/**
 * Generate package.json
 */
function generatePackageJson(projectName) {
  return {
    name: projectName,
    version: '0.1.0',
    private: true,
    type: 'module',
    description: `A b0nes project`,
    scripts: {
      dev: 'node src/framework/server.js',
      'dev:watch': 'node --watch src/framework/server.js',
      build: 'node src/framework/utils/build/index.js public',
      preview: 'npx serve public',
      test: 'node src/components/utils/tester.js',
      generate: 'node src/components/utils/generator/index.js',
      "install-component": "node src/scripts/install-component.js",
      "create": "node create/index.js",
    },
    keywords: ['b0nes', 'website'],
    author: '',
    license: 'MIT',
    engines: {
      node: '>=20.0.0'
    }
  };
}



/**
 * Generate routes.js based on template
 */
// function generateRoutes(projectPath, templateName) {
//   const routesContent = {
//     basic: basicRoutes,
//     blog: blogRoutes,
//     docs: docsRoutes
//   };

//   fs.writeFileSync(
//     path.join(projectPath, 'src/framework/routes.js'),
//     routesContent[templateName] || routesContent.basic
//   );
// }

// /**
//  * Generate page files
//  */
// function generatePage(projectPath, pageName, templateName) {
//   const pages = {
//     home: homeExample,
//     blog: blogExample,
//     post: postExample,
//     docs: docsExample
//   };

//   const pagesDir = path.join(projectPath, 'src/framework/pages');
//   if (!fs.existsSync(pagesDir)) {
//     fs.mkdirSync(pagesDir, { recursive: true });
//   }

//   fs.writeFileSync(
//     path.join(pagesDir, `${pageName}.js`),
//     pages[pageName] || pages.home
//   );
// }

/**
 * Initialize git
 */
function initGit(projectPath) {
  log.info('Initializing git repository...');
  
  try {
    execSync('git init', { cwd: projectPath, stdio: 'ignore' });
    execSync('git add .', { cwd: projectPath, stdio: 'ignore' });
    execSync('git commit -m "Initial commit from b0nes"', {
      cwd: projectPath,
      stdio: 'ignore'
    });
    log.success('Git repository initialized');
  } catch (error) {
    log.warn('Failed to initialize git');
  }
}

/**
 * Show success message
 */
function showSuccess(projectName, templateName) {
  const template = TEMPLATES[templateName];
  
  console.log(`
${colors.bright}${colors.green}✓ Success!${colors.reset} Created ${colors.cyan}${projectName}${colors.reset} using ${colors.cyan}${template.name}${colors.reset} template

${colors.bright}Next steps:${colors.reset}

  ${colors.cyan}cd ${projectName}${colors.reset}
  ${colors.cyan}npm run dev${colors.reset}

${colors.bright}Available commands:${colors.reset}

  ${colors.cyan}npm run dev${colors.reset}       Start development server with hot reload
  ${colors.cyan}npm run build${colors.reset}     Build static site for production
  ${colors.cyan}npm run preview${colors.reset}   Preview production build
  ${colors.cyan}npm run test${colors.reset}      Run component tests
  ${colors.cyan}npm run generate${colors.reset}  Generate new component

${colors.bright}Learn more:${colors.reset}
  ${colors.blue}https://github.com/iggydotdev/b0nes${colors.reset}

Happy building! 🦴
  `);
}

/**
 * Main function
 */
async function main() {
  log.title('🦴 b0nes');

  const { projectName, templateFlag, skipGit } = parseArgs();

  // Validate project name
  if (!/^[a-z0-9-]+$/.test(projectName)) {
    log.error('Project name can only contain lowercase letters, numbers, and hyphens');
    process.exit(1);
  }

  // Select template
  let templateName = templateFlag;
  if (!templateName || !TEMPLATES[templateName]) {
    templateName = await selectTemplate();
  }

  log.info(`Creating project: ${colors.cyan}${projectName}${colors.reset}`);
  log.info(`Using template: ${colors.cyan}${TEMPLATES[templateName].name}${colors.reset}`);

  // Create project
  const projectPath = createProjectDir(projectName);
  
  const sourceDir = getSourceDir();
  const targetDir = projectPath;
  const source = path.join(sourceDir, 'src');
   log.info(`Copy project from: ${colors.cyan}${source}${colors.reset}`);
  const target = path.join(targetDir, 'src');
  log.info(`Copy project to: ${colors.cyan}${target}${colors.reset}`);
  await fs.promises.cp(source, target, { recursive: true });


  // 2. Override only userland pages (and routes if needed)
  if (TEMPLATES[templateFlag]) {
    const templatePath = path.join(sourceDir, 'src/pages/examples', TEMPLATES[templateFlag].pages);
    if (fs.existsSync(templatePath)) {
      await fs.promises.cp(templatePath, path.join(targetDir, 'src/pages'), { 
        recursive: true,
        force: true  // overwrite
      });
      console.log(`Applied template: ${templateFlag}`);
    }
  }

  // Copy root files
  const rootFiles = ['README.md', 'llms.txt', 'LICENSE', '.gitignore'];
  for (const file of rootFiles) {
    if (fs.existsSync(path.join(sourceDir, file))) {
      await fs.promises.copyFile(path.join(sourceDir, file), path.join(targetDir, file));
    }
  }

  // Generate files
  const packageJson = generatePackageJson(projectName);
  fs.writeFileSync(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

 

  // copyFrameworkFiles(projectPath);
  // generateTemplateFiles(projectPath, templateName);

  // Initialize git
  if (!skipGit) {
    initGit(projectPath);
  }

  // Success!
  showSuccess(projectName, templateName);
}

// Run
main().catch(error => {
  log.error(`Failed to create project: ${error.message}`);
  process.exit(1);
});