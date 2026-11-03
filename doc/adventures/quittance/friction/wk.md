# Authoring friction: Mr Teague's Wake (wk_)

Met while writing `q_wake.kyr` and its test. Evidence is file:line or a command.

1. **`day(clock)` starts at 1, not 0.** kernel.kyr says "`day(clock)` is 0 on the first morning" and slate.kyr has
   `Observe slate_day0 … when day(clock) == 0`. `bin/kyrie play … --probe "#day clock" "^To the Declarations Hall"` prints
   `1` at watch 0. The day-0 Slate line can never be shown, and "Appointed Nights at day 3 and 6" means the third and sixth
   mornings of play. `Journey`'s `=day 2 11:00` is 1-based too, so the three conventions (comment, query, step) do not
   agree. I wrote the Wake to the engine (deadline: four on day 3 = watch 336) and say so here; the lead should fix the
   comment or the Slate.
2. **No parrot.** `data/catalog/species.json` has hen, cat, dog, horse… no talking bird. `Species wk_parrot "a grey parrot"
   like hen tame.` works (guide §3 says so), but a Person of a Species cannot be given a repertoire: all of Fusby's
   behaviour is hand-built from measures (`wk_pos`, `wk_mood`, `wk_cue`, `wk_run`, `wk_asleep`, `wk_just`) and about
   twenty rules. A `Repertoire` (an ordered list of things a creature says, with a cursor, a mood and a cue) is exactly
   the shape of a parrot, a ghost, a clock, a gossip. I wanted `Says in order`.
3. **A rule cannot branch.** The adjuster's verdict is a ladder of eight rules each tested `not wk_settled(party)`, whose
   precedence is *the order they are written*. It works, and `kyrie lint` is silent, but nothing says that is the
   contract; an `Effects … otherwise` or a `Choose` would read better and could not be reordered by accident.
4. **A `says` rule that also changes the company draws "anchor" advice.** `advice anchor: … what it does to the company
   happens wherever the company is` fired on four of my rules (q_surveyor) and I had to split each into an effect rule and
   an `once` telling rule. The advice is right, but the idiom doubles every beat of a scene; `Event … at … then {}` is the
   only one-shot with both and it has no condition on presence. A `Rule … when … says … ` form that says "the effect is
   mine, the words are only for those present" would remove the pair.
5. **`once` with `at(party, place)` in the condition is the only "say it once, to whoever is here".** It fires once in the
   world even if the company arrived late, so a told-late beat reads as live. I cut the window with `hour(clock) < 19`.
6. **Observations are shown once.** I had an `Observe` for "the widows are friends now" and expected it on every visit; it is
   told once and then the page falls silent (see test: `Observe wk_afterglow_*`). What persists must be a Thing's State.
   The guide's section 6 says "describes a place while its condition holds", which reads as every time. A one-line note
   in the guide would have saved a test.
7. **Parse errors are unhelpful**: `Observe x at y when c "text" { }` fails with `Expected "." or "teaches"` at the `{`; the
   message should say Observe takes no braces.
8. **`Item … at nowhere` is not takeable from a room**, and `Item … in room owned by x` cannot be borrowed by a topic
   that `lends`: the player has no "take" verb for a room's item (the choice list has only "Set down here" for carried
   things). Anything a person gives must be `Give`n. The guide's Whose-things-are section implies the lend path works for
   an item on the floor; it does not appear to be offered.
9. **`lint` takes 44 s** for the campaign, `play` 2 s. Writing 600 lines of Kyr means a lot of waiting; a
   `kyrie lint --file q_wake.kyr` that checks only one source against a cached world would double the pace.
10. **Passage kind `stair` must change level** (lint warns); I wrote `stair` for a stair between two rooms of one house.
    `passage` was the fix. The kinds list is only in the lint message.
11. **Checks are fixed by seed and moment**, so every test that wants a check to pass or fail searches for a seed. I
    hard-coded seeds (`b`, `c`, `a`), which means any change to the order of earlier steps can flip a test silently.
    A `Journey` option to force a check's result (`{ rig: { performance: 'pass' } }`) would make tests state what they mean.
12. **Names lint**: `Quennell` collided with a character of A Parliament of Books; found only by the full-campaign lint
    (44 s). The surname list is not offered anywhere to authors for checking before they write forty lines of prose.
