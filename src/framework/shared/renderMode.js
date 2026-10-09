/** Use the same SSG/SSR policy at build time and when serving production pages. */
export const shouldBeStatic = (page, route) => {
    if (page.meta?.render === 'ssr') return false;
    if (page.meta?.render === 'ssg') return true;
    if (route.params) return typeof page.externalData === 'function';
    return typeof (page.components || page.default || []) !== 'function';
};
