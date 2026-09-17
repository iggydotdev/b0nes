// Uses an installed Chromium browser; no npm browser automation dependencies.
import { fork, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-chrome-'));
const fixture = fork(fileURLToPath(new URL('./server.mjs',import.meta.url)), [], {
    env:{...process.env,PORT:'0'}, stdio:['ignore','inherit','inherit','ipc']
});
let browser;
let finished = false;
const finish = (code, message) => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    console.log(message);
    fixture.kill();
    if (browser && browser.exitCode === null) {
        browser.once('exit', () => fs.rmSync(profile,{recursive:true,force:true}));
        browser.kill();
    } else fs.rmSync(profile,{recursive:true,force:true});
    process.exitCode = code;
};
const timer = setTimeout(() => finish(1,'Browser checks timed out'), 45000);
fixture.on('error', error => finish(1,error.message));
fixture.on('exit', () => { if (!finished) finish(1,'Browser fixture exited early'); });
fixture.on('message', message => {
    if (message.type === 'ready') {
        browser = spawn(process.env.CHROME_BIN || 'google-chrome', [
            '--headless', '--no-sandbox', '--disable-gpu', '--no-first-run',
            `--user-data-dir=${profile}`, message.url
        ], {stdio:['ignore','ignore','inherit']});
        browser.on('error', error => finish(1, error.message));
        browser.on('exit', () => { if (!finished) finish(1,'Browser exited before reporting checks'); });
    }
    if (message.type === 'results') finish(message.success ? 0 : 1, message.text);
});
