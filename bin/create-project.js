/**
 * b0nes project scaffolding
 * Used by: npx b0nes <name> | npx b0nes create <name>
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import readline from 'node:readline';
import {
  createInitialManifest,
  writeManifest,
  writeChecksums,
  buildChecksums
} from './lib/manifest.js';
import { FRAMEWORK_PATHS, COMPONENT_PATHS } from './lib/paths.js';

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

export function showCreateHelp() {
  console.log(`
${colors.bright}${colors.cyan}b0nes create${colors.reset}

${colors.bright}Usage:${colors.reset}
  npx b0nes <project-name> [options]
  npx b0nes create <project-name> [options]

${colors.bright}Options:${colors.reset}
  --template <name>    Use a specific template (basic, blog, docs)
  --skip-git           Skip git initialization
  -h, --help           Show this help message

${colors.bright}Examples:${colors.reset}
  npx b0nes my-site
  npx b0nes my-blog --template blog
  npx b0nes my-docs --template docs --skip-git

${colors.bright}Available Templates:${colors.reset}
${Object.entries(TEMPLATES)
  .map(([key, t]) => `  ${colors.cyan}${key.padEnd(12)}${colors.reset} ${t.description}`)
  .join('\n')}
  `);
}

function parseArgs(args) {
  if (args.length === 0) {
    showCreateHelp();
    process.exit(0);
  }

  const projectName = args[0];
  const templateFlag =
    args.indexOf('--template') !== -1 ? args[args.indexOf('--template') + 1] : null;
  const skipGit = args.includes('--skip-git');

  return { projectName, templateFlag, skipGit };
}

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

async function selectTemplate() {
  log.title('Select a template:');

  const templateKeys = Object.keys(TEMPLATES);
  templateKeys.forEach((key, index) => {
    const template = TEMPLATES[key];
    console.log(
      `  ${colors.cyan}${index + 1}${colors.reset}. ${colors.bright}${template.name}${colors.reset}`
    );
    console.log(`     ${template.description}\n`);
  });

  const answer = await prompt('Enter template number (default: 1): ');
  const index = parseInt(answer || '1', 10) - 1;

  if (index < 0 || index >= templateKeys.length) {
    log.error('Invalid template selection');
    process.exit(1);
  }

  return templateKeys[index];
}

function createProjectDir(projectName) {
  const projectPath = path.join(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    log.error(`Directory "${projectName}" already exists`);
    process.exit(1);
  }

  fs.mkdirSync(projectPath, { recursive: true });
  return projectPath;
}

function readPackageVersion(packageRoot) {
  const pkg = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  return pkg.version;
}

function generatePackageJson(projectName) {
  return {
    name: projectName,
    version: '0.1.0',
    private: true,
    type: 'module',
    description: 'A b0nes project',
    scripts: {
      dev: 'NODE_ENV=development node src/framework/server/index.js',
      'dev:watch': 'NODE_ENV=development node --watch src/framework/server/index.js',
      build: 'node src/framework/build/cli.js build',
      'build:production':
        'node src/framework/build/cli.js build --clean --parallel --production',
      clean: 'node src/framework/build/cli.js clean',
      preview: 'npx serve public',
      test: "node --test 'src/**/*.test.js'",
      generate: 'node src/components/utils/generator/index.js',
      'install-component': 'node src/scripts/install-component.js',
      mcp: 'node src/mcp/server.js',
      'b0nes:upgrade': 'npx b0nes@latest upgrade',
      'b0nes:upgrade:dry': 'npx b0nes@latest upgrade --dry-run'
    },
    keywords: ['b0nes', 'website'],
    author: '',
    license: 'MIT',
    engines: {
      node: '>=22.0.0'
    },
    b0nes: {
      // Hint for tools; authoritative version is .b0nes/manifest.json
      framework: 'vendored'
    }
  };
}

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
  } catch {
    log.warn('Failed to initialize git');
  }
}

function showSuccess(projectName, templateName) {
  const template = TEMPLATES[templateName];

  console.log(`
${colors.bright}${colors.green}✓ Success!${colors.reset} Created ${colors.cyan}${projectName}${colors.reset} using ${colors.cyan}${template.name}${colors.reset} template

${colors.bright}Next steps:${colors.reset}

  ${colors.cyan}cd ${projectName}${colors.reset}
  ${colors.cyan}npm run dev${colors.reset}

${colors.bright}Available commands:${colors.reset}

  ${colors.cyan}npm run dev${colors.reset}              Start development server
  ${colors.cyan}npm run build${colors.reset}            Build static site
  ${colors.cyan}npm run b0nes:upgrade:dry${colors.reset} Preview framework upgrade
  ${colors.cyan}npm run b0nes:upgrade${colors.reset}     Apply framework upgrade

${colors.bright}Learn more:${colors.reset}
  ${colors.blue}https://github.com/iggydotdev/b0nes${colors.reset}
  Upgrade path: docs/UPGRADE.md (in the b0nes repo)

Happy building! 🦴
  `);
}

/**
 * @param {string[]} args - argv after optional "create"
 * @param {string} packageRoot - b0nes package root
 */
export async function runCreate(args, packageRoot) {
  log.title('🦴 b0nes');

  const { projectName, templateFlag, skipGit } = parseArgs(args);

  if (!/^[a-z0-9-]+$/.test(projectName)) {
    log.error('Project name can only contain lowercase letters, numbers, and hyphens');
    process.exit(1);
  }

  let templateName = templateFlag;
  if (!templateName || !TEMPLATES[templateName]) {
    if (templateFlag && !TEMPLATES[templateFlag]) {
      log.error(`Unknown template "${templateFlag}". Use: basic, blog, docs`);
      process.exit(1);
    }
    templateName = await selectTemplate();
  }

  const frameworkVersion = readPackageVersion(packageRoot);

  log.info(`Creating project: ${colors.cyan}${projectName}${colors.reset}`);
  log.info(`Using template: ${colors.cyan}${TEMPLATES[templateName].name}${colors.reset}`);
  log.info(`Framework version: ${colors.cyan}${frameworkVersion}${colors.reset}`);

  const projectPath = createProjectDir(projectName);
  const source = path.join(packageRoot, 'src');
  const target = path.join(projectPath, 'src');

  log.info(`Copy project from: ${colors.cyan}${source}${colors.reset}`);
  await fs.promises.cp(source, target, { recursive: true });

  // Drop shipped examples; apply only the selected template
  const targetPagesDir = path.join(projectPath, 'src/pages');
  if (fs.existsSync(targetPagesDir)) {
    await fs.promises.rm(targetPagesDir, { recursive: true, force: true });
  }

  const templatePath = path.join(
    packageRoot,
    'src/pages/examples',
    TEMPLATES[templateName].pages
  );
  if (fs.existsSync(templatePath)) {
    await fs.promises.cp(templatePath, targetPagesDir, {
      recursive: true,
      force: true
    });
    console.log(`Applied template: ${templateName}`);
  } else {
    await fs.promises.mkdir(targetPagesDir, { recursive: true });
    log.warn(`Template path missing in package: ${TEMPLATES[templateName].pages}`);
  }

  // Root files
  const rootFiles = ['LICENSE', '.gitignore'];
  for (const file of rootFiles) {
    const from = path.join(packageRoot, file);
    if (fs.existsSync(from)) {
      await fs.promises.copyFile(from, path.join(projectPath, file));
    }
  }

  // Ensure upgrade backups are ignored even if package .gitignore is older
  const giPath = path.join(projectPath, '.gitignore');
  const giExtra = '\n# b0nes upgrade backups (commit manifest + checksums)\n.b0nes/backups/\n';
  if (fs.existsSync(giPath)) {
    const gi = fs.readFileSync(giPath, 'utf8');
    if (!gi.includes('.b0nes/backups')) {
      fs.appendFileSync(giPath, giExtra);
    }
  } else {
    fs.writeFileSync(
      giPath,
      `node_modules/\npublic/\n.b0nes-cache/\n.b0nes/backups/\n.env\n.DS_Store\n`
    );
  }

  fs.writeFileSync(
    path.join(projectPath, 'package.json'),
    JSON.stringify(generatePackageJson(projectName), null, 2) + '\n'
  );

  // Stamp upgrade metadata
  const manifest = createInitialManifest({
    frameworkVersion,
    template: templateName
  });
  writeManifest(projectPath, manifest);

  const checksums = buildChecksums(projectPath, [
    ...FRAMEWORK_PATHS,
    ...COMPONENT_PATHS
  ]);
  writeChecksums(projectPath, checksums);
  log.success('Wrote .b0nes/manifest.json (upgrade tracking)');

  if (!skipGit) {
    initGit(projectPath);
  }

  showSuccess(projectName, templateName);
}
