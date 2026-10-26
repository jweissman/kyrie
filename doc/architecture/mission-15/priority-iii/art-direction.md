# Priority III, step 2: a provisional art-direction sheet

Step 2 of [`doc/design/AESTHETICS.md`](../../../design/AESTHETICS.md) §10. Provisional: tokens that the three
compositions of step 3 share, so that they differ in how attention and geography are composed and not in their
colours. None of it dictates layout.

## Register

Bright literary modernism: a contemporary book or literary magazine made inhabitable. White and near-black, with
sparse, vivid red, blue and yellow. Not parchment, not cream, not a dashboard, not a terminal.

## Colour

| Token | Value | Meaning, and only this |
|---|---|---|
| `--paper` | `#FFFFFF` | the reading surface, always, in every place and moment |
| `--ink` | `#151515` | what is told and what can be done |
| `--grey` / `--faint` / `--hair` | `#5E5E5E` / `#9A9A9A` / `#E3E3E3` | the quiet ramp: metadata, rules between parts, never an essential warning |
| `--blue` | `#176BEE` | where attention is: the subject in focus, the choice the keys are on, the way being considered |
| `--red` | `#E73535` | harm and what cannot be undone, always with words (a wound, "It cannot be undone") |
| `--yellow` | `#F3C82E` | a discovery, newly known, briefly (a note learned, a place added to the map) |

Colour never carries a meaning alone: every red mark has words beside it, every blue focus has its label. OKLab
gradients only where light itself is the subject (a lamp-lit room's margin, the dawn after a vigil), never on cards,
never as a weather theme.

**Darkness is in the fiction, not the page.** A cellar unlit, a night road, a fight: told in the prose and the
state ("You have no light"), with the reading surface still white. A dark composition is a rare, deliberate choice
for an exceptional moment (a death), not the automatic consequence of a place's light.

## Type

Two voices, as now: **Newsreader** for what is told (18–19 px on a desktop, line height 1.55, a measure of 60–70
characters), **Jost** for what can be done and for wayfinding (16.5 px for choices; 11.5 px uppercase only for
peripheral labels, never for an action's name or a warning). A third treatment, small caps of Newsreader, for a
place's name as a heading. No display faces, no faux script.

## Space and rhythm

One column of reading, centred, with generous margins; the reading measure is never widened to fill a screen. The
place's name and its paragraph are the composition's centre; what can be done follows the telling it answers. An
ordinary moment is given a concise form; a conversation, an inscription, a death are given the page.

## What every composition must do

- Show where the protagonist is, what they are attending to, what they are considering, and what has just happened,
  without permanent panels for each.
- Keep the last result visible through the next choice; never replace an authored line with a summary.
- Mark a heard-of place, a known way, a visited place differently, in words as well as form.
- Say before it is done what an act costs in time, coin or what cannot be undone.
- Read at 1440, 900 and 390 px, without images, and with the keys alone.
