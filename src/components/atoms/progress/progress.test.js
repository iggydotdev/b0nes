// src/components/atoms/progress/progress.test.js
import progress from './index.js';

/**
 * Test suite for progress component
 */

// Test 1: Basic percentage progress
const testPercentageProgress = () => {
    const actual = progress({ value: 75, max: 100 });
    const expected = '<progress class="progress" value="75" max="100">75%</progress>';
    return actual === expected ? true : console.error('testPercentageProgress failed:', {actual, expected}) || false;
};

// Test 2: Step progress (multi-step form)
const testStepProgress = () => {
    const actual = progress({ value: 2, max: 5 });
    const expected = '<progress class="progress" value="2" max="5">2 of 5</progress>';
    return actual === expected ? true : console.error('testStepProgress failed:', {actual, expected}) || false;
};

// Test 3: Indeterminate progress (no value)
const testIndeterminateProgress = () => {
    const actual = progress({ max: 100 });
    const expected = '<progress class="progress" value="0" max="100">0%</progress>';
    return actual === expected ? true : console.error('testIndeterminateProgress failed:', {actual, expected}) || false;
};

// Test 4: With custom class and attributes
const testCustomProgress = () => {
    const actual = progress({ 
        value: 60, 
        max: 100, 
        className: 'upload-progress', 
        attrs: 'id="file-upload"' 
    });
    const expected = '<progress class="progress upload-progress" value="60" max="100" id="file-upload">60%</progress>';
    return actual === expected ? true : console.error('testCustomProgress failed:', {actual, expected}) || false;
};

// Test 5: Zero progress
const testZeroProgress = () => {
    const actual = progress({ value: 0, max: 10 });
    const expected = '<progress class="progress" value="0" max="10">0 of 10</progress>';
    return actual === expected ? true : console.error('testZeroProgress failed:', {actual, expected}) || false;
};

// Test 6: Complete progress
const testCompleteProgress = () => {
    const actual = progress({ value: 100, max: 100 });
    const expected = '<progress class="progress" value="100" max="100">100%</progress>';
    return actual === expected ? true : console.error('testCompleteProgress failed:', {actual, expected}) || false;
};

// Main test export
export const test = () => {
    const tests = [
        testPercentageProgress,
        testStepProgress,
        testIndeterminateProgress,
        testCustomProgress,
        testZeroProgress,
        testCompleteProgress
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
    
    if (failed > 0) {
        console.error(`\nProgress tests: ${passed} passed, ${failed} failed`);
        return false;
    }
    
    return true;
};