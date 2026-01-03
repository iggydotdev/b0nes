import test from 'node:test';
import assert from 'node:assert';
import accordion from './index.js';

test('accordion rendering', () => {
    const actual = accordion({titleSlot: 'Accordion Title', detailsSlot: 'Accordion Details', className: 'custom-accordion', attrs: 'id="my-accordion"'});
    const expected = '<details class="accordion custom-accordion" id="my-accordion"><summary>Accordion Title</summary>Accordion Details</details>';
    assert.strictEqual(actual, expected);
});
