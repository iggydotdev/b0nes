import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = fileURLToPath(new URL('../', import.meta.url));
const counts = process.argv.slice(2).length ? process.argv.slice(2).map(Number) : [10,100];
if (counts.some(n => !Number.isInteger(n) || n < 1 || n > 10000)) throw Error('Use route counts from 1 to 10000');
for (const count of counts) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-benchmark-'));
    try {
        fs.cpSync(path.join(root,'src'),path.join(dir,'src'),{recursive:true});
        fs.writeFileSync(path.join(dir,'package.json'),'{"type":"module"}');
        const pages = path.join(dir,'src/pages');
        fs.rmSync(pages,{recursive:true,force:true}); fs.mkdirSync(pages);
        for (let i=0;i<count;i++) {
            const page = path.join(pages, `page-${i}`);
            fs.mkdirSync(page);
            fs.writeFileSync(path.join(page, 'index.js'),
                `export const components = [{type:'atom',name:'text',props:{is:'h1',slot:'Page ${i}'}}];`);
        }
        for (const parallel of [false,true]) {
            const start = performance.now();
            const result = spawnSync(process.execPath,['src/framework/build/cli.js','build','--clean',
                ...(parallel ? ['--parallel'] : [])], {cwd:dir,encoding:'utf8',timeout:120000});
            if (result.status !== 0) throw Error(result.stdout + result.stderr);
            for (let i=0;i<count;i++) {
                if (!fs.existsSync(path.join(dir,'public',`page-${i}`,'index.html'))) throw Error('Benchmark route was not generated');
            }
            console.log(JSON.stringify({routes:count,parallel,milliseconds:Math.round(performance.now()-start),node:process.version}));
        }
    } finally { fs.rmSync(dir,{recursive:true,force:true}); }
}
