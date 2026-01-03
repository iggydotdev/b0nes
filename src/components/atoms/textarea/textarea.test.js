import test from 'node:test';
import assert from 'node:assert';
import textarea from './index.js';

test('textarea rendering', () => {
    const actual = textarea({ attrs: 'placeholder="Enter text" id="text-area"', className: 'custom-textarea' });
    const expected = '<textarea class="textarea custom-textarea" placeholder="Enter text" id="text-area"/>';
    assert.strictEqual(actual, expected);
});
