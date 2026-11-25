// Dapur Kilat boot: canvas setup, fixed-step loop, event sounds, screenshot freeze.

import { W, H } from './config.js';
import { newGame, tickKitchen } from './kitchen.js';
import { draw } from './render.js';
import { attachInput } from './input.js';
import { playEvent } from './audio.js';
import { shotParams, stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const shot = shotParams();
const seed = shot ? shot.seed : (Math.floor(Math.random() * 1e9) || 7);
const state = newGame(seed);
if (shot) stageShot(state, shot.shot);

function toCanvas(ev) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((ev.clientX - r.left) / r.width) * W,
    y: ((ev.clientY - r.top) / r.height) * H,
  };
}

attachInput(canvas, state, toCanvas);

let last = performance.now();
let acc = 0;
const STEP = 1 / 60;

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (!state.frozen && state.mode === 'play') {
    acc += dt;
    while (acc >= STEP) {
      tickKitchen(state, STEP);
      acc -= STEP;
    }
  } else if (!state.frozen && state.mode === 'title') {
    state.steamPhase += dt;
  }
  while (state.events.length > 0) {
    playEvent(state.events.shift().type);
  }
  draw(ctx, state);
  if (!state.frozen) requestAnimationFrame(frame);
}

draw(ctx, state);
if (!state.frozen) requestAnimationFrame(frame);
