import test from 'node:test';
import assert from 'node:assert';
import { resolveAsset, resolveVersionedAsset, getAssetBasePath, ASSETS } from './assetPath.js';

// Note: These tests run in Node.js where NODE_ENV may or may not be set.
// The behavior depends on ENV.isDev from config/envs.js.
// We test the exported functions for correctness regardless of env.

test('resolveAsset - returns a string', () => {
    const result = resolveAsset('js/client/b0nes.js');
    assert.strictEqual(typeof result, 'string');
});

test('resolveAsset - result starts with /', () => {
    const result = resolveAsset('js/client/b0nes.js');
    assert.ok(result.startsWith('/'), `Expected path starting with /, got: ${result}`);
});

test('resolveVersionedAsset - includes version query param', () => {
    const result = resolveVersionedAsset('js/client/b0nes.js', '1.0.0');
    assert.ok(result.includes('?v=1.0.0'), `Expected version param, got: ${result}`);
});

test('resolveVersionedAsset - uses default version when none provided', () => {
    const result = resolveVersionedAsset('js/client/b0nes.js');
    assert.ok(result.includes('?v='), `Expected version param, got: ${result}`);
});

test('getAssetBasePath - returns a string', () => {
    const result = getAssetBasePath();
    assert.strictEqual(typeof result, 'string');
});

test('ASSETS.b0nes - returns path to b0nes.js', () => {
    const result = ASSETS.b0nes();
    assert.ok(result.includes('b0nes'), `Expected b0nes in path, got: ${result}`);
});

test('ASSETS.client - returns path with filename', () => {
    const result = ASSETS.client('compose.js');
    assert.ok(result.includes('compose.js'), `Expected compose.js in path, got: ${result}`);
});

test('ASSETS.utils - returns path with filename', () => {
    const result = ASSETS.utils('mapper.js');
    assert.ok(result.includes('mapper.js'), `Expected mapper.js in path, got: ${result}`);
});
