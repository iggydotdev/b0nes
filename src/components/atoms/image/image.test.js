import test from 'node:test';
import assert from 'node:assert';
import image from './index.js';

test('image rendering', () => { 
    const actual = image({src: 'https://picsum.photos/200/300',  attrs: 'id="example-image"',alt:"Example Image", className: 'custom-image'});
    const expected = '<img src="https://picsum.photos/200/300" class="image custom-image" alt="Example Image" id="example-image"/>';
    assert.strictEqual(actual, expected);
});
