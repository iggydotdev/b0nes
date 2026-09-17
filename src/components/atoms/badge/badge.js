import { defineComponent } from '../../utils/html.js';
import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { processSlot } from '../../utils/processSlot.js';
import { attrsToString } from '../../utils/attrsToString.js';

export const badge = defineComponent(({ slot, className, attrs }) => {
    if (!slot) {
        console.warn('[b0nes] Badge requires a slot prop');
        return '';
    }
  // Process attributes (supports string or object)
    const attrsStr = attrsToString(attrs);
    
    // Normalize and escape classes
    const classes = normalizeClasses(['badge', className]);

    // Process slot content (trust component-rendered HTML)
    slot = processSlot(slot);
    return `<span class="${classes}"${attrsStr}>${slot}</span>`;
}, 'atom:badge');
