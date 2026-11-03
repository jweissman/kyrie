# Authoring friction: the Bare Wards (`q_pennymutual.kyr`, `q_pip.kyr`)

Evidence is by file, command or test. Ordered by what cost most.

1. **`day(clock)` is 1 on the first morning, not 0.** The brief, the kernel comment and `slate_day0` say day 0 is the first
   morning. Measured (`Journey`): watch 0 is day 1 at 08:00, watch 96 is day 2 at 00:00, watch 240 is day 3. So `Observe slate_day0 at
   slip_room when day(clock) == 0` in `slate.kyr` can never be told, and "the small hours of day 3" is watch 240 to 300 (the second
   night, which is right for `d_candlewick_next`). I computed in brief-days first and shipped a coal that died a whole day late,
   and a boat that left four hours after the fire. A `=day N hh:mm` journey step uses the same count, so it did not catch it.
   Fix in the brief, not the engine; but the lead's `slate_day0` is dead.
2. **`Q()` is a lie for the kernel's coal.** `test/support/quittance.ts` says every id is `quittance__x`; `Entity coal: good` is the
   world's own `coal`, and `j.measure('quantity', 'party', Q('coal'))` returns 0 *silently* while `quantity(party, coal) = 1` in the
   event's `changes`. Lost an hour. `Journey.measure` should throw on an unknown entity.
3. **`Journey.holds('holding', …)` returns false for a Query.** `holding` is a Query, not a relation; `holds` neither throws nor
   evaluates it. Same silent false. I used `carries` for items with known ids, and `offers(...)` for items whose id the shop makes.
4. **A returned-to place recalls itself by its first sentence.** Lines that became true during the visit are told at that step and
   then, on return, not again (`Narrator.recalled`, narrator.ts:~118). Right for a reader; it means my pages for "the hall as it now
   is" (`pm_hall_ashamed`, `pm_hall_awake`) cannot be read back in a test by re-entering, only at the step that made them true. Tests
   read `City.pages(j, from)`. Nothing in the guide says so under `Observe`.
5. **Checks cannot be set in a test.** A die is fixed by the seed and the moment, so a test for the failure of a check is a search for
   a seed, and any step added earlier in the journey changes it. I wrote `scratchpad/seeds.ts` (twelve seeds × a prefix, grep the
   page for "fails the X check"). A `Journey` option `force: { skill: 'pass' | 'fail' }` would make every quest's failure tests
   robust. As it is, five of my tests are pinned to seeds (`quittance`, `a`, `c`, `e`, `hat`) and will break if the prefix
   of steps changes.
6. **`hidden until` takes a Discovery id, not a condition**, and says `Expected "."` at the position of `knows(`
   (`q_pennymutual.kyr:9:106`). The guide's prose says "hidden until a fact the company learns" and the example is
   `hidden until alcove_known`; I wrote `hidden until knows(party, …)` by analogy with `opening when`. A hint ("a Discovery id")
   would have saved a lint round (40 s each).
7. **`stair` as a passage kind warns "does not change level"** (`pm_garret_way`). A stair between a lane and a garret in the same
   settlement is the commonest stair in the world. I renamed it `passage`, and lost the word.
8. **Lint takes 40 s and reports a surname collision (Quennell, `parliament-of-books`) only then.** A `kyrie names <surname>…`
   that answers in a second would be right for people authors invent at the keyboard.
9. **A Rule's `says` anchors it for lint's advice about company state** (`pm_deaths_c`, `pt_goes_out`): advice wants either
   `at(party, place)` in the condition or no anchor. Splitting "what happens" from "what is said" into a rule and an `Observe` on
   the state (the Thing's state text) works, but the idiom is to write it twice. A rule that says something *only if the company
   is there* and acts regardless is exactly `says` anchored; the advice should not fire on a rule whose effect is on a measure
   the company does not own (`pm_dying(wardsfolk)`), which is what happened on the first of the two.
10. **No way to make an Item examinable with a teaching result.** The brief says "an item/thing to examine". A `Thing` can be
    `tried`; an `Item` I give to the party cannot be, as far as I could find, so the stamp is read by an Action
    (`pm_read_stamp`) that requires `holding(actor, pm_paper)` and, because an Action not said to someone should name a place, takes
    `at(actor, site)` for any site and so is offered everywhere. It works and it is not what the guide describes.
11. **A conversation menu lists every seller in the room under one heading**, so a journey step `Buy` matched Mother Gammidge's
    ration when I wanted Hannah Pennifold's hat (steps are regexes on labels, and all three stalls are in one list). Fine for a
    player; for the test it means every purchase pattern has to be the whole label.
12. **`Unoffered` prints the entire pack list** (≈4 KB: every `Give to › …`). Every failing step in a 20-test file buries the one
    line that says what was offered at the place. A cap, or a filter on `Pack ›` rows, in `Journey.chosen`.
13. **`Promise` is the wrong shape for "bring her to see it".** It wants a kept condition and a broken condition and I have a place
    that is right and places that are wrong; I wrote a relation and a rule (`pt_promised`, `pt_promise_broken`) and lost the
    promise's page chrome ("Keep your promise to Pip: …").
14. **Regard cannot go below nothing.** (Told by the lead after I had planned two losses as −1.) Both are now
    `Decrease regard(wardsfolk) by 1 or to nothing` plus `pm_slighted_wards(party)`; with the Gap's +1 the first offence is the
    whole stock, a second is invisible. Whether an offence should be readable as a *relation* and a *measure* should be said in
    the kernel's header.
15. **`Seen when` on a market-stall person works** (`hour(clock) >= 17 or hour(clock) < 5`), and `Journey.offers('Talk to X')`
    answers; I expected to have to write a rule that moved them. Noting it because it is not in the guide's `Seen when` text, which
    only shows `knows(viewer, …)`.
16. **Rules of the module run in file order**: `module.json` lists `q_pennymutual` before `q_pip`, so `pm_slighted_wards` is
    declared in the first and used in the second. Reorder the manifest and `q_pip` stops loading (`Unknown function or arity`
    with no file or line).
