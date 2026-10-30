# The Lull: friction

What was hard to say in Kyr, what the runtime did that surprised me, and what a reusable improvement would be. Each
item says what was done instead. Nothing here was worked around by changing the engine or a shared catalogue: the
branch touches only the module, its campaign, its tests, `countries.json` (one entry appended) and `web/scenarios.ts`.

## Engine and language

**F1. A module cannot restore the dead, so the Lull's sharpest law cannot be enforced.** *In the Lull you can only be
hurt by somebody who means it*: hired harm heals at sunset. `dead` and `able` are projected from the creatures and are
the engine's (`src/lang/engine-owned.ts`); no rule may write them, and there is no effect for "this creature is whole
again". *Done instead*: the law is lore, history and one staged case. The Old Brock, laid for a bounty, is retired at
sunset and a second creature, "the Old Brock, up again", is put at his sett: two identities standing for one animal.
The wardens' fight on the Working Day holds whatever the company was paid, so the darkly comic option in the design
(a hired guard whose blows do not last) was cut. *Reusable improvement*: an effect, `Restore x` (hit points, conditions,
`dead` cleared), available to rules, for resurrection, regeneration and laws like this one.

**F2. Rules evaluate during a long action, and nothing says the company is in one.** A night slept Lull-fashion is one
action of about a thousand watches. Every rule runs at every watch of it, so a rule meant for a company *awake* at
midnight ("the stars went out") fired during the sleep and its text was told on waking. There is no `busy(actor,
action)` a rule could read. *Done instead*: the Sixnight's first moment is an `Observe … as felt`, shown only at the
place the company first stood in the dark, which a sleeping company never sees; the "you lived through it" news is a
rule that can fire only on the Lull's morning *while the company is in the valley*, and the sleep's own Result
describes the morning. *Reusable improvement*: a relation the engine keeps while an action runs, `performing(actor,
action)`, and `Interrupted when` being joined by `Meanwhile` effects.

**F3. A rule whose condition reads the computed `within` is not re-run when the company moves.** `Rule sixnight_escaped
when … within(party, sixways)` and `Chapter ch_sixways when within(party, sixways)` never fired, though a probe of
`within(party, sixways)` said yes. The tick skips rules whose read relations have not changed (`Reads.names`), and
`within` is not seen to depend on `at`. *Done instead*: `at(party, ?p) and sixwaysRoom(?p)` with a relation asserted
for Sixways' rooms. *Reusable improvement*: make `within` (and `distinct`) count as reading `at` in `Reads`; or lint a
rule whose only spatial read is a computed relation. This is a genuine defect, and silent.

**F4. In a placed country, writing a shared measure from the watch is wrong.** A country installed after the world
began reads its own watch (`src/campaign/clock-shift.ts`), including in `Set lastSlept(actor) to watch(clock)`. The
shared `weariness` rule compares `lastSlept` with the *world's* watch, so in a world the company woke weary at once.
There is no way for a module to read the world's watch. *Done instead*: only differences of watches are written
(`Increase lastSlept(actor) by 1008`; the wait at the stone remembers how long it was in its own measure and adds that).
The Lull's own clock is reckoned from the hour it is reached (`lull_reckons`) and corrected at each midnight that begins
a Lullday, never from an absolute watch. *Reusable improvement*: let ClockShift translate writes to measures declared
by the shared rules, or give modules `now()` for them.

**F5. `Spend` takes a kind, not an item.** "Spend weight_stone from actor" spends one of a *kind*. A ribbon bought of
Nan on the Green and a ribbon bought of her in Sixways were one kind, and the sunset would have taken whichever came
first. *Done instead*: a kind of its own for each thing that must ravel (`lull_lull_ribbon`, `pryce_cloak_kind`,
`keepsake_kind`, `purse_kind`). *Reusable improvement*: `Spend item from group` for a particular item.

**F6. A rule may not write `knows`, and teaches one fact.** Correct as a principle (a rule teaches what it says), but
a Watching often shows two things at once (spite holds; Davy's face on a stone). *Done instead*: one fact per rule, and
an `Observe … teaches` for whoever comes later. Once I wrote ten rules with `Assert knows(party, …)` before the loader
told me; the message is good.

**F7. The engine's farewell lines are not the module's.** "Jenet Hollis has gone back to work before you have turned
round" (she is sitting in a chapel crying); "say the Old Shift, who was not trying to" (eleven people, singular).
`Leaves` is only for companions. *Done instead*: nothing; noted. *Reusable improvement*: `Parts "…"` on any person,
and plural agreement in `data/voice/farewell.json`.

**F8. The lead action is offered as "Ask them to come with you"** in conversation with a man whose pronouns are he.
*Done instead*: nothing.

**F9. The role article.** `Role "of the Old Shift, who is dying"` became "an of the Old Shift". `Role "keeper of the
Waiting Woman"` became "a keeper". Lint does not flag a role that begins with a preposition. *Done instead*: roles
rewritten ("an old weaver of the Old Shift…", "who keeps the Waiting Woman").

**F10. Scenery cannot be looked at closely.** The strikers' beam was scenery and offered no Examine; it is now a Thing.
The guide says so; it is easy to miss when the thing *is* scenery and also the most important object in the place.

**F11. Thing states describe themselves in the place, after the place's own lines.** A broken bridge whose state text
repeated the place's description was told twice; a chair's ravelled state was told before the Watching that ravelled
it. *Done instead*: state texts trimmed; a ravelled thing is moved to limbo.

**F12. A company's size is exact.** `Company party of 1` refuses a campaign with three members ("Choose 1
companions"), so the three-member tests use a copy of the module manifest with its own `company.kyr`
(`test/fixtures/the-lull/three`). Companions still join a company of one (Linnet does).

## World and presentation

**F13. Adding an "independent" country can wall in the first country.** With `"among": "independent"` and `"side":
"east"`, the Lull was chosen as the seed `wren`'s independent country east of a mountain first country; with Merrowdale
north, Pellam west and the Wray south, the first country was walled on all four sides, and `Countries.plan` placed *no
other authored country at all* (eleven vanished). `test/adventure-library.test.ts` ("walls none in") did not catch it
because it plans with the shipped list. *Done instead*: the Lull lies north, with no `among`, after every first ring is
filled; it is planned last and moves no other country (`test/the-lull-placed.test.ts`). *Reusable improvement*: the
planner should refuse a first-ring choice that leaves the first country no generated neighbour, and the library test
should add a dummy independent country to check it.

**F14. The glance shows the first sentence of a place.** In the browser a place shows one observation's first sentence
and a sign; the rest is a touch away. Linger green's first sentence was its houses, and the Long Table (the whole
point) was hidden. *Done instead*: first sentences rewritten to carry the place. Worth a line in the authoring guide.

**F15. Endings close the book of a campaign played alone.** So a return visit to a changed valley can only be played
in a generated world, where the ending closes a chapter. That is correct; it means `after.kyr` is tested only by the
placed test.

## Canon

**F16. Imbar has no week.** The calendar is twelve months of thirty days (`src/campaign/calendar.ts`). The Lull keeps a
sennight of its own, counted at the Fold-stone; "Monday" is the Lull's word for a day that never comes, and Sixways
numbers the other six ("Third", "Fourth"). The Banns at Hessel names weekdays (SATURDAY) without saying where they come
from. Whether the rest of Imbar counts weeks, and in what names, is an open question for whoever keeps the canon; this
module asserts nothing about it beyond the valley.

**F17. Planes.** The Sixnight is not a plane: it is the Lull folded. I did not need one, but noticed that every module
that names Imbar declares its own `Place imbar … is plane`, so "extend the canonical plane" has no canonical plane to
extend.

**F18. Name uniqueness across adventures is enforced, for surnames too.** Bess, Quarles, Marrable, Tallow, Ashby and
Tarrant were all taken. The lint message is clear; the cost is several renamings late in writing. A list of taken names
in the guide would save it.

## What worked very well

- `Passage … opening when …` made a road that exists one day in seven in one line.
- `Time untilLull(clock)`: an action a week long ran in about a tenth of a second, and every other country's clock ran
  with it.
- `unlit` and `asleep`, written by rules, made a whole valley dark and unwakeable, and `talk_to` already refused the
  asleep.
- `Chapter` gave the three Lulldays their headings for free, in the browser and the book.
- `Grave` made the phial, the names and the betrayal ask first, in the player's words.
- Seizing temperament + `captured` made the Hands exactly what the design wanted: a danger you cannot fight.

## On integration (Mission 18, 2026-10-30)

Two names clashed with adventures already in the library and were changed here, the newcomer giving way: the
carver Piran Penhallow (Fair Weather has a Piran Penhallow) is Piran Trewin, and his wife Dorcas Trewin; the kind
`ribbon_kind` (the Parliament of Books has one) is `lull_ribbon`. The generator of names seems to like Penhallow:
this is the third adventure to reach for it.
