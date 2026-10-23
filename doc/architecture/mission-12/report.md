# Mission 12: report

Mission 12 began from a plain judgment: the game was "profoundly unsatisfactory in ordinary human play". This report
says what was done about each failure that judgment named, what was built to do it, and, as plainly, what is still
not good enough. It is written for the person who will play the result and decide what comes next.

The revisions examined at the start, and the branch read but not merged (`house-that-grows-authoring` at `199db32`),
are recorded in the [diagnosis](diagnosis.md). That branch was not merged. The user's uncommitted `eslint.config.mts`
and `deem.run.json`, and the untracked `assets/`, were left as they were.

## The failures, one by one

| Reported | Now | Evidence |
|---|---|---|
| A dull, repetitive world | **Better, not solved.** Settlements are their people: residents at their work by day, at the inn or home of an evening, indoors at night; households, animals, a small trouble each. What grows wild grows where the land lets it. Two of Orsino's wonders stand in the wild and some in works; works may hold traps. But every settlement still has the same five parts (green, inn, shrine, shop, houses), and a long walk shows it. | `test/community.test.ts`, `test/marvels.test.ts`, [walks](../../playtests/mission-12-text/) |
| Settlements as service shops | **Fixed in kind.** People are asked about their work and know the country by it; an animal can be made much of; a goat gets out. | `test/community.test.ts` |
| Roads without experience | **Better.** A road is told as it goes: the land it crosses, the hour, the weather, coming in sight of the end. Nothing happens on a road beyond weather, riders and what the country's troubles put there. | `test/voice.test.ts` (journeys) |
| An unreadable map | **Better; not tested on a device.** The country is drawn as the cells the company knows, cropped to them, with names that stay on the map; the place you are in is drawn at reading size and scrolls rather than shrinks. | [journey pictures](../../playtests/mission-12-journey/), `test/land-map.test.ts` |
| The willow objective undiscoverable | **Fixed.** Willows grow by water as stands that can be gathered; the fever's road runs by water; the herb-wife and anyone whose work is the water say where. | `test/goings-on.test.ts`, `test/community.test.ts` |
| An unexplained death at the toll after a spell | **Fixed.** The riders say what they want and why; one may go with them; a lost fight ends in the lockup, not death; a death that does happen is told by what caused it. | `test/consequences.test.ts`, `test/continuation.test.ts` |
| Artificial waits | **Fixed.** No choice waits for an animation; a near move is 110–140 ms in the page, a road stage about 200 ms. | [performance](performance.md) |
| Repetitive narration | **Better.** Lines are chosen by circumstance and varied by moment; a seeded audit checks nothing on a page is said twice; reading four walks found and fixed six faults. Some repetition is structural and remains (see below). | `test/narration-audit.test.ts`, `test/voice.test.ts` |
| A web-app-like UI | **Replaced.** A book's page on the left, who and what is here on the right, with what can be done attached to each. | [journey pictures](../../playtests/mission-12-journey/) |
| A title exposing "The Long Man" against "Generated World" | **Fixed.** The title offers to go on, or to begin again in a country. The Long Man stands in generated worlds where it fits (beyond the north march of an upland or forest country), and still plays alone. | `test/frontier.test.ts`, `test/the-long-man.test.ts` |
| A brother who joins like a mercenary | **Fixed.** Kin join as kin, in their own words; he is "your brother", keeps what he could be asked at home, and can be sent home. | `test/voice.test.ts`, `test/recruitment.test.ts` |
| A dog that cannot be petted | **Fixed.** Dogs are real, tame, greet those they know, and can be made much of; the drover's dog gives a clue to whoever does. | `test/voice.test.ts`, `test/goings-on.test.ts` |
| Doors merged by identical labels | **Fixed.** Choices are told apart by their command, never their label. | `test/command-contract.test.ts` |
| Death without a causal report | **Fixed.** The obituary says what killed whom and how; the country remembers the dead with a cairn and can be begun again. | `test/continuation.test.ts` |

## What was built

- **Kyr** gained a module's own kinds and species, conditions that last outside fights, perception, tame animals, a
  die for each thing, acts that take no time, ways that open only while something holds, and arithmetic at run
  time; errors give file, line and column. The response to each of the 21 authorability findings is in
  [findings-response.md](../../authoring/findings-response.md): 10 repaired (one of them for declarations only), 7
  partly, 4 open.
- **Narration** became happenings told from voice tables, with Orsino's barks among them; an editor's review of every
  line in every person; a walk-and-write tool; an audit test. See [narrative.md](../../authoring/narrative.md).
- **The reader** was rebuilt: subjects with their acts, no waits, a new map, a world-facing title.
- **Generation** plans communities, growth, wonders and traps, and places authored countries.
- **Orsino**: every one of 2,651 entries has a computed place in the [inventory](../orsino-inventory.md):
  1,471 integrated, 197 represented, 751 kept as reference with the reason Kyr does it another way, 232 blocked,
  each with its exact blocker.
- **Paintings**: all 804 images in `assets/images` were read as images (dimensions, hash, embedded metadata), copied
  small for the page, and registered: 91 name an artist and 155 a title in their own metadata; 585 say nothing of
  themselves, and the registry says nothing for them. 475 are paintings of someone, and only those are shown beside a
  person. See [registry.md](../../paintings/registry.md).

Why each boundary is where it is: [architecture.md](architecture.md).

## Journeys and playtests

- Four seeded walks of 60 steps, written as the page tells them, in four countries with four protagonists:
  [doc/playtests/mission-12-text](../../playtests/mission-12-text/). They are machine walks, chosen at random among
  sensible choices; they are for reading the text in place, not a record of a person playing.
- A short browser journey (title, protagonist, arrival, green, asking, patting, map, road, reload) at 1280 and 390
  wide: [doc/playtests/mission-12-journey](../../playtests/mission-12-journey/).
- No person other than the author of the changes has played this build.

## Performance

In Chromium on a desktop: begin takes 2.3 s after the protagonist page has been read (3.9 s if begun at once); a near
move 110–140 ms; a road stage about 200 ms; reload to play about 1 s. **Safari, iPad and phones were not available
and were not measured**; Chromium's CPU throttling does not reach the engine's worker, so no slower-device figure is
given. Full numbers and what was not done: [performance.md](performance.md).

## What remains inadequate

- **The world is still made of the same parts.** Every settlement has a green, an inn, a shrine, a shop and houses;
  every inn has a dog; most residents are at a bench or a wheel. The people differ; the shape does not.
- **Nothing happens on the road** unless a trouble or the riders put it there.
- **The first hour can be quiet.** A protagonist who does not ask anyone anything can wait and walk for a long time
  and meet nothing.
- **People keep their posts at odd hours.** A salter sells a lantern at midnight; residents' days are coarse.
- **Riddles and shops from Orsino are not used** (the inventory gives the blockers), nor creature aspects, undead
  templates or fighting objects.
- **Kyr findings still open**: people and things that change at run time, who sees whom, observations by variable,
  fatigue.
- **Saves still carry the compiled module**: 2.5 MB of JSON, 270 KB packed, written after every command.
- **Begin pressed at once is slower than before the mission** (3.9 s against 2.9 s), because the country holds more.
- **No device testing.** The map and the page were checked at phone width in Chromium only.
- **No human playtest** of this build.

## Self-judgment

Of the fourteen failures named, ten are fixed in the sense that the specific thing complained of no longer happens,
and four are better but not solved: the world's sameness, roads, the map (untested on devices) and narration. The
game is less dull than it was, but a careful player will still find its seams within an hour. It is not yet a game
that would be judged satisfactory in ordinary human play; it is closer, and the tools to see what is wrong (the walks,
the audit, the review, the inventory) are better than they were.

Deployment: each push to `main` builds the site and deploys it to GitHub Pages by the established workflow; every
Mission 12 push deployed successfully.
