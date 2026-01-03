import test from 'node:test';
import assert from 'node:assert';
import footer from './index.js';

test('footer rendering', () => {
    const actual = footer({ attrs: 'data-test="footer"', className: 'custom-footer', slot: '<p class="footer-text">This is the footer</p>' });
    const expected = '<footer class="footer custom-footer" data-test="footer"><p class="footer-text">This is the footer</p></footer>';
    assert.strictEqual(actual, expected);
});
