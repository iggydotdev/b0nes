/** Enhances a native form root and returns cleanup that restores its native fallback. */
export function client(root: HTMLElement): (() => void) | undefined;
