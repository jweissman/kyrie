# Module 2: The Silent Lord (the castellan's keep)

*11 November 2026. Branch `adventure/fs-social`, from `adventure/first-steps`. Written before the Kyr (this section is the plan the build followed); the last section says what was built, what was proved and what was not. Status words are used strictly: **IMPLEMENTED** (Kyr/Deem/data on this branch, compiled in the audited seeds), **AUTOMATICALLY VERIFIED** (a spec drives it through the page's own labels), **EXPERIENCED** (a human-shaped play transcript under `transcripts/` read for how it feels).*

## 0. What it is, in four sentences

A keep on its rise holds a household that has agreed, in eleven days and without ever saying so, to behave as though its lord were alive. He is lying in the crypt; the castellan signs in his hand; and into this arrives a king's herald with a levy-writ whose seal is wrong, while a man in the oubliette, with the right seal sewn in his boot, says he is the king's rider. The company can walk in at the gate by day, get in at night by a drain nobody mentions, side with one household or play them against each other, and the keep, the first towns' levy, a bailiff's dues and the next rider on the road all come out differently for what it does. Nothing here is a dungeon: the danger is mostly a household turning on a stranger, and it is learnable: every lock, rota, seal and lie has a tell.

## 1. Where it stands in the world (mechanism)

* **A standing scenario** (`data/scenarios/silent-lord.scenario.json`, registered by one line in `data/scenarios/standing.json`): placed last, in every first country, "whatever else is drawn" (`WorldAssembler.settle`). It does not take a work: it **generates a site of its own** (`site: ["hold"]`, "[generated for a scenario]" in `bin/kyrie world <seed>`), as the unquiet tower does. `hold` is a new, additive site kind (`data/generation/scenes/sites.json` and the `siteKind`/`siteNoun` tables in `places.json`: no existing seed's output moved, checked on seven seeds). On the map it is "a walled keep on its rise" until named; it is reached by a track from the nearer of the nearest town's green and the nearest road; the innkeepers of the nearest town and its neighbour along the road tell of it (scenario `hooks`).
* **Roles:** `keep` (the site), `home` (the largest settlement: the first town, where the company begins), `far` (the next along the roads from it). The module imports their greens and the home town's innkeeper, priest, merchant. It declares its inside (three levels, nineteen rooms) beyond the site's outside room, as the tower does.
* **Coexistence:** the arcology and the barrow modules each add a line to `standing.json`; the merge is a list with three entries. All three claim different roles (this one takes a generated `hold` site, no existing site, and shares settlements without claiming them). No id is shared: every id of this module is installed as `keep__…`.
* **What it cannot reach:** the region exports only settlements' greens, rooms and four townspeople. The first town's authored people (the reeve, the bailiff Maudlin Rooke) are not importable (request **R15s**). So the module touches the first-town arcs from the *keep's* side, by its own people and things placed on the exported greens, and says in its own words what the first town's text already says (the clerk who "has a quarrel with the bailiff"; the rider "in the castellan's colours").

## 2. Map

```
            THE ROAD  (outside: the generated site; the culvert's outfall is in the ditch)
                │ gate (shut 21h–6h)                     ┆ outfall (hidden until learned)
   ┌────────────┴───────────── OUTER WARD ──────────────────────────────────────────────┐
   │ kennels & mews ── wall-walk ──── stables     the wall-walk reaches the solar window │
   │      │              │               │       (climb; sentries, the dead watch 2–3h)  │
   │   armoury ───── the ward ─────── granary                                           │
   │                  gatehouse (porter, portcullis, the bell)                           │
   └───────────────────┬────────────────────────────────────────────────────────────────┘
                       │ hall steps
   ┌───────────────────┴──────────── THE KEEP ──────────────────────────────────────────┐
   │ guest chamber ─ solar (castellan; door-ward) ─ chancery (clerk; muniment press)     │
   │      └────────── GREAT HALL (the feast) ─────────────┐                              │
   │  kitchen ──────────────┴──────────────── chapel ───────┘                            │
   └───┬────────────────────────────────────────────┬───────────────────────────────────┘
       │ buttery steps                              │ chapel stair
   ┌───┴─────────── BELOW ────────────────────────────┴────────────────────────────────┐
   │ undercroft ── strong-room (three locks)         crypt (the lord)                    │
   │     │ hatch (barred)                                                                │
   │ oubliette ═ old door (hidden) ═ the old vault ═ drain (foul air) ═ outfall (road)   │
   └────────────────────────────────────────────────────────────────────────────────────┘
```

Nineteen rooms plus the road: gatehouse, ward, kennels and mews, stables, armoury, granary, wall-walk; great hall, kitchen, chapel, chancery, solar, guest chamber; undercroft, strong-room, crypt, oubliette, old vault, drain. Restricted spaces: the armoury (the marshal's key), the solar (a door-ward; the castellan), the chancery press (the clerk's), the strong-room (three keys), the crypt (the chaplain's), the oubliette (barred hatch), the guest chamber (the herald's trunk and bravos), the kennels at night (hounds), the wall-walk after dark (sentries).

## 3. Who wants what

| Who (id) | Wants | Holds | Will not | Reading of the Empire's end |
|---|---|---|---|---|
| **The castellan** (`castellan`), warrior 4, proud | The keep intact till the lord's ward, a girl at an abbey, comes of age; to not be the one who surrendered it | The lord's signet; the solar key; a will she cannot yet show | Admit the death while the herald can use it; be seen to ask | none; she says it is "not a question for a woman with a levy to raise" |
| **The steward** (`steward`) | His books to balance before anyone audits them | strong-room key (1 of 3), the granary tally | be accused in public; he will confess to a kind hearing | none |
| **The chaplain** (`chaplain`), cleric 2 | The lord buried; the truth said; the girl sent for | crypt key; strong-room key (3 of 3); the lord's last words | lie to the herald's face | **judgement**: the Empire was a proud thing that was told to stop |
| **The marshal** (`marshal`), warrior 3 | Pay for the garrison, in arrears since midsummer | armoury key, hatch key, the pay-roll; thirty spears' loyalty | take the lord's silver in his name; serve a stranger | **desertion**: it stopped being paid and the legions went home |
| **The clerk** (`clerk`) | The household's papers in order; the bailiff stopped from collecting "in the castellan's name"; his own advancement | the press key; the lord's hand (he has been forging it for eleven days); the matrices | burn a paper | **record**: the Office dissolved itself by its own rule: "it was not conquered, it was closed" |
| **The houndsman** (`houndsman`) | The lord's old hound let to howl; his dogs kept from the castellan's men | the way in by the drain, which he has told no one; the kennels | have a stranger put hands on a dog | none |
| **The cook** (`cook`) | The kitchen left alone; a feast that does not shame her | the monkshood on the shelf; every household secret one servant can know | be thanked by the steward | none |
| **The porter** (`porter`) | No trouble before supper | the gate, the bell | open after dark for nothing | none |
| **The herald** (`herald`) | The keep surrendered to his master, `{patron}`, on the writ; a good dinner | the writ (old seal), a letter in the household's own hand, two bravos | be looked at too long | none |
| **The captive** (`captive`) | To be heard before the feast | the true writ (in the strong-room), the court's news | be believed on his word | — |
| **The leaguer** (drawn: steward, marshal or clerk) | Whatever the herald's master has promised them | — | be named | — |

The three readings of the Empire's disappearance are held by three households of the keep (chapel, garrison, chancery), each with a thing in its own room that "proves" it; none is confirmed (see 6). They matter for play as three keys of regard: to be heard on his reading is to be trusted a little by that household.

## 4. The clock

* **Hours** (the world's `hour(clock)`): gate open 6–21; the household's routine by period (`duty(person, period, room)`): matins, morning work, dinner, afternoon, vespers, evening, night. People are where the rota puts them; the kennel hounds are loosed into the ward at curfew and called in at dawn; the sentries leave the wall-walk to the gatehouse brazier between two and three in the morning (the **dead watch**).
* **The muster day** (`feastDay`): on the home green a **crier in the castellan's colours** reads the levy from the second day of the game; the notice names the muster on the twelfth day. The first time the company comes in at the gate, the feast is set for the evening of `max(12, today + 2)`. Before then the keep is as it was; after the **Reckoning** (the feast's height, 22h) the keep is in one of five states and stays there.
* **Default course** (`unclocked`): if the company never enters, the notice on the green is amended on the twelfth day ("postponed, the lord being indisposed") and the levy stays called; the company coming later finds the same keep.
* **After the Reckoning** the world follows it: next morning the crier's notice is rewritten; two days on, the outcome's riders and deserters are on the roads; a week on, the heir (if the regency holds) comes to the gate.

## 5. The puzzles, secrets and mechanisms (every one learnable)

| # | Mechanism | Clue / tell | Operation | Consequence |
|---|---|---|---|---|
| 1 | **Curfew gate** | the porter's bell-rope and "shut after dark" (the folk's saying; the sign at the road) | by day just walk in; at night ring and persuade (fair), pay the porter 3 coin, or go round | a porter bribed remembers; a night entry unannounced is a trespass (`hunted`) |
| 2 | **Loosed hounds** | the sound of chains in the evening; the houndsman: "after the bell" | a marrow-bone from the kitchen quiets them; the houndsman whistles them off if he trusts you; or fight (3 mastiffs) | hounds killed: the houndsman never forgives |
| 3 | **The outfall** | the porter's grumble about "the ditch that smells of the old well"; a plan pinned in the chancery; the houndsman once trusted | search the ditch; find the culvert; crawl | a way in that bypasses the whole upper keep |
| 4 | **Foul air in the drain** | the lantern leans and burns blue; the dog won't go past the second bend | prop the old grating (crowbar or brawn) to draw it through, or hold breath (hazard) | a hazard struck once if ignored |
| 5 | **The old door** | the oubliette's back wall is dry where the others weep; a lever-slot | pull the lever (brawn), from either side | the old vault (sealed since the first foundation) |
| 6 | **The old vault** | drawn: the Office's strong-room, a warlord's founding hoard or a first makers' tally-room | explore; take the **bronze die** | the die seals paper; the clerk wants it |
| 7 | **Oubliette hatch** | the groans; the warder-less chain; the marshal's key on his belt | lift the bar (brawn), the key (marshal), or pick | the captive is free; the marshal knows who freed him |
| 8 | **Strong-room: three locks** | the steward's, castellan's and chaplain's keys on three people | turn three keys, pick three locks (lockwork), or force the door (crowbar, loud) | forcing sounds the alarm; picking leaves the lock "worked" (a trace the steward finds) |
| 9 | **Granary count** | the cook says the loaves are short; the steward's tally on the granary door | count the sacks (an hour); read the tally; compare | the steward's shortage proved; he confesses (a hearing) or is shamed |
| 10 | **Two seals** | the herald's writ: a plain crown; the spring letter in the press and the captive's writ: a crown between two ears of wheat; the groom: "the lathered horse had the new brand" | read all three | **`herald_false`** known; the herald may be named |
| 11 | **Whose hand** | a letter to the herald from within the household (in his trunk): one tell in the writing (drawn) | compare the tell with the tally, the pay-roll and the press index | **`leaguer` named** (`hand_steward` / `hand_marshal` / `hand_clerk`); naming the wrong one costs |
| 12 | **The lord's death** | the old hound howls at the chapel; the chaplain's face; the crypt | the crypt (key or the chaplain's trust) | `lord_dead` known; the cause is drawn (a fall, a fever, a seizure): the bier says which |
| 13 | **The will** | the clerk's hesitation about the press | the press (key, pick, or the clerk's trust) | the will names the ward as heir and the castellan regent |
| 14 | **Poison** | the cook's shelf: monkshood "for the rats"; the cook counts it | steal it; slip it in the herald's cup before the feast; or into anyone's | the herald dies at the feast; the household suspects the castellan; a witness may name the company |
| 15 | **Forgery** | the clerk has been writing the lord's hand | pay or win the clerk; he writes a remission, a pay-order or a writ; sealed with the matrix or the die | a forged paper works once; the crier or the marshal may see through it (insight) |
| 16 | **Solar by the window** | the wall-walk's shutter; sentries' rota | climb from the wall-walk in the dead watch | the castellan's papers, key and ring; if she wakes, a talk or a fight |
| 17 | **The feast** | the whole household in the hall; the steward's keys on his belt; the kitchen full | public acts: accuse, proclaim, produce the captive, expose the leaguer; or private: everyone is in the hall, so everywhere else is empty | the Reckoning |

## 6. Encounters and their difficulty

Danger is meant for a first-country company (level 1–3, three people or one). **Talk encounters:** the porter, the houndsman, the cook, the steward, the chaplain, the marshal, the clerk, the herald, the captive, the castellan, the crier at the green. **Fights:** (a) the mastiffs, three, level 1, at night in the ward (red warning; bone, houndsman or fight); (b) the gate-watch, three, level 1, if the alarm is raised or the gate forced; (c) two sentries on the wall-walk, level 1–2; (d) the solar door-ward, level 2 (territorial: "ask to be let by" works); (e) the herald's two bravos, level 2, in the guest chamber or at the feast; (f) great rats, three, level 1, in the drain; (g) the marshal, level 3, in a mutiny or if the company sets on the captive's guard; (h) the castellan, level 4, in the solar if cornered or in the hall if publicly shamed. Attacking a member of the household in the open turns the household (`hunted`): the gate is barred to the company, the porter will not speak, and the drain remains.

## 7. Approaches

* **Straight in by day**, as travellers, asking for the hospitality of the hall: you are given a place at supper, and the castellan will see you the next morning if you are quiet and useful.
* **Negotiate**: win the houndsman (the hounds), the cook (the kitchen), the clerk (the press), the chaplain (the truth), the marshal (pay), the steward (a hearing), and use their keys. Each is a topic with a price; no one can be bought by all means.
* **Prepare and bypass**: the outfall, the old vault, the oubliette, the undercroft, the strong-room, in the order that suits; or the wall-walk, the solar window.
* **Retreat and return**: a company turned out (wrong accusation, alarm) can go to the home green, learn from the innkeeper, the priest and the crier, and come back by the drain; the household remembers.
* **Wait for the feast**: arrive on its eve and let it happen, then act in the confusion of the hall.

## 8. The five states of the keep after the Reckoning

| State (`keep__banner`) | When | The keep | Out in the country |
|---|---|---|---|
| **regency** | herald unmasked and the death told | the castellan as regent, banner half-mast; the chaplain proclaims; the heir sent for | levy **commuted** to coin and grain (fewer men); a rider carries the clerk's writ to the bailiff's village; the heir arrives a week on |
| **lie** | herald unmasked, death still hidden | the household in a stiff truce; the porter wary | levy **quashed** by a letter "in the lord's hand"; it will fail at the next court |
| **patron** | herald not unmasked | the herald's master's steward in the solar; the castellan under guard; the captive gone | levy **raised** hard: men and grain taken; the crier now wears the patron's colours |
| **garrison** | herald unmasked or not, but the garrison unpaid and the castellan fallen or the death told | the marshal in the hall; the household sullen | the levy **abandoned**; **unpaid spearmen** on the home green, asking toll |
| **barred** | the company has turned the household against it (a killing in the open, a poisoning traced, an alarm) | whatever the above, but the gate does not open to the company | only the drain works |

## 9. Variation (Deem, per country)

Drawn from `tables.json`/`templates.json` of the module, keyed by the country: **the leaguer** (steward, marshal or clerk: which hand is in the herald's letter and who the herald's friend inside is); **the herald's master** (`{patron}`: a name for the house, labelled); **the cause of the lord's death** (a fall from the horse, a winter fever, a seizure at table); **who built the old vault** (the Office of the Road's strong-room, the warlord house's founding hoard, the first makers' tally-room); the **names** of every inhabitant, by the country's people and sex (`FantasyRules.another`). The keep's essence, the lord's silence, the herald and the captive, the three readings and the five endings are fixed.

## 10. Foreshadowing carried (possibilities only)

A new king in his second year, a coronation court far off, a marshal and a queen-mother's party named only as "the court"; a levy "for the matter of the March" (against whom, no one says); three letters on the chancery shelf (an abbey's about the heir, a salt-factor's saying prices fall a third where a certain lord is liked, a border captain's asking for men at a ford); the three households' readings of the Empire; the old vault's builders (drawn); a bronze die. Nothing says which reading is true, who the king is, or what the March is.

## 11. How to run it

`bin/kyrie play --world kahitude --as human/warrior/Ralf "Ask the innkeeper about the castellan's keep" …` (labels as the page offers them), or open the country in the browser. The keep appears in every first country; ask the innkeeper of the nearest town, or watch the crier on the home green.

## 12. What was built, proved and not proved

**Implemented** (data only; no TypeScript beyond the registration of data, see the list of shared files): the scenario `silent-lord`, one line in `standing.json`; a new additive site kind `hold` (`sites.json`, `siteKind` and `siteNoun` in `places.json`); the module `data/situations/silent-lord` (nine Kyr files, `tables.json`, `templates.json`): 19 rooms, 12 named inhabitants and 6 groups, 17 mechanisms, a household routine by the hour (`duty(person, period, room)` and one generic rule), a feast with a clock, a reckoning into five states, and the first town's levy, crier, deserters, rider and writ.

**Automatically verified** (focused specs, `bun test test/silent-lord*.test.ts`; each plays by the page's own labels, and says where it puts the company down to skip a walk):

| Spec | Proves |
|---|---|
| placed in 7 seeds | the standing scenario takes a generated `hold` site in every first country sampled (forest, marsh, mountain, frost; human and dwarf), bound to the first town |
| names, leaguer | 11 inhabitants named from the country's folk, one leaguer drawn |
| heard, walked, entered | the crier's notice on the green teaches the way; the map's set-out arrives; the gate is a gate |
| the regency | marshal paid, chaplain, clerk, castellan won, press opened, will and spring letter read, seals compared, the king's seal laid before the hall at the feast, the regency holds, the levy is commuted |
| the gate at night; the hounds and the bone; the houndsman's trust; the dead watch | the curfew gate opens to a civil word or three crowns; hounds are loosed and answered; the sentries leave the wall between two and three |
| the drain | the outfall is found by searching; bad air is cleared by propping the grating; rats fought; the old vault; the oubliette; the rider freed |
| the poisoned cup | the herald dies at the feast, the lie holds, the levy is remitted on the green, the innkeeper's collection is paid, the state survives a save and reload |
| a wrong word before the hall | the herald's men are turned loose and the household is hunted |
| the gate shut and the cooling | the gate is refused to a hunted company and relents after three days (the hunt is made by assertion in that spec; the fight that would make it kills a level-one warrior alone) |
| an unpaid garrison | the death told with no pay: the garrison takes the keep, the castellan is put in her own oubliette, deserters ask a toll at Thornhaven's green, the levy is abandoned |
| forgery and the rider | the clerk's remission quashes the levy at the crier; his rider posts the writ on the next green |

**Experienced:** three scripted journeys, driven by `scripts/play-transcript.ts` over the page's own labels and written as the page told them, are in `transcripts/silent-lord-approach.txt`, `-night.txt` and `-regency.txt`. They were read by their author. They are not an independent player's play and prove nothing about whether a stranger finds it clear or wants to go on.

**Not verified:** the browser; the paintings (rooms are named for existing kinds; the great hall, solar, kennels and mews have no matching room painting: see the commission list below); a cold human player; the full suite; fights beyond what the specs trigger (the mastiffs, rats, and the herald's men were begun, not balanced); the Reckoning's other combinations (usurped, and a regency whose herald is bought off) are in the Kyr and not each walked; the companion hire of the freed rider is not built.

## 13. Requests (continuing kyr-deem-requests.md; prefixed `s`)

**R15s. A scenario cannot import the first town's authored people and facts.** The region module exports a fixed list of ids (`RegionWriter.manifest`: greens, rooms, innkeeper, priest, merchant, traveller, sites, ways). Reproduce: in `silent-lord.scenario.json` add `"reeve": "@home.reeve"`: `Unresolved module import reeve: region.s1_reeve`. So the keep cannot read `s1_rooke_reported` or `s1_forged`, and meets the bailiff story only by its own clerk, rider and notice on the next green. *Proposal:* export every id a town template declares (the parser knows them), or let `@role.part` resolve any region entity.

**R16s. A new kind of site is three data edits in three files.** `sites.json` (how it looks), the `siteKind` groups (per terrain) and `siteNoun` (names), and nothing says so; a kind absent from any silently fails to place. *Proposal:* one `kinds` entry in `sites.json` with `terrains` and `nouns`.

**R17s. A person who is both `Peaceable` and has a `Temperament` still warns and fights on arrival.** Reproduce: `Person sentries ... Peaceable. Temperament territorial. Warns "..."`, put the company in its place: the warning is told and the fight begins. The guide says a peaceable person "comes at nobody". I worked round it with two groups (day and night sentries) appearing and vanishing by rule. *Proposal:* let a rule assert or retract a temperament, or make `Peaceable` suppress `Warns`.

**R18s. No routine for people who keep hours.** Seven periods and eleven people are a relation `duty(person, period, room)` and one rule; it works, and the lint cannot see it. *Proposal:* a `Keeps <room> from <hour> to <hour>.` line on a Person.

**R19s. A shared relation name taken for a module's own gives "Unknown predicate" at the spec, not at the load.** `settled`, `trusts` and `won` are shared; my own were renamed by the shadowing and the spec could not find them. (Cf. R10, the noisy error.) *Proposal:* the load says "your `settled` is shadowed as `own_settled`".

**R20s. A topic whose effect takes coin from a person who has none is quietly never offered** (`Decrease quantity(keeper, gold) by 8` on an innkeeper with less). The page shows no reason. *Proposal:* say so in the lint, or let a topic pay from nothing.

**R21s. Two topics with one label, only one eligible, are not offered.** Four "Ask {keeper} how the muster went" topics (one per outcome) offered none until their labels differed.

## 14. Shared files touched

`data/generation/scenes/sites.json` (one kind), `data/generation/tables/places.json` (`hold` in five `siteKind` groups, one `siteNoun` group), `data/scenarios/standing.json` (one line), `data/paintings/scenery.json` (two `places` keys: the hall and solar take the great-hall painting), `test/fixtures/traces/wren-tower-climbed.transcript.json` (digests only: `bun scripts/redigest-trace.ts wren-tower-climbed` says "it comes where it came"), `web/bundles.generated.json` (regenerated), `scripts/play-transcript.ts` (new, a developer tool). Merge notes: `standing.json` takes one line from each of the three standing modules; `places.json` and `sites.json` are additive; the trace and bundles are regenerated, not merged.

## 15. Painting commissions

A great hall with a high table and an empty seat (the hall takes `dissolution` from its kind word; the scenery table's `places` could name `scene-great-hall`); a kennel-yard with hounds in pens and a mews; a bier in a vault with candles in a ring.
