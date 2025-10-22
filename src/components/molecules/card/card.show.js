import { card } from "./card.js";
export const show = () => {
return card({
        attrs: 'id="standard-card"',
        className: 'standard-card',
        headerSlot: '<h2>Card Title</h2>',
        mediaSlot: '<img src="https://picsum.photos/200/300" alt="Card Image">',
        linkSlot: '<a href="https://picsum.photos/200/300">Read More</a>',
        contentSlot: '<p>This is the main content of the card.</p>'
    });
}