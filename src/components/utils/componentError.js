/**
 * Creates a formatted error message for component errors
 * @param {string} message - Error message
 * @param {Object} context - Error context
 * @param {string} context.componentName - Component name
 * @param {string} context.componentType - Component type (atom/molecule/organism)
 * @param {Object} [context.props] - Props passed to component
 * @returns {Error} Standard Error with formatted message
 */
export const createComponentError = (message, context = {}) => {
    let errorMsg = `[${context.componentType}/${context.componentName}] ${message}`;
    
    if (context.props) {
        errorMsg += `\nProps: ${JSON.stringify(context.props, null, 2)}`;
    }
    
    return new Error(errorMsg);
};

/**
 * Validates required props
 * @param {Object} props - Props to validate
 * @param {Array<string>} required - Required prop names
 * @param {Object} context - Component context
 * @throws {Error} If required props are missing
 */
export const validateProps = (props, required, context) => {
    const missing = required.filter(key => {
        const value = props[key];
        return value === undefined || value === null || value === '';
    });
    
    if (missing.length > 0) {
        throw createComponentError(
            `Missing required props: ${missing.join(', ')}`,
            { ...context, props }
        );
    }
};

/**
 * Validates prop types
 * @param {Object} props - Props to validate
 * @param {Object} schema - Expected types
 * @param {Object} context - Component context
 * @throws {Error} If types don't match
 */
export const validatePropTypes = (props, schema, context) => {
    const errors = [];
    
    for (const [key, expectedType] of Object.entries(schema)) {
        const value = props[key];
        if (value === undefined) continue;
        
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== expectedType) {
            errors.push(`${key}: expected ${expectedType}, got ${actualType}`);
        }
    }
    
    if (errors.length > 0) {
        throw createComponentError(
            `Invalid prop types:\n  ${errors.join('\n  ')}`,
            { ...context, props }
        );
    }
};