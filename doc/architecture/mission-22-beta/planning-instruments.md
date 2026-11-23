# Three planning instruments over one record (23 November)

A timeboxed answer to the owner's commission of 23 November: a defect register, a feature atlas and an architecture
and maturity roadmap, kept apart by purpose without losing the register's history, its stable IDs or its local
workflow. The owner's own sketch (doc/architecture/mission-22/planning-instruments-reform-2026-11-23.md, with
scripts/planning-instruments-demo.ts, left uncommitted in the owner's checkout as it fails lint) was the starting point. This note evaluates it and recommends a smaller
version, which is built: `bun scripts/planning-instruments.ts [defects|atlas|roadmap|trend|next]`.

## The recommendation

**No new source of truth.** The three instruments are generated views over the register, the archive and two
sidecars that already exist:

- `doc/architecture/register-kinds.json` says what each row is: defect, requirement or direction. It is audited by
  test/small/register-kinds, records what a row was and why it moved, and never moves a priority.
- `doc/architecture/features.json` places each row in a feature.

A row's instrument follows from those two facts, by a three-line rule:

| Kind | Feature | Instrument |
|---|---|---|
| defect | any | **defect register** |
| requirement | the platform (architecture, startup, testing, persistence, docs) | **roadmap** |
| requirement, direction | anything else | **atlas** |

Platform defects appear in the defect register, and the roadmap view lists them too, beside the platform's
requirements and capabilities.json's maturity state. The roadmap's question is what the game stands on, and a
platform defect is part of that answer.

**Why not the sketch's classifier.** It classifies by wording (keywords such as "invariant", "future", "m23") and adds
a second sidecar (planning-index.json, plus an overrides file). On today's register it flags 100 of 108 P0/P1 rows
for manual review, mostly because a plain defect carries no keyword at all. It also puts some rows in the wrong place:
SP-04, an unexplained five-minute stall, lands in the roadmap, and FH-01, an unmet acceptance gate, lands in the
atlas. A classification that depends on wording changes whenever a row is reworded. Classifying by kind is stable,
and register-kinds.json already holds that manual review, with a reason for each row.

**What one new field would add, later.** Each defect could carry an architectural cause: rules, projection,
interaction surface, content or platform. Today the cause is inferred from the feature, which is a weak proxy. The
cause should be recorded in register-kinds.json beside the kind, as a manual field, filled first for the P0/P1 rows.
It belongs in the same file, not a new one.

## What the views show today

**Concentration** (`defects`): 438 live defects, P0 0, P1 79, 66 of them in the supported slice.
- By feature, the slice's P0/P1 defects sit in page-ui (12), fight (6), startup (6), undertakings (5) and travel (5).
- Authoring has 48 defects, none P0/P1. It is a large backlog, but it blocks no one.

**Improvement** (`trend`): the record on each day's last revision, counted under today's kinds and slice membership,
so the denominator is fixed.

| Day | Live defects | Of them P0/P1 | Slice P0/P1 |
|---|---|---|---|
| 13 Nov | 339 | 87 | 12 |
| 17 Nov | 425 | 96 | 24 |
| 20 Nov | 430 | 75 | 62 |
| 23 Nov | 438 | 79 | 66 |

- The record grows, as discovery improves, and that is expected.
- The number to drive down is the last column. It has risen because rows were filed or split into the slice; nothing
  has been silently dropped. It will fall only when slice defects are closed.

**The next queue** (`next`): the slice's P0/P1 defects that are not yet queued, P0 first and then the densest feature
first. Today there are 55. The first ten are mostly page-ui (PB-29, OR-140, OR-182, OR-177, OR-178, CL-01, CL-67,
FM-01, FM-03), so the next queue could be one page-ui sweep. The view proposes; the queue in planning.json is still
chosen by hand, capped at ten plus three.

**The atlas** (`atlas`): 51 open ambitions under their features. It is thin, because most long-range ambitions live
in doc/design (the seven programs, the directions documents), not in the register. Making the atlas the
comprehensive feature list means giving those documents' items IDs and features, which is a separate and larger
decision (see effort).

## The floor: rows to review by hand

Several P1 rows recorded as defects read as requirements or evaluations: something to do or judge, not a failure
seen. Examples are CL-01 (a cold-play report), TO-03 and TO-06 (designed passages to evaluate), AP-18 (a corpus to
replay), and RI-01 to RI-05 (a commissioned investigation). Several platform rows recorded as defects are refactors:
AR-01 to AR-08 and MT-16. Moving these to requirement in register-kinds.json would leave the defect count honest.
Each move is one entry with a why, and the row keeps its ID and its priority. That review is the one manual step
worth doing now, about two hours for the P1 rows.

## GitHub Issues

Keep the record local. Mirror only what needs outside eyes: an urgent defect that displaces queue work, or an item
for someone outside the repo. Never mirror the atlas or the roadmap in bulk. The register's scripts, specs and
history are the reason it works; a mass migration would cost a week and lose them.

## Effort

| Step | Effort | |
|---|---|---|
| The five views (built, this note) | done | scripts/planning-instruments.ts |
| Review the P1 kinds above in register-kinds.json | ~2 h | recommended now |
| A cause field in register-kinds.json, for P0/P1 defects | ~half a day | when concentration by cause is wanted |
| Bring doc/design's ambitions into the atlas with IDs | 2–3 days | gamma, not beta |

Stop rule: no rewriting of register rows, no renumbering, no new synchronized files.
