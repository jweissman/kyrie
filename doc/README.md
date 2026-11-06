# Westernesse documentation: the index

Classified on 6 November 2026 (on `fbf38d58`) by the documentation reconciliation
([reconciliation-2026-11.md](reconciliation-2026-11.md)). Nothing was deleted; one superseded specification was moved
to [archive/](archive/README.md) with a stub where it stood.

## Five ways in

| If you want to know | Read |
|---|---|
| what Westernesse is meant to be | [design/VISION.md](design/VISION.md), the owner's creative vision; then [design/ATLAS.md](design/ATLAS.md) |
| how to write something for it today | [authoring/README.md](authoring/README.md), the authoring trail (nine short pages, every command run) |
| how it is built and where a change belongs | [architecture/overview.md](architecture/overview.md), then [CONTRACT.md](CONTRACT.md) and [architecture/verification.md](architecture/verification.md) |
| what has been promised, built, left broken, or only wished | [architecture/findings/index.md](architecture/findings/index.md): every register's ids, their last status and kind; [gaps](architecture/findings/gaps.md); [briefs](architecture/findings/briefs.md) |
| what the current mission is doing | [architecture/mission-19/brief.md](architecture/mission-19/brief.md), [register.md](architecture/mission-19/register.md), [inherited.md](architecture/mission-19/inherited.md), [progress.md](architecture/mission-19/progress.md), [evidence.md](architecture/mission-19/evidence.md) |

## How to read a document's standing

- **Current authority**: describes what is true now, or what is decided; follow it.
- **Historical evidence**: what was seen, measured, decided or claimed at the time; cite it, do not follow it as an
  instruction.
- **Future aspiration**: what is wanted, not commissioned.
- **Experimental proposal**: a design put forward for review, not adopted.
- **Obsolete instruction**: still reads as an instruction, but the code or a later decision no longer agrees; a
  note at its head says so where it is current enough to keep in place.

A mission's own files are current authority only for that mission while it runs; once the next is commissioned,
they are historical evidence, and their open rows live on in the next register under the same ids.

## The documents

### The game and its design

| Document | Standing | Note |
|---|---|---|
| [design/VISION.md](design/VISION.md) | Current authority (vision); much of it future aspiration | the owner's creative vision, 31 October; what is unbuilt in it is traced as BRF-104 to BRF-109 |
| [design/ATLAS.md](design/ATLAS.md) | Current authority (direction) | Living Design Atlas, 25 October; each idea carries Direction / Hypothesis / … status of its own |
| [design/AESTHETICS.md](design/AESTHETICS.md) | Current authority, except §2 (contested) | its white ground was superseded by Mission 18's dark stage (A2); the 4 November product-design review argues again for bright literary modernism; a note at its head records it |
| [design/caught-below.md](design/caught-below.md), [caught-below-report.md](design/caught-below-report.md) | Historical evidence | one situation rebuilt, 19 October |
| [design/mission-11/](design/mission-11/charter.md), mission-13/, mission-14/ | Historical evidence | the artistic charter of 22 October, prototypes and shots |
| [archive/2026-10-20-kyr-player-experience/](archive/2026-10-20-kyr-player-experience/README.md) | Historical evidence (archived) | the October product specification; superseded |
| [paintings/registry.md](paintings/registry.md) | Current authority (generated) | the painting corpus, by `bun scripts/paintings.ts` |
| [adventures/](adventures/) | Historical evidence; each adventure's own authoring record | treatments, editorial notes, maps, playtests, critiques and **friction** reports by the authors; [repertoire-2026-11-03.md](adventures/repertoire-2026-11-03.md) is the latest survey of what the adventures tell (the 26 October one is its predecessor) |

### Writing for it

| Document | Standing | Note |
|---|---|---|
| [authoring/README.md](authoring/README.md) and [authoring/trail/](authoring/trail/01-westernesse.md) | Current authority | the single way in for authors |
| [authoring/guide.md](authoring/guide.md) | Current authority (the language manual) | its examples are played by `test/authoring-guide.test.ts`; §3's "default party" is the standalone shape only (a note says so) |
| [authoring/narrative.md](authoring/narrative.md) | Current authority | how the page's words should read |
| [../data/README.md](../data/README.md) | Current authority, except "Current composition" (obsolete) | that section names campaigns retired to `test/fixtures`; a note says so |
| [authoring/if-fitness-and-affordances.md](authoring/if-fitness-and-affordances.md) | Experimental proposal | the IF review of Kyr, 30 October; its remedies are IFR-01 to IFR-10, deferred |
| [authoring/findings-response.md](authoring/findings-response.md), [adventures-response.md](authoring/adventures-response.md) | Historical evidence | the builder's answers to the October authors |
| [architecture/mission-19/authoring.md](architecture/mission-19/authoring.md) | Current authority | three data workflows done end to end |
| [architecture/content-authoring.md](architecture/content-authoring.md), [ontology.md](architecture/ontology.md), [domain-model.md](architecture/domain-model.md), [editorial.md](architecture/editorial.md) | Current authority in substance, dated October | vocabulary and the domain; check names against `data/catalog` (organisms.json, for one, is retired) |
| [generation/statistic-contract.md](generation/statistic-contract.md) | Current authority | who owns a statistic |
| [generation/](generation/capabilities.md) capabilities, choice-grammar, deem-composition, verification, authoring-cost | Historical evidence (superseded in place, 5 November) | Deem's creature grammar, retired; creatures are catalog records |
| [handbook/](handbook/README.md) PHB, DMG, MM | Current authority (generated) | `bin/kyrie handbook`; do not edit |

### How it is built

| Document | Standing | Note |
|---|---|---|
| [CONTRACT.md](CONTRACT.md) | Current authority | what every change keeps true, with the checks that hold it |
| [architecture/overview.md](architecture/overview.md) | Current authority | the four layers, one line followed through, invariants, where a change belongs (dated 20 October; its "known weaknesses" partly answered since) |
| [architecture/verification.md](architecture/verification.md), [performance.md](architecture/performance.md), [pages.md](architecture/pages.md) | Current authority | test tiers, measures, publishing |
| [architecture/play-model.md](architecture/play-model.md), [world-semantics.md](architecture/world-semantics.md), [living-world.md](architecture/living-world.md), [generated-worlds.md](architecture/generated-worlds.md), [composition.md](architecture/composition.md), [command-contract.md](architecture/command-contract.md) | Current authority in substance, dated 20–30 October | the play model, shared facts, powers that act, generated regions, the assembler, commands; read beside the code |
| [architecture/orsino-coverage.md](architecture/orsino-coverage.md), [orsino-inventory.md](architecture/orsino-inventory.md), [capability-audit.md](architecture/capability-audit.md), [capabilities.json](architecture/capabilities.json) | Current authority (generated) | do not edit by hand |
| [architecture/orsino-semantics.md](architecture/orsino-semantics.md), [orsino-checkpoint.md](architecture/orsino-checkpoint.md), [checkpoint-c.md](architecture/checkpoint-c.md), [repository-disposition.md](architecture/repository-disposition.md), [domain-model-report.md](architecture/domain-model-report.md), [pressure-ledger.md](architecture/pressure-ledger.md) | Historical evidence | checkpoints and audits of 19–27 October |
| [architecture/player.md](architecture/player.md) | Obsolete instruction | describes Mission 6's `web/play-*`; the client is now `web/reader` and `web/engine` |
| [architecture/mission-12/](architecture/mission-12/report.md) … [mission-18/](architecture/mission-18/handoff.md), mission-7…11 reports | Historical evidence | each mission's report, ledger, diagnoses and plays; their open rows carried forward by id |
| [architecture/next-phase-independent-review/](architecture/next-phase-independent-review/report.md), mission-14/arch-review, mission-14/independent-review*, mission-15/independent-audit | Historical evidence | independent reviews; their findings are ARV-, AUD-, R25-, R26- rows in the Mission 16 register |

### What has been found, and by whom

| Document | Standing | Note |
|---|---|---|
| [architecture/findings/index.md](architecture/findings/index.md) | Current authority (generated) | the single index over the registers; adds no master list |
| [architecture/mission-19/register.md](architecture/mission-19/register.md), [inherited.md](architecture/mission-19/inherited.md) (from [inherited-src](architecture/mission-19/inherited-src/inherited.py)) | Current authority | Mission 19's own rows, and the rows it carried; change the ledger's sources and regenerate, never the table |
| [architecture/mission-18/register.md](architecture/mission-18/register.md), [wishlist.md](architecture/mission-18/wishlist.md); mission-17, mission-16 registers | Historical evidence | the record of what each fixed, with its evidence; open rows carried forward |
| [playtests/](playtests/) | Historical evidence | plays and reviews, 19 October to 4 November; the reviews of 30 October on (independent, systemic, ordinary expedition) are registered as IND-, SYS-, REV- rows |
| the owner's process audit and the independent product-design review of 4 November | Current authority (owner files, not in the repository at `fbf38d58`) | `architecture/m18-m19-process-audit.md`, `playtests/independent-product-design-2026-11-04/` in the owner's tree; the review is registered as PD-01 to PD-14 |
