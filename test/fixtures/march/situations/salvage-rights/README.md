# Salvage against the dead

A salvager holds a permit for machinery in an old place where the dead also lie. The permit runs out at a fixed
watch, and then the salvager goes home. The keeper of those dead wants them left alone.

## Roles

| Role | Type | Meaning |
|---|---|---|
| `party` | group | The company. |
| `warden` | group, `peaceable` | Whoever keeps the dead: a priest, a sexton. Imported, so an institution can supply it. |
| `station` | place | Where the salvager works while the permit runs. |
| `prize_room` | place | Where the licensed salvage lies. |
| `sanctum` | place | Where the dead lie, with their grave goods. |
| `home` | place | Where the salvager goes when the permit ends. |

The situation declares the salvager, the permit, the prize (`bronze_bearing`) and the grave goods (`ashwood_charm`).
Generation names and labels them per `setting`.

## Choices and consequences

- **Deliver the prize** while the permit runs: six coin. After the deadline the salvager is gone and the offer lapses.
- **Sell the grave goods**, before or after the deadline: ten coin. The next time the company meets the warden, the
  warden refuses them service, permanently.
- **Leave the dead alone**: nothing happens, and that is a legitimate outcome.

Outcomes: `delivered`, `sold_the_dead`, `lapsed`.

## Installations

- [serewater-march.campaign.json](../../campaigns/serewater-march.campaign.json), `setting: river`: Edda, the
  bronze tram bearing in Censer Hill's hoist room, the offering-tray relic in the named vault; the warden is the
  Keepers of Names' Iven.
- [skellfold.campaign.json](../../campaigns/skellfold.campaign.json), `setting: quarry`: Corran, the incline drum's
  bearing, a drowned miner's charm in the sealed drift; the warden is Gethin the sexton.
