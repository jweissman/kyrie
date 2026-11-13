# Continuity: the plan (CN-01..08)

The owner's report is `owner-continuity.md`; its rows are §26 of the register (CN-01..08). The aim is one stable
scene through which the player directs attention and acts. The work is a repair to existing M21 obligations, not new
features. It is not closed as a component migration until the whole ordinary action path has been audited and shown in
play.

## Who does what

Two lines, one boundary. The engine says what can be done and why. The page draws it, one way everywhere.

| | Playability line (`m21-play`) | Aesthetic line (`m21-look`) |
|---|---|---|
| Owns | `src/` (engine, presentation contracts), `test/small` | `web/reader/` (components, CSS), browser verification |
| CN-01 lenses | the lens ranking: the promoted acts for a lens, chosen from the authoritative act set; opening a lens takes no time | the lens in the scene: no page transition, the four rerank in place, the rest unfolds beneath |
| CN-02/03 compass | `enclosed` and the compass contract: the way out and the next known place worth going, as routes over known traversable ways; overland travel never offered from inside a site | the Map control yields the compass inside an enclosure: arrows, chevrons, a route line; the larger map outside |
| CN-04 census | every act the page draws comes from the contract (no semantics rebuilt in a view) | the census of every world-action surface, and each moved onto the one action system (`ChoiceRow` and its menu) or a variant built from its primitives |
| CN-05 time lens | the waiting acts as a lens's set (wait a little, watch, listen, rest, wait for something), as they exist | Wait drawn as a compact lens in the scene, not a page |
| CN-06 combat | the fight's acts, targets and availability through the same contract | one combat composition: stable geometry, the menu never a row by accident, target focus by a reticle or a fixed detail region, nothing injected into buttons |
| CN-07 colour | no opportunity aspect for being a person (if the engine gives one) | no pink pip on people; neutral portrait or icon; atlas colours only where the engine says an opportunity |
| CN-08 scenario | the interior walk headless, as page objects (fast) | the same walk in Chromium at 1280 by 800 and 820 by 1180, with screenshots |

## Contracts, before the drawing

The playability line lands these first, small and tested, so the aesthetic line draws from them and never infers.
- **`Lens`:** `things | people | places | time`. For a lens, the glance gives the promoted acts (at most four) and the
  rest in order. These are drawn from the same set the resting scene's four come from, with their ids, availability,
  targets and aspects. The terminal can name a lens too.
- **`Compass`:** at an enclosed place (a building, a site, underground, a ship):
  - `out`: the route to the outside, as the ways in order, the time, and what bars it if anything;
  - `next`: the nearest known place worth going, by the same reading of opportunities the glance uses, or nothing;
  - `exhausted`: true when nothing known is left inside. Unexplored or hidden is not proven absence.
  Following a route walks the ways one by one, through the world's own interruptions.
- **No overland from inside:** the frame says `enclosed`. The page offers the world map only outside.

## Order

1. Playability: the `Lens` and `Compass` contracts and `enclosed`, each with a fast spec. In the same batch: a
   lens's opening takes no time (a spec), and no overland act is offered from an enclosed place.
2. Aesthetic, at once and in parallel, since none of it waits on the contracts:
   - the census, as a table in `aesthetic/census.md` (surface, component, treatment, whether its semantics come from
     the contract);
   - combat's stable geometry, with a browser spec measuring card and button boxes across target and category changes;
   - the people pip.
3. Aesthetic: the lenses in the scene, the time lens and the compass, on the contracts.
4. Both: the CN-08 walk, headless and in the page, and fixes for what it finds.

## Tests

- Fast specs for each contract:
  - a lens opens without time passing;
  - its four are a subset of the authoritative acts;
  - the compass's `out` is a real walk of known ways;
  - no overland act is offered from inside.
- One fast render check of the census: every world act on a stage carries the action system's marks (`data-act`,
  its id), and no fictional act is a bare link.
- Browser, few and targeted:
  - combat geometry (boxes stable across target and category changes);
  - a lens switch with no navigation and no reflow of the painting;
  - the interior walk at both sizes.

## Acceptance (the owner's list)

Shown in play, with screenshots and the specs that hold each:
- a resting scene with no stray legacy action links;
- lenses switched without page navigation;
- less prominent actions expanded without losing context;
- waiting through the same interface;
- the compass used to find a local destination and to return outside;
- a fight entered, targets changed, actions expanded and exploration resumed, with no reflow;
- the same behaviour on desktop and iPad.
