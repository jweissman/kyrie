# Deep dive: measuring what the first pass felt

A follow-up to [the play-structure report](report.md). The first pass was six sessions of hand play. This pass does
three things:

1. **Measures** the main diagnoses across many generated countries, using the engine itself: a census of what
   every world contains, a fight simulator over every hostile group, a text-repetition count, and an action-load
   count. The scripts and data are in [`lab/`](lab/); see §11 for how to rerun them.
2. **Plays further:** days 3–4 of a mage-and-bard company in Wǽtfaenn, into the sealed cistern at Pluwalac; three
   further days in Blackcarr after its story ended; and a reload of the Wǽtfaenn save to check a claim.
3. **Traces causes in code** for each failure, so the remedy can go to the right layer.

It also **corrects three claims** in the first report (§2, §4, §4a).

Concrete proposals and the first experiment runs are in [creative-direction.md](creative-direction.md).

Commit measured: `6596e18`. Unless stated otherwise, every number below is over 24 seeds (`seed1`…`seed24`), the
debt origin, and a human warrior protagonist.

---

## 1. Headline findings

| # | Finding | Evidence | Layer |
|---|---|---|---|
| 1 | Every country has **exactly one** large ruin. It holds a median **3,789 coin and treasure** (min 2,770, max 8,760) and **8,390 fight experience** (6,185–13,305). | census, 24/24 seeds | generation tuning (`deep-pacing.ts`, Orsino tables) |
| 2 | That one ruin is worth a median **8.75×** (1.4–38×) the value of **every item for sale in the whole country**. Its floor coin alone (median 372) is 7× the debt. | census | economy |
| 3 | Clearing it solo takes a level-1 character to about **12,000 XP, which is level 5**. Every small errand together is worth a few hundred. | thresholds 1,000 / 3,000 / 6,200 / 10,900 | progression |
| 4 | Combat XP is **divided** among those standing; treasure-sale XP and module XP go **in full to each** member. Companions halve your fight experience. | `field-use.ts:21–28`, `field-resolver.ts:80–88` | progression rule |
| 5 | Solo at level 1 in the big ruin, from full health each fight: a **warrior** wins the median fight 80% of the time; a **cleric** 25%; a **thief** 0%; a **mage** 0%. 97% of fights are below 50% odds for a mage. | 12 seeds × 4 classes × every group × 20 trials | balance, origins |
| 6 | **55%** of hostile groups attack on sight without a warning turn (savage, ambush, obedient, or wary when cornered). | temperaments of 229 groups | encounter design |
| 7 | A third of each country's **narrated** sentences (33%) appear verbatim in at least 75% of other countries; 7% appear in every one. | 12 seeds, rule and observation text only | content |
| 8 | **Every** country has a hireable traveller in the starting town (16/16). The offer is always hidden behind "Ask what brings them". | recruits census, `region-recruits.ts` | presentation |
| 9 | After a story resolves, **nothing new appears**: three game days in the inn produced an identical rumour list, an empty "Unfinished", and the same ambient lines. | Blackcarr play | content, living world |
| 10 | In towns the screen model holds a median **16 top-level items** (90th percentile 22) and **25 legal commands** (90th percentile 40). | autoplay, 8 seeds × 150 steps | presentation |

The pattern: Kyrie generates **one Orsino-scale dungeon inside a village-scale economy**, then gives a solo
non-warrior almost no way to survive it, and almost nothing to do outside it.

---

## 2. The economy, measured

`summ.py` over `data/census.json`:

```
large ruins (>=15 rooms) loot coin+treasure: min 2770 med 3788.5 max 8760 (n=24)
large ruins fight XP:                        min 6185 med 8390   max 13305 (n=24)
large ruins floor coin:                      min 222  med 372.5  max 597  (n=24)
small sites loot:                            min 2    med 100    max 1075 (n=173)
whole-country shop catalogue value:          min 209  med 343    max 2590 (n=24)
richest single site / shop catalogue ratio:  min 1.4  med 8.75   max 38.1 (n=24)
large ruins per country:                     exactly 1 in every seed
```

**Cause.** Room treasure is Orsino's table at Orsino's odds
(`src/world/deep/deep-pacing.ts:114–128`, coin `(1 + d20 + 10×depth) × generosity` per room). Valuables are the
"makers' own" kinds with worths of 30–1,500 (`deep-sites.ts:165–170`, `deep-purposes.ts`). Village prices are a
separate scale (bed 1–3, ration 1–3, lantern 7). No step reconciles the two scales.

**Correction to the first report.** "Nothing to want" is too strong. The catalogue is usually small (median 343
coin for everything), but some countries carry a curiosity shop. Wǽtfaenn's sold Kingsfoil (75), a Scroll of
Domination (100), a Scroll of Fireball (200), Wands of Magic Missile and Polymorph (250) and a Ring of Protection
(300). That is one real sink, in some countries. The ruin's 3,789 still buys the whole shop, often twice.

**Merchant purses are finite** (village buyers mostly hold 1–6 coin; one salter per country holds about 1,000; a
couple hold 300). Emric running dry in Session 2 was this cap, which is good friction. But in every country one
buyer can absorb the whole first haul.

**Experiment-ready remedy.** One multiplier on room coin and on the makers' valuables (try ÷6), and route anything
worth over 200 to a buyer in a *larger* town (the crown already says "take it to a town"). Target: after the first
ruin, the player can afford one curiosity-shop item and not all of them. See §10, experiment B.

---

## 3. Progression, measured

Thresholds (`data/catalog/vocabulary.json`): 1,000, 3,000, 6,200, 10,900, 17,400…

| Source | Experience | Notes |
|---|---|---|
| Origins (debt, order, kin…) | **0** at the origin itself | `data/origins/*` declare none; Coming home's 100 is the *drover* going-on |
| Goings-on (fever, drover, quarrel, oldcoin) | 100 | disputation 150 |
| Kits (toll-road, bounty) | 200–300 | |
| Situations (den, brood, caught-below, tower) | 200–800 | |
| Authored adventures (Long Man, Tessary) | 1,000 | |
| **Big ruin, fights** | **median 8,390** | divided among those standing |
| **Big ruin, treasure sold** | **median about 3,400** | worth = XP, *to each member* |

Two rule-level incentives fall out of `field-use.ts` and `field-resolver.ts`:

- **Go alone.** A fight's experience is `Σworth + 10n² + 25`, divided by party members standing. A hired companion
  halves it. Treasure sold is granted in full to each member, so this is not symmetric: a companion costs you fight
  experience and gains you nothing on sales.
- **Sell everything.** The first sale of any treasure grants its worth as experience. The cheapest way to level
  is to carry things to a buyer.

Neither is wrong for an OSR game in itself. Together with §2, they make the ruin the only meaningful advancement
in a country, by a factor of more than 20.

**Remedy (data plus one rule):** give origins 300–500; scale module experience to about 30–50% of the country's
ruin rather than about 10%; consider granting fight experience to each member (or halving the split's penalty) so
companions are not a cost.

---

## 4. Danger and class viability, measured

`sim.ts` runs every hostile group in a country, 20 times each, against the protagonist alone at level 1 and full
health, using `Battle.encounter` and `Tactics.choose`, the same machinery as the page's danger estimate
(`DangerSense`).

| Class (level 1) | Starting HP (median) | Big-ruin fights: median win | Fights under 50% | Fights at 90%+ | The king, median win |
|---|---|---|---|---|---|
| Warrior | 14 | **0.80** | 32% | 41% | 0.90 |
| Cleric | 9 | 0.25 | 61% | 15% | 0.25 |
| Thief | 7 | **0.00** | 90% | 0% | 0.00 |
| Mage | 4 | **0.00** | 97% | 1% | 0.00 |

Every origin except Coming home sends the protagonist out **alone**. The warrior is the only class for which the
country's main content is survivable alone, and for the warrior the climax (the king) is often the *easiest*
fight. Session 2's "easily won" king was typical, not a fluke. The bone hounds and great hound in the middle of the
ruin are the real difficulty spike (0.35–0.80 in the sample seed).

**Temperaments.** `data/rules/inhabitants.kyr` is a genuinely good piece of design. Territorial groups warn, then
attack once their `patience` (the rest of the current ten-minute watch) runs out. Savage ones attack at once. Ambush
groups spring unless someone in the company has *perception*. Obedient ones keep their post. Wary ones flee or turn
when cornered. Across 229 groups, **55% attack without a warning turn.**

The page explains none of this. "It will not have you here for long" is a ten-minute timer: in Pluwalac, reading
the inscription on the cistern gate used up that time, and the mud attacked. Perception against ambushes is never
mentioned in character creation or at level-up.

**Correction (§4a).** The first report said Wǽtfaenn had nobody to hire. Wrong: Gizon the minstrel offered at
option 4 of 5. The recruits census shows a hireable traveller in the starting town in 16/16 countries, and
`region-recruits.ts` says so by design ("a company of one is never long alone"). The offer is reached only through
"Ask {them} what brings them to {town}". That reads as small talk, and a newcomer, or a reviewer, skips it.

**Another cause found.** Ander, the "scholar" who was a halfling warrior: `RegionRecruits.traveller` maps scholar to
mage, finds halflings cannot be mages, and falls back to `allowed.find(adventuring)`, which is warrior first. A
character described as a copyist then fights like a soldier.

**Remedies:**

- Make a companion part of the opening for non-warriors. Have the traveller approach a mage, thief or cleric
  protagonist in the first scene, or rename the topic "Ask {them} to come along" once its hire is known.
- Fall back to a class *near* the calling (a scholar becomes a bard or cleric, not a warrior).
- On a character's first assault from a savage or ambush group, give the company one free turn ("you see them as
  they move"), or use the existing `deep-sounds` hearing one room ahead.
- Say the warning rule once, at the first territorial warning: "If you stay here, they will come at you."

---

## 5. A second expedition: Pluwalac (days 3–4, mage and bard)

I went back into the Wǽtfaenn save and followed the strongest renewal hook from the first pass: the sealed
cistern the brothers went to open (and the dead walked that night).

**What worked (keep it):**

- **Hiring reveals character.** Gizon at the cistern door: *"Somebody should make a song about that place.
  Somebody probably did, and it was sad."*
- **"Who goes first"** at a trap is a real party decision. I chose the bard over the 5-HP mage. Correctly, as it
  turned out, and painfully.
- **The priest's negotiation** is the richest social menu in the generated content: argue, read him ("watch for
  what goes unsaid"), lie, defy, or promise to reseal the gate. The promise *paid in knowledge*: *"what the
  Water-Wardens read in the still water reads back, and cannot abide its oath read aloud; the Wardens kept the oath
  on a tablet in their archive."* This is the scholar's loop done right, and the model for §6 of the first report.
- **A situated safe room.** The Wardens' hall ("where the Wardens on watch slept and ate") offers "Rest six hours".
  Two rests restored HP and spell slots underground.
- **The light budget** (one Light spell for 1h50m, one slot a day) created real pressure on a mage party.
- **Brothers' marks** (a cross and a candle-end) showed that the NPC party had really gone ahead.

**What broke, with causes:**

1. **The first trap nearly killed the hireling.** Gizon took 8 poison damage at 8 HP, then a death save. He was
   saved by a system-shock roll that passed by one point. The narration leaked a raw engine sentence: *"The hazard
   brings down the exposed adventurer. The company does not cross; the injury is permanent until treated."*
   (`campaign.ts`, the `expose` branch.)
2. **Every trap had the same two answers:** trapwork or a ten-foot pole. Glyph, rune, pressure plate, tripwire and
   hidden switch were all "look closely → skill or pole". A party without either can only walk into it. The pole is
   a universal key that only some starting kits include, and this country's shops sold none.
3. **A healing herb the game won't let you use.** Sphagnum moss "binds a wound better than linen". I gathered it,
   but there was no way to use it on Gizon and no reason shown (likely it needs Mending). The text promises an
   action the interface silently withholds.
4. **A downed ally can't be healed outside a fight.** `field_spell` requires `awake(recipient)`
   (`data/rules/care.kyr:25`). Gizon's Cure Light Wounds was offered only on himself while Ithil lay at 0. This is
   deliberate OSR (the fallen lie senseless until a rest, then roll system shock), but nothing on the page explains
   why the healer can't heal.
5. **An irreversible step presented as a stroll.** From the gate-hall, "To the pipe gallery" is in data "the great
   pipe, feet first", a one-way chute (`data/generation/deep/waterworks.json:58`). The button gave no hint. The level
   below is left only by a barred stair (rope or climbing) or past the cistern's guardian (rated "beyond you"). A mage
   and bard with no rope were **stranded**: not soft-locked (they could rest), but with no way out the party could
   take. Remedy: one-way passages should say so on the button ("feet first, no way back up") and offer "Look down
   first".
6. **Journey interruptions are mostly noise.** The trip from Merscstede to Pluwalac stopped at the same ford **four
   times**: "Something is going on here" for a drover's cattle, including after the cattle had gone. Causes, in
   `src/session/travel.ts:72–92`: a stop fires whenever any staged scene is at the place, however many times it has
   been seen; "There is danger here" fires whenever any `attack(...)` is on offer, including against hobs already
   parleyed with (Session 2); "You were set upon" fires on any combat-log event, and the false alarm in Session 5
   coincided with a Light expiring. A stop should require something *new* or *hostile and not tolerated*.
7. **One place, two names.** Pluwalac appeared in "Set out for" as *Pluwalac*, at the ford as *"↗ a square doorway
   in a hillside north-west of Merscstede"*, and then, once one leg away, it dropped out of "Set out for" entirely. I
   walked back to town before realising.
8. **Fights against resistant foes become grinds.** Two drowned spirits (resisting weapons; neither party member
   had radiant damage) took 14 rounds and about 25 presses of `t`, won on an at-will cantrip. 432 experience each.
   Soot Cloud showed no effect at all ("Ithil uses Soot Cloud.").
9. **Flee is a dice roll that can fail repeatedly** ("tries to get away, and cannot" twice). Fled foes follow ("The
   swift mud comes at you!" in the next room).

**Net.** The cistern is the best-designed generated site I saw: history, an oath to find, a social bargain that
pays in knowledge, machinery (couple the pump-rods, run water through the race), a safe room. A mage-and-bard party,
the build the scholar fantasy implies, was nearly killed by its first trap, then trapped below by a passage it could
not know was one-way. **The content is ready for the intellectual loop; the danger model and presentation are not.**

---

## 6. Renewal, measured in play

**Blackcarr, after "Coming home" resolved (day 1, 12:50 p.m.).** I slept on the alehouse bench night after night
(six 8-hour stays) and checked the rumours and Notes after each.

- The rumour list was **identical** every time: nine topics, two of them duplicates ("the light in a lone tower" /
  "a lone tower"; "trouble at a grassed mound…" / "a grassed mound…").
- Unfinished: "Nothing more is asked of you." every time.
- The same mother line every morning: *"Your mother is at the hearth, at her work, and looks up now and then at
  the door."* Touching once; inert on day 3.
- The coin went from 7 to 2. A Coming-home protagonist starts with 8 coin, and nothing in the village pays.

**Wǽtfaenn** did generate new hooks over time (the brothers going up to Pluwalac, risen dead, the sick child's
death). They come from **installed situations with clocks**. **Blackcarr's** remaining situations had none left to
fire, or none near. Renewal depends on whether a country happened to draw a clocked situation near the player.

**Autoplay.** A 200-step "expedition" autoplayer in the debt origin spent 2.8 game days without finding the ruin.
Its only event was the debt being called in: *"Caillech has called in what you owe: 50 coin."* The autoplayer is a
weak proxy for a person, but it shows that without a pointer, an uninformed player can circle the villages for
days.

**Remedy:** a renewal floor. Each country keeps at least one *clocked* situation within a day's walk of the player
at all times, and when one resolves or expires, the generator promotes another, announced through the inn's "the
talk is all of…" line. That line is the most effective invitation in the game and is under-used.

---

## 7. Sameness, measured

`texts.ts narr` collects rule outcomes and observations (what the page narrates), split into sentences:

```
narrated sentences per country (median):          850
share appearing verbatim in >=50% of countries:    42%
share appearing verbatim in >=75% of countries:    33%
share appearing verbatim in every country:          7%
```

Common examples: "Coins lie scattered in the dust, green with age, where a purse rotted through."; "Willows lean
out over the water along the road, grey-green…"; "Nobody talks of the forty crowns now: the word down the north
road is that the Long Man is quiet."

**Module frequency** (24 seeds): `den`, `raidersFolk`, `tollKeepers`, `pricePatron` and the origin appear in
**24/24**; `tower` 21, `brood` 20; the five goings-on 7–11 each. Every country has the same toll, the same raiders,
the same buyer of grave-goods and the same den.

Ambient people-lines (the cat on the wall, the carter roping a load) are composed at screen time and not counted
here, so sameness is higher than 33% on the page.

**Remedy (literary editor plus generation):** variants keyed to terrain and seed for the top 100 shared sentences;
a "once per site" rule for dungeon props; and a rotating pool so that at most two of
{den, raidersFolk, tollKeepers, pricePatron} appear in any one country.

---

## 8. Cognitive load, measured

`load.ts`, a wandering autoplayer over 8 seeds × 150 steps, measures the screen model before each move:

| Where | Top-level items (people + things + exits + destinations), median / 90th pct | Legal commands, median / 90th pct | Prose, median characters |
|---|---|---|---|
| Town | **16 / 22** | **25 / 40** | 505 |
| Ruin | 6 / 8 | 14 / 18 | 427 |
| Countryside | 10 / 23 | 14 / 21 | 210 |

The page renders more than this: names appear twice (name-only plus name-with-role), the camp and sheet links are
added, and stat blocks open inside conversations. I counted about 30 links in the market square of Merscstede.

**What denser POIs or deeper dialogue would do:** at today's presentation every added person or place is another
peer link. Doubling POI density would put a typical town at about 30 items and 50 commands. That pays only if the
screen first answers "what serves my current intention?" Current-intention ranking (first report, intervention 5)
is the precondition for M17's density work, not a later polish.

---

## 9. Revised intervention ranking

Measurement changes the order of the first report's portfolio:

1. **Re-scale ruin rewards** (§2, §3). One multiplier and one rule change; affects every country. Highest leverage,
   lowest cost.
2. **Make non-warrior starts viable** (§4). Have the hire offer itself to non-warriors; a nearer-calling fallback
   for recruits; a free turn against first ambushes. Without this, three of the four main classes have no route
   into the country's main content.
3. **A renewal floor** (§6). A clocked situation within a day's walk; promote the next one on resolution; voice it
   through "the talk is all of…".
4. **Honest affordances** (§5): one-way passages say so; withheld item uses say why; journey stops only for
   something new or hostile; one name per place.
5. **Knowledge pays** (first report, intervention 3). The cistern promise shows the target: a social act that buys
   knowledge, which then unlocks a non-combat solution (read the oath aloud). Extend that pattern, and stop
   knowledge-gated lines vanishing on a failed roll.
6. **Fold the action surface** (§8) before adding density.
7. **Vary the shared modules and sentences** (§7).

---

## 10. Experiments these measurements enable

Each can be scored with the `lab/` scripts, without human testers:

- **A. Class viability.** Rerun `sim.ts` after any balance change. Target: median big-ruin win of at least 0.6 for
  *every* class with the companion the opening offers. Today: warrior 0.80, cleric 0.25, thief 0.00, mage 0.00.
- **B. Economy.** Rerun `census.ts` + `summ.py`. Target: richest site / shop catalogue between 1.5 and 3 (today a
  median of 8.75), and big-ruin XP plus sales at most about 2 levels (today about 4).
- **C. Sameness.** Rerun `texts.ts narr`. Target: under 15% of narrated sentences in 75% of countries (today 33%).
- **D. Load.** Rerun `load.ts`. Target: town median under 10 top-level items *after* folding, even at doubled POI
  density.
- **E. Renewal (needs play or a smarter autoplayer).** Count game hours with an empty "Unfinished" in a 5-day run.
  Today Blackcarr: every hour from 12:50 p.m. on day 1.

---

## 11. Reproducing

From the repository root, after `bun install` (Deem and languages pinned):

```sh
bun doc/playtests/play-structure-2026-10-26/lab/census.ts seed1 debt     # one country's census, JSON
bun doc/playtests/play-structure-2026-10-26/lab/sim.ts seed1 mage        # fight odds per hostile group
bun doc/playtests/play-structure-2026-10-26/lab/texts.ts seed1 narr      # narrated sentences
bun doc/playtests/play-structure-2026-10-26/lab/load.ts seed1 150        # screen-model load during autoplay
bun doc/playtests/play-structure-2026-10-26/lab/hire.ts seed1 order      # who can be hired, where
bun doc/playtests/play-structure-2026-10-26/lab/sweep.ts s1 debt expedition warrior 200 20   # autoplay sampling
python3 doc/playtests/play-structure-2026-10-26/lab/summ.py              # summarise data/census.json
```

`lab/data/` holds the census (24 seeds), the fight simulation (12 seeds × 4 classes) and the recruits census (16
seeds) that the numbers above come from.

**Caveats.**

- The census finds a site's rooms by place-id prefix (`region__wN_`). "Large" means 15 or more rooms; in every seed
  that was the barrow-type ruin.
- The fight simulation starts each fight from full health and plays both sides with `Tactics.choose`. It ignores
  attrition, preparation, consumables and player cleverness, so it *overstates* the odds of clearing a whole ruin
  and roughly matches the page's own danger estimate for single fights.
- The sameness counts include sentences that are meant to be shared (UI-like system lines) and exclude screen-time
  ambient lines.
- The autoplayer is random within a temper; it is not evidence of what a person would do, only of what the world
  offers to a player without guidance.
