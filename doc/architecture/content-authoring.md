# Declarative content: Deem tables, one catalog, one compile step

Each layer answers one question:

- **Deem** describes and composes content: what a background, a creature family or a settlement's people *are*.
- **Kyr** describes interaction and rule semantics: what can be done, and what follows.
- **Kyrie** applies the rules at runtime.
- **The assembler** connects content into one campaign world.
- **The browser** presents what the rules produce. It never invents rules.

Every kind of content has one canonical representation. There is one transformation boundary: the point where
authored tables become the typed records the runtime reads. Nothing is authored twice, and no generated file is
edited by hand.

## Backgrounds

**Before (until mission 6).** `data/catalog/backgrounds.json` held 24 backgrounds, each written out in full. Orsino's
scores and gold were copied in by hand, then Kyr's meaning was added. The other 191 of Orsino's 215 backgrounds did
not exist in Kyr. One entry:

```json
"hunter": {
  "name": "Hunter", "use": "background",
  "attributes": { "dexterity": 2, "wisdom": 1, "constitution": 1 },
  "gold": 15, "requiredClass": "ranger",
  "skills": ["woodcraft"], "gear": ["rope"],
  "contact": { "channel": "road", "text": "{contact} and {member} hunted the same hills for a season." },
  "source": { "orsino": "background:hunter", "fidelity": "adapted",
    "notes": "Orsino gives stats and gold only; Kyr adds woodcraft (reading animals) and a coil of rope." }
}
```

That was 554 lines for 24 backgrounds. A new Orsino revision changed nothing in them.

**After.** Content comes from two sources, compiled into one catalog.

1. **Orsino's rows**, generated. `bun bin/orsino-registry.ts catalog` writes `data/catalog/orsino/backgrounds.json`
   from the snapshot of Orsino's `backgroundModifier` table. Each row holds scores, gold, required class and
   Orsino's starting gear. All 215 are there.
2. **Kyr's meaning**, as Deem tables in `data/catalog/backgrounds.json`, 285 lines for all 215. Every background
   belongs to exactly one *kind*, a kind says what it means in a Kyr world, and an overlay changes one background
   only where it differs from its kind:

```json
"backgroundKind": { "discriminator": "kind", "groups": {
  "wild": ["hunter", "tracker", "forester", "woodcutter", "gameskeeper", "skinner", "animal_handler", ...],
  "arms": ["soldier", "guard", "mercenary", "sellsword", "champion", ...], ... } },
"backgroundKindMeaning": { "discriminator": "kind", "groups": {
  "wild": { "name": "Wild country", "skills": ["woodcraft"], "channel": "road", "contacts": [
    "{contact} and {member} hunted the same hills for a season.", ...] }, ... } },
"backgroundOverlay": { "discriminator": "background", "groups": {
  "hunter": { "gear": ["rope"] },
  "tracker": { "skills": ["woodcraft", "stealth"], "contact": "{contact} and {member} once trailed a stolen flock across three valleys." },
  "innkeeper": { "use": "profession", "routine": "keeping the inn",
    "offers": [{ "kind": "lodging", "text": "a bed and supper", "fee": 3 }] }, ... } }
```

The hunter is now a place in the `wild` list plus one overlay line, `"gear": ["rope"]`. A woodcutter, a skinner or
a gamekeeper is only a place in that list.

**The boundary.** `BackgroundCatalog.compile` runs when the catalog loads. It is the only code that reads either
source:

- It refuses a background of no kind, one of two kinds, an overlay for a background that does not exist, or a kind
  with no meaning.
- It carries Orsino's starting gear where Kyr has the item, and records each item it lacks as an omission
  (`gear:mask`). The registry reports these omissions.
- It writes each record's fidelity and notes from what Kyr added.

Everything downstream reads the compiled records through `Canon.backgrounds`:

- `Overlays`;
- character creation;
- contacts in generated regions;
- the registry ledger.

The 24 backgrounds that existed before compile to exactly what was written by hand (checked field by field when the
change was made). `test/backgrounds.test.ts` holds the rules.

**Composable by Deem.** The same tables are part of Kyr's Deem setting, so a template can draw a background of a
kind (`lookup(backgroundKind, "wild")`) or ask which kind one is (`findGroup(backgroundKind, "smith")`). A Deem
template never re-states what a background gives.

**Shown by kind.** The creation screen groups backgrounds by kind and leaves out those for another calling. A
calling sees 156 to 169 backgrounds, under fourteen headings, instead of 211 in one list. That is still a long
list; the player redesign should let a player choose a kind first.

## Company formations (party features)

**Before.** Orsino's party traits were imported as ordinary traits. Their formation requirements were dropped in
translation, so no company could ever hold one, and their perks lost their conditions.

**After.** A formation is data on the trait (`"requires": { "company": { "classes": ["cleric", "cleric", "cleric"] } }`)
with typed perks:

- `modifiers`, which are always on;
- `environment` and `weapon` conditions;
- `triggers`: `onKill`, `onLevelUp`, `onOffensiveCasting`;
- `bonuses`: search, gold, loot, spell duration, ability damage.

One mechanism (`Formations`, `Perks`, `PerkTriggers`) recognizes all fifteen executable formations. No formation is
named in code. Player-facing text is generated from the perk's semantics (`PerkText`), so the words are the rule.
See `orsino-semantics.md`.

## What is still written by hand, and why

| Content | Where | Why it is not a table yet |
|---|---|---|
| Ancestries (25 in Orsino, 3 playable) | `data/catalog/ancestries.json` | few enough to read whole; Orsino's ancestry traits are generated |
| Classes (7) | `data/catalog/classes.json` | Kyr adds practice text and skills per class; Orsino's `classModifier` gear and gold are not yet imported |
| Merchant stocks | per-person `Sells` lines in region modules | next: stocks by profile (an outfitter, a chandler), so a settlement's shops come from what the settlement is |
| Creature families | Deem tables already (`data/generation/tables/creatures.json`) | — |
