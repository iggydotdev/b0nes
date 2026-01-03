export const generateMetaTags = (meta) => {
    const tags = [];
    
    const standardMeta = ['description', 'keywords', 'author', 'viewport', 'charset'];
    
    Object.entries(meta).forEach(([name, content]) => {
        if (['title', 'stylesheets', 'scripts', 'interactive', 'currentPath'].includes(name)) {
            return;
        }
        
        if (name.startsWith('og:') || name.startsWith('twitter:')) {
            tags.push(`<meta property="${name}" content="${content}">`);
        }
        else if (standardMeta.includes(name)) {
            tags.push(`<meta name="${name}" content="${content}">`);
        }
        else {
            tags.push(`<meta name="${name}" content="${content}">`);
        }
    });
    
    return tags.join('\n    ');
};