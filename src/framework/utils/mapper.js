// src/utils/mapper.js
import { getComponentFn, getComponentType } from './componentResolver.js';

/**
 * JS function call → b0nes config object
 */
export const toConfig = (componentFn, args) => {
  const name = componentFn.name; // 'button', 'card', etc.
  const type = getComponentType(name); // atom/molecule/organism
  return { type, name, props: args };
};

/**
 * b0nes config → actual function call string
 */
export const fromConfig = (config) => {
  const { type, name, props } = config;
  const fn = getComponentFn(type, name); // resolve from index
  return `${name}(${JSON.stringify(props, null, 2)})`;
};