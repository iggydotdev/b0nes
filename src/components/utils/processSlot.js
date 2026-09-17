import { content, html } from './html.js';

/** Plain strings are text; component results and { html } are explicit markup. */
export const processSlot = (slot, { escape = true, trim = false } = {}) => {
    const result = escape ? content(slot) : String(slot ?? '');
    return trim ? result.trim() : result;
};
/** Legacy explicit trust helper. Components use processSlot() instead. */
export const processSlotTrusted = slot => String(html(String(slot ?? '')));
export const processSlotUser = slot => content(String(slot ?? ''));
