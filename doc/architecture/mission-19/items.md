# Orsino's items in Kyr play

The item audit of 6 November (below, as written at 4f09db02; its line numbers are of that commit), and what has been
done about each gap since. Register row M19-92.

## Where each gap stands

| Gap | Status |
|---|---|
| Gear (the owner, 6 November) | **Fixed** (this commit): gear.json holds ordinary gear only; magic used up is a wonder, foxglove a consumable herb, the burial register a test fixture's own kind (the keepers of names declare it) |
| Stones (the owner, 6 November) | **Fixed** (this commit): data/catalog/items/gems.json, each stone by rank and by its plate (data/paintings/gems.json, cut from the owner's five gemstone sheets), Stones in the handbook's equipment |
| Gear plates (the owner, 6 November) | **Fixed** (this commit): all 72 kinds of gear by their plates (data/paintings/gear.json), each cut out alone on its own parchment; shown in the handbook's gear. Arms, armour, consumables and wonders have none yet |
| Migration (class 1–2) | **Fixed** cf4387eb: one authored catalog, data/catalog/items/, Orsino's 356 among Kyr's own with Orsino's words; the generated snapshot retired; what one place alone uses declared there (test/item-catalog.test.ts) |
| G1 resale | **Fixed** (this commit): every kind with a worth is some trade's (Overlays.trades): a smith buys back arms and armour, a chandler gear and tools, a remedies shop what is drunk or eaten, a dealer in rare things the wonders, each at half its worth (sell_ware, data/rules/belongings.kyr); treasure as before to any dealer |
| G2 Orsino's tiers | **Partial** (this commit): Orsino's tiers and its loot and gemstone generators are authored tables (data/generation/tables/treasure.json, templates/treasure.json; the generated copy in orsino-world.json retired); a deep room draws Orsino's loot one time in three beside its purpose's finds, of a tier that reaches grand and legendary deeper whatever the purpose has; a stone found is a stone of its own (src/world/deep/stones.ts, by data/catalog/items/gems.json: cut, size, clarity and what each does to its worth), and one time in four a room that holds anything holds a stone besides. Special rooms' treasure still read by nothing |
| G3 general shops | Open |
| G4 magic arms for their callings | **Fixed** cf4387eb: staves of power light and struck as staves, blades of power blades with Orsino's damage, magic mails armour of their kind |
| G5 onTurnEnd of equipment | **Fixed** (this commit): what its wearer wears mends or harms at the end of their turn as a condition or a trait does (Effects.turnEnd; test/item-gaps.test.ts): the ring of regeneration |
| G6 flask of oil, foxglove | **Fixed** (this commit): both consumables with Orsino's effects, which the runtime runs (foxglove heals and lifts poison, fatigue and weakness; the flask of oil leaves a foe oiled unless it dodges), out of gear, where they had been put only because the translator could not say them |
| G7 effects with no runtime | Open (language and combat work). The wand of polymorph, wand of wonder, scroll of shapechange and deck of multiplicity are wonders now (wonders.json, with every wand and scroll), held and sold to a dealer in rare things, their use said unsupported (a consumable may want a use only when it says why) |
| G8 charges in the field | **Fixed** (this commit): a wand used out of a fight keeps its charges less one, and is spent with its last, as in a fight (Items.resolve; test/item-gaps.test.ts) |
| G9 equipped qualities in the field | Open |
| G10 one thing to a slot | Open |
| G11 tools nobody asks for | Open |
| G12 spoils | Open |
| The expedition the owner asked for | **Reachable** (this commit): test/orsino-expedition.test.ts, h8: a large brilliant-cut rose quartz, Orsino's ring of strength and amulet of health taken up below, both worn, the walk home by the world's ways, the stone sold to the jeweller as a valuable and the amulet as a rare thing. Not played in the browser |

## Plants: what each is for in play

Of the 54 plants (data/catalog/plants.json), every one grows where its habitats are and is met there; 53 yield
something gathered, which every herbalist buys (src/world/herbals.ts, by how seldom it grows). Of those, 11 yield a
remedy or food that does something used (willow, sphagnum, meadowsweet, yarrow, heather, dandelion, comfrey,
cloudberry, goodberry, feverwort, kingsfoil), two of them (willow bark, meadowsweet) are what a remedy is made of
(data/rules/making.kyr); 42 yield a gathered herb that is only sold (its `_gathered` kind is derived, Canon.gathered);
foxglove's yield is inert (G6); alder yields nothing and is met only as scenery and in the Encyclopedia. A plant's
`uses` (medicine, protection, love…) are read by nothing yet: they are what later remedies and recipes would choose
by, and a recipe names catalog kinds, so no second item system is needed for them.

## The audit

6 November 2026. Read-only. Kyr at **4f09db02** (a snapshot by `git archive` in `/var/tmp/kyrie/m19/audit/snap`,
because `data/catalog/plants.json` was being edited in the working tree and five new plants without paintings failed
validation mid-run); Orsino at its working tree (`/home/jweissman/work/orsino`, same content as the registry's
revision for `settings/fantasy/tables/items.json`).

## What was counted, and how

**Orsino's corpus** is `settings/fantasy/tables/items.json`: 313 defined items in six tables (masterWeapon 83,
masterArmor 15, masterGear 68, consumables 28, masterEquipment 48, junk 71) and 44 gem names in five tiers (`gems`,
names only, no record). Orsino's `treasure` tiers, `shopTypes` and the special rooms' treasure lists name only these.
Orsino generates no wands or scrolls in code (checked `src/orsino`). **357 items in all.**

**Kyr's side**: `Canon.items` (451 kinds: 356 generated from Orsino, 54 hand-written, 21 `fine_` weapons, 33
`_gathered` plant yields). 356 of the 357 Orsino items have a `Canon.items` kind whose `source.orsino` names them;
the one missing is `gear:rations`, which Kyr deliberately keeps as a good (`quantity(group, rations)`,
`data/rules/needs.kyr`; `OrsinoGoods.goods`, `src/registry/orsino-goods.ts:51`). So *migration as catalog data is
essentially complete*; the owner's complaint is about the other two steps — reaching a player, and doing something.

**Ways in** were established two ways and cross-checked:

1. *Static*: every mechanism that puts a catalog kind in a world, read from its code and tables —
   - merchant base stock (`data/generation/tables/trade.json` merchantType.*.stock; every village and town has a
     chandler, `src/world/outfitters.ts`), the hamlet keeper (`data/generation/scenes/outfit.json`);
   - a merchant's three *wares* drawn from Orsino's shop stocks of its trades, fee ≤300 in a town, ≤80 in a village
     (`RegionShops.wares`, `src/world/region-shops.ts:69-77`);
   - town shops (`RegionShops.shelf`, `region-shops.ts:45-52`): the 18 kinds in `data/generation/scenes/shops.json`,
     stock from `orsino-world.json#shops`, fee ≤300 (≤800 in a market town), first five always and three drawn from
     the rest; **and only kinds outside the "general" family** — `had` starts with `'general'`
     (`region-shops.ts:30`), so general, emporium, variety, provisions, tools and kitchen shops never open (confirmed
     empirically: no `*_keeper` of those kinds in 12 worlds);
   - the drill-yard's 12 fine blades (`RegionMarket.blades`, `src/world/region-market.ts:28-29`);
   - deep sites: room finds and riddle caskets by each purpose's own `finds` tiers (`deep-pacing.ts:141-153`,
     `deep-rooms.ts:75-90`; purposes in `data/generation/deep/{deep,barrow,singing,waterworks}.json`), an earlier
     party's pack (every item of the `magic_items` and `dispensary` stocks, `deep-rooms.ts:105-113`,
     `hoards.json#left`), rival companies' packs (`powers.json`), the bane;
   - works' treasure (`data/generation/history/arts.json`, `region-works.ts:119-130`: common, rich, and great in
     great works);
   - starting gear (classes' weapon/armour tables and `startingGear`, backgrounds' `gear`: `src/overlays.ts:84-100`);
   - recipes (`data/rules/making.kyr`), plant stands (`src/world/region-growth.ts:85-113`);
   - pedlars (`scenes/traffic.json`), townsfolk who sell (`scenes/occupations.json`), wild landmarks' finds
     (`scenes/wilds.json`);
   - authored Kyr (`Item … is <kind>`, `Sells`, `Give`, `makes(…)` across `data/adventures`, `data/goings-on`,
     `data/situations`, `data/sites`, `data/kits`, `data/origins`, `data/generation/**/*.kyrt`).
2. *Empirical*: twelve generated worlds assembled and started (`a1 b2 c3 d4 e5 f6 g7 h8 kite wren thorn ash`; a
   thief wanderer), every `itemKind(instance, kind)` in the compiled module classified by what else holds of the
   instance (`forSale`/`soldBy`, `at`/`inside`, `crop`, handed by an action). Nothing is installed lazily (no
   `Expander` implementation exists), so the compiled module is the whole world. Every kind seen empirically was also
   found statically; none the other way round contradicted it.

Also checked and found **not** to be ways in:
- *Creature drops.* Nothing is left by the slain: `src/campaign/aftermath.ts` records only routs; there is no loot,
  spoils or gold-on-kill anywhere in `src/campaign`, `src/session` or `data/rules`. NPCs with a calling are given
  their class gear as items (`Overlays.declareGear`, `src/overlays.ts:130-149`) but those instances are placed
  nowhere and cannot be taken (33 Orsino kinds were carried by NPCs in the 12 worlds, none takeable).
- *Rummage* (Orsino's lootBonus, `Items.rummage`, `src/campaign/items.ts:40-51`): the only trait with
  `bonuses.loot` is `foundrywork` (`data/catalog/orsino/traits.json`), and no class, ancestry, background or module
  grants it. Dead.
- *Orsino's own treasure tables* (`orsino-world.json#dungeon.treasure`, and `#dungeon.specials[*].treasure`): see
  capability gap G2 — the first is never reached, the second is read by nothing but the registry
  (`src/registry/orsino-world.ts:127`).

**What runs** was established per kind (`profile.ts`): the weapon profile and which playable callings may equip it
(`Creation.canEquip`), armour, every modifier key against the code that reads it, every hook key against where it is
fired (`AbilityUse.hooks` for onAttack/onAttackHit/onMissReceived/onCombatStart/onOffensiveCasting/onHeal,
`Effects.damage` for onAttacked), `use` parsed (`ItemCatalog.use`) and validated (`Effects.validate`) with the
conditions and abilities it names checked to exist, where it can be used (a fight's stock, `ItemCatalog.stock`; the
field, `use_item` + `relieves`), `grants`, charges, fuel, and world rules naming the kind (`data/rules/*.kyr`, Kyr
predicates in modules). Selling: a kind is a *valuable* (sold to any dealer at half worth) only if its category is
`treasure` with a value (`Overlays.declareWorth`, `src/overlays.ts:115-129`; `sell_valuable`,
`data/rules/belongings.kyr:226`); anything else sells only to someone with an explicit `pays(buyer, kind)`
(`trade.json` buys: grave_rings, chapel_plate, minor_healing_potion, antidote, bronze_bearing, jade_idol; deep ore and
relics).

**Classes.** 1 not migrated; 2 present only as reference data; 3 registered but unobtainable (no way in above puts it
in a player's hands); 4 obtainable but not meaningfully usable, split into *4 sells only* (a valuable that is just coin
— fine for a treasure) and *4 inert* (carried, nothing reads it, no buyer); 5 fully functional (obtainable, and its
properties run). Natural attacks (Orsino's bite, claws, breaths in masterWeapon) are class 5 where a species fights
with them and class 3 where nothing does; none is meant for a player.

Scripts (all scratch): `/var/tmp/kyrie/m19/audit/{dump-canon.ts,profile.ts,world-reach.ts,plants-reach.ts,authored.py,
classify.py,tables.py}`; data in `canon-items.json`, `profile.json`, `reach.json`, `plants-reach.json`,
`classified.json`.

## Summary

| Orsino category | 1 not migrated | 2 reference only | 3 unobtainable | 4 inert | 4 sells only | 5 functional | Total |
|---|---:|---:|---:|---:|---:|---:|---:|
| Weapons (manufactured) | 0 | 0 | 0 | 0 | 0 | 52 | 52 |
| Natural attacks (Orsino masterWeapon) | 0 | 0 | 15 | 0 | 0 | 16 | 31 |
| Armour | 0 | 0 | 0 | 0 | 0 | 10 | 10 |
| Armour (natural hides) | 0 | 0 | 0 | 0 | 0 | 5 | 5 |
| Gear: tools | 0 | 0 | 0 | 31 | 0 | 4 | 35 |
| Gear: containers | 0 | 0 | 8 | 3 | 0 | 0 | 11 |
| Gear: clothing | 0 | 0 | 8 | 1 | 0 | 0 | 9 |
| Gear: camping | 0 | 0 | 1 | 3 | 0 | 0 | 4 |
| Gear: lights | 0 | 0 | 0 | 0 | 0 | 4 | 4 |
| Gear: drink, holy water, rations | 1 | 0 | 3 | 0 | 0 | 1 | 5 |
| Consumables: potions | 0 | 0 | 0 | 0 | 0 | 6 | 6 |
| Consumables: herbs | 0 | 0 | 0 | 1 | 0 | 4 | 5 |
| Consumables: food | 0 | 0 | 0 | 0 | 0 | 3 | 3 |
| Consumables: flasks | 0 | 0 | 0 | 1 | 0 | 1 | 2 |
| Consumables: kit | 0 | 0 | 0 | 0 | 0 | 1 | 1 |
| Scrolls | 0 | 0 | 2 | 0 | 0 | 3 | 5 |
| Wands | 0 | 0 | 2 | 0 | 0 | 3 | 5 |
| Rings | 0 | 0 | 4 | 1 | 0 | 6 | 11 |
| Amulets | 0 | 0 | 2 | 0 | 0 | 5 | 7 |
| Wondrous (worn: helms, cloaks, belts, boots...) | 0 | 0 | 4 | 0 | 0 | 9 | 13 |
| Wondrous (deck) | 0 | 0 | 1 | 0 | 0 | 0 | 1 |
| Magic weapons and staves | 0 | 0 | 8 | 0 | 0 | 3 | 11 |
| Magic armour and robes | 0 | 0 | 3 | 0 | 0 | 3 | 6 |
| Junk: curiosities, valuables, art | 0 | 0 | 26 | 0 | 45 | 0 | 71 |
| Gems | 0 | 0 | 28 | 0 | 16 | 0 | 44 |
| **All** | **1** | **0** | **115** | **41** | **61** | **139** | **357** |

**Class 2 is empty**: every Orsino item but rations has a `Canon.items` kind. What exists only as reference data is
the *tables that would deliver them* — Orsino's treasure tiers and special-room treasure in
`orsino-world.json#dungeon`, and six of Orsino's shop kinds absent from `shops.json` (G2, G3).

"Worlds" in the tables is how many of the 12 generated worlds put the kind where a player can take or buy it. A class
5 kind can be met in 0 of 12 when its only way in is a draw (three of 47 on a weapon shop's shelf, one shop kind of
eighteen in a town): 38 of the 123 functional non-natural kinds were seen in none of the twelve.

**The owner is right, and the losses fall where one would most want them not to.** By category:

- *Ordinary arms and armour* (67) are all functional and on sale somewhere (smiths' wares, armouries, weapon shops),
  though 23 of the 52 weapons can be wielded only by a warrior (no other calling's proficiencies name their kind), and **nothing bought or found can be sold back** (G1).
- *Gear* (68): 4 tools, 4 lights and holy water do something (pole, crowbar, rope, bell; torch, candle, lamp, lantern; holy water is thrown for radiant harm). Rations are a good, not an item (class 1). **31 of
  35 tools are inert** — thieves' tools, holy symbol, spellbook, shovel, ladder, piton, iron spikes, chalk, manacles,
  mirror, musical instrument and the rest are carried and read by no rule. **20 more are unobtainable**: every
  clothing item, most containers, the tent, ale, wine and vinegar are stocked only by the general-family shops that
  never open (G3).
- *Consumables* (17), *scrolls* and *wands* (10): the healing, curing and thrown things work in fights and (those aimed
  at an ally) in the field. Foxglove and the flask of oil are inert only because the translator could not phrase
  them (G6). Wand of polymorph, wand of wonder, scroll of shapechange, the deck of multiplicity are unsupported and
  unobtainable; the scroll of apocalypse works but is unobtainable (it was on Orsino's legendary tier).
- *Magical objects* (rings, amulets, wondrous things, magic weapons and armour: 48): **21 unobtainable, 1 inert (ring
  of regeneration), 26 functional** — but the functional ones are almost all the cheap and middling ones (rings of
  minor protection and strength, amulets of health and vitality, gloves, boots, helms, the silvered bracers). Every
  great one is gone from play: ring of major protection, ring of spell turning, ring of perfect turning, ring of true
  sight, amulet of protection, crown of insight, dragonhelm, aeon stone, cloak of invisibility, staff of power,
  arcane conduit, darkwood staff, staff of the necromancer, sword of ages, Tirion's fury, phoenix talon, bolt blade,
  angelmail, aegis of eternity, robe of the archmagi, Dun Rìerdan waystone. And those that would be met cannot be
  worn by the callings they are for: Orsino's magic weapons came over without a weapon kind, so a staff of power is a
  warrior's weapon, not a mage's (G4).
- *Junk, curiosities and gems* (115): 61 are found in works and deep sites and sell to a dealer at half their worth,
  which is what a valuable is for. **54 never appear** — 26 curiosities (dragon's egg, phoenix feather, soul gem,
  philosopher's stone, intelligent book, diviner's eye, eternal flame, priceless painting, vial of phoenix tears…)
  and 28 of the 44 gems (all ten of Orsino's very rare and legendary tiers, five of its six rare, three of its eight uncommon and ten of its twenty common: only gems a work's art or a mine's finds name are met), because
  Orsino's treasure tiers are never drawn (G2). Not one of them does anything but sell: Orsino gave none of them an
  effect either, but several name one ("intelligent", "phoenix tears", "soul gem").

## The missing capabilities

Ordered by how much of the corpus each holds back. Line numbers are at 4f09db02.

**G1. No general resale.** Only a `category: treasure` kind with a value is a valuable
(`Overlays.declareWorth`, `src/overlays.ts:120`: `if (item?.category !== 'treasure' || !item.value) continue`), and
only a valuable sells to a dealer (`sell_valuable`, `data/rules/belongings.kyr:226-237`). Everything else sells only
to a buyer with `pays(buyer, kind)` (`sell`, `belongings.kyr:215-225`), which `trade.json` gives for six kinds. So of
the 123 functional Orsino items a player can hold, two (antidote, minor potion of healing) can ever be sold; a ring of protection found
at the bottom of a barrow, a wand, a longsword bought last week — none has a buyer. Orsino's shops bought anything
(`orsino/src/orsino/campaign/Shop.ts:184-200`, "Sell items" and "Sell all junk"). This is the one gap that touches
every item.

**G2. Orsino's treasure tiers are never drawn, and the legendary tier is unreachable.** A deep room's find is
`purpose.finds?.[tier] ?? this.tables.treasure[tier]` (`src/world/deep/deep-pacing.ts:147`) and a casket's the same
(`deep-rooms.ts:83`); all four purposes (`data/generation/deep/{deep,barrow,singing,waterworks}.json`) define `finds`
for negligible, minor, major and grand, so Orsino's lists (`orsino-world.json#dungeon.treasure`) are never the
fallback. None defines `legendary`, and `high = !purpose.finds || purpose.finds[better] ? better : low`
(`deep-pacing.ts:145`) then stays at grand: the bottom of the deepest site is a grand room. Orsino's special rooms'
treasure (`#dungeon.specials`: the phylactery's soul gem and staff of power, the ritual chamber's robe of the
archmagi, the reliquary's wand of magic missile, the dark altar's unholy symbol and ring of regeneration) is read by
no runtime code (only `src/registry/orsino-world.ts:127`). **49 of the 115 unobtainable items are on those lists.**
The purposes' own `finds` are good and characterful (a barrow's grave rings, a mine's star-iron) but they draw from
66 catalog kinds in all.

**G3. Shops: the general family never opens, and nothing over 800 is ever shelved.** `RegionShops.chosen`
(`src/world/region-shops.ts:30`) starts `had` with `'general'`, so the general, emporium, variety, provisions, tools
and kitchen kinds are never kept (the chandler is meant to stand for them, but the chandler's stock is the 18 things of
`trade.json`). Twenty Orsino gear items are stocked only there. `RegionShops.shelf` (`region-shops.ts:46,50`) keeps
only what costs ≤300 (≤800 in a market town). Six shop kinds of Orsino's (antiquarian, arcaneum, black market,
curiosities, rarities, wonders) are not in `data/generation/scenes/shops.json` at all; their stock is ring of
regeneration, crown of insight, ring of major protection, amulet of protection, darkwood staff, bolt blade.

**G4. Magic weapons and magic armour have no weapon kind or armour type a calling can use.** Orsino's masterEquipment
weapons have `kind: "weapon"` and no weight; `OrsinoGoods.base` (`src/registry/orsino-goods.ts:139-145`) then gives
them `{ damage, type: 'bludgeoning' }` and nothing else — the type forced to bludgeoning even where Orsino says
slashing (bolt blade, sword of ages, Tirion's fury). `Creation.proficient` (`src/rules/creation.ts:79-83`, called from `canEquip`, `:85-91`) admits a
weapon with no kind only to a calling proficient in everything: the warrior. Magic body armour is given
`type: 'magic'` (`orsino-goods.ts:126`), which only the warrior (all) and ranger (all, light/medium) admit: a mage
cannot wear the robe of the archmagi. (Related: a mage's proficiency is staves of *light* weight and Kyr's staff and
quarterstaff are medium, so no mage can wield any staff; `Overlays.carry`, `src/overlays.ts:70-79`, equips starting
arms without the proficiency check, so a mage starts with a staff it could never take up again, a cleric in chain mail
it could not put back on — five callings (mage, thief, cleric, bard, ranger) have something in their starting tables they cannot equip.)

**G5. An equipped item's `onTurnEnd` never runs.** `Effects.turnEnd` (`src/effects.ts:293-298`) ticks the actor's
conditions and traits, not its equipment's modifiers; the ring of regeneration's `modifiers.onTurnEnd` is summed into
`Effects.modifiers` and then never read.

**G6. The translator refuses effects the runtime can now run.** `OrsinoGoods.text` (`src/registry/orsino-goods.ts:103-121`; the apply case is line 109)
says nothing for an `apply` with a save (`case 'apply': return effect.save ? undefined : … to ally`) or for a remove
whose status is a pattern (`Poison|Fatigue|Weakened`). Both parse and validate today:
`Apply oiled to enemy for 3 turns unless reflex save against (25).` and
`Heal (1d4+2) health to ally. Remove poison from ally. Remove fatigue from ally. Remove weakened from ally.` (tested
with `parseAbility`). So foxglove and the flask of oil are category `gear` with `unsupported.use`, unsellable and
inert, for want of two cases in a generator.

**G7. Effects with no runtime at all.** `reflectSpellChance` and `onSaveVersusMagic` (ring of spell turning, ring of
perfect turning: their resistances and +4 against magic do run), `revealLocation` (Dun Rìerdan waystone: "may point
the way to Dun Rì, the city of seven towers" — Kyr now has the Seven Towers), Orsino's `randomEffect` (wand of wonder,
deck of multiplicity), summons aimed at foes, and the spells Polymorph Other and shapechange (`Canon.abilities` has
`shapechange` and `polymorph` records but `Content.abilities` cannot run them).

**G8. Charges are a fight's alone.** In a fight a wand keeps what it has left (`CombatProjection`,
`src/combat-projection.ts:31-34, 66-75`); used in the field (`use_item` → `Items.consume`, `src/campaign/items.ts:71-80`),
`resolve` drops the whole item (`items.ts:199-202`). A wand of cure minor wounds (15 charges) is gone after one
use out of a fight.

**G9. What an item adds to a quality counts only in a fight.** Field checks read `c.base[stat]`
(`src/rules/checks.ts:30`); what a member can carry reads `c.base.strength` (`src/rules/burden.ts:27`). A belt of
giant strength (+6) lets no one carry more or force a door; a helm of intellect helps no lore check.

**G10. One thing to a slot.** `Items.equip` unequips whatever else has the slot (`src/campaign/items.ts:63-65`): one
ring, not two; and the magic mails translated as body-slot equipment (galvorn mail, angelmail, robe of elvenkind)
take off the armour beneath them.

**G11. Tools nobody asks for.** No rule, module predicate or code path reads thieves' tools, holy symbol, spellbook,
musical instrument, shovel, ladder, piton, iron spikes, chalk, manacles, mirror, whetstone, flint and steel, fishing
net… (searched `data/rules`, every `.kyr`/`.kyrt` for the kind as a predicate argument, and `src/` for the id as a
literal). Kyr's skills (lockwork, digging, climbing, rites, mending, performance) are trained, never tool-gated, and an
item can carry `grants.skill` (`PartyCapabilities`, `src/campaign/party-capabilities.ts:45`) — the climbing harness
and old glossary do — but no Orsino tool does.

**G12. Nothing is left by the slain.** See *ways in* above: no drop, no spoils, no coin; NPCs' declared gear is
untakeable. Orsino paid `npcGold` and `monsterGold` (tables.json) and its dungeon gave loot per room.

**Not gaps.** Identification: neither Orsino nor Kyr has it; an `appraise` exists for valuables
(`belongings.kyr:239-258`). Scrolls need no reader: Kyr declares `proficiencies.items` per calling
(`data/catalog/classes.json`) but enforces it nowhere (`src/canon/schema.ts:150` is its only reference), so anyone may
read a scroll or point a wand — more generous than Orsino, and perhaps an open question rather than a defect.

## What to migrate first

Each with the change and the way in it should come by. The code changes are small; most are data.

| # | What | Change | Way in | Makes functional |
|---|---|---|---|---|
| 1 | **Resale of anything with a worth** (G1) | `Overlays.declareWorth`: declare `worth` for every kind with a value, and a `dealerPays` by category (half for treasure, a third for arms, armour, equipment and consumables); give dealers a trade: `buysKinds(merchant, category)` from `trade.json` (smith: weapon, armor; herb-wife: consumable; chandler: gear, tool; jeweller/magic shop keepers: equipment) and require it in `sell_valuable` | every merchant and shop keeper (they already `buysValuables`) | all 139 functional kinds and the 41 inert ones become worth carrying home |
| 2 | **Orsino's tiers behind the purposes** (G2) | in `DeepPacing.treasure` and `DeepRooms.casket`, draw from the purpose's `finds` *and* (one draw in three, say) the Orsino tier of the same name; add a `legendary` tier to each purpose (or let `high` fall to Orsino's when the purpose has none); read `#dungeon.specials[*].treasure` for a level's `special` room | deep-site rooms and caskets, by depth | 49 items: the great rings and amulets, staff of power, robe of the archmagi, cloak of invisibility, aeon stone, scroll of apocalypse, 10 gems, the legendary curiosities |
| 3 | **Magic weapons wieldable by their callings** (G4) | in `OrsinoGoods.base`, take Orsino's `type` as the damage type when it is one (slashing, piercing), and give a kind and weight by name (…`staff` → staff, light; …`sword`/`blade` → blade, medium); magic robes `type: 'cloth'`; or hand overlays in `data/catalog/items.json` naming `equipment:staff_of_power` etc. as source. Also let the mage's staff weights include medium, or Kyr's staff light | (2) | staff of power, darkwood staff, arcane conduit, staff of the necromancer for mages; bolt blade, sword of ages, Tirion's fury, sword of goblinkind, longsword of flames for thieves, rangers, bards; robe of the archmagi for mages |
| 4 | **Ring of regeneration** (G5) | `Effects.turnEnd`: also `Effects.periodicOf(actor, actor.equipment?.modifiers.onTurnEnd ?? [], 'equipment', context)` | already: market jewellers, exotic-arts shops; and the dark altar (2) | ring of regeneration (and any later item that ticks) |
| 5 | **Flask of oil, foxglove** (G6) | `OrsinoGoods.text`: an `apply` with a save to `effect.target` as `Apply X to enemy for N turns unless <kind> save against (DC).`; a pattern remove as one `Remove` per alternative | flask of oil: chandler and alchemist (`trade.json` chandler stock beside lamp oil); foxglove: as now, its stands (106 in 12 worlds), and the herb-wife pays for it | the oil-then-fire combination Orsino intended; foxglove as the strong field remedy (it is worth 50) |
| 6 | **Clothing, containers, tent, ale and wine** (G3) | either let a market town keep one general-family shop (drop `'general'` from `had` for market towns), or move them: ale and wine to the innkeeper's stock (`innStock`), tent/backpack/satchel/quiver to the chandler, clothing to the furrier and a tailor kind (Orsino's `tailor` shop is empty; give it Orsino's clothing). Then give them meaning: a tent makes a camp a sheltered rest (`Canon.rules.combat.ids.shelteredRest`, `camp_recovery`), a backpack or satchel adds to `Burden.capacity` (`carries`, as the pack mule has), a cloak/boots/gloves resist cold (`resistances.cold` while worn, a `slot`) | chandler, innkeeper, furrier | 20 items from unobtainable to functional |
| 7 | **Tools that open things** (G11) | data only: `grants: { skill: 'lockwork' }` on thieves' tools, `digging` on the shovel, `climbing` on piton, iron spikes and ladder, `rites` on the holy symbol, `performance` on a musical instrument, `mending` on needle and thread, as overlays in `data/catalog/items.json` naming their Orsino source; and probing's `needs(…)` for digging and climbing tries | as now (chandler wares, tools trade, starting gear) | a thief's own starting tools mean something; 7–10 tools from inert to functional |
| 8 | **Gems and curiosities** (G2) | besides (2): put Orsino's gem tiers into the works' `arts.json` lists by art (stone: jade, lapis lazuli, tiger's eye; water: turquoise, chrysoberyl; deep: ruby, sapphire, emerald, black opal) and the great works' `great` lists; give the few that name a power one: phoenix feather and vial of phoenix tears `Cast raise_dead on ally.` (one use), soul gem a phylactery's bane, intelligent book `grants: { skill: 'lore' }` | works, great works, deep legendary rooms | 54 valuables reachable; 3–4 of them with a use |
| 9 | **Wand charges outside a fight** (G8) | `Items.resolve`: when the consumed item has `charges`, decrement `ItemInstance.charges` and drop it only at zero (as `CombatProjection.spend` does) | — | wand of cure minor wounds as a field healer |
| 10 | **Equipped qualities in the field** (G9) | `Checks.bonus` and `Burden.capacity` read the member's scores with equipped `attributes` added (`ModifierSet.sum` of `ItemCatalog.equipment(c).modifiers`) | — | belt of giant strength, gloves of dexterity, helms, mantle of charisma, ring of strength outside fights |
| 11 | **Spoils** (G12) | `Aftermath`: when a fight ends with the foes slain, set down at the place what each slain person carried (the `__<kind>` gear `declareGear` made) and a purse by Orsino's `npcGold`; beasts leave nothing (or a pelt, later) | the place of the fight | 33 kinds NPCs already carry; arms and armour as a reward of a fight |
| 12 | **The Dun Rìerdan waystone** (G7) | `revealLocation` as a hook on equipping or a rule: `Rule … when wearing(?w, ?m) and itemKind(?w, dun_rierdan_waystone) { Assert knows(party, seven_towers_named) }` in `data/rules` | a deep site's grand finds, or a rumour's reward | the one Orsino item that points somewhere |
| 13 | **Two rings** (G10) | a second ring slot (`ring` and `ring2`, or a slot count in vocabulary) | — | rings of protection and strength together, as in Orsino |
| 14 | **Random and transforming magic** (G7) | an effect kind `random` (one of a list, from the seeded stream) in `src/lang/parse` and `AbilityUse`; then wand of wonder and the deck of multiplicity translate; polymorph/shapechange need a transformation the runtime lacks — leave unsupported | deep legendary (2) | wand of wonder, deck of multiplicity |

A representative first pass that touches every kind of thing: (1) resale; (2) the tiers; (3) the staves; (4) the
ring; (5) the flask; (7) thieves' tools. Measured by this audit's script, (1)–(3) alone would move about 50 items from
class 3 to 5 and make every functional item sellable.

## Plants

46 plants in `data/catalog/plants.json` (at 4f09db02). *Encountered* counts stands written into the 12 worlds by
`RegionGrowth.lines` (`src/world/region-growth.ts:85-113`): wild places (roads and landmarks, by habitat; the first two
plants without an abundance, and each with an abundance by its chance in ten, doubled on its rock) and town greens
(`planted`, `region-growth.ts:78-84`: two at most of the `settlement` plants). Every stand's yield lies in it, hidden
until the stand is looked at, and is taken like any find — so every encountered plant is *gathered* and then *owned*.
*Traded* is whether anyone sells the yield and whether anyone pays for it. *Consumed* is the yield's `use`.

Findings:

- **Encyclopedia only: one** — alder has no stand. Every other plant grows in at least 3 of the 12 worlds.
- **The 33 owner's plants that have no item written yield a thing that does nothing.** `Canon.gathered`
  (`src/canon/canon.ts:44-50`) makes `<plant>_gathered`: category `gear`, value 1, no `use`, no `slot`. It is not a
  treasure, so no dealer takes it, and no `pays` names it: gathered, carried, never sold, never used. All their
  `uses` — medicine, healing, protection, love, sleep, poison, curses, invisibility, prophecy, luck, wishes — are only
  words, shown in the Encyclopedia. Of the older 13: the 11 with an item heal or cure as their uses say; foxglove's
  "poison, medicine" are words (G6); alder's "material" is a word, and willow's "material" is its cut pole.
- **Nobody buys any plant.** Not the herb-wife (she pays for minor potions and antidotes), not the apothecary; the
  herb shops *sell* dandelion, heather, comfrey and kingsfoil but buy none of them back.
- **Making** reads five yields: willow bark + healing herbs (meadowsweet) → minor potion of healing; dandelion +
  heather → antidote; lamp oil + bandages (sphagnum) → fire flask (`data/rules/making.kyr:11-18`). None of the
  owner's 33.
- **The town gardens grow only eight plants.** `planted` keeps the first two `settlement` plants that pass their
  chance *in catalog order* (`region-growth.ts:82`: `.filter(abundance).slice(0, this.gardens)`), so dandelion,
  amaranth, aster and bamboo, written first, take nearly every green. In 12 worlds the gardens held dandelion 32,
  aster 24, amaranth 21, bamboo 23, daffodil 10, euphrosyne 4, bay 3, dragonwort 3 — and **never rosemary, rue,
  hyssop or gilliflower**, the four the commit names as what the gardens are for. Drawing the two with the town's
  `Draw` (shuffle the fits, then filter) would fix it.
- Wild abundance is lopsided the same way but less: bamboo grows at 152 wild stands, willow 230, goodberry 169;
  rosemary 7, stellaria 7, furze 7, dulse 5.


| Plant | Habitats | Abundance | Encountered (wild / garden stands in 12 worlds; worlds) | Gathered as | Item | Traded (sold by / bought by) | Consumed (use) | Uses only words |
|---|---|---:|---|---|---|---|---|---|
| willow | river | first two | 230 / 0; 12 | some willow bark; cut: pole | willow_bark (consumable, value 2) | no seller / no buyer | Heal (1d6) health to ally. | material |
| sphagnum | fen | first two | 48 / 0; 9 | a wad of sphagnum moss | bandages (consumable, value 1) | merchant (chandler, herbwife); pedlar (traffic.json) / no buyer | Heal (1d4 + 1) health to ally. | — |
| meadowsweet | river, fen | first two | 200 / 0; 12 | a handful of meadowsweet | herbs (consumable, value 2) | merchant (herbwife); pedlar (traffic.json) / no buyer | Heal (1d6) health to ally. | — |
| yarrow | meadow, river, wood | first two | 65 / 0; 11 | a handful of yarrow | yarrow_poultice (consumable, value 0) | merchant (herbwife) / no buyer | Remove bleeding from ally. Heal (1d3) health to ally. | — |
| alder | river, fen | first two | encyclopedia only (no stand) | — | — | no seller / no buyer | none | material |
| heather_plant | heath, fells | 6 | 73 / 0; 11 | a bunch of heather | heather (consumable, value 15) | wares (herbwife(apothecary)); shop (apothecary(first5), herbs(first5), magic_items(first5)) / no buyer | Heal (1d3+1) health to ally. Remove fatigue from ally. | — |
| dandelion_plant | meadow, settlement | 6 | 25 / 32; 12 | a handful of dandelion | dandelion (consumable, value 10) | wares (herbwife(apothecary)); shop (apothecary(first5), herbs(first5), magic_items(first5)) / no buyer | Heal (1d3) health to ally. Remove poison from ally. | — |
| comfrey_plant | river, meadow | 4 | 92 / 0; 12 | some comfrey leaves | comfrey (consumable, value 40) | wares (herbwife(apothecary)); shop (apothecary(first5), herbs(first5), magic_items(3 of 23)) / no buyer | Heal (2d4) health to ally. Remove bleed from ally. | — |
| cloudberry_plant | heights, fells, snow | 3 | 34 / 0; 9 | a few cloudberries | cloudberry (consumable, value 20) | wares (salter(provisions)); shop (magic_items(3 of 23)) / no buyer | Heal (1d4+1) health to ally. | — |
| goodberry_plant | wood, heath | 4 | 169 / 0; 12 | a handful of goodberries | goodberry_consumable (consumable, value 10) | wares (salter(provisions)); shop (magic_items(first5)) / no buyer | Heal (1d4+1) health to ally. | — |
| foxglove_plant | wood, heath | 3 | 106 / 0; 12 | a foxglove spire | foxglove (gear, value 50) | no seller / no buyer | none: Kyr cannot use a remove effect from an item. | poison, medicine |
| feverwort_plant | meadow, wood | 3 | 105 / 0; 12 | some feverwort | feverwort (consumable, value 2) | no seller / no buyer | Heal (1d6) health to ally. | — |
| kingsfoil_plant | grove, wood | 1 | 9 / 0; 8 | a sprig of kingsfoil | kingsfoil (consumable, value 75) | wares (herbwife(apothecary)); shop (apothecary(first5), exotician(first5), herbs(first5)) / no buyer | Heal (2d4+2) health to ally. Remove poison from ally. | — |
| amaranth | meadow, settlement | 2 | 10 / 21; 12 | a handful of amaranth | amaranth_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | medicine, food, protection, invisibility |
| aster | meadow, settlement | 3 | 15 / 24; 12 | a handful of aster | aster_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | medicine, decoration, love |
| bamboo | wood, settlement | 3 | 152 / 23; 12 | a stalk of bamboo | bamboo_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | construction, crafting, protection, luck, wishes |
| bay | wood, settlement | 2 | 75 / 3; 12 | a sprig of bay | bay_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | medicine, cooking, protection, purification, healing |
| banewort | wood, meadow | 2 | 97 / 0; 12 | a sprig of banewort | banewort_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | medicine, protection, curses, poison |
| dragonwort | wood, settlement | 2 | 49 / 3; 12 | a sprig of dragonwort | dragonwort_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | medicine, protection, fertility |
| bloodroot | wood, meadow | 2 | 81 / 0; 12 | a sprig of bloodroot | bloodroot_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | medicine, protection, healing, purification, love |
| gilliflower | settlement, meadow | 2 | 14 / 0; 10 | a sprig of gilliflower | gilliflower_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | medicine, protection, love, strength, healing |
| celandine | wood, meadow | 2 | 101 / 0; 12 | a sprig of celandine | celandine_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | medicine, protection, healing, escape, happiness |
| cinquefoil | meadow, wood | 2 | 72 / 0; 12 | a sprig of cinquefoil | cinquefoil_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | medicine, protection, prophecy, sleep |
| daffodil | settlement, meadow | 2 | 12 / 10; 12 | a sprig of daffodil | daffodil_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | medicine, love, luck, fertility |
| dulse | sea | 2 | 5 / 0; 3 | a handful of dulse | dulse_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | food, lust, harmony, fertility |
| alhuren | wood, fells | 1 | 27 / 0; 11 | a sprig of alhuren | alhuren_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | magic, protection, divination |
| euphrosyne | meadow, settlement | 2 | 8 / 4; 7 | a sprig of eyebright | euphrosyne_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | medicine, prophecy |
| rosenoble | settlement, wood | 2 | 71 / 0; 11 | a sprig of rosenoble | rosenoble_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | love, healthy, protection |
| gentian | fells, meadow | 2 | 41 / 0; 11 | a sprig of gentian | gentian_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | medicine, love, protection |
| furze | heath | 2 | 7 / 0; 5 | a sprig of furze | furze_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | protection, magic |
| hazel | wood, settlement | 2 | 76 / 0; 11 | a sprig of hazel | hazel_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | medicine, magic, protection, luck, fertility, wishes |
| woodbine | wood, settlement | 2 | 97 / 0; 11 | a sprig of woodbine | woodbine_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | love, protection, magic |
| hyssop | settlement, meadow | 2 | 13 / 0; 9 | a sprig of hyssop | hyssop_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | medicine, protection, magic, purification |
| stellaria | settlement, meadow | 2 | 7 / 0; 7 | a sprig of stellaria | stellaria_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | medicine, love |
| staggerweed | meadow, wood | 2 | 83 / 0; 12 | a sprig of staggerweed | staggerweed_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | medicine, magic, health, protection |
| cedron | settlement, meadow | 2 | 9 / 0; 7 | a sprig of cedron | cedron_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | medicine, purification, love |
| pennyroyal | settlement, meadow | 2 | 10 / 0; 6 | a sprig of pennyroyal | pennyroyal_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | strength, protection, peace |
| poppy | settlement, meadow | 2 | 9 / 0; 8 | a sprig of poppy | poppy_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | fertility, love, sleep, luck, invisibility |
| purslane | settlement, meadow | 2 | 9 / 0; 8 | a sprig of purslane | purslane_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | sleep, protection, love, luck, happiness |
| rosemary | settlement, meadow | 2 | 7 / 0; 5 | a sprig of rosemary | rosemary_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | protection, love, purification, healing, sleep |
| rue | settlement, meadow | 2 | 12 / 0; 6 | a sprig of rue | rue_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | healing, love, health, magic |
| thistle | settlement, meadow | 2 | 11 / 0; 8 | a sprig of thistle | thistle_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | protection, love, healing, magic |
| thyme | settlement, meadow | 2 | 11 / 0; 7 | a sprig of thyme | thyme_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | protection, love, healing, purification |
| tansy | settlement, meadow | 2 | 20 / 0; 11 | a sprig of tansy | tansy_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | protection, love, healing, magic |
| sweetgrass | settlement, meadow | 2 | 18 / 0; 11 | a sprig of sweetgrass | sweetgrass_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | protection, love, healing, magic |
| dropberry | settlement, meadow | 2 | 12 / 0; 8 | a handful of dropberries | dropberry_gathered (gear, value 1, derived by Canon.gathered) | no seller / no buyer | none | protection, love, healing, magic |

## Kyr's own items, briefly

Not Orsino's, but in the same catalog: 35 hand-written kinds (19 met in the 12 worlds; the other 16 — wardens' blade,
lantern of names, climbing harness, moonlight, first light, the gilt regalia and the rest — belong to authored
adventures), 21 `fine_` weapons (`Canon.fine`, `src/canon/canon.ts:54-62`; only the 12 in `RegionMarket.blades` are
ever sold, so fine broadsword, claymore, club, cutlass, dart, falchion, javelin, sling and staff are unobtainable),
and the 33 `_gathered` plant yields (all met, all inert: see Plants).

## Open questions

1. **Resale price and who buys what.** Half worth for treasure is settled; what should a smith pay for a used sword,
   and should a jeweller buy a wand? Orsino paid full value for anything. The economy measure (`economy.md`) will move.
2. **Should Orsino's tiers be blended into the purposes' finds, or replace them below some depth?** The purposes'
   own lists are deliberately local (the Delvers' mine has no legendary hoard: `deep-pacing.ts:144`), and an Orsino
   legendary draw would put a staff of power in a barrow. A separate "keeper's hoard" at the deepest room may be the
   right home for the great magic.
3. **Tools as capabilities**: should thieves' tools *grant* lockwork (making anyone trained) or add a bonus to
   someone already trained? `grants.skill` today does the former.
4. **The general shops**: was keeping them closed (the chandler standing for them) deliberate after the owner's
   Mission 18 note about duplicate shops? If so, the 20 gear items need another seller (innkeeper, chandler, tailor).
5. **Class item proficiencies** (`classes.json` `proficiencies.items`) are declared but never enforced. Intended?
6. **Starting gear a calling cannot equip** (mage's medium staff, cleric's heavy mail, bard's and thief's studded
   leather, ranger's spear): fix the tables, the proficiencies, or the items' weights?
7. **Natural attacks unused by any species** (the twelve breaths, quills, sting, stinger, tail): breath is now an
   ability (`data/catalog/abilities.json`), so should these 15 records be dropped from the catalog or kept for
   variations?
8. **Plants' words**: should a plant's `uses` generate an effect for its derived item (medicine → a small heal,
   sleep → a sleeping draught, poison → a poison to coat a blade), or should each be written by hand in `items.json`?
9. **Orsino background gear defined nowhere** (jester cap, lockpick, mask, parchment, book, disguise kit, flax,
   paintbrush, wooden stake, henbane, bone dagger: `data/catalog/orsino/backgrounds.json`): Orsino never defined them
   either; `Overlays.classGear`-style filtering drops them silently. Write them, or drop the references?

## Every Orsino item

Ways in are abbreviated: *merchant (type)* = base stock of that merchant (`trade.json`); *wares (merchant(trade))* =
one of the three drawn from Orsino's shop of that trade (", town" if over 80); *shop (kind(first5 | 3 of N[, market]))*
= a town shop's shelves; *deep (tier) (purposes)* = room finds and caskets; *deep camp pack* = an earlier party's
pack; *work (tier) (art)* = works' treasure; *start* = class tables, starting gear or background gear; *authored* =
named in a module. *Worlds* = generated worlds (of 12) where a player could take or buy it.

| Orsino id | Orsino category | Kyr id | Class | Ways in found | Worlds (of 12) | What runs / what is missing |
|---|---|---|---|---|---:|---|
| battleaxe | weapon | battleaxe | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)); start (warrior) | 0 | weapon 1d8 slashing (warrior); no buyer |
| bec_de_corbin | weapon | bec_de_corbin | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 0 | weapon 1d8+1 piercing (warrior); no buyer |
| broadsword | weapon | broadsword | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 0 | weapon 2d4 slashing (warrior,thief,ranger); no buyer |
| claymore | weapon | claymore | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 0 | weapon 2d4 slashing (warrior); no buyer |
| club | weapon | club | 5 functional | wares (smith(weapons)); shop (weapons(first5)) | 0 | weapon 1d4 bludgeoning (warrior,cleric); no buyer |
| composite_bow | weapon | composite_bow | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 0 | weapon 1d6 piercing (warrior,thief,ranger); no buyer |
| cutlass | weapon | cutlass | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 1 | weapon 1d6 slashing (warrior,mage,thief,bard,ranger); no buyer |
| dagger | weapon | dagger | 5 functional | merchant (smith); wares (smith(weapons)); shop (weapons(3 of 47)); start (background, bard, mage, thief); authored item (drover) | 12 | weapon 1d4 piercing (warrior,mage,thief,bard,ranger); no buyer |
| dart | weapon | dart | 5 functional | wares (smith(weapons)); shop (weapons(first5)); start (thief) | 1 | weapon 1d3 piercing (warrior,mage,thief); no buyer |
| falchion | weapon | falchion | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 2 | weapon 2d4 slashing (warrior,thief,ranger); no buyer |
| glaive | weapon | glaive | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 1 | weapon 1d10+1 slashing (warrior); no buyer |
| greatclub | weapon | greatclub | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 0 | weapon 1d8+2 bludgeoning (warrior,cleric); no buyer |
| greatsword | weapon | greatsword | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 0 | weapon 1d10 slashing (warrior); no buyer |
| halberd | weapon | halberd | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 1 | weapon 1d10 slashing (warrior); no buyer |
| handaxe | weapon | handaxe | 5 functional | merchant (woodwright); wares (smith(weapons)); shop (weapons(3 of 47)); start (background) | 3 | weapon 1d6 slashing (warrior); no buyer |
| heavy_chain | weapon | heavy_chain | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 1 | weapon 1d8+2 slashing (warrior); no buyer |
| heavy_crossbow | weapon | heavy_crossbow | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 2 | weapon 1d6+1 piercing (warrior); no buyer |
| heavy_flail | weapon | heavy_flail | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 0 | weapon 1d6+1 bludgeoning (warrior,cleric); no buyer |
| heavy_mace | weapon | heavy_mace | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 0 | weapon 1d6+1 bludgeoning (warrior,cleric); no buyer |
| heavy_pick | weapon | heavy_pick | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)); deep minor (deep) | 1 | weapon 1d6+1 piercing (warrior); no buyer |
| heavy_warhammer | weapon | heavy_warhammer | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 3 | weapon 1d6+1 bludgeoning (warrior); no buyer |
| javelin | weapon | javelin | 5 functional | wares (smith(weapons)); shop (weapons(first5)); start (ranger) | 0 | weapon 1d6 piercing (warrior,ranger); no buyer |
| katana | weapon | katana | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 0 | weapon 1d8+1 slashing (warrior,thief,ranger); no buyer |
| kusarigama | weapon | kusarigama | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 0 | weapon 1d6+2 slashing (warrior,ranger); no buyer |
| lance | weapon | lance | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 3 | weapon 2d4+1 piercing (warrior); no buyer |
| light_chain | weapon | light_chain | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 0 | weapon 1d6+2 slashing (warrior); no buyer |
| light_crossbow | weapon | light_crossbow | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 1 | weapon 1d4+1 piercing (warrior,thief,bard,ranger); no buyer |
| light_flail | weapon | light_flail | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 0 | weapon 1d4+1 bludgeoning (warrior,cleric); no buyer |
| light_mace | weapon | light_mace | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)); start (bard, cleric) | 4 | weapon 1d4+1 bludgeoning (warrior,cleric); no buyer |
| light_pick | weapon | light_pick | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)); deep negligible (deep) | 2 | weapon 1d4+1 piercing (warrior); no buyer |
| light_warhammer | weapon | light_warhammer | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)); start (cleric) | 0 | weapon 1d4+1 bludgeoning (warrior); no buyer |
| longbow | weapon | longbow | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 1 | weapon 1d6 piercing (warrior,thief,ranger); no buyer |
| longsword | weapon | longsword | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)); start (ranger, warrior) | 0 | weapon 1d8 slashing (warrior,thief,ranger); no buyer |
| morningstar | weapon | morningstar | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 0 | weapon 2d4 piercing (warrior); no buyer |
| naginata | weapon | naginata | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 1 | weapon 1d10+1 slashing (warrior); no buyer |
| nunchaku | weapon | nunchaku | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 0 | weapon 1d6+2 bludgeoning (warrior,cleric); no buyer |
| pike | weapon | pike | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 1 | weapon 1d10+1 piercing (warrior); no buyer |
| pole_arm | weapon | pole_arm | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 1 | weapon 1d6+1 piercing (warrior,ranger); no buyer |
| quarterstaff | weapon | quarterstaff | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 1 | weapon 1d6+2 bludgeoning (warrior,cleric); no buyer |
| rapier | weapon | rapier | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 0 | weapon 1d6+2 piercing (warrior,mage,thief,bard,ranger); no buyer |
| scimitar | weapon | scimitar | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 1 | weapon 1d8 slashing (warrior,thief,ranger); no buyer |
| scythe | weapon | scythe | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 1 | weapon 2d4+1 slashing (warrior,ranger); no buyer |
| shortbow | weapon | shortbow | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)); start (ranger) | 1 | weapon 1d4 piercing (warrior,thief,bard,ranger); no buyer |
| shortsword | weapon | shortsword | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)); start (bard, thief) | 2 | weapon 1d6 slashing (warrior,mage,thief,bard,ranger); no buyer |
| shuriken | weapon | shuriken | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 1 | weapon 1d4+2 piercing (warrior); no buyer |
| sling | weapon | sling | 5 functional | wares (smith(weapons)); shop (weapons(first5)) | 1 | weapon 1d4 bludgeoning (warrior,mage,thief); no buyer |
| spear | weapon | spear | 5 functional | wares (smith(weapons)); shop (weapons(first5)); start (ranger) | 1 | weapon 1d6 piercing (warrior); no buyer |
| staff | weapon | staff | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)); start (cleric, mage) | 1 | weapon 1d6 bludgeoning (warrior,cleric); no buyer |
| trident | weapon | trident | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 0 | weapon 1d6+1 piercing (warrior); no buyer |
| voulge | weapon | voulge | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 1 | weapon 1d10+1 slashing (warrior); no buyer |
| wakizashi | weapon | wakizashi | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 0 | weapon 1d6+1 slashing (warrior,mage,thief,bard,ranger); no buyer |
| whip | weapon | whip | 5 functional | wares (smith(weapons)); shop (weapons(3 of 47)) | 1 | weapon 1d4+2 slashing (warrior); no buyer |
| acid_breath | weapon (natural) | acid_breath | 3 unobtainable | — | 0 | natural attack 4d6 acid; MISSING: used by no species/variation (breath is an ability in Kyr) |
| antlers | weapon (natural) | antlers | 5 functional | — | 0 | natural attack 1d6 piercing of 1 species |
| beak | weapon (natural) | beak | 5 functional | — | 0 | natural attack 1d4 piercing of 4 species |
| bite | weapon (natural) | bite | 5 functional | — | 0 | natural attack 1d6 piercing of 29 species |
| blinding_breath | weapon (natural) | blinding_breath | 3 unobtainable | — | 0 | natural attack 4d6 radiant; MISSING: used by no species/variation (breath is an ability in Kyr) |
| claws | weapon (natural) | claws | 5 functional | — | 0 | natural attack 1d4 slashing of 24 species |
| deafening_breath | weapon (natural) | deafening_breath | 3 unobtainable | — | 0 | natural attack 4d6 sonic; MISSING: used by no species/variation (breath is an ability in Kyr) |
| disintegrating_breath | weapon (natural) | disintegrating_breath | 3 unobtainable | — | 0 | natural attack 4d6 force; MISSING: used by no species/variation (breath is an ability in Kyr) |
| doom_breath | weapon (natural) | doom_breath | 3 unobtainable | — | 0 | natural attack 4d6 necrotic; MISSING: used by no species/variation (breath is an ability in Kyr) |
| fire_breath | weapon (natural) | fire_breath | 3 unobtainable | — | 0 | natural attack 4d6 fire; MISSING: used by no species/variation (breath is an ability in Kyr) |
| fist | weapon (natural) | fist | 5 functional | start (monk) | 0 | natural attack 1d2 bludgeoning |
| flutter | weapon (natural) | flutter | 5 functional | — | 0 | natural attack 1d2 bludgeoning of 7 species |
| headbutt | weapon (natural) | headbutt | 5 functional | — | 0 | natural attack 1d4 bludgeoning of 4 species |
| holy_breath | weapon (natural) | holy_breath | 3 unobtainable | — | 0 | natural attack 6d6 true; MISSING: used by no species/variation (breath is an ability in Kyr) |
| horns | weapon (natural) | horns | 5 functional | — | 0 | natural attack 1d4 bludgeoning of 3 species |
| ice_breath | weapon (natural) | ice_breath | 3 unobtainable | — | 0 | natural attack 4d6 cold; MISSING: used by no species/variation (breath is an ability in Kyr) |
| kick | weapon (natural) | kick | 5 functional | — | 0 | natural attack 1d2 bludgeoning of 3 species |
| lightning_breath | weapon (natural) | lightning_breath | 3 unobtainable | — | 0 | natural attack 4d6 electric; MISSING: used by no species/variation (breath is an ability in Kyr) |
| maddening_breath | weapon (natural) | maddening_breath | 3 unobtainable | — | 0 | natural attack 5d6 psychic; MISSING: used by no species/variation (breath is an ability in Kyr) |
| mandibles | weapon (natural) | mandibles | 5 functional | — | 0 | natural attack 1d6 piercing of 1 species |
| poison_breath | weapon (natural) | poison_breath | 3 unobtainable | — | 0 | natural attack 4d6 poison; MISSING: used by no species/variation (breath is an ability in Kyr) |
| quills | weapon (natural) | quills | 3 unobtainable | — | 0 | natural attack 1d3 piercing; MISSING: used by no species/variation (breath is an ability in Kyr) |
| slam | weapon (natural) | slam | 5 functional | — | 0 | natural attack 1d6 piercing of 11 species |
| spines | weapon (natural) | spines | 5 functional | — | 0 | natural attack 1d6 piercing of 1 species |
| sting | weapon (natural) | sting | 3 unobtainable | — | 0 | natural attack 1d3 piercing; MISSING: used by no species/variation (breath is an ability in Kyr) |
| stinger | weapon (natural) | stinger | 3 unobtainable | — | 0 | natural attack 1d4 piercing; MISSING: used by no species/variation (breath is an ability in Kyr) |
| tail | weapon (natural) | tail | 3 unobtainable | — | 0 | natural attack 1d6 bludgeoning; MISSING: used by no species/variation (breath is an ability in Kyr) |
| talons | weapon (natural) | talons | 5 functional | — | 0 | natural attack 1d8 piercing of 4 species |
| tentacles | weapon (natural) | tentacles | 5 functional | — | 0 | natural attack 1d4+1 bludgeoning of 4 species |
| tongue | weapon (natural) | tongue | 5 functional | — | 0 | natural attack 1d4 bludgeoning of 1 species |
| tusks | weapon (natural) | tusks | 5 functional | — | 0 | natural attack 1d8 piercing of 3 species |
| banded | armour | banded | 5 functional | wares (smith(armory)); shop (armory(3 of 10)) | 0 | armour ac 6 (warrior,ranger); no buyer |
| chainmail | armour | chainmail | 5 functional | wares (smith(armory)); shop (armory(3 of 10)); start (cleric, ranger, warrior); authored item (unquiet-tower) | 12 | armour ac 5 (warrior,ranger); natural armour of 7 species; no buyer |
| cloth | armour | cloth | 5 functional | wares (furrier(fabrics), smith(armory)); shop (armory(first5), fabrics(first5)); start (bard, mage, monk) | 6 | armour ac 0 (warrior,mage,cleric,bard,ranger,monk); natural armour of 9 species; no buyer |
| hide | armour | hide_armor | 5 functional | wares (furrier(fabrics), smith(armory)); shop (armory(first5), fabrics(first5)) | 7 | armour ac 1 (warrior,thief,cleric,bard,ranger); natural armour of 24 species; no buyer |
| leather | armour | leather | 5 functional | wares (furrier(fabrics), smith(armory)); shop (armory(first5), fabrics(first5)); start (bard, ranger, thief) | 7 | armour ac 2 (warrior,thief,cleric,bard,ranger); natural armour of 9 species; no buyer |
| plate | armour | plate | 5 functional | wares (smith(armory,town)); shop (armory(3 of 10)) | 1 | armour ac 7 (warrior,ranger); natural armour of 3 species; no buyer |
| ring | armour | ring | 5 functional | wares (smith(armory)); shop (armory(3 of 10)); start (warrior) | 1 | armour ac 3 (warrior,cleric,ranger); no buyer |
| scale | armour | scale | 5 functional | wares (smith(armory)); shop (armory(3 of 10)); start (ranger, warrior) | 2 | armour ac 4 (warrior,cleric,ranger); natural armour of 11 species; no buyer |
| splint | armour | splint | 5 functional | wares (smith(armory)); shop (armory(3 of 10)); start (cleric) | 0 | armour ac 6 (warrior,ranger); no buyer |
| studded | armour | studded | 5 functional | wares (furrier(fabrics), smith(armory)); shop (armory(3 of 10), fabrics(first5)); start (bard, cleric, ranger, thief) | 8 | armour ac 3 (warrior,cleric,ranger); no buyer |
| chitin | armour (natural hide) | chitin | 5 functional | wares (smith(armory)); shop (armory(3 of 10)) | 0 | armour ac 2 (warrior,ranger); natural armour of 7 species; no buyer |
| feathers | armour (natural hide) | feathers | 5 functional | wares (smith(armory)); shop (armory(first5)) | 3 | armour ac -1 (warrior,ranger); natural armour of 8 species; no buyer |
| fur | armour (natural hide) | fur | 5 functional | wares (smith(armory)); shop (armory(first5)) | 3 | armour ac 0 (warrior,ranger); natural armour of 22 species; no buyer |
| shell | armour (natural hide) | shell | 5 functional | wares (smith(armory)); shop (armory(3 of 10)) | 0 | armour ac 4 (warrior,ranger); natural armour of 1 species; no buyer |
| spine | armour (natural hide) | spine | 5 functional | wares (smith(armory)); shop (armory(3 of 10)) | 2 | armour ac 1 (warrior,ranger); natural armour of 1 species; no buyer |
| bedroll | gear:camping | bedroll | 4 inert | merchant (chandler, furrier); start (ranger) | 12 | no buyer |
| blanket | gear:camping | blanket | 4 inert | authored sells (liberty-of-the-ice) | 0 | no buyer |
| firewood | gear:camping | firewood | 4 inert | start (background, ranger) | 0 | no buyer |
| tent | gear:camping | tent | 3 unobtainable | — | 0 | — |
| boots | gear:clothing | boots | 3 unobtainable | — | 0 | — |
| bracers | gear:clothing | bracers | 3 unobtainable | — | 0 | — |
| cloak | gear:clothing | cloak | 3 unobtainable | — | 0 | — |
| doublet | gear:clothing | doublet | 3 unobtainable | — | 0 | — |
| gloves | gear:clothing | gloves | 3 unobtainable | — | 0 | — |
| gown | gear:clothing | gown | 3 unobtainable | — | 0 | — |
| robe | gear:clothing | robe | 4 inert | start (monk) | 0 | no buyer |
| shoes | gear:clothing | shoes | 3 unobtainable | — | 0 | — |
| tunic | gear:clothing | tunic | 3 unobtainable | — | 0 | — |
| ale | gear:consumable | ale | 3 unobtainable | — | 0 | use(fight,field): Heal (3d4) health to ally. |
| holy_water | gear:consumable | holy_water | 5 functional | start (background); sexton (occupations.json) | 0 | use(fight): Deal (1d6) radiant damage to enemy.; no buyer |
| rations | gear:consumable | — | 1 not migrated | — | — | Kyr counts rations as a good (quantity(group, rations), data/rules/needs.kyr), not an item (src/registry/orsino-goods.ts goods) |
| vinegar | gear:consumable | vinegar | 3 unobtainable | — | 0 | use(fight,field): Heal (1d4) health to ally. |
| wine | gear:consumable | wine | 3 unobtainable | — | 0 | use(fight,field): Heal (2d4) health to ally. |
| backpack | gear:container | backpack | 3 unobtainable | — | 0 | — |
| barrel | gear:container | barrel | 3 unobtainable | — | 0 | — |
| box | gear:container | box | 3 unobtainable | — | 0 | world: receptacle (belongings.kyr put_in/take_out) |
| flask | gear:container | flask | 4 inert | start (ranger) | 0 | no buyer |
| pot | gear:container | pot | 3 unobtainable | — | 0 | — |
| pouch | gear:container | pouch | 3 unobtainable | — | 0 | — |
| quiver | gear:container | quiver | 3 unobtainable | — | 0 | — |
| sack | gear:container | sack | 4 inert | merchant (chandler); authored sells (liberty-of-the-ice) | 12 | no buyer |
| satchel | gear:container | satchel | 3 unobtainable | — | 0 | — |
| scrollcase | gear:container | scrollcase | 3 unobtainable | — | 0 | — |
| waterskin | gear:container | waterskin | 4 inert | merchant (chandler) | 12 | no buyer |
| candle | gear:light source | candle | 5 functional | merchant (chandler); deep negligible (barrow, deep, singing, waterworks); deep rivals (abbots); authored sells (hollins, liberty-of-the-ice, parliament-of-books); authored item (book-of-faces, the-lull); tinker (occupations.json); wild landmark find (wilds.json) | 12 | use(field): Apply candlelit to self for 2 hours.; world: light (candlelit); no buyer |
| lamp | gear:light source | lamp | 5 functional | deep negligible (deep); authored sells (let-one-remember) | 1 | world: burns lamp_oil (light_lamp); no buyer |
| lantern | gear:light source | lantern | 5 functional | merchant (chandler, smith); deep minor (deep); deep rivals (abbots, princes, warlords); authored sells (hollins, liberty-of-the-ice, low-water, parliament-of-books, the-grand-tour, what-tessary-owes); authored carries (low-water); authored give (undertown.kyrt) | 12 | world: burns lamp_oil (light_lamp); no buyer |
| torch | gear:light source | torch | 5 functional | merchant (chandler, salter, smith, woodwright); start (warrior); authored item (brood-hollow, meetings.kyrt, rooms.kyrt); authored carries (brood-hollow); authored sells (gosses-company, hollins, house-that-grows, let-one-remember, liberty-of-the-ice, low-water, quittance, the-long-man, the-lull, thrume, what-tessary-owes); pedlar (traffic.json); wild landmark find (wilds.json) | 12 | use(field): Apply torchlit to self for 1 hour.; world: light (torchlit; belongings.kyr light_item); no buyer |
| bell | gear:tool | bell | 5 functional | wares (chandler(tools), woodwright(tools)); deep negligible (barrow, singing, waterworks); deep rivals (abbots); authored item (raider-hold) | 9 | world: kits/raider-hold holding(actor, bell); an action uses it up; no buyer |
| caltrops | gear:tool | caltrops | 4 inert | wares (chandler(tools), woodwright(tools)) | 0 | no buyer |
| canvas | gear:tool | canvas | 4 inert | wares (chandler(tools), woodwright(tools)) | 1 | no buyer |
| chain | gear:tool | chain | 4 inert | wares (chandler(tools), woodwright(tools)); deep negligible (deep) | 2 | no buyer |
| chalk | gear:tool | chalk | 4 inert | merchant (chandler); wares (chandler(tools), woodwright(tools)); deep negligible (barrow, deep, singing, waterworks); authored sells (liberty-of-the-ice) | 12 | no buyer |
| cloak_pin | gear:tool | cloak_pin | 4 inert | wares (chandler(tools), woodwright(tools)); deep minor (barrow) | 6 | no buyer |
| crowbar | gear:tool | crowbar | 5 functional | merchant (chandler, smith); wares (chandler(tools), woodwright(tools)); deep minor (deep); deep rivals (warlords); start (background); authored item (caught-below, galleries.kyrt, low-water, the-long-man); authored sells (liberty-of-the-ice); tinker (occupations.json) | 12 | world: probing.kyr needs(prying, crowbar); no buyer |
| dice | gear:tool | dice | 4 inert | wares (chandler(tools), woodwright(tools)) | 2 | no buyer |
| fish_hook | gear:tool | fish_hook | 4 inert | wares (chandler(tools), woodwright(tools)) | 2 | no buyer |
| fishing_net | gear:tool | fishing_net | 4 inert | wares (chandler(tools), woodwright(tools)) | 1 | no buyer |
| flint_and_steel | gear:tool | flint_and_steel | 4 inert | wares (chandler(tools), woodwright(tools)); deep negligible (deep) | 3 | no buyer |
| hammer | gear:tool | hammer | 4 inert | wares (chandler(tools), woodwright(tools)); deep negligible (deep) | 3 | no buyer |
| holy_symbol | gear:tool | holy_symbol | 4 inert | wares (chandler(tools), woodwright(tools)); start (background, cleric) | 3 | no buyer |
| hose | gear:tool | hose | 4 inert | wares (chandler(tools), woodwright(tools)) | 2 | no buyer |
| iron_spikes | gear:tool | iron_spikes | 4 inert | merchant (chandler, smith); wares (chandler(tools), woodwright(tools)); deep negligible (deep); authored sells (liberty-of-the-ice) | 12 | no buyer |
| ladder | gear:tool | ladder | 4 inert | wares (chandler(tools), woodwright(tools)) | 1 | no buyer |
| lock | gear:tool | lock | 4 inert | wares (chandler(tools), woodwright(tools)) | 2 | no buyer |
| manacles | gear:tool | manacles | 4 inert | wares (chandler(tools), woodwright(tools)); start (background) | 3 | no buyer |
| mirror | gear:tool | mirror | 4 inert | wares (chandler(tools), woodwright(tools)) | 1 | no buyer |
| musical_instrument | gear:tool | musical_instrument | 4 inert | wares (chandler(tools), woodwright(tools)); start (bard) | 2 | no buyer |
| needle_and_thread | gear:tool | needle_and_thread | 4 inert | wares (chandler(tools), woodwright(tools)); start (monk) | 2 | no buyer |
| piton | gear:tool | piton | 4 inert | wares (chandler(tools), woodwright(tools)); deep negligible (deep) | 3 | no buyer |
| pole | gear:tool | pole | 5 functional | merchant (chandler, smith, woodwright); wares (chandler(tools), woodwright(tools)); start (warrior); plant cut:willow; tinker (occupations.json) | 12 | world: probing.kyr needs(prodding, pole); no buyer |
| quill | gear:tool | quill | 4 inert | wares (chandler(tools), woodwright(tools)); start (background) | 1 | no buyer |
| rope | gear:tool | rope | 5 functional | merchant (chandler, furrier, salter); hamlet keeper; wares (chandler(tools), woodwright(tools)); deep minor (deep, singing, waterworks); deep rivals (abbots, princes, warlords); start (background); authored item (book-of-faces, order, rooms.kyrt, skeel); authored carries (brood-hollow); authored sells (hollins, let-one-remember, liberty-of-the-ice, low-water, patient-star, quittance, skeel, the-grand-tour, the-lull, thrume, what-tessary-owes, wrayford); authored give (undertown.kyrt); pedlar (traffic.json); wild landmark find (wilds.json) | 12 | world: authored holding(actor, rope) checks (the-grand-tour, wrayford); no buyer |
| shovel | gear:tool | shovel | 4 inert | merchant (smith, woodwright); wares (chandler(tools), woodwright(tools)); deep negligible (deep); deep rivals (princes); start (background) | 11 | no buyer |
| signal_whistle | gear:tool | signal_whistle | 4 inert | wares (chandler(tools), woodwright(tools)) | 1 | no buyer |
| skillet | gear:tool | skillet | 4 inert | wares (chandler(tools), woodwright(tools)) | 4 | no buyer |
| soap | gear:tool | soap | 4 inert | wares (chandler(tools), woodwright(tools)) | 4 | no buyer |
| spellbook | gear:tool | spellbook | 4 inert | wares (chandler(tools), woodwright(tools)); start (mage) | 2 | no buyer |
| thieves_tools | gear:tool | thieves_tools | 4 inert | wares (chandler(tools), woodwright(tools)); start (background, thief) | 1 | no buyer |
| twine | gear:tool | twine | 4 inert | wares (chandler(tools), woodwright(tools)) | 1 | no buyer |
| vellum | gear:tool | vellum | 4 inert | wares (chandler(tools), woodwright(tools)) | 2 | no buyer |
| whetstone | gear:tool | whetstone | 4 inert | wares (chandler(tools), woodwright(tools)); deep negligible (deep); tinker (occupations.json) | 11 | no buyer |
| wind_chime | gear:tool | wind_chime | 4 inert | wares (chandler(tools), woodwright(tools)) | 1 | no buyer |
| alchemist_fire | flask (thrown/oil) | alchemist_fire | 5 functional | shop (magic_items(3 of 23)); deep camp pack (magic_items) | 5 | use(fight): Deal (1d6) fire damage to enemy.; no buyer |
| oil_flask | flask (thrown/oil) | oil_flask | 4 inert | deep minor (deep) | 2 | no buyer; MISSING: unsupported use: Kyr cannot use a apply effect from an item. |
| cloudberry | food | cloudberry | 5 functional | wares (salter(provisions)); shop (magic_items(3 of 23)); deep camp pack (magic_items); plant:cloudberry_plant | 11 | use(fight,field): Heal (1d4+1) health to ally.; no buyer |
| goodberry | food | goodberry_consumable | 5 functional | wares (salter(provisions)); shop (magic_items(first5)); deep camp pack (magic_items); plant:goodberry_plant | 12 | use(fight,field): Heal (1d4+1) health to ally.; no buyer |
| rashers | food | rashers | 5 functional | wares (salter(provisions)); shop (magic_items(first5)); deep camp pack (magic_items) | 4 | use(fight,field): Heal (1d3) health to ally.; no buyer |
| comfrey | herb | comfrey | 5 functional | wares (herbwife(apothecary)); shop (apothecary(first5), herbs(first5), magic_items(3 of 23)); deep camp pack (magic_items); plant:comfrey_plant | 12 | use(fight,field): Heal (2d4) health to ally. Remove bleed from ally.; no buyer |
| dandelion | herb | dandelion | 5 functional | wares (herbwife(apothecary)); shop (apothecary(first5), herbs(first5), magic_items(first5)); deep camp pack (magic_items); plant:dandelion_plant | 12 | use(fight,field): Heal (1d3) health to ally. Remove poison from ally.; recipe input (making.kyr); no buyer |
| foxglove | herb | foxglove | 4 inert | plant:foxglove_plant | 12 | no buyer; MISSING: unsupported use: Kyr cannot use a remove effect from an item. |
| heather | herb | heather | 5 functional | wares (herbwife(apothecary)); shop (apothecary(first5), herbs(first5), magic_items(first5)); deep camp pack (magic_items); plant:heather_plant | 12 | use(fight,field): Heal (1d3+1) health to ally. Remove fatigue from ally.; recipe input (making.kyr); no buyer |
| kingsfoil | herb | kingsfoil | 5 functional | wares (herbwife(apothecary)); shop (apothecary(first5), exotician(first5), herbs(first5)); start (background); plant:kingsfoil_plant | 11 | use(fight,field): Heal (2d4+2) health to ally. Remove poison from ally.; no buyer |
| first_aid_kit | kit | first_aid_kit | 5 functional | shop (magic_items(3 of 23)); deep camp pack (magic_items) | 0 | use(fight,field): Heal (1d4+1) health to ally. Remove bleed from ally.; no buyer |
| antidote | potion | antidote | 5 functional | merchant (herbwife); start (background); recipe:dandelion_tisane; authored sells (the-lull); authored makes (making.kyr) | 9 | use(fight,field): Remove poisoned from ally.; sells: herbwife pays 5 |
| elixir_of_strength | potion | elixir_of_strength | 5 functional | shop (alchemy(first5), dispensary(first5), magic_items(3 of 23), potions(first5)); deep camp pack (dispensary, magic_items) | 6 | use(fight,field): Apply strength to ally for 3 turns.; no buyer |
| healing_potion | potion | healing_potion | 5 functional | shop (alchemy(first5), dispensary(first5), magic_items(3 of 23), potions(first5)); deep major (deep); deep camp pack (dispensary, magic_items) | 5 | use(fight,field): Heal (3d4+3) health to ally.; no buyer |
| major_healing_potion | potion | major_healing_potion | 5 functional | shop (alchemy(first5), dispensary(first5), magic_items(3 of 23), potions(first5)); deep camp pack (dispensary, magic_items) | 7 | use(fight,field): Heal (4d4+4) health to ally.; no buyer |
| minor_healing_potion | potion | minor_healing_potion | 5 functional | shop (alchemy(first5), dispensary(first5), magic_items(first5), potions(first5)); deep minor (deep); deep camp pack (dispensary, magic_items); recipe:steeped_willow; authored makes (making.kyr) | 6 | use(fight,field): Heal (2d4+2) health to ally.; sells: chandler pays 6, herbwife pays 8 |
| potion_of_barkskin | potion | potion_of_barkskin | 5 functional | shop (alchemy(first5), dispensary(3 of 3), magic_items(3 of 23), potions(first5)); deep camp pack (dispensary, magic_items) | 3 | use(fight,field): Cast barkskin on ally.; no buyer |
| scroll_of_apocalypse | scroll | scroll_of_apocalypse | 3 unobtainable | — | 0 | use(fight): Cast apocalypse on enemy. |
| scroll_of_cure_disease | scroll | scroll_of_cure_disease | 5 functional | shop (dispensary(3 of 3), magic_items(3 of 23), scrolls(first5)); deep camp pack (dispensary, magic_items) | 8 | use(fight,field): Remove disease from ally.; no buyer |
| scroll_of_domination | scroll | scroll_of_domination | 5 functional | shop (dispensary(first5), exotician(first5), scrolls(first5)); deep camp pack (dispensary) | 3 | use(fight): Cast dominate_person on enemy.; no buyer |
| scroll_of_fireball | scroll | scroll_of_fireball | 5 functional | shop (dispensary(3 of 3), exotician(first5), scrolls(first5)); deep camp pack (dispensary) | 7 | use(fight): Cast fireball on enemy.; no buyer |
| scroll_of_shapechange | scroll | scroll_of_shapechange | 3 unobtainable | — | 0 | MISSING: unsupported use: It casts shapechange, which Kyr cannot run. |
| wand_of_cure_minor_wounds | wand | wand_of_cure_minor_wounds | 5 functional | shop (magic_items(3 of 23)); deep camp pack (magic_items) | 0 | use(fight,field): Cast cure_minor on ally.; charges 15 (fight only; field use spends the wand whole); no buyer |
| wand_of_magic_missile | wand | wand_of_magic_missile | 5 functional | shop (exotician(first5)) | 0 | use(fight): Cast magic_missile on enemy.; charges 20 (fight only; field use spends the wand whole); no buyer |
| wand_of_paralyzing_touch | wand | wand_of_paralyzing_touch | 5 functional | shop (magic_items(3 of 23)); deep camp pack (magic_items) | 2 | use(fight): Cast paralyzing_touch on enemy.; charges 10 (fight only; field use spends the wand whole); no buyer |
| wand_of_polymorph | wand | wand_of_polymorph | 3 unobtainable | — | 0 | MISSING: unsupported use: It casts Polymorph Other, which Kyr cannot run. |
| wand_of_wonder | wand | wand_of_wonder | 3 unobtainable | — | 0 | MISSING: unsupported use: Kyr cannot use a random effect from an item. |
| deck_of_multiplicity | wondrous (deck) | deck_of_multiplicity | 3 unobtainable | — | 0 | MISSING: unsupported use: A summon aimed at enemy is not supported. |
| amulet_of_focus | amulet | amulet_of_focus | 5 functional | shop (exotician(3 of 11,market), jewelry(3 of 6,market)) | 1 | mod:attributes; mod:bonusSpellDC; no buyer |
| amulet_of_health | amulet | amulet_of_health | 5 functional | shop (jewelry(first5), magic_items(3 of 23)); deep grand (deep); deep camp pack (magic_items) | 7 | mod:attributes; no buyer |
| amulet_of_protection | amulet | amulet_of_protection | 3 unobtainable | — | 0 | mod:ac; mod:resistances; priced over 800 on Orsino's exotician, jewelry shelf (RegionShops.shelf caps at 800) |
| amulet_of_vitality | amulet | amulet_of_vitality | 5 functional | shop (jewelry(first5), magic_items(3 of 23)); deep camp pack (magic_items) | 4 | mod:attributes; no buyer |
| dun_rierdan_waystone | amulet | dun_rierdan_waystone | 3 unobtainable | — | 0 | mod:attributes; mod:resistances; MISSING: unsupported revealLocation: Kyr does not execute this Orsino effect yet. |
| singing_stone | amulet | singing_stone | 5 functional | deep major (deep) | 1 | mod:bonusSpellDC; mod:bonusSpellDamage; no buyer |
| wardstone | amulet | wardstone | 5 functional | shop (exotician(3 of 11,market), jewelry(3 of 6,market)); deep grand (deep) | 2 | hook:onCombatStart; no buyer |
| aegis_of_eternity | magic armour/robe | aegis_of_eternity | 3 unobtainable | — | 0 | mod:ac; mod:resistances; hook:onAttacked |
| angelmail | magic armour/robe | angelmail | 3 unobtainable | — | 0 | mod:ac; mod:resistances; hook:onAttacked |
| bone_armor | magic armour/robe | bone_armor | 5 functional | shop (exotician(3 of 11,market)) | 0 | armour ac 5 (warrior,ranger); mod:resistances; hook:onAttacked; no buyer |
| galvorn_mail | magic armour/robe | galvorn_mail | 5 functional | deep grand (deep) | 1 | mod:ac; mod:resistances; no buyer |
| robe_of_elvenkind | magic armour/robe | robe_of_elvenkind | 5 functional | shop (exotician(3 of 11,market)) | 0 | mod:attributes; mod:evasion; hook:onAttacked; no buyer |
| robe_of_the_archmagi | magic armour/robe | robe_of_the_archmagi | 3 unobtainable | — | 0 | armour ac 3 (warrior,ranger); mod:attributes; mod:bonusSpellDC; mod:resistances |
| arcane_conduit | magic weapon/staff | arcane_conduit | 3 unobtainable | — | 0 | weapon 2d8 bludgeoning (warrior); mod:bonusSpellDC; mod:attributes |
| bolt_blade | magic weapon/staff | bolt_blade | 3 unobtainable | — | 0 | weapon 1d8 bludgeoning (warrior); hook:onAttackHit; priced over 800 on Orsino's exotician shelf (RegionShops.shelf caps at 800) |
| darkwood_staff | magic weapon/staff | darkwood_staff | 3 unobtainable | — | 0 | weapon 1d6 bludgeoning (warrior); mod:bonusSpellDC; mod:attributes; priced over 800 on Orsino's exotician shelf (RegionShops.shelf caps at 800) |
| ironglass_dagger | magic weapon/staff | ironglass_dagger | 5 functional | shop (magic_items(3 of 23)); deep camp pack (magic_items) | 4 | weapon 1d4 piercing (warrior,mage,thief,bard,ranger); mod:bonusDamage; no buyer |
| longsword_of_flames | magic weapon/staff | longsword_of_flames | 5 functional | shop (exotician(3 of 11,market)) | 0 | weapon 1d8 piercing (warrior); hook:onAttackHit; no buyer |
| phoenix_talon | magic weapon/staff | phoenix_talon | 3 unobtainable | — | 0 | weapon 2d8 bludgeoning (warrior); hook:onAttackHit |
| staff_of_power | magic weapon/staff | staff_of_power | 3 unobtainable | — | 0 | weapon 2d10 bludgeoning (warrior); mod:bonusSpellDC; mod:attributes; hook:onAttackHit |
| staff_of_the_necromancer | magic weapon/staff | staff_of_the_necromancer | 3 unobtainable | — | 0 | weapon 2d6 bludgeoning (warrior); mod:bonusSpellDC; mod:attributes; hook:onAttackHit |
| sword_of_ages | magic weapon/staff | sword_of_ages | 3 unobtainable | — | 0 | weapon 1d10 bludgeoning (warrior); hook:onAttackHit |
| sword_of_goblinkind | magic weapon/staff | sword_of_goblinkind | 5 functional | shop (exotician(3 of 11,market)) | 0 | weapon 1d8 bludgeoning (warrior); mod:attributes; hook:onAttackHit; no buyer |
| tirions_fury | magic weapon/staff | tirions_fury | 3 unobtainable | — | 0 | weapon 2d6 bludgeoning (warrior); hook:onAttackHit |
| ring_of_major_protection | ring | ring_of_major_protection | 3 unobtainable | — | 0 | mod:ac; priced over 800 on Orsino's exotician, jewelry shelf (RegionShops.shelf caps at 800) |
| ring_of_minor_protection | ring | ring_of_minor_protection | 5 functional | shop (jewelry(first5), magic_items(3 of 23)); deep major (barrow, singing, waterworks); deep camp pack (magic_items) | 6 | mod:ac; no buyer |
| ring_of_minor_strength | ring | ring_of_minor_strength | 5 functional | shop (jewelry(first5), magic_items(3 of 23)); deep major (deep); deep camp pack (magic_items) | 3 | mod:attributes; no buyer |
| ring_of_perfect_turning | ring | ring_of_perfect_turning | 3 unobtainable | — | 0 | mod:resistances; MISSING: unsupported reflectSpellChance: Kyr does not execute this Orsino effect yet. |
| ring_of_protection | ring | ring_of_protection | 5 functional | shop (exotician(first5), jewelry(3 of 6)); deep grand (barrow, singing, waterworks) | 3 | mod:ac; no buyer |
| ring_of_regeneration | ring | ring_of_regeneration | 4 inert | shop (exotician(3 of 11,market), jewelry(3 of 6,market)) | 0 | no buyer; MISSING: onTurnEnd modifier never runs for equipment (Effects.turnEnd reads conditions and traits only) |
| ring_of_spell_turning | ring | ring_of_spell_turning | 3 unobtainable | — | 0 | mod:resistances; mod:saves; MISSING: unsupported reflectSpellChance: Kyr does not execute this Orsino effect yet.; unsupported onSaveVersusMagic: Kyr does not execute this Orsino effect yet. |
| ring_of_strength | ring | ring_of_strength | 5 functional | shop (jewelry(first5), magic_items(3 of 23)); deep grand (barrow, deep, singing, waterworks); deep camp pack (magic_items) | 8 | mod:attributes; no buyer |
| ring_of_the_firmament | ring | ring_of_the_firmament | 5 functional | shop (exotician(3 of 11,market), jewelry(3 of 6,market)) | 0 | mod:resistances; no buyer |
| ring_of_thorns | ring | ring_of_thorns | 5 functional | shop (exotician(3 of 11,market), jewelry(3 of 6,market)) | 2 | hook:onAttacked; no buyer |
| ring_of_true_sight | ring | ring_of_true_sight | 3 unobtainable | — | 0 | mod:seeInvisible |
| aeon_stone | wondrous (worn) | aeon_stone | 3 unobtainable | — | 0 | hook:onCombatStart; hook:onAttacked |
| belt_of_giant_strength | wondrous (worn) | belt_of_giant_strength | 5 functional | deep grand (deep) | 3 | mod:attributes; no buyer |
| boots_of_swiftness | wondrous (worn) | boots_of_swiftness | 5 functional | shop (magic_items(3 of 23)); deep camp pack (magic_items) | 0 | mod:attributes; no buyer |
| censer_of_consecration | wondrous (worn) | censer_of_consecration | 5 functional | shop (exotician(3 of 11,market)) | 0 | mod:bonusSpellDC; mod:attributes; hook:onCombatStart; no buyer |
| cloak_of_invisibility | wondrous (worn) | cloak_of_invisibility | 3 unobtainable | — | 0 | hook:onCombatStart |
| cloak_of_protection | wondrous (worn) | cloak_of_protection | 5 functional | shop (magic_items(3 of 23)); deep camp pack (magic_items) | 3 | mod:ac; mod:saveVersusAll; no buyer |
| crown_of_insight | wondrous (worn) | crown_of_insight | 3 unobtainable | — | 0 | mod:attributes; priced over 800 on Orsino's exotician shelf (RegionShops.shelf caps at 800) |
| dragonhelm | wondrous (worn) | dragonhelm | 3 unobtainable | — | 0 | mod:ac; mod:resistances; hook:onAttacked |
| gloves_of_dexterity | wondrous (worn) | gloves_of_dexterity | 5 functional | shop (magic_items(3 of 23)); deep major (deep); deep camp pack (magic_items) | 0 | mod:attributes; no buyer |
| helm_of_intellect | wondrous (worn) | helm_of_intellect | 5 functional | shop (magic_items(3 of 23)); deep camp pack (magic_items) | 1 | mod:attributes; no buyer |
| helm_of_the_stars | wondrous (worn) | helm_of_the_stars | 5 functional | shop (exotician(3 of 11,market)); deep grand (barrow, deep, singing, waterworks) | 3 | mod:attributes; no buyer |
| mantle_of_charisma | wondrous (worn) | mantle_of_charisma | 5 functional | shop (magic_items(3 of 23)); deep camp pack (magic_items) | 3 | mod:attributes; no buyer |
| silvered_bracers | wondrous (worn) | silvered_bracers | 5 functional | shop (magic_items(3 of 23)); deep major (barrow, singing, waterworks); deep camp pack (magic_items) | 4 | mod:ac; no buyer |
| ancient_crown | junk | ancient_crown | 4 sells only | work rich (bone) | 3 | sells: dealer pays 125 |
| ancient_map | junk | ancient_map | 4 sells only | deep major (deep); work rich (sky) | 2 | sells: dealer pays 37 |
| ancient_orrery | junk | ancient_orrery | 4 sells only | work great (sky) | 2 | sells: dealer pays 250 |
| ancient_tome | junk | ancient_tome | 4 sells only | deep major (deep); work successors (rich) | 2 | sells: dealer pays 20 |
| antique_compass | junk | antique_compass | 4 sells only | deep major (deep); work common (sky) | 5 | sells: dealer pays 30 |
| broken_crown | junk | broken_crown | 4 sells only | work rich (bone) | 3 | sells: dealer pays 12 |
| broken_dagger | junk | broken_dagger | 4 sells only | deep negligible (barrow, deep, waterworks); work successors (common) | 4 | sells: dealer pays 1 |
| broken_flute | junk | broken_flute | 4 sells only | deep minor (barrow); deep negligible (singing); work common (bone) | 6 | sells: dealer pays 7 |
| broken_pipe | junk | broken_pipe | 3 unobtainable | — | 0 | sells: dealer pays 1 |
| broken_scepter | junk | broken_scepter | 4 sells only | work successors (common) | 6 | sells: dealer pays 15 |
| bronze_bracelet | junk | bronze_bracelet | 4 sells only | deep minor (barrow, deep, singing, waterworks); work common (bone, water) | 7 | sells: dealer pays 4 |
| bronze_statue | junk | bronze_statue | 4 sells only | deep minor (barrow, singing, waterworks); work successors (common) | 5 | sells: dealer pays 5 |
| celestial_chart | junk | celestial_chart | 4 sells only | work rich (sky) | 6 | sells: dealer pays 150 |
| cloth_pouch | junk | cloth_pouch | 4 sells only | deep negligible (barrow, deep, singing, waterworks) | 3 | sells: dealer pays 1 |
| cloth_tunic | junk | cloth_tunic | 3 unobtainable | — | 0 | sells: dealer pays 1 |
| crystal_eye | junk | crystal_eye | 4 sells only | work rich (stone) | 1 | sells: dealer pays 300 |
| crystal_orb | junk | crystal_orb | 4 sells only | work rich (sky, water) | 3 | sells: dealer pays 50 |
| diamond_eye | junk | diamond_eye | 3 unobtainable | — | 0 | sells: dealer pays 10000 |
| diamond_necklace | junk | diamond_necklace | 3 unobtainable | — | 0 | sells: dealer pays 5000 |
| divine_scepter | junk | divine_scepter | 3 unobtainable | — | 0 | sells: dealer pays 500 |
| diviners_eye | junk | diviners_eye | 3 unobtainable | — | 0 | sells: dealer pays 2500 |
| dowsing_rod | junk | dowsing_rod | 4 sells only | deep minor (deep) | 1 | sells: dealer pays 6 |
| dragons_egg | junk | dragons_egg | 3 unobtainable | — | 0 | sells: dealer pays 1000 |
| dragons_tooth | junk | dragons_tooth | 3 unobtainable | — | 0 | sells: dealer pays 75 |
| eternal_flame | junk | eternal_flame | 3 unobtainable | — | 0 | sells: dealer pays 2000 |
| faded_map | junk | faded_map | 4 sells only | work common (sky) | 2 | sells: dealer pays 5 |
| faded_painting | junk | faded_painting | 3 unobtainable | — | 0 | sells: dealer pays 6 |
| faded_tome | junk | faded_tome | 4 sells only | work successors (common) | 2 | sells: dealer pays 10 |
| fallen_star | junk | fallen_star | 4 sells only | work great (deep) | 2 | sells: dealer pays 250 |
| golden_idol | junk | golden_idol | 4 sells only | deep major (barrow, singing, waterworks); work successors (rich) | 7 | sells: dealer pays 200 |
| hand_mirror | junk | hand_mirror | 4 sells only | deep negligible (barrow); deep minor (singing, waterworks); work successors (common) | 7 | sells: dealer pays 1 |
| intelligent_book | junk | intelligent_book | 3 unobtainable | — | 0 | sells: dealer pays 1500 |
| intelligent_painting | junk | intelligent_painting | 3 unobtainable | — | 0 | sells: dealer pays 1250 |
| iron_figurine | junk | iron_figurine | 4 sells only | deep negligible (barrow, deep, singing, waterworks); work common (deep) | 6 | sells: dealer pays 2 |
| iron_idol | junk | iron_idol | 4 sells only | deep major (deep); deep minor (barrow); work successors (common) | 4 | sells: dealer pays 10 |
| iron_torc | junk | iron_torc | 4 sells only | deep minor (barrow, deep, singing, waterworks); work common (bone) | 7 | sells: dealer pays 2 |
| jeweled_box | junk | jeweled_box | 4 sells only | deep major (deep); work rich (water); work successors (rich) | 5 | sells: dealer pays 75 |
| jeweled_crown | junk | jeweled_crown | 4 sells only | work successors (rich) | 4 | sells: dealer pays 40 |
| jeweled_dagger | junk | jeweled_dagger | 4 sells only | deep major (barrow, singing, waterworks); work rich (deep); work successors (rich) | 9 | sells: dealer pays 150 |
| jeweled_statue | junk | jeweled_statue | 3 unobtainable | — | 0 | sells: dealer pays 600 |
| jeweled_torc | junk | jeweled_torc | 4 sells only | deep grand (barrow, singing, waterworks); work rich (bone, deep) | 9 | sells: dealer pays 250 |
| jeweled_zodiac | junk | jeweled_zodiac | 3 unobtainable | — | 0 | sells: dealer pays 750 |
| kraken_claw | junk | kraken_claw | 4 sells only | work great (water) | 1 | sells: dealer pays 400 |
| lensing_crystal | junk | lensing_crystal | 4 sells only | deep major (deep); work common (sky) | 4 | sells: dealer pays 9 |
| lost_tome | junk | lost_tome | 4 sells only | work successors (rich) | 1 | sells: dealer pays 175 |
| music_box | junk | music_box | 4 sells only | work rich (water); work successors (common) | 6 | sells: dealer pays 25 |
| opalescent_skull | junk | opalescent_skull | 3 unobtainable | — | 0 | sells: dealer pays 1250 |
| philosophers_stone | junk | philosophers_stone | 3 unobtainable | — | 0 | sells: dealer pays 5000 |
| phoenix_feather | junk | phoenix_feather | 3 unobtainable | — | 0 | sells: dealer pays 350 |
| priceless_painting | junk | priceless_painting | 3 unobtainable | — | 0 | sells: dealer pays 500 |
| royal_crown | junk | royal_crown | 4 sells only | work great (bone); work successors (rich) | 6 | sells: dealer pays 250 |
| royal_scepter | junk | royal_scepter | 4 sells only | work successors (rich) | 4 | sells: dealer pays 75 |
| sacred_idol | junk | sacred_idol | 3 unobtainable | — | 0 | sells: dealer pays 1500 |
| simple_ring | junk | simple_ring | 4 sells only | deep negligible (barrow, singing, waterworks); work common (water) | 5 | sells: dealer pays 2 |
| smoking_pipe | junk | smoking_pipe | 4 sells only | work successors (common) | 4 | sells: dealer pays 3 |
| soul_gem | junk | soul_gem | 3 unobtainable | — | 0 | sells: dealer pays 500 |
| steel_coin | junk | steel_coin | 4 sells only | work successors (common); authored item (undertown.kyrt) | 12 | sells: dealer pays 1 |
| steel_torc | junk | steel_torc | 4 sells only | deep minor (barrow, deep, waterworks); work common (bone, deep) | 7 | sells: dealer pays 3 |
| tattered_map | junk | tattered_map | 4 sells only | deep minor (deep) | 2 | sells: dealer pays 1 |
| tattered_tome | junk | tattered_tome | 4 sells only | work successors (common) | 1 | sells: dealer pays 7 |
| titan_statue | junk | titan_statue | 4 sells only | work great (stone) | 3 | sells: dealer pays 400 |
| triskelion_amulet | junk | triskelion_amulet | 3 unobtainable | — | 0 | sells: dealer pays 3 |
| unholy_symbol | junk | unholy_symbol | 3 unobtainable | — | 0 | sells: dealer pays 37 |
| unusual_seashell | junk | unusual_seashell | 4 sells only | work common (water) | 2 | sells: dealer pays 12 |
| vial_of_phoenix_tears | junk | vial_of_phoenix_tears | 3 unobtainable | — | 0 | sells: dealer pays 750 |
| vial_of_unicorn_blood | junk | vial_of_unicorn_blood | 3 unobtainable | — | 0 | sells: dealer pays 900 |
| wooden_bowl | junk | wooden_bowl | 3 unobtainable | — | 0 | sells: dealer pays 1 |
| wooden_figurine | junk | wooden_figurine | 4 sells only | deep negligible (barrow, singing, waterworks) | 0 | sells: dealer pays 1 |
| wooden_idol | junk | wooden_idol | 4 sells only | work common (bone); work successors (common) | 4 | sells: dealer pays 7 |
| zodiac_medallion | junk | zodiac_medallion | 4 sells only | work common (sky) | 3 | sells: dealer pays 10 |
| zoological_manual | junk | zoological_manual | 3 unobtainable | — | 0 | sells: dealer pays 20 |
| agate | gem | agate | 3 unobtainable | — | 0 | sells: dealer pays 7 |
| alexandrite | gem | alexandrite | 3 unobtainable | — | 0 | sells: dealer pays 30 |
| amethyst | gem | amethyst | 4 sells only | work rich (stone) | 4 | sells: dealer pays 30 |
| aquamarine | gem | aquamarine | 4 sells only | work rich (water) | 2 | sells: dealer pays 125 |
| black_diamond | gem | black_diamond | 3 unobtainable | — | 0 | sells: dealer pays 400 |
| black_opal | gem | black_opal | 3 unobtainable | — | 0 | sells: dealer pays 1250 |
| blue_diamond | gem | blue_diamond | 3 unobtainable | — | 0 | sells: dealer pays 1250 |
| carnelian | gem | carnelian | 3 unobtainable | — | 0 | sells: dealer pays 7 |
| chrysoberyl | gem | chrysoberyl | 3 unobtainable | — | 0 | sells: dealer pays 7 |
| citrine | gem | citrine | 3 unobtainable | — | 0 | sells: dealer pays 7 |
| diamond | gem | diamond | 3 unobtainable | — | 0 | sells: dealer pays 1250 |
| emerald | gem | emerald | 3 unobtainable | — | 0 | sells: dealer pays 125 |
| fire_opal | gem | fire_opal | 3 unobtainable | — | 0 | sells: dealer pays 1250 |
| fluorite | gem | fluorite | 4 sells only | work common (stone) | 2 | sells: dealer pays 7 |
| garnet | gem | garnet | 4 sells only | deep major (deep); work rich (deep) | 3 | sells: dealer pays 30 |
| grandidierite | gem | grandidierite | 3 unobtainable | — | 0 | sells: dealer pays 400 |
| hematite | gem | hematite | 4 sells only | deep minor (deep); work common (deep) | 4 | sells: dealer pays 7 |
| iolite | gem | iolite | 3 unobtainable | — | 0 | sells: dealer pays 7 |
| jade | gem | jade | 3 unobtainable | — | 0 | sells: dealer pays 7 |
| jasper | gem | jasper | 4 sells only | work common (stone) | 2 | sells: dealer pays 7 |
| lapis_lazuli | gem | lapis_lazuli | 3 unobtainable | — | 0 | sells: dealer pays 7 |
| malachite | gem | malachite | 4 sells only | work common (stone) | 0 | sells: dealer pays 7 |
| moonstone | gem | moonstone | 4 sells only | work common (water); authored item (undertown.kyrt) | 12 | sells: dealer pays 7 |
| musgravite | gem | musgravite | 3 unobtainable | — | 0 | sells: dealer pays 400 |
| obsidian | gem | obsidian | 4 sells only | deep minor (deep); work common (deep) | 4 | sells: dealer pays 7 |
| onyx | gem | onyx | 3 unobtainable | — | 0 | sells: dealer pays 7 |
| painite | gem | painite | 3 unobtainable | — | 0 | sells: dealer pays 400 |
| peridot | gem | peridot | 3 unobtainable | — | 0 | sells: dealer pays 30 |
| pyrite | gem | pyrite | 4 sells only | deep minor (deep); work common (deep) | 5 | sells: dealer pays 7 |
| quartz | gem | quartz | 4 sells only | work common (water) | 2 | sells: dealer pays 7 |
| red_diamond | gem | red_diamond | 3 unobtainable | — | 0 | sells: dealer pays 400 |
| rose_quartz | gem | rose_quartz | 4 sells only | work common (stone) | 3 | sells: dealer pays 7 |
| ruby | gem | ruby | 3 unobtainable | — | 0 | sells: dealer pays 125 |
| sapphire | gem | sapphire | 3 unobtainable | — | 0 | sells: dealer pays 125 |
| smoky_quartz | gem | smoky_quartz | 4 sells only | deep minor (deep) | 2 | sells: dealer pays 7 |
| spinel | gem | spinel | 4 sells only | deep major (deep) | 1 | sells: dealer pays 30 |
| spinel_red | gem | spinel_red | 3 unobtainable | — | 0 | sells: dealer pays 125 |
| star_ruby | gem | star_ruby | 3 unobtainable | — | 0 | sells: dealer pays 1250 |
| tanzanite | gem | tanzanite | 3 unobtainable | — | 0 | sells: dealer pays 125 |
| tiger_eye | gem | tiger_eye | 3 unobtainable | — | 0 | sells: dealer pays 7 |
| topaz | gem | topaz | 4 sells only | deep major (deep); work rich (deep) | 3 | sells: dealer pays 30 |
| tourmaline | gem | tourmaline | 4 sells only | work rich (stone) | 3 | sells: dealer pays 30 |
| turquoise | gem | turquoise | 3 unobtainable | — | 0 | sells: dealer pays 7 |
| zircon | gem | zircon | 3 unobtainable | — | 0 | sells: dealer pays 30 |
