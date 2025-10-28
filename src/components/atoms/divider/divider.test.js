import divider from './index.js';

export const test = () => {
    const actual = divider({});
    const expected = '<hr class="divider"/>';
    return actual === expected? true : console.error({actual, expected}) || false;
};
