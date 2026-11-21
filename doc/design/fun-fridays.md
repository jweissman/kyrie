# Fun Fridays

A small recurring creative experiment (the owner, 20 November 2026), inspired by the 282-item Pleasant Activities List
(doc/design/pleasant.md). **Build not only a world worth exploring or saving, but a world worth
spending time in.** A creative-content lane and a positive test of the engine, complementary to the mission's
priorities; not a reason to turn 282 activities into backlog obligations (no register rows: this record is its
accounting). Part of the direction kept in doc/design/directions-2026-11-20.md (§1, §10).

## What an experience pin is

A small, specific, playable experience, situated somewhere in the actual world, answering to several activities on the
list: an occasion, a particular person, a place worth visiting, a shared activity, or a small situation with a few
possible developments, met through the ordinary interface. Not necessarily a quest or a new subsystem.

**Successful when:** it is actually playable (in the world, not a paragraph or a catalog entry); it affords
participation (even only choosing to sit and listen); the world responds (people acknowledge one another, an animal
reacts, an object changes, a performance unfolds, time passes pleasantly); it is specific (a particular song, an amusing
exchange, a memorable view, a distinctive person, a satisfying result); it wants no instrumental reward (no XP, perk,
quest or meter made of every pleasure); and it reuses general capabilities (Kyr, Deem, the social and activity machinery,
the presentation) rather than a minigame each.

Music is an event in the fiction, given by a real person in a real place, working through prose and interaction (sound
later, diegetic, never browser background audio). A pleasant encounter is sometimes begun by someone else: being
invited, helped, given a gift, or seeing a friend succeed.

**How to run it.** A modest set at a time: two charming, fully playable pins over ten lifeless ones; more each Friday.
Each checked through the ordinary player interface (headless runner and page) and for persistence; judged by play:
would someone spend time here voluntarily, come back, smile, feel at ease, become curious, care about someone?

## The opening ideas (examples, not an assignment)

1. An evening at the inn: a musician plays, people talk, someone invites you, a little singing or dancing (#25, #46,
   #65, #94, #193, #234).
2. A pleasant walk in the countryside: birds, flowers, a view, weather, an animal (#90, #103, #114, #159, #209, #235).
3. A visit with a friend: pleased to see you, hospitality, a shared past, a gift (#32, #72, #108, #111, #164, #168).
4. Making something worthwhile: a meal, a repair, a garden, a gift made (#22, #50, #79, #91, #148, #217).
5. A village celebration: a wedding, fair, feast, games (#6, #44, #59, #94, #99, #222, #226).
6. A quiet place of one's own: a fire, the stars, a diary, solitude (#24, #97, #146, #166, #169, #212, #266, #273).

## Coverage record

One row per pin: where it is, the activities it answers, what already worked, what needed new authored content, which
reusable capability was missing (and whether it was built), and what play said.

| Pin | Friday | Where | Activities (#) | Already worked | Authored new | Capability missing | Play says |
|---|---|---|---|---|---|---|---|
| The old pump on the green, mended with Hesper Lowe | 20 Nov | every first town's green (Porthalen in iscoed), data/generation/town/neighbours.kyrt; test/hesper-pump.test.ts | 38 working on machines, 217 repairing things | a Thing with states and Changes, refused with a reason when she is not there; a Topic asked once; Observes; a Rule noting the company has walked off | the pump's four states, Hesper's invitation, her account of how a pump works, the children at it afterwards | none: met with what Kyr has. Wanted later: an observation told again on a return (each is told once, so her invitation shows only on the first look). The owner, after it: one authored scene is not the idea; the tinker kit is (doc/design/fun-fridays-tinker-kit.md, the three rows below) | three short steps with someone who loves how things work; the water so cold it hurts; nothing paid and no aim; the green answers when you come back |
| The tinker kit: a travelling tinker, generated, and a child's clockwork bird | 20 Nov | Porthalen's green (iscoed), data/kits/tinker/travelling, placed by the atlas's kits; test/features/pleasure/tinker-kit.pin | 38 working on machines, 217 repairing things, 240 doing things with children, 177 offering help | the composer (kit slots, a Deem proposal, `fix`), Deem labels for his name, tools and road; Changes gated by presence and `needing lockwork`; a check; Observes; clock rules | the kit and its three modules; the atlas's `kits` (StrategicAtlas.kits), so a kit is placed in one country | people in the ledger, so a kit can bind the practitioner already there (Hesper Lowe, Wrackham's Elfred); a profession as an entity; a practitioner's day | a pair of hands lent and a bird that sings four notes; a fumble a shared laugh; he goes on by evening, the bird left as it was if you did not help. The weakest of the three: his lines are the profession's (doc/design/fun-fridays-tinker-kit.md) |
| The tinker kit: an apprentice alone, and a hurdy-gurdy he made worse | 20 Nov | Wrackham's green (iscoed), data/kits/tinker/apprentice | 217 repairing things, 259 teaching someone, 177 offering help | as above; checks of insight and persuasion; a person fetched across the town | Tomos Bevan and his mistress Eira Ffowc, the wheel glued out of true | as above | seen and steadied, he mends it himself and waves after; or his mistress fetched mends it in a breath, and he will not look up |
| The tinker kit: a guild master short of a part | 20 Nov | Gatesend's green (iscoed), data/kits/tinker/master | 217 repairing things, 83 craft work, 130 learning to do something new | as above; `holding(actor, torch)` for an improvised part; a fact taught (`trade_open`) | Nest Cadwgan, the harbour lantern's cracked burner collar, her box of salvage | as above | competence asked for and shown; a torch spoiled and the lantern late; or a season's place at her bench, offered and kept as something the company knows |
| The night sky, watched | 20 Nov | anywhere out of doors after dark, in any world with a sky and a calendar: the shared act watch_sky (data/rules/core.kyr), told by src/narrative/night-skies.ts from data/voice/day.json (kind sky); test/night-sky.test.ts | 266 stargazing, 114 watching the sky, 97 sitting and thinking | the voice tables chosen by context (as a dog made much of, a wait come to dawn); Journeys.sky for the weather; the setting's sky (signs, their months and lines) through its port; each creature's birth sign | the act, fifteen lines across clear, cloud, rain and ash, the riding sign and one's own | a voice context that knows the month's sign and the company's signs (NightSkies; worth folding into VoiceContext if more tables want it) | not a scene: it arises wherever night is clear or not, says the season's sign by name, and finds the one you were born under; nothing gained but the half hour |
| The fiddle over the settle | 20 Nov | every first town's taproom (the Stone Horn in iscoed), data/generation/town/neighbours.kyrt; test/features/pleasure/the-fiddle.pin | 65 playing a musical instrument, 29 arranging a song | a Thing with states and Changes; a Topic with the generated innkeeper, asked once; a Rule noting the company has gone; an Observe as sound | the fiddle's five states, the innkeeper's father and his one tune, the boy whistling it on the green | a Change that goes otherwise by who does it (a performer plays it well first time; the rest saw it out like a goose): Changes take no check and no capability of the one changing; and a tune as a thing that travels (here one Observe stands in for it) | getting it wrong first, out loud, and the room laughing kindly; the second time it comes; the town keeps the tune, wrong note and all |
| The cards on the window table | 20 Nov | every first town's taproom (the Stone Horn in iscoed), data/generation/town/neighbours.kyrt; test/features/pleasure/the-window-table.pin | 40 playing cards | a person of the place; a Thing with states and Changes refused when she is away; a Topic asked once; a Rule noting the company has gone; an Observe on return | Morwen Ashlock, the old boatwoman who cheats at patience; beggar-my-neighbour lost, then won by watching her hands or by cheating back; the hand left dealt at the empty place | none for chance, found after: a Change takes no draw, but an Action does (`Resolve check(actor, insight, dc_fair)` with On success/Otherwise), so the second hand is a game: watched and played slow, a fair chance tried again, or cheated back, a hard one, caught and never again. Wanted still: playing against a companion, not only a stranger; a game's own small table of hands | losing out loud first and being laughed at kindly; the second hand yours; 'Tomorrow,' and a place kept |
| A letter home | 20 Nov | every market town's scrivener's (Porthalen's in iscoed), data/generation/town/teachers.kyrt (the scrivener section); test/features/pleasure/a-letter-home.pin | 223 writing letters | a generated person of the place (the scrivener); an Action with a cost and a time; a measure set to the clock and an Observe and Action waiting on it (`watch(clock) >= sent + 144`) | the letter said and written down, a penny; the answer under the stone a day later, read for nothing: the goat, the sister, the snow on the top field | the letter's news is the same for every company: who is at home, and what they would say, wants the character's own origin and kin (a table drawn from the origin, or Deem) | a day's wait felt: something comes back to you because you sent it; home named without being seen |

Capabilities found missing, by how many pins want them (one capability can serve many pins):

| Capability | Wanted by | State |
|---|---|---|
| People in the assembly ledger (a kit binds the practitioner already in a town) | the tinker kit (all three); Hesper Lowe's pump as its fourth realization | missing |
| A profession as an entity (competences, tools, practices, a guild), apart from a competence and an office | the tinker kit | missing |
| A practitioner's day as a declared routine (at work, gone on, shut), so an opportunity's arising and passing is declared | the tinker kit; the pump | missing |
| An observation told again on a return | the pump | missing |
| A kit placed in one country, not every frontier world | the tinker kit | built (the atlas's `kits`, 20 Nov) |
| A voice context knowing the season's sign and the company's own signs | the night sky | built (NightSkies), local to it |
