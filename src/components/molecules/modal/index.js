import {modal as modalRender} from './modal.js';
import {client} from './molecules.modal.client.js'; 

export const modal = {
    render: modalRender,
    client: client
};

export default modal.render;