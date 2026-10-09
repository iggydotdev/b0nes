import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import * as utils from 'b0nes/utils';
import { text, button, html, compose, renderPage, atoms, molecules, organisms } from 'b0nes';
import library from './components/library.js';
import { clearErrors, getErrorStats, getErrors } from 'b0nes/compose';

test('every declared utility is available through the public package export', () => {
    const declarations = readFileSync(new URL('./components/utils/index.d.ts', import.meta.url), 'utf8');
    const declared = [...declarations.matchAll(/export\s+(?:function|class)\s+(\w+)/g)].map(match => match[1]);
    assert.deepEqual(declared.sort(), Object.keys(utils).sort());
    for (const name of declared) assert.equal(typeof utils[name], 'function', name);
    assert.equal(utils.processSlotTrusted('<em>Legacy markup</em>'), '<em>Legacy markup</em>');
    assert.equal(utils.processSlotUser('<em>Text</em>'), '&lt;em&gt;Text&lt;/em&gt;');
    assert.equal(utils.mergeClasses('base shared', ['shared', 'a"b'], { active: true }), 'base shared a&quot;b active');
    assert.equal(utils.createClassString('button', ['large']), 'button button-large');
    assert.throws(() => utils.validatePropTypes({ size: 'big' }, { size: 'number' }, { componentName: 'test', componentType: 'atom' }), /size/);
});

test('every shipped component is available in its public category registry', () => {
    for (const [category, registry] of Object.entries({ atoms, molecules, organisms })) {
        assert.deepEqual(Object.keys(registry).sort(), Object.keys(library[category]).sort(), category);
        for (const name of Object.keys(registry)) assert.equal(registry[name], library[category][name], `${category}/${name}`);
    }
});

test('public rendering examples preserve component structure and escape text', () => {
    const label = text({ is: 'strong', slot: 'Save & continue' });
    const control = button({ slot: label });
    assert.equal(utils.isHTML(control), true);
    assert.match(String(control), /<strong[^>]*>Save &amp; continue<\/strong>/);
    assert.match(String(button({ slot: '<script>text</script>' })), /&lt;script&gt;text&lt;\/script&gt;/);
    const content = compose([{ type: 'atom', name: 'box', props: { is: 'section', slot: [control, html('<p>Trusted</p>')] } }], { strict: true });
    const page = renderPage(content, { title: 'Example <page>', interactive: false, stylesheets: ['/styles/site.css'] });
    assert.match(page, /<title>Example &lt;page&gt;<\/title>/);
    assert.match(page, /<p>Trusted<\/p>/);
    assert.match(page, /href="\/styles\/site.css"/);
});

test('composition error statistics match the declared public shape', () => {
    clearErrors();
    // text requires an element name: the ordinary composer records render errors.
    compose([{ type: 'atom', name: 'text', props: { slot: 'missing is' } }]);
    assert.deepEqual(getErrorStats(), { total: 1, byType: { render_error: 1 } });
    const [error] = getErrors();
    assert.equal(error.component, 'atom/text');
    assert.equal(typeof error.message, 'string');
    assert.equal(typeof error.timestamp, 'number');
    clearErrors();
});

test('generated hyphenated, digit and reserved names import, register and render', t => {
    const root = mkdtempSync(path.join(tmpdir(), 'b0nes-generator-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    cpSync(new URL('./', import.meta.url), path.join(root, 'src'), { recursive: true });
    cpSync(new URL('../package.json', import.meta.url), path.join(root, 'package.json'));
    const script = `
        import assert from 'node:assert/strict';
        import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
        import { createComponent } from './src/components/utils/generator/index.js';
        const names = ['my-card', '2fa-card', 'class'];
        for (const name of names) createComponent('atom', name);
        const { atoms, myCard, _2faCard, _class } = await import('./src/components/atoms/index.js');
        for (const [name, render] of names.map((name, i) => [name, [myCard, _2faCard, _class][i]])) {
            assert.equal(atoms[name], render);
            assert.match(String(render({ className: '', slot: 'A <card>' })), /A &lt;card&gt;/);
        }
        const { compose } = await import('./src/framework/core/compose.js');
        assert.match(compose([{ type: 'atom', name: 'my-card', props: { slot: 'Registered', className: '' } }], { strict: true }), /Registered/);
        const before = readFileSync('./src/components/atoms/my-card/my-card.js', 'utf8');
        assert.throws(() => createComponent('atom', 'my-card'), /already exists/);
        assert.equal(readFileSync('./src/components/atoms/my-card/my-card.js', 'utf8'), before);
        createComponent('atom', 'foo-1');
        assert.throws(() => createComponent('atom', 'foo1'), /already exists/);
        const lock = './src/components/atoms/.b0nes-component-registry.lock';
        writeFileSync(lock, 'existing generator or installer');
        const registryBefore = readFileSync('./src/components/atoms/index.js', 'utf8');
        assert.throws(() => createComponent('atom', 'lock-card'), { code: 'EEXIST' });
        assert.equal(existsSync('./src/components/atoms/lock-card'), false);
        assert.equal(readFileSync('./src/components/atoms/index.js', 'utf8'), registryBefore);
        unlinkSync(lock);
    `;
    execFileSync(process.execPath, ['--input-type=module', '-e', script], { cwd: root, stdio: 'pipe' });
});
