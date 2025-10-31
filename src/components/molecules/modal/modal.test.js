import { button } from '../../atoms/index.js';
import modal from './index.js';

export const test = () => {
    const actualModal = modal({ id: 'test-modal', title: 'Test', slot: 'Content' });
    const actualTrigger = button({ attrs: 'data-modal-open="test-modal"', slot: 'Open' });
    
    const hasModalDataAttr = actualModal.includes('data-b0nes="molecules:modal"');
    const hasModalId = actualModal.includes('id="test-modal"');
    const hasTitle = actualModal.includes('Test');
    const hasTriggerDataAttr = actualTrigger.includes('data-modal-open="test-modal"');
    
    if (!hasModalDataAttr || !hasModalId || !hasTitle || !hasTriggerDataAttr) {
        console.error({
            hasModalDataAttr,
            hasModalId,
            hasTitle,
            hasTriggerDataAttr,
            actualModal,
            actualTrigger
        });
        return false;
    }
    
    return true;
};
