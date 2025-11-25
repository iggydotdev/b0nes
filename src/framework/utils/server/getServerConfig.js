
import path from 'node:path';

import { ENV } from "../../config/envs.js";
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
// Determine base paths based on environment
const CLIENT_BASE = ENV.isDev 
    ? path.resolve(__dirname, '../../client')
    : path.resolve(__dirname, '../../../../public/client');

const COMPONENTS_BASE = ENV.isDev
    ? path.resolve(__dirname, '../../../components')
    : path.resolve(__dirname, '../../../../public/components');

const PAGES_BASE = ENV.isDev
    ? path.resolve(__dirname, '../../../pages')
    : path.resolve(__dirname, '../../../../public/pages');

const CERTS_DIR = path.resolve(__dirname, '../../.certs');

console.log(`[b0nes] Running in ${ENV.isDev ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
console.log(`[b0nes] Project root: ${PROJECT_ROOT}`);
console.log(`[b0nes] Client base: ${CLIENT_BASE}`);
console.log(`[b0nes] Components base: ${COMPONENTS_BASE}`);
console.log(`[b0nes] Pages base: ${PAGES_BASE}`);

export {
    PROJECT_ROOT,
    CLIENT_BASE,
    COMPONENTS_BASE,
    PAGES_BASE,
    CERTS_DIR,
    ENV
}

export default {
    PROJECT_ROOT,
    CLIENT_BASE,
    COMPONENTS_BASE,
    PAGES_BASE,
    CERTS_DIR,
    ENV
}