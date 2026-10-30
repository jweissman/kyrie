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

## Phase II, and the independent playtests

27. **`Seen when` hides a person but not their greeting.** The hob, hidden until the cream, greeted a company that
    walked into the mill ("'Ninepence,' he says, before you can ask"), with no hob on the page and nobody to talk to.
    Found by the browser playtest. *Done:* the hob, the glimmer-fox and the grass snake are `offstage` until found.
    *Could:* `Seen when` should suppress every telling of the person, the greeting included.
28. **`Known as` is not used in a warning's patience line.** "Bramble will wait 7 minutes more" named the owlbear
    before anyone had named it (and the playtester took Bramble for a goat met elsewhere). *Done:* the owlbear's name
    is "the young owlbear", known as Bramble once caught. *Could:* the patience line should use the known-as name.
29. **A module's weather is not the world's.** The circus threw its own rain at six, and "It is raining" was told
    under a header saying FAIR. *Done:* the rain is gone; a rotten seam may split in the night wind instead. *Could:*
    the region's weather readable by a module (`weather(sky, rain)`), so a show can be rained on honestly.
30. **A rule's `says` with no anchor is heard anywhere in the world.** A dozen of the circus's "news" rules (the canvas
    cut at the Fair, Madame Sallow refusing a contract, the hob leaving for the Rest) were told to a company in
    another town. Found by reading every unanchored rule after the Phase II clock was played out. *Done:* each
    anchored `near` its person or thing. *Could:* lint every unanchored `says` in a module that is installed in a
    shared country, as it already advises on anchored rules that change the company.
31. **Arrivals break a long wait.** Waiting "until dark" on the first town's green now stops at four, when the parade
    arrives. Right for a player; it broke a shared test whose premise was an empty green, which now waits again
    until it is dark.
32. **Generated-world transcripts carry digests of the whole world**, so any module placed in every world breaks every
    kept transcript though nothing it did changed. *Done:* the one transcript's digests re-recorded by replaying its
    commands (the place, the watch and the told text are identical). *Could:* `bin/kyrie keep --rekey`.
33. **A way back that needs what the way there needed.** Climbing the gatehouse by a check, without rope, left a
    company on the tower with no way down, because the stair "needs climbing or rope" both ways. *Done:* a climb-down
    action. *Could:* a passage needing something in one direction only.
34. **The journey driver's `>place` walks ways, not actions**, so a test of a place reached by an action (the tower)
    has to take the action by name. Correct, and worth knowing.
35. **The background time limit.** The full suite takes about half an hour alone and longer beside other work; two
    runs were stopped at the default thirty-minute limit before they finished.

### The browser playtest, split as asked

An independent agent played the built browser client for four in-game days without reading the circus's sources
(see [verification.md](verification.md)). What it found in **the circus's own authoring** was fixed in Phase II's
first commit: nothing said the circus was arriving today, and a player starting where it arrived could walk the whole
circuit behind it (it is now pitched in the fair town on the first morning, and bills say *TOMORROW* and *BACK ROUND
IN SIX DAYS*); the packed camp described itself as pitched on the road; no innkeeper said where it was *now* (each
now does); the hob and the owlbear had no way in (the hob was a greeting with nobody behind it; Billie now says where
the gear comes from, and the bee-wife gives honey on the Colonel's list alone); no hint led to the second lesson
(Mumchance now says to watch from the wing); the List of Wonders could not be read (it can); a booked turn was charged
at the flap (it is admitted); the playtester could not tell that the turn waited for it (the Colonel's introduction
now says the house waits, and the turn waits longer); the snake's catching had the Colonel and Billie speaking where
they were not.

What it found in **the shared interface and navigation (M18)**, not specific to the circus, and not changed here:
the title and creation screens do not answer the keyboard; on a place page Enter does nothing until an arrow is
pressed though the first choice looks selected; there is no clock shown except while moving, and no "wait until
seven", so catching an evening show is guesswork; "Make much of" with no animal named; "To among the trees of …";
a multi-stop route told as "then the road, then the road, then the road"; travel within a town stopping halfway
wherever people stand; daylight text at half past eleven at night and "the full of the morning" under an AFTERNOON
header; long choice labels drawn with a blank first line; danger at night with no warning on a town's own way
(revenants in a quarry-yard between an inn and a field); Notes stamping every fact with the time it was written down,
and filing an item given in play under "Known before you set out". Two the playtester attributed to the circus are
engine behaviour: the place description repeated under every act of the show (the room is re-described each watch),
and Ada's takings line told twice in one description.
