import { runInNewContext } from 'node:vm';

// Static imports are parsed by V8. This lexer only finds lazy import() calls,
// including those inside template substitutions, without interpreting JS code.
export const dynamicImportSpecifiers = source => {
    const tokens = [];
    let position = source.startsWith('#!') ? source.indexOf('\n') : 0;
    if (position < 0) return [];
    const scan = interpolation => {
        let regexAllowed = true;
        const braces = [], parentheses = [];
        const add = (value, kind = 'punctuation', literal) => {
            tokens.push({ value, kind, literal });
            regexAllowed = kind === 'identifier'
                ? /^(return|throw|case|yield|await|else|do|typeof|void|delete|in|of|instanceof)$/.test(value)
                : kind === 'punctuation' && ![']', '.', '++', '--'].includes(value);
        };
        while (position < source.length) {
            const ch = source[position];
            if (/\s/.test(ch)) { position++; continue; }
            if (source.startsWith('//', position)) {
                const end = source.indexOf('\n', position + 2);
                position = end < 0 ? source.length : end; continue;
            }
            if (source.startsWith('/*', position)) {
                position = source.indexOf('*/', position + 2) + 2; continue;
            }
            if (ch === '"' || ch === "'") {
                const start = position++;
                while (position < source.length) {
                    if (source[position] === '\\') { position += 2; continue; }
                    if (source[position++] === ch) break;
                }
                add('', 'string', source.slice(start, position)); continue;
            }
            if (ch === '`') {
                const start = position++;
                const token = { value: '', kind: 'string', literal: undefined };
                tokens.push(token);
                let substituted = false;
                while (position < source.length) {
                    if (source[position] === '\\') { position += 2; continue; }
                    if (source[position] === '`') { position++; break; }
                    if (source.startsWith('${', position)) {
                        substituted = true; token.kind = 'template'; position += 2;
                        tokens.push({ value: '{', kind: 'punctuation' });
                        scan(true);
                        tokens.push({ value: '}', kind: 'punctuation' });
                    } else position++;
                }
                if (!substituted) token.literal = source.slice(start, position);
                regexAllowed = false; continue;
            }
            if (ch === '/' && regexAllowed) {
                let end = position + 1, characterClass = false;
                for (; end < source.length && !/[\r\n]/.test(source[end]); end++) {
                    if (source[end] === '\\') { end++; continue; }
                    if (source[end] === '[') characterClass = true;
                    if (source[end] === ']') characterClass = false;
                    if (source[end] === '/' && !characterClass) break;
                }
                if (source[end] === '/') {
                    position = end + 1;
                    while (/[a-z]/i.test(source[position] || '') && position < source.length) position++;
                    add('', 'regex'); continue;
                }
            }
            if (/[\w$]/.test(ch)) {
                const start = position++;
                while (position < source.length && /[\w$]/.test(source[position])) position++;
                add(source.slice(start, position), 'identifier'); continue;
            }
            const previous = tokens.at(-1)?.value;
            if (source.startsWith('++', position) || source.startsWith('--', position)) {
                add(source.slice(position, position + 2)); position += 2; continue;
            }
            position++;
            if (ch === '(') {
                parentheses.push(/^(if|while|for|switch|catch|with)$/.test(previous));
                add(ch);
            } else if (ch === ')') {
                add(ch); regexAllowed = parentheses.pop() === true;
            } else if (ch === '{') {
                braces.push(!['=', '(', '[', ',', ':', 'return'].includes(previous));
                add(ch);
            } else if (ch === '}') {
                if (interpolation && !braces.length) return;
                add(ch); regexAllowed = braces.pop() !== false;
            } else add(ch);
        }
    };
    scan(false);
    const imports = [];
    for (let index = 0; index < tokens.length; index++) {
        if (tokens[index].value !== 'import' || tokens[index - 1]?.value === '.' || tokens[index + 1]?.value !== '(') continue;
        // A method named import is an ordinary property, not a module load.
        let end = index + 2, depth = 1;
        for (; end < tokens.length && depth; end++) {
            if (tokens[end].value === '(') depth++;
            if (tokens[end].value === ')') depth--;
        }
        if (tokens[end]?.value === '{') continue;
        const argument = tokens[index + 2], next = tokens[index + 3]?.value;
        if (argument?.kind !== 'string' || !argument.literal || ![',', ')'].includes(next)) {
            throw new Error('Dynamic template imports must use literal module paths; computed import() paths cannot be emitted');
        }
        imports.push(runInNewContext(argument.literal, undefined, { timeout: 100 }));
    }
    return imports;
};
