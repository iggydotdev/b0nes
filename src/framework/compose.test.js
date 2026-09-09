import test from 'node:test';
import assert from 'node:assert';
import {
    compose,
    clearCompositionCache,
    getCompositionCacheSize,
    setErrorFallback,
    resetErrorFallback,
    clearErrors,
    getErrors
} from './core/compose.js';

test('compose - basic component composition', () => {
    clearCompositionCache();
    const result = compose([
        {
            type: 'atom',
            name: 'text',
            props: { is: 'p', slot: 'Hello' }
        }
    ]);
    assert.ok(result.includes('Hello'));
});

test('compose - missing component shows error fallback', () => {
    clearCompositionCache();
    const result = compose([
        {
            type: 'atom',
            name: 'nonexistent-component',
            props: {}
        }
    ]);
    assert.ok(result.includes('Component Error'));
    assert.ok(result.includes('ef4444'));
});

test('compose - caching works - same component rendered twice', () => {
    clearCompositionCache();
    const component = {
        type: 'atom',
        name: 'text',
        props: { is: 'p', slot: 'Cached' }
    };
    compose([component]);
    const sizeBefore = getCompositionCacheSize();
    compose([component]);
    const sizeAfter = getCompositionCacheSize();
    assert.strictEqual(sizeBefore, sizeAfter);
    assert.strictEqual(sizeBefore, 1);
});

test('compose - cache cleared successfully', () => {
    compose([{ type: 'atom', name: 'text', props: { is: 'p', slot: 'Test' } }]);
    clearCompositionCache();
    assert.strictEqual(getCompositionCacheSize(), 0);
});

test('compose - nested components compose correctly', () => {
    clearCompositionCache();
    const result = compose([
        {
            type: 'molecule',
            name: 'card',
            props: {
                slot: [
                    {
                        type: 'atom',
                        name: 'text',
                        props: { is: 'p', slot: 'Card content' }
                    }
                ]
            }
        }
    ]);
    assert.ok(result.includes('Card content'));
    assert.ok(result.includes('<p'));
    assert.ok(!result.includes('Component Error'));
});

test('compose - invalid component object returns empty string', () => {
    clearCompositionCache();
    const result = compose([null, undefined, { type: 'atom' }, {}]);
    assert.strictEqual(result, '');
});

// ── Escape-by-default contract ──────────────────────────────────────────

test('compose - plain text slots are escaped (XSS-safe)', () => {
    clearCompositionCache();
    const result = compose([
        {
            type: 'atom',
            name: 'text',
            props: {
                is: 'p',
                slot: '<img src=x onerror=alert(1)>'
            }
        }
    ]);
    // Must NOT contain a real <img> tag from user input
    assert.ok(!result.includes('<img src=x'), 'raw HTML must not appear');
    assert.ok(result.includes('&lt;img'), 'angle brackets must be escaped');
    assert.ok(result.includes('&gt;') || result.includes('onerror'), 'escaped payload still visible as text');
});

test('compose - nested component nodes still render real tags', () => {
    clearCompositionCache();
    const result = compose([
        {
            type: 'atom',
            name: 'button',
            props: {
                slot: [
                    {
                        type: 'atom',
                        name: 'text',
                        props: { is: 'span', slot: 'OK' }
                    }
                ]
            }
        }
    ]);
    // Nested component HTML must NOT be double-escaped
    assert.ok(result.includes('<button'), 'button tag must be real HTML');
    assert.ok(result.includes('<span'), 'nested span must be real HTML, not &lt;span&gt;');
    assert.ok(result.includes('OK'));
    assert.ok(!result.includes('&lt;span'), 'must not double-escape component HTML');
});

test('compose - mixed text + nested components escape only text', () => {
    clearCompositionCache();
    const result = compose([
        {
            type: 'atom',
            name: 'text',
            props: {
                is: 'p',
                slot: [
                    'Hello <world> ',
                    {
                        type: 'atom',
                        name: 'text',
                        props: { is: 'strong', slot: 'bold' }
                    }
                ]
            }
        }
    ]);
    assert.ok(result.includes('Hello &lt;world&gt;'), 'plain text escaped');
    assert.ok(result.includes('<strong'), 'nested component is real HTML');
    assert.ok(result.includes('bold'));
    assert.ok(!result.includes('&lt;strong'), 'no double-escape');
});

test('compose - explicit { html } opt-in inserts raw HTML', () => {
    clearCompositionCache();
    const result = compose([
        {
            type: 'atom',
            name: 'text',
            props: {
                is: 'div',
                slot: [
                    { html: '<em class="raw">trusted</em>' }
                ]
            }
        }
    ]);
    assert.ok(result.includes('<em class="raw">trusted</em>'), 'raw HTML opt-in must pass through');
    assert.ok(!result.includes('&lt;em'), 'must not escape { html } content');
});

test('compose - {{bind}} markers preserved after escape', () => {
    clearCompositionCache();
    const result = compose([
        {
            type: 'atom',
            name: 'text',
            props: {
                is: 'p',
                slot: 'Hi <b>{{user.name}}</b>'
            }
        }
    ]);
    // Text around binds is escaped; bind wrapper is framework HTML
    assert.ok(result.includes('data-b0nes-bind="user.name"'), 'bind attribute present');
    assert.ok(result.includes('&lt;b&gt;') || result.includes('Hi &lt;b&gt;'), 'user HTML escaped');
    assert.ok(result.includes('<span data-b0nes-bind'), 'bind span is real HTML');
});

// ── setErrorFallback ────────────────────────────────────────────────────

test('compose - setErrorFallback overrides error UI', () => {
    clearCompositionCache();
    clearErrors();

    setErrorFallback((error, component) => {
        return `CUSTOM:${component.type}/${component.name}:${error.message}`;
    });

    try {
        const result = compose([
            {
                type: 'atom',
                name: 'does-not-exist',
                props: {}
            }
        ]);
        assert.ok(result.includes('CUSTOM:atom/does-not-exist'));
        assert.ok(result.includes('Component not found'));
        assert.ok(!result.includes('ef4444'), 'default red box should not appear');
    } finally {
        resetErrorFallback();
    }
});

test('compose - resetErrorFallback restores default', () => {
    clearCompositionCache();
    setErrorFallback(() => 'CUSTOM_ONLY');
    resetErrorFallback();

    const result = compose([
        { type: 'atom', name: 'missing-again', props: {} }
    ]);
    assert.ok(result.includes('Component Error'));
    assert.ok(result.includes('ef4444'));
    assert.ok(!result.includes('CUSTOM_ONLY'));
});

// ── Path rewriting ──────────────────────────────────────────────────────

test('compose - rewrites relative asset paths with route context', () => {
    clearCompositionCache();
    const result = compose(
        [
            {
                type: 'atom',
                name: 'image',
                props: {
                    src: './qr-code.png',
                    alt: 'QR'
                }
            }
        ],
        {
            route: {
                pattern: { pathname: '/examples/talk/index.html' }
            }
        }
    );
    // ./qr-code.png under /examples/talk/ → /examples/talk/qr-code.png
    assert.ok(
        result.includes('src="/examples/talk/qr-code.png"') ||
        result.includes("src=\"/examples/talk/qr-code.png\""),
        `expected rewritten path, got: ${result}`
    );
    assert.ok(!result.includes('src="./qr-code.png"'), 'relative path must be rewritten');
});

test('compose - does not rewrite absolute paths', () => {
    clearCompositionCache();
    const result = compose(
        [
            {
                type: 'atom',
                name: 'image',
                props: {
                    src: '/images/logo.png',
                    alt: 'Logo'
                }
            }
        ],
        {
            route: {
                pattern: { pathname: '/examples/talk/index.html' }
            }
        }
    );
    assert.ok(result.includes('src="/images/logo.png"'));
});

// ── Named slots & Empty slot validation ─────────────────────────────────

test('compose - renders named slots with nested components (accordion, card)', () => {
    clearCompositionCache();
    const result = compose([
        {
            type: 'atom',
            name: 'accordion',
            props: {
                titleSlot: {
                    type: 'atom',
                    name: 'text',
                    props: { is: 'span', slot: 'FAQ Question' }
                },
                detailsSlot: {
                    type: 'atom',
                    name: 'text',
                    props: { is: 'p', slot: 'FAQ Answer' }
                }
            }
        }
    ]);

    assert.ok(result.includes('<details class="accordion">'));
    assert.ok(result.includes('<summary>'));
    assert.ok(result.includes('FAQ Question'));
    assert.ok(result.includes('FAQ Answer'));
    assert.ok(!result.includes('Component Error'));
});

test('compose - allows empty string for slot without throwing', () => {
    clearCompositionCache();
    const result = compose([
        {
            type: 'atom',
            name: 'text',
            props: { is: 'strong', slot: '', attrs: "data-field='name'" }
        }
    ]);

    assert.ok(result.includes('<strong'));
    assert.ok(result.includes("data-field='name'"));
    assert.ok(!result.includes('Component Error'));
});

