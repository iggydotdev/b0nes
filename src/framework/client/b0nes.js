/**
 * b0nes Client-Side Runtime
 * Provides interactive behaviors for server-rendered components
 * Zero dependencies, vanilla JavaScript
 */

(function() {
    'use strict';

    /**
     * Main b0nes singleton
     * @namespace
     */
    window.b0nes = {
        /**
         * Registry of component behaviors
         * @type {Object.<string, Function>}
         */
        behaviors: {},

        /**
         * Register a component behavior
         * @param {string} name - Component name (matches data-b0nes attribute)
         * @param {Function} behavior - Function that receives DOM element and adds interactivity
         */
        register(name, behavior) {
            this.behaviors[name] = behavior;
        },

        /**
         * Initialize all components on the page
         * Called automatically on DOMContentLoaded
         */
        init() {
            document.querySelectorAll('[data-b0nes]').forEach(el => {
                const type = el.dataset.b0nes;
                if (this.behaviors[type]) {
                    this.behaviors[type](el);
                }
            });
        },

        /**
         * Event delegation helper
         * @param {string} selector - CSS selector
         * @param {string} eventType - Event type (click, change, etc)
         * @param {Function} handler - Event handler
         */
        on(selector, eventType, handler) {
            document.addEventListener(eventType, (e) => {
                const target = e.target.closest(selector);
                if (target) {
                    handler.call(target, e);
                }
            });
        },

        /**
         * Find closest parent with data attribute
         * @param {Element} el - Starting element
         * @param {string} attr - Data attribute name (without 'data-' prefix)
         * @returns {Element|null}
         */
        closest(el, attr) {
            return el.closest(`[data-${attr}]`);
        }
    };

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.b0nes.init());
    } else {
        window.b0nes.init();
    }

})();
