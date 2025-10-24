/**
 * Tabs behavior - Client-side interactivity for tabs component
 * @param {HTMLElement} el - The tabs container element
 */
export function tabsBehavior(el) {
    const buttons = el.querySelectorAll('.tab-button');
    const panels = el.querySelectorAll('.tab-panel');

    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panels
            buttons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            panels.forEach(panel => {
                panel.classList.remove('active');
                panel.setAttribute('hidden', '');
            });

            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');
            panels[index].classList.add('active');
            panels[index].removeAttribute('hidden');
        });
    });

    // Keyboard navigation
    el.addEventListener('keydown', (e) => {
        const currentButton = document.activeElement;
        if (!currentButton.classList.contains('tab-button')) return;

        const currentIndex = Array.from(buttons).indexOf(currentButton);
        let nextIndex;

        switch (e.key) {
            case 'ArrowLeft':
                nextIndex = currentIndex === 0 ? buttons.length - 1 : currentIndex - 1;
                break;
            case 'ArrowRight':
                nextIndex = currentIndex === buttons.length - 1 ? 0 : currentIndex + 1;
                break;
            case 'Home':
                nextIndex = 0;
                break;
            case 'End':
                nextIndex = buttons.length - 1;
                break;
            default:
                return;
        }

        e.preventDefault();
        buttons[nextIndex].focus();
        buttons[nextIndex].click();
    });
}
