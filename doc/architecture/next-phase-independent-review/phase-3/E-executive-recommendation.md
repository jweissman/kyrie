# E. Executive recommendation

Phase III of the independent review: validation and implementation readiness. Snapshot `483e3af`. The critique of my
own earlier phases is in `../report.md` §13.

## What Phase III found

**I revised my own earlier recommendations toward less machinery.** Three new probes on the pinned snapshot showed that
existing mechanisms already do much of what Phase II proposed to build:

| capability Phase II proposed | what the probe found |
|---|---|
| a strategic layer | Two independently written institutions interacted through the shared rules plus a five-line shared vocabulary file: an academy noticed a tower that keeps a forbidden codex, spent money on an inquiry over time, and a companion could be asked about it. Neither module names the other, and it survives save, restore and replay. |
| a companion "Remark" mechanism | A companion reacted, in his author's words, to another author's forbidden research. His author wrote only "when the company knows something forbidden". |
| city sockets and lots | One author's tower added a stair onto another author's exported place without editing it. |

**What is genuinely missing:**
- **Small correctness repairs:**
  - installation validating the whole world (Phase I's critical crossing crash);
  - the checkpoint race;
  - the march-stone naming the wrong country;
  - `{?x}` in authored text printing literally ("?f"), which stops a companion naming what he reacts to.
- **Information discipline:** institutions' rules read the whole world instantly.
- **Knowledge per member.**
- **A journey-level test tier.**

## 1. What foundations to establish next

1. The correctness repairs above, and save and transcript stamps of the content and dependency hashes.
2. A journey test tier: play from Begin through offered choices only, with a policy that sees only what the player sees.
3. A **small placement contract** (K1): an entry, a join, hooks, a compatibility note, and an Arrival.
   - This is `countries.json` plus the existing scenario hooks.
   - It is *not* the Phase II manifest.
4. Three owner decisions before more content is written:
   - shared versus local **kinds** (DR3);
   - the **compatibility** policy (DR5);
   - a **curator** for the shared vocabulary (DR9).

## 2. What to deliberately avoid building yet

- A general world compositor, beyond placements and named routes.
- City sockets and lots.
- `preserve`, `mayVary`, `worldMay`.
- A strategic simulation layer.
- Tags and Remarks as new mechanisms.
- Transport capacity and markets.
- Horizon time advancement.
- Procedural languages.
- A procedural street grid.
- Generated dialogue for named characters.

Each has a named trigger that would justify it (documents A and B).

## 3. The most informative vertical slices

1. **One game, two authored adventures** (Slice 1).
   - The Long Man and Thrume, discovered from an ordinary generated start, by offered choices only.
   - It must pass a **literary diff**: Thrume's authored text, step by step, is identical to standalone play.
   - It must also pass fresh-process replay and save and restore.
   - Run its eager-installation variant as a measurement.
2. **A writer who is not us** (Slice 4). A real, unfamiliar writer authors a small adventure connected to the city; a second stranger must find it by ordinary play. Measure friction, not compilation.
3. **Ferrand and the tower** (Slice 5). A companion's authored stance applies, specifically and consequentially, to an independent author's content he witnessed. An institution learns of it only through a carrier.

The small city (Slice 2) and assisted travel (Slice 3) follow once Slice 1 passes.

## 4. What evidence would show a coherent, compelling game rather than a sophisticated engine

- **A stranger finds an adventure.** Someone who has never seen Kyrie begins an ordinary game, hears of an adventure in the city, gets there without help, and can say afterwards how they knew where to go.
- **The work stays its author's.** An author reads their adventure as played inside the shared world and says it is still theirs. The literary diff agrees.
- **A companion's remark is specific, apt, and consequential.** It is about something their author never saw, an editor judges it apt, and it changes what happens next.
- **The world changes off-stage, believably.** Something changes off-stage (an institution's undertaking), and the player learns of it from a person, not from a log.
- **Readers' accounts, not test results.** Two editorial readers' accounts of the slice transcripts describe distinct voices, intelligible consequences, and moments of surprise.

Green tests are necessary for every one of these and sufficient for none.

## 5. What the project owner should decide before commissioning the next phase

1. **Anthology or world?** Is a curated set of placed adventures around one hand-authored city the target for the next year? I recommend yes. Or must the system scale to many uncoordinated authors now?
2. **Compatibility** (DR5). Are incompatible adventures, such as The House That Grows (year 3640, a named protagonist), separate games by default, or must authors write placed variants? I recommend separate games unless the author wants a variant.
3. **Shared kinds** (DR3), and **who curates the shared vocabulary** (DR9).
4. **Real writers.** Will Slice 4 have a real independent writer? Without one, the most important authoring evidence cannot be gathered.
5. **Placed variants.** Is the adventure's own author available to write Thrume's placed variant and Arrival? Slice 1's literary criterion depends on it.

**What remains uncertain, and should be settled by the slices rather than by more analysis:**
- whether path-dependent worlds matter to players;
- whether eager or lazy installation is the safer default;
- whether a ward-and-landmark city reads as a city;
- whether per-member knowledge is worth its authoring cost;
- whether the generated prose between authored adventures is strong enough for the shared world to feel like a world. That may matter more than any architecture proposed here.
