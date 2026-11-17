# The boredom census (17 November 2026)

The owner, 17 November, evening: "ordinary play is still too repetitive, thin, and unrewarding. We need to treat
boredom as a first-class defect." The brief is `boredom-brief.md`; this is its lane 1, the headless diagnosis. Made by
`bun scripts/boredom-census.ts` (default seeds and players; `--json` keeps every act), deterministic by seed.

## How it was measured

- **Where:** the first country of five generated worlds: a1 (marsh), kite (forest), thorn (marsh), b2 (mountain) and
  ember (frost). Origin `wanderer`, one human warrior (Wenna), the frontier open.
- **Who:** four unguided players of the autoplay laboratory (`src/autoplay/player.ts`), none following an aim's gold:
  `wander` (fresh places first), `investigate` (talk and look first), `expedition` (out and home) and `mixed` (a
  temper a stretch). Sixty acts each, the first hour of a player's attention; 20 walks, 1,200 acts.
- **What each act gave**, read from its events: a line not met before (word for word); a line whose shape, its names
  aside, was met before; a change to the company, its members or what it acted on (not the clock, its standing, or
  the engine's marks of having been or tried); a fact learned.
  - **repeat:** every told line met before but for its names, and nothing learned or gained.
  - **dead:** nothing new told and nothing changed.
  - **looked at, nothing beneath:** places where a look, listen or search gave no fact, thing, change or more than its
    own answer (a search that finds nothing says only that it was made).
  - **wonders:** the generated `wonder_…` things of the country (`RegionMarvels`): met (the act on it taken), seen
    (stood in its room), placed.
  - **new verbs:** the act schemas first offered after the start, topics aside: of the shared rules, or a module's
    own, with what the act before gave (a place come to, a tool, a companion, a lesson, a fact).
- **Limits:** the walkers wait more than a person would (the `expedition` and `mixed` tempers wait out nights), so the
  dead minutes are high, and they set gear down and pick it up (124 acts of 1,200): both are the lab's, and are left in
  the numbers but not counted among the causes. A line told on the page may be shortened by the page (a known place's
  scene); the census reads the events, so the scene's lines are counted fresh or not, but no act is called a repeat for
  them. The opportunity-depth census (`scripts/opportunity-depth.ts`) measures what is offered; this one, what came of
  what was done.

## Baseline (before the fixes)

| region | terrain | walks | acts | hours | repeat % | dead % | dead min | places | looked at, nothing beneath | wonders met / seen / placed | first met (min) | new verbs a walk: shared / a module's |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| a1 | marsh | 4 | 240 | 216.6 | 15 | 27 | 2130 | 62 | 2 of 3 | 0 / 0 / 9 | - | 11.8 / 6.5 |
| kite | forest | 4 | 240 | 235.5 | 15 | 12 | 1026 | 85 | 4 of 9 | 0 / 0 / 5 | - | 17.5 / 8.3 |
| thorn | marsh | 4 | 240 | 343.9 | 25 | 8 | 1612 | 127 | 2 of 7 | 0 / 0 / 8 | - | 15.8 / 6.5 |
| b2 | mountain | 4 | 240 | 382.4 | 18 | 20 | 3995 | 106 | 0 of 1 | 0 / 1 / 6 | - | 15.0 / 8.3 |
| ember | frost | 4 | 240 | 333.6 | 13 | 14 | 2191 | 94 | 2 of 5 | 0 / 0 / 7 | - | 20.3 / 6.0 |

Across all walks: talk_to 138 times, one taught anything; topics 145, 31 taught; looks 27 of 1,200 acts (13 searches,
9 listens, 2 examines, 2 looks closely, 1 reading); 13 searches, 2 found anything; waits 221, 52,390 minutes, 79 dead.
New shared verbs, by source: 252 by a place come to, 20 by a tool (lighting and putting out a light, readying
armour), 2 by a companion, none by a lesson.

## The ten worst causes

Each with its evidence (place, act, line) and the smallest fix at its cause. BO-02 and BO-03 are fixed and BO-01 partly (below).

1. **BO-01 Wonders nobody can find.** 0 of 35 wonders met in 20 walks, one stood beside (b2's shimmer at
   `region__z2_deep`). Every one is at the heart of a wild country or past a work's inner way, and nothing points at
   it: a1's pool (`region__z1_deep`), chimes (`z2_deep`), glowing symbols (`w1_hall`), lantern (`w2_hall`), book
   (`w4_end`); kite's glow, cold flame, star-glass; thorn's visions, well, star map, runes. **Fix:** a wonder is
   noticed from the place before it (the edge of its wild country, the room before a work's inner way): a sign told
   there while it sleeps, known from then as heard of, its place on the map (`RegionMarvels.sign`; a `sign` for each of
   the 46 wonders in `data/generation/scenes/wonders.json`). Deep sites' wonders (`…_ud_…`) are not signed yet.
2. **BO-04 An hour with no new thing the company can do.** The shared verbs gained are the rules surfacing in the
   first town (haggle, buy, push, listen, pet, gather at acts 1 to 3 in every walk; then camp, search, attack); none
   by a lesson, two by a companion (ember's recruit at act 7: hold here, hand over), the tools only a light lit and put
   out. **Smallest fix:** the first town's first aim's successor is a lesson within reach (Succession.lesson, landed
   for a1's boundary stones, 4cd0caff) in every generated first town: its mentor named in the first exchange, its fee
   in the first job's pay.
3. **BO-05 Walking back through rooms already seen.** 100 of 474 moves dead (21 %), most in rooms with one way out and
   nothing to do: Pellam's Hay Wharf and Hay Stairs (15), Bankside Street (6), the Clink yard (4), the Spotted Calf
   (3), Tolleth's quay (4). **Smallest fix:** a town room with nothing to do but leave is folded into the street it
   opens off (told there, entered only for its people or trade), or given one thing beneath its first look (lane 2).
4. **BO-03 A search that finds nothing says nothing.** 13 searches, 2 found anything; the rest ended on the plain
   words, twenty minutes gone: "You search Isot's cloth-hall with care, a little at a time." (kite `s1_fabrics`), the
   bakehouse and Tam's weapon-shop (ember), Hankin's chandlery (thorn), the byre, the Clink yard, the big top. In a1,
   51 places answer a search and 258 are indoors, where search is offered. **Fix:** where nothing reads a search of
   the place, its Result says so ("Nothing is put away or hidden here.", `data/rules/discovery.kyr`). Proposed for the
   owner: search offered only where something answers it, as out of doors since 6 November.
5. **BO-06 A wait that changes nothing, for hours.** "Wait and watch, until something changes" taken 34 times, 6,490
   minutes; 23 ended "Nothing comes, and nothing changes. The hours go by." (a1's walk station, kite's fields).
   **Smallest fix:** watching is offered only where something the company could watch for is due (a going-on's
   clock, someone expected, a door with someone behind it); elsewhere the plain waits.
6. **BO-02 A journey's land told again word for word.** "For an hour the path runs under trees, and the light comes
   down green and broken through the leaves." 7 times; "Water stands on both sides, and the path between is soft" 7;
   "The path runs along a river for a mile" 6; "Out on the fen the sky is enormous" 6; "An axe is going in the wood,
   a long way off" 4. The voice has one to five land lines for each land, and the oldest was said again once all were
   said. **Fix:** a land, a dark coming on or an arrival is told once; setting out may be said again
   (`Journeys.line`).
7. **BO-07 Talking to someone teaches nothing.** 138 talk_to acts, one taught anything: each is a greeting ("Moll
   sighs before you have said a word. 'Go on, then.'", a1's green) and the walker leaves; what teaches is the topic
   behind it, which a person reads as a second step. **Smallest fix:** the first exchange with a townsperson carries
   one thing they know (R11-02's `Ask about <the followed aim>`, or their work's one fact) rather than a greeting alone.
8. **BO-08 Morning told the same every morning.** "The sky greys, then lightens. It is morning." 23 times in eight
   walks; "The light goes. It is dark." 6. **Smallest fix:** the wait's dawn and dusk drawn from the voice by sky and
   season, as a journey's setting out is.
9. **BO-09 A rule's line every morning.** "From the east point the bell begins: slow, evenly, a stroke to every
   breath." 9 times (`data/adventures/skerrow/sea.kyr`, at first light). **Smallest fix:** told the first morning and
   when it means something (a ship due), not every dawn.
10. **BO-10 Asking again gives the same answer word for word.** Honoria's tea-shop (`circus__hon_teashop_again`), the
    tin-miner Hulda's work (`region__s1_r4_work_again`): offered, taken, dead. `WorldConstructs.recall` copies every
    teaching topic as "Ask … again". **Smallest fix:** the copy offered only once something the answer bears on has
    changed, or said as the company's own recollection (in the Notes) rather than as a new act.

## After the three fixes

The census rerun, the same seeds and players, with BO-01 to BO-03 fixed (and a column for wonders heard of, which
had no way to be before):

| region | terrain | walks | acts | hours | repeat % | dead % | dead min | places | looked at, nothing beneath | wonders met / heard of / seen / placed | first met (min) | new verbs a walk: shared / a module's |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| a1 | marsh | 4 | 240 | 216.6 | 13 | 27 | 2130 | 62 | 2 of 3 | 0 / 0 / 0 / 9 | - | 11.8 / 6.5 |
| kite | forest | 4 | 240 | 235.5 | 12 | 12 | 1026 | 85 | 4 of 9 | 0 / 0 / 0 / 5 | - | 17.5 / 8.3 |
| thorn | marsh | 4 | 240 | 381.2 | 12 | 5 | 1412 | 131 | 1 of 5 | 0 / 1 / 1 / 8 | - | 17.0 / 7.0 |
| b2 | mountain | 4 | 240 | 382.4 | 15 | 20 | 3995 | 106 | 0 of 1 | 0 / 1 / 1 / 6 | - | 15.0 / 8.3 |
| ember | frost | 4 | 240 | 333.6 | 11 | 14 | 2191 | 94 | 2 of 5 | 0 / 0 / 0 / 7 | - | 20.3 / 6.0 |

- **repeat** fell in every region: a1 15 → 13 %, kite 15 → 12, thorn 25 → 12, b2 18 → 15, ember 13 → 11 (thorn's
  dead 8 → 5 %, its walks going further on the same sixty acts: 127 → 131 places).
- **journeys (BO-02):** the five land lines the baseline repeated most were told 84 times in the twenty walks, now 37,
  each at most once a walk.
- **searches (BO-03):** 12 searches, 2 found something; of the 10 that found nothing, none ends on the plain words now
  (12 of 13 did); each says that nothing is put away or hidden.
- **wonders (BO-01):** heard of in three walks (thorn's well, by its sign, at minutes 50 and 231; b2's grove, at 2,119),
  still met in none. The walkers rarely reach the edge of a wild country in sixty acts; a sign at the first town (a
  rumour, as the countries beyond have) is the next step, and the census will show it.

Rerun after each change: `bun scripts/boredom-census.ts --json out.json`, and compare with the tables here.
