import test from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { validateAndSanitizePath } from './sanitizePaths.js';

const BASE_DIR = '/var/www/public';

test('sanitizePaths - valid path is safe', () => {
    const result = validateAndSanitizePath('/styles/main.css', BASE_DIR);
    assert.strictEqual(result.safe, true);
    assert.ok(result.sanitized.startsWith(BASE_DIR));
});

test('sanitizePaths - path traversal with .. is blocked', () => {
    const result = validateAndSanitizePath('/../../etc/passwd', BASE_DIR);
    assert.strictEqual(result.safe, false);
    assert.ok(result.error.includes('traversal') || result.error.includes('outside'));
});

test('sanitizePaths - query strings are stripped', () => {
    const result = validateAndSanitizePath('/page.html?foo=bar', BASE_DIR);
    assert.strictEqual(result.safe, true);
    assert.ok(!result.sanitized.includes('?'));
});

test('sanitizePaths - fragments are stripped', () => {
    const result = validateAndSanitizePath('/page.html#section', BASE_DIR);
    assert.strictEqual(result.safe, true);
    assert.ok(!result.sanitized.includes('#'));
});

test('sanitizePaths - .env access is forbidden', () => {
    const result = validateAndSanitizePath('/.env', BASE_DIR);
    assert.strictEqual(result.safe, false);
    assert.ok(result.error.includes('.env'));
});

test('sanitizePaths - .git access is forbidden', () => {
    const result = validateAndSanitizePath('/.git/config', BASE_DIR);
    assert.strictEqual(result.safe, false);
    assert.ok(result.error.includes('.git'));
});

test('sanitizePaths - node_modules access is forbidden', () => {
    const result = validateAndSanitizePath('/node_modules/express/index.js', BASE_DIR);
    assert.strictEqual(result.safe, false);
    assert.ok(result.error.includes('node_modules'));
});

test('sanitizePaths - package.json access is forbidden', () => {
    const result = validateAndSanitizePath('/package.json', BASE_DIR);
    assert.strictEqual(result.safe, false);
    assert.ok(result.error.includes('package.json'));
});

test('sanitizePaths - deeply nested valid path works', () => {
    const result = validateAndSanitizePath('/assets/js/client/b0nes.js', BASE_DIR);
    assert.strictEqual(result.safe, true);
    assert.strictEqual(result.sanitized, path.resolve(BASE_DIR, 'assets/js/client/b0nes.js'));
});

test('sanitizePaths - empty path resolves to base dir', () => {
    const result = validateAndSanitizePath('/', BASE_DIR);
    assert.strictEqual(result.safe, true);
});
