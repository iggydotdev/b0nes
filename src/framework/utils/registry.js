// src/components/registry.js
import * as atoms from '../../components/atoms/index.js';
import * as molecules from '../../components/molecules/index.js';
import * as organisms from '../../components/organisms/index.js';

const registry = { atoms, molecules, organisms };

export const getComponentFn = (type, name) => {
  return registry[type + 's'][name];
};

export const getComponentType = (name) => {
  // Simple: check which index exports it
  if (atoms[name]) return 'atom';
  if (molecules[name]) return 'molecule';
  if (organisms[name]) return 'organism';
};