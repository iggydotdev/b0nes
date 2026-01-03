import test from 'node:test';
import assert from 'node:assert';
import box from './index.js';

test('box rendering', () => {
    const actual = box({slot: 'Content', className: 'customClass'});
    const expected = '<div class="box customClass">Content</div>';
    assert.strictEqual(actual, expected);
});
