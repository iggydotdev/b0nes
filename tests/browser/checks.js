import { client as tabs } from '/src/components/molecules/tabs/client.js';
import { client as modal } from '/src/components/molecules/modal/client.js';
const results = document.getElementById('results');
const checks = [];
const check = (name, condition) => { if (!condition) throw Error(name); checks.push('PASS ' + name); };
const key = (value, shiftKey = false) => document.activeElement.dispatchEvent(
    new KeyboardEvent('keydown', { key:value, shiftKey, bubbles:true, cancelable:true }));
try {
    const groups = [...document.querySelectorAll('.tabs')];
    check('all panels visible before enhancement', [...document.querySelectorAll('.tab-panel')].every(p => !p.hidden));
    const cleanup = groups.map(tabs);
    const controls = [...document.querySelectorAll('[role="tab"]')];
    const ids = [...document.querySelectorAll('[id]')].map(el => el.id);
    check('IDs unique even for cached identical tab trees', ids.length === new Set(ids).size);
    check('tab controls reference their own labelled panels', controls.every(b =>
        document.getElementById(b.getAttribute('aria-controls'))?.getAttribute('aria-labelledby') === b.id));
    controls[0].focus(); key('End');
    check('End selects last tab and changes roving tabindex', document.activeElement === controls[1] && controls[1].tabIndex === 0 && controls[0].tabIndex === -1);
    check('selection only affects its own group', controls[2].getAttribute('aria-selected') === 'true');
    key('ArrowRight'); check('ArrowRight wraps', document.activeElement === controls[0]);
    key('ArrowLeft'); check('ArrowLeft wraps', document.activeElement === controls[1]);
    key('Home'); check('Home selects first', document.activeElement === controls[0]);
    cleanup[0]();
    check('cleanup restores readable panels', [...groups[0].querySelectorAll('.tab-panel')].every(p => !p.hidden));
    tabs(groups[0]);

    const dialog = document.getElementById('test-dialog');
    check('nested modal components render actual controls', !!dialog.querySelector('input') && !!dialog.querySelector('#last'));
    const destroy = modal(dialog);
    const opener = document.getElementById('opener');
    document.body.style.overflow = 'scroll';
    opener.click();
    const first = dialog.querySelector('button');
    const last = document.getElementById('last');
    check('opening focuses first control', document.activeElement === first);
    key('Tab', true); check('Shift+Tab wraps to last', document.activeElement === last);
    key('Tab'); check('Tab wraps to first', document.activeElement === first);
    document.getElementById('outside').focus();
    check('outside focus is contained', document.activeElement === first);
    key('Escape');
    check('Escape closes and restores opener focus', dialog.getAttribute('aria-hidden') === 'true' && document.activeElement === opener);
    check('previous body overflow restored', document.body.style.overflow === 'scroll');
    opener.click(); destroy();
    check('cleanup restores focus and overflow', document.activeElement === opener && document.body.style.overflow === 'scroll');
    modal(dialog);

    const empty = document.getElementById('empty-dialog');
    empty.querySelector('button').remove();
    const cleanupEmpty = modal(empty);
    const trigger = document.createElement('button');
    trigger.setAttribute('data-modal-open', empty.id); document.body.append(trigger); trigger.click();
    check('empty dialog focuses fallback target', document.activeElement === empty);
    key('Tab'); check('empty dialog retains focus on Tab', document.activeElement === empty);
    cleanupEmpty(); trigger.remove();

    const disposeEmpty = modal(empty);
    const nestedTrigger = document.createElement('button');
    nestedTrigger.setAttribute('data-modal-open', empty.id);
    nestedTrigger.textContent = 'Open nested'; dialog.querySelector('.modal-body').append(nestedTrigger);
    opener.click(); nestedTrigger.click();
    check('nested modal takes focus', document.activeElement === empty);
    key('Escape');
    check('closing nested modal restores parent focus and keeps scroll locked',
        document.activeElement === nestedTrigger && document.body.style.overflow === 'hidden');
    key('Escape');
    check('closing final modal restores original focus and scroll',
        document.activeElement === opener && document.body.style.overflow === 'scroll');
    disposeEmpty(); nestedTrigger.remove();
    const frame = document.createElement('iframe');
    frame.src = '/production'; document.body.append(frame);
    await new Promise((resolve, reject) => {
        frame.onload = resolve;
        frame.onerror = () => reject(Error('Production page failed to load'));
    });
    const runtime = frame.contentWindow.b0nes;
    check('production ESM entry loads runtime', !!runtime);
    await runtime.whenReady();
    check('production entry initializes shipped multi-step form',
        !!frame.contentDocument.querySelector('[data-b0nes="organisms:multi-step-form"][data-b0nes-init="true"]'));
    let atom = 0, molecule = 0;
    runtime.register('atoms:collision', () => { atom++; });
    runtime.register('molecules:collision', () => { molecule++; });
    const container = frame.contentDocument.createElement('div');
    container.innerHTML = '<div data-b0nes="atoms:collision"></div><div data-b0nes="molecules:collision"></div>';
    frame.contentDocument.body.append(container);
    runtime.init(container); runtime.init(container);
    check('qualified behavior names do not collide or initialize twice', atom === 1 && molecule === 1);
    const [firstCollision, secondCollision] = container.children;
    runtime.destroy(firstCollision); runtime.destroy(secondCollision);
    check('destroy clears instances even without cleanup callbacks', !firstCollision.dataset.b0nesInit && !secondCollision.dataset.b0nesInit);
    container.remove();
    const pending = frame.contentDocument.createElement('div');
    pending.dataset.b0nes = 'atoms:pending'; frame.contentDocument.body.append(pending);
    runtime.init(pending); runtime.init(pending); runtime.destroy(pending);
    await runtime.whenReady();
    check('destroy cancels pending lazy initialization', !pending.dataset.calls && !pending.dataset.b0nesInit);
    runtime.init(pending); runtime.init(pending);
    check('canceled element can initialize once on retry', pending.dataset.calls === '1');
    runtime.destroy(pending); pending.remove();
    const { compose: clientCompose } = await import('/assets/js/client/compose.js');
    const dynamic = await clientCompose([{type:'molecule',name:'modal',props:{id:'dynamic',title:'A & B',
        slot:{type:'atom',name:'button',props:{slot:'<img src=x> & save'}}}}]);
    const host = document.createElement('div'); host.innerHTML = dynamic;
    check('production client composition works on localhost with nested controls',
        host.querySelector('.modal-body button')?.textContent === '<img src=x> & save' && !host.querySelector('img'));
    check('client titles escape exactly once', host.querySelector('.modal-title')?.textContent === 'A & B');
    frame.remove();
    const waitFor = async condition => {
        for (let attempt = 0; attempt < 100; attempt++) {
            if (condition()) return;
            await new Promise(resolve => setTimeout(resolve, 20));
        }
        throw Error('SPA view did not reach the expected state');
    };
    const spaFrame = document.createElement('iframe');
    spaFrame.src = '/spa/first?view=all#details'; document.body.append(spaFrame);
    await new Promise((resolve, reject) => { spaFrame.onload = resolve; spaFrame.onerror = reject; });
    const spaWindow = spaFrame.contentWindow, spaDocument = spaFrame.contentDocument;
    const heading = () => spaDocument.getElementById('spa-heading')?.textContent;
    await waitFor(() => heading() === 'Item first');
    await spaWindow.b0nes.whenReady();
    const spaRoot = spaDocument.querySelector('[data-b0nes="organisms:spa"]');
    check('production SPA renders compiled HTML at the initial dynamic URL',
        heading() === 'Item first' && spaWindow.location.search === '?view=all' && spaWindow.location.hash === '#details');
    check('SPA behavior registers a synchronous cleanup', typeof spaWindow.b0nes.instanceCleanup.get(spaRoot) === 'function');
    spaDocument.getElementById('spa-add').click();
    await waitFor(() => spaRoot.querySelectorAll('li').length === 2);
    check('SPA refreshes generic store-dependent structure', spaRoot.querySelectorAll('li').length === 2);
    spaDocument.getElementById('spa-home').click();
    await waitFor(() => heading() === 'Home');
    check('SPA click navigation updates state and URL', spaWindow.spaTest.fsm.is('home') && spaWindow.location.pathname === '/spa');
    spaDocument.getElementById('spa-item').click();
    await waitFor(() => heading() === 'Item second');
    const historyLength = spaWindow.history.length;
    spaWindow.history.back();
    await waitFor(() => heading() === 'Home');
    check('SPA back renders the previous route without adding history', spaWindow.location.pathname === '/spa' && spaWindow.history.length === historyLength);
    spaWindow.history.back();
    await waitFor(() => heading() === 'Item first');
    check('SPA back restores the original dynamic route parameters', spaWindow.spaTest.fsm.getContext().id === 'first');
    spaWindow.history.forward();
    await waitFor(() => heading() === 'Home');
    spaWindow.history.forward();
    await waitFor(() => heading() === 'Item second');
    check('SPA forward restores dynamic state and view', spaWindow.spaTest.fsm.is('item') && spaWindow.spaTest.fsm.getContext().id === 'second');
    spaWindow.spaTest.fsm.send('GOTO_COMPONENTS');
    await waitFor(() => spaRoot.textContent === '<img src=x> & user text');
    check('SPA component templates retain escaped slots', !spaRoot.querySelector('img'));
    spaWindow.spaTest.fsm.send('GOTO_BINDINGS');
    await waitFor(() => spaDocument.getElementById('spa-bound-text')?.textContent === '<img src=x> & bound');
    check('SPA text/value bindings display markup as text',
        spaDocument.getElementById('spa-bound-value').value === '<img src=x> & bound' && !spaDocument.getElementById('spa-bound-text').querySelector('img'));
    check('SPA checked/title/className bindings remain supported',
        spaDocument.getElementById('spa-bound-checked').checked && spaDocument.getElementById('spa-bound-title').title === 'Bound title' && spaDocument.getElementById('spa-bound-class').className === 'bound-class');
    check('SPA rejects executable URL bindings and HTML property sinks',
        spaDocument.getElementById('spa-bound-url').getAttribute('href') === '/safe' &&
        spaDocument.getElementById('spa-bound-src').getAttribute('src') === '/safe-image.png' &&
        spaDocument.getElementById('spa-bound-frame').getAttribute('srcdoc') === 'Safe' &&
        spaDocument.getElementById('spa-bound-html').textContent === 'Safe text' && !spaWindow.spaBindingExecuted);
    const boundInput = spaDocument.getElementById('spa-bound-value');
    boundInput.focus();
    spaWindow.spaTest.store.dispatch('patch', { text:'Updated text', checked:false, unsafeURL:'/allowed', unsafeSource:'/allowed-image.png' });
    check('static SPA bindings update safely while preserving the focused input',
        spaDocument.getElementById('spa-bound-value') === boundInput && spaDocument.activeElement === boundInput && boundInput.value === 'Updated text' && !spaDocument.getElementById('spa-bound-checked').checked &&
        spaDocument.getElementById('spa-bound-url').getAttribute('href') === '/allowed' && spaDocument.getElementById('spa-bound-src').getAttribute('src') === '/allowed-image.png');
    spaWindow.spaTest.fsm.send('GOTO_WIDGETS');
    await waitFor(() => spaRoot.querySelector('[role=tab]'));
    await spaWindow.b0nes.whenReady();
    check('SPA initializes behaviors in newly rendered views', spaRoot.querySelectorAll('[data-b0nes-init=true]').length === 1 && spaRoot.querySelectorAll('.tab-panel[hidden]').length === 1);
    spaWindow.spaTest.fsm.send('GOTO_SLOW');
    spaWindow.spaTest.fsm.send('GOTO_HOME');
    await waitFor(() => heading() === 'Home');
    check('SPA navigation disposes the previous view behaviors', spaWindow.b0nes.getMemoryStats().activeInstances === 1);
    spaWindow.resolveSpaSlow('<h2 id="spa-heading">Stale</h2>');
    await new Promise(resolve => setTimeout(resolve, 40));
    check('late async SPA templates cannot overwrite newer navigation', heading() === 'Home');
    spaWindow.spaTest.fsm.send('GOTO_SLOW');
    const pathBeforeCleanup = spaWindow.location.pathname;
    let throwingCleanupCalls = 0;
    spaWindow.b0nes.register('atoms:throw-cleanup', () => () => { throwingCleanupCalls++; throw Error('Expected cleanup regression error'); });
    const throwingChild = spaDocument.createElement('div'); throwingChild.dataset.b0nes = 'atoms:throw-cleanup'; spaRoot.append(throwingChild);
    const cleanupAction = spaDocument.createElement('button'); cleanupAction.dataset.action = 'add'; spaRoot.append(cleanupAction);
    spaWindow.b0nes.init(throwingChild);
    spaWindow.b0nes.destroy(spaRoot);
    const beforeCleanup = spaRoot.innerHTML;
    check('SPA cleanup continues after a child behavior throws', throwingCleanupCalls === 1 && spaWindow.b0nes.getMemoryStats().activeInstances === 0);
    spaWindow.resolveSpaSlow('<h2>Disposed</h2>');
    spaWindow.spaTest.store.dispatch('add');
    const countAfterCleanup = spaWindow.spaTest.store.get('count'); cleanupAction.click();
    check('SPA removes store-action listeners despite child cleanup errors', spaWindow.spaTest.store.get('count') === countAfterCleanup);
    spaWindow.spaTest.fsm.send('GOTO_ITEM', { id: 'after-cleanup' });
    await new Promise(resolve => setTimeout(resolve, 40));
    check('destroying SPA detaches rendering, store, and history listeners',
        spaRoot.innerHTML === beforeCleanup && spaWindow.location.pathname === pathBeforeCleanup && spaWindow.b0nes.getMemoryStats().activeInstances === 0);
    spaFrame.remove();
    results.textContent = checks.join('\n') + '\nALL ' + checks.length + ' BROWSER CHECKS PASSED';
} catch (error) {
    results.textContent = checks.join('\n') + '\nFAIL ' + error.message;
    console.error(error);
}
await fetch('/results', {method:'POST',body:JSON.stringify({success:!results.textContent.includes('FAIL '),checks,text:results.textContent})});
