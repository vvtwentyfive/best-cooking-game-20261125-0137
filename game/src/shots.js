// Deterministic screenshot staging: ?shot=start|play|end&seed=1 freezes a fixed scene.

export function shotParams() {
  if (typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search);
  const shot = q.get('shot');
  if (!shot) return null;
  const seed = Number(q.get('seed') || '1') || 1;
  return { shot, seed };
}

function ticket(recipeId, total, left, id) {
  return { id, recipeId, total, left, flash: 0 };
}

export function stageShot(state, shot) {
  state.frozen = true;
  state.mode = 'play';
  state.steamPhase = 1.25;
  state.popups = [];
  state.events = [];
  state.messageT = 10;
  if (shot === 'start') {
    // COVER: 3 tickets, ingredients out, dish mid-assembly, finished plate ready.
    state.score = 340;
    state.served = 4;
    state.lives = 3;
    state.elapsed = 96;
    state.orders = [
      ticket('nasi-goreng', 55, 41, 101),
      ticket('mie-ayam', 58, 33, 102),
      ticket('nasi-telur', 52, 47, 103),
    ];
    state.carry = { id: 'nasi-telur', stage: 'dish' };
    state.chopBoard = { id: 'chicken', chops: 2 };
    state.burners = [
      { id: 'noodle', t: 1.9, ready: false, burnt: false },
      { id: 'chili', t: 2.4, ready: true, burnt: false },
    ];
    state.plate = ['rice'];
    state.plateDish = null;
    state.message = 'Nasi Telur ready — serve it at the glowing window!';
  } else if (shot === 'play') {
    // Mid-action: carrying, cooking with steam, chopping in progress.
    state.score = 180;
    state.served = 2;
    state.lives = 3;
    state.elapsed = 58;
    state.orders = [
      ticket('mie-goreng', 54, 22, 201),
      ticket('nasi-telur', 56, 44, 202),
    ];
    state.carry = { id: 'veg', stage: 'chopped' };
    state.chopBoard = { id: 'chili', chops: 1 };
    state.burners = [
      { id: 'egg', t: 1.2, ready: false, burnt: false },
      null,
    ];
    state.plate = ['noodle'];
    state.plateDish = null;
    state.message = 'Chopped veg in hand — onto the stove!';
  } else if (shot === 'end') {
    // Rush moment: dish being served, score popup, several tickets.
    state.score = 960;
    state.served = 11;
    state.lives = 2;
    state.elapsed = 210;
    state.orders = [
      ticket('nasi-goreng', 44, 9, 301),
      ticket('mie-ayam', 46, 18, 302),
      ticket('tumis-sayur', 40, 26, 303),
      ticket('ayam-pedas', 42, 35, 304),
    ];
    state.carry = { id: 'nasi-goreng', stage: 'dish' };
    state.chopBoard = { id: 'veg', chops: 3 };
    state.burners = [
      { id: 'chicken', t: 3.1, ready: false, burnt: false },
      { id: 'rice', t: 3.6, ready: true, burnt: false },
    ];
    state.plate = [];
    state.plateDish = null;
    state.popups = [{ text: '+152', x: 1107, y: 452, t: 1.2, color: '#7dff6a' }];
    state.message = 'Nasi Goreng served! +152 (tip 32)';
  } else {
    state.frozen = false;
  }
}
