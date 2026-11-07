# A Parliament of Books: friction

| # | What I tried | What happened | Cost | Smallest repair | Status |
|---|---|---|---|---|---|
| 1 | `Observe … when befell(slack_opened)` / reading the world event | `Invalid argument` until `"canon"` in `module.json` and `placed.json` also lists `slack_opened` | a lint cycle | List the event with the canon (as Wrayford and Quittance do). | worked round |
| 2 | An `Observe` that is true while the company holds a catalog kind (`old_glossary`, via `holding` or `carries … itemKind`) | `Invalid argument old_glossary` at load; the same name in a `Requires` is fine | a rewrite: the Observe became an Action (`read_ridge_glossary`) | Resolve catalog kinds in every condition. | **blocked** as an Observe; worked round |
| 3 | A courier whose combat strength suits a lone bard of six hit points | The base species decides everything: `revenant`, `pixie`, `mephit`, `dog` all kill her in a round; `rat` dies in one blow. No gradient | three rebuilds of one species | A small table of "danger against a level-1 solo" at lint. I used `dog` (usually fatal, occasionally not). | worked round |
| 4 | Test a fight from `Journey` | `Journey.choices()` is empty in the fight screen | reading `engagement.ts` | `session.perform(command, runner)`; `runner` picks `melee`. | worked round |
| 5 | A companion beat for the *messenger* background | Backgrounds are not projected (11.6 repair 1): the courier theme can only key on `calling_bard` | the unique beat is a bard's, which Wren is; a thief preset is told nothing of it | Project `hasBackground`. | **blocked** (shared fact projection) |
| 6 | A flag to let a Parliament topic read the post-house | Within one module this works (`almanackPosted` read by `roll_posted`); across modules it would not | none | n/a; the bible's rule is kept | by design |
| 7 | A posted copy removes the *companion* but not the voice | The Almanack is one voice in three thousand copies; `almanack_left` retracts `travelsWith` when no copy is carried, and the nails keep it | design | `Spend almanack_copy`, and the epilogue line says so | worked round |
| 8 | The new `after()` Observes (hook empty, Almanack says "Received") | not played end-to-end: the Kindling takes a full Parliament to reach | untested | A fixture campaign that starts at the Ashpit on the morning after (the existing outcomes tests do the long way) | left |
