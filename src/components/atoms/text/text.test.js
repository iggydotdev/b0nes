import test from 'node:test';
import assert from 'node:assert';
import text from './index.js';

test('text rendering', () => {
    const actual = text({is: 'p', slot: 'Hello, World!', className: 'custom-text', attrs: 'id="greeting"'});
    const expected = `<p class="text custom-text" id="greeting">Hello, World!</p>`;
    assert.strictEqual(actual, expected);
});
