export const buildPathname = (pattern, data) => {
    let pathname = pattern;
    // Extract all :params from pattern
    const requiredParams = pattern.match(/:(\w+)/g)?.map(p => p.slice(1)) || [];
    
    // Validate all params exist in data
    const missingParams = requiredParams.filter(param => !(param in data));
    if (missingParams.length > 0) {
        throw new Error(
            `Missing required route parameters: ${missingParams.join(', ')}. ` +
            `Pattern requires: ${requiredParams.join(', ')}. ` +
            `Data has: ${Object.keys(data).join(', ')}`
        );
    }
    Object.entries(data).forEach(([key, value]) => {
        pathname = pathname.replace(`:${key}`, value);
    });
    return pathname;
}