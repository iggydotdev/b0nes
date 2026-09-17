/** Allow web/relative URLs and optional navigation protocols; reject active schemes. */
export const safeUrl = (value, { navigation = false } = {}) => {
    const url = String(value ?? '');
    const normalized = url.replace(/[\u0000-\u0020\u007f]/g, '');
    const scheme = normalized.match(/^([a-z][a-z0-9+.-]*):/i)?.[1].toLowerCase();
    if (scheme && !['http', 'https', ...(navigation ? ['mailto', 'tel'] : [])].includes(scheme)) {
        throw new TypeError(`Unsupported URL protocol: ${scheme}`);
    }
    return url;
};
