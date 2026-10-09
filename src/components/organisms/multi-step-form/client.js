import { createFSM } from '/assets/js/client/fsm.js';
import { createStore } from '/assets/js/client/store.js';

/** Enhance a native form root; the runtime receives synchronous cleanup. */
export const client = root => {
  // Runtime discovery also visits tagged descendants. A surrounding behavior
  // marker must not initialize this same form a second time or capture already
  // enhanced visibility/validation settings as its fallback state.
  if (!root.matches('form')) return;
  const form = root;
  const steps = [...form.querySelectorAll('[data-step]')];
  const inputs = [...form.querySelectorAll('input')];
  const navigation = [...form.querySelectorAll('button[data-action="next"], button[data-action="back"]')];
  const progress = form.querySelector('progress');
  const status = form.querySelector('[data-status]');
  const labels = { step1: 'Name', step2: 'Email', step3: 'Age' };
  const previous = {
    noValidate: form.noValidate,
    steps: steps.map(step => step.hidden),
    navigation: navigation.map(button => ({ hidden: button.hidden, disabled: button.disabled })),
    invalid: inputs.map(input => input.getAttribute('aria-invalid')),
    progress: progress && { hidden: progress.hidden, value: progress.value },
    status: status?.textContent
  };
  let disposed = false;
  const values = () => Object.fromEntries(inputs.map(input => [input.name, input.value]));
  const store = createStore({
    state: { step: 'step1', ...values() },
    actions: { update: (_, payload) => payload, setStep: (_, step) => ({ step }) }
  });
  const fsm = createFSM({
    initial: 'step1',
    states: {
      step1: { on: { NEXT: 'step2', SHOW: (_, data) => data.step } },
      step2: { on: { NEXT: 'step3', BACK: 'step1', SHOW: (_, data) => data.step } },
      step3: { on: { BACK: 'step2', SHOW: (_, data) => data.step } }
    }
  });
  const currentStep = () => steps.find(step => step.dataset.step === store.get('step'));
  const render = () => {
    const step = store.get('step');
    const number = Number(step.slice(-1));
    steps.forEach(element => { element.hidden = element.dataset.step !== step; });
    if (progress) { progress.value = number; progress.hidden = false; }
    if (status) status.textContent = `Step ${number} of 3: ${labels[step]}`;
  };
  const focusStep = () => currentStep()?.querySelector('input, select, textarea, button')?.focus();
  const unsubscribeStore = store.subscribe(render, { path: 'step' });
  const unsubscribeFSM = fsm.subscribe(transition => {
    store.dispatch('setStep', transition.to);
    focusStep();
  });
  const showInvalid = input => {
    const step = input.closest('[data-step]');
    if (step && step.dataset.step !== fsm.getState()) fsm.send('SHOW', { step: step.dataset.step });
    input.setAttribute('aria-invalid', 'true');
    if (status) status.textContent = `Please check ${input.name || 'this field'} on step ${fsm.getState().slice(-1)} of 3.`;
    input.focus();
    input.reportValidity();
  };
  const validate = controls => {
    const invalid = [...controls].find(control => control.willValidate && !control.validity.valid);
    if (!invalid) return true;
    showInvalid(invalid);
    return false;
  };
  const inputHandler = event => {
    if (!inputs.includes(event.target)) return;
    store.dispatch('update', { [event.target.name]: event.target.value });
    if (event.target.validity.valid) event.target.removeAttribute('aria-invalid');
  };
  const clickHandler = event => {
    const button = event.target.closest?.('button[data-action]');
    if (!button || !form.contains(button)) return;
    const action = button.dataset.action;
    if (action === 'next') {
      event.preventDefault();
      if (validate(currentStep().querySelectorAll('input, select, textarea'))) fsm.send('NEXT');
    } else if (action === 'back') {
      event.preventDefault();
      fsm.send('BACK');
    }
    // Submit and reset keep their native form events and default behavior.
  };
  const submitHandler = event => {
    // Validate all successful controls ourselves so hidden earlier/later steps
    // can be revealed before the browser focuses an invalid control. A valid
    // submit is never canceled: action/method, submitter and FormData stay native.
    if (previous.noValidate || event.submitter?.formNoValidate) return;
    if (!validate(form.elements)) event.preventDefault();
  };
  const resetHandler = event => {
    // The reset event precedes the browser restoring default control values.
    queueMicrotask(() => {
      if (disposed || event.defaultPrevented) return;
      store.reset();
      store.dispatch('update', values());
      fsm.reset();
    });
  };

  form.noValidate = true;
  navigation.forEach(button => { button.hidden = false; button.disabled = false; });
  form.addEventListener('input', inputHandler);
  form.addEventListener('click', clickHandler);
  form.addEventListener('submit', submitHandler);
  form.addEventListener('reset', resetHandler);
  render();
  return () => {
    if (disposed) return;
    disposed = true;
    unsubscribeStore(); unsubscribeFSM();
    form.removeEventListener('input', inputHandler);
    form.removeEventListener('click', clickHandler);
    form.removeEventListener('submit', submitHandler);
    form.removeEventListener('reset', resetHandler);
    form.noValidate = previous.noValidate;
    steps.forEach((step, index) => { step.hidden = previous.steps[index]; });
    navigation.forEach((button, index) => Object.assign(button, previous.navigation[index]));
    inputs.forEach((input, index) => {
      if (previous.invalid[index] === null) input.removeAttribute('aria-invalid');
      else input.setAttribute('aria-invalid', previous.invalid[index]);
    });
    if (progress) Object.assign(progress, previous.progress);
    if (status) status.textContent = previous.status;
  };
};
