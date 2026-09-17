/**
 * b0nes project scaffolding
 * Used by: npx b0nes <name> | npx b0nes create <name>
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import {
  createInitialManifest,
  writeManifest,
  writeChecksums,
  buildChecksums
} from './lib/manifest.js';
import { FRAMEWORK_PATHS, COMPONENT_PATHS } from './lib/paths.js';

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
  --skip-git           Skip git initialization
  -h, --help           Show this help message

${colors.bright}Examples:${colors.reset}
  npx b0nes my-site
  npx b0nes my-site --skip-git

Creates one minimal page. See docs/RECIPES.md for additional patterns.
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
      preview: 'node src/framework/server/preview.js',
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

function showSuccess(projectName) {

  console.log(`
${colors.bright}${colors.green}✓ Success!${colors.reset} Created ${colors.cyan}${projectName}${colors.reset}

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

  const { projectName, skipGit } = parseArgs(args);

  if (!/^[a-z0-9-]+$/.test(projectName)) {
    log.error('Project name can only contain lowercase letters, numbers, and hyphens');
    process.exit(1);
  }

  if (args.includes('--template')) {
    throw new Error('Starter templates have been replaced by docs/RECIPES.md. Run create without --template.');
  }

  const frameworkVersion = readPackageVersion(packageRoot);

  log.info(`Creating project: ${colors.cyan}${projectName}${colors.reset}`);
  log.info(`Framework version: ${colors.cyan}${frameworkVersion}${colors.reset}`);

  const projectPath = createProjectDir(projectName);
  const source = path.join(packageRoot, 'src');
  const target = path.join(projectPath, 'src');

  log.info(`Copy project from: ${colors.cyan}${source}${colors.reset}`);
  await fs.promises.cp(source, target, { recursive: true });

  const targetPagesDir = path.join(projectPath, 'src/pages');
  await fs.promises.mkdir(targetPagesDir, { recursive: true });
  fs.writeFileSync(path.join(targetPagesDir, 'index.js'), `export const meta = { title: 'My b0nes site' };
export const components = [{ type: 'atom', name: 'text', props: { is: 'h1', slot: 'Hello, b0nes!' } }];
`);
  fs.writeFileSync(path.join(targetPagesDir, 'index.test.js'), `import test from 'node:test';
import assert from 'node:assert/strict';
import { compose } from '../framework/core/compose.js';
import { components } from './index.js';
test('home page renders', () => assert.match(compose(components, { strict: true }), /Hello, b0nes!/));
`);
  await fs.promises.mkdir(path.join(projectPath, 'docs'), { recursive: true });
  for (const name of ['RECIPES.md', 'HTML.md']) {
    await fs.promises.copyFile(path.join(packageRoot, 'docs', name), path.join(projectPath, 'docs', name));
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
    template: 'minimal'
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

  showSuccess(projectName);
}
