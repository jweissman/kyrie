# Mission 17: what is left, and the order to do it in

Written on 28 October 2026, after play 13 and the batch that answered it. The register's counts once that batch is in:
of 105 inherited rows, 52 fixed, 43 partial, 9 open; of 114 found in this mission, 99 fixed, 13 partial, 2 open; of 70
from the adventures' authors, 65 fixed and 5 partial. The owner asked for the punchlist burnt down before new surface,
and then the mission's larger arcs, the interface first.

## 1. The open rows (eleven)

| Row | What it is | What closing it takes | Size | Proposal |
|---|---|---|---|---|
| NAV-10 | Every installed adventure found and entered from ordinary play | The library tour (kite) entered 9 of 13 countries in about 25 minutes, then spent 15 more on the four farthest (the Bowl of Ammerlin, the vale of the Wray, the Lim valley, the Levels of Gaunt) without entering one. Re-run with a command budget to see where it stops; fix the stall (a route, a crossing, or a fight it keeps going back to) | Small to medium | Next |
| NAR-01 | Characters and institutions thin; generic people in a commons | A town's people each with a place of their own (a workshop, a house they are at by night, a pew), something they are doing that changes through the day, and a relation or two that shows (a debt, a rivalry, a marriage); the "houses of" a town peopled by day too. Works with the community writer as it stands | Medium | After NAV-10, as part of Gate C |
| ARV-M7 | A companion has no public lifecycle; two companion systems; generated ids in authored text | One membership facility (join, follow, wait, dismiss, die, return) used by hires, family and an adventure's companions, with authored text naming members by role | Medium | Gate D, when a companion arc needs it |
| ARV-M6 | Hidden registries and central edit points | Origins, region generators, rule modules and the title page's list read from manifests, so a new one is a file added, not a list edited | Medium | Gate D |
| AUT-25 | Deem: tables of a module's own, weighted and conditional choice, generated families, naming | Module-local tables and weights in Kyr (a `Table` construct over Deem's), proved by one new generator written outside the engine | Medium | Gate D |
| ARV-M5 | Combat has exactly two teams | Sides as data (whoever is hostile to whom), so a fight can hold the company, raiders and wolves at once; the tactics choose targets by side | Medium to large; touches every fight test | Only if a play wants it; otherwise say so in the report |
| ARV-M4 | Closed English word lists and name patterns classify content | Replace, where they bite, with what the engine knows (an entity's kind, a choice's action): the verb lists in the scene's labels, the region patterns in ids | Large, incremental | Each time one causes a defect |
| ARV-L2 | Identity carried in id strings | Entity metadata (whose region, what kind) in place of reading `region__w8_` | Large, incremental | As ARV-M4 |
| COR-12 | Presentation inside the authority boundary | Perception decided by the engine, not the page; the log keeps facts, the telling is made from them | Large | Report it honestly; not this mission |
| M17-21 | The feverwort errand ends three actions after setting out | An obstacle or a second beat for the origin | Small, but the origin's authors' | Ask the owner whether the builder may write it |
| M17-45 | Three Awls beat a lone warrior in Doble's yard nearly every night | The Parliament of Books' authors' balance | Small, the authors' | As M17-21 |

## 2. The partial rows (61), by what they wait on

- **The owner's look** (M17-25, M17-27, M17-29, M17-31, M17-71, and Gate B's interface rows): built and tested,
  waiting for the owner to use them on a tablet. The fastest close is an owner session on the current build.
- **Small, concrete, the builder's** (could each close in a batch): M17-93 (leave-taking still names one's mother),
  M17-99 (two asks at the inn for one site), CMB-02 (bleeding begun and ended in one round), PT-35 (the bronze mirror is
  loot only: give a valuable a use or a buyer who wants it), M17-73 (a ranger's specialty), NAV-04 (one road crossing a
  town's name on the map), AUT-23 (lint does not see a count taken below nothing).
- **Content and balance** (PT-02, PT-11, PT-14, PT-23, PT-38, PT-15, PT-29, NAR-18): the early game's economy, solo
  viability, renewal and variety. Each says what is left; these are Gate E's.
- **Architecture** (Gate A's partials, ARV-H4/H5/H6/H7, COR-04/05/18): contracts tightened as far as defects led; the
  rest belongs with the open architecture rows.
- **Other authors'** (ICE-02, ICE-15, CTH-05, CTH-06, CTH-09, PRE-05 portraits, M17-23/M17-65 likenesses): engine
  facilities exist or are named; the content is theirs.

## 3. The arcs still ahead

- **Gate B, the first fifteen minutes.** Done in substance: no chrome bar, creation as cards with gifts and rules said,
  a place as one scene with its ways beside it or a touch away, whoever matters first, the aim of where you stand, the
  road as a scene, a fight that keeps its account. Left: creation as the choice of a life rather than a page of rules
  (the reason for coming first, the calling second?); a fight's composition beyond a form (sides facing, a foe's
  likeness where one fits); the owner's verdict on a real iPad.
- **Gate C, the dense region.** The largest gap. (V) Several authored adventures in one small region, interleaved in a
  town and its valley, not separate countries beyond marches: start by making one adventure installable as sites
  within a generated country (its places within a town and a wild country, its people in the town), then a second.
  (VI) Density: the measured empties are few (two hill feet a country, a town's houses by day); what is thin is what
  there is to *do* at many places, so: people at work in the wild (a charcoal-burner, a shepherd's fold, a wildfowler's
  hide) who know the country and point to what is in it; a use for every find. (VII) Perception and maps: the vantage
  exists; next an instrument (a spyglass) and an expertise that identifies what is seen.
- **Gate D, authoring.** The studio exists (69cffd9). Left: the character lab's nine runnable examples (XI),
  ARV-M6, AUT-25, and the open architecture rows only as far as they block authors.
- **Gate E, progression and the living present.** Companion arcs and relationship (XV), a calendar's festivals in
  season (XVII), one artistic or public activity worth doing without combat (XVIII: a bard's performance with choices
  and cost), material persistence (XIX).
- **Gate F, verification and the report.** A cold evaluation of the final build by someone who has read nothing; an
  owner-scale play; the ten demonstrations the commission names, each with its evidence; the register verified.

## 4. The gates themselves

A full gate is lint, types, 1,530 tests on sixteen workers (14 to 20 minutes) and 30 browser specs (3 to 4), and it
fails under load (lint-outside's two-minute timeout). Proposal: run the full gate once per pushed batch, as now, but
batch more per gate (two or three fixes together), and between gates run only the tests a change touches (the files
importing what changed, chosen from `test/timings.json`) and the browser specs for the page changed. The register and
the report are written after the gate, never before.

## 5. Proposed order

1. Commit the play-13 batch; re-run the tour with a budget and close NAV-10 (or say exactly where it stops).
2. The small concrete partial rows (section 2), two or three a gate.
3. Gate C: one adventure installed as sites within the first country; people at work in the wild; NAR-01's town people.
4. Gate B's remainder: creation as the choice of a life; the fight's composition.
5. Gate E's one public activity (a performance) and one companion arc.
6. Gate F: a cold evaluation, the owner's play, the final report.
