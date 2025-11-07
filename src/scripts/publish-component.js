// scripts/publish-component.js
#!/usr/bin/env node

import { resolve, basename, dirname } from 'path';
import { readdir, readFile, writeFile, copyFile } from 'fs/promises';
import { existsSync } from 'fs';

const componentPath = resolve(process.argv[2] || '.');
const name = basename(componentPath);
const typeDir = basename(dirname(componentPath)); // atoms, molecules, organisms
const type = typeDir.slice(0, -1);

const required = [`${name}.js`, `${name}.test.js`];
if (!required.every(f => existsSync(`${componentPath}/${f}`))) {
  console.error(`Missing: ${required.join(', ')}`);
  process.exit(1);
}

const clientFile = existsSync(`${componentPath}/${name}.client.js`)
  ? `./${name}.client.js`
  : null;

// Generate manifest IN THE COMPONENT FOLDER
const manifest = {
  name,
  version: "1.0.0",
  type,
  description: `A ${type}: ${name}`,
  author: "you@dev.com",
  tags: [type, "ui"],
  files: {
    component: `./${name}.js`,
    test: `./${name}.test.js`,
    ...(clientFile && { client: clientFile })
  },
  dependencies: [],
  peerDependencies: { b0nes: ">=0.2.0" }
};

await writeFile(`${componentPath}/b0nes.manifest.json`, JSON.stringify(manifest, null, 2));

console.log(`Published: ${componentPath}`);
console.log(`Manifest: b0nes.manifest.json`);
console.log(`Share: https://github.com/you/b0nes-components/tree/main/${typeDir}/${name}`);
console.log(`Install: npm run install-component ${componentPath}`);