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
| The old pump on the green, mended with Hesper Lowe | 20 Nov | every first town's green (Porthalen in iscoed), data/generation/town/neighbours.kyrt; test/hesper-pump.test.ts | 38 working on machines, 217 repairing things | a Thing with states and Changes, refused with a reason when she is not there; a Topic asked once; Observes; a Rule noting the company has walked off | the pump's four states, Hesper's invitation, her account of how a pump works, the children at it afterwards | none: met with what Kyr has. Wanted later: an observation told again on a return (each is told once, so her invitation shows only on the first look). The owner, after it: one authored scene is not the idea; the tinker kit is (fun-fridays-tinker-kit, to come) | three short steps with someone who loves how things work; the water so cold it hurts; nothing paid and no aim; the green answers when you come back |
| The night sky, watched | 20 Nov | anywhere out of doors after dark, in any world with a sky and a calendar: the shared act watch_sky (data/rules/core.kyr), told by src/narrative/night-skies.ts from data/voice/day.json (kind sky); test/night-sky.test.ts | 266 stargazing, 114 watching the sky, 97 sitting and thinking | the voice tables chosen by context (as a dog made much of, a wait come to dawn); Journeys.sky for the weather; the setting's sky (signs, their months and lines) through its port; each creature's birth sign | the act, fifteen lines across clear, cloud, rain and ash, the riding sign and one's own | a voice context that knows the month's sign and the company's signs (NightSkies; worth folding into VoiceContext if more tables want it) | not a scene: it arises wherever night is clear or not, says the season's sign by name, and finds the one you were born under; nothing gained but the half hour |

Capabilities found missing, by how many pins want them (one capability can serve many pins):

| Capability | Wanted by | State |
|---|---|---|
| A voice context knowing the season's sign and the company's own signs | the night sky | built (NightSkies), local to it |
