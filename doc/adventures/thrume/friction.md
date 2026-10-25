# Writing *Thrume* in Kyr: friction and bugs

*Thrume* was designed in prose first (`README.md`), then written in Kyr (`data/adventures/thrume`, ~1,150 lines, ~80
rooms, nine source files, one module) and played headlessly through `PlaySession` by the labels the page offers
(`test/thrume.test.ts`). This is what got in the way. **Bugs** are behaviour I believe is wrong, with a way to see it.
**Friction** is where Kyr could not say what the design said, and what the module does instead. Nothing in `src/` or
`data/rules/` was changed; every workaround is in the module.

All play here was done by the author, headlessly. None of it is independent human testing, and none of it was in a browser.

## Bugs

| # | What happens | How to see it | Severity |
|---|---|---|---|
| B1 | **In the dark, the explore choice labelled "Bran: light a torch" runs `put_item(…torch)`.** The torch is dropped ("Bran sets a torch down"), and the company stays benighted. This breaks the contract rule that a choice is known by its command (CONTRACT §4). The item panel's "a torch: Light" (`light_item`) does work in the dark. | Thrume: from the glacier's foot, search, go into the ice cellar (unlit) with no light, then take the explore choice "Bran: light a torch". `capable(party, light)` stays false. | high: a player in the dark loses their torch by trying to light it |
| B2 | **Lint and the runtime disagree about `consuming`.** `Change … from empty to filled consuming keepers_ring.` (a module-local `Kind … is treasure`) fails lint with `Invalid argument keepers_ring in consumes(ring_lock_set_ring, keepers_ring)`, yet `PlaySession.start` loads it and plays it. The error is also reported at the line of the `Kind` declaration (`shoulder.kyr:174`), not at the `Change` in `tomb.kyr`. | Change any of the three socket changes in `tomb.kyr` from `needing` to `consuming` and run `bin/kyrie lint data/campaigns/thrume.campaign.json`. | medium |
| B3 | **Twin tries can't be told apart in `ChoiceList.explore`.** Two things in one room (the Sleeper's left and right eyelids) are offered as two identical leaves, "Examine › Push and pull at it", with no thing name. (Mission 12's finding 11 says twins are named apart; it seems not here.) The test has to use `@push(thrume__left_lid)`. | Thrume tomb fixture: strike salt, go to the Sleeper's Face, list the choices. | medium: the puzzle depends on choosing left over right |
| B4 | **A possessive in an engine-built label is doubled:** "lay the Abbess's Eye in the lid-shaped socket using Elen's the Abbess's Eye". | Hall of the locks, with the Eye carried. | low |
| B5 | **The bare "Take" label.** An item lying in a room is offered as "Take" with no object. In an inn, `/^Take/` also matches "Take a bed and supper"; my first walk slept a night instead of picking up a letter. | Saltcellar after Varne lends the seal. | low (UI) |
| B6 | **A rule's `says` text was told twice in one response** (the young bloods' massacre). | Shoulder Hall: wait from day 1 until 9 p.m. on day 2 without freeing the miners. | low |
| B7 | **Order of telling.** After an action, the description of the new state comes before the action's `Result`: "The slope into the Mouth is still… The Mouth is shut. You sing…". The consequence is told before the act. | Sing the song at the Mouth. | low, but it hurts climaxes |
| B8 | **After the company falls**, the page offered a single choice with an empty label. I didn't look into it further; it may be the fight screen, which my driver doesn't read. | Shoulder Hall: ignore the challenge and wait. | unverified |
| — | `tsc --noEmit` fails on `main` before this branch: `doc/playtests/rededge-2026-10-20/control-server.ts` imports `/home/jweissman/work/kyrie/node_modules/playwright-core`. | `bunx tsc --noEmit` | pre-existing, not touched |

## Friction: what the design said, and what Kyr made me write

| # | The design says | What the module does | Proposed remedy |
|---|---|---|---|
| F1 | The Rememberer is given the salt **and tells what Thrume is**. | Events and rules can't assert knowledge ("Rules cannot change … discovery knowledge"). The gift sets `saltReturned`, and a second, separate `Topic` teaches. The player has to click twice for one moment. The guide doesn't mention the restriction. | Allow an `Event … teaches fact`, as `Observe … teaches` does, recording the person as the source (`toldBy`). |
| F2 | The young bloods are peaceful in the hold **until the hold is roused**, then they hunt. | A `Peaceable` person never follows `Pursuit … seeks assails(…)`. `Temperament obedient` works. Found by playing; the guide is silent. | Document it, or let a pursuit override `Peaceable`. |
| F3 | Names: a hold that is *alarmed*, a place called *the Wound*, a hazard called *keeping*, a door *sealed*. | Each collided, one load at a time: `alarmed` (dominion.kyr), and state names, which share the entity namespace (`wound` with the Warder's spring, `keeping` with Ardath's state, `sealed` with the ending relation, `broken` with a niche state). `closed` is also a state *flag*, so it can't be a state's name. Five renames, five loads. | Report every collision in one pass. Scope state names to their thing. |
| F4 | **"Ardath"** is named only once the company has read the Master's journal. **Skarn throws down the thane** and sits the high seat. | A person's name is fixed at load, so Ardath is "the crowned figure" for ever (otherwise "Talk to Ardath" spoils it). The coup is a `State deposed` on the thane plus moving Skarn. It reads fine, but nothing changes who commands whom. | `Called "Ardath" once knows(viewer, ardath_known)`, by analogy with `Seen when`. Roles by state (open finding #14). |
| F5 | A secret way behind the Sleeper's left eye. | A passage blocked by a blocking thing is still offered by name: "To the Hall of Doors — look at the slab behind the left eye". That gives away both the secret and the destination. It must be `hidden until` a fact, which a rule can't teach (F1), so an `Observe … teaches` fires on the lid's new state. Three constructs for one door. | `hidden until state(left_lid, pressed)`: hide a passage on any condition, not only on knowledge. |
| F6 | A conditional passage looks different from each end (the dust from the Room of Three Breaths; "Above the Mouth there is no up"). | `opening when P "…"` shows one sentence at both ends. The Gearworks said "Salt-dust fills the far half of the room", about another room; the Keeper's Chair said "Above the Mouth there is no up". Rewritten to read from either side, and the way home made one-way. | Per-end descriptions, or a description only at the end that is shut. |
| F7 | The iron door drops the company into the oubliette. | `Assert at(party, oubliette)` in a rule. Lint can't see that, so it warned "oubliette cannot be reached", and a recommended campaign must have no warnings. The module adds a one-way drop hidden until the iron door has been opened, which is honest fiction but exists for the linter. **The rule move itself isn't covered by a test.** | Let lint count rule moves as reachability, or offer a `Move party to …` effect it understands. |
| F8 | Setting the ring, the hammer and the Eye in the door uses them. | `needing` checks possession; `consuming` is refused for treasure kinds (B2). The company walks on carrying a ring that is also in a socket. | Let `consuming` take any item kind, or add `placing … in thing`. |
| F9 | Thrume breathes: an hour in, an hour out. | No modulo or period primitive: a `nextBreath` measure and two rules that set it forward (clocks.kyr). It works, and determinism holds. | A `Every 6 watches` rule form, or `watch(clock) % 12 < 6`. |
| F10 | The host of Harle crosses the Ebb, and what stands on the Shoulder road decides the day. | Armies can't fight ("fights are the company's"). The war is a single rule and a message on day 10. The giants-on-the-road outcomes from the design **aren't written**. | A conflict module could carry it; I didn't get there. |
| F11 | In Hush nobody speaks aloud. | Topics are speech. The Court's people talk through thralls in each `Says`. It reads well, but there's no way to mark a topic as signed, or to make silence matter. | — |
| F12 | Four endings. | No ending construct: endings are relations (`sungClean`, `sealed`, `cutOut`, `woken`) and epilogue observations in the market, and play carries on afterwards. | An `Ending` that closes the book, with its epilogue. |
| F13 | Only someone who reads old hands can read the iron books. | A readable source can't need a skill (the Long Man's open #12, still open). Anyone reads the Smiths' books. | `readable by party with lore`. |
| F14 | Torches: a light economy across eighty rooms, half of them unlit. | Works, and is one of the module's real pressures. But each bought torch is a separate item, so the item panel lists "a torch: Light | a torch: Set down here" ten times over. | Stack identical items in the item panel. |

## What Kyr did well (so nothing that worked gets removed)

- `opening when exhaling(fells)` plus checking the crossing on arrival: a company that sets out on the out-breath and
  arrives after it is turned back ("The way is no longer open"). The breathing dungeon came for free.
- `Seen when dreamt(viewer)`: the grey thing behind Mother Quietly, and the shepherd in the dreamed field, are there
  only for those who slept on the salt.
- Several blocking things on one passage (the three locks), each offered on its own.
- The page's own trap phrasing: "risk the third tread … Elen goes first" or "look at it › Prod it with the pole".
- Multiple regions in one module: the dream and the Between are regions of their own.
- `Guards`, `tolerates` and pursuits together give an alarm, a guest-right, a heist and a hunt, with no bespoke code.
- Determinism: a 199-step walk replays identically, which made the long test possible.

## What was not verified

- Combat balance at any level. Fights were only observed to start (Skarn) and, once, to end with the company down.
- House Pallor's hunt after the Eye is stolen: rouses, but whether it catches the company in the throat was not watched.
- Skarn's coup rule; the ice cage and the salt elemental; Brannoc stopped by the quake (stirring ≥ 6) rather than by the seal; the
  iron door's drop into the oubliette (F7); the Re-Sealing, Heart Cut, and Waking-from-inside endings; House Lull's
  betrayal (designed, not written); the day-10 war outcomes (F10).
- Prose in every person (`bin/kyrie voice review` covers voice lines, not module text), and the browser.
