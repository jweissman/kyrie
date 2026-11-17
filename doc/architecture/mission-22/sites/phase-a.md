# Substantial early sites: Phase A (read-only)

M22 side commission (`/var/tmp/kyrie/m22/sites-brief.md`). Worktree `wt-m22-sites` at `025ed83e`, nothing tracked
changed. Instruments and raw output are in `/var/tmp/kyrie/m22/sites/`:
- `census.ts` → `census.md`, `census-abc.json`;
- `explore.ts` → `explore.jsonl` and `x-<seed>-<build>-<site>.txt` (one log per walk);
- `pacing.ts`, `shops2.ts` → `shops-*.txt`;
- `economy-now.md`, from `scripts/economy-measure.ts`.

## 1. Measured baseline

### Method

Both instruments run the authoritative engine, on a1, b2 and c3, with origin `debt` and a lone human, so a lone
first-level novice.

- **`census.ts`** reads every site of a country from the compiled campaign:
  - places by containment;
  - non-peaceable bands, with their members' levels;
  - things that hurt; riddle doors and caskets; wonders; lore-gated things; other mechanisms;
  - items, hidden items, hidden ways and gated ways;
  - minutes from the start.
- **`explore.ts`** walks a site on `Journey`: the page's legal acts, with the company's own auto combat. Each act is
  marked by whether it was among the four the scene led with (`Runner`). It plays a careful company that:
  - asks the town's standing people for work (the undertown's jobs hand out its keys);
  - buys rope and three torches;
  - tries each act once: takes, looks closely, listens, searches and reads first, risks last;
  - deals with a hostile person by the site's own acts before fighting;
  - fights only what the page itself reckons less than grave (`DangerSense`, shown on the act);
  - avoids a way the prose says something lies in wait along, and leaves a room whose band it declined;
  - below half health or out of light, goes home to be paid, sell, sleep and restock, then comes back to where it was;
  - sells everything at the end.

  A **bold** warrior variant fights whatever the page leads with. Builds: lone mage (4–6 HP), warrior (12–15 HP),
  and a cleric on the undertown.

**What the walker is and is not.** It understates a reasoning player, because it cannot read a frieze. It overstates
a player's patience, because it tries everything. One walk per build and site on a fixed seed is one roll of the
dice, not a distribution. A walker's success is not anyone's enjoyment.

### Classification

54 sites over three countries; means per class.

| Class | n | Rooms | Bands | Traps | Riddles | Wonders | Lore | Mech. | Items | Nearest |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Substantial, deep generator**: catacombs under the start town, the country's deep work | 6 | 33 | 15 | 6.2 | 3.5 | 1.2 | 9.7 | 17.8 | 50 | 23 min |
| **Substantial, authored scenario** placed in the country: tower, arcology, howe, keep | 12 | 27 | 4.8 | 2.8 | 0 | 0 | 3.1 | 11.8 | 10 | 91 min |
| Minor works: cistern, barrow, watchtower, keep, abbey, tollhouse, roadstation | 21 | 10 | 2.2 | 0.4 | 0.2 | 0.4 | 2.7 | 3.2 | 4 | 71 min |
| Great works: a keeper alone | 3 | 8 | 1 | 0 | 0 | 0 | 1 | 1 | 3 | 331 min |
| By the start town: manor, old stones | 6 | 7.5 | 1.5 | 0 | 0 | 0 | 2.5 | 3.5 | 5 | 11 min |
| Single-purpose: dens, bare mounds, sinks | 12 | 3.8 | 1.4 | 0.2 | 0 | 0 | 0.2 | 0.4 | 8 | 141 min |

**Every country's first substantial dungeon is the same one.**
- It lies under the start town, 23 minutes from the door.
- Its top is authored (`undertown.kyrt`, 14 rooms): corn-store, crypt, quarry, undercroft and vault, three jobs, nine
  bands.
- Below the vault, the deep generator writes three or four levels (`RegionUndertown.catacombs`,
  region-undertown.ts:62-95).
- The country's own deep work is 131–171 minutes out.

### What a starting company reached, by walk

Careful policy unless marked. "Secrets" are hidden things found by search or inference. Earnings are net coin
brought home: pay plus sales.

| Site | Seed | Lone mage | Warrior | Cleric | Bold warrior |
|---|---|---|---|---|---|
| Undertown and catacombs | a1 | died L1, 26/52 rooms, 4 secrets, +85 | died L1, 26/52, 6 secrets, +41 | died at the town's spiders, +44 | died at the spiders' mother, +0 |
| | b2 | died at the quarry, 16/41 | lived 21/41, 10/10 fights, 6 secrets, +108 | lived 21/41, +94 | reached the heart, 35/41, died attacking the king (L12), +351 before |
| | c3 | died L1, 26/40, 7 secrets | lived 16/40, 7 fights, +95 | died L1, 30/40, 9 secrets, +50 | lived, +95 |
| Deep site | a1 barrow | lived, turned back at 8/23, +44 | died L1 (routed into a declined band) | — | died L0, 4/23 |
| | b2 mine | lived, turned back at 4/36, +15 | lived 20/36, 7/7 fights, **+600** | — | lived 22/36, **+731** |
| | c3 mine | died L1 (ore pass into a silent ghoul ambush) | died the same way | — | died L1 |
| Roadstation | a1, b2 | 13/13, +63–65 | 13/13, +73–75 | | |
| Manor / old stones | a1 | +25 / died to the dome's wisps | +25 / +4 | | |
| Minor keep (outlaws) | c3 | died at once: "Call Sir Hamo out" was led with | died the same way | | |
| Authored keep / arcology | b2 / a1 | +3 / died to the eels | +42 / died | | |

**The pattern.**
- Of 21 walks into the two substantial generated sites, 13 died.
  - Every lone mage that entered the catacombs died.
  - The two lone mages that lived in a deep site turned back on its first level.
- Deaths came from three sources:
  - ambushes reached by a one-way or a routed move (the winze foot, the ore pass);
  - fights the page reckoned only `hard`;
  - territorial bands that lost patience during a search.
- About half the acts (40–55%) were among the four led with.
- About half the searches said "nothing is hidden here" (counted in three logs).

### The owner's targets against what was there and what was reached

| Target | Catacombs under the start town | Country's deep site | Minor works |
|---|---|---|---|
| ≥3 distinct combats | Present: 12–15 kinds below, 8–9 above | Present: 12–17 kinds | Rarely: 2.2 bands |
| One on the direct route | **Met**: each job is a fight or a parley on its way; a level-0 fight within two rooms of arrival 87% of the time (`pacing.ts`, 200 keys a purpose) | **Met**, same sample | One at the way in |
| Retreat, preparation, other resolution | **Strong above**: talk, the rite, the candle, the book's ring, firebomb, ratsbane, Sleep (undertown.kyrt:157-415); draw out; declining. **Weak below**: an ambush is told only by prose | Draw out, decline, the keeper's bane | The barrow's flute |
| Lasting consequences | Measured: the dead stay dead on return; jobs pay; the shrine shuts if the seal is defied. Newcomers come only at the first dawn after the company leaves a level (deep-time.ts:40); no walk saw one | Same | Emptied works are retaken (`RegionRenewal`) |
| Cache with keepable variety | **Partly**: keepables come from spoils (the raiser's dagger, cloth and spellbook) and the earlier party's pack. The undertown's caches are valuables. 0–6 keepable of 5–28 taken | **Mine yes, barrow no**. b2: 24 keepable of 54 (a ring of strength, potions, chainmail, a lamp), mostly goblin spoils of one kit repeated. a1 barrow: 0 of 12 | Valuables only |
| Secret with evidence | **Met above**: the ring of letters in three places; promised finds cued by the scene; 4–9 found a walk | **Thin**: the vent (a draft is the sign) was found every time; little else | One cache by search |
| Several ways to investigate | The flag: three rings, lore, or brawn | The vent: sign, search | — |
| A reasoning puzzle | **No.** Orsino riddles are solved by trying words; the flag is knowledge-gated, and the game presses the right letters for you | **No.** Riddle caskets only | No |
| A possible wonder with history | Wonders in 2 of 3 catacombs; met only by b2's bold walk | Wonders in 50–90% of sites; met in b2 and c3 (the phantom flame, the singing crystal, the eternal candle). **None carries history** | One time in two past the inner way; no history |
| Retreat and return | **Works**: 11 withdrawals, all came back to where they left off; killed bands stayed dead | Same | — |

**The history chain never completed.**
- The makers' fact (`history_<art>`) was learned only by a mage reading the marks (lore).
- The successors' fact came from documents.
- `history_<art>_fate`, which the great work's inference needs (region-works.ts:172), was learned on no walk.

## 2. Diagnosis

Each shortfall, filed under one cause.

### Missing generated content

1. **No reasoning puzzle.**
   - The generated puzzle is Orsino's riddle: four words, one right (`DeepRooms.casket`, deep-rooms.ts:78-97;
     rooms.kyrt `casket`/`right`/`wrong`). A wrong word costs 1d4 to 4d6 cold (deep-rooms.ts:30).
   - The undertown's lettered flag gathers good evidence (undertown.kyrt:530-536). But its act, "Press the three
     deep-cut letters on the flag, as the ring below has them" (:537), does the reasoning for the player.
2. **Wonders without history.** A wonder is Orsino's effect with Kyrie's prose, and teaches nothing
   (`RegionMarvels.wonder`, region-marvels.ts:65-80; wonders.json). The Mathematical Age and the Aeneans' relation
   to it appear nowhere in generation; only the makers' works carry Aenean names (histories.ts:126, 162).
3. **Sell-only treasure.**
   - The purposes' finds are 60–75% `treasure` (barrow 18 of 28, mine 23 of 50).
   - The 60% own-valuables draw is all treasure (deep-pacing.ts:151-158).
   - Keepables come by accident of spoils, in repeated kits.
4. **Ore breaks the economy.**
   - The mine's merchant pays ore at full worth, 30 a lump: `pays(merchant, ore) = ore.worth`
     (deep-sites.ts:176), against half for valuables.
   - A lump weighs 2, and a lone warrior carried 20.
   - Measured: **+600 coin** on b2's first trip, against a 50-coin debt and a dearest useful purchase of 80.
5. **Missing purposes.** Four purposes exist; there is no temple, observatory, fortification or inhabited ruin
   (deep-purposes.ts:124-127).

### Present but inaccessible

1. **The first level kills a lone novice.**
   - Level 0 holds 0.5–1.1 elites a site at levels 3–5 (deep-pacing.ts:87).
   - Ambushes sit on the spine 0.7–1.6 times a site (mine, barrow, waterworks; `pacing.ts`).
   - Unlike the town's troubles above them (undertown.kyrt `pack`/`pair`, region-undertown.ts:33-40), the catacombs
     are not scaled to a company of one. deep-pacing.ts:109 composes for one only below level 0.
2. **History is lore-gated.**
   - The marks and the seal's words need lore (deep-sites.ts:56; deep-mechanisms.ts:44).
   - Two callings of seven have lore (classes.json: mage, bard). The glossary costs 80.
3. **Light is the binding supply.** A torch burns an hour, a candle two (gear.json). Measured: most withdrawals were
   for light, not for wounds.

### Poor perception or discoverability

1. **Ambushes are told in prose only.**
   - The sign is the "ambush:seen" line: "the quiet of something holding its breath" (deep-sounds.ts:21-25).
   - The way into the ambush carries no mark, and a one-way chute offers no look first.
   - The page does mark a fight's danger and asks again when it is grave (marks.ts:68-75). That works.
2. **Searches are often empty.** Half say nothing is there. The promised finds (deep-history.ts:32-39) are the model
   to follow: the scene's cue and the search agree.

### Deficient authoring or engine capability

1. **Pacing ignores place.** Spine rooms are y=1 (deep-layout.ts:30-42), but the pacing deals guides by
   breadth-first order (deep-pacing.ts:46-76), so a level's arrival and its side rooms are interchangeable.
2. **A wonder cannot carry a fact.** `RegionMarvels.wonder` has no `teaches`.
3. **Kyr kinds lack effects.** A Kyr kind cannot declare a use, figures or charges (Kyr.ohm:180-190; audit §7).
4. **Already expressible, no engine work needed:**
   - an order puzzle (Things and a Rule over their states);
   - a concealed door (`hidden until`);
   - a trapped coffer (`Hurts with`);
   - a tool-gated way (`needing digging or shovel`).

### Weak presentation

1. **The catacombs' name and kind are fixed** (region-undertown.ts:70): "the old dead under X", kind barrow. In a1
   it is the Delvers' mine, and the innkeeper says "the Delvers' mine at the old dead under Lowmouth".
2. **Look closely at coins is empty**: "it is just as it seems", in every room.

## 3. A structural grammar for substantial dungeons

| Part | Today's support | What is missing |
|---|---|---|
| **Entrance and impression** | Outside text, makers' marks, the land's blight and skill signs, the inn's and the merchant's hooks (deep-sites.ts:31-59, 107-114, 164-178); the undertown's notice and jobs | Nothing structural |
| **Inhabitants and factions** | Dwellers and elites by depth, `Parties.compose`, a second kind beside, sounds a room off, rivals racing (deep-rivals.ts), newcomers (deep-time.ts) | Groups are dealt by index, not by faction territory |
| **Route that introduces the primary danger** | A level-0 fight early, 87% of the time | It is chance which band: vermin or the faction. Lethal elites and ambushes share level 0 |
| **Branches, loops, shortcuts, obstacles** | Spine, branches and loops (deep-layout.ts:30-60); winch, seal, drowned level, vent (deep-mechanisms.ts) | A shortcut that opens from inside; tool-gated optional ways |
| **Secrets and optional depths** | The vent, promised finds, successors' caches (deep-history.ts:67-75), the flag | A treasury; secrets that need two observations |
| **The heart** | Keeper, refuge, fear, bane, argument with the priest, the raised heart (deep-sites.ts:131-161; deep-argument.ts) | Nothing there for a company that will not fight |
| **Withdrawal, return, lasting change** | Dead stay dead, newcomers at dawn, jobs paid, the home topic, the shrine's refusal | Wounded survivors; the town noticing a cleared level |

**How each site type should realize it.**

| Type | Faction | First danger | Secret | Heart | Return |
|---|---|---|---|---|---|
| **Tomb** (barrow; exists) | The dead, and robbers after the gold | The robbers' sentry, not their captain | The light-box crawl; the robbers' shaft from the crown | The king, beaten by his bane | The dead walk at night while the seal stands open |
| **Mine** (exists) | Goblins, then what the miners broke into | Goblins at the crossing | The air shaft; a collapsed side way | The thing in the vein | The drowned level drains over watches |
| **Temple** (missing) | Its keepers, or its desecrators | A warden who can be talked past | A reliquary found by its liturgy | The god's presence or absence | The shrine above changes its service |
| **Observatory** (missing; the sky art has no deep purpose) | Whatever nests high | An outside climb | The instrument's missing part | A sky-map naming a place: a lead and a fragment | Works only on a clear night |
| **Fortification** (minor keep work) | Outlaws (Sir Hamo, where placed) | The gate sentry, not the challenge | The postern, the well shaft | The lord's papers | The outlaws remember |
| **Inhabited ruin** (arcology, scenario) | People with needs | A warden at the door | Their store, their debts | What they want of you | They remember you |

## 4. Economy baseline

### What first expeditions earned

Net coin, measured by the walks.

| Trip | Earned |
|---|---|
| Undertown jobs plus the catacombs' first level | +94 to +108; the bold warrior +351 before dying |
| b2's mine, one trip | **+600 to +731** |
| a1's barrow, turned back early | +44 |
| Roadstation | +63 to +75 |
| Manor | +25 |
| Minor work | +19 |
| Authored keep | +42 |

Outgoings on those trips: 4 to outfit (rope and three torches), 3 a bed, 3 a restock of light.

### Against what there is to spend it on

- **Field.** Torch, candle, rope, pole, spikes and oil: 1 each. Rations 1–2. Bed 3. Crowbar 2–3. Firebomb or
  ratsbane 2. Lantern 7.
- **Expedition.** The hire, 6. Spyglass 15. Lessons 20–60. Pack mule 30. Fine arms 20–120. The glossary 80.
- **b2's alchemist.** Potions and scrolls at 15–200.
- **Domain.** Nothing.
- **The debt.** The origin starts with 21 coin and owes 50.

The country measure (`economy-now.md`, from `scripts/economy-measure.ts`) puts the home-to-spend ratio at 2.78–4.98
today, against 1.07–2.47 on 3 November (`doc/history/missions/18/economy.md`). Valuables' worth per country rose from
about 5,200 to about 14,300. CB-22 is not just open; it has got worse.

### Purchases that unlock a real act today

| Purchase | What it opens |
|---|---|
| Rope | 55 `climbing or rope` ways across the corpus |
| Pole | Springs every one of the six trap mechanisms from a distance (snares.json). It is the universal answer: it flattens the callings' remedies (trapwork, lore, rites, insight) |
| Crowbar | Seals, barriers and seized wheels for a company without brawn |
| Firebomb, ratsbane | The undertown's other ways with the rats and the spiders |
| Lantern | Six hours of light. Measured as the purchase that decides how far a trip goes |
| Spyglass | Names a far site from a height |
| Glossary | Lore for the old script: the country's history, for five callings |
| Shovel | One collapsed way, in the galleries work (galleries.kyrt:56) |
| Thieves' tools, holy symbol | +2 to a skill already held; no new act |
| Chalk, mirror, hammer, manacles, lock | Nothing reads them (M19 G11, still) |

## 5. The proposed proof for Phase B

**One template, two sites.** The template is the deep generator, proved on the catacombs under the start town and on
the country's deep work. It already has the grammar's bones, and it reaches every country's first real dungeon. The
authored undertown, the works, the scenarios and the page stay untouched.

### What I would add

1. **A treasury worth keeping, behind a secret with evidence.** One room a site (barrow `treasury`, mine
   `strongroom`, waterworks and singing-hall `vault`) holds a cache drawn by kind:
   - an arm or armour of the tier;
   - a useful tool or consumable;
   - one or two valuables;
   - a successors' document that teaches `history_successors` and names who hid it.

   It lies behind a false wall or in a trapped coffer, cued in the room's scene. The ways in are a search, lore
   reading the makers' mark, trapwork or the pole, and force, which is slow and heard.
2. **One order puzzle a site, in place of the riddle below level 0.**
   - Three levers, sockets or dials, each moved by one flat act.
   - The order is drawn on a frieze or a tally elsewhere on the same level; a Rule checks it.
   - A wrong order resets, with a noise the level's wanderers may hear (deep-sites.ts:99-103).
   - Lore can read the order off the mechanism; force takes an hour.
   - It opens something optional: the treasury, or a shortcut up.
3. **A wonder that carries a fragment.** `RegionMarvels.wonder` gets an optional fact, taught when the wonder is met:
   a makers, fate or successors fact the company lacks. It feeds the existing inference (region-works.ts:168-172).
   Where wonders appear is still Orsino's chance.
4. **A first level a novice can learn on.** Level 0 only: no ambush on the spine, and an elite only at a branch's
   end. Hold a level-0 fight within two rooms of the arrival at 85% or more.
5. **Pay ore at half its worth, as valuables are** (deep-sites.ts:176). Measure before and after.
6. **A bought verb.** A collapsed side way to an optional depth, `needing digging or shovel`, in the mine and the
   barrow.

### Specs

Tiny worlds and generator unit specs, each under a second.

| Improvement | Minimal executable test |
|---|---|
| Treasury | For each purpose over 20 keys: one cache, at least three categories, at least one kind that is not `treasure`. In a tiny world: hidden until found; the cue in the scene; the coffer offers pole, trapwork and force |
| Order puzzle | Tiny world: the frieze's order opens; a wrong order resets and says so; lore reads it; force takes an hour |
| Wonder fragment | Tiny world: meeting it teaches the fact once; with the makers known, the existing rule reveals the great work |
| Level-0 pacing | 200 keys a purpose: no level-0 ambush on the spine; level-0 elites only at branch ends; a level-0 fight within two rooms of the arrival in at least 85% |
| Ore price | A generated mine's merchant pays half an ore's worth |
| Shovel | Tiny world: the way is offered with a shovel and withheld without one |

### Playthroughs and files

- **Walks.** This walker, before and after, on a1, b2 and c3: lone mage, lone warrior, and a warrior with the hire.
  The economy is measured the same way.
- **Transcripts.** Two terminal transcripts (`bin/kyrie play`): approach, the faction fight, the cache from its cue,
  the puzzle from the frieze, a wonder where one is drawn, withdrawal and return, sale, and the shovel.
- **Files, estimated.** About 12 files and 400 lines, mostly data:
  - `deep-pacing.ts`, `deep-rooms.ts`, `deep-sites.ts`;
  - `region-marvels.ts`;
  - the four purpose JSONs;
  - `rooms.kyrt`;
  - five specs under `test/small/`.
- **Left to the lead** (interaction grammar): marking a way that a sign says is dangerous, and a look before a
  one-way drop.

## Measured, inferred, not known

- **Measured.** The census, the pacing sample, the walks (one roll each), the prices, and which rules items open (by
  grepping `needing` and `holding`).
- **Inferred.**
  - That a reasoning human beats the walker at puzzles.
  - That a human heeds ambush signs more reliably than a phrase match does.
  - That a party of three changes the death rate (no party was walked).
- **Not known.**
  - Enjoyment: no person played this.
  - The authored scenarios beyond their first rooms.
  - Whether wounded survivors stay wounded: no walk fled.
