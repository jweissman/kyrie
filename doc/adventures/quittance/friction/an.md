# Authoring friction: the Annuitant and the Queue (`an_`, `qu_`)

1. **`at(place, site)` in a Requires is silently never true.** I wrote `at(alms_room, site)` to pin an action to a room
   (the brief says an action not said to someone must name its place). It parses, lints clean and the action is never
   offered. `kyrie inspect` showed `fails: quantity(...)` only after other conditions were fixed; nothing flagged the
   place-at-place test. `site == alms_room` is a parse error (`Expected "("`). The working idiom is to drop `site` from
   the signature and write `at(actor, alms_room)`. The brief's wording ("name its place in Requires: at(actor, some_room)") is
   right; lint should reject `at(<place>, <site>)`.
2. **`holding(actor, item)` with an item id gives a misleading error**: `Invalid argument an_policy in holding(actor,
   an_policy)` followed by `'closed' is already declared by the shared rules`, a second line that is nothing to do with it.
   `holding` takes the kind.
3. **A `Promise`'s kept/broken clauses take no effect block** (`kept when … "text" { … }` is a parse error); only broken does.
   A reward for a kept promise has to be a separate rule (`an_register_thanks`).
4. **A revisited place is told in brief.** After a state change, coming back into `queue_hall` tells the first line of
   its scene and who is there, not the later conditional Observes (`qu_pushed_scene`, `qu_desk`). A test cannot read the
   change in a place's prose once the company has been there; I put the consequences into Topics (`qu_gor_cold`,
   `qu_tench_cold`) so they could be tested. A "look around again" step would help.
5. **`scenes.kyr` says the clerk's chair at the far end of the Queue is empty, unconditionally.** My `qu_desk` Observe puts
   Tench in it. Both are told on a first visit. The lead should condition the line on `qu_nerve(party) < 2`.
6. **A conditional way through a Thing cannot be written as a `Change`** (a Change has no condition beyond its skill/item/
   place). The sexton's leave and the rite are Actions that `Assert state(an_grate, open)`; the lockwork and brawn doors are
   Changes, and the cost of forcing it has to be a Rule on the open state with a latch (`an_grate_forced`), because a Rule
   cannot see which Change opened it.
7. **`Retract` of a person's `at` is not needed to move them**: `Assert at(cray, oakes_room)` moves him. The brief warns
   against `Retract at` for a company; for a person it is harmless but unnecessary (`an_bring_cray` does both).
8. **The company eats.** A party starts with three rations and by the second morning has one. A kindness that costs two
   rations is not offered. I made it cost one. Worth a line in the brief.
9. **Checks are deterministic on a seed, so every test hunts for a seed.** I wrote a scratch test that tries eight seeds per
   scenario (`SCAN=read:plain bun test …`) and then hard-coded `read-a2`, `forge-a1`, … into the tests. A built-in way to say
   "make this check succeed/fail" in a Journey would save a quarter of the time. A thief stealing a book succeeded on eight
   seeds out of eight.
10. **A grave action needs one step in a Journey, not two.** The Journey takes it without confirming and notes it in `grave`.
    Documented, but I tried twice first.
11. **Blocked ways are listed as "To the foot of the catacomb stair — pick the padlock"**, so "the way is blocked" tests
    look for the absence of the plain label, not an exception.
12. **`advice role`** on a Person whose room a rule moves wants a conditional Role; I changed the Role to something that
    holds anywhere.
13. **Cross-quest relations in the same module** (`qu_register_given` read in `q_annuitant.kyr`) work, but the lint's
    "write-only" advice is noisy (twelve items) for relations that only the Hearing/Descent read. Expected, as the brief says.
