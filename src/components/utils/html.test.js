import test from 'node:test';
import assert from 'node:assert/strict';
import { text } from '../atoms/text/text.js';
import { button } from '../atoms/button/button.js';
import { modal } from '../molecules/modal/modal.js';
import { tabs } from '../molecules/tabs/tabs.js';
import { html, isHTML, scriptData } from './html.js';
import { attrsToString } from './attrsToString.js';
import { compose, clearCompositionCache } from '../../framework/core/compose.js';
import { renderPage } from '../../framework/core/render.js';

test('plain text escapes once; nested rendered components and explicit HTML stay markup', () => {
    const child = text({ is: 'strong', slot: '<img src=x> & save' });
    assert.ok(isHTML(child));
    assert.equal(html(child), child);
    assert.match(String(button({ slot: child })), /<strong class="text">&lt;img src=x&gt; &amp; save<\/strong>/);
    assert.match(String(button({ slot: '<b>save</b>' })), /&lt;b&gt;save&lt;\/b&gt;/);
    assert.match(String(button({ slot: html('<b>save</b>') })), /<b>save<\/b>/);
    const config = [{ type:'molecule', name:'modal', props: { id:'dialog', title:'A & B',
        slot: {type:'atom',name:'button',props:{slot:'Save & close'}} } }];
    const result = compose(config, { strict: true });
    assert.match(result, /<button type="button" class="btn">Save &amp; close<\/button>/);
    assert.match(result, />A &amp; B<\/h2>/);
    assert.ok(!result.includes('&amp;amp;'));
    assert.match(String(modal({id:'d',slot:child})), /<strong/);
    assert.match(String(tabs({tabs:[{label:'<img>',content:child}]})), /&lt;img&gt;/);
});

test('direct child behavior dependencies survive composition cache hits', () => {
    clearCompositionCache();
    const tree = [{type:'atom',name:'box',props:{slot:tabs({tabs:[{label:'A',content:'B'}]})}}];
    for (let i=0;i<2;i++) {
        const dependencies = new Set();
        compose(tree, {strict:true,dependencies});
        assert.ok(dependencies.has('molecule:tabs'));
    }
    assert.notEqual(compose([{type:'atom',name:'box',props:{slot:'<b>x</b>'}}]),
        compose([{type:'atom',name:'box',props:{slot:html('<b>x</b>')}}]));
});

test('metadata and object attributes escape data and reject executable URLs', () => {
    const result = renderPage('body $&', {interactive:false,title:'<script>$&</script>',
        description:'" onload="bad',lang:'en" bad="yes',stylesheets:'/tailwind.css'});
    assert.ok(result.includes('<title>&lt;script&gt;$&amp;&lt;/script&gt;</title>'));
    assert.ok(result.includes('content="&quot; onload=&quot;bad"'));
    assert.ok(result.includes('lang="en&quot; bad=&quot;yes"'));
    assert.ok(result.includes('body $&'));
    assert.ok(result.includes('<link'));
    assert.throws(() => attrsToString({onload:'bad()'}), /Executable attributes/i);
    assert.throws(() => attrsToString({href:'java\nscript:bad()'}), /scheme|URL/i);
    assert.throws(() => renderPage('', {scripts:['javascript:bad()']}), /scheme|URL/i);
    assert.throws(() => text({is:'script',slot:'bad()'}), /explicit/);
    assert.match(renderPage('',{inlineScripts:['console.log("ready")']}), /console.log\("ready"\)/);
    assert.throws(() => renderPage('',{inlineScripts:['</script>']}), /script/);
    const data = {value:'</script><img>&'};
    assert.ok(!scriptData(data).includes('<'));
    assert.deepEqual(JSON.parse(scriptData(data)), data);
});

test('permissive cached fallback cannot hide a strict render failure', () => {
    const config = [{type:'atom',name:'button',props:{type:'bad',slot:'Go'}}];
    compose(config);
    assert.throws(() => compose(config,{strict:true}), /button/);
    assert.throws(() => compose([{type:'atom',name:'toString'}],{strict:true}), /not found/);
});
