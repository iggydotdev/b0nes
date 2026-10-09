import { defineComponent } from '../../utils/html.js';
import { attrsToString } from '../../utils/attrsToString.js';
import { box, input, text, button, progress } from '../../atoms/index.js';

/**
 * A native form enhanced into three steps. All fields and the real submit
 * button remain available when JavaScript is unavailable or the client is
 * destroyed. Use action/method for the application's normal form endpoint.
 */
export const multiStepForm = defineComponent(({ className = '', attrs = '', action = undefined, method = 'get' } = {}) => {
  if (!['get', 'post'].includes(method)) throw new TypeError('Form method must be get or post');
  const navigation = (name, slot) => button({ slot, attrs: { 'data-action': name, hidden: true, disabled: true } });
  const field = (name, type, caption, attributes) => text({ is: 'label', slot: [caption,
    input({ type, attrs: { name, ...attributes } })
  ] });
  const step = (name, caption, slot) => box({ is: 'fieldset', attrs: { 'data-step': name }, slot: [
    text({ is: 'legend', slot: caption }), ...slot
  ] });
  return box({
    is: 'form', className,
    attrs: attrsToString({ 'data-b0nes': 'organisms:multi-step-form', method,
      ...(action === undefined ? {} : { action }) }) + attrsToString(attrs),
    slot: [
      progress({ max: 3, value: 1, className: 'form-progress',
        attrs: { hidden: true, 'aria-label': 'Form completion progress' } }),
      step('step1', 'Step 1 – Name', [
        field('name', 'text', 'Name (required)', { autocomplete: 'name', required: true }),
        navigation('next', 'Next →')
      ]),
      step('step2', 'Step 2 – Email', [
        field('email', 'email', 'Email (required)', { autocomplete: 'email', required: true }),
        navigation('back', '← Back'), navigation('next', 'Next →')
      ]),
      step('step3', 'Step 3 – Age', [
        field('age', 'number', 'Age (optional)', { min: 0, max: 120, step: 1 }),
        navigation('back', '← Back'),
        button({ type: 'submit', slot: 'Submit', attrs: { 'data-action': 'submit' } }),
        button({ type: 'reset', slot: 'Start Over', attrs: { 'data-action': 'reset' } })
      ]),
      text({ is: 'p', attrs: { 'data-status': '', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' },
        slot: 'Complete all fields and submit the form.' })
    ]
  });
}, 'organism:multi-step-form');
