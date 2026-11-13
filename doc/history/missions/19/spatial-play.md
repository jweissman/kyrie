# Spatial play: the screen model

The owner, 4 November (evening): Westernesse should be a world the player moves through, not a database the player
browses. This is the model the vertical slice builds, and how it generalizes. It replaces the place page (a told
column beside a rail of legal acts); it keeps Kyr, the runtime, the 3D hex board, the talk and fight stages.

## One viewport, two surfaces

Corrected the same evening (the owner: the graph of places "looks like an engineering diagram"; the painting is the
place). The surface is the place **as it is seen**, never a graph of its rooms:

```text
┌ PLACE BAR  name · where · storeys down · hour            MAP  YOU  BOOK ┐
├───────────────────────────────────────────┬──────────────────────────────┤
│                                           │ FOCUS                        │
│   SURFACE: the place as it is seen        │  what you are attending to:  │
│   · the wild: the 3D hex board            │  here, a way chosen, a hex,  │
│   · a town, a site above ground: its      │  someone, something          │
│     painting, filling the surface         │                              │
│   · indoors, under the ground: the dark   │  what just happened (short)  │
│     the company's light opens, the        │  two or three things to do   │
│     place's own words set in it           │                              │
│   the ways from here lie on it: along     │                              │
│   the foot; up at the top, down below     │                              │
│   choose = focus · choose again = go      │                              │
└───────────────────────────────────────────┴──────────────────────────────┘
```

The ways shown on the surface are the few the glance ranks first (its leads, then its row of nearest ways), placed
by what the world says of each (its transition: up, down, into, out), never by its words; the rest are under Every
way. The plan of a town or a building (TownPlan) stays a reference under Every way, not the surface: its grid and
its ways are topology, which a graph can draw but a plan cannot be made from.

## Focus, not catalogue

The focus starts as **here**: the place's line, what just happened, who and what is here (each selectable), and
the few acts the engine ranks (Glance: urgent, the aim's, what the place offers that is new). Selecting:

- **a way on the scene** shows where it goes (up, down, into; been there or not; whom the company last spoke with
  there), what can be done at it (a padlock to pick or wrench) and *Go*; choosing it again goes, as on the hex board;
- **a hex or a mark** on the board shows what the protagonist can perceive of it (the map's own card) and *Set out*;
- **someone** shows them (likeness, what they are doing) and what can be done with them (talk opens the
  conversation stage; buy, give, ask);
- **something** shows it and its own acts (a door's, a chest's).

**Other possibilities…** opens the whole legal set (today's Look about), for the rare and the creative. Talk and
fight keep their own purpose-built stages. Book, You and the pack are sheets over the play, never beside it.

## Arriving and leaving

Coming into a settlement from outside, the focus is first its **overview** (its name, its look, what it is) with
*Walk in*; leaving one, the board. Underground, the place bar says how deep, and the way up stands at the top of the
scene. Every surface shows where you are and how to leave; the way you came is led with when the way on is not.

## What the runtime gives, and what real plans would need

Already structured and projected for what the company knows (nothing inferred from names or ids): a place's
containment (region, settlement, wilderness, site, level, building, room), its grid cell (`at x, y`, written by the
generators and by authors), its shelter and depth (`underground 2 down`), its ways (`connects`, each with a kind:
door, stair, steps, ladder, crawl, path, road, gate, bridge, ford; a time; one way or both; hidden until something;
what it needs), the things on a way (a padlocked door), a site's levels in order, the region's hexes (the board), and
what the company has been to, seen and been told. Enough for knowledge-aware navigation, the board, the depth line,
and which way a way goes; not enough for a plan.

What a drawn plan of a town, a building or a dungeon would need, beyond that, and no more:

1. **An extent for a place**: `at x, y size w by h` (grid cells), so a room or a building has a footprint, not a
   point. Written by authors where it matters, and by each generator for what it lays out (a house a cell, a hall
   two by three, the green as large as its houses leave).
2. **Where a way meets a place**: the side of its extent (`on the north side`), so a door is a gap in a wall and a
   stair a mark in a room, not a line between centres.
3. **Streets and open ground as places with extents**, as the town's lanes and green already are places, so a street
   is drawn as the space between buildings rather than as a lane between nodes.
4. **A few features with a position** (a well, a gate, an altar), from the things already placed in rooms.

With those, a plan is drawn only where its geometry is known, at any scale, and the painting stays wherever it is
not. Without them, nothing is drawn that pretends to be a plan.

## The vertical slice

a1, the default character: the causeway → the camp (Millholm's painting, its ways along it) → Bask at his door (talk,
the rats job) → the corn-store → the cellar and the rat-runs (the place's words in the light, the way up above them,
the fight) → back up → out into the country (the board) → back to Millholm's overview, Walk in. Built on the real
runtime; checked by `spatial-journey-browser` and by captures of a wild hex, the town and the cellar (evidence.md).

## How far it reaches

The scene and the board need nothing a place does not already have: every generated and authored place has a name, a
shelter, its ways and their transitions, and (outdoors, in a town, a site) a painting chosen by its kind of land.
