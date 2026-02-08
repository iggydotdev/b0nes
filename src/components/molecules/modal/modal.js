import { processSlot } from '../../utils/processSlot.js';
import { attrsToString } from '../../utils/attrsToString.js';

/**
 * Modal component - Overlay dialog
 * Requires b0nes.js for client-side interactivity
 * 
 * @param {Object} props
 * @param {string} props.id - Unique modal ID
 * @param {string} [props.title] - Modal title
 * @param {string|Array} [props.slot] - Modal content
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.attrs] - Additional HTML attributes
 * @returns {string} HTML string
 * 
 * @example
 * modal({
 *   id: 'my-modal',
 *   title: 'Welcome',
 *   slot: '<p>Modal content here</p>'
 * })
 */
export const modal = ({ id, title, slot, className, attrs }) => {
    if (!id) {
        console.warn('[b0nes] Modal requires an id prop');
        return '';
    }

    const attrsStr = attrsToString(attrs);
    className = className ? ` ${className}` : '';
    const content = processSlot(slot) ?? '';
    const titleHtml = title ? `<h2 class="modal-title">${title}</h2>` : '';

    return `<div class="modal${className}" data-b0nes="molecules:modal" id="${id}" aria-hidden="true" role="dialog" aria-modal="true"${attrsStr}>
    <div class="modal-overlay" data-modal-close></div>
    <div class="modal-content">
        <button class="modal-close" data-modal-close aria-label="Close modal">&times;</button>
        ${titleHtml}
        <div class="modal-body">
            ${content}
        </div>
    </div>
</div>`;
};
