import test from 'node:test';
import assert from 'node:assert';
import link from './index.js';

test('link rendering', () => {
    const actual = link({url: 'https://example.com', slot: 'Example', className: 'custom-link', attrs: 'target="_blank" rel="noopener noreferrer"'});
    const expected = '<a href="https://example.com" class="link custom-link" target="_blank" rel="noopener noreferrer">Example</a>';
    assert.strictEqual(String(actual), expected);
});

test('link escapes quotes in url to prevent attribute breakout', () => {
    const actual = link({ url: 'https://example.com/" onmouseover="alert(1)', slot: 'Click' });
    assert.ok(actual.includes('&quot;'));
    assert.ok(!actual.includes('" onmouseover='));
});

