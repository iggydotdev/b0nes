import test from 'node:test';
import assert from 'node:assert';
import { button } from '../../atoms/index.js';
import modal from './index.js';

test('modal rendering', () => {
    const actualModal = modal({ id: 'test-modal', title: 'Test', slot: 'Content' });
    const actualTrigger = button({ attrs: 'data-modal-open="test-modal"', slot: 'Open' });
    
    assert.ok(actualModal.includes('data-b0nes="molecules:modal"'), 'Modal should have data-b0nes attribute');
    assert.ok(actualModal.includes('id="test-modal"'), 'Modal should have correct ID');
    assert.ok(actualModal.includes('Test'), 'Modal should include title');
    assert.ok(actualTrigger.includes('data-modal-open="test-modal"'), 'Trigger should have correct data attribute');
});


test('modal has an accessible name, fallback focus target and non-submit close button', () => {
    const html = modal({ id: 'named', title: 'Settings', slot: 'Body' });
    assert.ok(html.includes('aria-labelledby="named-title"'));
    assert.ok(html.includes('id="named-title"'));
    assert.ok(html.includes('tabindex="-1"'));
    assert.ok(html.includes('<button type="button"'));
    assert.ok(modal({ id: 'untitled', slot: 'Body' }).includes('aria-label="Dialog"'));
});
