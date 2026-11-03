# Authoring friction: the Descent (`ds_`)

1. **`memberOf` cannot be written** (`src/lang/engine-owned.ts`; error "Creature projections and campaign clock/pressure
   records are read-only", with no line number, from `module-assembly.ts:149`). A Hearthkeeper who is one of the company
   (the design's "someone stays") cannot be expressed; no company member can be left behind. The error does not say
   which action wrote it: I found it by deleting actions until the module loaded.
2. **Place equality is not an expression.** `site == glass_street` fails at the parser ("Expected \"(\""). The idiom is
   `at(actor, glass_street)` and dropping the `site` parameter. The guide says an action must name its place; it does
   not say how to name one.
3. **`Species ... like red_dragon`: `Level` does not scale a fixed-stat species.** A dragon at Level 1 beat a level-8 party;
   `iron_golem` and `bronze_construct` at levels 6 to 12 lost to a level-3 party. There is nothing between "trivial"
   and "unbeatable" in the catalog, and no elemental. Fights are seed-dependent (a party of level 10 lost one seed and
   won another), so the Slaying test pins a seed and a party.
4. **Rules run once per action, and once per watch, so a per-watch measure (heat) needs a stamp** and the arithmetic
   `(watch(clock) - stamp) * rate`. The patient-star idiom (`airPaid`/`tookWay`) is for ways; there is no way to say
   "the rate of the place the company walked through" mid-passage, so heat is charged at the rate of arrival.
5. **Scenery cannot be tried** (guide says so) and a Thing with a sole `State` is `Look closely` only; `pushing` and
   `listening` need a `Tries` line which is documented only in a comment in `world-constructs.ts:17`.
6. **Rule order matters across files in an invisible way**: `ds_m_tender` was written before `ds_read_b_counts`, so the
   mood changed a pass late. The lint does not mention rules that read a measure written by a later rule.
7. **A test cannot hand the company an item.** `ownedItem` is a query ("Cannot write query or unknown relation"), so
   the Ledger, the key, a forged writ, a Phoenix writ and a salamander lantern cannot be put in the company's hands in
   a unit test of one file. Those routes are covered only by the `Change ... needing` / `holding(...)` lint.
8. **Teleporting the company in a test is a world write through a private-looking method** (`session.campaign.commitWorld`
   with `world.apply`); `Journey` has no `put`. Every test file will reinvent it.
9. **A pending warning is a trap for tests that wait**: a company set down in a room with a proud guard is warned on the
   next pass and fought at the end of the watch, so `=day 7 09:00` walked a test into a fight and a defeat. Rightly, but
   there is no "set down and tolerated" helper.
10. **Journey `>place` takes the whole id** (`>quittance__furnace_row`), not the id the module wrote; `Q()` is in the
    support file but `>` steps need hand-prefixing.
11. **Lint's "no possible target"** for actions that read another author's relation (`coalNamedGran`, `tobiasWilling`) is
    correct but noisy: a warning where the cross-author advice level would do.
12. **`Numbers 3` with a `Species`** gives three member entities that are the same Person; `dead(ds_glassmen)` is true only
    when all are down, which is what I wanted but is not written anywhere I could find.
