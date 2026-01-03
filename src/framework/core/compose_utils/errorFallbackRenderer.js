/**
 * Default error fallback renderer
 * Override this for custom error UI
 */
let errorFallbackRenderer = (error, component) => {
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
        // Development: Show detailed error
        return `
            <div style="
                border: 2px solid #dc3545;
                background: #f8d7da;
                color: #721c24;
                padding: 1rem;
                margin: 1rem 0;
                border-radius: 4px;
                font-family: monospace;
            ">
                <strong>⚠️ Component Error: ${component?.type || 'unknown'}/${component?.name || 'unknown'}</strong>
                <div style="margin-top: 0.5rem; font-size: 0.9em;">
                    <strong>Error:</strong> ${error.message || 'Unknown error'}
                </div>
                ${error.details ? `
                    <div style="margin-top: 0.5rem; font-size: 0.85em;">
                        <strong>Details:</strong> ${error.details}
                    </div>
                ` : ''}
                ${error.stack ? `
                    <details style="margin-top: 0.5rem;">
                        <summary style="cursor: pointer;">Stack Trace</summary>
                        <pre style="margin-top: 0.5rem; font-size: 0.8em; overflow-x: auto;">${error.stack}</pre>
                    </details>
                ` : ''}
            </div>
        `;
    } else {
        // Production: Silent failure with minimal HTML comment
        return `<!-- Component ${component?.type}/${component?.name} failed to render -->`;
    }
};