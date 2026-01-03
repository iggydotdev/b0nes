import test from 'node:test';
import assert from 'node:assert';
import divider from './index.js';

test('divider rendering', () => {
    const actual = divider({});
    const expected = '<hr class="divider"/>';
    assert.strictEqual(actual, expected);
});
