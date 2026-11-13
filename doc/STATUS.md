# Where Westernesse stands

The one page that says where things stand now. It is rewritten when a mission begins or closes, and in between when
something material changes. Nothing else at the top of the documentation dates itself or names a mission: the
README and the index say what is lasting, and point here for what is current.

**As of 14 November 2026: Mission 21 is under way.** Its brief is
[mission-21/brief.md](architecture/mission-21/brief.md), its completion plan is
[completion-plan.md](architecture/mission-21/completion-plan.md), and an honest account against both is
[state.md](architecture/mission-21/state.md).

## What you can do in it

A life begins as one person in a town of a generated country. From there you can:
- choose a reason for coming, an ancestry, a calling and a kind of life before;
- take the first town's jobs and talk to the people who give them;
- travel on the hex map into wild country, ruins and deep sites;
- recruit companions, trade, fight, and read the Encyclopedia of Imbar.

Twenty-one authored adventures lie as provinces of every first country. The terminal plays the same worlds:
`bin/kyrie adventure` runs the engine's own creation flow, with the page's colours and signs drawn from one shared
table.

## What is not yet true

- **No independent player, and not the owner, has accepted a build.** The owner's play of 14 November still broke
  down quickly.
- **The game is still a collection of pages, not one scene.** The register's continuity rows (CN, §26) are open.
- **Planes differ only in combat.** Their laws and Plane Shift are commissioned (GT, §28).
- **The whole suite runs on every push, but it is not yet fast.** It takes about 19 minutes in 16 shards. The target
  is under 10.
- **SRD fidelity is low.** Of placed encounters, 0 of 88 are faithful; of spells, 9 of 119, with conversion under
  way. The census is in [rules/srd-fidelity.md](architecture/mission-21/rules/srd-fidelity.md).

Every open promise is a row in [the register](architecture/open-register.md), and the register is the only ledger.
`bun scripts/register-state.ts` counts its rows by state and priority.

## Where to try it

The page is built from `main` once its whole suite has passed: https://jweissman.github.io/kyrie/. What to look for,
and what not to spend time finding, is in
[the acceptance guide](architecture/mission-21/acceptance-guide.md).
