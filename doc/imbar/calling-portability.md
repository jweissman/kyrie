# Calling portability: which voice form fires where

*Audit for `18-engine-spec.md` item 9 and handoff gap 5. Tested by `test/calling-portability.test.ts` (29 tests, green).
No engine change is proposed or made: the portable form is a data rewrite.*

## 1. Answer

* `memberOf(?m, party) and hasCalling(?m, calling_x)` is **portable only to a one-module campaign**. A module's rules say
  `calling_cleric`, which the installer turns into `<install>__calling_cleric`; the party's `hasCalling` facts come from
  `creature-facts.ts:115`, which builds `class -> id` from every `callingkind` entity in the world and keeps the **last**.
  In a campaign of one module that last one is the module's own. In every campaign of several modules, and in **every
  drawn world** (all the provinces plus the link module are installed), it is another module's: observed in a drawn Long
  Man, `hasCalling(region__member_party_2, linkplongman__calling_cleric)`, while the Long Man's rules ask for
  `plongman__calling_cleric`, an entity no member is given. So every `hasCalling` voice in the corpus is silent in a
  drawn world, though all of them fire in their shipped campaigns.
* `memberOf(?m, party) and brings(?m, <capability>)` **is portable** to all three. Capabilities are canonical
  (`module-namespace.ts`), `brings(member, capability)` is projected per member from class skills, background training and
  gear (`creature-facts.ts:133`), and the member's name still prints with `{?m}`. It is what Book of Faces' `hearer`
  query already uses. `capable(party, x)` is the same test for the whole company and drops the name (Gosse's form).
* The price of `brings`: it is a **skill**, not a class. A warrior with a locksmith background brings `lockwork` and so
  speaks the thief's line; a bard brings `lore` and so can speak the mage's. In a company with both, whoever the rule binds
  first speaks. That is arguably the better reading ("whoever can"), but say so in the prose if a line must be the class's.
  Mapping used (class skills in `data/catalog/classes.json`): cleric `rites`, ranger `woodcraft`, warrior `brawn`, thief
  `lockwork`, bard `performance`, mage `lore`, monk `tumbling`.
* `?w != ?c` is not Kyr (entities cannot be compared), so a rule pairing a warrior and a cleric (the Long Man's quarrel)
  cannot say they are two people; with `brings` one member who brings both `brawn` and `rites` would pair with themself.
  Rare (needs a warrior of an acolyte background), left, not fixed.

## 2. Table (adventure, form used, where it fires)

"Standalone" is the shipped campaign. "Fixture" is a campaign with a company of other callings than the shipped one.
"World" is a province installed in a drawn world. *Played* means the voice's own text was seen in a test; *mechanism* means
the test shows the party's `hasCalling` facts do (standalone) or do not (world) name the module's own calling entities.

| Adventure | Form used | Standalone | Fixture (other callings) | Drawn world |
|---|---|---|---|---|
| the-long-man | `brings` (fixed here) | played (all five voices) | played (two companies of three) | played |
| liberty-of-the-ice | `brings` (fixed here) | played | played (mage, thief) | played |
| gosses-company | `capable(party, …)` | played (`gosses-company-voices`) | n/a (4 modules; this is where `hasCalling` failed) | not tested (not a province) |
| the-dorothea | `hasCalling` | played (`dorothea-voices`); mechanism | not tested | **silent** (mechanism) |
| book-of-faces | `hasCalling` and `brings(?m, rites)` | mechanism; existing `ombra-*` tests play it | not tested | **silent** for the `hasCalling` ones (the `brings` ones fire) |
| the-grand-tour, what-tessary-owes, hollins, half-the-hive, quittance, winter-in-carth, patient-star, low-water, house-that-grows, parliament-of-books, let-one-remember, the-lull, hessel, thrume, skeel, quiet-in-the-sky | `hasCalling` | mechanism (each shipped campaign's facts all name its own `<module>__calling_*`); several have their own voice tests (`quittance-voices`, `winter-in-carth-callings`, `low-water-company`, …) | not tested | **silent**: mechanism shown for the Long Man, the Liberty and Skeel; the same code path serves the rest |

Everything marked mechanism is a structural check, not a played voice. A played voice in a drawn world for the sixteen
others is **not tested**; the cause is the same line for all, so a played test would add a province each.

## 3. The rewrite (apply to each adventure's own files; not applied here)

In every occurrence below, replace `hasCalling(X, calling_C)` by `brings(X, CAP)` with:

| calling | cleric | ranger | warrior | thief | bard | mage | monk |
|---|---|---|---|---|---|---|---|
| CAP | `rites` | `woodcraft` | `brawn` | `lockwork` | `performance` | `lore` | `tumbling` |

As one command per adventure directory (it is what was run on the Long Man and the Liberty; every occurrence has a
subject of the form `?m`, `m`, `c`, `r` and so matches):

```
sed -i -E 's/hasCalling\(([?a-z]+), calling_cleric\)/brings(\1, rites)/g; s/hasCalling\(([?a-z]+), calling_ranger\)/brings(\1, woodcraft)/g; \
  s/hasCalling\(([?a-z]+), calling_warrior\)/brings(\1, brawn)/g; s/hasCalling\(([?a-z]+), calling_thief\)/brings(\1, lockwork)/g; \
  s/hasCalling\(([?a-z]+), calling_bard\)/brings(\1, performance)/g; s/hasCalling\(([?a-z]+), calling_mage\)/brings(\1, lore)/g; \
  s/hasCalling\(([?a-z]+), calling_monk\)/brings(\1, tumbling)/g' data/adventures/<dir>/*.kyr
```

Lines to change (grep `hasCalling`; counted by line):

| Adventure | occurrences | files and lines |
|---|---|---|
| book-of-faces | 15 | `revision.kyr` 127, 134, 140, 147, 158, 204, 208, 212, 216, 220, 224, 228 |
| half-the-hive | 9 | `wake.kyr` 11, 15, 20, 25, 29, 51, 60, 87, 111 |
| hessel | 13 | `season.kyr` 22, 29, 33, 37, 41, 45, 49, 53, 57, 61, 65, 78, 86 |
| hollins | 12 | `winders.kyr` 30, 34, 38, 42, 46, 50, 54, 58, 62, 66, 70, 87 |
| house-that-grows | 9 | `slope.kyr` 71, 75, 79, 83, 87, 91, 95, 99, 125 |
| let-one-remember | 10 | `witness.kyr` 13, 17, 21, 25, 29, 33, 44, 67, 75, 108 |
| low-water | 5 | `callings.kyr` 7, 11, 15, 19, 34 |
| parliament-of-books | 10 | `post.kyr` 73; `voices.kyr` 9, 14, 19, 23, 28, 33, 37, 42, 46 |
| patient-star | 5 | `kept_season.kyr` 15, 19, 23, 27, 31 |
| quiet-in-the-sky | 14 | `fellowship.kyr` 10, 15, 19, 23, 27, 37, 51, 59, 67, 68, 76, 84 |
| quittance | 15 | `voices.kyr` 13, 17, 23, 29, 33, 39, 51, 62, 63, 72, 81, 95, 107 |
| skeel | 5 | `tracks.kyr` 12, 25, 29, 33, 37 |
| the-dorothea | 19 | `lamp.kyr` 47, 52, 90, 96, 159, 165, 186; `mangrow.kyr` 260; `voices.kyr` 5, 9, 13, 17, 21, 25, 32, 36, 40, 44, 48 |
| the-grand-tour | 6 | `callings.kyr` 7, 11, 15, 19, 29, 37 |
| the-lull | 6 | `fellowship.kyr` 10, 14, 18, 23, 27, 41 |
| thrume | 17 | `faces.kyr` 48; `voices.kyr` 13, 17, 23, 29, 33, 37, 41, 47, 51, 55, 61, 67, 71, 78, 79; `wages.kyr` 77 |
| what-tessary-owes | 5 | `callings.kyr` 7, 11, 15, 19, 34 |
| winter-in-carth | 7 | `voices.kyr` 9, 15, 21, 28, 34, 47, 59 |

Cautions for whoever applies it:

1. Three subjects are an action parameter typed `member` rather than a `memberOf(…)` on the line
   (`low-water/callings.kyr:34`, `skeel/tracks.kyr:12`, `what-tessary-owes/callings.kyr:34`); `brings` works on members the
   same way.
2. Where a rule needs the **class** and not the skill (the Dorothea's and Quittance's pairs, e.g. warrior and cleric
   together), check the pair still makes sense when one member brings both.
3. The rewrite changes who can voice a line (see §1 on skills): rerun that adventure's voice test with a company that
   lacks the calling, to see it stay silent (the Long Man and Liberty tests do: a mage-only company does not hear the
   thief's board).
4. `brings` is projected per member of a company; `hasCalling` on an authored person (`Calling warrior` on a Person) is not
   a company member's fact. None of the lines above asks that of a person, but do not extend the rewrite to one.

## 4. What was changed here

* `data/adventures/the-long-man/voices.kyr`, `kin.kyr` and `data/adventures/liberty-of-the-ice/callings.kyr`: every
  use of `hasCalling` rewritten to `brings`.
* Tests: `test/calling-portability.test.ts` (standalone, other-calling company, drawn world, for both; mechanism for twenty
  campaigns and three drawn worlds), and the existing `liberty-of-the-ice-callings`, `the-long-man-company`,
  `the-long-man-charter` still pass.
* Spec item 9 can be closed as "docs": the portable form is `brings`/`capable`; `portableCallings` is not needed unless an
  author wants the exact class and not the skill.
