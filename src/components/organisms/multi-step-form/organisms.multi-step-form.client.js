import { createFSM } from '/client/fsm.js';
import { createStore, connectStoreToFSM } from '/client/store.js';

export const client = (root) => {
  const store = createStore({
    state: { step: 'step1', name: '', email: '', age: '' },
    actions: {
      update: (state, payload) => ({ ...state, ...payload }),
      trigger: (state, event) => ({ fsmEvent: event })
    }
  });

  const fsm = createFSM({
    initial: 'step1',
    states: {
      step1: { on: { NEXT: 'step2' } },
      step2: { on: { NEXT: 'step3', BACK: 'step1' } },
      step3: { on: { SUBMIT: 'success', BACK: 'step2' } },
      success: {}
    }
  });

  connectStoreToFSM(store, fsm);

  const progress = root.querySelector('progress');
  const status = root.querySelector('[data-status]');

  const render = () => {
    const s = store.getState();
    progress.value = { step1:1, step2:2, step3:3, success:3 }[s.step];
    status.textContent = s.step;

    // Show/hide steps
    root.querySelectorAll('[data-step]').forEach(el => {
      el.hidden = el.dataset.step !== s.step;
    });

    // Success: fill data
    if (s.step === 'success') {
      root.querySelectorAll('[data-field]').forEach(el => {
        el.textContent = s[el.dataset.field] || '—';
      });
    }
  };

  // Sync inputs → store (two-way binding)
  root.addEventListener('input', e => {
    if (e.target.name) {
      store.dispatch('update', { [e.target.name]: e.target.value });
    }
  });

  // Buttons → FSM events
  root.addEventListener('click', e => {
    if (!e.target.matches('button[data-action]')) return;
    const a = e.target.dataset.action;
    if (a === 'next') store.dispatch('trigger', 'NEXT');
    if (a === 'back') store.dispatch('trigger', 'BACK');
    if (a === 'submit') store.dispatch('trigger', 'SUBMIT');
    if (a === 'reset') fsm.reset();
  });

  render();
  store.subscribe(render);
};