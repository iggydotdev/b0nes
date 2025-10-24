/**
 * Modal behavior - Client-side interactivity for modal component
 * @param {HTMLElement} el - The modal element
 */
export function modalBehavior(el) {
    const modalId = el.id;

    // Close modal function
    const closeModal = () => {
        el.setAttribute('aria-hidden', 'true');
        el.style.display = 'none';
        document.body.style.overflow = '';
    };

    // Open modal function
    const openModal = () => {
        el.setAttribute('aria-hidden', 'false');
        el.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Focus first focusable element
        const firstFocusable = el.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 10);
        }
    };

    // Listen for close buttons
    el.querySelectorAll('[data-modal-close]').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && el.getAttribute('aria-hidden') === 'false') {
            closeModal();
        }
    });

    // Listen for trigger buttons globally
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest(`[data-modal-open="${modalId}"]`);
        if (trigger) {
            e.preventDefault();
            openModal();
        }
    });

    // Initialize as hidden
    el.style.display = 'none';
}
