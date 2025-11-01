export const badge = ({ label, className, attrs }) => {
    if (!label) {
        console.warn('[b0nes] Badge requires a label prop');
        return '';
    }

    attrs = attrs ? ` ${attrs}` : '';
    className = className ? ` ${className}` : '';

    return `<span class="badge${className}"${attrs}>${label}</span>`;
};
