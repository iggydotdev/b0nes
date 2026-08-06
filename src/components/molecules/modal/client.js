/**
 * Modal behavior - Overlay dialog
 * Returns a cleanup function so b0nes runtime can tear down listeners.
 */
export const client = (el) => {
    const modalId = el.id;

    const closeModal = () => {
        el.setAttribute('aria-hidden', 'true');
        el.style.display = 'none';
        document.body.style.overflow = '';
    };

    const openModal = () => {
        el.setAttribute('aria-hidden', 'false');
        el.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        const firstFocusable = el.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 10);
        }
    };

    const handleCloseClick = (e) => {
        e.preventDefault();
        closeModal();
    };

    const closeButtons = el.querySelectorAll('[data-modal-close]');
    closeButtons.forEach((closeBtn) => {
        closeBtn.addEventListener('click', handleCloseClick);
    });

    const handleKeydown = (e) => {
        if (e.key === 'Escape' && el.getAttribute('aria-hidden') === 'false') {
            closeModal();
        }
    };

    const handleDocumentClick = (e) => {
        const trigger = e.target.closest(`[data-modal-open="${modalId}"]`);
        if (trigger) {
            e.preventDefault();
            openModal();
        }
    };

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('click', handleDocumentClick);

    el.style.display = 'none';

    // Cleanup contract — called by window.b0nes.destroy()
    return () => {
        closeButtons.forEach((closeBtn) => {
            closeBtn.removeEventListener('click', handleCloseClick);
        });
        document.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('click', handleDocumentClick);
        // Restore body scroll if this modal was open
        if (el.getAttribute('aria-hidden') === 'false') {
            document.body.style.overflow = '';
        }
    };
};
