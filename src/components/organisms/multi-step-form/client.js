import { createFSM } from '/assets/js/client/fsm.js';
import { createStore } from '/assets/js/client/store.js';

export const client = (root) => {

  // Create a store, add state and actions... usually what 
  // redux does
    window.store = createStore({
    state: { step: 'step1', name: '', email: '', age: '' },
    actions: {
      
      update: (state, payload) => ({ ...state, ...payload }),
      setStep: (state, step) => ({ ...state, step })
    }
  });

  // Create your tiny finite state machine, initial state, states, ...
  const fsm = createFSM({
    initial: 'step1',
    states: {
      step1: { on: { NEXT: 'step2', }},
      step2: { on: { NEXT: 'step3', BACK: 'step1' }},
      step3: { on: { SUBMIT: 'success', BACK: 'step2' }},
      success: {}
    }
  });

  // This connects the store to the FSM together
  fsm.subscribe((transition) => {
    window.store.dispatch('setStep', transition.to);
  });



  const progress = root.querySelector('progress');
  const status = root.querySelector('[data-status]');
  
  // The rendering what needs to happen to make it work? 
  // some logic to remove hidden attribute or to surface things like results
  const render = () => {
    const s = window.store.getState();
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
      window.store.dispatch('update', { [e.target.name]: e.target.value });
    }
  });

  //cleanup 
  const resetForm = () => {
    fsm.reset();
      window.store.reset();
      console.log(store.getState())
      // Clear DOM inputs (because value property doesn't auto-update from store on reset)
      root.querySelectorAll('input').forEach(input => {
        input.value = '';
      });
  }
  // Buttons → FSM events
  root.addEventListener('click', e => {
    console.log('clicked',e)
    if (!e.target.matches('button[data-action]')) return;
    const a = e.target.dataset.action;
    if (a === 'next') fsm.send('NEXT');
    if (a === 'back') fsm.send('BACK');
    if (a === 'submit') fsm.send('SUBMIT');
    if (a === 'reset') {
      resetForm()
    }
  });

  render();
  window.store.subscribe(render);
};