import { processSlotTrusted } from '../../utils/processSlot.js';
import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { validateProps, validatePropTypes } from '../../utils/componentError.js';
import { attrsToString } from '../../utils/attrsToString.js';
import { box } from '../../atoms/index.js';


export const spa = ({
    slot,
    attrs = '',
    className = ''
}) => {
    // Validate required props
    validateProps(
        { slot },
        ['slot'],
        { componentName: 'spa', componentType: 'organism' }
    );
    
    // Validate prop types
    validatePropTypes(
        { className },
        { 
            className: 'string'
        },
        { componentName: 'spa', componentType: 'organism' }
    );
    
    // Validate slot is not empty
    if ((typeof slot === 'string' && slot.trim().length === 0) || 
        (Array.isArray(slot) && slot.length === 0)) {
        console.warn(
            `[b0nes Warning] SPA has empty content. `
        );
    }
       
    // Process attributes (supports string or object)
    const attrsStr = attrsToString(attrs);
    
    // Normalize classes - hero class plus any custom classes
    const classes = normalizeClasses(['spa', className]);
    
    // Process slot content
    const slotContent = processSlotTrusted(slot);
    
    // Combine all attributes for box
    const boxAttrs = `data-b0nes='organisms:spa'${attrsStr}`.trim();
    
    // Use box component as the base
    return box({
        is: 'div',
        className: classes,
        attrs: boxAttrs,
        slot: slotContent
    });
};
