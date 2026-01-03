/**
 * Error tracking for debugging and monitoring (functional style with closures)
 */
export const createErrorTracker = (maxErrors = 100) => {
    const errors = [];
    
    const track = (error) => {
        errors.push({
            ...error,
            timestamp: Date.now()
        });
        
        // Keep only recent errors
        if (errors.length > maxErrors) {
            errors.shift();
        }
    };
    
    const getErrors = () => [...errors];
    
    const getErrorsByComponent = (componentName) => 
        errors.filter(e => e.component === componentName);
    
    const clear = () => {
        errors.length = 0;
    };
    
    const getStats = () => {
        const byType = errors.reduce((acc, error) => {
            const type = error.type || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
        
        return {
            total: errors.length,
            byType
        };
    };
    
    return { track, getErrors, getErrorsByComponent, clear, getStats };
};