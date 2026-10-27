# Gosse's Company — authoring friction

*What it was like to write a comedy of manners, a mystery and a public performance in Kyr, and to make it perform in
the generated world's own towns. What the engine needed and was given (three general changes), what was worked round
in the adventure, and what is still in the way. Severity: **high** means it produced wrong behaviour in play that the
tests did not catch until a journey or the full suite was run; **medium** means it cost a rewrite; **low** means it
cost time.*

## Changed in the engine

### 1. Heralds: a country that sends word ahead into a generated town (general; high value)

**Need.** The commission's centre: the adventure should be met in the generated world's own towns, not only beyond a
march. The placement contract already let a country lie beyond a march and let a going-on be set in a generated town;
nothing joined the two. Goings-on were drawn at random, so the players might be in a town with no road west, or the
road west might lead to a world with no Pentrice; and the country, installed only when its march is crossed, could not
know what the company had done in the town.

**Change.** A country in `countries.json` may name a `herald: { scenario, exports }`. `Countries.heralds()` finds the
countries a world holds that have one; the world assembler places each herald's scenario before the random rounds;
a new settlement need, `toward:<side>`, puts it in the town the side's road leaves from (`scenario-towns.ts`); and the
frontier, installing the country, binds the herald's exports to the country's optional imports of the same name
(`frontier.ts`). Without a herald the imports are the country's own unknown facts, and the country plays from the road.

**Cost.** Small (four files, ~40 lines). Any country can use it; `toward:<side>` can be used by any scenario.

**Still in the way.** The binding is one-way. Pentrice can read what happened on the green; the green cannot read
what happens in Pentrice. A company that crosses the march without freeing the players finds Gosse's Company in the
Painted Moon's loft anyway, while the players are still, as far as the green knows, chained in the town behind them.
The players leave the green on their own after a week, which hides this unless the company goes back early. A
country-to-herald channel (the frontier asserting a fact into the herald's module when the country is installed)
would close it.

### 2. A hidden way is not described shut to a company that has never heard of it (general; high)

**Symptom.** The weir path (`hidden until weir_known`, `opening when` the water is low) printed its shut text ("The
weir is under a yard of brown water…") at the Water Stairs to a company that had never heard there was a weir.
**Change.** `WorldConstructs.opening` adds `knows(party, hidden)` to the shut observation when the way is hidden.

### 3. A cached campaign's own kinds are put back before it is forked (general; high)

**Symptom.** Starting the Wending Cross campaign, then the city campaign, then Wending Cross again in one process
failed: `players__the_bear_person: a person has an ancestry and a class; a species creature has no class`. A loaded
campaign is cached and later loads fork it; the fork re-validates its creatures, and it did so before
`LocalKinds.activate` had put the campaign's own species (the players' dancing bear) back in the catalogue.
**Change.** `Campaign.fork` activates its kinds first. Regression test in `test/campaign-isolation.test.ts`. Found
only because the adventure's test file starts three different campaigns in an order; any campaign with a module
species could have hit it in the browser by playing two games.

## Worked round in the adventure

### An action that would take a measure below nothing is silently not offered (high)

`World.admits` refuses a change that leaves a measure negative (that is how "Pay eight coin" is not offered to a
company with five), but `World.apply` clamps a rule's decrease at nothing. So the same `Decrease regard(mallory) by
2` is a silent gate in an action and a lossy no-op in a rule. Four actions (`help_ned`, `expose_callow`,
`frighten_garlick`, `bar_stable`) and the tallyman's stick (`Decrease fines by 8`) were **never offered** in the
situations they were written for, with no warning; it was found when the stranger journey could not lay its stick
down and every requirement of the action tested true. Worked round by giving each critic a `slight` measure that
displeasure increases, with the vote at `regard >= slight + n`, and the stick as a capped one-notch-at-a-time rule.
A test now asserts that no action in the adventure decreases anything but a quantity. **Proposal:** lint a `Decrease`
of a non-quantity measure in an action's effects; or let an action declare which of its decreases are costs.

### Rules cannot assert knowledge; teaching prints the fact (medium)

A rule may not `Assert knows(…)`; it must `teaches` a fact. A `says` rule or an observation that teaches prints the
fact's own text before its own. Every taught fact therefore had to be written so that the fact and the telling do
not say the same thing twice (the Master's inky finger was told twice in every scene she was in until it was
rewritten as a fact and a complementary detail). Where the fact was never read by any condition, the `teaches` was
dropped. **Proposal:** an option to teach silently, for a telling that already says it.

### A rule anchored at a place still happens when nobody is there (medium)

`Rule x at moon_loft when … says "…" { Assert spread(x) }` applies its effects whether or not the company is in the
loft; the anchor scopes only the telling. A tell-only rule (Pudding saw who knocked out the wedge; the ostler's banns)
fired in the company's absence and was spent: the company never heard it. Every tell-only rule now includes
`at(party, place)` in its condition. Events behave the same way, by design. **Proposal:** a lint for anchored rules
whose only effect marks them told.

### Endings fire for a company that was never there (high)

In the standalone campaign Pentrice is installed from the first step, so its week runs whether or not the company
ever goes. The wander test found a company that never left Wending Cross reaching *The Company Broken* at the verdict,
from a city it had never entered, and the campaign stopping. A second walk arrived weeks after the verdict and the
campaign ended at the gate. Every ending now requires `cameForTrial(party)`, asserted when the company first enters
the city before the verdict. **Proposal:** an ending could by default require that the company has been in one of the
module's places.

### The world's calendar has no season the text can trust (high)

A generated world's calendar starts in any month. The Trial was the Midsummer Trial; the first generated-world
journey arrived in a spring market-place with lambs crying in the home fields, where the innkeeper said "this week
it's their Midsummer Trial". Every seasonal word was removed: the Trial of the Wheel, the Trial peal, "all that
season". **Proposal:** a `season` query the text can read, or a country's own calendar.

### "The green" in a town without one (high, caught by the suite)

The herald's prose said "the green" twenty times. `test/prose-fit.test.ts` (rightly) fails a going-on that speaks of a
green in a settlement whose heart is a market-place or a pit-head. Rewritten to name the bound place (`{green}`) or a
neutral word ("the crowd", "where she is"). The fact that the herald exports into Pentrice was the last to be fixed: it
said "on a village green" until the generated-world journey printed it in Tussanand's market-place.

### A held country with no `among` takes every march it fits (high, caught by the suite)

Pentrice was first placed beside forest, fen, mountain and frost. With no `among`, it is held wherever it fits and no
independent adventure was chosen for that side, which was most worlds of four terrains: the west march of a fen
(seed `a1`, which `test/frontier.test.ts` expects to draw a generated country) became the vale of the Arle, and with it
nine tests about generated countries, prose fit and newcomers failed (four more failed only because the web bundle
had not been rebuilt with the new scenario). Narrowed to forests. **Proposal:** the
placement registry could report which existing test seeds a new entry changes, before the suite does.

### The found-by-searching text outlives the thing found (medium)

`Found by searching place "text"` makes the text a permanent feature of the place. Clay's *Dido* was described in
the costume rack after it had been taken and given back to him. Replaced by an observation that holds while the
manuscript is there (`at(dido, tiring_house)`), as the generator's deep-history writer already does. **Proposal:** a
found observation could hold while an item hidden until it remains where it was.

### Names (medium)

- **The shared rules' states and the module's things share one namespace.** `burned`, `shut`, `trap`, `seized`,
  `patience` and `closed` collided; the book's states became `copy_burned` and so on, the bear `the_bear`. A regular
  expression rename then leaked into prose ("the the_bear of her name", "stage_trap" in a sentence), and one prose fix
  broke an identifier. **Proposal:** the parser could say which shared rule a colliding name belongs to.
- **Relation argument types must agree across uses** (a relation used once with a place and once with a group is an
  error), which is right and cost a script.
- **The vocabulary check** reports every campaign-local relation as a warning; the repository had 739 before this
  branch and has about 960 after. The useful warnings in it (three of this adventure's names meant something else in
  another adventure: `spared`, `told`, `counted`) were hard to find among the rest.

### The engine's own voice (low)

- A tame species greets with a generic bark ("Patience comes to see who you are") even while the place description
  says she is asleep in her stall; each bear needed a `Greets`.
- Items without an article narrate badly ("Wren gains 1"); every item is named with one.
- A level's name is used in movement labels ("Into the Moon's upper floor"); levels are named for how they read in a
  label ("the stable loft").
- A milestone reached by a rule is reported on whatever step comes next, so "gains 100 experience: saved Ma Tolly's
  swarm" appears after carrying the hampers. The milestone's own words carry it; a player may still wonder.
- A topic's text is said wherever its person is: Gosse "came down off the wooden throne" in the taproom. Topics that
  can be met in more than one room had to be written for any of them.

### Time (medium)

- Literal watch comparisons in an installed country are shifted to the first eight in the morning after it is
  reached, and days roll at eight; a measure set at run time is not shifted. The night's half is counted from
  `crossedAt`, a measure set when the company crosses, not from a literal watch.
- The week is computed as a `tday` measure from watch thresholds, because queries are not shifted.
- No `min()` in arithmetic: the tallyman's eight spared notches are a rule that gives one back at a time while fewer
  than eight have been.

### What Kyr has no construct for (low; written by hand, as Tessary did)

- **A public occasion** with beats, an audience's temper and live choices at posts. The night is nine scenes driven
  by `scene`, `sceneAt`, `sceneBegun`/`sceneOver`, and the queries `midScene()` and `sceneDone()`; each scene opens,
  offers its live choices only at its middle and only at the post they need, and closes with rules that read the
  week. About 500 lines; the pattern is now written twice in the repository and could be one construct.
- **An ensemble** that is not the party. The company is eight people of the city who move together, play parts by a
  `plays(person, part)` relation, and are cast by rules that fill each vacancy in order.
- **A vote** is four rules and a count.

## What was easy

- Places, passages that open and shut by condition, hidden ways, levels, and the river as the map's one distance.
- Topics with `once`, re-askable; actions with `Requires`, checks with shown odds, `Grave` confirmations, `Time 0`.
- Lending and giving: Hepzibah lends the letter, Gosse lends *Dido*, notes are given to the wrong person.
- Local kinds: the paste crown and the Master's licence are a line each, and grant a skill.
- `craft(company, craft_stage)`: nineteen backgrounds already counted as players, so the profession's lines cost one
  condition each.
- The journey driver and `bin/kyrie play` with probes: every bug above that was not caught by the suite was caught by
  reading a journey's page.
