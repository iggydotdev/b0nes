import test from 'node:test';
import assert from 'node:assert/strict';

// Exercise the fallback on both Node versions, comparing with native matching
// wherever the runtime supplies it. Restore the native global after loading.
const native = globalThis.URLPattern;
delete globalThis.URLPattern;
const {URLPattern: Polyfill} = await import('./urlPattern.js?fallback-tests');
if (native) globalThis.URLPattern = native;
const constructors = native ? [Polyfill, native] : [Polyfill];

test('URLPattern fallback matches parameters with literal prefixes and suffixes', () => {
    for (const Pattern of constructors) {
        for (const [pattern, pathname, groups] of [
            ['/posts/book-:id', '/posts/book-42', {id:'42'}],
            ['/posts/:slug.json', '/posts/hello.json', {slug:'hello'}],
            ['/posts/prefix-:id-:slug', '/posts/prefix-a-b-c', {id:'a',slug:'b-c'}],
            ['/docs/release.v:version.json', '/docs/release.v4.2.json', {version:'4.2'}]
        ]) {
            const result = new Pattern({pathname:pattern}).exec('https://example.test' + pathname);
            assert.ok(result, pattern);
            assert.deepEqual({...result.pathname.groups}, groups, pattern);
        }
        assert.equal(new Pattern({pathname:'/docs/release.v:version.json'}).test('/docs/releaseXv4.json'), false);
    }
});

test('URLPattern parameters preserve encoded slashes while refusing real slash boundaries', () => {
    for (const Pattern of constructors) {
        for (const pattern of ['/posts/:slug', '/posts/book-:slug.json']) {
            const prefix = pattern.includes('book-') ? '/posts/book-' : '/posts/';
            const suffix = pattern.endsWith('.json') ? '.json' : '';
            const route = new Pattern({pathname:pattern});
            assert.equal(route.exec(prefix + 'a%2Fb' + suffix).pathname.groups.slug, 'a%2Fb');
            assert.equal(route.exec(prefix + 'a/b' + suffix), null);
            assert.equal(route.exec(prefix + suffix), null);
        }
    }
});
