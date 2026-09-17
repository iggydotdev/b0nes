import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from './store.js';

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
