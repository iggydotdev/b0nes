import test from 'node:test';
import assert from 'node:assert';
import { tabs } from './tabs.js';

test('tabs rendering', () => {
    const testTabs = [
        { label: 'Tab 1', content: 'Content 1' },
        { label: 'Tab 2', content: 'Content 2' }
    ];
    
    const actual = tabs({ tabs: testTabs });
    assert.ok(actual.includes('data-b0nes="molecules:tabs"'), 'Should have data-b0nes attribute');
    assert.ok(actual.includes('Tab 1') && actual.includes('Tab 2'), 'Should include tab labels');
    assert.ok(actual.includes('Content 1') && actual.includes('Content 2'), 'Should include tab contents');
    assert.ok(actual.includes('active'), 'Should have at least one active tab');
});


test('unenhanced tabs keep every panel readable and have no duplicate IDs', () => {
    const html = tabs({ tabs: [{ label: 'One', content: 'First' }, { label: 'Two', content: 'Second' }] });
    assert.ok(!html.includes(' hidden'));
    assert.ok(!html.includes('role="tab'));
    assert.ok(!html.includes(' id="'));
    assert.equal((html.match(/type="button" disabled/g) || []).length, 2);
});
