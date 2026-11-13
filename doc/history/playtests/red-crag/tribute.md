# They pay the dragon

Recorded by `bun bin/record-red-crag.ts` from `data/campaigns/red-crag.campaign.json`, seed `thrale`.
Waiting steps are folded. Combat lines are the committed mechanical events.

- **go(world__gorge_road,world__gorge_edge)** (watch 6, success)
- **go(world__rope_bridge,world__ledge)** (watch 7, success)
- **roost__hail** (watch 8, success): 'Thieves come with swords,' says Gei-Zar, in a voice like a kiln door opening. 'Beggars come with nothing. Petitioners come with gold. Which are you?'
- **roost__tribute(party,world__ledge)** (watch 9, success): The coins clink onto the stone. Gei-Zar rakes them toward itself with one claw and lifts its tail from the cave mouth.
- **roost__bargain** (watch 10, success): 'That little thing? It rings flat. Take it, and take yourselves off my ledge.'
- **go(world__cave_mouth,world__cave_hall)** (watch 11, success)
- **take_item(roost__chapel_bell,world__member_party_1)** (watch 12, success): Elen takes the chapel bell.
- **go(world__cave_mouth,world__ledge)** (watch 13, success)
- **go(world__rope_bridge,world__gorge_edge)** (watch 14, success)
- **go(world__gorge_road,world__green)** (watch 20, success)
- **put_item(roost__chapel_bell)** (watch 21, success): Elen sets the chapel bell down.
  - The bell-ringer takes the chapel bell in both hands and runs for the bell-cote.
- *(waits 1290 minutes)*

Outcomes observed (watch): `{"roost.paid":9,"roost.bell_rung":21}`.
Company: Elen 12/12 HP, Bran 15/15 HP, Dori 10/10 HP.
