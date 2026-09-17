import test from 'node:test';
import assert from 'node:assert/strict';
import {registryState} from './publish.mjs';
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
