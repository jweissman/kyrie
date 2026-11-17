# Morgren: the family that was not one (PA-03, Phase A §3)

The owner's browser play, 17 November: a dwarf **Morgren** came home to his brother, also **Morgren**; the brother
had a surname and the protagonist did not; and the name step offered two names a page, about two pages.
(The data spells it *Morgran*.)

## The reproduction

The headless starts first tried (a1, kite, thorn) are human countries, where most dwarf names are free; in b2, on
main at ab07177d, the drover is not placed in the first country (a kin start there has no drover\_\_son). The defect needs a dwarf country: **wren** (mountain, dwarves). Through the engine's own
creation and start path, as the page drives it:

```
EngineHost.handle({ kind: 'world', seed: 'wren' })
creation: you dwarf, calling warrior, presenting he        (no name written: the default)
EngineHost.handle({ kind: 'set-out' })
```

On main at ab07177d:

| | name |
|---|---|
| protagonist (the name creation offers first, and the only one) | Morgran |
| drover\_\_son, "your brother" | **Morgran Torunn** |
| drover\_\_wife, "your mother" | Brannoc Holderhek |

The same through `WorldAssembler.assemble('wren', …, { origin: 'kin', party: [{ name: 'Morgran', raceId: 'dwarf' }] })`
and `PlaySession.start`: the browser path does not differ. Written by hand as Adrik, the brother is still Morgran
Torunn and the mother still Brannoc Holderhek.

## The minimal cause

Three things, one root: **no family model**. Each of the drover's family was named by a generator of its own.

1. **The name step's depth.** `ProtagonistNames.drawn` offers a people's names for a presentation minus the names the
   country's settled folk have (`Outfitters.everyone`). Dwarves had ten men's names (folk.json). In wren, nine of them
   are some townsman's, so a dwarf man was offered **one** name, Morgran; in thorn ten (two tables of five). That
   is the "too few": the pool, not only the page.
2. **The brother's name.** The drover's son was named by `FantasyRules.another(drawn, taken, folk, 'he:drover_son')`:
   a dwarf man's given name nobody in the country has, the protagonist's own among those (`WorldAssembler.folk`
   passes it in `taken`). In wren every one of the ten was taken (nine by townsfolk, Morgran by the protagonist), so it
   fell back to `apart`, which picks a given name by hash (Morgran) and, that string being taken, adds a family name
   to make the string unique: **Morgran Torunn**. The guard was against equal *strings*; "Morgran" ≠ "Morgran Torunn".
3. **The family.** The family name was a disambiguating suffix, not the family's. The mother, named by another call to
   `another`, got Holderhek from the same fallback with a different hash; the protagonist, whose name the page
   writes, had none. Three people, three surnames or none: not a family. (Thorn's elf mother and son had both been
   Lia before; the fever's mother and sister could still both be drawn one name.)

## The fix

**One model, setting-authored traditions** (`src/world/family-names.ts`, `data/generation/scenes/naming.json`).

- `naming.json`'s `traditions` say, per people, what a family is known by (`line: family`: one of its people's
  family names from folk.json, a married-in parent's too; `line: father`: each one's father's given name) and how one
  of it is called, per presentation, as a template of `{given}`, `{family}`, `{father}`. Human, dwarf, elf, gnome and
  halfling families share a family name ("Travok Strakeln"); catfolk and birdfolk are called by their father ("Coal
  son of Clay", "Kestrel daughter of Godwit": the mother by her own father). The engine knows only these words, not
  any people's convention.
- `FamilyNames.household({ key, people, roster, taken, own })` draws a whole family at once: its line first, **by its
  key alone** (the town and the story, "<town name>:drover") and the protagonist's name, never by who else lives in the
  country, so that the world and the story it places the protagonist in always agree on it; then each member's given
  name, of their people and as they present, **none another member's**, and none the country's people have while any
  name of their people is free. Different people may share a name; a family's members may not.
- The stories that cast a family call it from Deem: `kindred(taken, folk, '<key>|<part>|<roster>', own)`
  (`data/goings-on/drover/templates.json`: "she:wife:elder he:son"; `fever/templates.json`: "she:mother:elder
  she:sister").
- The protagonist the kin origin places in the drover's family is called as the family is
  (`Origins.protagonist`): Morgran comes home as **Morgran Strakeln**, to a mother Mardred Strakeln and a brother Travok
  Strakeln. A name written with a family's (Morgran Stonehelm) gives the family theirs: Mardred and Travok Stonehelm.

After, wren, the same creation: Morgran Strakeln, mother Mardred Strakeln, brother Travok Strakeln. Kite's Harbek:
Harbek Torunn, Eldeth Torunn, Fargrim Torunn. Thorn's elf Lia: Lia Xiloscient, Mialee, Aust. Thorn's catfolk Rook:
Rook son of Clay, Coal son of Clay, Amber daughter of Fang.

Pinned by `test/family-identity.test.ts`: four kin starts (wren dwarf with the default name, thorn elf, thorn
catfolk, a1 human) and a written surname, each failing on main (wren: two given names of three alike; the rest: the
protagonist has no line); and the model alone over every people, forty families each, in a country where every name
of theirs is someone's.

## Name depth

`naming.json`'s `more`: names of each people's beyond folk.json's, offered after them and given to families. folk.json
is not changed, so no country's townsfolk are renamed.

| people | she | he | they |
|---|---|---|---|
| human | 40 → 60 | 40 → 60 | 8 → 14 |
| dwarf | 10 → 32 | 10 → 32 | 3 → 9 |
| elf | 10 → 31 | 10 → 31 | 3 → 9 |
| halfling | 10 → 31 | 10 → 31 | 3 → 9 |
| gnome | 8 → 29 | 8 → 29 | 3 → 9 |
| catfolk | 10 → 30 | 10 → 30 | 3 → 9 |
| birdfolk | 10 → 30 | 10 → 31 | 3 → 9 |

Offered to a protagonist (`ProtagonistNames.drawn`): the folk's names nobody here has, in their order as before (so
the default name is unchanged wherever one was free), then the deeper names nobody here has, in an order of their own.
Offered (she / he / they) on main and now:

| seed | dwarf | elf | catfolk | birdfolk | human |
|---|---|---|---|---|---|
| wren (dwarf country) | 2/1/4 → 24/17/48 | 10/10/23 → 31/31/71 | 10/8/21 → 30/28/67 | 5/5/13 → 25/26/60 | 40/40/87 → 60/60/133 |
| thorn | 10/10/23 → 32/32/73 | 10/10/23 → 31/31/71 | 10/10/23 → 30/30/69 | 10/10/23 → 30/31/70 | 29/32/68 → 49/52/114 |
| a1 | 10/10/23 → 32/32/73 | 10/10/23 → 31/31/71 | 10/10/23 → 30/30/69 | 10/10/23 → 30/31/70 | 31/27/64 → 51/47/110 |

What the page should show (the page is the lead's): the whole list, not six; a dense grid or columns of
names (two dozen fit at once on a phone at the name step's type size), the folk's first; a roll that shuffles
or pages by a screenful; the editable field, as now; and, for a kin start, the family name the world gives
(`FamilyNames.household(...).you`, or the set-out's party name), so the player sees "Morgran *Strakeln*" before
setting out, and may write another surname, which the family then takes.

## §8: a protagonist in a household

The tiny proof follows in its own commit (PA-08).
