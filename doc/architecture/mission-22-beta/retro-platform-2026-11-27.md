# Platform and maturity retro, 22–27 November

**Question (the owner, 27 November):** has the platform and maturity work improved reliability, unlocked new ways to
express interesting play, or only hardened the kernel and improved trust?

**Answer:** reliability and trust improved measurably. Expressivity improved as a *substrate*, not yet as play: the
language can now carry things no authored content uses yet. Today's gameplay gains came from engine presentation,
world data and instrument fixes, not from the language lifts.

## Reliability: improved, measurably

| Reading | 26 Nov | 27 Nov |
|---|---|---|
| main's push runs red (ci.yml) | 14 of 76 (18%) | 2 of 43 (5%) |
| mends and reverts on main | 27 | 10 |
| quarantined specs | — | 3 |

The causes are both process and structure:

- **Process.** Each branch ran CI's whole lane before entering the queue. The queue watched CI before
  fast-forwarding. Landing went single-file for an afternoon.
- **Structure:**
  - atomic commands (MT-24);
  - campaign isolation, with catalogs scoped per campaign (#5) and the symbol table (#8);
  - kept parses keyed by vocabulary content, not installation;
  - and, the one that tells, the screen oracle (test/screen-oracle), which proves every kept frame equals a fresh one.

  The incremental frame (#12, the perf branch) landed behind that oracle with no behavioural drift.

**Still fragile:**

- CI's shards: #14 lost shard 13's runner four times before its timings were rebalanced (#18).
- The suite grows faster than it gets cheaper: 1,563 spec files on 24 Nov, 1,826 today.
- Shard balance rests on kept timings that go stale whenever walks grow.

## Trust: improved significantly

- **One menu** (OR-1490): pages with more than one menu went from 191 of 201 to 0. Rows of the page's own invention
  went from 2,447 to 0.
- **The way on** (OR-1502): aimless moves went from a median of 14 a life to 1, inferred from the ways and never
  authored.
- **Boundaries counted and falling:**
  - layer edges 131 → 71;
  - deep imports into Kyr 1,244 → 1,241;
  - world reads outside the knowledge door counted at 624;
  - the shared rules as packages with a kernel that reads nothing of conflict (BX-02);
  - fragment specs on declared horizons (OR-407).
- **Pins:** 45 feature pins on 24 Nov, 69 today. 172 contract and pin specs were added since 24 Nov.

**Still open:**

- the slice's P0/P1 defects are flat at 26 for two days;
- knowledge integrity across walks (OR-534);
- restoration (OR-525);
- the knowledge boundary's last moves (OR-560);
- the owner's play of 27 November, which found questions offered without grounds and rows cut off.

Trust in what a row *does* is now strong. Trust in what the character *knows* is not.

## Expressivity: a substrate, not yet play

**What an author can newly say:**

- a module declares a verb, its phrase and its typed lowering (Teach first; 329 of 414 abilities round-trip, none
  differing);
- names bind to declarations;
- a rule package states what it needs.

The gamma study (gamma-expressive-capability.md) scores 20 probes on five axes. Its verdict on author feedback is
that "the execution floor is stronger … its high-level ceiling has barely moved".

**What authors keep asking for, untouched by these lifts:**

- **conditional effects:** "No `If` in an effect", from the Eel Bell to the Pitch of the Glass;
- **people and things that travel with the company without joining it:** pitchpass wrote eighteen follow rules;
- **acts with a parameter or a range:** four pipes written as four copies;
- **a story leading to a story:** no Story or Campaign form;
- **identity kept through change:** a form, a body, an item's descendants.

**No player-visible behaviour today comes from the language lifts.** The day's gameplay gains came from:

- the engine's presentation: one menu, the way on, the fight's targets in place;
- world data: the ladder, the loft, the stones in sight;
- an instrument fixed: the delver that walked past its finds.

## What this means for the next lifts

1. **Spend the lift before building more of it.** The OR-1097 slices (light a room, open and seal a way, revealing)
   are the reference dungeon's own verbs. Once one effect grammar exists (OR-1333), each slice is a declared verb
   plus its lowering plus Outcome parity, and each is something a player meets.
2. **Pick the next language work by authors' repeated asks, not by the architecture's order:**
   - conditional effects (AU-57);
   - followers;
   - parameterized acts;
   - then result references (OR-1328) and one clock (OR-1331).
3. **Make the suite cheaper as fast as it grows:** move the 164 horizon-ready specs (OR-1582), and keep shard timings
   current.
4. **Close the knowledge gap the owner found:** ground every question (the entry work), then witnessed inference in
   Kyr (the gamma champion pin).

Hold platform work to that measure: every next lift should show either a cheaper suite, a defect class retired, or
a behaviour a player meets.
