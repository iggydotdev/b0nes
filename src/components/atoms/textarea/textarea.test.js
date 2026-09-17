import test from 'node:test';
import assert from 'node:assert';
import textarea from './index.js';

test('textarea rendering', () => {
    const actual = textarea({ attrs: 'placeholder="Enter text" id="text-area"', className: 'custom-textarea' });
    const expected = '<textarea class="textarea custom-textarea" placeholder="Enter text" id="text-area"></textarea>';
    assert.strictEqual(String(actual), expected);
});

test('textarea with value and escaping', () => {
    const actual = textarea({ value: 'Initial text <script>alert(1)</script>' });
    const expected = '<textarea class="textarea">Initial text &lt;script&gt;alert(1)&lt;/script&gt;</textarea>';
    assert.strictEqual(String(actual), expected);
});

test('textarea with slot content', () => {
    const actual = textarea({ slot: 'Multiline\ncontent' });
    const expected = '<textarea class="textarea">Multiline\ncontent</textarea>';
    assert.strictEqual(String(actual), expected);
});

