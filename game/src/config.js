// Dapur Kilat — shared constants: ingredients, recipes, colours, layout, timings.

export const W = 1280;
export const H = 720;

export const INGREDIENTS = [
  { id: 'rice',    name: 'Rice',    key: '1', needsChop: false, cookTime: 3.2, color: '#f7f3e3', dark: '#cbbf9a' },
  { id: 'egg',     name: 'Egg',     key: '2', needsChop: false, cookTime: 2.0, color: '#ffb52e', dark: '#c47a00' },
  { id: 'chicken', name: 'Chicken', key: '3', needsChop: true,  cookTime: 4.0, color: '#f2a65a', dark: '#b35c1e' },
  { id: 'noodle',  name: 'Noodle',  key: '4', needsChop: false, cookTime: 2.8, color: '#ffd66e', dark: '#c9961f' },
  { id: 'veg',     name: 'Veg',     key: '5', needsChop: true,  cookTime: 2.4, color: '#5ec24a', dark: '#2f7d22' },
  { id: 'chili',   name: 'Chili',   key: '6', needsChop: true,  cookTime: 1.6, color: '#e63b2e', dark: '#9c1d12' },
];

export const ING_BY_ID = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

export const RECIPES = [
  { id: 'nasi-goreng', name: 'Nasi Goreng', parts: ['rice', 'egg', 'chili'],   price: 120 },
  { id: 'mie-ayam',    name: 'Mie Ayam',    parts: ['noodle', 'chicken', 'veg'], price: 130 },
  { id: 'ayam-pedas',  name: 'Ayam Pedas',  parts: ['chicken', 'chili'],        price: 95 },
  { id: 'nasi-telur',  name: 'Nasi Telur',  parts: ['rice', 'egg'],             price: 80 },
  { id: 'mie-goreng',  name: 'Mie Goreng',  parts: ['noodle', 'egg', 'veg'],     price: 110 },
  { id: 'tumis-sayur', name: 'Tumis Sayur', parts: ['veg', 'chili'],            price: 70 },
];

export const CHOPS_NEEDED = 3;
export const OVERCOOK_AFTER = 9; // seconds after ready before it burns
export const START_LIVES = 3;
export const MAX_TICKETS = 5;

// Difficulty ramp: values slide from start -> end as elapsed time grows.
export const RAMP_SECONDS = 240;
export const SPAWN_START = 13;
export const SPAWN_END = 5.5;
export const ORDER_TIME_START = 62;
export const ORDER_TIME_END = 36;

// Layout rectangles (canvas coordinates, 1280x720).
export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 62 },
  board: { x: 12, y: 74, w: 288, h: 560 },
  binsY: 86,
  binW: 142,
  binH: 104,
  binGap: 12,
  binsX: 316,
  chop: { x: 316, y: 224, w: 290, h: 196 },
  stove: { x: 622, y: 224, w: 310, h: 196 },
  plate: { x: 948, y: 224, w: 318, h: 196 },
  serve: { x: 948, y: 436, w: 318, h: 148 },
  trash: { x: 622, y: 436, w: 150, h: 148 },
  carry: { x: 316, y: 436, w: 290, h: 148 },
  help: { x: 12, y: 646, w: 1256, h: 62 },
};

export const COLORS = {
  bg: '#3a1d05',
  panel: '#5a3210',
  panelDark: '#46260a',
  wood: '#8a5a2b',
  woodLight: '#b07f45',
  cream: '#fff3d6',
  paper: '#fff8e7',
  ink: '#2b1503',
  red: '#e63b2e',
  green: '#5ec24a',
  gold: '#ffb52e',
  steel: '#9aa5ad',
  steelDark: '#5d686f',
};
