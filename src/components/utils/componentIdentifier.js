const reserved = new Set(('await break case catch class const continue debugger default delete do else enum export extends false finally for function if implements import in instanceof interface let new null package private protected public return static super switch this throw true try typeof var void while with yield').split(' '));

/** Map a supported component path name to a valid JavaScript export symbol. */
export const componentIdentifier = name => {
    if (typeof name !== 'string' || !/^[a-z0-9-]+$/.test(name)) {
        throw new TypeError('Component name must use lowercase letters, numbers and hyphens');
    }
    let symbol = name.replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase()).replace(/-/g, '_');
    if (!/^[a-zA-Z_$]/.test(symbol) || reserved.has(symbol)) symbol = '_' + symbol;
    return symbol;
};
