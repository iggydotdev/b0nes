import { tabs } from './tabs.js';

export const test = () => {
    const testTabs = [
        { label: 'Tab 1', content: 'Content 1' },
        { label: 'Tab 2', content: 'Content 2' }
    ];
    
    const actual = tabs({ tabs: testTabs });
    const hasDataAttribute = actual.includes('data-b0nes="molecules:tabs"');
    const hasTabButtons = actual.includes('Tab 1') && actual.includes('Tab 2');
    const hasTabPanels = actual.includes('Content 1') && actual.includes('Content 2');
    const hasActiveClass = actual.includes('active');
    
    if (!hasDataAttribute || !hasTabButtons || !hasTabPanels || !hasActiveClass) {
        console.error({
            hasDataAttribute,
            hasTabButtons,
            hasTabPanels,
            hasActiveClass,
            actual
        });
        return false;
    }
    
    return true;
};
