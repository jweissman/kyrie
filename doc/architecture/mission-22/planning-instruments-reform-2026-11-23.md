# M22-beta discovery: bounded reform of planning instruments

Date: 2026-11-23  
Scope: discovery and small prototype only (no register rewrite, no mission expansion)

## 1) Recommendation in one page

Keep the current three-view discipline unchanged:
- full historical record: open register plus archive
- supported-slice acceptance gate: declared in planning.json
- capped active queue: planning.json limits and ownership

Add three authoritative planning instruments on top of the existing record:
- Defect register: only confirmed failures and trust breaches
- Master feature atlas: hierarchical ambitions and long-range capability surface
- Architecture and maturity roadmap: enabling capabilities, invariants, dependencies, proving experiments

Do this as generated views from a structured local source, not duplicated hand-maintained ledgers.

## 2) Why this is worth doing now

Current register rows mix:
- observed defects
- acceptance obligations and requirements
- architecture enablers
- future design directions

This is honest but operationally noisy. It hides concentration, muddies burn-down, and creates queue pressure from non-defect items.

Bounded reform separates purpose while preserving:
- historical continuity
- stable IDs
- source references
- repository-local workflows and scripts

## 3) Proposed source-of-truth model

Continue to keep row truth in the register and archive markdown, then add a lightweight structured layer per row ID.

Suggested canonical file:
- doc/architecture/planning-index.json

Suggested schema shape:

- id: existing stable row ID (string, required)
- canonicalSource: open-register or register-archive (required)
- instrument: defect_register | feature_atlas | architecture_roadmap (required)
- kind: defect | requirement | direction (required, compatible with register-kinds)
- severity: P0 | P1 | P2 | P3 (required)
- scope:
  - supportedSlice: boolean
  - firstFifteenMinutes: boolean
  - component: feature id from features.json
- defectFields (required when instrument=defect_register):
  - confirmed: boolean
  - reproductionEvidence: list of evidence refs (spec path, replay, cold run, deployed run)
  - impactClass: trust | correctness | playability | perf | polish
  - architectureCause: interaction_surface | rules_system | content_projection | architecture_enabler | other
  - status: open | deferred | closed | duplicate | reference
- atlasFields (required when instrument=feature_atlas):
  - parent: optional feature parent id
  - layer: pillar | domain | subfeature | capability
  - horizon: now | m22 | m23 | later
  - activationRule: always visible | commissioned requirement only
- roadmapFields (required when instrument=architecture_roadmap):
  - invariant: short invariant statement
  - dependencies: list of row IDs
  - provingExperiment: required experiment id/path
  - maturityStage: baseline | guardrail | enforced | optimized

Important: this does not replace the register text. It classifies and augments it.

## 4) Classification policy

Default policy:
- observed, reproducible failure remains defect_register
- committed acceptance/gate obligation without software fault can be requirement in atlas or roadmap
- long-range direction remains feature_atlas unless explicitly commissioned
- enabling invariants and platform obligations land in architecture_roadmap

Manual review policy:
- mandatory for all P0/P1 rows
- mandatory for ambiguous rows (classifier confidence low)
- overrides recorded with reviewer and date, never hidden

## 5) Prototype delivered in this discovery

New prototype script:
- scripts/planning-instruments-demo.ts

Manual-review overrides file:
- doc/architecture/mission-22/planning-instruments-overrides.json

What the prototype does:
- reads live rows from existing register parser
- reuses register-kinds classifications
- classifies rows into defect_register, feature_atlas, architecture_roadmap
- reports ambiguity and confidence
- outputs provisional defect concentration by architecture cause class
- prints sample rows per instrument

Run:
- bun scripts/planning-instruments-demo.ts
- bun scripts/planning-instruments-demo.ts --json
- bun scripts/planning-instruments-demo.ts --exclude-deferred --samples=15

## 6) Snapshot from this run (discovery evidence)

Automated snapshot (live rows):
- total live: about 490
- heuristic classification:
  - defect_register: about 377
  - feature_atlas: about 70
  - architecture_roadmap: about 43

Detected P0/P1 ambiguity cluster includes architecture families (for example AR/AX rows), now explicitly reviewable via override file.

Interpretation:
- quality queue should be defect-led
- ambitions stay visible in atlas without pretending to be sprint blockers
- architecture enablers are explicit dependencies rather than hidden in defect burn-down

## 7) Migration method (bounded and reversible)

Phase A (1-2 days): discovery hardening
- keep current files untouched
- run classifier, review P0/P1 and low-confidence rows
- commit override decisions only

Phase B (2-3 days): structured index bootstrap
- generate planning-index.json from existing rows
- include instrument, scope, and cause fields
- add validation test: every live row classified, no ID drift

Phase C (2-3 days): generated views
- generate three reports:
  - defect register view (with concentration and aging)
  - feature atlas tree view
  - architecture roadmap dependency/proof view
- keep current planning-views output unchanged

Phase D (1-2 days): queue integration
- active queue selector defaults to defect_register in supported slice first
- allow architecture_roadmap items only in platform slots

Stop rule:
- no manual rewrite of historical register rows during beta
- no broad renumbering or issue migration
- no planning-only mission expansion

## 8) GitHub Issues strategy

Recommendation: keep local structured truth in repo, integrate selectively to GitHub.

Why not migrate everything to GitHub now:
- would create large issue churn and admin load
- loses local script-native invariants and generated views
- pushes history normalization work into beta critical path

Selective integration policy:
- mirror only queue-active items and external coordination items
- maintain one-way export from local canonical IDs to issue links
- do not mass-create issues for atlas or roadmap backlog

Suggested mapping:
- defect_register: export only active queue items and a small set of supported-slice P0/P1 blockers
- feature_atlas: no bulk issue export
- architecture_roadmap: export only commissioned platform epics

## 9) How this improves quality control immediately

Defect concentration visibility:
- per feature and per architecture-cause class from the same canonical rows
- shows where failures cluster (for example interaction surface vs rules vs architecture enabler)

Real quality improvement tracking:
- denominator preserved for supported-slice P0/P1 gate
- closures measured against defect-only set, not mixed ambitions
- independent human acceptance remains explicit gate, not inferred

Queue choice with less bookkeeping:
- choose next queue from:
  1) supported-slice defect_register P0/P1
  2) then high-density defect clusters
  3) then minimum required architecture enablers (platform slots)
- atlas and long-range rows remain visible without forcing sprint commitment

## 10) Estimated effort and risk

Estimated engineering effort:
- small bounded adoption: 1 to 2 weeks part-time alongside beta work
- immediate utility (prototype + review): same day

Risk level:
- low technical risk if kept additive and generated
- medium process risk if teams treat atlas/roadmap rows as queue obligations

Risk controls:
- enforce queue cap
- enforce stop rule
- enforce manual P0/P1 review before instrument assignment changes

## 11) Acceptance criteria for this reform itself

Done when:
- no row IDs changed
- no obligations silently closed or dropped
- three generated views exist and agree with current register counts
- supported-slice gate is still computed from the same rows
- active queue remains capped and owner/acceptance-complete
- P0 supported game defects = 0 and supported first-fifteen P1 trust/play blockers = 0 remains the explicit quality objective
