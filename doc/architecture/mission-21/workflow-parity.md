# Workflows are the engine's: where the terminal and the page stand

The owner, 14 November: Kyrie is the source of truth not only for actions and their consequences but for the
structure and progression of player workflows. The terminal is a 1:1 player of the same system as the page, and a
conformance test of it. Register §29, TB-09 and TB-10.

## The common contract that exists

`EngineHost` and its message protocol (`web/engine/engine-host.ts`, `protocol.ts`) are already the runtime a player
asks "what is the interaction now, what can I choose, what happens when I choose it". The page's worker runs it, the
page only chooses ("perform" by the command its own screen gave), and it runs headless in a spec or a process
(`new EngineHost(post)`). No new abstraction was needed. What was missing is that creation was not in it, and that the
terminal did not use it.

## What changed (26fe687f)

- **Creation is in the protocol.** `{ kind: 'creation' }` returns where making a life stands (`EngineCreation`): every
  step, its ranked cards with the four it leads with first, what is chosen, whom it has made, why they came.
  `{ kind: 'creation', step, value }` takes a choice. `{ kind: 'set-out' }` begins with the life as made, by the same
  Begin the page sends. `CreationFlow` is the one implementation of the steps, their order, what a choice settles,
  and the cards' ranking.
- **The terminal makes a life only through those requests** on an `EngineHost`, and plays the session that host began:
  the same start, frontier and session as the page. `bin/kyrie adventure --world <seed> --create` does it at a pipe,
  for a blind player.
- **Proved end to end** by `test/creation-conformance`. From no character, a life is made twice on one country: as
  the terminal plays (the numbers read off its printed lines, blind) and as the page's worker is asked (the cards by
  id). Both make the same life, set out the same, and are led by the same four, of the same kinds and atlas aspects.
  A terminal that printed one order and chose by another fails it. `test/small/creation-four` holds that the terminal
  imports nothing of creation but types.

## What the first question costs

Asking "why have you come" needs the country drawn and its scenarios placed, since which reasons are offered depends
on what was placed where. `{ kind: 'world' }` is about 0.7 s: Deem's region (0.15 s) and the world's composition, with
8 small texts parsed. No scenario is parsed or instantiated to ask it. The country's Kyr is read in the background
while the player chooses, and set-out pays the rest (a1: about 6.5 s warm). The tally is `Costs`'
`region 1 · world 1 · parse 8 (70 KB)`, so a regression that drags more in shows.

## What still decides gameplay in one client only

| Where | What it decides | Remedy |
|---|---|---|
| `web/reader/creation/creation-page.tsx` | the creation page's own step list and its progression (a page-side step index) | render `CreationState`; Continue and Back move among the engine's steps; Set out sends `set-out` (aesthetic line, look-5) |
| `web/reader/reader-opening.ts` | `edit`, `change`, `origin`, `place`, `reroll`, `suit` and `spells`: what a choice settles at creation, applied page-side | gone, the page sending `creation` choices. What `CreationFlow` lacks (placing and rerolling the qualities, the weapon, the spells: the page's Details) moves into `CreationFlow` as steps or optional choices, not into the page |
| `web/reader/creation-rules.ts` | the numbers a choice's Details show (what a score adds to a blow or a check, a weapon's average) | from the engine's character sheet (`src/presentation/character-sheet.ts`), as the terminal's `character` already is |
| `src/cli/terminal.ts`, play | travel offered and done its own way (set-outs from the screen's destinations and `LandCrossing`, done by `session.leg`), where the page uses `travel` and `plan`; fights by `Battle` directly, where the page uses `fight`; following by its own `attended` | the terminal plays by `EngineHost` frames: `perform`, `travel`, `fight`, `follow`, as the page does, drawing each frame as text |
| `src/cli/terminal.ts`, talk and fight | the talk's four (three questions and leave) and the fight hand's four (the weapon's blow first) | `Offer`s from the engine for a talk and a fight hand, drawn by both clients (TB-02) |

Presentation stays client-side: opening a lens, moving focus, previewing a card, opening Details, animation.
