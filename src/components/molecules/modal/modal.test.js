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
