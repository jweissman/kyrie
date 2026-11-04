# Mission 19: workstreams

An accounting of every workstream Mission 19 carries — the brief's priorities (§I–XIV) and the owner's later
commissions of 4 November (the process audit, the spatial reconstruction and its correction, the full commission
of the night) — kept so that no one of them is mistaken for done because another moved. Builder play is evidence,
not acceptance: nothing here is **Accepted**; that is the owner's word, or an independent player's
([evidence.md](evidence.md)). Findings are the [register](register.md)'s rows; the inherited backlog is
[inherited.md](inherited.md).

States: **open** (not begun), **under way** (some of it built and evidenced, more to do), **built** (what was asked
exists, is reachable and has a spec, but has not been played by anyone but the builder).

Updated 4 November 2026, late night (after f0514839 and the road branch).

## The brief's priorities

| | Workstream | State | What there is | What is left |
|---|---|---|---|---|
| III | The adventuring loop (reference town a1, generalised) | under way | the rats job two fights deep with a reward that fits; every calling a way through the first town's jobs; the undertown connected and told how deep; a job half paid paid the rest; aims followed as the game's own; the expedition specs (E1–E10) | an expedition of an hour played by someone else; travel decisions (REV-03); the town as a list (OWN-77) |
| IV | The player-facing product | under way | the world map the whole stage in the wild, a hex entered to act in it, a town entered from the map; the painting the place, nothing over it; ways once, beside it; no Every way / Look about / More; a fight's aftermath (PD-13); the journal in layers | PD-03, 04, 06, 07, 08, 10, 11, 12 partial or open; the five-player acceptance protocol (PD-14) |
| V | Identity consequential | under way | each calling's own way in every first town (M19-17, 21, 23); a snare read by the skill that answers it | backgrounds and professions that change what is offered beyond the first town; M17-73 (ranger specialties), reverted |
| VI | Content activated | under way | Orsino's goods within reach (shelves, merchants' trades, the camp's kit), scrolls and wands that cast, wands with charges; [inventory.md](inventory.md) | see *the Orsino inheritance* below |
| VII | Generative authorship | under way | towns, roads, deep rooms and hoards, errands, teachers, straying as templates (M19-44: five generators moved); variations of creatures; recipes; the guide's sections for each | the deep mechanisms and settlement shapes still in TypeScript; languages, spells and effects authored outside the repository |
| VIII | World coherence | under way | merchants' stock by trade and by what a place can afford; frost and fen beasts where the country is so; names from the makers' tongue (M19-20) | economy across a country (prices by scarcity); ecology beyond dens |
| IX | Architectural integrity | under way | no regex over Kyr in the new work (structure read as parsed Kyr: WrittenKyr); typed kinds declared by their relation's signature; the reader's aim-to-place match by id (M19-35) | the remaining TypeScript prose (M19-44); the reader's text patterns over labels (`/^the /`, articles) in naming |
| X | The Encyclopedia | built | peoples (catfolk among them), callings, magic, arms and treasure with what can be made, creatures with their variations, conditions, lands of rumour, tongues, Imbar's planes, its past and gods | read by someone else |
| XII | Six journeys | under way | journeys 1, 3, 4 driven in the browser by the builder (evidence E1–E10); spatial journey pinned | 2, 5, 6 through the interface; any journey by an independent player |

## The owner's commissions of 4 November

| Commission | State | What there is | What is left |
|---|---|---|---|
| Process audit ([m18-m19-process-audit.md](../m18-m19-process-audit.md)) | built | 138 inherited rows reconciled with kinds and causes, Open risk distinct from Deferred, five A rows re-examined, the evidence vocabulary and ledger | keep the ledger as rows close; variations journeys run by someone else |
| Spatial reconstruction, and its correction | under way | three scales felt as one: the hex board in the wild (exploration only), towns and sites as their paintings, the dark below with the place's words; ways laid by where they lead; real plans' needs written down ([spatial-play.md](spatial-play.md)) | authored geometry for real plans (extents, door sides, streets); the owner's judgement of the captures |
| 1. Game-like experience | under way | **settled principle**: the world dominates, the apparatus comes when wanted (the owner, 4 November, late; register M19-47, 48, 50). Play begins on the one full-screen map; a place at rest is its painting with whoever is here as likenesses over it, a few lines, the aim, what will not wait, Go… / Explore…; the explorer holds ways, what to do, the place told whole; road interruptions are the hex's own ("!" on the map, the card says why) | a person's judgement at desktop and tablet; the dark interiors' composition; the camera turned to an interruption; Setting out's wait (M19-49) |
| 2. Depth, motivation, economy | under way | treasure that turns up for sale and in the earlier party's packs; a smith with arms to sell; a way to earn by making; the country's money measured again ([economy.md](economy.md): median 1.90, was 1.93) | the analysis of an ordinary hour's play for repetition and purposelessness, and fixes for its shared causes |
| 3. The Orsino inheritance | under way | below | below |
| 4. Authorable world structures | under way | creatures as kinds with variations (six axes, Deem hints) — never a species per variant; recipes; trades as data; travellers, sites and the speaking door as data and templates (M19-52); catfolk a playable people by data alone (M19-51) | plants and animals beyond dens; materials as their own family; spells and effects authored as data; languages and names |
| 5. One craft loop | built | gather willow bark and meadowsweet, steep a minor potion of healing (a mender's check, a spoiled ingredient on failure), sell it to a herb-wife or chandler; antidote; fire flask ([making.kyr](../../../data/rules/making.kyr), `test/making.test.ts`) | smithing and enchanting (below); played by someone else |
| 6. Honest discharge | under way | register rows with ids and dispositions; inherited rows by cause | close M19 only when the owner accepts it |

## An ordinary stretch of play, measured

A scratch probe (`/var/tmp/kyrie/m19/ordinary.ts`) played a1 for 200 steps with the autoplay's own players and
counted, each step, whether anything was new: words never told, coin, things, places.

| Player | Steps that brought nothing new | Longest run of them | Fights | Talks | Moving or waiting |
|---|---:|---:|---:|---:|---:|
| intent, cleric | 107 of 200 | 12 | 0 | 1 | 176 |
| expedition, cleric | 119 of 200 | 11 | 0 | 3 | 149 |

What it shows, and what it does not. Repetition on the page is already handled where it matters: passing life is told
the first time only, and a place come back to is recalled by its first sentence (the narrator's `recalled`), so the
counts of lines "current" on arrival overstate what is read. The real finding is about the instrument: neither player
takes up the first town's jobs (one to three conversations in two hundred steps), so an aimless half-hour is all it
measures. The next instrument is a player that follows the aim the page leads with, as a person does; until then the
analysis of tedium, purposelessness and economic sense in *ordinary* play is the owner's and an independent player's
to give, and is open.

## The Orsino inheritance: loot and equipment

Measured over five generated worlds (a1, b2, c3, d4, e5) by whether an item's id is anywhere in the compiled world
(sold, lying, carried, in a hoard): `/var/tmp/kyrie/m19/loot-reach.ts`, a scratch probe.

| Family | In the catalog | Usable in play | Met in five worlds, before → after | Blocked, and why |
|---|---|---|---|---|
| Weapons | 83 | 83 (natural ones are creatures') | 14 → 23 | — |
| Armour | 15 | 15 | 8 → 10 | — |
| Gear | 68 | 65 | 27 → 42 | a torch that does not burn down; rations as a heal |
| Consumables | 28 | 22 (was 15: scrolls, wands and spell-potions now cast) | 15 → 18 | 6: polymorph and shapechange (Kyr cannot run them), the deck of multiplicity's summons, foxglove's and oil's effects |
| Magic equipment | 48 | 43 (was 38: staffs and the phoenix talon strike) | 8 → 13 | 5: spell turning and reflection, true sight, a waystone's revealing, spell damage |
| Junk | 71 | 71 | 37 | — |
| Gems | 44 (5 tiers) | 44 | 13 | — |
| Treasure tiers | 6 | drawn in deep sites by depth, narrowed by each site's purpose (`test/deep-treasure.test.ts`; the inventory had called them reference) | — | — |
| Wonders | 80 | 43 | — | 37: raising a quality, planes, rooms, abilities Kyr lacks |
| Shops | 27 | 18 dressed | — | blacksmith, tailor, arcaneum, wonders, zoology have no Kyr scene, or nothing Kyr has of their kinds |

What would bring the rest across: legendary things are only in Orsino's legendary tier, which a site's purpose rarely
allows — a hoard at a great work's heart is where they belong; a country with more than one town keeping shops; the
six effects above (spell reflection is the one most items want).

## What richer making would need

- **Smithing** (ore → metal → a weapon): the deep sites' ore is a valuable kind already (`purpose.ore`); a smith
  would need a recipe of three (ore, fuel, a pattern) and a place (a forge: the smith's shop), which `making.kyr`'s two
  inputs and anywhere-with-light do not say. A recipe's place is a relation away (`madeAt(recipe, servicekind)`).
- **Enchanting** (a thing + a reagent → the thing with a property): Kyr items are kinds, not instances with
  properties; an enchanted sword is another kind. Either kinds composed like creatures' variations (a sword *of
  flames* as a variation on a sword), or instance properties carried in the creature store (as a wand's charges now
  are).
- **Alchemy beyond two**: recipes of three or more need either a container that is filled (Low Water's pan) or
  quantities by kind; and a recipe learned (taught by a herb-wife, read in a book) rather than known by all.
