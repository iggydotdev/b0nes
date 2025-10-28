import text from './index.js';

export const test = () => {
    const actual = text({is: 'p', slot: 'Hello, World!', className: 'custom-text', attrs: 'id="greeting"'});
    const expected = `<p class="text custom-text" id="greeting">Hello, World!</p>`;
    return actual === expected? true : console.error({actual, expected}) || false;
};
