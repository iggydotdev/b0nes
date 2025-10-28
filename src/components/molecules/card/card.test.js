import card from './index.js';

const customCard = () => {
    const actual = card({attrs: 'id="my-card"', className: 'custom-card', slot: '<p>This is a custom card content.</p>'});
    const expected = '<div class="box card custom-card" id="my-card"><p>This is a custom card content.</p></div>';
    return actual === expected? true : console.error({actual, expected}) || false;
};

customCard();

const standardCard = () => {
    const actual = card({
        attrs: 'id="standard-card"',
        className: 'standard-card',
        headerSlot: '<h2>Card Title</h2>',
        mediaSlot: '<img src="image.jpg" alt="Card Image">',
        linkSlot: '<a href="#">Read More</a>',
        contentSlot: '<p>This is the main content of the card.</p>'
    });
    const expected = '<div class="box card standard-card" id="standard-card"><h2>Card Title</h2><img src="image.jpg" alt="Card Image"><a href="#">Read More</a><p>This is the main content of the card.</p></div>';
    return actual === expected? true : console.error({actual, expected}) || false;
};

//WAIT

standardCard();

export const test = () => {
    return customCard() && standardCard();
}

;