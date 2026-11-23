# Ways of working

How work is done in this repository, for a builder new to it (a person or an agent). The game and its code are
described elsewhere: the [README](../../README.md) routes you, [STATUS.md](../STATUS.md) says where things stand,
and the current mission's hand-off says what is loose. This page is the practice that does not change between
missions.

## The first hour

1. Read [STATUS.md](../STATUS.md) and the current mission's hand-off, which it links.
2. Make a worktree; do not work in the owner's checkout (below).
   ```sh
   P=/var/tmp/kyrie/wt-<what>-<mmdd>
   test ! -e $P && git worktree add -b <branch> $P origin/main
   ln -s /var/tmp/kyrie/wt-m21/node_modules $P/node_modules
   ```
3. Run `bun run check:fast` there once (about 70 s) to see it green before you change anything.
4. Play a little: `bin/kyrie play --world iscoed --as human/warrior/Wenna`, then the page from `bun run web:build`.

## The owner's checkout

`/home/jweissman/work/kyrie` is the owner's. They keep uncommitted work and drop new paintings and notes there.

- **Never** edit it, `git stash` in it, or run git there except the fast-forward that landing does. From elsewhere,
  use `git -C <dir>` and absolute paths; a failed `cd` followed by a git command once ran in the wrong tree.
- **After every landing**, check it for new untracked files (`git -C /home/jweissman/work/kyrie status --short`).
  Check the owner's content in exactly as written, verified with `cmp`, and land it.
- **If it will not fast-forward**, find out why before saying so. A local file may be identical to history, or the
  owner may have local commits; in the second case `git pull --rebase` replays theirs. Tell the owner the command.

## Gates

- **Order:** `bun run check:fast`, then `bun run test:small`, then the specs your change touches, one file at a time:
  `bun test test/<file>.test.ts`. Never `bun test $f` with an empty `$f`; it runs the whole suite.
- **Gate on the exit status:** `bun run test:small > log 2>&1 && git commit …`. Never grep the output for a count;
  `grep "1 fail" && commit` commits on failure.
- **No browsers locally.** The browser specs and the long descents are CI's. One heavy job at a time on this machine.
- **Lint limits:** 120 characters a line, 380 lines a file, 55 lines a function, at most 4 parameters. No arrow
  functions assigned to variables; use methods. The owner adjusts these; follow what eslint says.
- **Prose ratchets** (test/small/empty-words: similes, indeterminate words) hold the first hour's writing. Run
  test:small before landing any new prose.

## Landing

- **`scripts/landing/land.sh <sha>`** lands a commit from a spare worktree. It rebases and re-gates if main moved,
  pushes, and watches CI. With `KYRIE_LAND_FF=/home/jweissman/work/kyrie`, it fast-forwards the owner's checkout.
- **`scripts/landing/full.sh <sha>`** first runs the whole suite on a check branch, then calls land.sh. Use it for
  anything that moves worlds (content, paintings, generation, rules); the push lane does not see that fallout.
- **A landed commit gets a new id.** land.sh rebases onto main, so never wait for a sha to appear on main. Chain
  landings in one script (land.sh takes a lock), or test whether a commit has landed by patch:
  `git cherry origin/main <sha>` shows no `+`.
- **Land an explicit sha, never HEAD.** Batch your landings: each push to main cancels the previous run and delays
  Pages.
- **Commit messages** say what changed and why, in the project's prose. They end with the attribution line your
  session gives.

## Housekeeping

- **Worktrees** live in `/var/tmp/kyrie` with dated names. Before adding one, check the path is free; reused short
  names have pointed scripts at the wrong tree.
- **Remove a worktree** once its commits are on main, by ancestry or as an equal patch (`git cherry origin/main <sha>`
  shows no `+`). Check that it is clean first.
- **Check branches** (`check-*`) are landing scratch. Delete them, local and remote, once their commit has landed.
- **Never `git stash`.**

## Players

No gate waits on a human player. A cold play is a cold-play agent on the rendered page, of a stated kind (a careful
reader, an impatient presser, a gold-follower, a wanderer who ignores the gold). Timings are measured in the browser
on CI, not per device.

## The register and the plan

- **The register** ([open-register.md](open-register.md)) is the record of every promise, defect and request. It is
  not the measure of progress.
- **A new row** needs a feature in [features.json](features.json). If it is a live P0 or P1, it also needs either
  membership of the supported slice, or an `outside` reason, in the current mission's planning.json.
  `test/small/register-*`, `planning-views` and `closure-lint` check all this.
- **Closing a row** needs its text answered clause by clause; closure-lint refuses otherwise. There is no "partly":
  split the remainder into a row of its own.
- **What is worked on** is the planning views' capped queue (`bun scripts/planning-views.ts`): 10 blockers and 3
  platform rows, each with an owner and an acceptance. An urgent trust breach displaces a queue item at once.

## Measuring

| Question | Tool |
|---|---|
| Do the three continuity invariants hold over the golden walks (and a walk that follows only the gold)? | `bun scripts/continuity-census.ts` |
| Which places have no painting, in which sky? | `bun scripts/scene-census.ts <world>` |
| Does the gold go dark on a walk that follows it? | `bun scripts/gold-continuity.ts` |
| Do the page, terminal and runner offer the same? | `scripts/client-parity.ts` (it does not yet see the terminal or the talk drawer) |
| Where things stand by state and priority | `bun scripts/register-state.ts`; `bun scripts/planning-views.ts` |
| Which imports go the wrong way between layers? | test/small/layers; test/small/cycles |
| What a world, place or act is, and why | `bin/kyrie inspect`; `inspect --why process` |

## Paintings

The one current list is [doc/design/paintings-needed.md](../design/paintings-needed.md). To import a painting the
owner drops in `assets/bg/`:

1. **Look at it**, then record in `data/paintings/seen.json` what it shows and one light. Add its weather and
   season only if it shows them.
2. **Convert it** to `assets/portraits/scene-<name>.jpeg` (Bun.Image; resize to 1600).
3. **Place it** on a kind in `data/paintings/scenery.json`. Put a seasonal painting on its season's list too.
4. **Run `bun scripts/paintings.ts`**, and keep only the new entries from its output: it re-encodes some unrelated
   copies with different bytes.
5. **Re-run the census.** Specs that pin one exact painting of a kind need widening to the kind when a painting is
   added.
