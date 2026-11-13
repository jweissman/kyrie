# They wait for the dragon to hunt, and rob it

Recorded by `bun bin/record-red-crag.ts` from `data/campaigns/red-crag.campaign.json`, seed `thrale`.
Waiting steps are folded. Combat lines are the committed mechanical events.

- **go(world__pasture_track,world__sheepfold)** (watch 6, success)
- **roost__habits** (watch 7, success): 'It goes out over the stone sheepfold at about watch 35 and comes back near watch 60. Takes a sheep most days. Never harmed a soul, mind, till folk started going up there with spears.'
- *(waits 270 minutes)*
- **wait** (watch 35, success)
  - Gei-Zar unfolds its wings, drops off the crag and glides away toward the stone sheepfold.
- **go(world__pasture_track,world__green)** (watch 41, success)
- **go(world__gorge_road,world__gorge_edge)** (watch 47, success)
- **go(world__rope_bridge,world__ledge)** (watch 48, success)
- **go(world__cave_mouth,world__cave_hall)** (watch 49, success)
- **take_item(roost__chapel_bell,world__member_party_1)** (watch 50, success): Elen takes the chapel bell.
- **go(world__cave_mouth,world__ledge)** (watch 51, success)
- **go(world__rope_bridge,world__gorge_edge)** (watch 52, success)
- **go(world__gorge_road,world__green)** (watch 58, success)
- **put_item(roost__chapel_bell)** (watch 59, success): Elen sets the chapel bell down.
  - The bell-ringer takes the chapel bell in both hands and runs for the bell-cote.
- *(waits 180 minutes)*
- **wait** (watch 78, success)
  - Fire falls on Thrale green out of the sky. The hay barn goes up like a torch.

Outcomes observed (watch): `{"roost.robbed":50,"roost.bell_rung":59,"roost.bridge_burnt":60,"roost.barn_burnt":78}`.
Company: Elen 12/12 HP, Bran 15/15 HP, Dori 10/10 HP.
