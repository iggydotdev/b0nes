import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { processSlotTrusted } from '../../utils/processSlot.js';

export const badge = ({ slot, className, attrs }) => {
    if (!slot) {
        console.warn('[b0nes] Badge requires a slot prop');
        return '';
    }
  // Process attributes
    attrs = attrs ? ` ${attrs}` : '';
    
    // Normalize and escape classes
    const classes = normalizeClasses(['badge', className]);

    // Process slot content (trust component-rendered HTML)
    slot = processSlotTrusted(slot);
    return `<span class="${classes}"${attrs}>${slot}</span>`;
};
