import { processSlot } from '../../utils/processSlot.js';
import { attrsToString } from '../../utils/attrsToString.js';

/**
 * Dropdown component - Click to toggle menu
 * Requires b0nes.js for client-side interactivity
 * 
 * @param {Object} props
 * @param {string|Array} props.trigger - Content for the trigger button
 * @param {string|Array} props.slot - Dropdown menu content
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.attrs] - Additional HTML attributes
 * @returns {string} HTML string
 * 
 * @example
 * dropdown({
 *   trigger: 'Menu',
 *   slot: '<a href="#">Item 1</a><a href="#">Item 2</a>'
 * })
 */
export const dropdown = ({ trigger, slot, className, attrs }) => {
    if (!trigger) {
        console.warn('[b0nes] Dropdown requires a trigger prop');
        return '';
    }

    const attrsStr = attrsToString(attrs);
    className = className ? ` ${className}` : '';
    const triggerContent = processSlot(trigger) ?? 'Dropdown';
    const menuContent = processSlot(slot) ?? '';

    // IMPORTANT: Add data-b0nes-type="molecule" to help runtime find the component
    return `<div class="dropdown${className}" data-b0nes="molecules:dropdown" data-b0nes-type="molecule"${attrsStr}>
    <button class="dropdown-trigger" aria-haspopup="true" aria-expanded="false">
        ${triggerContent}
    </button>
    <div class="dropdown-menu" hidden>
        ${menuContent}
    </div>
</div>`;
};
