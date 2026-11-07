# 14. Series bible for the broad pass

*One page that every adventure is revised against. It does not replace any adventure's own voice; it gives the
corpus a spine, a few shared objects, and a ruling on each known contradiction.*

## 14.1 The unifying theme: **the Account**

Westernesse is a country of ledgers. Under every place is something somebody *started counting* — a flood, a debt, a
generation, a watch, a vow — and above it people who inherited the count without the first page. Every adventure asks
the same four questions in its own key:

1. **Who is keeping the count?** (an office, a lamp, a bench, a book, a bell, a body)
2. **What is it a count of, really?** (what the keepers think it is vs. what it was begun for)
3. **Who pays when it is read aloud?** (the reading is never free)
4. **Can the count be closed, handed on, or forgiven — and by whom?**

The register changes (comic in Wapshott and Hessel, juridical in Quittance, elegiac in the Slack, domestic in Hollins,
pastoral-cruel in the Hive) but the question does not. Each adventure's revision must name, in its ledger file, its
*count*, its *keeper*, its *first page* (what is missing) and its *price of reading*.

## 14.2 Shared objects and phrases (use sparingly: a motif is worn out by being everywhere)

- **The kept light.** A lamp, candle, beacon or window that someone keeps lit *for no one now living*. (Pharos lamp,
  the Dorothea's tower; use a different small instance per adventure, never explained.)
- **Eleven strokes and a blank.** A tally, row of notches, bell-peal or register of which the last place is empty. The
  twelfth is *missing, not lost*: whoever keeps it knows. (Long Man notches, the Slack's bell, Fair Weather's bench.)
- **A fish and over it a flame.** An Aenean keepers' device. It marks *keeping*, never ownership. Appears on a lintel,
  a seal, a key, a stove-plate: it should be found in at most five adventures and explained in none.
- **"Owed" versus "kept".** The Prefect's writ distinguishes them; the Collegium of Measures does not. A character who
  uses the wrong word is revealing which side they were brought up on.

## 14.3 Rulings on known contradictions (canon for this branch; implement by wording, not by plot)

| Question | Ruling |
|---|---|
| Who built the black stone / the old engines? | **The Mathematical Age made; the Aeneans found, learned to start, fenced and wrote law about.** Any Aenean "builder" claim in an adventure is the Aeneans' own plaque, and is to be read as *their claim*. |
| The three Collegia | **Veyra teaches** (north; chapel and school; Grand Tour). **Measures weighs** (guild; assay and standards; Book of Faces). **Lesser Instruments collects** (Corran; working things; Low Water). Use the right verb for the right college. |
| Calendars (612, 1121, 1288…3640) | Each adventure keeps a **local reckoning**. Never convert. Where two adventures meet, characters disagree on the year and say so. |
| Hesk | The name belongs to the people of the notch-script, wherever it is found. A *Hesk Dene*, *Hesk plateau*, *Pen Hesk* are all places they walked. Never explained; never contradicted. |
| Concord | Three bodies share the word: a *treaty*, a *warden's office*, and a *chorus*. Say which. |
| The Quiet's 900/700/300 | Left unreconciled on purpose. |

## 14.4 What "revised" has to mean (the checklist each adventure ledger answers)

1. **Acts and scenes.** Name 3–5 acts. Each scene has a distinct place and at least one face the player will remember.
   A scene without a face or a place is cut or given one.
2. **Characterization.** For the 3–5 most important persons: a want, a fear, a lie they tell themselves, a thing they
   will do when pressed that surprises. Show at least two of these in play (text or choice), not only in dossiers.
3. **Companion arc.** The preset party must matter. Calling-keyed voices (`memberOf(?m, party) and hasCalling(?m,
   calling_x)`, see `the-long-man/voices.kyr`) at ≥ 4 beats across acts, and **one beat where a companion's calling
   gives a way through a problem that no other calling has** (a cleric reads the funeral office; a thief sees the
   second lock; a ranger reads the ground). At least one beat is a *choice* with a consequence, not a bark.
4. **Danger with a way round.** If an adventure has no real physical danger, add one scene where a fight is possible
   and costly, and at least two noncombat exits (persuasion, an item, a clock, a witness). If it has one, check that it
   too has two exits.
5. **Depth beyond the frame.** At least three *new* concrete pieces of history, material culture or rumour that are
   not on the critical path: a name on a lintel, a trade, a quarrel two centuries old, a thing everyone does and no
   one can explain. Concrete beats abstract. Prefer sensory (a smell, a sound, a texture) to summary.
6. **Links.** At least two outward references to other sites: a named place, person or custom; an item (catalog kind
   already in `data/catalog/items.json`); or a read of a world event (`befell(slack_opened)` etc.). No module may set
   a flag for another to read by name. At least one inward hook: say what *would* bring a visitor from elsewhere.
7. **Tone.** One scene of deliberate contrast (a comic scene in a grave adventure; a grave one in a comic).
8. **Foreshadowing.** One early detail that pays off in the last act; one that pays off only if the player went
   looking.
9. **Playability.** Every new action must be reachable; every new item obtainable (`Give item to actor`, **not**
   `Assert lends`); write a test that plays it as a player would. Do not use `j.give` to stand in for a gift.

## 14.5 Constraints for authors on this pass (shared state is the danger)

- **Data only.** No `src/` change. If something is blocked, write it in your friction file and work round it.
- **Do not edit shared files:** `data/catalog/items.json`, `data/adventures/countries.json`, `data/imbar/*`,
  `data/scenarios/*`, anything outside your own adventure directories, your tests and your doc files. If you need a
  shared item or event, say so in your report and use an existing one.
- **Global names** (persons, Species/Kinds, canonical relations) are shared across the whole world: prefix new
  species/kinds with your adventure; `bin/kyrie lint` refuses duplicate person names. Never rename an existing person.
- Adding a province re-seeds every drawn world: **do not add provinces**.
- Do not run the whole suite. Run your campaign lint, your adventure's tests (`test/<name>*.test.ts`) and
  `test/all-in-one-world.test.ts` at the end. Do not run `bun run web:build` or commit; the coordinator does.
- Write results to `doc/imbar/adventures/<adventure>.md` (ledger: count/keeper/first page/price; acts and scenes
  map; what changed, before → after; companion arc; links in and out; tests; honest shortfalls) and your frictions to
  `doc/imbar/adventures/<adventure>-friction.md` (what you tried, what happened, cost, smallest repair; blocked ones
  marked **blocked**).
