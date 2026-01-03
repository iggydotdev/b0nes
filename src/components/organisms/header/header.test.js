import test from 'node:test';
import assert from 'node:assert';
import header from './index.js';

test('header rendering', () => {
    const actual = header({ attrs: 'data-test="header"', className: 'custom-header', slot: '<h1 class="header-title">This is the header</h1>' });
    const expected = '<header class="header custom-header" data-test="header"><h1 class="header-title">This is the header</h1></header>';
    assert.strictEqual(actual, expected);
});
