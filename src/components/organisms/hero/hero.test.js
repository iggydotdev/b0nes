import test from 'node:test';
import assert from 'node:assert';
import hero from './index.js';
import { text } from '../../atoms/index.js';

test('hero rendering', () => {
    const actual = hero({ attrs: 'data-test="hero"', className: 'custom-hero', slot: [text({is: 'h1', className:"hero-title", slot: 'This is the hero section'})]});
    const expected = '<div class="box hero custom-hero" role="hero" data-test="hero"><h1 class="text hero-title">This is the hero section</h1></div>';
    assert.strictEqual(actual, expected);
});
