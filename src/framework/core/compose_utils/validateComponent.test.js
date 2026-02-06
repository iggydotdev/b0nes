import test from 'node:test';
import assert from 'node:assert';
import { validateComponent } from './validateComponent.js';

test('validateComponent - valid component passes', () => {
    const result = validateComponent({
        type: 'atom',
        name: 'button',
        props: { slot: 'Click' }
    });
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.errors.length, 0);
});

test('validateComponent - null returns invalid', () => {
    const result = validateComponent(null);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors[0].includes('null or undefined'));
});

test('validateComponent - undefined returns invalid', () => {
    const result = validateComponent(undefined);
    assert.strictEqual(result.valid, false);
});

test('validateComponent - non-object returns invalid', () => {
    const result = validateComponent('string');
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors[0].includes('must be an object'));
});

test('validateComponent - missing type is invalid', () => {
    const result = validateComponent({ name: 'button', props: {} });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('"type"')));
});

test('validateComponent - invalid type is invalid', () => {
    const result = validateComponent({ type: 'widget', name: 'x', props: {} });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('Invalid component type')));
});

test('validateComponent - all valid types accepted', () => {
    for (const type of ['atom', 'molecule', 'organism']) {
        const result = validateComponent({ type, name: 'test', props: {} });
        assert.strictEqual(result.valid, true, `type "${type}" should be valid`);
    }
});

test('validateComponent - missing name is invalid', () => {
    const result = validateComponent({ type: 'atom', props: {} });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('"name"')));
});

test('validateComponent - non-string name is invalid', () => {
    const result = validateComponent({ type: 'atom', name: 123, props: {} });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('must be a string')));
});

test('validateComponent - missing props is invalid', () => {
    const result = validateComponent({ type: 'atom', name: 'button' });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('"props"')));
});

test('validateComponent - non-object props is invalid', () => {
    const result = validateComponent({ type: 'atom', name: 'button', props: 'bad' });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('"props" must be an object')));
});

test('validateComponent - multiple errors collected at once', () => {
    const result = validateComponent({ type: 'invalid' });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.length >= 2); // missing name + invalid type + missing props
});
