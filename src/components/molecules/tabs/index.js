import { tabs as tabsRender } from './tabs.js';
import { client } from './molecules.tabs.client.js';

export const tabs = {
    render: tabsRender,
    client: client
};

export default tabs.render;