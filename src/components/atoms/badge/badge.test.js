import test from 'node:test';
import assert from 'node:assert';
import { badge } from './badge.js';

test('badge rendering', () => {
    const actual = badge({ slot: ['New'], className: 'badge-class', attrs: 'data-badge="true"' });
    
    assert.ok(actual.includes('New'), 'Should include slot content');
    assert.ok(actual.includes('badge-class'), 'Should include custom class');
    assert.ok(actual.includes('data-badge="true"'), 'Should include custom attributes');
});
