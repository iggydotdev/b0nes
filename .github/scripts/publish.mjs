import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
export function registryState(result, version) {
    if (result.error) throw result.error;
    let response;
    try { response = JSON.parse(result.stdout); } catch { throw new Error('Invalid npm registry response'); }
    if (result.status === 0 && response === version) return 'published';
    if (result.status !== 0 && response?.error?.code === 'E404') return 'missing';
    throw new Error('Registry lookup failed; refusing to assume the version is unpublished');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const {name,version} = JSON.parse(fs.readFileSync('package.json','utf8'));
    const result = spawnSync('npm',['view',`${name}@${version}`,'version','--json'],{encoding:'utf8'});
    if (registryState(result,version) === 'published') {
        console.log(`${name}@${version} is already published; skipping.`);
    } else {
        if (!process.env.NODE_AUTH_TOKEN) throw new Error('Configure the NPM_TOKEN repository secret before publishing');
        const published = spawnSync('npm',['publish','--access','public'],{stdio:'inherit'});
        if (published.error) throw published.error;
        process.exitCode = published.status ?? 1;
    }
}
