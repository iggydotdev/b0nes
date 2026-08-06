/**
 * Tabs behavior - keyboard-accessible tab panels
 * Returns a cleanup function so b0nes runtime can tear down listeners.
 */
export const client = (el) => {
    const buttons = el.querySelectorAll('.tab-button');
    const panels = el.querySelectorAll('.tab-panel');

    const handleButtonClick = (button, index) => () => {
        buttons.forEach((btn) => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        panels.forEach((panel) => {
            panel.classList.remove('active');
            panel.setAttribute('hidden', '');
        });
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');
        if (panels[index]) {
            panels[index].classList.add('active');
            panels[index].removeAttribute('hidden');
        }
    };

    const clickHandlers = [];
    buttons.forEach((button, index) => {
        const handler = handleButtonClick(button, index);
        button.addEventListener('click', handler);
        clickHandlers.push({ button, handler });
    });

    const handleKeydown = (e) => {
        const currentButton = document.activeElement;
        if (!currentButton?.classList?.contains('tab-button')) return;
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
    };

    el.addEventListener('keydown', handleKeydown);

    return () => {
        clickHandlers.forEach(({ button, handler }) => {
            button.removeEventListener('click', handler);
        });
        el.removeEventListener('keydown', handleKeydown);
    };
};
