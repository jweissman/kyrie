# Fireproofed, they fight, and run

Recorded by `bun bin/record-red-crag.ts` from `data/red-crag/thrale.campaign.json`, seed `thrale`.
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
  - Calder uses fire_breath.
  - Dori saves versus breath: d20 17 + constitution -1 + level 1 + bonus 0 = 17 against 16: success.
  - Dori takes 3 fire damage (rolled 14; halved by the save, resistance 0.5); 3 HP left.
  - Elen saves versus breath: d20 19 + constitution 2 + level 1 + bonus 0 = 22 against 16: success.
  - Elen takes 3 fire damage (rolled 14; halved by the save, resistance 0.5); 8 HP left.
  - Bran saves versus breath: d20 20 + constitution 0 + level 1 + bonus 0 = 21 against 16: success.
  - Bran takes 3 fire damage (rolled 14; halved by the save, resistance 0.5); 8 HP left.
  - Dori uses attack.
  - Calder takes 4 physical damage (rolled 4); 95 HP left.
  - Elen uses attack.
  - Calder takes 5 physical damage (rolled 5); 90 HP left.
  - Bran uses attack.
  - Calder takes 4 physical damage (rolled 4); 86 HP left.
  - Calder uses bite.
  - Calder attacks Dori: d20 3 + 8 against 10: hit.
  - Dori takes 3 piercing damage (rolled 10; power 3); 0 HP left.
  - Dori falls.
  - Elen uses flee.
  - The fight ends: escaped (retreat).
- **go(world__goat_path,world__shoulder)** (watch 18, success)
- **go(world__scree,world__sheepfold)** (watch 30, success)
- **go(world__pasture_track,world__green)** (watch 36, success)
- **go(world__hearth_door,world__common_room)** (watch 37, success)
- **take_lodging(world__aldo_lodging,world__aldo)** (watch 85, success): You eat a hot supper and sleep eight hours in a dry bed.

Outcomes observed (watch): `{"roost.bridge_burnt":17}`.
Company: Elen 11/11 HP, Bran 11/11 HP, Dori 0/6 HP.
