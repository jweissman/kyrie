# Cold play 9 — think-aloud log
T0: Porthalen landing, rainy morning. I'm Aldith, 14 HP, 6 coin, 2 rations. Lots of hooks: Owain (cousin), customs-house, tinker's daughter, notice (30 crowns to mend the sea-gate at Gatesend), fen-boats for 30 coin. Huge list of R rows (~50) — overwhelming. Start with my cousin.
T1: Talking to Owain — "What do we do?" A "YOU KNOW NOW" block lists four facts at once, including the notice I hadn't read yet. Nice to be told, slightly odd.
T2: 36 head of 40; four lost at the Black Rhyne in the dark, "They're still there." Offered aim: Search for the four that went in. I'll take it.
T3: Took the aim. "aims: []" in the status still empty — does the game know I have an aim?
T4-5: Pens. Watered the 36 bullocks ("the boy says something that might be thanks"). Pleasant small act.
T6-7: Black Rhyne: searched, found the four drowned, Brynach brand. Aim done, but nothing to do about it — no tell Owain/Bran option. Mildly flat; the find just sits there.
T8-9: "To the customs-house" (travel:) from the Rhyne did nothing twice — same screen, same search text repeated. Had to walk back by exits. Defect.
T11: Owain still "carrying water a bucket at a time" after I watered the drove.
T13: Back at landing, new lead "Call Mardle out to the reeve" — I'd never heard of Mardle yet.
T14-20: Customs-house: Mardle claims "Four hidden from the Rì". Bran behind the grille: the four drowned, and Mardle "has found other droves four short". Mardle: toll-farmer at Dun Rìerdan docks him a crown per short beast, "I have three children". Lovely moral grey. 12 crowns frees Bran; I have 6.
T22: Told Mardle where the four lie; customs-man checks; Bran let out. +150 xp. Bran invites me up the pass to Caer Brynach: "something has been at the cattle on the high pasture." Good hook.
T24-26: Tinker's daughter: thief lvl 1, 6 HP, lockwork — hired for 1 coin (5 left). Full stat block shown, very clear.
T28: She picked the corn-store padlock (prose says "You take your time over it" — I didn't, she did).
T29-31: Corn-store → cellar, pitch dark, lit a torch. Nice dungeon feel.
T31: "Search here" in the cellar → [error] TimeoutError: click: Timeout 30000ms exceeded. Broken.
T32: Rat-runs: rats, "Easily won". Also a culvert with bad air, options to prop the trapdoor. Attacking.
T33: Rats killed instantly in a one-line auto resolution, +60 xp. Then the buck rat gets a full fight screen. I'm a human warrior with a battleaxe (didn't know till now).
T35-40: Fight: lots of misses. Turn order confused me — round 2 offered the thief's turn twice, and my second dart never appears in the log. "gnawing bite catches Aldith, to no harm" — a hit for nothing? Sweeping Strike for 11 kills it, +120 xp.
T41-42: I sent fight:auto at the victory screen and burned two turns; the only row was "Go on" (onward). My mistake, but the fight screen kept looking live.
T43: New aim offered: "The old ways under Porthalen go" — reads like a truncated sentence.
T43-44: "Search here" in the nest → TimeoutError again; following the "old ways" aim → TimeoutError too (both by follow and act). Look works. Search seems broken underground.
T45-50: Great centipede: Dirty Trick blinds it, Sweeping Strike "lands, for 4. The great centipede's armour holds." — contradictory (it lost 4 hp). Dart finishes. Torch gutters out at the end.
T53: Undercroft: pillars, a lettered flag not quite level. Aim offered titled just "Something is" — truncated. Reading needs lore; the game tells me Leif at the shrine sells a glossary — nice pointer. Trying to lever the flag (even chance).
T54: Levering the flag: failed, an hour gone. Candle "has 50 minutes left: it will give out first" vs 43 min to the way out — real light pressure, I like it.
T55-60: Charnel passage: zombies, "the raiser's first tries" — a necromancer down here! Cleave needed a target sub-menu. Took 5 dmg (status line lagged one turn showing 14 HP). "The first zombie cannot be infected" — odd message. Won, +90 xp. Thief again seemed to act twice while I didn't.
T62: Ossuary: "The man with the black candle", grave-robber who read a book he shouldn't have. 'Go back up. This is not yours.' Choices: ask, sneak to pinch the candle, persuade, warn off, attack. Talking first.
T63: He's "A reader" who took a book from a grave; the dead "have not said anything I wanted yet." Creepy and good.
T64-65: The creep option only appeared as a row after I looked at the candle. Creep succeeded (even chance): "the dead fold down into the bone-heaps like coats let fall". He flees, leaves the book. Took "a book of the dead". Looking at the book didn't describe it. New aim: tell Leif at the shrine.
T69-71: Picking the crypt door woke bats — "hundreds of them" but the fight is two 1-hp bats. Auto handled it.
T72: Candle burns out; door open; up to the churchyard. Three graves dug and badly refilled — nice consistency.
T74-75: Followed the Leif aim; "To the shrine of Nodens" travel row did nothing again (same as T8). The travel: rows seem dead; exits work.
T78-79: Leif: names the three dead, pays 15 coin, an Ashwood ward charm and 2 minor healing potions. Satisfying payoff. (Talk menu showed a stray ", for you" fragment.) Sea-gate at Gatesend fails at the spring tide "six days off" — a deadline! Noted.
T80: The hum at Merekeep, "wet keep" in Aenean; dogs won't go in. Lovely lore.
T84-85: Reeve: gate hasn't shut since new moon; engineers from Dun Rìerdan "will come in the summer, with a bill". Spring tide in six days. Aim offered: "Find out why the sea-gate" (truncated again).
T86-88: Following the sea-gate aim → TimeoutError. Open the world map → TimeoutError. "To the country about Porthalen" → TimeoutError. "To Holgar's salt-house" → TimeoutError. Read the notice works: three job notices incl. RATS (10 coin from Holgar) and catacombs (Leif — done). I can't get anywhere — town is a trap right now.
T90-91: Guldríce agent: Holyking barrow in Addermoss, 380 coin for the first king's crown, with directions. Another big hook.
T93-94: Waterside exit worked. Following the sea-gate aim now worked: "Set out for Gatesend — your aim — You would come there after dark." But there is NO row/act id for "Set out for Gatesend" — the game leads with something I can't press.
T95-97: travel: to salt-house worked this time. Holgar paid for the rats: 10 coin, lantern, 2 oil flasks ("go with a light that won't blow out"). 30 coin now — exactly the price of a fen-boat. Hmm.
T98: Map from the salt-house → TimeoutError again.
T99-100: "Tend Aldith" (I'm at 9/14) twice: only "Holgar claps you on the shoulder. 'You know where I am.'" — no healing, no message.
T101: The country exit → TimeoutError.
T102-103: Gwil: fen-boats go "up the cuts and over the meres", "Since the sea-gate went, there's more water out there". Bought one for all 30 coin. Noted: take it out from the sea-bank at Gatesend to the drowned mere and its chapel, and a bell. But I still can't get to Gatesend.
T105: Fields exit → Timeout; waterside exit → Timeout; following the sea-gate aim → "No choice follow:gate__gate_aim" — the aim has vanished from the landing.
T106: Royal proclamation: slay Ember-in-the-Rock, the dragon west of here, 500 crowns and a knighthood.
T107-108: Surveyor's son: father's measure under a stone at Redkeep, "somewhere to set out for now, about 3½ hours off" — but no set-out row appears.
T110: Made much of Patch the dog — he leans his whole weight against my knee. Sweet.
T111-114: Back out, round by the pens, try the country exit one last time: TimeoutError. I stop here, broke, hurt, and stuck in Porthalen with five journeys promised and no way to start any of them.
