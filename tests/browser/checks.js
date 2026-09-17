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
    results.textContent = checks.join('\n') + '\nALL ' + checks.length + ' BROWSER CHECKS PASSED';
} catch (error) {
    results.textContent = checks.join('\n') + '\nFAIL ' + error.message;
    console.error(error);
}
await fetch('/results', {method:'POST',body:JSON.stringify({success:!results.textContent.includes('FAIL '),checks,text:results.textContent})});
