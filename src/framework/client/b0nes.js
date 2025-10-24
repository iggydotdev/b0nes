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

    // ===== Built-in Component Behaviors =====

    /**
     * Tabs behavior - Interactive tabbed interface
     */
    window.b0nes.register('tabs', function(el) {
        const buttons = el.querySelectorAll('.tab-button');
        const panels = el.querySelectorAll('.tab-panel');

        buttons.forEach((button, index) => {
            button.addEventListener('click', () => {
                buttons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                panels.forEach(panel => {
                    panel.classList.remove('active');
                    panel.setAttribute('hidden', '');
                });
                button.classList.add('active');
                button.setAttribute('aria-selected', 'true');
                panels[index].classList.add('active');
                panels[index].removeAttribute('hidden');
            });
        });

        el.addEventListener('keydown', (e) => {
            const currentButton = document.activeElement;
            if (!currentButton.classList.contains('tab-button')) return;
            const currentIndex = Array.from(buttons).indexOf(currentButton);
            let nextIndex;
            switch (e.key) {
                case 'ArrowLeft':
                    nextIndex = currentIndex === 0 ? buttons.length - 1 : currentIndex - 1;
                    break;
                case 'ArrowRight':
                    nextIndex = currentIndex === buttons.length - 1 ? 0 : currentIndex + 1;
                    break;
                case 'Home':
                    nextIndex = 0;
                    break;
                case 'End':
                    nextIndex = buttons.length - 1;
                    break;
                default:
                    return;
            }
            e.preventDefault();
            buttons[nextIndex].focus();
            buttons[nextIndex].click();
        });
    });

    /**
     * Modal behavior - Overlay dialog
     */
    window.b0nes.register('modal', function(el) {
        const modalId = el.id;
        const closeModal = () => {
            el.setAttribute('aria-hidden', 'true');
            el.style.display = 'none';
            document.body.style.overflow = '';
        };
        const openModal = () => {
            el.setAttribute('aria-hidden', 'false');
            el.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            const firstFocusable = el.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 10);
            }
        };
        el.querySelectorAll('[data-modal-close]').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                closeModal();
            });
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && el.getAttribute('aria-hidden') === 'false') {
                closeModal();
            }
        });
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest(`[data-modal-open="${modalId}"]`);
            if (trigger) {
                e.preventDefault();
                openModal();
            }
        });
        el.style.display = 'none';
    });

    /**
     * Dropdown behavior - Click to toggle menu
     */
    window.b0nes.register('dropdown', function(el) {
        const trigger = el.querySelector('.dropdown-trigger');
        const menu = el.querySelector('.dropdown-menu');
        if (!trigger || !menu) return;
        let isOpen = false;
        const toggle = (e) => {
            e.preventDefault();
            e.stopPropagation();
            isOpen = !isOpen;
            if (isOpen) {
                menu.removeAttribute('hidden');
                trigger.setAttribute('aria-expanded', 'true');
            } else {
                menu.setAttribute('hidden', '');
                trigger.setAttribute('aria-expanded', 'false');
            }
        };
        const close = () => {
            if (isOpen) {
                isOpen = false;
                menu.setAttribute('hidden', '');
                trigger.setAttribute('aria-expanded', 'false');
            }
        };
        trigger.addEventListener('click', toggle);
        document.addEventListener('click', (e) => {
            if (!el.contains(e.target)) {
                close();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) {
                close();
                trigger.focus();
            }
        });
        menu.addEventListener('keydown', (e) => {
            const items = Array.from(menu.querySelectorAll('a, button'));
            const currentIndex = items.indexOf(document.activeElement);
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    const nextIndex = currentIndex + 1 < items.length ? currentIndex + 1 : 0;
                    items[nextIndex]?.focus();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : items.length - 1;
                    items[prevIndex]?.focus();
                    break;
            }
        });
    });

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.b0nes.init());
    } else {
        window.b0nes.init();
    }

})();
