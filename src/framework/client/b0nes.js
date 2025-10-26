   import { atoms } from '/components/atoms/index.js';
    import { molecules } from '/components/molecules/index.js';
    import { organisms } from '/components/organisms/index.js';
/**
 * b0nes Client Runtime - Simplified with unified exports
 */
(function() {
    'use strict';

    // Import component registry (this is where the magic happens!)
    // In production, this would be bundled
 
    const instanceCleanup = new WeakMap();
    const componentLibrary = { ...atoms, ...molecules, ...organisms };

    window.b0nes = {
        activeInstances: new Set(),
        instanceCleanup,

        /**
         * Initialize components - NO lazy loading needed!
         * Client behaviors are already in the bundle
         */
        init(root = document) {
            const elements = root.querySelectorAll('[data-b0nes]');
            let count = 0;

            elements.forEach(el => {
                const type = el.dataset.b0nes;
                
                // Skip if already initialized
                if (el.dataset.b0nesInit === 'true') return;
                
                // Get component from registry
                const component = componentLibrary[type];
                
                if (!component) {
                    console.warn(`[b0nes] Component not found: ${type}`);
                    return;
                }
                
                // Check if component has client behavior
                if (!component.client) {
                    // Component is server-only, skip
                    return;
                }
                
                try {
                    // Initialize client behavior
                    component.client(el);
                    el.dataset.b0nesInit = 'true';
                    this.activeInstances.add(el);
                    count++;
                } catch (error) {
                    console.error(`[b0nes] Error initializing ${type}:`, error);
                }
            });

            return count;
        },

        /**
         * Destroy component instance
         */
        destroy(el) {
            const cleanup = instanceCleanup.get(el);
            if (cleanup) {
                cleanup();
                instanceCleanup.delete(el);
                this.activeInstances.delete(el);
                delete el.dataset.b0nesInit;
                return true;
            }
            return false;
        },

        /**
         * Destroy all components
         */
        destroyAll() {
            let count = 0;
            this.activeInstances.forEach(el => {
                if (this.destroy(el)) count++;
            });
            return count;
        }
    };

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.b0nes.init());
    } else {
        window.b0nes.init();
    }
})();