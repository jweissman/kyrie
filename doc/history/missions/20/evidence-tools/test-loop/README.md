# Test-loop evidence (12 November 2026)

The scripts behind `../../test-loop.md`. Run each from the repository's root (they import from `$W`, default the current
directory; the parse store opens only there). `resume-cold.ts` writes a started a1 to `$CHECKPOINT` on its first run and
resumes it on the next; `command-cost.ts` and `screen-prof.ts` read that checkpoint.

| Script | Measures |
|---|---|
| `run6.sh` | the quick set as N plain `bun test` processes (item 1) |
| `import-cost.ts <modules…>` | each module's own import cost, in order |
| `store-open.ts` | `ParseStore.open` |
| `setup-cost.ts` | imports, a fixture, `WorldAssembler.assemble`, `PlaySession.start`, a command, checkpoint, resume |
| `parse-count.ts` | parses and distinct texts per generated-world start |
| `start-a1.ts`, `start-a1-warm.ts` | one start, and a second in the same process, for `bun --cpu-prof` |
| `resume-cold.ts` | a started world kept and resumed in a fresh process (item 4) |
| `campaign-cost.ts <campaigns…>` | authored campaigns' starts, cold and warm |
| `command-cost.ts` | per step: choices, engine step, `ScreenModel.build` |
| `screen-prof.ts` | `ScreenModel.build` thirty times, for a profile |
| `told-audit.ts [seed class policy steps origin]` | the narration's lines and phrases said at many places (E220) |

Profiles are summarized in test-loop.md; the raw `.cpuprofile` files (8 MB each) were not kept in the repository.
