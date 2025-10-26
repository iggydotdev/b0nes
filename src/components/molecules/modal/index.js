import {modal as modalRender} from './modal.js';
import {modalTrigger} from './modal.js';
import {modalClient} from './modal.client.js'; 

export const modal = {
    render: modalRender,
    trigger: modalTrigger,
    ...modalClient
};

export default modal.trigger;