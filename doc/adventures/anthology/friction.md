# Friction met writing and re-writing the anthology

*7 November 2026. In the order met; each says what happened, what was done, and what the engine could do.*

1. **A warned creature outruns any bargain with a duration.** Laying ratsbane (Time 3, then 1) in a room whose rats had warned started the fight before the poison was down. *Done:* every bargain is `Time 0`. *Could:* a bargain that spends the warning's patience by its cost only, or `Warns` that names its minutes.
2. **Guards were toothless until a Person had a blocking `State` and `Guards`.** The toll walked past. *Done:* state+Guards on each obstacle; the engine's own "slip past" stealth is then the free alternative (this was wrong to leave; see 19). *Could:* say so in the guide beside the toll example.
3. **Stale blocking text.** The owlbear's "does not intend to be passed" and the slump's "wall between you and the Cap" still read after the creature is placated. *Could:* a Person's `State` conditioned on `tolerates`. (Done in Tallow by dropping the State: see 27.)
4. **A bare "Take" can kill.** Bell-teeth beside the custodians cost a party in the playtest. *Done:* moved. *Could:* items in a warned room flagged in the Take label ("the custodians will not wait").
5. **Lantern and oil in different packs are dead weight**; buying splits purchases across the company arbitrarily. Torches (an hour) and a torch lit above ground are wasted. *Could:* fill from any member's oil; light only in the dark.
6. **No coin or price display** on the page; the playtester bought blind. 
7. **A Thing's first state is not always initial** for scenery without a `Change`: `Initially Assert state(...)` was needed (the crate read `hatched` at start).
8. **A rule with no `at(party, …)` in its condition fires everywhere** though its `says` is anchored: the `aboard` rule marked the voyage made at the topic, not the landing, and the party was brought home at once. Lint advice exists but is advice only.
9. **A rule cannot teach** (`Assert knows`); an `Observe … teaches` must carry the knowledge, and a rule's `says` repeats it.
10. **Timing in tests:** `=day N` clamps oddly across a voyage; named times (`=05:10`) are safer. Waiting across 22:00 fires night rules (the eggs hatched while a test jumped two days).
11. **`following` people are not `at` anywhere**, so tests asserting where the Colonel is must ask `following`.
12. **Name uniqueness is corpus-wide** (Wick, Rook, Marl, Hale, Breach all collided). Reserved words (`service`, `watch`, `shut`, `closed`, `fallen`, `turned`, `crate`, `losses`) are found only by loading.
13. **Plant kinds**: a plant yielding its own name is `<plant>_gathered` unless a consumable of that name exists (foxglove, feverwort, kingsfoil). Found by trial.
14. **Weather is not readable by a province or a standing scenario**; each rolled its own sky (circus friction 29 stands).
15. **A region inside a standing scenario works** (the Isle of Sarn within the circus module) and is the way to put circus people on an island; recorded because nothing says it is allowed.
16. **No ports in generated countries**, so the voyage is a ferry from a green.
17. **Pre-existing failures** met: `frontier.test.ts` (duplicate entity `w8_halls_stair_foot_stone0`), and the handbook's "4 problems".
18. **Death** left a blank choice list with no text; the engine now ends the run with "The fight is lost" and an empty list, and Tallow authors no ending page for it.

## The second pass: what changed, and why
- **Theme made explicit and shared:** *keeping after the reason has gone* (custodians winding, a legion capping, a rearguard waiting for an order, wardens' cages swept, a Keeper who never asked what a Keeper was). Tallow got chapters, a tick under the village pipe from the first day (foreshadowing the Bore), the fourteen names (Dunstan, Joss's father) and a no-roll way to lay the ghouls; the Muster got its General's letters taught ("he did not send") and a milestone counting down in the first village; Sarn got the Leg's truth (a calf buried breathing), Jabez's Warden-line, the tortoise and Ada's column as foreshadowing, and the Colonel's widow letter on the cliff-top.
- **Left undone:** no independent playtest of Muster or Sarn; Harrow, the tar-pit, the tyrant and the cliffs are still unspecced; combat is chosen and untested.

## The fourth pass: Tallow Deep's hostile review (7 November), engine limits met precisely

19. **`slip_past` is free, unlimited and unrolled** (`data/rules/passages.kyr:96-107`). Any Person with `Guards` and a blocking `State` can be walked past by a company with `capable(actor, stealth)`: `Time travelTime(way)` only, no check, no cost, no damage, and the watcher stays. Ten of ten seeds passed every guard in Tallow. *Done in Tallow (no engine edit):* a guarded way is not a `Guards` Person; it is `Passage … opening when <guard dead, gone or tolerates>`, which makes it `unopened`, and so `barred`, which the slip rule requires not. The Tallymen's bar is a `Thing … on adit_drift from adit` (barred only for a company at the bend, so nobody inside is kept from leaving) with two rules to lift and lower it. *Cost:* the guarded-Person conveniences go with it (Attack from the room before, the Person's own State text). Tallow has no stealth way past anything; the stealthy character lost an option rather than gaining a priced one. *Could (not made):* `slip_past` should `Resolve check(actor, stealth, …)` and, on failure, retract `tolerates` and set the guard on the company; or a `Guards … alert.` flag so that an author can say a watcher cannot be slipped.
20. **A way that opens on an action's kill stays shut until a tick.** `opening when not able(ghouls)` is read once the rules of the moment have run, but `Slay` inside an `Action` reaches `able`/`dead` only on the next tick: after "Read the fourteen names" the way past the ghouls was not offered until the company waited. A real fight, and a fact the action itself asserts, open it at once. *Done:* the clause also tests `laid(party)`, which the action asserts. *Could:* run the upkeep after the creature-state sync.
21. **A Topic's effect cannot retract `at(x, ?p)` unless its `when` binds `?p`, and a `when` that binds it hid the topic.** Sib "went" with `Retract at(sib, tally_room)`, true only in one room, and rules run on a tick, not after a Time-0 topic: she was offered, and heard in the dark, in the Settling. *Done:* `Seen when not sibGone(party)` on the Person, which hides her from every choice and line at once (it works, and nothing documents it for this); a rule clears her `at` on the next tick. *Could:* `Retract at(x, ?)` that retracts wherever, or `Leaves` callable from a topic's effects.
22. **A Hurts-with Thing on a passage is a one-use crossing** (`Hurts with H when s then t`), so `risk` is offered once per state change; the label is built from the passage and the Thing ("To the sump of the Blind Shaft — risk the Blind Shaft's cage › Bran goes first"). With `then` equal to `when` it is a risk on every crossing (the flooded causeway). Neither takes a `Result`. A blocking Thing's `then` state bars the way for good, which is how the cage is spent.
23. **`Set measure to watch(clock) + N` in an action's effects is read at the action's start, not its end.** The blankets' "two hours" had counted from before the six watches of binding them on, leaving one hour; `+18` is a Time-6 action's two hours.
24. **Two Persons in one room are two fights.** The stalkers were two Persons with their own warnings, met one after the other with the company rested between; `Attack` targets one. A band is one Person with `Numbers`. And `Level` barely moves a species whose challenge is flat (data/catalog/challenge.json: hollow-stalker 1 at its first level and 1 at its fifth; a clockwork soldier 8 at its first): the pack, not the level, is what weighs.
25. **`hungry` is set and read by nothing** (`data/rules/needs.kyr`; only the narrator tells "You are hungry"): Tallow waited 1060 watches with no rations and lost nothing. *Done:* a Tallow rule asserts a `strikes(hunger_bite, party)` every half-day while `hungry(party)`. *Could:* a shared starvation rule, or `hungry` read by the fight's weariness.
26. **The shared "ask to let you by" and "warn off" remain at every guard that warns** (an even chance and an unlikely one, one try each): they are checked and cost a fight on failure, so they were left, but they are a way past a toll, an owlbear and a ghoul pack that the module did not write.
27. **A placated Person is still described as it was** unless its words are conditioned; a Person's `State` text is room text, shown wherever it stands. Dropping the State (and the Guards) and telling the way's shut text through `opening when … "text"` removes it; a placated Person gets an Observe `when tolerates(x, party)`.
28. **`bun run lint` (eslint) over the repository fails on files that are not Tallow's** (`test/skerrow.test.ts`, `test/wrongboat.test.ts` and others, line lengths and the 160-line function limit), as it did before this pass; `test/tallow.test.ts` and `scripts/tallow-fights.ts` are clean.

---

# Index: the authorability findings of the whole anthology

*Written when the review rounds were spun down (7 November 2026). The numbered items above are the first four passes; each adventure keeps its own list, named below with the numbers cited here. This section groups them by what an author or the engine could do, so the next iteration can pick them off in order of value.*

## Where each adventure's findings live
| Adventure | File | Page |
|---|---|---|
| I. Tallow Deep (and the first passes) | this file, items 1–28 | `tallow-deep.md` |
| II. The Long Muster's Road | `friction-muster.md` | `the-long-muster.md` |
| III. Wapshott's Fourth Act (Isle of Sarn) | `friction-sarn.md` | `the-fourth-act.md` |
| IV. The King's Players | `friction-players.md` | `the-kings-players.md` |
| V. The Repertory | `friction-repertory.md` (F-numbers) | `the-repertory.md` |
| VI. The Wrong Boat | `friction-wrongboat.md` | `the-wrong-boat.md` |
| VII. Skerrow | `friction-skerrow.md` | `skerrow.md` |
| VIII. Three Nights at Sallowfield | `friction-sallowfield.md` | `sallowfield.md` |

## A. Free actions and the cost of a failed check (the commonest design fault)
An `Action` with a `Resolve check` and `Time 0` (or a cheap `Time`) is offered again after it fails, so every such check is a free reroll unless the author builds a latch (`Relation tried`) or a price. The same holds of a Topic that is `once` (it has no retry) versus an Action (unlimited retry): Muster 22, Skerrow 37, Sallowfield 42, Wrong Boat (rounds 3–5). *Done:* latches and costs by hand in every adventure. *Engine could:* a `Resolve … once` or `tries N` clause; a lint that flags a `Time 0` check with no failure effect; showing "one try" in the label automatically (the label today says only the odds).
The engine's own `slip_past` (passages.kyr:96–107) is the same fault at scale: free, unrolled, unlimited, and the guard stays put (Tallow 19). *Engine could:* roll stealth and turn the guard on the company on failure.

## B. Rules that speak, and where
A `Rule` whose condition lacks a literal `at(party, X)` fires, and its `says` is told, wherever the party is; `at <area>` on a rule's `says` makes it silent; `Observe … near X as sound` hears only where X is; a sound is told on the step that ends while it holds (Skerrow 7, 25, 33, 34, 36, 43; Sarn 2; Players 2, 6; Sallowfield 3; Muster 33). *Done:* `Observe … within <area> as sound` for sounds, a literal anchor in every rule. *Engine could:* a lint that errors (not advises) on an unanchored `says`; `says … to <place>`.
Narration for a party that is elsewhere does not exist (Sallowfield 3, 4): fates and battles are told when the party is present, or as reported speech.

## C. Time and waiting
A wait is one atomic step; it does not stop at a warning, a sound or a change in the room; `=until` and `=+N` are the only precise tools (Skerrow 20, 27, 39, 45; Sallowfield 8, 19, 32; Wrong Boat 16; Players 1, 16). A hunter or hazard keyed to a narrow clock window is fragile (Muster 27); a die in a rule (`dice(clock)`) is a different die every watch (Muster 16). *Engine could:* wait-until-event-or-N; a rule-level `once per N`.

## D. Pursuit and groups
`Pursuit` works, but a pursuer re-plans only when it arrives, so a party that is "nowhere" (travelling) is never intercepted and a long hop commits for the whole hop (Wrong Boat 2, 3, 19, 22, 23, 25; Sallowfield 33, 37, 44). A hostile group that retreats to a `Refuge` becomes a wall for anyone who later walks through it (Sallowfield 44). *Done:* scripted rules (a carrier's cart, peaceable "takers"). *Engine could:* pursuit that re-plans each watch, and a way to say "intercept the party's route".

## E. State that outlives its cause
A Person's `State` text, a `Guards` line or a warning ("will wait ten minutes more") is shown after the creature is placated, the toll met or the person gone (Tallow 3, 27; Muster 36; Skerrow 14, 33; Wrong Boat 4). A topic cannot retract `at(x, ?p)` unless its `when` binds `?p`, and rules run on the next tick, not after a Time-0 topic (Tallow 21; Wrong Boat 7, 27). `following` people are not `at` anywhere (Tallow 11; Skerrow 10). *Done:* `Seen when` on the Person; explicit `Retract warned`. *Engine could:* conditioned `State`; `Retract at(x, _)`; the patience line read from live state.

## F. Companions and parties
A hired companion is a party member from that hour: `dead(x)` and `able(x)` apply; a party of one dies to a hazard meant for a company (Sarn 3; Sallowfield 28; Players 5). A companion who carries things takes them when she goes (Muster 25). Hiring is limited by the purse, not a cap (Muster 37, 29). The test party is often one character, which is why survival clocks kill it first. *Engine could:* a hazard that scales with party size; an explicit "company" query.

## G. Spec authorability
The Journey API steps by page labels and is the right tool, but: `j.put/assert/give` makes specs that teleport and hide the path (Players 14; Sarn 20); a forced roll hides what the dice would do (Repertory F26–F31); seeded dice are the only way to spec a die (Wrong Boat 28); an ending that fires on arrival eats the beats at that place (Muster 31); `Journey.at` cannot see a group moved by a pursuit (Sallowfield 33); a spec cannot read an ending's title from the page (Skerrow 13; Wrong Boat 10); a worktree agent's shell refuses compound commands (several). *Engine/tooling could:* `Journey.endings()`, `j.until(cond)`, group positions, and a `--seed-sweep` helper that reports pass-rate per route (several reviews hand-rolled one).

## H. Names, words and lint
Names are unique across the whole corpus, reserved words are found only by loading (`service`, `watch`, `shut`, `closed`, `fallen`, `turned`, `crate`, `losses`), canonical words collide silently, and first names recur across adventures even when the surname test passes (first pass 12; Muster 4, 18; Sallowfield 9, 11; Wrong Boat 8, 9). Lint advice (write-only flags, unanchored `says`) is advice only, and a Relation set only from a Topic can trip the write-only advice (Sallowfield 20). *Engine could:* a `bin/kyrie names --free <prefix>` and a reserved-word list in the guide.

## I. Where the engine shaped the fiction
Several finished pieces are what they are because of an engine limit, and are recorded as such rather than as faults of the writing:
- *Tallow has no stealth way past anything* (A): the stealthy character lost an option rather than gaining a priced one.
- *Sallowfield is a comparison, not a sequence* (Sallowfield 2): a battle is a sum of post strengths against thrusts, decided at the clash, because nothing can narrate to an absent party.
- *Wrong Boat's pursuit is partly scripted* (D): the chaser is a carrier's cart on a clock.
- *Skerrow's night is a lamp-state machine* (C): the thing is a Person who moves by rules, with sound Observes; "hiding" is an exposed-rooms query.
- *The repertory tour is a gather rule over `troupe(?p)`* (F), because hard-coded rosters broke when members left.

## J. Still open when the rounds were spun down
Recorded in each adventure's own file under "not done"; the headline items are: Fourth Act's pack-each-night and played journeys for the remaining endings; King's Players' Act V as a counter and the remaining staged specs; the Repertory's staged `heistOver` and luckily-seeded specs; Wrong Boat's "kindest route is cheapest" and time-gated pursuit; Skerrow's harsh unforced romance odds; Muster's lore-only flags and shared NPC cadence; Sallowfield's unmeasured flood and the "even chance" label on the farm fight; Tallow's missing stealth and unspecced collar/report beats. None is a known bug that blocks play; each has been played end to end by a hostile reviewer or a spec.
