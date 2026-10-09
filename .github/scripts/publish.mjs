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
// Authentication is explicit: retain the working token path until npm trust is configured.
export function publishEnvironment(env, npmVersion) {
    const mode = env.NPM_PUBLISH_AUTH || 'token';
    const publishing = {...env};
    // A pre-supplied ID token overrides GitHub's request credentials in npm.
    delete publishing.NPM_ID_TOKEN;
    if (mode === 'token') {
        if (!env.NODE_AUTH_TOKEN) throw new Error('Configure the NPM_TOKEN repository secret before publishing');
        // npm prefers OIDC when available; token mode must not depend on unconfigured trust.
        delete publishing.ACTIONS_ID_TOKEN_REQUEST_URL;
        delete publishing.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
    } else if (mode === 'oidc') {
        if (!env.ACTIONS_ID_TOKEN_REQUEST_URL || !env.ACTIONS_ID_TOKEN_REQUEST_TOKEN) {
            throw new Error('Trusted publishing requires GitHub Actions id-token: write in both caller and publishing workflow');
        }
        const version = /^(\d+)\.(\d+)\.(\d+)$/.exec(npmVersion?.trim() || '');
        const [major, minor, patch] = version ? version.slice(1).map(Number) : [];
        if (!version || major < 11 || (major === 11 && (minor < 5 || (minor === 5 && patch < 1)))) {
            throw new Error('Trusted publishing requires npm >=11.5.1 (the workflow uses Node 24)');
        }
        // Leave setup-node's npmrc interpolation empty, never an unresolved placeholder.
        publishing.NODE_AUTH_TOKEN = '';
        delete publishing.NPM_TOKEN;
    } else {
        throw new Error('NPM_PUBLISH_AUTH must be token or oidc');
    }
    return publishing;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const {name,version} = JSON.parse(fs.readFileSync('package.json','utf8'));
    const result = spawnSync('npm',['view',`${name}@${version}`,'version','--json'],{encoding:'utf8'});
    if (registryState(result,version) === 'published') {
        console.log(`${name}@${version} is already published; skipping.`);
    } else {
        let npmVersion;
        if (process.env.NPM_PUBLISH_AUTH === 'oidc') {
            const result = spawnSync('npm',['--version'],{encoding:'utf8'});
            if (result.error) throw result.error;
            if (result.status !== 0) throw new Error('Unable to determine npm version for trusted publishing');
            npmVersion = result.stdout;
        }
        const env = publishEnvironment(process.env,npmVersion);
        const published = spawnSync('npm',['publish','--access','public'],{stdio:'inherit',env});
        if (published.error) throw published.error;
        process.exitCode = published.status ?? 1;
    }
}
