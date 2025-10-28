import source from '../source/index.js';
import picture from './index.js';

export const test = () => {
    const actual = picture({ attrs: 'id="picture-element"', className: 'custom-picture', slot: [source({ type: 'image', src: 'image.jpg', attrs: 'id="image-source"', className: 'custom-image' }), '...slot content goes here...'] });
    const expected = '<picture class="picture custom-picture" id="picture-element"><source src="image.jpg" class="img-src custom-image" id="image-source"/>...slot content goes here...</picture>';
    return actual === expected? true : console.error({actual, expected}) || false;
};
