/** Roll back a set of managed files without replacing project-owned trees. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { inspectPath, copyContainedFile } from './safePaths.js';

export const createFileTransaction = async (root, relativePaths) => {
    const paths = [...new Set(relativePaths)];
    const originals = new Set();
    const newDirectories = new Set();
    const snapshot = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-upgrade-recovery-'));
    try {
        for (const relative of paths) {
            const target = inspectPath(root, relative, { type: 'file' });
            if (target.stat) {
                originals.add(relative);
                await copyContainedFile(root, snapshot, relative);
            }
            let parent = path.dirname(relative);
            while (parent !== '.') {
                if (!inspectPath(root, parent, { type: 'directory' }).stat) newDirectories.add(parent);
                parent = path.dirname(parent);
            }
        }
    } catch (error) {
        fs.rmSync(snapshot, { recursive: true, force: true });
        throw error;
    }
    let finished = false;
    const dispose = () => {
        try { fs.rmSync(snapshot, { recursive: true, force: true }); }
        catch (error) { console.warn(`Upgrade recovery cleanup failed: ${snapshot}: ${error.message}`); }
    };
    return {
        commit() { finished = true; dispose(); },
        async rollback() {
            if (finished) return;
            const errors = [];
            for (const relative of paths) {
                try {
                    if (originals.has(relative)) await copyContainedFile(snapshot, root, relative);
                    else {
                        const target = inspectPath(root, relative, { type: 'file' });
                        if (target.stat) fs.unlinkSync(target.absolutePath);
                    }
                } catch (error) { errors.push(`${relative}: ${error.message}`); }
            }
            for (const relative of [...newDirectories].sort((a, b) => b.split(path.sep).length - a.split(path.sep).length)) {
                try {
                    const target = inspectPath(root, relative, { type: 'directory' });
                    if (target.stat) fs.rmdirSync(target.absolutePath);
                } catch (error) {
                    // User files or retained upgrade backups may now occupy a
                    // directory. Keep them; never recursively prune such trees.
                    if (!['ENOTEMPTY', 'EEXIST', 'ENOENT'].includes(error.code)) errors.push(`${relative}: ${error.message}`);
                }
            }
            if (errors.length) throw new Error(`Upgrade recovery failed; originals retained at ${snapshot}: ${errors.join('; ')}`);
            finished = true;
            dispose();
        }
    };
};

export const withFileTransaction = async (root, relativePaths, apply) => {
    const transaction = await createFileTransaction(root, relativePaths);
    try {
        const result = await apply();
        transaction.commit();
        return result;
    } catch (error) {
        try { await transaction.rollback(); }
        catch (recovery) { throw new Error(`${error.message}; ${recovery.message}`, { cause: error }); }
        throw new Error(`Upgrade failed; previous files restored: ${error.message}`, { cause: error });
    }
};
