import test from 'node:test';
import assert from 'node:assert';
import testComponent from './index.js';

test('testComponent rendering', () => {
    const actual = testComponent({ /* props go here */  });
    const expected = '...expected value goes here...';
    assert.strictEqual(actual, expected);
});
