# Where Kyr could not say what the design says

These were found while writing *The Long Man* from its design (see README.md). The design was not changed to fit;
each mismatch was worked around in the module, and the workaround is recorded here. Mission 8 fixed the ones marked
**fixed**, and the module was rewritten with the fixes. The before and after are in `authoring.md`.

| # | The design says | Kyr made the author write | Status |
|---|---|---|---|
| 1 | A place called *the marsh*, *the hills*; a thane called *lord*; a lake called *the deep* | Each failed to load with "Duplicate entity marsh", "Parameter shadows entity lord" or "Invalid argument deep in state(steps_water, deep)". None said where the other one was: a terrain kind in the core rules, a parameter of the inhabitants' tribute action, a thing's state of the same name. | **fixed**: errors name the file and line, and say what else has the name and where |
| 2 | "Venn hides the teeth unless the company already holds them" | Nothing. I took `not ownedItem(teeth, ?m)` for a silent literal; the solver reads it existentially (no member owns the teeth), as `world.ts` says. Not a mismatch: my mistake, recorded because I acted on it. | not a mismatch |
| 3 | Things people know (the rod's history), things a scene shows (what the Long Man is) | A `Discovery` needs a source or a search. Anything else is `Entity x: fact "…"` plus `Initially Assert established(x)`: two notations for one idea. | **fixed**: a discovery may have no source; who knows it and what teaches it are enough |
| 4 | The Wet holds its ground and comes at whoever stays; the Old Jack lies in wait | Five lines per creature: three `Initially Assert` facts and two text entities | **fixed**: `Temperament territorial. Warns "…". Comes "…".` inside the person |
| 5 | Bell-teeth, the dyke-reeve's rod, the keeper's mask, a great pike | New entries in the global catalogs (items.json, species.json) for things only this dale has | partly fixed: an item can carry its own description; new creatures still go in the catalog |
| 6 | Venn's key opens Venn's grate | `needing cell_key`: any iron key would do | **fixed**: `needing` may name a particular item |
| 7 | Venn notices his key gone from his belt; Gammer Coller notices her rod gone from her wall | A rule per thing: `when holding(party, cell_key) and together(venn, party) and not lentKey(venn) says …` | **fixed**: `owned by venn` on the item; the belongings rules make the owner, or one who serves them, object unless the owner lent it, in their own words (`Objects "…"`) |
| 8 | The cellar door is barred on the cellar side | A `Change` on a thing on a passage is offered from both sides, so it became a bespoke action requiring `at(actor, cellar)` | **fixed**: `Change lift "…" from barred to unbarred at cellar` |
| 9 | One module in three files | Every file had to carry its own `Goal false.` | **fixed**: one goal for the module |
| 10 | Venn's key is on his belt by day and on a hook while he sleeps | A container thing, the hook, with two states and two rules | open: a person cannot carry a particular item that others can take |
| 11 | Cass sells the teeth back at twelve | Rules that put the teeth on her deck, for sale, at a price | open: a merchant does not resell what she bought |
| 12 | Only someone who reads old hands can read the notches on the breastplate | `Found by searching rest with lore`; a readable source cannot need a skill | open |
| 13 | The Mower walks the crest by night, rests by day, and goes after its bronze | Rules on `dark()` moving it, a `hunting` flag, and timed rules for the first night | open, and probably right as it is: a routine is just rules |
