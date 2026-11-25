// Order generation and ticket timers. All randomness flows through the seeded rng.

import { RECIPES, MAX_TICKETS, RAMP_SECONDS, SPAWN_START, SPAWN_END, ORDER_TIME_START, ORDER_TIME_END } from './config.js';

export function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ramp(elapsed, from, to) {
  const k = Math.min(1, elapsed / RAMP_SECONDS);
  return from + (to - from) * k;
}

export function spawnInterval(elapsed) {
  return ramp(elapsed, SPAWN_START, SPAWN_END);
}

export function orderTime(elapsed) {
  return ramp(elapsed, ORDER_TIME_START, ORDER_TIME_END);
}

let nextTicketId = 1;

export function newOrder(rng, elapsed) {
  const recipe = RECIPES[Math.floor(rng() * RECIPES.length)];
  const total = orderTime(elapsed) * (0.9 + rng() * 0.25);
  return { id: nextTicketId++, recipeId: recipe.id, total, left: total, flash: 0 };
}

export function tickOrders(state, dt) {
  const expired = [];
  for (const o of state.orders) {
    o.left -= dt;
    if (o.flash > 0) o.flash -= dt;
    if (o.left <= 0) expired.push(o);
  }
  for (const o of expired) {
    state.orders.splice(state.orders.indexOf(o), 1);
    state.lives -= 1;
    state.events.push({ type: 'expired', recipeId: o.recipeId });
  }
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    state.spawnTimer = spawnInterval(state.elapsed);
    if (state.orders.length < MAX_TICKETS) {
      state.orders.push(newOrder(state.rng, state.elapsed));
      state.events.push({ type: 'newOrder' });
    }
  }
}
