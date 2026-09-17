import { resolveAssetPath } from '../../server/handlers/resolveAssetPath.js';
import { attrsToString } from '../../../components/utils/attrsToString.js';
import { safeUrl } from '../../../components/utils/safeUrl.js';
export const generateStylesheetTag = (stylesheet, currentPath = '/') => {
    const href = safeUrl(resolveAssetPath(safeUrl(stylesheet.href), currentPath));
    return `<link${attrsToString({ ...stylesheet.attrs, rel: 'stylesheet', href,
        media: stylesheet.media, integrity: stylesheet.integrity, crossorigin: stylesheet.crossOrigin })}>`;
};
