import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function releasePlan(pkg, lock, taggedCommit, commit, previousVersion) {
    if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(pkg.version)) {
        throw new Error('Automatic releases require a stable major.minor.patch version');
    }
    if (!pkg.version.startsWith('0.')) throw new Error('Major releases are disabled; versions must remain on 0.x.x');
    if (lock.version !== pkg.version || lock.packages?.['']?.version !== pkg.version) {
        throw new Error('package.json and package-lock.json versions must agree');
    }
    if (previousVersion) {
        const before = previousVersion.split('.').map(Number);
        const after = pkg.version.split('.').map(Number);
        if (after[0] !== before[0]) throw new Error('Major releases are disabled; use a minor or patch bump');
        if (!taggedCommit && (after[1] < before[1] || (after[1] === before[1] && after[2] <= before[2]))) {
            throw new Error('New releases must increase the minor or patch version');
        }
    }
    return { tag: `v${pkg.version}`, release: !taggedCommit || taggedCommit === commit };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
    const lock = JSON.parse(fs.readFileSync('package-lock.json','utf8'));
    const git = (...args) => execFileSync('git',args,{encoding:'utf8'}).trim();
    const commit = git('rev-parse','HEAD');
    const tag = `v${pkg.version}`;
    // Validate before passing a version to Git or writing workflow outputs.
    releasePlan(pkg,lock,null,commit);
    const exists = git('tag','--list',tag) === tag;
    const previousTag = git('tag','--list','v*','--sort=-version:refname').split('\n')
        .find(value => /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value));
    const previousVersion = previousTag ? previousTag.slice(1)
        : JSON.parse(git('show','HEAD^:package.json')).version;
    const plan = releasePlan(pkg,lock,exists ? git('rev-list','-n','1',tag) : null,commit,previousVersion);
    fs.appendFileSync(process.env.GITHUB_OUTPUT,`tag=${plan.tag}\nrelease=${plan.release}\n`);
    console.log(plan.release ? `Release candidate: ${plan.tag}` : `${plan.tag} already belongs to a previous commit; skipping.`);
}
