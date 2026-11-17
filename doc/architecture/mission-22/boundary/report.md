# BX-01: the setting/framework boundary, tried (17 November 2026)

Written for the owner, from the register agent's investigation (its harness refused it the file; the lead set its
report here as given). The commission is `../boundary-brief.md`. Code, fixture and specs: `test/fixtures/boundary/
tethys.kyr`, `test/small/boundary-tethys.test.ts`, `test/small/boundary-leaks.test.ts` (on main at 1eb089c2).

## 1. The boundary map

**Setting-neutral already.** The Kyr parser (it reads no `data/`); `Kind`, `Person`, `Observe`, `Objective`, `Topic`,
`Pursuit`; passages with `taking N hours` and one travel system; `Resolve check`, measures and `quantity`; persistence
in shape (`CampaignSave`, `Transcript`); the frontier, which only its hosts attach.

**Fixed to Westernesse/Orsino.**
- **People:** ancestry × class required (`src/content.ts:63-64`, `src/rules/creation.ts:41`,
  `src/campaign/company-choices.ts:17-21,48`); `calling_*`/`ancestry_*` hand-copied into `data/rules/core.kyr:124-134`;
  a module's `Kind` can only be a kind of item.
- **Capabilities and checks:** a check rests on `Canon.skills` (`src/rules/checks.ts:18`); capabilities granted only
  from the catalog or `granted` (`creature-facts.ts:165`).
- **Catalogs:** `src/canon/canon.ts:1-30` imports about 30; the compiler imports Canon (`module-compiler.ts:3-4,281`);
  the canon vocabulary registers itself on import (`canon-vocabulary.ts:19`).
- **Light** by catalog grants (`ui/illumination.ts:23`).
- **Place kinds** a closed set of eight with fixed parenting (`src/spatial.ts:5,146-149`); exit modes and their times
  fixed (`spatial.ts:10,24`).
- **Time:** 10 minutes a watch, an 8 a.m. start, night 21–6 (`campaign/fictional-time.ts:4-41`); Imbar's months
  (`calendar.ts:5-37`).
- **Money and food:** a shared `gold` required (`module-installations.ts:162-165`); the purse says coin and rations
  (`ui/screen-model.ts:80-82`).
- **The canon** installed into every world (`campaign.ts:113`, `canon-install.ts`); the shared `world` rules always
  load (torches, faith, spell circles, the six qualities).
- **Reserved names** (`engine-owned.ts:8-12`): `dark`, `untilLight`, `untilMorning`, `season`, `hasCalling`,
  `hasAncestry`, `canCast`, `proficient`, `canTrain`.
- **World generation:** all of `src/world/*` writes fantasy Kyr nested `within imbar`.

## 2. The tiny science-fiction campaign: Tethys

Halcyon Station (a docking ring, a concourse, operations) and the surface of Tethys IV (a landing pad, a survey outpost
of two rooms), both within the Tethys system: two nested scales, joined by one six-hour shuttle passage on the
platform's own travel. The outpost has gone silent; bringing its core back up is a check that finds a seismic fault
under the planned colony; the company reports to the operations chief and sells the log to a broker for 65 credits.
`test/small/boundary-tethys` plays it by the labels a player sees, and holds that the world contains no Imbar (no
planes, no Dun Rì, the system in no plane).

What it could not do: its character must be a catalog human warrior; its check rests on the catalog skill `mending`;
its money is `gold`. Those are the leaks below; nothing was renamed to fake them.

## 3. Verified leaks

L1–L6 are pinned in `test/small/boundary-leaks` as `it.failing`; each passes the day its leak is repaired.

| | leak | smallest general repair |
|---|---|---|
| L0 | The canon goes into every world | **Landed:** a campaign manifest may say `"canon": false`; `CanonInstall.first`/`.before` skip it, the campaign keeps `canonless`; `SingleModule`/`Tiny` take `own: true` |
| L1 | The company can only be catalog ancestries × callings; a module cannot declare a kind of person | A third `LocalCatalog` family beside items and species: a module's own person kinds and callings. Medium: a recommendation |
| L2 | A calling's kit is given regardless of setting (a battleaxe, torch, candle and ten-foot pole on a station) | Only the campaign's or party's own gear where the campaign says so. Small |
| L3 | The clock has a sun ("Wait until dark" in a sealed docking ring) | A campaign may declare no night, the waits reading `dark()` follow it; month names become data. Small |
| L4 | Money is `gold` and the purse says coin | The purse reads the currency's own name. Small |
| L5 | A check rests on catalog skills | A module capability may name the quality it rests on. Small grammar |
| L6 | The shared rules carry canon names (Plane Shift remains without the canon) | Move `canon.kyr` out of the `world` rule set, once its dependents are checked. Small |

Not leaks: the closed place kinds did not block Tethys (a station a settlement, a surface a wilderness, an outpost a
site), costing only words until a campaign needs a fleet or a moving ship; the frontier is cleanly optional.

## 4. The anthology

| form | capability it pushes | what it will likely ask of the platform |
|---|---|---|
| Minimal perception: a blind cellar crossed by sound and touch | perception without sight | observations typed by sense, light/dark one sense among several |
| Investigation: a death at the Salt Quay, testimony that disagrees | knowledge as evidence | provenance on facts and contradiction between them (OA-10, US-07) |
| City institutions: a petition through the Llys, Judges and Exchange | institutions as actors | an office/holder/grant construct, CR-01's knighthood the first case |
| Strategic opposition: a rival company racing for the same barrow | an adversary with goals and a plan | Pursuit with planner budgets and visible traces (SP-06, US-12) |
| Resource-sensitive travel: the winter road over Larum with three mules | supplies, weight, weather and day length as one budget | route cost by load and weather (NM-06), supplies by kind |

Tethys is a sixth form, another setting, and pushes L1–L6.

## 5. Recommendations

- **Fatigue: not now.** Weariness after 18 hours awake (`needs.kyr:4-19`), hunger and injuries already press on rest;
  light and food are the expedition decisions players feel. Measure first on the winter road: rests caused by
  weariness against rests caused by light or food; add exertion only if it would change a choice.
- **City institutions.** Done: the canon city's first office, the royal game-warden (CR-01). Next: a small institution
  construct (offices, holders, grants, standing that people's topics read) from the canon's seven powers, CR-02
  reconciling the two cities first.
- **Strategic adversaries: longer-range research.** One rival company first: one goal on the same clock, its plan run
  by the planner at a budget, its moves leaving traces.
- **The economy of new capabilities.** Verbs and places open today through levels and lessons once earned (lessons now
  say what earns them), tools (`PartyCapabilities.tool`) and lights, companions' capabilities, knowledge (`leadsTo`,
  ways that open `when knows`), and access held as a fact or a key (`keyholder`, the warden's register). Gaps: in
  starting towns no aim points at a teacher; the canon city has no grants yet. Immediate: let an aim's successor be a
  lesson or a tool. Longer range: an institution's grant as a verb (a licence that opens a trade act).

**Immediate versus research:** L2–L6 and successor-to-lesson are small and general; L1, the institution construct,
adversaries and a designed progression ladder are longer-range.
