# Half the Hive — friction

*Authoring limitations, simulation defects, awkward abstractions and missing capabilities met in writing and playing
the Wold of Hume, each with what was done in the adventure and what a general improvement might be. Nothing here was
patched in the engine; every workaround is in the adventure's own files. Numbered HTH-n for the register.*

## World and canon

**HTH-1. The canonical Imbar and planes are not on main.** The one-universe design (`mission-18/one-universe.md`) is
built in a worktree; on main, six adventures each declare a private `Place imbar ... is plane`. The Wold declares
none (a generated country lies in no plane either), so its march is not told as a planar crossing. A plane-set
adventure (my rejected *Ebb Court*) could not honestly be written now: it would make a seventh private plane.
*Question for the owner*: should independent authors wait for `data/imbar`, or declare against a placeholder id that
the canon will bind? *Improvement*: land the canon module; until then, say in the guide that an adventure in Imbar
should declare no plane.

**HTH-2. Placing a country in the world is global and unstable under addition.** Adding the Wold to `countries.json`
beside forest, marsh and mountain on the east, `among: independent`, moved every other country in most seeds (in seed
`wren`, nine countries vanished from the plan) and broke eleven tests on main. The independent lottery re-rolls when a
member joins it, and a country that can take a first-ring march displaces the cells others were laid through.
*Done*: the Wold is offered on the south side beside mountain countries only, where the Vale of the Wray always takes
the first ring, and it is last in the list, so it is laid after every other: `bin/kyrie countries` shows every other
country unchanged. It is absent from one seed in fourteen tried (`g40`). *Improvement*: an append-stable plan (place
existing countries first by a seed that does not depend on the list's length; new ones only in cells left free).

**HTH-3. Two central registries must be edited to be found.** `data/adventures/countries.json` (the world) and
`web/scenarios.ts` (the title page). Both edits are additive. The second also makes `web/bundles.generated.json`
(tracked) stale after every `.kyr` change, which fails `play-session.test.ts` until `bun run web:build` is run.

## The language

**HTH-4. A companion's `Remarks` never fire.** The shared rule the parser writes asks `able(ivo)`; a person who has
joined the company is a member, and the group is no longer `able`. The guide says remarks are said "when they come
there with it" (A Winter in Carth's 21, which used `following`). *Done*: Ivo's five remarks are local rules on
`travelsWith`. *Improvement*: drop `able(id)` from the remark rule when `travelsWith` holds, or test the member.

**HTH-5. `Give` takes an item, not a kind.** "Give a cake of wax" needs a declared item for each cake ever handed
over; a slab of comb cut each day is six declared items and six rules. Worse, `Give` takes the item *from whoever has
it*: a slab sold to Martin, given again, would be taken back out of his pack. *Improvement*: `Give one wax_cake to
actor.` creating a fresh item of the kind, as buying from a seller does.

**HTH-6. No count of relations.** The swarm's tally (how many dance for a place) is a measure changed by hand at
every place a dancer starts or stops (seven actions and topics, two rules). One missed decrement would corrupt the
swarm silently. *Improvement*: `count(dancesFor(?d, s))` in an expression.

**HTH-7. A placed country's clock is below nothing until its first morning.** A measure left at 0 compared with
`watch(clock)` reads as "later than now": everyone counted as scented before the first morning in a generated world,
and the Comb was safe by accident. *Done*: a latch (`anointed`). *Improvement*: document it beside the clock's
paragraph in the guide, or start measures meant as times at a sentinel.

**HTH-8. Kinds must be declared before a file uses them, across files.** "martin buys wild_comb, which is no kind of
item": the kind was declared in a later file. *Done*: all kinds hoisted into `clock.kyr`.

**HTH-9. Matters and facts share one namespace.** An occasion's matter `call_mead` and a latch fact `call_mead` were a
duplicate entity. Easy to fix once seen; the error did not say that one was a matter.

**HTH-10. An action's unbound parameter is not reported by lint.** An action with `site: place` whose requirements
never bind `site` offers one choice per place in the world, and the play tool says only "Ambiguous public command: an
action label hides a parameter". I then over-corrected with a script that bound `site` everywhere, including actions
where `site` meant the place danced *for*, which silently made them never offered. *Improvement*: lint a parameter
that no requirement binds.

**HTH-11. Text cannot vary inside a topic.** A reply that depends on two facts is two (or four) topics with the same
label and different conditions. Twenty after-topics were written as pairs. *Improvement*: `{if lit(stair): ...}` in
text, or `Says ... when ...` lines within one topic.

**HTH-12. Farewells cannot be authored.** "Take your leave" is answered from voice tables by manner. A grieving
widow's (manner grim) was "has gone back to work before you have turned round"; a careful bard's was "don't do
anything I'd be ashamed to hear about". *Done*: Agnes's manner changed to stoic. *Improvement*: a `Parts "..."` word
beside `Greets` and `Leaves`. (Conditional words, `Greets "..." when ...`, are supported by the parser but not in the
guide.)

**HTH-13. A shared rule consumes the state a module's rule waits on.** Duke, led home, is `home(duke, royal_gallery)`:
the shared `brought_home` rule retracted `following` before my rule could see it, so mine never fired. *Done*: mine
waits on `cameHome(duke)`. *Improvement*: say in the guide which shared rules run first and what they retract.

## Simulation and presentation

**HTH-14. An `as sound` observation in an unlit room was told, but its `teaches` was not learned.** The moth's sound
in the dark Capped Gallery appeared on the page; the milestone on knowing it did not fire. *Done*: the actions that
meet the moth assert the knowledge, and a rule teaches it once the moth is seen. Not reduced to a probe.

**HTH-15. An interrupted action says the wrong thing.** "Sit down beside Agnes in the dark", broken off when the moth
comes, is told as "Your light gives out, and there is no going on with it in the dark": the shared interruption text
assumes a light.

**HTH-16. Rule text is told before the place it happens in.** Arriving somewhere, a rule's `says` (Ivo's remark, the
moth) comes before the room's own description, so a remark about the handprints precedes the sentence that shows
them.

**HTH-17. A chapter or a long scene is told wherever its condition holds.** "The Calling" chapter, conditioned on the
occasion and on being anywhere in the Wold, opened for a company camped a day away under the Far Brow. Chapters need
their author to scope them to where the company is; nothing warns.

**HTH-18. Combat weight is hard to judge from a catalog name.** `like owlbear` at level 2, two of them, kill a
level-1 fellowship in one exchange; `like nightmare` at level 4 did the same. The arena (`bun run arena`) exists and I
did not use it; a lint advice comparing a hostile's strength with an ordinary company's would have caught it before
play.

**HTH-19. In a standalone campaign the book closes at the ending**, so return visits (after-topics at the new comb)
can only be played before the ending there, or in a generated world, where the world goes on. Not a defect; it shapes
what can be tested where.

## Names

**HTH-20. The name space is crowded.** The names lint compares surnames and place names across every adventure: it
refused Pollard and "the Crown" at once, and a search found Abery, Tench, Garrow, Marl, Bellamy, Loame and Fairweather
already used, and several first names (Sabeth, Dagny, Josiah, Gervase, Ursel) used often enough to confuse. A Deem table of surnames by region and register, which an author could draw from and which knew what was
taken, would save the round of renaming.
