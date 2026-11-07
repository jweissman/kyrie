# Friction: the Repertory

Authorability frictions found building and playing `rep_*.kyr` (The Repertory). Each: what happened, what it cost, what I did, what
the engine or tools should do.

## F1. Every `Retract at(?x, ?y)` must be bound by the rule's condition
`Rule X writes ?q, which its condition does not bind` (rp_x2, e4_begin, rp_dawn). A rule that moves a person from "wherever they are"
must state `at(person, ?q)` in its condition, one binding per person. A rule that gathers six people carries six `at(…, ?v)` terms
and silently *does not fire* if any one is `nowhere`. Cost: three lint cycles, and a latent stall (a gathering rule that waits on a
person who was never placed). Wanted: a `Move person to place` effect, or `Retract at(?p, _)` with an anonymous binder.

## F2. An Ending closes the book, so nothing can follow Act V
The brief put the tour after the command performance. Reached through `commandDone`, Act V's Endings end the page; a probe with the
fixture campaign and with the real campaign both showed zero choices. The tour had to be re-gated to `commandOn` and made to *hold*
Act V (`tour_holds`, `commandDay`). Cost: a design change, and a coupling from my files into Act V's measure. Wanted: an Ending flag
`continues`, or a documented "epilogue chapter" mechanism, as `after` in `countries.json` does for generated worlds.

## F3. Clock chains stall unless every incident has a "prevented" twin
Ep 1's day is a chain of incidents (i1 ... i8) each gated on the last, and each skipped by a player action (pledge, pay, hold). Gating the
*effect* by `not pledged(cv)` also gated the *flag*, so a player who did the right thing stalled the day forever; found only by
playing it for seven hours and looking at `HOLDS i8`. Fix: every guarded incident has a `rp_iNp` rule that sets the flag and nothing else.
Wanted: an `Effect when / Otherwise` block on a Rule so one rule can set a flag and conditionally do its work.

## F4. A "counter" rule that requires the player to be absent can stall
`rp_x1h` fired only `when not at(party, hm_rampart)`; a player who arrived and did *not* act left x1c unset and the whole chain waiting. Fixed by dropping the
location from the deadline rule. Wanted: lint for a flag chain whose link is set only by one branch of a condition (`x1c` has two setters, but one needs an absence the player can defeat).

## F5. `Observe ... as sound when` order
The clause order is `Observe id at place as sound when cond "text"`, not `when ... as sound`. Error message is a parse failure at the `as`. Cost: one cycle.
Wanted: the parser should accept either order or name the correct one.

## F6. A kind and a place may share a name, and the error blames the wrong file
I wrote `holding(party, lantern)` in the bog's rule meaning the carried lantern. Act V's `rierdan.kyr` declares `Place lantern "the Wick"`, so
`lantern` is a place in this module and the lint reported the fault at `rierdan.kyr:40` ("Invalid argument lantern in holding(party, lantern)"), a file I never
touched. Cost: twenty minutes to find that my rule, not theirs, was the cause. I used `torch` instead. Wanted: the error should name the declaration that shadows.

## F7. `lord` is a rule parameter in a shared file
My person id `lord` was refused: `'lord' is a parameter of a shared rule at data/rules/inhabitants.kyr:228`. The same applies to any id the shared
rules use as a variable. Wanted: shared rules should use `?`-variables or a reserved prefix, or the refusal should list all reserved ids.

## F8. `stair` passages must change level
`Passage ... is stair between a and b` warns "does not change level"; rooms have no level in the module. Used `path`. Wanted: `stair` should not warn
inside one building unless levels are declared, or levels should be a place attribute.

## F9. `homeOf` is a canonical shared name
I declared `Relation homeOf` and the vocabulary check reported `redefines canonical homeOf`. Renamed `touredFrom`. Wanted: the error should show the canonical signature so one may use it.

## F10. Write-only flags, again
First lint: eighteen `write-only` advisories, every one a real fault of mine: `swaleHand`, `dorcasWants`, `e3Spared`, `tiernanLonely`, `chainTaken`, `houseBarred`, `e4QueenLoves`, `gosseBeside`, `e4Rested` and more. Every troupe question I wrote had its answer
written and never read. The fix was to add a reader (an Observe or a topic) to each; two were dead (`e2Paid`, `sideNone`) and were deleted.
This is the craft checklist's biggest repeated fault, and it is still the commonest. Wanted: a lint *error* for a `Topic ... answering` whose
asserted flag has no reader, and the same at author time in the editor.

## F11. A topic's `Says` cannot depend on a flag
Cross-episode arcs need the *same* question to be answered differently by what was said before (Dorcas playing Iseult as hungry or afraid). A `Says` has no `when`. I wrote two topics with
identical menu labels and complementary `when` conditions (`dorcas_iseult_a/b`, `kit_wood_a/b/c`). It works, but the labels have to be identical by hand and the pair can drift. Wanted: `Says … when cond` variants inside one topic.

## F12. Forced rolls persist
`Journey.roll('pass')` stays forced for every following check until `roll(undefined)`. A spec that wants one pass and then normal dice must reset it; I got a spurious pass in Ep 1. Wanted: `roll('pass', 1)` or a scoped form.

## F13. A territorial creature cannot be fought out of a spec
The pixie was `territorial` with a `Comes`; the first `Search here` at the hollow began a combat the journey harness cannot play ("Transcript ended during combat"). I made her peaceable and put the mischief into a rule. The Lord of the Green stays territorial but his glade is entered only after the Hunt is tolerated (coats or the hautboy).
Wanted: a harness verb for "flee/avoid" and a documented way to give a creature a *warning without a fight* ("Warns" without "Comes" was the only tool).

## F14. Companions who are not in the party cannot be at the site
Swale's actions and topics (`at(swale, site)`) need him in the place; he was in the taproom while the action was at Harrowmere. A rule brings him (`e3_swale`: "fetched in the Chancellor's cart"). Likewise the hautboy had to be played on the lawn because Tam does not come. Wanted: an `Ask X to come along` generic action with a cost, as Act I's Oriel has, usable by any tourer.

## F15. `Wait` is the only way to cross a clock, and rules fire on the next tick
Every specs' "epilogue" counts need an extra `waits(1)` before `repertoire` shows (the rule that counts it runs on the next tick). Specs that read a measure just after an ending are wrong by one hour. Wanted: rules whose condition becomes true in the same turn should run in that turn's closing pass; or an `await settled()` in the harness.

## F16. Labels
`Journey.play` matches substrings, so `Ask Gosse how the rehearsal is going` and `Run the rehearsal yourself` both fire on the first match. A later topic whose label contains an earlier one's text can be played by accident. I found no clash but had to read the choices to know. Wanted: a `playExact`.

## What I left alone
- The other fork's act files (`act1`..`act5`, `rier_*`): I wrote into them nothing. I do *read* `commandOn`, `commandDay`, `holdingCommand`, `chaos` and `repertoire` from Act V, and **write** `commandDay` and `chaos`, which is a coupling the doc names.
- `player.json`/portraits: none added.

## Found by hostile review and by playing a bare route (second pass)

## F17. A bare-route spec finds what a forced-roll spec cannot
The first specs forced `roll('pass')` and walked one path per ending; the reviewer played the *shortest* route and found four episodes with a dominant line that skipped the signature
beat (Ep 1: three moves to "early"; Ep 3: hand the letter over unread = escape; Ep 2: do nothing after a "genuine" report = the quiet ending; Ep 4: pay a name for nothing). Each now has a spec asserting
where its dominant line ends. Wanted: an autoplay probe that plays "the cheapest legal move to each ending" and reports the cheapest path per ending, as `bin/kyrie` does for mazes.

## F18. An ending that is a *meeting* cannot be a *state of knowledge*
Ep 1's reversal depends on the company having reconstructed the day; the engine has `knows(actor, discovery)` and relations but no way to say "the company has understood": the early ending had to
list two discoveries by name, and the discoveries had to be made hard to get (gated on `chainTaken`, i.e. on the day having happened). Wanted: a `Understanding` bundle (several discoveries as one condition).

## F19. A tour that borrows another act's clock couples two files by hand
`commandDay`, `chaos`, `holdingCommand`, `standingR`, `puddingBrave`, `swaleBlurted` are Act V's and Act IV/V-side's names; the Repertory reads or writes them. A change to Act V's clock would break the tour silently
(only the specs notice). Wanted: an `Export` list on a module so a borrower may name what it depends on, and a lint that names the dependents when a measure is renamed.

## F20. A second source of the same credit is invisible to the author
`renown` plus `standingR` credited the same two plays twice; nothing flagged it because both are legal measures. The fix was to delete mine. Wanted: when a rule increases or decreases a measure that a shared mechanism in the same
campaign also moves from the same trigger (`repertoire`), say so.

## F21. A person's id can collide with a rule variable, a shared entity, or a name in another adventure
Four of my names were refused in turn (`lord`, `marsh`, `tarrow`, and the person-name check against `Marsh`/`Tarrow` in two other adventures). The refusals are right, but the error comes one at a time; an author with eight new people
pays eight lint cycles. Wanted: one pass that lists every collision.

## F22. Gating a flag-setting rule on the very condition it reports makes a stall
Repeated from F3 for the second episode that did it (Ep 3's `x1h` deadline, Ep 2's report). The reviewer's lesson: every deadline chain needs a test that plays the *absent* route and the *present-but-passive* route.

## Second review (round 2)

## F23. `says` on an ending rule makes the ending depend on where you stand
`Rule ... at place ... says` fires only with the party present; used on an ending it leaves the state unset when the party is elsewhere (Ep 3's confession and Orlay rules, Ep 4's quarrel). The pattern now: a location-free rule sets the flag, an `Observe at place` tells it. Wanted: lint for a rule that has `at`/`says` and also asserts an ending or `*Done` flag.

## F24. Clock hours need `or` across midnight
Night is `hour >= 21 or hour < 4`, dawn `hour >= 5 and hour < 12`; there is no `between` for a wrapped interval and a rest that jumps over the window misses the beat (the next night comes round). Wanted: `during(clock, 21, 4)`.

## F25. Dice outside a check are not forceable
`dice(clock)` in a rule (the inn's basket) is not touched by `Journey.roll`; a spec can only choose a seed. I probed eight seeds to find one that mixes and one that does not. Wanted: `roll` that sets a die, or a probe verb that lists a rule's outcome by seed.

## F26. A forced pass is still the cheap way to walk a skill gate
I removed the forced passes, found 14 specs failing on luck (a "likely" lore check missed, a fair insight check missed), and for a while put one `roll('pass')` at the head of each helper back. Round 3 took them out again and swept seeds instead; round 4 replaced the staged start with the real road (F33). The checks are still real in play; the specs only walk past them. Wanted: a `Journey.walk(label, {attempts})` that retries a check at its real odds and reports the odds met.

## Third review (round 3)

## F27. A hard-coded roster outlives the story that moved the people
`Initially Assert tourer(...)` listed seven names; two of them (Dorcas, Swale) can be away at the Rotunda or the taproom by an earlier act and were teleported home anyway. The shared `troupe(?p)` relation is the roster; the tour, Ep 3 and Ep 4 now ask it. Wanted: lint when a `Rule` or `Initially` names a person that another file can remove from a shared relation.

## F28. "Fetch once" strands people; "fetch every time" needs a rule per person
Ep 3 and 4 fetched their companions in a `once` rule; going home and returning left them in the taproom. The fix is one rule whose condition is "the party is here and the person is not": it re-fires on every return. There is no way to say "keep these people with the party" without writing the rule.

## F29. A free reroll is the default shape of an action
Every `Resolve` that sets nothing on failure is offered again at no cost; nine actions across four files were free rerolls until each was given a failure latch (`f_*(rierdan)`). The latch has to be written by hand into `Requires` and into `On failure`; I wrote a script to do it (`latch(action, name)`), which is the sort of thing an authoring tool should do. Wanted: `Resolve ... once` (one attempt per company, optionally per actor).

## F30. A hazard cannot warn
`Assert strikes(hazard, party)` is immediate and can kill a first-level character on arrival. A telegraph is a `says` rule that sets a flag, a Measure with the watch, and a second rule two watches later; and a third rule to clear the flag when the party leaves. Wanted: `Hazard ... warns "..." after 2 watches`.

## F31. Moving the whole party is allowed, but has no exits
`Assert at(party, or_larder)` works, and `Passage ... opening when e3Unlocked` can bar the way back; but nothing tells the author that the party is now in a room whose only exits are closed except the rules that are written to open it. Three unlock rules were needed (trust, a seventh night, a spoon) so that no route can leave the company shut in for ever. Wanted: a lint for a room whose every passage has an `opening when`.

## F32. A seed hunt is not a spec
The specs now roll natural dice, and each picks the seed that walked its journey (found by sweeping suffixes). That is honest about luck but not about balance: a "fair" check missed in four of six seeds in several journeys. Wanted: a harness verb that plays a step across N seeds and reports the pass fraction; and the dominant-route probe from F17.

## Fourth review (round 4)

## F33. A real start is cheap once, expensive every time
The specs now begin where the King's Players' unbroken play ends Act IV: Pentrice's own fixture, Acts I-III by labels, the opening night. That is some seventy seconds of play, so it is made once per file (two variants: the heist, and Swale hiding his forgery with the box left alone), checkpointed, and each spec resumes it. Dice are keyed by the state's seed and the clock (`RandomStreams.key(seed, ...)`), so a resumed spec re-keys its luck by editing `save.state.seed`; that is the only seed left to sweep. Wanted: `Journey.fork(tag)` for exactly this.

## F34. Shared measures start where the story left them
`repertoire` is Act V's: the plays of Acts I-IV have already raised it, so a spec that expects a play to be credited must count the difference. Every spec carries `base`. The same is true of `standingR` and `chaos`.

## F35. A clock deadline needs a finer wait than the clock beat
An exploit with a one-hour deadline (`x1h`) can be missed by an hourly wait if it fires at the start of that hour. The specs wait by the watch (`Wait › A while`) near such a beat. Wanted: a `Wait until <condition>` that stops at the first tick the condition holds.

## F36. A flag shared by two acts means two things
Ep 4 asserted Act III's `puddingBrave` for a free -1; Act III also sets `puddingFool`, and Act V fires the brave rule first, erasing the Fool's +1. The Repertory now has its own flag (`pyramusPlayed`) that is set only when the thing it names happened. Wanted: a lint for a relation asserted from two files that no rule reads for both.

## Left open at the scope change (findings, not fixes)

The user closed analysis here: these pieces are good enough for the next iteration to pick up. Fixed from the round-4 brief: 1 (the purse, the turn and the tests gated on `e2Done`; Stroud cleared), 3 (Pudding has his own flag, `pyramusPlayed`), 4 (a delivered letter is spent), 7 (Athens-under-Hollin, no Wend left), 8 (eleven Endings), 10 (Kit is called back to the inn), 11 (the three exploits keyed to the clock), 15 (iron nails and a torch lie on the lawn). Still open:
- **2** `leave_them` is now an hour at the edge of the wood with the lovers (so the Hunt is a real cost) but is still the cheapest credit in Ep 4; a check would be better.
- **5** a failed read is now uncredited (`e3Held`), but the cracked-seal route is still cheaper than the read-then-forge route in time.
- **6** Gosse's lines in Ep 4 were separated (asleep in the night, at the side of the lawn at dawn) but not re-read as a whole page.
- **9** `rp_loom_fan` is now +1 `standingR`; `rp_swale_soft` and `rp_name_roll` are walked by the Act V spec, `rp_pyramus_brave` is not.
- **12** the "heather walks" prophecy has one payoff (the cairns after a murder); Ysenne has one use (a warning that stands for a read).
- **13** Pudding is a juggler in Ep 4; singing is gone, juggling is not established elsewhere in the base.
- **14** tone: "very" removed throughout (a regex; some sentences may be flat), a dozen Greets reworded, the rest keep the "A [adj] [noun] who..." frame; "a little" and "looks up" were not touched.
- **16** every spec resumes a real checkpoint (the unbroken play to the opening night) and walks, but dice are still re-keyed per spec by a swept tag, so each spec depends on a lucky seed. Two specs found no seed in eight tries and are `it.skip`ped: the larder's spoon (`pick_larder_lock`, a hard trapwork check) and the inn's mixed basket (a one-in-three dice roll after a chain of checks). The Pyramus beat is not walked.
