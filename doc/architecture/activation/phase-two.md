# Phase Two: what is already done, what remains, and guidance

*11 November 2026. Phase Two's purpose is to improve the coherence, density and authorability of the existing world **without interrupting M20's first-hour stabilization**: a small, independent editorial and authoring experiment, not a campaign expansion and not a second stabilization mission. This page says which of its seven parts the branch has already met (the work was done as Phases One to Three overlapped), what a Phase Two pass should still do, and what to leave alone.*

## 1. Where each part stands

| Phase Two part | Met by | Still open |
|---|---|---|
| **1. Survey the corpus** (defined vs installed vs reachable vs discoverable vs actionable) | `editorial-map.md`, `census.md` (`bun scripts/activation-census.ts`), `dormant.json` | Nothing read-only remains. The census can be re-run after any painting batch. |
| **2. A deeper location + storyboard** | The Hall and the old stones (`outskirts-deep.kyrt`) and the Empire's posting-house (`roadstation.kyrt`); `storyboard.md` (rooms, dramatic functions, visuals, engagements, commissions, the storyboard-first method) | A person's walk of both in the browser (see §4). |
| **3. Kyr/Deem boundaries** | Two migrations (`@count`, template `if`/`unless`); `kyr-deem-requests.md` R1–R14 with reproductions | R2 (a site-by-plan hole) and R5 (scenarios that bind a work) would remove the remaining first-town TypeScript. |
| **4. Combat and encounter density** | Occupants drawn per site; wrong-answer costs; a stated warning before any fight; storyboard §4 | A balance pass is M20's: see §3 below. |
| **5. Arcology conception** | `arcology.md` (twelve moments, ecology, motives, connections) | Paintings, if the owner wants it. |
| **6. Independence** | Own branch; `handoff.md` lists every shared file touched and why; the add-only files; merge instructions | M20 decides what, if anything, to take. |
| **7. Completion criteria** | Overview, a richer location with evidence, concrete requests, a reusable method | — |

## 2. The final coherence pass (what it found and did)

- **Prose and voice.** The new material avoids the corpus's tic ("Nobody has … in living memory") and the repeated "as big as cats" motif; each person's speech carries an attitude (the cook's contempt, the acolyte's scruple, the scholar's delight), and no one is a topic box: companions *ask* (`bond.kyrt`), and what the company answers is remembered.
- **Contradictions removed.** The lamp-keeper's reason no longer depends on a day-book ending; the stationmaster's seal is not both on a finger and in a drawer; the steward can read the grant without the company holding it; Isaure can be asked to come on again after she stays at a stage; no one is told "take a light" without being told once.
- **Consistency across layers.** The same motifs recur across threads, the grant, the posting-house and the companions (a wheel with a wing; the Fourth Stone; the Works), and the same facts are *taught* by several routes (the grant's seal by the Hall's muniments or the posting-house's tariff), so no clue depends on one lead.
- **Economy.** Starting purse is 12 gold; a master-at-arms' lesson is 20–35 and a caster's 45–60. New payouts in the first region run 6–25 each (cook 8, reeve 10–12, steward 10, apprentice 10–25, accusation 8, tie 10–14, the town's purse 25 for ending the bailiff, 20 for taking her half). Roughly one lesson per three jobs, and each job is gated behind a clue trail and some risk: a modest, steady inflow, not a windfall. **Watch:** the bailiff's two-way payout (20 to be bought, 25 to end her) pays *both* the greedy and the heroic; if playtests find the greedy route too rewarding, cut the bribe to 12.
- **Play feel.** Three things made the early game slower than it needed to be and were changed: companions now *speak first* (they do not wait to be asked); every clue has a second route; and the dangerous choice is always preceded by a stated warning, with a safe alternative offered.

## 3. Generic balance observations for M20 (not scenario design)

1. **A lone level-1 warrior dies to two level-1 deserters** (two hits of 2 to 4 damage). That is the game's own lethality and is respected here (the warning exists, and so do two other ways to end the bailiff), but it means any authored fight that a lone starter can walk into is a decision about whether the page warns first. *M19-233 again.*
2. **Default encounter experience is generous for trivial fights.** Three rats gave 252 experience until `encounterXp` was set; every authored group without one gets the default. A sweep of the older works' groups for an explicit `encounterXp` would remove an inflation that is invisible until it matters.
3. **The auto-fight is one button.** Three kinds of danger in one scene play as three presses of Attack; tactical difference lives in the prose. The only mitigations authors have today are *alternatives to fighting* (routes, talk, a clock).
4. **Light is a first-hour bottleneck** (M19-170). Six of the new rooms are dark by design; the page does not say a torch is cheap and where it is sold when one first stands in the dark.
5. **A teleport-free test for deep sites is missing.** `test/support/placed.ts` sets a company down inside a room; real travel to a site crosses a random meeting (the deserters' toll on the way to the posting-house).

## 4. What a Phase Two pass should do, in order

*Everything below stays small and independent; none requires touching the opening.*

1. **A person plays it.** The owner or a cold player walks, in the browser, the first town (landing, Hall, shrine, taproom), one tie and one thread in another settlement, and the posting-house. Collect what is dull, what is unclear, what is missed. Fix those before anything else. This is the one step a test cannot do.
2. **Cull before adding.** Of the new content, offer the owner a *list to cut*: any thread, tie shape or trouble that did not make a playtest more interesting. The corpus's strength is density; a thread that reads as filler should go.
3. **Re-read the older plans' objective lines** (the "Nobody has …" tic) and give each work plan three `aim` variants, in the same format as `roadstation.kyrt`. Small, mechanical, immediately visible.
4. **Reconnect one older scenario** (the drover, the den, the fever, or the oldcoin scholar) through the *same* abstractions: a shape table, with both ends. R5 unlocks the oldcoin scholar; the drover can already carry a tie (his lost cattle lead to a site and back to a named town person).
5. **One more storyboard, image first.** Choose an owner's painting that does not yet have a place (the cartographers' guild, the observatory, the mint-house, the glowing crystal) and write the *place* from it using the method in `storyboard.md`. This is the test of whether the method is reusable.
6. **Take R2, R3 and R5** (`kyr-deem-requests.md`) to the main builder as engine requests; they are small and would remove the TypeScript that remains in the first-town layers.

## 5. Guardrails

- Do not integrate any of this into `main` without the M20 builder's agreement; the shared-file list in `handoff.md` is exact.
- Do not add a settlement, a quest engine, a companion system or an approval score. Companions use `willing`, `hire`, `Joins`, `Remarks`, `Leaves`; regard is a plain measure in a template.
- Do not measure success by counts. The census exists to show what is *reachable and discoverable*, not to claim coverage.
- Prefer deleting to adding. A thread that cannot be described in two readings, a room that does nothing to the player's knowledge or position, or a shape that makes a playtest duller should be cut.
