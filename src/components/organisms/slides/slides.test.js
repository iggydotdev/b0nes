// src/components/organisms/slides/slides.test.js
import slides from './index.js';

/**
 * Test suite for slides component
 */

// Test 1: Basic slides rendering with multiple slides
const testBasicSlides = () => {
    const actual = slides({
        slides: [
            { title: 'Slide 1', content: '<h1>First Slide</h1>' },
            { title: 'Slide 2', content: '<h1>Second Slide</h1>' },
            { title: 'Slide 3', content: '<h1>Third Slide</h1>' }
        ]
    });
    
    const hasContainer = actual.includes('class="slides"');
    const hasSlidesContainer = actual.includes('slides-container');
    const hasSlideElements = actual.includes('data-slide="0"') && 
                            actual.includes('data-slide="1"') && 
                            actual.includes('data-slide="2"');
    const hasControls = actual.includes('slides-controls');
    const hasIndicator = actual.includes('3 / 3');
    const hasContent = actual.includes('First Slide') && 
                      actual.includes('Second Slide') && 
                      actual.includes('Third Slide');
    
    if (!hasContainer || !hasSlidesContainer || !hasSlideElements || !hasControls || !hasIndicator || !hasContent) {
        console.error('testBasicSlides failed:', {
            hasContainer,
            hasSlidesContainer,
            hasSlideElements,
            hasControls,
            hasIndicator,
            hasContent,
            actual
        });
        return false;
    }
    
    return true;
};

// Test 2: Single slide rendering
const testSingleSlide = () => {
    const actual = slides({
        slides: [
            { title: 'Only Slide', content: '<h1>Solo</h1>' }
        ]
    });
    
    const hasSingleSlide = actual.includes('data-slide="0"');
    const hasCorrectCount = actual.includes('1 / 1');
    const hasContent = actual.includes('Solo');
    
    if (!hasSingleSlide || !hasCorrectCount || !hasContent) {
        console.error('testSingleSlide failed:', {
            hasSingleSlide,
            hasCorrectCount,
            hasContent,
            actual
        });
        return false;
    }
    
    return true;
};

// Test 3: First slide is active
const testFirstSlideActive = () => {
    const actual = slides({
        slides: [
            { title: 'Slide 1', content: '<h1>First</h1>' },
            { title: 'Slide 2', content: '<h1>Second</h1>' }
        ]
    });
    
    // First slide should have 'active' class
    const hasActiveOnFirst = actual.includes('class="slide active"');
    
    if (!hasActiveOnFirst) {
        console.error('testFirstSlideActive failed:', {
            hasActiveOnFirst,
            actual
        });
        return false;
    }
    
    return true;
};

// Test 4: Slide with background color
const testSlideWithBackground = () => {
    const actual = slides({
        slides: [
            { 
                title: 'Styled Slide', 
                content: '<h1>Colored</h1>',
                background: '#ff0000'
            }
        ]
    });
    
    const hasBackground = actual.includes('style="background: #ff0000"');
    
    if (!hasBackground) {
        console.error('testSlideWithBackground failed:', {
            hasBackground,
            actual
        });
        return false;
    }
    
    return true;
};

// Test 5: Slide with array content
const testSlideWithArrayContent = () => {
    const actual = slides({
        slides: [
            { 
                title: 'Array Content', 
                content: ['<h1>Part 1</h1>', '<p>Part 2</p>']
            }
        ]
    });
    
    const hasPart1 = actual.includes('Part 1');
    const hasPart2 = actual.includes('Part 2');
    
    if (!hasPart1 || !hasPart2) {
        console.error('testSlideWithArrayContent failed:', {
            hasPart1,
            hasPart2,
            actual
        });
        return false;
    }
    
    return true;
};

// Test 6: Custom className
const testCustomClassName = () => {
    const actual = slides({
        className: 'custom-slides dark-theme',
        slides: [
            { title: 'Slide 1', content: '<h1>Custom</h1>' }
        ]
    });
    
    const hasBaseClass = actual.includes('class="slides');
    const hasCustomClass = actual.includes('custom-slides') && actual.includes('dark-theme');
    
    if (!hasBaseClass || !hasCustomClass) {
        console.error('testCustomClassName failed:', {
            hasBaseClass,
            hasCustomClass,
            actual
        });
        return false;
    }
    
    return true;
};

// Test 7: Custom attributes
const testCustomAttributes = () => {
    const actual = slides({
        attrs: 'id="presentation" data-theme="dark"',
        slides: [
            { title: 'Slide 1', content: '<h1>Attrs</h1>' }
        ]
    });
    
    const hasId = actual.includes('id="presentation"');
    const hasDataAttr = actual.includes('data-theme="dark"');
    
    if (!hasId || !hasDataAttr) {
        console.error('testCustomAttributes failed:', {
            hasId,
            hasDataAttr,
            actual
        });
        return false;
    }
    
    return true;
};

// Test 8: b0nes initialization attribute
const testB0nesAttribute = () => {
    const actual = slides({
        slides: [
            { title: 'Slide 1', content: '<h1>B0nes</h1>' }
        ]
    });
    
    const hasB0nesAttr = actual.includes('data-b0nes="organisms:slides"');
    
    if (!hasB0nesAttr) {
        console.error('testB0nesAttribute failed:', {
            hasB0nesAttr,
            actual
        });
        return false;
    }
    
    return true;
};

// Test 9: Navigation controls exist
const testNavigationControls = () => {
    const actual = slides({
        slides: [
            { title: 'Slide 1', content: '<h1>One</h1>' },
            { title: 'Slide 2', content: '<h1>Two</h1>' }
        ]
    });
    
    const hasPrevBtn = actual.includes('data-action="prev"') && actual.includes('← Prev');
    const hasNextBtn = actual.includes('data-action="next"') && actual.includes('Next →');
    const hasIndicator = actual.includes('slide-indicator');
    
    if (!hasPrevBtn || !hasNextBtn || !hasIndicator) {
        console.error('testNavigationControls failed:', {
            hasPrevBtn,
            hasNextBtn,
            hasIndicator,
            actual
        });
        return false;
    }
    
    return true;
};

// Test 10: Accessibility attributes
const testAccessibilityAttributes = () => {
    const actual = slides({
        slides: [
            { title: 'Title Slide', content: '<h1>Welcome</h1>' },
            { title: 'Content Slide', content: '<h1>Main Points</h1>' }
        ]
    });
    
    const hasRolePresentation = actual.includes('role="presentation"');
    const hasRoleRegion = actual.includes('role="region"');
    const hasAriaLabel = actual.includes('aria-label="Slide');
    const hasAriaLive = actual.includes('aria-live="polite"');
    const hasAriaAtomic = actual.includes('aria-atomic="true"');
    
    if (!hasRolePresentation || !hasRoleRegion || !hasAriaLabel || !hasAriaLive || !hasAriaAtomic) {
        console.error('testAccessibilityAttributes failed:', {
            hasRolePresentation,
            hasRoleRegion,
            hasAriaLabel,
            hasAriaLive,
            hasAriaAtomic,
            actual
        });
        return false;
    }
    
    return true;
};

// Test 11: Correct slide numbering
const testSlideNumbering = () => {
    const actual = slides({
        slides: [
            { title: 'Slide 1', content: '<h1>1</h1>' },
            { title: 'Slide 2', content: '<h1>2</h1>' },
            { title: 'Slide 3', content: '<h1>3</h1>' },
            { title: 'Slide 4', content: '<h1>4</h1>' },
            { title: 'Slide 5', content: '<h1>5</h1>' }
        ]
    });
    
    const hasSlideNumbers = actual.includes('slide-number') && actual.includes('5 / 5');
    const countMatches = (actual.match(/data-slide="/g) || []).length === 5;
    
    if (!hasSlideNumbers || !countMatches) {
        console.error('testSlideNumbering failed:', {
            hasSlideNumbers,
            countMatches,
            actual
        });
        return false;
    }
    
    return true;
};

// Test 12: Empty slides array warning (edge case)
const testEmptySlides = () => {
    const actual = slides({
        slides: []
    });
    
    // Should return empty string when no slides
    const isEmpty = actual === '';
    
    if (!isEmpty) {
        console.error('testEmptySlides failed:', {
            isEmpty,
            actual
        });
        return false;
    }
    
    return true;
};

// ============================================
// Main test export
// ============================================

export const test = () => {
    const tests = [
        { name: 'testBasicSlides', fn: testBasicSlides },
        { name: 'testSingleSlide', fn: testSingleSlide },
        { name: 'testFirstSlideActive', fn: testFirstSlideActive },
        { name: 'testSlideWithBackground', fn: testSlideWithBackground },
        { name: 'testSlideWithArrayContent', fn: testSlideWithArrayContent },
        { name: 'testCustomClassName', fn: testCustomClassName },
        { name: 'testCustomAttributes', fn: testCustomAttributes },
        { name: 'testB0nesAttribute', fn: testB0nesAttribute },
        { name: 'testNavigationControls', fn: testNavigationControls },
        { name: 'testAccessibilityAttributes', fn: testAccessibilityAttributes },
        { name: 'testSlideNumbering', fn: testSlideNumbering },
        { name: 'testEmptySlides', fn: testEmptySlides }
    ];
    
    let passed = 0;
    let failed = 0;
    
    console.log('\n📊 Slides Component Tests\n');
    
    for (const test of tests) {
        try {
            if (test.fn()) {
                passed++;
                console.log(`  ✓ ${test.name}`);
            } else {
                failed++;
                console.log(`  ✗ ${test.name}`);
            }
        } catch (error) {
            failed++;
            console.log(`  ✗ ${test.name} - ${error.message}`);
        }
    }
    
    console.log(`\nSlides Component Tests: ${passed} passed, ${failed} failed\n`);
    
    return failed === 0;
};
