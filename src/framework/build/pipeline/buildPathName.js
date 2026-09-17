/** Substitute each parameter as a single URL segment, never as a filesystem path. */
export const buildPathname = (pattern, data) => pattern.replace(/:(\w+)/g, (_, key) => {
    if (!data || !Object.hasOwn(data, key)) throw new Error(`Missing required route parameter: ${key}`);
    const value = data[key];
    if (!['string', 'number'].includes(typeof value)) throw new TypeError(`Invalid route parameter: ${key}`);
    const segment = String(value);
    let decoded = segment;
    try { decoded = decodeURIComponent(segment); } catch { /* Literal percent is encoded below. */ }
    if (!segment || [segment, decoded].some(part => part === '.' || part === '..' || /[/\\\x00-\x1f\x7f]/.test(part))) {
        throw new Error(`Unsafe route parameter: ${key}`);
    }
    return encodeURIComponent(segment);
});
