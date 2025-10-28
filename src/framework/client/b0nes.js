
/**
 * b0nes Client Runtime - Simplified with unified exports
 */
(async function() {
    'use strict';

    //Store for data during runtime
    // How many components are active for the same b0nes dataset? 
    const instanceCleanup = new WeakMap();
    const componentLibrary = {};
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
                const dataset = el.dataset.b0nes.split(':');
                const [type, name] = dataset;
                
                if (dataset.length !== 2) {
                    console.warn(`[b0nes] Invalid data-b0nes format: ${el.dataset.b0nes}`);
                    return;
                }
                // Skip if already initialized
                if (el.dataset.b0nesInit === 'true') return;
                
                // Get component from registry
                if (componentLibrary[type] !== undefined && componentLibrary[type][name] !== undefined) {
                    const component = componentLibrary[type][name];
                
                    // Check if component has client behavior
                    if (!component.client) {
                        // Component is server-only, skip
                        return;
                    }
                    component.client(el);
                    el.dataset.b0nesInit = 'true';
                    this.activeInstances.add(el);
                    count++;
                } else {
                     try {
                        // Initialize client behavior
                        const module = import(`../../components/${type}/${name}/${type}.${name}.client.js`);
                        module.then(component => {
                            component.client(el);
                            el.dataset.b0nesInit = 'true';
                            this.activeInstances.add(el);
                            count++;
                        })
                    } catch (error) {
                        console.error(`[b0nes] Error initializing ${type}:`, error);
                    }
                    console.warn(`[b0nes] Component not found: ${type}/${name}`);
                    return;
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

    const initialize = () => window.b0nes.init();

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();