import test from 'node:test';
import assert from 'node:assert';
import { compose, clearCompositionCache, getCompositionCacheSize } from './core/compose.js';

test('compose - basic component composition', () => {
    const result = compose([
        {
            type: 'atom',
            name: 'text',
            props: { is: 'p', slot: 'Hello' }
        }
    ]);
    assert.ok(result.includes('Hello'));
});

test('compose - missing component shows error fallback', () => {
    clearCompositionCache();
    const result = compose([
        {
            type: 'atom',
            name: 'nonexistent-component',
            props: {}
        }
    ]);
    assert.ok(result.includes('Component Error'));
    assert.ok(result.includes('ef4444'));
});

test('compose - caching works - same component rendered twice', () => {
    clearCompositionCache();
    const component = {
        type: 'atom',
        name: 'text',
        props: { is: 'p', slot: 'Cached' }
    };
    compose([component]);
    const sizeBefore = getCompositionCacheSize();
    compose([component]);
    const sizeAfter = getCompositionCacheSize();
    assert.strictEqual(sizeBefore, sizeAfter);
    assert.strictEqual(sizeBefore, 1);
});

test('compose - cache cleared successfully', () => {
    compose([{ type: 'atom', name: 'text', props: { is: 'p', slot: 'Test' } }]);
    clearCompositionCache();
    assert.strictEqual(getCompositionCacheSize(), 0);
});

test('compose - nested components compose correctly', () => {
    clearCompositionCache();
    const result = compose([
        {
            type: 'molecule',
            name: 'card',
            props: {
                slot: [
                    {
                        type: 'atom',
                        name: 'text',
                        props: { is: 'p', slot: 'Card content' }
                    }
                ]
            }
        }
    ]);
    assert.ok(result.includes('Card content'));
    assert.ok(!result.includes('Component Error'));
});

test('compose - invalid component object returns empty string', () => {
    clearCompositionCache();
    const result = compose([null, undefined, { type: 'atom' }, {}]);
    assert.strictEqual(result, '');
});
