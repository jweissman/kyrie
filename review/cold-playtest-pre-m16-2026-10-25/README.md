# Cold playtest before Mission 16 — 2026-10-25

An independent cold playtest of Kyr: what an unfamiliar player can actually experience through the ordinary browser entry point.

## Identity and environment

- **Commit played:** `2684952bb587b73e1240fa6714a547aad14b2978`, from branch `claude/inspiring-pascal-18tohw`. Note that `origin/main` (`422a4c8`) has diverged from this branch; it is not an ancestor.
- **Seed:** `zadiweno` (generated country *Silverfells*). It was chosen by *Begin*, not by me.
- **Runtime:** Linux cloud container, Bun 1.4.4, `bun run scripts/build-web.ts --serve` serving `http://localhost:8080/`, headless Chromium (Playwright) at 1280×900, plus one check at 390×844.
- **Dependency limitation:** `bun install` couldn't fetch the private `deem` / `languages` tarballs (HTTP 403). I cloned them anonymously at the pinned commits and linked them with `file:` in a scratch copy. The repository working tree wasn't modified.
- **Branch limitation:** none. The requested branch name was accepted.
- **Independence:** the cold record (A and the contemporaneous log) was committed and pushed as `2d8bb61` **before** I read any doc, source, atlas or earlier report. Everything after that commit is marked post-seal.

## Deliverables

| | Document |
|---|---|
| **A** | [Cold-play narrative](A-cold-play-narrative.md). Sealed in `2d8bb61`. |
| **B** | Evidence archive: this README plus `evidence/` (below). |
| **C** | [Prioritized findings](C-prioritized-findings.md): 11 ranked findings, unverified suspicions, and what is already good. |
| **D** | [Design-atlas comparison](D-design-atlas-comparison.md). |
| **E** | [Mission 16 implications](E-mission-16-implications.md): block / incorporate / defer / investigate. |
| **F** | [Five decisive changes](F-five-decisive-changes.md). |

## Evidence archive (B)

- `evidence/contemporaneous-play-record.md`: the running log I kept during play. For each step it records what I intended, what I clicked, what I expected and what happened, with quoted text. It includes my own driver mistakes, marked as mine.
- `evidence/screens/*.jpg`: 52 screenshots from cold play, downscaled. The numbers match the steps in the log. `300-options-post-seal.jpg` is the only post-seal capture.
- `evidence/saves/*.json.gz`: four save files downloaded through the in-game *Download a save file* link. Each is about 4.7 MB uncompressed, which may itself be worth a look.
  - `01-at-tarn`: journey 1, before Argentumport.
  - `02-dressing-hall`: journey 1, before the iron door.
  - `03-run2-profundusmons`: journey 2, outside the mine.
  - `04-run2-spring`: journey 2, inside the mine, day 10. This one was used for the reload, the debt payment and the post-seal brothers check.

  Unzip a save and load it with *Open a save file* on the title page.
- `evidence/harness/`: the small Playwright driver I used. It clicks visible buttons by label or index and screenshots each step. It doesn't inject state.

## Key screens

| Screen | What it shows |
|---|---|
| `005-go` | The first scene. |
| `010-kildrak` | First conversation. |
| `025-market` | The market-place. |
| `061-company` | The character sheet, which only appears once a companion has joined. |
| `118-tally` | "WE HAVE SHUT IT IN." |
| `122-inscr` | Inscription that reads like a data record. |
| `129-attack` | The protagonist knocked out before acting. |
| `133-r5` and `264-flee2` | The epitaphs. |
| `187-tomorrow` | The inverted riddle. |
| `192` | 16 → 1 HP in a single round. |
| `213-bed` | The brothers set out. |
| `249-spring` | The unexplained goblins label. |
| `272-paid` | The debt paid with floor loot. |
| `287-promise` | "noon in a jar". |
| `289-map2` | Duplicate names on the map. |

## Post-seal technical notes (narrow, observed failures only)

- `src/narrative/obituary.ts:38`: the party-size phrasing is hard-coded to "one against one" whenever there is a single foe. Only the last of the fallen is named.
- `web/reader/title-page.tsx`: the authored campaigns are listed only under `?dev`.
- `web/scenarios.ts`: *The Long Man* is marked `recommended`.
- `data/generation/deep/powers.json`: the rival band moves down one level every two days and leaves a trace on each. A replay found the brothers' mark by day 14.
- `src/rules/checks.ts:62`: checks are deterministic per seed, skill, actor and topic. The repeated d20 7 is most likely coincidence.

I made no repairs.
