import link from './index.js';

export const test = () => {
    const actual = link({url: 'https://example.com', slot: 'Example', className: 'custom-link', attrs: 'target="_blank" rel="noopener noreferrer"'});
    const expected = '<a href="https://example.com" class="link custom-link" target="_blank" rel="noopener noreferrer">Example</a>';
    return actual === expected? true : console.error({actual, expected}) || false;
};
