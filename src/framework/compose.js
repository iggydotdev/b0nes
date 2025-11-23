import library from '../components/library.js';

// Build component libraries
const componentLibrary = {
    atom: library.atoms,
    molecule: library.molecules,
    organism: library.organisms
};

export const compose = (components = []) => {
    return components.map(component => {
        const lib = componentLibrary[component.type];
        const comp = lib[component.name];
        
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