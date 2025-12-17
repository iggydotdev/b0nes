// src/framework/client/compose.js
const componentCache = new Map();

/**
 * Client-side compose with dynamic imports
 * Only loads components when they're actually used
 */
export const compose = async (components = []) => {
    const results = await Promise.all(
        components.map(async (component) => {
            if (!component || typeof component !== 'object') {
                return '';
            }

            const { type, name, props = {} } = component;

            if (!type || !name) {
                return '';
            }

            // Check cache first
            const cacheKey = `${type}/${name}`;
            if (!componentCache.has(cacheKey)) {
                try {
                    // Dynamic import the component
                    console.log(`[compose] Loading component: /components/${type}s/${name}/index.js`);
                    const module = await import(`/components/${type}s/${name}/index.js`);
                    componentCache.set(cacheKey, module.default || module[name]);
                } catch (error) {
                    console.error(`[compose] Failed to load ${cacheKey}:`, error);
                    return `<!-- Component ${cacheKey} failed to load -->`;
                }
            }

            const comp = componentCache.get(cacheKey);

            // Handle nested slots recursively
            let slotContent = '';
            if (props.slot !== undefined && props.slot !== null) {
                slotContent = await composeSlot(props.slot);
            }

            // Render the component
            try {
                const renderFn = typeof comp === 'function' ? comp : comp?.render;
                return renderFn({ ...props, slot: slotContent });
            } catch (error) {
                console.error(`[compose] Render error for ${cacheKey}:`, error);
                return `<!-- Component ${cacheKey} render failed -->`;
            }
        })
    );

    return results.filter(Boolean).join('\n');
};

async function composeSlot(slot) {
    if (typeof slot === 'string') {
        return slot;
    }

    if (!Array.isArray(slot)) {
        return '';
    }

    const results = await Promise.all(
        slot.map(async (child) => {
            if (typeof child === 'string') {
                return child;
            }
            if (typeof child === 'object' && child !== null) {
                return await compose([child]);
            }
            return '';
        })
    );

    return results.filter(Boolean).join('\n');
}