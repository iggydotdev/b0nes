import header from './index.js';

export const test = () => {
    const actual = header({ attrs: 'data-test="header"', className: 'custom-header', slot: '<h1 class="header-title">This is the header</h1>' });
    const expected = '<header class="header custom-header" data-test="header"><h1 class="header-title">This is the header</h1></header>';
    return actual === expected? true : console.error({actual, expected}) || false;
};
