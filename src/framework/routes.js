
// Import URLPattern (automatically uses native or polyfill)
import { URLPattern } from './utils/urlPattern.js';
import {components as homeComponents} from './pages/home.js';
import {components as blogPostComponents} from './pages/blogPost.js';
import {components as demoComponents} from './pages/demo.js';
import {components as picoComponents} from './pages/pico.js';
import {components as waterComponents} from './pages/water.js';
import {components as tailwindComponents} from './pages/tailwind.js';
import { stylesheetPresets } from './renderPage.js';

// We need some routes for testing
export const routes = [
    {
        name: 'Home',
        pattern: new URLPattern({pathname: '/'}),
        url: '/',
        meta: { title: 'Home'},
        template: 'home', // component?
        guards: [], // TODO: Implement route guards for auth/permissions
        components: homeComponents, // if template is blank, we can compose the page with components
    },
    {
        name: 'Demo',
        pattern: new URLPattern({pathname: '/demo'}),
        url: '/demo',
        meta: { title: 'Interactive Components Demo'},
        template: 'demo',
        guards: [],
        components: demoComponents
    },
    {
        pattern: new URLPattern({ pathname: '/blog/:postid' }),
        meta: { title: 'Blog Post'},
        template: 'articlePage',
        guards: [],  // TODO: Implement route guards for auth/permissions
        components: blogPostComponents,
        externalData: async () => {
           const url = 'https://yesno.wtf/api'

            try {
                const response = await fetch(url);
                if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
                }

                const result = await response.json();
                return result;
            } catch (error) {
               throw new Error(`Error to retrieve data (${url}): ${error.message}`);
            }
        }
    },
     {
        name: 'Pico',
        pattern: new URLPattern({pathname: '/pico'}),
        url: '/pico',
        meta: { title: 'Pico'},
        template: 'home', // component?
        guards: [], // TODO: Implement route guards for auth/permissions
        components: picoComponents, // if template is blank, we can compose the page with components
         meta: {
            stylesheets:  stylesheetPresets.pico()
        }
    },
         {
        name: 'Water',
        pattern: new URLPattern({pathname: '/water'}),
        url: '/water',
        template: 'home', // component?
        guards: [], // TODO: Implement route guards for auth/permissions
        components: waterComponents, // if template is blank, we can compose the page with components
        meta: {
            title: 'water',
            stylesheets:  stylesheetPresets.water()
        }
    },
         {
        name: 'Tailwind',
        pattern: new URLPattern({pathname: '/tailwind'}),
        url: '/tailwind',
        meta: { title: 'Tailwind',
            stylesheets: stylesheetPresets.tailwind()
        },
        template: 'home', // component?
        guards: [], // TODO: Implement route guards for auth/permissions
        components: tailwindComponents // if template is blank, we can compose the page with components
    },
]
