# The Book of Faces: what Kyr can say, and the plan

*Stage 3. The revised design ([01-editorial.md](01-editorial.md)) checked against the engine as it stood on
3 November 2026 (branch base `dbbdeb4`, Mission 18's Gate B merged, the Grand Tour on main). What was read, what is said
directly, what is worked round inside the module, what general extension (if any) is proposed, and how the adventure is
placed.*

## What was read

The Kyr grammar (`src/lang/Kyr.ohm`), the authoring guide, the shared rules (`data/rules/core.kyr`, `care.kyr`,
`people.kyr`, `services.kyr`, `belongings.kyr`), the catalogs (classes, skills, items, abilities), how checks are rolled
(`src/rules/checks.ts`: a d20, the quality's modifier, proficiency where the skill is the member's, difficulties 10/13/16/19),
how a company's capabilities are projected (`party-capabilities.ts`), the province mechanism of Gate B
(`src/world/provinces.ts`, `countries.ts`, `frontier.ts`), the language review of the Grand Tour
([friction.md](../the-grand-tour/friction.md): the single most useful document in the repository for an author) and
five earlier adventures' Kyr as models of a city with many small stories. A probe module was written in the first hour
and played from the terminal (`bin/kyrie play … --choices`), which is cheap (under two seconds); the loader is not
(a thirty-second lint for a module of this size, more under load).

## What Kyr says directly

| Design need | Kyr |
|---|---|
| A city of seven Sleeves, a reed-garden and a cistern site | Settlements and wildernesses *within* a region; levels for roofs and cellars (a ladder or stair must change level, and lint says so); streets and squares as rooms of a settlement; ways are bridges, ferries, steps, paths, culverts with times |
| Nine days; day and night as two cities | `day(clock)`, `hour(clock)`; queries `publicHours()` and `privateHours()`; a campaign `night` of 20:00 to 08:00 so that the page's dark and the city's bare hours are the same |
| A person who is a different person by day and night | Topics gated on those queries and on what the company wears; schedules by rules on `hour(clock)`; `Role … when` and `Known as … when not knows(…)` for what a mask hides |
| A mask as a thing a company wears | **Faces are entities of a module kind**, `wears(party, face)` an *exclusive* relation (a new wearing replaces the old), `holdsFace`, rental by an action with a `Speaker`, a rule that returns the rented face at the Ninth Bell |
| What the city thinks of a mask, not a person | Measures on the face entity: `goodwill(face)`, `faceHeat(face)` |
| The Watch's patience | A measure `heat(party)`; rules that cool it each morning and shut the Gate at six; a query `warrantLive()` that every Warrant-only act asks |
| Naming, Unfacing, lifting a mask | Three generic actions over `unmaskTeaches(person, fact)`: the person's file says what lifting their mask teaches; the shared actions do the lifting, the saying, and the heat |
| The Rounds, the Marks | `Kind round`, nine entities; `roundDone(party, round)` and a generic rule that counts a Mark once for each |
| The Lie, deducible | Five discoveries each from a different small adventure, a rule per clue that counts it once, and a rule that **teaches** `urn_hollow` when any three are known (`urn_deduced`): the Drawing Table |
| A lie someone has chosen to be told early | A sealed letter, an item whose reading is an action, with two readings (early; at noon on the ninth day in the Chapel) |
| A body to be examined, not just looked at | A thing with `masked` and `bared` states; three checks (mending, insight, lore) and a no-skill vigil; each teaches one fact |
| Five ways through one door | A thing on the Registry's way with two `Change`s (lockwork; the Contessa's old key), a rule that opens it by right when the Hearing has sat, an action per Office face shown, a way in under it from the cisterns, a hidden way (`opening when`) from the Contessa's study |
| The Hearing of the Unseen | Three Guild entities, `concurs(guild)`; per Guild an *easy* action (earned by a deed already done) and a *hard* one (a check at `dc_hard`); then a calling action and three ways to lay the case |
| The Drawing: seven positions, not seven prizes | Seven actions, each `Requires` its own state of the world and each asserting `way…(party)`; first-match endings in order |
| What the night does | A measure `order(party)` raised by rules for each Hand played and each trust earned; queries `calm()`, `uneasy()`, `riotous()` read by the closing news |
| Eight callings, each with an arc | A file each, each ending in `handReady(party, hand)` and an action at the Urn Hall that asserts `handPlayed`. A calling is not gated by name: an arc *rewards* what a class brings (skills, spells, the shape of a day) and a company without it still finishes |
| Closing news, ninety fates | Rules `when newsHour() and … once says "Of Z: …"`, as the Grand Tour did |
| Rewards | Items of the module's own kinds `granting` a skill; `Resolve endow(member, quality, degree)` (from the Parliament's Manuals); `Resolve reward` (a shared catalog spell taught); coin; a person who becomes `willing(person, party)` |

## Worked round inside the module

**W1. Faces cannot be items.** `Kind … granting` reaches only the shared catalog's skills, a mask that *is* an identity is
not a skill, and a worn item is worn whenever its slot is free. A face is an entity the company *wears*, not carries; the one
mask that is also a gear item (the white domino) is a kind of its own that grants `insight` and is also a face.
**W2. A person cannot be both a Person and a Kind.** Persons are `group` entities (the guide's `host: group`), and
relations about them say `(group)`; there is no `person` kind. `Relation named(person)` failed at load.
**W3. A place name is unique across adventures, and so is a person's surname.** Lint's `names` check refused a
second "the Registry" and a second "Vane". The Registry became *the Registry of the Concord*; the Candid became Hart.
**W4. A rule that teaches orders its clauses.** `Rule x when … says "…" teaches fact { }`, not the other way (the
grammar's order is `once`, `says`, `teaches`); the loader's message is the grammar's, not the author's.
**W5. `willing` is a pair.** `willing(person, party)` and `hire(person)`, not `willing(person)` (the Grand Tour's
`murrey.kyr` is the model).
**W6. Two files cannot both own where a person is.** Two rules, in two files, each asserting where one person stands
at a time of day fight on every pass. The Hearing therefore does not gather its speakers in the nave; the Guilds'
concurrences are asked where the speakers are, and the Hearing sits with only the Chaplain (the Presider) in the room.
**W7. A Result cannot vary.** As in the Grand Tour (friction 6): the telling of a place by day and night is two
observations, and an action's result is neutral about the hour.
**W8. A calling's reward is chosen by the member, not the company.** `endow` takes a member, so the rewards are
`Action …(actor: group, who: member, site: place)`, one offered per member.

## What was extended

*No engine change.* The adventure asked for none that could not be said in the module. Where it would have been
cleaner, the extension is recorded in [friction.md](friction.md) as a proposal: *an item that grants a module's
capability* (Grand Tour friction 1 and 9 again: it would have let the white domino be both a face and a skill), *a way
that is open to those who wear a face* (the Doorward's judgement of the Fit is four actions where one condition would do), and
*a person's two registers declared once* (every one of some thirty people has a day-and-night pair of topics that a
single `Register` clause could have said).

## Placement

A **province of the first country** (Gate B), as Sennet is, on the **west** and on **fen and meadow** (`covers`): Ombra is
the country's delta city, its way in a few cells in from the west, with a road to it from the nearest town. Every town's
keeper tells of it, and every town has the Watch's notice nailed up (`notice` in `countries.json`: the first
use of the province notice by a work that is not the Grand Tour); the first time the company stands at the way in, the
module is installed within the country, and the road on comes down the delta road to the Customs Steps. The Novena's
days count from the first morning after it is reached. Standalone, `data/campaigns/the-book-of-faces.campaign.json`
builds the region alone, with Wren (a warrior), at the end of the delta road at eight on the first morning, 2 October 1290.
It is not on the title page's list: it belongs to the world.

The seed's choice does not matter to it: a province is in every world. Its place on the country's map is checked in
`test/the-book-of-faces-placed.test.ts` against the Grand Tour's and every other province's.

## The files

See [README](README.md): thirty-two files of Kyr, grouped as the spine (`city`, `clock`, `state`, `faces`), the case and
the finale (`warrant`, `rounds`, `body`, `hearing`, `registry`, `serene`, `vane`, `drawing`, `endings`, `aftermath`,
`growth`), the districts and their small adventures (`gate`, `maskers`, `counting`, `post`, `drip`, `local`, `hill`,
`cisterns`, `heronry`, `bard`, `chapel`), and the eight callings (`warrior`, `mage`, `thief`, `cleric`, `bard`, `ranger`,
`monk`, `commoner`).
