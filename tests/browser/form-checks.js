// Exercise real browser constraints, focus, native submissions, and lifecycle.
export const checkMultiStepForms = async (frame, check) => {
    const view = frame.contentWindow, doc = frame.contentDocument, runtime = view.b0nes;
    const forms = [...doc.querySelectorAll('form[data-b0nes="organisms:multi-step-form"]')];
    const [first, second] = forms;
    const field = (form, name) => form.querySelector(`input[name="${name}"]`);
    const action = (form, name) => form.querySelector(`[data-step]:not([hidden]) button[data-action="${name}"]`);
    const step = form => form.querySelector('[data-step]:not([hidden])')?.dataset.step;
    const fill = (form, name, value) => {
        const input = field(form, name); input.value = value;
        input.dispatchEvent(new view.Event('input', { bubbles:true }));
        return input;
    };
    const flush = () => new Promise(resolve => setTimeout(resolve, 0));
    const loaded = element => new Promise((resolve, reject) => {
        element.onload = resolve; element.onerror = () => reject(Error('Form submission navigation failed'));
    });
    check('two production form instances initialize with independent local state',
        forms.length === 2 && step(first) === 'step1' && step(second) === 'step1' && !Object.hasOwn(view, 'store'));
    check('form inputs have native accessible labels and a live step status',
        forms.every(form => [...form.querySelectorAll('input')].every(input => input.labels.length === 1) &&
            form.querySelector('[data-status]').getAttribute('role') === 'status'));
    action(first, 'next').click();
    check('Next validates and focuses the required field instead of skipping it',
        step(first) === 'step1' && doc.activeElement === field(first, 'name') && field(first, 'name').getAttribute('aria-invalid') === 'true');
    fill(first, 'name', 'First person');
    const nestedNext = doc.createElement('span'); nestedNext.textContent = 'Next';
    action(first, 'next').append(nestedNext); nestedNext.click();
    check('nested navigation controls advance only their form and focus the next field',
        step(first) === 'step2' && step(second) === 'step1' && doc.activeElement === field(first, 'email') &&
        first.querySelector('progress').value === 2 && second.querySelector('progress').value === 1);
    fill(first, 'email', 'invalid-address'); action(first, 'next').click();
    check('step validation respects native email constraints', step(first) === 'step2' && field(first, 'email').validity.typeMismatch);
    fill(first, 'email', 'first@example.test'); action(first, 'next').click();
    fill(second, 'name', 'Second person'); action(second, 'next').click();
    check('editing another form leaves the first form values and step intact',
        step(first) === 'step3' && step(second) === 'step2' && field(first, 'name').value === 'First person');
    let canceled;
    const observeSubmit = event => { canceled = event.defaultPrevented; event.preventDefault(); };
    first.addEventListener('submit', observeSubmit);
    fill(first, 'email', ''); action(first, 'submit').click();
    check('submit reveals and focuses an invalid hidden earlier step', canceled === true && step(first) === 'step2' && doc.activeElement === field(first, 'email'));
    fill(first, 'email', 'first@example.test'); action(first, 'next').click();
    fill(first, 'age', '-1'); action(first, 'submit').click();
    check('submit validates optional number constraints', canceled === true && step(first) === 'step3' && doc.activeElement === field(first, 'age'));
    fill(first, 'age', '42'); action(first, 'submit').click();
    check('a valid form submit keeps native default behavior and all hidden field values',
        canceled === false && new view.FormData(first).get('name') === 'First person' &&
        new view.FormData(first).get('email') === 'first@example.test' && new view.FormData(first).get('age') === '42');
    first.removeEventListener('submit', observeSubmit);
    const preventReset = event => event.preventDefault();
    first.addEventListener('reset', preventReset);
    action(first, 'reset').click(); await flush();
    check('a canceled native reset leaves state and field values intact', step(first) === 'step3' && field(first, 'name').value === 'First person');
    first.removeEventListener('reset', preventReset);
    action(first, 'reset').click(); await flush();
    check('native reset resets only its own fields and returns focus to the first step',
        step(first) === 'step1' && [...first.querySelectorAll('input')].every(input => input.value === '') &&
        doc.activeElement === field(first, 'name') && step(second) === 'step2' && field(second, 'name').value === 'Second person');
    check('runtime has a synchronous form cleanup callback', typeof runtime.instanceCleanup.get(first) === 'function');
    runtime.destroy(first);
    check('destroy restores all fallback fields and native constraint validation',
        [...first.querySelectorAll('[data-step]')].every(element => !element.hidden) && !first.noValidate &&
        [...first.querySelectorAll('[data-action="next"], [data-action="back"]')].every(button => button.hidden && button.disabled) && first.querySelector('progress').hidden);
    const fallbackStatus = first.querySelector('[data-status]').textContent;
    fill(first, 'name', 'Preserved after destroy');
    first.querySelector('[data-action="next"]').dispatchEvent(new view.MouseEvent('click', { bubbles:true, cancelable:true }));
    check('destroy detaches input and navigation subscriptions',
        first.querySelector('[data-status]').textContent === fallbackStatus && [...first.querySelectorAll('[data-step]')].every(element => !element.hidden));
    const wrapper = doc.createElement('div');
    wrapper.dataset.b0nes = 'organisms:multi-step-form';
    first.before(wrapper); wrapper.append(first);
    runtime.init(wrapper); await runtime.whenReady();
    check('nested behavior wrappers leave enhancement to their tagged form root',
        typeof runtime.instanceCleanup.get(first) === 'function' && !runtime.instanceCleanup.get(wrapper) && step(first) === 'step1');
    runtime.destroy(wrapper); runtime.destroy(first);
    check('destroying a nested wrapper and form restores a fully native fallback',
        [...first.querySelectorAll('[data-step]')].every(element => !element.hidden) && !first.noValidate &&
        first.querySelector('progress').hidden && first.querySelector('[data-status]').textContent === fallbackStatus);
    wrapper.replaceWith(first);
    runtime.init(first); await runtime.whenReady();
    action(first, 'next').click();
    check('a destroyed form reinitializes once with preserved native field values', step(first) === 'step2' && field(first, 'name').value === 'Preserved after destroy');
    runtime.destroy(first);
    fill(second, 'email', 'second@example.test'); action(second, 'next').click();
    check('destroying one instance leaves another fully functional', step(second) === 'step3' && [...first.querySelectorAll('[data-step]')].every(element => !element.hidden));
    fill(second, 'age', '25');
    const enhancedSubmission = loaded(frame);
    action(second, 'submit').click();
    await enhancedSubmission;
    const submitted = new URLSearchParams(frame.contentDocument.getElementById('submitted-form')?.textContent);
    check('enhanced form posts to its native endpoint with all three fields',
        submitted.get('name') === 'Second person' && submitted.get('email') === 'second@example.test' && submitted.get('age') === '25');

    const fallback = document.createElement('iframe'); fallback.src = '/form-no-js';
    const fallbackLoaded = loaded(fallback); document.body.append(fallback); await fallbackLoaded;
    const native = fallback.contentDocument.querySelector('form');
    check('without enhancement every labelled field and real submit button is reachable',
        !fallback.contentWindow.b0nes && [...native.querySelectorAll('[data-step]')].every(element => !element.hidden) &&
        [...native.querySelectorAll('input')].every(input => input.labels.length === 1) && !native.noValidate && native.querySelector('button[type="submit"]'));
    let submittedInvalid = false;
    native.addEventListener('submit', () => { submittedInvalid = true; });
    native.requestSubmit(native.querySelector('button[type="submit"]'));
    check('unenhanced form uses browser required-field validation', !submittedInvalid && field(native, 'name').validity.valueMissing);
    field(native, 'name').value = 'No JavaScript'; field(native, 'email').value = 'native@example.test'; field(native, 'age').value = '33';
    const nativeSubmission = loaded(fallback);
    native.requestSubmit(native.querySelector('button[type="submit"]'));
    await nativeSubmission;
    const nativeData = new URLSearchParams(fallback.contentDocument.getElementById('submitted-form')?.textContent);
    check('unenhanced native form posts complete data without a client runtime',
        nativeData.get('name') === 'No JavaScript' && nativeData.get('email') === 'native@example.test' && nativeData.get('age') === '33');
    fallback.remove();
};
