# The Long Muster's Road

*Adventure II of the anthology ([treatments](README.md)). Built 7 November 2026 in `data/adventures/muster/`; specs `test/muster.test.ts` (the continuous crossing, three tests), `test/muster-played.test.ts`, `test/muster-endings.test.ts`, `test/muster-round3.test.ts`. Spoilers throughout.*

## What it is

Thirty miles of legionary road over the Hesper Fells, from the village of **Kell Ford** to the valley of the **Last Cohort**, whose people are the descendants of the Long Muster's rearguard and believe the empire stands. Eleven hundred years have broken the road's bridges, galleries and fortresses; the adventure is the *crossing*, and it ends in a question put to the company: what do you say to people who have held a gate for a dead throne for a thousand and a hundred and four years? It is a province of the first country (entry: a mountain/frost/hills country, to the east), so it is heard of from an innkeeper, walked into, and kept in the one persistent world.

## The map

```
 KELL FORD ── Low Road gorge ── flooded bend ───────────┐   (thaw shuts the bend)
  green      ── Old Causeway (3 rooms; wolves by night) ─┤──  MANSIO SEPTIMUS (roofed)
 (inn, store ── goatherds' track + the steep ────────────┘     (track needs wayfinding: Marra's crook)
  Marra, reeve)
 SEPTIMUS ── High Road (open stretch: wyvern stoops at noon; eyrie off it) ───┐
          ── the Gallery (dark, foul air, rotten Third Arch) ──────────────────┤── MANSIO OCTAVIUS (half-roofed; the scribe's satchel)
          ── the Ledge (needs wayfinding; shut by snow) ───────────────────────┘
 OCTAVIUS ── north head of the Great Viaduct ──┬─ parapet of the fifth arch (piton + rope; wind)           ┐
                                               ├─ down the pier (rope) → river (not in thaw) → up the abutment (climb) ├─ south abutment
                                               ├─ the fallen arch (climb; rubble)                          │
                                               └─ the Cohort's rope-way (hidden until the valley is friendly) ┘
 south abutment ── MANSIO OF THE EAGLE (roofless; courier pouches; cloudberry bog; kingsfoil hollow)
 EAGLE ── foot of the Giant's Pass ── road-house (giant guards the road) ── head of the descent
                                  └─ goat path over his roof (climb; shale) ──┘
 head of the descent ── Long Descent ── GATE (sentries) ── forum ── Praetorium/Prefect · barracks · granary · apothecary · Archive · shrine · terraces
```

## How to cross it

Prepare at Kell Ford: Gil Pryor sells rope, pitons, firewood, a tent, iron (crowbar, spikes), blankets and rations; Greta Hennick and Marra Tellis say what each road costs; Fenn Hallam gives the Viaduct's notes. Hire Marra (4 coin) and her crook gives the company *wayfinding*: the goatherds' track and the Ledge open. She will go no further than the Gallery's mouth and the foot of the Pass, and takes up again for nothing on the way back.

Each day is a choice. The wyvern is a fact of noon on the open High Road (a Hazard keyed to the hour, grounded by wind); the Gallery and the Ledge shelter from it, each at a price. The Third Arch is rotten unless the roadway is prodded first. The Viaduct has three honest crossings and a fourth for friends. Sleeping out above the snow-line costs a cold Hazard each night unless the company holds a tent or builds a fire. The giant takes iron, takes a story (a hard performance check), sleeps at night (the company may then slip by, but he wakes at dawn), or can be gone round by the goat path. At the gate, the sentries want the word (the scribe's glossary from Octavius) or a courier's pouch from the Eagle; with the pouch the Cohort receives the company as the first courier from the north in eleven centuries.

In the valley the company may tell the Prefect (the eagle is struck; the Centurion gives a scout and the Cohort's rope-way), tell the Archivist alone (the eagle stays; he gives a copy of the Itinerarium and the rope-way), or say nothing and trade with the apothecary. A courier's pouch earns the Prefect's dispatch, which the Kell reeve will send to a bishop's archive for forty coin; the shrine and the inn show the result.

## Content that works in play

(Specs: see the header; all passing at the commit below; the browser was **not** used.)

1. The whole route is walkable by the labels a player sees: hire, stock, track, Septimus, Ledge, Octavius, parapet, Eagle, Pass, giant, Descent, gate, forum, Praetorium, barracks, home by rope-way, Gallery and Causeway, the reeve (`journey.json`).
2. A thaw (sky state) shuts the Low Road bend (`road.kyr` `gorge_water`) and the river ford; the company turns back; clearing the sky reopens them.
3. Marra's crook: a local `Kind … granting wayfinding`, carried by a hired companion, opens `needing wayfinding` ways for the company (`folk.kyr`). Dunya, the Cohort's scout, carries one too.
4. A companion who refuses a place: rules `marra_stays_gallery` / `marra_stays_giant` retract `travelsWith`, park her, re-assert `willing`, and she can be asked again free.
5. Weather: `sky` is a scenery Thing re-rolled at first light; snow shuts the Ledge (`opening when`), wind grounds the wyvern, thaw floods.
6. Cold: a night out on an `exposed` room strikes `night_cold` once unless a tent is held or a fire built (`make_fire`, spends firewood).
7. Guards: the giant and the gate sentries are persons with a blocking state and `Guards`; each is passed by an action of `Time 0` (iron, spikes, a story, the glossary, a pouch) or the engine's own "slip past".
8. Plants by the growing pattern: comfrey, bruisewort (gorge), heather, gentian, alhuren (Ledge), cloudberry (bog), kingsfoil (hollow); Dame Orsa `Buys` them.
9. Persistent choices: `state(standard, struck|kept)`, `told_prefect`, `received`, `dispatchTaken`, `dispatchSent`, `ropeway_known`; the forum, the inn and the shrine show them; the first survives checkpoint and resume.
10. Orsino/catalog items used and sold: antique compass, ancient/faded maps, celestial chart (Hallam buys), toll silver, steel coin, old glossary, wardstone, dun_rierdan waystone, piton, rope, tent, spyglass, lamp, blanket.
11. Provincial placement: `a1`-style walk in seed `b2` (a mountain first country): heard of, walked into, kept.

## Authored content present but not reachable

(As of the sixth pass; the earlier list was stale.) Played by labels in `muster-played.test.ts`: the wolves' flame, the pelt and the torch ways round; the wyvern's nest, the tooth and the stoop; the goat's steep and shale; the kites; Orde's studs; Quintus; Viator (nail and telling); the unnumbered mile; the spring (success and the final snub); the Archivist's branch; the Tally, the gold wing and the second road to it; Orsa's confession; Dunya at every trust level; Marra, Fenn and Ione's beats. Authored and **not** played: the wolves at night; the picket-tower shelter; the ration-throw; the Prefect's seal confession (`prefectReadSeal`), Gaius's barley (`gaiusSecret`) and the deserters let by it; Rufus's gate scratches beyond the first four; the Low Road past the bend; the goat path over the giant's roof; the river crossing in low water; the cohort sale of loot at Rhea's strongbox; the fall of Sister Ione; Fenn's refusal branches; the Rider and the Column with a boy or a lost companion.

## Actions or consequences the engine cannot yet represent

1. **A mule or pack limit.** Nothing carries a weight limit the Gallery could refuse a mule for; the mule is not in the adventure (`pack_mule` exists in gear). Needs a carried-weight or a "led animal" fact the passage can test.
2. **Cold as a condition.** `night_cold` is a Hazard struck once a night (`road.kyr`); there is no persistent cold, hunger beyond the meal rule, or fatigue per day on foot. Needs a condition with a clock that a shelter or fire can interrupt.
3. **A guide who declines a way.** Done with two rules that retract `travelsWith` (`folk.kyr`); a general "will not enter" on a person would replace them.
4. **A region's weather.** The province's `sky` is its own scenery re-rolled by `dice(clock)`; the generated country's `weather_*` sky is not readable by a module (friction 29 of the circus, still true), nor the calendar's season in a rule here.
5. **Prices that follow what the company did.** Dame Orsa's `Buys` are fixed; telling the Prefect or the Archivist cannot make her pay more. A `Buys … when` condition is needed.
6. **A rope-way as a made thing.** Modelled as a passage hidden until a Discovery is known (`ropeway_known`): it is "there" for anyone who knows it, not built by anyone. A fact the Cohort's engineers could assert would be better.
7. **A time-limited tolerance.** The giant sleeps (`giant_sleeps` asserts `tolerates` at dusk and retracts it at dawn); a company on the road at 3 a.m. slips past him, one at noon pays.
8. **The wyvern as an animal that acts.** Its stoop is a rule keyed to the hour, not to the creature's own errand; it never leaves the eyrie, and cannot be seen to leave. Needs a creature errand with a hunting range.

## Existing assets whose migration or integration is incomplete

1. **Lanterns.** Oil and lantern are bought (Pryor sells torches only here) and a lantern is lit only if one member holds both; as in Tallow Deep the page never offers "light the lantern" otherwise (`src/ui/choice-list.ts` `lighting`). The specs use torches.
2. **Plant `uses`** (alhuren "divination", gentian "love", kingsfoil "medicine") are read by no rule; only sale and kingsfoil's catalog `use` function. No identification of a plant exists: stands are named outright.
3. **`pack_mule`, `tent`, `firewood`, `blanket`** are catalog gear; only the tent and firewood are read by a rule here (`night_cold_strikes`, `make_fire`); a bedroll does not count as shelter.
4. **`old_glossary`** is a catalog wonder "granting reading"; the sentries' challenge asks only that it be *held* (`holding`), not that it be equipped or read.
5. **Companions' kit.** A recruit placed by a module carries a local `Kind` granting a skill; `wayfinding` as a skill appears to be a catalog skill only some classes get, and the shared `needing` check read the crook correctly in play, but nothing lints that a `Carries` kind grants a catalog skill.
6. **Province placement.** Seed `a1` (marsh) does not place it (it stands beside mountain, frost or hills); the specs use `b2`. The kept transcripts' digests were not re-recorded (`test/frontier.test.ts` has two failures that pre-date this work).
7. **Presentation.** Not verified in the browser: the map's drawing of rooms of one wilderness, the weather lines, and the long labels ("Give the giant a crowbar for his toll").

## Honest gaps in verification

Played by the builder through `Journey`, not by an independent player. The wolves, the eyrie, the Archivist branch, the goat path, the river crossing in low water, and the cohort sale were not walked by a spec. No fight was played. Names are checked by `adventure-names.test.ts`; the Kyr lints with 0 errors and 1 advice (the bog's scenery cannot be looked at).

---

# The rewrite (second pass)

*7 November 2026. Files added to `data/adventures/muster/`: `graffiti.kyr`, `beasts.kyr`, `valley.kyr`, `history.kyr`, `quests.kyr`, `companions.kyr`, `interview.kyr`, `endings.kyr`; `cohort.kyr` and `wake.kyr` rewritten. Specs: `test/muster.test.ts` (the continuous crossing) and, later, `test/muster-played.test.ts` (which replaced the staged `muster-rewrite.test.ts`).*

## What changed in the rewrite

- **Dramaturgy.** Five chapters (the board at Kell Ford; the lower country; the heights and the Viaduct; the Giant's Pass; the Last Cohort) and a theme: *keeping after the reason has gone*. Foreshadowing is carried by the soldier **Rufus**, who scratches his name and the days since his pay on five walls (sixty days at Septimus, a hundred and twenty at the Eagle, "WE WAITED" cut under him, a tally of springs at the Pass, "WE ARE HERE. SEND." over the gate), and by the milestones, which count down in cables from CCCLX at Kell to a smooth **I** inside the gate. The road was built *to* the Cohort, not from it.
- **The Cohort** is now a place: sixteen rooms, thirteen named people in three parties (Eagles, Hearth, Archive), a calendar by the last emperor's regnal year, the horn hours, the parade at the standard, a salt-market where Aenean coin is the only money, a school that recites the March, a bakehouse of the legion's twice-cooked bread, a Sending gate with a nail for every spring, a **Tally-yard** where a man counts the days of his sentence aloud, and **eleven centuries** in four red years the Archivist will open (the second wife, the plague winter, the Schism of the Standard, the year of two Sendings). Secrets: the Prefect once broke the General's seal and resealed it; the Archivist forged "a reply was received"; the apothecary has been dosing the Prefect's wine; the standard is brass over bronze, and its gold wing is in a Hearth cellar; the Centurion's son is the deserter in the Pass; old Gaius leaves barley for him every spring.
- **Arrival and telling.** Four non-violent entries (the pouch, the glossary, a lie, a hard Lore check without the glossary) and five tellings that persist and show: the Prefect (standard struck), the Archivist (standard kept; a delegation reaches Kell Ford), the Centurion (a column marches north), the Hearth (the sixth withheld; the reeve in the Tally), or trade only. The gold wing laid before the standard heals the Schism. A Centurion's son's letter, an eyrie tag and the Tally's fine are separate threads that resolve to separate endings.
- **Combat with ways round it.** Wolves of the Old Causeway (level 3, four): torches, rations, the picket-tower, or the dead male's pelt laid for the widow. The wyvern: robbed while it hunts at noon. The giant: iron, a story, the goat path, or asleep. Deserters in the Pass: ten coin, a letter, or a fight. Sentries: glossary, pouch, lie, or Lore.
- **Four new species** (animals.json, no habitats, unpainted): `ridge_goat` (shows sound footing), `bone_kite` (settles on stone that bears), `pass_marmot` (one whistle a stranger, two the giant), `salt_ox` (stops at the noon call).
- **Six side quests** with a place, a face and a resolution by check or choice: Quintus's Q-marks to a grave under a pear tree; the shrine of Viator; Thessaly Orde's survey studs; the goatherds' spring; the unnumbered mile; the wolf-widow.
- **Four companions with three beats each** (Marra Tellis, Fenn Hallam, Dunya, Sister Ione), each beat a question put to the player with answering topics; they may stay, go home, quit, die or change the valley. The Prefect puts a three-question interview; the giant, reeve, apothecary, salt-reckoner, Centurion and Archivist each put one; about fifty answering topics in all.
- **Prose.** Present tense; tics cut ("the size of", "slowly", "quite quietly", "the way X do who"). Not exhaustively re-read.

## 1. Content that works in play
The continuous crossing and the ten branch specs (see above); the five tellings; both companions' endings tested (Marra stays, Fenn credits, Dunya reports, Ione keeps the shrine).

## 2. Authored content present but not reachable (or not specced)
Wolves' rations option; the picket-tower shelter; the unroped fall of Sister Ione (a dice rule; only the safe branch is specced); Fenn's refusal branches and Dunya's defection; the Hearth's quarrel timing (Elpis to the Tally); the column and pardon news (timed on `toldAt`); the claim of relief and the later shame; Orde's cairn contents; the salt-ox, kites and marmot lines (told, not specced).

## 3. Actions or consequences the engine cannot yet represent
A companion who can **die in play** is a `Slay` after a dice rule, not a fight with stakes; a **bargain with Time above 0** is overrun by a warning's patience, so every bargain is Time 0; a **question put by a person to the player** cannot roll (a Topic cannot `Resolve`), so the checks that colour an answer sit in separate Actions; **timed arrivals** are `Arrives` rules on a watch count, not a courier who walks; no **named person can walk the road in the player's absence** as a delegation (they appear at Kell by a rule); a **companion cannot be told apart** from the player in text.

## 4. Existing assets whose migration or integration is incomplete
Lanterns still need oil in the same pack; the glossary's use is a held-check, not reading; plant `uses` are read by nothing; the four species are unpainted and have no Encyclopedia plate; the quest "surveyor's level" and the pelt are local kinds because the catalog has no equivalent; `Marra Tellis` and `Fenn Hallam` had to be renamed (Tellis, Hallam) because the corpus-wide name check refuses a surname another adventure holds.

*Not played by anyone independent.*

---

# What changed in the second pass

*Answering a hostile review and `forms.md` (the Muster is a crossing, not a verdict).*

**Form.** The climax is the road, not the Cohort. The Cohort is somewhere you may reach and leave. Telling it the empire fell is private, optional, gated (the Prefect's three questions; the Archive's young hand must vouch before the Hearth will hear it), and costs: the salt-market shuts for a company that has told. Endings (the engine's `Ending`s): **Turned Back at the Viaduct** (the season turns on the seventh day and the fifth arch is closed to anyone still on the north bank); **The Cohort Reached and Left**; **With One Fewer** (a companion stays, keeps the shrine, deserts, or falls); **A Boy Follows You South** (Tavi, the baker's boy, if you have eaten his master's bread); **Someone Comes Down the Road** (the Archivist told, and his delegation come to Kell Ford four days later; the code gates on `told_ostrander` and `delegationCame`, with variants for a boy and for a lost companion), and, among others, **The Letter Kept** (the Prefect's dispatch carried home and never given), **The Prefect Takes It Down by Degrees**, **Snowed In at the Last Cohort**.

**Gauntlet.** Pitons and rope are spent in rigging the parapet; hunger bites at noon; weather is visible on the heights; the Ledge is closed by snow; the wyvern's noon is a window you pay for; retreat costs the line and the days.

**Consistency.** One history of the standard (the Hearth hid the gold wings in the Schism of 871, 233 years ago; the Eagles have called it theft since; the Archivist's forged line is his own, from the cattle plague, and unrelated). One march (thirty-three days from the sea to the Eagle; Rufus on day 29, 31, 33, 34); stones in cables; five days from the Ford. The sentries recognise their own seal: the pouch is "the Sending's lost pouch", not news from the north. Rufus's last scratch is also cut in the notch, so the goat path teaches it.

**Companions, mended.** Marra, Fenn, Dunya and Ione have their own flags, beats in the order they can be met, and consequences (Jory comes to Kell; Fenn freezes and is found on the south side; Dunya's beats run Pass, Kell, taproom; Ione's fall is rolled once, at the parapet).

**Answers gate things.** The Archive's red years need an oath; Orsa's secret needs a fair dealing; the Centurion's pardon needs the whole story of the Pass; the strongbox buyer in the salt-market opens to those Rhea has questioned; the Prefect's dispatch needs his regard.

**Voices.** Terse deserters, a cheerful Tavi, a boisterous Octa; the ten worst flourishes were rewritten and a dozen explainers cut. Not exhaustively re-read.

## 1. Content that works in play (specs)
The continuous crossing plays Marra's first two beats from the hire, the Aurel pouch at the Pass, the Sending's pouch at the gate, the Prefect's interview, the telling, the dispatch and the way home. The branch specs live in `muster-played.test.ts` (beasts, quests, companions, the interview, tellings, the Tally, the Annals, Dunya, Jory, the weather, the purse), `muster-endings.test.ts` and `muster-round3.test.ts`.

## 2. Authored content present but not specced
Ione's fall (a dice rule at the parapet; only her safe crossing is specced); the Hearth quarrel and the column; the claim of relief; hunger's bite (a rule at noon); the Rhea strongbox.

## 3. Actions or consequences the engine cannot yet represent
A Topic cannot roll. An obstacle that costs more than coins is a rule, not a condition on a person. There is no *deadline* construct: the season is `day(clock) >= 7`. A person cannot walk the road in the player's absence: delegations are `Arrives`.

## 4. Existing assets whose integration is incomplete
Lanterns; plant `uses`; four unpainted species; ridge-goat and goat are near-duplicates the encyclopedia will list twice; `Marra Tellis`/`Fenn Hallam` renamed (Tellis, Hallam).

---

# Third pass (a second review)

- **The south-side softlock** is gone. On the seventh day only the north entries of the fifth arch close (the parapet from the north, the pier, the fallen arch from the north); the rope-way is open to anyone who knows of it, and a company stranded south without it meets **Snowed In at the Last Cohort**. The valley says the passes are closing from the fifth day.
- **One table.** The Muster marched from the capital (north-west) past the Ford into the valley, south-east; Rufus's days rise toward the Cohort; the Sending goes back north-west to the Eagle, where the road the empire left breaks off. The Ford to the gate is three days and about thirty miles (road times doubled so the play matches); the Eagle is a day from the gate and two days from the Ford; the stones count in cables from CCCLX to I.
- **The standard**: the Schism of 871 everywhere (233 years; the Hearth hid the wings; Hobbe's father's father's father). The plague winter (640) has nothing to do with it.
- **Endings that can be reached**: Turned Back, Snowed In, A Boy Follows You South, With One Fewer (now including a companion sent home), The Cohort Reached and Left, Someone Comes Down the Road (after telling the Archivist; the delegation arrives four days later, three soldiers and a scout), The First Century Comes South (after telling the Centurion). Played by labels in the specs: Turned, Snowed, Boy, Fewer (Marra, Ione, Fenn), Said Nothing, Standard Cost (and its Jory text), The Wing Goes Home, Reached and Left (granary), Rider, Column, The Letter Kept. Played only by the hostile reviewer, in no spec: the Rider with a boy and with a lost companion, and *The Prefect Takes It Down by Degrees*.
- **Free retries**: the giant's story, the claim of relief and the plea without a glossary can each be tried once and cost something (a ration, until the evening call); a failed rigging spends a piton.
- **The deserters**: Aurel left a letter on the Eagle's stack and crossed the arch and came back to the Pass; three of seven are met at the head of the Descent; Gaius has left barley nine years; Hobbe's tally is one set of numbers.
- Aphorism endings varied; renames (Ede Cassel, Silas Brand, Ferrar, Octa Draycott).

**Still open (superseded: the staged spec was deleted in the fifth pass; see the sixth).**

## Fourth pass (the third hostile review)

What changed, and what did not.

- **Parapet softlock.** Only the *entries* to the fifth arch close on the seventh day; the far side of the parapet stays open, so a party caught on it walks on to the south abutment, where **Snowed In at the Last Cohort** ends it. Played in `muster-round3.test.ts` (day 6, 23:00 onto the parapet).
- **The season turns on the seventh day, not the ninth.** The gate is reached on the third morning; every valley door now costs thirty to a hundred and twenty minutes each way; five errands and back measure at least eight hours in the spec. The return to the Viaduct is about three days; a thorough player has to choose what to leave. The valley says so from the fifth day.
- **The pack strikes.** A party that reaches the end of the causeway without a flame, a pelt, a ration-throw or the picket-tower is bitten (2d8, dexterity 14) once. Provisions now bind harder: rations cost 3 coin in the valley, failed side quests cost a ration (and need one), Rhea and Orsa pay or keep coin by the answer given. Buying prices of the valley were cut to a third or a quarter. Gold is still not a strong pressure (see below).
- **Endings vary on what was done.** *Reached, and Said Nothing*; *The Cohort Reached and Left* (told only the granary); *What the Standard Cost* (the Prefect told, the gold never returned: the Eagles take the Praetorium, the Sending goes early, and Dame Orsa's boy is in it: the valley is **worse for the visitor's knowing**); *The Wing Goes Home* (the gold returned); three *One Fewer* texts (Marra chose, Ione, anyone else); *A Boy Follows You South*. (At the time of that pass; see the sixth and seventh passes for what is played now.)
- **Retries cost.** A failed word to Viator is not repeated; a pelt badly laid is lost; the spring snub is final; Q-marks, Orde's studs and the second lip cost a ration; a gate rebuff lasts a night (not an evening).
- **Answers differ.** The giant's truth teaches the marmots' rule (his lie feeds you two rations); Orsa's fair answer pays twelve coin and is required for her confession about the Prefect's sleep; Rhea pays ten for an honest source and keeps five for silence; the reeve's "no one" leaves a bare nail, not a slip; the Archivist's forgery is told only to one who swore. The Q3 lamp answer needs Greta's explanation of the lamp first.
- **Continuity.** One hundred and forty days unpaid throughout; thirty miles in the pitch; two days to the Eagle; the abutment's stone is LXIII; descent stones one to the mile; nobody but Corvin has opened the seal; the column is six; the delegation no longer duplicates Dunya.
- **Ione.** "Argue" now costs her trust; "agree" earns it and risks her; the fall remains a dice roll on the clock.
- **Ids.** `pia`, `dray`, `hobday`, `corrin`, `ostrander`, `sarn_scout` are now `ede_cassel`, `fenn_hallam`, `cattermole`, `hartnoll`, `ostrander`, `merula_scout`.

**Not done, honestly (the staging is superseded by the fifth pass).** the staged spec was deleted in the fifth pass.

## Fifth pass (the fourth hostile review's leftovers)

- **No staged specs remain.** `muster-rewrite.test.ts` is gone; `muster-played.test.ts` (shared walks in `muster-walks.ts`) plays every road beast, side quest, companion beat, telling and ending from the Ford by its labels. Only the clock (`=…`) and the dice (`roll`) are forced; weather is waited for through dawns (`untilSky`). `grep` for `put(`, `assert(`, `give(`, `coin(` in `test/muster*` finds nothing. Played endings: Turned, Snowed, Boy, Said Nothing, Standard Cost, The Wing Goes Home, Reached and Left (granary), One Fewer (Marra / Ione / Fenn), Someone Comes Down the Road, The First Century Comes South. Not played: *The Cohort Reached and Left* by the Archivist-only route, Dunya's other three outcomes (defects, stays in Kell, silent), the Rider with Dunya travelling.
- **A bug found by playing:** an ending that fires on arrival at the Ford made every Ford beat unreachable. `backAtFord()` now waits while Dunya travels with the company, so she can be asked about Kell Ford and choose.
- **There is no companion cap; the purse is the limit.** Each companion has a hire (Marra 4, Fenn 6; Ione and Dunya nothing) and the party opens with 22 coin, 15 of it spent on the kit, leaving 7: one of Marra or Fenn can be hired, not both, and Dunya and Ione come free, so five or six in a party is possible. Without Marra the track and the Ledge are shut (wayfinding), so the specs give Fenn and Ione the causeway and the High Road. An earlier version of this note said the party was capped at four; that was wrong.
- **Flavour flags.** `marraAngry` shuts the spring (her mother will not be asked a favour); `springMarra` is required for the persuasion; `widowAnswered` is required to lay the pelt; `fennPushed` forbids the survey credit; `dunyaSilent` forbids the Centurion's pardon; `edePushed` forbids the Hearth's hearing; `giantAnswered`, `ioneJoined`, `aurelLetterShown` and `brassShown` were cut.
- **Withholding.** Hobbe's secret is counted for (a hard persuasion check, six hours, one try); paying his fine frees him, sends him home and makes the Hearth owe four days' bread, and the gold stays unlearned. Brand's brass is pressed for (a hard insight check, one try). Some visitors will never learn where the gold is.
- **Telling costs the world something.** Telling the Prefect shutters the salt-market (a passage closes) and, at the Ford, ends in *What the Standard Cost*; telling the Archivist sends Ede Cassel out by the Sending gate. The valley is worse, and a person leaves, for the visitor's knowing.
- **Gold and the wyvern.** The party opens with 22 coin (the company's 14 and the backgrounds' 8); the whole kit costs 15, leaving 7; the climber's harness (6 coin, the way to the eyrie) fits after the kit and leaves 1; the Tally fine is thirty, out of reach until the valley's answers (twelve from Orsa, ten from Rhea, a season of the Toll sold) pay it. Taking the shed tooth while the wyvern is out calls it back at once.
- **Names.** Maud Hennick is Greta Hennick; Marcus Merula is Aurel Merula; the Archivist is Tiberin Ostrander; Joss Hartnoll is Anselm Hartnoll. Marra and Merula still share an initial.
- **Cadences.** Gaius wanders; Merula reports; Elpis forms; Rhea weighs; Ostrander subordinates. Others were touched only where I read them.

**Still open, honestly.** The Eagles/Hearth/Archive triad is leaned on (the Archive is not neutral: the Archivist forged a line, and his clerk is sent north) but not broken by a fourth party; the Prefect's grief is a closed door and an ending, not a lasting change in the valley's trade; the wolf bite is survivable by most parties; the tic cuts are not exhaustive.


## Sixth pass (the fifth hostile review)

- **Dunya cannot lock the ending.** If she is still with the company at the Ford she decides in six hours by her trust: under two she goes home, two or more she stays at the Last Fire. Four specs play trust 0 (skipped, and "small"), 1 and 2. She is not "one fewer": `lostOne()` counts only Marra (stayed, home, or angry and left), Ione and Fenn.
- **Each telling has its own price.** The Prefect: the standard struck, the market shuttered, and at the Ford *What the Standard Cost* (a second text if Jory was taken home); with the seal read first, *The Prefect Takes It Down by Degrees* and an open market. The Archivist: the Annals shut to you, Ede sent north, and the rope-way (so the way past the snow) offered only twelve hours later. The Centurion: she marches the First Century out after six hours, taking the scout and the pardon. The Hearth: the Eagles bar the shrine, so the gold wing is out of reach. Returning the wing bars the granary against you.
- **Secrets lead somewhere.** Orsa's confession can be carried to the Prefect (regard, and Orsa is taken to the Praetorium); Gaius's barley lets the deserters let you by; the seal softens the Prefect's telling; the Annals, to one who swore, name the old farm under the terraces (a second road to the gold). Not given an effect: `brass_known`, `school_changes`, `forgery_known` still feed only the lore milestone.
- **Retries and flags.** The Viator telling and the dig are latched on failure; Orde, Quintus and the second lip need a ration to try. `foundPouch`, `rheaFair`, `reeveNone` and `yeastDead` are gone; `reeveNamed` pays four coin.
- **State text.** The sentries, deserters and giant take a "stood down" state once the toll is met. The engine's patience line (`src/ui/patience.ts`, read from the `warned` relation) did not clear when a toll was met; the Muster-local fix retracts `warned` inside every bargain action. The engine is untouched.
- **Ids and text.** `moll_*`, `told_moll`, `marcus*`, `pia*` are now `ostrander_*`, `told_ostrander`, `aurel*`, `ede*`. About a dozen "a long time" and "like a man who" lines and three theme-stating closers were cut.


## Seventh pass (the sixth hostile review)

- **The scout cannot skip the note.** After the Archivist is told the Centurion's scout is not offered (and the Centurion marches in six hours anyway), so the rope-way arrives only through the Archivist's copied note, twelve hours later. The Archivist now says "half a day, and not before", and a slip in the Archive reads HALF A DAY.
- **The Archive has a lamp** (it was set unlit, against its own scene text). Breaking the General's seal is no longer free: the Archivist answers it, the Annals shut, and the oath is void.
- **Dunya's unasked leaving is anchored at the green**; a spec walks away and waits sixty watches.
- **A dispatch carried and never given** ends in *The Letter Kept* after six hours at the Ford.
- **The four plain endings** no longer share an opening or a closing exchange. Stock beats ("looks at", "does not look at") and "very" were cut in about thirty lines; the cadences of Corvin, Merula, Ostrander, Gaius and Dunya are still close in places.
- **One outcome the stranger cannot fix:** a pardon wins six of the seven out of the Pass, and Aurel stays on his boulder.
- **Still admitted:** `brass_known`, `school_changes` and `forgery_known` feed only the lore milestone. `company.kyr` says 14 coin because the company's purse is 14; the engine adds the party's backgrounds, so the opening purse is 22 (a spec pins it).
