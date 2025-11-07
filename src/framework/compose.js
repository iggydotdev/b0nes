import {atoms} from '../components/atoms/index.js';
import {molecules} from '../components/molecules/index.js';
import {organisms} from '../components/organisms/index.js';

// Build component libraries
const componentLibrary = {
    atom: atoms,
    molecule: molecules,
    organism: organisms
};

export const compose = (components = []) => {
    return components.map(component => {
        const library = componentLibrary[component.type];
        const comp = library[component.name];
        
        if (!comp) {
            throw new Error(
                `Component "${component.name}" (${component.type}) not found`
            );
        }
        
        // Handle nested slots
        let slotContent = '';
        if (Array.isArray(component.props.slot)) {
            slotContent = component.props.slot.map(child => {
                if (typeof child === 'string') {
                    return child;
                }
                return compose([child]);
            }).join('\n');
        } else {
            slotContent = component.props.slot || '';
        }
        
        // Call the render function
        const renderFn = typeof comp === 'function' ? comp : comp.render;
        return renderFn({ ...component.props, slot: slotContent });
    }).join('\n');
};