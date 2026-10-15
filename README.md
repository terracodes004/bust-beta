# Bust Beta

**Limn Engine's dual-thread rendering plugin — in beta.**

Bust Beta is an experimental performance layer for [Limn Engine](https://github.com/). It moves rendering work off the main thread and onto a Web Worker, then hands the finished frame back to the visible canvas for display.

On devices that can keep up, the result is a higher and more stable frame rate than a single-threaded Canvas 2D loop can deliver.

It is beta. It works. It is not finished.

---

## Table of Contents

- [What It Does](#what-it-does)
- [Why It Matters](#why-it-matters)
- [How It Works](#how-it-works)
- [Status](#status)
- [Known Limitations](#known-limitations)
- [How to Try It](#how-to-try-it)
- [What's Next](#whats-next)
- [Philosophy](#philosophy)
- [Feedback](#feedback)
- [License](#license)
- [Links](#links)

---

## What It Does

Limn already ships with a dual-canvas architecture — a hidden "fake" canvas caches the static layer, and the visible canvas draws the dynamic layer on top every frame. Bust Beta extends that idea across threads:

- The **main thread** runs game logic, input, and the final composite.
- The **worker thread** renders the dynamic layer into an `OffscreenCanvas`.
- The worker returns the finished frame as an `ImageBitmap`.
- The main thread blits it onto the visible canvas.

Both threads work at the same time. The display shows whichever frame is freshest.

---

## Why It Matters

Most Canvas 2D engines are limited by what a single thread can do between two `requestAnimationFrame` ticks. On a 120Hz or 144Hz display, the panel is ready to show 120 or 144 frames per second — but the engine often can't produce them, because rendering and logic are fighting for the same thread.

Bust Beta decouples the two:

- **Higher refresh-rate utilization** — on high-refresh panels, the worker can produce frames faster than a single-threaded loop.
- **More consistent pacing** — when the main thread has a heavy frame, the worker keeps producing.
- **Same API surface** — you don't rewrite your game. Bust Beta hooks `ani()` from outside.

This is not a claim that Canvas 2D beats WebGL. It isn't trying to. It's a claim that a Canvas 2D engine, properly threaded, can match the frame-rate *consistency* of a GPU engine on the class of 2D games Limn targets.

---

## How It Works

The pipeline has four stages, repeated every animation frame.

**Stage 1 — Main thread prepares the frame.** The main thread runs `update(dt)` so game logic stays in sync with input. It also renders the static layer (the fake canvas) as it always did, and sends a message to the worker containing the current game state: the component list, the camera, the current scene, and the delta time.

**Stage 2 — Worker receives and renders.** The worker listens on `onmessage`. On first message, it stores the `OffscreenCanvas` and grabs its 2D context. On every subsequent message, it clears the offscreen canvas, applies the camera transform, loops through the component list, moves and draws each component, then calls `transferToImageBitmap()` to freeze the frame and hand it back to the main thread.

**Stage 3 — Main thread receives the bitmap.** The main thread's `worker.onmessage` handler stores the returned `ImageBitmap` in a variable called `nextTCJSgameFrame`.

**Stage 4 — Main thread composites.** On the next animation frame, the main thread blits the worker's bitmap onto the visible canvas via `transferFromImageBitmap()`, then draws the static layer on top, then draws any dynamic components that the worker didn't cover.

The net effect: while the main thread is running game logic, the worker is producing the next frame. Neither thread blocks the other.

---

## Status

| Item | Status |
|---|---|
| Worker pipeline runs | ✅ Working |
| 1:1 send/receive in steady state | ✅ Confirmed |
| 120fps on desktop (high-refresh panel) | ✅ Observed on dev machine |
| Fallback main-thread render | ⚠️ Still active — pipeline is additive, not replacing |
| Low-end device testing | ❌ Not done |
| Delta timing across refresh rates | ⚠️ Uses `1/fps`, drift possible between devices |
| Published benchmarks | ❌ Pending |

Beta means: the mechanism works, but the numbers aren't proven across devices yet. Treat it as a promising experiment, not a solved problem.

---

## Known Limitations

**`upgradePerform()` must be called manually.** In this beta, you call it before `display.start()`. A future version will auto-activate on script load.

**Delta timing uses `1/fps`.** On a 60Hz device vs. a 120Hz device, physics speed can differ. A fixed-timestep update loop is the eventual fix. Until then, tune physics constants for your target refresh rate.

**The main thread still draws a fallback layer.** Until that's disabled, both threads do some work. The intended final architecture is worker-only rendering for the dynamic layer.

**No published benchmark suite yet.** The claim of GPU-comparable consistency is based on local testing, not a public, reproducible benchmark.

**Same-origin only.** The worker cannot be loaded cross-origin. If you serve `bust.js` from a CDN, you'll need to fetch and Blob-wrap `bust-worker.js` yourself, or self-host both files.

---

## How to Try It

Bust Beta is three files. Drop them next to your game:

```html
<script src="epic.js"></script>
<script src="bust.js"></script>
<script src="test.js"></script>
```

Then, in your game file, call `upgradePerform()` before you create your Display:

```js
const display = new Display();
upgradePerform();
display.start(800, 600);
```

`bust.js` loads `bust-worker.js` automatically. Both files must be served from the same origin — the worker cannot be loaded cross-origin.

**Beta note:** `upgradePerform()` must be called before `display.start()` runs. In this beta it is a manual step. A future version will auto-activate on script load.

That's it. Your existing Limn game runs otherwise unchanged.

---

## What's Next

- Auto-activate on script load, so `upgradePerform()` becomes optional.
- Disable the fallback render path so the worker truly owns the dynamic layer.
- Add a worker-side fps counter to prove the frame count is worker-produced, not RAF-tick-produced.
- Test on low-end Android — the device class the plugin is for.
- Publish a benchmark scene (open source) so anyone can reproduce the numbers.
- Move to a fixed-timestep update loop so physics is refresh-rate independent.

---

## Philosophy

Limn's rule is "common outcomes should be functions." Bust Beta's rule is "the engine shouldn't be the reason a frame is missed."

Add the script. Get a frame. If your hardware can show it, Bust Beta tries to produce it.

---

## Feedback

Bust Beta is a beta. If it works on your device — or if it doesn't — open an issue with your device model, browser version, and the fps counter reading. Every report is a data point.

---

## License

MIT (or whatever Limn uses — align this before publishing).

---

## Links

- **Limn Engine:** [link]
- **Discord:** [link]
- **Issues:** [GitHub Issues link]

---

## Before You Publish — Three Placeholders to Fill

**1. `[link]` placeholders.** Replace the three bracket links at the bottom with real URLs — the Limn Engine repository, the Discord invite, and the GitHub Issues page.

**2. License.** If Limn is MIT, use MIT. If Limn has no license, decide one explicitly before publishing Bust Beta. A plugin without a license is a plugin nobody can legally use.

**3. The "120fps on dev machine" line.** This is honest as written, but it's the weakest claim in the README. When you have a low-end device result, replace that row with the real number. Until then, "Observed on dev machine" is defensible.

---

*Add the script. Get a frame.* 🚀
