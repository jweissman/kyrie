# Wayfarer: spatial player client

Wayfarer is a separate room-centred player, preserving the Serewater/Lantern client as a reference. It consumes the same `PlaySession`, `PlayerView`, `CombatChoices`, and canonical creature/item state. It has no browser gameplay rules or mocked outcomes.

## Interaction model

The primary surface is a contained space with the company, present people and objects, and visible exits. These tokens are affordances for choosing an actual entity; their arrangement does **not** claim tactical positions or distances. Selecting a token restricts the interaction console to commands whose resolved bindings reference that entity. Selecting a person opens a separate conversation mode. The source of these associations is typed command binding, never label or room-ID parsing.

A root-to-current-place breadcrumb names the plane, region, settlement, site, level and room where those containments have actually been authored. The current place is labelled by its declared scale. Entry history reports the previous committed location. Each exit identifies a movement mode: local walking, entering, leaving, descending, ascending, overland travel or planar crossing. A blocked exit explains the visible barrier; the door remains a separate interactive object, with opening and unlocking commands from the existing rules.

The inventory, company sheet, atlas, journal, conversation and encounter each occupy a dedicated mode. The company’s current health and mana remain visible across modes. Combat presents the current actor, enemy health, abilities with their actual effect descriptions and costs, explicit target selection and a readable resolution log. A suggested move performs exactly one ordinary combat command.

Every exploration consequence is a canonical command. The result receipt shows the attempt, elapsed fictional time, direct result, resource changes, discoveries, observable developments and newly available possibilities. Saves are written only after completed commands; the client exports both the checkpoint and replay. A resumed campaign uses frozen instantiated content.

## Scope and limitations

This is an implemented spatial interaction prototype, not a claim of first-time usability or enjoyable play. There is no independent human evaluation.

- Symbolic person/object tokens establish selectable physical contents, but their visual art and silhouettes are still generic.
- The room surface is schematic. It does not support moving a character to an arbitrary coordinate, and does not pretend to.
- Large groups of related commands can still make the focused interaction console verbose, particularly target-specific healing, gifts and equipment transfers.
- The atlas lists recorded connections rather than drawing a full spatial floorplan. The primary room shows only locally known exits.
- The client only exposes commands the authoritative runtime makes available. It cannot improvise conversation, manipulate an undescribed object, or infer a usable action from a prose noun.
- The physical hierarchy is authored data. Old campaigns without it retain their earlier location metadata; the client does not manufacture a plane or building by guessing from IDs.

Browser evidence is recorded below after the integrated campaign is available. Automated walkthroughs are developer checks of orientation, response and state continuity, not tests of fun.
