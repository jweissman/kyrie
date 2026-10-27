# Creative direction: from a world to an evening

A direction for the builder and authors, written from the creative director's chair. It turns the
[report](report.md) and the [deep dive](deep-dive.md) into concrete changes: economy numbers, navigation behaviour,
quest continuations with draft content, and a test for each. It ends with rough first runs of three of the proposed
experiments ([§7](#7-experiments-first-runs)).

Nothing here asks for new systems. Kyrie already has the parts: temperaments, discoveries, objectives, the "talk is
all of…" line, the den, the companion offer, `SINCE YOU WERE LAST HERE`. Almost every proposal connects, re-weights
or surfaces something that already exists.

---

## 1. What a thirty-minute session should feel like

The target shape is an **evening at the inn between two journeys**: one strong want, one expedition with one or two
real decisions, a return in which the village has visibly changed, and a new want that came out of what you did.

| Minute | Today | Target |
|---|---|---|
| 0–5 | Arrival; a premise; a great inn rumour list | Same. Keep it. |
| 5–10 | The premise often resolves (feverwort: 3 clicks) | The premise *starts*: its first step reveals a second fact that makes it bigger |
| 10–25 | Long journeys, then one ruin or nothing | One expedition with a cost you chose (light, coin, a companion, a risk) |
| 25–30 | "Nothing more is asked of you" | The village has changed; a *named next intention* is waiting in Notes and in someone's mouth |

### Four pillars to judge every change against

1. **Every place answers you.** If the text offers something (a moss that binds wounds, a mud that "will not have you
   here long", a pipe that goes one way), the interface either offers it or says why not.
2. **Kindness and knowledge are keys.** Petting a dog found a father; a promise to a priest found a monster's
   weakness. Non-combat acts must be at least as reliable a route to progress as an axe.
3. **The village remembers.** Every return shows a change, and every resolution leaves a successor.
4. **Light, coin and health are scarce for the whole first week.** One ruin should buy *one* good thing, not the
   shop.

---

## 2. Economy: concrete numbers

The measured problem: one ruin per country holds a median 3,789 coin and treasure (8.75× the whole country's shop
stock) and about 12,000 experience (level 1 → 5). Errands are worth 0–150.

### 2.1 Treasure and coin (data and tables; generation builder)

| Lever | Today | Proposed | Where |
|---|---|---|---|
| Room coin | `(1 + d20 + 10·depth) × generosity` | `(1 + d6 + 3·depth) × generosity` | `deep-pacing.ts:127` |
| Makers' valuables (`worth`) | 30–1,500 (crown 1,500, torc 300, necklace 350) | ÷5 (crown 300, torc 60, necklace 70) | `deep-purposes.ts`, `deep-sites.ts` `worth` |
| Treasure items per room | `0.3·g` + `0.06·g` chances | unchanged | — |
| Village buyer's purse | about 1,000 (salter), 300 (others) | 120, restocking 20 a day | region writer: merchant `quantity(gold)` |
| Market-town buyer | same as village | 600; the only one who will take a piece worth over 100 | new `buysAbove` on one settlement per country |

**Expected result** (to check with `lab/census.ts` + `summ.py`): the big ruin's coin and treasure fall from a median
3,789 to about 700. That covers the debt, one curiosity-shop item (100–300) and a month of beds, but not the shop.
Richest site to shop catalogue: about 2× (today 8.75×).

**Why ÷5 and not ÷10:** the debt (50) must still be payable from one ruin plus selling; a crown that is still worth
a journey to a town (300) gives the second expedition a reason.

### 2.2 Experience (rules plus data; M17 builder)

| Lever | Today | Proposed |
|---|---|---|
| Origin modules | `Goal false`, no `experience` | a real goal (debt paid, copy shown, medicine given, father found) and **300** experience; this also makes them appear in SEEN THROUGH |
| Goings-on | 100–150 | 300 |
| Situations, kits | 200–800 | ×1.5 |
| Fight experience | `Σworth + 10n² + 25`, **divided** by standing members | ×0.5, **not divided** (each standing member gets it). Solo stays the same speed; companions stop being a cost. |
| Treasure sold | worth → experience, each member | worth → experience at **half** the new (÷5) worth |

**Expected:** a solo warrior clearing the big ruin reaches level 3, not 5. A family's grief resolved (300) is worth
about a third of a level, which is noticeable rather than a rounding error.

### 2.3 Things worth buying (sinks that make play, not just drain coin)

Each sink below *changes what you can do next*, which is the only kind worth adding.

| Sink | Price | What it opens | Content cost |
|---|---|---|---|
| **A site chart** from a priest or scholar: "a plan of Pluwalac, as the brothers drew it" | 20–40 | marks one-way passages, the safe room, and the trap rooms of one ruin before you go | one item kind per deep purpose; the map reads it |
| **Day-hire of a specialist** (a tinker for trapwork, a scholar for lore, a pilgrim for rites) | 6–10 a day | opens the "Needs trapwork / lore / rites" gates without a permanent companion | uses existing recruits with a daily fee |
| **A ten-foot pole and rope at every wright's yard** | 1–2 | the universal trap answer, now *chosen* | stock rule |
| **Armour upgrades at the smith** (leather → mail 60, mail → plate 200) | 60–200 | turns a fragile build into one that can take the big ruin | smith stock; start warriors in mail, not plate |
| **Shrine services:** raise the fallen (150), lift a curse (50) | 50–150 | makes death of a companion recoverable, at a price | already in rules (`raise_dead`); price it |
| **Glossary of the old script** (exists: 80) | 80 | gives lore checks advantage for a scholar | exists |

**Acceptance:** with 2.1 in place, at the end of the first ruin a player should *have to choose* between the chart
for the next ruin, mail, and a specialist's week. Measure with a scripted shopping list against
`census.ts` totals.

---

## 3. Navigation and attention: concrete behaviour

Measured: in towns a median of 16 top-level items (90th percentile 22) and 25 legal commands (90th percentile 40).
In the instrumented session (§7.2), **half of all pure interface operations were opening and closing
conversations**, and 10 scroll gestures went mostly to reaching "Take your leave".

### 3.1 The intention strip (new; M17 builder)

A single line under the place title, always present:

> **Your aim:** Bring the crown out from under Tenebrerecs · *Set out (5 legs, 3 hours)* · *Why?*

- It shows the objective the player marked "Follow" in Notes (default: the newest one).
- *Set out* is the existing journey for its place; *Why?* opens the Notes entry with its source ("Emric, salter,
  told you, Day 1").
- When there is no objective, it shows the best rumour instead: "The talk at the Shining Horse is of the forty
  crowns in Merrowdale · *Ask*".
- On a phone it is the first thing under the title, above the prose.

**Test:** attention budget (§7.2) for "go to my goal" drops from 3–4 operations (Notes → read → Map or scroll to SET
OUT FOR → click → Set out) to 1.

### 3.2 Notes as a plan, not a ledger

- **Unfinished** gets three sub-heads: *Now* (the followed aim), *Open* (other objectives), *Heard of* (places with a
  known way). Each entry has *Set out* and *Follow* buttons.
- An objective that is resolved moves to SEEN THROUGH immediately. Today Nackle's "wants to be taken to
  Sublimisporta" stayed after he paid.
- A thread that can no longer be advanced (the philosophers after a failed check) says so: "Emric and Alarion are
  still at it on market days; you may try again with something new to tell."
- "Nothing more is asked of you" is retired. If nothing is open, Notes shows the two nearest staged situations as
  "You might…" lines (see §4).

### 3.3 Conversations without bookkeeping

- A conversation ends when you choose anything outside it (a way, a thing, another person). No "Take your leave"
  needed; keep it as an option, but pinned at the top beside the portrait, not at the bottom of the list.
- Topics already asked collapse into one line ("asked: the river, home").
- The companion stat block starts **collapsed** ("A halfling warrior of level 1, asking 3 coin ▸").
- The hire offer is a first-class topic: once the traveller is met, "Ask {them} to come along · 3 coin" appears
  directly, without having to know to ask what brings them.

**Expected:** in the instrumented session (§7.2), 7 of the 24 interface operations and 4 of the 10 scrolls
disappear (every "Take your leave" and the scrolling needed to reach it).

### 3.4 Honest ways

| Case | Today | Proposed copy |
|---|---|---|
| One-way passage | "To the pipe gallery" | "Down the great pipe, feet first · *no way back up this way*" plus a "Look down first" act |
| Hazard on a way | "Ithil goes first / Gizon goes first" | add the expected harm: "Gizon goes first (8 HP; spikes, poison)" once looked at |
| Territorial warning | "will not have you here for long" | add a visible fuse after the line: "· *it will come at you if you stay*" |
| Withheld use of an item | (nothing) | under the item: "Binds a wound · *needs Mending*" |
| A place with two names | "Pluwalac" / "a square doorway… north-west of Merscstede" | once the name is known, use it everywhere; keep the description as a tooltip |
| Light, mage | only in Pack | in the dark room's own list: "Light: *Ithil's spell* · *a torch*" |

### 3.5 Journeys that stop only when it matters (`src/session/travel.ts:72–92`)

| Stop | Keep? | Rule |
|---|---|---|
| Set upon | yes | only when a hostile band actually acts (not on any combat-log event such as a spell ending) |
| A staged scene | **only if new** | stop for a staged scene the first time it is seen; after that, mention it in the leg's line |
| "There is danger here" | **only if hostile and not tolerated** | hobs you parleyed with no longer stop you |
| Nightfall | **before** the leg, not after | if a leg would end after dark: "This way ends after dark. *Camp here* · *Go on*" |
| Cross-country legs | **ask** | never planned silently; offer "the long way by road (4h)" or "strike across (2h30, you may lose the path)" |

**Test:** the Merscstede–Pluwalac trip should stop zero times at the ford for a known drove (today: four times).

---

## 4. Quest continuations: every resolution leaves a successor

A rule for every authored module: **the closing beat installs one named, placed objective**, voiced by a person who
cares. Three continuation types, from cheapest to richest:

- **Consequence:** something your act caused now needs you (the diggers at the barrow because you sold its gold).
- **Offer:** someone you helped asks for more, or comes along (Nackle's "I could keep reading with you" is the
  model; it already exists, and it is the best renewal in the game).
- **Pointer:** what you learned points at a place (the oxen dragged toward the hills).

Below are drafts for every origin and the most common goings-on. The Kyr is a sketch of intent, not checked syntax.

### 4.1 Coming home (drover): *the thing that took the oxen*

Today the discovery says "whatever had the oxen dragged them off toward the hills". The son says "I want to see it",
but only to a stranger, and nothing names a place. Every country has a `den` module, whose beasts can be **smoked
out with woodcraft**, and the Coming-home herdsman has woodcraft. The continuation writes itself:

```kyr
// drover: bind the country's nearest den as a role
Place lair "The den" is room.                      // imported: den's `den`, chosen by the generator as the nearest
Entity oxen_trail: fact "From the ditch, two furrows and a line of great prints go up the bank and away toward {lair}.".
Observe trail at road as sign when knows(party, found_cart) and not knows(party, oxen_trail)
  "Up the bank from the ditch, two furrows and a line of prints too big for a dog go away toward {lair}." teaches oxen_trail.
Topic son_after_kin with son "Ask {son} what he means to do now" when kin(actor, son) and knows(actor, oxen_trail) once {
  Says "'Whatever took them is up at {lair},' says {son}. 'I saw the marks. I want to see it.' He looks at the spear. 'And I want the yoke back. It was Grandfather's.'".
  On discuss { Assert willing(son, actor). }
}
Objective oxen when knows(party, oxen_trail) and not cleared_lair() "Whatever took your father's oxen dens at {lair}.".
Item yoke "your grandfather's ox-yoke, carved" is treasure at lair hidden until cleared_lair.
Event mother_yoke near wife when carries(party, yoke) "'You brought it back,' she says, and hangs it over the hearth where it always hung, and does not say anything else for a long time.".
```

This gives a choice the herdsman is built for (smoke out with woodcraft and take the yoke without a fight, or fight
for the hides and the hoard), a companion with a personal stake, and an emotional return beat. **This is the
renewal A/B prototype (§7.3).**

### 4.2 What is owed (debt)

- **Today:** pay, get a smile, done. The origin has `Goal false`.
- **Continuation (offer and consequence):** on paying, the creditor (who buys grave-goods) says: *"You found the
  money in the old king's house, didn't you. There is a buyer at {town} who pays what things are worth. Take him the
  crown, and bring me a fifth."* That installs "Take the crown to {buyer} at {town}" (uses the market-town buyer from
  §2.1). On the road there, **the company's diggers** (already a living-world line) want it too: a rival on the road
  who can be bargained with, bluffed or fought.
- **Cost:** one Topic, one Objective, one encounter kit reusing `raidersFolk`.

### 4.3 The brothers' errand (order)

- **Today:** read one pillar, show the copy, +40 coin, 0 experience.
- **The copying should be an act.** At the inscription, offer "Copy it out (2 hours, a light)" or "Rub it with
  charcoal (20 minutes, needs paper from the priest)". The copy is an **item** you carry.
- **Continuation:** the priest reads the copy and finds the name of the sealed place it mentions (Pluwalac's gate in
  Wǽtfaenn already exists). Install "The copy names {deep site}. {priest} will not bless opening it." This makes the
  cistern negotiation (promise, lie, argue) the second step of the scholar's story rather than a side menu.

### 4.4 Feverwort (herbs)

- **Today:** three clicks; the mother takes the herbs "without a word"; a stray willow-bark note lingers.
- **Make it last ten minutes, not three clicks.** On arrival the child is *worse* than the herb-wife thought. The
  feverwort holds it a day, and Lia says the willow bark (already in the text) would break it. That turns the
  orphaned note into the next step: "Willows grow where there is water." The kindness pays twice: Lia's gratitude
  (a bed for free, forever: an `offers` lodging at 0) and a sign on her door the village notices.
- **Continuation (pointer):** the fever came from the well by the old stones. The disputation or oldcoin module, or
  a `den` of the unquiet kind, is bound to it, and the "say the rites" non-combat solution is the cure.

### 4.5 Over the hills (wanderer)

- **Today:** "the place to hear of work is the inn", and the inn has no work.
- **Continuation:** the inn notice board lists **three jobs** drawn from what is already installed: the escort
  (oldcoin: "take a scholar to the fallen walls, 10 coin"), the bounty (Garth's ewes: "8 coin"), and a carrying job
  (the messenger who "cannot stop" hands you a satchel: deliver to {town} for 6 coin). Each is a Topic on the
  innkeeper ("Ask {innkeeper} about work"), and each is an objective once taken.

### 4.6 The dilemma pattern (brood, oldcoin): keep, and finish the affordances

The Silkholme brood (burn the spiders for the shepherd, or feed the starving mother for the silk-winder) is the
best-designed choice in the generated content. In play, the feeding route was **unfindable**: the ewe Odile says to
bring was not takeable anywhere I looked, and clicking the brood-mother gave no options. Fix the affordance, not the
design: put the carcass at the pit's lip as a takeable thing ("what is left of Garth's ewe"), and give the
brood-mother an always-visible act ("Offer her something · *you carry nothing she will take*").

### 4.7 The renewal floor (generation)

- Each country keeps **at least one clocked situation within a day's walk** of the player at all times.
- When one resolves or expires, promote the next nearest and **voice it through the inn line** ("The talk is all of
  …"), which is the most effective invitation in the game.
- **Test:** hours with an empty Unfinished over five game days (today in Blackcarr: every hour from day 1, 12:50 p.m.).

---

## 5. Making non-warrior starts real

From the simulation: a solo level-1 mage or thief wins 0% (median) of the big ruin's fights. A cleric wins 25%.

1. **The opening offers the companion.** For a mage, thief or cleric protagonist, the starting town's traveller
   approaches in the first scene: *"You look like someone who reads more than they walk. I could carry the lantern."*
   (one Event per calling).
2. **Recruits keep their calling.** The scholar becomes a bard or cleric if the people cannot be mages, never a
   warrior (`region-recruits.ts` fallback).
3. **First ambush grace.** The first time a savage or ambush band falls on the company, the company sees it a moment
   before ("Something moves in the dark ahead": one free turn). Later ambushes are as now.
4. **A safe room in every ruin over 10 rooms** (the Wardens' hall is the model), marked on the site chart (§2.3).
5. **Trap answers by class:** a mage can *Mage Hand* or *Light-cast-ahead* a pressure plate; a cleric can bless a
   glyph; a bard can sing the hobs past. Each class gets one of the five trap answers, so the pole is not the only
   key.

**Acceptance:** rerun `lab/sim.ts` with the opening companion: median big-ruin win of at least 0.6 for every class.
Rerun `lab/fragile.ts`: no death in the first ruin before the player's first turn.

---

## 6. Protect (do not homogenise)

- The restraint of the prose at moments of loss. Put renewal *beside* it, never instead of it.
- The danger estimate's honesty ("You would likely beat them, but you could fall, with no one to get you up").
- Temperaments: savage, territorial, wary. They make monsters behave, not just hit. Explain them; don't flatten them.
- The development page's "Opens the gap over the portal stone". Every new skill should name a place.
- The inn's "the talk is all of…". Use it more, not less.

---

## 7. Experiments: first runs

### 7.1 Fragile start audit

*Filled in from the run below; see [`lab/fragile.ts`](lab/fragile.ts) and
[`lab/fragile-summ.py`](lab/fragile-summ.py).*

**Setup.** 20 seeds × 5 origins × {mage, warrior, mage with the town's traveller hired}, to the first ruin the
player is told the way to ("first"), plus the debt origin to the country's largest ruin ("big"). That is 360 runs, of
which 351 finished (9 timed out). The scripted player is an *ordinary careful* one:

- It asks every rumour in the starting town and camps at nightfall.
- It lights the dark, tries the "Work it" actions and riddle words, and looks closely at traps; it uses a safe way
  past if one is offered, and otherwise sends the hardiest member first.
- It rests when below 60% health if it can, never risks a trap while hurt, and takes on only fights the page
  reckons slight, fair or hard.
- Fights use the game's own tactics, and the player's turns are counted. Data: `lab/data/fragile.json`.

| Ruin | Company | Reached | Fell (of reached) | Killed by trap / set upon | Fights | Fights with no player turn | Climax reads "no match for you" on arrival | Climax reads deadly |
|---|---|---|---|---|---|---|---|---|
| first | mage | 86% | **27%** | 8 / 7 | 7 | 0 | 0% | **85%** |
| first | mage + hire | 89% | 20% | **0** / 15 | 18 | 0 | 2% | 34% |
| first | warrior | 86% | 19% | 1 / 15 | 34 | 4 | **34%** | 27% |
| big | mage | 95% | **74%** | 9 / 4 | 4 | 0 | 0% | **100%** |
| big | mage + hire | 95% | 53% | 1 / 8 | 10 | 0 | 6% | 53% |
| big | warrior | 95% | 53% | 2 / 8 | 19 | 3 | 18% | 35% |

**What it shows:**

1. **Deaths before the first player decision are rare, not typical.** There were 5 in 351 runs, all the same seed4
   situation (a warrior brought to 4 HP by a trap, then set upon before acting). Osric's frog death in my hand play
   was unlucky, not representative. The fragile-start problem is a different one:
2. **Mages are killed by traps they must walk into.** 9 of the 14 solo-mage falls in the big ruin were traps
   (`risk`, with no trapwork and no pole). The player's "decision" there is only *who* takes the hit, and alone
   there is no choice. With the hired traveller, trap deaths drop from 8 to 0 in first ruins (the companion goes
   first) and the climax's "deadly" reading from 85% to 34%. **The companion offer (§5.1) is the single biggest
   lever for non-warriors**, and it already exists in every starting town, hidden behind small talk.
3. **Warrior climaxes are often trivial.** In 34% of first ruins (18% of big ruins) the site's worthiest band reads
   "no match for you" to a fresh level-1 warrior. A mage meets the same climaxes as deadly 85–100% of the time.
   The same content is a walkover for one build and a wall for another, which argues for §5's class-specific trap
   and danger answers rather than a global difficulty change.
4. **A quarter of first ruins are empty.** 68 of 253 first ruins reached had no hostile band at all (errand sites
   such as the order's copying ruin). That is fine as variety, but these rarely have another hook inside (no
   rival, no machine to work), so the trip's only reward is the one click of reading.
5. **Camping in the open hurts the fragile.** A 4-HP mage loses 1 HP to a night in the wild (5 runs of each mage
   variant; 0 for the warrior): a quarter of their health before the ruin.

**Limits.** The bot reaches about 5 of a first ruin's 14 rooms (7 of 30 in the big ruin) before mechanisms and
barred ways stop it, so deeper dangers are under-sampled, and falls are probably *undercounted*. It never buys
equipment and never uses consumables. The danger labels are the page's own estimate (`DangerSense`, 6–12
simulated fights) at the moment of arrival, at full health. Rerun it after §5:

```sh
bun doc/playtests/play-structure-2026-10-26/lab/fragile.ts seed1 order mage first hire
python3 doc/playtests/play-structure-2026-10-26/lab/fragile-summ.py   # summarises lab/data/fragile.json
```

### 7.2 Attention budget (baseline)

One instrumented session in the real page (Mountainmoor, pinned seed, human warrior, What is owed), 45 operations
from the title to the spider nest, hand-coded from the operation log
([`lab/data/attention-session.jsonl`](lab/data/attention-session.jsonl), driver
[`lab/attention-driver.js`](lab/attention-driver.js)).

| Kind | Count | What |
|---|---|---|
| Meaningful acts (outside travel) | **15** | 8 questions that taught something; a promise to the creditor; hiring Nackle; reading the stones (resolved: +100 XP); taking a torch; lighting it; hacking through the webs; asking Odile |
| Travel operations | 6 | choosing a destination and setting out (×2), two ways into the sink |
| Pure interface operations | **24** | opening a conversation (7), "Take your leave" (7), opening and closing Notes (2), opening a thing to take it (1), walking between rooms to reach people (4), character-creation setup (3) |
| Scroll gestures needed | 10 | 9 outside travel: 2 on the premise screen, 4 to reach "Take your leave" below topic lists, 2 to reach low topics |

**Operations per meaningful act, outside travel: (39 operations + 9 scrolls) / 15 = 3.2.** Excluding the
character-creation setup: (36 + 7) / 15 = 2.9. That is at the edge of the proposed target of under 3.

**Where it goes:** conversation framing (7 opens + 7 leaves) is 14 of the 24 interface operations, and 4 of the
scrolls exist only to reach "Take your leave". Applying §3.3 (no explicit leave, leave pinned beside the portrait)
removes 7 operations and 4 scrolls: (32 + 5) / 15 = **2.5**. The intention strip (§3.1) removes the Notes
round-trip: **2.3**. The next largest cost is walking room to room to find people (4); a "People in Gibagabar" list
on the green with *Go to* links would remove most of it.

**Caveats:** one session, one player who knew the interface; a newcomer would add Map and Notes inspections.
Rerun with the driver after §3.3 lands, on the same seed (`SEED_BYTES='[10,200,33,77]'`).

### 7.3 Renewal A/B ("the thing that took the oxen")

This needs people, so it isn't runnable here. What I can provide is the protocol and the B-arm content (§4.1).

- **Arms:** A = today's drover module; B = §4.1 (the trail, the son's line, the objective, the yoke and the
  mother's beat).
- **Who:** 8–12 players new to Kyrie, Coming-home origin, any class, pinned seed with a `den` within one day's walk
  of the village.
- **Measure:** (1) whether they continue playing at least 15 minutes after "SEEN THROUGH: The drover who did not
  come home"; (2) whether they can say, unprompted, what they want to do next within 60 seconds of that line; (3)
  in arm B, which route they take at the den (smoke or fight), and whether they bring the yoke home.
- **Expected effect:** A continues by inertia or stops. In B, players state the next intention, and those who
  continue most often take the woodcraft route. That would show that a single successor objective, plus a
  non-combat answer the character was built for, is enough to sustain the next half hour.
- **Cheapest version:** five testers, one seed, think-aloud, two arms swapped between sessions.
