# Experiential pins, by family

The owner's principle (15 November): Kyr, Deem and the fast lane exist so that recurring qualitative standards can be
encoded as cheap, executable behavioural constraints. The point is not to replace creative judgment with scores. It
is to stop the same obvious failures recurring, so that they no longer have to be rediscovered in person.

The pattern is: **qualitative complaint → reproducible trace → minimal test or measure → root-cause repair → lasting
regression.**

Rules:
- A pin is a floor at or just under an honest baseline. It never passes because filler acts, filler prose, spectacle
  or decorative colour were added.
- Pins read existing state, action and event metadata, never labels or screenshots.
- Where the authoritative projection cannot say what a pin needs, that is recorded below as an architectural gap,
  not worked around.
- Browser and human play stay for judgments that need them.

This page maps the six families to what holds each one now, the honest baseline, and what is missing. Owners: the
playability line holds continuity, density, differentiation and payoff; the prose line holds attention; the lead
holds promise fidelity and locality.

## 1. Promise fidelity

*The complaints:* blue pips with no blue question; "someone is here" who cannot be spoken to; gold that loops; a way
drawn worth a look that leads nowhere.

The chain is world state → observer projection → available act → actual consequence. Each link is pinned
separately:

| Link | Pin | What it stops |
|---|---|---|
| Shown → an act exists | test/small/promises (`Promises.broken`) | a person, way or valuable shown with nothing to do toward it |
| Drawn facet → its consequence | **test/small/promises-kept** (`RunnerFidelity`) | a facet whose act does not bring that kind of change |
| Gold strictness | test/small/gold-* (seven specs) | gold for anything but the followed aim's next step |
| Perceived ↔ drawn, page = terminal | test/small/atlas-perception | the clients disagreeing on what is perceived and how far |
| One projection: page = terminal = runner | **test/small/one-projection** (TB-01) | the clients leading with different acts or meanings from one state |
| A row is called by what it does | **test/small/runner-opener** (PF-02) | a headless row worded as one act and doing another |
| Every facet kept over authored content | **test/laboratory-promises** | any drawn facet on a thirty-turn laboratory walk its act does not keep |

`RunnerFidelity` takes each act the glance draws with a facet and does it in a fresh copy of the world. An opener is
judged by the act inside it that the facet is for. It then reads the event's changes by relation:
- **to gain:** an item becomes a member's, or coin comes;
- **to learn:** `knows`;
- **a companion:** `willing`, `companion` or `memberOf`;
- **a danger:** a hostile's standing or wakefulness changes;
- **worth a look:** somewhere been for the first time, something found out, or the thing itself changed (a tower
  climbed shows the country).

The tiny pin is mutation-checked: drawing an unvisited way as "to gain" fails it in every world where the way
appears. `scripts/promise-fidelity.ts` runs the same check on every turn of curious walks over a1, b2 and c3. Its
baseline is below.

**Gaps (from the atlas study; still `test.failing` in atlas-perception):**
- perception reach per facet;
- a place's sign as a facet;
- the aim's route along known ways.

## 2. Attention economy

*The complaints:* "garlands of whatever is in flower"; "in the grey of the house"; triple narration; prose that is
too much and unspecific.

| Pin | Baseline → now |
|---|---|
| test/small/clause-load (ClauseLoad over the first hour) | 1144 → 1031 |
| test/small/empty-words: indeterminate frames | 304 |
| test/small/empty-words: as-if similes | 89 → 85 |
| test/small/empty-words: stock sentences in more than one table | 10 → 9 |
| Experience matrix: heavy unasked sentences, echoes within five turns | c3: 19 heavy in 30 turns |
| test/small/fight-told-once (BP-02): a fight told once through the runner | each fall once, in the fight's names |
| test/named-held (CO-17): a drawn town names no one who is not there | a1's first town, 76 places; 0 after the smith |

Literary exceptions are declared in data (`"_literary": "<why>"` on a JSON object, `// literary:` above a Kyr line),
never whitelisted in a test.

Promoted with no reason of its own (padded to make four by kind, Offers.scene), in 15 curious turns: a1 1/60, b2
15/60, c3 16/60. Mostly a way to the taproom, a Wait, or a talk, all plausible; on a tiny world with no clock, "Light a
torch" in daylight. A measure, not yet a pin.

**Gap:** nothing yet bounds a promoted act's label or a list's length against what it is for. On b2, nineteen turns of
rumours of the world beyond, one Taklinn topic each, are each promoted as worth a look (the playability line). On c3, 220 of 256
opportunities are only ever in the rest.

## 3. Continuity of intention

*The complaints:* lost in an opening quest; ways lead out, not in; back-and-forth.

- Holding it now: `RunnerWalk`'s lost turns, loops, dead ends and Gate 1 blockers; test/small/gold-thread;
  stones-return; courier-route.
- **Baseline (EX-01):** 241 lost turns in the tier's 42 walks, in five classes by their first turn:

| Class | Turns | Walks | Root cause | Repair |
|---|---:|---:|---|---|
| Unreachable aim content | 85 | 11 | A need line names the obstacle, and nothing projects where its means are | A typed lead from a barred way's need to a known source |
| Navigational confusion | 81 | 13 | The aim's site is marked idle once left (CompanyRecall, to confirm by trace) | A site the followed aim waits on is never idle while the aim is unmet |
| Repeated rooms | 35 | 8 | Inside a site, the unexplored ways are not told from the way back | EX-02: the frontier as a directional sign, not a colour |
| No content toward the aim | 35 | 16 | Mostly the same | EX-02 |
| Missing investigation acts | 5 | 5 | A lookout with nothing to look into | — |

Where no source of a barred way's means exists in the reachable country, that is a world-generation gap, reported as
such. A rope is never placed to please a walker.

## 4. Opportunity density

The experience matrix (`scripts/experience-matrix.ts`, terminal/experience.md) counts:
- facets;
- opportunities by command, led with or buried;
- taken;
- aims seen through;
- acts that changed the world;
- returns that found something different.

Distributions and outliers are read, not means. Outliers being traced:
- c3: 0 returns, 0.3 aims done;
- b2's cleric: 143 opportunities, 0 aims.

## 5. Character differentiation

- **The matrix's identity pairs.** The first baseline's b2 collapse (six callings, one walk) was an instrument defect:
  creation's default race on b2 is a dwarf, and the dwarf's calling step offers only warrior and cleric. Fixed, and
  re-baselined.
- **Paragon pins** (paragon-pins.md):
  - pass: blade, mine, favour, listen at the door;
  - partly: the ranger's mount;
  - failing on purpose: familiar scouting.

## 6. Computation locality

| Pin | Holds |
|---|---|
| test/small/tiny-costs | A tiny world draws no country, composes no world, and installs only its module and the canon |
| test/journey-kept-once (AX-05) | A journey keeps the game once, not after every leg (four legs had kept it five times) |
| test/working-set (push lane) | Between 100 and 6,400 rooms: starting under 3× the facts ratio, looking again under ×5, acting under ×5 |

Baseline, `scripts/scale-costs.ts` on 14 November (clean runs; one run under load read 3 s and 907 MB and was
noise):

| Rooms elsewhere | Start | First observe | Act | Observe again | Heap |
|---:|---:|---:|---:|---:|---:|
| 0 | 523 | 63 | 24 | 31 | 25 MB |
| 1,000 | 956 | 102 | 14 | 45 | 46 MB |
| 4,000 | 934–994 | 217–220 | 22 | 77–90 | 131–157 MB |

**Gaps:**
- The first observation still grows with the world: it builds the module's `Operators`.
- Looking again has a long tail of per-entity scans (loading-boundaries.md).
- `canTrain` is written for every declared ability a member has not learned, a dragon's breaths included, once they
  have 20 experience. Play is unaffected because `teaches` gates every lesson, but it is a world-sized fact set per
  member, and it is noise in every event's changes. Narrowing it needs care: `teaches` is asserted by rules
  mid-play.

## Promise fidelity over generated worlds: baseline

From `scripts/promise-fidelity.ts a1,b2,c3 15`: a curious ranger walk of 15 turns on each world, every drawn facet
on every turn done in a forked world. Counts are facet appearances kept of those drawn. `TRACE=1` prints each broken
one's why, command and changes.

| World | Knowledge | Companionship | Worth a look |
|---|---:|---:|---:|
| a1 | 15/15 | — | 9/15 |
| b2 (before → after PF-02) | 5/8 → 8/8 | 3/3 | 8/15 → 11/15 |
| c3 (before → after PF-02) | 5/8 → 8/8 | 3/3 | 8/15 → 11/15 |
| laboratory (30 turns; danger 1/1) | 6/6 | — | 15/18 |
| laboratory after PF-03 (play-15; danger 6/6) | 6/6 | — | 19/20 |

The traces gave three classes:
1. **The runner's opener (PF-02, fixed).** "To the old corn-store — look at the corn-store padlock" was done by its
   first act, a push. On the page the look opens onto its tries; headless clients pushed under the look's words.
2. **The `held` why (PF-03, the playability line).** Inside a manor, the way back out to the visited forecourt is
   drawn silver from every room. On a1, Eogan's topic about the acolyte changes nothing typed. Both are drawn for an
   aim heard of and not followed. The projection does not say which aim, so the promise cannot be checked: an
   architectural gap.
3. **The restore itself is faithful.** A restored save and the live session give identical changes for the same act;
   the travelling circus moving on at the morning hour is the world's own ticking.

The laboratory's three breaks are `held` too: two ways out of the undertown to the landing, and "To the corn-store
cellar", which is led as a retreat (its best why) and still drawn silver by a `held` beside it. It reproduces PF-03 in
4 seconds. No payoff was drawn in any walk, so that facet is held by the tiny pin alone so far.

After play-15 (the `held` why never on a way out), the walk goes deeper. Its one break left is the held topic at the
black candle (play-16). Two refinements to the instrument:
- **A check is judged apart.** Its promise is its success's, and a copy of the world replays one roll: "Lever the
  lettered flag up by main force · unlikely" is listed as chance (the act's operator resolves by `check`), not
  broken.
- **Danger met includes a hostile's standing toward the company.** Talking a band round is `tolerates` on success and
  `warned` on failure, kept either way.

**Gap:** the projection carries a check's odds only in its words ("· unlikely"), never typed on the promoted act, so
a client or pin reads them by the operator, as this one does, or by label.
