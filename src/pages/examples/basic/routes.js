
// Import URLPattern (automatically uses native or polyfill)
import { URLPattern } from '../../../framework/utils/urlPattern.js';
import { stylesheetPresets } from '../../../framework/renderPage.js';
import {components as homeComponents} from './index.js';
import {components as blogPostComponents} from '../blogPost.js';
import {components as demoComponents} from './demo/index.js';
// We need some routes for testing
export const routes = [
    {
        name: 'Home',
        pattern: new URLPattern({pathname: '/'}),
        url: '/examples/home',
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

]
