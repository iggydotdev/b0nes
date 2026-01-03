import test from 'node:test';
import assert from 'node:assert';
import input from './index.js';

test('input rendering', () => {
    const actual = input({type: 'text', attrs: 'placeholder="Enter text" id="text-input"', className: 'custom-input'});
    const expected = '<input type="text" class="input custom-input" placeholder="Enter text" id="text-input"/>';
    assert.strictEqual(actual, expected);
});
