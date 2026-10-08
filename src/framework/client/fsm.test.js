import test from 'node:test';
import assert from 'node:assert/strict';
import { createRouterFSM, connectFSMtoDOM } from './fsm.js';

const flush = () => new Promise(resolve => setImmediate(resolve));
function environment(t, pathname = '/app') {
    const previous = globalThis.window;
    const events = new EventTarget();
    const pushes = [];
    const browser = {
        location: new URL(pathname, 'https://example.test'),
        history: { pushState(state, _, url) { pushes.push({ state, url }); browser.location = new URL(url, browser.location); } },
        addEventListener: events.addEventListener.bind(events),
        removeEventListener: events.removeEventListener.bind(events),
        dispatchEvent: events.dispatchEvent.bind(events)
    };
    globalThis.window = browser;
    t.after(() => { if (previous === undefined) delete globalThis.window; else globalThis.window = previous; });
    const root = Object.assign(new EventTarget(), { innerHTML: '', contains: () => true });
    return { browser, pushes, root };
}

test('router chooses the initial dynamic route and renders compiled HTML without changing history', async t => {
    const { root, pushes } = environment(t, '/app/A%20B');
    const routes = [
        { name: 'home', url: '/app', template: '<h1>Home</h1>' },
        { name: 'item', url: '/app/:id', template: context => `<h1>${context.id}</h1>`, onEnter: () => ({ entered: true }) }
    ];
    const { fsm, routes: normalized } = createRouterFSM(routes);
    assert.equal(fsm.getState(), 'item');
    assert.equal(fsm.getContext().id, 'A B');
    assert.ok(normalized.every(route => typeof route.pattern.exec === 'function'));
    // Raw definitions remain supported by the connector.
    const cleanup = connectFSMtoDOM(fsm, root, routes);
    await flush();
    assert.equal(root.innerHTML, '<h1>A B</h1>');
    assert.equal(fsm.getContext().entered, true);
    assert.deepEqual(pushes, []);
    cleanup();
});

test('navigation encodes route parameters and popstate renders without pushing another entry', async t => {
    const { browser, root, pushes } = environment(t);
    const routes = [
        { name: 'home', url: '/app', template: '<h1>Home</h1>' },
        { name: 'item', url: '/app/:id', template: context => `<h1>${context.id}</h1>` }
    ];
    const { fsm } = createRouterFSM(routes);
    const cleanup = connectFSMtoDOM(fsm, root, routes);
    await flush();
    fsm.send('GOTO_ITEM', { id: 'a/b', routes });
    await flush();
    assert.equal(browser.location.pathname, '/app/a%2Fb');
    assert.equal(root.innerHTML, '<h1>a/b</h1>');
    assert.equal(pushes.length, 1);
    browser.location = new URL('https://example.test/app');
    browser.dispatchEvent(new Event('popstate'));
    await flush();
    assert.equal(fsm.getState(), 'home');
    assert.equal(root.innerHTML, '<h1>Home</h1>');
    assert.equal(pushes.length, 1);
    browser.location = new URL('https://example.test/app/c');
    browser.dispatchEvent(new Event('popstate'));
    await flush();
    assert.equal(fsm.getState(), 'item');
    assert.equal(root.innerHTML, '<h1>c</h1>');
    cleanup();
    browser.location = new URL('https://example.test/app');
    browser.dispatchEvent(new Event('popstate'));
    fsm.send('GOTO_HOME');
    await flush();
    assert.equal(root.innerHTML, '<h1>c</h1>');
    assert.equal(pushes.length, 1);
});

test('late template results cannot overwrite newer routes or update a disposed view', async t => {
    const { root } = environment(t);
    let resolveSlow;
    const routes = [
        { name: 'home', url: '/app', template: () => new Promise(resolve => { resolveSlow = resolve; }) },
        { name: 'fast', url: '/fast', template: '<h1>Fast</h1>' }
    ];
    const { fsm } = createRouterFSM(routes);
    const cleanup = connectFSMtoDOM(fsm, root, routes);
    fsm.send('GOTO_FAST');
    await flush();
    resolveSlow('<h1>Old</h1>');
    await flush();
    assert.equal(root.innerHTML, '<h1>Fast</h1>');
    fsm.send('GOTO_HOME');
    cleanup();
    resolveSlow('<h1>Disposed</h1>');
    await flush();
    assert.equal(root.innerHTML, '<h1>Fast</h1>');
});

test('router rejects absent routes and duplicate event names', t => {
    environment(t);
    assert.throws(() => createRouterFSM([]), /At least one route/);
    assert.throws(() => createRouterFSM([
        { name: 'item', url: '/app', template: '' }, { name: 'ITEM', url: '/other', template: '' }
    ]), /unique names/);
    assert.throws(() => createRouterFSM([{ name: 'bad', url: '//external.test', template: '' }]), /local URL paths/);
});


test('entry hook parameter defaults and normalization drive both URL and rendered context', async t => {
    const { browser, root, pushes } = environment(t);
    const routes = [
        { name: 'home', url: '/app', template: '<h1>Home</h1>' },
        { name: 'item', url: '/app/:id', template: context => `<h1>${context.id}</h1>`,
            onEnter: (_, data) => ({ id: String(data?.id ?? 'default').toUpperCase() }) }
    ];
    const { fsm } = createRouterFSM(routes);
    const cleanup = connectFSMtoDOM(fsm, root, routes);
    fsm.send('GOTO_ITEM', { id: 'lower' });
    await flush();
    assert.equal(fsm.getContext().id, 'LOWER');
    assert.equal(root.innerHTML, '<h1>LOWER</h1>');
    assert.equal(browser.location.pathname, '/app/LOWER');
    fsm.send('GOTO_HOME');
    fsm.send('GOTO_ITEM');
    await flush();
    assert.equal(fsm.getContext().id, 'DEFAULT');
    assert.equal(root.innerHTML, '<h1>DEFAULT</h1>');
    assert.equal(browser.location.pathname, '/app/DEFAULT');
    assert.equal(pushes.length, 3);
    cleanup();
});
