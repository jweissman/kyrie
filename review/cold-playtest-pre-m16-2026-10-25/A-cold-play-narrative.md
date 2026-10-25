# A. Cold-play narrative — Kyr, before Mission 16

**Sealed before any reading of source, docs, the design atlas, or previous reports.**
Commit played: `2684952bb587b73e1240fa6714a547aad14b2978` (branch `claude/inspiring-pascal-18tohw`; note `origin/main` is `422a4c8`, which has diverged from this branch rather than being an ancestor of it).
Environment: Linux cloud container; Bun 1.4.4; `bun run scripts/build-web.ts --serve` → `http://localhost:8080/`; headless Chromium (Playwright), 1280×900, plus one 390×844 phone check. I played by clicking visible controls through a small driver (`evidence/harness/`). Every action I took is one a mouse user could take. I used no debug state and no URLs beyond the root.
Setup caveat: the private dependencies `deem@967deac` and `languages@30d36c6` would not install through `bun install` (GitHub tarball 403). I cloned them anonymously and linked them with `file:` in a scratch copy of the repo. The working tree I played from was untouched.
World seed (from the save file): `zadiweno`. Country: Silverfells.

The full action-by-action record is `evidence/contemporaneous-play-record.md`. Screenshot names below refer to `evidence/screens/`.

---

## Before touching anything

The landing page (`001-landing`) is a large black **Kyr** on cream, with the line *"A country that was there before you, people who live in it, and the road out of town."* Below it are one big **Begin** and three small links: Open a save file, Options, The handbooks. There's no art, no genre label, and no "RPG". It looks like a literary object. I guessed it was a text-and-picture fantasy game, but couldn't tell whether to expect a text adventure, a tactics game, or a story generator.

The character page (`002-begin`) answered some of that. *"Who comes to Silverfells?"* Name, people (Human/Elf/Dwarf), calling (Warrior, Mage, Thief, Cleric, Bard, Ranger, Monk, with restrictions such as "not for a dwarf"), and four reasons for coming:

- the brothers' errand: deliver a letter, then copy old writing at Argentumport;
- a debt of fifty coin to Orsik;
- feverwort for a sick child at Gibagabar;
- simply coming over the hills for work.

*"Whoever goes with you, you will meet on the way."* No statistics are shown. The only explanation of a calling is one sentence (Mage: *"Few hit points and no armour, but prepared spells that can turn a fight."*).

**My pre-action answers.**
- **What kind of game is this?** A location-by-location fantasy RPG told in prose, with a party.
- **Who am I?** Ilse, an elf mage and a scribe of an unnamed order.
- **What am I trying to do?** Deliver the letter, then copy the writing.
- **Where am I?** Peahkom, Silverfells.
- **What can I do?** Whatever the buttons say.
- **What will happen when I act?** I didn't know. I expected clicking a person to open a conversation.

## Journey 1 — Ilse, elf mage, *the brothers' errand*

**The shrine (`005-go`).** The first scene is good. The heading reads *Silverfells · Morning · Sunny · 9 Midsummer*. Under it is a mural of the God of Death that *"the dead are carried past… and a coin is left for each."* The letter is *"inside your coat."* The priest, Kildrak, stands there with an Old-Master portrait. I inspected the mural, and Examine said *"Nothing comes of it."* The clock didn't move, so inspection felt safe. Clicking Kildrak opened a full-screen conversation (`010-kildrak`): *"Kildrak takes in the road on your boots, and that you have come straight to her."* She noticed what I had done, and I was charmed.

She offered a menu: ask about *"the silk from the sink at a pit in the ground"* (an obviously assembled phrase), ask about the sick child, give the letter. The silk turned out to belong to Odile, *"frightened for her spiders"*. That's delightful. Giving the letter (`013-letter`) was the best moment of the opening: *"Brother Anselm's hand… I did not know he was still living."* She gave directions to Argentumport and a warning: *"People go out there and come back with their sheep missing. Go in daylight."* A green *YOU KNOW NOW* note recorded the route. I had a destination, a danger and a time-of-day rule, and I was hooked.

Each topic vanished after I asked it, so I could never follow up ("where is the pit?").

**Preparing.** Notes was tidy and useful. It had *Unfinished*, *Heard, not yet seen* (with who told me and when) and *Known before you set out*. It also told me the child needed *"willow bark from where willows grow by water,"* which nobody had said. The map (`016-map`) was clean: Peahkom, a dashed track to *tarn* and *Argentumport*, and etymologies (*Argentumport*, Aenean for "silver gate").

The Pack (`017-pack`) held a staff, clothing and a spellbook, 12 coin and 2 rations. There was no light source, no ink and no paper, though I had come to copy something. I found **no character sheet at all**: no HP, no level, no attributes. The spellbook's only action was "Set down here". Preparing spells offered Acid Arrow, Hex and Light with no visible descriptions. Descriptions exist only as hover tooltips, and one of them leaked *"13 + level + bonusSpellDC"*. I swapped my unknown "Drench" for Acid Arrow and was told afterwards that it cost an hour.

**The market (`025-market`)** is the visual high point. There are five portrait cards with small idle actions (*"roping down a load that has already been roped down twice, to be sure"*), a cat that *"comes to wind once round your ankles,"* and thirteen exits arranged around the edges of the card. Two different exits are both called **"The road through Ebarukaetz"** (1h 40m and 2h 10m).

Conversations here are one or two lines per topic, often with a real voice:
- Hulda: *"Whatever it is, the answer's probably no. Go on."*
- Vistra: *"Get it wrong and the bell rings flat. Everyone knows whose fault it is."*

But Flint's "news" and Kestra's "news" are **word-for-word identical**: *"'Khesefdûm? I was only passing through… The captain's been looking at the road a great deal'"*. That answers a question I never asked, about a captain I'd never heard of.

The prior of the brothers of Stāncepan gave the hook that defined both journeys. Profundusmons is where *"the Delvers went down after the star-iron until their last gallery broke into the heart of the vein, and what lived in it"*. The bounty is 1000 coin: *"If no one will go, the brothers will go themselves."* I asked for something to go down with, got 10 coin, and saw the bounty fall to 990. That was a small, honest piece of bookkeeping. The ledger line *"Buys the heart of the vein (1000)."* sat inside the dialogue like a price tag.

**The taproom** is *"crowded and loud"*, but only two people in it can be spoken to. Fargrim the innkeeper is a rumour board:
- ewes taken by something near a pit in the ground (possibly linked to Odile's silk?);
- two "trouble at a cave" rumours whose text is identical apart from the region name;
- philosophers "on the green" who turn out to be "at the bailey."

Isla, a drover, offered to join for *"3 coin, and my keep."* Nothing told me what she could do. After I hired her a **Company** tab appeared, and only then did I see any character sheet (`061-company`). Ilse had **5 HP and Strength 1**. Isla had 17 HP, Str 18 and Con 20, and carried plate mail, a battleaxe, a torch and a ten-foot pole. That's a lot of kit for someone who came back *"with nothing but blisters and the price of a bed."* Isla also had a godparent in Gibagabar and *"I write when I can. I cannot, much."* For a moment she was a person.

**The road and the tarn.** The travel lines matched the clock (*"in the full of the morning"*). The tarn (*"so dark it looks bottomless… The wind falls silent here."*) is a hub: Argentumport, Profundusmons and the newly rumoured Marmorsarc are each one hour away. Every dungeon I'd heard about was reached by the identical sentence of directions.

**Argentumport (`080-argent`).** An adit with a lintel in the old script, and a stone door with a riddle: *"Sometimes narrow, sometimes wide, wind or rain, I stay outside"* (Creek/Tundra/Path/Mountain). Isla spoke unprompted, the first companion remark: *"you will want to be away from it before dark."* I read the lintel. Reading worked, but the riddle's translation had already been given, so my scribe's skill was irrelevant. I listened at the "speaking door" and was told *"Nothing comes of it."* I pressed *Path*: *"Something deep in the door turns over, like a sleeper."* Lovely.

Inside, the gallery was pitch dark and the game said so plainly. My prepared Light spell wasn't offered in the scene, only Isla's torch. I found Light in the Pack and cast it on Isla, after which the status line still said **"Nothing lit."** I found a crowbar, which was what Flint wanted. At the lift-head the chains were rusted fast. "Pry at it with the bar" produced *"You get the bar into the iron lift-cage… Nothing comes of it,"* though the cage was at the bottom of the shaft. The explicit "break the rust off the wheel" then simply worked. Nobody was named as doing it and no roll was shown. A side gallery was blocked by a rock fall with the best feedback in the game: ***"Needs digging or a shovel, and the company has neither."***

The dressing-hall tally was the best writing I met: *"A tally of star-iron, cart by cart, for a hundred years; then a gap; then, cut deep and crooked: **WE HAVE SHUT IT IN. DO NOT LET IT OUT.**"*

At the end of the last gallery stood an iron door barred **on this side**, with breath-cold air. Its inscription read like a database row: *"The way to a great pit in the fellside with a wheel over it: to the foot of Zhargeithrehes by Peahkom… How the Delvers ended: …"* It ended in a deduction (*"If it is right, it was Zhargeithrehes"*) naming the region I was already standing in. Listening, looking and prying at the bars all said *"Nothing comes of it."*

I lifted the bars. Curiosity is the point of the genre. *"The iron door swings open of its own weight, and the cold comes out of the dark behind it, and has a shape."* (`128-lift`). The rating said **A HARD FIGHT**, and the creature waited for me. I attacked.

**The fight (`129-attack` → `133-r5`).** The screen went dark and the presentation turned clear. Each side's health is shown, enemy intent is announced (*"Means to use slam on Isla"*), and resistances and vulnerabilities are listed. Before I had made a single choice, *"The cold below's slam catches Ilse, for 5. Ilse falls."* My protagonist was out. Isla prepared a charge and landed it for 30 against the elemental's bludgeoning weakness. That was a thrilling turn. Then she took two slams, went to 1 HP and started bleeding. She missed (*"Isla is not infected"*, said the log, apropos of nothing), I chose Strike again, and the game cut to the end screen without showing that swing.

> **No one is left standing.** Isla fell at the end of the last gallery, afternoon of the first day. You were set upon as you went to attack the cold below… It lasted 5 rounds; one against one. The country goes on without you.

The epitaph is about Isla. It doesn't mention Ilse, the character I created. It says "one against one" when two of us fought, and "set upon" when I had opened the door myself. My first adventure ended about seven hours into game time, and my mage never acted in combat.

## Journey 2 — Bruni, dwarf warrior, *What is owed*

"Begin again in this country" started a fresh character in the same world, and the clock was back at **morning, 9 Midsummer**. Isla was alive in the taproom again. Nothing of the first expedition persisted, so "the country goes on without you" is atmosphere rather than mechanism.

Bruni opens at Orsik's forge with a clear goal: fifty coin by market day, ten days away (`136-go2`). Orsik (*"looks at your hands before your face, to see whether there is anything in them"*) sells the shovel, crowbar and lantern my first party lacked. He also *buys* star-iron, a jeweled crown and bronze bearings. The economic loop became visible: go down, bring things up, sell. He offered five more days for five more coin as an explicit choice. His questions also produced a new destination, Murkweard, the first not reached from the tarn.

Bruni the **warrior** had **Str 7** and Int 16 / Wis 18 / Cha 16, contradicting the calling and the dwarves' "Brawn". Nobody offered me a choice of attributes. The taproom had two new people, Gunnvor the pilgrim (*"I promised. I didn't say how many."*) and Adrik the drover, but neither would join. Adrik's greeting was Isla's, word for word. I bought a shovel, rehired Isla, took the prior's 10 coin and set out.

**Profundusmons (`178-prof`)** has strong foreboding: *"The heather stops a long stride short of the adit mouth all round, as though it had been burned back… Nothing nests in the spoil."* Isla repeated her Argentumport warning verbatim. "The bats" at the mouth were rated **A HARD FIGHT**, but the prose never mentions bats, and I simply walked past them. The torch read *"50 minutes left"*: light as a clock, which is good tension.

A stone casket bore a riddle, *"I always was, yet never will be,"* with options Tomorrow/Glory/Time/Mercy. None fits. I guessed Tomorrow and was right, so the riddle text is the reverse of its own answer. It held a smoky quartz.

At the crossing two "ferocious cave spiders" sprang out. Target buttons showed hit odds and enemy HP. In one round Bruni went **from 16 to 1 HP**, from three bites by two spiders. The log read *"Bruni is bleeding… Bruni is not bleeding… Bruni turns the worst of it aside. Bruni returns with 1 HP."* I fled. Retreat worked (*"Your company withdraws"*), though the next scene announced *"The ferocious cave spiders come at you!"* and then nothing happened. I walked home past the bats, with the torch still burning in daylight.

Kildrak greeted my dying dwarf with *"'Well now,' … brightening at the sight of a new face."* Full healing cost 2 coin and an hour. A new topic gave the best threat in the game: *"Open [the stair], and I will not pray for you, nor heal you, nor sit up with your dead."*

I slept at the inn and woke to this: ***"The talk is all of the brothers, who went up to Profundusmons at first light: four of them, with lanterns and a bell, singing, to bring up what is at the bottom and bury it."*** The prior's threat had been a real clock, and I had dawdled. This was the strongest moment of dramatic momentum in either journey, and I went straight back.

At Profundusmons there was no sign of four singing brothers: no lantern, no bell, no footprints, no bodies. That stayed true for the rest of my play. The bats were now rated **EASILY WON** (four bats, 1 HP each; *Isla chuckles: "That was fun!"*). The casket was still open. The spiders were back at full health. This time Isla **taunted** one spider, the bites went to her plate, and we won. It was the first fight that felt like a tactical decision rather than a dice roll. Afterward Isla was "infected", which the log reported as the result of her own missed swing.

The crossing was richly drawn. Chalk marks showed a star toward the shaft and an open hand toward the stopes, and the carving was *"thickest where the way is narrowest"*: a hidden switch on the route up. "Prod it with the pole" did nothing. After "Look closely", a different option appeared, *"push the switch in with the pole's end, standing clear,"* and it worked. *"Rocks fall from above."*

The torch guttered at the head of the winze. Isla lit the last one: *"Something in the foot of the winze moves as weather moves, and stops when you stop; the air that comes out of it is wrong."* Beside the spring stood **the goblins**: a bare label in a box, with no description, no rating and no attack prompt. Clicked, they *"draw back to the edge of your light and watch you… Nobody speaks first."* I asked them to let me by and failed (*d20 7 + charisma 3 = 10 against 13*, clearly shown). Warn off disappeared too. Then I picked up 16 coin and a bronze tally-board from the same room while they watched. The tally-board's look-panel said ***"You carry out the action."***

I saved, then took the ladders down. *"The mud comes at you without a sound"*: a mud elemental that resists bludgeoning and is vulnerable to lightning and cold. My run-1 mage could have exploited that if she had survived. Bruni fell in round two. With my protagonist down I chose **Flee**. The next screen was the end: *"Isla fell at the foot of the winze… **Bleed** struck the last blow, for 1. It lasted 4 rounds; one against one."* Again the protagonist was missing from the epitaph and the count was wrong.

## Coda — loading a save, going home, paying the debt

Opening the save from the title restored the spring scene exactly. I walked home without event and went to Orsik. A bronze tally-board picked up off the floor sold for **45**, and the quartz for 15. "Pay what you owe" appeared once I could afford it: *"'We're square.' For the first time, a smile. 'I didn't think you would.'"* It was a genuinely satisfying beat. It was also a ten-day debt cleared on **day two** by selling one floor item.

The prior had nothing to say about his four brothers, who were somewhere underground (*"'You,' says the prior, neither pleased nor otherwise."*). I slept four times and no news ever came. Kildrak had grown a set of social options about the stair (argue, read her, bluff, insist, promise). Watching her failed on another **d20 7**. Promising earned the best clue I found: *"what the Delvers walled in below their mine cannot bear the light of noon; their paymaster kept noon in a jar."* That suggests the right way through Profundusmons is not a battleaxe. Had I kept playing, that is what I would have gone looking for.

I stopped there, at 12 Midsummer, debt paid, with the noon-in-a-jar clue in hand. That was about 300 interactions across two journeys and a reload. Two last checks: at phone width the layout reflows cleanly. After a reload, the **Story** log starts only at the load point, and before and after a reload it is mostly *"You carry out the action."* (seven times in one short stretch).

## What the experience *is*, in one paragraph

Kyr is a beautifully presented, prose-first fantasy RPG whose towns, rumours and dungeon dressing repeatedly produce real curiosity and occasionally real dread. In about two hours I found three dungeons, two riddles, a moral tension (the smith wants the relic sold, the prior wants it buried, the priest threatens to withhold the rites), a world clock that moved without me, and a debt I could resolve. What I could not do was finish a dungeon. Both expeditions ended in sudden, under-explained party wipes on day one or two, at the first or second real fight. The character I made either had no turns or none that mattered. The game repeatedly invites interactions (listening at a sealed door, asking after a missing party, inspecting a monster, reading a scribe's prize text) that it answers with *"Nothing comes of it."* The world is more interesting than what I could do in it.
