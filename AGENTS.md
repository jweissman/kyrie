# Working on Kyrie

For every agent and builder in this repository. It collects the owner's standing rulings: what the project is
committed to, and how work is done. Where a mission brief says otherwise, the brief wins. Today that is
[doc/architecture/mission-22-beta/BRIEF.md](doc/architecture/mission-22-beta/BRIEF.md). What is current is
[doc/STATUS.md](doc/STATUS.md).

The tie-breaker for every design choice is the doctrine ([doc/design/DOCTRINE.md](doc/design/DOCTRINE.md)): **does
this help the player forget the interface and become interested in what happens next?**

## Planning and the register

- **One record:** [doc/architecture/open-register.md](doc/architecture/open-register.md), with the archive. Stable IDs.
  Growth from honest discovery is not regress.
- **Three views** (`bun scripts/planning-views.ts`), each with its own purpose:
  - the record;
  - the supported slice's P0/P1 gate, counted against every row declared in it, never narrowed after a problem is
    found;
  - the active queue: at most ten blockers and three platform rows, each with an owner and acceptance. An urgent
    defect (a blank row, an act that lies, a softlock, lost state) displaces one.
- **Three instruments,** generated, not hand-kept (`bun scripts/planning-instruments.ts
  defects|atlas|roadmap|trend|next`):
  - each row's kind (defect, requirement or direction) is in doc/architecture/register-kinds.json, with why;
  - a defect is an observed violation of a claimed contract;
  - a wanted future feature is not a defect.
- **No "partly".** A row is open, closed, duplicate, deferred or reference. Close on the proving spec and split the
  remainder into a row of its own.
- **Triage:**
  - archive what is solved;
  - keep directions apart from defects;
  - name the architecture row that blocks a defect (a blocked defect is still a defect).
- **Burn down before adding surface.** Prefer work that closes a row, with its test and evidence.
- **Adventure branches' friction** (`doc/adventures/<id>/friction.md`) is carried into the register: checked against
  main, deduplicated, given priority and verification. Integrating a branch includes mending its simple dead ends
  (talk whose words are all it does, a softlock) by something taught, given or changed that later play reads.
- **Three streams:**
  - Game: the experience, owned by the lead;
  - World: content and creative growth, a continuous stream;
  - Instruments: Kyr, Deem, testing and foundations, the maturity track. The maturity track lands only what advances
    its own direction.
- **The feature map** is M22's instrument project: a behavioural map of the product, read top-down and run like a
  test. ("Atlas" means only the design Atlas: the page's colours and opportunities.)
  - Its tree is doc/architecture/feature-map.json: aspects (I, II, III…), sections, and capabilities titled as
    features. Each capability holds its feature and experience pins, its rows, and the layers its code is in.
  - `bun scripts/feature-map.ts --write` generates doc/architecture/feature-map.md. Its negative space shows
    capabilities neither built nor asked for, pinned with no request, or asked for with no pin. A request is filed
    under its capability's title.
  - Common blockers go in register-kinds.json's blockedBy. Prefer the maturity work that retires the most rows at
    once.

## Architecture rulings

- **One projection.** Every client (page, terminal, runner) draws the same marks from the same engine rows. Atlas
  logic lives entirely in the engine. Never fix a divergence in one client.
- **The engine owns the question:** the current step, its options and render hints. A client keeps no phase or step
  machine of its own.
- **The page invents no controls.** It plays the engine's rows, the lenses and the book; nothing else. Riddles and
  the like are fixed in the engine, for every client.
- **Every screen is an engine page.** The title, the beginning of a life, creation and Options included: the engine
  says what is asked and gives hints (a background such as the title's embers, an instrument such as the stars for
  astronomy, a placement), and the page draws them in one fixed, simple frame. The title may differ only by its hints;
  a fully unified frame, the title conforming too, is welcome (the owner, 24 November; OR-382).
- **Marks derive from the rows their drawer shows** (one derivation per lens), never from a parallel list.
- **Facets are inferred from what Kyr does, never declared by authors.** An act that gives the company something to
  know, teaches an ability, opens a way somewhere unvisited or hands something over is that opportunity. A topic
  leading toward such an act is someone with something to tell. Authors write acts and consequences, never
  indicators.
- **Trust contracts,** enforced mechanically, not by example:
  - a pip has a witness;
  - the gold stays continuous to its destination;
  - a lens's contents inherit its mark;
  - travel unfolds leg by leg.

  Colour belongs to indicators; action text is neutral. Every selectable row has a nonempty, intelligible label.
- **Layers,** each importing only from those below:
  - Kyr the language (src/lang);
  - the runtime (campaign, rules);
  - a generic player that knows no setting (session, presentation, creation);
  - setting modules (Westernesse canon, world, data; Tethys).

  An import lint holds a counted baseline: no new violations. SRD/Orsino is an installable fantasy-rules domain,
  distinct from the kernel and from Imbar; remaining core→fantasy edges stay visible.
- **Packages, the direction:** `kyr-lang`, `kyrie-runtime` and `kyrie-player`.
  - TB-09's engine-owned questions are the player package's contract. `web` becomes part of it in time.
  - Assembly speaks in medallion layers: bronze sources, a silver conformed module, gold facts and views. Each
    boundary is a contract (OR-408).
  - Extract repeated obligations, not repeated shapes, and enforce a boundary before moving a directory.
  - The order is in doc/architecture/mission-22-beta/platform-separation.md. Packages never interrupt the streams.
- **Standing rulings:**
  - Random draws are keyed by stable identity, not one sequential stream. Replays go by semantic id, and cold
    captures are immutable.
  - Campaign isolation is an invariant.
  - Narration is durable: history keeps the text the player saw.
  - There is no save-compatibility promise yet.
- **Semantic tracing:** high-level Kyr declarations (Occasion, Promise, Route) should survive compilation as
  first-class objects linking source, participants, phases and causal history. Deem's tables and templates are Kyr's
  "header files" for procgen.
- **Performance:** routine headless transitions in microseconds to low milliseconds, not marginal gains on a wasteful
  baseline. Measure by layer (simulation, decision, frame, page).
  - Beta's targets: a decision under 15 ms median; a non-journey turn under 30 ms; a journey leg under 5 ms; an act
    settled in the browser under 300 ms p95.
  - The fixes are incremental computation, not a language port.

## Testing

- **The experience gate:** `bun run quality` (scripts/quality/) reads five numbers nightly and holds each by a
  ratchet in scripts/quality/baseline.json: the slice's P0/P1 defects, a new life to its first act, the median turn,
  the continuity census's breaches, and main's CI minutes. Lower a baseline with `--update` when a number falls. A
  week's work should move at least one.
- **The acceptance ladder,** cheapest first:
  1. setting-independent contracts;
  2. seeded headless journeys, with invariants at every turn;
  3. cheap automated players (gold-follower, wanderer, adversary);
  4. blind cold-play agents of stated kinds on the rendered page;
  5. human acceptance, only at milestones.

  A higher-rung failure becomes the cheapest reliable lower-rung test. Cold-agent success is never reported as human
  acceptance. No gate waits on an unfamiliar human player.
- **The world gate:** `bun run quantity` (scripts/quantity/) holds the world's numbers, its symmetry with quality,
  as the guard against regression in baseline behaviour. Its measures are combat density and fairness, the economy,
  Atlas density, reach, situation variety, errands, the first dungeon and stranded content. A band passes because
  the world is right, never by widening it; fix the measure only where its reading is unsound, and say why.
- **Pay only for the semantics under test.** Use a Kyr fragment with a minimal prelude, not a world, when a fragment
  proves it. Flows are checked headlessly against page objects; browser journeys are few. A tiny rule's spec must
  not pull in the universe: rule packages with declared dependencies and a fragment harness that takes a declared
  horizon (OR-407, blocked by BX-02).
- **Feature pins:** `test/features/<pillar>/<feature>.pin.test.ts`, each a narrow scenario proving one behaviour.
  The pillars are prose, choice and consequence, character, conflict, world and exploration, interface and
  persistence.
- **Experiential pins by failure family** keep the owner from rediscovering the same failures:
  - promise fidelity;
  - attention;
  - continuity;
  - variety;
  - prose economy;
  - identity.

  They are cheap walk-based floors, not scores.
- **Fun Fridays:** a few charming, fully playable experience pins (pleasant activities, played through the ordinary
  interface), not many lifeless ones.
- **No test over ten seconds on the push suite** (the owner, 24 November). The push lane (test/lanes.json) takes each
  file under ten kept seconds and test/small. Anything slower runs nightly, and the world-level walks run before
  landing as the world canary (test/canary.json, which `bun run test:changed` adds whenever a change can move every
  world). A slow spec is made cheaper or moves out; test/small holds no file over ten seconds.
- **Flaky specs are quarantined** (test/quarantine.json, with why and the lower-order replacement). They stay out of
  every gating lane and run only in the optional post-CI quarantine workflow.

## Design and experience

- **The doctrine governs.** Invitation, not inventory; attention repaid; a quiet, stable, game-native interface.
- **Prose:** empty words are an obstacle. Avoid compound "X, and Y, and Z" clauses and "someone/something". The
  first-hour ratchets in test/small hold this.
- **The resting scene:** the painting dominates. Add a short description, small floating portraits of those present,
  and a discreet Go… / Explore… control. A painting is never replaced by text.
- **Atlas indicators belong to menu action rows alone** (the owner, 25 November). No left-border indicator, Atlas
  colour or coloured mini-toast on narration, notes or any other text: text is just text, and the narration is plain.
  The Atlas colours strictly mean an opportunity in the current scene. What a mark had said elsewhere becomes a note in
  the journal, which is quiet: a pip or none, never a counter.
- **Colour grammar:**
  - one small left indicator per opportunity (a colour, or a restrained OKLab gradient);
  - the title modestly tinted;
  - supporting text and surfaces neutral; words never in a hue (test/small/colour-grammar);
  - nothing flashes or blinks a colour, the map least of all (test/small/no-flash).
- **The starting world** invites at once:
  - The first dungeon is near the first town: in its hex, or within two. It is deep: at least two levels of serious
    resistance, each with a boss and a treasure cache, a companion to recruit there, and gear to find near a secure
    entry.
  - The first town is simple. Its jobs are uncovered by investigation (a check, a search, asking the right person),
    not handed out.
  - Situations come from a varied repertoire, not shallow errands (OR-310, OR-311).
  - Danger is genuine. Roads carry a little. Fights are dense in specific, easy-to-find combat places, which quests
    send the company back to periodically and which reward expedition after expedition.
- **The conversation page** (the speaker's painting large, the dialogue beside it) is the one page rated right; keep
  it. Conversation is moving toward one scrolling page, then engine-owned dialectic (OR-149, OR-165).
- **Nothing floats over text** (the owner, 24 November): the frame reserves the menu column and no content runs under
  it. Transparency is used very sparingly, never where it makes words unreadable ("it just looks cheap").
- **Themes are set globally:** a theme is an engine hint for a whole application of the page (the backstage, the
  title), applied by the frame, never chosen page by page. The backstage is one folio, a parchment page framed on the
  dark table, every page of it alike.
- **The title has no hero wordmark:** negative space, the painting or the embers, and the product's identity small at
  the hard right.
- **Every change to the page is looked at:** it lands with a contact sheet at 1280 and 390 that its builder has looked
  at page by page. Its contrast is held by the contact sheet's ratchet (scripts/contact-sheet-contrast.ts).
- **Unfolding menus only in a fight.** Elsewhere rows are one flat level. Long lists appear only in a store.
- **The map is an in-world instrument**, not an app. It opens for inspection while the character stays in the scene;
  "Put away the map" is an act; the hex crawl is playable by the action menu alone.
- **Focus, activity and engagement are distinct,** set by the engine through the act that begins them. Prove one
  excellent focused activity before many.
- **Casting is causally legible:** a calling grants named capabilities; an authored act invokes them, at a stated
  cost, under the rules.
- **Directions kept whole, not commissioned:**
  - the seven programs (doc/design/directions-2026-11-20.md);
  - the civilizational atlas (doc/design/direction-2026-11-24-civilization.md): gamma's commission
    (doc/architecture/mission-22-gamma/COMMISSION.md); beta builds only its six proving cases;
  - adventure → career;
  - a middle scale inside a hex;
  - books and practices as perception instruments.

## Rules, Kyr and data

- **SRD-accurate changes land** without a per-case ruling, even when they move creation cards.
- **Rules work by proof slices,** never a catalog import. Migrate a row only when the player can meet its defining
  behaviour, the world can explain it, and its generation impact is known.
- **Kyr: fewer, stronger concepts.** Canonical vocabulary only; legacy is deleted; `bin/kyrie lint` is the gate.
- **Data layout** (data/README.md): catalog, rules, regions, sites, institutions, situations, campaigns, generation,
  sources. A campaign installs modules in order; ids are namespaced per installation.
  The direction (the owner, 24 November): two top-level parts an author can latch onto, `settings/` (campaign-level
  metadata and tables) and `scenarios/` (specific adventures and stories), with a small global part for rule modules
  and catalogs. It is researched before anything moves (doc/architecture/mission-22-beta/data-layout.md).
- **Orsino:**
  - `data/catalog/orsino/` is generated (`bun bin/orsino-registry.ts catalog`);
  - a hand entry may replace a generated one only by naming the same `source.orsino`;
  - the coverage report is generated (`report`) and a spec fails when it is stale.
- **Handbooks** (PHB, DMG, MM) are generated audit instruments. Run `bin/kyrie handbook` after catalog or rule edits.

## Ways of working

- **The owner's checkout** is theirs: no stash, reset, edits or git in it beyond a fast-forward after landing. Their
  uncommitted edits (lint limits, deem.run.json) are requirements. Content they leave untracked (docs, paintings in
  assets/bg) is checked in byte for byte from a worktree. Never `git stash`; compare with a worktree or `git show`.
- **Worktrees:** under /var/tmp/kyrie, dated names, `test ! -e "$P" && git worktree add …`. Run git as `git -C
  <path>` and chain with `&&`, never `;`.
- **Landing:** `scripts/landing/land.sh <sha>` (an explicit sha, never HEAD) rebases, gates, pushes, watches CI and
  fast-forwards the owner. It changes the sha, so never wait on the old id. Batch landings: each push cancels main's
  CI, and Pages deploys only from a green run. Run `bun run test:small` before landing prose. `scripts/landing/full.sh`
  runs the whole suite first.
- **Gates:** a gate is the runner's exit status, read in its own call before committing; never a grep for "N fail".
  Guard spec paths (`test -n "$f" &&`): a bare `bun test` is the whole suite. Check a spec name is free before writing
  one. Never read `process.env` at module load in shared src.
- **Inner loop:** `bun run check:fast` (~30 s), then `bun run test:changed`. Heavy runs (full suite, browser, tours)
  go to CI. Use `gh run watch --interval 60`, one at a time.
- **Machine load:** one heavy job at a time; no edits in a tree while its suite runs; no poll loops; never `pkill -f`
  a pattern that is in the command itself; at most two agents besides the lead.
- **Autonomy:** decide ordinary design calls, and report each as a trade-off and a call. Never end a turn waiting on
  the owner. Ask only for direction-level or artistic choices. One app on main, in small verified increments.
- **Lint limits are the owner's** (eslint.config.mts): split functions and files to meet them; never loosen them.
