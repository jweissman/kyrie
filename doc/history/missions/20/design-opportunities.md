# Design opportunities (from the owner's play of 10 November)

Ideas from [user-notes.md](user-notes.md) kept for later missions. They are not M20 tasks, and none is scheduled.
Each has what it would change, what it rests on now, and the first step if it is taken up.

1. **Openings by situation, not by errand.** Several origins share one first situation shape (lost in an ancient
   arcology; a caravan waylaid); the cellar-rats job stops being the first mission everyone meets. *Now:* origins bind
   a first place and an errand; the undertown's jobs are the town's first trouble. *First step:* a situation table
   (what the first scene is made of: a bounded place, a pressure, a way out) that an origin names, and one origin
   rewritten against it.
2. **Bounded prologues.** A short spatially bounded opening (an arcology expedition) before the country opens.
   *Now:* the painted prologue is a few beats and one road meeting. *First step:* one prologue as a small site the
   company must get out of, generated from a kit, ending at the country's edge.
3. **Character made in the telling.** The top-level choice in creation ("what were you before?"), the particular
   trade decided later in a conversation; sex chosen before anything gendered is shown. *Now:* trades are chosen in
   creation; their names follow pronouns (forms.json, M20). *First step:* move the trade's detail out of creation into
   the first conversation that asks it.
4. **Kyr and Deem boundaries.** Deem owning the top-level world generator and running Kyr for how the world fits
   together (planes, the great desert, the ocean, the metropolis), with less of the world written in TypeScript.
   *Now:* region writers, settlements and works are TypeScript with Kyr templates. *First step:* one region writer
   (the outskirts or the undertown) expressed as a Deem table that calls its Kyr template.
5. **Combat from a few constants.** Damage, defences and abilities derived from a small set of base expressions
   (a "small strike" and its multiples), creatures balanced against each other in an arena, ability "pawns" in
   tournaments, party configurations in rising gauntlets. *Now:* creatures come from Orsino rows and variations; the
   reckoning simulates single fights. *First step:* a small diagnostic (see M20's combat work) that reckons the first
   hour's bands against the usual starting companies.
6. **A living interface.** Real time that passes; motion and reaction beyond a static page; scenes as full paintings
   with controls over them. *Now:* M20 tries a scene-led layout in the rendered product. *First step:* whatever the
   M20 experiment shows.
7. **Travel as passage.** Every hex crossed a chance of a meeting, what is passed through seen, rations and rest
   reckoned before setting out. *Now:* M20 makes travel slower and legible within the existing rules. *First step:*
   per-hex encounter rolls, if the M20 work shows the need.
8. **Geography beyond the first atlas.** The first country is a 20×14-hex atlas; Thornhaven stands at its western
   edge, and other countries open only at their way-into stones. *Now:* nothing west of the atlas, and the map does
   not say why. *First step:* the map saying where the drawn country ends; later, Imbar's larger land and its oceans.
9. **What a character can tell of what grows.** Plants are grouped at a place (M20); woodcraft or herb-lore could name
   the species and what each gives, and an ordinary eye see only "flowers, herbs". *First step:* a known/unknown split
   in "What grows here" by the company's woodcraft.
10. **The mage at first level.** Created as creation makes one, an elf mage meets 11 of the first hour's 14 bands as
    grave or deadly. *First step:* the diagnostic (tools/bands.ts) as a spec, and the mage's first spells and hit
    points weighed against it.
11. **Challenge measured against the warrior players make.** `bestiary challenge` measures kinds against a warrior
    with the dice as they fell; measured against creation's (tried in M20), 144 of 183 kinds read weaker, which would
    enlarge every composed encounter. The first hour's bands are authored, not composed, so M20 leaves it.

12. **Defence that a first-level foe can get through.** Round 5: a ranger in chain mail was hit only on 20–22, and a
    mage behind a hired soldier was never touched; both players rated challenge 2. *Now:* armour from Orsino's tables,
    foes from the bands of the first hour, measured against a warrior with unsuited rolls (11). *First step:* the
    diagnostic's bands against a ranger in chain mail and a mage with a hireling, and how often a foe hits each.
13. **Facets beyond the six, perceived by degree.** The owner, 11 November: rare facets (the Mathematical Age's
    significance, exceptional wonder, comic or mischievous openings with real social or tactical consequences);
    recognition at different confidence and distance (lore, woodcraft, a calling's abilities or divination showing
    signs of an opportunity several places or hexes before it is reached); advancement that widens what a character
    perceives, not only its odds; and situations authored or generated to combine facets, so that compound
    opportunities arise of themselves. *Now:* six aspects from the reasons the glance leads by, a sign gated by a
    capability (`noticed by`), and a compound drawn as an OKLab gradient. *First step:* a sign's own aspect
    (opportunities.md, gap 1) and one sign noticed at a distance.
