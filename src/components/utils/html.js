import { escapeHtml } from './escapeHtml.js';

// Symbol identity also survives loading the utility from source and built URLs.
const brand = Symbol.for('b0nes.trusted-html');
export class TrustedHTML extends String {
    constructor(value, dependencies = [], component) {
        super(value);
        Object.defineProperty(this, brand, { value: true });
        Object.defineProperty(this, 'dependencies', { value: Object.freeze([...dependencies]) });
        if (component) Object.defineProperty(this, 'component', { value: component });
        Object.freeze(this);
    }
    toJSON() {
        return { html: String(this), dependencies: this.dependencies,
            ...(this.component?.serializable ? { component: this.component.descriptor } : {}) };
    }
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
    let component;
    if (value.component !== undefined) {
        const descriptor = value.component;
        if (!descriptor || !/^(atom|molecule|organism)$/.test(descriptor.type) ||
            typeof descriptor.name !== 'string' || !/^[a-z0-9-]+$/.test(descriptor.name) ||
            !descriptor.props || typeof descriptor.props !== 'object' || Array.isArray(descriptor.props)) {
            throw new TypeError('Invalid serialized component metadata');
        }
        const snapshot = snapshotProps(descriptor.props);
        component = Object.freeze({ descriptor: Object.freeze({ type: descriptor.type, name: descriptor.name, props: snapshot.value }), serializable: snapshot.serializable });
    }
    return new TrustedHTML(String(markup), dependencies, component);
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
// Keep relative-asset props so composition can resolve direct helper results using
// the same context as descriptors. Plain props are snapshotted without freezing
// caller-owned objects; complex/cyclic values retain the old HTML-only JSON form.
const snapshotProps = props => {
    const seen = new Map();
    let serializable = true;
    const clone = value => {
        if (isHTML(value)) {
            if (value.component && !value.component.serializable) serializable = false;
            return value;
        }
        if (!value || typeof value !== 'object') {
            if (['function', 'symbol', 'bigint'].includes(typeof value)) serializable = false;
            return value;
        }
        if (seen.has(value)) { serializable = false; return seen.get(value); }
        if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) {
            serializable = false;
            return value;
        }
        const copy = Array.isArray(value) ? [] : {};
        seen.set(value, copy);
        for (const [key, child] of Object.entries(value)) {
            Object.defineProperty(copy, key, { value: clone(child), enumerable: true, writable: true, configurable: true });
        }
        return Object.freeze(copy);
    };
    return { value: clone(props), serializable };
};

/** Wrap a renderer after it has escaped its text/attribute inputs. */
export const defineComponent = (render, identifier) => {
    const component = (props = {}) => {
        const dependencies = new Set(identifier ? [identifier] : []);
        let needsAssetContext = false;
        const collect = (value, seen = new Set()) => {
            if (isHTML(value)) {
                value.dependencies.forEach(dep => dependencies.add(dep));
                if (value.component) needsAssetContext = true;
                return;
            }
            if (!value || typeof value !== 'object' || seen.has(value)) return;
            if ('html' in value && !value.type) {
                const restored = restoreHTML(value);
                restored.dependencies.forEach(dep => dependencies.add(dep));
                if (restored.component) needsAssetContext = true;
                return;
            }
            seen.add(value);
            Object.entries(value).forEach(([key, child]) => {
                if (['src', 'href', 'poster'].includes(key) && typeof child === 'string' && child.startsWith('./')) needsAssetContext = true;
                collect(child, seen);
            });
        };
        collect(props);
        const result = render(props);
        if (isHTML(result)) result.dependencies.forEach(dep => dependencies.add(dep));
        let component;
        if (needsAssetContext && /^(atom|molecule|organism):[a-z0-9-]+$/.test(identifier || '')) {
            const [type, name] = identifier.split(':');
            const snapshot = snapshotProps(props);
            component = Object.freeze({ descriptor: Object.freeze({ type, name, props: snapshot.value }), serializable: snapshot.serializable });
        }
        return new TrustedHTML(String(result ?? ''), dependencies, component);
    };
    Object.defineProperty(component, 'name', { value: identifier?.split(':')[1] || render.name });
    return component;
};
/** JSON safe to embed in an HTML script element; read via textContent + JSON.parse. */
export const scriptData = value => JSON.stringify(value)
    .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
