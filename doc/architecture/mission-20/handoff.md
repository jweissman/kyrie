# Mission 20 → Mission 21 handoff (draft, 11 November night)

**Status: implementation work, not acceptance.** No human has accepted the first hour. The last independent cold play
was round 6, on 11 November. Round 7, on the deployed build, comes before closure, and its findings go in §4.

## 1. What M20 delivered and verified

Each item is listed with how it was verified. Rows refer to `log.md`.

- **Routes (E126, E132).**
  - Cause: a road's time had been halved evenly, so the wild beside it was a shortcut. Fixed.
  - A crossing of wild country is now drawn landmark by landmark.
  - A road out of the country begins at the last town it runs through.
  - Evidence: test/route-weave; laid routes match walked routes in the route-map tool; a rendered journey from
    Millholm toward Mistshaw.
- **Town entrances (E129).** A way into a town from its own country is led with, typed (`entry`, `Promoted.enters`).
  The map's card offers it. It carries the town's known facets faint (`afar`).
- **Safe zones (E125, E128, E130).**
  - One zone, `--safe-*`, drawn by `?safe`.
  - test/safe-zone-browser walks the first hour's pages at five sizes; creation is checked page by page.
- **Undertakings (E124, E131).**
  - A followed aim goes on into its own next part.
  - Aims are followed by id; the exchange carries typed aims.
  - A fight's end is typed.
- **Telling (E127).** A fight is told once. Several new aims come by short titles.
- **Atlas.**
  - One indicator per element: the left bar on led choices; pips on portraits, rail and places.
  - The place's name line aggregates what is led there.
  - Companionship is perceived one place off (three for Gregarious).
  - The danger block is neutral.
- **Headless.** The CLI and terminal client; a parity test (a save made by one client reloads in the other); typed
  `does` for buy, sell and gather.
- **Startup.** A fresh country starts in 10.1 s headless, down from 11.8 s, with no double parse. Progress steps and
  yielding are in.

## 2. Architectural follow-ups for M21 (the owner's atlas synthesis, 11 November night)

1. **Semantic typing.** Replace each remaining text inference in `text-inference.md`, each with its named typed source:
   - talk roles;
   - reading acts;
   - "too dear" reasons;
   - seen-through and level-gained moments;
   - panorama sights;
   - harm on arrival;
   - the fight's turning points;
   - an aim's places for "on the map".
2. **Facets from Kyr.** Authors cannot yet mark an act, a thing or a person as uncanny (violet), knowledge (blue) or
   payoff (green) in Kyr. Today facets come from reasons (`Aspects.by`) and marks. A typed facet on Kyr actions and
   entities is the missing authoring capability. Without it, violet in particular is never drawn.
3. **Distance-sensitive perception.**
   - `Perception.reach` has only companionship: base 1, Gregarious 3.
   - Add per-facet reach, provenance (which capability saw it) and confidence.
   - Example sensitivities: mage → uncanny; cleric or diviner → the followed aim along story nodes; thief → wealth;
     warrior or ranger → danger and tracks; bard → companions and motives.
   - Immediate danger stays visible to everyone.
   - Keep it efficient: the glance has an 8 ms budget (glance-kite).
4. **Story-node propagation.**
   - A followed undertaking perceived along a chain of known places and people, not only at the next place.
   - Destinations' known facets carried to their approaches beyond the town case. Sites in the company's own hex are
     not handled yet.
5. **Exhaustion as state.** Dim means nothing new, and is today derived per act (`known`, `idle`). It should be one
   projected state, so that repeatable useful acts never go dim.
6. **Formation modifiers.** Company formations change perception and access (see
   `../2026-11-11-adventure-to-career.md`).
7. **Road junctions.** Roads meet only at towns and way rooms, so a road out that leaves another road's hexes makes the
   walk go into the town and back out. This repeats at most two hexes over five seeds, in 16–23 ways a seed. A junction
   node where roads share hexes is the fix.
8. **Startup.**
   - Measured on 11 November night, a fresh country with no parse cache, headless: world assembly 0.6–0.7 s; session
     start 9.7–10.4 s, of which parsing is 5.5–5.6 s (about 135 parses), the rest compiling and checking.
     Resident memory 550–620 MB, heap 135–270 MB.
   - Tried and reverted: a read-only path letting a generated region's files be parsed once and not copied for
     composition and loading. A/B over three seeds showed no gain (10.26/9.89/10.36 s before, 10.26/9.69/10.26 s
     after), and it added an uncopied shared module (the risk review's R4). The copies are not the cost; the parse
     and the compile are.
   - Candidates: parse the generators' templates once and instantiate them, instead of parsing their output; or a
     compact intermediate form for generated regions.
   - Not a lazy-world rewrite.
9. **Tests.** Parity for combat; the atlas states (full, faint, dim, silver) as projected data in the engine's
   projection, not CSS; the safe-zone walk in CI at the five sizes.
10. **The architecture risk review** (`architecture-risk-mediation-2026-11-11.md`, log E133). Its immediate list:
    - lifecycle assertions around command execution and rollback;
    - cache and load telemetry;
    - cache-on/cache-off differential tests;
    - a replay lane for historical transcripts.

    Then:
    - planner budgets (R7);
    - cost lint for authoring (R8);
    - a save-compatibility policy and migration harness (R5);
    - explicit command phases (R1);
    - per-campaign catalog state (R2);
    - frozen shared structures in development (R4);
    - a drift review at each closure (R10).

    R9, the atlas's honesty, was M20's. Its proposed gate, a corpus of false promises from the cold rounds, is still
    to build.

## 3. Content and play still open

These are from the log, with the owner's material concerns first.

- **The opening is thin on replay.** The owner's direction is a dense opening in medias res (see the
  adventure-to-career document).
- **Fights are trivial at first level** (E19, E29, E52, E92).
- **Payoffs are flat:** treasure, and threads that end silently (E118, E111: the sister at Seolforfyrd, E20).
- **The world forgets** what was done (E34, E57).
- **Dishonesty has no consequence** (E45).
- **Prose against the moment** (E15, E114).
- **Paintings for the owner's review** (E140, round 7): the old drain (a steampunk sewer), a broken keep's face (a
  classical portico), the hobs' muck pit (a prison cell), a webbed adit (a working mine), a castle in nettles (a
  pristine one), a painting that follows a place's state (the brood burned), and evening or night in a painting's
  light.

## 4. Round 7: two cold players (11 November night)

The build was main at fa374a83. It was served locally, because GitHub Pages was queued behind an Actions backlog; it
is the same commit.

- **K** started as the public does: no world named, a catfolk thief.
- **L** started in kahitude, as a birdfolk bard asked not to fight.

Reports are in `cold/round-7/`, and the log rows are E134–E143.

**What worked.** Both players found their own plans from what people told them, and named those the best moments:

- K: the bell against the hobs;
- L: the firebomb for the spiders' brood.

Both praised:

- the conversations;
- creation;
- the Notes;
- the paintings (where they matched);
- the clear danger boxes with their odds of getting away.

The world was made in under ten seconds for K. L's first request took more than two minutes to answer, but the page
was ready behind it.

**What broke, and its state now:**

| Finding | Now |
|---|---|
| Gold pointed past the buck rat to the drain, and nothing led back up to be paid | Fixed (E135, test/nest-aim) |
| Gold sat on "Give healing herbs", which did nothing | Fixed (E141, test/fever-nursing) |
| Ways were only under Go…: a just-opened corn-store; a scene with nothing in it | Fixed (E136) |
| The rail's marks moved under the finger | Fixed (E136) |
| A centipede called "should be won" took 5 of 7 hit points | Fixed in the rule, not replayed (E139) |
| An antidote did nothing in a fight, and could be bought for 3 and sold for 5 | Fixed (E137) |
| The wagoner's deed was told five times | Fixed (E137) |
| A bard's only crossbow was sold at one key | Fixed (E138) |
| The dead man's map ended in an empty box | Fixed for this origin (E142) |
| The bell read as refused, and the bands it routed stayed "by the fire" | Fixed (E143) |
| Paintings against the text | One fixed; the rest are listed for the owner (E140, §3) |

**Still open from round 7:**

- torches dying mid-act, unsaid;
- fights trivial for a party with a warrior (L: "I barely played my bard");
- the bard's lore, Charm Person and birdfolk gliding never coming up;
- the castellan speaking with no way to answer him (now answered, E150);
- Go… lists everything as "20 minutes" (the times are now true, E149; the list is still flat);
- the conversation log growing without end (now folded, E151);
- K's journey drawn east past Heahheald and back, with no route line before setting out.

**Ratings:**

| | K | L |
|---|---|---|
| Clarity | 3 | 3 |
| Beauty | 4 | 5 |
| Interest | 4 | 4 |
| Challenge | 3 | 3 |
| Wish to continue | 3 | 3.5 |

These are cold agents, not people. The first good hour has not been accepted by anyone.
