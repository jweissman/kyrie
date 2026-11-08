# Mission 19: journeys 2, 5 and 6, played

Three of the brief's six journeys (brief.md §XII) played as demonstrations through the browser client on 7 November,
by the builder (an agent), with what blocked them fixed in the same commit. Build: `integrate/imbar` at 066ad5be and
the branch `journeys/256` on it; Chromium 1280×800 driven by `scripts/play-server.ts`, clicking what the page shows and
reading what it says. Screenshots below are in [evidence/journeys/](evidence/journeys/); the full run of about 120
captures, each with the page's text, is outside the repository in `/var/tmp/kyrie/m19/journey-shots/`.

The world for all three is the seed `kahitude`, **Fernholt** (forest, human, faith of Cernunnos), opened in the
browser by `index.html?world=kahitude` (the journeys first pinned the page's random seed instead; the address was
found afterwards, and the authoring trail now says so). Origin: Coming Home, to Brockminster.

What this is, in the evidence ledger's terms: **usable** (done through the page by the builder). Nothing here is
**accepted**; no independent player has played it. Where a difference is shown, it is that the page offers it and it
works; whether it is enjoyable is not claimed.

## Journey 2: a second character with different capabilities

Two protagonists in the same world and origin: **a human cleric of Life, once a deacon** (rites of the dead, insight,
mending) and **a human thief, once a burglar** (lockwork, trapwork, stealth, deception). Each played the same opening:
the wagoner's cart on the road in, the gate-yard of Brockminster, the crypt under the churchyard, the father on the
road, the mother at the guest-hall.

### What differed, as the page showed it

| Moment | Cleric | Thief |
|---|---|---|
| The wagoner's cart in the ditch | Lead the horse; the shoulder to the wheel shown as "Needs brawn or a crowbar"; lifting a sack "Needs stealth: no one in the company has it" ([cart](evidence/journeys/2026-11-07-j2-cleric-cart.webp)) | The same, and the sack lifted off the tail while he heaves: "The wagoner … curses the wheel and does not turn round" ([cart](evidence/journeys/2026-11-07-j2-thief-cart.webp), [sack](evidence/journeys/2026-11-07-j2-thief-sack.webp)) |
| The corn-store padlock | "Pick … Needs lockwork", "Wrench … Needs brawn": the key must be asked of Cadmus ([padlock](evidence/journeys/2026-11-07-j2-cleric-padlock.webp)) | Picked at once, no job taken ([picked](evidence/journeys/2026-11-07-j2-thief-picked.webp)) |
| The crypt's stone door | Opened by the crypt key Gareth gives with the job | Picked without asking anyone |
| The man with the black candle, in the ossuary | "Say the rite of rest over the bone-heaps · likely": rites 12 against 4, the candle out, the dead bones again, the raiser fled ([offered](evidence/journeys/2026-11-07-j2-cleric-candle.webp), [done](evidence/journeys/2026-11-07-j2-cleric-rite.webp)) | Before the fix, only what anyone has: the rite shown as "Needs rites of the dead", intimidation at an even chance (9 against 10, failed: [before](evidence/journeys/2026-11-07-j2-thief-candle-before.webp), [failed](evidence/journeys/2026-11-07-j2-thief-intimidation.webp)). After: "Creep round behind the bone-heaps and pinch out the black candle at his back · likely", stealth 17 against 6 ([offered](evidence/journeys/2026-11-07-j2-thief-creep-offered.webp), [done](evidence/journeys/2026-11-07-j2-thief-crept.webp)) |
| The father on the road | Before the fix, "Bury him by the road, and say the words over him … say what words you have", as anyone ([before](evidence/journeys/2026-11-07-j2-cleric-bury-before.webp)). After: "… say the rite of the dead over him", the rite said whole, and the mother: "He would like that. And laid properly: nobody can say he was put in a ditch" (the line reworded after the screenshot so the wife's spec still hears "He would like that") ([burial](evidence/journeys/2026-11-07-j2-cleric-rite-burial.webp), [mother](evidence/journeys/2026-11-07-j2-cleric-mother.webp)) | The plain burial, as before |
| Character sheet | Cure Minor Wounds, Sanctify, Cure Light Wounds, Anoint, Remove Fear prepared | Lockwork, trapwork, stealth, deception; a dart |

A scholar's way at the black candle (lore reads the chalk ring's missing warding line, and the raiser is told so) is
written in the template; this journey did not play a scholar.

### What failed, and what was fixed

- **Fixed: the thief had no way of a thief's own at the black candle** (M19-136). The cleric had the rite, a scholar the
  chalk; the thief only an intimidation it is untrained in, or the fight. A stealth act, with a failure that turns the
  dead on the company, is now in `data/generation/town/undertown.kyrt` (every generated first town's undertown).
- **Fixed: a cleric buried the father with "what words you have"** (M19-137). One with rites of the dead now says the
  rite, and the mother answers it (`data/goings-on/drover/situation.kyr`); anyone else buries as before.
- **Remains: talk does not know a calling** (M19-141). Gareth the priest gives a cleric the same words and job as a
  thief; Osbert the pilgrim on the road has nothing for a cleric; nobody offers a thief a fence or a whisper. Generated
  talk has no calling-gated topic anywhere (eight such topics exist, all in authored adventures).
- **Remains: a plant is the same to everyone** (M19-144). Banewort is "dark green leaves and small flowers" to a cleric
  and a burglar alike; and Look on the road between Fearnmaere and Brockminster lists twenty-three plants before the
  fresh ruts the story turns on.
- **Remains: after an act removes the thing looked at, its result is shown under another's heading** (M19-142): the
  padlock picked, "The corn-store padlock hangs open" appeared under "The dandelion".
- **Remains: "The book he leaves on the bones"** (M19-143) is told in every ending at the black candle, and there is no
  book: Search finds nothing.

## Journey 5: a human-authoring exercise

Three additions made as an author would, from `doc/authoring/` (the trail's pages 5 and 6, and the template's own
header), with no engine change, each marked demonstration content where it is written:

1. **A plant and its item**: betony (`betony_plant` in `data/catalog/plants.json`, wood and meadow, clay vale and
   limestone, abundance 2) and the twist of betony gathered from it (`betony` in `data/catalog/items/consumables.json`,
   `Heal (1d4+1) health to ally. Remove bleed from ally.`). Self-heal was the first choice, and was changed when the
   history showed the owner had removed a self-heal before (d7edde06).
2. **A spell**: Hornet Swarm (`hornet_swarm` in `data/catalog/abilities.json`), a first-level divine spell of the
   nature domain: 1d4 piercing to every foe, and distracted for two turns unless a reflex save.
3. **A template line**: a meeting, `--- wood honey 3` in `data/generation/wild/meetings.kyrt`: a honey-hunter at a bees'
   oak, helped with the smoke-pot, who thanks the company with two twists of betony and tells of the place beyond; a
   stand of betony to gather at the oak's foot.

### Generated, inspected, validated, met

- `bin/kyrie validate`: "331 abilities; canonical catalogs valid".
- `bin/kyrie world kahitude` compiled the country with the meeting, and (after the fix below) listed where it was
  drawn: five stretches, the nearest `t169 the woods of Asholt (2 from Fearnmaere): wood honey`.
- `bun run web:build` and `bin/kyrie handbook`: the Encyclopedia had both entries at once
  ([betony](evidence/journeys/2026-11-07-j5-ency-plant.webp), [Hornet Swarm](evidence/journeys/2026-11-07-j5-ency-spell.webp)),
  and the handbooks counted one more Kyr spell and item.
- **The spell in play.** A cleric of Nature chosen at creation shows Hornet Swarm among the first-level spells, with its
  line said from its effects, and starts with it prepared ([creation](evidence/journeys/2026-11-07-j5-spell-at-creation.webp));
  cast at the rats under the corn-store it did 1 piercing, set bleeding (piercing's own), and the rats' reflex save
  turned the distraction ([fight](evidence/journeys/2026-11-07-j5-spell-cast.webp)).
- **The meeting in play.** From Fearnmaere out to the edge of Asholt and a stretch west on the map: "Someone is here";
  the honey-hunter up the ladder and the betony at the oak's foot
  ([met](evidence/journeys/2026-11-07-j5-meeting.webp), [Look](evidence/journeys/2026-11-07-j5-meeting-look.webp));
  held the ladder, gathered a twist, told the honey-hunter, given two more, and told of "a square tower" to the east,
  which went on the map as Wentustur ([thanks](evidence/journeys/2026-11-07-j5-meeting-thanks.webp)).
- **The item in play.** In the pack, "A twist of betony" and "Two betonies", "for one who is bleeding or hurt", with its
  description ([pack](evidence/journeys/2026-11-07-j5-item-in-pack.webp)).

### Where the path was unclear or needed more than data

- **Fixed: no way to see where a template's option was drawn.** A meeting could be found only by wandering. `bin/kyrie
  world <seed>` now ends with a `Meetings:` list (stretch, its map name, how far from its town, the option); a tool
  change, not an engine one (`src/cli/world.ts`; M19-140).
- **Fixed in the docs:** no page said how to add a spell to the catalog (the guide's "A spell taught" is about Kyr's
  `teach`), that a spell's line, log and Encyclopedia entry are all said from its typed effects, which domain's clerics
  are offered it, that an item without a plate shows an empty square and why plates cannot be made by an author, or how
  to find and walk to a meeting, or that `?world=<seed>` opens a seed in the browser. The trail's
  [page 5](../../authoring/trail/05-variations-with-deem.md) and [page 6](../../authoring/trail/06-canon.md) now do,
  and page 6's paragraph on creatures "in progress on main" is brought up to date.
- **Remains: a new kind has no plate** (M19-145): betony's tile in the pack is an empty square, as is the ashwood ward
  charm's. Plates are the owner's paintings; an author cannot make one, and nothing marks the kind as waiting for one.
- **Remains: the stand's items and the kind given are two rows** (M19-146): "A twist of betony" and "Two betonies" in
  one pack; the plural is made by rule.
- **Remains: weight is a guess.** A weight of 3 among the wood's options took five of the country's nineteen
  meetings; there is no preview of the draw across seeds short of running `world` for each.

## Journey 6: content and Encyclopedia integration

Four pieces traced from their source to the page and to the Encyclopedia of Imbar (title → The encyclopedia).

| Material | Source | Migration | Met in play | Encyclopedia |
|---|---|---|---|---|
| **The ghoul**, an Orsino monster | `data/sources/orsino/registry.json`, `monsterType:Ghoul` (settings/fantasy/tables.json: class undead, its modifiers and abilities); `inventory.json`: integrated, executable | `data/catalog/monsters.json` `ghoul`: composed by OrsinoMonsters, fidelity adapted, Orsino's 2d10 gold omitted (said so), plate `monsters/ghoul`, habitats barrow, ruin, fen | The hungry dead of the ossuary under Brockminster's churchyard: its plate, "Ghoul; level 1; 13 HP" ([in play](evidence/journeys/2026-11-07-j6-ghoul-in-play.webp)) | Creatures, "Ghoul": type, hit points, qualities, attack, hide, where found, worth, its abilities linked ([entry](evidence/journeys/2026-11-07-j6-ency-ghoul.webp)) |
| **The Minor Potion of Healing**, an item with a plate | Orsino `consumable:minor_healing_potion` | `items/consumables.json`, fidelity faithful, plate `consumables/minor_healing_potion` | Two given by Gareth for laying the dead; in the pack with its plate ([pack](evidence/journeys/2026-11-07-j6-potion-in-pack.webp)) | Arms, gear and treasure: "Used: Heal one ally for 2d4 + 2 (4–10)" ([entry](evidence/journeys/2026-11-07-j6-ency-potion.webp)) |
| **The dandelion**, a plant | Orsino `consumable:dandelion` (an herb sold) | `plants.json` `dandelion_plant`, adapted: the plant it is gathered from, abundance 6, its plate | In Look in the gate-yard of Brockminster, "a tea of them cleans the blood", gathered ([in play](evidence/journeys/2026-11-07-j6-dandelion-in-play.webp)) | Plants, with its plate, where it grows, what it gives, and the item's use ([entry](evidence/journeys/2026-11-07-j6-ency-dandelion.webp)) |
| **Thrume**, an independently authored adventure | `data/adventures/thrume/` (saltgrave.kyr and ten more), placed by `countries.json` as a province of the first country | Installed within Fernholt the first time the company stands at its way in (`Frontier.province`) | The way into Thrume on the map, the salt road below the town, and, after the fix, Saltgrave's market square and its doors ([salt road](evidence/journeys/2026-11-07-j6-thrume-salt-road.webp), [Saltgrave](evidence/journeys/2026-11-07-j6-thrume-saltgrave.webp)) | Lands of rumour, "Thrume": what is said of it at the inns, and how it looks from afar; nothing of what is in it ([entry](evidence/journeys/2026-11-07-j6-ency-thrume.webp)) |

### What failed, and what was fixed

- **Fixed: Thrume could not be entered** (M19-138, class A). At the salt road below the town, Go… offered nothing and
  the map nothing: the town gate into Saltgrave is a journey between two parts of the province, and in a drawn country
  the page gives every journey to the map, while the map draws the whole province on the one hex of its way in. The
  page now keeps a journey that does not leave the hex the company stands on (`MenuModel.oneStretch`,
  `web/reader/menu-model.ts`), so every province's own roads are walkable; the town's own ways are as they were.
  Headless play had always offered "Take the town gate to the market square", which is why no spec saw it.
- **Fixed: the Encyclopedia's creatures had their scores as bonuses** ("+11 strength, +11 dexterity" for the ghoul) and
  plants their grounds as ids ("clay_vale"): now "strength 11, dexterity 11" and "clay vale" (`src/handbook/mm.ts`;
  M19-139). The handbooks are regenerated.
- **Remains: nothing in play leads to the Encyclopedia** (M19-147). The ghoul looked at, the potion in the pack: neither
  names its entry, and the Encyclopedia is reached from the title only. Going to it from a game in progress and back
  found no game to carry on.
- **Remains: an authored adventure contributes no entries** (M19-148, the rest of M19-15). Thrume is a rumour in Lands of
  rumour; its Hollow Smiths (a module-local `thrume_paid`, like a revenant), Saltgrave, the Salt Office, the Red Lantern
  are in no chapter, nor Wapshott's circus, the Basilisk or its hook-claws' adventure (the hook-claw's canonical record
  is in Creatures, as a kind). Spoilers are a reason to keep some back; there is no way for a module to say which.
- **Remains: the pack does not say what a thing does** where the Encyclopedia does ("restores health", not 2d4+2;
  folded into M19-147).
- **Remains (art/scenery's):** Saltgrave's market painted as woodland, and a meeting's painting captioned by its file
  name ("A10464.jpg").

## Seen on the way

- "The rats under the corn-store is here … stands its ground … It will not have you here for long": a band of one
  named in the plural is told in the singular (M19-149).
- The first Set out after a rebuild took about thirty seconds; later ones about seven.
- The ossuary with the black candle burning in it is "pitch dark".
