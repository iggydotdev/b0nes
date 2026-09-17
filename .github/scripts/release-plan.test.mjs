import test from 'node:test';
import assert from 'node:assert/strict';
import {releasePlan} from './release-plan.mjs';
const pkg = {version:'0.3.0'};
const lock = {version:'0.3.0',packages:{'':{version:'0.3.0'}}};
test('a new version releases', () => assert.deepEqual(releasePlan(pkg,lock,null,'merge'),{tag:'v0.3.0',release:true}));
test('an unchanged released version skips', () => assert.equal(releasePlan(pkg,lock,'older','merge').release,false));
test('a retry of the same commit can finish publishing', () => assert.equal(releasePlan(pkg,lock,'merge','merge').release,true));
test('inconsistent lock versions fail', () => assert.throws(() => releasePlan(pkg,{...lock,version:'0.2.0'},null,'merge'),/agree/));
test('invalid and prerelease versions fail', () => {
    for (const version of ['01.2.3','1.2','1.2.3-beta.1','1.2.3\nrelease=true']) {
        assert.throws(() => releasePlan({version},lock,null,'merge'),/stable/);
    }
});

test('major bumps are rejected', () => {
    const pkg = {version:'1.0.0'}, lock = {version:'1.0.0',packages:{'':{version:'1.0.0'}}};
    assert.throws(() => releasePlan(pkg,lock,null,'merge','0.2.1'),/Major releases are disabled/);
});
test('minor and patch increases are allowed; downgrades are rejected', () => {
    for (const version of ['0.2.2','0.3.0']) {
        const lock = {version,packages:{'':{version}}};
        assert.equal(releasePlan({version},lock,null,'merge','0.2.1').release,true);
    }
    assert.throws(() => releasePlan(pkg,lock,null,'merge','0.4.0'),/increase/);
});
