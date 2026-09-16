/** Tabs enhance readable panels only after the behavior is ready. */
let nextId = 0;

export const client = (el) => {
    // Do not capture controls belonging to nested tab groups.
    const owned = selector => [...el.querySelectorAll(selector)]
        .filter(node => node.closest('[data-b0nes="molecules:tabs"]') === el);
    const buttons = owned('.tab-button');
    const panels = owned('.tab-panel');
    const tablist = owned('.tab-buttons')[0];
    if (!tablist || !buttons.length || buttons.length !== panels.length) return;

    let prefix;
    do { prefix = `b0nes-tabs-${++nextId}`; }
    while (buttons.some((_, i) => document.getElementById(`${prefix}-tab-${i}`) ||
        document.getElementById(`${prefix}-panel-${i}`)));

    tablist.setAttribute('role', 'tablist');
    buttons.forEach((button, index) => {
        const panel = panels[index];
        button.disabled = false;
        button.id = `${prefix}-tab-${index}`;
        panel.id = `${prefix}-panel-${index}`;
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-controls', panel.id);
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', button.id);
        panel.setAttribute('tabindex', '0');
    });

    const activate = index => {
        buttons.forEach((button, i) => {
            const active = i === index;
            button.classList.toggle('active', active);
            button.setAttribute('aria-selected', String(active));
            button.setAttribute('tabindex', active ? '0' : '-1');
            panels[i].classList.toggle('active', active);
            panels[i].hidden = !active;
        });
    };
    const handlers = buttons.map((button, index) => {
        const handler = () => activate(index);
        button.addEventListener('click', handler);
        return handler;
    });
    const keydown = event => {
        const index = buttons.indexOf(document.activeElement);
        if (index < 0) return;
        const next = { ArrowLeft: (index + buttons.length - 1) % buttons.length,
            ArrowRight: (index + 1) % buttons.length, Home: 0, End: buttons.length - 1 }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        activate(next);
        buttons[next].focus();
    };
    el.addEventListener('keydown', keydown);
    activate(0);

    return () => {
        el.removeEventListener('keydown', keydown);
        tablist.removeAttribute('role');
        buttons.forEach((button, i) => {
            button.removeEventListener('click', handlers[i]);
            button.disabled = true;
            for (const attr of ['id', 'role', 'aria-controls', 'aria-selected', 'tabindex'])
                button.removeAttribute(attr);
            for (const attr of ['id', 'role', 'aria-labelledby', 'tabindex', 'hidden'])
                panels[i].removeAttribute(attr);
        });
    };
};
