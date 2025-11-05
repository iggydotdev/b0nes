#!/usr/bin/env node

/**
 * b0nes
 * CLI tool to bootstrap new b0nes projects
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

// Template registry
const TEMPLATES = {
  basic: {
    name: 'Basic Site',
    description: 'Simple landing page with header, hero, and footer',
    files: ['home']
  },
  blog: {
    name: 'Blog',
    description: 'Blog with posts, categories, and RSS',
    files: ['home', 'blog', 'post']
  },
  docs: {
    name: 'Documentation',
    description: 'Documentation site with sidebar navigation',
    files: ['home', 'docs']
  },
  portfolio: {
    name: 'Portfolio',
    description: 'Portfolio site with projects and about page',
    files: ['home', 'portfolio', 'about']
  },
  saas: {
    name: 'SaaS Landing',
    description: 'SaaS landing page with pricing and features',
    files: ['home', 'pricing', 'features']
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
  const skipInstall = args.includes('--skip-install');
  const skipGit = args.includes('--skip-git');

  return { projectName, templateFlag, skipInstall, skipGit };
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
${colors.bright}${colors.cyan}b0nes${colors.reset}

Bootstrap a new b0nes project in seconds.

${colors.bright}Usage:${colors.reset}
  npx b0nes <project-name> [options]

${colors.bright}Options:${colors.reset}
  --template <name>    Use a specific template (basic, blog, docs, portfolio, saas)
  --skip-install       Skip npm install
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
  const projectPath = path.join(process.cwd(),'apps', projectName);

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
    type: 'module',
    description: `A b0nes project`,
    scripts: {
      dev: 'node --watch src/framework/index.js',
      build: 'node src/framework/utils/build/index.js public',
      preview: 'npx serve public',
      test: 'node src/components/utils/tester.js',
      generate: 'node src/components/utils/generator/index.js'
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
 * Copy b0nes framework files
 */
function copyFrameworkFiles(projectPath) {
  log.info('Copying b0nes framework...');

  // In real implementation, these would come from the published package
  // For now, we'll generate the structure
  const dirs = [
    'src/components/atoms',
    'src/components/molecules',
    'src/components/organisms',
    'src/components/utils',
    'src/framework/client',
    'src/framework/pages',
    'src/framework/utils/build'
  ];

  dirs.forEach(dir => {
    fs.mkdirSync(path.join(projectPath, dir), { recursive: true });
  });

  // Copy core files (in reality, from node_modules/b0nes)
  // For this example, we'll create minimal versions
  createMinimalFramework(projectPath);

  log.success('Framework files copied');
}

/**
 * Create minimal framework structure
 */
function createMinimalFramework(projectPath) {
  // This would normally copy from the b0nes package
  // For now, create placeholder files that import from b0nes

  // src/components/index.js
  fs.writeFileSync(
    path.join(projectPath, 'src/components/index.js'),
    `// Re-export from b0nes package
export * from 'b0nes/components';
`
  );

  // src/framework/compose.js
  fs.writeFileSync(
    path.join(projectPath, 'src/framework/compose.js'),
    `export { compose } from 'b0nes/compose';
`
  );

  // src/framework/router.js
  fs.writeFileSync(
    path.join(projectPath, 'src/framework/router.js'),
    `export { router } from 'b0nes/router';
`
  );

  // src/framework/renderPage.js
  fs.writeFileSync(
    path.join(projectPath, 'src/framework/renderPage.js'),
    `export { renderPage, document } from 'b0nes/framework';
`
  );
}

/**
 * Generate template files
 */
function generateTemplate(projectPath, templateName) {
  log.info(`Generating ${templateName} template...`);

  const template = TEMPLATES[templateName];

  // Generate routes.js
  generateRoutes(projectPath, templateName);

  // Generate pages
  template.files.forEach(pageName => {
    generatePage(projectPath, pageName, templateName);
  });

  // Generate index.js (dev server)
  generateDevServer(projectPath);

  log.success('Template files generated');
}

/**
 * Generate routes.js
 */
function generateRoutes(projectPath, templateName) {
  const routes = {
    basic: `import { URLPattern } from 'b0nes/urlpattern';
import { components as homeComponents } from './pages/home.js';

export const routes = [
  {
    name: 'Home',
    pattern: new URLPattern({ pathname: '/' }),
    meta: { title: 'Home' },
    components: homeComponents
  }
];`,
    
    blog: `import { URLPattern } from 'b0nes/urlpattern';
import { components as homeComponents } from './pages/home.js';
import { components as blogComponents } from './pages/blog.js';
import { components as postComponents } from './pages/post.js';

export const routes = [
  {
    name: 'Home',
    pattern: new URLPattern({ pathname: '/' }),
    meta: { title: 'Home' },
    components: homeComponents
  },
  {
    name: 'Blog',
    pattern: new URLPattern({ pathname: '/blog' }),
    meta: { title: 'Blog' },
    components: blogComponents
  },
  {
    name: 'Blog Post',
    pattern: new URLPattern({ pathname: '/blog/:slug' }),
    meta: { title: 'Blog Post' },
    components: postComponents
  }
];`,

    docs: `import { URLPattern } from 'b0nes/urlpattern';
import { components as homeComponents } from './pages/home.js';
import { components as docsComponents } from './pages/docs.js';

export const routes = [
  {
    name: 'Home',
    pattern: new URLPattern({ pathname: '/' }),
    meta: { title: 'Documentation' },
    components: homeComponents
  },
  {
    name: 'Docs',
    pattern: new URLPattern({ pathname: '/docs/:page' }),
    meta: { title: 'Docs' },
    components: docsComponents
  }
];`,

    portfolio: `import { URLPattern } from 'b0nes/urlpattern';
import { components as homeComponents } from './pages/home.js';
import { components as portfolioComponents } from './pages/portfolio.js';
import { components as aboutComponents } from './pages/about.js';

export const routes = [
  {
    name: 'Home',
    pattern: new URLPattern({ pathname: '/' }),
    meta: { title: 'Portfolio' },
    components: homeComponents
  },
  {
    name: 'Portfolio',
    pattern: new URLPattern({ pathname: '/portfolio' }),
    meta: { title: 'My Work' },
    components: portfolioComponents
  },
  {
    name: 'About',
    pattern: new URLPattern({ pathname: '/about' }),
    meta: { title: 'About Me' },
    components: aboutComponents
  }
];`,

    saas: `import { URLPattern } from 'b0nes/urlpattern';
import { components as homeComponents } from './pages/home.js';
import { components as pricingComponents } from './pages/pricing.js';
import { components as featuresComponents } from './pages/features.js';

export const routes = [
  {
    name: 'Home',
    pattern: new URLPattern({ pathname: '/' }),
    meta: { title: 'Home' },
    components: homeComponents
  },
  {
    name: 'Pricing',
    pattern: new URLPattern({ pathname: '/pricing' }),
    meta: { title: 'Pricing' },
    components: pricingComponents
  },
  {
    name: 'Features',
    pattern: new URLPattern({ pathname: '/features' }),
    meta: { title: 'Features' },
    components: featuresComponents
  }
];`
  };

  fs.writeFileSync(
    path.join(projectPath, 'src/framework/routes.js'),
    routes[templateName] || routes.basic
  );
}

/**
 * Generate page files
 */
function generatePage(projectPath, pageName, templateName) {
  const pages = {
    home: `// Home page components
export const components = [
  {
    type: 'organism',
    name: 'header',
    props: {
      slot: [
        { type: 'atom', name: 'link', props: { url: '/', slot: 'Home' } },
        { type: 'atom', name: 'link', props: { url: '/about', slot: 'About' } }
      ]
    }
  },
  {
    type: 'organism',
    name: 'hero',
    props: {
      slot: [
        {
          type: 'atom',
          name: 'text',
          props: {
            is: 'h1',
            slot: 'Welcome to Your b0nes Site'
          }
        },
        {
          type: 'atom',
          name: 'text',
          props: {
            is: 'p',
            slot: 'Built with zero dependencies. Pure JavaScript.'
          }
        }
      ]
    }
  },
  {
    type: 'organism',
    name: 'footer',
    props: {
      slot: [
        {
          type: 'atom',
          name: 'text',
          props: {
            is: 'p',
            slot: '© 2025 Your Site. Built with b0nes.'
          }
        }
      ]
    }
  }
];`,

    blog: `// Blog listing page
export const components = [
  {
    type: 'organism',
    name: 'header',
    props: {
      slot: [
        { type: 'atom', name: 'link', props: { url: '/', slot: 'Home' } },
        { type: 'atom', name: 'link', props: { url: '/blog', slot: 'Blog' } }
      ]
    }
  },
  {
    type: 'atom',
    name: 'box',
    props: {
      is: 'main',
      slot: [
        {
          type: 'atom',
          name: 'text',
          props: { is: 'h1', slot: 'Blog' }
        },
        {
          type: 'molecule',
          name: 'card',
          props: {
            headerSlot: 'First Post',
            contentSlot: 'This is your first blog post!',
            linkSlot: { type: 'atom', name: 'link', props: { url: '/blog/first-post', slot: 'Read More' } }
          }
        }
      ]
    }
  }
];`,

    post: `// Blog post page
export const components = (data) => [
  {
    type: 'organism',
    name: 'header',
    props: {
      slot: [
        { type: 'atom', name: 'link', props: { url: '/', slot: 'Home' } },
        { type: 'atom', name: 'link', props: { url: '/blog', slot: 'Blog' } }
      ]
    }
  },
  {
    type: 'atom',
    name: 'box',
    props: {
      is: 'article',
      slot: [
        {
          type: 'atom',
          name: 'text',
          props: { is: 'h1', slot: data?.slug || 'Blog Post' }
        },
        {
          type: 'atom',
          name: 'text',
          props: { is: 'p', slot: 'Your blog post content goes here.' }
        }
      ]
    }
  }
];`
  };

  const pagesDir = path.join(projectPath, 'src/framework/pages');
  fs.writeFileSync(
    path.join(pagesDir, `${pageName}.js`),
    pages[pageName] || pages.home
  );
}

/**
 * Generate dev server
 */
function generateDevServer(projectPath) {
  const serverCode = `import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { router } from './router.js';
import { routes } from './routes.js';
import { compose } from './compose.js';
import { renderPage } from './renderPage.js';

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, \`http://\${req.headers.host}\`);
  
  // Serve b0nes.js runtime
  if (url.pathname === '/b0nes.js') {
    try {
      const filePath = fileURLToPath(new URL('./client/b0nes.js', import.meta.url));
      const content = await readFile(filePath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(content);
      return;
    } catch (error) {
      res.writeHead(500);
      res.end('Error loading b0nes.js');
      return;
    }
  }

  // Route matching
  const route = router(url, routes);
  
  if (route) {
    const content = compose(route.components);
    const html = renderPage(content, route.meta);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end(renderPage(
    '<h1>404 - Page Not Found</h1>',
    { title: '404' }
  ));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(\`🦴 b0nes server running at http://localhost:\${PORT}\`);
});
`;

  fs.writeFileSync(
    path.join(projectPath, 'src/framework/index.js'),
    serverCode
  );
}

/**
 * Generate README
 */
function generateReadme(projectPath, projectName, templateName) {
  const readme = `# ${projectName}

A b0nes project created with \`b0nes\`.

## Getting Started

\`\`\`bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
\`\`\`

## Project Structure

\`\`\`
${projectName}/
├── src/
│   ├── components/      # Re-exports from b0nes package
│   └── framework/
│       ├── pages/       # Your page components
│       ├── routes.js    # Route definitions
│       └── index.js     # Dev server
├── public/              # Production build output
└── package.json
\`\`\`

## Adding Pages

Create a new page in \`src/framework/pages/\`:

\`\`\`javascript
// src/framework/pages/about.js
export const components = [
  {
    type: 'organism',
    name: 'header',
    props: { /* ... */ }
  },
  // More components...
];
\`\`\`

Add route in \`src/framework/routes.js\`:

\`\`\`javascript
{
  name: 'About',
  pattern: new URLPattern({ pathname: '/about' }),
  meta: { title: 'About' },
  components: aboutComponents
}
\`\`\`

## Documentation

- [b0nes Framework](https://github.com/iggydotdev/b0nes)
- [Component Library](https://github.com/iggydotdev/b0nes#components)
- [Routing Guide](https://github.com/iggydotdev/b0nes#routing)

## Template: ${TEMPLATES[templateName].name}

${TEMPLATES[templateName].description}

Built with ❤️ using b0nes (zero dependencies!)
`;

  fs.writeFileSync(path.join(projectPath, 'README.md'), readme);
}

/**
 * Generate .gitignore
 */
function generateGitignore(projectPath) {
  const gitignore = `# Dependencies
node_modules/

# Build output
public/

# Environment
.env
.env.local

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
`;

  fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignore);
}

/**
 * Install dependencies
 */
function installDependencies(projectPath) {
  log.info('Installing dependencies...');
  
  try {
    execSync('npm install b0nes', {
      cwd: projectPath,
      stdio: 'inherit'
    });
    log.success('Dependencies installed');
  } catch (error) {
    log.error('Failed to install dependencies');
    log.warn('Run `npm install` manually');
  }
}

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

  ${colors.cyan}npm run dev${colors.reset}       Start development server
  ${colors.cyan}npm run build${colors.reset}     Build for production
  ${colors.cyan}npm run preview${colors.reset}   Preview production build
  ${colors.cyan}npm run test${colors.reset}      Run tests
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

  const { projectName, templateFlag, skipInstall, skipGit } = parseArgs();

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

  // Generate files
  const packageJson = generatePackageJson(projectName);
  fs.writeFileSync(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  copyFrameworkFiles(projectPath);
  generateTemplate(projectPath, templateName);
  generateReadme(projectPath, projectName, templateName);
  generateGitignore(projectPath);

  // Install dependencies
  if (!skipInstall) {
    installDependencies(projectPath);
  }

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