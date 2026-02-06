import test from 'node:test';
import assert from 'node:assert';
import { createRenderCache } from './createRenderCache.js';

test('createRenderCache - get returns null for cache miss', () => {
    const cache = createRenderCache();
    const result = cache.get({ type: 'atom', name: 'text', props: { slot: 'hi' } });
    assert.strictEqual(result, null);
});

test('createRenderCache - set and get round-trip works', () => {
    const cache = createRenderCache();
    const component = { type: 'atom', name: 'text', props: { slot: 'hello' } };
    cache.set(component, '<p>hello</p>');
    const result = cache.get(component);
    assert.strictEqual(result, '<p>hello</p>');
});

test('createRenderCache - different components are cached separately', () => {
    const cache = createRenderCache();
    const comp1 = { type: 'atom', name: 'text', props: { slot: 'one' } };
    const comp2 = { type: 'atom', name: 'text', props: { slot: 'two' } };
    cache.set(comp1, '<p>one</p>');
    cache.set(comp2, '<p>two</p>');
    assert.strictEqual(cache.get(comp1), '<p>one</p>');
    assert.strictEqual(cache.get(comp2), '<p>two</p>');
});

test('createRenderCache - LRU eviction when maxSize exceeded', () => {
    const cache = createRenderCache(2);
    const comp1 = { type: 'atom', name: 'a', props: { slot: '1' } };
    const comp2 = { type: 'atom', name: 'b', props: { slot: '2' } };
    const comp3 = { type: 'atom', name: 'c', props: { slot: '3' } };

    cache.set(comp1, '1');
    cache.set(comp2, '2');
    cache.set(comp3, '3'); // should evict comp1

    assert.strictEqual(cache.get(comp1), null);
    assert.strictEqual(cache.get(comp2), '2');
    assert.strictEqual(cache.get(comp3), '3');
});

test('createRenderCache - LRU promotes recently accessed items', () => {
    const cache = createRenderCache(2);
    const comp1 = { type: 'atom', name: 'a', props: { slot: '1' } };
    const comp2 = { type: 'atom', name: 'b', props: { slot: '2' } };
    const comp3 = { type: 'atom', name: 'c', props: { slot: '3' } };

    cache.set(comp1, '1');
    cache.set(comp2, '2');
    cache.get(comp1); // access comp1, promoting it
    cache.set(comp3, '3'); // should evict comp2 (least recently used)

    assert.strictEqual(cache.get(comp1), '1');
    assert.strictEqual(cache.get(comp2), null);
    assert.strictEqual(cache.get(comp3), '3');
});

test('createRenderCache - clear resets everything', () => {
    const cache = createRenderCache();
    cache.set({ type: 'atom', name: 'x', props: {} }, 'html');
    cache.clear();
    const stats = cache.getStats();
    assert.strictEqual(stats.size, 0);
    assert.strictEqual(stats.hits, 0);
    assert.strictEqual(stats.misses, 0);
});

test('createRenderCache - getStats tracks hits and misses', () => {
    const cache = createRenderCache();
    const comp = { type: 'atom', name: 'text', props: { slot: 'x' } };

    cache.get(comp); // miss
    cache.set(comp, '<p>x</p>');
    cache.get(comp); // hit
    cache.get(comp); // hit

    const stats = cache.getStats();
    assert.strictEqual(stats.hits, 2);
    assert.strictEqual(stats.misses, 1);
    assert.strictEqual(stats.hitRate, '66.67%');
});

test('createRenderCache - non-cacheable components with functions are skipped', () => {
    const cache = createRenderCache();
    const comp = { type: 'atom', name: 'dynamic', props: { slot: () => 'fn' } };
    cache.set(comp, 'html');
    const result = cache.get(comp);
    assert.strictEqual(result, null);
});
