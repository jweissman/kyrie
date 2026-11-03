# Authoring friction: the Scuttled Barge (`bg_`)

Specific, with evidence, in the order I met them.

1. **`teaches` before the full stop is not in the error.** `Observe … "text". teaches x.` fails with
   `Expected "}", "Hazard", "Item", "Company", "Milestone", "Occasion", "Pro…` pointing at `teaches`
   (q_barge.kyr:85). The grammar is `"text" teaches x.` with the stop after; the message names every top-level keyword and
   not the one thing wrong. Say "an Observe's `teaches` goes before its final stop".

2. **`City.start(seed, party)` silently ignores a party array.** `test/support/quittance.ts` types the second argument as
   `Journey.start`'s options (`{ party: [...] }`). I passed an array; the default Elen/Bran/Dori played, and I lost half an
   hour to "Bran makes the persuasion check" in a bard's test. Either take the array or throw on an unknown shape.

3. **The roll cannot be forced, and it moves with the clock.** Every check in a test is a seed lottery, and a different
   earlier step (even a wait) changes the die, so `seed d` that passed a flow fails when a step is added. I wrote a scanning
   driver (a loop over seeds with a probe) three times. A `Journey` option `forceChecks: 'pass'|'fail'` per skill, or a
   `?roll=pass` step, would turn "seed hunting" into assertions about outcomes. At least the die's key should be documented
   (`RandomStreams.key(seed, 'check', skill, maker, about)`), since `about` seems to carry the moment.

4. **Items given by another author's reward cannot be injected in a test.** I tried asserting `ownedItem` and `itemKind`
   through `campaign.commit(world.apply(...))` (private, reached by a cast): the relation is re-projected from the creature
   store and vanishes after the next step (`holding` was true immediately and false after `play`). A relation like
   `teagueCombination` injects fine; an item does not. I ended up wrapping `NodeBundleSource` to replace the stub
   `q_forger.kyr` with a pocket action. That works, but it is a trick. A supported "give this kind to the company" test hook
   (`Journey.give(kind)`) would help every quest that reads another's reward.

5. **A `ladder` between two rooms of one building is flagged.** `warning passage: bg_trap is a ladder but does not change
   level`. A trap in the floor of a taproom to a cellar of the same building is a ladder. I used `crawl`, which reads wrong
   ("Down to the Sluice-tap's cellar" is still the label, so the cost was nil). Either let a room's `underground` count as a
   level change, or accept `ladder` between rooms in one building when one is underground.

6. **A `Role` with an article-bearing head noun reads "an owner of …".** `Role "owner of the Prudent Margaret"` becomes
   "Mistress Honor Veasey, an owner of the Prudent Margaret, is here": she owns the one barge. The guide says a role that
   begins with its own article is said as written; `Role "who owns …"` works but is not in the guide's list of tricks. The
   same for "master of the Salvors' Yard" ("a master").

7. **Dangerous states: `Hurts … when open then open` turns the company back.** `Hurts with bg_foul when open then open.`
   gave "The way is no longer open. You turn back" and 2 damage, and the company stayed at the cradle. Only
   `when open then aired` (a different state after the strike) lets them cross. The guide's example (`loose` then `settled`)
   implies it but does not say "the crossing is lost if the state it returns to is still the dangerous one". A recurring
   danger per crossing seems impossible: I wanted foul air on each pass and modelled it as once ("the first of you down airs
   it").

8. **A blocked way is offered as an Examine.** `To the foot of the diving shaft — look at the bell's hatch › Look closely`.
   `Journey.offers('To the foot of the diving shaft')` is true for a way that is shut. I wrote a `goes(j, label)` helper
   that matches an exact label. `offers` could say "offered to *take*".

9. **Manually asserting `warned`/`halts`/`patience` eats the author's own `Warns`.** My first version of the stealth failure
   asserted `warned(sons, actor)`, `halts` and a `patience`. The page said "Skell's sons stop you. Pip fails the stealth
   check … will wait 7 minutes more" and my `Warns` text never appeared; my `Otherwise` text never appeared either. Retracting
   `tolerates` and putting the band in the room lets `temper_warns` fire with the band's own words, but then the action's
   `Otherwise` is lost behind the warning; I moved the bucket into the `Warns`. Document the one correct way to turn a quiet
   crew hostile mid-action.

10. **A won fight kills.** `Human 1 falls` is `dead`, not `routed`; `Pleads` never fires; `Requires … warned(g, c)` stays
    true after it. My "pay the sons" and "show the licence" actions were still offered over three bodies until I added
    `able(bg_sons)`. A fight against a *Person* ends with `dead(x)`; a guide line on that would help, and `Pleads` should say
    it is for species with refuges only, if it is.

11. **`=day N` is one-based and `day(clock)` is zero-based.** `=day 2 12:10` is `day(clock) == 1`. The guide says "the second
    day" but a rule says `day(clock) >= 2`. Cost me three failing assertions. A `=clock day 2` form would remove the guess.

12. **`Examine`'s `prying`, `pushing` etc. are offered only if something answers them.** `Observe … when tried(bg_crates,
    prying)` compiled and never showed; only "Look closely" was offered. (The guide says every thing can be tried; I found
    only `looking` on a Thing with a single state.) Lint could say "tried(x, prying) is never offered for x". I moved the
    hole in the hull to its own Thing.

13. **Lint's "write-only" advice is wrong for the Hearing's relations.** `bg_gave_up_girl`, `bg_broke_kitty`,
    `bg_bell_wrecked` are written so the Hearing will read them; the advice says "a thread not yet taken up?" until the
    spine lands. Expected, per the brief, but a `Reads by hearing.kyr` annotation would make it silent now.

14. **`test/quittance.test.ts` and its fixture play to `quittance__square`**, a place from the stub. It fails on the current
    base (`is played from the road into the square`). Not mine; flagging it.

15. **Group arithmetic is clumsy.** `Measure bg_ruling(group)` set on `lamprey` is a hack: a quest-local value anchored on an
    office because every measure needs a group. A `Measure bg_ruling()` of no arguments, or on `clock`, would be cleaner.
    Relations of one argument on `party` (`bg_veasey_yielded(party)`) read badly but work.

16. **`Time 18.` instead of `Time 3 hours.`** The guide shows `taking 2 hours` for passages, `Time 2 minutes` and `Time 36`
    (watches) for actions; I did not try `Time 3 hours` and so wrote 18 watches. A comment in the guide would have saved
    the thought.

17. **Journey step regexes bite on punctuation.** `"Pay Skell's sons"` needs `Pay Skell.s sons` or a curly quote; I wrote
    `.` for every apostrophe in labels. The straight/curly normalisation exists, but a `'` inside a JSON/TS string is a
    constant source of "No /…/ at watch N among" with a three-thousand-character list of every pack item. The error message
    should omit the `Pack ›` and `Give to` rows, which are the same in every failure.
