import { accordion } from './index.js';

export const test = () => {
    const actual = accordion({titleSlot: 'Accordion Title', detailsSlot: 'Accordion Details', className: 'custom-accordion', attrs: 'id="my-accordion"'});
    const expected = '<details class="accordion custom-accordion" id="my-accordion"><summary>Accordion Title</summary>Accordion Details</details>';
    return actual === expected? true : console.error({actual, expected}) || false;
};
