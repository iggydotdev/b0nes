/** Modal focus and scroll ownership are shared across open dialogs. */
const openModals = [];
let previousOverflow;
const focusableSelector = 'button, [href], input, select, textarea, [tabindex]';

export const client = (el) => {
    let opener = null;
    const isTop = () => openModals.at(-1) === el;
    const focusables = () => [...el.querySelectorAll(focusableSelector)].filter(node =>
        node.tabIndex >= 0 && !node.matches(':disabled') &&
        !node.closest('[hidden], [inert], [aria-hidden="true"]') &&
        node.getClientRects().length > 0 && getComputedStyle(node).visibility !== 'hidden');
    const focusFirst = () => (focusables()[0] || el).focus();

    const closeModal = () => {
        const index = openModals.indexOf(el);
        if (index < 0) return;
        const restoreFocus = isTop();
        openModals.splice(index, 1);
        el.setAttribute('aria-hidden', 'true');
        el.style.display = 'none';
        if (!openModals.length) document.body.style.overflow = previousOverflow;
        if (restoreFocus && opener?.isConnected) opener.focus();
    };
    const openModal = trigger => {
        if (openModals.includes(el)) return;
        opener = trigger || document.activeElement;
        if (!openModals.length) previousOverflow = document.body.style.overflow;
        openModals.push(el);
        el.setAttribute('aria-hidden', 'false');
        el.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        focusFirst();
    };
    const closeClick = event => { event.preventDefault(); closeModal(); };
    const closeButtons = el.querySelectorAll('[data-modal-close]');
    closeButtons.forEach(button => button.addEventListener('click', closeClick));

    const keydown = event => {
        if (!isTop()) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            closeModal();
        } else if (event.key === 'Tab') {
            const nodes = focusables();
            const first = nodes[0];
            const last = nodes.at(-1);
            if (!nodes.length) { event.preventDefault(); el.focus(); }
            else if (event.shiftKey && (document.activeElement === first || !el.contains(document.activeElement))) {
                event.preventDefault(); last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || !el.contains(document.activeElement) || document.activeElement === el)) {
                event.preventDefault(); first.focus();
            }
        }
    };
    const focusin = event => {
        if (isTop() && !el.contains(event.target)) focusFirst();
    };
    const documentClick = event => {
        const trigger = event.target.closest?.('[data-modal-open]');
        if (trigger?.getAttribute('data-modal-open') === el.id) {
            event.preventDefault(); openModal(trigger);
        }
    };
    el.setAttribute('tabindex', '-1');
    el.setAttribute('aria-hidden', 'true');
    el.style.display = 'none';
    document.addEventListener('keydown', keydown);
    document.addEventListener('focusin', focusin);
    document.addEventListener('click', documentClick);
    return () => {
        document.removeEventListener('keydown', keydown);
        document.removeEventListener('focusin', focusin);
        document.removeEventListener('click', documentClick);
        closeButtons.forEach(button => button.removeEventListener('click', closeClick));
        closeModal();
    };
};
