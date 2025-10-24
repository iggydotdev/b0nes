import { processSlot } from '../../utils/processSlot.js';

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
export const tabs = ({ tabs = [], className, attrs }) => {
    if (!Array.isArray(tabs) || tabs.length === 0) {
        return '';
    }

    attrs = attrs ? ` ${attrs}` : '';
    className = className ? ` ${className}` : '';

    // Generate tab buttons
    const tabButtons = tabs.map((tab, index) => {
        const activeClass = index === 0 ? ' active' : '';
        const ariaSelected = index === 0 ? 'true' : 'false';
        return `<button 
            class="tab-button${activeClass}" 
            role="tab" 
            aria-selected="${ariaSelected}"
            aria-controls="tab-panel-${index}"
            data-tab-index="${index}"
        >${tab.label}</button>`;
    }).join('');

    // Generate tab panels
    const tabPanels = tabs.map((tab, index) => {
        const activeClass = index === 0 ? ' active' : '';
        const hidden = index === 0 ? '' : ' hidden';
        const content = processSlot(tab.content) ?? '';
        return `<div 
            class="tab-panel${activeClass}" 
            role="tabpanel" 
            id="tab-panel-${index}"
            ${hidden}
        >${content}</div>`;
    }).join('');

    return `<div class="tabs${className}" data-b0nes="tabs" role="tablist"${attrs}>
    <div class="tab-buttons">
        ${tabButtons}
    </div>
    <div class="tab-panels">
        ${tabPanels}
    </div>
</div>`;
};
