# Mission 15 report: a fast inner loop, the adventures as content, and the first steps to a new page

Mission 15 set three priorities, in order:

1. **A fast, trustworthy inner loop**, before any major interface or feature work.
2. **The independent adventures as first-class content**, discoverable from generated worlds, with a language and
   tools as capable for their authors as for the engine's.
3. **A new human-facing experience**, which the owner's [`AESTHETICS.md`](../../design/AESTHETICS.md) later governed
   by its playbook (§10).

It was one day's work, 2026-10-25: 51 commits from `7e8cfde` to `8d98cff`, 352 files, about 18,600 lines added (most
of them the four adventures, their journeys and the composition screenshots). The suite is 818 specs: 787 pass and 31
are opt-in, the browser specs and the long descents. CI runs both on every push, and on the last commit all three of
its jobs passed (run 40254529014). The running record is the [ledger](ledger.md); the measurements are in [`performance.md`](performance.md)
and [`time.md`](time.md).

Every play described here is mine, through the page's own choices or the text harness, with three exceptions that
arrived during the mission:
- the independent audit of `ab9055a` ([`independent-audit-2026-10-25/`](independent-audit-2026-10-25/report.md));
- the architecture review of `483e3af`;
- the cold playtest of `2684952`.

Where they found something, this report says what became of it.

## In short

- **Priority I is done in substance.** A command in a long game went from 244 ms at the median and 7.95 s at worst to
  65 ms and 0.51 s. A rest went from 2.4 s to 112 ms. In the page at a tablet's size, a choice is answered in 94 ms at
  the median and 410 ms at worst, against 296 ms and 6.96 s. A long game holds 77 MB where it held 232. Nothing
  the company is shown changed over the whole 335-choice journey (its hash is the same at the end as at the start).
  CI runs every spec, shows every skip and was proved to turn red, and a clean clone builds with Deem and the languages
  pinned. Left: a march crossing still takes 1.2–2.1 s, keeping the game still grows with it, and no tablet was
  measured.
- **Priority II is done for four adventures.** Thrume, The House That Grows, The Road the Star Came Down and The
  Patient Star are on `main`, each as written. All four are played by 72 journeys through one driver that `kyrie play`
  also uses. Each generated world holds one of them beyond its first country, told of by that country's folk and by an
  innkeeper's rumour. Authors can now say about a dozen things they could not. Left: module-local tables and
  templates, which the brief asked for and which were not begun; the title page lists the adventures only under
  `?dev`; a fifth adventure (Low Water) is still being written on its own branch.
- **Priority III has taken its first four steps of seven.** These are the audit, the art-direction sheet, three
  prototype compositions of one recorded journey, and a provisional direction. Two engine repairs the page needed
  came with them: nothing irreversible is done by a slip, and the map shows what the company has been told of. The
  new page itself is not built. It waits on an independent player's verdict on the prototypes.
- **Not taken up:**
  - the brief's cross-cutting charge on adventure quality (the necromancer's tower as a diagnostic, strategic
    antagonists, pacing variety);
  - Priority III's character sheets, level-up preview, ability acquisition, keys and locks in context, and a public
    name for the game.

## I. A fast, trustworthy inner loop

### Measured by layer

The brief asked for a sustained same-game journey measured end to end, with the simulation, the interface and the
harness kept apart. Four layers are measured separately on the same commands:

- **A, the simulation alone:** `scripts/sim-bench.ts`.
- **B, a headless session:** `scripts/sim-bench.ts`, `--layers B`.
- **C, the browser's engine in one process:** `scripts/journey-profile.ts`, which is bounded, streams its steps and
  keeps checkpoints to start again from.
- **D, the built page in Chromium:** `scripts/journey-browser.ts`, at 820 × 1180.

The journeys:
- **wren:** a kept record of 335 choices, six expeditions into a generated mine over eight days.
- **the frontier segment:** 15 commands in the country beyond a march, at 104,000 facts and 33 modules.
- **the march wander:** 120 commands crossing five marches.

| | at the start (`7e8cfde`) | at the end (`8d98cff`) |
|---|---|---|
| wren through the engine: a command, p50 / p99 / worst | 244 / 5,280 / 7,952 ms | 65 / 362 / 514 ms |
| wren in the built page: choice to frame painted, p50 / p99 / worst | 296 / 4,740 / 6,960 ms | 94 / 310 / 410 ms |
| the simulation alone | 5.4 commands a second | 64.7 |
| a rest of eight watches (simulation, median) | 2.4 s | 112 ms |
| the frontier segment: the engine's median | 753 ms | 133 ms |
| a march crossing | 3.0–4.5 s | 1.2–2.1 s |
| a long game's heap after 333 commands (after collection) | 232 MB | 77 MB (a fresh restore: 48) |

The page's numbers at the end were measured again on `8d98cff` for this report (p90 163 ms; the page's own keeping of
the game 2 ms at the median).

**Why it was slow.** Every cause found by profile was the same mistake: work in proportion to the whole world for a
change to a small part of it. Each was replaced by work in proportion to what changed:
- A world was copied to fork it. Worlds now share each relation until they write it.
- Every fact was listed at every commit. The campaign now keeps its world.
- Every creature was projected again on every watch. Now only actors whose part changed are projected.
- Every rule was asked whatever had changed. Now only rules whose reads were written are asked.
- Lookups scanned every fact or creature. They now read indexes.
- The observation was worked out four times a command. It is now worked out once per world.
- Grounding joined without locality. Queries now propose candidates.
- Every action ever grounded was kept forever, 128 MB by step 333. Now only those still wanted are kept.

The changes and their measured effect, commit by commit, are in [`performance.md`](performance.md).

**Shown to change nothing.** Each change was checked against hashes of the session's canonical state, the world's
sorted facts and what the company is shown, over all of wren, the frontier segment and the march wander. What the
company is shown over wren hashes `6926d284f15e9327` at the start and at the end. The other two moved only where a change
meant them to. Copy-on-write changed the order facts are held in (the sorted facts were the same), and the rumours and
the places facts lead to added facts. A frontier game played through the browser's engine and replayed by `bin/kyrie replay` in a fresh process
came to the same state.

**Trustworthy.**
- `.github/workflows/ci.yml` runs lint, types and the whole suite on every push, with Orsino checked out so its spec
  runs. Its other two jobs, the long descents and the browser specs, fail on any skip. Every failed or skipped spec is
  listed in the run's summary.
- A branch with a spec made to fail went red on that spec alone.
- Deem and the languages are pinned by commit, and a clean clone installs, lints, checks and passes. The clean clone
  found three things that had only worked on this machine; each was fixed.
- [`../verification.md`](../verification.md) gives each tier of checking and its time: one spec in seconds, the suite
  in four minutes, the same-game hashes in forty seconds.

**Left in I:**
- A march crossing still takes 1.2–2.1 s, because everyone's creature facts are projected again with each of the new
  country's modules. An order-preserving projection is the next step.
- Keeping the game rewrites the whole state after every command (1.25 MB by wren's step 175). It no longer delays a
  player at a player's pace, but it grows with the game.
- Choices are grounded afresh in every new world.
- Time still passes watch by watch. Advancing to the next watch at which anything can happen is designed, with its
  oracle, in [`time.md`](time.md), and not built.
- No iPad, and no Safari, was measured. The slowdown the owner saw on an iPad is reasoned to be the causes repaired
  above, not reproduced there; CDP's throttling does not reach the engine's worker.
- The catalogs of kinds are still the process's own (the audit's F1, contained but not fully repaired).

## II. The independent adventures

**On `main`, as written.**
- Thrume (`93d03f4`).
- The House That Grows (`41ba11a`), its own kinds kept its own.
- The Road the Star Came Down (`5a2dec7`), all five acts, from a branch that kept moving.
- The Patient Star with Hold One Season (`0efdc56`).

Each changed only where the language's later rules asked, as its commit names, and each is offered beside The Long
Man. One driver (`src/session/journey.ts`) plays all four adventures' 72 journeys, with every step form their authors
grew. `bin/kyrie play` plays the same steps from the terminal, with probes of the world.

**In generated worlds.**
- A world holds one of the four, chosen by its seed among those that fit its first country, beyond that country's
  marches.
- The first country's folk speak of it by name.
- The innkeeper of the town its road leaves from tells its rumour, known from then as heard from them.
- The march-stone names the country it leads into: the review's E2 found one naming the wrong country, now repaired.
- A place the company has been told of is on its map before it has been there (`leadsTo`).
- Installing one takes 0.35–0.9 s.

This answers the cold playtest's first finding (the adventures could not be found from an ordinary start) for play.
The title page still offers them only under `?dev`. That is the review's E1, and a product decision.

**What authors can now say,** each pinned by a probe, and the four authors' reports answered together in
[`adventures-response.md`](../../authoring/adventures-response.md):
- a member's speed;
- a rule's or an event's words teaching what they say;
- an ending that closes the book;
- every colliding name reported in one load;
- a count that stops at nothing;
- a long risked way not turned back by the risk;
- two alike-worded changes both offered;
- a light taken by the act that lights it;
- an observation's variable filled;
- a companion who leaves;
- a speaker who must be able to speak;
- an act that cannot be undone, confirmed;
- a place known by report.

`kyrie new` scaffolds an adventure that lints, plays, is tested and can be placed. The shrine's argument over a deep
site's seal is now public content (`data/generation/deep/argument.json`), byte for byte the same in eight seeds' worlds.

**Left in II:**
- **Module-local tables, weighted and conditional selection, templates, generated families and naming,** which the
  brief asked for, were not begun. The deep argument's words are content now, but its structure is still the
  generator's.
- Hooks are rumours, names and march-stones; letters are not among them.
- The adventures' open findings, by mechanism, in `adventures-response.md`: knowledge from a named source, state names
  scoped to their thing, arithmetic, dates, people on errands, senses beyond sight, and four bugs.
- An authored country placed in a generated world still tells of its own protagonist (The Patient Star's "your own
  knife").
- The Low Water adventure, being pushed to `adventure/low-water` while this was written, has not been assessed.

## III. A new human-facing experience

The owner's `AESTHETICS.md` arrived mid-mission and set Priority III's sequence: audit, art direction, prototypes,
selection, one ordinary-player journey, the whole game, verification by cold play. Its first four steps are done.

1. **[The audit](priority-iii/audit.md)** files every attentional and navigational failure from the owner's play, the
   cold playtest and the review under the six moments of the playbook's fixed journey. It classes each as
   correctness, semantics or presentation.
2. **[The art-direction sheet](priority-iii/art-direction.md)** sets the tokens:
   - white paper and near-black ink;
   - blue for attention, red for harm and what cannot be undone, yellow for a discovery;
   - Newsreader for what is told, Jost for what can be done;
   - darkness in the fiction, not the page.
3. **[Three compositions](priority-iii/compositions.md)** draw one recorded journey from the same engine frames and the
   same choices: A, the literary page; B, the inhabited scene; C, the traveller's folio. The journey is 25 beats over
   arrival, conversation, travel, investigation, danger and return. The current reader was photographed at the same
   beats as the control. Each composition plays the whole record with the keys alone, and was read at 1440, 900 and
   390 px and without images. `bun scripts/compositions.ts --serve` shows them.
4. **The provisional direction** is a hybrid:
   - the literary page as the ground;
   - the current conversation page kept on white, as the owner asked;
   - the inhabited scene's object plate and fight layout;
   - the folio's route lines (been, heard of, not yet been) and its itinerary, summoned when wanted.

   Rejected, with reasons in the review:
   - a portrait chosen to stand for a place;
   - a map plate in open country;
   - a folio always beside the page;
   - the grid of portraits;
   - a page that goes dark in a fight.

   It stays provisional until someone who has not seen the prototypes plays them.

Two repairs the page needed are done. `Grave` acts say what they cost and are done only when chosen again. A fact may
lead to a place, so the map holds what the company has been told of.

**Left in III:** steps 5 to 7, which are building the journey, carrying it across the game, and cold play. Besides
them:

- **What the compositions found the engine cannot say:**
  - the mine's galleries report themselves outdoors;
  - portraits are cast from descriptions that miss what matters (Baern, priest of the Goddess of Light, is *David with
    the Head of Goliath*);
  - the engine chooses who does an act, unseen;
  - topics vanish once asked;
  - no moment is marked exceptional;
  - no return is told as one;
  - a way out does not say it leads toward a place known by report;
  - those with something to say are not told apart from the crowd.
- **The cold playtest's correctness defects:**
  - an epitaph without its protagonist;
  - "You carry out the action." in the Story;
  - lines repeated word for word;
  - a riddle the reverse of its answer;
  - the Light spell not offered in the dark;
  - verbs that answer nothing;
  - the Story lost on loading a save;
  - a minstrel who fights as a dwarf warrior.
- **Presentation:**
  - the page still turns dark underground and in fights;
  - the authored campaigns still open by asking for three companions.

## The independent reviews, and where they stand

| | done | partly | open |
|---|---|---|---|
| The audit of `ab9055a` | F2 questions answered, F3 a command undone whole, F4 a companion who leaves, F5 an observation's teaching and binding, F6 a dead speaker, F7 actions hidden behind one wording, F9 pins, clean clone and CI; the retained heap | F1 catalogs (each campaign claims its own kinds; still the process's), the frontier's expansion (3.9–6.1 s to 1.2–2.1 s) | F8, a boundary of the language's event and knowledge forms, not a defect |
| The review of `483e3af` | A1 a learned fact blocking every later country, A2 a checkpoint during a crossing, E2 a march-stone naming the wrong country | B1 a long risked way (repaired; road hazards not yet told as events) | E1 the title page, E3 travel along known routes |
| The cold playtest of `2684952` | C1 the adventures found in ordinary play | C7 rumours (the innkeeper's are now heard, not seen) | the rest, as listed under III; each is filed by moment in the audit |

## What I would set next

The atlas asks that Mission 16 be derived from the game's artistic principles, with reviews as evidence rather than
the roadmap. Read that way, the playbook's ordinary-player journey is the spine, and the rest serves it:

1. **Settle the direction.** Have someone new play the three prototypes and the current reader, and record where they
   disagree with this review.
2. **Make the six moments true in the engine** before styling them:
   - topics that keep a follow-up;
   - a return told as one;
   - ways that say which known place they lead toward, and travel along a known route;
   - the doer of an act shown and chosen;
   - exceptional moments marked;
   - the cold playtest's correctness defects;
   - the mine's shelter;
   - an editorial pass over the paintings, since the conversation page the owner values is only as good as its
     painting.
3. **Build the journey in the chosen direction, then carry it across the game,** keeping the conversation page, and
   verify it by cold play at three widths, by keys and without images.
4. **Keep the inner loop honest as the world grows:**
   - the order-preserving projection that would end the crossing's cost;
   - the game kept in pieces that do not change;
   - time advanced to the next watch at which anything can happen.
5. **Assess Low Water on its branch,** and give authors module-local tables and templates.

## How the work went

- Three times I edited the tree while the suite was running in the background. Each was caught before a commit, and
  the committed tree was checked again; it is now a standing rule. No wrong commit came of it.
- The ledger said the four adventures were "on the title page". They are, but only under `?dev`; this report and
  the ledger now say so.
- Every performance number is from one desktop machine (WSL2, bun 1.4.3), with nothing else measured at the same
  time. A tablet's cost is reasoned, not measured.
- The design review in Priority III is the builder's own. The playbook is explicit that this is not evidence of
  success, which is why the direction is called provisional.
