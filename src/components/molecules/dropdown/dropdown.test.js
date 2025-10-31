import dropdown from './index.js';

export const test = () => {
    const actual = dropdown({ trigger: 'Click me', slot: '<a href="#">Item</a>' });
    
    const hasDataAttribute = actual.includes('data-b0nes="molecules:dropdown"');
    const hasTrigger = actual.includes('Click me');
    const hasMenu = actual.includes('dropdown-menu');
    const hasHidden = actual.includes('hidden');
    
    if (!hasDataAttribute || !hasTrigger || !hasMenu || !hasHidden) {
        console.error({
            hasDataAttribute,
            hasTrigger,
            hasMenu,
            hasHidden,
            actual
        });
        return false;
    }
    
    return true;
};
