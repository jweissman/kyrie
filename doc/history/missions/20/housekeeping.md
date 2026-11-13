# Housekeeping at Mission 20's close (12 November)

## Remote branches ready to delete: every commit already in main

**Not deleted.** This session's permission check refuses deleting remote branches, so they wait on the owner. Each was
contained in `origin/main` (`git branch -r --merged origin/main`) at 12 November. To delete them all:

    git push origin --delete $(git branch -r --merged origin/main | grep -v 'origin/main$\|HEAD' | sed 's#^ *origin/##')

To restore one afterwards: `git push origin <sha>:refs/heads/<name>`.

| Branch | Last commit |
|---|---|
| `adventure/anthology` | `9a607863ef0c507f66f1cd6190230a953180c386` |
| `adventure/behind-the-wainscot` | `23f446c69cbbefad3c53ee149865721bbe90fc65` |
| `adventure/book-of-faces` | `6ceb3d1ef3c3ffc46676358de81f22fb915fcef2` |
| `adventure/fair-weather` | `47896259b6941b22323c92c1a13f292a04c7cd14` |
| `adventure/grand-tour` | `5f12e4f67efed098e0a3f102e3b0a0c7209353fc` |
| `adventure/half-the-hive` | `4a6d370544a7c8fc19b9fdea1b62cbe4224577bb` |
| `adventure/imbar-deep-time` | `84b0eabb27f3f20ed66901405786ffe961428154` |
| `adventure/quiet-in-the-sky` | `24aae8ead6da5dc64f4bccfc8b900f73dcc8ccf0` |
| `adventure/quittance` | `525d883d12a49e2f4416df8b680d3fb7946a47fa` |
| `adventure/quittance-grand-tour` | `9e03eb3c54d6eaa4700207af9da506812396c930` |
| `adventure/the-lull` | `478ea61999c26729a49558a1458c3f31997d22c4` |
| `adventure/winter-in-carth` | `042a14509f48bf40a0b446a2591674aaa728877b` |
| `art/bestiary` | `fda18fa41d5aef372ca7e486334886e85dccf369` |
| `art/menagerie` | `87d77c22e6e5a6571ba6491b083fe97ee005b717` |
| `claude/blissful-cray-3tt8ai` | `9e03eb3c54d6eaa4700207af9da506812396c930` |
| `claude/eager-volta-59xzw3` | `fa6377592a059215bb3fa085bab31532d53642af` |
| `claude/eloquent-bohr-8pyot3` | `042a14509f48bf40a0b446a2591674aaa728877b` |
| `claude/exciting-keller-wig7bg` | `5f12e4f67efed098e0a3f102e3b0a0c7209353fc` |
| `claude/kyrie-metro-adventure-region-q496ij` | `6ceb3d1ef3c3ffc46676358de81f22fb915fcef2` |
| `claude/westernesse-adventure-anthology-ji7zau` | `293ffba2ad35e96b81de8292bde322807ccf74de` |
| `fix/journey-steps` | `ef48da25de0b46a287beabe4db96ee220f8782e6` |
| `integrate/imbar` | `7493c8389f2c6715a1a57c0dd1ebb74c6109c4dd` |
| `m19-close` | `7302392cff3b582736238a836854ee1edbe605d2` |
| `m19-contracts` | `284638784abc462713268f8c06d4c95fbf23c6b9` |
| `review/architecture-2026-10-26-d79cbbd` | `6b65e532a910f0310ec7c05cb6f0f91ad5e9bb78` |
| `review/playtesting-2026-10-26` | `cc0ce36d85292996b9b78e35111c8ae10c342d48` |

## Local branches deleted: merged into main

Deleted with `git branch -d`, which refuses anything not merged. To restore one: `git branch <name> <sha>`.

| Branch | Commit |
|---|---|
| `art/bestiary` | `fda18fa41d5aef372ca7e486334886e85dccf369` |
| `art/menagerie` | `87d77c22e6e5a6571ba6491b083fe97ee005b717` |
| `art/plates` | `6bb6ab325e33852caebd1dc4538e90a9148791c7` |
| `art/scenery` | `ed6704fec6fdb924361d34ad0a22f6a68a446ed9` |
| `campaigns/companies` | `478a8134e3bee752b4e271dc8a8a3a1e1180d8bd` |
| `ci/browser` | `f264237394b248645e6e2c9ae0893efec3f30acb` |
| `ci/green` | `25d45016936ffd05b2bc2eadb23113068db37678` |
| `descent/wren` | `9dbc26e37505b3ed9c03c610a49fcfd7a58e55b7` |
| `economy/tools-shops` | `b571a68e24def120c7a6be16195c303612c19bcb` |
| `engine` | `5b54e42fccddacdb6eadd5be75fa0e3d93f004b8` |
| `fight/glassmen` | `86fd35db00f09e133f2b3d592d9a640146658e63` |
| `fix/journey-steps` | `ef48da25de0b46a287beabe4db96ee220f8782e6` |
| `integrate/anthology` | `2e8dbc7015e725f4375bf8866c43cf03e25d776f` |
| `integrate/imbar` | `291571c82cc6209c61296707ada35eb1fd36bff3` |
| `integrate/world` | `d270c7f6d776fedb94e0f88c7d1d7400000a1e72` |
| `journeys/256` | `39097103a60fb12f5560cbd2a03d4224f45b8c2e` |
| `kyr/gaps` | `c7f509a4e8f3212a793208f8c159d1dceaf07ed4` |
| `loot/reach` | `3cb5651ba90b1e654e19fb0026bdcaaccbbf9199` |
| `m19-close` | `7302392cff3b582736238a836854ee1edbe605d2` |
| `m19-contracts` | `284638784abc462713268f8c06d4c95fbf23c6b9` |
| `plants/recipes` | `6275ce1a232e6d0c6ffdb40b436062e663cce8bc` |
| `prose/narratology` | `2ca4b70dd206977d7e62e66188ab00ad3d189b71` |
| `road` | `8ae59d848b1054de4a3af01d174e586ae8f5677e` |
| `rules/osr` | `021d968be12fcdf549dc1f3201cad1ccdf8c5e94` |
| `sea/reach` | `d35523fb2888cb4a70c41ad4b3ed0ba0bdd8db79` |
| `ui/portraits` | `fa9004e6b506c22a309fc71e9b3a3685f542a590` |
| `ux/nav-gold` | `d8808822c6a4e835060e5aad4f225b537d35466e` |
| `ux/opening` | `08e813e062d0be7010fe2a552e01644bf9fea317` |
| `ux/page-flow` | `89ccd57449fbd4c458edb4a48ecfcdf4db353f64` |
| `ux/rest-scene` | `e94d1320b962149bc54667b547f14435ae1242dc` |
| `ux/wayfinding` | `097925e0806adc84a94342f31b972f0e70783940` |
| `worktree-agent-a7887145af722d0f8` | `fbf38d58b5ca7fc73ee7c766a62f4b9665673971` |
| `world/dun-rierdan` | `f19b35a3c6eb00086a6f92192bf6f7ef4c0cee29` |
| `world/shape` | `75795c8e98015534106da3a67f59eff0ab0cf54f` |

## Worktrees removed

Thirty-four clean worktrees, each with every commit already in main, were removed with `git worktree remove`. This
removes the working copies only; the branches and their commits stay. They were wt-ev1, wt-ev2, bisect, wt-anth,
wt-art, wt-base, wt-bisect, wt-browser, wt-ci, wt-companies, wt-dun, wt-flow, wt-gen, wt-glass, wt-journeys, wt-kyr,
wt-loot, wt-merge, wt-nav, wt-open, wt-osr, wt-plants, wt-play, wt-play2, wt-port, wt-prose, wt-rest, wt-scenery,
wt-sea-reach, wt-shops, wt-way, wt-world, wt-world-shape and wt-wren.

## What remains, and why

**Worktrees:**
- `/home/jweissman/work/kyrie` (main): the owner's checkout.
- `/var/tmp/kyrie/wt-m20` (m20-work): Mission 20's worktree.
- `/var/tmp/kyrie/wt-int` (integrate/first-steps): the adventure branch's integration onto main.
- `/var/tmp/kyrie/wt-review` (review/first-steps): the review merge. It is contained once the integration is in main.
- `/var/tmp/kyrie/wt-cold8` (detached): the cold-play build. Re-pin it to main for a new round.
- `/tmp/kyrie-headless` (investigate/headless-rpg): **uncommitted edits**, not touched. Its branch is merged; the
  edits are the owner's or that investigation's to keep or drop.
- `.claude/worktrees/agent-…` (docs/consolidation): **ahead of main**, an agent's docs branch, not touched.

**Remote branches not merged, each to decide:**
- `adventure/big-tent`: preview-only, by the owner's word.
- `adventure/first-steps` and `review/first-steps`: in once the integration is.
- Superseded by `adventure/first-steps`: `adventure/fs-expedition`, `fs-social`, `fs-wonder`, `fs-integrate`,
  `review/fs-integrate` and `claude/great-hamilton-xr4iyo`.
- The old `review/` branches of 25 and 26 October.
- `wip/art-scenery`, `wip/journeys` and `wip/ux-opening`.

**Scratch (outside the repository):** `/var/tmp/kyrie` keeps logs, cold-play screenshots and probes. Those worth
keeping are in `evidence-tools/` and the `cold/` reports. The rest is disposable at the owner's word.
