// Runs against the packed, upgraded app's built assets and real SSR server.
const checks = [];
const results = document.getElementById('results');
const check = (label, condition) => {
    if (!condition) throw new Error(label);
    checks.push('PASS ' + label);
};
const waitFor = async condition => {
    for (let attempt = 0; attempt < 150; attempt++) {
        if (condition()) return;
        await new Promise(resolve => setTimeout(resolve, 20));
    }
    throw new Error('Upgraded SPA did not reach the expected state');
};
const loadFrame = async src => {
    const frame = document.createElement('iframe');
    const loaded = new Promise((resolve, reject) => { frame.onload = resolve; frame.onerror = reject; });
    frame.src = src; document.body.append(frame); await loaded;
    return frame;
};
try {
    const catalog = await loadFrame('/catalog/first');
    const catalogDocument = catalog.contentDocument;
    check('packed dynamic SSG page renders escaped fetched text', catalogDocument.querySelector('h1')?.textContent === 'First & <article>');
    const cover = catalogDocument.querySelector('img');
    await waitFor(() => cover.complete);
    check('SSG colocated asset loads from its source directory', cover.getAttribute('src') === '/catalog/cover.svg' && cover.naturalWidth === 2);
    check('user public stylesheet survives upgrade and build', catalog.contentWindow.getComputedStyle(catalogDocument.body).getPropertyValue('--user-asset-preserved').trim() === '1');
    catalog.remove();
    const live = await loadFrame('/live/from-browser');
    check('real production SSR resolves request parameters', live.contentDocument.querySelector('h1')?.textContent === 'SSR from-browser');
    await waitFor(() => live.contentDocument.querySelector('img').complete);
    check('SSR colocated asset loads in production', live.contentDocument.querySelector('img').naturalWidth === 2);
    live.remove();
    const app = await loadFrame('/app?view=all#details');
    const appWindow = app.contentWindow, appDocument = app.contentDocument;
    const heading = () => appDocument.getElementById('view-heading')?.textContent;
    await waitFor(() => heading() === 'Upgraded home');
    await appWindow.b0nes.whenReady();
    check('production SPA initializes compiled HTML templates after upgrade', !!appWindow.upgradeTest && heading() === 'Upgraded home');
    check('initial SPA URL retains query and hash', appWindow.location.search === '?view=all' && appWindow.location.hash === '#details');
    appDocument.getElementById('open-item').click();
    await waitFor(() => heading() === 'Item first');
    check('SPA click navigation renders dynamic component descriptors', appWindow.location.pathname === '/app/item/first' && appWindow.upgradeTest.fsm.getContext().id === 'first');
    check('upgraded shared utilities escape nested component slots', appDocument.getElementById('escaped-slot').textContent === '<img src=x> & user text' && !appDocument.getElementById('escaped-slot').querySelector('img'));
    appDocument.getElementById('increment').click();
    await waitFor(() => appDocument.getElementById('item-count')?.textContent === 'Count 1');
    check('async store action commits and refreshes the SPA view', appWindow.upgradeTest.store.get('count') === 1);
    appDocument.getElementById('return-home').click();
    await waitFor(() => heading() === 'Upgraded home');
    const historyLength = appWindow.history.length;
    appWindow.history.back();
    await waitFor(() => heading() === 'Item first');
    check('browser back restores dynamic route and updated store', appWindow.location.pathname === '/app/item/first' && appDocument.getElementById('item-count').textContent === 'Count 1');
    appWindow.history.forward();
    await waitFor(() => heading() === 'Upgraded home');
    check('browser forward restores compiled template without adding history', appWindow.location.pathname === '/app' && appWindow.history.length === historyLength);
    app.remove();
    results.textContent = checks.join('\n') + '\nALL ' + checks.length + ' UPGRADE BROWSER CHECKS PASSED';
} catch (error) {
    results.textContent = checks.join('\n') + '\nFAIL ' + error.message;
    console.error(error);
}
await fetch('/__upgrade-results', { method: 'POST', body: JSON.stringify({ success: !results.textContent.includes('FAIL '), text: results.textContent }) });
