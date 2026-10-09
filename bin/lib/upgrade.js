/**
 * b0nes upgrade — re-sync vendored framework (and optional stock components)
 * from the installed b0nes package into a project.
 *
 * See docs/UPGRADE.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { inspectPath, copyContainedFile } from './safePaths.js';
import {
  FRAMEWORK_PATHS,
  FRAMEWORK_UTILS_PATHS,
  COMPONENT_PATHS,
  BACKUPS_DIR,
  DEFAULT_POLICY
} from './paths.js';
import {
  readManifest,
  writeManifest,
  readChecksums,
  writeChecksums,
  buildChecksums,
  listFiles,
  hashFile,
  createInitialManifest,
  findProjectRoot
} from './manifest.js';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
  dim: (msg) => console.log(`${colors.dim}${msg}${colors.reset}`)
};

/**
 * @param {string} packageRoot - b0nes package root (has package.json + src/)
 * @returns {string}
 */
export const readPackageVersion = (packageRoot) => {
  const pkg = JSON.parse(
    fs.readFileSync(inspectPath(packageRoot, 'package.json', { type: 'file' }).absolutePath, 'utf8')
  );
  return pkg.version;
};

/**
 * Classify each relative file for the upgrade plan.
 * @returns {{ rel: string, status: string, tier: string }[]}
 */
export const buildUpgradePlan = ({
  projectRoot,
  packageRoot,
  pathSpecs,
  tier,
  previousChecksums,
  protectUntracked = false
}) => {
  const plan = [];
  const seen = new Set();

  for (const spec of pathSpecs) {
    const sourceFiles = listFiles(packageRoot, spec);

    for (const rel of sourceFiles) {
      if (seen.has(rel)) continue;
      seen.add(rel);

      // Never pull package tests or certs into projects
      if (rel.endsWith('.test.js') || rel.includes('/.certs/') || rel.endsWith('.pem')) {
        continue;
      }

      const srcAbs = inspectPath(packageRoot, rel, { type: 'file' }).absolutePath;
      const destAbs = inspectPath(projectRoot, rel, { type: 'file' }).absolutePath;
      const srcHash = hashFile(srcAbs);
      const destHash = hashFile(destAbs);
      const prevHash = previousChecksums[rel];

      let status;
      if (!destHash) {
        status = 'add';
      } else if (destHash === srcHash) {
        status = 'identical';
      } else if ((prevHash && destHash !== prevHash) || (!prevHash && protectUntracked)) {
        status = 'local-modified';
      } else {
        status = 'update';
      }

      plan.push({ rel, status, tier, srcHash, destHash });
    }
  }

  return plan;
};

/**
 * Copy one file from package → project (creates dirs).
 */
const copyFile = async (packageRoot, projectRoot, rel) => {
  await copyContainedFile(packageRoot, projectRoot, rel);
};

/**
 * Backup files that will be written (existing dest only).
 * @returns {string|null} backup dir or null if nothing backed up
 */
const backupFiles = async (projectRoot, relPaths) => {
  const existing = relPaths.filter((rel) =>
    inspectPath(projectRoot, rel, { type: 'file' }).stat
  );
  if (existing.length === 0) return null;

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  let backups = inspectPath(projectRoot, BACKUPS_DIR, { type: 'directory' });
  await fs.promises.mkdir(backups.absolutePath, { recursive: true });
  backups = inspectPath(projectRoot, BACKUPS_DIR, { type: 'directory' });
  // A fresh directory cannot collide with an old backup file or link.
  const backupRoot = await fs.promises.mkdtemp(path.join(backups.absolutePath, `${stamp}-`));

  for (const rel of existing) {
    await copyContainedFile(projectRoot, backupRoot, rel);
  }

  return backupRoot;
};

/**
 * Print plan summary.
 */
const printPlan = (plan, { fromVersion, toVersion, dryRun }) => {
  const groups = {
    add: plan.filter((p) => p.status === 'add'),
    update: plan.filter((p) => p.status === 'update'),
    'local-modified': plan.filter((p) => p.status === 'local-modified'),
    identical: plan.filter((p) => p.status === 'identical')
  };

  log.title(dryRun ? 'b0nes upgrade (dry-run)' : 'b0nes upgrade');
  console.log(`  ${colors.dim}from${colors.reset}  ${fromVersion}`);
  console.log(`  ${colors.dim}to${colors.reset}    ${toVersion}\n`);

  const line = (label, items, color) => {
    if (items.length === 0) return;
    console.log(`${color}${label}${colors.reset} (${items.length})`);
    const show = items.slice(0, 30);
    for (const p of show) {
      console.log(`  ${p.rel}`);
    }
    if (items.length > 30) {
      console.log(`  ${colors.dim}… and ${items.length - 30} more${colors.reset}`);
    }
    console.log();
  };

  line('Will add', groups.add, colors.green);
  line('Will update', groups.update, colors.cyan);
  line('Locally modified or untracked (stock)', groups['local-modified'], colors.yellow);
  log.dim(`Unchanged (identical): ${groups.identical.length} files`);
  console.log();

  return groups;
};

/**
 * Run upgrade.
 * @param {object} options
 * @param {string} options.packageRoot
 * @param {string} [options.projectRoot]
 * @param {boolean} [options.dryRun]
 * @param {boolean} [options.components]
 * @param {boolean} [options.force]
 * @param {boolean} [options.yes]
 * @param {boolean} [options.backup]
 * @returns {Promise<number>} exit code
 */
export const runUpgrade = async ({
  packageRoot,
  projectRoot: projectRootOpt,
  dryRun = false,
  components = false,
  force = false,
  yes = false,
  backup = true
}) => {
  const projectRoot = projectRootOpt || findProjectRoot();
  if (!projectRoot) {
    log.error('Not a b0nes project (no src/framework found). Run from the project root.');
    return 1;
  }

  if (!inspectPath(packageRoot, 'src/framework', { type: 'directory' }).stat) {
    log.error(`b0nes package source not found at ${packageRoot}`);
    return 1;
  }

  // Preflight the complete managed trees before any backup, copy, or metadata
  // mutation. Also cover custom/removed files read by the final checksum pass.
  const managedSpecs = components
    ? [...FRAMEWORK_PATHS, ...COMPONENT_PATHS]
    : [...FRAMEWORK_PATHS];
  for (const spec of managedSpecs) {
    listFiles(packageRoot, spec);
    listFiles(projectRoot, spec);
  }
  if (backup) inspectPath(projectRoot, BACKUPS_DIR, { type: 'directory' });

  const toVersion = readPackageVersion(packageRoot);
  let manifest = readManifest(projectRoot);

  if (!manifest) {
    log.warn('No .b0nes/manifest.json — treating as legacy project (version unknown).');
    manifest = createInitialManifest({
      frameworkVersion: 'unknown',
      template: null
    });
    manifest.createdAt = null;
  }

  const fromVersion = manifest.frameworkVersion || 'unknown';
  const previousChecksums = readChecksums(projectRoot);

  const frameworkPlan = buildUpgradePlan({
    projectRoot,
    packageRoot,
    pathSpecs: FRAMEWORK_PATHS.filter(spec => !FRAMEWORK_UTILS_PATHS.includes(spec)),
    tier: 'framework',
    previousChecksums
  });

  // These files used to belong to the optional component tier. Without a
  // checksum baseline, an existing different file might be a customization.
  const utilityPlan = buildUpgradePlan({
    projectRoot,
    packageRoot,
    pathSpecs: FRAMEWORK_UTILS_PATHS,
    tier: 'framework',
    previousChecksums,
    protectUntracked: true
  });
  const frameworkFiles = new Set([...frameworkPlan, ...utilityPlan].map(item => item.rel));

  const componentPlan = components
    ? buildUpgradePlan({
        projectRoot,
        packageRoot,
        pathSpecs: COMPONENT_PATHS,
        tier: 'components',
        previousChecksums
      }).filter(item => !frameworkFiles.has(item.rel))
    : [];

  const plan = [...frameworkPlan, ...utilityPlan, ...componentPlan];
  const groups = printPlan(plan, { fromVersion, toVersion, dryRun });

  const actionable = plan.filter(
    (p) => p.status === 'add' || p.status === 'update' || p.status === 'local-modified'
  );

  if (actionable.length === 0) {
    log.success('Already up to date — nothing to write.');
    // Refresh version and ownership metadata even when files already match.
    const policy = { ...manifest.policy, ...DEFAULT_POLICY };
    if (!dryRun && (fromVersion !== toVersion || JSON.stringify(manifest.policy) !== JSON.stringify(policy))) {
      manifest.frameworkVersion = toVersion;
      manifest.upgradedAt = new Date().toISOString();
      manifest.policy = policy;
      writeManifest(projectRoot, manifest);
      writeChecksums(projectRoot, {
        ...previousChecksums,
        ...buildChecksums(projectRoot, managedSpecs)
      });
      log.info(`Manifest set to ${toVersion}`);
    }
    return 0;
  }

  if (groups['local-modified'].length > 0 && !force) {
    log.warn(
      `${groups['local-modified'].length} stock file(s) were edited locally or have no checksum baseline. ` +
        `Re-run with --force to overwrite them, or restore from git and upgrade.`
    );
    if (!force) {
      // Still allow non-modified updates unless ALL actionable are local-modified only?
      // Policy: block entire upgrade if any local-modified without --force (safest).
      log.error('Refusing to overwrite locally modified stock files without --force.');
      return 2;
    }
  }

  if (dryRun) {
    log.info('Dry-run only — no files written.');
    log.dim('Run without --dry-run to apply. Prefer a clean git working tree.');
    return 0;
  }

  if (!yes) {
    // Non-interactive environments: require --yes
    if (!process.stdin.isTTY) {
      log.error('Non-interactive terminal: pass --yes to apply the upgrade.');
      return 2;
    }
    const ok = await confirm(
      `Apply ${actionable.length} file change(s) to ${projectRoot}? [y/N] `
    );
    if (!ok) {
      log.warn('Aborted.');
      return 2;
    }
  }

  let backupRoot = null;
  if (backup) {
    const toBackup = actionable
      .filter((p) => p.status !== 'add')
      .map((p) => p.rel);
    backupRoot = await backupFiles(projectRoot, toBackup);
    if (backupRoot) {
      log.info(`Backup: ${path.relative(projectRoot, backupRoot) || backupRoot}`);
    }
  }

  let written = 0;
  for (const item of actionable) {
    await copyFile(packageRoot, projectRoot, item.rel);
    written++;
  }

  // Refresh checksums for all managed paths we care about
  const newChecksums = {
    ...previousChecksums,
    ...buildChecksums(projectRoot, managedSpecs)
  };
  // Drop checksums for framework files no longer present upstream? keep stale keys harmless
  writeChecksums(projectRoot, newChecksums);

  manifest.frameworkVersion = toVersion;
  manifest.upgradedAt = new Date().toISOString();
  manifest.policy = { ...manifest.policy, ...DEFAULT_POLICY };
  if (!manifest.createdWith) manifest.createdWith = toVersion;
  writeManifest(projectRoot, manifest);

  log.success(`Upgraded framework ${fromVersion} → ${toVersion} (${written} files written)`);
  if (components) log.info('Stock components were included (--components).');
  log.dim('User land left untouched: src/pages, public, custom components.');
  log.dim('Read CHANGELOG.md and docs/UPGRADE.md for breaking changes.');
  if (backupRoot) log.dim(`Restore backup with: cp -R ${backupRoot}/src/. src/  # restores all replaced files`);

  return 0;
};

/**
 * @param {string} question
 * @returns {Promise<boolean>}
 */
const confirm = (question) =>
  new Promise((resolve) => {
    process.stdout.write(question);
    const onData = (buf) => {
      const ans = buf.toString().trim().toLowerCase();
      process.stdin.off('data', onData);
      if (process.stdin.isTTY) process.stdin.setRawMode?.(false);
      resolve(ans === 'y' || ans === 'yes');
    };
    process.stdin.once('data', onData);
    if (process.stdin.isTTY) process.stdin.resume();
  });
