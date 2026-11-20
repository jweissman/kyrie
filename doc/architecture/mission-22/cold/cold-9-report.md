# Cold play 9 — Aldith (human warrior, battleaxe), report
**Score: 5 / 10** (the town and its dungeon are a real pleasure and I'd happily play on, but after about turn 85 I could not leave Porthalen: every way out, the map and my aim either timed out or had no button.)

## Why
The first 80 turns were good. Porthalen is dense and specific: drowned bullocks, a customs clerk who's squeezed by a toll-farmer, a lead-drover held behind a grille, a tinker's daughter for hire at one coin, and a cellar under the corn-store that drops through rat-runs, a drain, an undercroft and a charnel passage to a grave-robber with a black candle. Small acts paid off in ways I didn't expect. Watering the cattle, telling Mardle where the four lay, and pinching out the candle all worked. Leif naming the three dead before paying me was a good moment. Light ran out on a clock (torch, then candle, "it will give out first"), which gave the descent real tension. Then the game handed me five far-off goals: the sea-gate before the spring tide, Caer Brynach, the Holyking crown, Redkeep, the dragon. It offered "Set out for Gatesend" as its lead line, but there was no row to press for it. The map, the country exit, the fields and (later) the waterside all came back as TimeoutError. I ended broke (I'd spent everything on a fen-boat for a fen I couldn't reach), at 9/14 HP with "Tend" doing nothing, walking in circles round the landing. A story this good that won't let me leave is very frustrating.

## What I wanted
1. **Find out what happened to the four missing bullocks.** Found them drowned in the Black Rhyne. It was satisfying when the find freed Bran.
2. **Get Bran out of the customs-house.** Done by telling Mardle where the beasts were (+150 xp, an invitation up to Caer Brynach). I'd have paid the 12 crowns if I'd had them.
3. **Open the corn-store and see what's under it.** I hired the tinker's daughter and she picked the lock. I cleared the rats, the buck rat, a centipede, two zombies and bats. Done, and I collected from both Holgar and Leif.
4. **Deal with the man raising the dead.** I talked first, then crept round and pinched out the candle. He fled and I kept his book. This was the best scene.
5. **Mend the sea-gate at Gatesend before the spring tide (six days).** This became my main goal, and I bought a fen-boat for it. I never got out of town. Abandoned, not by choice.
6. **Get healed.** "Tend Aldith" did nothing. I never thought to drink a potion outside a fight. Still at 9/14.
7. **Go up to Brynach, the Holyking barrow, Redkeep, the dragon.** All noted, none reachable.

## Defects
1. T8–9, T75: "To the customs-house" and "To the shrine of Nodens" (travel: rows, offered as the lead) did nothing. The same screen repeated, including the search text again. Exits worked instead. Later, T95, a travel: row did work, so the failure is intermittent.
2. T31, T43: "Search here" in the cellar and the nest gave `[error] TimeoutError: click: Timeout 30000ms exceeded.`
3. T43–44: Following "The old ways under Porthalen go" timed out, both as a follow and as an act.
4. T86, T98: "Open the world map" timed out, from the landing and from the salt-house.
5. T87, T88, T101, T105, T114: From the landing, "To the country about Porthalen", "To Holgar's salt-house", "To the home fields", and on T105 even "To the waterside" (which had worked at T93) timed out. Leaving town became impossible.
6. T94–95: After I followed the sea-gate aim, the game led with "Set out for Gatesend — your aim — You would come there after dark", but no row/id existed for it. On T105 the aim itself was gone: "No choice follow:gate__gate_aim".
7. T108: The surveyor's son: "Redkeep: somewhere to set out for now, about 3½ hours off". No set-out row ever appeared.
8. T86: Following the sea-gate aim at the landing timed out. It worked at the waterside but led to the missing button (defect 6).
9. Throughout: the status line always showed "aims: []", even right after "You set your mind to it: …".
10. T43, T53, T85: Aim titles were truncated: "The old ways under Porthalen go", "Something is", "Find out why the sea-gate".
11. T78, T96: A stray fragment ", for you" sat under the first talk topic with Leif and with Holgar.
12. T99–100: "Tend Aldith" twice gave only "Holgar claps you on the shoulder. 'You know where I am.'" No healing and no explanation.
13. T11: Owain was still "carrying water to them a bucket at a time" after I had watered the whole drove and the pens said they stood quiet with the trough full.
14. T7: The four drowned bullocks were found, but there was no way to tell Owain or Bran. The find only paid off later, through Mardle.
15. T13: "Call Mardle out to the reeve, and say what you found before her" was offered before I had met or heard of Mardle.
16. T28: "You take your time over it, by feel" when the tinker's daughter picked the lock (I have no lockwork).
17. T48: "it lands, for 4. The great centipede's armour holds." This is contradictory: it lost 4 HP.
18. T37–38, T59–60: Turn order was confusing. The thief got two turns in a row while Aldith didn't act, and my second dart never showed in the log.
19. T37: "gnawing bite catches Aldith, to no harm". A hit for nothing reads oddly.
20. T59: "The first zombie cannot be infected." A system message leaking into the prose.
21. T59: The HP header still said 14 the turn after the zombie hit me for 5.
22. T69: "bats, hundreds of them" turned out to be two 1-HP bats.
23. T64: The "Creep round… pinch out the black candle" choice was listed in the prose but had no row until I looked at the candle.
24. T41–42: After a won fight, the screen still looked live and fight:auto silently did nothing (only "Go on" worked). I wasted two turns.
25. T66: Looking at "a book of the dead" didn't describe the book at all.
26. T0: Over 50 R rows on the landing on turn 0 was overwhelming. The P rows helped.

## What worked
1. The opening situation: a drove four short, a cousin, a lead-drover held for a tax he says isn't the Rì's. It is concrete, human and solvable in a few moves.
2. Moral grey. Mardle: "I have three children in the house behind the chandlery… Count for him a year, and see if you count kinder." And afterwards: "tell the reeve nothing she need be troubled with."
3. The dungeon under the town, with connecting regions (corn-store, church crypt, quarry) and the line "Those who dug did not know it was here."
4. The light economy: the torch guttering, then "The candle has 50 minutes left: it will give out first" against "43 minutes" to the way out.
5. The grave-robber scene had several approaches (talk, sneak, persuade, warn off, fight, a rite I lacked). The sneak resolution was beautiful: "the dead fold down into the bone-heaps like coats let fall."
6. Rewards with character: Leif naming the dead, the ashwood charm "for those who go among the dead", Holgar's lantern "a light that won't blow out".
7. The hire screen gave a full, clear stat block for the tinker's daughter, and lockwork immediately mattered.
8. Fights were quick and readable. The odds estimate ("Should be won… though not unhurt") is useful. Dirty Trick blinding, then a prone kill, felt tactical.
9. Signposting for skills I lacked: "Needs lore… Leif… sells a glossary of the old script."
10. Lore density: Merekeep "wet keep" in Aenean, the hum dogs won't go near, the Guldríce company's legal claim on a barrow, a dragon called Ember-in-the-Rock.
11. Patch the dog leaning his whole weight against my knee.

## Surprise
A customs clerk whose petty extortion is itself forced on him by a distant toll-farmer, so that "justice" here is a choice between ruining a drover and ruining a father of three. I didn't expect a fantasy game to start with a tax ledger and drowned cattle and make that the gripping part. A grave-robber who is simply "a reader" frustrated that the dead "have not said anything I wanted yet" was also unexpectedly sad rather than villainous.
