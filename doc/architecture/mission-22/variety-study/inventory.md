# Variety study, appendix: what varies, counted

Supporting tables for [report.md](report.md). Read from the worktree at branch m22 (current with main at 275f15f8),
18 November 2026. Every count is from the files named; nothing was changed.

## A. The generation templates: groups and their options

A `.kyrt` section is `--- group` (always written) or `--- group option [weight] [if|unless value]` (one option of the
group drawn per place; `src/world/kyr-template.ts:4-43`). Counted by parsing the section headers.

| template | groups (options) | what an option changes |
|---|---|---|
| town/undertown.kyrt | base, **store[rats]**, **yard[dead]**, **pit[spiders]**, below, vault | nothing: each trouble group has one option, so every generated first town has the same three jobs |
| town/neighbours.kyrt | base, isaure[road/plain], anselm[road/plain], friction | whether a posting-house exists; the cast (Isaure Venn, Brother Anselm Tarr, Hesper Lowe) is fixed by name |
| town/outskirts.kyrt | base, dome[wisps, quiet] | a creature or none at the dome |
| town/outskirts-deep.kyrt | base, tam[voice, fall, silence], quarrel[oak, herd], under[revenant, bats, quiet], road, keeper | tam: one line of Wimble's; quarrel: one sign line (the road-wood quarrel and its Imperial-grant resolution do not vary); under: which creature, or none |
| town/troubles.kyrt | base, pilgrim[road/tree], thief[hesper, traveller], animals[vixen, tune] | thief: **who the culprit is** (the one causal variation in the first town) |
| town/threads.kyrt | thread[coin, credential, letters, chronicles, veteran, preacher, plaque, levy] | which loose thread; each is a fact, not a situation |
| town/ties.kyrt | base, shape[kin, debt, custom] | a settlement's tie to its nearest wild place: a relationship type |
| town/conflict.kyrt | base, seal[road/plain] | posting-house or not; the forged-seal bailiff is fixed |
| town/teachers.kyrt, bond.kyrt, errands.kyrt | all always-written | none (errands vary by who the resident is, in `src/world/community/community-writer.ts`) |
| works/abbey, keep, tollhouse | fall[plague, winter, heirs, raiders] (by history), present[3], hook[2] | **why it fell** (history), who is there now, what draws you |
| works/barrow, cistern, watchtower, roadstation | shape[3], successors[3–4], present[2–6], hook[2], master/last (roadstation) | form, **who came after**, inhabitant, lure |
| works/great_* | end[2] (by fate) | how the great work ended |
| wild/meetings, roving | per terrain 1–4 options | a meeting on the road |

Reading: the works carry the corpus's best structural variation (a history with a cause of fall and successors). The
first town, which every generated world begins in, varies almost only in surface: one causal option (the thief), one
relationship option (ties), and creatures-or-none.

## B. The situation corpus by dramatic shape

Shape = what kind of problem it is, as the player meets it. "Causes" = alternative underlying explanations the module
can hold. "Clock" = rules on `watch(clock)` that change the problem without the player (counted by
`grep "Rule .*watch(clock)"`). O/T/A = Objectives, Topics, Actions.

| module | shape | causes | clock rules | O/T/A |
|---|---|---|---|---|
| undertown store (rats) | creature in a locked place, paid by the merchant | 1 | 0 (ratsbane's night only) | – |
| undertown yard (dead) | creature + raiser, paid by the priest | 1 | 0 | – |
| undertown pit (spiders) | creature in a locked place, paid by the innkeeper | 1 | 0 | – |
| situations/den (×2 instances) | creature lair + hoard (+ leader, marvel by Deem) | 1 | 0 | 2/0/6 |
| situations/brood-hollow | creature lair, with a keep-the-peace option | 1 | 1 | 5/9/1 |
| situations/unquiet-tower | creature + raiser, several approaches | 1 | 0 | 4/12/1 |
| situations/caught-below | rescue from a fallen weight | 1 | 0 | 3/8/6 |
| goings-on/drover | a man missing on the road | Deem-cast | 1 | 4/18/4 |
| goings-on/fever | a shortage (herbs) against a clock | 1 | 4 | 4/9/1 |
| goings-on/oldcoin | an escort for a stranger | 1 | 0 | 2/6/0 |
| goings-on/quarrel | a boundary dispute between neighbours | 1 | 0 | 2/6/1 |
| goings-on/disputation | a public contest of argument | 1 | 0 | 2/3/12 |
| situations/fellowship | an institution's silent branch | **4** (proud, sold, lapsed, fallen), each with its own cure | 0 | 1/16/10 |
| goings-on/iscoed-drove | a false charge held by an authority | 1 (fraud) | 1 (sent north at 576) | 4/5/4 |
| goings-on/iscoed-pans | a delayed delivery against a deadline | 1 (boatman's broken arm) | 1 | 4/2/4 |
| goings-on/iscoed-gate | a failing machine; hidden sabotage | 1 (pin sawn) | 1 | 9/5/3 |
| kits raider-hold | a band in a hold, raiding | folk[hobs, outlaws] × hold[ringfort, cave] | – | – |
| kits toll-road | a band on a road | keepers[deserters, customs] | – | – |

Of the eleven placements a generated first hour most often meets (three undertown jobs, two dens, the adventure-round
draws, the works' `present`), all but rescue are "a creature at a place". Of the whole corpus, one module (the
fellowship) holds more than one cause. Thirteen of eighteen have no development on the clock.

## C. The first town's job grammar

All three undertown jobs (`data/generation/town/undertown.kyrt:133-455`) follow one sequence, with the same three stock
roles in the same places every world:

1. a line on the notice by the well (`>>` lines, gathered by `RegionUndertown.notice`);
2. ask a stock role (the merchant for the rats, the priest for the dead, the innkeeper for the spiders);
3. be given a key to a locked way down (corn_store_key, crypt_key, quarry_key);
4. a first fight, then a deeper one (rats then the buck rat; the dead then the raiser; spiders then their mother);
5. a hoard found by searching;
6. report for coin and two items, and the payer is `grateful`.

Approaches differ by capability at step 4 (ratsbane, Sleep, a firebomb, picking the lock; the rite of rest, creeping
round to pinch out the candle, talking the raiser down), which is good. Steps 1–3 and 5–6 do not vary at all, and the
consequence of step 4 is the same whichever approach was taken, except for two remembered remarks (ratsbane smelt, a
door docked: `undertown.kyrt:214-224`).

## D. The tiny proof's output

`/var/tmp/kyrie/variety-scratch/shape-proof.ts` (run from the worktree; one bun process, under a second). It
uses the existing `Ledger`, `Composer`, `Binder` and `Proposer` unchanged. The vocabulary is widened only in the
script, by twelve social relations. Three hand-made worlds; two kits written as the owner's two questions.

```text
world A seed s1: merchant_at_risk: {"merchant":"nest","from":"porthalen","to":"reedbridge","goods":"salt","power":"mardle"} {"trouble":"seizure"} | disputed_possession: {"thing":"ridgewood","a":"holgar","b":"fenn","town":"porthalen","judge":"reeve"} {"cause":"third_holder"} | world facts kept: true, added 4
world A seed s2: ... {"trouble":"seizure"} | ... {"cause":"two_grants"} | world facts kept: true, added 4
world B seed s1: merchant_at_risk: {..., "power":"reeve","rival":"auron"} {"trouble":"sabotage"} | disputed_possession: refused (nothing can be thing: no place is prior(?a, ?thing)) | world facts kept: true, added 2
world C seed s1: merchant_at_risk: refused (nothing can be power: every candidate fails a requirement) | disputed_possession: refused (...) | world facts kept: true, added 0
world C seed s3: merchant_at_risk: refused (nothing can be goods: every candidate fails a requirement) | ...
```

What it shows:
- **The matching machinery exists.** Given the facts, "a merchant between two settlements, with something valuable,
  in conflict with an authority" binds by ordinary Kyr predicates, with backtracking.
- **Deem's cause must agree with the world.** In world A the merchant is in Mardle's debt, so only `seizure` can be
  accepted (`_requires: inDebtTo`). In world B he has quarrelled with the reeve and has a rival, so `impound` or
  `sabotage` can be; `sabotage` brings its own participant by `_implies`.
- **Refusal, never rewriting.** Where no such merchant exists, the kit is refused with a reason, and no world fact is
  changed (`world facts kept: true`).

What it found:
- **The facts are not there.** The real vocabulary (`data/assembly/vocabulary.kyr`) has no people, possessions, debts
  or claims; `Geography.read` reads places and ways only. In a real world both kits would be refused at their first slot.
- **Kyr predicates cannot say two variables differ.** `?a != ?b` and `not ?a = ?b` do not parse
  (`ModuleParser.predicate`). Distinctness had to be carried by a fact (`prior` against `claims`).
- **Refusal reasons are partly misleading.** The binder says "no place is …" for a slot that is not a place, and after
  backtracking it reports the deepest failure (world C: "goods" on one seed, "power" on another).
- The authority's seat is not required to be on the merchant's route unless the author says so (world B binds the
  reeve of Gatesend to a Porthalen–Reedbridge carrier). Constraints are as good as the author writes them.
