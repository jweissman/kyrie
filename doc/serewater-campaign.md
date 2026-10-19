# Playing the Serewater March

This increment implements the first continuing Serewater campaign. Build with `bun run web:build` and open **`site/index.html`**. `folio.html` is an alias for the Lantern player. The earlier Saint Orra player remains at `orra.html`; the developer workbench remains at `workbench.html`.

Create three companions or edit either suggested company. Ancestry grants a named combat technique in newly created background-bearing parties; classes determine starting abilities/resources; backgrounds grant delving, burial lore or woodcraft. The creator explains these choices. A human/elf/dwarf company also qualifies for the Free Fellowship's institutional standing. These are Kyr rules and adaptations, not a complete Orsino character-creation port.

## The playable region

Reedwake has five connected locations: quay, inn, common shrine, outfitter and salvage office. Four wilderness approaches connect it to **eighteen interior rooms on three levels** of Censer Hill. The foundry, flood refuge and ossuary have different physical identities and connected purposes. The region's two religious traditions have stable identities, shared by the shrine, keeper and historical burials. Willow/sedge floodplain, hazel/chalk ridge, displaced cave scavengers and territorial marsh wildlife form a deliberately small palette.

Nera wants customers who come back alive. Iven wants named burials preserved. Edda wants a licensed bronze bearing before her permit expires. Pell wants to get home rather than carry someone else's salvage. The Custodian recognizes an explicit funerary mandate. The party can rescue, salvage, investigate, seek lawful access, fight, bypass or return before entering the deep chambers. There is no campaign-ending completion flag.

The map is drawn from visited places and observed connections, grouped by authored district/level. A known entrance is not marked explored. Concealed routes remain hidden until discovered. Available local travel is distinguished from remote connections whose current state is unconfirmed.

## A complete adventuring loop

- Talk with Nera and Iven before choosing an expedition. Buy finite, individually owned medicines and shared rations; choose their carriers.
- Reach the yard by the dry ridge or approach the exposed drain. Woodcraft permits an explicitly receptive wildlife approach; ordinary combat remains available.
- Explore branches through workshop, furnace, gallery and stores. The rescued surveyor can actually be escorted home, one movement at a time.
- Inspect physical warnings. Pin a trap using delving, brace it using an equipped line, choose another route, or risk it with a selected living companion. Triggered or disabled mechanisms stay spent.
- Acquire a reusable line and a names lantern. Equipment slots and ownership are real canonical state. The equipped line opens vertical routes; the lantern makes hidden funerary lettering observable, revealing a persistent concealed connection.
- Return with discoveries and equipment before defeating the Custodian. Recover for six hours and a ration, spend earned experience on one of two taught techniques, then descend using routes unavailable to the first approach.
- Present the named record and Iven's writ, fight the Custodian, take the risky shutter route, or bypass its court by climbing. A successful noncombat passage leaves it alive. A combat death remains permanent.
- Recover an independently generated relic: a save/armor charm or damage-granting blade. Use it in later combat. Bring the bronze bearing to its actual commissioner for a finite payment; ownership moves to the buyer.

The actual browser histories include two expeditions each and materially different Custodian outcomes. A further headless continuation demonstrates the line entrance, safe shutter disarm, lower landing/sluice loop, finite foraging and physical commission delivery. See [playthroughs and screenshots](playtests/serewater/README.md).

## Authoritative mechanics and bounded policies

Combat, room hazards and consumables use `AbilityUse`/`Effects`. The bridge adds explicit source labels/IDs and stages creature changes through leases inside the existing campaign checkpoint. Rejected commands roll back world, inventory, currency, creatures, event count, time and encounter ordinal. Purchases debit the company and credit the identified merchant. Item transfers, including recovery from fallen companions, preserve instance identity.

Generated base statistics remain immutable. Equipped attachments contribute armor, power and save modifiers to effective combat/field projections. Replacing equipment in a slot puts the previous item away. Conditions retain source information. Items' unequip lifetime is “while equipped”; ordinary combat cooldowns reset at encounter entry; encounter-only statuses disappear at encounter exit. Persistent conditions retain their **remaining owner combat turns**, including across travel and rest. This is not a world-time disease/exposure scheduler. Legacy poison/bleeding turn damage still uses the existing status-turn path and does not rerun ordinary armor/resistance mitigation; broad condition immunities and reaction hooks are not implemented. Rest restores living companions' health/mana and treats bleeding, but does not cure poison, clear every condition or resurrect.

Opt-in `encounterXp(group)` awards each living party member the declared experience on a won encounter. Training spends 20 XP and an hour to learn a permanent technique from an actual co-located mentor. It is bounded advancement, not full class leveling. Other campaigns without the opt-in retain their reward behavior.

Traps use the same targeting, saves, damage and condition sequence as abilities. Their instantiated world action supplies the source identity; consumables use their unique item ID. There is no separate trap or potion effect interpreter. A neutral, detached source projection adapts a room hazard to the existing fighter-shaped executor; it is not inserted as a persistent creature. A source-independent effect-host extraction and generic event reactions remain future work.

## Generation that actually affects this campaign

The single construction family composes party records, contextual NPC casting, cave/floodplain threat levels, finite town and forage stock, flood timing, permit timing, coin caches and an independent mortuary-relic choice. Early/late autumn contexts change stock and flood constraints; seeds change actual inhabitants, creature levels, funds and relics. The authored topology is stable. No complete regional profile is selected, and runtime movement never regenerates occupants or treasure.

The dossier records the frozen result and package provenance. Deity/tradition IDs are reused rather than independently generating incompatible religious identities in each room. Plant gathering spends actual finite stock; it does not simulate regrowth, agriculture or a food web. See [the authoring account](authoring/serewater-package.md) and [instantiated dossiers](playtests/serewater/README.md).

## Current limits

The campaign is now a playable multi-expedition RPG slice, but not a finished classical RPG. Shops have posted prices and small inventories. Equipment uses flat modifiers and capability slots, without proficiency, AC hit rolls, weight or durability. The magical lantern has no fuel drain. There is no universal use-any-object command, unrestricted dialogue, negotiation, crafting, recruitment or town resurrection service. Grouped room navigation is readable but still text-heavy; art and portraits are limited. Some investigation grants certainty too readily. The Custodian is a useful obstacle, not a sophisticated tactical AI or full factional simulation. Killing it does not yet provoke a larger institutional response.

Independent first-time usability and enjoyment remain untested. These limits do not negate the working loop; they identify where actual play should guide the next work.
