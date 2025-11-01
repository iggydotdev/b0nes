import { badge } from './badge.js'
export const test = () => {
    const actual = badge({ label: 'New', className: 'badge-class', attrs: 'data-badge="true"' });
    
    const hasLabel = actual.includes('New');
    const hasClass = actual.includes('badge-class');
    const hasDataAttribute = actual.includes('data-badge="true"');
    
    if (!hasLabel || !hasClass || !hasDataAttribute) {
        console.error({
            hasLabel,
            hasClass,
            hasDataAttribute,
            actual
        });
        return false;
    }
    
    return true;
};
