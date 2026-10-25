# C. Prioritized findings

Ranked by how much each finding gets in the way of an unfamiliar player having a compelling adventure. Each entry has a class (**Technical defect / Usability failure / Design failure / Content failure / Unverified suspicion**), evidence, severity, player impact and confidence.

**O** = observed in cold play (`evidence/contemporaneous-play-record.md`, screenshots in `evidence/screens/`). **P** = established after sealing, by a narrow look at code/data or a targeted replay. Post-seal facts don't change what I observed; they only explain it.

---

## 1. The substantial authored adventures are effectively unfindable — Design failure · Critical · confidence high

**O.** The title page offers *Begin* (a generated country), *Open a save file*, *Options* and *The handbooks* (`001-landing`). Across two journeys, a reload and roughly 25 conversations in Peahkom, nobody named a place beyond Silverfells, apart from towns inside it. Every dungeon I heard about was a generated Delver mine reached by the identical directions *"to the foot of Zhargeithrehes by Peahkom, and on to the tarn."* I never encountered a hand-authored adventure.

**P.** Five authored campaigns exist (`web/scenarios.ts`): *The Long Man* (marked `recommended: true`), *Thrume*, *The House That Grows*, *The Road the Star Came Down* and *The Patient Star*. The title page lists them only when the address contains `?dev` (`web/reader/title-page.tsx`, comment: "the ways in that are for testing… only appear when the address asks for them"). In my seed (`zadiweno`), Thrume lies beyond the east march-stone and Merrowdale (*The Long Man*) beyond the north wayside cross. Both appear only in the scene text of the region's edge places. The intent of commit `e6f69c1` ("its folk speak of it") did not come through in ordinary play: no one in the starting town spoke of either.

**Impact.** A new player gets the most generated, least authored version of the game and never learns that the better-written adventures exist. Every judgement in this report about adventure depth is therefore a judgement about generated content.

## 2. The first expedition is a coin-flip party wipe with little counterplay — Design failure · Critical · confidence high

**O.**
- Journey 1: my 5-HP elf mage was knocked out by the first enemy blow, before acting (`129-attack`). The fight ended in a total wipe on day one.
- Journey 2: two level-1 warriors met two "ferocious cave spiders" and Bruni went **16 → 1 HP in one round** (three bites) (`192`).
- After retreating and healing, the next real fight (a mud elemental) downed Bruni in round two. Choosing Flee killed the companion through bleeding (`264-flee2`).
- Hit chances were mostly "1 in 3" or "2 in 5". Second Wind healed 2.
- Difficulty labels were inconsistent. The same four 1-HP bats were rated **A HARD FIGHT** on day 9 and **EASILY WON** on day 10, at full health both times.
- The one tactical decision that worked (Isla's Taunt) shows the system has teeth, but the margins leave almost no room to learn.

**Compounding factor.** Only one recruit was ever available, so the party was two people. The handbook says "A company is three companions."

**Impact.** The player learns that going into the place the whole town has been talking about is fatal, and doesn't learn why. Both of my attempts at "a complete adventure" ended before the second room of the main dungeon.

## 3. Defeat, retreat and casualty text misreports what happened — Technical defect · High · confidence high

**O + P.**
- The end screen names only the last companion to fall. The protagonist I created is absent from their own epitaph (`133-r5`, `264-flee2`).
- It says *"one against one"* when two fought one. Cause: `src/narrative/obituary.ts:38` hard-codes `'one against one'` whenever there is a single foe, regardless of party size.
- It says "You were set upon" when the fight began with my own decision to lift the bars and attack.
- My last chosen action (Strike) was never shown before the end screen.
- Flee with the protagonist down produced a death with no report of the flee attempt.
- After a successful flee, the scene said *"The ferocious cave spiders come at you!"* and nothing followed (`196-afterflee`).
- The log reported *"Bruni is bleeding… Bruni is not bleeding"* within one round, and *"Isla is infected"* as the result of Isla's own missed swing.

**Impact.** At the moments when the player most needs to understand cause and effect, the game gives contradictory or wrong accounts.

## 4. Building and understanding the party is nearly opaque — Usability + Design failure · High · confidence high

**O.**
- Character creation shows one sentence per calling. It shows no statistics, HP or spells.
- **No character sheet exists until a companion joins.** The Company tab appears only then (`061-company`), so a solo player can't see their own HP.
- Rolled statistics contradict the calling: a warrior of the "Brawn" people with **Str 7** but Wis 18 and Cha 16, and a mage with **Str 1**. No allocation is offered.
- Recruiting shows nothing about the recruit before you pay (Isla turned out to carry plate mail and a battleaxe despite "nothing but blisters").
- Spell choices show bare names. Descriptions are hover-only tooltips, so invisible on touch, and one leaked an internal name: *"13 + level + bonusSpellDC"*.
- Preparing a spell silently costs an hour.
- My prepared Light spell wasn't offered in the dark scene, only a companion's torch. After casting Light from the Pack, the status line still said *"Nothing lit."*
- "CAN DO" lists 2nd- and 3rd-level spells for a level-1 mage without saying whether they can be cast.

**Impact.** The player can't plan a composition, can't tell what a companion contributes before hiring them, and can't see the mage's main value (the mud elemental was vulnerable to lightning and cold, which the mage could have exploited).

## 5. Generated prose shows its templates — Content failure · High · confidence high

**O.**
- Flint's and Kestra's "news" is **word-for-word identical**: *"'Khesefdûm? I was only passing through… The captain's been looking at the road'"*. It answers a question never asked.
- Fargrim's two cave rumours are identical apart from the region name.
- Isla, Adrik and (on a later visit) Kildrak share the greeting *"'Well now,' … brightening at the sight of a new face."* Kildrak used it for a dwarf at 1 HP.
- Isla's "be away from it before dark" line repeats verbatim at every site.
- Assembled phrases: *"the silk from the sink at a pit in the ground"*; three places named "holly hollow", "windfall" and "old bank" twice each on the map.
- The iron-door inscription at the climax of Argentumport reads like a data record and ends *"If it is right, it was Zhargeithrehes"*, naming the region you're standing in (`122-inscr`).
- The casket riddle *"I always was, yet never will be"* has the accepted answer **Tomorrow**: the riddle text is the reverse of its own answer (`187-tomorrow`).
- Notes: *"The bear have a den…"*.
- The raw placeholder *"You carry out the action."* appears in a look-panel and seven times in one stretch of the Story.

**Impact.** The best writing (the tally *"WE HAVE SHUT IT IN. DO NOT LET IT OUT."*, the winze *"moves as weather moves, and stops when you stop"*) earns trust that the repetition then spends. A player who hears the same captain twice stops believing that people are people.

## 6. The game invites interactions it can't answer — Design failure · High · confidence high

**O.**
- "Listen at it" on a *speaking* door, and on an iron door barred against something sealed in, both gave *"Nothing comes of it."* So did examining a mural and prodding a casket.
- "Prod it with the pole" did nothing to a hidden switch. After "Look closely", a different option, *"push the switch in with the pole's end, standing clear"*, worked (`240-push`).
- "Pry at it with the bar" on a lift cage the scene had just placed at the bottom of the shaft.
- The goblins appear as an unexplained label with no description (`249-spring`). They watched me loot their spring without reacting.
- My errand was to *copy* the old writing at Argentumport. There was no copying action, and every old-script text came pre-translated, so being the order's scribe made no difference.
- I could never ask anyone about the four missing brothers.

**Impact.** A blanket set of verbs over every object teaches the player that inspecting things is pointless, which hides the few verbs that do work.

## 7. Notes and Story are less trustworthy than they look — Technical + Usability · Medium-High · confidence high

**O.**
- Notes knows things nobody said: willow bark as the cure, the cave beast being "the bear", the philosophers' dispute as a solvable task (*"What the country's own history says could settle it"*).
- Notes files tavern gossip about the brothers as **"SEEN FOR YOURSELF … you saw it."**
- The Story replaces most dialogue with *"You carry out the action."* or *"Kildrak tells you what they have heard about…"* (also misgendering her as "they" after the scene said "her").
- **After loading a save, the Story starts at the load point**, so the whole first day is gone.
- Notes as a structure is good: who told you, when, and sorted into Unfinished / Heard / Known before.

**Impact.** The memory features are close to excellent. These leaks and losses undermine the "what do I know vs. what does the game know" distinction that Notes otherwise draws well.

## 8. Consequences happen but are hard to see — Design failure · Medium · confidence high

**O.** The best moment in the game: after one night's delay, *"The talk is all of the brothers, who went up to Profundusmons at first light: four of them, with lanterns and a bell, singing."* But:
- That afternoon at Profundusmons there was no sign of them.
- Their prior never mentions them (*"'You,' says the prior, neither pleased nor otherwise."*).
- No news came in the four days I waited.
- Notes doesn't track them as an unfinished matter.

**P.** The system is real (`data/generation/deep/powers.json`): a level every two days, a mark on each level, then a stated *fell / fate / won* outcome. A targeted replay found their chalked cross at the adit mouth by day 14.

**Also O.** "Begin again in this country" resets the clock to day one and brings dead Isla back, while the epitaph says *"The country goes on without you."*

**Impact.** The player can't tell whether the world remembers, which is the atlas's central promise.

## 9. The economy dissolves the stakes — Design failure · Medium · confidence medium-high

**O.**
- A ten-day, fifty-coin debt, the motive of the "What is owed" opening, was paid on **day two** by selling **one** bronze tally-board found on the floor (45 coin) (`272-paid`).
- Full healing of the whole company costs 2 coin and an hour at the shrine.
- Selling loot also grants XP (45 XP for the tally-board).

**Impact.** Injury and debt stop meaning anything after the first return, and preparation (buying a lantern, rationing torches) carries little pressure.

## 10. Navigation is legible locally but repetitive and duplicated — Usability · Medium · confidence high

**O.**
- Two different market exits are both called *"The road through Ebarukaetz"*.
- All four dungeons I learned of in Zhargeithrehes branch off the same tarn, so the route sentence repeats verbatim.
- Gibagabar, a quest destination whose etymology is listed under the map, isn't labelled on the map (`289-map2`).
- Duplicate feature names on the map, and the "Profundusmons" label sits away from its node.
- Positives: the exit arrangement around the card, the hollow/filled known/visited distinction, and the 390-px reflow are all good (`290-phone`).

## 11. Small state contradictions — Technical defect · Low-Medium · confidence high

**O.**
- "Nothing lit" while Light was active.
- A torch that keeps burning in daylight, and reads "30 minutes left" after a night's sleep.
- The bars across the opened iron door still described as lying across it.
- "SINCE YOU WERE LAST HERE" used to report the weather.
- Fog turning "the hedges to ghosts" on a moor described as having no walls.
- Buying a ration labelled "· asked".
- Philosophers "on the green" answered as "at the bailey".

## 12. Unverified suspicions (downgraded or open)

- **Repeated d20 7** on two different social checks. **P:** checks are deterministic per seed, skill, actor and topic (`src/rules/checks.ts:62`), so this is most likely coincidence. *Open usability question:* players aren't told that a failed check can't be retried, and the option simply vanishes.
- **Difficulty-rating basis.** The bats' rating flipped between days at equal health. I couldn't establish why from play.
- Whether generated deep sites are **completable** by an ordinary level-1 party. I never reached a bottom level. Open.

---

## What is already unusually good (keep it)

- **Opening scene craft.** Kildrak noticing *"that you have come straight to her"*; *"Brother Anselm's hand… I did not know he was still living."*
- **Presentation.** Old-Master portraits with idle vignettes; exits placed around the card; the dark fight screen; a clean phone layout.
- **Readable combat information.** Committed enemy intent (*"Means to use slam on Isla"*), listed resistances and vulnerabilities, per-target hit odds and HP, dice shown with modifiers, and an option to hide dice.
- **Explicit gating.** *"Needs digging or a shovel, and the company has neither"*; *"Needs trapwork: no one in the company has it."*
- **Light as a clock** (torch minutes); safe inspection (no time spent opening a person or object); priced and timed service labels.
- **World clocks.** The brothers' departure; Orsik's explicit "five days for five coin" choice.
- **A moral triangle.** Orsik will buy relics "no questions"; the prior wants them buried; the priest refuses the rites if the stair is opened. Plus the clue *"their paymaster kept noon in a jar"*, which points to a non-violent solution.
- **Moments of dread.** *"WE HAVE SHUT IT IN. DO NOT LET IT OUT."*; *"the cold comes out of the dark behind it, and has a shape."*
