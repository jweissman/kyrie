# Spatial play: the screen model

The owner, 4 November (evening): Westernesse should be a world the player moves through, not a database the player
browses. This is the model the vertical slice builds, and how it generalizes. It replaces the place page (a told
column beside a rail of legal acts); it keeps Kyr, the runtime, the 3D hex board, the talk and fight stages.

## One viewport, two surfaces

```text
┌ PLACE BAR  name · where · storeys down · hour            MAP  YOU  BOOK ┐
├───────────────────────────────────────────┬──────────────────────────────┤
│                                           │ FOCUS                        │
│   SURFACE: where you are                  │  what you are attending to:  │
│   · the wild: the hex board               │  here, a place on the plan,  │
│   · a town, a building, above ground:     │  a hex, someone, something   │
│     its plan (streets, buildings, you)    │                              │
│   · underground, inside: its floor plan   │  what just happened (short)  │
│     (rooms, doors, stairs, you)           │  two or three things to do   │
│   select = focus · select again = go      │  Other possibilities…        │
└───────────────────────────────────────────┴──────────────────────────────┘
```

Held upright (a tablet, a phone) the surface is above and the focus below, each with its own bounds. The page never
scrolls; only the focus's prose, when it is long, scrolls within it.

## Focus, not catalogue

The focus starts as **here**: the place's line, what just happened, who and what is here (each selectable), and
the few acts the engine ranks (Glance: urgent, the aim's, what the place offers that is new). Selecting:

- **a place on the plan** shows it (name, what it is, been or not, its way and how long) and *Go*; selecting it again
  goes, as on the hex board;
- **a hex or a mark** on the board shows what the protagonist can perceive of it (the map's own card) and *Set out*;
- **someone** shows them (likeness, what they are doing) and what can be done with them (talk opens the
  conversation stage; buy, give, ask);
- **something** shows it and its own acts (a door's, a chest's).

**Other possibilities…** opens the whole legal set (today's Look about), for the rare and the creative. Talk and
fight keep their own purpose-built stages. Book, You and the pack are sheets over the play, never beside it.

## Arriving and leaving

Coming into a settlement from outside, the focus is first its **overview** (its name, its look, what it is) with
*Walk in*; leaving one, the board. The plan marks the way out; the board marks the town. Underground, the place bar
says how deep, and the plan the ways up. Every surface shows where you are, how you came and how to leave.

## What the runtime gives, and what is new

Already structured, already projected for the player's knowledge (nothing inferred from names or ids):
`screen.plan` (TownPlan: cells by grid, lanes by `connects`, here, been, doors out; towns, buildings, above-ground
sites, and below ground since 4 November), `screen.chart` (a site's levels), `screen.region.land` (the board's hexes,
fog and marks), `screen.exits` and `screen.around` (the ways and their acts), the scene's subjects and their
choices, and the Glance's ranked acts. New in the slice: the composition (`WorldStage`), focus and selection as UI
state, the plan as an interactive surface, the board embedded where the company is in the wild, and the overview.
Wanted next, where the slice finds the data thin: a building's character for its card (its trade, who keeps it),
and districts for large towns.

## The vertical slice

a1, the default character: the causeway (board) → Millholm (overview, Walk in) → the camp on the town's plan →
Bask's salt-house (select, go, talk, the rats job) → the corn-store → the cellar and the rat-runs (floor plan, the
fight) → back up and out, the way marked at every step. Built on the real runtime; checked by a browser spec of that
route and by captures at laptop and tablet sizes. It generalizes because every surface draws only from the
structured projections above, which every generated and authored place already has.

## How far it reaches, as built (4 November)

Standing the company in places of kite's drawn world, headless (`ScreenModel.build(…).plan`): a deep site's level
under Newmeet ("the long halls", 3 to 7 rooms known), a generated site above ground (Gaudumport, its porch and round
hall), Newmeet itself (20 places) and its inn; and installed authored modules, Silkholme's sink (3), Wapshott's
circus pitched in Newmeet (4) and the raiders' cave (6). The authored tower (`tower__bailey`) has no plan: its rooms
carry no grid, and fewer than two are joined to where it stands; the surface there is the place's name, and its ways
stay in the focus. Nothing here is special to Millholm; what a place shows comes from its containment, grid and
ways, and what the company has seen of them.
