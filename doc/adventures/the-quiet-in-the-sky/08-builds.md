# The Quiet in the Sky — who can do what

The work is written so that no problem that matters needs one kind of protagonist. Each crux has a road that wants a
skill or a roll, and a road that wants attention, patience or a walk instead. The table names the check each road uses
(`Resolve check(actor, …)`, `capable`, or nothing), and the builds journeyed through it.

## The cruxes

| Problem | By skill or roll | By attention, patience or effort | By force |
|---|---|---|---|
| **Through the White** | Wayfinding, hard (a failed search costs a frostbite) | Pay Jory six coin; afterwards, if he has been told his son's fate, he takes you free | — |
| **Learning the law** | Rites, fair: read Halvard's wound (a cleric or a medic); Lore, hard: beat Aulus at Tabula | Lose to Aulus twice, and he gossips; ask Edith; spar with Mab (anyone can, and blood is drawn whichever way the tumbling roll goes) and be there at the Hour | — |
| **Seeing the wound** | Stealth, hard: slip in among the spears at night | Ask Torold's leave, once he has talked to you | — |
| **Finding Edith** | — | Know what a breath means here and look in the warren; or earn Cuddy's trust with tobacco and questions | — |
| **Past the Sitters' bear** | Climbing, hard: round it by the ice towers (a fall puts you at the foot, hurt) | A slab of Brindle from Morrowhall's fire-trench | Fight it, and it never gets up; the Sitters do not forgive |
| **The Sitters' cave** | Insight, fair: search the back of the shelf | Ask Cuddy | — |
| **The wolves on the Teeth** | — | A lit torch (they fear flame) | A fight a first-level protagonist loses (seen in play: one round) |
| **Mab and Ansel** | Persuasion, fair: get Ansel to write plainly | Carry the challenge, take her anger, and tell her what it means in his century | — |
| **Bread** | — | Nance's warning, a crock against your skin, eight hours of walking | — |
| **The song** | — | Two things worth telling, and the lullaby, which wants Wystan's trust | — |
| **The strike** | — | Cuddy's trust (tobacco, her death, her want) and the realisation about the Field | — |
| **Telling Halt the truth** | Persuasion, hard: declare it yourself at the ring, with proof | Ask Mab to show her lip; bring Edith; ask Aulus to speak | — |
| **Making Hild brave** | Persuasion, fair, once a day, with a reason (bread, a wedding, a song, a bench, the Sitters) | Hear her secret about Wrenning and say the one thing that answers it (no roll) | — |
| **Burying Halvard** | Brawn: haul him down through the White alone | Jory on the front trace, if he has been told; or the Old Ice with the Sitters and the watch | — |
| **Bronze from the Clear** | Digging, hard: a day's work | — | — |
| **The Kept Fear** | Stealth, fair: strike once in the press unseen (a failure: 2d6 from Even's blades) | — | Fight the press: six of Even at level 5 against a living body |
| **The cold** | — | A sheepskin (four coin from Jory) doubles what you can stand; the Oven, the halls, the warren, the brazier and Larum warm you | — |

## Builds journeyed

| Build | Journey (fixture) | What it did differently | Ending |
|---|---|---|---|
| **Human warrior** (Strength, brawn; Charisma −1) | `halt.json` | Learned the law by fault, sparring with Mab. Failed the persuasion with Ansel and carried the challenge instead. Failed the persuasion with Hild on the Testing morning, and the outcome was Half a Field. Made Hild brave through her secret instead | Halt (Half a Field on the failed roll) |
| **Human warrior** | `quiet.json` | Torch for the wolves, the name on the Tooth, Torold ready; a grave in Larum hauled alone by brawn; never learned the law | The Long Quiet |
| **Human warrior** | `daily.json` | Went up once with Jory and came straight down | The Daily, unseen |
| **Human warrior** | `betrayal.json` | Gave Edith up to Torold; got the Runners their bench | The Long Quiet (Edith sent west) |
| **Human thief** (Dexterity, stealth) | `fear.json` | The law by fault; promised Hild; one stealth strike in the press, unseen | The Kept Fear |
| **Dwarf cleric** (rites; Intelligence −2) | `edith.json` | Read the wound by the rites (fair, made by one); found Edith; brought her to the ring; lost twice at Tabula and was told anyway; the Old Ice grave; made Hild brave by listening; took Edith home | Halt |
| **Human bard** | `strike.json` | Wystan's song from two verses and the lullaby; the strike; the Clear (digging failed) | The Long Quiet (strike) |
| **Three builds at random** | `quiet-in-the-sky-wander.test.ts` | 250 random offered choices, then waited out; no invalid state, at most one ending. Two of the six walkers died: one of cold in the White, one on the Field | — |

## What I have not tested

- A company of several (all journeys are single protagonists).
- A mage. The plane's law weakens spells (`plane_ysgard`, −1 to spell DCs) and no fight here was fought with spells.
- A fight with the bear or with the press that the protagonist wins. A protagonist above level 4 might win either, and
  the consequences are written (the bear's text; `press_died` leading to the Kept Fear), but they have not been played.
- The elegy path, Gorm's plough, Hild's blessing of the wedding, and Torold killing Edith. Those are built and lint
  clean, and have not been journeyed.
