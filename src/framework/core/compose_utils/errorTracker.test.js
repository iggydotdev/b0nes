import test from 'node:test';
import assert from 'node:assert';
import { createErrorTracker } from './errorTracker.js';

test('errorTracker - track adds error with timestamp', () => {
    const tracker = createErrorTracker();
    tracker.track({ component: 'button', type: 'render', message: 'fail' });
    const errors = tracker.getErrors();
    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].component, 'button');
    assert.strictEqual(errors[0].type, 'render');
    assert.ok(errors[0].timestamp > 0);
});

test('errorTracker - getErrors returns a copy not a reference', () => {
    const tracker = createErrorTracker();
    tracker.track({ component: 'a', message: 'x' });
    const errors1 = tracker.getErrors();
    errors1.push({ fake: true });
    const errors2 = tracker.getErrors();
    assert.strictEqual(errors2.length, 1);
});

test('errorTracker - respects maxErrors limit', () => {
    const tracker = createErrorTracker(3);
    tracker.track({ component: 'a', message: '1' });
    tracker.track({ component: 'b', message: '2' });
    tracker.track({ component: 'c', message: '3' });
    tracker.track({ component: 'd', message: '4' });
    const errors = tracker.getErrors();
    assert.strictEqual(errors.length, 3);
    assert.strictEqual(errors[0].component, 'b'); // oldest was evicted
    assert.strictEqual(errors[2].component, 'd');
});

test('errorTracker - getErrorsByComponent filters correctly', () => {
    const tracker = createErrorTracker();
    tracker.track({ component: 'button', message: 'err1' });
    tracker.track({ component: 'card', message: 'err2' });
    tracker.track({ component: 'button', message: 'err3' });
    const buttonErrors = tracker.getErrorsByComponent('button');
    assert.strictEqual(buttonErrors.length, 2);
    assert.ok(buttonErrors.every(e => e.component === 'button'));
});

test('errorTracker - clear removes all errors', () => {
    const tracker = createErrorTracker();
    tracker.track({ component: 'x', message: 'y' });
    tracker.track({ component: 'x', message: 'z' });
    tracker.clear();
    assert.strictEqual(tracker.getErrors().length, 0);
});

test('errorTracker - getStats groups errors by type', () => {
    const tracker = createErrorTracker();
    tracker.track({ type: 'render', message: 'a' });
    tracker.track({ type: 'render', message: 'b' });
    tracker.track({ type: 'validation', message: 'c' });
    tracker.track({ message: 'd' }); // no type -> 'unknown'
    const stats = tracker.getStats();
    assert.strictEqual(stats.total, 4);
    assert.strictEqual(stats.byType.render, 2);
    assert.strictEqual(stats.byType.validation, 1);
    assert.strictEqual(stats.byType.unknown, 1);
});
