import test from 'node:test';
import assert from 'node:assert';
import cta from './index.js';
import { text, link } from '../../atoms/index.js';

test('cta rendering', () => {
    const actual = cta({
        slot:[
            text({is: 'p', slot: ['Text']}), 
            link({url: '#', slot:['Read More'] })
        ] 
    });
    const expected = '<div class="box cta" role="cta"><p class="text">Text</p><a href="#" class="link">Read More</a></div>';
    assert.strictEqual(actual, expected);
});
