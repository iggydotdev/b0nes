// src/utils/mapper.js
import { getComponentType } from './registry.js';

/**
 * JS function call → b0nes config object
 */
/**
 * JS function call → b0nes config object
 * This function is updated to recursively handle nested component configurations in 'slot' arrays
 * when converting to a config object.
 */
export const toConfig = (componentFn, args) => {
  const name = componentFn.name; // 'button', 'card', etc.
  const type = getComponentType(name); // atom/molecule/organism

  const processedProps = {};
  for (const key in args) {
    if (Object.prototype.hasOwnProperty.call(args, key)) {
      const value = args[key];

      if (key === 'slot' && Array.isArray(value)) {
        // Recursively process slot items
        processedProps[key] = value.map(item => {
          // If the item is already a b0nes config object (has type, name, props), keep it as is.
          // This ensures that pre-existing nested configs are preserved.
          if (typeof item === 'object' && item !== null && item.type && item.name && item.props !== undefined) {
            return item;
          }
          // For other values (strings, numbers, etc.), just include them directly.
          // Note: This function does not attempt to parse raw HTML strings back into component configs.
          return item;
        });
      } else {
        // For all other properties, copy them directly.
        processedProps[key] = value;
      }
    }
  }

  return { type, name, props: processedProps };
};


/**
 * b0nes config → actual function call string
 * This function is updated to recursively handle nested component configurations in 'slot' arrays.
 */
export const fromConfig = (config) => {

  const processProps = (currentProps) => {
    const propParts = [];
    for (const key in currentProps) {
      if (Object.prototype.hasOwnProperty.call(currentProps, key)) {
        const value = currentProps[key];

        if (key === 'slot' && Array.isArray(value)) {
          // Recursively process slot items
          const slotContent = value.map(item => {
            if (typeof item === 'object' && item !== null && item.type && item.name) {
              // It's a nested component config, recursively call fromConfig
              return fromConfig(item);
            }
            // It's a plain string or primitive, ensure it's properly quoted for JS
            return JSON.stringify(item);
          }).join(', ');
          propParts.push(`slot: [${slotContent}]`);
        } else if (typeof value === 'object' && value !== null) {
          // Other object props (like attrs object if it were an object) should be stringified
          propParts.push(`${key}: ${JSON.stringify(value)}`);
        } else {
          // Primitives (strings, numbers, booleans)
          propParts.push(`${key}: ${JSON.stringify(value)}`);
        }
      }
    }
    return propParts.join(', ');
  };
  if (Array.isArray(config)){
    return config.map( comp => {
        const { type, name, props } = comp;
        const propsString = processProps(props);
        return `${name}({ ${propsString} })`;
    }).join(';');
  } else {
    const { type, name, props } = config;
    const propsString = processProps(props);
    return `${name}({ ${propsString} })`;
  }
};