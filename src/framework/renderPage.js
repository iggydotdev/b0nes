export const document = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flesh Server</title>
    <style>
        /* Temporary: Basic Interactive Components Styling */
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
        
        .demo-section { margin: 2rem 0; padding: 1.5rem; background: #f9f9f9; border-radius: 8px; }
    </style>
</head>
<body>
    <div id="app"/>
</body>
</html>`;

}

export const renderPage = (content, meta = {}) => {
    const metaTags = Object.entries(meta).map(([name, content]) => `<meta name="${name}" content="${content}">`).join('\n    ');
    
    // Include b0nes.js for client-side interactivity if enabled
    const includeScript = meta.interactive !== false; // Opt-out, defaults to true
    const b0nesScriptTag = includeScript 
    ? `\n    <script src="/b0nes.js?v=${process.env.npm_package_version}"></script>` 
    : '';
    const doc = document()
        .replace('</head>', `${metaTags}</head>`)
        .replace('<div id="app"/>', `<div id="app">\n        ${content}\n    ${b0nesScriptTag}\n</div>`);
    
    return doc;
};