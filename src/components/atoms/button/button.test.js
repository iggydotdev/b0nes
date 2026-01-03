import test from 'node:test';
import assert from 'node:assert';
import button from './index.js';

test('button - basic button with submit type', () => {
    const actual = button({
        type: 'submit', 
        slot: 'Click Me', 
        className: 'custom-button', 
        attrs: 'id="my-button" onclick="()=>{alert(`hello`)}"'
    });
    const expected = '<button type="submit" class="btn custom-button" id="my-button" onclick="()=>{alert(`hello`)}">Click Me</button>';
    assert.strictEqual(actual, expected);
});

test('button - default button (no type specified)', () => {
    const actual = button({
        slot: 'Default Button'
    });
    const expected = '<button type="button" class="btn">Default Button</button>';
    assert.strictEqual(actual, expected);
});

test('button - button with disabled attribute', () => {
    const actual = button({
        slot: 'Disabled',
        attrs: 'disabled'
    });
    const expected = '<button type="button" class="btn" disabled>Disabled</button>';
    assert.strictEqual(actual, expected);
});

test('button - button with aria-label', () => {
    const actual = button({
        slot: 'Submit',
        attrs: 'aria-label="Submit form"'
    });
    const expected = '<button type="button" class="btn" aria-label="Submit form">Submit</button>';
    assert.strictEqual(actual, expected);
});

test('button - button with multiple classes', () => {
    const actual = button({
        slot: 'Primary',
        className: 'primary large'
    });
    const expected = '<button type="button" class="btn primary large">Primary</button>';
    assert.strictEqual(actual, expected);
});

test('button - reset button type', () => {
    const actual = button({
        type: 'reset',
        slot: 'Reset Form'
    });
    const expected = '<button type="reset" class="btn">Reset Form</button>';
    assert.strictEqual(actual, expected);
});

test('button - button with array slot (nested content)', () => {
    const actual = button({
        slot: ['Click ', '<strong>Me</strong>']
    });
    const expected = '<button type="button" class="btn">Click <strong>Me</strong></button>';
    assert.strictEqual(actual, expected);
});