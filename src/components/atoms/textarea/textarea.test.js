import { textarea } from './index.js';

export const test = () => {
    const actual = textarea({ attrs: 'placeholder="Enter text" id="text-area"', className: 'custom-textarea' });
    const expected = '<textarea class="textarea custom-textarea" placeholder="Enter text" id="text-area"/>';
    return actual === expected? true : console.error({actual, expected}) || false;
};
