import test from 'node:test';
import assert from 'node:assert';
import link from './index.js';

test('link rendering', () => {
    const actual = link({url: 'https://example.com', slot: 'Example', className: 'custom-link', attrs: 'target="_blank" rel="noopener noreferrer"'});
    const expected = '<a href="https://example.com" class="link custom-link" target="_blank" rel="noopener noreferrer">Example</a>';
    assert.strictEqual(actual, expected);
});
