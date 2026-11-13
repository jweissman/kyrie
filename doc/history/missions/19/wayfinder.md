# A place, and the way through it (the owner, 5 November, late)

The owner: the Explore… page was "a two-column catalogue of engine actions and entities rather than an interface for
exploring a physical place", because the explorer had become the place for everything the resting scene left out.
The direction: the resting scene owns being somewhere, and the explorer becomes a tool for going (Go…) and nothing
else; the people, things and acts of a place are the scene's or their own focused presentations.

Negative baseline, the same populated place (Millholm's camp, a1, the reference company; its people, three animals,
the notice on the well-post, Wapshott's bill, the corn-store padlock, the lockup door, seventeen ways):
`evidence/wayfinder-baseline-explorer-desktop.png`, `-tablet.png`, and the scene at rest before,
`wayfinder-baseline-rest-desktop.png`.

## What it is now

- **At rest**: the painting; the place's name; the place told whole (never folded away, nor cut to its first
  sentence once something is done there), how the company came, a life line, what came of the last act; likenesses of
  the people *and animals* in one row over the picture's foot (whoever the glance leads with first, ringed in gold;
  more than the picture has room for, "+n", opens Also here); and four quiet touches under the telling: **Go…**,
  **Look…** (where there is anything at hand; a dot when the glance leads with one), **Wait…**, **Search**. What will
  not wait (a danger, an answer owed) is still said there, one line each. No ways, no lists.
- **Go…** (`web/reader/stage/wayfinder.tsx`): where you are (and in what), the aim followed; the ways by how they lie
  (Close by, About the town, Out of it), by name within each, as a gazetteer, one line each; one chosen at a time and
  said beside them (where it goes and by what, how long, whether you have been, who keeps shop there and for what,
  whether it is shut and why, what it risks, your aim's); and its own Go. Nothing done at a way is offered here.
- **Look…** (`at-hand.tsx`): the things at hand, each in its own pane: what the place offers (the notice), a thing (the
  bill), what is on a way off this place (the corn-store padlock, the lockup door). What is done to it is told in its
  pane, which stays until put away.
- **Wait…** (`pastime.tsx`): how long, what came of it in place, and what else the company does of itself.
- **An animal's likeness** opens its own page (the creature looked at, with its likeness and what can be done with
  it); a person's, the conversation.
- **Keys**: at rest the arrows go only through what is drawn there; G (or W) opens Go…, L Look…, Z Wait…; inside one,
  the arrows go through its own choices in the order they are drawn and Enter does the one chosen; Esc puts it away.

## The owner's ten checks, at Millholm's camp (desktop 1440×900, tablet 1024×1366)

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Description visible on arrival, nothing opened | Yes: all four paragraphs, the brother's line, the dog's greeting | `wayfinder-after-rest-desktop.png`, `-rest-tablet.png` |
| 2 | Painting dominates | Yes: three fifths of the width at desktop, the upper half upright | same |
| 3 | People selectable in the scene | Yes: nine likenesses and +2; a person's opens talk, an animal's its own page | `wayfinder-after-animal-desktop.png` |
| 4 | Go… is for going only | Yes: no people, things, waiting, or acts at the ways (asserted by `glance-browser`) | `wayfinder-after-go-desktop.png` |
| 5 | Destinations easy to find without a wall of buttons | Seventeen ways as three named groups of plain lines, alphabetical within each | same |
| 6 | Selecting previews; going changes place | Yes; the corn-store previews as shut by its padlock and cannot be set out for | `wayfinder-after-go-cornstore-desktop.png` |
| 7 | Object interactions in their own presentation | Yes: the padlock in its pane under Look…; listening at it told there | `wayfinder-after-look-padlock-desktop.png` |
| 8 | Wait/search available without cluttering the wayfinder | Yes: Wait… and Search at rest | `wayfinder-after-wait-desktop.png` |
| 9 | Back/close instant and predictable | ✕ or Esc; one frame, no command; the scene as it was, what was told in a closed pane not told again | — |
| 10 | No routine scrolling at desktop or tablet | None at either; on a phone the telling scrolls within its band | `wayfinder-after-go-tablet.png` |

Touches, before → after: walk to the chandlery 2 → 3 (Go…, choose it, Go there: the preview and explicit Go the
direction asked for; a double-click or Enter on the chosen way still does it in 2); talk to someone 1 → 1; read the
notice 2 → 2 (Look… opens on it, then Read); wait an hour 2 → 2; look at the padlock's acts 1 (they were all on the
catalogue) → 2 (Look…, the padlock); see the place told whole 2 (Explore…, About) → 0.

## Not done

- A drawn town plan in Go…: the town's plan is a grid of cells joined by lanes (`town-plan-view.tsx`), not geometry,
  and the direction is not to present such a diagram as a map; the gazetteer stands until a town has real geometry.
- The thing page (examine mode) and the Look… pane are two presentations of one thing; animals use the page, things the
  pane. To become one.
- A way's preview says nothing of the place itself beyond its keepers (no gloss of a place not yet seen).
