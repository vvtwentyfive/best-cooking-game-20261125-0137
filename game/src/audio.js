// Tiny WebAudio beeps — generated tones only, no audio files, no network.

let ctx = null;

function ensureCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type, gain, when) {
  const ac = ensureCtx();
  if (!ac) return;
  const t0 = ac.currentTime + (when || 0);
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(gain || 0.06, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export function playEvent(type) {
  switch (type) {
    case 'grab': tone(520, 0.07, 'triangle', 0.05); break;
    case 'chop': tone(180, 0.05, 'square', 0.05); tone(120, 0.04, 'square', 0.04, 0.02); break;
    case 'sizzle': tone(900, 0.12, 'sawtooth', 0.02); break;
    case 'ready': tone(880, 0.09, 'sine', 0.06); tone(1174, 0.12, 'sine', 0.06, 0.09); break;
    case 'burnt': tone(160, 0.25, 'sawtooth', 0.06); break;
    case 'dishReady': tone(659, 0.09, 'triangle', 0.06); tone(784, 0.09, 'triangle', 0.06, 0.08); tone(1046, 0.14, 'triangle', 0.06, 0.16); break;
    case 'serve': tone(1046, 0.08, 'triangle', 0.07); tone(1318, 0.16, 'triangle', 0.07, 0.07); break;
    case 'wrong': tone(140, 0.18, 'square', 0.06); break;
    case 'expired': tone(300, 0.2, 'sawtooth', 0.06); tone(200, 0.3, 'sawtooth', 0.06, 0.12); break;
    case 'newOrder': tone(740, 0.07, 'sine', 0.045); break;
    case 'pickup': tone(600, 0.06, 'triangle', 0.05); break;
    case 'trash': tone(240, 0.08, 'triangle', 0.04); break;
    case 'gameover': tone(392, 0.2, 'triangle', 0.07); tone(330, 0.2, 'triangle', 0.07, 0.2); tone(262, 0.4, 'triangle', 0.07, 0.4); break;
    default: break;
  }
}
