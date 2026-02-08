import { describe, it, assert } from '../../framework/test/runner.js';
import { attrsToString } from './attrsToString.js';

describe('attrsToString', () => {

    // ── Falsy / empty inputs ──────────────────────────────────

    it('returns empty string for empty string', () => {
        assert.equal(attrsToString(''), '');
    });

    it('returns empty string for null', () => {
        assert.equal(attrsToString(null), '');
    });

    it('returns empty string for undefined', () => {
        assert.equal(attrsToString(undefined), '');
    });

    it('returns empty string for empty object', () => {
        assert.equal(attrsToString({}), '');
    });

    // ── Legacy string pass-through ────────────────────────────

    it('passes through a non-empty string with leading space', () => {
        assert.equal(attrsToString('id="main" disabled'), ' id="main" disabled');
    });

    it('passes through a string with data attributes', () => {
        assert.equal(
            attrsToString('data-b0nes="atoms:button"'),
            ' data-b0nes="atoms:button"'
        );
    });

    // ── Object form ───────────────────────────────────────────

    it('serializes string values with escaping', () => {
        const result = attrsToString({ id: 'main-hero' });
        assert.equal(result, ' id="main-hero"');
    });

    it('serializes multiple key-value pairs', () => {
        const result = attrsToString({ id: 'card', role: 'article' });
        assert.equal(result, ' id="card" role="article"');
    });

    it('serializes boolean true as valueless attribute', () => {
        const result = attrsToString({ disabled: true });
        assert.equal(result, ' disabled');
    });

    it('omits boolean false values', () => {
        const result = attrsToString({ disabled: false, id: 'test' });
        assert.equal(result, ' id="test"');
    });

    it('omits null values', () => {
        const result = attrsToString({ 'data-x': null, id: 'ok' });
        assert.equal(result, ' id="ok"');
    });

    it('omits undefined values', () => {
        const result = attrsToString({ 'data-x': undefined, id: 'ok' });
        assert.equal(result, ' id="ok"');
    });

    it('serializes number values', () => {
        const result = attrsToString({ tabindex: 0, 'data-count': 42 });
        assert.equal(result, ' tabindex="0" data-count="42"');
    });

    // ── XSS prevention ────────────────────────────────────────

    it('escapes HTML special characters in values', () => {
        const result = attrsToString({ 'data-label': '<script>alert("xss")</script>' });
        // escapeAttr should escape <, >, ", etc.
        assert.ok(!result.includes('<script>'), 'should escape script tags');
        assert.ok(result.includes('&lt;'), 'should contain escaped <');
    });

    it('escapes double quotes in values', () => {
        const result = attrsToString({ title: 'He said "hello"' });
        assert.ok(!result.includes('"hello"'), 'should escape inner quotes');
        assert.ok(result.includes('&quot;'), 'should contain escaped quotes');
    });

    it('skips invalid attribute names', () => {
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

    it('handles a realistic mixed attrs object', () => {
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

    it('handles data-* attributes', () => {
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
