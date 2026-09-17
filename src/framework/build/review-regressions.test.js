import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildPathname } from './pipeline/buildPathName.js';
import { generateRoute } from './pipeline/generateRoute.js';
import { routeOutputPath } from './pipeline/outputPath.js';
import { safeBuildRoute } from './pipeline/ssg.js';
import { copyColocatedAssets } from './pipeline/colocatedAssets.js';
import { copyComponentBehaviors } from './pipeline/copyComponentBehaviors.js';
import { compose, clearCompositionCache } from '../core/compose.js';
import { tabs } from '../../components/molecules/tabs/tabs.js';
import { box } from '../../components/atoms/box/box.js';
import { resolveAssetPath } from '../server/handlers/resolveAssetPath.js';

const fixture = t => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-review-regression-'));
    t.after(() => fs.rmSync(dir, {recursive:true,force:true}));
    return dir;
};

test('dynamic parameters reject traversal and substitute exact names without replacement tokens', () => {
    for (const slug of ['../escape', '../../escape', '..', '.', '', 'a/b', 'a\\b', '%2e%2e', '%2fescape', 'bad\0']) {
        assert.throws(() => buildPathname('/posts/:slug', {slug}), /Unsafe/);
    }
    assert.equal(buildPathname('/:id/:id2/:id', {id:'$&', id2:'café & tea'}), '/%24%26/caf%C3%A9%20%26%20tea/%24%26');
    assert.throws(() => buildPathname('/:slug', Object.create({slug:'inherited'})), /Missing/);
});

test('route writes reject escaping paths and symlink destinations', async t => {
    const dir = fixture(t), out = path.join(dir,'public');
    const route = {pattern:{pathname:'/posts/:slug'},components:[],meta:{interactive:false}};
    await assert.rejects(generateRoute(route,out,[{slug:'../../escaped'}]), /Unsafe/);
    assert.equal(fs.existsSync(path.join(dir,'escaped')),false);
    assert.throws(() => routeOutputPath(out,'/../escaped'), /Unsafe/);
    const outside = path.join(dir,'outside'); fs.mkdirSync(out); fs.mkdirSync(outside);
    fs.symlinkSync(outside,path.join(out,'linked'),'dir');
    await assert.rejects(generateRoute({...route,pattern:{pathname:'/linked'}},out), /Symlink/);
    assert.equal(fs.existsSync(path.join(outside,'index.html')),false);
    await generateRoute(route,out,[{slug:'hello world'}]);
    assert.ok(fs.existsSync(path.join(out,'posts/hello%20world/index.html')));
});

test('failed colocated assets fail route generation', async t => {
    const dir = fixture(t), out = path.join(dir,'public');
    const filePath = path.join(dir,'src/pages/about/index.js');
    fs.mkdirSync(path.dirname(filePath),{recursive:true}); fs.writeFileSync(filePath,'');
    fs.writeFileSync(path.join(path.dirname(filePath),'style.css'),'body{}');
    fs.mkdirSync(path.join(out,'about/style.css'),{recursive:true});
    const route = {pattern:{pathname:'/about'},filePath,load:async()=>({components:[]})};
    const result = await safeBuildRoute(route,out,{continueOnError:true});
    assert.equal(result.success,false); assert.match(result.error,/Failed to copy route assets/);
    assert.equal(fs.existsSync(path.join(out,'about/index.html')),false);
    await assert.rejects(safeBuildRoute(route,out,{continueOnError:false}),/Failed to copy route assets/);
});

test('component and metadata asset URLs match directory and HTML routes', () => {
    clearCompositionCache();
    const tree = [{type:'atom',name:'box',props:{slot:{type:'atom',name:'image',props:{src:'./photo.png',alt:'Photo'}}}}];
    for (const pathname of ['/about','/about/','/about/index.html']) {
        const rendered = compose(tree,{strict:true,route:{pattern:{pathname}}});
        assert.match(rendered,/src="\/about\/photo.png"/);
        assert.equal(resolveAssetPath('./photo.png',pathname),'/about/photo.png');
    }
    assert.match(compose(tree,{strict:true,route:{pattern:{pathname:'/other'}}}),/src="\/other\/photo.png"/);
});

test('public assets exclude tests while preserving runtime modules', async t => {
    const dir = fixture(t), out = path.join(dir,'public');
    const filePath = path.join(dir,'src/pages/about/index.js'); fs.mkdirSync(path.dirname(filePath),{recursive:true});
    for (const name of ['index.js','index.test.js','foo.spec.js','[slug].js','script.js','style.css']) {
        fs.writeFileSync(path.join(path.dirname(filePath),name),'');
    }
    copyColocatedAssets(filePath,out);
    assert.deepEqual(fs.readdirSync(path.join(out,'about')).sort(),['script.js','style.css']);
    await copyComponentBehaviors(out);
    const base = path.join(out,'assets/js/behaviors');
    assert.ok(fs.existsSync(path.join(base,'molecules/tabs/client.js')));
    assert.ok(fs.existsSync(path.join(base,'utils/html.js')));
    assert.equal(fs.existsSync(path.join(base,'utils/generator')),false);
    const scan = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry => entry.isDirectory() ? scan(path.join(dir,entry.name)) : [entry.name]);
    assert.ok(scan(base).every(name => !/\.(test|spec)\.js$/.test(name)));
});

test('serialized component dependencies survive top-level, nested, and cached rendering', () => {
    clearCompositionCache();
    const serialized = JSON.parse(JSON.stringify(tabs({tabs:[{label:'A',content:'B'}]})));
    for (const tree of [[serialized],[{type:'atom',name:'box',props:{slot:serialized}}],[box({slot:serialized})]]) {
        for (let i=0;i<2;i++) {
            const dependencies = new Set();
            assert.match(compose(tree,{dependencies,strict:true}),/data-b0nes="molecules:tabs"/);
            assert.ok(dependencies.has('molecule:tabs'));
        }
    }
    assert.throws(() => compose([{html:'<p>x</p>',dependencies:['atom:../../bad']}],{strict:true}),/Invalid serialized/);
});
