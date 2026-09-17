/** Progressive enhancement with category-qualified behaviors and cancellable initialization. */
(() => {
    if (window.b0nes) return;
    const instances = new WeakMap();
    const pending = new Map();
    const tasks = new Set();
    const modules = new Map();
    const listeners = new Map();
    const identifier = value => {
        const match = /^(atoms?|molecules?|organisms?):([a-z0-9-]+)$/.exec(value);
        if (!match) throw new TypeError('Use a qualified behavior ID, e.g. molecules:tabs');
        return `${match[1].replace(/s$/, '')}s:${match[2]}`;
    };
    const runtime = window.b0nes = {
        activeInstances: new Set(),
        instanceCleanup: instances,
        behaviors: Object.create(null),
        utils: {
            addEventListener(element, type, listener, options = {}) {
                element.addEventListener(type, listener, options);
                const remove = () => {
                    element.removeEventListener(type, listener, options);
                    listeners.get(element)?.delete(remove);
                    if (!listeners.get(element)?.size) listeners.delete(element);
                };
                if (!listeners.has(element)) listeners.set(element, new Set());
                listeners.get(element).add(remove);
                return remove;
            }
        },
        register(id, behavior) {
            if (typeof behavior !== 'function') throw new TypeError('Behavior must be a function');
            this.behaviors[identifier(id)] = behavior;
        },
        init(root = document) {
            const elements = [...(root.matches?.('[data-b0nes]') ? [root] : []),
                ...root.querySelectorAll('[data-b0nes]')];
            let count = 0;
            for (const el of elements) {
                if (this.activeInstances.has(el) || pending.has(el)) continue;
                let id;
                try { id = identifier(el.dataset.b0nes); }
                catch (error) { console.error(error); continue; }
                const token = {};
                const apply = behavior => {
                    if (pending.get(el) !== token || !el.isConnected) return;
                    const cleanup = behavior(el);
                    if (typeof cleanup === 'function') instances.set(el, cleanup);
                    el.dataset.b0nesInit = 'true';
                    this.activeInstances.add(el);
                    count++;
                };
                pending.set(el, token);
                if (this.behaviors[id]) {
                    try { apply(this.behaviors[id]); }
                    catch (error) { console.error(`[b0nes] Failed to initialize ${id}`, error); }
                    finally { pending.delete(el); }
                } else {
                    if (!modules.has(id)) {
                        const [type, name] = id.split(':');
                        const load = import(`/assets/js/behaviors/${type}/${name}/client.js`)
                            .catch(() => import(new URL(`../../components/${type}/${name}/client.js`, import.meta.url).href))
                            .then(module => { this.register(id, module.client); return module.client; })
                            .catch(error => { modules.delete(id); throw error; });
                        modules.set(id, load);
                    }
                    const task = modules.get(id).then(apply)
                        .catch(error => console.error(`[b0nes] Failed to load ${id}`, error))
                        .finally(() => {
                            if (pending.get(el) === token) pending.delete(el);
                            tasks.delete(task);
                        });
                    tasks.add(task);
                }
            }
            return count;
        },
        async whenReady() { while (tasks.size) await Promise.all([...tasks]); },
        destroy(el) {
            if (!el) return false;
            const existed = pending.has(el) || this.activeInstances.has(el) || listeners.has(el);
            pending.delete(el);
            try { instances.get(el)?.(); }
            finally {
                instances.delete(el);
                for (const remove of [...(listeners.get(el) || [])]) remove();
                this.activeInstances.delete(el);
                delete el.dataset.b0nesInit;
            }
            return existed;
        },
        destroyAll() {
            let count = 0;
            for (const el of new Set([...this.activeInstances, ...pending.keys()])) if (this.destroy(el)) count++;
            return count;
        },
        getMemoryStats() {
            return { activeInstances: this.activeInstances.size,
                trackedListeners: [...listeners.values()].reduce((sum, set) => sum + set.size, 0),
                registeredBehaviors: Object.keys(this.behaviors).length };
        }
    };
    const init = () => runtime.init();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else queueMicrotask(init);
    window.addEventListener('beforeunload', () => runtime.destroyAll());
})();
