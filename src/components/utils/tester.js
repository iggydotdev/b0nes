import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { URL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runTest = async (testPath) => {
    try {
        // Convert file path to proper file:// URL
        const fileUrl = new URL(`file://${testPath}`);
        const module = await import(fileUrl);
        
        if (!module.test || typeof module.test !== 'function') {
            console.warn(`  ⚠️  No test export found`);
            return false;
        }

        const result = await module.test();
        if (result === true) {
            console.log(`  ✓ PASS`);
            return true;
        } else {
            console.log(`  ✗ FAIL`);
            return false;
        }
    } catch (err) {
        console.error(`  ✗ ERROR\n     ${err.message}`);
        return false;
    }
};

const tester = async () => {
    const atomsDir = path.join(__dirname, '../atoms');
    const moleculesDir = path.join(__dirname, '../molecules');
    const organismsDir = path.join(__dirname, '../organisms');
    
    console.log('\n📦 Testing atoms:');
    const folders = [
        { name: 'atoms', path: atomsDir },
        { name: 'molecules', path: moleculesDir },
        { name: 'organisms', path: organismsDir }
    ];

    let totalTests = 0;
    let passedTests = 0;

    for (const folder of folders) {
        try {
            const components = fs.readdirSync(folder.path)
                .filter(dir => fs.statSync(path.join(folder.path, dir)).isDirectory());

            for (const component of components) {
                const componentPath = path.join(folder.path, component);
                const files = fs.readdirSync(componentPath);
                const testFile = files.find(f => f.endsWith('.test.js'));

                if (testFile) {
                    totalTests++;
                    const testPath = path.resolve(componentPath, testFile);
                    console.log(`testing file: `, testFile);
                    const passed = await runTest(testPath);
                    if (passed) passedTests++;
                }
            }
        } catch (err) {
            console.error(`Error reading ${folder.name}: ${err.message}`);
        }
    }

    console.log(`\nTest Summary: ${passedTests}/${totalTests} passed`);
    process.exit(passedTests === totalTests ? 0 : 1);
};

tester();