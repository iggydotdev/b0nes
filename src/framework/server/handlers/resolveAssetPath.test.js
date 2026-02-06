import test from 'node:test';
import assert from 'node:assert';
import { resolveAssetPath } from './resolveAssetPath.js';

test('resolveAssetPath - absolute paths are returned unchanged', () => {
    assert.strictEqual(resolveAssetPath('/styles/main.css', '/blog'), '/styles/main.css');
});

test('resolveAssetPath - http URLs are returned unchanged', () => {
    const url = 'http://cdn.example.com/lib.js';
    assert.strictEqual(resolveAssetPath(url, '/blog'), url);
});

test('resolveAssetPath - https URLs are returned unchanged', () => {
    const url = 'https://cdn.example.com/lib.js';
    assert.strictEqual(resolveAssetPath(url, '/about'), url);
});

test('resolveAssetPath - relative path resolved against current page', () => {
    const result = resolveAssetPath('./custom.css', '/examples/talk');
    assert.strictEqual(result, '/examples/talk/custom.css');
});

test('resolveAssetPath - bare relative path (no ./) resolved correctly', () => {
    const result = resolveAssetPath('styles.css', '/blog/post');
    assert.strictEqual(result, '/blog/post/styles.css');
});

test('resolveAssetPath - defaults to root when no currentPath', () => {
    const result = resolveAssetPath('main.css');
    assert.strictEqual(result, '/main.css');
});

test('resolveAssetPath - handles root currentPath', () => {
    const result = resolveAssetPath('./app.js', '/');
    assert.strictEqual(result, '/app.js');
});

test('resolveAssetPath - preserves deeply nested paths', () => {
    const result = resolveAssetPath('./theme.css', '/docs/api/v2');
    assert.strictEqual(result, '/docs/api/v2/theme.css');
});
