import {modal as modalRender} from './modal.js';
import {modalClient} from './modal.client.js'; 

export const modal = {
    render: modalRender,
    client: modalClient
};

export default modal.render;