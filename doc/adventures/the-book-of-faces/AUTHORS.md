# The Book of Faces: brief for authors

*Read this, then [00-treatment.md](00-treatment.md) and [01-editorial.md](01-editorial.md) (the second is the design the
build is held to). You are writing one or two files of the module `ombra` (`data/adventures/book-of-faces/`).
The spine is written and lints clean: the map (`city.kyr`), the clock (`clock.kyr`), what everyone reads (`state.kyr`),
the face-wearing rules (`faces.kyr`). Do not edit files you do not own.*

## What this is

Ombra is a delta city of masks where it rains nine days in ten. By day (08:00 to 20:00, the Masked Hours) everybody is
masked and **nobody answers a bare face**; to be spoken to the company wears a face (rented at the Wardrobe Annex
for three coin, or earned), and the city speaks to the *face*. By night everybody is home and unmasked, and a bare
knock is received and a masked one is a burglar. The Registrar, who kept the Book of Faces, is dead; the Book is
gone; the Drawing is in nine days; the player is the **Bare** hired by the Watch under the Stranger's Warrant to look
at what nobody may. Behind it is a secret (the Urn is empty and the Registrars have chosen the Offices by hand for
thirty-one years) and four people who each did something to her last night.

**The tone** is rain-noir with a dry civic comic edge and a melancholy centre: Venice by way of a clerk who has
read too much law. It is not whimsy. A joke in Ombra is a rule followed to its humane absurd end; a cruelty is a name
said aloud in a square. Sensory: wet wool, tallow, lacquer, oiled paper, boiled eels, the smell of a mask's inside
(sweat and glue and other people's breath). Restrained second person. People speak in their own idiom, and a mask
never explains itself. Masks are always given as **pattern and trade** ("a woman in the Ferrymen's gull-domino"),
never as a name until the company has learned the name. **Never explain the Concord in a speech.** Show it done to the
player. Prefer a person's reluctance to their exposition.

## Your deliverable

One or two `.kyr` files (named in your task) in `data/adventures/book-of-faces/`, a test file or two in `test/`
(`test/ombra-<yourfile>.test.ts`), and a short note `doc/adventures/the-book-of-faces/notes-<yourfile>.md` with: the
threads you built (beats, approaches, consequences), what you invented that other files might read, what you could
not say in Kyr (friction, with what you did instead and what would remove the need), and what is thin. Work in your
own git worktree and branch; commit; the integrator merges.

## What a small adventure is (the editorial's rubric; check yourself against it)

Not "accept request, do one thing, reward". Each thread has **a person with a recognisable motive**; **a place or
object that matters**; **something misunderstood**; **at least two genuinely different approaches** (they must
differ in what they cost and what they leave, not only in which skill rolls); **a complication or discovery that
changes the reading**; **a consequential resolution**; and **some later effect** on other people or places
(`Observe`s, topics, prices, a person who greets you differently, a rule on the clock). At least **three beats**: ask,
find out, act, and the act turns out to have a second face. Several threads are *local*: their stake is personal,
comic, practical or tender, not the Drawing. Keep them local. Do not tie everything to the plot.

Every thread has a **default if left alone** (a clock): what happens on day *n* if the company has not come. Say what in
a rule (`Rule ... when day(clock) == n and not ...`).

## Conversation (the second rubric)

People have **two registers** (editorial E5): *public* (masked, by day) and *private* (unmasked, at night, at home or in
their quarters). Gate topics on `publicHours()` / `privateHours()` and on `masked(actor)` / `not masked(actor)`.
A person met by day by a **bare** company says one cold thing and nothing else (write it: a `Topic` on `not masked(actor)
and publicHours()`; an indifference particular to them, not a template). A person met by day by a masked company
answers *as the face is met*: a trade mask is a colleague, a stranger, a customer. Use `wears(actor, face_gull)`,
`goodwill(face_gull) >= 2` to open further. A person at night answers a bare knock.

**Substantial conversations** (your task says which) have at least three beats, **at least three skill checks** (an
`Action` with `Speaker`, `Resolve check(actor, <skill>, dc_fair|dc_hard)`, `On success`, `On failure` / `Otherwise`),
branches that do not rejoin at once, and a **person who changes their mind for a reason other than evidence**: say
what moves them (the editorial's table, E10). Checks use skills from `data/catalog/skills.json`: persuasion,
deception, intimidation, insight, lore, performance (charisma, wisdom, intelligence); stealth, lockwork, trapwork
(dexterity); mending, rites, woodcraft, wayfinding (wisdom); brawn, climbing, digging. At least one route through every
substantial conversation should need none of charisma's skills (a thing carried, a favour done, an hour waited, a name kept
secret).

Several comic or personal moments should come from **procedure**: a rule followed to its humane absurd end.

## The shared interface (declared in the spine; use as written)

*Time:* `publicHours()`, `privateHours()`, `swapNight()`, `drawingNight()`, `day(clock)`, `hour(clock)`, `watch(clock)`,
`dark()`. Day *n*'s chapter is declared; do not redeclare.
*The Warrant and the Watch:* `warrantHeld(party)`, `warrantLive()`, `heat(party)` (measure, 0 to 6; add to it with
`Increase heat(actor) by 1.` for an Unfacing, a mask lifted, a burglary seen; it cools one a day; 3 suspends the Warrant;
6 shuts the Gate and ends the book), `gateShut(party)`, `faceOffered(party)`, `faceTaken(party)`.
*Faces:* entities `face_gull face_owl face_cockle face_heron face_magpie face_moth face_crow` (trade faces, rentable),
`face_key face_pound face_serene face_white` (Offices; never rentable). `wears(party, face)` (one at a time),
`masked(party)`, `holdsFace(party, face)`, `goodwill(face)` and `faceHeat(face)` (measures: what the city thinks
of a *mask*; raise `goodwill` of the face the company wears when it does a mask's kind of good: `Increase
goodwill(face_gull) by 1.` is meant to be asserted by the thread that was done *as* the Gull, in an action that
`Requires wears(actor, face_gull)`. A thread done bare leaves no goodwill and a named gratitude), `fitted(party, face)`.
*Naming:* `unmaskTeaches(person, fact)` (declare for each masked principal: `Initially Assert unmaskTeaches(lacke,
lacke_face).`) enables the generic `lift_mask_warranted`, `lift_mask_bold` and `name_aloud`; `named(person)` holds after
a person is Named: your file says what that does to them.
*Rounds:* entities `r_ferry r_lovers r_peck r_soup r_pound r_lacke r_pip r_heronry r_gaspar`. When a Round's story
is brought to an end its person can live with, `Assert roundDone(party, r_x).` (the spine counts the Marks).
*The case:* discoveries `marrick_dead rounds_known pell_hid_book serene_saw lacke_unfaced lacke_taxed pip_saw
marrick_was_treasurer sluice_known lie_tally lie_wall lie_peck lie_urn lie_rounds urn_hollow private_stair_known`;
teach them from topics, observations, rules (`teaches`), actions (`Assert knows(actor, x)`). Which thread teaches which
is in the table below. The Book is `book_of_faces` (an item of kind `book_of_faces_kind`); the company has it when
`carries(party, book_of_faces)`; you may not move it unless the table says so.
*Hands at the Drawing:* entities `hand_stair hand_likeness hand_cast hand_blessing hand_lampoon hand_heron hand_door
hand_procession`. A calling arc asserts `handReady(party, hand_x)` when its finale becomes available; the
arc's own Drawing action(s) assert `handPlayed(party, hand_x)` and set the arc's own relations; drawing.kyr reads
`handPlayed` and the relations you say it should. *Your arc file ends with its own action(s)* at `urn_hall` on `drawingNight()`.
*Moves between files:* `loversMet loversRevealed loversTogether` (lovers), `castTaken(party)` (a cast of the
company's face on the Wall), `privateStairOpen(party)` (the Contessa's stair), `bookRead(party)`.
*Closing fates:* declare rules `Rule x_fate when newsHour() and <condition> once says "Of Z: ..." { }` for what became of
each of your people. `newsHour()` is true on the ninth day from eleven at night until the book closes (declared by the
integrator in `endings.kyr`). Several fates per person where the outcomes differ. This is where an author's
voice shows most.

## Who owns what (ids you may reference from other files)

| File | Owner | Persons and things you may *reference* by id (declared there; do not redeclare) |
|---|---|---|
| `faces.kyr` | spine | `moll` (the Annex clerk; you may add topics `with moll`, never redeclare) |
| `warrant.kyr` `rounds.kyr` `body.kyr` | integrator | `vail` (Sergeant Ottoline Vail of the Masked Watch), the ledger item `rounds_ledger`, `marrick_body` |
| `hearing.kyr` `registry.kyr` `drawing.kyr` `serene.kyr` `vane.kyr` | integrator | `hobb` (the Serene), `vane` (Orsolya Vane, the Candid), `chaplain` is chapel.kyr's |
| `gate.kyr` | gate agent | `tibb` (Mother Tibb, Hospice), `peck` (Absalom Peck) |
| `maskers.kyr` | maskers agent | `pavane` (the Fitter), `dov` (the apprentice) |
| `thief.kyr` | maskers agent | |
| `counting.kyr` | counting agent | `lacke` (Warden of Locks), `fenn` (his clerk), `assessor` (the Assessor of the Pound), `thole` (Master of Measures) |
| `mage.kyr` | counting agent | |
| `post.kyr` | post agent | `pell` (Tomas Pell), `dunnage` (the Postmaster), `strake` (Mabel Strake) |
| `local.kyr` | local agent | `cosimo` (Cosimo Dray, the Heron), `lamb` (Hester Lamb, letter-writer), `sweet` (Barnaby Sweet), `ostler` `penhallow` |
| `drip.kyr` | drip agent | `rill` (Rill Ketch), `nobody` (Sister Nobody), `rainmother` (Goody Pallet), `steward` (Jory Nance, the lamp-trimmers' steward) |
| `commoner.kyr` | drip agent | |
| `hill.kyr` | hill agent | `tarn` (the Contessa Ismene Tarn), `gaspar`, `lisbet` (the heir, in the sempstresses' loft in the Drip) |
| `warrior.kyr` | hill agent | `reeve` (Captain of Seconds) |
| `chapel.kyr` | chapel agent | `chaplain` (Father Ansel), the lamp-table, `lamp_table` |
| `cleric.kyr` | chapel agent | |
| `monk.kyr` | gate agent | `amery` (Brother Amery) |
| `cisterns.kyr` | cisterns agent | `pip` (Pip Treen) |
| `heronry.kyr` `ranger.kyr` | cisterns agent | `garrity` (the pigeon-master), `heron` |
| `bard.kyr` | bard agent | `orme` (Madame Orme, the Wet Stage's manager), `ludd` (the censor) |

Where a thread of yours needs a person from another file in a scene, write the topic in *your* file `with` that person
(topics are the speaker's: `Topic x with rill ...` may live anywhere). Where it needs a fact from another file, use
only what is in the shared interface above, or declare your own relation, prefix it, and say so in your note.

**Which thread teaches which fact:**
`lie_tally` the Rain-Wives' tally (drip) · `lie_wall` the Wall's shelves (maskers) · `lie_peck` Peck (gate) · `lie_urn`
the Urn (registry) and the cisterns' view of it (cisterns) · `lie_rounds` the ledger (rounds) · `marrick_was_treasurer`
Peck (gate), the cast of her face (maskers) · `sluice_known` Peck (gate), the Rain-Wives (drip) · `lacke_taxed`
Fenn, the strongroom ledger (counting) · `lacke_unfaced` Pip (cisterns), the lamp-table's wax (chapel) · `pip_saw`
the lamp-room (chapel), the lamp-boys (cisterns), Garrity's birds (heronry) · `serene_saw` Hobb (serene), the lamp-room (chapel)
· `pell_hid_book` the Dead Letter Office (post) · `rounds_known` the ledger (rounds) · `private_stair_known` the
Contessa (hill).

## Conventions (the module is one namespace)

- **Prefix every id you invent** with your file's prefix and an underscore: gate `gt_`, maskers `mk_`, thief `th_`,
  counting `ct_`, mage `mg_`, post `ps_`, drip `dr_`, commoner `cm_`, hill `hl_`, warrior `wr_`, chapel `ch_`, cleric
  `cl_`, monk `mo_`, cisterns `ci_`, heronry `hr_`, ranger `rg_`, bard `bd_`, local `lc_`. The persons named in the table above are the
  exceptions: they take the bare ids in the table. Ids for entities, items, relations, measures, discoveries, kinds,
  topics, actions, rules, observations, milestones, queries all share the namespace.
- **You write the scenes of the rooms in your district** (`Observe x_scene at room when true "..."`; see the first
  lines of `doc/authoring/guide.md` §6). The room ids are declared in `city.kyr` (comments say which file owns which);
  you may add rooms and ways of your own *inside buildings you own*, declared in your file. Do not add ways to
  the map's shared bridges.
- **Rooms are described after what the day does to them**: in rain, at night, with the Masked Hours on and off. Give
  at least two scenes (public, private) for each of the district's streets.
- Write **people** with `Role`, `Ancestry`, `Pronouns`, `Manner` (one of: proud grim cheerful acerbic compassionate
  stoic jovial), `Greets`, `Greets again`, `Known as "…" when not knows(party, <fact>)` for masked principals, and a
  schedule by rules on `hour(clock)` for the ones who move (see the Grand Tour's `collegium.kyr` for `Rule quance_*`).
- **Milestones** (experience): declare your own `Milestone x "…" worth N when <cond>.` Worth 25 for a deed, 50 for a
  small adventure, 75 to 100 for a large one, 150 for a thing that changes the city. Do not give experience for the
  Rounds as such (the spine's Marks are not experience).
- **Discoveries need text** (the journal shows it). Write each as one plain declarative sentence.
- **Results cannot vary.** An action's `Result` is one string; vary the telling with Observations, not with Results
  (friction 6 of the Grand Tour).
- **A topic is `once`** if it does something; one that only teaches is offered again as "Ask … again".
- **No exposition lumps.** Cap a person's single turn at about 90 words. Several short turns in a branching talk beat
  one long one.
- **Real alternatives:** write at least one resolution that costs something and one that costs nothing but time, and
  at least one that a company with **no charm and no learning** can do.
- **Comments:** the repo's lint requires comments explain *why*, in the Kyr's own `//` style (see the Grand Tour); do
  not comment out code.

## Where the syntax is shown

`doc/authoring/guide.md` (read fully; it is the reference); the Grand Tour's files in `data/adventures/the-grand-tour/`
(people `harbour.kyr`, `collegium.kyr`; checks and actions `collegium.kyr`, `cloudgate.kyr`; the lower storey `whelm.kyr`;
occasions `lanterns.kyr`; fates `aftermath.kyr`; milestones `growth.kyr`; the second pass `12-second-pass.md` and the
friction list `friction.md`, which will save you days). `src/lang/Kyr.ohm` is the grammar. Other models: Gosse's
Company (`data/adventures/gosses-company`), the Banns at Hessel, Low Water, A Parliament of Books (manuals; endowments).
Things that can be given as rewards: items of the module's own kinds (`Kind k "…" is gear worth N weighing N granting
<skill> described "…".`), `Resolve endow(member, quality, by_one|by_two|by_three)`, `Resolve reward(lesson, recipient)`
(a spell or technique from the shared catalog taught to a member; see `data/catalog`), coin, a companion (`willing`
persons who `Joins`), a milestone.

## How to work and test

```sh
bin/kyrie lint data/campaigns/the-book-of-faces.campaign.json          # about 30 s; 0 errors, and read the warnings
bin/kyrie play data/campaigns/the-book-of-faces.campaign.json --choices   # the offered actions at the start
bin/kyrie play data/campaigns/the-book-of-faces.campaign.json --seed s --steps steps.json "^To the Customs Steps"  # play by labels
bin/kyrie play ... --as human/thief/Wren/burglar --choices                # another build
bun test test/ombra-yourfile.test.ts
```

Play your own threads. A passing test is not the point; **play it as a player would**: read the page, take the wrong
option, wait, come back by night. Fix the prose where it is flat. `test/support/ombra.ts` has the helper (`Ombra.start`,
`.play(...labels)`, `.holds`, `.knows`, `.measure`, `.until`). Tests must be quick (under a minute each) and deterministic
(a check's die depends on seed and history: write `"?Persuade …"` where a step's check may go either way, and prove the
failure branch by a seed or by a build that cannot fail). Write at least: a happy path per thread; one alternative
resolution per thread; one **offered-action exploration** that, from a state, takes the first offered legal action
200 times (or `kyrie play --choices` repeatedly) and asserts the world never enters an invalid state (a person in two
places; a fact known that cannot be; an action offered that does nothing); and one persistence test (a thing done stays
done across a rest or a day).

`bin/kyrie lint` is slow and shared across authors; run it when you have finished a coherent piece, not on every edit. The
module must lint with **0 errors**; take the warnings seriously (an action with no possible target is a bug; an
advice "write-only" for a relation you invented means a thread not taken up).

Do not touch `module.json` (the stubs are in); the other files are stubs `Module ombra "The Book of Faces" { }` until
their authors fill them. Merge conflicts will be on files you own.
