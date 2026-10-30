# Why Kyrie's systems don't add up to a journey: a diagnosis of one ordinary expedition

*The owner's diagnostic directive of 2026-10-30 (OWN-28): one ordinary expedition through the real application, every
breakdown traced to its layer, the three to five highest-leverage structural corrections, and each system reported as
implemented, reachable, usable and enjoyable. Method: one ordinary player in the built reader with no developer
knowledge (the journal: [doc/playtests/ordinary-expedition-2026-10-30/journal.md](../../playtests/ordinary-expedition-2026-10-30/journal.md));
each breakdown clustered, traced in code by an engineer and reproduced across seeds where it could be, then challenged
by a skeptic; the independent cold review of the same day and a read-only navigation review weighed beside it.*

## The short answer

The engine is sound. The world model, facts and `leadsTo`, Objectives, passages, the Kyr modules and the battle engine are all adequate, and nothing here calls for a rewrite. Three things go wrong instead.

**1. One adventure is split across three placement paths, and none of them carries the whole chain.** An ordinary adventure is a chain: you hear of it, you know where it is, you mean to go, you get there, you get in, you find what is at stake, there is a way through, and the world notices when you come back. Kyrie puts content into a generated country by three paths, and each path carries a different part of that chain:

| Path | Has | Lacks |
|---|---|---|
| **Scenarios** (den, brood, tower, fever, drover) | lead, aim, stake | an inside: the site they make is one room with a kind label. Their generated word never goes stale. |
| **Makers' works** (13 templates) | inside, history, a lair room | an aim (12 of 13 templates have none). Their leads go to whoever lives nearest. Their payoff sits behind a gate with one key. |
| **Kits** (raider-hold, toll-road, bounty) | stake, interior, paired keys, a parley | any lead (`KitManifest.hooks` is declared and nothing reads it), an aim (except the bounty), a position on the map, an aftermath |

One rule makes this worse: scenarios may not use works (`world-assembler.ts:353`). So purpose and structure are kept apart on purpose. Only scenarios are audited (`world-audit.ts:79-85`). Every link already exists somewhere in the code: `leadsTo` and Objective in scenarios and the bounty kit, interiors and `@lair` in works, paired keys in kits, `stale` in authored adventures, thanks and news in `RegionRenewal`. The fix is one contract and one audit, and each path fills in the links it is missing. Changes 1, 2 and 5 below are that one correction in three parts.

**2. The page has no step that decides what matters.** It draws every legal command in fixed slots, in a fixed narrative order. This is a structural gap, but it sits in the presentation layer (change 3).

**3. The game's word on danger is wrong because of an import defect.** Kyrie dropped Orsino's default technique cooldown, so the reckoning and every automated audit assume two free techniques every turn (change 4).

Everything else is either tuning or a regression, or a set of separate local defects: the map camera, the interior plan removed in 22ebb73, and the seams.

### The owner's four complaints, traced

| Complaint | What actually causes it | Change |
|---|---|---|
| Travelling to a destination is difficult | One-click travel works. But destinations exist only for places someone told you of, and the kit and work paths rarely tell anyone near the start. A stopped journey arrives as an unranked page. Routes go through guarded ways without saying so. | 1, 3, 4 |
| Interiors are confusing | A kit's cave shares a work's doorstep. Inside a site nothing shows where you are (the plan was removed, and kit sites have no position). One-key gates have probes that do nothing. Local ways are in alphabetical order. | 2, 3 (map below) |
| The interface is crowded and inconsistent | Every legal command is drawn in fixed slots and a fixed order, with nothing ranked | 3 |
| Arriving reveals little that is interesting or actionable | Scenarios have purpose but no inside. Works have an inside but no purpose. Kits have both but no lead. Nothing changes afterwards. | 1, 2, 5 |

---

## 1. The five highest-leverage changes

### Change 1: every placed adventure gets a lead that becomes an aim (structural)

**What the player experiences now.** The bridge-foot of Brightbridge, the start town, shows an empty bell-frame: "'Hobs,' people say, and spit." This is the start town's own hook for the hobs' hold at Gaudumport, 4.7 hours away. It teaches nothing, gives no aim and adds no destination. Nobody in Brightbridge has a topic about the bell, the hobs or Gaudumport. Aspen offers five rumours 10 to 14 hours away, plus Thorn Hole twice. Gaudumport became somewhere you could go only because a drover's generic "country off the road" line happened to name it, and it never became an aim. All through the delve the aim bar showed the drover thread left over from the opening. The player called this needing "outside persistence".

**Why it happens.** A lead turns into an aim only on the scenario path. ScenarioWord gives each hook carriers, `leadsTo` and an Objective. Works get tellers by geometry: the nearest innkeeper, or the next town's traveller (`region-works.ts:102-109`). The hook teaches the site's name, but 12 of 13 templates declare no aim. Kits have no lead at all. They are composed at load (`module-bundle.ts:80`), after word has already been spread, and `KitManifest.hooks` (`compose/kit.ts:21,30`) is declared but never read. The audit's `clues()` checks only scenario carriers.

**Evidence.**
- `trace/lead-aims.ts`: Lyle's line adds Gaudumport as a destination and leaves the aims unchanged. The widow at Brockfield adds an aim, and Aspen's Thorn Hole rumour adds an aim. So scenario and bounty leads make aims, and kit, work and traffic leads do not.
- `hobs/folk.kyr:55-56`: `empty_frame` and `clappers` have no `teaches`.
- Grep finds 0 Objective and 0 `leadsTo` in the raider-hold and toll-road modules. Only bounty has them.
- Survey of 9 seeds: the only Objective tied to the hold is the bounty patron's. It is 0.2h from the start in 3 seeds (it works by luck) and 2.2 to 10.2h away in the rest.
- Asserting `knows(party, bell_dread)` changes no aim.

**Correction.**
- *Smallest, data only, one kit:*
  - In `hobs/folk.kyr`, add a `bell_taken` fact with `leadsTo` the hold, put `teaches bell_taken` on the frame and the clappers, and declare an Objective on knowing it.
  - In `kit.json`, bind the chapel town's innkeeper as a slot (as toll-road binds `provider`) and give them "Ask about the bell".
  - Keep the chapel/prey split. Commit 06a4c31 made the bell-frame a cross-town hook on purpose. Change the boy's line "our chapel" (`folk.kyr:61`), which contradicts it.
- *Structural:* make the lead contract part of placement.
  - Implement `KitManifest.hooks` in `Composer.place`: carriers in the hook's `heard` settlement and its neighbour, and `leadsTo` the claimed slot. If not, delete the dead type.
  - Give each work template one Objective on its named fact.
  - Extend `WorldAudit.clues` to kits and works. Every placed site needs a fact that `leadsTo` it, told in a settlement the placement is bound to, and an Objective that fact makes true.
  - Run the audit as a gate across the countries seeds.

**What else improves.** Travel, because destinations appear near the start. Arrivals, because there is an aim when you get there. Change 3, whose main input is aims; today the only aim rank pushes a distant Thorn Hole to the top. The toll-road and outlaw variants, which have the same structure. The map, because a kit bound to its approach gets that approach's position.

**How to verify in ordinary play.** Start kite with the Coming home origin and all defaults, and go to the bridge-foot.
- A new aim should name the hobs and Gaudumport, and Gaudumport should appear among the places to set out for, without opening any conversation.
- Aspen should offer the bell near the top of her list.
- At the clappers the aim should stay or get more specific.
- After the boy's "they can't stand bells", an aim to ring a bell in the hold should appear.
- Following only aims should reach the delve.

Headless: rerun `trace/lead-aims.ts`, `lead-inventory.ts` and `kit-leads-survey.ts`. Every hobs seed should show a hobs Objective, not only `pricePatron__*`. A new WorldAudit test should fail on a kit placement with no lead.

### Change 2: a place that promises an inside has one, and its way in has more than one key (structural)

**What the player experiences now.** Thorn Hole is the most-told place in the start town: four carriers, the innkeeper's topic, and two aims for the kin origin. It is one screen: the hounds, one fight, a "Search here" that finds nothing, and torches bought for nothing. At Gaudumport, everything the singing hall offers is behind one door that opens only to lore: three of its four facts, the revelation that points to the great work, and the crystal. The default company has no lore. The probes the page offers on the door (look, push, listen) do nothing, and "Needs lore" doesn't say where lore can be had.

**Why it happens.** One rule separates purpose from structure. `world-assembler.ts:353` says "A scenario takes a site of its own, never one of the makers' works". So a scenario's site is made new: one `Place … is room` with a kind label (`region-sites.ts:111/116`). The first kind the terrain allows wins, which means a cave, or a barrow in marsh, and both have outside lines that name an entrance. Works do have interiors and an `@lair` room, and RegionRenewal already moves beasts into it. But `WorkPlan` has no slot for a purpose. Each gate is keyed to the makers' art with a single skill. And the audit's `reachable()` assumes "a way can be opened" (`world-audit.ts:23-34`). Kits are the one path that has both a stake and paired keys, which is why the hob warren was the best part of the play.

**Evidence.**
- Den survey: 29 of 29 dens in 20 seeds have no inside, and dens are 29 of the 65 plain sites. The drover's thread ends at a den in 11 of 20 kin worlds.
- `singing_hall.kyrt:20,27`: the door of notes is the only passage to the third room, and it opens only with lore. `:34-38`: the payoff is all behind it.
- `trace/reach.ts`: the default company reaches 79% of the rooms in works. Lone callings reach 52-63%. Every company without lore stops at 2 of 3 rooms in a singing hall.
- Gates with a single key: the barrow seal-stone, the galleries cage and bars, and the keep portcullis (all brawn), and the door of notes (lore).
- 47 test files use `GeneratedWorld.put` to place the party inside rooms, so no test walks in.
- Correction after checking the code: lore can be bought. A town's priest sells `old_glossary` for 80 coin (`settlement-writer.ts:126`). The kin origin starts with 6 coin, and nothing at the door or in the hook points to the priest. So this is discoverability and economy, not absence.

**Correction.**
- *Smallest, data only:*
  - Add a `data/sites/den-hole` module in the brood-hollow pattern: a dark inner room, "the back of the cave", installed by `den.scenario.json`, with the den's `den` import and the oxen module's `lair` import bound to it.
  - In `singing_hall.kyrt`, make "Listen at the door" teach the tune, and add "Hum back the note" `after learning` it. Lore stays as the quick key.
  - Add one Objective on the hall's named fact.
  - Make the "Needs lore" row name where lore is to be had (the priest's glossary, a scholar at an inn).
- *Structural:*
  - Let a scenario that needs only a lair bind to a free work's `@lair` room (not a great or deep work), as RegionRenewal already does, instead of the rule at :353. Scenarios then gain works' interiors, and works gain scenarios' purpose.
  - Check at `WorkPlans.parse` that every gate blocking the way into a work has keys of two kinds, or an `after learning` key.
  - Make reachability honour each gate's needs, for the default company and for each lone calling.
  - Add an audit finding for an outside line that promises an entrance with no passage inside it.
  - Add one walk-in test by the default company.
- *Tuning (owner's call):* the round hall's level 3 guardian follows the codebase's own convention (Level = danger + 1, `region-renewal.ts:33`). But it beats two level-1 warriors about 6 times in 10. Measure again after change 4 before retuning.

**What else improves.** Every den in every world. The kin origin's first expedition. Callings other than warrior, whose share of works rooms is 52-63% today. NAV-09 ("a minor cave mistaken for the reward of a long journey"). And the "reveals little" complaint at works.

**How to verify in ordinary play.**
- At Thorn Hole there should be a way into the dark. It should stay dark until a torch is lit. The hounds, the bones and the yoke should be at the back, and the search should work there.
- In Gaudumport's round hall, "Listen at the door" should lead to an enabled "Hum back the note". The silent hall should be reached, and the aim should name it.

Headless: `f2-plain-sites.ts` should show w11 with at least one room inside, `f2-den-survey.ts` should find no dens without an inside, and `reach.ts` should show 3 of 3 rooms for every calling.

### Change 3: the page decides what matters before it lists what is legal (structural, within presentation)

**What the player experiences now.**
- At Thorn Hole the page opens with a three-leg journey log. The hounds' Attack is below the fold, while the right pane opens with "With you: Dunstan".
- At the stop by the bridge over the Redwater, the reason comes after the log, and the ruts are third among the things. The first tile is the distant aimed Thorn Hole. The gold "Go on" is the main button. Five identical chips read "↗ among the trees of Birchwood".
- In the round hall the countdown is off screen and the footer wraps to three rows.
- At the bridge-foot the inn is way 9 of 16, and the services are text you cannot press.

**Why it happens.** Nothing ranks the page. The screen sorts every legal command into slots by kind. `Told.Place` draws those slots in a fixed narrative order (`told.tsx:36-53`). The only rank is "aimed", then Passages' sort with the alphabet as the tiebreak (`ways-pane.tsx:44-54`, `passages.ts:120-122`). The facts that should rank the page arrive as prose:
- `Travel.interrupted` returns a bare string with no subject (`travel.ts:102-123`).
- The countdown becomes a line at the end of the exchange (`narrator.ts:84-85`), and nothing in `web/reader` draws `screen.warned`.
- A barred way's reason is its blocker's whole description (`passage-model.ts:86-89`), so the riddle is told six times.

The quiet "glance" in `quiet.md` (OWN-18 and OWN-19) was specified and never built. Every fix since M17 has been a local reorder.

**Correction.**
- The engine computes one `frame.focus` list of at most three entries, in this order: a danger here, the countdown (`warned`) with its minutes, the stop's subject, then aimed things present here. A distant aimed place never outranks something here.
- `Told.Place` draws the focus first. When the focus is not empty, the journey log becomes one line that can be opened, and the repeated stop line is dropped.
- "Go on" becomes a secondary button beside a danger or a stop.
- Ways are ordered: focus first, then aimed ways here, then services and leads, then unvisited ways.
- The services become links.
- The road strip folds branches that share a name into one chip with a count and a time.
- A barred way's reason becomes the short "The speaking door bars the way".

**What else improves.** The crowding, the stopped-journey page, the alphabetical interiors (NVR-19), and finding the inn on arrival. The quiet redesign gets the engine half it was missing. This change depends on change 1, because aims are its main input.

**How to verify in ordinary play.** Replay p1's click scripts at 1440x900 and 1024x1366. Without scrolling:
- the hounds' Attack is visible on arrival;
- a stopped journey opens with why it stopped and what to do;
- the countdown shows after lighting the torch;
- the footer is at most two rows;
- on the iPad, the inn is one tap from the bridge-foot.

Count scrolls and hesitations against p1's baseline of about 10 affected steps, 2 of them major. `trace/salience.ts` should show the focus as item 1 at Thorn Hole, at the stop and at Gaudumport.

### Change 4: the game's word on a fight, a truce and a road is true before you commit (one import defect, plus commitments that are never shown)

**What the player experiences now.**
- Of the round-hall guardian the game said "you would likely beat it, but Dunstan could fall", and the fight nearly wiped the party. At the cave mouth it said the same, and Dunstan fell.
- The hobs' truce was withdrawn by a dice roll for standing in the pens, and the only sign was a shout.
- "Set out for Brightbridge" committed the company to two forced fights without saying so.
- "Go on" was offered across a way shown as barred.

**Why it happens.** The main cause is an ordinary defect. `canon-runtime.ts:27` imports abilities with `cooldown: a.recharge ?? 0`, but Orsino gives every non-weapon skill `action.cooldown || 3` (`orsino/Combat.ts:741-744`). So only in Kyrie are Second Wind (a 1d10+level heal) and Sweeping Strike (an attack plus 3 turns prone, and prone means no actions) free every turn. The reckoning (`danger-sense.ts:84`), the AutoPlayer and the viability gates all fight with Tactics, which spams both. So every automated measure agreed with the forecast, and the gap with human play never showed. The fight cards hide it: Strike, Cleave and Sweep all read "2 in 5", and Second Wind shows no note at all.

The truce and road problems are a separate cause: changes of stance and hazards on a route are never shown before you commit.
- A withdrawn `tolerates` has no presentation, and `truce_broken` has no `says` (`folk.kyr:152-154`).
- `caught_thieving` fires for merely being in the pens (`folk.kyr:149-151`), with no act needed.
- `Itineraries.plan` falls back to guarded ways without saying so (`itinerary.ts:39,66-69`), and the set-out card shows only way, place and minutes.

**Evidence.** `kite-stone.ts` reproduces the screen text exactly. The reckoning's policy wins 0.83 to 0.88. A player pressing Strike wins 0.52 to 0.63. In `danger-uses.ts`, the company sweeps 15.8 times per fight while the stone acts 8.1 times. Without the two techniques the win rate is 0.41, the same as Strike only. Across 10 companies, Strike only is 30 to 45 points below Tactics.

**Correction.**
- Restore Orsino's default cooldown for techniques (one line). The investigators called the free import "faithful"; that is backwards.
- Show what each technique does on its card.
- Pass `members` and the group to `Environment.encounter`, as `campaign.ts:218` does.
- Measure the gap between Tactics and Strike again before changing which policy the forecast plays.
- Give `truce_broken` a line, or have the engine report any withdrawn `tolerates` as a change of stance.
- Key `caught_thieving` to an act (Take or Untie) instead of to presence.
- Carry each leg's status, and any hostile rooms on the route, into the set-out card. Never offer "Go on" across a barred way.

**What else improves.** Every fight in the game. The AutoPlayer and the solo-viability measures, such as "7 of 17 solo mages fall", become honest. Expect their numbers to get worse: that is the truth showing.

**How to verify in ordinary play.** Take a fresh warrior through Gaudumport and the hold, pressing only the first card. Every fight should be preceded by a word that matches how it goes. After "THIEVES!" the page should say the hobs no longer let you by. The set-out card home should name the raiding party and the hobs on the gate. Headless: the band from `kite-stone.ts` should contain the Strike-only win rate.

### Change 5: an ending becomes a fact the world can answer (a gap in what the generator emits, not a missing abstraction)

**What the player experiences now.**
- After the den is cleared, "Ask Aspen again about Thorn Hole" still says "There is always something living in it" and gives directions.
- The notes keep Thorn Hole under "Where you could go" and the rumour under "Heard, not yet seen", beside "Nothing more is asked of you".
- The rescued boy, standing at the bridge-foot, gets no reaction. His home is Brockfield, 7.5 hours away, and nothing names it, so the 600 experience for the hobs was never reached.
- Only the hand-scripted father thread reacted to anything.

**Why it happens.** A generated placement's ending is recorded only in bookkeeping (`progression.ts:42-56`: `seen[…resolved]`, experience, and "Seen through"). It is never asserted as a world fact. Generated word is written before placement from static tables, and nothing ever makes it stale. `recall` copies one-off topics into 193 "Ask again" topics in kite, each replaying its fixed text.

The engine can do this. Hand-placed adventures make their word stale when they are resolved (`gosses-company/placed.kyr:6`, `the-long-man/placed.kyr:7`), and RegionRenewal writes thanks and news. The generator never uses either.

The notes have a related fault in how a fact counts as confirmed. It needs to be witnessed, found, read or "borne", and "borne" depends on `tookWay`, which holds only while that track is the last one taken (`company-knowledge.ts:18-29,53-57`; `passages.kyr:7`). Being at the place a fact leads to does not count.

**Evidence.** `trace/notices.ts`: other modules test the goal of each placed module 0 times, apart from two hand-wired cases. The only rules that make a fact stale anywhere in the generated world are fever's. `trace/homecoming.ts` covers the boy.

**Correction.**
- ScenarioWord, and the kit hooks from change 1, emit `Rule … when <goal> { Assert stale(hook) }`.
- Each hook town gets one keeper topic thanking the company, in RegionRenewal's pattern.
- `RegionSites.said` is offered only while its hook is not stale. Because `recall` copies the condition, the "Ask again" copy stops too.
- In `CompanyKnowledge`, a fact counts as confirmed once the company has been at its `leadsTo` place, "been" replaces `tookWay`, and stale facts show as settled.
- In the hobs kit:
  - the boy names his town;
  - an Objective holds while he follows;
  - an action at the chapel hangs the bell back in its frame;
  - `empty_frame` is keyed to the bell, not to `freed(captive)`.
- A lint: every situation that grants experience has at least one line outside its own places that tests its goal. `notices.ts` already measures this.

**What else improves.** The notes, trust in rumours, and the cold review's "resolution produces drift".

**How to verify in ordinary play.** Clear Thorn Hole and return to the Merry Sun: someone remarks on it, Aspen's lines have changed, and the notes mark it done. Rescue the boy: the aim names his town. Arrive there: his mother's scene plays.

### Not among the five, and why

- **The map.** The owner asked for no restyle, and none is proposed. The map was not why the expedition failed: the player reached everything by one-click travel. It has three local defects.
  - The camera never frames where you are together with where you are going. It aims a fixed offset north at one tilt, so the top half of the screen is past the country's edge (`board-camera.ts:17-25,44-60`, `board.ts:177-181`). This is tuning: a `frame([here, chosen])`, with the tilt rising as the camera pulls back, keeps the owner's low angle up close.
  - Inside sites nothing is drawn. `screen.chart` is still built every turn (`screen-model.ts:88`), but 22ebb73 removed the plan that drew it. This is a regression.
  - Kit sites and the containers of works have no position (`region-writer.ts:248-250`, `composer.ts:108-114`), so the board centres on the first town. This is fixed by change 1's placement contract.
- **The seams.** These are separate, mostly one-line defects, not one structural cause:
  - the den's search is legal anywhere (`den/situation.kyr:30-31`) and is filed under the dead hounds, which are never drawn (`choice-grouping.ts:274-288`, `place-stage.tsx:155-156`);
  - `needsCare` is set by any condition, so lighting a torch makes Dunstan "bind the hurt" (`creature-facts.ts:171`);
  - the son has no spear, and `son_kin_ready` lacks `at(son, green)`;
  - the frightened boy gets the jovial greeting;
  - "Fall on You" (`player-view.ts:402-404`);
  - the trap is named by its mechanism before it is found (`region-marvels.ts:100`);
  - raw image credits ("A10464.jpg");
  - "Take · Dunstan" against "Give to › Dunstan";
  - CSS overlap and clipping.

  The one structural guard worth adding is a test that every choice filed on a subject is either drawn or falls back to "To do here".

---

## 2. Status of the systems the journey touched

| System | Implemented | Reachable | Usable | Enjoyable |
|---|---|---|---|---|
| **Map** | Yes: a full-screen hex board with fog and marks, and setting out from a mark | Yes: one press from any page | Partly: the top half of the screen is past the country's edge, choosing a place pans away from you, and inside sites it centres on the first town | Partly: attractive, but it did not show the player where anything was |
| **Travel / itineraries** | Yes: a told place gives a route and one-click set-out, with legs and stops | Partly: only for places someone told you of, and kits and works are rarely told near the start | Partly: routes cross guarded ways without saying so, a stop is told as prose, and "Go on" is offered across a barred way | Partly: one-click travel and the ruts stop were highlights, but the stop page is the most crowded screen in the game |
| **Open country / exploration** | Yes: tracts, cells, and features with finds (the kist's rope) | Yes: from any road or stop | Partly: branch chips that are identical and show no time or bearing, and another place's search under "To do here" | No: the player went there looking for "a place with an inside" and found nothing that led anywhere |
| **Settlements and their people** | Yes: innkeepers, priests, merchants, travellers, services, voices | Partly: the inn is way 9 of 16, the services are text you cannot press, and nothing marks where news is heard | Partly: nobody in the start town speaks of its own stolen bell, and nothing points to the priest's lore glossary | Partly: Aspen and the mother's "The dog knew" landed, but on return nobody noticed anything |
| **Sites, dungeons and interiors** | Yes: 13 work templates (3 to 23 rooms), riddle doors, snares, and kits with stakes and paired keys | Partly: every den (29 of 29) is one room, and the singing hall's payoff is behind a door that opens only to lore | Partly: no plan and no "here" inside, two dungeons on one doorstep, probes on the door that do nothing, and a trap named before it is found | Partly: the riddle door and the hob warren were the best of the play, and the round hall nearly killed the party |
| **Leads, rumours, notices** | Yes: facts, `leadsTo`, Objectives, carriers and staleness all exist | Partly: only scenarios have the whole chain, kit hooks are dead code, and 12 of 13 works have no aim | Partly: Thorn Hole's rumour became a route and an aim from one question, while Gaudumport became a destination by coincidence | No: the best-told lead went to an empty room, rumours never go stale, and the player stopped trusting them |
| **The page's actions and ways** | Yes | Yes: every legal command is drawn, which is the problem | Partly: nothing is ranked, so danger and the countdown fall below the fold, ways are alphabetical, actions are filed under subjects that are never drawn, and one slot means both doer and recipient | No: the owner and the player both call it crowded, and the one sensible move is often off screen |
| **The opening** | Yes: origins, creation defaults, the kin premise, the brother joining | Yes | Yes: the player went through on defaults without trouble, though the defaults (two warriors, 6 coin, no lore) meet gates tuned for other companies | Yes: the player named the premise among the best pieces |
| **Conversation** | Yes: topics, discussion that teaches facts, "Ask again", voices | Yes | Partly: an unranked list of topics (in Brightbridge, one local lead offered twice among five rumours 10 to 14 hours away), and nothing you see can be asked about | Partly: the lines are good (the boy's bells, the mother), but "Ask again" replays out-of-date directions |
| **Combat** | Yes: battles taken from Orsino, techniques, odds on the cards, and a reckoning before the fight | Yes | Partly: three different blows all read "2 in 5", Second Wind says nothing, and the reckoning assumes free techniques | Partly: fights resolve cleanly, but twice "likely beat it" came before a near-wipe or a fall |
| **Notes / journal** | Yes: the heard and seen ladder, aims, where you could go, seen through | Yes | Partly: cleared places stay "Heard, not yet seen" and under "Where you could go", and the aims show the opening's leftover all through the delve | No: it records what you were told, not what you did, and "Nothing more is asked of you" sits beside out-of-date leads |

---

## 3. The expedition to repair first

**The bell and the hobs, from Brightbridge (kite, Coming home, all defaults).** You see the empty bell-frame, go to Gaudumport, get through the hobs' hold, bring back the boy and the bell, and the world notices.

**Why this one.**
- It is the start town's own hook, visible on the first screen.
- It was the player's actual delve.
- The best content in the game is already written there: the riddle door, the warren, the parley, the captive and the paired keys. Only the links between the pieces are missing.
- It crosses every link that broke: lead, aim, approach, interior, danger, truce, the way home and the aftermath.
- Its fixes land on the kit path, which places raider-holds (hobs, outlaws, cave) and toll-roads in every frontier region, so comparable expeditions are fixed too. Hobs placements are in 5 of 9 surveyed seeds.

Thorn Hole comes next. Its small interior fix (the data-only part of change 2) should land in the same pass, so the first rumour every kin player hears stops leading to an empty room.

**The minimal set of corrections.** Two are data in one kit, five are engine changes (each the smallest form of one of the five changes above), and one is a guard.

1. **Lead** (`hobs/folk.kyr`, `raider-hold/kit.json`): a `bell_taken` fact that `leadsTo` the hold, `teaches` on the frame and the clappers, an Objective on knowing it, and the chapel town's innkeeper bound as a slot with "Ask about the bell". Keep the chapel/prey split and change the boy's line "our chapel".
2. **Aims through the hold and home** (`folk.kyr`):
   - an Objective on `bell_dread`: ring a bell in the hold;
   - the boy names Brockfield;
   - an Objective while he follows;
   - "Hang the bell back in its frame" at the chapel;
   - `empty_frame` keyed to the bell.
3. **The danger word** (`canon-runtime.ts:27`): techniques default to Orsino's cooldown of 3, `truce_broken` says a line, and `caught_thieving` is keyed to an act. Then rerun `kite-stone.ts` and `fight.ts`, and retune the round hall's guardian only if Strike still loses most fights.
4. **The way home** (`itinerary.ts`): the set-out card names guarded legs and hostile rooms, and "Go on" is never offered across a barred way.
5. **Position** (the composer and `itinerary.ts`): the kit's cave takes its approach's area and cell, so its heading names Lonecrag, the map marks Gaudumport's hex, and the cavern offers "Out to Gaudumport" instead of "Set out for Gaudumport".
6. **Foreground, smallest form** (`travel.ts`, the frame, `told.tsx`, `place-stage.tsx`): the stop's subject, a focus list drawn first, and "Go on" as a secondary button beside a danger.
7. **Aftermath** (ScenarioWord and the kit hooks, `company-knowledge.ts`): hooks go stale when the goal holds, the keeper thanks the company once the bell is hung, and the notes mark it done.
8. **Guard:**
   - a WorldAudit check that fails on any kit placement without a lead (today it fails on every hobs seed);
   - a walk-in test from the kite/kin bridge-foot by the default company, following aims only, pinned in the style of `test/oxen.test.ts` and without `GeneratedWorld.put`.

**What done looks like in ordinary play.** A new player on defaults, with no developer knowledge, follows only what the page puts first and what the aims say:
- At the bridge-foot, an aim names the hobs and Gaudumport.
- They set out, and at the clappers the aim gets more specific.
- In the hold they parley or fight, and each fight comes after a word that turns out true.
- They free the boy, and the bell can be carried.
- The set-out card home names the hostile legs.
- At Brightbridge they hang the bell, and the town notices.
- An aim says to take the boy to Brockfield. There his mother's scene plays, and the widow's bounty is in the same town.

Measure it against p1: no "outside persistence", and fewer than half of the 10 affected steps. Then run `kit-leads-survey.ts` and the walk-in test across the five hobs seeds.

---

## Notes on the evidence

- **Basis.** There is one player journal (p1). Every failure was traced in code and, where possible, reproduced across 9 to 20 seeds. The enjoyment verdicts rest on that one player.
- **Corrections to the investigators, checked against the code:**
  - Lore can be bought: the old glossary from a town's priest, 80 coin. The real problem is that nothing points to it and the start gives 6 coin.
  - The level 3 guardian is consistent with the danger + 1 convention, so it is a tuning problem, not a defect.
  - The free techniques are a defect in Kyrie's import, not faithful Orsino.
  - Aftermath already exists in authored adventures. The generator never uses it.
  - The chapel/prey split was deliberate (06a4c31). Only the boy's line contradicts it.
  - The seams of failure 8 are separate defects, not one structural cause.
- **Build churn.** Another process rebuilt the site twice during the play: the renames at about 23:54, and at about 00:18 a "quiet" bridge-foot that hides the inn behind "EVERY WAY FROM HERE 16". The 00:18 change would make the first lead harder still to find. Feature work landed during the diagnosis the owner asked to pause it for, so verification needs a frozen build.
- **Files.** The traces and replays are in `/home/jweissman/work/kyrie/.claude/worktrees/diagnosis/trace/` and `/home/jweissman/work/kyrie/.claude/worktrees/diagnosis/p1/`.
