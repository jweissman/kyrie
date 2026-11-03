# The Grand Tour: environment and resolutions

*What the places do to a company, and every way each knot can be undone, with where it comes back. Spoilers.*

## What each storey costs

**Sennet** costs coin and nothing else. Eighteen coin at the start (the campaign's bard); five up the chain, ten to
enter the Tour (or the Rector's commission instead), six for a fire-cloak, twelve for a helm, two for a wind-jar,
five to bring Ha'penny above the plate, twenty to end a strike, four to tip Tench. Every price has a labour that
replaces it: a capstan shift, a commission, a borrowed cloak, Ha'penny's breath. The city is never closed to a poor
company; it is slower.

**Cloudgate** costs face. You need a reason to be let in (a licence, a court background, Aubrey, a laundry hamper,
stealth past Jem), and the Air Door needs the Halyards' leave, which the Dowager will not give until her son's coffin
is down, or a broken seal, which the Promenade hears. It is "always a fine afternoon" by day; at night it is the top
of the sky. Once it has fallen it is an island in the bay, described as one: the Promenade a beach, the Balustrade ten
feet over grey water, Sennet's weather.

**The Whelm** costs breath (`stairs_down` needs `breath`, the module's capability, granted by `granted(…, breath,
until)`): the House's helm while worn; Ha'penny's, short; the guards', long, once admitted; Mercy's. Every watch
under water without it, the company is warned and then lifted, choking, to the Fish Stairs (`whelm.kyr`, the
drowning rule): the sea throws you out; it does not kill you for a wrong turn.

**The Fire** costs skin. Without a cloak (`heatproof`), the heat strikes once on the way in (1d6, constitution save),
and half an hour later the Hour Court carries you out and sets you down at Mr. Tench's feet ("Cooked"). This was
changed after autoplay: at first it struck every ten minutes, and a wandering bard died of it mid-sentence; now the
Fire drives a Tourist out rather than killing one. A crowned Monarch can decree it cool.

**The Earth** costs time and light. It is unlit; without a candle you can do nothing that needs seeing, and the
Assembly's procedure, if you sit it out, takes two days (`sit_assembly`, Time 144 each).

**The Air** costs reputation. Nothing to stand on; nothing needed; but the North Wind receives only the most talked-of,
and every true thing told the sylphs is down in Cloudgate within the hour and in the House of Doors by the next
(`gossip_blows`). Tell them Perrin is alive and the Rector knows by supper.

**Time** costs most. The rivals, the funeral, the strike, the divers and the Rector's keel night run whether or not
the company is there (`rivals.kyr`, `rector.kyr`, `ascent.kyr`). Left alone, the week ends in the Second Whelming:
the rivals win the Fire and the Earth and lay them on her desk; the divers take the Water on the sixth morning; on the
seventh night she goes down the keel ladder; the hill comes down on the Whelm; Perrin is crushed in the air-bell
(`test/the-grand-tour-outcomes.test.ts`, "left alone").

## Every resolution, and where it comes back

| Knot | Resolutions | Comes back |
|---|---|---|
| The Fire petal | Mirror · geode · North Wind jar · Handbook · song · performance · the Lists · snatch · the ember crowned · Florian's (traded for the geode) | Fabian's line in the seventh edition; Florian's collection; the ember's reign in the news |
| The Earth petal | Sit two days · move the question · dig · Chert | Chert on your boot; the Assembly will find out in a hundred years |
| The Water petal | No Admittance's gift (laughter, the third step, supper) · the divers (the Rector's) | The Whelm's welcome; Admittance and Pumphrey at the step |
| The Air petal | The keel: take · swap · leave · the Rector takes | Which of the eleven ends |
| Prue's heat | The Rector withdraws (a favour owed) · Florian confesses · cold | The Made Petal possible or not; Prue's account in the end |
| The strike | Pay · a shift · wait | Free basket; Kittiwake's memory; the fire-butt |
| Jem | Potman · Prue's hand · frightened | A witness; an unkept door; the news |
| Tolley | Credited by the Rector · his own name | A witness; *A Romance of the Sea* in the Courant |
| The bell | Stop · once for Ned · muffle · the rite | Bethan's candle; her sleep; the children's game |
| The third step | Pay · deposit · argue · the grandmother · carry her | Ha'penny's breath; No Admittance; the plate |
| Aubrey | Drink and listen · "not a man who pushes" · Perrin's letter · the brothers meet | The keel key; his fate in the news |
| Perrin | Leave him dead · tell the sylphs · Mercy at the Lanterns · set his leg · bring him up · the engine with him moved · the engine with him in the bell | Alive or drowned; his letter to his mother; his secret kept or broken (`perrin_secret`) |
| The Rector | Bassett · the Promenade (holds with Perrin there or two witnesses; laughed at otherwise) · Perrin face to face · refuse her at the keel (a fight) · tell her it is over at the keel · bar her at the Door · go with her · give her the petals | Six of the eleven ends turn on her |
| The Dowager | Tell her the candles · show her Perrin's letter · Mercy and the ring · her apology to the North Wind · her bribe taken or refused | The Keepsake; Kept Above; her candle |
| Fabian | Stays in his shop · comes, and is brought home · comes, and is lost · dances · is told | His dedication; the portrait hung lower; the card GONE THROUGH; the shut shop |
| The ember | Stays · goes home by Cole, Florian, a picked lock, broken glass | Crowned; the Rector refused |
| The Whelm, at the end | Warned of the fall · warned of the divers · the engine by leave · the engine without · crushed | Gone home through the Water Door; repulsed the raid; hostile to you |

## Consequences that bite

- **The notebook.** The Rector asks for Perrin's notebook as her commission. Give it to her and she reads the dates
  on the last pages, says "this is a great kindness", locks it in a drawer, and at two that night goes down to the
  air-bell in the House's helm (`notebook_to_rector`, `rector_kills`). Nothing tells the company this was the mistake
  until Ha'penny on the step in the morning.
- **The Lanterns.** Mercy at the Lanterns is the warmest scene in the work and the most dangerous: she tells the
  Dowager, and the Rector across the Promenade sets her glass down and goes for her cloak. Unless the company is in the
  air-bell at two, or has moved Perrin, or warned the Whelm, he is drowned (`test/the-grand-tour-outcomes.test.ts`,
  "stays up in the Air").
- **The engine.** Started without moving Perrin, the bell empties and he drowns; started without leave, the Whelm is
  shut to you after.
- **The keel.** Taken without warning the Whelm, everyone under the hill dies, including Perrin, whatever else is
  true; an accomplice is told so in the first sentence of their ending.
- **The landing.** Riding the hill down deals 2d8 to each member who fails a dexterity save; a level-2 companion can
  fall (Fabian did, in the Coming Down transcript, and was left senseless; he was not killed).
- **Kindness that costs the plot.** Freeing Jem leaves Halyard House unkept; telling the sylphs anything true tells
  the Rector.
