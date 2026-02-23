import { describe, test} from 'node:test';
import assert from 'node:assert'
import { attrsToString } from './attrsToString.js';

describe('attrsToString', () => {

    // ── Falsy / empty inputs ──────────────────────────────────

    test('returns empty string for empty string', () => {
        assert.equal(attrsToString(''), '');
    });

    test('returns empty string for null', () => {
        assert.equal(attrsToString(null), '');
    });

    test('returns empty string for undefined', () => {
        assert.equal(attrsToString(undefined), '');
    });

    test('returns empty string for empty object', () => {
        assert.equal(attrsToString({}), '');
    });

    // ── Legacy string pass-through ────────────────────────────

    test('passes through a non-empty string with leading space', () => {
        assert.equal(attrsToString('id="main" disabled'), ' id="main" disabled');
    });

    test('passes through a string with data attributes', () => {
        assert.equal(
            attrsToString('data-b0nes="atoms:button"'),
            ' data-b0nes="atoms:button"'
        );
    });

    // ── Object form ───────────────────────────────────────────

    test('serializes string values with escaping', () => {
        const result = attrsToString({ id: 'main-hero' });
        assert.equal(result, ' id="main-hero"');
    });

    test('serializes multiple key-value pairs', () => {
        const result = attrsToString({ id: 'card', role: 'article' });
        assert.equal(result, ' id="card" role="article"');
    });

    test('serializes boolean true as valueless attribute', () => {
        const result = attrsToString({ disabled: true });
        assert.equal(result, ' disabled');
    });

    test('omits boolean false values', () => {
        const result = attrsToString({ disabled: false, id: 'test' });
        assert.equal(result, ' id="test"');
    });

    test('omits null values', () => {
        const result = attrsToString({ 'data-x': null, id: 'ok' });
        assert.equal(result, ' id="ok"');
    });

    test('omits undefined values', () => {
        const result = attrsToString({ 'data-x': undefined, id: 'ok' });
        assert.equal(result, ' id="ok"');
    });

    test('serializes number values', () => {
        const result = attrsToString({ tabindex: 0, 'data-count': 42 });
        assert.equal(result, ' tabindex="0" data-count="42"');
    });

    // ── XSS prevention ────────────────────────────────────────

    test('escapes HTML special characters in values', () => {
        const result = attrsToString({ 'data-label': '<script>alert("xss")</script>' });
        // escapeAttr should escape <, >, ", etc.
        assert.ok(!result.includes('<script>'), 'should escape script tags');
        assert.ok(result.includes('&lt;'), 'should contain escaped <');
    });

    test('escapes double quotes in values', () => {
        const result = attrsToString({ title: 'He said "hello"' });
        assert.ok(!result.includes('"hello"'), 'should escape inner quotes');
        assert.ok(result.includes('&quot;'), 'should contain escaped quotes');
    });

    test('skips invalid attribute names', () => {
        // Capture warnings silently
        const origWarn = console.warn;
        let warned = false;
        console.warn = () => { warned = true; };

        const result = attrsToString({ '"><script>': 'evil', id: 'safe' });
        assert.equal(result, ' id="safe"');
        assert.ok(warned, 'should have warned about invalid attr name');

        console.warn = origWarn;
    });

    // ── Mixed boolean + string + number ───────────────────────

    test('handles a realistic mixed attrs object', () => {
        const result = attrsToString({
            id: 'form-progress',
            'aria-label': 'Form completion progress',
            disabled: false,
            open: true,
            tabindex: -1
        });
        assert.ok(result.includes('id="form-progress"'));
        assert.ok(result.includes('aria-label='));
        assert.ok(!result.includes('disabled'));
        assert.ok(result.includes('open'));
        assert.ok(result.includes('tabindex="-1"'));
    });

    // ── Data attributes ───────────────────────────────────────

    test('handles data-* attributes', () => {
        const result = attrsToString({
            'data-b0nes': 'organisms:spa',
            'data-action': 'next',
            'data-id': '123'
        });
        assert.ok(result.includes('data-b0nes="organisms:spa"'));
        assert.ok(result.includes('data-action="next"'));
        assert.ok(result.includes('data-id="123"'));
    });
});
