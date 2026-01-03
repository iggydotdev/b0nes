import test from 'node:test';
import assert from 'node:assert';
import progress from './index.js';

test('progress - basic percentage progress', () => {
    const actual = progress({ value: 75, max: 100 });
    const expected = '<progress class="progress" value="75" max="100">75%</progress>';
    assert.strictEqual(actual, expected);
});

test('progress - step progress (multi-step form)', () => {
    const actual = progress({ value: 2, max: 5 });
    const expected = '<progress class="progress" value="2" max="5">2 of 5</progress>';
    assert.strictEqual(actual, expected);
});

test('progress - indeterminate progress (no value)', () => {
    const actual = progress({ max: 100 });
    const expected = '<progress class="progress" value="0" max="100">Loading...</progress>';
    assert.strictEqual(actual, expected);
});

test('progress - custom class and attributes', () => {
    const actual = progress({ 
        value: 60, 
        max: 100, 
        className: 'upload-progress', 
        attrs: 'id="file-upload"' 
    });
    const expected = '<progress class="progress upload-progress" value="60" max="100" id="file-upload">60%</progress>';
    assert.strictEqual(actual, expected);
});

test('progress - zero progress', () => {
    const actual = progress({ value: 0, max: 10 });
    const expected = '<progress class="progress" value="0" max="10">0 of 10</progress>';
    assert.strictEqual(actual, expected);
});

test('progress - complete progress', () => {
    const actual = progress({ value: 100, max: 100 });
    const expected = '<progress class="progress" value="100" max="100">100%</progress>';
    assert.strictEqual(actual, expected);
});