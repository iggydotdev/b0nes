import {dropdown as dropdownRender} from './dropdown.js';
import {client as dropdownClient} from './molecules.dropdown.client.js';

export const dropdown = {
    render: dropdownRender,
    client: dropdownClient
};

export default dropdown.render;