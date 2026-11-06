# The Lull: frictions in the broad pass

1. **`befell(cloudgate_fell)` is refused in a standalone module** ("Invalid argument cloudgate_fell"). World events are entities of the `imbar` canon; a module that does not declare `"canon": ["imbar"]` cannot name them, and declaring it would pull the canonical world into a standalone campaign. *Cost:* I dropped the Sixways "cloud on the harbour" line and made both outward links to places instead. *Smallest repair:* a way to name a canonical event optionally (like `optional` imports), or ship events in a tiny always-loaded module. **Blocked** for reads of world events from the Lull.
2. **The thief's voice sits at the Mill floor, which is only open in the Sixnight** (the strikers' window is boarded in daylight). Correct for the story and costly to test: it needs the dark-watch preamble. Fine; marked in the ledger.
3. **Company size lives in `company.kyr`.** A five-person fixture needs a module directory (`test/fixtures/the-lull/revised/`). See Hive friction 3.
4. **A rule cannot assert knowledge** (`teaches` is the way). See Hive friction 1.
5. **Topic labels cannot name a companion; action labels can** (`{c}`). The Office is therefore an action, which also lets the page show "Have Dori say the Office…".
6. **No hook for "she asks again".** I wanted the clear-minded Hester to put the phial question a second time at the Watching as a real choice. A `Topic … once` with `hesterAsksAgain(hester)` would do it; I stopped at the Observe. Cost: one topic and its branches.
7. **Lone-company route:** `capable(actor, rites)` was the only gate the cleric's Office could be swapped for; the sitting-up is gated `not capable(actor, rites)`. A fresh `Time 300 minutes.` runs past ten without trouble.
