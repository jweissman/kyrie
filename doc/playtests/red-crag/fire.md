# Fireproofed, they fight, and run

Recorded by `bun bin/record-red-crag.ts` from `data/campaigns/red-crag.campaign.json`, seed `thrale`.
Waiting steps are folded. Combat lines are the committed mechanical events.

- **go(world__chandlery_door,world__counter)** (watch 1, success)
- **buy_item(world__ysolde_fireproof_salve_1,world__member_party_1)** (watch 2, success): Ysolde takes the money and hands Fireproof salve to Elen.
- **use_item(world__ysolde_fireproof_salve_1,world__member_party_1)** (watch 3, success): Elen takes Fireproof salve.
- **buy_item(world__ysolde_fireproof_salve_2,world__member_party_2)** (watch 4, success): Ysolde takes the money and hands Fireproof salve to Bran.
- **use_item(world__ysolde_fireproof_salve_2,world__member_party_2)** (watch 5, success): Bran takes Fireproof salve.
- **buy_item(world__ysolde_fireproof_salve_3,world__member_party_3)** (watch 6, success): Ysolde takes the money and hands Fireproof salve to Dori.
- **use_item(world__ysolde_fireproof_salve_3,world__member_party_3)** (watch 7, success): Dori takes Fireproof salve.
- **go(world__chandlery_door,world__green)** (watch 8, success)
- **go(world__gorge_road,world__gorge_edge)** (watch 14, success)
- **go(world__rope_bridge,world__ledge)** (watch 15, success)
- **roost__hail** (watch 16, success): 'Thieves come with swords,' says Calder, in a voice like a kiln door opening. 'Beggars come with nothing. Petitioners come with gold. Which are you?'
- **attack(roost__dragon)** (watch 17, failure)
  - Flame runs along the bridge ropes. The planks drop away into the gorge one by one.
  - Dori uses melee.
  - Dori attacks Calder with staff: d20 17 needing 23 (AC -3, to-hit 0): miss.
  - Bran uses melee.
  - Bran attacks Calder with battleaxe: d20 19 needing 22 (AC -3, to-hit 1): miss.
  - Calder uses breathe_fire.
  - Elen saves versus breath: d20 5 + constitution 2 + level 1 + bonus 0 = 8 against 16: failure.
  - Elen takes 12 fire damage (rolled 21; resistance 0.5, bonus 3); 0 HP left.
  - Elen falls.
  - Elen saves versus death: d20 3 + constitution 2 + level 1 + bonus 0 = 6 against 25: failure.
  - Bran saves versus breath: d20 3 + constitution 2 + level 1 + bonus 0 = 6 against 16: failure.
  - Bran takes 7 fire damage (rolled 15; resistance 0.6, bonus 3); 7 HP left.
  - Bran saves versus fortitude: d20 14 + constitution 2 + level 1 + bonus 0 = 17 against 15: success.
  - Dori saves versus breath: d20 17 + constitution 1 + level 1 + bonus 0 = 19 against 16: success.
  - Dori takes 4 fire damage (rolled 12; halved by the save, resistance 0.5, bonus 3); 5 HP left.
  - Dori saves versus fortitude: d20 6 + constitution 1 + level 1 + bonus 0 = 8 against 15: failure.
  - Dori uses flee.
  - The fight ends: escaped (retreat).
- **go(world__goat_path,world__shoulder)** (watch 18, success)
- **go(world__scree,world__sheepfold)** (watch 30, success)
- **go(world__pasture_track,world__green)** (watch 36, success)
- **go(world__hearth_door,world__common_room)** (watch 37, success)
- **take_lodging(world__aldo_lodging,world__aldo)** (watch 85, success): You eat a hot supper and sleep eight hours in a dry bed.

Outcomes observed (watch): `{"roost.bridge_burnt":17}`.
Company: Elen 0/12 HP, Bran 14/14 HP, Dori 9/9 HP.
