// Recipe matching: a plate matches a dish when its ingredient set equals the recipe parts.

import { RECIPES, ING_BY_ID } from './config.js';

export function dishForParts(parts) {
  const sorted = [...parts].sort().join(',');
  for (const r of RECIPES) {
    if ([...r.parts].sort().join(',') === sorted) return r;
  }
  return null;
}

export function isPrefixOfSomeDish(parts) {
  return RECIPES.some((r) => parts.every((p) => r.parts.includes(p)));
}

export function partsLabel(parts) {
  return parts.map((p) => ING_BY_ID[p].name).join(' + ');
}

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id) || null;
}
