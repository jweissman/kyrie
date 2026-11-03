# The Grand Tour

*A metropolitan region for Kyrie: a comedy of manners in a city of three storeys, with a fall from a balustrade in
the middle and a door that opens on anywhere at the top. Spoilers throughout.*

Sennet is a port in three storeys. On the bay, the quays and the glass-houses, and on the headland the House of
Doors, whose doors open on the elemental planes. Over the cloud-line, Cloudgate: a hill of the old city lifted into
the sky two hundred years ago, where it is always a fine afternoon and the servants never see the view.
Under the bay, the Whelm, the lower town the sea came into when the hill went up, where the merfolk live in the
drowned shops and their matriarch is called No Admittance, after a sign. Twelve days ago the Rector of the House
proclaimed the first Grand Tour in two hundred years: bring her the four petals of the Rose of the Winds, each asked
of its court in its own fashion, and be first through the Door of Doors. The same night her best student went over
Cloudgate's rail in the fog. He did not die. A merfolk girl caught him.

The commission's three seeds are all in it: *The Grand Tour* is the contest and the House; *Whelmed beneath Waves* is
the Whelm, its merfolk and its Aenean tide-engine; *Cloudgate* is the hill in the sky and the fall from its rail.

| Document | |
|---|---|
| [00 — treatment](00-treatment.md) | Stage 1: the original design |
| [01 — editorial](01-editorial.md) | Stage 2: a severe reading (E1–E15), and the design as revised |
| [02 — adaptation](02-adaptation.md) | Stage 3: Kyr, Deem and the engine read; what is said directly, worked round, and extended; placement |
| [03 — the map](03-map.md) | Sennet in a generated world; the storeys and planes; ways that are conditions; who is where when; the calendar |
| [04 — the small adventures](04-adventures.md) | Twenty threads, seven of them local; the planes' games; how they hold together |
| [05 — the story](05-story.md) | Synopsis, acts, people, conflicts, the eleven ends |
| [06 — environment and resolutions](06-environment.md) | What each storey costs; every knot and every way it is undone; consequences that bite |
| [07 — builds](07-builds.md) | Gates by skill and background; the Rose and the Undertow compared; five builds played; a company without charm |
| [08 — rewards](08-rewards.md) | Milestones, things, companions, and the Doorward's door |
| [09 — playtest evidence](09-playtest.md) | The suites; ten journeys; the portals compared; negotiations; outcomes; persistence; autoplay; from outside |
| [10 — critique](10-critique.md) | The final literary and experiential critique |
| [11 — changes](11-changes.md) | Names, design-to-build, what play and reading changed, engine and tooling |
| [12 — the second pass](12-second-pass.md) | **Read again as literature**: the diagnosis (whimsy as pulp, one key, no foreshadowing, a hollow villain, a calendar for acts); what was done (the Rector's history in the Courant, the Dowager her mirror, the Sexton, the race told, a wrong answer, foreshadowing, the larger world); what is still wrong; where 10× would start |
| [friction.md](friction.md) | Where Kyr, Deem, the engine and the page resisted, by severity, with remedies |
| [playtest/](playtest) | Twelve journeys as the page told them |

Documents 00–02 predate the build and use earlier names (Ambrose, Pollard, Mother Gannet, Nance, Rafe, the Ball);
`11-changes.md` has the key.

## Status

Complete and placed. Seventy-six places (fifty-one rooms) in three storeys and three planes, fifty-one ways,
thirty-three people, twenty-three threads, eleven endings and a closing account of some forty-five fates, thirty-one
milestones, sixty-three actions and a hundred and forty-six topics in about 2,900 lines of Kyr. Thirty tests in six
files pass; the campaign lints clean of errors and warnings. On the branch `adventure/grand-tour` (and the session's branch `claude/exciting-keller-wig7bg`, which carries the
same commits).

```sh
bin/kyrie lint data/campaigns/the-grand-tour.campaign.json
bin/kyrie play data/campaigns/the-grand-tour.campaign.json --choices
bin/kyrie play data/campaigns/the-grand-tour.campaign.json --as human/thief/Wren/burglar --choices
bun test test/the-grand-tour.test.ts test/the-grand-tour-outcomes.test.ts test/the-grand-tour-builds.test.ts \
  test/the-grand-tour-autoplay.test.ts test/the-grand-tour-placed.test.ts test/the-grand-tour-second.test.ts
bun scripts/the-grand-tour-transcripts.ts      # rewrites playtest/
```

## Files

| | |
|---|---|
| `data/adventures/the-grand-tour/` | The module (`sennet`): `clock` (the week, chapters, breath, followers), `city` (places and ways), `state` (petals and the story's state), `harbour` (the Quay, Bethan, Ha'penny, Pumphrey, Peg), `lamp` (Prue, Bassett, Pargeter), `murrey` (Fabian), `handbook` (the sixth edition and the seventh), `ascent` (the winch-gang), `collegium` (the House, the Rector, Tolley, Cole, Tench, Amis, Thursday), `cloudgate` (the Halyards, Jem, the funeral), `whelm` (the merfolk, Mercy, Perrin), `fire`, `earth`, `air` (the planes and their games), `rivals` (Florian and Miss Sone), `door` (the Rose, the keel, the coming down), `rector` (her plan), `lanterns` (the fourth night), `fall` (the case), `undertow` (the tide-engine), `courant` (the crier's board and the Rector's memoirs), `sexton` (the conger in the belfry), `history` (the Roll, the Museum, the register, the signs), `endings`, `aftermath` (the closing news), `growth` (milestones); `company` for the campaign, `placed` for a generated world |
| `data/adventures/countries.json` | Sennet's entry: a province of the first country, east, on its own land |
| `data/campaigns/the-grand-tour.campaign.json` | Tamsin, a bard, at the top of the coast road on the 9th of June 1290 |
| `src/world/region-borders.ts`, `src/world/region-gates.ts` | A province's notice and after-word told as a march's |
| `src/cli/play-tool.ts` | `--as` for campaigns; `--probe @relation` |
| `test/the-grand-tour*.test.ts`, `test/support/sennet.ts`, `test/fixtures/sennet/` | The suites, the helper, the journeys |
| `scripts/the-grand-tour-transcripts.ts` | Writes `playtest/` |
