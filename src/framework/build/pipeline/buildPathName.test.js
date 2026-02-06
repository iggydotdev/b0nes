import test from 'node:test';
import assert from 'node:assert';
import { buildPathname } from './buildPathName.js';

test('buildPathname - replaces single param', () => {
    const result = buildPathname('/blog/:slug', { slug: 'hello-world' });
    assert.strictEqual(result, '/blog/hello-world');
});

test('buildPathname - replaces multiple params', () => {
    const result = buildPathname('/blog/:year/:slug', { year: '2025', slug: 'my-post' });
    assert.strictEqual(result, '/blog/2025/my-post');
});

test('buildPathname - handles no params in pattern', () => {
    const result = buildPathname('/about', {});
    assert.strictEqual(result, '/about');
});

test('buildPathname - throws on missing required param', () => {
    assert.throws(
        () => buildPathname('/blog/:slug', {}),
        { message: /Missing required route parameters: slug/ }
    );
});

test('buildPathname - throws listing all missing params', () => {
    assert.throws(
        () => buildPathname('/blog/:year/:slug', { year: '2025' }),
        { message: /Missing required route parameters: slug/ }
    );
});

test('buildPathname - extra data keys are harmless', () => {
    const result = buildPathname('/blog/:slug', { slug: 'post', title: 'My Post', id: 1 });
    assert.strictEqual(result, '/blog/post');
});

test('buildPathname - handles root pattern', () => {
    const result = buildPathname('/', {});
    assert.strictEqual(result, '/');
});
