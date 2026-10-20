# Legacy material: what was kept, and where to find the rest

The legacy campaigns, experiments, clients and quarantined catalogs were deleted on 19 October 2026 (decision recorded
in [repository-disposition.md](../architecture/repository-disposition.md)). Their sources remain in git history at
commit **`fbd3741`**: for example, `git show fbd3741:data/serewater/serewater.kyr`. This page records the fiction
worth reusing and what became of it.

## Reconstructed in the recommended model

| Source | Material | Now |
|---|---|---|
| Serewater March (`data/serewater/serewater.kyr`, 333 lines) | Reedwake on the flooding Serewater; Censer Hill's bell foundry, flood refuge and ossuary on three levels; Nera the outfitter; Iven and the Keeper of Names; Edda's salvage permit and the bronze bearing; Pell the surveyor; the Mortuary Custodian and its funerary mandate; the hoist counterweight, the sealed kitchen vapour and the bronze burial shutters; the concealed stair; the lantern of names | `regions/serewater-march`, `sites/censer-hill`, `institutions/keepers-of-names`, `situations/salvage-rights` and `situations/caught-below`, composed by `campaigns/serewater-march.campaign.json` |
| Sanctuary (`data/sanctuary`) and the founding-charter situation | A keeper bound by a founding obligation she misreads; the charter that proves it | The obligation model of `institutions/` (charters, holdings, members) |

## Not yet reconstructed; worth reusing

**Saint Orra and the northern margin** (`data/orra`, `data/frontier`).

- A refuge beside a charcoal kiln and a drowned watchtower. A child is sick. The keeper, Mere, has blamed and
  locked up a charcoal worker, Tamsin.
- The true cause is silver-flecked stone, scavenged from the tower, fired in the kiln. Its ash poisons the spring.
  The missing healer, Ys, left a sealed water analysis.
- Dismantling the kiln's bellows stops the poison and also the refuge's heat.
- Below the tower, Ys tries to stop a silver siphon before the reservoir floods the path at a fixed hour. A
  revenant wearing a stag's skull guards the stair under an oath and can accept her purpose.
- A gaunt she-wolf will let a patient company pass.
- On the margin, a trappers' camp will freeze unless a winter shrine's ice-pump is stopped. Tala the guide knows a
  ledge around the altered wolf Frostback.
- Reusable shapes:
  - a *wrongful accusation* situation (accuser, accused, true cause, evidence, hearing);
  - a *process out of control* situation with a deadline and an irreversible consequence;
  - a *guardian bound by an oath* encounter.

**Bells Under Blackvein** (`data/blackvein`).

- A mine town. Ser Caldus, Lord Vey's agent, holds a purchased deed and wants road security. Ada Flint, the miners'
  forewoman, needs wages but will protect her workers given evidence. Brother Iven measures rising water at the
  well. Len Wren, a pump tender, fled the underground bell.
- A water-driven striker in a buried bell chamber is flooding the workings. Closing the bulkhead keeps the water
  below but stops wages.
- Reusable shapes: a mine company institution with a disputed deed; a hazard whose safe remedy has an economic cost.

**Greenhollow Vale** (`data/greenhollow`).

- The Hearthleaf apothecary above older halls: a cellar, a pilgrims' archive and a seed-register vault.
- Tamsin is trapped under a fallen drying rack while comparing seeds.
- A pale hound dens among the shelves. A root-cut drain gives a way back.
- Veyra's roadside house refuses strangers until shown the founders' charter.
- Reusable shape: a house-above-halls site.

**The Glass Orchard** (`data/discovery`).

- A founder made the manor's mirrors into prisons for living people. Two independent sources reveal it.
- Its knowledge model (facts, sources, private knowledge, trusted reporting) already lives in the canonical
  `rules/discovery.kyr`.

## Deleted without reconstruction

- **Crossing, pantry, resource gate, NPC goals** (`data/modules`, `data/bundles`, `data/experiments`): planner and
  generator experiments that redefined canonical relations.
- **The client study** (`data/client-study`): a cut-down Censer Hill.
- **The Folio, Wayfarer, Orra, workbench and parity clients.**
- **The legacy rule stack:** `adventure`, `dungeoneering`, `spatial`, `items`, `fieldcraft`, `expedition`,
  `affinities`, `site-capabilities`, `ecology` and `devotion`.
- **The quarantined catalog** (`data/legacy`).
- **The golden browser histories that replayed these campaigns.**
