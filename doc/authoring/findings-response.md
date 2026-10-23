# Response to the authorability findings

The ledger of *The House That Grows* (branch `house-that-grows-authoring`, `doc/adventures/house-that-grows/ledger.md`,
revision `199db32`, read but not merged) records 21 findings by an author who wrote a whole adventure in Kyr. This is
what Mission 12 did about each one, with the module that now shows it working (under `test/fixtures/probes`, played by
`test/authorability-probes.test.ts`), and what is still open. The branch itself is not merged; its probes were copied
and rewritten to say what an author can now do.

**Repaired** means the natural expression the author wanted, or one as short, now works and is tested. **Partly**
means some of it works and the rest is named. **Open** means nothing was done; the remedy the ledger proposed stands.

| # | Finding | Status | What an author can do now | Test |
|---|---|---|---|---|
| 1 | Objects and creatures must go into the shared catalogs | Repaired | `Kind dreg_ox "…" is treasure worth 2 weighing 1.` and `Species fen_cat "…" like cat tame.` in the module; installed with it, saved and restored with it | K1 |
| 2 | Nobody can be incapacitated outside a fight | Repaired | `Apply asleep to ally for 1 hour` outside a fight takes and wears off by the clock; the sleeper can only lie as they are; `asleep(x)`, `awake(x)` are facts | K2 ×2 |
| 3 | Nothing weighs anything | Partly | A kind's weight (`weighing -2`) and `mass(kind)` for rules. Nothing yet sums a pack or limits what is carried | K11 |
| 4 | Perception is not a fact rules can read | Repaired | `perceives(watcher, place)`, `alert(x)`, `asleep(x)` in the shared rules | K8 |
| 5 | A passage cannot say how it is crossed, or where it leads, under conditions | Partly | `Passage … opening when P "how it looks shut"`: not offered while shut, its description the reason on the page and map. Conditional ends (`or X when P`) and `needing` a predicate are open | Finding 5 |
| 6 | Companions: hireling or shadow | Repaired | Someone kin and willing is asked along, joins as themselves (`Joins` words, manner, pronouns), keeps their topics, can be led, parted from, or sent home | K7 ×2, `test/recruitment.test.ts` |
| 7 | Ownership ignores whether the owner can see, and who the taker is | Partly | The objection needs the owner (or a servant) to perceive the taking: a sleeping owner does not object. The objection still makes the owner hostile; `Objects "…" then { … }` is open | K8 |
| 8 | One die for the world, and no arithmetic at run time | Repaired | `dice(?thing)` is each thing's own die for the watch; `+`, `-`, `*` between measures and numbers in requirements, comparisons and changes, worked out when read | K5 ×2 |
| 9 | Ten minutes is the smallest act | Repaired | `Time 0.`: the act takes no watch; the world's rules answer it at once (making much of a dog) | `test/voice.test.ts` |
| 10 | Order is meaning, and it is invisible | Partly | The order is written down: [guide §10, "The order things happen in"](guide.md#the-order-things-happen-in). No tool yet shows which rule changed what in a watch | — |
| 11 | The reader merges, misplaces and unnames what the module made distinct | Repaired | Choices are told apart by their command, never by their label; twins that differ are named apart; people and animals carry their own actions | `test/command-contract.test.ts`, `test/ui.test.ts` |
| 12 | Errors at run time, or with no place | Repaired for declarations | Declaration errors say file, line and column; `for 1 hour` no longer fails at run time. Errors inside a rule's effects at run time still say the rule, not the line | K12 |
| 13 | A species' temper overrides `Peaceable` | Repaired | A peaceable person of a fierce kind keeps the peace; `tame` animals greet and can be made much of | K9 |
| 14 | People and things are fixed at load | Open | Roles do not change with state; topics are not scoped to places; there is no stock of many items or making of new ones. Remedies as the ledger proposes | — |
| 15 | A phenomenon that travels with an object needs an observation per object | Open | `Observe … near X` follows one entity wherever it is; an observation anchored by a variable (`near ?l when lit(?l)`) is not supported | — |
| 16 | A law cannot be shared between modules | Repaired | `"rules": ["world", "../law/law.kyr"]` in a module's manifest | K10 |
| 17 | A person cannot be hidden, or seen only by some | Open | `Person … seen when P` is not supported | — |
| 18 | Smaller gaps | Partly | The guide now covers kinds, species, conditions, perception, dice, `Time 0`, arithmetic, conditional ways, companions, shared laws and rule order (§10). A catalog kind named before anything instantiates it, granting a local skill, and the playable `commoner` are open | — |
| 19 | Nobody ever needs to sleep | Open | Sleep is a condition and a choice (sleep until morning, the lullaby), not a need; fatigue on the pattern of hunger is not written | — |
| 20 | Workflow: stale siblings, stale docs, a TypeScript registry | Partly | The README no longer sends players to the retired Serewater March. Publishing an authored campaign on the title page still means editing `web/scenarios.ts` | — |
| 21 | Minor friction | Partly | State names that collide with shared names are reported with both places. Clause order, negative grid cells, ladders and `together` for things are unchanged | — |

## What the author wrote by hand, and what is written now

The ledger's benchmarks, written again with what Kyr now has:

| Benchmark | Before (the branch) | Now |
|---|---|---|
| A door that opens only at night | A blocking thing on the door, three bespoke movement actions repeating `go`'s preconditions, a fact per door | One clause: `opening when dark() "…"` |
| A brother who comes along | A hireling with a wage, or a shadow with no voice | `kin(party, brother)` and `willing(brother, party)`; he joins in his own words |
| A dog that can be patted | Prose about a dog; no dog | `Person fly "Fly" at yard { Species dog. }`: tame, greets, made much of |
| Someone asleep for an hour | Not expressible outside a fight; a crash at run time | `Apply asleep to ally for 1 hour` |
| A thing that weighs less than nothing | Not expressible | `Kind selm_stone "…" is treasure worth 12 weighing -2.` |
| A fare that doubles | Not expressible without a measure per step | `Set fare(actor) to fare(actor) * 2 - 1.` |

## Still open, in order of what it would give an author

1. People and things that change at run time (14): roles by state, topics by place, stock and making.
2. Who can see whom (17), and observations by variable (15): needed for any adventure about attention.
3. Conditional ends of a way, and `needing` a predicate (5).
4. Fatigue as a need (19), and carrying by weight (3).
5. A trace of which rule changed what, in a watch (10).
