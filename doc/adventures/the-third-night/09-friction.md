# The Third Night: authoring friction

Deliverable 9. What it was like to write a substantial region in Kyr, against Kyrie's engine, Deem, and the
interface, ranked by what it cost. Each item says what happened, what it cost, how it was worked round, and what would
remove it. Two engine fixes were made on the branch, both small and general; everything else was worked round in
the module, so that the branch stays compatible with the main builder's work.

## Engine fixes made on the branch

| Change | Why | File |
|---|---|---|
| Topics are offered only to people who are awake (`able(who) and not asleep(who)`) | Sergeant Gault was answering questions in his sleep on the leads at two in the morning | `src/lang/module-parser.ts` |
| The narrator does not put an article before a kin phrase ("a your mother") | Kinship names ("your mother", "your brother") went through the indefinite article like roles | `src/presentation/narrator.ts` |

## The most expensive

**1. A measure cannot go below nothing, and an effect that would take it there silently makes the whole action or
rule impossible.** `World.admits` refuses any change list whose measure would be negative; the action is simply not
offered, the rule simply never fires, and neither lint nor the page says why. Eight effects in this module did it:
Pinch's carcass ruling lowered the city's temper (which starts at nothing), so the ruling was never offered; Gidley's
purse lowered Kit's trust by ten, so the bargain could never be struck; the butcher's boy telling the riders lowered
the temper, so that rule never fired. Each looked like a missing precondition and took real time to find, by
reading `world.ts`. It is the right behaviour for prices (an action costing three coin should not be offered to a
company with two) and the wrong one for everything else. *Worked round* with `Set … to 0` for betrayals and a
separate guarded rule for a decrease that may not apply. *Would remove it:* a `Lower … by` (or `Decrease … by …
at most`) that clamps at nothing, and a lint warning when a `Decrease` of a non-price measure has no guard.

**2. Ending coverage is invisible.** Endings are first-match, and nothing tells an author that some reachable state
at the verdict satisfies none of them. Partial burial (two of the three over before the river rose) had no ending at
all, and the walks did not happen to reach it; I found it by reasoning about the scholar's arithmetic. *Would remove
it:* a lint that reports, for the predicates the endings read, which combinations the ending list leaves uncovered,
or simply a warning when the last ending is not unconditional.

**3. Reading the game as a player reads it needed a tool I had to write.** Tests prove state; they do not show that
the page says "persons unknown took down the dead" the morning after the whole city carried them. A dozen of the
worst faults (see `08-playtest.md`) were found only by reading transcripts, and making transcripts meant a scratch
script over `Journey`. The one I wrote is on the branch as `test/support/transcript.ts`: it writes the page text under each chosen
label to Markdown, folding waits and quoting what happened during them. *Would remove it:* the same as a
`bin/kyrie transcript` command, beside `play`. (`Journey.page` comes close; it lacks the events of long waits and the
time.)

**4. Prose repeats itself unless every description is written twice.** Each arrival shows the room's observations,
every thing's state text, and a presence line naming everyone, so a place walked through often (the church on the way
to the Acre, the Bridge End) retells itself in full each time, and a person with an observation of their own is
introduced twice. *Worked round* with `visitedBefore` variants for every much-walked place and person, and by cutting
state texts to a clause ("The drawbridge is down."). *Would remove it:* a short form for observations and state
texts (`Again "…"`), and leaving out of the presence line anyone an observation has just described.

## Mid-cost

**5. A rule scoped to a place is not told when the company cannot perceive the place**, even when its condition says
the company is standing in it. The ambush's "Evening," vanished because the counting-house is dark at midnight.
Dropping the scope fixed it; the scope's meaning (perception, not location) is not written down anywhere an author
would look.

**6. `once` topics come back as "Ask … again …", under the same guard.** This is deliberate (M16: topics vanished
once asked), and good, but it means every topic whose subject can expire needs an explicit guard, or the page offers
"Ask Robin Tull again why he will not go home" with Robin at home. The rewrite also only applies to labels matching
"Ask X about/what/where/…", so topics labelled "Tell…" or "Put it to…" vanish once said while "Ask…" ones return: two
behaviours for one keyword.

**7. Farewells and later greetings are not the author's.** `Greets` is said once; afterwards the person greets with
silence. "Take your leave" draws on a fifteen-line table keyed by `Manner` and bond, so choosing a manner for a voice
also chooses a goodbye, and the goodbye may not fit the place: a grim sergeant "has gone back to work" in a tavern; a
widow sitting by her son's body "has gone back to work". *Worked round* by choosing manners for their farewells.
*Would remove it:* `Farewell "…"` and `Again "…"` person fields.

**8. Effects cannot give an item to someone.** A rule can only put an item on the floor where the company is (the
bridge token, Dorcas's penny), after which a bare "Take" appears. Actions can `Resolve acquire`, rules cannot.

**9. Items lying in a room are anyone's, unless `owned by`, and taking an owned-elsewhere item crashes a later
`acquire`.** The pawnbroker's pledges could be picked up from her floor; then paying for them threw "Item already
owned" out of the action. *Worked round* with `owned by pratt`, an objection line, and an `at(item, here)` guard.
*Would remove it:* `acquire` failing as an unmet precondition rather than an exception.

**10. Passages cannot cost anything.** The farthing toll, the satire's centre, is a rule watching for the company on
Bridge Street once a day, not a property of the arch. It works, but it is the most important "door" in the module and
it is not a door.

**11. Placement and the clock.** A placed chapter counts its days from the dawns after the company arrives, but its
hours are the world's. A company arriving at night has a first "day" of four hours, and fixed hours ("at noon on the
third day") arrive sooner or later in world time than in the standalone campaign. That is right, but it meant the
module could not be tested in a world by the same watch numbers as alone, and it is easy to write a module whose
first day assumes daylight. Moving the vale from east to south of the mountain was also needed because two unrelated
generated-world tests (clock shift, seeds b2 and g7) found their own countries changed when a new east neighbour
appeared: countries placed by side interact with existing seeds.

## Small, but often

- Item-kind action labels must name the item parameter (`{cake}`, `{bundle}`), or lint fails; the error is clear.
- Lint flags prose words it thinks are in the wrong register ("flags" for flagstones).
- A role is given an article unless it begins with "the": "Tobias Wren, an Alderman Gidley's ice-man".
- A teaching rule shows its own text and then the discovery's: the two must be written as complements, or the page
  says the same thing twice (the curfew bell rang twice).
- `Retract at(x, ?p)` with `?p` unbound is accepted; since `at` is exclusive it is never needed, but nothing says so.
- A lone thing in a room is offered as "Examine — Look closely", not by its name.
- The test harness's `told` does not include a fight's onset line (the UI does), and names a numbered band's members
  "Human 1", "Human 2" (the UI's `BandNames` does not): a test can pass while the transcript misleads.
- Days turn at six in the morning, not midnight; "the third night" spans two `dayN` values. Every night rule had to
  be written with that in mind, and four were wrong at first.

## Deem and the environment

- Deem itself did not get in the way; the module uses no generation of its own. The repository suite prints Deem
  evaluation warnings from the generative kernel tests (`dragonLineage`, `creatureFamilies`); they are pre-existing
  and unrelated.
- Installing dependencies failed in this container (GitHub tarballs refused with 403). I cloned `deem` and
  `languages` at their pinned commits and pointed `package.json` at them for the install, then restored `package.json`
  and `bun.lock`; neither is committed changed.

## The interface

I could not see the interface directly, only through `ScreenModel` and `ChoiceList`, which is what `Journey` reads.
Two things from there:

- **The choice list suits a city well.** At the Nine Wheels with three members, the page offers a section for Pell
  (talk, a bed, buy, her two topics), "Ways on", and "The company" (wait, search, prepare spells), with each member's
  pack under its own heading. A person-by-person layout is exactly right for a module that is mostly talk. (The
  harness flattens all of this into one list; a test author sees forty "Give to" choices that a player does not.)
- **The page leads with what changed, then repeats the place.** Good for a dungeon; heavy for a city crossed twenty
  times. See item 4.
