# Evidence for the independent architecture review

Snapshot: `69125e50a9108bae503556eba21b3dc219dce5c8`. Run every probe from the repository root with `bun` (Bun 1.4.4
was used), after installing dependencies. In the review environment `bun install` could not fetch the `github:`
tarballs (403 from `api.github.com`). `deem` (`967deac`) and `languages` (`30d36c6`) were cloned at their pinned
commits into `node_modules/` instead; see report L4.

| Probe | Finding | What it shows | Log |
|---|---|---|---|
| `unloadable-seeds.ts [seeds…]` | H1 | Assembles and loads seeds `s0`–`s39` and `alpha` with default options: 2 of 41 fail with `Unknown export wN`, and the failing sites have no cell | `unloadable-seeds.log` |
| `begin-seeds.ts [count]` | H1 | Starts 100 new games the way Begin does (`DrawnWorld.start`, one person, origin `wanderer`): 1 of 100 fails (`juvesese`) | `begin-seeds.log` |
| `engine-written.ts` + `probes/engine-written/` | M1 | Lint says actions waiting on the engine-written `exposedTo`, or on `defeated` (listed as engine-written but never written), have "no possible target" | `engine-written.log` |
| `det-locale.ts` | H6 | The same seeded fight under a simulated et/cs/da default collation: 20/20 seeds choose different targets from en-US | `det-locale.log` |
| `det-replay-verify.ts` | H6 | A tampered checkpoint (elapsed 501, a bogus step) resumes without error; its transcript replays to elapsed 1 | `det-replay-verify.log` |
| `det-kind-cache.ts` | H7 | Item-kind caches keyed by bare id: campaign B's `use_item` vanishes after campaign A ran in the same process, and reversed, A gains one | `det-kind-cache.log` |
| `det-parse-cache.ts` | H7 | `Kind figurine like dreg_ox` fails cold but parses warm, even after `LocalKinds.reset()` | `det-parse-cache.log` |
| `det-concurrent.ts` | H7 | Two valid campaigns, each declaring `Kind token`, fail when loaded concurrently | `det-concurrent.log` |
| `latch.py <dirs…>` | M2 | Heuristic count of content Rules that assert a fact their own guard negates: 262 of 731 | (run: `python3 -I …/latch.py data/adventures data/sites data/situations data/goings-on data/kits data/origins test/fixtures`) |

The `det-*` probes build their small campaigns in memory (`OverlayBundleSource` over `det/…` paths); nothing is
written to disk. See each file's header for usage.

## Counts used in the report (H3)

```sh
# Relation/measure/query names declared by the rule library (168), and those quoted in TS (115)
grep -rhoE "^\s*(Relation|Measure|Query) [a-zA-Z_]+" data/rules/*.kyr | awk '{print $2}' | sort -u > /tmp/names
for r in $(cat /tmp/names); do grep -rlqF "'$r'" src web --include=*.ts --include=*.tsx && echo "$r"; done | wc -l
# Feature detection by declared name (54 sites, 47 names)
grep -rnoE "(relations|measures|queries)\.some\(\w+ => \w+\.name === '[A-Za-z_]+'\)" src | wc -l
```

## Test suite at the snapshot

`bun test --parallel --path-ignore-patterns='test/deem-choice-space.test.ts'`: 857 pass, 36 skip, 0 fail, 893 tests
across 192 files, 578 s.
