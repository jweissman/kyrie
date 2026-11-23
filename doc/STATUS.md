# Where Westernesse stands

The one page that says where things stand now. It is rewritten when a mission begins or closes, and in between when
something material changes. Nothing else at the top of the documentation dates itself or names a mission: the
README and the index say what is lasting, and point here for what is current.

**As of 21 November 2026: Mission 22 is closed as an alpha (a proving phase), not accepted as a first-hour
product.** Its close is [mission-22/closeout.md](architecture/mission-22/closeout.md): the six commission outcomes,
the gate as it stands, the ruling on responsiveness, and beta's entry conditions. Why it ended there, and what beta
should change, is [mission-22/alpha-retrospective.md](architecture/mission-22/alpha-retrospective.md); what the
owner's play found is [mission-22/alpha-acceptance.md](architecture/mission-22/alpha-acceptance.md). The builder of
beta starts from [mission-22/handoff-beta.md](architecture/mission-22/handoff-beta.md). Beta's preparation (the
contract matrix, the synthesis of the November studies, and a sprint plan) is
[mission-22-beta/preparation-report.md](architecture/mission-22-beta/preparation-report.md). M22-beta is to
be architecture and housecleaning: the first minute, one authoritative action model, Atlas continuity, focus,
performance and save integrity, under four contracts (authority, integrity, separation, trust), with no major new
content systems. The golden route is the drove road in `?world=iscoed`.

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

- **No independent player, and not the owner, has accepted a build (FH-01).** The owner's playtests of 20–21 November
  found focus, opportunity and undertaking continuity failing in ordinary first-hour play (alpha-acceptance.md:
  OR-177, OR-178, OR-179). Beta's success is several consecutive cold plays of the supported slice by agents of different kinds, on
  the rendered page; no gate waits on a human player.
- **The game is still a collection of pages, not one scene.** The register's continuity rows (CN, §26) are open.
- **Planes differ only in combat.** Their laws and Plane Shift are commissioned (GT, §28).
- **A push runs the push lane; the night runs the whole suite** (the owner, 15 November). The push lane is 720 files and about 74 CI-minutes over 16 shards; the 267 slow files (about 680 CI-minutes) run nightly and on demand, and the night is kept green.
- **SRD fidelity is low.** Of placed encounters in a1, 2 of 88 are faithful; of spells with an SRD counterpart, 37 of
  119 pass in resolution; of creatures, 7 of 79. The census is in [rules/srd-fidelity.md](architecture/mission-21/rules/srd-fidelity.md).

Every open promise is a row in [the register](architecture/open-register.md), and the register is the only ledger:
1,123 rows, 488 live, 104 of them P0 or P1 (none P0). What is worked on is the planning views' capped queue
(`bun scripts/planning-views.ts`), not the count.
`bun scripts/register-state.ts` counts its rows by state and priority, and its hygiene; `bun scripts/register-tickets.ts`
reads the same rows by feature and readiness.

## Where to try it

The page is built from `main` once its whole suite has passed: https://jweissman.github.io/kyrie/. What to look for,
and what not to spend time finding, is in
[the acceptance guide](architecture/mission-21/acceptance-guide.md) (Mission 21's; the golden route is in
current-sprint.md).
