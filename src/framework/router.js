
export const router = (url, routes) => {
    const newURL = new URL(url);
    const query = Object.fromEntries(newURL.searchParams.entries());
    for (const route of routes) {
        const match = route.pattern.exec(new URL(url).href);
        if (match) {
            // if (typeof route.handler === 'function') {
            //     return route.handler(match);
            // } else if (typeof route.handler === 'string') {
            //     // Lazy load the component based on the handler string
            //     return import(`./pages/${route.handler}/${route.handler}.show.js`)
            //         .then(module => module.show(match));
            // }
            return ({
                params: match.pathname.groups,
                handler: route.handler,
                query: query,
                meta: route.meta,
                ...route,
            })
        }
    }
    // return null if no route matched
    return null;
    // or return a rejected promise
    //return Promise.reject(new Error('No route matched'));   
}

/*
Example usage:
import { routes } from './routes.js';
const url = new URL(window.location.href);
router(url, routes)
    .then(routeInfo => {
        console.log('Matched route:', routeInfo);
        // Load and render the component based on routeInfo.handler
    })
    .catch(error => {
        console.error(error);
        // Handle 404 - Not Found
    });
*/ 