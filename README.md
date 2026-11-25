# Dapur Kilat — Warung Rush

[![Make the best cooking game](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/vvtwentyfive/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/vvtwentyfive/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

**One-line pitch:** Run a lightning-fast Indonesian warung — grab, chop, cook, plate and serve six dishes against the ticket clock before the rush buries you.

## How to play

1. **Read the order board** (left). Each ticket shows a dish, its ingredients, and a shrinking timer. Serve it before the timer empties or you lose a heart — three hearts and the shift ends.
2. **Grab** an ingredient from the counter (click a bin, or keys `1`–`6`): rice, egg, chicken, noodle, veg, chili.
3. **Chop** chicken, veg and chili at the chopping board — click the board three times (`Q`).
4. **Cook** on either stove burner (`W` / `E`). Watch the bar: green means ready, leave it too long and it burns.
5. **Plate** cooked ingredients (`A`). When the plate holds exactly a recipe's ingredients, the dish is ready — click the plate to pick it up.
6. **Serve** at the serve window (`S`) to match the earliest ticket for that dish. Faster service earns a bigger tip. `T` trashes what you hold, `P` pauses, `R` restarts.

The six dishes: Nasi Goreng (rice+egg+chili), Mie Ayam (noodle+chicken+veg), Ayam Pedas (chicken+chili), Nasi Telur (rice+egg), Mie Goreng (noodle+egg+veg), Tumis Sayur (veg+chili). Orders arrive faster and timers get shorter as the shift goes on.

## How it works

Vanilla canvas 2D, no libraries, no network — open `game/index.html` in a desktop browser and play. The code is split by job: `config.js` (recipes, timings, layout), `orders.js` (seeded ticket generation and timers), `kitchen.js` (game state and every action), `recipes.js` (dish matching), `input.js` (mouse and keyboard), `render.js` (all drawing, including the hand-drawn food), `audio.js` (WebAudio-generated beeps, no audio files), `shots.js` (deterministic `?shot=start|play|end&seed=1` scenes used for the screenshots), and `main.js` (fixed-step loop and boot). `main.ts` copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored `buildDossier`.
