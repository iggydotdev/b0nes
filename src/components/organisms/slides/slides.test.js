import test from 'node:test';
import assert from 'node:assert';
import slides from './index.js';

test('slides - basic slides rendering with multiple slides', () => {
    const actual = slides({
        slides: [
            { title: 'Slide 1', content: '<h1>First Slide</h1>' },
            { title: 'Slide 2', content: '<h1>Second Slide</h1>' },
            { title: 'Slide 3', content: '<h1>Third Slide</h1>' }
        ]
    });
    
    assert.ok(actual.includes('class="slides"'));
    assert.ok(actual.includes('slides-container'));
    assert.ok(actual.includes('data-slide="0"') && 
              actual.includes('data-slide="1"') && 
              actual.includes('data-slide="2"'));
    assert.ok(actual.includes('slides-controls'));
    assert.ok(actual.includes('3 / 3'));
    assert.ok(actual.includes('First Slide') && 
              actual.includes('Second Slide') && 
              actual.includes('Third Slide'));
});

test('slides - single slide rendering', () => {
    const actual = slides({
        slides: [
            { title: 'Only Slide', content: '<h1>Solo</h1>' }
        ]
    });
    
    assert.ok(actual.includes('data-slide="0"'));
    assert.ok(actual.includes('1 / 1'));
    assert.ok(actual.includes('Solo'));
});

test('slides - first slide is active', () => {
    const actual = slides({
        slides: [
            { title: 'Slide 1', content: '<h1>First</h1>' },
            { title: 'Slide 2', content: '<h1>Second</h1>' }
        ]
    });
    
    assert.ok(actual.includes('class="slide active"'));
});

test('slides - slide with background color', () => {
    const actual = slides({
        slides: [
            { 
                title: 'Styled Slide', 
                content: '<h1>Colored</h1>',
                background: '#ff0000'
            }
        ]
    });
    
    assert.ok(actual.includes('style="background: #ff0000"'));
});

test('slides - slide with array content', () => {
    const actual = slides({
        slides: [
            { 
                title: 'Array Content', 
                content: ['<h1>Part 1</h1>', '<p>Part 2</p>']
            }
        ]
    });
    
    assert.ok(actual.includes('Part 1'));
    assert.ok(actual.includes('Part 2'));
});

test('slides - custom className', () => {
    const actual = slides({
        className: 'custom-slides dark-theme',
        slides: [
            { title: 'Slide 1', content: '<h1>Custom</h1>' }
        ]
    });
    
    assert.ok(actual.includes('class="slides'));
    assert.ok(actual.includes('custom-slides') && actual.includes('dark-theme'));
});

test('slides - custom attributes', () => {
    const actual = slides({
        attrs: 'id="presentation" data-theme="dark"',
        slides: [
            { title: 'Slide 1', content: '<h1>Attrs</h1>' }
        ]
    });
    
    assert.ok(actual.includes('id="presentation"'));
    assert.ok(actual.includes('data-theme="dark"'));
});

test('slides - b0nes initialization attribute', () => {
    const actual = slides({
        slides: [
            { title: 'Slide 1', content: '<h1>B0nes</h1>' }
        ]
    });
    
    assert.ok(actual.includes('data-b0nes="organisms:slides"'));
});

test('slides - navigation controls exist', () => {
    const actual = slides({
        slides: [
            { title: 'Slide 1', content: '<h1>One</h1>' },
            { title: 'Slide 2', content: '<h1>Two</h1>' }
        ]
    });
    
    assert.ok(actual.includes('data-action="prev"') && actual.includes('← Prev'));
    assert.ok(actual.includes('data-action="next"') && actual.includes('Next →'));
    assert.ok(actual.includes('slide-indicator'));
});

test('slides - accessibility attributes', () => {
    const actual = slides({
        slides: [
            { title: 'Title Slide', content: '<h1>Welcome</h1>' },
            { title: 'Content Slide', content: '<h1>Main Points</h1>' }
        ]
    });
    
    assert.ok(actual.includes('role="presentation"'));
    assert.ok(actual.includes('role="region"'));
    assert.ok(actual.includes('aria-label="Slide'));
    assert.ok(actual.includes('aria-live="polite"'));
    assert.ok(actual.includes('aria-atomic="true"'));
});

test('slides - slide numbering', () => {
    const actual = slides({
        slides: [
            { title: 'Slide 1', content: '<h1>1</h1>' },
            { title: 'Slide 2', content: '<h1>2</h1>' },
            { title: 'Slide 3', content: '<h1>3</h1>' },
            { title: 'Slide 4', content: '<h1>4</h1>' },
            { title: 'Slide 5', content: '<h1>5</h1>' }
        ]
    });
    
    assert.ok(actual.includes('slide-number') && actual.includes('5 / 5'));
    assert.strictEqual((actual.match(/data-slide="/g) || []).length, 5);
});

test('slides - empty slides array warning (edge case)', () => {
    const actual = slides({
        slides: []
    });
    
    assert.strictEqual(actual, '');
});
