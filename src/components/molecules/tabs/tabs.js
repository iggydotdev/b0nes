import { escapeAttr } from '../../utils/escapeAttr.js';
import { defineComponent } from '../../utils/html.js';
import { processSlot } from '../../utils/processSlot.js';
import { attrsToString } from '../../utils/attrsToString.js';

/**
 * Tabs component - Interactive tabbed interface
 * Requires b0nes.js for client-side interactivity
 * 
 * @param {Object} props
 * @param {Array} props.tabs - Array of tab objects: [{ label: 'Tab 1', content: '...' }]
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.attrs] - Additional HTML attributes
 * @returns {string} HTML string
 * 
 * @example
 * tabs({
 *   tabs: [
 *     { label: 'Home', content: '<p>Home content</p>' },
 *     { label: 'About', content: '<p>About content</p>' }
 *   ]
 * })
 */
export const tabs = defineComponent(({ tabs = [], className, attrs }) => {
    if (!Array.isArray(tabs) || tabs.length === 0) {
        return '';
    }

    const attrsStr = attrsToString(attrs);
    className = className ? ` ${escapeAttr(className)}` : '';

    // Generate tab buttons
    const tabButtons = tabs.map((tab, index) => {
        const activeClass = index === 0 ? ' active' : '';
        return `<button 
            class="tab-button${activeClass}" 
            type="button" disabled
            data-tab-index="${index}"
        >${processSlot(tab.label)}</button>`;
    }).join('');

    // Generate tab panels
    const tabPanels = tabs.map((tab, index) => {
        const activeClass = index === 0 ? ' active' : '';
        const content = processSlot(tab.content) ?? '';
        return `<div 
            class="tab-panel${activeClass}" 

        >${content}</div>`;
    }).join('');

    return `<div class="tabs${className}" data-b0nes="molecules:tabs"${attrsStr}>
    <div class="tab-buttons">
        ${tabButtons}
    </div>
    <div class="tab-panels">
        ${tabPanels}
    </div>
</div>`;
}, 'molecule:tabs');
