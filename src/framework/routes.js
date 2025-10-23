import {components as homeComponents} from './pages/home.js';
import {components as blogPostComponents} from './pages/blogPost.js';
import {components as aboutComponents} from './pages/about.js';
import {components as contactComponents} from './pages/contact.js';

// We need some routes for testing
export const routes = [
    {
        name: 'Home',
        pattern: new URLPattern({pathname: '/'}),
        url: '/',
        meta: { title: 'Home'},
        template: 'home', // component?
        guards: [], // TODO: Implement route guards for auth/permissions
        components: homeComponents // if template is blank, we can compose the page with components
    }, 
        {
        name: 'About',
        pattern: new URLPattern({pathname: '/about'}),
        url: '/about',
        meta: { title: 'About'},
        template: 'about', // component?
        guards: [], // TODO: Implement route guards for auth/permissions
        components: aboutComponents // if template is blank, we can compose the page with components
    }, 
    // {
    //     name: 'Contact',
    //     pattern: new URLPattern({pathname: '/'}),
    //     url: '/',
    //     meta: { title: 'Home'},
    //     template: 'home', // component?
    //     guards: [], // TODO: Implement route guards for auth/permissions
    //     components: homeComponents // if template is blank, we can compose the page with components
    // }, 
    // {
    //     pattern: new URLPattern({ pathname: '/blog/:postid' }),
    //     meta: { title: 'Blog Post'},
    //     template: 'articlePage',
    //     guards: [],  // TODO: Implement route guards for auth/permissions
    //     components: blogPostComponents,
    //     externalData: async () => {
    //        const url = 'https://yesno.wtf/api'

    //         try {
    //             const response = await fetch(url);
    //             if (!response.ok) {
    //             throw new Error(`Response status: ${response.status}`);
    //             }

    //             const result = await response.json();
    //             return result;
    //         } catch (error) {
    //            throw new Error(`Error to retrieve data (${url}): ${error.message}`);
    //         }
    //     }
    // },
]
