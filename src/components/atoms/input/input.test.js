import { input } from './index.js';

export const test = () => {
    const actual = input({type: 'text', attrs: 'placeholder="Enter text" id="text-input"', className: 'custom-input'});
    const expected = '<input type="text" class="input custom-input" placeholder="Enter text" id="text-input"/>';
    return actual === expected? true : console.error({actual, expected}) || false;
};
