import { html } from '../../utils/html.js';
import test from 'node:test';
import assert from 'node:assert';
import card from './index.js';

test('card - custom card', () => {
    const actual = card({attrs: 'id="my-card"', className: 'custom-card', slot: html('<p>This is a custom card content.</p>')});
    const expected = '<div class="box card custom-card" id="my-card"><p>This is a custom card content.</p></div>';
    assert.strictEqual(String(actual), expected);
});

test('card - standard card', () => {
    const actual = card({
        attrs: 'id="standard-card"',
        className: 'standard-card',
        headerSlot: html('<h2>Card Title</h2>'),
        mediaSlot: html('<img src="image.jpg" alt="Card Image">'),
        linkSlot: html('<a href="#">Read More</a>'),
        contentSlot: html('<p>This is the main content of the card.</p>')
    });
    const expected = '<div class="box card standard-card" id="standard-card"><h2>Card Title</h2><img src="image.jpg" alt="Card Image"><a href="#">Read More</a><p>This is the main content of the card.</p></div>';
    assert.strictEqual(String(actual), expected);
});