# Three planning views (the owner's ruling, 20 November)

**Unlimited honesty about what's wrong; disciplined limits on what we're working on; demanding acceptance standards
for what we claim is good.**

The global live count of the register is no longer a target. Three views replace it, each for its own purpose, and
none of them defines completion for the others. `bun scripts/planning-views.ts` prints all three from the register
and `planning.json`. `test/small/planning-views` holds their structure.

| View | What it is for | Where |
|---|---|---|
| **The register** | The authoritative record of everything known to be wrong, wanted or decided. Honest discovery, splitting and documentation may grow it, and growth is not regress. | `open-register.md`, `register-archive.md` |
| **The supported-slice blocker set** | The acceptance gate: the live P0/P1 rows a player can meet in the declared supported experience. Printed as live over declared (`83 / 83` when declared on 20 November), never as "zero" alone. | `planning.json` → `slice` |
| **The active queue** | What is being worked on: at most ten blockers and three platform items, each with an owner and an acceptance condition. A planning measure, not proof of progress. | `planning.json` → `active` |

## The rulings

1. **The first-hour zero stays a real acceptance gate.**
   - At its gate, no known P0/P1 blocker affecting the declared supported experience may remain unresolved.
   - The gate shows its scope, its denominator and its evidence (the exit conditions of `first-hour-register-zero-plan.md` §3.3).
   - The slice is not narrowed after problems are found. Every live P0/P1 row is either a member, or is named as outside with a reason that says where it belongs. A member stays in the denominator once closed.
2. **Urgent defects override the limits.**
   - Three promotions per cold play is the default. But a blank selectable row, an act that lies about what it does, an irreversible softlock, lost state, or a comparable breach of basic trust is recorded and escalated at once.
   - If the queue is full, the urgent row displaces another one. That displacement is written down (`active.urgent`: the urgent row, why, and what it displaced).
   - Every finding is recorded, however many are promoted.
3. **Causes, not only symptoms.** Where several defects come from one broken projection, conversation model or authoring boundary, the queue takes the structural repair. That repair is proven against the observed failures. The queue is not ten cosmetic fixes while the experience stays bad.
4. **Hygiene honest but economical.** A row is split when its done and outstanding parts genuinely need different dispositions, not to remove the word "partly". Completed scope needs evidence, and remaining scope needs a truthful home. Neither becomes urgent because it was split.
5. **Player outcomes beside the queue.** Each report still says whether the supported first hour is coherent, enjoyable, comprehensible and trustworthy to human players. A clean queue with a dull or confusing game is not success.
6. **At mission close,** every unfinished active item is completed, transferred or re-scoped with a reason, never silently abandoned.
7. **The three narrower zeroes** (the owner, with the qualifications above) replace the global count:
   - **zero ledger-integrity failures:** no id used twice, every status leading with a known state, none closed yet saying open, and every live P0/P1 row classified in or out of the slice (`register-state`, `closure-lint`, `planning-views`);
   - **zero P0/P1 blockers in the declared supported slice at its gate:** live over declared, with its evidence (ruling 1);
   - **zero abandoned items in the active queue at mission close:** each completed, transferred or re-scoped with a reason (ruling 6).

## As declared, 20 November

- **The slice:** "The supported first hour": creation; the opening; Iscoed's two acceptance routes (the warrior down the drove road, the mage at the weir); ordinary travel; a first fight; return; save and resume; on the deployed page.
- **Members:** every live P0/P1 row on the night it was declared, except 21 rows named outside, each with its reason:
  - the planes;
  - the terminal client's own rows;
  - a second country;
  - the platform items with no first-hour symptom of their own;
  - world composition after the first hour;
  - the deferred combat redesign;
  - a career.
- **Triage is still to do.** Many members are requirements more than defects (for example RI-01, one place worth returning to). Moving any of them out of the slice needs a reason written beside it.
- **The queue,** ten blockers:
  - OR-91, every input answered at once;
  - OR-145, the page open after a long press;
  - OR-144, Set out now;
  - OR-149, the conversation;
  - CL-32, the world answering the drove's deeds;
  - CL-33, the act that matters marked;
  - OR-152, the map's menu from the engine's journeys;
  - OR-151, setting out from indoors;
  - OR-143, the options page;
  - OR-23, the prologue as the loading screen.
- **Platform,** three items:
  - MT-18, one projection;
  - MT-24, the command receipt;
  - AX-04, a new world's start.
