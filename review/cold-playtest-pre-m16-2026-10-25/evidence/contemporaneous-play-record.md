# Contemporaneous play record — Kyr cold playtest
Commit: 2684952bb587b73e1240fa6714a547aad14b2978 (branch claude/inspiring-pascal-18tohw; origin/main is 422a4c8, diverged)
Env: Linux container, Bun 1.4.4, `scripts/build-web.ts --serve` -> http://localhost:8080/, headless Chromium (Playwright) 1280x900.
Setup note: private deps deem@967deac / languages@30d36c6 fetched via anonymous git clone, linked via file: in a scratch copy (repo untouched).

## 001 Landing
Title "Kyr" (repo is "kyrie"). Tagline: "A country that was there before you, people who live in it, and the road out of town."
One big action "Begin — Somewhere you have never been, as someone with a reason to be there." + Open a save file / Options / The handbooks.
Impression: literary, minimalist, Swiss-poster typography. No genre signals (no art, no "RPG"). Feels like an interactive fiction/sandbox. I don't know yet if it's text adventure or tactics.
Q: what kind of game? Text-driven fantasy RPG probably. Who am I? Not yet known. Goal? "someone with a reason to be there".

## 002 Begin -> character screen "Who comes to Silverfells?"
Default: name Wenna, Dwarf, Warrior. Peoples Human/Elf/Dwarf. Callings: Warrior, Mage, Thief, Cleric, Bard, Ranger, Monk; dwarf can only be warrior/cleric (marked "(not for a dwarf)").
Four reasons: brothers' errand (letter to priest at Peahkom + copy old writing at Argentumport), What is owed (50 coin to Orsik), Feverwort (deliver to Gibagabar for sick child, don't dawdle), Over the hills (drifter).
"The brothers' errand makes you a scribe, who knows lore." -> background derived from reason. "Another country" button = reroll world?
Note: "You come into it alone ... whoever goes with you, you will meet on the way" -> party recruited in play. Good hook.
Mild oddity: default dwarf warrior + default reason makes them a scribe of an order. Fine actually.

## 005 First scene — The shrine of Gwyn ap Nudd (Elf Mage "Ilse", brothers' errand). 9 Midsummer, morning, sunny.
Header: SILVERFELLS · MORNING · SUNNY · 9 MIDSUMMER. Subtitle "The brothers' errand" (quest tag).
Prose good: mural, the dead carried past, coin left for each, set up after "the fire in Ghâshgerebchursha" (unpronounceable generated name jars against otherwise Welsh/English register).
Letter in coat: to priest at Peahkom, asking Ilse be given a bed and shown the way to Argentumport.
Kildrak, priest of Gwyn ap Nudd, shown with an Old-Master painting portrait. "TO LOOK AT: The mural". Exit arrow at right edge: → The market-place of Peahkom.
Footer: "Ilse · unhurt · 12 coin" / Wait › / Search here / Ilse: prepare spells › / Map Notes Pack Story.
PRE-ACTION ANSWERS:
- Kind of game: literary text-and-picture fantasy RPG, location-card based (one "page" per place).
- Who: Ilse, elf mage, a scribe from an order over the hills.
- Goal: deliver letter to priest (who is right here), get bed, find way to Argentumport, copy old writing.
- Where: shrine in Peahkom, Silverfells.
- Can do: look at mural, go to market, wait, search, prepare spells, map/notes/pack/story. Presumably click Kildrak to talk.
- Expectation: clicking Kildrak opens a conversation where I can hand over letter.
Observation: there is no visible "give letter" action; the letter is narrated but the affordance is unclear.

## 007-010 Inspection & first conversation
- Clicked mural: "LOOKING AT" panel repeats the place paragraph verbatim. Options: "WORK IT: Leave an offering, and ask the god's favour for Ilse · 4 coin"; "Examine — Look closely".
- Examine -> "You look closely at the mural of Gwyn ap Nudd. Nothing comes of it." Time did not visibly advance (still MORNING). Safe. Mild letdown: the scribe-who-reads-old-script gets nothing from a mural (fine) but the flat "Nothing comes of it" is deflating.
- Clicked Kildrak: full-screen conversation, Old-Master portrait (caption "Painter unrecorded"), italic opener "Kildrak takes in the road on your boots, and that you have come straight to her, and waits to hear what you have brought." — good, responsive to my having come straight here.
- Menu: Glossary of the old script · 80 coin · 1 left (greyed, I have 12) / 1 Ask for shrine's care for the wounded · 2 coin · 1h / 2 Ask about the silk from the sink at a pit in the ground / 3 Ask about the sick child at Gibagabar / 4 Give the brothers' letter / 5 Take your leave.
- Content note: "the silk from the sink at a pit in the ground" is clearly generated phrasing.
- Ask silk -> "'Odile, who winds silk at the sink by a pit in the ground, has had none for a week, and is frightened for her spiders,' says Kildrak." Charming. Topic then disappears from menu: no follow-up possible ("where is the pit?").
- Ask sick child -> "A child at the strand at Gibagabar has a fever that will not break, and the herbs have run out." (cross-links the Feverwort backstory — nice world coherence)
- Give letter -> strong: "Brother Anselm's hand ... I did not know he was still living." Bed offered. Argentumport "out in Zhargeithrehes"; "People go out there and come back with their sheep missing. Go in daylight." YOU KNOW NOW: The way to Argentumport: to the foot of Zhargeithrehes by Peahkom, and on to the tarn, where the track to it starts.
- New options: Take the bed in the back · 8h. Shrine's care for wounded 2 coin 1h.
Feeling: hooked. A destination, a warning, a time-of-day instruction.

## 014-020 Preparation screens
- Notes: UNFINISHED (child at Gibagabar needs herbs "or willow bark from where willows grow by water" — NOBODY SAID WILLOW BARK; notes know more than conversation); brothers want writing copied. HEARD, NOT YET SEEN with attribution + time ("Kildrak ... told you, Day 1, 8:10 a.m."). KNOWN BEFORE YOU SET OUT: "Argentumport: a timbered adit in Zhargeithrehes". Also "Download a save file / Back to the title". Notes is strong.
- Map: clean grid, Peahkom centre, tarn + Argentumport SE on dashed track, "a pit in the ground" W in Marirkatzeh. Etymologies: Peahkom Khuzdul "tin stead"; Argentumport Aenean "silver gate". Local strip diagram "HERE": shrine — market-place. Gibagabar NOT on map though in a quest.
- Pack: staff (weapon in use), clothing, spellbook; "TEND THE COMPANY: Ilse: Light on Ilse / Ilse: Prepare spells"; 12 coin · 2 rations. No lamp/torch, no rope, no ink/paper for a copying errand. No character sheet (HP, level, stats) anywhere visible.
- Spellbook item: only "Set down here". Cannot read it.
- Story log: DEGRADED. "TALK TO KILDRAK — You carry out the action." / "Kildrak tells you what they have heard about the silk..." (actual quote lost; "they" though prose said "her"). Only the letter scene kept its prose. "YOU TAKE YOUR LEAVE OF KILDRAK. You carry out the action."
Prep: Prepare spells -> "In place of Drench/Light (first-level slot)"; choices Acid Arrow/Hex/Light with NO visible description (hover tooltips only; tooltip leaks "bonusSpellDC"). Chose Acid Arrow -> "Ilse spends an hour over Acid Arrow." Time cost not disclosed beforehand.

## 025 Market-place of Peahkom (still morning)
Rich scene: faded awnings; "A man is crying the price of something nobody wants, very cheerfully, as if that were the point." Soot the cat winds round ankles (ambient). NPCs with Old-Master portraits + idle vignettes: Kestra carter (roping a load already roped twice), Vistra smelter (Gardain's wife), Hulda herb-wife, Flint tinker (Dagny's partner), The prior (brothers of Stāncepan). Pets: Storm the inn's dog, Soot the Dankils' cat ("Make much of").
Exits (13!): taproom of the Silent Flame, bakehouse, shrine, wright's yard, edge of Ebarukaetz 40m, foot of Zhargeithrehes 1h20m, road through Ebarukaetz 1h40m, armoury, ironmongery, Orsik's forge, mine-head, road through Ebarukaetz 2h10m.
CONFUSION: two exits with the same name "The road through Ebarukaetz" (different times, opposite sides). Which is which?
Visual: the arrangement of exits around the card edges is elegant on desktop.

## 026-045 Market conversations
- The prior (brothers of Stāncepan): "The prior does not stop working. 'Say it, then.'" Mechanical line "Buys the heart of the vein (1000)." shown in dialogue. Ask old workings -> strong lore: brothers kept the place, "could not keep what was in it down"; "What the makers died for should not be sold in a market or carried before a lord"; 1000 coin; "If no one will go, the brothers will go themselves." (implied clock!). YOU KNOW NOW x4: Profundusmons is a timbered adit in Zhargeithrehes; same route (foot of Zhargeithrehes -> tarn -> track); The Delvers broke into the heart of the vein "and what lived in it"; prior will pay.
  - "Ask for something to go down with" -> +10 coin "For light. It comes off what the house can give you after." Bounty shows 990. Good systemic consequence.
  - Is the prior's order the same as mine? Unclear. My order is "over the hills". No acknowledgement either way.
- Flint (tinker): "Lost? People usually are, when they come over to me." News: "'Khesefdûm? I was only passing through,' says Flint. 'Well. The captain's been looking at the road a great deal, which nobody likes.'" -> non sequitur (I never said Khesefdûm), no idea who the captain is. Work: good voice. Matter: needs a crowbar, "no time to go for one" (while idling) — fetch quest.
- Hulda (herb-wife): great voice. Offers "Ask where willow grows" — topic exists only because Notes pre-knew about willow bark. Willows on road through Ebarukaetz and top of the Zavimavor. Does NOT mention the sick child or sell herbs.
- Kestra (carter): News = VERBATIM SAME as Flint's (Khesefdûm/captain). Template repetition. Work line witty.
- Vistra (smelter): "Tin and copper, nine to one ... the bell rings flat. Everyone knows whose fault it is." Good. Plausibility: pumping a smelting bellows in the market-place.
- All conversations are 1-2 lines per topic, topics vanish after asked. Characters have voice in single lines but no depth/relationship.

## 047-062 Taproom of the Silent Flame; recruiting
- "crowded and loud. Miners at the long table" — but only Fargrim (innkeeper) and Isla (drover) interactable.
- Fargrim: rations 2c, bed+supper 3c 8h; rumours: ewes taken near a pit in the ground (Garth means to burn it out) — possibly links to Odile's silk/spiders; two caves (Ghâshgerebchursha, Kotzchursha) with IDENTICAL template text; philosophers "on the green" at Khesefdûm -> answer says "at the bailey" (label/answer mismatch).
- My driver mis-click bought a ration (my error). The game then shows "Buy a ration · 2 coin · asked" — 'asked' tag on a purchase is odd.
- Isla: brightens at a new face. "Took a drove over the hills and came back with nothing but blisters and the price of a bed." Offers to join: 3 coin and keep. NO info on what she can do before hiring. Crags: "Shout in Marmorsarc ... and something shouts back ... in a voice that is not yours." -> Marmorsarc known, SAME route (foot -> tarn -> track). Third destination on the identical track.
- Hired Isla (-3c, 17 left). "Where are we going, then?" Home: godparent Orryn at Gibagabar, "I write when I can. I cannot, much." High ground: teaches lie of Zhargeithrehes (mentions "foot of Zhargeithrehes by Shaynekuda").
- NEW "Company" tab appears only once you have a companion => solo player cannot see their own HP/stats at all.
- Ilse sheet: elf mage L1 "once a scribe", 5/5 HP, str 1 (!), dex 14 con 12 int 19 wis 18 cha 14. Prepared: Light, Acid Arrow. CAN DO lists Knock (2nd), Shocking Grasp (2nd), Fly (3rd) — unclear if usable. Rules text readable but jargon-y ("End on yourself; 3d8 + 1 + 1").
- Isla sheet: human warrior L1 17/17, str 18 con 20 int 7 cha 7; many maneuvers (Guard, Taunt, Cleave, Charge, Sweeping Strike, Second Wind...). Carries battleaxe, PLATE MAIL, torch, ten-foot pole. Fiction (broke drover) vs. kit (plate) mismatch.

## 063-080 Ironmongery, travel, the tarn, Argentumport
- Ironmongery: bell, caltrops, chalk, dice, fish hook, iron spikes, needle&thread, piton (all 1c). NO crowbar (Flint's request unresolvable here). Bought chalk.
- Footer status shows only "Ilse · unhurt" even with Isla in party; Isla appears as small "Isla, drover" tag.
- Foot of Zhargeithrehes (1h20): "You leave Peahkom in the full of the morning..." still MORNING. Exits: foot by Shaynekuda 2h40, tarn 2h, sheepfold 2h40. "Make camp for the night" now available.
- Tarn (2h): AFTERNOON. Atmospheric. Argentumport/Profundusmons/Marmorsarc each 1h; the col 4h. Hub-of-dungeons layout.
- Save download works: kyr-30.json, 4.7 MB after ~30 steps (seed zadiweno). Transcript-based.
- Argentumport: adit, lintel ARGENTUMPORTA with hammer and star; stone door with riddle in old script + later scratched translation "Sometimes narrow, sometimes wide, wind or rain, I stay outside"; press-word buttons Creek/Tundra/Path/Mountain. Raven keeps pace. ISLA REACTS: "looks at it, then at the sky, and says you will want to be away from it before dark." Companion presence felt.
- "The letters on the lintel beam — unread" (an object to read: my errand?)

## 081-097 Argentumport entry & adit
- Lintel: "WORK IT: Read" -> "ARGENTUMPORTA ... 'silver gate'; the hammer and the star were the Delvers' mark". Reading works; object then tagged "read".
- Speaking door: Look closely / Push and pull / Listen. Listen -> "Nothing comes of it." (a *speaking* door says nothing).
- UI: exit "← The adit gallery" and "look at the speaking door" are bundled in one button.
- Riddle answered "Path" -> "Something deep in the door turns over, like a sleeper, and the whole slab swings on a pivot". Satisfying, but translation was given; scribe/lore background irrelevant.
- Adit gallery dark: "YOU HAVE NO LIGHT ... do nothing that needs seeing." Offers only "Isla: light a torch". My prepared Light spell not offered in-scene; found in Pack -> "Ilse: Light" -> on Ilse / on Isla. Cast on Isla: "A small steady light kindles over Isla's shoulder." BUT status line keeps saying "Nothing lit · 1 torch to spare" (contradiction).
- Gallery prose good (Delvers did not hurry; Stāncepan's later tin miners' rough props among the Delvers' oak). A miner's crowbar lies there -> Take. (Flint's crowbar quest suddenly fulfillable.)
- Lift-head: chains rusted fast, cage at bottom. "look at iron lift-cage" -> Look closely / Pry at it with the bar / Push and pull / Listen. Pry -> "You get the bar into the iron lift-cage and lean on it. Nothing comes of it." (cage is at the BOTTOM of the shaft — prose contradiction).
- "break the rust off the wheel and wind the lift-cage up" -> immediate success, no actor named, no check shown, no time shown. Unclear whether crowbar/strength mattered.

## 098-118 Deeper in Argentumport
- Fallen gallery: "you could dig through it, with the means." Gate: "dig through the fall · Needs digging or a shovel, and the company has neither." EXCELLENT feedback—tells me what to prepare. Pry with bar -> Nothing comes of it. Exit beyond: The pale vein.
- My driver errors (index shifts) caused an accidental Search ("You find nothing out of the ordinary") and opening Map/Notes — my mistakes, not game's.
- Notes now: UNFINISHED includes "The bear have a den at a cave in the hillside in Ghâshgerebchursha/Kotzchursha" — Fargrim only said "Something" -> Notes SPOILS the monster identity, and grammar "The bear have". Philosophers became a quest: "What the country's own history says could settle it" (not told by anyone). Heart-of-vein quest present.
- Foot of shaft: "rock so hard it rings". Dressing-hall: stone tables, furnace "cold for a thousand years". Tally (Read): "...for a hundred years; then a gap; then, cut deep and crooked: WE HAVE SHUT IT IN. DO NOT LET IT OUT." + Delvers lore paragraph (earth's heart is a forge, whoever goes deep enough may stand beside the smith). Best writing so far — dread.
- Still no "copy" affordance for my errand.

## 120-129 The end of the last gallery — the choice and the fight
- Iron door taller than two men, three bars on THIS side, breath-cold air. Inscription Read -> mechanical dump: "The way to a great pit in the fellside with a wheel over it: to the foot ... How the Delvers ended: The star-iron gave out, and they turned on one another...". Then deduction: "Put together, what you have of the Delvers ... points somewhere no single stone names: where they went at the end. If it is right, it was Zhargeithrehes." (We are IN Zhargeithrehes — anticlimax.) "Noted: ..." x2.
- Conflict between tally ("WE HAVE SHUT IT IN") and inscription ("turned on one another") — may be intentional, but presented without framing.
- Bars: Look closely / Pry / Push-pull / Listen all -> "Nothing comes of it." Listening at the sealed door of a monster: nothing. Missed dread.
- Decided to lift the bars (curiosity > warning). "The iron door swings open of its own weight, and the cold comes out of the dark behind it, and has a shape." Great. But scene text still says bars "lie across it in iron hasps" (contradiction) and repeats inscription lore line.
- "The cold below · something that was walled up behind the iron door, and is not dead · Ice elemental — A HARD FIGHT — Attack". Monster waits; I could have left. No way to inspect it pre-fight. Chose Attack.
- FIGHT (dark screen): Round 1: "The cold below's slam catches Ilse, for 5. Ilse falls." My PC (5 HP) is down before taking any action. Enemy panel: "Resists acid, sonic, force, psychic, cold · vulnerable to fire, lightning, bludgeoning." (clear!). Isla's turn: Strike 1 in 3 / Cleave 1 in 3 / Prepare Charge / Sweeping Strike 1 in 3 / Other abilities (4 more) / Defend / Wait / Flee "ends the fight for all". "T lets Isla fight this turn on their own."
- Feeling: shock + unfairness. Rating "A HARD FIGHT" was a warning but 5 HP vs one hit = no counterplay for the mage.
- R2: Prepare Charge. Enemy intent shown: "Means to use slam on Isla." (good telegraph)
- R3: Charge -> 30 bludgeoning (vulnerable). Elemental "near death". But two slams hit Isla (9, then 8): "Isla is bleeding" / "Isla turns the worst of it aside. Isla returns with 1 HP." (confusing phrasing; two enemy attacks in one round?)
- R4: Strike (1 in 3) -> miss. Log: "Isla is not infected." (non sequitur)
- Strike again -> straight to end screen; my last strike's result never shown.
- END: "No one is left standing. Isla fell at the end of the last gallery, afternoon of the first day. You were set upon as you went to attack the cold below. The cold below struck the last blow with its slam, for 1. It lasted 5 rounds; one against one. The country goes on without you." Options: Begin again in this country / Back to the title.
  - Epitaph omits Ilse (the protagonist). "one against one" is wrong (two in party). "set upon" misdescribes a fight I started. No mention of the door I opened (consequence).
- First journey ended ~7 game-hours in. I never got to choose for my mage in combat.

# PLAYTHROUGH 2 — "Begin again in this country": Bruni, dwarf warrior, "What is owed" (trader, wayfinding)
- World RESETS to 9 Midsummer morning; Isla alive in taproom again. Nothing from run 1 persists ("The country goes on without you" is only flavour).
- Start at Orsik's forge: debt 50c by market day, 10 days. Have 21c. Orsik: "Fifty coin, by market day. You'll have heard I said so." / "looks at your hands before your face".
- Orsik SELLS crowbar 3, shovel 2, ten-foot pole 1, dagger 2, torch 1, lantern 7, lamp oil 1. BUYS jeweled crown 120, star-iron 30, bronze bearing 10, iron figurine 8... -> loot-and-sell loop now visible.
- Topics: old workings worth (grandfather; stair walled up by the Delvers at Profundusmons with writing on it; 30/lump star-iron), old workings (Argentumport "Worked out, they say. They are not."), old kingdom -> NEW destination Murkweard, broken keep east via road through Ebarukaetz. "Ask for five days more" -> "Five days. And five coin more" -> explicit option "Take the five days, for five coin more". Good.
- Bought shovel (19c).
- Taproom now also has Adrik Rumnaheim (drover) and Gunnvor (pilgrim) — not present in run 1 (arrived later?). Gunnvor: "I promised. I didn't say how many." Gibagabar news vivid (women gutting fish; eels running early "like a warning"). Adrik greeting identical template to Isla's. Adrik "counting the cattle... not liking the count" — no topic for it. Neither recruitable.
- Rehired Isla (16c).
- Bruni stats: 16 HP, STR 7, dex 10, con 18, int 16, wis 18, cha 16. Warrior with Str 7 contradicts "Brawn". No stat choice offered.
- Town sweep: mine-head (Baern, "Dark, wet and low. And that's the good level."), armoury ("like a row of people who have stepped out of themselves"), bakehouse (Gardain = Vistra's husband), wright's yard (Dagny = Flint's partner). Social web interlocks. "Talk to Isla" option appears in scenes; same 3 topics.
- Prior again (+10c, 26c). Moral tension visible: Orsik buys what glints "no questions"; prior: not to be sold.
- Profundusmons: "heather stops a long stride short of the adit mouth ... as though burned back. Nothing nests in the spoil." "Wild goats stand on rock no goat should stand on." Isla's warning line identical to Argentumport's.
- Save 03 (kyr-31.json).
- Adit mouth: "The bats · Bat — A HARD FIGHT — Attack". Prose never mentions bats. Walked straight past to "The adit" — evasion permitted, no consequence.
- Adit dark; Bruni lights torch: "Bruni's torch, 50 minutes left · 1 torch to spare" (light as clock — good tension).
- Stone casket riddle "I always was, yet never will be." options Tomorrow/Glory/Time/Mercy. Prod with pole -> Nothing. Pressed Tomorrow -> opened. RIDDLE TEXT IS INVERTED relative to its answer (tomorrow never was / always will be). Contains smoky quartz; "Put in" option.
- Took smoky quartz.
- The crossing: AMBUSH "The ferocious cave spiders spring out at you." Two spiders (9/9, 8/8 HP) both "Means to use bite on Bruni". Strike target list shows odds+HP ("2 in 5 · 9/9"). Clear.
- R1: Bruni miss, Isla miss; spiders bite Bruni 5, 7, 4 (THREE bites from two spiders) -> 16 -> 1 HP. Text: "ferocious cave spiders's bite", "Bruni is bleeding." then "Bruni is not bleeding." then "Bruni turns the worst of it aside. Bruni returns with 1 HP." Very lethal; two L1 warriors vs two cave spiders.
- Flee: "Bruni gets away. Your company withdraws from the encounter. The fight is over. Go on". Back in adit: "The ferocious cave spiders come at you!" but no fight — ambiguous.
- Company: Bruni 1/16, bleeding gone. No healing in party.
- Walked out past bats again. Torch keeps burning in daylight (can't douse). Road home uneventful; arrived EVENING.
- Kildrak greets my 1-HP dwarf: "'Well now,' says Kildrak, brightening at the sight of a new face." (cheerful template ignores my condition; and in run 1 she had a bespoke opener.)
- Care for wounded: full heal +15 for 2c, 1h. Injury cheap to undo.
- New topic "the walled stair in Profundusmons": "The makers shut the stair themselves ... Open it, and I will not pray for you, nor heal you, nor sit up with your dead." EXCELLENT threatened consequence.
- Took bed & supper (3c). NEXT MORNING (10 Midsummer): "The talk is all of the brothers, who went up to Profundusmons at first light: four of them, with lanterns and a bell, singing, to bring up what is at the bottom and bury it." -> PRIOR'S CLOCK FIRED. Strong world-moves-without-you moment. Prior still in market afterward.
- Torch read "30 minutes left" after a night (frozen/persisted lit).
- Tarn: "MORNING · FOGGY" + "SINCE YOU WERE LAST HERE: Fog lies thick" (section used for weather). Profundusmons: fog "turns the hedges to ghosts" (moor described as having no walls/trees). NO trace of the 4 brothers anywhere (no lanterns, bell, tracks, bodies) during the whole return trip.
- Bats now "EASILY WON" (yesterday "A HARD FIGHT" at full HP). Fought: 4 bats, 1 HP each; Isla "chuckles: 'That was fun!'"; Bruni "looks away solemnly"/"swears under their breath and sets their feet again". Personality flavour in combat — nice.
- Casket still open (persistence OK). Crossing: spiders again (respawned/fresh). Taunt by Isla -> spider bites Isla; won in 4 rounds. "Isla is infected" reported after Isla's own MISS (causality unreadable). "spider's armour is torn open" (1 dmg).
- Crossing room: chalk marks (star toward shaft, open hand toward stopes); carving thickest at narrowest point -> hidden switch on route up. Coins +5. "Prod it with the pole" -> nothing; "Look closely" unlocked "push the switch in with the pole's end, standing clear" (works) and "wedge the switch · Needs trapwork". Rocks fall, switch spent, no harm. Two near-identical pole verbs, only one functional.
- Head of winze: torch guttered (YOU HAVE NO LIGHT); "The rats · A HARD FIGHT"; option "draw out what is in there, and wait for it here" (lure tactic!). Isla lit last torch (1h). "Something in the foot of the winze moves as weather moves, and stops when you stop; the air that comes out of it is wrong." Superb.
- Status: Bruni 7/16, Isla 10/17, 294 XP each.
- The spring: "The goblins" as a bare box (not a <button>, no description). Clicking it: "draw back to the edge of your light ... Nobody speaks first." Ask to let you by (even chance) / Warn off (even) / Attack (hard). Ask -> fail, roll shown "d20 7 + charisma 3 = 10 against 13" -> Warn off also removed. "Let you by" — to where? (spring is dead end). Portrait region renders stray "t".
- Tally-board: "You carry out the action." leaks into scene text. Took it; coins +16 (42). Goblins don't react to looting beside them.
- Notes: gossip about the brothers filed under "SEEN FOR YOURSELF ... you saw it". Brothers' expedition not tracked as unfinished.
- Save 04 (spring).
- Descended winze directly: "The mud comes at you without a sound." Mud elemental, resists bludgeoning, vulnerable lightning/cold (mage would have mattered). Second Wind recovers only 2. R2: Bruni falls (7). Isla near death bleeding.
- Flee with PC down -> END: "No one is left standing. Isla fell at the foot of the winze, afternoon of the second day. You were set upon as you went to take the ladders... Bleed struck the last blow, for 1. It lasted 4 rounds; one against one." Flee outcome not shown; epitaph omits PC again; "one against one" wrong again.

## Reload & return home (save 04 via "Open a save file" on title — works, restores scene exactly)
- Walked home uneventfully. Orsik: "'Well?' says Orsik, and looks at your purse rather than at you." Sell options appear per item: smoky quartz 15, bronze tally-board 45 (!). Sold both -> 102c.
- "Pay what you owe" appears only once affordable. Paid: "'We're square.' For the first time, a smile. 'I didn't think you would.'" Lovely beat — but a 10-day debt resolved on day 2 by selling one floor-loot item. Economy trivialises the opening motive.
- Prior: "'You,' says the prior, neither pleased nor otherwise." No topic about the 4 brothers who went into the mine.
- Wait submenu: An hour / Until dark / And watch, until something changes -> "Kestra and Vistra and Hulda and Flint go away."
- Slept 4x (11-12 Midsummer). Full heal overnight. Gunnvor "eating bread ... as if it were part of the pilgrimage." Rain on shutters. NO NEWS of the brothers ever again. Dangling consequence. Bed can be taken back-to-back in daytime.
- Kildrak now: "'There you are!' ... as if she had been expecting you." New social options re: walled stair: Argue (even), Watch for what goes unsaid (even), Tell the keepers of names sent you (even), Tell the stair will be opened whatever is said (likely), Promise to shut the stair again.
  - Watch -> fail "d20 7 + wisdom 4 = 11 against 13" (second consecutive d20 7 across different checks — unverified suspicion of fixed roll).
  - Promise -> "Kildrak takes your hand in both hands. 'Then I will hold you to it'" + lore: "What the Delvers walled in below their mine cannot bear the light of noon; their paymaster kept noon in a jar." BEST PUZZLE CLUE in the game.

## Final cold checks
- Map after run 2 (Isla's knowledge + Bruni's wayfinding): big reveal. Good: legend, visited filled vs. heard hollow, etymology line. Bad: duplicate generated features ("holly hollow" x2, "windfall" x2, "old bank" x2), Profundusmons label offset from its node, Gibagabar (quest site, etymology listed) not labelled on map. Local "HERE" diagram: unvisited shown dashed (good).
- Phone width 390px: clean reflow, no horizontal scroll, portraits 2-up.
- Story after loading a save begins at the load point: all earlier history lost. Places appear as bare headings. "You carry out the action." x7. Selling loot grants XP ("Bruni and Isla each gain 45 experience").
SEALED: cold play record ends here (before any reading of source/docs/atlas). Time of sealing: 2026-10-25.
