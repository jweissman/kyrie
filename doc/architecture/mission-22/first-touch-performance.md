# First-touch performance: the title, and setting out (OR-08, OR-09)

Written for the owner, 16 November 2026, night. M22 step 6 (orientation.md §7). The brief asked that the delay be
measured, not decorated: where the first seconds and the setting-out wait go, what can be staged earlier or kept, and
proof that a world prepared early is the world a cold start makes.

**Measured** means taken in Chromium on this machine. **Inferred** means reasoned from code or from Node and not
taken in the browser. Every browser figure is from a fresh browser (an empty cache and an empty parse store) unless it
says "warm". The machine was shared with two other agents' browsers throughout (load 5.5 to 8 on 16 threads), so
single runs vary by up to about a third. Base and after were run interleaved, under the same load.

## 1. Before and after

**The title** (`/var/tmp/kyrie/m22/perf/title-bench.ts`, 3 runs each, medians; `file://`; automation, so no studio
mark or reveal):

| | base `5d08c97d` | after | |
|---|---:|---:|---|
| Navigation → the title drawn, cold | 2.91 s | **0.55 s** | the reader's own script, 2.9 MB: 0.25–0.33 s |
| … warm (reload) | 0.50 s | 0.50 s | V8's code cache, as before |
| … cold, CPU ×4 | 11.9 s | **2.0 s** | |
| … warm, CPU ×4 | 2.06 s | 0.83 s | |
| Longest main-thread task, cold | 2.39 s | 0.33 s | ×4: 9.9 s → 1.35 s |
| The engine's first answer (catalog), cold | 3.86 s | 2.15 s | ×4: 13.1 → 5.4 s |
| Served over http (as on Pages), cold | | **0.37 s** | the worker fetches `engine.js` itself: no second main-thread task |

**Setting out**: from releasing the hold on "Set out" to the first page
(`/var/tmp/kyrie/m22/perf/probe-setout.ts` via `run-setout.sh`). The probe makes the first card's life at each step,
reading for the time given before each hold of 0.8 s. Two runs each.

| creation's pace (its length) | base `5d08c97d` | after | how the after start was found |
|---|---:|---:|---|
| reading 2 s a step (about 22 s) | 4.8, 6.1 s | **0.003, 0.005 s** | made ready and finished, its first look taken |
| reading 0.9 s a step (about 13 s; the lead's recorder pace) | 11.4, 10.9 s | **3.1, 1.4, 2.4 s**; one run 11.9 s | made ready, still installing; the 11.9 s run began afresh (see §6) |
| no reading (about 6 s; ui-discovery's pace) | 11.0, 12.5 s | 8.3, 9.6 s | afresh: the country's texts still being read |
| CPU ×4, reading 2 s | 5.2 s | **0.02 s** | |
| CPU ×4, reading 0.9 s | 15.4 s | 4.1 s | |
| CPU ×4, no reading | 13.4 s | 8.4 s | (before the last change, `afresh`) |

The title in the same ×4 runs: 12.4, 12.0 and 12.7 s before, against 2.1, 2.4 and 2.3 s after.

**CPU ×4 slows the page, not its worker.** Chromium's CPU throttling is the page's main thread: a base start's
installs took 4.6 s at ×4 against 4.3–5.3 s at ×1. The ×4 set-out figures therefore understate a slow device, whose
worker is slow too. The ×4 title figures do not, because the title is the main thread's.

**Every browser run is a first visit.** Each starts from a fresh profile, so the parse store (`ParseKeep`) is empty
and the authored adventures are parsed as well as the country's own texts. A returning player has the authored parses
kept: in Node, a new country's texts cost 3.9 s once the authored ones are kept, against 7.8 s for the first.

What a player feels is the sum: the title, the hold on New game, creation's human time, then the set-out wait.

## 2. What moved, and why

### OR-09: the engine was inside the title's script

`mono.js` was 20.2 MB: the reader (2.87 MB) and the whole engine, embedded as a 17.06 MB JSON string so that the
page could start the worker from a blob (which works from `file://`). V8 compiled all of it before the title could be
drawn. Measured on one machine, cold:

| `mono.js` variant | title drawn | longest task |
|---|---:|---:|
| the reader alone, engine string empty | 0.49 s | 0.32 s |
| the reader with a 17 MB ASCII string | 1.04 s | 0.64 s |
| the reader with the real engine string (escaped, non-Latin-1) | 2.91 s | 2.39 s |

A CPU profile of the boot shows 1.1 s of native "(program)" time and 0.25 s of JavaScript. Of the 2.9 s, 2.4 s is the
embedded string. The title and creation themselves import only 2.9 MB (the largest parts: the catalog JSON, 746 KB;
`node:crypto`'s polyfill, 393 KB; paintings, 364 KB; `src/lang`, 317 KB; React, 190 KB).

**The change** (`2d95f5ae`): the engine is `site/engine.js`, a script of its own beside the page's.
- **Served** (Pages, the preview), the page starts `new Worker('engine.js')`. The worker fetches and compiles it off
  the main thread.
- **From `file://`**, a worker may not be started from a file: the constructor throws. The page then reads
  `engine.js` in as a script two frames after the title is up. That script only names its body (`kyrieEngine`) when it
  is not in a worker. The page starts the worker from that body's text.
- Requests asked before the worker exists wait for it.
- The `file://` path costs one main-thread task of 0.24 s after the title (1.06 s at ×4). The served path costs none.

**What remains:** the title cold is now the reader's own 0.25–0.33 s compile and first render. The engine's first
answer is 2.15 s cold, which is the worker compiling 17 MB, opening the parse store and answering the catalog. Creation
needs that answer, but the title does not. A hold on New game in the first two seconds therefore waits on it. With the
studio mark shown (3.8 s), a player never sees that wait.

### OR-08: the start made ready was never the one set out on

**Verified**, contrary to the register's wording: the composed creation **does** send `ready`. The page sends it
1.2 s after each choice, and `EngineStarts.prepare` starts a game for it. But **no key ever matched the engine's own
`set-out`.**
- The page armed the protagonist with the weapon its name page shows: `CreationRules.best`, "A battleaxe in hand".
- The engine's `EngineCreation.starting()` carried no weapon.
- So every prepared start was thrown away, and `set-out` began cold ("Drawing the world").
- The same mismatch meant a cold set-out armed the protagonist with the calling's default weapon, not the one the
  name page named.

Stale prepares also held the worker. Measured in the base build: creation replies were delayed by 2.4 to 3.1 s while
a stale start parsed.

**The change** (`273c8653`, and the wait for the reading in the commit that carries this report):
1. **The engine makes ready its own start.** At each creation choice, the engine itself (`EngineHost.chosen` →
   `EngineStarts.readying`) makes ready exactly what its `set-out` will ask (`EngineCreation.starting()`). The
   page's own `ready` is not sent while the engine holds the life.
2. **The name page's weapon is the one set out with.** `starting()` arms the weapon the name page shows and names an
   empty name as the page does, so page and engine set out with the same life.
3. **The country's texts first.** On the world drawn, and again when the reason for coming changes, the texts of the
   country for that reason are parsed (`Creation.warm`). Parsing is never wasted, since what is parsed is kept,
   whatever is chosen next. The old warm read a world drawn for a fixture company of three with no origin: about 10
   files and 330 KB of it differed from what the start then read.
4. **Then the start.** It begins 300 ms after the last change. A change gives it up at its next install, at once.
   Set out with nothing made ready for the life as it stands waits for the country's texts being read, and then
   begins. Begun beside the reading, the two had parsed the same texts at once.
5. **Its first look.** A start made ready builds its first screen once. Measured in Node: a first `ScreenModel.build`
   takes 0.43 s and a second 0.05 s, and building one leaves the checkpoint byte-identical.

## 3. What the world depends on (why "prepare from the why step" cannot work as asked)

The same seed and origin (`bafegilo`, kin), started cold with lives that differ in one choice each. The started saves
were then diffed (`/var/tmp/kyrie/m22/perf/diff-saves.ts`):

| choice changed | what differs in the started world |
|---|---|
| **name** | about 40 people's names across the country. Every person is named apart from the protagonist (`WorldAssembler.folk`, `taken`), so another name shifts the draws. The digest is equal, because it hashes facts, not names. The save is not. |
| **people** | under a kin origin, the drover's family (their people, names and gear) |
| **calling, weapon** | the protagonist's gear entities, and with them the order of the entity table |
| **trade** | qualities, hit points and skill relations |
| **presenting** | the creature's context and one relation (`pron_he` → `pron_she`) |
| **sign** | nothing at all: `CompanyChoices.apply` does not carry `sign` into the creature's context (a separate defect, below) |

The generated Kyr texts are the same for all of these (`diff-texts.ts`): only the campaign manifest differs (its
party, and each placement's Deem context). The texts differ by origin (3 files, about 300 KB) and, for some origins,
`origin.kyr` by the name.

So **parsing** depends only on the seed and the origin, and can be done from the "why" step. That is what step 3 of
the change does. **Installing** (37 modules, 4.2–5.3 s in the browser) follows the whole life: the party is applied to
module 0, and the name reaches every placement's context. A start can only be finished early for the life as it will
be. The last choice that changes the world is presenting, or a name other than the one drawn.

## 4. Where the remaining wait goes

The first page, once its start is taken: `timing` in the first frame, measured, after.

| part | made ready and finished | made ready, still installing | begun afresh |
|---|---:|---:|---|
| the country's texts read (parse) | done during creation | done | the rest of `Creation.warm` (about 3–4 s at no reading) |
| drawing the country (`WorldAssembler.assemble`) | 0.28–0.33 s, done | 0.3–0.4 s, done | 0.33 s |
| installing 37 modules (`Campaign.assemble`) | 4.3–4.7 s, done | 4.5–5.8 s, partly done | 4.7–5.0 s |
| the first look (`ScreenModel.build`) | 0.05 s (taken already) | 0.04–0.08 s | 0.37–0.47 s |
| the narrative | 0.05 s | 0.05 s | 0.05 s |

The wait is whatever of the install is left when the hold is let go. That is about 4.5–5.5 s, less the human time
since the last choice that changes the world (presenting, or a name other than the one drawn). From presenting to the
release of Set out is the name page and the go page: about 3.4 s at the lead's pace, and 5–6 s at a reader's.

## 5. The determinism proof

`test/set-out-ready.test.ts`, on `a1`:
1. **Made ready.** Choose why → order, human, mage, and wait until a start for that mage is under way. Then change the
   calling to warrior, choose "she", and write the name Ysolde. The mage's start is given up and one for the final
   life is made ready. Set out: the first progress said is "Placing its people", so the start made ready was taken.
2. **Cold.** A fresh host makes the same choices and sets out at once: "Drawing the world".
3. **The proof.** The digests are equal, and the whole session checkpoints (transcript and save: every fact, name and
   creature) are byte-identical.
4. **The weapon.** A second case sets out a warrior and finds the weapon the name page names in the transcript's
   party.

Mutation-checked twice:
- Letting a start made ready for other choices be taken fails it.
- Making the prepared start's life differ by pronouns alone fails it at the digest.

## 6. What remains, with exact causes

1. **The install chain, 4.2–5.3 s, for any change to the life.** The protagonist is in module 0, and the name is in
   every placement's Deem context, so no prefix of the chain can be kept across choices. The smallest paths:
   - Draw the country's people without reference to the protagonist's name, and settle a collision afterwards. This
     removes the name from 36 of the 37 modules, but changes generated worlds.
   - The M21 levers: shared rules composed once (AX-03, about −0.9 s warm), compiled modules kept by text (about
     −2.5 s), and `structuredClone` at handoffs (about 1.0 s).
   - Install the party last, so that the first 36 installs could be shared by every life of a country and reason.
     That needs proof that no install reads the party; inferred, not measured.
2. **A cold country's parse: about 3.9 s in Node, once the authored texts are kept, and 7.8 s on a first visit.** It
   now runs during creation, but at a fast pace creation is shorter than it. Shipping the authored parses with the
   build (M21 row 3) would cut a first visit's part.
3. **The engine's first answer, 2.15 s cold.** That is the worker compiling 17 MB. It is hidden by the studio mark,
   but not under automation or `?ident` skipped.
4. **One run of six at the lead's pace began afresh.** That run took 11.9 s; it was not reproduced in two reruns,
   both of which took the start made ready. Its cause is not found. The probe keeps only the last run's traffic,
   so the next measurement should keep the traffic of every run.
5. **The sign chosen at creation reaches no creature** (`CompanyChoices.apply` drops `sign`). Whether that is
   intended is not mine to decide; registered as OR-13.
