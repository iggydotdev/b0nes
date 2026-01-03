/**
 * Validate component structure
 */
export function validateComponent(component) {
    const errors = [];
    
    if (!component) {
        errors.push('Component is null or undefined');
        return { valid: false, errors };
    }
    
    if (typeof component !== 'object') {
        errors.push(`Component must be an object, got ${typeof component}`);
        return { valid: false, errors };
    }
    
    if (!component.type) {
        errors.push('Component missing "type" property');
    } else if (!['atom', 'molecule', 'organism'].includes(component.type)) {
        errors.push(`Invalid component type: "${component.type}". Must be: atom, molecule, or organism`);
    }
    
    if (!component.name) {
        errors.push('Component missing "name" property');
    } else if (typeof component.name !== 'string') {
        errors.push(`Component "name" must be a string, got ${typeof component.name}`);
    }
    
    if (!component.props) {
        errors.push('Component missing "props" property');
    } else if (typeof component.props !== 'object') {
        errors.push(`Component "props" must be an object, got ${typeof component.props}`);
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}