import { processSlotTrusted } from '../../utils/processSlot.js';
import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { validateProps, validatePropTypes } from '../../utils/componentError.js';
import { attrsToString } from '../../utils/attrsToString.js';

/**
 * Timeline component - a feed of posts with client-side like/retweet state.
 *
 * The organism itself is dumb: it just wraps whatever posts you compose
 * into its slot and tags itself for hydration. All the interactivity
 * (counter toggling) lives in client.js, driven by the b0nes Store.
 * Without JS, this renders as a perfectly readable static feed — the
 * counts just won't move. That's the deal with progressive enhancement.
 *
 * @param {Object} props
 * @param {string|Array} props.slot - composed post elements
 * @param {string} [props.className]
 * @param {string} [props.attrs]
 */
export const timeline = ({ slot, attrs = '', className = '' }) => {
    validateProps({ slot }, ['slot'], { componentName: 'timeline', componentType: 'organism' });
    validatePropTypes({ className }, { className: 'string' }, { componentName: 'timeline', componentType: 'organism' });

    const attrsStr = attrsToString(attrs);
    const classes = normalizeClasses(['timeline', className]);
    const slotContent = processSlotTrusted(slot);

    return `<div class="${classes}" data-b0nes="organisms:timeline"${attrsStr}>${slotContent}</div>`;
};
