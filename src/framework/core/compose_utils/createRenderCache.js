/**
 * Component render cache with LRU eviction (functional style with closures)
 */
export const createRenderCache = (maxSize = 500) => {
    const cache = new Map();
    let hits = 0;
    let misses = 0;
    
    const generateKey = (component) => {
        try {
            return JSON.stringify({
                type: component.type,
                name: component.name,
                props: component.props
            });
        } catch (error) {
            return null;
        }
    };
    
    const isCacheable = (component) => {
        try {
            const propsStr = JSON.stringify(component.props);
            
            if (propsStr.includes('"function"') || 
                propsStr.includes('Symbol(') ||
                component.props?.slot?.$typeof) {
                return false;
            }
            
            return true;
        } catch {
            return false;
        }
    };
    
    const get = (component) => {
        if (!isCacheable(component)) {
            return null;
        }
        
        const key = generateKey(component);
        if (!key) return null;
        
        if (cache.has(key)) {
            hits++;
            // LRU: Move to end
            const value = cache.get(key);
            cache.delete(key);
            cache.set(key, value);
            return value;
        }
        
        misses++;
        return null;
    };
    
    const set = (component, html) => {
        if (!isCacheable(component)) {
            return;
        }
        
        const key = generateKey(component);
        if (!key) return;
        
        // LRU eviction
        if (cache.size >= maxSize) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }
        
        cache.set(key, html);
    };
    
    const clear = () => {
        cache.clear();
        hits = 0;
        misses = 0;
    };
    
    const getStats = () => {
        const total = hits + misses;
        return {
            size: cache.size,
            maxSize,
            hits,
            misses,
            hitRate: total > 0 ? (hits / total * 100).toFixed(2) + '%' : '0%'
        };
    };
    
    return { get, set, clear, getStats };
};