# The action button: discovery (16 November)

Written for the owner and whoever takes the action-button cycle (aim 1 of the handoff). **Measures, not judgments.** The data
is test/support/ui-discovery.ts (run `KYRIE_BROWSER=1 bun test/support/ui-discovery.ts`), its output
doc/architecture/mission-21/button-data.json, measured in headless Chromium 1280×800 at normal speed and with the CPU
slowed four times (a stand-in for an iPad or a phone), two runs each. What each finding means for the design is marked
**→**.

## 1. Startup latency

| | normal | CPU ×4 |
|---|---:|---:|
| First paint | 62–66 ms | 122–130 ms |
| **The title's rows ready** | **3.0–3.5 s** | **11.3 s** |
| Main-thread long tasks before it | 2.4–2.9 s in one task | 9.4 s in one task |
| Hold on New game → creation drawn | 0.7–1.3 s | 0.7 s |
| Each creation step (hold released → next page) | under 0.3 s | under 0.6 s |
| Hold on set-out → first scene (world generated) | 10.8–16.9 s | 9.9–10.5 s |

- A blank dark page for three seconds on a laptop and eleven on a slow device, then the title all at once. First paint is
  fast; **the one long task is V8 compiling the 20 MB page script** (a CPU profile of the boot: 1.1 s native "program" time,
  no JavaScript function above 90 ms). With the 13.6 MB authored-data bundle emptied the long task was still 2.2 s, so the
  data is not the whole of it: the engine, the rules and the catalogues are in the same script as the title.
  **→ the title cannot be ready sooner until the title and creation are a small script of their own and the engine loads
  after it (while the title is on screen).** This is the largest single gain for "the first fifteen seconds".
- Before this stretch the sign step's sky was drawn in one 0.5 s task (2.3 s at ×4), long enough that a hold on a slow device
  was let go before it was full (a measured failure in the ×4 run). It is now drawn in slices from 2.5 s after boot and is no
  longer a long task.
- World generation at set-out is 10–17 s with the page frozen between "hold" and the scene. Nothing says so. **→ the held
  set-out needs a visible "setting out…" state (the ring complete, the row answering) rather than a held-still page; the
  first-scene wait is a design problem as much as a speed one.**

## 2. Layout stability

Cumulative layout shift over the whole walk (title → creation → first scene): **0.0005–0.0008** at normal speed, 0.0004–0.0005
at ×4 (the usual bar for "stable" is 0.1). Title 0.0000. No state of any control moved its box by a pixel (rest, hover, focus,
holding, armed: every measured box is identical per control). **→ nothing to fix in layout stability; the geometry specs
(title-geometry, fight-geometry, safe-zone) are the guard.**

## 3. Interaction states, per family

Measured (computed style, rest / hover / keyboard focus / pressed or holding / armed):

| Family | Height | Rest | Hover | Focus | Pressed / holding | Transition |
|---|---:|---|---|---|---|---|
| Title way-in (held) | 54 | no box | tint | tint | tint, ring fills (mouse: cursor's) | 0.12 s |
| Creation row (held) | 44 | no box | tint | tint | tint | **0 s** |
| Creation card (held) | 148 | boxed edge | boxed edge (no change measured) | same | same | 0.12 s |
| Scene choice row | 46 | no box | tint | tint | (not pressed in the run) | 0.12 s |
| Map menu row | 46 | no box | tint | tint | | 0.12 s |
| Scene rail mark | 40 | none | faint wash | faint wash | | 0.12 s |

What is the same: no box at rest, a tint of the row's tone at hover and focus (the mark's tone), no outline, no movement.
What differs, and is therefore a decision rather than a defect:

1. **Heights: 54, 44, 46, 46, 40, 148.** One row height (46, 44 minimum for a finger) would make every row the same target.
2. **Transition: the creation row has none (0 s), everything else 0.12 s.** The creation rows and the scene rows should
   answer in the same time.
3. **Hover and focus are the same look** on every family (a tint): the keys' focus and the hand's hover cannot be told apart,
   and the default-lit first row looks like a hovered one. A keyboard user needs a focus that is not a hover (a left edge
   that grows? the mark brightening?).
4. **A press has no look of its own before the hold begins**: the first 150 ms of a press on a held row is the hover. The
   cursor's ring is the only sign. **→ a pressed state (the tint one step deeper, the mark at full height) for every family.**
5. **The card's states are not distinguishable by computed style at all** (its edge is always the ivory edge); it is "chosen"
   and "considered" by data attributes the stylesheet draws as shadows. One definition for all families would be simpler.

## 4. Pointer, keyboard and touch

What each hand does to a held control (measured; pointer, keys, and a finger by touch events):

| | pointer | keys | touch |
|---|---|---|---|
| A tap on New game | stays (before this stretch: armed) | stays (armed) | stays (armed) |
| A hold on New game | creation | creation | creation |
| A tap on a card | stays | stays (armed) | stays (armed) |
| A hold on a card | goes on | goes on | goes on |
| The digit 1 on a card | goes on | goes on | n/a |

A mouse or a pen let go early now arms nothing (the owner, 16 November: it felt committed on release); a finger and the keys
may tap a choice armed and tap again, the accessible equivalent of a hold. The row's own small ring is for a finger and the
keys only; the pointer has the cursor's ring, now two SVG circles (sharp at every density), and each system cursor has a 2×
image. **Not yet measured:** a screen reader's activation (it commits at once by design), a stylus, a gamepad.

## 5. What to do first

1. Split the script (title and creation first, engine after): the first seconds, and the slow-device case, depend on it.
2. One row: one height, one transition, a distinct hover, focus and pressed state, used by every family (rows, cards, the
   title's ways in, the rail), measured again by this script and pinned by it.
3. An answering state for the held set-out while the world is made.
4. Then the aesthetic cycle proper, on that base.
