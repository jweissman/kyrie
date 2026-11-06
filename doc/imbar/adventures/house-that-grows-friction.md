# The House That Grows: friction

| What I tried | What happened | Cost | Smallest repair |
|---|---|---|---|
| `Give kind to actor` then `carries(actor, item)` | `Give` mints a **new instance** (`hhg_..._given1`); the original item entity stays `at nowhere` | one failed test | none needed; use `holding(actor, kind)` and `Spend kind from actor`. Worth a line in the Kyr guide. |
| Name a new `Kind` plainly (`undal_letter`) | Kinds are **global**; the bible asks for a prefix | caught by the bible, not by lint | lint could warn on an unprefixed new Kind in an adventure |
| `tried(gate_leaf, picking)` | "no verb of that name"; the verbs are a closed list (looking, prodding, pushing, listening, burning...) | one lint error | none; used a `state` check instead |
| `Observe name at place "text"` | needs `when true` | trivial | none |
| `Passage ... is path` between two indoor rooms | lint warning "ends indoors" | trivial | use `is passage` |
| `back_through` in tests after a long detour | the watchers' `averted` window (3 watches) expires and the door opens onto the other copy | a day of the test writer | the sequence in `test/house-that-grows.test.ts` is brittle against any extra watch; a `Wait › A while` after the look is the fix I used |
| Rules asserting `knows` | refused (known) | none | used `Observe ... teaches` and `On discuss` |
| Fight with the riggers in a test | not written | **blocked by cost**: a combat test for an unseeded fight with three level-2 NPCs in a world with a dead-end ledge | a `Journey.fight` helper like the Hessel footpads' |
