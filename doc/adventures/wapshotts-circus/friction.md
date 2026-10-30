# Wapshott's Peregrine Circus — friction

*What got in the way while writing and re-writing the circus in Kyr, in the order met. Each says what happened, what
was done about it, and what the language or tools could do. Written 30 October 2026.*

## Places and movement

1. **A place cannot move.** A circus is a set of rooms that goes from town to town, but a room has one parent for
   ever, and a room inside one town would be named as in that town wherever it was entered from. *Done:* five rooms
   for each of three towns (fifteen), with `groundRoom(ground, kind, room)` and one rule that settles everyone who
   `travels` into the room of their `post` on the current ground. Things that describe the circus (the big top, the
   cookhouse fire, the ring of wagons) are scenery `Thing`s that travel too, so the description goes where they go.
   *Could:* a portable area (`Place circus is encampment`) pitched within a settlement by a rule, with its rooms
   inherited.
2. **`Observe … near ?place` does nothing.** An observation near a variable bound to a place is never told; near a
   thing it is. *Done:* the travelling scenery things above, observed `near` them. *Could:* allow `near` a place, or
   lint the case.
3. **A `Rule … near ?var` is refused** ("Unknown near anchor"), though an observation may be near a variable. The
   heckling bout's outcome rules lost their anchor. *Could:* the same anchor grammar for rules as observations.
4. **There is no nowhere.** Persons parked "offstage" in a road room were met by a traveller on that road (Madame
   Sallow standing in a hedge before she had come into the story; an owlbear in the orchard at noon). *Done:* a
   relation `offstage` and one rule that retracts `at` for whoever holds it. *Could:* a shared `offstage`, and a
   `Person … nowhere` declaration.
5. **A closed way's description is said as part of the room.** "The big top is not here; the circus has gone on" was
   told at the tober while the show was on and the flap merely laced. *Done:* closed ways without text, and an
   observation that says why the flap is laced. *Could:* a closed way's text per condition.
6. **A room inside a town cannot be named for the town.** "Wapshott's ground by `{town_a}`" cannot be written; place
   names take no placeholders. *Done:* "Wapshott's ground" in each, the town being the room's parent.

## Facts, relations and arithmetic

7. **`addressed(person, company)`** has the person first. Written the other way, `metCircus` never held and the note
   was never served. Nothing warned. *Could:* lint a relation used with arguments of the wrong kind where the kinds
   differ only by role (both `group`).
8. **An exclusive relation needs two arguments.** `current(place) exclusive` was refused; the concern had to become
   an entity (`wapshotts`) so that `current(wapshotts, ground)` could be exclusive.
9. **No division, no remainder.** A wet house was to be halved; a nightly incident wanted a remainder of the night's
   count. *Done:* a flat decrease; a die (`dice(wapshotts)`) stored at the show's start and read in ranges.
10. **A measured time needs a clock measure set by the module's own rule** (`untilShow(clock)`), which works, but is
    written every watch for one action. *Could:* `Time until hour 19.`

## People and things

11. **`Known as` hides a name on the page but not in the talk choice.** The Sylph is "a woman in a silver wrap" in
    the list of who is here, and "Talk to Mademoiselle Zéphyrine" in the choices. *Not fixed:* the engine's talk
    label; noted for the builder.
12. **A local kind like `old_glossary` brings lore when equipped.** A list, a playbill and a serpent were offered
    "Equip", and equipping would have granted reading of old scripts. *Done:* `is gear`. *Could:* a plain document
    category.
13. **An item given by `Give` must be declared somewhere and hidden until a fact**, and the fact must be asserted by
    hand beside the `Give`, or the passage hidden by it never opens. *Could:* `Give` teaching its item's discovery.
14. **Local kinds are not namespaced** (`list_kind` would have collided with any other module's). *Done:* long names.
15. **A shared rule's parameter name blocks an entity name** (`box`), and a shared state name blocks a state (`shut`).
    The errors were clear; the namespace is still a minefield for common words.

## Placement in the world

16. **Nothing guaranteed a scenario's placement.** The library is drawn by weight; a standing institution needs to be
    there every time. *Done:* `data/scenarios/standing.json`, placed after the drawn scenarios so nothing drawn moves.
17. **No way to ask for "the next town along the road"** or "the road between two towns". *Done:* settlement needs
    `largest` and `along:role`, way need `between:a,b` (with a fallback to a road into the second town not already
    taken). Fewer than three settlements still falls back to sharing a town; not seen in the tested seeds.
18. **A going-on claims its town.** `any` settlements are claimed exclusively; a circus must share. *Done:* the new
    needs claim nothing.

## Checks and tests

19. **Retrying a check gives the same roll** when nothing else has changed: the die is keyed by seed, skill, maker and
    action. A night spent failing to lure the owlbear failed every night after. *Done:* chose a seed for the journey;
    day-gated retries (the lessons) do vary because the state differs. *Could:* key the die by the watch too, for
    actions meant to be retried.
20. **A choice's label carries its odds** ("… · an even chance"), so a test matching the label exactly fails.
    *Done:* prefix matches.
21. **A `Grave` choice is asked twice at the command line** but once by `Journey`; a steps list that works in one
    fails in the other.
22. **A territorial band stops a long wait.** Waiting out the Fair on the circus ground met the raiders at midnight and
    the journey stopped there, which is right, and surprising in a test of something else. *Done:* tests wait in the
    inn.
23. **Editing `src/` while the full suite runs** contaminates the run (bun loads each file when its test starts).
    Process, not language; the second pass ran the suite only after the last edit.
24. **Lint limits** (file length 380, function length 160) fell on `world-assembler.ts` and on one long `describe`;
    the way-binding moved into `ScenarioTowns.way`, and the tests split by subject.

## Writing

25. **The register listens to itself.** The house style (dry, specific, a gesture glossed as a speech) is easy to
    overdo across two thousand lines: *for a long time* fifteen times, *purring like a millstone* twice, five gestures
    that were each "in him, a speech". A grep for the author's own tics found them; there is no tool for it.
    *Could:* `kyrie voice` reporting a module's most repeated phrases, as it reports the shared voice tables.
26. **The same night told the same way.** A show that runs nightly read like a gramophone by the third visit.
    *Done:* each act told in full once and briefly after (`sawAct`), and one incident a night. *Could:* a construct
    for "the first time the company sees this, and after".
