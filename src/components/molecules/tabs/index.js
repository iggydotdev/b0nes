import { tabs as tabsRender } from './tabs.js';
import { tabs as tabClient } from './tabs.client.js';

export const tabs = {
    render: tabsRender,
    client: tabClient
};

export default tabs.render;