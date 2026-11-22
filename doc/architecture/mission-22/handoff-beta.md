# Hand-off to M22-beta (22 November 2026)

For the builder who starts beta with no memory of alpha. It says what to read, what is loose, and how work is done
here, in that order. The verdict on alpha is [closeout.md](closeout.md); why it ended there, and what beta should
change, is [alpha-retrospective.md](alpha-retrospective.md). This page does not repeat them.

## Read first, in this order

1. [doc/STATUS.md](../../STATUS.md): the one current account.
2. [closeout.md](closeout.md): alpha closed as a proving phase, not accepted as a first-hour product. It covers the
   six outcomes, the gate, the responsiveness ruling, beta's entry conditions and four contracts, and what supersedes
   what.
3. [alpha-acceptance.md](alpha-acceptance.md): the owner's play findings and the three continuity invariants (focus
   OR-177, opportunity OR-178, undertaking OR-179). These are beta's first contracts.
4. [alpha-retrospective.md](alpha-retrospective.md): why passing specs did not become trustworthy play.
5. The owner's design notes that frame beta's architecture:
   - [kyr-semantic-boundaries.md](../../design/kyr-semantic-boundaries.md): authors declare fiction and causality;
     the engine derives the rest;
   - [derived-knowledge-indications.md](../../design/derived-knowledge-indications.md);
   - [deem-kyr-interop.md](../deem-kyr-interop.md): its steps 1 to 3 are for beta's authoring track;
   - [focus-activity-engagement.md](../../design/focus-activity-engagement.md).
6. [planning-views.md](planning-views.md) and `bun scripts/planning-views.ts`: the register is the record; the capped
   queue is what is worked on.

## Where main stands

Main is green. Each landing passed CI on its push, and every world-moving change passed a full run first. Pages
deploys main. Today's last landings were the owner's paintings (about 160 scenes), the scene census, and the
alpha documents.

## Loose threads

**Unlanded work, to decide on:**
- **maturity-23** (branch `maturity-23`, 7e83905c8; worktree `/var/tmp/kyrie/wt-mat23`) is AX-04's templates
  declared as values: towns' and sites' Kyr parsed once with holes, not per world.
  - It is shown equal (module and game) over a1, iscoed, kite and four seeds.
  - Measured: generated Kyr parsed 1.4 → 1.0 MB, a fresh process's parse 1.6 → 1.36 s, warm 1.0 → 0.78 s. A new
    world still takes about 5–6 s against a 3 s target.
  - It touches 32 files and was never reviewed: its agent's last word was "waiting for a quiet machine to run the warm
    spec". Land it only after review and its own full run, or fold it into the transition-summary work.
- **Case 66** (the spiders' mother as the SRD Large monstrous spider) was deferred. It is the next SRD creature slice
  after cases 63 to 65 (doc/architecture/mission-22/srd-proving-cases.md).

**Open questions that are the owner's, or need the owner's word:**
- **OR-178:** is a job offered knowledge (blue) or an undertaking (gold)? The old quarry's missing blue is traced to
  ChoiceGrouping.teaches: a job's own given-marker counts its id as made. Fix only once the semantics are settled.
- **Rooms and weather:** should a room's painting answer the weather outside? A byre painted with rain at its door is
  refused on fair days. Until decided, rooms are painted with no weather (scene-needs.md).
- **The awaiting-judgment portfolio:** OR-75, FM-03 and IG-20 close only on the owner's reading. Their engineering
  half, OR-180, is separate.
- **The design review** of the portrait tablet, surfaces and the fight (doc/design/design-review-2026-11-21.md): seven
  questions. Question 5, the fight's reach, is OR-181. Question 4 (unreachable routes) is real: the contact sheets
  could not reach the handbooks from Options in any of four walks (mission-22/reduced-motion/).

**Defects diagnosed, not fixed** (each in the register with its cause):
- **OR-176:** the order walk shuttles to the reeve while its aim waits on a rule of the clock. Lead a wait or a need;
  never gild a spent talk.
- **OR-177's map case:** the map active with "Put away the map" and no map drawn. Undiagnosed.
- **OR-178's glyph:** the anchor-like mark is likely the journey glyph. Unconfirmed on the page.
- **OR-179:** a reward not led to. Not yet reproduced; the weir's rats job is led to its payment.
- **OR-173's remainder:** focus is still decided in src/ui (Attention), not by the engine.
- **CB-01:** first-hour fights cost nothing (both weir-route fights, no hit point lost). Then CB-31 (the mage's 14
  first-hour bands) and CB-32 (lone thieves' fights out of town).

**Responsiveness:** ruled in closeout.md. The budget is acknowledged within 100 ms and settled within 300 ms at p95 on
the deployed page on a phone and an iPad; OR-170 and OR-127 are its first rows. One timing is near its edge: OR-91's
held journey at 390 px drew its card at 999 ms once on CI (passing at 523 ms on rerun).

**Paintings:** [scene-needs.md](../../design/scene-needs.md) is the one current list, cross-checked against what was
delivered. It names four blanks that are bindings, not paintings: "the drowned street", Holgar's salt-house, groups
of a painted kind, and the room-and-weather rule above.

## How work is done here

**Landing.**
- `scripts/landing/land.sh <sha>` lands a commit from a spare worktree. It rebases and gates if main moved, pushes,
  watches CI, and with `KYRIE_LAND_FF=/home/jweissman/work/kyrie` fast-forwards the owner's checkout.
- `scripts/landing/full.sh <sha>` first runs the whole suite on a check branch. Use it for anything that moves worlds
  (content, paintings, generation, rules), since the push lane does not see that fallout.
- Land an explicit sha, never HEAD. Batch landings: each main push cancels the previous run and starves Pages.

**The owner's checkout** (`/home/jweissman/work/kyrie`) is theirs.
- Never edit it, stash in it, or run git there except the fast-forward. Use `git -C` and absolute paths.
- After every landing, check it for new untracked files: the owner drops paintings and notes there. Check their
  content in byte for byte (`cmp`).
- If it will not fast-forward, find out why (a local change identical to history, local commits) and tell the owner
  the command.

**Gates.**
- `bun run check:fast` (about 70 s), then `bun run test:small`, then the specs you touched, one file at a time.
- Gate on the exit status, never on a grep of the output: `grep "1 fail" && commit` commits on failure.
- No browsers locally (they exhaust the machine); the browser lane is CI's.
- One heavy job at a time.

**Worktrees** go in `/var/tmp/kyrie`, with dated names (`wt-<what>-<mmdd>`). Check that the path is free before
`git worktree add`, and symlink node_modules from an existing worktree. Never `git stash`.

**The register** (`doc/architecture/open-register.md`):
- A new row needs a feature in `doc/architecture/features.json`, and, if live P0/P1, either slice membership or an
  `outside` reason in `mission-22/planning.json`.
- `test/small/register-*`, `planning-views` and `closure-lint` check this.
- A closed row must answer each clause and reference of its own text, or closure-lint refuses it.
- No "partly": split the remainder into its own row.

**Prose** has ratchets (test/small/empty-words: similes, indeterminates). Run test:small before landing any new prose.

**Paintings**, to import: convert to `assets/portraits/scene-<name>.jpeg`; record in `data/paintings/seen.json`
what it shows, its light, and its weather and season only if shown; place it on a kind in
`data/paintings/scenery.json`; run `bun scripts/paintings.ts`, keeping only the new entries from its output (it
re-encodes some unrelated copies); then run `bun scripts/scene-census.ts` to see what it filled. Seasonal paintings go
on the season's list. Specs that pin one exact painting of a kind need widening to the kind when a painting is added.

## Advice, from alpha

- **Prove contracts over walks, not scenarios.** The specs that held (one-world-map, one-gold-on-map,
  journey-course-walked) assert a property at every turn of a golden walk. Write the three continuity invariants that
  way first, failing, so that beta starts from a measured count of breaches.
- **Fix causes in the engine.** Every fix that generalized this mission was in the engine (Engaged, Guarded, Shut,
  one projection). A fix that pins one walk leaves its class open.
- **Prefer one engine answer to many scanners.** Where the Atlas, the gold, the journal and focus disagree, they are
  reading predicates their own way. Before adding another guard, ask whether a single transition summary per action
  would remove the need (the retrospective's §2).
- **Put a person in front of it.** The retrospective's recommendation: one unfamiliar player, recorded, for fifteen
  minutes on an iPad. Alpha had none.
