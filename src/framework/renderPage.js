/**
 * b0nes Page Renderer
 * Generates complete HTML pages with meta tags, stylesheets, and scripts
 */

/**
 * Base HTML document template
 * @returns {string} Base HTML structure
 */
export const document = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>b0nes Site</title>
    <style>
        /* Base styles for interactive components */
        /* These provide minimal styling - customize in your own stylesheets */
        
        /* Tabs Component */
        .tabs { margin: 1rem 0; }
        .tab-buttons { display: flex; gap: 0.5rem; border-bottom: 2px solid #e0e0e0; }
        .tab-button { 
            padding: 0.75rem 1.5rem; 
            border: none; 
            background: none; 
            cursor: pointer; 
            border-bottom: 2px solid transparent;
            margin-bottom: -2px;
            transition: all 0.2s;
        }
        .tab-button:hover { background: #f5f5f5; }
        .tab-button.active { border-bottom-color: #007bff; font-weight: bold; }
        .tab-panel { padding: 1rem 0; }
        .tab-panel[hidden] { display: none; }
        
        /* Modal Component */
        .modal { 
            display: none; 
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }
        .modal-overlay { 
            position: absolute; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: rgba(0,0,0,0.5);
        }
        .modal-content { 
            position: relative; 
            background: white; 
            padding: 2rem; 
            border-radius: 8px; 
            max-width: 500px; 
            width: 90%; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 1001;
        }
        .modal-close { 
            position: absolute; 
            top: 1rem; 
            right: 1rem; 
            background: none; 
            border: none; 
            font-size: 1.5rem; 
            cursor: pointer; 
            padding: 0.25rem 0.5rem;
        }
        .modal-title { margin-top: 0; }
        
        /* Dropdown Component */
        .dropdown { position: relative; display: inline-block; }
        .dropdown-trigger { 
            padding: 0.5rem 1rem; 
            border: 1px solid #ccc; 
            background: white; 
            cursor: pointer;
            border-radius: 4px;
        }
        .dropdown-trigger:hover { background: #f5f5f5; }
        .dropdown-menu { 
            position: absolute; 
            top: 100%; 
            left: 0; 
            background: white; 
            border: 1px solid #ccc; 
            border-radius: 4px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            min-width: 150px; 
            margin-top: 0.25rem;
            z-index: 100;
        }
        .dropdown-menu[hidden] { display: none; }
        .dropdown-menu a { 
            display: block; 
            padding: 0.75rem 1rem; 
            text-decoration: none; 
            color: #333;
            transition: background 0.2s;
        }
        .dropdown-menu a:hover { background: #f5f5f5; }
    </style>
</head>
<body>
    <div id="app"></div>
</body>
</html>`;
};

/**
 * Default stylesheets configuration
 * Can be overridden per-page via meta.stylesheets
 */
const DEFAULT_STYLESHEETS = [
    // Add your global stylesheets here
    // Example: '/styles/main.css',
    // Example: 'https://cdn.jsdelivr.net/npm/water.css@2/out/water.css',
];

/**
 * Normalize stylesheet entries
 * Supports both string URLs and objects with href/attrs
 * @param {string|Object|Array} stylesheets - Stylesheet configuration
 * @returns {Array<Object>} Normalized stylesheet objects
 * 
 * @example
 * normalizeStylesheets([
 *   '/styles/main.css',
 *   { href: '/styles/theme.css', media: 'print' }
 * ])
 */
const normalizeStylesheets = (stylesheets) => {
    if (!stylesheets) return [];
    
    // Ensure array
    const sheets = Array.isArray(stylesheets) ? stylesheets : [stylesheets];
    
    return sheets.map(sheet => {
        if (typeof sheet === 'string') {
            return { href: sheet };
        }
        
        if (typeof sheet === 'object' && sheet.href) {
            return sheet;
        }
        
        console.warn('[b0nes] Invalid stylesheet format:', sheet);
        return null;
    }).filter(Boolean);
};

/**
 * Generate link tag for stylesheet
 * @param {Object} stylesheet - Stylesheet configuration
 * @param {string} stylesheet.href - Stylesheet URL
 * @param {string} [stylesheet.media] - Media query
 * @param {string} [stylesheet.integrity] - SRI hash
 * @param {string} [stylesheet.crossOrigin] - CORS setting
 * @param {Object} [stylesheet.attrs] - Additional attributes
 * @returns {string} Link tag HTML
 * 
 * @example
 * generateStylesheetTag({ 
 *   href: '/styles/main.css',
 *   media: '(prefers-color-scheme: dark)'
 * })
 */
const generateStylesheetTag = (stylesheet) => {
    if (stylesheet.href.includes(`tailwind`)) {
        return `<script src="${stylesheet.href}"></script>`;
    }
    let attrs = `rel="stylesheet" href="${stylesheet.href}"`;
    
    if (stylesheet.media) {
        attrs += ` media="${stylesheet.media}"`;
    }
    
    if (stylesheet.integrity) {
        attrs += ` integrity="${stylesheet.integrity}"`;
    }
    
    if (stylesheet.crossOrigin) {
        attrs += ` crossorigin="${stylesheet.crossOrigin}"`;
    }
    
    // Additional custom attributes
    if (stylesheet.attrs && typeof stylesheet.attrs === 'object') {
        Object.entries(stylesheet.attrs).forEach(([key, value]) => {
            attrs += ` ${key}="${value}"`;
        });
    }
    
    return `<link ${attrs}>`;
};

/**
 * Generate meta tags from meta object
 * @param {Object} meta - Meta information
 * @returns {string} Meta tags HTML
 * 
 * @example
 * generateMetaTags({
 *   title: 'My Page',
 *   description: 'Page description',
 *   keywords: 'web, development',
 *   'og:title': 'My Page',
 *   'og:image': '/images/og.jpg'
 * })
 */
const generateMetaTags = (meta) => {
    const tags = [];
    
    // Standard meta tags
    const standardMeta = ['description', 'keywords', 'author', 'viewport', 'charset'];
    
    Object.entries(meta).forEach(([name, content]) => {
        // Skip special keys
        if (['title', 'stylesheets', 'scripts', 'interactive'].includes(name)) {
            return;
        }
        
        // Open Graph and Twitter cards
        if (name.startsWith('og:') || name.startsWith('twitter:')) {
            tags.push(`<meta property="${name}" content="${content}">`);
        }
        // Standard meta tags
        else if (standardMeta.includes(name)) {
            tags.push(`<meta name="${name}" content="${content}">`);
        }
        // Custom meta tags
        else {
            tags.push(`<meta name="${name}" content="${content}">`);
        }
    });
    
    return tags.join('\n    ');
};

/**
 * Render complete HTML page
 * @param {string} content - Page content (composed components)
 * @param {Object} [meta={}] - Page metadata and configuration
 * @param {string} [meta.title] - Page title
 * @param {string} [meta.description] - Page description
 * @param {Array<string|Object>} [meta.stylesheets] - Additional stylesheets
 * @param {boolean} [meta.interactive=true] - Include b0nes.js runtime
 * @param {string} [meta.lang='en'] - HTML language attribute
 * @returns {string} Complete HTML page
 * 
 * @example
 * renderPage(content, {
 *   title: 'My Page',
 *   description: 'Page description',
 *   stylesheets: [
 *     '/styles/main.css',
 *     { href: '/styles/theme.css', media: '(prefers-color-scheme: dark)' }
 *   ],
 *   interactive: true
 * })
 */
export const renderPage = (content, meta = {}) => {
    // Get base document
    let html = document();
    
    // Set page title
    const title = meta.title || 'b0nes Site';
    html = html.replace('<title>b0nes Site</title>', `<title>${title}</title>`);
    
    // Set language attribute
    const lang = meta.lang || 'en';
    html = html.replace('<html lang="en">', `<html lang="${lang}">`);
    
    // Generate meta tags
    const metaTags = generateMetaTags(meta);
    if (metaTags) {
        html = html.replace('</head>', `    ${metaTags}\n</head>`);
    }
    
    // Process stylesheets
    const pageStylesheets = meta.stylesheets || [];
    const allStylesheets = [...DEFAULT_STYLESHEETS, ...pageStylesheets];
    const normalizedStylesheets = normalizeStylesheets(allStylesheets);
    
    if (normalizedStylesheets.length > 0) {
        const stylesheetTags = normalizedStylesheets
            .map(generateStylesheetTag)
            .join('\n    ');
        
        // Insert before closing </head>
        html = html.replace('</head>', `    ${stylesheetTags}\n</head>`);
    }
    
    // Include b0nes.js for client-side interactivity if enabled
    const includeScript = meta.interactive !== false; // Opt-out, defaults to true
    const b0nesScriptTag = includeScript 
        ? `\n    <script src="assets/js/b0nes.js?v=${process.env.npm_package_version || '0.1.11'}"></script>` 
        : '';
    
    // Additional scripts from meta.scripts
    let additionalScripts = '';
    if (meta.scripts && Array.isArray(meta.scripts)) {
        additionalScripts = '\n    ' + meta.scripts
            .map(src => `<script src="${src}"></script>`)
            .join('\n    ');
    }
    
    // Replace app placeholder with content
    html = html.replace(
        '<div id="app"></div>',
        `<div id="app">\n        ${content}\n    </div>${b0nesScriptTag}${additionalScripts}`
    );
    
    return html;
};

/**
 * Configuration helper for stylesheets
 * @param {Array<string|Object>} sheets - Stylesheet configuration
 * @returns {Array<Object>} Normalized stylesheet objects
 * 
 * @example
 * // In routes.js
 * import { configureStylesheets } from './renderPage.js';
 * 
 * const routes = [{
 *   pattern: new URLPattern({ pathname: '/' }),
 *   meta: {
 *     title: 'Home',
 *     stylesheets: configureStylesheets([
 *       '/styles/main.css',
 *       { href: '/styles/dark.css', media: '(prefers-color-scheme: dark)' },
 *       { href: 'https://cdn.example.com/font.css', crossOrigin: 'anonymous' }
 *     ])
 *   },
 *   components: homeComponents
 * }];
 */
export const configureStylesheets = (sheets) => normalizeStylesheets(sheets);