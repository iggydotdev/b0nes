import test from 'node:test';
import assert from 'node:assert/strict';
import {registryState,publishEnvironment} from './publish.mjs';
test('published versions skip and genuine 404s allow publishing', () => {
    assert.equal(registryState({status:0,stdout:'"0.3.0"'},'0.3.0'),'published');
    assert.equal(registryState({status:1,stdout:'{"error":{"code":"E404"}}'},'0.3.0'),'missing');
});
test('registry outages and unexpected responses never authorize publishing', () => {
    for (const result of [{status:1,stdout:'{"error":{"code":"E401"}}'},
        {status:1,stdout:'network timeout'}, {status:0,stdout:'"0.2.0"'}, {error:new Error('spawn failed')}]) {
        assert.throws(() => registryState(result,'0.3.0'));
    }
});

test('default token publishing preserves credentials without attempting OIDC', () => {
    const env = {NODE_AUTH_TOKEN:'publish-token',NPM_ID_TOKEN:'stale-id-token',PATH:'/bin',
        ACTIONS_ID_TOKEN_REQUEST_URL:'https://example.invalid',ACTIONS_ID_TOKEN_REQUEST_TOKEN:'request-token'};
    const result = publishEnvironment(env);
    assert.equal(result.NODE_AUTH_TOKEN,'publish-token');
    assert.equal(result.PATH,'/bin');
    assert.equal(result.NPM_ID_TOKEN,undefined);
    assert.equal(result.ACTIONS_ID_TOKEN_REQUEST_URL,undefined);
    assert.equal(result.ACTIONS_ID_TOKEN_REQUEST_TOKEN,undefined);
    assert.equal(env.ACTIONS_ID_TOKEN_REQUEST_TOKEN,'request-token');
    assert.throws(() => publishEnvironment({}),/NPM_TOKEN/);
});

test('OIDC publishing does not inherit a stored token', () => {
    const env = {NPM_PUBLISH_AUTH:'oidc',NODE_AUTH_TOKEN:'old-token',NPM_TOKEN:'old-token',NPM_ID_TOKEN:'stale-id-token',PATH:'/bin',
        ACTIONS_ID_TOKEN_REQUEST_URL:'https://example.invalid',ACTIONS_ID_TOKEN_REQUEST_TOKEN:'request-token'};
    for (const npm of ['11.5.1','11.6.0','12.0.0','11.5.1\n']) {
        const result = publishEnvironment(env,npm);
        assert.equal(result.NODE_AUTH_TOKEN,'');
        assert.equal(result.NPM_TOKEN,undefined);
        assert.equal(result.NPM_ID_TOKEN,undefined);
        assert.equal(result.PATH,'/bin');
        assert.equal(result.ACTIONS_ID_TOKEN_REQUEST_TOKEN,'request-token');
    }
    assert.equal(env.NODE_AUTH_TOKEN,'old-token');
});

test('OIDC requires its runtime prerequisites and never silently falls back to a token', () => {
    const env = {NPM_PUBLISH_AUTH:'oidc',NODE_AUTH_TOKEN:'valid-token',
        ACTIONS_ID_TOKEN_REQUEST_URL:'https://example.invalid',ACTIONS_ID_TOKEN_REQUEST_TOKEN:'request-token'};
    for (const npm of ['10.9.0','11.4.9','11.5.0','11.5.1-beta.0','not-a-version',undefined]) {
        assert.throws(() => publishEnvironment(env,npm),/npm >=11.5.1/);
    }
    for (const missing of ['ACTIONS_ID_TOKEN_REQUEST_URL','ACTIONS_ID_TOKEN_REQUEST_TOKEN']) {
        assert.throws(() => publishEnvironment({...env,[missing]:''},'11.5.1'),/id-token: write/);
    }
    assert.throws(() => publishEnvironment({NPM_PUBLISH_AUTH:'automatic',NODE_AUTH_TOKEN:'valid-token'}),/token or oidc/);
});
