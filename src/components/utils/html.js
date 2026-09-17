import { escapeHtml } from './escapeHtml.js';

// Symbol identity also survives loading the utility from source and built URLs.
const brand = Symbol.for('b0nes.trusted-html');
export class TrustedHTML extends String {
    constructor(value, dependencies = []) {
        super(value);
        Object.defineProperty(this, brand, { value: true });
        Object.defineProperty(this, 'dependencies', { value: Object.freeze([...dependencies]) });
        Object.freeze(this);
    }
    toJSON() { return { html: String(this), dependencies: this.dependencies }; }
}
export const isHTML = value => value instanceof String && value[brand] === true;
/** Explicit trust assertion, NOT an HTML sanitizer. */
export const html = value => {
    if (isHTML(value)) return value;
    if (typeof value !== 'string') throw new TypeError('html() expects a string or component result');
    return new TrustedHTML(value);
};
/** Restore the explicit serialized HTML form, including validated behavior metadata. */
export const restoreHTML = value => {
    const markup = html(value.html);
    const dependencies = value.dependencies ?? [];
    if (!Array.isArray(dependencies) || dependencies.some(id =>
        typeof id !== 'string' || !/^(atom|molecule|organism):[a-z0-9-]+$/.test(id))) {
        throw new TypeError('Invalid serialized HTML dependencies');
    }
    return new TrustedHTML(String(markup), dependencies);
};
export const toHTMLString = value => String(value ?? '');
export const content = value => {
    if (value == null) return '';
    if (isHTML(value)) return String(value);
    if (Array.isArray(value)) return value.map(content).join('');
    if (typeof value === 'object') {
        if ('html' in value && !value.type) return String(restoreHTML(value));
        throw new TypeError('Use compose() for component descriptors, or pass component results directly');
    }
    return escapeHtml(String(value));
};
/** Wrap a renderer after it has escaped its text/attribute inputs. */
export const defineComponent = (render, identifier) => {
    const component = (props = {}) => {
        const dependencies = new Set(identifier ? [identifier] : []);
        const collect = (value, seen = new Set()) => {
            if (isHTML(value)) { value.dependencies.forEach(dep => dependencies.add(dep)); return; }
            if (!value || typeof value !== 'object' || seen.has(value)) return;
            if ('html' in value && !value.type) {
                restoreHTML(value).dependencies.forEach(dep => dependencies.add(dep));
                return;
            }
            seen.add(value);
            Object.values(value).forEach(child => collect(child, seen));
        };
        collect(props);
        const result = render(props);
        if (isHTML(result)) result.dependencies.forEach(dep => dependencies.add(dep));
        return new TrustedHTML(String(result ?? ''), dependencies);
    };
    Object.defineProperty(component, 'name', { value: identifier?.split(':')[1] || render.name });
    return component;
};
/** JSON safe to embed in an HTML script element; read via textContent + JSON.parse. */
export const scriptData = value => JSON.stringify(value)
    .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
