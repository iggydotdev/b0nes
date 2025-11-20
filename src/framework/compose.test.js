import { compose, clearCompositionCache, getCompositionCacheSize } from './compose.js';

const tests = [
    {
        name: 'Basic component composition',
        fn: () => {
            const result = compose([
                {
                    type: 'atom',
                    name: 'text',
                    props: { is: 'p', slot: 'Hello' }
                }
            ]);
            return result.includes('Hello');
        }
    },

    {
        name: 'Missing component shows error fallback',
        fn: () => {
            clearCompositionCache();
            const result = compose([
                {
                    type: 'atom',
                    name: 'nonexistent-component',
                    props: {}
                }
            ]);
            return result.includes('Component Error') && result.includes('ef4444');
        }
    },

    {
        name: 'Caching works - same component rendered twice',
        fn: () => {
            clearCompositionCache();
            const component = {
                type: 'atom',
                name: 'text',
                props: { is: 'p', slot: 'Cached' }
            };
            compose([component]);
            const sizeBefore = getCompositionCacheSize();
            compose([component]);
            const sizeAfter = getCompositionCacheSize();
            return sizeBefore === sizeAfter && sizeBefore === 1;
        }
    },

    {
        name: 'Cache cleared successfully',
        fn: () => {
            compose([{ type: 'atom', name: 'text', props: { is: 'p', slot: 'Test' } }]);
            clearCompositionCache();
            return getCompositionCacheSize() === 0;
        }
    },

    {
        name: 'Nested components compose correctly',
        fn: () => {
            clearCompositionCache();
            const result = compose([
                {
                    type: 'molecule',
                    name: 'card',
                    props: {
                        slot: [
                            {
                                type: 'atom',
                                name: 'text',
                                props: { is: 'p', slot: 'Card content' }
                            }
                        ]
                    }
                }
            ]);
            return result.includes('Card content') && !result.includes('Component Error');
        }
    },

    {
        name: 'Invalid component object returns empty string',
        fn: () => {
            clearCompositionCache();
            const result = compose([null, undefined, { type: 'atom' }, {}]);
            return result === '';
        }
    }
];

let passed = 0;
let failed = 0;

console.log('\n🧪 Testing compose.js\n');

tests.forEach((test, index) => {
    try {
        const result = test.fn();
        if (result) {
            console.log(`✓ Test ${index + 1}: ${test.name}`);
            passed++;
        } else {
            console.log(`✗ Test ${index + 1}: ${test.name}`);
            failed++;
        }
    } catch (error) {
        console.log(`✗ Test ${index + 1}: ${test.name}`);
        console.log(`  Error: ${error.message}`);
        failed++;
    }
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
