# Mission 21: the performance report

The owner, 15 November: comparable cold and warm timings before and after; quick against full test costs, with the
coverage kept; the real costs of parsing, compiling, realizing a world and acting in it; where tests still lean on
large worlds; and whether a local act pays only for its working set. This succeeds
[performance-retrospective.md](performance-retrospective.md) and keeps its split between harness and runtime gains.
Where a figure here differs from it, §7 says so.

**Machine and method.** WSL2, 16 cores, 15 GB, bun 1.4.3, branch `perf` (main 79ec9fe8 + ci/kyr-1). Each Node figure
comes from fresh processes; a median of 3 unless it says otherwise. The one-minute load average is given with each.
Another agent was running browser specs throughout, so the load was 1.2–10. Runs taken above a load of about 5 are
marked, or were repeated. No browser was run for this report: the browser figures are kyr-compiler.md's (§1.3–1.4).
CI figures come from GitHub's job times (`gh api …/jobs`) and from the kept times (test/timings.json). A green run
is not counted as evidence of speed.

**The headline:**

| What | Before (12–14 Nov) | Now (15 Nov) | How measured, load |
|---|---:|---:|---|
| `check:fast`: typecheck, lint, quick suite | 18 s, 667 tests (67 s cold) | **27 s, 1,228 tests**, 478 files | gate run alone, load 5.4 |
| Push lane (CI) | the whole suite, 45–60 min | **9.1 min wall**: 8 shards of 2.3–5.1 min, 36 job-minutes | run 43616589034 (main) |
| Full suite (CI) | about 270 shard-min, 45–60 min wall | **172 suite shard-min + 43 browser-min, 29.4 min wall**; ci/fast-2: 151 suite shard-min | runs 43615698320, 43615569091 |
| a1 start, warm (Node) | 6.5 s (first page included) | **5.5 s** (5.4–5.6) | startup-bench, load 2.9–3.0 |
| a1 start, cold (Node) | 15.1 s | **14.0 s** (13.3–14.3) | startup-bench, load 1.7–2.8 |
| A tiny world, warm / cold | 215 / 592 ms | **231 / 560 ms** | startup-bench, load 2.8–3.1 |
| a1, first visit in the browser | 17–19.5 s ("3× Node") | 18.4 s; **1.3× Node, like for like** | kyr-compiler.md §2.3 |
| A quiet hour waited in a1 (one "An hour" step: tick, screen, leaf) | — | **about 265 ms** (255–281), or about 6.4 s a game day | probe, 12 hours × 3 runs, load 3.1–3.6 |
| One step in the cellar, 100,000 irrelevant facts (act, screen, leaf) | 94 ms | **73 ms** | act-loop probe, 20 steps, load 2.5 |
| Looking again in the cellar, 100,000 irrelevant facts | 144 ms | **91 ms** | scale-costs, load 2.5–3.0 |

## 1. Test costs, and the coverage kept

| Loop | Files | Tests | Cost | What it leaves out |
|---|---:|---:|---|---|
| `bun run test:small` | 157 | — | 2–4 s | everything but a rule on a tiny world |
| quick (`check:fast`) | 478: test/small, and specs under 2 s by kept time | 1,228 (1,093 pass, 135 skip) | **27 s** with typecheck and lint (load 5.4) | 591 files |
| push lane (CI) | **762** of 1,029 non-browser files | — | 74 kept CI-min; **9.1 min** from push to done; suite shards 27.7 job-min | 267 files, **680 kept CI-min** (main's timings); **503** by ci/fast-2's |
| full (CI, nightly and on demand) | 1,069, 40 of them browser | — | 172 suite shard-min, 16 shards, 5.2–16.4 min each; browser 27.3 + 15.3 min; **29.4 min wall** | nothing |

- **The kept and job minutes differ:** a shard runs its files in parallel, so the push lane's 74 kept CI-minutes ran
  in 27.7 shard-minutes.
- **Wall time:** the lane's "5 min" is its slowest shard (5.1 min). Push to green took 9.1 min, with queueing, boot
  and the player contracts.
- **The full suite's wall is the browser shard** (27.3 of 29.4 min). ci/fast-2 cuts the suite shards from 172 to 151
  min. It is not on main yet: its rest lane is 503 kept CI-minutes against main's 680.
- **Coverage:** nothing is dropped. A file leaves the push lane only by its kept time, and every file runs nightly.
  The push lane holds 74 % of the files but 10 % of the kept time. 45 files outside test/small have no kept time:
  the quick suite leaves them out, and the push lane takes them in.

## 2. Start-up, by stage

### Node: a1, drawn, composed, started (3 runs each; load 1.7–3.0)

| stage | cold | warm | again, no store | again, store |
|---|---:|---:|---:|---:|
| **start, whole** | **14,046 ms** | **5,518 ms** | 8,894 ms | 5,034 ms |
| parse (151 texts, 3.35 MB) | 8,259 ms | 0 (187 kept) | 3,895 ms (39) | 0 |
| install (39), each including its compose | 6,445 ms | 2,160 ms | 1,958 ms | 1,926 ms |
| of which: compose, namespace, join | 828 + 440 + 442 | 812 + 433 + 421 | | |
| validate (52) | 625 ms | 596 ms | 646 ms | 662 ms |
| populate, project (creature facts) | 512 + 583 | 499 + 549 | | |
| `structuredClone` (about 50,000 calls) | 1,152 ms | **1,053 ms (19 %)** | 1,016 ms | 947 ms |
| world composition; region drawn | 724 + 164 | 528 + 172 | | |
| first screen + leaf | 403 + 34 | 381 + 29 | 293 + 18 | 291 + 18 |

`bun scripts/startup-bench.ts full tiny --runs 3 --md`. These agree with kyr-compiler.md's figures taken at loads of
5.3–7.7 (warm 5,694 ms, cold 14,084 ms), so those were not inflated by their load.

**The world a1 starts:**
- 37,494 facts and 11,350 entities;
- a save is 19.7 MB of JSON, made in 272 ms and restored in 628 ms;
- the heap after a GC is 208 MB.

(Probe, load 2.9.)

### Browser (kyr-compiler.md §1.4 and §2.3, Chromium, load 3.8–4.0)

| pass | Start to first place | what it parses |
|---|---:|---|
| first visit | 18.4 s | everything: about 4.5 s the authored and shared texts, 5.5 s a1's generated ones |
| new country (the authored parses kept) | 13.9 s | a1's generated texts |
| returning | 8.3 s | nothing |

**Before and after:** cold Node fell by 1.1 s, and warm by 1.0 s, since 13 November. The causes:
- AX-01's heap;
- the Displaced index;
- the binder's join order.

The browser's first visit has not moved. It is parsing (§6, rows 2 and 3).

## 3. World-size scaling: the cellar held constant

`bun scripts/scale-costs.ts 0,10,100,1000,10000 --runs 3`: a cellar of five things and a stair, the company in it,
"Tap the barrel" as the act. Each room elsewhere adds one room, two things and a passage to the next room: ten facts.
So rooms 0/10/100/1,000/10,000 add about 0/100/1k/10k/100k irrelevant facts to the cellar's 312.
- **start:** PlaySession.start, with the parse of the whole text;
- **first observe:** the first screen and leaf;
- **act:** `session.leg`;
- **observe again:** the screen and leaf after it;
- **save/restore:** `c.save()`, then `PlaySession.fromSave`;
- **heap:** after `Bun.gc(true)`.

| facts added | start | first observe | act | observe again | save | restore | heap |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 156 ms | 69 ms | 12.3 ms | 18.4 ms | 5.4 ms | 19 ms | 25 MB |
| 96 | 160 ms | 71 ms | 11.8 ms | 18.8 ms | 5.8 ms | 21 ms | 25 MB |
| 996 | 180 ms | 69 ms | 19.5 ms¹ | 21.0 ms | 7.9 ms | 17 ms | 29 MB |
| 9,996 | 353 ms | 98 ms | 13.9 ms | 26.5 ms | 38 ms | 60 ms | 58 MB |
| 99,996 | 2,120 ms | 318 ms | 37.2 ms | **90.7 ms** | 424 ms | 612 ms | 362 MB |
| *before this branch, 99,996* | *2,464 ms* | *366 ms* | *52.6 ms* | ***143.7 ms*** | *523 ms* | *650 ms* | *362 MB* |

After the fixes, load 2.5–3.0. The italic row is before them, load 2.1–2.4. ¹ One run of three was slow; the median is
noisy at this size.

**Steady state:** the same act repeated 20 times after the first (scratch probe act-loop; median; load 2.5).

| facts added | act and its choices | step: act, screen, leaf |
|---:|---:|---:|
| 0 | 4.8 ms (5.9 before) | 11.8 ms (14.8 before) |
| 99,996 | 8.9 ms (14.2 before) | **73.4 ms (94.2 before)** |

**What grows, attributed:** inclusive time per method, outermost call only, wrapping every static and prototype
method of 22 classes. This inflates small, hot functions, so it ranks the costs but does not size them; the sizes are
the uninstrumented tables above. 20 steps at 0 and at 10,000 rooms:

| cost at 100k irrelevant facts, per step (instrumented ms) | before | after | cause |
|---|---:|---:|---|
| `ScreenModel.names`: every entity labelled before every screen (40,755 labels) | +42 | **0** | fixed: KnownNames, named as asked |
| `Narrator.shelter`: a map of every entity per call, 2 calls a step | +16 | **0** | fixed: EntityIndex |
| `Operators.bindings`: raise_quality's open `quality` tested against every entity (41,596 `fits`) | +24 | **+3** | fixed: enumerated by type |
| `ChartModel.aimed`: every `connects` fact, `siteOf` of both ends | +29 | +26 | open: §6 row 4 |
| `Glance.inward`: every `connects` fact, `siteOf` of both ends | +28 | +26 | open: §6 row 4 |
| `Withheld.rows`, `ScreenModel.party`/`sheet`, `Services.of`, `World.allFacts` | +44 | +40 | open: a long tail |
| `PlaySession.leg` itself: the rule engine and the tick | +1.4 | — | flat |

**The first observation (LC-02)**, at 100k facts after the fixes (+321 ms instrumented over the empty world):

| cost | instrumented ms |
|---|---:|
| the first grounding of the module's actions (`Campaign.offered`) | +58 |
| the world rebuilt from its state: `CommittedWorld.of` after `Campaign.fork`; 90,262 `World.add` and `World.key` | +61 |
| `PlayerView.labels`, `ObservationText.presented` over every entity | +40 |
| `ChartModel.aimed` and `Glance.inward`, as above | +54 |
| `CompanyRecall.of` | +23 |

**Save and restore, by fork.** Uninstrumented, at 100k facts: `structuredClone(campaign.current)` takes 139 ms, and
`new World` from that state 36 ms. At 10k facts they take 10.5 ms and 3.0 ms.

**The verdict:**
- **The act itself pays for its working set.** `session.leg`, the rules and the tick, is within noise from 0 to 10k
  irrelevant facts, and grows by under 2 ms at 100k.
- **Up to 10k irrelevant facts**, looking again grows 44 % (18.4 → 26.5 ms) and the first look 42 % (69 → 98 ms).
- **At 100k, looking does not.** Observing again is 4.9× the empty world, and a step 6×. After this branch, the
  causes are:
  - two screen readers that go through every `connects` fact in the world (`ChartModel.aimed`, `Glance.inward`),
    about half of the remaining growth;
  - a long tail of per-entity reads.
- **Start, save and restore grow linearly, by design.** A start parses and installs the whole text. A save and a
  restore copy the whole world by `structuredClone`. Their slope is the copy.
- **The first observation grows (LC-02) with no single cause.** It is the first grounding, a whole world rebuilt from
  a cloned state, and labelling every entity.

## 4. Action execution and waits

**A quiet hour in a1**, the debt origin, a warrior, at the first town. It is one "Wait › An hour" step through
`Journey`, as specs wait. Uninstrumented, the mean of 12 hours: 275, 281 and 280 ms (load 3.1–3.3), and 256–268 ms in
a second set. With wrappers on 14 methods only (overhead about 1 %):

| part of an hour | ms | share |
|---|---:|---:|
| the screen (`ScreenModel.built`) | 145–151 | 57 % |
| of it: perceiving (`PlayerView.perceive`) | 47–49 | 18 % |
| of it: the chart (`ChartModel.build`) | 43 | 16 % |
| of it: `Withheld.rows`, `Itineraries.shown`, `ScreenModel.party` | 16 + 12 + 8 | 14 % |
| the act (`PlaySession.leg`), almost all the tick (`Campaign.complete`: the watches) | 80–87 | 32 % |
| `LocalObservations.read`, 3 calls an hour, in the screen and the tick | 34–37 | 13 % |
| the grounding (`Campaign.offered`, 23 calls an hour, the first does the work) | 30–31 | 12 % |
| `ActionFeedbackView.read` | 20 | 8 % |
| the leaf (`Narrator.leaf`) | 9–10 | 4 % |

**The leads given to verify:**
- **"PlayerView.observe computed twice per step": not so on main.** `perceive` runs once an hour. `observe` is asked
  three times, and twice it is a cache hit.
- **"leg → whither → PlayerView.choices, about 24 % of a quiet hour": not a cost of its own.** `whither` takes 0 ms
  here, since the screen has already grounded that world. What it pays elsewhere is the hour's grounding, about 12 %
  here, paid by whoever asks first. Where a wait builds no screen (ci/fast-2's LC-04: waits told only as they end),
  `whither` asks first. That is the likely source of the 24 %.
- **`LocalObservations.read`** tests every `near` and `within` observation in the module, about 1,500 of them,
  against the company, three times an hour: 4,539 tests an hour. That is a world-sized scan inside a quiet hour.
- **LC-03, stamps by relation name too coarse:** not measured again here. The lead's trace of 15 November stands.
- **This branch's fixes did not move a1's hour or screen:** 256–281 ms after, against 269–307 ms before, at the same
  load. They remove growth with irrelevant facts. a1's costs are elsewhere: the tick, perceiving, the chart.

## 5. Specs still on large worlds

The rest lane's top, by kept CI-minutes. The first column is main's timings; the ci/fast-2 column shows what fast-2
has already cut.

| spec | main | fast-2 | world | why it needs one | what would free it |
|---|---:|---:|---|---|---|
| silent-lord-malice | 19.3 | 3.1 | a drawn country (Keep), a nine-day wait | the keep's gate is on a site a placement binds | cut by fast-2 |
| bound-howe-week | 15.4 | 1.3 | a drawn country, a week | the howe in its country | cut by fast-2 |
| silent-lord-turns | 12.9 | 1.4 | drawn, waits | as malice | cut by fast-2 |
| standing-modules-found | 12.7 | 9.5 | drawn (kahitude), map play | that a first town tells all three deep modules: a property of generation | a census over the generated town's notices, without play |
| arcology-rivals | 12.5 | 0.6 | a situation alone, waits | — | cut by fast-2 |
| circus-act4 | 11.2 | 10.4 | the circus campaign, many days | the Act's days in order | a fixture saved at Act IV's start (Kept), or faster waits (§6 rows 4–6) |
| the-slack | 11.0 | 15.6 | a generated world | locks open to items from several adventures | shared makings (fast-2 tried; it grew) |
| kings-players-acts | 10.3 | 8.7 | the King's Players campaign | each Act III route an unbroken play, no teleports | by design: a journey spec. Faster hours (§6) |
| ring-hierarchy | 10.0 | 6.5 | generated country and Tolleth | the roll-up across two towns | stage fixtures (fast-2 made the stages once) |
| walk-ends | 9.8 | 8.8 | drawn, waits | each end state marks four towns | levers are set already; the cost is the waits: faster hours |
| ombra-local | 9.7 | 9.0 | Book of Faces, nine days | seeds found per journey; checks fall by history | faster hours; a fixture per day kept |
| ties-forms | 8.7 | 9.7 | drawn, walks by `>room` | ties need a generated town | a tiny town fixture from the ties template |

- **By kind** (main's rest lane, by a pattern match over each spec's source and its support files, so approximate):
  - drawn countries: 103 files, 215 CI-min;
  - authored campaigns: 48 files, 131 CI-min;
  - the rest: 116 files, 334 CI-min, mostly specs whose support starts a drawn world (keep, howe, map-play,
    walking) or an authored campaign (ombra).
- **Nearly every one of the top is a wait:** what each pays is hours, not the start. At about 265 ms an hour in a1,
  a nine-day wait costs 57 s.

## 6. The cheapest next changes, ranked by measured gain against cost

| # | change | measured gain | cost and risk | status |
|---:|---|---|---|---|
| 1 | **Small compiler scans**, kyr-compiler §6.4: the speaker lookup by the compiler's table (module-compiler.ts:156); abilities and feats by a set (module-assembly.ts:296, 69 ms self in this branch's profile too); `readOnly`'s goals folded into one validation; `LocalKinds.seen` by the text's words | about −0.4 s of a 5.5 s warm start (7 %): every start, every spec on a full world | small, 4 sites; local, no change of meaning | open (AX-03's neighbours) |
| 2 | **AX-03: compose the shared rules once**, by reference, with the parameter-shadow check per install (kyr-monotone proves it sound) | −0.8 to −0.9 s warm (16 %); about −1.2 s in the browser | medium: the shared rules threaded through compose, namespacing and join | open; proof done |
| 3 | **Ship the authored parses with the build** (kyr-compiler §6.1) | browser first visit 18.4 → 13.9 s (measured as the new-country pass) | medium: build step, keys as ParseKeep keeps them | open |
| 4 | **The `connects` scans in `ChartModel.aimed` and `Glance.inward`:** skip when no site is aimed or held; one `siteOf` per place per call; or `connects` indexed by either end | about half the remaining growth of a step at 100k facts (+52 of +96 instrumented ms); first observe −54 | small: two methods; their specs are the glance's and the chart's | open, next to take |
| 5 | **`LocalObservations.read` by place:** `within` by the ancestry of here, `near` by the places beside it; kept per world for the two reads on one world (interruption.ts:24–25) | about 13 % of a quiet hour in a1 (34–37 of 265 ms): every wait in the rest lane | small to medium: the `near` predicate's meaning must be kept | open |
| 6 | **Fork without copying the world:** share the immutable committed World and its state across `Campaign.fork`, instead of `structuredClone(current)` and a rebuild at the first look | at 100k facts, 139 + 36 ms per fork, start and restore; part of LC-02 | medium: proving no reader mutates a state's facts in place | open |
| 7 | **AX-04: generate to the AST** | −4.8 s Node / −5.5 s browser for each new country | large | M22 |
| 8 | **LC-03: stamps by relation and subject** | lets a wait keep its views; the lead measured the hit rate (7 of 27 hours) | large | open |

**Done on this branch** (97a4f1e6, ci/perf-1, push lane green: run 43621074117):
- `KnownNames`: a screen names an entity when it is asked for;
- `Narrator.shelter` by the module's EntityIndex;
- `Operators.bindings`: a parameter left open is enumerated over its type's entities.

test/screen-names-local.test.ts pins all three by count, not time: labels a screen, 13 → 13, and bindings tested
after an act, 705 → 705, at 20 and 2,000 rooms. The shelter is timed against itself. Each fix undone fails the spec:
- names undone: 916 → 8,836 labels;
- bindings undone: 1,534 → 9,454 tested;
- shelter undone: 13.7 → 161.6 ms.

**The gain:** at 100k irrelevant facts, looking again 144 → 91 ms and a step 94 → 73 ms. On a1's hour and screen, no
measurable change.

**Not recommended:** chasing `structuredClone` call site by call site (it goes with row 2, per kyr-compiler §7), and
growing ParseCache for the browser's sake.

## 7. Where this differs from the retrospective

- **"Acting in that room: flat from 0 to 8,000 rooms":** the act proper is flat. scale-costs' "act" column includes
  the first grounding after it, which grows 3× at 100k facts (§3).
- **"A full start remains about as heavy as it was":** it holds. Warm, 6.5 → 5.5 s; cold, 15.1 → 14.0 s. The two
  measures differ by the first page (the retrospective says so).
- **The full suite's 174 shard-minutes:** 172 on run 43615698320, and 151 on ci/fast-2's run. The 28 min wall is
  29.4 min there, still set by the first browser shard.

## Reproducing

- `bun scripts/scale-costs.ts [sizes] --runs 3 [--json out]`: §3's table, with the load.
- `bun scripts/startup-bench.ts full tiny --runs 3 --md`: §2.
- The probes (a quiet hour in a1, the per-method attribution, the step loop, save/restore in a1) were scratch
  scripts in /var/tmp/kyrie/perf-scratch. Each is a few lines over `LoadScales`, `ScaleCosts.start` and `Journey`,
  and is described where it is used. They are not committed, so that src stays without probes.
