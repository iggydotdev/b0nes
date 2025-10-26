import {atoms} from '../components/atoms/index.js';
import {molecules} from '../components/molecules/index.js';
import {organisms} from '../components/organisms/index.js';


// // Registry sets to keep track of components
// const atomsRegistry = new Map();
// const moleculesRegistry = new Map();
// const organismsRegistry = new Map();

// Object.entries(atoms).forEach(([name, fn]) => atomsRegistry.set(name, fn));
// Object.entries(molecules).forEach(([name, fn]) => moleculesRegistry.set(name, fn));
// Object.entries(organisms).forEach(([name, fn]) => organismsRegistry.set(name, fn));

// const renderComponent = (component, matchedComponent) => {
//     if (matchedComponent) { 
//         let slotContent = ''; 
//         if (Array.isArray(component.props.slot)) {
//             if (component.props.slot.length === 1 && typeof component.props.slot[0] === 'string') {
//                 slotContent+=(component.props.slot[0]);
//             } else {
//                 slotContent+=(component.props.slot.map((child)=>{
//                     if (typeof child === 'string') {
//                         return child;
//                     }
                    
//                     return compose([child]);
//                 }).join('\n    '));
//             }
//         } else {
//             slotContent+=(component.props.slot);
//         }
//         component.props.slot = slotContent;
//         return matchedComponent(component.props);    
//     } else {
//         throw new Error(`Component "${component.name}" (${component.type}) not found in library.`);
//     }
// }


// export const compose = (components = []) => {
//     return components.map(component => {
//         let matchedComponent;
//         component.type = component.type.toLowerCase();
//         if (component.type === 'organism') {
//             matchedComponent = organisms[component.name];
//         } else if (component.type === 'molecule') {
//             // lets test this
//             if (component.name === 'tabs') {
//                 matchedComponent = molecules['tabs'].render;
//             } else {
//                 matchedComponent = molecules[component.name];
//             }
//         } else {
//             // component.type === 'atom'
//             matchedComponent = atoms[component.name];
//         }
//         return renderComponent(component, matchedComponent);
//     }).join('\n    ');
// }

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