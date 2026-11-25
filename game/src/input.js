// Mouse and keyboard input: converts canvas clicks and keys into kitchen actions.

import { INGREDIENTS, LAYOUT } from './config.js';
import { grabIngredient, useChopBoard, useBurner, usePlate, serveDish, trashCarry, startGame, restart } from './kitchen.js';

export function binRect(i) {
  return { x: LAYOUT.binsX + i * (LAYOUT.binW + LAYOUT.binGap), y: LAYOUT.binsY, w: LAYOUT.binW, h: LAYOUT.binH };
}

export function burnerRect(i) {
  const s = LAYOUT.stove;
  return { x: s.x + 18 + i * 150, y: s.y + 58, w: 132, h: 118 };
}

function hit(r, x, y) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function startButtonRect() {
  return { x: 490, y: 452, w: 300, h: 72 };
}

export function handleClick(state, x, y) {
  if (state.frozen) return;
  if (state.mode === 'title') {
    if (hit(startButtonRect(), x, y)) startGame(state);
    return;
  }
  if (state.mode === 'over') {
    if (hit(startButtonRect(), x, y)) restart(state);
    return;
  }
  if (state.mode !== 'play') return;
  for (let i = 0; i < INGREDIENTS.length; i++) {
    if (hit(binRect(i), x, y)) { grabIngredient(state, INGREDIENTS[i].id); return; }
  }
  if (hit(LAYOUT.chop, x, y)) { useChopBoard(state); return; }
  for (let i = 0; i < 2; i++) {
    if (hit(burnerRect(i), x, y)) { useBurner(state, i); return; }
  }
  if (hit(LAYOUT.stove, x, y)) { useBurner(state, 0); return; }
  if (hit(LAYOUT.plate, x, y)) { usePlate(state); return; }
  if (hit(LAYOUT.serve, x, y)) { serveDish(state); return; }
  if (hit(LAYOUT.trash, x, y)) { trashCarry(state); return; }
}

export function handleKey(state, key) {
  if (state.frozen) return;
  const k = key.toLowerCase();
  if (state.mode === 'title' && (k === ' ' || k === 'enter')) { startGame(state); return; }
  if (state.mode === 'over' && (k === 'r' || k === 'enter' || k === ' ')) { restart(state); return; }
  if (k === 'p') {
    if (state.mode === 'play') state.mode = 'paused';
    else if (state.mode === 'paused') state.mode = 'play';
    return;
  }
  if (state.mode !== 'play') return;
  const ing = INGREDIENTS.find((i) => i.key === k);
  if (ing) { grabIngredient(state, ing.id); return; }
  if (k === 'q') useChopBoard(state);
  else if (k === 'w') useBurner(state, 0);
  else if (k === 'e') useBurner(state, 1);
  else if (k === 'a') usePlate(state);
  else if (k === 's') serveDish(state);
  else if (k === 't') trashCarry(state);
  else if (k === 'r') restart(state);
}

export function attachInput(canvas, state, toCanvas) {
  canvas.addEventListener('pointerdown', (ev) => {
    const p = toCanvas(ev);
    handleClick(state, p.x, p.y);
  });
  window.addEventListener('keydown', (ev) => {
    if (ev.key === ' ') ev.preventDefault();
    handleKey(state, ev.key);
  });
}
