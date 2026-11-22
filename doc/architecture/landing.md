# Landing work on main, and reading where a mission stands

Kept from Mission 22 (19 November), so the next mission starts with them. The rules they keep are the owner's:
main is one app; small verified increments land often; a commit lands only through the gate CI runs; heavy runs (the
full suite, the browser specs, the long descents) are CI's, by `gh workflow run ci.yml --ref main`.

## Landing

- `scripts/landing/land.sh [commit]` lands a commit from a spare worktree (`KYRIE_LAND_TREE`, default
  `/var/tmp/kyrie/wt-land`), one landing at a time (a lock). It waits for main's push lane to be idle, rebases and
  gates with `check:fast` if main moved, runs the type-aware `bun run lint` (CI's; `check:fast`'s lint is not type-aware,
  and a template literal of `number | Amount` turned main red on 19 November), pushes, and watches its own CI run.
  `KYRIE_LAND_FF=<checkout>` fast-forwards a checkout (the owner's) after.
- `scripts/landing/fold.sh <since> <branch>` folds an agent's branch onto the lead's, commit by commit. It carries the
  mechanical conflicts: the web bundle and the handbook made again; a kept trace or the laboratory taken from the branch
  (then `bun scripts/redigest-trace.ts <name>` and `bun scripts/laboratory.ts`); the register's and features' rows
  unioned by id. Anything else stops it.
- `scripts/landing/resolve-rows.py <file>` unions conflicted register rows by id; `scripts/landing/set-status.py
  <register> <edits.json>` sets rows' status cells by id (`{"ID": {"status": "fixed (…)"}}`; never a `|` in a cell).

Before a landing, locally: `bun run check:fast` alone, `bun run lint`, then `bun test <explicit paths>` for what
changed (never an empty path: it runs the whole suite). A change that moves worlds (content, paintings, generation,
rules) lands by `scripts/landing/full.sh <sha>`: the whole suite on a check branch first, then land.sh.

## Reading where things stand

- `bun scripts/m22-status.ts`: the register (live rows, by weight and family), the sprint board, the maturity track and
  the SRD migration (spells and creatures, from `srd-fidelity.md` and `srd-manifest.md`: run `bun
  scripts/srd-fidelity.ts` and `bun scripts/srd-manifest.ts` first for a current reading).
- `bun scripts/register-state.ts`: the register's counts and hygiene.
- `bun scripts/first-quarter.ts [--origins …] [--timeline] [--lead N]`: the first quarter hour played by the gold, act by
  act (fights, places, aims taken and ended), per origin; `doc/architecture/mission-22/content-thread.md`.
