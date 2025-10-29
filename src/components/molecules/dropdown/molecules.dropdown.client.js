export const client = (el) => {
    const trigger = el.querySelector('.dropdown-trigger');
    const menu = el.querySelector('.dropdown-menu');
    
    if (!trigger || !menu) {
        console.warn('[b0nes] Dropdown missing trigger or menu');
        return;
    }
    
    let isOpen = false;
    
    const open = () => {
        isOpen = true;
        menu.removeAttribute('hidden');
        trigger.setAttribute('aria-expanded', 'true');
    };
    
    const close = () => {
        isOpen = false;
        menu.setAttribute('hidden', '');
        trigger.setAttribute('aria-expanded', 'false');
    };
    
    const toggle = () => {
        if (isOpen) {
            close();
        } else {
            open();
        }
    };
    
    const handleTriggerClick = (e) => {
        e.stopPropagation();
        toggle();
    };
    
    const handleOutsideClick = (e) => {
        if (isOpen && !el.contains(e.target)) {
            close();
        }
    };
    
    const handleEscape = (e) => {
        if (e.key === 'Escape' && isOpen) {
            close();
            trigger.focus();
        }
    };
    
    // Attach event listeners
    trigger.addEventListener('click', handleTriggerClick);
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    
    // Return cleanup function
    return () => {
        trigger.removeEventListener('click', handleTriggerClick);
        document.removeEventListener('click', handleOutsideClick);
        document.removeEventListener('keydown', handleEscape);
    };
}