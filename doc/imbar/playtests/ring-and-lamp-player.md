# The Ring and the Lamp Below, played as a player

*Four drawn worlds (`thorn`/mountain, `a1`/marsh, `kite`/forest, `ash`/frost; the Ring's casting is the table in
`17-the-ring.md` 17.1), each played from the largest town's taproom with the preset company of three, by the labels the
page offers (`bin/kyrie play --world <seed>` for the first hour of each, then a driver that plays the same steps and prints
the pages and the journal). Natural dice except where a step says "forced pass" (the fence and the lieutenant are
persuasion checks; a failed one was retried, as a player would, only after it had been noted). The voyage to Port Ness was
not played through (see "Not played"); the company was put at the Ness pier and walked from there.*

Everything in "What the page said" is quoted from the pages of those plays. "Fixed" says what changed; each fix has a
test (`test/ring-played.test.ts`, `ring-lamp.test.ts`, `ring-casts.test.ts`).

## 1. The play, in order

### The cell and the fence (the largest town)

`thorn` (Hawkhaven/Misthythe, Cyril's inn, Taklinn), `kite` (Longbrook, Arannis), `a1` (Alderby, Naillil), `ash` (Valen).

* **How a company finds it.** The innkeeper offers "Ask about the factor who buys old bronze" (the rumour); the factor
  answers three questions and, asked whom the Exchange answers to, "looks at the stair behind her chair, and then,
  deliberately, at nothing at all". "Search here" in the taproom then opens "a hatch behind the bar". That chain is good:
  the factor's glance is the best signpost in the whole Ring, and a player who has asked the third question knows to
  search. *Unsignposted before:* nothing but the glance said the hatch existed; a company that never searched the taproom
  never saw the cellar. It still does not: the glance is enough for an attentive player and the search is one click.
* **The cell.** Four ways were offered: "Ask the cellar-men to let you by" (engine persuasion, "an even chance"), "Warn
  them off", "Pay the cellar-men six coin", "Say the factor sent you down to count the lot · unlikely", "Attack". The big
  man's line ("Six coin to have not seen it, or the word of the one upstairs. Or the stairs.") is the clearest voice in the
  town: a man paid by the week to be looked at. *Flat:* all five ways cost the same, in effect (a minute, six coin, a note
  of your face); the retort to a failed lie, "He has all day to be unconvinced", was lovely and then the page jumped to a
  fight with no sentence between ("Elen hits the first half-orc"). In `a1` and `ash` the cell fell in one round
  (level-1 company, two commoners of level 1-3): the fight is a non-event; the *consequence* is the story.
* **The Ring's answer to the cell.** Paying, lying or beating the cell hires muscle three hours later. The page said:
  "In the **Anchor's** yard, after dark, a boat's lantern goes out, and a cart comes in..." The Anchor and Hope is the
  *Tolleth* inn; in a1 the town inn is the Glass Moon, in thorn the Golden Mask. A player does not know any Anchor. *Fixed*:
  "the Exchange's yard". The hired men arrived "down the stair from the counting-room" while the company *stood in* the
  counting-room. *Fixed*: "come in together". A clock was invisible: the evidence burns a day later, and nothing
  said so. *Fixed*: "Somebody is carrying coal up the back stair, and it is not cold."
* **The fence.** "Put the cellar waybill to Taklinn, and ask for the book": a persuasion check at "an even chance"; failed
  in `thorn`, `a1`, `ash` on the first try ("Cellars are damp. The pen goes down. She is writing your description in the
  margin."), then the retry. Nothing said what a failure had cost (the Exchange now suspects). *Boring:* after she had
  pressed, asking "whom the Exchange answers to" gave the same speech word for word, ending on the same glance at the
  stair the player had already climbed. *Fixed*: that topic goes when she has been pressed, and "Ask X what she will do now"
  replaces it, in her own dry bookkeeper's voice, and tells the player the leaf's margin is a *second hand* who "goes round,
  and I have never met him on the same night twice".
* **The book.** The leaf and the waybill were the first clues; the waybill names "R., the bonded store, Tolleth". The page
  capitalised the next word after "R." every time ("R. At the bonded store...", "R. Is the only name..."): the narrator
  reads "R. " as a sentence end. *Fixed*: "R" without the stop in every player-facing line, and the lieutenant's lines open
  "The man in the good coat" (the Warn, Comes, Flinches, Pleads strings all began "R. closes").

### Going to the other country (the signpost the Ring did not have)

> *How does a player know to go to the other province?* They did not. The waybill says "Tolleth"; the journal says "he
> sits in a bonded store at Tolleth"; no page said which way Tolleth lay. In `thorn` the walk to Tolleth's gate was 78
> watches, by way of Quittance's gate and two wild cells; the way into Tolleth is not on the landing's list of ways at
> all (it is east, far). The innkeeper has a topic "Ask Cyril about the sailing to Skerrow out of Tolleth" that a player
> would have no reason to connect to the waybill.

*Fixed:* `waybill_read` now ends "Tolleth is the harbour at the east end of the coast road"; the fence's key speech says
"at Tolleth, where the road ends at the water, behind a chandler's"; `lieutenant_named` and `ledger_read` repeat it and
name the door ("behind the chandler's racks"). The journal (which keeps the Discovery texts) is where a player rereads
this, and the test reads the journal. *Still open:* a new province is not on the landing's list until a company stands at
its way in; a map pin or the notice board's line would be the true fix (coordinator: `countries.json` / `tolleth` rumour,
not mine).

### The lieutenant (Tolleth)

* **The door.** Garrick's chandlery lists "Into the bonded store by the plank door behind the chandler's racks" under
  "Ways on" once `lieutenant_named` is known. The *room* text said nothing of a plank door (it appeared in the menu only).
  *Open:* the Dorothea's `shop` has no sentence about the racks (not mine: `ring.kyr` of the Dorothea).
* **What the page said.** The man in the good coat: "I am told I am called R. It is the only thing about me that the ring
  has ever got right." and, on the temper: proud — "A chandler's. Yes. I had a coast once. They gave me a bonded store
  behind a rope-walk and said it was a promotion."; greedy — "I had a mind that it would be thirty"; frightened — "That
  is my hand. He will see that. He sees everything that has a sum in it." The three temper voices are the best writing in
  the Ring; a1's frightened man ("Put it down that I was frightened. I should like it on record that I was") is a rank of
  his own.
* **Dead end (the worst thing found in the Ring).** Each temper route ended: "...He goes round, the Principal. ... Ask."
  (or "I will tell you where he is. Every night he is.") and **in the same tick** a letter went to the harbourmaster and
  the man was routed out of the store. "Ask" what? The topic "Ask R. where the Principal is tonight" required him to be in
  the room. It never could be: the promise ("I will tell you where he is") was broken by the same click. The company had
  `principal_traced` in the journal and the page said nothing about where the Principal was or how to find him.
  Also the turned route (the margin of the leaf) never set `toldPrincipal`, so its lieutenant, who "will be at the Ness
  when it is read", could not be asked anything.
  *Fixed:* he is cut thirty minutes (three watches) after he has talked, not in the same tick; every route's Result now says
  where the Principal sits (the Ness, the loft over the boiling-house, the ladder from Salt Row, **the lamp lit in the
  gable by day when he is in**, the Dorothea out of Tolleth puts in at the Ness); the topic "Ask where the Principal is
  tonight" has a third case (on the coast) beside the town and abroad; and the turned routes set `toldPrincipal` and
  `principal_traced`. The bribe says "Ask me what you like for the next half hour; after that I shall be a man who has
  never met you." which is also a clock the player can feel. *Test:* `ring-played` "keeps the lieutenant...".
* **Unfair.** `lieutenant_cut` made the *good* route (talk) the one that spent him, and the margin route (which turns
  him, so he is yours) was in the same menu, not labelled as better. *Fixed in the Principal's answer*, below: a turned
  lieutenant is what breaks a Principal of any nerve, and the exposure's Grave text now says so.

### The Principal, and what tells a player he moves

* **What tells them.** Before: the journal said "goes round the ring from the town to Tolleth to Port Ness and home again"
  and the loft's Observation says the gable window is lit in broad day. Nothing joined the two. *Fixed:* the Discovery now
  says "a few days at each, and is never anywhere between... a lamp lit in the gable by day means he is in. The Dorothea,
  out of Tolleth, puts in at the Ness"; the leaf of the book has a margin of "a round of dates and places, never twice the
  same night: here, the coast, the Ness, here again. Somebody moves, and the margin is his."; the cellar-men already say
  "the nights are when the Principal's boat comes in". Three ranks, three hints, all in their own voice.
* **The loft (played, with the ladder up).** "A tall person in a black coat is writing in a black book, and does not stop."
  The Principal's voice is the third distinct voice (formal, never says "I"; "One does not call it a crime if one has
  weighed it"). The warning's clock ("will wait 6 minutes more") was running from the click on the ladder.
* **The bug that every previous test had hidden.** The tests `put` the company in the loft, which starts no warning. A
  company that *walks* in has a warning running, and "Lay the waybill, the leaf and the lieutenant's word before the
  Principal" is a two-hour action: the Principal's patience (the rest of the watch) ran out inside it. Measured (three
  worlds, three nerves each, same checkpoint): nerve 1 ran as designed; **nerve 2 and nerve 3 both ended in a fight**, and
  the thorn company (three level 1s) was dead in a round, with `nerve` 3's "Sixty crowns" speech printed *after* the blows
  and the crowns then counted out of a dead man's hand. Kite and ash won the fight and "took the silver" from a corpse.
* *Fixed:* showing him the papers asserts a hearing (`tolerates`) so no blow lands while he reads them. Nerve 1 still runs.
  Nerve 3 keeps the tolerance (taking the silver keeps it; refusing it spends it: "you have been given a courtesy and it
  has been used up"). Nerve 2 gives the company **an hour**: "Go down it... An hour. After that I shall not be able to help
  what is done in this room." — then tolerance goes, a fresh warning runs, and only then a fight. A company that walks down
  the ladder is alive; one that lingers is not. *And a turned lieutenant breaks any nerve*: "My man signed," they say, and
  go to the boat. That is the stake that was missing from the lieutenant's menu: the proud man who is challenged is spent,
  the proud man whose margin is put to him is a weapon. *Tests:* `ring-played` "runs at nerve 1, offers silver without a
  blow...", "breaks at nerve 2 or 3...", `ring-hierarchy` (nerve 2 now an hour).
* *Still hard:* a nerve-2 world whose company talked its lieutenant out (cut) has the fight or the long way back as its
  only ways to the fall: a level-1 company loses (R2 of `ring-friction.md`). That is a *choice that was in the menu*, now
  with the right words on it; it is no longer a death the player could not see coming.

### The adversary: three interferences, three answers

| Interference | The page said | Boring / unfair / flat |
|---|---|---|
| Paid the cell (kite) | the yard fills (hired men), "Yard's closed, for stocktaking" at the gate after the fence failed | the first line was wrong (the Anchor); the hint of the coal was missing. Now it warns the evidence will burn. |
| Searched the cellar and slept in the taproom | not played to the night (the test covers it) | n/a |
| Talked the lieutenant (all four) | a letter, the swept store, a bill on the harbourmaster's door | sharp when it happens thirty minutes later; before, a company that was in the room saw it all in one breath. |
| Showed the Principal | nerve 1 ran, 2 and 3 fought | see above. |

The three responses differ in kind (a hand posted, a man sacrificed, a head that runs, buys or stands); each is a sentence
the player reads. That much of the design held up.

## 2. Do the ranks feel different to meet?

Yes, and most of the difference is in the words; the stakes were uneven.

| Rank | Voice | Stakes (what is lost) |
|---|---|---|
| Cellar-men | blunt, in prices: "Six coin to have not seen it." | none that a coin and a minute do not cure; *flat*, as it should be at the bottom |
| Fence | dry, bookkeeper's: "Cellars are damp." / (new) "I have never once been asked to add it up." | her suspicion; the key is the prize |
| Lieutenant | three temperaments; jovial, then brittle; rueful, then afraid; the only one who wants something | himself: the one rank whose fate the player decides, with the best choice hidden before; now labelled by the Principal's reaction |
| Principal | formal, impersonal, third person: "One does not hold them long, one passes them" | the whole Ring; before, a coin-flip into a fight; now a nerve with an hour in it |

## 3. The Lamp Below

Played in `ash` (ranger, warrior, cleric) after the flight of the Principal; the trap in Skerrow's oil store opened the
next watch ("a trap... with its hasp cut"; Marren Kestle cuts the House's padlock "like a dead bird"), and stood
shut before it (`ring-hierarchy`).

* **Is it a descent?** Mostly, in the writing: the warm stair, "the last name is a girl's", the drift of coins ("a button, a
  milk-tooth, a ribbon"), the tick that slows to less than a pulse, the breath at the gate, the heat at the bottom. Each room
  is warmer and slower than the one above. *Where it was a list of rooms:* the rooms did not look back. The way up was
  the same text as the way down; nothing marked the climb. *Fixed:* a coin may be left in the drift on the third turn
  (one coin; nothing in the rules asks for it), and a company that did finds it "bright again" on the way up; the stair-head
  after the engine is done says "the first light you have seen in hours that did not come off brass".
* **Do the three acts differ in kind?** Act I (the gate) is a *lock*: five ways, all of them tools (rubbing, tumbler, bar,
  Marren's counting). Act II (the wheel-floor) is a *hazard* with five ways, one a cost (the brake). Act III (the well) is a
  *person*: the Governor counts, and four ways answer a count. They differ in kind in the writing, and Act II and Act III
  differ in what they cost; Act I did not cost anything but the bar. In play the gate and the floor both felt like "pick the
  tool that the company has", which is the shape of a puzzle room, not of a descent. The cost of the brake ("Above you...
  the Pharos goes out") was the best beat in the Lamp and it had no clock: nothing happened on the Reach.
  *Fixed:* the brake starts a day; if the pilot has not been fed in that day, "the thump of a gun, and a second, and no
  third" is heard through the rock and a boat's spars lie on the strand at the Pharos's foot. Feeding the pilot (the keg)
  in time saves the Reach. *Test:* `ring-lamp` "has the brake cost a night on the Reach...".
* **Silent in a drawn world (the worst of the Lamp).** `vStair` was `false` for a ranger on the black stair: every voice, and
  the mage's `cipher_the_wheels`, and the cleric's `read_the_office`, asked `hasCalling(?m, calling_x)`, which never fires in
  a drawn world (a member's `hasCalling` names `linkptolleth__calling_ranger`, the rule's `ptolleth__calling_ranger`;
  `calling-portability.md`). The standalone tests passed. A player in a drawn world got no thief at the gate, no mage at
  the wheels, no cleric at the Governor: the "calling-unique ways through" did not exist. *Fixed:* `brings(?m, woodcraft)` and
  its five fellows in `lamp.kyr`. *Test:* `ring-played` "speaks to the company by what its members bring". *Open (not mine):*
  `voices.kyr` of the Dorothea has the same line in a dozen places.
* **Flat: Oswin Tarn.** "Choose one of us to carry, if you have to" promised a choice; `carry_oswin` carried him and nothing
  was lost, the word was already in the company's head. *Fixed:* he or the book. Carrying him up leaves the notebook on the
  bench ("It was a reading. Only ever a reading."); taking the notebook leaves him to be fetched, and Marren at the
  oil store says "You carried his paper up and left him with the lamp. She does not say it as a charge. She says it as a
  sum." Each ending has a line at the top of the stair.
* **Fair/unfair.** The Governor was fair in every route played: the word, the oil, the cleric's office (now in a drawn world,
  with the cleric named). The bar's cost was invisible; it is now a clock (above). The Governor fight at level 6 against a
  company that has run a bar through the gate is a real death; the page tells you what it is ("One keeper. One counter.
  All others are removal.") and gives you the word at the gallery before you arrive.
* **Not tried:** the lone company (tests), the tally-crawl in a drawn world.

## 4. Not played

* The voyage Tolleth to the Ness by waiting at the deck: the ketch sails at noon, goes to the open sea and **stays**
  (watch 321 to 597, five days, `hull at open_sea`, the company on deck, no arrival). The voyage wants the company's
  hands (the lead-line, the pump); a company that only waits is stranded by design, but the Ring's player is told nothing
  of that. For the Ring's purposes the Ness is four coin and a sea voyage the company must work; that is the Dorothea's own
  pass, not mine. (Reported to the coordinator.)
* Wren, and the other terrains for each seed (the table in `10-exchange.md`/`17-the-ring.md` 17.1 is what Deem draws).

## 5. The Deem tables

* The Exchange's five-seed table in `10-exchange.md` is unchanged: neither `templates.json` nor `tables.json` was edited
  (`exchange-responds` and `factors-handoff` green).
* No dwarf thief, or any ancestry that cannot take its class, in any table: `ring-casts.test.ts` checks every ancestry in
  every terrain group (and `default`) of `lieutenantFolk` (thief), `principalFolk` (warrior), `carterFolk` (the hired men,
  warriors; the cell, commoners), and the other goings-on's folk tables (`drover`'s and `disputation`'s class by ancestry,
  `oldcoin`'s scholar) against `ancestries.json`. None mismatches. The lieutenant's table has no dwarf.
