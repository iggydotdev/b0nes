export const modalClient = () => {
        /**
     * Modal behavior - Overlay dialog
     */
    window.b0nes.register('modal', function(el) {
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
            const firstFocusable = el.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 10);
            }
        };
        el.querySelectorAll('[data-modal-close]').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                closeModal();
            });
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && el.getAttribute('aria-hidden') === 'false') {
                closeModal();
            }
        });
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest(`[data-modal-open="${modalId}"]`);
            if (trigger) {
                e.preventDefault();
                openModal();
            }
        });
        el.style.display = 'none';
    });
};
  