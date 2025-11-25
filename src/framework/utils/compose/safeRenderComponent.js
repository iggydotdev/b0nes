

import library from '../components/library.js';

// Build component libraries
const componentLibrary = {
    atom: library.atoms,
    molecule: library.molecules,
    organism: library.organisms
};

/**
 * Safe component renderer with error boundary
 */
function safeRenderComponent(component, options = {}) {
    const { cache = true } = options;
    
    try {
        // Validate component structure
        const validation = validateComponent(component);
        if (!validation.valid) {
            throw new Error(`Invalid component structure: ${validation.errors.join(', ')}`);
        }
        
        // Check cache first
        if (cache) {
            const cached = renderCache.get(component);
            if (cached !== null) {
                return { success: true, html: cached };
            }
        }
        
        // Get component library
        const lib = componentLibrary[component.type];
        if (!lib) {
            throw new Error(
                `Component type "${component.type}" not found. Valid types: atom, molecule, organism`
            );
        }
        
        // Get component from library
        const comp = lib[component.name];
        if (!comp) {
            const available = Object.keys(lib).join(', ');
            throw new Error(
                `Component "${component.name}" not found in ${component.type}s. Available: ${available}`
            );
        }
        
        // Handle nested slots
        let slotContent = '';
        const hasNestedComponents = Array.isArray(component.props?.slot) && 
            component.props.slot.some(child => 
                child && typeof child === 'object' && child.type && child.name
            );
        
        if (hasNestedComponents) {
            // Recursively compose nested components (with error boundaries!)
            slotContent = component.props.slot.map(child => {
                if (typeof child === 'string') {
                    return child;
                }
                if (child && typeof child === 'object' && child.type && child.name) {
                    const result = safeRenderComponent(child, options);
                    return result.success ? result.html : result.fallback;
                }
                return '';
            }).join('\n');
        } else {
            slotContent = component.props?.slot || '';
            if (Array.isArray(slotContent)) {
                slotContent = slotContent.join('\n');
            }
        }
        
        // Get render function
        const renderFn = typeof comp === 'function' ? comp : comp.render;
        if (typeof renderFn !== 'function') {
            throw new Error(
                `Component "${component.name}" does not export a valid render function`
            );
        }
        
        // Render component
        const html = renderFn({ ...component.props, slot: slotContent });
        
        if (typeof html !== 'string') {
            throw new Error(
                `Component "${component.name}" render function must return a string, got ${typeof html}`
            );
        }
        
        // Cache the result
        const isStaticSlot = !hasNestedComponents && 
            (typeof component.props?.slot === 'string' || 
             (Array.isArray(component.props?.slot) && 
              component.props.slot.every(s => typeof s === 'string')));
              
        if (cache && isStaticSlot) {
            renderCache.set(component, html);
        }
        
        return { success: true, html };
        
    } catch (error) {
        // Track error
        const errorInfo = {
            type: 'render_error',
            component: `${component?.type}/${component?.name}`,
            message: error.message,
            stack: error.stack,
            details: error.toString()
        };
        
        errorTracker.track(errorInfo);
        
        // Log in development
        if (process.env.NODE_ENV === 'development') {
            console.error(
                `[compose] Error rendering ${component?.type}/${component?.name}:`,
                error
            );
        }
        
        // Generate fallback HTML
        const fallback = errorFallbackRenderer(errorInfo, component);
        
        return {
            success: false,
            error: errorInfo,
            fallback
        };
    }
}