# What keeps an ordinary session of Kyrie from being worth repeating

> **Follow-up:** [deep-dive.md](deep-dive.md) measures these diagnoses across 12–24 generated countries with the
> engine itself (economy, class viability, renewal, sameness, load), plays a further expedition, and corrects three
> claims below. [creative-direction.md](creative-direction.md) turns both into concrete fixes (economy numbers,
> navigation behaviour, drafted quest continuations) and first runs of three experiments.

An independent investigation of the structure of play: motivation, loops, attention, incentives and progression.
The game was played first, in the real browser bundle (`bun run web:build`, `site/mono.html` driven through
Playwright Chromium, 1280×900 and 390×844), with ordinary offered choices only. Code and design documents were
consulted afterwards, only to confirm causes. Six sessions in five generated countries, on the commit before this
report (`6596e18`).

| # | Country | Protagonist | Premise | Horizon |
|---|---|---|---|---|
| 1 | Lótëtaure | elf warrior | Feverwort | newcomer following curiosity |
| 2 | Willowholt | human warrior | What is owed | adventure, money, advancement; returning to a site |
| 3 | Elmweald | human mage | The brothers' errand | scholar |
| 4 | Elmweald (same world, after death) | human bard + hired companion | Over the hills | social, trade, investigation |
| 5 | Wǽtfaenn | elf mage | The brothers' errand | scholar, careful play |
| 6 | Blackcarr (phone width, keyboard) | human warrior | Coming home | family, investigation |

Session 2 was also resumed after a page reload (returning player) and revisited the barrow a day later.

---

## A. Experiential diagnosis

**In ordinary play Kyrie becomes a beautifully written dungeon crawl wrapped in very short errands.** The errands
end before the player has settled in, and then hand the player to an open country without telling them what is
worth wanting next.

The first ten minutes are often excellent. An inn gives four or five distinct, evocative invitations (a mountain
hanging on a chain over a well nobody has reached the bottom of; a giant king under a ridge with something tall
walking it at night; a barrow whose gold a salter will buy). The premise gives a concrete want with a cost and a
clock: fifty coin in ten days. The prose is precise, and the layout is calm and readable on both desktop and phone.

Then the structure gives way, in a consistent pattern:

1. **The premise resolves almost at once, and resolving it changes nothing.** Feverwort: three clicks, done at
   8:10 a.m. on day 1. The debt: paid at 4 p.m. on day 1 from one barrow's floor coins and two strings of beads.
   The scholar's errand: one "Read" click on a pillar. Two of these three are not even recorded as achievements.
2. **The one loop that is rich (go into a ruin, read the place, solve its props, fight, loot, sell) pays so much
   that it breaks everything else.** After one barrow a level-1 warrior had 998 coin, two levels and nothing
   worth buying. A bed costs 3. The most valuable thing the game offers, a crown, is worth 1,500 and "not that
   much in this place".
3. **Non-combat ambitions are implied everywhere and supported almost nowhere.** A bard has no performance, a
   persuader cannot talk down a toll, a scholar's knowledge is spent on a coin-flip, a trader has no trade, and the
   inn ("the place to hear of work") offers rumours but no work.
4. **When a thread ends, the game says "Nothing more is asked of you."** The best scene in six sessions (finding a
   father dead under his cart with his son kneeling beside him) ends with that line at 12:50 on day 1. The same
   scene had just told the player that "whatever had the oxen dragged them off toward the hills".

So an ordinary 30-minute session has a strong opening, one good expedition if the player stumbles into a ruin, and
then drift: a full purse, finished errands, an unranked list of rumours, and long journeys that stop for things
that no longer matter.

Kyrie's distinctive strength (a world that keeps its own time, where a child dies off-screen because nobody
brought the herbs) is real. But it mostly happens out of sight and is rarely turned into an invitation.

---

## B. Play-session evidence record

### Session 1: Lótëtaure, elf warrior, "Feverwort" (newcomer)

- Arrival is lovely: the painted page, "smoke from a dozen chimneys", the errand from the herb-wife.
- Talked to Lia (the child's mother). Her first line was the generic greeting: "You've come a long way to find
  somebody. Is it me?" She does not recognise that I am carrying the medicine she needs. She says the herb-wife "has
  nothing left" and that willow bark would do. That contradicts the premise: the herb-wife sent me *with*
  feverwort.
- "Give a feverwort": *"Lia takes the herbs inside without a word. By evening the fever has broken."* SEEN THROUGH,
  +100 experience. Day 1, 8:10 a.m. No thanks, no relationship, no consequence.
- Notes then said *"Nothing more is asked of you"*, but still listed "Willow bark breaks a fever" under HEARD, NOT
  YET SEEN: a lead to a problem that no longer exists.
- The character page listed nine techniques at level 1, plate mail, and "a common foe needs 20 or more" to hit me.
- The map showed only towns and abstract junctions: nothing to want. With no goal left and nothing visibly
  dangerous or wondrous, I abandoned this session.

### Session 2: Willowholt, human warrior, "What is owed" (adventure, money, return)

*Opening: strong.* Emric the salter: "Fifty coin, by market day." He offers a real choice: five more days for
five coin more. He also gives an invitation that ties the debt to the world: "Bring me what the old folk buried and
I will pay what it is worth." The inn added a bounty notice (40 crowns, the Mower of the Long Man), the drifting
mountain on a chain, two barrows, and a warning: "Go in daylight, and take more light than you think."

*Finding the barrow.* The roads out of the landing did not include the barrow's track. Only after wandering to the
salt-pans did a SET OUT FOR list appear with "Tenebrerecs 5 legs · about 3 hours". The map is not clickable, and the
landing (where the player stands when they learn the place) did not show the destination.

*The barrow (Tenebrerecs): the best sustained play in the investigation.*
- Parley with hobs: "Gaffer says come in and wipe your feet. Don't touch nothing." Charming, and the parley
  removed the stealth block on the cave mouth.
- Took amber beads and a bone flute from the forecourt despite "don't touch nothing". No reaction from anyone.
- A glyph: Look closely → "reading it is what sets it off" → *hold the pole's end across it, looking away* (the
  starting ten-foot pole earns its keep). "A psychic scream assaults the mind." No visible effect on me.
- Beetles: a clean fight screen with telegraphed intents ("Means to use mandibles on Harl") and hit chances per
  target ("3 in 4"). Cleave killed two. +145 experience.
- Coins in the dust: +18 (39). Rats: auto-fought with `t`, no damage taken in plate, +325. Bats: +265. Coins: +23
  (**62 coin; the debt is covered before noon on day 1**).
- A riddle casket ("once in a minute, twice in a moment…" → M) opened, and **my only torch went out at that exact
  moment**: "Nothing lit · nothing to spare." This was a fair, memorable cost (I had been warned, and had not bought
  torches), and it sent me home to resupply. It was the only moment in six sessions where a resource made me plan.
- Back in town: debt paid ("'We're square.' For the first time, a smile"), no experience and no SEEN THROUGH. Sold
  the flute (45) and two strings of amber (40 each): **137 coin.** Each sale also granted equal experience.
- Overnight at the inn: *"The talk is all of the company's diggers, who went up to Tenebrerecs at first light."*
  An excellent living-world hook that made returning urgent.
- Return: *SINCE YOU WERE LAST HERE: a chalk mark like a set of scales, a tally, an arrow pointing on.*
  Grave-robbers in the passage. "Warn off" succeeded on an intimidation roll ("you are given room"), but nothing
  changed: they stayed, with the same options. On the way out they had become "a hard fight", harder than the king.
- Notebooks of a previous party told the dungeon's story ahead of me ("In the embalmers' room there is a jar that
  is warm to the touch"). This is very good environmental storytelling.
- A jammed portal stone opened by the warrior's Brawn: a calling mattered.
- Bone hounds: "Vulnerable to radiant, fire." I carried alchemist's fire. **The fight offers no way to use an
  item.** +1,265 experience for two hounds.
- The cursed great hound: Prepare Charge → Charge, 16 damage and stunned. A satisfying decision. +1,535.
- The jar of noonlight: "things that hate the day hate it". A wonderful object, never used.
- The first king: the climactic encounter, rated **"easily won. It is no match for you."** Auto-fought in 7
  rounds for 3 damage. +735 (less than the hound).
- Leaving with the crown: *"In the daylight the crown of the first king … is only a crown … and the day is the
  same day it was."* A fine line, printed three times. Outside: *"A blackbird is singing on the mound, and the
  sheep have come up onto it to graze."* A beautiful consequence.
- Notes afterwards: no SEEN THROUGH for the crown or the debt. "Unfinished" listed only the philosophers.
- Selling the haul: mirror 120, torcs 300 each. Emric then ran out of cash. **998 coin on day 2.** The crown: "Worth
  1500 coin … Take it to a town." Slept: **levels 2 and 3 at once.** Shops held lanterns, torches, rations and a
  handful of potions. Nothing to want. *(Correction, [deep dive](deep-dive.md) §2: this depends on the country.
  Wǽtfaenn's curiosity shop sold wands, scrolls and a Ring of Protection for 100–300 coin.)*
- The philosophers' dispute: knowledge from the barrow unlocked "Tell of the kingdom that came after the makers,
  and how it fell · an even chance". It failed on a d20 (10 against 13), and the option vanished for good.
  Arguing the other philosopher down succeeded on a plain persuasion roll: *"It is a victory. It is not a reason."*
  A witty line, but the game paid the bluff and wasted the knowledge.
- The bounty notice said "three days at most" to Merrowdale; it was 2½ hours. The authored Long Man adventure
  was immediately denser: a too-smooth steward, a roped-down cart, a ledger recording sales of bronze teeth
  against a debt, a key on a hook, a foreman who reacts when you untie the tarpaulin. Intrigue rather than props.
- Reload / Continue: resumed exactly ("The Hall yard · Day 3, 11:50 a.m."), but with no recap of what I was doing
  or why.

### Session 3: Elmweald, human mage, "The brothers' errand"

- The priest's reply was charming ("Brother Anselm's hand … I did not know he was still living"). A glossary of
  the old script for 80 coin was the first purchase that sounded like a scholar's goal.
- The route estimate jumped from "2 legs · about 2 hours" to "7 legs · about 16 hours" once the priest told me the
  way.
- The journey left at 8:44 a.m. and arrived at 10:46 p.m., despite "Go in daylight".
- At the ruin: a riddle door (answered), then pitch dark. My mage had **Light** prepared, but the dark room offered
  no way to cast it. It was only in the Pack screen.
- Cast Light, chose "To the pillared hall": **"Osric is dead … You were set upon … It lasted 3 rounds; three
  against one."** Three frogs killed a 5-hit-point mage before he ever got a turn. No warning, no choice. The death
  screen's "Begin again in this country" is a thoughtful touch.

### Session 4: Elmweald again, human bard, "Over the hills"

- "There is work in any country … the place to hear of it is the inn." The inn offered a bed, rations and seven
  rumours. **No work, no performance, nothing a bard does.**
- Hired Ander, "scholar", who loves copying inscriptions, for 3 coin. Mechanically she is a halfling warrior in
  plate with Intelligence 8, Brawn and Intimidation (the cause: a scholar maps to mage, halflings cannot be mages,
  and the code falls back to the first adventuring class, warrior; see the deep dive). Her offer dumped a 30-line stat block into the conversation.
  As a companion she was good: she knew how the Water-Wardens ended, and at ruins she "is looking at the stones for
  letters before you have stopped walking".
- Deserters' toll on the road: "Talk to Sergeant Mawr" → "What do you need?" → nothing. "Talk to the deserters" →
  they "break off talking … to hear what you want" → nothing. **The persuader has no words to say.** Going round
  through the woods worked, but only by accident.
- The fallen walls (where "a stranger who pays in old coin asks the way"): empty. "Search here" cost the rest of
  the morning and found nothing out of the ordinary. Abandoned.

### Session 5: Wǽtfaenn, elf mage, "The brothers' errand" (careful scholar)

- The first roll gave Constitution 3 and Intelligence 4 for a mage. After a reroll the mage had **5 hit points**,
  alone. Nobody at the inn could be hired. *(Correction, [deep dive](deep-dive.md) §4: wrong. I read only the
  minstrel's first four options. Hiring sat at option 4 of 5, "Ask what brings him to Merscstede". Every country
  sampled has a hireable traveller in the starting town. The real problem is that the offer is hidden behind small
  talk.)*
- The route estimate jumped again ("50 minutes" → "about 11 hours"). The lord's toll: 3 of 12 coin, and talking
  went nowhere again.
- The ruin used the same template as Elmweald's, down to *"A fox crosses the way ahead and is gone."*
- Reading the marks on a pillar *was* the copying ("You have copied the old writing at Argentumfons"). It is a
  lovely text ("The last mark is the highest, and has no word"), but the scholar's central act is one click.
- The sluice-wheel: *"Wind the sluice-wheel round · no one can. Needs brawn or a crowbar, and the company has
  neither."* An exemplary blocked affordance: it says what would work and invites a return.
- Going home: "You were set upon on the way." Nothing happened, but the journey stopped. The resumed journey then
  chose "Strike out across Greneforwest" by itself, and I was **lost** in the forest at evening. Out of rations by
  the time I reached town.
- The priest paid 40 coin: *"So that is who they were."* **0 experience; no SEEN THROUGH.** He also warned about
  the sealed cistern at Pluwalac: "Open it, and I will not pray for you, nor heal you, nor sit up with your dead."
  An excellent hook with social stakes.
- That night, **risen dead in the market**. The inn: the brothers "went up to Pluwalac at first light … to bring up
  what is at the bottom." Next morning: *"The shutters of the sick child's house stay drawn, and there are flowers on
  the step."* A child I had never been strongly invited to save had died.

### Session 6: Blackcarr, phone width, keyboard only, "Coming home"

- The brother: *"He is taller by a head than when you went away … holds on to you a moment."* "If you are going, I
  am coming with you. If you are not, I am going anyway." Then a 1,500-pixel stat block on a phone between that line
  and "Ask to join the company".
- **"Make much of" the drover's dog: "Under your hand her coat is stiff with dried black mud … The pad of the off
  forefoot is cut clean across, the way iron cuts."** The best discovery mechanic in the game: a clue found by an
  act of affection.
- On the road: fresh ruts. Mark: *"That is the left wheel. That is his."* (He had told me the left wheel was out of
  true.) No action on the ruts; the generic "Search here" was the key, and nothing signals it.
- *"It is your father. You know the coat first, and the hands, before you will let yourself know the face."*
  Telling the mother: *"'I knew,' she says. 'The dog knew.' Then she goes back to the pot, because there are people
  to feed."* SEEN THROUGH, +100 each.
- Then: **"Nothing more is asked of you."** Day 1, 12:50 p.m. The oxen "dragged off toward the hills" never became a
  thread.

### Repetition across countries

These recur word for word in every country sampled:

- Tansy the cat on a wall-top "with her eyes shut, which does not mean she is not watching" (four countries).
- Someone "roping down a load that has already been roped down twice".
- Someone "walking a strip of barley".
- A messenger "already at the door, the satchel on, eating as he goes".
- A carter "tying the last of his things into bundles for the handcart" (the same line every morning).
- The Merrowdale notice nailed up in every inn.
- "You've come a long way to find somebody. Is it me?"
- The priest's "Brother Anselm's hand".
- Within one barrow, "Coins lie scattered in the dust, green with age, where a purse rotted through" appeared in
  nearly every room, and two identical damp notebooks lay beside two identical dead fires.

A returning player in a new country meets the same village.

---

## C. Gameplay-loop analysis

| Loop | Invitation | Intention | Choice | Execution | Feedback | Reward | Renewal |
|---|---|---|---|---|---|---|---|
| **Inn rumours** | ★ excellent; vivid, specific | ★ easy to form | fair (many, unranked) | fair: destinations appear only once known; map not actionable | good ("YOU KNOW NOW") | knowledge, destinations | ★ |
| **Origin premise** | ★ concrete want, deadline | ★ | weak (one obvious act; debt had a real five-days choice) | trivial (1–3 clicks, or one dungeon) | **broken**: no SEEN THROUGH for debt or errand; feverwort NPC ignores the errand | 0–100 XP; no relationship change | **breaks**: "Nothing more is asked of you" |
| **Ruin / dungeon** | ★ (notebooks, sounds, "warm jar") | ★ | good (parley / sneak / fight; pole vs lore; draw-out-and-wait) | good, but trap props repeat the same three steps | good in fights; weak on traps ("a psychic scream", no effect shown) | **far too much** coin and XP; wonderful objects with no use | good (diggers, "since you were last here", blackbird) |
| **Combat** | telegraphed intents, hit odds | — | real at first (Charge, Cleave, Steel Yourself); collapses to `t` once plate makes foes harmless | good | good | XP | the boss is "easily won" |
| **Talk / persuade** | strong in authored content; empty for generated obstacles (tolls) | — | checks are coin-flips; knowledge-unlocked lines can fail and vanish | ok | dice line shown | none; social wins change nothing visible (robbers stay) | none |
| **Trade / money** | the debt only | — | none after day 1: nothing to buy | — | clear (+18 coin (39 now)) | inflates at once; merchants run dry | none |
| **Scholar** | ★ (old script, glossary, riddles, pillars) | ★ | none: "Read" is one click; lore checks gate options | fine | lovely text | 0 XP, 40 coin | **one good hook** (the sealed cistern) |
| **Family / investigation (Coming home)** | ★★ | ★★ | modest (go with brother, pet the dog) | the decisive step is the generic "Search here" | ★★ | ★★ emotional; 100 XP | **breaks** at the end |
| **Travel** | — | — | the planner chooses; cross-country chosen silently | fast and compressed: good | stops for friendly hobs, false "set upon" | ambient prose (good, repetitive) | — |

**Where the cycle breaks, in order of damage:**

1. **Renewal after resolution.** Every thread that ended left nothing behind. The game has the material for renewal
   (the oxen, the sealed cistern, the diggers, the crown "take it to a town") but does not turn it into an
   unfinished intention.
2. **Reward calibration.** One expedition outweighs every other activity by an order of magnitude, so nothing
   afterwards matters.
3. **Choice in non-combat verbs.** Talk with obstacles is a menu with no content; knowledge is a key that can break
   in the lock; reading is one click.
4. **Feedback on consequential acts.** The debt payment, the crown, the warn-off and the glyph's "psychic scream"
   all happen with no visible lasting effect or record.

---

## D. Interaction and cognitive-burden assessment

**What works**

- Typography, spacing and the book-like hierarchy: danger is first, in red, then people, then ways. Reading is a
  pleasure at both widths.
- The fight screen: one decision at a time, enemy intents shown, hit chance per target, short log lines.
- Blocked actions say why and what would unblock them ("Needs brawn or a crowbar"; "Needs lore: no one in the
  company has it").
- The development screen shows each option's situated consequence ("Opens the gap over the portal stone, to the
  foot of the stair"). This is the single best piece of progression UI in the game.
- "SINCE YOU WERE LAST HERE" makes revisits legible and rewarding.
- Keyboard: Enter and number keys in conversation worked.

**What burdens attention**

1. **Everything is a peer link.** A town square presents about 30 equal-weight underlined links: people (twice:
   name-only buttons and name-with-role buttons), animals, local ways, roads out, set-out destinations, rest,
   search. Destinations already used appear twice ("Tenebrerecs 5 legs", "Tenebrerecs 6 legs"; "Argentumfons"
   twice). Inside a dark barrow passage, the page still lists the march-stone of the Corrow, 12 legs away.
2. **Similar names are hard to tell apart.** "To the ford of the Tatharrant" and "To the ford of the Tatharrant by
   Tussalëa"; "The road through Thyrnebearwas" and "… by Fearnlac". Two Emrics, a salter and a philosopher, in the
   same square.
3. **The verbs a player most needs are in the wrong place.** Light is in the Pack screen, not in the dark room or
   the danger panel. Items do not exist in combat at all, even when the foe is "vulnerable to fire" and the pack
   holds alchemist's fire. The ruts were not interactable; "Search here" (20 minutes, generic) was the key, and so
   searching became a superstition: it found my father, and wasted half a day at the fallen walls.
4. **Companion stat blocks open expanded mid-conversation.** About 30 lines of techniques sit between a brother's
   first words and "Ask to join". It is a disclosure, so it should start closed.
5. **Notes is a chronological ledger, not a plan.** It does not rank, link to destinations, or say what is
   actionable now. Its UNFINISHED list silently drops threads (the philosophers vanished after one failed roll) and
   keeps dead ones (willow bark).
6. **The map shows the shape of the land, not the shape of the player's intentions.** It is not clickable; known
   destinations are faint labels among junction circles; labels overlap ("LILIETUN" drawn over a line).
7. **Journeys compress time well but obscure risk.** The planner silently picked a cross-country leg and got the
   party lost; it travelled past nightfall despite "go in daylight"; it stopped for friendly hobs every time and
   once for a phantom "You were set upon on the way". Its estimates changed fivefold after learning a route.
8. **Text echoes.** Lines were often printed twice or three times (the crown, the toll, the Water-Wardens
   paragraph), and spent traps were described in the next room. Each echo costs reading attention and makes the
   prose feel mechanical.

**On greater POI density and dialogue depth.** The current failure is not too little content per screen but too
little hierarchy. Adding POIs to the present presentation would make towns into catalogues. Density is affordable
only if screens rank and fold: what is happening now, the two or three things relevant to the current intention,
then "everything else here".

---

## E. Incentives and progression assessment

**Money.** It matters for exactly one afternoon. Floor coins in one barrow came to 18 + 23 + 14 + 32 + 35 + 25 +
26 + 70 = 243, against a 50-coin debt, 3-coin beds and 1-coin torches. Grave-goods sell for 40–350 each, and a crown
for 1,500. Merchants hold finite cash (good), but there is no sink: no equipment upgrades, no property, no
training, no hire worth paying, no bribes or tolls big enough to matter. **Scarcity disappears by day 2.**

**Experience.** In data, the origins carry no `experience`; the generated goings-on carry 100–150; situations
200–800; authored adventures 1,000. In play, two bone hounds gave 1,265 and the great hound 1,535. Selling loot
also grants experience equal to its price (a torc = 300). Result: **one dungeon gave about 5,500 XP; every
non-combat resolution I achieved gave 0–100.** The game's own principle ("experience for what you resolve") is
inverted in practice: fights and fencing pay; resolving a family's grief or a scholar's century-old errand does
not.

**Danger and preparation.** For a plate-armoured warrior, ordinary foes cannot hit ("a common foe needs 20"). Fights
become `t` presses, and the barrow's king is "easily won". For a 5-hit-point mage, the first unannounced step can
kill before the player acts. Neither extreme rewards preparation. The one exception (the torch running out) shows
how good preparation pressure feels when it exists: one fair, limited resource, a prior warning, a forced and
meaningful retreat.

**Equipment and consumables.** Interesting objects (the jar of noonlight, alchemist's fire, healing potions, the
bronze mirror, Heather) have no situated use in fights and rarely elsewhere. They are loot to sell.

**Abilities and builds.** The warrior's techniques create a few good decisions (Charge into a stun; Cleave on
swarms). The bard's kit is entirely combat (Inspire, Riposte, Taunt). The mage's out-of-combat magic is hidden in
the pack. Skills raised at level-up are presented beautifully, but the checks they feed are flat coin-flips on the
same small set of verbs.

**Relationships.** People react in authored places (Merrowdale's foreman, the mother). Generated people speak once
and do not remember: Lia never thanks; Emric's "first smile" changes nothing; the robbers I faced down stay
put. Companions are cheap (3 coin), richly characterised in conversation, and mechanically interchangeable.

**Degenerate incentives the game currently teaches.**

- Loot everything and sell it ("don't touch nothing" has no teeth).
- Ignore social checks once you are armoured: fighting is cheaper than talking, and talking is often empty.
- Press `t`.
- Hit "Search here" everywhere: it is the generic key to hidden content.

---

## F. Prioritised intervention portfolio

Each item: problem → evidence → why it matters → likely cause → bounded change → how to tell → owner.

### Quick, high-leverage repairs

**1. Close every thread with a successor (renewal).**

- *Problem:* resolutions end in "Nothing more is asked of you".
- *Evidence:* Sessions 1, 2, 5 and 6, each by day 1–2.
- *Why it matters:* this is the moment players decide whether to keep playing.
- *Cause:* resolutions are authored as endings; the follow-on material already exists in their own text (the oxen,
  the sealed cistern, the crown "take it to a town", the diggers) but is never asserted as an intention.
- *Change:* give every origin and going-on one `then` clause that installs a named next intention (with a known
  destination) at resolution. Replace "Nothing more is asked of you" with up to three ranked "You might next…"
  lines in Notes and on the page where the thread closed.
- *Test:* in cold play, does the player state a next goal within a minute of a resolution?
- *Owner:* adventure authors (content); the M17 builder (Notes and SEEN THROUGH presentation).

**2. Re-weight the reward economy.**

- *Problem:* one dungeon pays about 5,500 XP and about 1,400 coin; errands pay 0–100.
- *Evidence:* Session 2's numbers above; Session 5's errand gave 0 XP.
- *Why it matters:* it removes scarcity and teaches combat-and-loot as the only advancement.
- *Cause:* Orsino creature XP and Orsino item prices used unscaled against a village economy; experience on sale;
  no experience on origins.
- *Change (data first):* (a) give origins 200–300 XP and a SEEN THROUGH; (b) divide grave-goods prices and
  floor-coin piles by roughly 5–10, and cap a village buyer's purse; (c) halve creature XP, or let a resolved
  module carry the larger share; (d) withhold sale-XP until the goods are sold in a *town*, which turns the crown
  into a journey.
- *Test:* after the first ruin, does the player still need something they cannot afford? Track coin and XP at the
  end of day 2 across 10 seeds.
- *Owner:* the M17 builder (tuning hooks), with a design experiment to set the numbers.

**3. Make earned knowledge pay.**

- *Problem:* knowledge unlocks an option that then fails on a d20 and disappears.
- *Evidence:* the philosophers in Session 2.
- *Why it matters:* it punishes the most distinctive non-combat activity, reading the world.
- *Cause:* knowledge is treated as a gate to a check, not as the resolution.
- *Change:* a knowledge-unlocked line succeeds, or rolls with a large bonus, and never vanishes on failure (allow
  one retry after a rest or with a second fact). Record a won dispute as a SEEN THROUGH with a visible consequence
  (the crowd, or the losing philosopher, changes).
- *Test:* the proportion of players who return to an NPC after learning something.
- *Owner:* the M17 builder (rule); authors (consequences).

**4. Put the needed verb where the need is.**

- *Problem:* Light lives in the Pack screen; items cannot be used in combat; clues are hidden behind generic Search.
- *Evidence:* Sessions 2, 3, 5 and 6.
- *Why it matters:* players fail at things they planned for, and learn superstitions instead.
- *Cause:* presentation groups actions by owner (the pack, the company) rather than by situation.
- *Change:* (a) in darkness, offer "Light: [spell / torch / lantern]" in the place's own action list; (b) add an
  "Items" row to the fight screen for consumables, where the engine allows; (c) when a place's perceptions mention
  a clue noun (ruts, marks, a stair), make it a "To look at" item whose action is the search, instead of the
  generic Search.
- *Test:* time from "pitch dark" to light; whether players use carried consumables at all.
- *Owner:* the M17 builder for (a) and (c); a combat change for (b).

**5. Fold the action surface.**

- *Problem:* about 30 peer links, duplicate entries, irrelevant far destinations, expanded stat blocks.
- *Evidence:* screenshots of the town squares and Mark's conversation.
- *Why it matters:* attention is spent operating the page instead of playing.
- *Change:* show one button per person; de-duplicate destinations by name; hide SET OUT FOR inside a site
  (offer only "Out" and "Home"); start companion stat blocks collapsed; drop "been" ways under a fold; never print a
  line twice in one leaf; don't describe spent traps in other rooms.
- *Test:* count interactive elements per screen (target: under 15 in a town square, under 8 in a dungeon room);
  measure clicks per meaningful act.
- *Owner:* the M17 builder.

### Deeper structural work

**6. Make danger honest and fragile builds survivable.**

- *Problem:* a 5-HP mage dies before acting; plate makes ordinary foes harmless; the boss is "easily won".
- *Cause:* Orsino armour classes at level 1, solo starts, unannounced assaults.
- *Change:* (a) assaults on entering a room give the company the first turn, or a "you hear…" warning one step
  ahead (the deep-sounds mechanism already exists); (b) every origin that sends a non-warrior to a ruin offers a
  companion at the start (the brother in Coming home is the model); (c) start warriors in mail rather than plate;
  (d) scale the named guardian of a site so it is never "easily won" for the expected company.
- *Test:* across 20 seeded mage and warrior starts, deaths before the first player choice (target 0), and the
  share of fights resolved by `t`.
- *Owner:* a design experiment, then the builder.

**7. Give non-combat ambitions one real loop each (start with two).**

- *Problem:* bard, persuader and trader verbs are missing; generated tolls have empty talk.
- *Change:* (a) **Perform at an inn**: a bard check that pays a little coin, attracts one rumour or companion, and
  improves the room's disposition; repeatable once per town per week. (b) **Talk down a toll**: a persuasion,
  intimidation or bribe line with authored outcomes (pass free, pay half, or become known to the deserters). Both
  are small Kyr kits.
- *Test:* does a bard player choose to stay in towns for a session, and does it feel like progress?
- *Owner:* adventure authors (kits); the builder only if new verbs are needed.

**8. Reduce template sameness across seeds.**

- *Problem:* the same cat, carter, barley-walker, priest line, dungeon door and fox appear in every country, and one
  prop sentence repeats room after room.
- *Change:* key ambient lines to the country seed with variants; limit each prop text to one use per site; give
  each generated ruin one unique object that only it has.
- *Owner:* the independent literary editor and authors.

---

## G. Proposed play experiments

1. **The 30-minute cold session.** Five fresh players, no briefing, five seeds. Log, every minute, whether they can
   say what they want next. Hypothesis: a clear intention exists for over 80% of minutes 0–15 and under 40% after
   the first resolution. Then rerun with intervention 1.
2. **Economy squeeze.** The same seed and route as Session 2 with loot values ÷8 and no sale-XP. Hypothesis: the
   debt then takes the barrow plus one more expedition, day-2 shopping matters, and the player still wants the
   bounty.
3. **Knowledge pays.** Make knowledge-unlocked lines auto-succeed in one country and compare how often testers
   return to NPCs with new facts versus a control.
4. **Fragile start audit.** Replay 20 seeds × {mage, warrior} through each origin's first ruin with ordinary
   choices. Count deaths before the first player decision, fights auto-resolved, and "easily won" climaxes.
5. **Attention budget.** Instrument clicks, scrolls and menu opens per meaningful act (an act that changes the world
   or knowledge) over a session; compare before and after intervention 5. Target under 3 interface operations per
   meaningful act outside travel.
6. **Renewal A/B.** For the "Coming home" ending, offer "the thing that dragged the oxen to the hills" as a named,
   placed intention. Measure whether players continue for another 15 minutes.

---

## H. Candid assessment of enjoyable play

**What makes someone want to continue now:**

- The inn rumours: a drifting mountain on a chain is a reason to play.
- The first-person discoveries: the dog's mud, the brother's wheel, the notebooks that walk ahead of you.
- A world that moves on its own: diggers at first light, a blackbird on a robbed mound, flowers on a dead child's
  step.
- Clean, readable fights with one or two real decisions.
- The development page that shows exactly which door a new skill opens.

**What makes them stop:**

- The goal disappears: errands finish in minutes and the game says nothing is asked.
- The reward breaks the world: after one ruin, coin and levels stop meaning anything.
- Non-warriors find little to do and can die without a turn.
- The page asks them to scan 30 links, remember which of two "Argentumfons" to press, and dig spells out of a pack.
- The same village reappears in every new country.

**What would most likely make an ordinary thirty-minute session worthwhile:**

An origin that resolves around minute 20 into a *second, sharper want*, created by what the player just did
(found the father → hunt what took the oxen; paid the debt → Emric tips you to a richer buyer in town, so the crown
is worth a journey). Add an economy in which the first ruin pays enough to buy *one* meaningful thing and not
everything, and a screen that shows the two or three actions that serve that want.

Kyrie already contains the scenes that make such a session moving. Session 6 is proof. The shortest path from an
impressive world to a game people choose to inhabit is not more systems: it is to **chain each resolution into the
next intention, put scarcity back, and let knowledge and kindness pay as reliably as an axe.**

### Protect these strengths, don't homogenise them

- Clues found through warmth ("Make much of" an animal) and through companions who recognise things (Mark and the
  wheel). Extend this pattern; do not replace it with quest markers.
- Blocked affordances that name what would work. Keep this phrasing everywhere.
- "SINCE YOU WERE LAST HERE": make every return produce at least one line.
- Off-screen consequences (the dead child). Keep them, but surface them earlier as invitations ("The child at the
  shuttered house is worse today"), so the loss is something the player chose not to prevent.
- Restrained endings ("then she goes back to the pot, because there are people to feed"). Do not replace them with
  reward fanfare; put the renewal beside them, not instead of them.

---

Screenshots: [a town square's action surface](town-square-actions.png) ·
[a companion's offer at phone width](companion-stat-block-phone.png) · [the fight screen](fight-screen.png).
