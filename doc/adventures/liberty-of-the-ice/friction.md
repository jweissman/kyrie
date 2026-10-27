# What it cost to say Pellam in Kyr: the friction report

Recorded as met, while writing about 2,300 lines of Kyr (long lines: some 318,000 characters) in twenty-four files (twenty-six, and about 2,700 lines, after the second pass), and playing them. Each finding says what I
wanted, what happened, what I did, and what general change would remove it. Severity: **H** (cost hours, or would
mislead a new author into a wrong world), **M** (cost a work-round I would not want every author to rediscover),
**L** (a papercut). None required changing the engine; I made no engine change.

## Kyr and the shared rules

1. **H — An anchored Event's or Rule's effects happen whether or not the company is there.** `Event purse_lifted at
   freezeland when …` fired at watch 0, while the company was on the North Road, and Ursel lifted its purse from a
   mile away. The guide says an anchor scopes who *hears* a rule's `says`; it does not say, and an author reading
   `Event … at place` naturally assumes, that it also scopes when it *happens*. Work-round: `at(party, freezeland)` in
   the condition of every event meant to happen in front of the company (four). *Change:* lint an `Event … at P` whose
   condition does not mention the company's place and whose effects touch the company; or say it in the guide's
   "Who hears what a rule says".

2. **H — News that should be heard where it is told.** A city's events (the bear loose, the wedding, a raid, a death in
   the stocks) should happen on their own time, and be told to the company when it is in the city, late if it was away.
   Unanchored, they were told on the North Road to a company that had left; anchored, they would be told only in the
   one room. Work-round: every such rule split into an effect-only rule that asserts `happened(ev)` and a second rule
   `when happened(ev) and inPellam() and not heardNews(ev) says …`: nineteen pairs, done by a script. The stale tense
   ("word comes down Freezeland Street at a run") remains for a company that comes back a day later. *Change:* an
   anchor `within settlement-set`, or a `News` declaration: said once, to a company within a set of places, as soon as
   it is; with an optional "late" text.

3. **H — An action whose effects are not admissible is silently not offered.** Harker paying thirty coin
   (`Decrease quantity(harker, gold) by 30`) with no coin made the whole handshake vanish from the page, with every
   requirement true. Found by reading `Operators.applicable` (`world.admits(op.success)`). *Change:* `kyrie lint`
   could check, at the start, whether each action's effects are admissible for its likeliest binding; better, a
   `kyrie why <action-pattern>` that says which requirement or which effect keeps it off the page.

4. **M — The shared belief rules let go of a claim at conviction 0.** `Set conviction(harker, squire_claim) to 0` at
   the moment of the lie retracted the belief on the same pass (`belief.kyr`'s `let_go`), so the next actions (which
   required the belief) were never offered. Correct by the rules' own comment, and invisible from the guide, which does
   not mention belief at all. *Change:* a short guide section on `believes`/`conviction`, written as "a lie told to a
   person", since that is its most obvious use and this is its first.

5. **M — Belief does not travel.** A lie told to Abel, or a truth told on the Liars' Bench in front of Kemble, should be
   carried to Harker by whoever heard it. Kyr has no person-to-person carrying. Work-round: `tattles(p)`, `toldOf(p,
   fact)` and a rule asserting `harkerKnows(fact)` when a tattler is together with Harker or Kemble; and specific
   assertions (`harkerWary`) where the Bench is overheard. It is the survey's G3 and G8, and the right answer is still
   what the survey said: designed once, deliberately, not improvised per adventure.

6. **M — The day turns at dawn, and the small hours belong to the day before.** Obvious once seen; I wrote nine
   conditions for "the second night" as `thirdDay() and hour < 3`, which is the *third* night. Found by reasoning,
   not by a test failing. *Change:* shared queries `nightOf(n)` / `smallHoursOf(n)` for modules that count their own
   days (three adventures now do: Wrayford, Calamy, Pellam).

7. **M — In a world that goes on, a country's own watch begins at the first morning after it is reached.** Correct and
   well-reasoned in `src/campaign` (a country reached at night is not cheated of its first evening's events), but not
   in the guide's placement section, and it means a module that counts days from `dayN = 1` has a "first day" that
   includes the evening of arrival, during which its first day's afternoon events fire at once. Work-round:
   `firstDay()` also requires `watch(clock) >= 0`. *Change:* one sentence in the guide's "Your adventure in a
   generated world".

8. **M — A gift has to be dropped on the floor and taken.** A topic cannot bind the room the company is in (`?p` is
   unbound in `On discuss`), and nothing puts an item directly into a member's hands; so each gift (the wool, the key,
   the counterpart, the coat, the letter) is a topic that asserts a fact plus a rule that moves the item from `limbo` to
   wherever the company is, after which the player must choose "Take". Five rules of the same shape. *Change:* a
   `Resolve give_to(item, actor)` or an `Assert at(item, here)` that binds `here` in topics.

9. **M — An occasion is built by hand again.** The Landing is five cases in watch-windows (`landingStart`, `caseFrom`,
   `caseIs`), each with an opening rule and its actions, and a close: the same machinery as Low Water's Hearing,
   Tessary's Board, Wrayford's Remonstrance and Calamy's Parliament. It works, and the twenty minutes I first gave each
   case were too short for a player to act in; I moved to thirty. *Change:* the survey's G10, an `Occasion` with
   ordered items, each open until something closes it or its time is up.

10. **M — A question put to the player is still a topic that opens topics.** Callow's question ("which of you is bound
    by the hand you gave the Reeve?") is a topic asserting `callowAsks`, and three answer topics gated on it, one also
    on what the company has seen. It reads well; the page cannot show the answers as answers to that question. (G1.)

11. **L — A Role is given an article.** `Role "Master Harker's clerk, thin…"` is shown as "Silas Kemble, a Master
    Harker's clerk". Roles must be indefinite noun phrases that do not repeat the name; not in the guide.

12. **L — A person cannot be seen as someone else until known.** Ursel is "Ursel Cobb" on the page before she has
    said her name. `seen as … until` exists for places only.

13. **L — `Grave` is for actions only.** Every handshake had to be an action (so that the page asks before it is
    done); fine, but a handshake made in conversation would sit better as a topic.

14. **L — `travelling` topics are for companions who `travelsWith`, not for someone who follows.** Callow follows
    (custody, not company), so his topics need "Talk to" first; and a follower is announced in every room ("Magister
    Edrin Callow, a preacher of the Flow, charged with unswearing, is here"), which is noisy over a day's walking.

15. **L — The engine's dark is nine to six in every season.** A winter fair is dusk at four. Prose carries it
    (`lampLit()`, `dusk()`); the light rules do not.

16. **L — Lint's vocabulary check compares relation names across modules.** `kept` and `broken` collided with The
    Patient Star's and Low Water's, though each module's are namespaced. Renamed to `handKept`, `handBroken`.

17. **L — A climb between areas cannot be a ladder** (lint: a ladder must change level); it is a `passage`
    `needing climbing or rope`.

## Tools and tests

18. **M — Routing for journeys is copied per adventure.** `test/support/pellam.ts` has the same `go:room` router as
    `test/support/calamy.ts`, improved to skip ways the company cannot use (`equippedFor`, `visibleTo`), because the
    first version routed a thief down a climb. *Change:* `Journey` could take `go:` itself.

19. **L — Item labels.** An item on the floor is "Take" under "the register of the last Frost Fair: Take"; a fixture
    step "register: Take" does not match (it is not a substring). Steps must quote the item's name as written.

20. **L — A check's die depends on the game's history**, so a fixture written against one seed fails on another where
    a roll goes the other way. Correct and fair (a retry the next night is a real retry); it means persistence tests
    should replay the same seed, and fixtures should take checks with `?` where what follows does not depend on them.

## The environment

21. `bun install` could not fetch the two git dependencies (`deem`, `languages`) as tarballs through this session's
    proxy (403); cloning them by git and copying them into `node_modules` at the pinned commits worked. Not Kyrie's.

## Found in the second pass

Met while deepening the work (the wolves, the paid men, the days as acts, the Book of Frosts, Ursel's confidences),
about 400 more lines of Kyr in two new files and edits to eight.

22. **M — A territorial band that arrives where the company already stands stops the clock.** The wolves come down
    onto the sledge road at ten on the second night. A Ring journey that had sent the hired south on the first night
    and stayed on the sledge road found, at ten the next night, that it had been warned and halted where it stood, and
    the page offered no way to wait (the journey failed: "Nothing to wait by"). That is fair in the fiction (you do not
    wait out four wolves) and a surprise to the author: the band's warning is the shared rules' (`temper_warns`), and
    fires the moment the band is put in the room, before any of the module's own rules can say how it came. Work-round:
    none needed in the fiction; the fixture walks back. *Change:* an arrival text for a band placed into a room the
    company holds (a `Arrives` line, like `Warns`), so that the author knows and says it.
23. **M — What a creature fears must be a capability, and a capability comes only from an item's condition.** `Fears
    flame` drives the wolves off a company that is `capable(…, flame)`, which only a lit torch gives (its condition
    grants light and flame). A brand made in the fiction (a billet lit at the ox fire, a greasy fleece at a brazier) is
    a Kyr measure, and cannot be what they fear; I wrote an action, "Hold the brand up high", beside the `Fears`. Both
    work, so a company with a torch in its pack and one with a brand are both safe, by two mechanisms. *Change:* `Grant
    flame to party for 2 hours` as an effect, or a Kind `granting flame while lit`.
24. **M — An action that puts the company where a band is races the band's warning.** The watermen's sledges take the
    company down onto the sledge road, where the wolves are; the shared warning and my "outrun" rule would both fire
    on the next pass. Work-round: the sledges action itself asserts that the wolves tolerate the company, and a rule
    says how they were outrun. *Change:* none obvious; a note in the guide that an author who moves the company into a
    band's room should settle the band in the same effects.
25. **M — The `within` anchor is undocumented.** On the second pass I found, in `src/lang/module.ts`, that an
    observation can be anchored `within` an area (the compiler accepts it on a rule too; I did not test that): `Observe fog_ice within the_ice …` is seen anywhere on
    the Fair. The guide documents `at` and `near`. I had already written the first pass's weather room by room, and
    nineteen pairs of news rules (friction 2) that a `within` anchor over Pellam's areas might in part have replaced.
    *Change:* one paragraph in "Who hears what a rule says".
26. **M — A day has no opening.** Each of the three days needed an opening (the sky, and what day it is), told once,
    to a company in Pellam, after dawn. Three rules with three `spread` facts; and an area observation for the day's
    weather that must wait on the opening's fact, or it is printed before the day's heading on the pass that turns
    the day. *Change:* a `Day n "…"` or `Chapter` declaration, said once when it begins, for modules that have acts.
27. **L — The test router walked through a barred door.** Asked to go from the foot of Hay Stairs to Hay Wharf, the
    shortest way was through the bondhouse's river door, barred. Fixed in `test/support/pellam.ts` by asking the
    shared rules' `barredFor`. (Friction 18 again: the router should be the session's.)
28. **L — Names collide across adventures, and only a test says so.** The verger was Amos Hobday; Wrayford has a
    Jennet Hobday. `adventure-names.test.ts` found it; `kyrie lint` on the campaign did not. *Change:* the lint could
    run the same check over the repository's adventures.
29. **L — A `once` topic comes back as "again".** "Ask Tansy Hobb about home" was offered afterwards as "Ask Tansy Hobb
    again about home". It is the page's way of letting a player hear a thing twice, and harmless; but `once` does not
    mean what an author reading it would assume, and fixtures that match by substring can take the second offer for
    the first.

## What was easy

Grave as a handshake; `believes`/`conviction` as the life of a lie; `takesPrisoners` for searchers who beat rather
than kill; `opening when not thawed(lisk)` closing every way onto the ice at once; `Seen when knows(viewer, …)` for
the drowned in the hold, who are not there until you know they are; the frontier placing a whole city beyond a march
with seventeen lines of JSON; and the fact that a check rolled the next night is a different roll.
