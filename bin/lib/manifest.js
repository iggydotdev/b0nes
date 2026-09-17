/**
 * .b0nes manifest + checksum helpers (zero deps)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  B0NES_DIR,
  MANIFEST_FILE,
  CHECKSUMS_FILE,
  DEFAULT_POLICY
} from './paths.js';

/**
 * @param {string} projectRoot
 * @returns {string}
 */
export const manifestPath = (projectRoot) => path.join(projectRoot, MANIFEST_FILE);

/**
 * @param {string} projectRoot
 * @returns {string}
 */
export const checksumsPath = (projectRoot) => path.join(projectRoot, CHECKSUMS_FILE);

/**
 * @param {string} filePath
 * @returns {string|null} sha256 hex or null if missing
 */
export const hashFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return null;
    const buf = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(buf).digest('hex');
  } catch {
    return null;
  }
};

/**
 * Recursively list relative file paths under root/rel (files only).
 * @param {string} absoluteRoot
 * @param {string} relPath - path relative to absoluteRoot
 * @returns {string[]}
 */
export const listFiles = (absoluteRoot, relPath) => {
  const abs = path.join(absoluteRoot, relPath);
  if (!fs.existsSync(abs)) return [];

  const stat = fs.statSync(abs);
  if (stat.isFile()) return [relPath.replace(/\\/g, '/')];

  const out = [];
  const walk = (dir, rel) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      // Skip junk
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.certs') {
        continue;
      }
      const childAbs = path.join(dir, entry.name);
      const childRel = path.join(rel, entry.name).replace(/\\/g, '/');
      if (entry.isDirectory()) walk(childAbs, childRel);
      else if (entry.isFile()) out.push(childRel);
    }
  };
  walk(abs, relPath.replace(/\\/g, '/'));
  return out;
};

/**
 * Build checksum map for a list of root-relative path prefixes/files.
 * @param {string} absoluteRoot
 * @param {string[]} pathSpecs
 * @returns {Record<string, string>}
 */
export const buildChecksums = (absoluteRoot, pathSpecs) => {
  const map = {};
  for (const spec of pathSpecs) {
    for (const rel of listFiles(absoluteRoot, spec)) {
      const h = hashFile(path.join(absoluteRoot, rel));
      if (h) map[rel] = h;
    }
  }
  return map;
};

/**
 * @param {string} projectRoot
 * @returns {object|null}
 */
export const readManifest = (projectRoot) => {
  const p = manifestPath(projectRoot);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
};

/**
 * @param {string} projectRoot
 * @param {object} manifest
 */
export const writeManifest = (projectRoot, manifest) => {
  const dir = path.join(projectRoot, B0NES_DIR);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    manifestPath(projectRoot),
    JSON.stringify(manifest, null, 2) + '\n',
    'utf8'
  );
};

/**
 * @param {string} projectRoot
 * @returns {Record<string, string>}
 */
export const readChecksums = (projectRoot) => {
  const p = checksumsPath(projectRoot);
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return {};
  }
};

/**
 * @param {string} projectRoot
 * @param {Record<string, string>} checksums
 */
export const writeChecksums = (projectRoot, checksums) => {
  const dir = path.join(projectRoot, B0NES_DIR);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    checksumsPath(projectRoot),
    JSON.stringify(checksums, null, 2) + '\n',
    'utf8'
  );
};

/**
 * Create initial manifest for a new project.
 * @param {object} opts
 * @param {string} opts.frameworkVersion
 * @param {string} opts.template
 * @returns {object}
 */
export const createInitialManifest = ({ frameworkVersion, template }) => ({
  schemaVersion: 1,
  frameworkVersion,
  createdWith: frameworkVersion,
  createdAt: new Date().toISOString(),
  upgradedAt: null,
  template: template || null,
  policy: { ...DEFAULT_POLICY }
});

/**
 * Detect project root: cwd or walk parents for src/framework.
 * @param {string} [start=process.cwd()]
 * @returns {string|null}
 */
export const findProjectRoot = (start = process.cwd()) => {
  let dir = path.resolve(start);
  const { root } = path.parse(dir);

  while (true) {
    const framework = path.join(dir, 'src', 'framework');
    if (fs.existsSync(framework) && fs.statSync(framework).isDirectory()) {
      return dir;
    }
    if (dir === root) return null;
    dir = path.dirname(dir);
  }
};
