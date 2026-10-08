import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore, combineModules, createAsyncAction, persistenceMiddleware, loggerMiddleware, devToolsMiddleware, loadPersistedState } from './store.js';

test('path subscriptions compare previous and next snapshots, including getters', () => {
    const store = createStore({
        state: { user: { name: 'Ada' }, count: 0, other: 0 },
        actions: { patch: (_, value) => value },
        getters: { doubled: state => ({ value: state.count * 2 }) }
    });
    const names = [], counts = [], computed = [];
    const unsubscribe = store.subscribe(change => names.push(change.state.user?.name), { path: 'user.name' });
    store.subscribe(change => counts.push(change.state.count), { path: 'count' });
    store.subscribe(change => computed.push(change.state.count), { path: 'doubled.value' });
    store.dispatch('patch', { other: 1 });
    store.dispatch('patch', { user: { name: 'Grace' }, count: 1 });
    store.dispatch('patch', { user: null });
    store.dispatch('patch', { count: 1 });
    assert.deepEqual(names, ['Grace', undefined]);
    assert.deepEqual(counts, [1]);
    assert.deepEqual(computed, [1]);
    unsubscribe();
    store.dispatch('patch', { user: { name: 'Lin' } });
    assert.equal(names.length, 2);
});

test('nested dispatch does not change another subscription’s event snapshot', () => {
    const store = createStore({ state: { count: 0 }, actions: { set: (_, count) => ({ count }) } });
    store.subscribe(change => { if (change.state.count === 1) store.dispatch('set', 2); });
    const seen = [];
    store.subscribe(change => seen.push(change.state.count), { path: 'count' });
    store.dispatch('set', 1);
    assert.deepEqual(seen, [2, 1]);
});

function replaceGlobal(t, name, value) {
    const original = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
    t.after(() => {
        if (original) Object.defineProperty(globalThis, name, original);
        else delete globalThis[name];
    });
}

test('sync middleware observes committed state and persistence saves the latest state', t => {
    const storage = new Map();
    replaceGlobal(t, 'localStorage', {
        setItem: (key, value) => storage.set(key, value),
        getItem: key => storage.get(key)
    });
    const order = [];
    const store = createStore({
        state: { count: 0, unchanged: true },
        actions: { increment: state => { order.push('action'); return { count: state.count + 1 }; } },
        middleware: [
            ({ getState }, next) => {
                order.push(['before', getState().count]);
                const result = next();
                order.push(['after', getState().count]);
                assert.equal(result, getState());
                return result;
            },
            persistenceMiddleware('counter')
        ]
    });
    store.subscribe(change => order.push(['subscriber', change.state.count]));
    const result = store.dispatch('increment');
    assert.equal(result, store.getState());
    assert.equal(result.then, undefined);
    assert.deepEqual(order, [['before', 0], 'action', ['subscriber', 1], ['after', 1]]);
    assert.deepEqual(loadPersistedState('counter'), { count: 1, unchanged: true });
    assert.equal(store.getHistory().length, 1);
});

test('async actions commit once before persistence, logger and DevTools observe them', async t => {
    const saved = [], sent = [], logs = [];
    replaceGlobal(t, 'localStorage', { setItem: (key, value) => saved.push([key, JSON.parse(value)]) });
    replaceGlobal(t, 'window', { __REDUX_DEVTOOLS_EXTENSION__: { send: (...args) => sent.push(args) } });
    t.mock.method(console, 'group', () => {});
    const groupEnd = t.mock.method(console, 'groupEnd', () => {});
    t.mock.method(console, 'log', (...args) => logs.push(args));
    let resolve;
    const ready = new Promise(done => { resolve = done; });
    let getterCalls = 0;
    const store = createStore({
        state: { count: 0 },
        actions: { load: async (_, count) => { await ready; return { count }; } },
        getters: { doubled: state => { getterCalls++; return state.count * 2; } },
        middleware: [loggerMiddleware, persistenceMiddleware('counter'), devToolsMiddleware]
    });
    const changes = [];
    store.subscribe(change => changes.push(change), { path: 'count' });
    assert.equal(store.computed('doubled'), 0);
    assert.equal(store.computed('doubled'), 0);
    const pending = store.dispatch('load', 42);
    assert.equal(typeof pending.then, 'function');
    assert.equal(store.getState().count, 0);
    assert.equal(store.getHistory().length, 0);
    assert.equal(changes.length, 0);
    assert.equal(saved.length, 0);
    assert.equal(sent.length, 0);
    assert.equal(groupEnd.mock.callCount(), 0);
    resolve();
    const result = await pending;
    assert.equal(result, store.getState());
    assert.equal(result.count, 42);
    assert.deepEqual(saved, [['counter', { count: 42 }]]);
    assert.deepEqual(sent, [[{ type: 'load', payload: 42 }, result]]);
    assert.deepEqual(logs.filter(([label]) => label.startsWith('State')).map(([label, state]) => [label, state.count]), [
        ['State before:', 0], ['State after:', 42]
    ]);
    assert.equal(groupEnd.mock.callCount(), 1);
    assert.equal(changes.length, 1);
    assert.equal(changes[0].previousState.count, 0);
    assert.equal(changes[0].state, result);
    assert.equal(store.getHistory()[0], changes[0]);
    assert.equal(store.computed('doubled'), 84);
    assert.equal(getterCalls, 2);
});

test('async actions merge with the state at commit time and support thenables', async () => {
    let resolve;
    const ready = new Promise(done => { resolve = done; });
    const store = createStore({
        state: { count: 0, other: 0 },
        actions: {
            load: async () => { await ready; return { count: 42 }; },
            other: () => ({ other: 1 }),
            thenable: () => ({ then: resolve => resolve({ count: 43 }) })
        }
    });
    const pending = store.dispatch('load');
    store.dispatch('other');
    resolve();
    assert.deepEqual(await pending, { count: 42, other: 1 });
    assert.deepEqual(store.getHistory().map(change => [change.previousState.count, change.state.count, change.state.other]), [
        [0, 0, 1], [0, 42, 1]
    ]);
    assert.deepEqual(await store.dispatch('thenable'), { count: 43, other: 1 });
});

test('nested dispatch preserves action snapshots and persists the final current state', t => {
    const saved = [];
    replaceGlobal(t, 'localStorage', { setItem: (_, value) => saved.push(JSON.parse(value)) });
    const store = createStore({
        state: { count: 0 },
        actions: { set: (_, count) => ({ count }) },
        middleware: [persistenceMiddleware('counter')]
    });
    store.subscribe(change => { if (change.state.count === 1) store.dispatch('set', 2); });
    const result = store.dispatch('set', 1);
    assert.equal(result.count, 1);
    assert.equal(store.getState().count, 2);
    assert.deepEqual(store.getHistory().map(change => [change.previousState.count, change.state.count]), [[0, 1], [1, 2]]);
    assert.deepEqual(saved, [{ count: 2 }, { count: 2 }]);
});

test('middleware can stop an action or await next without causing extra commits', async () => {
    let actionCalls = 0;
    const store = createStore({
        state: { count: 0 },
        actions: { set: (_, count) => { actionCalls++; return { count }; } },
        middleware: [async ({ payload }, next) => {
            if (payload < 0) return;
            await Promise.resolve();
            return await next();
        }]
    });
    assert.deepEqual(await store.dispatch('set', -1), { count: 0 });
    assert.equal(actionCalls, 0);
    assert.equal(store.getHistory().length, 0);
    assert.deepEqual(await store.dispatch('set', 1), { count: 1 });
    assert.equal(actionCalls, 1);
    assert.equal(store.getHistory().length, 1);
});

test('rejected and throwing actions leave state and history unchanged, then later actions work', async t => {
    const error = new Error('load failed');
    const logged = t.mock.method(console, 'error', () => {});
    t.mock.method(console, 'group', () => {});
    t.mock.method(console, 'log', () => {});
    const groupEnd = t.mock.method(console, 'groupEnd', () => {});
    const store = createStore({
        state: { count: 0 },
        actions: {
            reject: async () => { throw error; },
            fail: () => { throw error; },
            set: () => ({ count: 1 })
        },
        middleware: [loggerMiddleware]
    });
    const initial = store.getState();
    let notified = 0;
    store.subscribe(() => notified++);
    assert.equal(await store.dispatch('reject'), initial);
    assert.equal(store.dispatch('fail'), initial);
    assert.equal(store.getState(), initial);
    assert.equal(store.getHistory().length, 0);
    assert.equal(notified, 0);
    assert.equal(logged.mock.callCount(), 2);
    assert.equal(groupEnd.mock.callCount(), 2);
    assert.equal(store.dispatch('set').count, 1);
    assert.equal(store.getHistory().length, 1);
    assert.equal(notified, 1);
});

test('async helpers and module actions return usable state updates', async t => {
    t.mock.method(console, 'error', () => {});
    const config = combineModules({
        counter: {
            state: { count: 0, label: 'counter' },
            actions: {
                set: createAsyncAction(async (_, count) => ({ count })),
                fail: createAsyncAction(async () => { throw new Error('offline'); })
            },
            getters: { doubled: state => state.count * 2 }
        }
    });
    const store = createStore(config);
    assert.deepEqual((await store.dispatch('counter/set', 42)).counter, { count: 42, label: 'counter' });
    assert.equal(store.computed('counter/doubled'), 84);
    assert.deepEqual((await store.dispatch('counter/fail')).counter, { count: 42, label: 'counter', error: 'offline' });
    assert.equal(store.getHistory().length, 2);
});

test('persistence errors and a missing browser DevTools extension do not lose committed updates', t => {
    replaceGlobal(t, 'localStorage', { setItem: () => { throw new Error('storage disabled'); } });
    replaceGlobal(t, 'window', undefined);
    t.mock.method(console, 'error', () => {});
    const store = createStore({
        state: { count: 0 },
        actions: { set: () => ({ count: 1 }) },
        middleware: [persistenceMiddleware('counter'), devToolsMiddleware]
    });
    assert.equal(store.dispatch('set').count, 1);
    assert.equal(store.getState().count, 1);
    assert.equal(store.getHistory().length, 1);
});

test('an async module action preserves other module fields changed while it is pending', async () => {
    let resolve;
    const ready = new Promise(done => { resolve = done; });
    const store = createStore(combineModules({
        counter: {
            state: { count: 0, label: 'before' },
            actions: {
                load: async () => { await ready; return { count: 42 }; },
                label: (_, label) => ({ label })
            }
        }
    }));
    const pending = store.dispatch('counter/load');
    assert.deepEqual(store.dispatch('counter/label', 'after').counter, { count: 0, label: 'after' });
    resolve();
    assert.deepEqual((await pending).counter, { count: 42, label: 'after' });
    assert.equal(store.getHistory().length, 2);
});

test('a middleware error after next does not commit twice or roll back committed state', t => {
    t.mock.method(console, 'error', () => {});
    const store = createStore({
        state: { count: 0 },
        actions: { increment: state => ({ count: state.count + 1 }) },
        middleware: [(_, next) => { next(); throw new Error('observer failed'); }]
    });
    assert.deepEqual(store.dispatch('increment'), { count: 1 });
    assert.equal(store.getState().count, 1);
    assert.equal(store.getHistory().length, 1);
});
