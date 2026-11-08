# Mission 19: closing accounts (draft)

The seven accounts the brief asks for at closure (§XIII). **This is a draft, written 8 November 2026 by the builder,
and not accepted.** The owner's word of 7 November stands over it: "the adventuring loop isn't close to acceptable
yet". Five cold players (PD-14) have not played it. Where an account says something works, it says how that was
shown: through the page by a person, through the page by a scripted browser, or only by headless specs.

## 1. The playable experience

A player makes a character in one step (a people, a calling, a background, an origin of eight), and begins on the
road into a generated first town with a first goal said. The town is a painting with who is there as likenesses
over its foot. Go… finds ways in a town; the full-screen hex map is the one map for the country. Talk offers three or
four things to say. Shops sell. Fights are cards, with likenesses for both sides.

Under the first town, three jobs (rats, the dead, spiders) are offered on a notice on the green. Since 8 November
each job's wing is three or four rooms and fights, and each leads on, by an aim, to an undercroft where the three
meet. The undercroft's lettered flag is a puzzle: the letters are found in the wings, read by lore, or the flag is
forced. Under it, a vault and its keeper; behind him, a deep site of four levels with about fifteen bands and more
than a hundred things. Shown by specs (`undertown`, `undertown-onward`) and probes; **not played through the page by
anyone yet.**

What is not yet acceptable, by the owner's own play of 6–8 November:

- The first quarter-hour still loses players: aims that lead the wrong way (several fixed on 7 and 8 November:
  M19-151, M19-152), a busy resting scene (M19-85), Look… and Go… still learned by trial.
- Finding a dungeon was the hardest thing in the game, when it should be the easiest (M19-155, Partial).
- Paintings that did not fit their places (scene paintings matched by kind on 7 November; forty of the owner's
  scene paintings integrated on 8 November).

## 2. End-to-end demonstrations

| Journey | How shown | Where | What it still exposes |
|---|---|---|---|
| 1. A cold opening to a first fight | Fresh agent sessions, 7 November | doc/playtests/fresh-2026-11-07, -b | Aims and gold incoherent (since fixed in part); not repeated since |
| 2. Two callings, one opening | Played through the page, 7 November | [journeys.md](journeys.md) | Talk does not know a calling (M19-141) |
| 3. A quest-less expedition and back | Fresh agent session, 7 November | doc/playtests/fresh-2026-11-07-b | The world beyond the first country thin |
| 4. A dungeon and back | **Not demonstrated end to end.** The way down now exists and is led to | specs only | M19-155 |
| 5. Authoring by data alone | Played, 7 November: a plant, an item, a spell, a meeting | [journeys.md](journeys.md) | A new kind has no plate (M19-145) |
| 6. Content to play to Encyclopedia | Played, 7 November | [journeys.md](journeys.md) | Adventures add no entries (M19-148) |

The browser specs (Low Water, the Long Man, the Lull, the map, the glance, the spatial journey) were brought back
to the page as it is on 8 November and pass locally.

## 3. Content migration, by operation

See [inventory.md](inventory.md) (defined, played, met, shown, family by family) and
[bestiary-inventory.md](bestiary-inventory.md). In short: peoples 15 playable of 25, callings 7, backgrounds 215,
spells 105 arcane and 139 divine played, conditions 180 of 204, species 124 of which 96 are placed by some
generator or adventure, items 363 shown. Orsino's generation tables (rooms, traps, wonders, riddles, shops), its
companions and its dungeons are not used. The owner's paintings: 81 animals, 54 monsters, armour and consumables
plates, and 40 scene paintings (8 November).

## 4. Authoring workflows that work

From [authoring.md](authoring.md) and journey 5: a plant and its item, a spell, a wild meeting, a species variant,
an adventure's own place painting, a town's trouble (an option in `undertown.kyrt`), a scene painting for a kind of
place (`data/paintings/scenery.json`). Each by data alone, validated, found by `bin/kyrie world`, met in play.
Still needing an engine change: prose generators in TypeScript (M19-44), a new item kind's plate (M19-145), a
check that cannot be retried for free (M19-124).

## 5. The Encyclopedia and the adventures

The Encyclopedia of Imbar is built with the site from what is played: creatures, plants, arms, magic, peoples,
lives, gods, history, lands, planes, tongues, conditions. It is reached from the title and, since 8 November, from a
thing in the pack. Not yet: from a creature or plant in play; authored adventures add no entries (M19-148).

The twenty-one authored adventures are provinces of the first country, each told of in every town, each played by
its own journeys; Dun Rìerdan is seated in the canon. Never yet played together by one protagonist. The anthology,
the Grand Tour, the art branches and the journeys branch are merged.

## 6. Architecture: corrections and debt

Corrections: one creature pipeline (monsters.json, animals.json, variations), engine declarations read from the
AST, typed runtime-to-UI contracts, the scene chosen by what a place is, the aim followed carried by id.

Debt: `ModuleShadow` rewrites module text (M19-69, open risk); a failed check is free to retry (M19-124); a Rule's
words are said wherever the company is unless it asks where (M19-126); state outlives its cause (M19-128); the
danger reckoning plays out fights and is unreliable (M19-122); CI takes about an hour, with flow verified in the
browser where it could be headless (the owner, 7 November: an intent runner over the
engine, page objects for the few browser flows).

## 7. Residual register and the next mission

The register ([register.md](register.md)) holds 174 rows: 114 fixed, 16 partial, 1 open, 41 deferred to Mission 20 with a reason each, 2 superseded. The rows inherited from Mission 18 ([inherited.md](inherited.md)): 44 open risks, known and accepted as risks, not repairs; 24 partial, each carried to Mission 20 with what remains; 44 deferred. Of the open and partial, two partial are P0 (M19-46, play as places moved through; M19-155, the
Still open in Mission 19: M19-69 (ModuleShadow, an open risk) and M19-122 (the reckoning). Partial and awaiting a person's play or the owner's judgment: M19-46 and M19-155 (P0: play as a world moved through; the dungeon), and M19-49, 57, 59, 60, 75, 85, 87, 108, 116, 117, 121, 144, 147.

Recommended for the next mission, in order:

1. A person's play through the first hour, start to the deep site and back, with a cold player watching; fix what
   stops them, and nothing else first.
2. Each first-town wing deepened again, and the deep site's levels checked for a level-one to level-three company
   (M19-87, M19-117).
3. A fast headless intent runner for flows, and CI under fifteen minutes.
4. The engine's retry, rule-scope and state-scope gaps (M19-124, M19-126, M19-128), with a lint for each.
5. The Encyclopedia from play (M19-147, M19-148).
