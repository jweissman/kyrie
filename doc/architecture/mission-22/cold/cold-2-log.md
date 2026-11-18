# Cold play log — Wenna, human warrior, iscoed
T0 17 Smoke morning, rainy. Porthalen landing. Aim: ask at customs-house how many head of Bran's drove crossed.
- Aim text in JSON `aims` already gives answer ("the clerk says four were hidden from the toll") — spoiler?
- 120 options in offer. Rest list is a wall: ~10 talk, ~25 go-in-town, ~16 "To the way into X", 16 "Take the road to X", buy/gather/pet, then ~40 "Set out for X". Three kinds of travel verb (To/Take the road/Set out) for overlapping destinations.
- "Make much of" label with no object (pet inndog).
- "Collect Bran's tally-stick" lying on the green — likely relevant.
T1 read notice: three job notices (rats/crypt/spiders). Scene also says "You take Bran's tally-stick" — I never chose that; it was a separate option. Aims jumped 1→6 incl. fuel boat at Reedbridge and Gatesend sea-gate from nowhere.
T2 customs-house: good scene (drover behind grille). Aim silently changed to "Ask Owain at the drove pens". Top-level "aim" field stays "Ask Holgar" (truncated?).
T3-4 Mardle: 40 at march-stone, 36 in pens, fine 12 crowns. Bran: four drowned in the Rhyne, "ask the boy", hints Mardle skims. Nice little mystery — I want to prove Bran honest.
T5 tally-book peek failed (even chance, one try). Fair.
T6-7 pens: Owain (labelled "your cousin" after talk — surprise kinship, never introduced). Says the four went in the Black Rhyne.
T8 Rhyne: aim = search the Rhyne, but "Search here" is in REST; primary leads with taproom/shrine travel. Top-level `aim` field keeps saying "Ask Holgar".
T9 search: found four drowned branded bullocks. Satisfying. New aim: tell Mardle. Customs-house again in REST, primaries are taproom/shrine/pens.
T10-13 back at customs: NO act to tell Mardle what I found. Talk to Mardle only repeats his tally speech ("Talk to Silas Mardle" = count_again). Talk to Bran: "finishes what he was doing before he looks round" — he's sitting idle behind a grille. Stuck.
Discovered protocol: {"look":...} gives an inspect turn (time Day 1 9:25; header first said "17 Smoke, morning" — two date formats). {"follow":"<aim id>"} works ({"follow":1} as the line hint "follow 1" suggests fails: "no aim: 1").
T14 follow drove__held_proof: game leads (`led`) to "To the landing at Porthalen" — i.e. OUT of the customs-house where Mardle stands. Following?
T15 landing: `led` sends me straight back into customs-house (loop out/in).
T16 re-entered: NOW "Tell Mardle where the four bullocks are" appears as primary. It was absent while I was in the customs-house at T10-13 (after arriving by travel:, and during talk). So the act only appears on entering via the door?
T17 told: Mardle frees Bran, +150 xp. Bran vanishes; no thanks. Mardle: "tell the reeve nothing" — a hook! I want to tell the reeve about Mardle's skimming.
T18 green: Owain now "Owain", not "your cousin". Bran nowhere.
T19 Talk to Reeve Annis Talfryn: "waits for you to speak, and does nothing to help." No topics at all. Can't report Mardle's skimming — hook from T17 goes nowhere.
T20 royal proclamation: slay dragon Ember-in-the-Rock, report to game-warden at Dun Rìerdan -> knighthood + 500 crowns. Thrilling, warrior-shaped. Want it.
T21 dues-receipt: "A wheel; no wing." printed BEFORE the receipt text it comments on. New aim: compare seal with Hall's grant. Aims now 7.
T22 factor: Guldríce company offers 380 coin for crown of first king from Holyking. Asking it made it an aim (crown is now TOP aim) though I never agreed.
T23-24 Holgar: rats job ask buried in rest; primary leads with king-barrow rumour. Gave key, ten coin + lantern, ratsbane alternative (nice).
T26 corn-store interior offers "To the landing — wrench the padlock's hasp out" from INSIDE (I have the key, I'm inside).
T29 cellar search: "Nothing is put away or hidden here. You have been over the whole of it, and nothing is hidden here." (redundant). "Light a candle" becomes PRIMARY with torch already lit.
T30 fight 2 rats (1 HP each): I missed 5 times running, down to 5/14 incl. bleeding/festering; Second Wind saved me. Rats sometimes attack 2-3 times in a round. Turn counter frozen at 30 through the whole fight. Tense, actually fun-ish, but a warrior whiffing on rats 5x is deflating.
T31 won at 10/14. Next: buck rat in the nest.
T32-33 buck rat (8 HP): used "Press on to the end": resolved in one go, won. "The old buck rat's armour is whole again" (rat armour?). Torch burned out right then: "It is pitch dark... Need: Dark" (odd phrasing).
T35 searched nest: cord of grave rings (+3 xp). 
T36 follow -> led back cleanly room by room to Holgar. Good! (Though at the salt-house `led` points at boiling-house while the payoff act is right there as primary.)
T41 Holgar pays 10 coin + lantern + 2 oil. Lovely. He "hears about the drain" — I never went into the drain. No xp for the job itself.
T42 sold rings: "names a price, and counts out the coin" — no amount shown. I have no idea how much money I have; no purse anywhere in turns.
T43 Holgar on fuel: boat 2 days late, ridge wood is reeve's; will pay for fuel.
T44 taproom: ~75 options, 30+ "Ask Kynes about <far place>". A wall. Carlin for hire (primary).
T45-46 recruited Carlin (6 coin + keep). She turns out to be a ranger w/ shortbow + animal companion (Bram) — I learned this only in the fight menu. Good surprise, but nothing told me.
T47-48 Kynes' spider job: key + antidote, "talk to the boy first". Hobb: "big one at the back... bags hanging like puddings... I dropped Dad's knife. Don't tell him." Lovely writing.
T49-52 bought 2 torches, filled lantern. Pit at "17 Smoke, afternoon".
T54-55 spider fight: Wenna missed twice more (sweep, cleave). Carlin killed it: "That was fun!" Wenna's hit rate so far ~3/12. Job advances: mother + eggs in brood-chamber.
T56-57 spiders' mother (18 HP): Wenna missed twice more; Carlin did all the killing. Carlin to 1/10. Text: "bite misses Wenna. Wenna steps in front of Carlin and takes it." (contradiction); "Wenna winces, and still look round" (grammar). "Need: Carlin: 1 of 10" cryptic HUD line.
T58 burned egg-sacs. T59 brood search: ring of letters, three worn deep — no follow-up offered.
T62-65 working face: quarryman's wages, garnet (+15xp both), crowbar appeared only after a later turn. No sign of Hobb's dad's knife.
T66 candle had been burning alongside lantern the whole time; burned out.
T70 Kynes pays 12 coin + fireproof salve + rope. Jobs loop feels good: notice -> ask -> descend -> fight -> loot -> paid.
T71 bed & supper: "18 Smoke, morning". News: company diggers (5, picks, handcart) went up to Holyking at first light to take the crown. The world moved without me — the factor's threat came true. Now I feel a race.
T72 "Read the notches on the tally-stick" is a DIFFERENT tally-stick (dead man's oak count) from Bran's — confusing name clash.
T74-75 Isaure Venn: lovely voice ("would like a person ... who will not change the subject to dragons"). "Turned back twice by the dark and once by a boy" = thrice. Wants escort up the hill.
T76 landing day 2 changed: barefoot walkers chalking wheel-with-wing (ties to receipt seal!), rick burned at Reedbridge, surveyor's son's measure table. Town feels alive.
CHOICE: race the diggers to Holyking for the crown (100 min), leaving Isaure for later.
T77 "Set out for Holyking" (100 min) stopped at the reed landing; then a 60-min leg. Reed ricks: can't take them for Holgar's fuel (only look).
T79 Holyking: SANCTUSREX lintel, frogs stop and start behind you, "Carlin spits, for luck". Lovely atmosphere. No diggers in sight despite "went up at first light".
T82-84 glowing rune trap in passage. Look closely: "waiting for weight, or warmth". Laid my 10-ft pole on it from a distance: sonic wave spent. The pole I'd been carrying finally paid off. Best moment so far.
T85 cross-chamber: fishing net in a barrow(?). Heard something in north recess; "draw out what is in there, and wait for it here" — nice tactical verb.
T87 robbers' captain (31 HP!). Talk: "No further. This is ours." Tried "Ask ... to let you by · an even chance · one try" -> failed, and it dropped straight into a fight with no line saying it failed.
T88-89 fight: Wenna hit once (2 dmg) in ~6 swings; captain used Second Wind +13; Carlin "cannot act" then fell, Wenna fell. GAME OVER: "No one is left standing ... It lasted 42 rounds; one against two." Final turn JSON also dumps 295 internal "changed" facts (canTrain breathe_fire etc.).
Ending says "Begun again, the country ... remembers you" — but each run starts fresh.
BRANCH (reverted the robbers fight; lines-death.txt kept): from cross-chamber went to back-stone instead.
T87-90 back-stone: dead adventurer's rotted pack (potion, silvered bracers), notebook ("portal stone... bar under the weight would free it, Brann says"). Notebook "lies open ... where you left it" right after first reading.
T91 levered counterweight with crowbar ("crack that anyone near will have heard" — nice). Stair to chalk hall.
T94-98 stone chest with heron/owl/stag bosses. No clue found (search: nothing). Guessed. NOTE the act ids leak the answer: the correct next boss's id has _p<n>, wrong ones _q<n>; the ids change after each press. Solved -> broken crown (+6xp).
T101-102 draw out at hall of bones -> straight into fight, 2 ghouls (13 HP). Carlin's companion now "Ada" with mandibles (last time "Bram"). "Ghoul 1 cannot be infected." (debug-ish). Won with Wenna 10ish.
T103 hall of bones: "The floor is swept, as if someone had swept it." 
T104-106 long gallery: painted procession; "Play the flute" (wonder): "You have never played, but the flute knows how" — vision of how the makers ended; flute splits. Best prose of the session. "Wenna's blood is up."
T107-108 king's door: 2 spiders lurking, won via press-on. "Tend Wenna" = drinks my only potion, label doesn't say so.
T109-110 broke seal-stone: "Wood groans and iron shrieks" for a STONE. Option to "set the seal-stone back" right after cracking it.
T111 king's hall: the king sits up, "There is no face, only the crown." Superb.
T112 "Collect the crown of the first king for Wenna" — and I just... took it off his head. No narration of the act at all, only "+75 experience: found the crown". The king "is watching you. In 6 minutes it will be on you." Running.
T113 fleeing: antechamber primaries were Tend/Wait/Search — no way out in primary.
T116-118 still "Following: Bring the crown ... up out of Holyking" but `led` points DEEPER (ossuary, well, mourners' hall) instead of out. Had to find the exit myself.
T115 king's door coins: 7 coin. 
T122 forecourt: "In the daylight the crown ... is only a crown, a ring of soft gold, very old, and the day is the same day it was." Gorgeous. Aim done — but NO new aim to take it to the factor (380 coin). Five company diggers never appeared at all.
T124 back at Porthalen 18 Smoke afternoon. "Sell the crown to the factor" is in rest. Talk to the factor: "the answer's probably no" — he doesn't know me. After talking, the rest item LABELLED "Talk to the factor" carries the id sell(region__w8_heart,...) — clicking it would sell the crown!
T126 sold: "counts out the coin" — amount again unstated.
T127-128 taproom: "Tell Kynes what you brought up out of Holyking" -> Kynes "looks a long while at the crown, and does not touch it" — I sold it an hour ago; it's locked in the factor's box. Free bed for a year of telling. Stopped here.
