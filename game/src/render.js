// All canvas drawing for Dapur Kilat: kitchen, food, tickets, HUD, overlays.

import { W, H, INGREDIENTS, ING_BY_ID, RECIPES, LAYOUT, COLORS, CHOPS_NEEDED } from './config.js';
import { binRect, burnerRect, startButtonRect } from './input.js';
import { recipeById } from './recipes.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, align, bold) {
  ctx.fillStyle = color;
  ctx.font = `${bold ? 'bold ' : ''}${size}px Verdana, Geneva, sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function steam(ctx, x, y, phase, n) {
  ctx.strokeStyle = 'rgba(255,250,240,0.85)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (let i = 0; i < (n || 3); i++) {
    const sx = x + (i - 1) * 16;
    const wob = Math.sin(phase * 3 + i * 1.7) * 5;
    ctx.beginPath();
    ctx.moveTo(sx, y);
    ctx.quadraticCurveTo(sx + wob, y - 14, sx - wob, y - 28);
    ctx.stroke();
  }
}

// --- food icons -------------------------------------------------------------

export function drawFood(ctx, id, x, y, s, stage) {
  const ing = ING_BY_ID[id];
  ctx.save();
  ctx.translate(x, y);
  const burnt = stage === 'burnt';
  if (id === 'rice') {
    // soft shadow + outline so the white mound reads on pale tickets and bins
    ctx.fillStyle = 'rgba(120,90,40,0.25)';
    ctx.beginPath(); ctx.ellipse(0, 10 * s, 20 * s, 9 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = burnt ? '#4a3a28' : ing.color;
    ctx.strokeStyle = burnt ? '#2e2114' : '#b8a678';
    ctx.lineWidth = 1.6 * s;
    ctx.beginPath(); ctx.ellipse(0, 6 * s, 20 * s, 12 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, -2 * s, 14 * s, 9 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = burnt ? '#2e2114' : '#fffdf4';
    for (const [gx, gy] of [[-8, 2], [0, -4], [8, 3], [-3, 6], [5, -1]]) {
      ctx.beginPath(); ctx.ellipse(gx * s, gy * s, 3.4 * s, 1.6 * s, 0.6, 0, Math.PI * 2); ctx.fill();
    }
  } else if (id === 'egg') {
    ctx.fillStyle = burnt ? '#6b5636' : '#fffdf4';
    ctx.strokeStyle = burnt ? '#4a3a1e' : '#d9c48f';
    ctx.lineWidth = 1.6 * s;
    ctx.beginPath(); ctx.ellipse(0, 2 * s, 19 * s, 13 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = burnt ? '#3d2c12' : '#ffb52e';
    ctx.beginPath(); ctx.arc(1 * s, 0, 8 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.arc(-2 * s, -3 * s, 2.6 * s, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'chicken') {
    ctx.fillStyle = burnt ? '#3a2413' : ing.color;
    ctx.beginPath(); ctx.ellipse(-2 * s, 0, 15 * s, 11 * s, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = burnt ? '#241708' : ing.dark;
    ctx.beginPath(); ctx.ellipse(-6 * s, -3 * s, 7 * s, 4.4 * s, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = burnt ? '#8a7a5e' : '#fff6e0';
    ctx.lineWidth = 4.4 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(9 * s, 6 * s); ctx.lineTo(17 * s, 12 * s); ctx.stroke();
    ctx.fillStyle = burnt ? '#8a7a5e' : '#fff6e0';
    ctx.beginPath(); ctx.arc(18 * s, 13 * s, 3.4 * s, 0, Math.PI * 2); ctx.fill();
    if (stage === 'chopped' || stage === 'cooked') {
      ctx.strokeStyle = 'rgba(60,30,5,0.5)'; ctx.lineWidth = 1.6 * s;
      ctx.beginPath(); ctx.moveTo(-10 * s, -6 * s); ctx.lineTo(-2 * s, 8 * s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-2 * s, -8 * s); ctx.lineTo(6 * s, 6 * s); ctx.stroke();
    }
  } else if (id === 'noodle') {
    ctx.fillStyle = '#c94f2e';
    ctx.beginPath(); ctx.ellipse(0, 8 * s, 21 * s, 7 * s, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = burnt ? '#6b4a1e' : ing.color;
    ctx.beginPath(); ctx.ellipse(0, 2 * s, 19 * s, 9 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = burnt ? '#3d2a0e' : '#e8b53a';
    ctx.lineWidth = 2.2 * s;
    for (const oy of [-3, 0, 3]) {
      ctx.beginPath();
      ctx.moveTo(-14 * s, oy * s);
      ctx.quadraticCurveTo(-5 * s, (oy - 4) * s, 3 * s, oy * s);
      ctx.quadraticCurveTo(10 * s, (oy + 4) * s, 15 * s, oy * s);
      ctx.stroke();
    }
  } else if (id === 'veg') {
    ctx.fillStyle = burnt ? '#33401f' : ing.color;
    for (const [lx, ly, rot] of [[-9, 2, -0.5], [0, -4, 0.1], [9, 2, 0.5]]) {
      ctx.save(); ctx.translate(lx * s, ly * s); ctx.rotate(rot);
      ctx.beginPath(); ctx.ellipse(0, 0, 8 * s, 12 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = burnt ? '#1d2610' : ing.dark;
    ctx.lineWidth = 1.8 * s;
    ctx.beginPath(); ctx.moveTo(0, -14 * s); ctx.lineTo(0, 10 * s); ctx.stroke();
  } else if (id === 'chili') {
    ctx.fillStyle = burnt ? '#4a1510' : ing.color;
    ctx.beginPath();
    ctx.moveTo(-14 * s, -6 * s);
    ctx.quadraticCurveTo(6 * s, -12 * s, 14 * s, 4 * s);
    ctx.quadraticCurveTo(16 * s, 12 * s, 6 * s, 10 * s);
    ctx.quadraticCurveTo(-8 * s, 6 * s, -14 * s, -6 * s);
    ctx.fill();
    ctx.fillStyle = burnt ? '#22301a' : '#3f9e2c';
    ctx.beginPath(); ctx.ellipse(-13 * s, -8 * s, 5 * s, 3 * s, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath(); ctx.ellipse(2 * s, -4 * s, 6 * s, 2.4 * s, -0.3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawDish(ctx, dishId, x, y, s, phase) {
  const r = recipeById(dishId);
  if (!r) return;
  ctx.save();
  ctx.translate(x, y);
  // plate
  ctx.fillStyle = '#f4f6f8';
  ctx.beginPath(); ctx.ellipse(0, 10 * s, 34 * s, 13 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#d7dde2';
  ctx.beginPath(); ctx.ellipse(0, 8 * s, 26 * s, 9.5 * s, 0, 0, Math.PI * 2); ctx.fill();
  // base by main ingredient
  if (r.parts.includes('rice')) drawFood(ctx, 'rice', -6 * s, -2 * s, s * 1.05, 'cooked');
  if (r.parts.includes('noodle')) drawFood(ctx, 'noodle', -4 * s, -2 * s, s * 1.05, 'cooked');
  if (r.parts.includes('egg')) drawFood(ctx, 'egg', 13 * s, -6 * s, s * 0.8, 'cooked');
  if (r.parts.includes('chicken')) drawFood(ctx, 'chicken', 12 * s, 0, s * 0.8, 'cooked');
  if (r.parts.includes('veg')) drawFood(ctx, 'veg', -15 * s, -8 * s, s * 0.6, 'cooked');
  if (r.parts.includes('chili')) drawFood(ctx, 'chili', 16 * s, -12 * s, s * 0.55, 'cooked');
  ctx.restore();
  steam(ctx, x, y - 22 * s, phase, 3);
}

// --- sections ---------------------------------------------------------------

function drawTopBar(ctx, state) {
  ctx.fillStyle = COLORS.panelDark;
  ctx.fillRect(0, 0, W, LAYOUT.topBar.h);
  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(0, LAYOUT.topBar.h - 4, W, 4);
  text(ctx, 'DAPUR KILAT', 20, 32, 30, COLORS.gold, 'left', true);
  text(ctx, 'Warung Rush', 252, 34, 18, COLORS.cream, 'left', false);
  text(ctx, `Score ${state.score}`, 520, 32, 26, COLORS.cream, 'left', true);
  text(ctx, `Served ${state.served}`, 730, 32, 22, COLORS.cream, 'left', false);
  // lives as hearts
  for (let i = 0; i < 3; i++) {
    const hx = 1090 + i * 44, hy = 30;
    ctx.fillStyle = i < state.lives ? '#ff4d6d' : '#5d4a3a';
    ctx.beginPath();
    ctx.moveTo(hx, hy + 10);
    ctx.bezierCurveTo(hx - 16, hy - 6, hx - 7, hy - 16, hx, hy - 6);
    ctx.bezierCurveTo(hx + 7, hy - 16, hx + 16, hy - 6, hx, hy + 10);
    ctx.fill();
  }
  const mm = Math.floor(state.elapsed / 60), ss = Math.floor(state.elapsed % 60);
  text(ctx, `${mm}:${String(ss).padStart(2, '0')}`, 1240, 32, 22, COLORS.cream, 'right', true);
}

function drawBoard(ctx, state) {
  const b = LAYOUT.board;
  ctx.fillStyle = COLORS.panel;
  rr(ctx, b.x, b.y, b.w, b.h, 12); ctx.fill();
  ctx.strokeStyle = COLORS.woodLight; ctx.lineWidth = 3; rr(ctx, b.x, b.y, b.w, b.h, 12); ctx.stroke();
  text(ctx, 'ORDER BOARD', b.x + b.w / 2, b.y + 26, 22, COLORS.gold, 'center', true);
  if (state.orders.length === 0) {
    text(ctx, 'No orders…', b.x + b.w / 2, b.y + 90, 20, COLORS.cream, 'center', false);
    text(ctx, 'breathe!', b.x + b.w / 2, b.y + 120, 20, COLORS.cream, 'center', false);
  }
  state.orders.forEach((o, i) => {
    const r = recipeById(o.recipeId);
    const ty = b.y + 48 + i * 102;
    const frac = Math.max(0, o.left / o.total);
    const urgent = frac < 0.3;
    ctx.fillStyle = urgent ? '#ffe1dc' : COLORS.paper;
    rr(ctx, b.x + 10, ty, b.w - 20, 94, 8); ctx.fill();
    ctx.strokeStyle = urgent ? COLORS.red : '#c9a86a'; ctx.lineWidth = urgent ? 3 : 2;
    rr(ctx, b.x + 10, ty, b.w - 20, 94, 8); ctx.stroke();
    text(ctx, r.name, b.x + 22, ty + 20, 21, COLORS.ink, 'left', true);
    text(ctx, `${Math.ceil(o.left)}s`, b.x + b.w - 22, ty + 20, 20, urgent ? COLORS.red : '#7a5a20', 'right', true);
    r.parts.forEach((p, j) => drawFood(ctx, p, b.x + 44 + j * 56, ty + 52, 0.85, 'raw'));
    // timer bar
    ctx.fillStyle = '#e5d9bd';
    rr(ctx, b.x + 16, ty + 76, b.w - 32, 10, 5); ctx.fill();
    ctx.fillStyle = frac > 0.5 ? COLORS.green : frac > 0.3 ? COLORS.gold : COLORS.red;
    if (frac > 0.01) { rr(ctx, b.x + 16, ty + 76, (b.w - 32) * frac, 10, 5); ctx.fill(); }
  });
  // recipe cheat sheet fills the board bottom — no dead space
  const cy = b.y + b.h - 118;
  ctx.fillStyle = COLORS.panelDark;
  rr(ctx, b.x + 10, cy, b.w - 20, 108, 8); ctx.fill();
  text(ctx, 'MENU', b.x + b.w / 2, cy + 16, 16, COLORS.gold, 'center', true);
  RECIPES.forEach((r, i) => {
    text(ctx, `${r.name}  ${r.parts.map((p) => ING_BY_ID[p].name).join('+')}  ${r.price}`, b.x + 18, cy + 38 + i * 13, 12.5, COLORS.cream, 'left', false);
  });
}

function drawBins(ctx, state) {
  INGREDIENTS.forEach((ing, i) => {
    const r = binRect(i);
    ctx.fillStyle = COLORS.wood;
    rr(ctx, r.x, r.y, r.w, r.h, 10); ctx.fill();
    ctx.fillStyle = COLORS.woodLight;
    rr(ctx, r.x + 6, r.y + 6, r.w - 12, r.h - 12, 8); ctx.fill();
    ctx.fillStyle = '#fff8e7';
    rr(ctx, r.x + 14, r.y + 10, r.w - 28, 52, 8); ctx.fill();
    drawFood(ctx, ing.id, r.x + r.w / 2, r.y + 38, 1.05, 'raw');
    text(ctx, ing.name, r.x + r.w / 2, r.y + 76, 18, COLORS.ink, 'center', true);
    text(ctx, `[${ing.key}]${ing.needsChop ? ' chop' : ''}`, r.x + r.w / 2, r.y + 94, 13, '#5a3210', 'center', false);
  });
  text(ctx, 'INGREDIENT COUNTER — click to grab', LAYOUT.binsX, 76, 15, COLORS.cream, 'left', true);
}

function panel(ctx, r, title) {
  ctx.fillStyle = COLORS.panel;
  rr(ctx, r.x, r.y, r.w, r.h, 12); ctx.fill();
  ctx.strokeStyle = COLORS.woodLight; ctx.lineWidth = 3; rr(ctx, r.x, r.y, r.w, r.h, 12); ctx.stroke();
  text(ctx, title, r.x + r.w / 2, r.y + 24, 20, COLORS.gold, 'center', true);
}

function drawChop(ctx, state) {
  const r = LAYOUT.chop;
  panel(ctx, r, 'CHOPPING  [Q]');
  ctx.fillStyle = '#d9b77c';
  rr(ctx, r.x + 30, r.y + 46, r.w - 60, 104, 10); ctx.fill();
  ctx.strokeStyle = '#a87f3f'; ctx.lineWidth = 3; rr(ctx, r.x + 30, r.y + 46, r.w - 60, 104, 10); ctx.stroke();
  if (state.chopBoard) {
    const cb = state.chopBoard;
    drawFood(ctx, cb.id, r.x + r.w / 2, r.y + 96, 1.5, cb.chops >= CHOPS_NEEDED ? 'chopped' : 'raw');
    // knife
    ctx.save();
    ctx.translate(r.x + r.w / 2 + 52, r.y + 70);
    ctx.rotate(-0.5 + (cb.chops % 2) * 0.25);
    ctx.fillStyle = '#cfd6db';
    ctx.fillRect(-34, -5, 40, 10);
    ctx.fillStyle = '#5a3210';
    ctx.fillRect(6, -4, 22, 8);
    ctx.restore();
    for (let i = 0; i < CHOPS_NEEDED; i++) {
      ctx.fillStyle = i < cb.chops ? COLORS.green : '#8a6a3a';
      ctx.beginPath(); ctx.arc(r.x + r.w / 2 - 30 + i * 30, r.y + 168, 9, 0, Math.PI * 2); ctx.fill();
    }
    text(ctx, cb.chops >= CHOPS_NEEDED ? 'Chopped! Click to take' : `Chop! ${cb.chops}/${CHOPS_NEEDED}`, r.x + r.w / 2, r.y + 186, 16, COLORS.cream, 'center', true);
  } else {
    text(ctx, 'empty board', r.x + r.w / 2, r.y + 96, 18, '#e8d5ae', 'center', false);
    text(ctx, 'chicken · veg · chili', r.x + r.w / 2, r.y + 186, 15, COLORS.cream, 'center', false);
  }
}

function drawStove(ctx, state) {
  const r = LAYOUT.stove;
  panel(ctx, r, 'STOVE  [W] [E]');
  for (let i = 0; i < 2; i++) {
    const br = burnerRect(i);
    ctx.fillStyle = COLORS.steelDark;
    rr(ctx, br.x, br.y, br.w, br.h, 10); ctx.fill();
    ctx.fillStyle = '#33383c';
    ctx.beginPath(); ctx.arc(br.x + br.w / 2, br.y + 52, 40, 0, Math.PI * 2); ctx.fill();
    const b = state.burners[i];
    if (b) {
      // pan
      ctx.fillStyle = b.burnt ? '#1c1c1c' : '#4a5054';
      ctx.beginPath(); ctx.arc(br.x + br.w / 2, br.y + 52, 34, 0, Math.PI * 2); ctx.fill();
      drawFood(ctx, b.id, br.x + br.w / 2, br.y + 50, 1.15, b.burnt ? 'burnt' : 'cooked');
      if (!b.burnt) steam(ctx, br.x + br.w / 2, br.y + 22, state.steamPhase + i * 2, 3);
      const need = ING_BY_ID[b.id].cookTime;
      const frac = Math.min(1, b.t / need);
      ctx.fillStyle = '#222';
      rr(ctx, br.x + 10, br.y + 90, br.w - 20, 10, 5); ctx.fill();
      ctx.fillStyle = b.burnt ? COLORS.red : b.ready ? COLORS.green : COLORS.gold;
      rr(ctx, br.x + 10, br.y + 90, (br.w - 20) * (b.ready ? 1 : frac), 10, 5); ctx.fill();
      text(ctx, b.burnt ? 'BURNT — click to clear' : b.ready ? 'READY! click' : ING_BY_ID[b.id].name + '…', br.x + br.w / 2, br.y + 110, 14, COLORS.cream, 'center', true);
    } else {
      text(ctx, 'off', br.x + br.w / 2, br.y + 52, 16, '#9aa5ad', 'center', false);
    }
  }
}

function drawPlateStation(ctx, state) {
  const r = LAYOUT.plate;
  panel(ctx, r, 'PLATING  [A]');
  const cx = r.x + r.w / 2, cy = r.y + 108;
  if (state.plateDish) {
    drawDish(ctx, state.plateDish, cx, cy, 1.7, state.steamPhase);
    text(ctx, `${recipeById(state.plateDish).name} — click to pick up!`, cx, r.y + 182, 17, '#7dff6a', 'center', true);
  } else if (state.plate.length > 0) {
    ctx.fillStyle = '#f4f6f8';
    ctx.beginPath(); ctx.ellipse(cx, cy + 16, 58, 22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d7dde2';
    ctx.beginPath(); ctx.ellipse(cx, cy + 13, 44, 16, 0, 0, Math.PI * 2); ctx.fill();
    state.plate.forEach((p, i) => {
      const off = (i - (state.plate.length - 1) / 2) * 44;
      drawFood(ctx, p, cx + off, cy - 4, 1.05, 'cooked');
    });
    text(ctx, state.plate.map((p) => ING_BY_ID[p].name).join(' + '), cx, r.y + 182, 16, COLORS.cream, 'center', true);
  } else {
    ctx.fillStyle = '#f4f6f8';
    ctx.beginPath(); ctx.ellipse(cx, cy + 16, 58, 22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d7dde2';
    ctx.beginPath(); ctx.ellipse(cx, cy + 13, 44, 16, 0, 0, Math.PI * 2); ctx.fill();
    text(ctx, 'empty plate', cx, r.y + 182, 16, COLORS.cream, 'center', false);
  }
}

function drawCarryServeTrash(ctx, state) {
  // carry
  const c = LAYOUT.carry;
  panel(ctx, c, 'IN HAND');
  if (state.carry) {
    if (state.carry.stage === 'dish') {
      drawDish(ctx, state.carry.id, c.x + c.w / 2, c.y + 86, 1.35, state.steamPhase);
      text(ctx, recipeById(state.carry.id).name, c.x + c.w / 2, c.y + 132, 17, COLORS.cream, 'center', true);
    } else {
      drawFood(ctx, state.carry.id, c.x + c.w / 2, c.y + 82, 1.6, state.carry.stage);
      text(ctx, `${ING_BY_ID[state.carry.id].name} (${state.carry.stage})`, c.x + c.w / 2, c.y + 132, 17, COLORS.cream, 'center', true);
    }
  } else {
    text(ctx, 'hands free', c.x + c.w / 2, c.y + 88, 18, '#e8d5ae', 'center', false);
  }
  // trash
  const t = LAYOUT.trash;
  panel(ctx, t, 'TRASH [T]');
  ctx.fillStyle = COLORS.steel;
  rr(ctx, t.x + 48, t.y + 58, 54, 62, 6); ctx.fill();
  ctx.fillStyle = COLORS.steelDark;
  rr(ctx, t.x + 42, t.y + 48, 66, 12, 5); ctx.fill();
  text(ctx, 'discard', t.x + t.w / 2, t.y + 134, 15, COLORS.cream, 'center', false);
  // serve window — glows green while a finished dish is in hand
  const s = LAYOUT.serve;
  panel(ctx, s, 'SERVE WINDOW  [S]');
  const canServe = state.carry && state.carry.stage === 'dish';
  ctx.fillStyle = canServe ? '#1e3a12' : '#2e1a06';
  rr(ctx, s.x + 24, s.y + 44, s.w - 48, 66, 8); ctx.fill();
  ctx.strokeStyle = canServe ? '#7dff6a' : COLORS.gold; ctx.lineWidth = canServe ? 5 : 3; rr(ctx, s.x + 24, s.y + 44, s.w - 48, 66, 8); ctx.stroke();
  text(ctx, canServe ? '🔔  SERVE NOW!' : '🔔  ding!  serve here', s.x + s.w / 2, s.y + 78, 20, canServe ? '#7dff6a' : COLORS.gold, 'center', true);
  text(ctx, canServe ? recipeById(state.carry.id).name + ' in hand' : 'match the ticket dish', s.x + s.w / 2, s.y + 128, 15, COLORS.cream, 'center', false);
}

function drawHelp(ctx, state) {
  const r = LAYOUT.help;
  ctx.fillStyle = COLORS.panelDark;
  rr(ctx, r.x, r.y, r.w, r.h, 10); ctx.fill();
  const msg = state.messageT > 0 ? state.message : 'Grab → Chop (if needed) → Cook → Plate → Serve!';
  text(ctx, msg, 28, r.y + 20, 19, COLORS.gold, 'left', true);
  text(ctx, 'Mouse: click stations   Keys: 1-6 grab · Q chop · W/E stove · A plate · S serve · T trash · P pause · R restart', 28, r.y + 46, 15, COLORS.cream, 'left', false);
}

function drawPopups(ctx, state) {
  for (const p of state.popups) {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.t));
    text(ctx, p.text, p.x, p.y, 26, p.color, 'center', true);
    ctx.globalAlpha = 1;
  }
}

function drawTitle(ctx, state) {
  ctx.fillStyle = 'rgba(20,8,0,0.72)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'DAPUR KILAT', W / 2, 170, 72, COLORS.gold, 'center', true);
  text(ctx, 'Warung Rush — cook fast, serve faster!', W / 2, 222, 26, COLORS.cream, 'center', false);
  const lines = [
    'Orders land on the board with a timer. Grab ingredients, chop, cook,',
    'plate the right combo, and serve before the ticket runs out.',
    'Expired order = lose a heart. Three hearts and the shift ends!',
  ];
  lines.forEach((l, i) => text(ctx, l, W / 2, 280 + i * 34, 21, COLORS.cream, 'center', false));
  // sample dishes row
  RECIPES.slice(0, 3).forEach((r, i) => drawDish(ctx, r.id, 440 + i * 200, 420, 1.5, state.steamPhase));
  const b = startButtonRect();
  ctx.fillStyle = COLORS.red;
  rr(ctx, b.x, b.y, b.w, b.h, 14); ctx.fill();
  ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 4; rr(ctx, b.x, b.y, b.w, b.h, 14); ctx.stroke();
  text(ctx, 'START COOKING', W / 2, b.y + b.h / 2, 30, '#ffffff', 'center', true);
  text(ctx, 'click or press Enter', W / 2, b.y + b.h + 28, 16, COLORS.cream, 'center', false);
}

function drawOver(ctx, state) {
  ctx.fillStyle = 'rgba(20,8,0,0.78)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'SHIFT OVER!', W / 2, 200, 64, COLORS.red, 'center', true);
  text(ctx, `Final score: ${state.score}`, W / 2, 268, 34, COLORS.cream, 'center', true);
  text(ctx, `Dishes served: ${state.served}`, W / 2, 314, 26, COLORS.cream, 'center', false);
  const mm = Math.floor(state.elapsed / 60), ss = Math.floor(state.elapsed % 60);
  text(ctx, `Shift length: ${mm}:${String(ss).padStart(2, '0')}`, W / 2, 354, 26, COLORS.cream, 'center', false);
  const b = startButtonRect();
  ctx.fillStyle = COLORS.green;
  rr(ctx, b.x, b.y, b.w, b.h, 14); ctx.fill();
  ctx.strokeStyle = COLORS.cream; ctx.lineWidth = 4; rr(ctx, b.x, b.y, b.w, b.h, 14); ctx.stroke();
  text(ctx, 'COOK AGAIN', W / 2, b.y + b.h / 2, 30, '#10330a', 'center', true);
  text(ctx, 'click or press R', W / 2, b.y + b.h + 28, 16, COLORS.cream, 'center', false);
}

export function draw(ctx, state) {
  // warm tiled background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,190,90,0.05)';
  for (let gx = 0; gx < W; gx += 64) ctx.fillRect(gx, 62, 2, H - 62);
  for (let gy = 62; gy < H; gy += 64) ctx.fillRect(0, gy, W, 2);
  drawTopBar(ctx, state);
  drawBoard(ctx, state);
  drawBins(ctx, state);
  drawChop(ctx, state);
  drawStove(ctx, state);
  drawPlateStation(ctx, state);
  drawCarryServeTrash(ctx, state);
  drawHelp(ctx, state);
  drawPopups(ctx, state);
  if (state.mode === 'title') drawTitle(ctx, state);
  if (state.mode === 'over') drawOver(ctx, state);
  if (state.mode === 'paused') {
    ctx.fillStyle = 'rgba(20,8,0,0.6)';
    ctx.fillRect(0, 0, W, H);
    text(ctx, 'PAUSED — press P', W / 2, H / 2, 44, COLORS.gold, 'center', true);
  }
}
