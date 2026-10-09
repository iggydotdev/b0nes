import test from 'node:test';
import assert from 'node:assert/strict';
import { dynamicImportSpecifiers } from './pipeline/dynamicImports.js';

test('lazy imports find literal and escaped paths, including import attributes', () => {
    assert.deepEqual(dynamicImportSpecifiers(String.raw`
        const load = () => import('./lazy.js');
        const escaped = () => import("./la\u007ay.js");
        const json = () => import('./data.json', { with: { type: 'json' } });
    ` + "const template = () => import(`./other.js`);"), ['./lazy.js', './lazy.js', './data.json', './other.js']);
});

test('lazy imports ignore comments, strings, regexes, template text, and property methods', () => {
    const source = [
        `// import('private-comment')`,
        `/* import('private-block') */`,
        `const text = "import('private-string')";`,
        `const pattern = /import\\('private-regex'\\)/;`,
        "const template = `import('private-template')`;",
        `const object = { import(value) { return value; } };`,
        `object.import('private-method'); object?.import('private-optional-method');`,
        `if (true) /import\\('private-control-regex'\\)/.test(text);`,
        `function done() {} /import\\('private-block-regex'\\)/.test(text);`,
        `const load = () => import('./real.js');`
    ].join('\n');
    assert.deepEqual(dynamicImportSpecifiers(source), ['./real.js']);
});

test('lazy imports scan template substitutions and division operands', () => {
    const source = [
        "const template = `result ${import('./inside.js')} ${`nested ${import('./nested.js')}`}`;",
        "const ratio = ({}) / import('./divisor.js');",
        "let value = 1; const other = value++ / import('./postfix.js');"
    ].join('\n');
    assert.deepEqual(dynamicImportSpecifiers(source), ['./inside.js', './nested.js', './divisor.js', './postfix.js']);
});

for (const source of ["import(filename)", "import('./' + name)", 'import(`./${name}.js`)']) {
    test(`computed lazy paths are rejected: ${source}`, () => {
        assert.throws(() => dynamicImportSpecifiers(source), /literal module paths/);
    });
}
