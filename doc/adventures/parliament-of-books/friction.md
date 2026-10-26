# Authoring friction: what it cost to say Calamy in Kyr

*Recorded as it was met, while writing ~3,000 lines of Kyr across 22 files and ~1,000 lines of journey tests. Each
entry says what happened, what it cost, what I did, and what would fix it. They are ranked roughly by cost. "Fixed in
the engine" means a narrow change on this branch; the rest are still true.*

## Costly, and silent

1. **A Kind declared in a later file than the one that uses it.** It lints clean and fails at play time, with an
   error about an unknown kind far from the cause. I moved every local `Kind` and `Species` into `kinds.kyr`, listed
   second in `module.json`. **Fix:** gather kinds module-wide before resolving uses, or have lint resolve in source
   order the way play does.

2. **Rules that bind a variable spoke once, not once per binding** (fixed in the engine). The roll call in the
   chamber, `Rule poll_aye … sits(?m) … says "{?m}: aye."`, fired for every member and *told* one of them, because a
   happening's id was the rule's id and the perception layer deduped by id. A Parliament where two members vote is
   not a Parliament. Fixed in `campaign-tick.ts` (happening id is `rule@binding`) and `perceptions.ts` (dedupe on
   the rule part). Probe: `test/fixtures/probes/roll-call`.

3. **Explicit `Temperament` overrides `Peaceable`.** The Awls (Mott's apprentices) were meant to be peaceable by day
   and dangerous on the fourth night. With a temperament declared, they attacked the company at noon on Needle
   Street. Nothing in the guide says which wins. I removed the temperament and wrote custom warn/come rules. **Fix:**
   document the precedence, or make `Peaceable` a state the temperament respects.

4. **A rule that re-asserts its own precondition fires every pass.** The bestiary's beasts were released "at hour 21"
   and came out again on every pass of that hour, stacking. Every nightly event needed a latch relation
   (`outTonight`) cleared at dawn. This is the single most repeated pattern in the module (Rhule's movements, the
   bond, the chain, the ferry). **Fix:** `Rule … once per day`, or `Event … daily at hour h`.

5. **The same for a rule that re-seats a member.** `members_come` re-seated the Lexicon the pass after the priest
   bound it (`not sits(?m)` was true again). Caught only by reading a poll transcript: the order paper said "6 of
   six" after "It does not vote". Fixed with a `silenced` latch. **Fix:** as above; or a lint for rules whose effect
   negates a condition another rule establishes.

6. **`seen as` leaks into entity names used as text.** Once the Imprimatur had an appearance ("a grey building with
   a lamp carved over its door"), the *clause* "that the Imprimatur may burn as it judges" was offered as "Put to the
   Parliament: that a grey building with a lamp carved over its door may burn as it judges". The masking matches a
   place's name inside any label. Funny once; I reworded the clause. **Fix:** mask only references to the place
   entity, not substrings of other entities' names.

7. **Teaching from an observation conditioned on not-knowing** shows only the journal line, not the description,
   because the observation's condition is false by the time it is rendered. Use `when true … teaches`.

8. **Anything a rule says cuts a timed action short.** Harry Coyle's funeral (a rule at ten on the third day, first
   unanchored) was told across the city and cut a search of Corvell's library in Orchard Walk; the search failed and
   the coal hatch was not found, so a whole route to the back stacks silently closed on day 3 for that player. Found
   only because a new reward journey happened to search at ten. Anchored the funeral at the nave. City-wide "word goes
   round" rules (the Pleas abroad, the Awls) still cut timed actions, by design of the engine. **Fix:** let news be
   told at the end of an action instead of cutting it, unless it threatens; or warn when an unanchored rule speaks on
   the clock.

## Costly, but loud

9. **Stairs and ladders must change level.** Every two-storey building needed a `level` place for its upper floor
   (eight of them). Reasonable; but the error names the passage, not the fix.
10. **Background overlays require classes, silently in the design and loudly at start.** "The soldier overlay
   requires the warrior class"; "medic" requires cleric; "minstrel" requires bard. Nance (midwife) became
   `Profession herbalist`; Dickon the balladeer became `Calling bard`. In tests I hunted for an arms background a
   cleric may hold (`warden`). **Fix:** `bin/kyrie backgrounds --craft arms` listing class requirements.
11. **The rule anchor must precede `when`** (`Rule x at place when …`), the opposite of how I wrote it first.
12. **A place named like a person collides** (`quennell`, building and person). Every id is module-global.
13. **`settled` is canonical**; renamed to `decided`. The error does say so.
14. **Lint's vocabulary flagged "sweet flag"** (a real marsh plant) as a flag. Renamed "sweet rush".
15. **No negative grid coordinates**, so a map drawn around a centre had to be shifted.

## Missing, and written around

16. **A Manual** (a permanent quality gift outside the level's development) could not be said at all. Added
    `Resolve endow(member, quality, degree)` and `Measure levelOf(member)` (see [02-adaptation.md](02-adaptation.md));
    the creature store had to be told an endowed raise is allowed (`endowed` allowance on commit), and the attribute
    ceiling for gifts is twenty-five because a level-ten mage already has twenty-one intelligence.
17. **"Carried" companions.** A penny almanack that talks has no body; I used `travelsWith(almanack, party)` without
    enlisting, which makes it a page companion. It works; it is undocumented.
18. **No "for all".** "No member of the company is ready for this book" cannot be said; the Manual's refusal fires
    if *any* member is too junior. In a mixed party the line can be wrong.
19. **No scheduled events by date.** The Court sits at ten on the fourth day; the Ordinance vote is noon on the fifth;
    the Kindling is twenty hundred on the ninth. Each is `day(clock) == d and hour(clock) == h` plus a latch. A
    calendar declaration would read better and lint for collisions.
20. **Endings mid-wait.** A journey that waits past the morning after the Kindling throws "Nothing to wait by" when an
    ending lands inside the wait; every test wraps the last waits in a try.
21. **The Journey driver** matches labels by regex. Good; but a label that changes with knowledge ("a tavern under a
    painted lantern" → "the Lamb and Lantern") breaks steps written before the change. Tests use `go:room` routing
    by passage graph (`test/support/calamy.ts`) instead of exit labels.

22. **A plane had the world's weather and hour** (fixed in the engine). The Commonplace's rooms were `outdoors` (the
    only honest choice among outdoors, indoors, underground), so arriving in the Reading Room might be told it was
    raining, and a walk down the Margin at night "into the dark, by what light there is" in a country lit by readers'
    attention. Added a fourth shelter, `elsewhere`: no weather on arrival, ways told without the light.

## What was easy

Topics with `when` and `once`; discoveries and the journal; the passage graph; `opening when … "text"` for a door
that is a reading; `Resolve check`; per-binding poll rules once fixed; generating the world placement from
`countries.json`; the autoplay laboratory, which found three soft-locks in an afternoon.
