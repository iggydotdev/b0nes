export const document = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flesh Server</title>
    <style>
    </style>
</head>
<body>
    <div id="app"/>
</body>
</html>`;

}

export const renderPage = (content, meta = {}) => {
    const metaTags = Object.entries(meta).map(([name, content]) => `<meta name="${name}" content="${content}">`).join('\n    ');
    const doc = document().replace('</head>', `${metaTags}\n</head>`).replace('<div id="app"/>', `<div id="app">\n        ${content}\n    </div>`);
    return doc;
};