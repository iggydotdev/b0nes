/**
 * Dropdown behavior - Client-side interactivity for dropdown component
 * @param {HTMLElement} el - The dropdown container element
 */
export function dropdownBehavior(el) {
    const trigger = el.querySelector('.dropdown-trigger');
    const menu = el.querySelector('.dropdown-menu');

    if (!trigger || !menu) return;

    let isOpen = false;

    // Toggle dropdown
    const toggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        isOpen = !isOpen;
        
        if (isOpen) {
            menu.removeAttribute('hidden');
            trigger.setAttribute('aria-expanded', 'true');
        } else {
            menu.setAttribute('hidden', '');
            trigger.setAttribute('aria-expanded', 'false');
        }
    };

    // Close dropdown
    const close = () => {
        if (isOpen) {
            isOpen = false;
            menu.setAttribute('hidden', '');
            trigger.setAttribute('aria-expanded', 'false');
        }
    };

    // Click trigger to toggle
    trigger.addEventListener('click', toggle);

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!el.contains(e.target)) {
            close();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            close();
            trigger.focus();
        }
    });

    // Keyboard navigation within menu
    menu.addEventListener('keydown', (e) => {
        const items = Array.from(menu.querySelectorAll('a, button'));
        const currentIndex = items.indexOf(document.activeElement);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = currentIndex + 1 < items.length ? currentIndex + 1 : 0;
                items[nextIndex]?.focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : items.length - 1;
                items[prevIndex]?.focus();
                break;
        }
    });
}
