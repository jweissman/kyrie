# Where Westernesse stands

The one page that says where things stand now. It is rewritten when a mission begins or closes, and in between when
something material changes. Nothing else at the top of the documentation dates itself or names a mission: the
README and the index say what is lasting, and point here for what is current.

**As of 17 November 2026: Mission 22 is extended for acceptance.** Its brief is
[mission-22/brief.md](architecture/mission-22/brief.md) and its account so far is
[report.md](architecture/mission-22/report.md). The owner's delivery plan,
[planning-report.md](architecture/mission-22/planning-report.md), gives what remains a sprint shape: prove one first
hour with a cold player before broadening the game again. The sprint under way is
[current-sprint.md](architecture/mission-22/current-sprint.md); the golden route is the drove road in `?world=iscoed`.

## What you can do in it

A life begins as one person in a town of a generated country. From there you can:
- choose an ancestry, a calling, the sign you were born under and a kind of life before, and be given where the life
  begins (no reason for coming is asked);
- take the first town's jobs and talk to the people who give them;
- travel on the hex map into wild country, ruins and deep sites;
- recruit companions, trade, fight, and read the Encyclopedia of Imbar.

Twenty-one authored adventures lie as provinces of every first country. The terminal plays the same worlds:
`bin/kyrie adventure` runs the engine's own creation flow, with the page's colours and signs drawn from one shared
table.

## What is not yet true

- **No independent player, and not the owner, has accepted a build (FH-01).** Three reviews in Mission 22 did not
  perceive the opening improved; the first agent cold play scored 6/10 (CL-01). M22's first phase is done only when
  several cold plays in a row are positive (OB-17).
- **The game is still a collection of pages, not one scene.** The register's continuity rows (CN, §26) are open.
- **Planes differ only in combat.** Their laws and Plane Shift are commissioned (GT, §28).
- **A push runs the push lane; the night runs the whole suite** (the owner, 15 November). The push lane is 720 files and about 74 CI-minutes over 16 shards; the 267 slow files (about 680 CI-minutes) run nightly and on demand, and the night is kept green.
- **SRD fidelity is low.** Of placed encounters, 0 of 88 are faithful; of spells, 9 of 119, with conversion under
  way. The census is in [rules/srd-fidelity.md](architecture/mission-21/rules/srd-fidelity.md).

Every open promise is a row in [the register](architecture/open-register.md), and the register is the only ledger.
`bun scripts/register-state.ts` counts its rows by state and priority, and its hygiene; `bun scripts/register-tickets.ts`
reads the same rows by feature and readiness.

## Where to try it

The page is built from `main` once its whole suite has passed: https://jweissman.github.io/kyrie/. What to look for,
and what not to spend time finding, is in
[the acceptance guide](architecture/mission-21/acceptance-guide.md) (Mission 21's; the golden route is in
current-sprint.md).
