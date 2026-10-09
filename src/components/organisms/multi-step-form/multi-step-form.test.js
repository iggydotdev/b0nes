import test from 'node:test';
import assert from 'node:assert/strict';
import { multiStepForm } from './multi-step-form.js';

test('multi-step form renders a complete native fallback with labelled controls', () => {
    const output = String(multiStepForm({ action: '/submit?label=a&b', method: 'post', attrs: { 'aria-label': 'Contact details' } }));
    assert.match(output, /^<form\b/);
    assert.match(output, /action="\/submit\?label=a&amp;b"/);
    assert.match(output, /method="post"/);
    assert.equal((output.match(/<fieldset\b/g) || []).length, 3);
    assert.equal((output.match(/<label\b/g) || []).length, 3);
    for (const name of ['name', 'email', 'age']) assert.match(output, new RegExp(`name="${name}"`));
    assert.equal((output.match(/<fieldset[^>]*hidden/g) || []).length, 0, 'all fields must be reachable before enhancement');
    assert.match(output, /<button[^>]*type="submit"[^>]*>Submit<\/button>/);
    assert.match(output, /role="status" aria-live="polite"/);
    assert.doesNotMatch(output, /\bid=/, 'multiple cached instances need no duplicate IDs');
    assert.doesNotMatch(output, /novalidate/);
});

test('form endpoint and method are validated by the renderer', () => {
    assert.throws(() => multiStepForm({ action: 'javascript:alert(1)' }), /Unsupported URL protocol/);
    assert.throws(() => multiStepForm({ method: 'put' }), /Form method must be get or post/);
    assert.match(String(multiStepForm({ attrs: 'id="custom-form"' })), /id="custom-form"/);
});
