import test from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { validateAndSanitizePath } from './sanitizePaths.js';

test('sanitizePaths - allows safe relative file in baseDir', () => {
    const baseDir = path.resolve('/var/app/pages');
    const result = validateAndSanitizePath('about/index.html', baseDir);
    assert.strictEqual(result.safe, true);
    assert.strictEqual(result.sanitized, path.resolve(baseDir, 'about/index.html'));
});

test('sanitizePaths - blocks directory traversal ..', () => {
    const baseDir = path.resolve('/var/app/pages');
    const result = validateAndSanitizePath('../../../etc/passwd', baseDir);
    assert.strictEqual(result.safe, false);
    assert.strictEqual(result.error, 'Path traversal detected');
});

test('sanitizePaths - blocks sibling prefix bypass attack', () => {
    // /var/app/pages-secret starts with /var/app/pages if not checking boundary
    const baseDir = path.resolve('/var/app/pages');
    const result = validateAndSanitizePath('../pages-secret/passwords.txt', baseDir);
    assert.strictEqual(result.safe, false);
});

test('sanitizePaths - blocks forbidden files (.env, .git, etc.)', () => {
    const baseDir = path.resolve('/var/app/pages');
    const result = validateAndSanitizePath('.env', baseDir);
    assert.strictEqual(result.safe, false);
    assert.ok(result.error.includes('forbidden'));
});

test('sanitizePaths - blocks null byte injection', () => {
    const baseDir = path.resolve('/var/app/pages');
    const result = validateAndSanitizePath('test.png\0.js', baseDir);
    assert.strictEqual(result.safe, false);
});
