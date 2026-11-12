# Mission 20 → Mission 21 handoff (the cutoff, 12 November 2026)

**Status: implementation work, not acceptance.** No human has accepted the first hour. Eleven rounds of cold play by
agents were run; their ratings are an agent's, not a player's. This page says what Mission 20 delivered and how each
part was checked, what is still wrong, and, apart from both, what was registered for later.

- 313 commits since Mission 19 closed (7302392c), at this writing.
- The log (`log.md`) runs to E202.
- The register (`../open-register.md`) holds every open item, with its source.

## Part 0. The landing (12 November, evening): read this first

**Where things are.** Main is `__MAIN__`. It holds Mission 20's work, the adventure branch integrated (all its standing
modules in every first country), and the after-cutoff fixes E205–E222 and T24-07…13. __CI__

### What Mission 20 achieved

- **A first hour that can be followed.** The aim's gold leads to the next step and only there. A colour on a person
  or a mark leads to the act it promises. Up to four led acts are drawn across the scene, the posted notice among them.
  Talk keeps its numbers, the way back is on the scene, and the keep door's P0 is fixed (E163–E216; rounds 9–11 of
  cold play, agents only).
- **One resting scene.** The cinematic study is now the only composition: the telling on the painting, rounded-cap
  lines, and who is here under a Talk lens. Go and Look are tiles over the painting, but their lists are still pages
  (E217).
- **A safe zone** of the outer tenth on every page, now checked by spec on the scene, creation, the map, the book, a
  conversation and a fight (E218, E222).
- **The adventure branch integrated:**
  - the Bound Howe, the Silent Lord's keep, the walk, the fellowship, the arcology and the circus, standing in every
    country;
  - two rounds of CI failures fixed, two of them real faults: saves overflowing browser storage, and the standing
    people's ancestry against a country's (`integration-first-steps.md`).
- **Recurring problems closed:**
  - Kindle's 1d3+10 healing (E214);
  - the lodger (E211);
  - the spiders' eggs (E212);
  - light in the dark (E213);
  - the dead man's map in the pack (E221);
  - a beast's warning (E220);
  - the still likeness's empty line (E219);
  - the bed hint (E222).

### What is still broken (ranked)

1. **The suite's balance on CI.** One spec (`all-in-one-world`) had run into its own 25-minute timeout and held a
   shard to its limit in every run since the integration (T24-01): each province's install costs more the more are
   installed, quadratically (T24-11, unexplained). It now teleports to each gate and runs with the long descents
   (2.4 minutes locally). 194 files' CI times are still estimates until a run finishes every shard.
2. **No human has played Mission 20.** Every cold round was an agent (PD-14). No cold round has been played on the
   integrated build either (AI-07).
3. **Go and Look are still pages** beside their lens tiles (T24-03, proposal B). There are three menu styles
   (T24-04, proposal A), and no structural safe frame (proposal C).
4. **The telling overflows** the resting panel, badly on a phone (T24-05). It needs shorter narration, not CSS.
5. **Fights are too easy** at the start and too swingy alone (R10-12, R11-05). The Bound Howe raid can fall on a
   company sitting in a taproom, and the branch's mummy beats a lone first-level warrior (open balance questions).
6. **Paintings still contradict the text** (R10-08, R11-09). Out of doors the painting now follows the hour; nothing
   else has changed.

### The test-loop baseline (`test-loop.md`)

| Step | Now | Measured route |
|---|---|---|
| typecheck | 28 s | 4 s incremental (measured) |
| lint | 24 s | 1.7 s with ESLint's cache (measured) |
| quick suite | 34.4 s wall, **321 CPU-s for 38 CPU-s of work** | 10.6 s as six plain `bun test` processes (measured), or bun's `--no-isolate` (not yet measured) |
| a generated world's start | 7–8 s (14 s cold) | 1.1 s resumed from a kept checkpoint (measured) |
| the whole suite on CI | 813 file-minutes in ten shards, one shard past 60 minutes | see the 25-minute spec, §3a |

### The first experiments for Mission 21 (ranked in `test-loop.md` §4)

1. `test:quick` as balanced single-process chunks, or with `--no-isolate`, run twenty times shuffled for order
   dependence.
2. `typecheck:fast` and `lint:fast` (incremental and cached), with CI keeping the full ones.
3. `all-in-one-world` replaced by a declaration-conflict check plus two live installs.
4. Kept started worlds (`Worlds.started`) for the six specs pinned to `standing: []`.
5. Bed fixtures for engine invariants proved through Westernesse (§5). The first two to port: `weary-fights` and
   `voice`'s hour.

### Where the evidence is

- `mission-20/log.md`: every fix, E1–E222.
- `open-register.md`: §21–§24, with §24 the after-cutoff rows (T24-01…10).
- `mission-20/test-loop.md` and `evidence-tools/test-loop/`: the measurements and the scripts that took them.
- `mission-20/studies/screens/`: contact sheets at four sizes, components, trouble spots, and the owner's three
  proposals weighed. The probe that makes them is in `evidence-tools/screens/`.
- `mission-20/studies/typography/`: the face call and the cinematic study.
- `mission-20/integration-first-steps.md`: the integration's decisions and both rounds of failures.
- `mission-20/briefs-audit.md`: the briefs against what was done (as of the cutoff); the register's §21–§24 since.
- `mission-20/cold/`: rounds 1–11 of cold play.

## Part 1. Mission 20 delivered and verified

### The first hour, as it stands

A new player makes a character in about two minutes. The shape of the opening:

1. **A reason, then a road.** They choose one of eight reasons for coming, are met on the road by someone with a
   decision to make, and come into a town whose trouble is in front of them.
2. **They choose what to follow.** Nothing is followed for them: the aim line offers their reason with a quiet "Follow
   this".
3. **Gold is one next step.** Once followed, one act at a time is gold: the aim's next step, recomputed after every act.
4. **People are the strongest part.** The conversations, the Notes (who told what, and when), the danger boxes with
   their odds, and the paintings and portraits are what every cold player praised.
5. **Plans are their own.** Cold players found their own plans from what people told them: the bell against the hobs,
   the firebomb in the brood, the players' hat, the jar of noonlight.

### Work since the draft of 11 November (the owner's player report, round 8, the gold)

| Row | What | Checked by |
|---|---|---|
| E153 | Gold only after Follow this; nothing followed for the player; one act gold; Follow this a quiet word | test/gold-follow; the specs of a player with an aim now follow explicitly |
| E154, E157 | The gold's thread from every origin. What an act makes so is typed by its effects and resolution: a thing taken is carried, a letter given ends an expectation. The aim's step here comes before any way on. A site the aim names is gone further into; a door is never guessed at; spoils, not anyone's goods, pay a debt; a journey waits while a site has an open way in | test/gold-thread; /var/tmp/kyrie/m20/tools/gold-survey.ts over eight origins in kahitude and a1: 10 of 13 runs see the aim through or pause at a danger the page leads with (from 2 of 13 before); the honest start's four journeys |
| E155 | A place in the company's own hex is never gone to across country (it had walked the company out of the town) | probed headlessly; not seen rendered |
| E156 | A reply that teaches is drawn as knowledge; the Look list marks what the Look control is lit for | test/teaches-marked |
| E159 | A bed for the night is led to only where it can be paid for; the wait panel says whose bed is here and why it cannot be had | test/sitting-out-the-night |
| E160 | The brothers' errand says what "copied" asks (the makers' history or fate, read) | order specs |
| E161 | No way on is led while someone of the company is down | test/glance-rules |
| E162 | In the Notes only the followed aim has a gold bar | — |
| E152 | A portrait's credit names its painter and does not shout | test/paintings |
| E148–E151 | Topics in their written order; true walking minutes; the castellan answered; the conversation log folded | specs named in the log |
| US-01, WM-03, UI-04, NM-09 | The sister asked after; a robbed wagoner not helped; an inn's bed named; walk minutes | specs named in the register |

### After the cutoff (12 November, morning and midday, at the owner's word)

The owner asked for three things: to finish integrating the adventure branch, to close out the housekeeping, and to
work the recurring problems.

**The adventure branch** is merged with current main on `integrate/first-steps`. The decisions were taken as ordinary
design (`integration-first-steps.md`).
- **Real faults the merge exposed, fixed:**
  - saves no longer fitting in the browser's storage (the integrated worlds are 60% larger);
  - the bailiff's men killing a waiting company;
  - nine standing-scenario lines heard in every place at once;
  - the Dorothea's endings closing the story with the Pharos oil undelivered;
  - the debt's gold leading to someone else's measure.
- **Specs** that depended on draws the branch moved were made to test what they are about; the four loosened ones are
  named in the integration record.
- **CI** now runs the suite in eight shards, because the larger worlds made four of six exceed 45 minutes.
- **Two balance questions are left:**
  - the branch's mummy now beats a lone first-level warrior;
  - the Bound Howe's raid falls on a company sitting in a taproom.

**Housekeeping** (`housekeeping.md`):
- 34 clean worktrees whose commits were already in main are removed, and 34 merged local branches deleted, each
  recorded with its commit.
- Deleting the 26 merged remote branches needs the owner's permission in this environment; the command and SHAs are
  ready.

**Recurring problems and game-breakers:**

| Row | What | Checked by |
|---|---|---|
| E205 | A reply keeps its number through a conversation, and a digit presses the reply beside it (R11-01: three players) | talk-numbers; rendered |
| E206 | In a site or underground, the way back stays in sight beside Go…, quietly (PR-08, R10-09: five players) | way-back; rendered in the cellar |
| E207 | Out of doors, a painting goes the way of the day: dimmed at night, warmed toward evening (in part, R11-09) | rendered |
| E208 | A way told is a journey over the open country as told: a1's debt goes on to Marsh Howe (R10-17) | told-way; gold survey |
| E209 | A barred door into the place the aim names is the aim's step (R10-18) | gold-thread |
| E210 | Specs may say which standing scenarios a world holds (the authors' R88, AB-13) | standing-chosen |
| E211 | The innkeeper's lodger is found: by night on the crypt stair, and in the ossuary (R9-02) | probe; undertown specs |
| E212 | With the spiders' mother dead, the aim is to burn her eggs (R10-13 in part) | the spiders' specs |
| E213 | In the dark, the page says a light is a coin, and where (the authors' AB-05) | — |
| E214 | Kindle, Rejuvenate and three more added the caster's whole wisdom score (an at-will heal of 1d3+10); now its modifier (R10-12, R11-05) | canon; the spells' specs |

**A design study:** `studies/typography/` renders a warmer humanist sans (Lato, Ubuntu) and Play, the owner's
suggestion, against the current faces. The verdict there is Lato for the controls if anything; Play reads technical
beside the paintings.

### Round 11 (12 November, early): what was fixed

| Row | What | Checked by |
|---|---|---|
| E194 | The fact an aim waits on that an observation teaches (the marks read, the history known) makes what brings the observation about the aim's step: the pillar gold, not the empty niche | test/gold-thread "leads to what teaches" |
| E195 | Inside a site in wild country the map puts the company at its door's hex (Neblalac, not by Mossminster) | test/map-in-site |
| E197 | The spiders job's aim goes toward the gallery they are in, so the gold goes on (to the brood-chamber), not back out | probe tools/spiders.ts; the job's specs |
| E198 | The likenesses keep their places from one look to the next | the browser specs on CI |
| E199 | Look… does not offer forcing a lock the company holds the key to | probe tools/pitkey.ts; door-browser |
| E196, E200, E202 | Learned abilities by name; "an aim" when none is followed; the ring of letters as seen; the domain step at 1280 by 800 | specs and a render |
| E201 | CI: the wren trace's digests rewritten for the Lem fact | traces spec |

### Round 10's P0, and what else both its players met (12 November, early)

| Row | What | Checked by |
|---|---|---|
| E190 | **P0, both players.** At the keep the aim names, the gold went in and room by room while what the aim waits on lay hidden at the door. Now: the aim's next step is drawn among the led acts even when it is the search; Go…, Look… and their rows are gilded only when that step is in them; from inside, the way back out to the hidden thing is the aim's way (`AimAdvances.sought`) | S's save resumed headless, solar to door; test/gold-thread "leads back out" (fails on 7c851b45); gold survey 11 of 13 |
| E191 | "for 13" over "takes 1 … (roll 13)": the dice line says what was left | test/killing-blow-said |
| E193 | "Ask Hepzibah about Lem" before Lem was named | the players' specs |
| E192, E189 | CI's specs brought to the owner's 12 November ruling (a person led with is offered by likeness and lead; blue only for what the glance found) | CI |

### The owner's signal message (12 November, early): a colour leads to its act

The owner's human play had found blue (to learn) and rose (a companion) pips on people with no matching reply, and a
green Look… with nothing inside saying which thing. Both are now handled in the shared derivation, not by colouring
replies one by one.

| Row | What | Checked by |
|---|---|---|
| E183 | Every led act that opens something carries, for each aspect, the act inside it that justifies it (`Promoted.inside`, from `Affordances.opened`). Blue and rose are given only where such an act exists. The talk page, Look…'s pane and the Trade button draw those acts with the same left indicator as a led act (`Emphasis.within`, `Emphasis.bar`), and a marked topic stays above the talk's fold | test/signal-inside; a census over 4 worlds × 3 origins (59 led acts, 49 people, 37 blue, 3 rose: every one has its act, drawn and in view; census-2026-11-12.md) |
| E185 | **The root cause in the browser.** Turning to someone is itself an act (`talk_to`), and "someone with something to ask" is led only until it is done. So the blue was gone from the glance by the time the talk opened. The reader now keeps what was led about whoever is turned to (`ReaderState.turned`) and draws the talk from that alone; the aim's gold comes from the glance as it is now. Blue needs a topic that teaches (`Choice.teaches`). A likeness with no pip has no coloured reply | browser render at Millholm (a1): the wagoner, Osbert, Bask (scratch /var/tmp/kyrie/m20/tools/zz-signal-shot.test.ts.txt) |
| E184, E186 | Whoever is led with for talk stands among the scene's led acts, said with what it is for ("Talk to the wagoner · offer him a hand…"), up to four in all and never padded (`Promotion.all`, `GlanceStage.foreground`). The full action space stays under People, Look… and Go… | test/glance-menu (updated to the ruling); CI's browser specs on 42459547 |
| E187, E188 | Dim says what it means ("nothing new for now"). Go… is lit by a way the place leads with, and that row carries the tone; it is no longer lit for any untaken way, and the chosen row is no longer edged in an ivory that read as silver | browser render |

What this does not settle:
- People led with are still capped (two talks among four acts). Someone with a teaching topic who is not led with has
  no pip, and their replies are plain.
- A coloured reply says only that the glance found it; whether what it teaches is worth asking is the content's.
- The attention-lens direction (forward design §G) would replace the cap with a lens. M20 did not attempt it.

### After round 8, and round 9 (12 November, small hours)

| Row | What | Checked by |
|---|---|---|
| E173 | **P0 (round 9, P):** at a keep's door the gold went in at the open gate-passage while the dead man's cross was under the door-stone. A thing the aim waits on that lies hidden is now searched for where it is found, as the aim's next step, before any way on | test/gold-thread; the gold survey over the map origin in ten countries |
| E163 | The debt's gold walk circled back to a spent Seolforfyrd; the debt now points on to the next place the innkeeper told of | test/gold-walk; the honest start |
| E170 | Underground in a site the map put the company nowhere and offered "Journey to Lapisrecs" (the way out by another name); now at the site's hex, never set out for where it is | test/map-in-site |
| E171 | A town job ("Ask Peren about the old quarry") had been folded under the crypt's aim in the Notes | test/aims-apart |
| E179 | A failed parley lengthened the deadline it said had run out; it now keeps a deadline already given | probed both ways; deep-expedition |
| E166–E169, E174, E175, E177, E178 | Hit points at a level as the engine rolls them; "1 minutes"; a bard's armour without the wonders; a killing blow's dice line; "one ration"; a fight's barks in the character's pronouns; small faces by the painting's head crop (a catfolk had read as human); "A fight: beyond you." | specs named in the log |
| E164, E165 | "Nothing to say to you now"; a withheld skill "no one in the company can use now" | test/still-likeness |
| E176 | CI on 81fedaac: one spec still expecting the errand's old words; a shard over its time on a slow runner | the spec mended |

### Earlier in Mission 20 (11 November and before; see the log)

- Routes: no doubling back, landmark by landmark.
- Town entrances.
- One safe zone, walked at five sizes.
- Undertakings followed into their next part.
- A fight told once.
- The atlas's one indicator.
- Headless CLI and terminal parity.
- Startup 11.8 s → 10.1 s.
- Round 7's fixes (E135–E147).

### The adventure branch: verified, not merged (at the cutoff; integrated after it: see Part 0)

`adventure/first-steps` was merged onto main in review (`review/first-steps`) and repaired where the faults were clear:
a treasurer's pronouns; the Walk's curate, an elf cleric who stopped every country loading; town rules told everywhere
at once; the Walk's silent baselines. Its CI still fails 18 or more specs, several of them on decisions only the owner
can make. Chief among those: whether its four standing modules belong in the first town, which they make markedly
busier (four more people, about 170–190 more words on the first green) and change what leads there.

Everything is in `integration-first-steps.md`. Main was kept stable; nothing of the branch was lost.

**Authors' requests satisfied in Mission 20:**
- R81: a killing blow told by its weight.
- R82: wounds said.

The rest are triaged in the register's §16 (AB-03 to AB-14) for Mission 21.

### Cold play: eleven rounds, agents only

| Round | Players | Clarity | Beauty | Interest | Challenge | Continue |
|---|---|---|---|---|---|---|
| 7 (fa374a83) | K: catfolk thief, public start | 3 | 4 | 4 | 3 | 3 |
| | L: birdfolk bard, kahitude | 3 | 5 | 4 | 3 | 3.5 |
| 8 (da99bf2c) | M: birdfolk bard-apothecary, public start, cautious | 3 | 5 | 4 | 2 | 4 |
| | N: birdfolk bard-scribe, kahitude, social | 3 | 5 | 4 | 3 | 4 |
| 9 (505b002a) | P: dwarf warrior, the dead man's map, a fighter | 2 | 4 | 4 | 3 | 3 |
| | Q: catfolk illusionist, the dead man's map, an explorer | 3 | 4 | 4 | 3 | 3.5 |
| 10 (daa96430) | R: dwarf cleric of Love, a lost sister, a1, sociable | 3 | 4 | 4 | 2 | 3 |
| | S: dwarf warrior, the dead man's map, a random world, a fighter | 3 | 4 | 4 | 2 | 3 |
| 11 (0b04fa40) | T: dwarf cleric of Light, the brothers' errand, a1, dutiful (aim seen through) | 4 | 4 | 4 | 3 | 3 |
| | U: catfolk bard, the dead man's map, a random world, a wanderer | 3 | 4 | 4 | 3 | 3 |

Round 8's reports are in `cold/round-8/` (E158). Both players followed their reason, and both saw it through or nearly
(the fever nursed; Lapisrecs read). What round 8 found again, and where it stands:

- **No bed found:** E159.
- **Scene choices that hide the way up, or a trapdoor:** open, by the quiet scene's design. See Part 2.
- **Gold on the wrong gift:** by the fever's own rules any herbs serve; not changed.
- **Gold past a keeper or into an ambush, and on while a character is down:** E161 for the latter; the former is open.
- **Aims gone from the Notes without "seen through":** open.
- **Forecasts over-warned** (M) or fair (N): CB-02, open.
- **A bard's gifts unused in fights:** open.
- **Text against state:** NP-01, open.

Round 9's reports are in `cold/round-9/` (E172). P followed the dead man's map into a keep and was led room by room
while the cross was outside (E173, fixed); then took a widow's bounty on an outlaw knight, fought him though warned, and
ended penned in his fort. Q found the crypt job dead-ended at a foe no lore could pass, and turned to the rats, which led
three storeys down an undertown opened by Q's own lore: the session's best part. What round 9 found again:

- **The way back missing from the scene** (Q's crypt; P's bailey and fort): now three players in two rounds. Recurring,
  and the owner's to decide, since the settled contract keeps ways under Go… (register PR-08).
- **Gold off the aim** (on a hire, on the way back out, two at once): R9-09, open.
- **Text and paintings against state:** R9-07, R9-12, open.
- **Promises the world does not keep** (Peren's lodger; the crypt's lore): R9-01, R9-02, open.

Round 10's reports are in `cold/round-10/`. It was played on the build with the signal fixes (E183–E188).
- **The signals held where they were checked.**
  - R: "Cyril, rose dot and 'might come along': kept"; "Hepzibah, blue dot: kept, but out of order"; the wagoner's
    reward kept.
  - S: "Eye (Look) dots … kept their promise"; "Go… gold: consistently the aim's next step".
- **Both players met the same P0** at the keep their aim names: S's cross at Murkweard's door, R's sister at Ísencepan.
  The gold went in and room by room. The step, a search at the door, was drawn only as the rail's glass, and Go… and
  Look… bore gold dots into the keep. **Fixed (E190)** and verified in S's own save resumed headless: from the solar,
  each gold leads back out to the door, then "Search here".
- **Both met** fight headlines against the dice (E191, fixed) and a Lem never introduced (E193, fixed).
- **Recurring and open:**
  - paintings against the text (R10-08 with R9-12);
  - the way back only under Go… (R10-09, PR-08, the owner's to decide: now five players in three rounds);
  - fights too easy, with a free heal (R10-12).
- **New and open:** Flee's "sure, now" failed once (R10-07, not reproduced).

Round 11's reports are in `cold/round-11/`.
- **T, dutiful, followed the brothers' errand and saw it through** (+300 xp, 40 coin). That is the first agent in two
  rounds to finish an origin's aim by following the page. T rated clarity 4.
- **U wandered by choice**, hired a scholar, paid the players' reckoning, and spent an evening at the circus ("the best
  part").
- **Fixed after the round:**
  - E194: gold on an empty niche, past the pillar that completed the aim;
  - E195: the map inside Neblalac, recurring after E170;
  - E196;
  - E197: gold on the way back out of the spiders' gallery, recurring with R;
  - E198: the likenesses reordering, recurring with R;
  - E199: forcing a keyed lock, recurring in three players;
  - E200: the undercroft's letters before the undercroft, recurring with R;
  - E202: the domain step at 1280 by 800, recurring with R.
- **Recurring and open:**
  - R11-01: talk topics renumbering after each answer (three players, two rounds). U pressed a number and informed on
    someone by accident;
  - R11-02: conversation that cannot be steered;
  - R11-09: paintings against the text, in every round since 9.
- **The signals held** in both reports:
  - rose on those who would join;
  - blue on those with something to tell;
  - green on what was for the company;
  - the map's gold on the next destination.

  One exception was reported: the speaking door, blue in Look… and gold on the panel (T 33–34).

Not one round has been clean: every round has found something fixed afterwards. No gate of successive clean reviews was
reached.

### Tests at the cutoff

- The quick suite: 612 pass, 0 fail.
- Typecheck and lint clean.
- The full suite and browser specs on CI: see the closing note at the foot of this page, written at the last push.
- Specs added tonight:
  - test/gold-follow, test/gold-thread, test/teaches-marked;
  - test/entity-card, test/serve, test/prospects (prototypes);
  - test/castellan-answered, test/sister-asked, test/walk-minutes;
  - test/map-in-site, test/aims-apart, and new cases in test/gold-thread, test/voice and test/deep-expedition.

### Reproducible worlds and traces

- **The reference:** kahitude, the debt, a human warrior; the honest start's four journeys (`bun run test:honest`).
- **The gold's thread:** `bun /var/tmp/kyrie/m20/tools/gold-survey.ts` (SEEDS, ORIGINS, STEPS, V=1), which is
  test/gold-thread made broad.
- **The kept traces:** test/fixtures/traces/ (wren-tower-climbed, wren-turf-hut, hessel-into-the-two-poles).
- **Round 8's worlds:** M's was a random seed (not kept); N's was kahitude.
- **Round 9's worlds:** both random seeds, not kept (the play server's save went with its browser).

### Performance

- **A fresh country, headless:** 10.1 s (parse 5.5 s), 550–620 MB resident.
- **In the browser:** world creation about 4 s for M, near-instant for N; a reload about 5–6 s.
- **One game served a line at a time** (`bin/kyrie serve`): a 5.9 s start, then a median of 366 ms an act, the view
  included.
- **The glance:** within its 8 ms budget (test/glance-kite).
- **The gold survey:** 0.1–0.2 s for a prospect search on a small fixture.

### World quality (`census-2026-11-12.md`)

- Every room reached from the start (565 in kahitude, 531 in a1).
- The first green has 31–37 ways.
- 35–36 rooms are entered and never left by an offered way: the works' inner rooms.
- About 30 shared place names.
- 90 paintings mapped to kinds no sampled place names.
- Some scenarios fit everywhere and are placed in one world of four.

## Part 2. What is still wrong (ranked; the register has the rest)

1. **Paintings and text against state: recurring in every round since 9.**
   - A ruin painted whole, sunny scenes for a stormy evening, a big top shown as a kitchen, a lizardfolk companion
     painted as a human woman.
   - Text of what could not be seen.
   - Players say they "stopped trusting what I saw" (R9-12, R10-08, R11-09, R11-07).
2. **Conversation (recurring):**
   - Topics renumber after each answer, so a number pressed does something else. One player informed on someone by
     accident (R11-01; three players).
   - Villagers have one stock line, and no one but its giver can be asked about the company's own aim (R11-02,
     R10-15).
3. **Scene navigation (recurring; the owner's decision, PR-08 and R10-09):** the way back and some features are only
   under Go… or Look…, one step at a time; five players in three rounds. The first green offers 31–37 ways.
4. **Fights:**
   - Mostly too easy: an at-will heal makes hit points meaningless, and warned dangers can be walked past (R10-12,
     R11-05).
   - Level 1 alone is swingy.
   - Flee's "sure, now" failed once (R10-07, not reproduced).
   - A calling's gifts rarely matter (R11-03).
5. **The gold's thread is not yet everywhere:**
   - a1's debt after the first place is spent: the next is known but has no route (R10-17);
   - a1's order before the speaking door, in the survey (R10-18);
   - an aim waiting only on coin (R11-04);
   - aims ended silently.

   Fixed tonight: the keep's door (E190), the pillar (E194), the spiders' gallery (E197).
6. **The map:**
   - the camera moves a touched hex out from under the card;
   - a crowd of far labels in the fog (U).
7. **Promises unkept:** the crypt's lore, the lodger, Lem's whereabouts (R9-01, R9-02, U).
8. **Names** come from mixed tongues (PR-06).
9. **The adventure branch** waits on the owner's decisions (above).
10. **Acceptance:** no human has played the first hour for acceptance (FH-01).

## Part 3. Architectural follow-ups for Mission 21 (the owner's atlas synthesis, 11 November night)

1. **Semantic typing.** Replace each remaining text inference in `text-inference.md`, each with its named typed source:
   - talk roles;
   - reading acts;
   - "too dear" reasons;
   - seen-through and level-gained moments;
   - panorama sights;
   - harm on arrival;
   - the fight's turning points;
   - an aim's places for "on the map".
2. **Facets from Kyr.** Authors cannot yet mark an act, a thing or a person as uncanny (violet), knowledge (blue) or
   payoff (green) in Kyr. Today facets come from reasons (`Aspects.by`) and marks. A typed facet on Kyr actions and
   entities is the missing authoring capability. Without it, violet in particular is never drawn.
3. **Distance-sensitive perception.**
   - `Perception.reach` has only companionship: base 1, Gregarious 3.
   - Add per-facet reach, provenance (which capability saw it) and confidence.
   - Example sensitivities: mage → uncanny; cleric or diviner → the followed aim along story nodes; thief → wealth;
     warrior or ranger → danger and tracks; bard → companions and motives.
   - Immediate danger stays visible to everyone.
   - Keep it efficient: the glance has an 8 ms budget (glance-kite).
4. **Story-node propagation.**
   - A followed undertaking perceived along a chain of known places and people, not only at the next place.
   - Destinations' known facets carried to their approaches beyond the town case. Sites in the company's own hex are
     not handled yet.
5. **Exhaustion as state.** Dim means nothing new, and is today derived per act (`known`, `idle`). It should be one
   projected state, so that repeatable useful acts never go dim.
6. **Formation modifiers.** Company formations change perception and access (see
   `../2026-11-11-adventure-to-career.md`).
7. **Road junctions.** Roads meet only at towns and way rooms, so a road out that leaves another road's hexes makes the
   walk go into the town and back out. This repeats at most two hexes over five seeds, in 16–23 ways a seed. A junction
   node where roads share hexes is the fix.
8. **Startup.**
   - Measured on 11 November night, a fresh country with no parse cache, headless: world assembly 0.6–0.7 s; session
     start 9.7–10.4 s, of which parsing is 5.5–5.6 s (about 135 parses), the rest compiling and checking.
     Resident memory 550–620 MB, heap 135–270 MB.
   - Tried and reverted: a read-only path letting a generated region's files be parsed once and not copied for
     composition and loading. A/B over three seeds showed no gain (10.26/9.89/10.36 s before, 10.26/9.69/10.26 s
     after), and it added an uncopied shared module (the risk review's R4). The copies are not the cost; the parse
     and the compile are.
   - Candidates: parse the generators' templates once and instantiate them, instead of parsing their output; or a
     compact intermediate form for generated regions.
   - Not a lazy-world rewrite.
9. **Tests.** Parity for combat; the atlas states (full, faint, dim, silver) as projected data in the engine's
   projection, not CSS; the safe-zone walk in CI at the five sizes.
10. **The architecture risk review** (`architecture-risk-mediation-2026-11-11.md`, log E133). Its immediate list:
    - lifecycle assertions around command execution and rollback;
    - cache and load telemetry;
    - cache-on/cache-off differential tests;
    - a replay lane for historical transcripts.

    Then:
    - planner budgets (R7);
    - cost lint for authoring (R8);
    - a save-compatibility policy and migration harness (R5);
    - explicit command phases (R1);
    - per-campaign catalog state (R2);
    - frozen shared structures in development (R4);
    - a drift review at each closure (R10).

    R9, the atlas's honesty, was M20's. Its proposed gate, a corpus of false promises from the cold rounds, was begun
    (test/gold-walk, test/gold-follow, test/gold-thread) and is still to complete.


## Part 4. Future design registered (not built; for Mission 21 and after)

Kept apart from what was delivered, as the owner asked.

- **`../2026-11-11-forward-design.md`**: the owner's six research directions and the 39-item feature inventory.
  - **Three narrow prototypes**, each with its findings, concept kept apart from feature:
    - an entity card in player and debug projections;
    - one game served a line at a time;
    - a prospect three decisions off, by a bounded search through hypothetical worlds.
  - **The finding:** the card, the promoted act and a tester's "what would this change" share one set of records: the
    entity, the company's knowledge, the typed action rows and the persistent World. They lack the same three
    contracts:
    1. which facts the company may know;
    2. every effect of an act typed;
    3. the campaign's tick as a function of a World.
  - **Preliminary notes** on counterfactual planning, the Book, perception, dramatic memory, institutional plans,
    literate authoring and careers.
  - **The owner's further directions of 12 November (§G–N)**, with what each depends on and the obstacles found:
    - attention lenses over one scene;
    - world time apart from presentation;
    - ordinary life;
    - generated teaching repertoires;
    - biographical progression;
    - observer-relative information;
    - a progressive top rail;
    - opportunity intensity, with the aim of enforcing the colour rules through shared components.
- **`../2026-11-11-direction-review.md`**: the independent creative and technical direction review, kept whole. Its
  items are linked in the register's §18 to where they live.
- **`../2026-11-11-adventure-to-career.md`**: the owner's direction from adventure to career.
- **`../architecture-risk-mediation-2026-11-11.md`**: the risk review (R1–R10).

## Part 5. Houseclean

> **Done at the close (12 November, after the cutoff, at the owner's word):** see `housekeeping.md`.
> - 34 clean worktrees whose commits were already in main are removed.
> - 34 merged local branches are deleted, each recorded with its commit.
> - The 26 merged remote branches are listed with their commits and a one-line command. Deleting them needs the
>   owner's permission in this environment.
>
> The adventure branch is being integrated (`integrate/first-steps`). The lists below are as they stood at the cutoff.


**Remote branches already contained in main (26),** which can be deleted when the owner wishes:

- **review/:** architecture-2026-10-26-d79cbbd, playtesting-2026-10-26.
- **adventure/:** winter-in-carth, grand-tour, fair-weather, half-the-hive, the-lull, behind-the-wainscot,
  quiet-in-the-sky, book-of-faces, quittance, quittance-grand-tour, anthology, imbar-deep-time.
- **claude/:** eloquent-bohr-8pyot3, exciting-keller-wig7bg, eager-volta-59xzw3, blissful-cray-3tt8ai,
  kyrie-metro-adventure-region-q496ij, westernesse-adventure-anthology-ji7zau.
- **Others:** art/bestiary, art/menagerie, fix/journey-steps, integrate/imbar, m19-close, m19-contracts.

**Superseded:**
- `claude/great-hamilton-xr4iyo`: its nine commits are in `adventure/first-steps` as rebased copies.
- `adventure/fs-expedition`, `fs-wonder`, `fs-social` and `fs-integrate`: all four are in `adventure/first-steps`.
- `review/fs-integrate`: the first scratch merge, replaced by `review/first-steps`.

**Unmerged and to decide:** `adventure/first-steps` and `review/first-steps` (above). `adventure/big-tent`
(preview-only, by the owner's earlier word). `wip/art-scenery`, `wip/journeys`, `wip/ux-opening` and the old `review/`
branches of 25 and 26 October, each one or a few commits ahead.

**Worktrees and scratch** (all outside the repository):
- `/var/tmp/kyrie/wt-m20`: Mission 20's worktree, branch m20-work.
- `/var/tmp/kyrie/wt-review`: the review merge.
- `/var/tmp/kyrie/wt-cold8`: round 8's build.
- `/var/tmp/kyrie/wt-base`: a baseline, detached.
- `/var/tmp/kyrie/m20/tools`: the scratch probes this page names.
- `/var/tmp/kyrie/m20/cold8`: round 8's notes and screenshots.

## Part 6. Round 7, for the record

Two cold players on fa374a83 (11 November night), reports in `cold/round-7/`, log E134–E147. Every finding is fixed or
carried in the register's §16 (R7-01 to R7-04).

## Closing note: CI at the last pushes (12 November, about 2 a.m.)

- **bba17f90** (round 8's small fixes, E164–E176): every job green, the six suite shards, both browser jobs, the long
  descents and the reference hour through the page.
- **f49d858e** (round 9's fixes, E177–E181, the register's §20, the bundle rebuilt): every job green but suite 1/6, where
  one test of Wapshott's Act IV passed its 290-second limit on a slow runner; it takes two minutes here, as it did
  before tonight's changes. Split into its five nights (E182) and pushed.
- **d0c279cb** (the last push, 12 November about 2:30 a.m.): **every job green**: the six suite shards, both browser
  jobs, the player contracts, the long descents, the reference hour through the page, lint and types.
- **505b002a** had been cancelled by the next push, not passed; and **81fedaac** failed one spec on the errand's old
  words (E176). Both are covered by the runs above.


## Closing note, continued: CI after the owner's signal message (12 November, early morning)

- **42459547** (E183–E184): every job green but suite 5/6, where one spec still held the old reply-colouring rule
  (E189, mended).
- **b257c494** (E185–E189): every suite green; both browser jobs failed where someone led with is now offered twice, by
  likeness and lead (E192, harness and specs brought to the ruling).
- **c3150380** (E190–E192): **every job green.**
- **c848f2fc** (E193 and docs): every job green but suite 6/6, where the kept wren trace no longer replayed after the Lem
  fact (E201, redigested: play comes where it came).
- **06391bfc** (E194–E202): every job green but suites 2/6 and 4/6, where two specs read a learned ability by its id
  (E204, mended).
- **bf68db96** (E203–E204, the last code push): **every job green**: the six suite shards, both browser jobs, the player
  contracts, the long descents, the reference hour through the page, lint and types.

Every failure tonight was a spec or a trace lagging a deliberate change, not a game fault. Each was mended in the spec
with the reason recorded. Two specs were loosened, both to the owner's 12 November ruling and no further:
- at most four led acts, not three;
- a person offered by their likeness and at most one lead, not once.
