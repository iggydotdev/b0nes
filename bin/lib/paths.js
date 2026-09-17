/**
 * Ownership paths for create / upgrade.
 * Keep in sync with docs/UPGRADE.md
 */

/** Framework-owned — replaced on default upgrade */
export const FRAMEWORK_PATHS = ['src/framework'];

/**
 * Stock component tree — replaced only with `upgrade --components`.
 * User-generated component folders (not present upstream) are never deleted.
 */
export const COMPONENT_PATHS = [
  'src/components/atoms',
  'src/components/molecules',
  'src/components/organisms',
  'src/components/utils',
  'src/components/library.js',
  'src/components/index.js'
];

/** Never overwritten by upgrade */
export const USER_PATHS = ['src/pages', 'public'];

/** Meta directory owned by the CLI */
export const B0NES_DIR = '.b0nes';

export const MANIFEST_FILE = '.b0nes/manifest.json';
export const CHECKSUMS_FILE = '.b0nes/checksums.json';
export const BACKUPS_DIR = '.b0nes/backups';

export const DEFAULT_POLICY = {
  frameworkPaths: [...FRAMEWORK_PATHS],
  componentPaths: [...COMPONENT_PATHS],
  userPaths: [...USER_PATHS]
};
