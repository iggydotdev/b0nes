/**
 * Custom error class for component-related errors
 * Provides better context and debugging information
 */
export class ComponentError extends Error {
    /**
     * @param {string} message - Error message
     * @param {Object} context - Additional context about the error
     * @param {string} context.componentName - Name of the component that failed
     * @param {string} context.componentType - Type of component (atom/molecule/organism)
     * @param {Object} [context.props] - Props that were passed to the component
     * @param {Error} [context.originalError] - Original error if this is wrapping another
     */
    constructor(message, context = {}) {
        super(message);
        this.name = 'ComponentError';
        this.componentName = context.componentName;
        this.componentType = context.componentType;
        this.props = context.props;
        this.originalError = context.originalError;
        
        // Capture stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ComponentError);
        }
    }

    /**
     * Returns a formatted error message with context
     * @returns {string} Formatted error message
     */
    toString() {
        let msg = `${this.name}: ${this.message}`;
        
        if (this.componentName) {
            msg += `\n  Component: ${this.componentType}/${this.componentName}`;
        }
        
        if (this.props) {
            msg += `\n  Props: ${JSON.stringify(this.props, null, 2)}`;
        }
        
        if (this.originalError) {
            msg += `\n  Original Error: ${this.originalError.message}`;
        }
        
        return msg;
    }
}

/**
 * Validates component props and throws descriptive errors
 * @param {Object} props - Props to validate
 * @param {Array<string>} required - Required prop names
 * @param {Object} context - Component context for error messages
 * @param {string} context.componentName - Name of the component
 * @param {string} context.componentType - Type of component
 * @throws {ComponentError} If required props are missing
 * @example
 * validateProps(
 *   { slot: 'text' },
 *   ['slot', 'url'],
 *   { componentName: 'link', componentType: 'atom' }
 * )
 * // Throws: ComponentError with details about missing 'url' prop
 */
export const validateProps = (props, required, context) => {
    const missing = required.filter(key => {
        const value = props[key];
        return value === undefined || value === null || value === '';
    });
    
    if (missing.length > 0) {
        throw createComponentError(
            `Missing required props: ${missing.join(', ')}`,
            {
                ...context,
                props,
            }
        );
    }
};

/**
 * Validates prop types
 * @param {Object} props - Props to validate
 * @param {Object} schema - Schema defining expected types
 * @param {Object} context - Component context for error messages
 * @throws {ComponentError} If prop types don't match
 * @example
 * validatePropTypes(
 *   { url: 123 },
 *   { url: 'string', slot: 'string' },
 *   { componentName: 'link', componentType: 'atom' }
 * )
 * // Throws: ComponentError about incorrect type for 'url'
 */
export const validatePropTypes = (props, schema, context) => {
    const typeErrors = [];
    
    for (const [key, expectedType] of Object.entries(schema)) {
        const value = props[key];
        
        // Skip validation for undefined optional props
        if (value === undefined) continue;
        
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        
        if (actualType !== expectedType) {
            typeErrors.push(
                `'${key}' expected ${expectedType}, got ${actualType}`
            );
        }
    }
    
    if (typeErrors.length > 0) {
        throw createComponentError(
            `Type validation failed:\n  ${typeErrors.join('\n  ')}`,
            {
                ...context,
                props,
            }
        );
    }
};

/**
 * Wraps component functions with error handling
 * @param {Function} componentFn - The component function to wrap
 * @param {Object} context - Component context
 * @returns {Function} Wrapped component function with error handling
 */
export const withErrorHandling = (componentFn, context) => {
    return (props) => {
        try {
            return componentFn(props);
        } catch (error) {
            if (error instanceof ComponentError) {
                throw error;
            }
            
            throw createComponentError(
                `Component rendering failed: ${error.message}`,
                {
                    ...context,
                    props,
                    originalError: error,
                }
            );
        }
    };
};