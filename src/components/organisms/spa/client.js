import { safeUrl } from '../../utils/safeUrl.js';

const textProperties = new Set(['textContent', 'innerText', 'value', 'title', 'className', 'placeholder', 'alt', 'ariaLabel', 'ariaDescription']);
const booleanProperties = new Set(['checked', 'disabled', 'selected', 'hidden', 'multiple', 'readOnly', 'required', 'open']);

// Native module URLs differ between source development and static build output.
const runtimeBase = new URL(import.meta.url).pathname.startsWith('/assets/')
    ? '/assets/js/client/' : '/client/';
const { createRouterFSM, connectFSMtoDOM } = await import(new URL(runtimeBase + 'fsm.js', import.meta.url));

/** Enhance the server-rendered SPA using configuration loaded by the page. */
export const client = (root) => {
    const config = window.spaConfig;
    if (!config || !Array.isArray(config.routes) || !config.routes.length) {
        throw new Error('[SPA] Define window.spaConfig.routes before initializing the SPA');
    }
    const { routes, store, onInit } = config;
    const { fsm, routes: normalizedRoutes } = createRouterFSM(routes);
    const updateBindings = () => {
        if (!store) return;
        root.querySelectorAll('[data-b0nes-bind]').forEach(element => {
            for (const binding of element.dataset.b0nesBind.split(',')) {
                const [path, property] = binding.trim().split(':');
                let value = store.get(path);
                if (value === undefined && store.computed) value = store.computed(path);
                const target = property || (['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName) ?
                    (['checkbox', 'radio'].includes(element.type) ? 'checked' : 'value') : 'textContent');
                // Bind only supported text/boolean properties. HTML, event-handler,
                // and arbitrary DOM-property sinks are deliberately excluded.
                let next;
                if (booleanProperties.has(target)) next = Boolean(value);
                else if (textProperties.has(target)) {
                    if (['SCRIPT', 'STYLE'].includes(element.tagName)) continue;
                    next = String(value ?? '');
                } else if (target === 'href' || target === 'src') {
                    try { next = safeUrl(value, { navigation: target === 'href' }); }
                    catch { console.warn(`[SPA] Ignoring unsafe ${target} binding`); continue; }
                } else continue;
                if (element[target] !== next) element[target] = next;
            }
        });
    };
    const destroyChildren = () => root.querySelectorAll('[data-b0nes]').forEach(element => {
        try { window.b0nes?.destroy(element); }
        catch (error) { console.error('[SPA] Child behavior cleanup failed:', error); }
    });
    const connection = connectFSMtoDOM(fsm, root, normalizedRoutes, {
        onBeforeRender: destroyChildren,
        onRender: () => { updateBindings(); window.b0nes?.init(root); }
    });
    // Templates may contain any data-dependent structure, not only a todo list.
    const unsubscribe = store?.subscribe(() => {
        const route = normalizedRoutes.find(candidate => candidate.name === fsm.getState());
        if (typeof route?.template === 'function') void connection.render();
        else updateBindings();
    });
    const handleStoreClick = event => {
        const target = event.target.closest?.('[data-action], [data-action-name]');
        if (!store || !target || !root.contains(target)) return;
        if (!['checkbox', 'radio'].includes(target.type)) event.preventDefault();
        const rawId = target.dataset.id;
        const payload = rawId === undefined ? undefined : (/^-?\d+(?:\.\d+)?$/.test(rawId) ? Number(rawId) : rawId);
        store.dispatch(target.dataset.action || target.dataset.actionName, payload);
    };
    root.addEventListener('click', handleStoreClick);
    const cleanup = () => {
        connection();
        try { destroyChildren(); }
        finally {
            try { unsubscribe?.(); }
            finally { root.removeEventListener('click', handleStoreClick); }
        }
    };
    try { onInit?.({ fsm, store, root }); }
    catch (error) { cleanup(); throw error; }
    // A synchronous cleanup is required by b0nes.init()/destroy().
    return cleanup;
};
