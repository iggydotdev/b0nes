import { button } from './index.js';

/**
 * Test suite for button component
 * Tests basic rendering, attributes, and edge cases
 */

// Test 1: Basic button with submit type
const testSubmitButton = () => {
    const actual = button({
        type: 'submit', 
        slot: 'Click Me', 
        className: 'custom-button', 
        attrs: 'id="my-button" onclick="()=>{alert(`hello`)}"'
    });
    const expected = '<button type="submit" class="btn custom-button" id="my-button" onclick="()=>{alert(`hello`)}">Click Me</button>';
    return actual === expected ? true : console.error('testSubmitButton failed:', {actual, expected}) || false;
};

// Test 2: Default button (no type specified)
const testDefaultButton = () => {
    const actual = button({
        slot: 'Default Button'
    });
    const expected = '<button type="button" class="btn">Default Button</button>';
    return actual === expected ? true : console.error('testDefaultButton failed:', {actual, expected}) || false;
};

// Test 3: Button with disabled attribute
const testDisabledButton = () => {
    const actual = button({
        slot: 'Disabled',
        attrs: 'disabled'
    });
    const expected = '<button type="button" class="btn" disabled>Disabled</button>';
    return actual === expected ? true : console.error('testDisabledButton failed:', {actual, expected}) || false;
};

// Test 4: Button with aria-label
const testAriaButton = () => {
    const actual = button({
        slot: 'Submit',
        attrs: 'aria-label="Submit form"'
    });
    const expected = '<button type="button" class="btn" aria-label="Submit form">Submit</button>';
    return actual === expected ? true : console.error('testAriaButton failed:', {actual, expected}) || false;
};

// Test 5: Button with multiple classes
const testMultipleClasses = () => {
    const actual = button({
        slot: 'Primary',
        className: 'primary large'
    });
    const expected = '<button type="button" class="btn primary large">Primary</button>';
    return actual === expected ? true : console.error('testMultipleClasses failed:', {actual, expected}) || false;
};

// Test 6: Reset button type
const testResetButton = () => {
    const actual = button({
        type: 'reset',
        slot: 'Reset Form'
    });
    const expected = '<button type="reset" class="btn">Reset Form</button>';
    return actual === expected ? true : console.error('testResetButton failed:', {actual, expected}) || false;
};

// Test 7: Button with array slot (nested content)
const testArraySlot = () => {
    const actual = button({
        slot: ['Click ', '<strong>Me</strong>']
    });
    const expected = '<button type="button" class="btn">Click <strong>Me</strong></button>';
    return actual === expected ? true : console.error('testArraySlot failed:', {actual, expected}) || false;
};

// Main test export - runs all tests
export const test = () => {
    const tests = [
        testSubmitButton,
        testDefaultButton,
        testDisabledButton,
        testAriaButton,
        testMultipleClasses,
        testResetButton,
        testArraySlot
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const testFn of tests) {
        if (testFn()) {
            passed++;
        } else {
            failed++;
        }
    }
    
    // Summary
    if (failed > 0) {
        console.error(`\nButton tests: ${passed} passed, ${failed} failed`);
        return false;
    }
    
    return true;
};