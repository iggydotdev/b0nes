import test from 'node:test';
import assert from 'node:assert';
import dropdown from './index.js';

test('dropdown rendering', () => {
    const actual = dropdown({ trigger: 'Click me', slot: '<a href="#">Item</a>' });
    
    assert.ok(actual.includes('data-b0nes="molecules:dropdown"'), 'Should have data-b0nes attribute');
    assert.ok(actual.includes('Click me'), 'Should include trigger text');
    assert.ok(actual.includes('dropdown-menu'), 'Should include dropdown menu class');
    assert.ok(actual.includes('hidden'), 'Should be hidden by default');
});
