/**
 * b0nes Client Runtime - Memory Leak Fix (Minimal Edition)
 * We ONLY fix what's actually broken: event listeners and timers
 */
(async function() {
    'use strict';

    // Centralized cleanup tracking
    const instanceCleanup = new WeakMap();
    const behaviorModules = new Map();
    
    // Track event listeners for cleanup
    const globalListeners = new Map(); // element -> [{type, listener, options}]
    
    /**
     * Safe addEventListener wrapper that tracks for cleanup
     */
    function addTrackedEventListener(element, type, listener, options = {}) {
        if (!element || typeof listener !== 'function') {
            console.warn('[b0nes] Invalid addEventListener call');
            return () => {};
        }
        
        element.addEventListener(type, listener, options);
        
        // Track this listener
        if (!globalListeners.has(element)) {
            globalListeners.set(element, []);
        }
        globalListeners.get(element).push({ type, listener, options });
        
        // Return cleanup function
        return () => {
            element.removeEventListener(type, listener, options);
            const listeners = globalListeners.get(element);
            if (listeners) {
                const index = listeners.findIndex(
                    l => l.type === type && l.listener === listener
                );
                if (index !== -1) listeners.splice(index, 1);
            }
        };
    }
    
    
    /**
     * Cleanup all resources for an element
     */
    function cleanupElement(element) {
        let cleanedCount = 0;
        
        // 1. Call component's cleanup function if it exists
        const componentCleanup = instanceCleanup.get(element);
        if (componentCleanup) {
            try {
                componentCleanup();
                instanceCleanup.delete(element);
                cleanedCount++;
            } catch (error) {
                console.error('[b0nes] Component cleanup error:', error);
            }
        }
        
        // 2. Remove tracked event listeners
        const listeners = globalListeners.get(element);
        if (listeners && listeners.length > 0) {
            listeners.forEach(({ type, listener, options }) => {
                element.removeEventListener(type, listener, options);
            });
            globalListeners.delete(element);
            cleanedCount += listeners.length;
        }
        
        return cleanedCount;
    }
    
    window.b0nes = {
        activeInstances: new Set(),
        instanceCleanup,
        behaviors: {},
        
        // Expose safe utilities for component developers
        utils: {
            addEventListener: addTrackedEventListener,

        },
        
        /**
         * Register a behavior
         */
        register(name, behavior) {
            this.behaviors[name] = behavior;
            console.log(`[b0nes] Registered: ${name}`);
        },

        /**
         * Initialize components with proper cleanup tracking
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
                if (this.behaviors[name] !== undefined) {
                    try {
                        // Call behavior and get cleanup function
                        const cleanup = this.behaviors[name](el);
                        
                        // Store cleanup function if returned
                        if (typeof cleanup === 'function') {
                            instanceCleanup.set(el, cleanup);
                        }
                        
                        el.dataset.b0nesInit = 'true';
                        this.activeInstances.add(el);
                        count++;
                    } catch (error) {
                        console.error(`[b0nes] Error initializing ${type}:${name}`, error);
                    }
                } else {
                    // Lazy load component
                    const behaviorPath = `/assets/js/behaviors/${type}/${name}/${type}.${name}.client.js`;
                    
                    import(behaviorPath)
                        .then(component => {
                            this.register(name, component.client);
                            console.log(`[b0nes] Loaded component: ${type}/${name}`);
                            
                            try {
                                const cleanup = this.behaviors[name](el);
                                
                                if (typeof cleanup === 'function') {
                                    instanceCleanup.set(el, cleanup);
                                }
                                
                                el.dataset.b0nesInit = 'true';
                                this.activeInstances.add(el);
                                count++;
                            } catch (error) {
                                console.error(`[b0nes] Error initializing ${type}:${name}`, error);
                            }
                        })
                        .catch(error => {
                            // Fallback to dev path if production path fails
                            console.warn(`[b0nes] Production path failed, trying dev path...`);
                            const devPath = `../../components/${type}/${name}/${type}.${name}.client.js`;
                            
                            import(devPath)
                                .then(component => {
                                    this.register(name, component.client);
                                    console.log(`[b0nes] Loaded component (dev): ${type}/${name}`);
                                    
                                    try {
                                        const cleanup = this.behaviors[name](el);
                                        if (typeof cleanup === 'function') {
                                            instanceCleanup.set(el, cleanup);
                                        }
                                        el.dataset.b0nesInit = 'true';
                                        this.activeInstances.add(el);
                                        count++;
                                    } catch (e) {
                                        console.error(`[b0nes] Error initializing ${type}:${name}`, e);
                                    }
                                })
                                .catch(devError => {
                                    console.error(`[b0nes] Failed to load ${type}/${name} from either path:`, error, devError);
                                });
                        });
                }
            });

            return count;
        },

        /**
         * Destroy component instance with full cleanup
         */
        destroy(el) {
            if (!el) {
                console.warn('[b0nes] destroy() called with invalid element');
                return false;
            }
            
            const cleanedCount = cleanupElement(el);
            
            if (cleanedCount > 0) {
                this.activeInstances.delete(el);
                delete el.dataset.b0nesInit;
                console.log(`[b0nes] Destroyed: ${el.dataset.b0nes} (${cleanedCount} resources)`);
                return true;
            }
            
            return false;
        },

        /**
         * Destroy all components
         */
        destroyAll() {
            let count = 0;
            const instances = Array.from(this.activeInstances);
            
            instances.forEach(el => {
                if (this.destroy(el)) count++;
            });
            
            console.log(`[b0nes] Destroyed all: ${count} components`);
            return count;
        },
        
        /**
         * Get memory stats (useful for debugging)
         */
        getMemoryStats() {
            return {
                activeInstances: this.activeInstances.size,
                trackedListeners: Array.from(globalListeners.values())
                    .reduce((sum, listeners) => sum + listeners.length, 0),
                registeredBehaviors: Object.keys(this.behaviors).length
            };
        }
    };

    const initialize = () => window.b0nes.init();

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        console.log('[b0nes] Page unloading, cleaning up...');
        window.b0nes.destroyAll();
    });
})();