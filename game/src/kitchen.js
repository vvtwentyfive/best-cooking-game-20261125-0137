// Kitchen state and every player action: grab, chop, cook, plate, serve, trash.

import { ING_BY_ID, CHOPS_NEEDED, OVERCOOK_AFTER, START_LIVES } from './config.js';
import { dishForParts, recipeById } from './recipes.js';
import { makeRng, newOrder, tickOrders, spawnInterval } from './orders.js';

export function newGame(seed) {
  const rng = makeRng(seed);
  const state = {
    mode: 'title', // title | play | paused | over
    rng,
    seed,
    elapsed: 0,
    score: 0,
    served: 0,
    lives: START_LIVES,
    orders: [],
    spawnTimer: 4,
    carry: null, // { id, stage: 'raw'|'chopped'|'cooked'|'burnt' }
    chopBoard: null, // { id, chops }
    burners: [null, null], // { id, t, ready, burnt }
    plate: [], // cooked ingredient ids on the plate
    plateDish: null, // recipe id when plate matches a dish
    popups: [], // { text, x, y, t, color }
    events: [],
    message: 'Click START, then grab ingredients!',
    messageT: 0,
    frozen: false,
    steamPhase: 0,
  };
  state.orders.push(newOrder(rng, 0));
  state.orders.push(newOrder(rng, 0));
  return state;
}

function say(state, text) {
  state.message = text;
  state.messageT = 3.2;
}

function popup(state, text, x, y, color) {
  state.popups.push({ text, x, y, t: 1.4, color: color || '#fff3d6' });
}

export function startGame(state) {
  state.mode = 'play';
  say(state, 'Orders in! Grab ingredients from the counter.');
}

export function grabIngredient(state, id) {
  if (state.mode !== 'play') return;
  if (state.carry) { say(state, 'Hands full! Use or trash what you hold.'); return; }
  state.carry = { id, stage: 'raw' };
  const ing = ING_BY_ID[id];
  say(state, ing.needsChop ? `${ing.name} grabbed — chop it first!` : `${ing.name} grabbed — onto the stove!`);
  state.events.push({ type: 'grab' });
}

export function useChopBoard(state) {
  if (state.mode !== 'play') return;
  if (state.chopBoard) {
    state.chopBoard.chops += 1;
    state.events.push({ type: 'chop' });
    if (state.chopBoard.chops >= CHOPS_NEEDED) {
      const id = state.chopBoard.id;
      state.chopBoard = null;
      if (!state.carry) {
        state.carry = { id, stage: 'chopped' };
        say(state, `${ING_BY_ID[id].name} chopped! To the stove.`);
      } else {
        say(state, 'Chopped! Hands full — clear them first.');
        state.chopBoard = { id, chops: CHOPS_NEEDED };
      }
    }
    return;
  }
  if (!state.carry) { say(state, 'Bring an ingredient to chop.'); return; }
  if (state.carry.stage !== 'raw' || !ING_BY_ID[state.carry.id].needsChop) {
    say(state, `${ING_BY_ID[state.carry.id].name} needs no chopping.`);
    return;
  }
  state.chopBoard = { id: state.carry.id, chops: 0 };
  state.carry = null;
  say(state, 'Click the board 3 times to chop!');
}

export function useBurner(state, idx) {
  if (state.mode !== 'play') return;
  const b = state.burners[idx];
  if (b) {
    if (b.burnt) {
      state.burners[idx] = null;
      say(state, 'Burnt pan cleared. Watch the timer!');
      state.events.push({ type: 'trash' });
      return;
    }
    if (b.ready) {
      if (state.carry) { say(state, 'Hands full!'); return; }
      state.carry = { id: b.id, stage: 'cooked' };
      state.burners[idx] = null;
      say(state, `${ING_BY_ID[b.id].name} cooked — plate it!`);
      state.events.push({ type: 'pickup' });
      return;
    }
    say(state, 'Still cooking…');
    return;
  }
  if (!state.carry) { say(state, 'Bring an ingredient to cook.'); return; }
  if (state.carry.stage === 'cooked' || state.carry.stage === 'burnt') { say(state, 'Already cooked!'); return; }
  if (state.carry.stage === 'raw' && ING_BY_ID[state.carry.id].needsChop) {
    say(state, `Chop the ${ING_BY_ID[state.carry.id].name} first!`);
    return;
  }
  state.burners[idx] = { id: state.carry.id, t: 0, ready: false, burnt: false };
  state.carry = null;
  state.events.push({ type: 'sizzle' });
}

export function usePlate(state) {
  if (state.mode !== 'play') return;
  if (state.plateDish) {
    if (state.carry) { say(state, 'Hands full!'); return; }
    state.carry = { id: state.plateDish, stage: 'dish' };
    state.plate = [];
    state.plateDish = null;
    say(state, 'Dish in hand — serve it at the window!');
    state.events.push({ type: 'pickup' });
    return;
  }
  if (!state.carry) { say(state, 'Bring a cooked ingredient to plate.'); return; }
  if (state.carry.stage !== 'cooked') { say(state, 'Only cooked ingredients go on the plate.'); return; }
  if (state.plate.includes(state.carry.id)) { say(state, 'Already on the plate!'); return; }
  state.plate.push(state.carry.id);
  state.carry = null;
  const dish = dishForParts(state.plate);
  if (dish) {
    state.plateDish = dish.id;
    say(state, `${dish.name} ready! Click the plate to pick it up.`);
    state.events.push({ type: 'dishReady' });
    popup(state, dish.name + '!', 1107, 250, '#ffb52e');
  } else {
    say(state, 'On the plate. Add more to finish a dish.');
  }
}

export function serveDish(state) {
  if (state.mode !== 'play') return;
  if (!state.carry || state.carry.stage !== 'dish') { say(state, 'Bring a finished dish to serve.'); return; }
  const dishId = state.carry.id;
  const idx = state.orders.findIndex((o) => o.recipeId === dishId);
  if (idx < 0) {
    say(state, 'No order for that dish!');
    state.events.push({ type: 'wrong' });
    return;
  }
  const order = state.orders[idx];
  const recipe = recipeById(dishId);
  const tip = Math.round((order.left / order.total) * 40);
  const gain = recipe.price + tip;
  state.score += gain;
  state.served += 1;
  state.orders.splice(idx, 1);
  state.carry = null;
  popup(state, `+${gain}`, 1107, 470, '#7dff6a');
  say(state, `${recipe.name} served! +${gain} (tip ${tip})`);
  state.events.push({ type: 'serve' });
}

export function trashCarry(state) {
  if (state.mode !== 'play') return;
  if (state.carry) {
    state.carry = null;
    say(state, 'Trashed. Hands free.');
    state.events.push({ type: 'trash' });
  } else if (state.plate.length > 0 && !state.plateDish) {
    state.plate = [];
    say(state, 'Plate cleared.');
    state.events.push({ type: 'trash' });
  } else {
    say(state, 'Nothing to trash.');
  }
}

export function tickKitchen(state, dt) {
  state.elapsed += dt;
  state.steamPhase += dt;
  if (state.messageT > 0) state.messageT -= dt;
  for (const p of state.popups) { p.t -= dt; p.y -= dt * 34; }
  state.popups = state.popups.filter((p) => p.t > 0);
  for (let i = 0; i < state.burners.length; i++) {
    const b = state.burners[i];
    if (!b || b.burnt) continue;
    b.t += dt;
    const need = ING_BY_ID[b.id].cookTime;
    if (!b.ready && b.t >= need) {
      b.ready = true;
      state.events.push({ type: 'ready' });
      popup(state, 'Ready!', 700 + i * 150, 280, '#7dff6a');
    }
    if (b.ready && b.t >= need + OVERCOOK_AFTER) {
      b.burnt = true;
      b.ready = false;
      state.events.push({ type: 'burnt' });
      popup(state, 'Burnt!', 700 + i * 150, 280, '#ff6a5e');
    }
  }
  tickOrders(state, dt);
  if (state.lives <= 0 && state.mode === 'play') {
    state.mode = 'over';
    state.events.push({ type: 'gameover' });
  }
}

export function restart(state) {
  const fresh = newGame(state.seed + 1);
  Object.assign(state, fresh);
  state.mode = 'play';
  say(state, 'New shift! Orders incoming…');
}

export { spawnInterval };
