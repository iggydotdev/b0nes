/** Filesystem containment for CLI-managed project/package paths (zero deps). */
import fs from 'node:fs';
import path from 'node:path';

const unsafe = (relativePath, reason) => {
  const error = new Error(`Refusing unsafe managed path "${relativePath}": ${reason}`);
  error.code = 'B0NES_UNSAFE_PATH';
  return error;
};

/**
 * Resolve against the real root and inspect every existing path component.
 * The root may itself be reached through a symlink; links inside it are never
 * followed, including dangling links and directory junctions.
 */
export const inspectPath = (root, relativePath, { type } = {}) => {
  if (typeof relativePath !== 'string' || !relativePath ||
      relativePath.includes('\0') || path.isAbsolute(relativePath) ||
      relativePath.split(/[\\/]/).includes('..')) {
    throw unsafe(relativePath, 'expected a path contained by the root');
  }
  const anchor = fs.realpathSync(root);
  if (!fs.statSync(anchor).isDirectory()) throw unsafe(relativePath, 'root is not a directory');
  const absolutePath = path.resolve(anchor, relativePath);
  const relative = path.relative(anchor, absolutePath);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw unsafe(relativePath, 'expected a path contained by the root');
  }

  const segments = relative.split(path.sep);
  let current = anchor;
  let stat;
  for (let index = 0; index < segments.length; index++) {
    current = path.join(current, segments[index]);
    try {
      stat = fs.lstatSync(current);
    } catch (error) {
      if (error.code === 'ENOENT') return { absolutePath, stat: null };
      throw error;
    }
    if (stat.isSymbolicLink()) throw unsafe(relativePath, 'symbolic links are not allowed');
    const last = index === segments.length - 1;
    if (!last && !stat.isDirectory()) throw unsafe(relativePath, 'parent is not a directory');
    if (last && ((type === 'file' && !stat.isFile()) ||
                 (type === 'directory' && !stat.isDirectory()) ||
                 (!stat.isFile() && !stat.isDirectory()))) {
      throw unsafe(relativePath, `expected ${type || 'a regular file or directory'}`);
    }
  }
  return { absolutePath, stat };
};

/** Keep final-file links from being followed if a path changes after preflight. */
const noFollow = fs.constants.O_NOFOLLOW || 0;

export const writeContainedFileSync = (root, relativePath, contents) => {
  let { absolutePath } = inspectPath(root, relativePath, { type: 'file' });
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  ({ absolutePath } = inspectPath(root, relativePath, { type: 'file' }));
  const fd = fs.openSync(absolutePath,
    fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_TRUNC | noFollow);
  try {
    fs.writeFileSync(fd, contents, 'utf8');
  } finally {
    fs.closeSync(fd);
  }
};

export const copyContainedFile = async (sourceRoot, destinationRoot, relativePath) => {
  const source = inspectPath(sourceRoot, relativePath, { type: 'file' });
  if (!source.stat) throw new Error(`Managed source file is missing: ${relativePath}`);
  const input = await fs.promises.open(source.absolutePath, fs.constants.O_RDONLY | noFollow);
  try {
    const sourceStat = await input.stat();
    if (!sourceStat.isFile()) throw unsafe(relativePath, 'source is not a regular file');
    const contents = await input.readFile();
    let destination = inspectPath(destinationRoot, relativePath, { type: 'file' });
    await fs.promises.mkdir(path.dirname(destination.absolutePath), { recursive: true });
    destination = inspectPath(destinationRoot, relativePath, { type: 'file' });
    const output = await fs.promises.open(destination.absolutePath,
      fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_TRUNC | noFollow,
      sourceStat.mode & 0o777);
    try {
      await output.writeFile(contents);
    } finally {
      await output.close();
    }
  } finally {
    await input.close();
  }
};
