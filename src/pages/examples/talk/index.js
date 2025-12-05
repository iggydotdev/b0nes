// src/pages/examples/talk/index.js
import { stylesheetPresets } from '../../../framework/config/stylesheets.js';
import presentationSlides from './slides/index.js';
export const meta = {
  title: 'Your framework downloaded 700 MB to render a button',
  description: 'DDD Brisbane 2025 – b0nes: the revenge of vanilla JS',
  stylesheets: stylesheetPresets.combine(
    './custom.css'
  ),
  scripts: ['./tailwind.js']
};

export const components = [
  {
    type: 'organism',
    name: 'slides',
    props: {
      slides: presentationSlides
    }
  }
];