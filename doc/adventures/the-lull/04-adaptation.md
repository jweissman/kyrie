# The Lull: reading the engine, and how the design bends

*Stage 3. What Kyr and the runtime could say of the revised design ([03](03-critique.md)), checked by prototype
before any content was written (the throwaway module `lullproto`, deleted once the real one played).*

## What Kyr says directly

| The design | How it is said | Checked |
|---|---|---|
| A road that is there one day in seven | `Passage … opening when lullday() "…"`, the predicate a `Query` over a seven-day count kept by rules at midnight | prototype: the road refuses, then opens, on the seventh day |
| The Lull's own sennight in a world of thirty-day months | `Measure lullCount(clock)`, stepped at each midnight, wrapped at seven; nothing in the calendar is touched | prototype |
| A night slept in the Lull is a week outside | An `Action` whose `Time` is a measure kept as the watches until the next Lullday's dawn (`Time untilLull(clock)`): about a thousand watches, in about a tenth of a second | prototype: 1,008 watches, 0.1 s |
| Waiting at the stone for the Lull to open | The same measured time on an action at the Fold-stone, so a company that has done what it came to Sixways for need not click through six days | prototype |
| The six folded days: dark, everyone asleep | Rules assert `unlit` on the valley's rooms and `asleep` on its people while the Lull is folded; `talk_to` already refuses the asleep | read in `people.kyr`, `core.kyr` |
| No hunger in the fold | The company stops eating while it is in the folded Lull (`eats` retracted, its next meal moved on when it wakes) | read in `needs.kyr` |
| Things that come undone at dusk | Rules at the Lull's dusk that spend what the company carries of an unmeant kind, set unmeant things to their ravelled state, and return coin | `Spend … from`, `Thing` states |
| A thing made meaning it, or not | An action at the Gift Hall bench whose made thing is marked by whether the company has come to care for whom it was made for; the dusk rule reads the mark | |
| Experiments on the law | Things in states set by actions (a cairn stacked for a coin; a skep set by a man who loves bees and was paid anyway), resolved at dusk, each observation teaching a discovery | |
| The Hands that set the idle to work | A `seizing` band in the Mill: no fight, the company is taken (`captured`), and the module says what follows (a day lost at the looms, a bolt of grey cloth) | read in `inhabitants.kyr` |
| The Overseer | A territorial creature with its own `Warns` that names the ways round: lie down with open hands (an action that asserts `tolerates`), work, or go | guide §3 |
| The Working Day's Hands | Relations on each person: `joins` and `means`, set by what the company did with them; the dusk Watching tells each Hand's work standing or falling, in the order they came | |
| Linnet's day and your week | Topics conditioned on the Lullday of the story and on what changed in the company between (a member hurt, a companion gained, weeks counted) | |
| What the world outside hears | `countries.json`: rumour, notice of the Lull-count, and `after` talk once the Lull's question is settled | the fair-weather branch's pattern |

## What it cannot say, and what was done instead

1. **Hired harm undone at dusk.** `dead` and `able` are the engine's; a module may not raise the dead or heal a wound
   at nightfall. The Lull's most striking law, *you can only be hurt by somebody who means it*, cannot be applied to a
   fight in general. What was done: it is the Lull's lore, told and seen in its history; for the Old Brock, killed
   for a bounty, the module retires the beast's body and brings a second creature, "the Old Brock, up again", to its
   sett at dusk. That is a duplicate identity standing in for one animal, and it is recorded as friction (F1).
   The wardens' fight on the Working Day therefore *holds* whatever the company was paid: the design's darkly comic
   option, a hired guard whose blows do not last, is not built.
2. **The company's own sleep.** A bed at an inn, or a camp, ends at the next morning, whatever module the company is
   in. A company that makes camp in the Lull wakes on a folded day, in the Sixnight. The design keeps this, as a
   danger the Lull's people warn of ("lie down Lull-fashion, or be on the road by midnight"), and offers its own
   sleep (F2).
3. **Buying in the Lull.** The standard `Sells` is labelled "Buy … for … coin". The Lull has no buying; its Gift Hall
   exchanges courtesies. Its exchanges are written as its own actions with their own labels, which the shared rules'
   `buy_item` would not allow (F3).
4. **Training.** The shared rules train abilities through `teaches`; nobody in the Lull teaches a combat ability, and
   what the Lull teaches (patience, a tune, the strike's song) are not abilities. Capabilities granted for a while
   (`granted`) carry it (F4).
5. **Planes.** The Sixnight is not a plane: it is the Lull, folded. Nothing in the shared world names Imbar as a plane
   that a module could extend (each module that needs one declares its own `imbar`), so this question did not arise
   here; it is noted for the next author (F5).
6. **Imbar has no week.** The calendar is twelve months of thirty days. The Lull keeps a sennight of its own,
   counted at the Fold-stone; nothing here asserts that the rest of Imbar counts weeks. Whether it does is a canon
   question (F6).

## How the module is laid out

`data/adventures/the-lull`, module `lull`:

| File | What it holds |
|---|---|
| `clock.kyr` | The Lull-count, the fold, dusk and midnight, the long sleep, the wait at the stone, the Sixnight's dark, and the story's Lulldays |
| `sixways.kyr` | Sixways and its people: Dorcas, Abel, Ruth Coll, Mercer Quarles, Simeon, Quick Nan and Gurney |
| `linger.kyr` | The valley and the town: places, the Long Table, the Gift Hall, the Glossary, the Chapel, the people of Linger |
| `law.kyr` | The Ravel at dusk; *On What Holds*; the Gift Hall bench |
| `ashbys.kyr` | Corin, Tobias, Hester; Hester's Monday; the clock |
| `houses.kyr` | The Pryces and the Gales; the Open Houses |
| `linnet.kyr` | Linnet |
| `bride.kyr` | Abel and Wenna; Dorcas and Piran |
| `wild.kyr` | The Tarn, the Hangers, Hob Linsey, the Old Brock |
| `sixnight.kyr` | The six days: the Mill working, the Hands, the Overseer, the beam, the Weaver's Gap |
| `working.kyr` | The Weekday Club and the Working Day |
| `endings.kyr` | The Watching of the Working Day, the endings, each person's afterward, and what the company grows by |
| `company.kyr` / `placed.kyr` | Its own company at Sixways / the world's company come over the march |
