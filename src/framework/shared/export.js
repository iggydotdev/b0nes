// export-site.js
import { fromConfig } from './mapper.js';


const page = store.getState().pages.home;
const components = page.components.map(fromConfig).join('\n');

const code = `
import { renderPage } from 'b0nes/framework/core/render.js';
import { compose } from 'b0nes/framework/core/compose.js';
${page.imports}

export const components = [
  ${components}
];

console.log(renderPage(compose(components), { title: 'My Site' }));
`;

download(code, 'site.js');