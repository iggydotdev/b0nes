#!/usr/bin/env node

/**
 * b0nes CLI
 *
 *   npx b0nes <project-name> [options]   Create a new project (default)
 *   npx b0nes create <project-name>      Same as above
 *   npx b0nes upgrade [options]          Re-sync framework into an existing project
 *   npx b0nes help
 *
 * See docs/UPGRADE.md for the upgrade contract.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCreate, showCreateHelp } from './create-project.js';
import { runUpgrade } from './lib/upgrade.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m'
};

function showHelp() {
  console.log(`
${colors.bright}${colors.cyan}b0nes${colors.reset} — zero-dependency web framework CLI

${colors.bright}Usage:${colors.reset}
  npx b0nes <project-name> [options]     Create a new project
  npx b0nes create <project-name>        Create a new project
  npx b0nes upgrade [options]            Upgrade vendored framework in a project
  npx b0nes help                         Show this help

${colors.bright}Create options:${colors.reset}
  --template <name>    basic | blog | docs
  --skip-git           Skip git init

${colors.bright}Upgrade options:${colors.reset}
  --dry-run            Show plan only (no writes)
  --components         Also refresh stock atoms/molecules/organisms/utils
  --force              Overwrite stock files that were edited locally
  --yes                Do not prompt for confirmation
  --no-backup          Skip .b0nes/backups (not recommended)

${colors.bright}Examples:${colors.reset}
  npx b0nes my-site
  npx b0nes my-blog --template blog
  cd my-site && npx b0nes@latest upgrade --dry-run
  npx b0nes upgrade --components --yes

${colors.bright}Docs:${colors.reset}
  Upgrade design: docs/UPGRADE.md
  `);
}

function parseUpgradeArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
    components: argv.includes('--components'),
    force: argv.includes('--force'),
    yes: argv.includes('--yes') || argv.includes('-y'),
    backup: !argv.includes('--no-backup')
  };
}

async function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0];

  if (!cmd || cmd === '-h' || cmd === '--help' || cmd === 'help') {
    showHelp();
    process.exit(0);
  }

  if (cmd === 'upgrade') {
    const opts = parseUpgradeArgs(argv.slice(1));
    const code = await runUpgrade({ packageRoot, ...opts });
    process.exit(code);
  }

  // create <name> | <name>
  let createArgs = argv;
  if (cmd === 'create') {
    createArgs = argv.slice(1);
  }

  if (createArgs.includes('-h') || createArgs.includes('--help')) {
    showCreateHelp();
    process.exit(0);
  }

  await runCreate(createArgs, packageRoot);
}

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
