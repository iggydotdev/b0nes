import { escapeAttr } from '../../../components/utils/escapeAttr.js';
const configKeys = new Set(['title', 'lang', 'stylesheets', 'scripts', 'inlineScripts', 'interactive', 'currentPath', 'bundlePath', 'render']);
export const generateMetaTags = meta => Object.entries(meta)
    .filter(([name, value]) => !configKeys.has(name) && value != null)
    .map(([name, value]) => `<meta ${name.startsWith('og:') || name.startsWith('twitter:') ? 'property' : 'name'}="${escapeAttr(name)}" content="${escapeAttr(String(value))}">`)
    .join('\n    ');
