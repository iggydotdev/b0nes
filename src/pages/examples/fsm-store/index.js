import { stylesheetPresets } from '../../../framework/config/stylesheets.js'

export const meta = {
  title: 'b0nes FSM + Store – The Final Form',
  description: 'Multi-step form as a reusable organism. No inline scripts. No innerHTML nuke. Pure atomic composition.',
  stylesheets: stylesheetPresets.pico(),
};

export const components = [
  {
    type: 'organism',
    name: 'header',
    props: {
      slot: [
        { type: 'atom', name: 'link', props: { slot: 'Home', url: '/' } },
        { type: 'atom', name: 'link', props: { slot: 'FSM + Store Demo', url: '/examples/fsm-store' } },
      ]
    }
  },
  {
    type: 'organism',
    name: 'hero',
    props: {
      slot: [
        { type: 'atom', name: 'text', props: { is: 'h1', slot: ['FSM + Store Organism'] } },
        { type: 'atom', name: 'text', props: { is: 'p', slot: 'Drop this one organism. Get a full multi-step form with state machine and store. Zero deps. Zero tears.' } }
      ]
    }
  },
  {
    type: 'organism',
    name: 'multi-step-form',
    props: { className: 'container',slot: [''] }
  },
  {
    type: 'organism',
    name: 'footer',
    props: {
      slot: [{ type: 'atom', name: 'text', props: { is: 'p', slot: '© 2025 b0nes' } }]
    }
  }
];