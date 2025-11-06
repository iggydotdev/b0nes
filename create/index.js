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
  // When running via npx, we're in node_modules/b0nes/create/
  // Source code is in node_modules/b0nes/src/
  return path.resolve(__dirname, '../src');
};

// Template registry
const TEMPLATES = {
  basic: {
    name: 'Basic Site',
    description: 'Simple landing page with header, hero, and footer',
    pages: ['home']
  },
  blog: {
    name: 'Blog',
    description: 'Blog with posts, categories, and dynamic routes',
    pages: ['home', 'blog', 'post']
  },
  docs: {
    name: 'Documentation',
    description: 'Documentation site with navigation',
    pages: ['home', 'docs']
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
 * Copy b0nes source files to project
 */
function copyFrameworkFiles(projectPath) {
  log.info('Copying b0nes framework...');

  const sourceDir = getSourceDir();
  const targetDir = path.join(projectPath, 'src');

  // Copy entire src directory
  copyRecursive(sourceDir, targetDir);

  log.success('Framework files copied');
}

/**
 * Recursively copy directory
 */
function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
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
      build: 'node src/framework/utils/build/index.js',
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
 * Generate template files for specific template
 */
function generateTemplateFiles(projectPath, templateName) {
  log.info(`Generating ${templateName} template files...`);

  const template = TEMPLATES[templateName];
  
  // Generate routes.js
  generateRoutes(projectPath, templateName);

  // Generate page files
  template.pages.forEach(pageName => {
    generatePage(projectPath, pageName, templateName);
  });

  log.success('Template files generated');
}

/**
 * Generate routes.js based on template
 */
function generateRoutes(projectPath, templateName) {
  const routesContent = {
    basic: `import { URLPattern } from './utils/urlPattern.js';
import { components as homeComponents } from './pages/home.js';

export const routes = [
  {
    name: 'Home',
    pattern: new URLPattern({ pathname: '/' }),
    url: '/',
    meta: { 
      title: 'Home',
      description: 'Welcome to my site'
    },
    components: homeComponents
  }
];`,
    
    blog: `import { URLPattern } from './utils/urlPattern.js';
import { components as homeComponents } from './pages/home.js';
import { components as blogComponents } from './pages/blog.js';
import { components as postComponents } from './pages/post.js';

export const routes = [
  {
    name: 'Home',
    pattern: new URLPattern({ pathname: '/' }),
    url: '/',
    meta: { 
      title: 'Home',
      description: 'Welcome to my blog'
    },
    components: homeComponents
  },
  {
    name: 'Blog',
    pattern: new URLPattern({ pathname: '/blog' }),
    url: '/blog',
    meta: { 
      title: 'Blog',
      description: 'Read our latest posts'
    },
    components: blogComponents
  },
  {
    name: 'Blog Post',
    pattern: new URLPattern({ pathname: '/blog/:slug' }),
    meta: { 
      title: 'Blog Post',
      description: 'Read this post'
    },
    components: postComponents,
    externalData: async (params) => {
      // Replace with your data source
      return {
        slug: params.slug,
        title: 'Sample Post',
        content: 'Post content here...'
      };
    }
  }
];`,

    docs: `import { URLPattern } from './utils/urlPattern.js';
import { components as homeComponents } from './pages/home.js';
import { components as docsComponents } from './pages/docs.js';

export const routes = [
  {
    name: 'Home',
    pattern: new URLPattern({ pathname: '/' }),
    url: '/',
    meta: { 
      title: 'Documentation',
      description: 'Project documentation'
    },
    components: homeComponents
  },
  {
    name: 'Docs',
    pattern: new URLPattern({ pathname: '/docs/:page' }),
    meta: { 
      title: 'Docs',
      description: 'Documentation page'
    },
    components: docsComponents,
    externalData: async (params) => {
      return {
        page: params.page,
        title: 'Documentation',
        content: 'Documentation content...'
      };
    }
  }
];`
  };

  fs.writeFileSync(
    path.join(projectPath, 'src/framework/routes.js'),
    routesContent[templateName] || routesContent.basic
  );
}

/**
 * Generate page files
 */
function generatePage(projectPath, pageName, templateName) {
  const pages = {
    home: `// Home page
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
      className: 'blog-listing',
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
            linkSlot: { 
              type: 'atom', 
              name: 'link', 
              props: { url: '/blog/first-post', slot: 'Read More' } 
            }
          }
        }
      ]
    }
  }
];`,

    post: `// Blog post page (dynamic)
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
      className: 'blog-post',
      slot: [
        {
          type: 'atom',
          name: 'text',
          props: { is: 'h1', slot: data?.title || 'Blog Post' }
        },
        {
          type: 'atom',
          name: 'text',
          props: { is: 'p', slot: data?.content || 'Post content goes here.' }
        }
      ]
    }
  }
];`,

    docs: `// Documentation page (dynamic)
export const components = (data) => [
  {
    type: 'organism',
    name: 'header',
    props: {
      slot: [
        { type: 'atom', name: 'link', props: { url: '/', slot: 'Home' } },
        { type: 'atom', name: 'link', props: { url: '/docs/getting-started', slot: 'Docs' } }
      ]
    }
  },
  {
    type: 'atom',
    name: 'box',
    props: {
      is: 'main',
      className: 'docs-content',
      slot: [
        {
          type: 'atom',
          name: 'text',
          props: { is: 'h1', slot: data?.title || 'Documentation' }
        },
        {
          type: 'atom',
          name: 'text',
          props: { is: 'div', slot: data?.content || 'Documentation content...' }
        }
      ]
    }
  }
];`
  };

  const pagesDir = path.join(projectPath, 'src/framework/pages');
  if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(pagesDir, `${pageName}.js`),
    pages[pageName] || pages.home
  );
}

/**
 * Generate README
 */
function generateReadme(projectPath, projectName, templateName) {
  const readme = `# ${projectName}

Created with [b0nes](https://github.com/iggydotdev/b0nes) - zero-dependency web framework.

## Getting Started

\`\`\`bash
# Start development server with hot reload
npm run dev

# Build static site
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Generate new component
npm run generate atom my-component
\`\`\`

## Project Structure

\`\`\`
${projectName}/
├── src/
│   ├── components/          # Component library (atoms, molecules, organisms)
│   │   ├── atoms/
│   │   ├── molecules/
│   │   └── organisms/
│   └── framework/
│       ├── client/          # Client-side runtime (store, FSM, b0nes.js)
│       ├── pages/           # Your page components
│       ├── utils/           # Framework utilities
│       ├── compose.js       # Component composition
│       ├── router.js        # URL routing
│       ├── routes.js        # Route definitions
│       ├── renderPage.js    # HTML generation
│       └── server.js        # Dev server
├── public/                  # Production build output (after npm run build)
└── package.json
\`\`\`

## Adding Pages

1. Create a page in \`src/framework/pages/\`:

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

2. Add route in \`src/framework/routes.js\`:

\`\`\`javascript
{
  name: 'About',
  pattern: new URLPattern({ pathname: '/about' }),
  meta: { title: 'About' },
  components: aboutComponents
}
\`\`\`

## Styling

Add CSS files and reference them in \`src/framework/renderPage.js\`:

\`\`\`javascript
export const renderPage = (content, meta = {}) => {
  // Add your stylesheet link
  const stylesheets = [
    '/styles/main.css',
    // Add more stylesheets here
  ];
  
  // ...
};
\`\`\`

## Template: ${TEMPLATES[templateName].name}

${TEMPLATES[templateName].description}

## Documentation

- [b0nes Framework](https://github.com/iggydotdev/b0nes)
- [Component Library](https://github.com/iggydotdev/b0nes#components)
- [Routing Guide](https://github.com/iggydotdev/b0nes#routing)
- [State Management](https://github.com/iggydotdev/b0nes#state-management)

Built with ❤️ using b0nes (zero dependencies!)
`;

  fs.writeFileSync(path.join(projectPath, 'README.md'), readme);
}

/**
 * Generate .gitignore
 */
function generateGitignore(projectPath) {
  const gitignore = `# Build output
public/

# Dependencies
node_modules/

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

  // Generate files
  const packageJson = generatePackageJson(projectName);
  fs.writeFileSync(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  copyFrameworkFiles(projectPath);
  generateTemplateFiles(projectPath, templateName);
  generateReadme(projectPath, projectName, templateName);
  generateGitignore(projectPath);

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