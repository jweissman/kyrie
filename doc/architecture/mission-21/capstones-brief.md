# Capstones: a top-down map of what the platform has (the owner, 15 November, late)

Performance and behavioural capstones beside the experiential pins, organised by the features a mature text RPG
platform is expected to have, so that there is a clear map of what is and is not present, built test-first as a small
exploratory experiment to measure how far the game is from that goal. Each scenario should run quickly; together they
say where the platform stands.

The owner's structure (six sections, with priorities) is the manifest in `test/capstones/features.ts`:
1 Core loop and narrative; 2 Combat and challenges; 3 Character and inventory; 4 World systems; 5 UX and accessibility;
6 Technical and content pipeline. Text-only guardrails: every mechanic understandable through text; colour or
formatting never the only information; parser errors suggest valid actions; always a fallback choice path for players
who dislike free text; concise descriptions; critical state visible (health, inventory, objectives, time, reputation).

## How it is built

- `test/capstones/features.ts`: every feature of the table, with a **claim**: `present`, `partial`, `absent`, with the
  proof specs that already stand behind it and, where it is partial or absent, the gap in a sentence.
- `test/capstones/probes.ts`: a live probe for each feature that can be probed cheaply (a tiny Kyr world, a gauntlet
  fight, a creation flow, a save round trip, a static fact of the data or the page). A probe says what it observed; the
  claim must equal it, so a "present" claim is executable and an "absent" one fails when the feature arrives (and the
  claim is then promoted).
- `test/small/capstones.test.ts`: the table is complete, every proof spec exists, each probe agrees with its claim and
  runs within budget. `bun scripts/capstones.ts` prints the map and writes `doc/architecture/mission-21/capstones.md`.

Not a quota and not a verdict on quality: a feature that is present may be present badly (the experiential pins and the
register say so); this map says only whether the thing is there, how it is proved, and what is missing.
