# AT-09: an opportunity profile of the held drove

An analysis for the owner (directions of 19 November, §1–2). It reads source and runs probes. It changes no code, data
or specs. It was read at `wt-m21` 7e92d1e5a. The probes, reviews and outputs are in `/var/tmp/kyrie/m22/probes-at09/`.

## Summary

- **The adventure.** The held drove (`data/goings-on/iscoed-drove/situation.kyr`) is the first scenario on iscoed's
  golden route. It has the clearest authored structure of any scenario on the route: it has a story sheet
  (`doc/architecture/mission-22/story-sheets.md:8-42`), and ST-02's prescriptions are now in its source.
- **Profiles can be built today, but not automatically.**
  - `kyrie review` is the best instrument for side (b), what the engine can demonstrate. Along one played line it
    records every offer with its aspects, every change with the rule that made it, the facts learned and the aims taken
    and dropped.
  - `inspect --dependents` gives the consequence graph statically: which acts write an outcome, and which rules
    downstream (the sea-gate's) read it.
  - Together the two answered five of the six questions for every segment, by hand, from four played lines and five
    symbol queries.
- **The largest gap is not in the Atlas.** It is in what the engine can see of the choice itself.
  - **Alternatives that are shut are invisible.** A closed way is not offered, and nothing records that it was ever
    possible. Of the five authored ways to free Bran:
    - one cannot be offered in the first hour (pay the fine);
    - two are closed by following the gold (the ink is withdrawn once the drowned beasts are found);
    - on the CLI's seed, a single check, whose die came up 2 for every solo hero I tried, closes the same two.
  - No instrument reports any of this.
  - **What the player learns from prose alone is invisible.** Mardle's fear, the scenario's opposing claim, changes
    no fact, so the review's `learned` list is empty at the scenario's turn.
- **The Atlas aspects say why a row is led, not what it means.** They are right for the inquiry: knowledge for a
  question that teaches, undertaking for the aim's step. They are flat at the crisis.
  - Four of the five ways out carry the same `knowledge, undertaking` mark, and the fifth is never shown.
  - Their blue comes from an incidental side effect: each act teaches `road_west`.
  - Cost, the sale's clock, the clerk's family and the irreversible ruling carry no aspect. Payoffs are drawn as
    exploration.
- **Two small additions would make the profile mostly automatic** (§4):
  1. `review` takes `--roll`, and records each frame's led reason and the rows withdrawn since the frame before.
  2. `--why fact` on a fact that does not hold names, for each writer `--dependents` already finds, the first
     condition it does not meet.

## 1. How it was probed

Four lines were played as warrior Wenna on `--world iscoed`, and two more were played by label:

| Line | What it is | Kept as |
|---|---|---|
| A | cold play 6's opening: drowned beasts, shown at the counter (`show_drowned`) | `rev-a/` |
| B | the ink first, then before the reeve; failed at the check, then played with `kyrie play --roll pass` | `rev-b/`, `rev-b2/`, `play-b-pass.txt` |
| C | drowned beasts before the reeve (`before_reeve`), the sale, back to the landing | `rev-c/`, `glance-c.txt` |
| D | the drove watered, then wait and watch through Mardle's clock | `play-c-wait.txt` |

The other evidence:
- `--dependents` on `mardle_shown`, `mardle_paid`, `reeve_ruled`, `turned`, `halved` and `road_west`
  (`dependents.txt`);
- `--why fact drove__turned(drove__clerk)` (`why-turned.txt`);
- `scripts/first-quarter.ts --origins drove`;
- `scripts/boredom-census.ts --seeds iscoed`;
- cold plays 6 and 7.

`glance-whys.ts` is a 30-line probe that prints, for each frame, the glance's led acts with their `why`, facets and
aspects, and every witness `Attest.index` issues for a drove row.

## 2. The profile, segment by segment

(a) is what the author intends: from the source, the sheet and the comments. (b) is what the machinery demonstrated.

**1. The hook on the landing** (`held_sight` :27, Owain :48-50, `held_aim` :191)
- (a) A drover held, the boy waiting, the bawling of beasts nobody has fed; the tally-stick at your feet.
- (b) Every part of it is demonstrated:
  - `held_sight` teaches `held`;
  - Owain is led (`why=named`, undertaking + knowledge) once the aim is followed;
  - the review gives his answer to `drove__owain_count_t` exactly, and the move to the pens to the `owain_to_pens`
    rule.
- **Gap.** None worth naming. This is the Atlas at its best: the meaning (a kinsman in trouble), the evidence (the
  sign and the greeting) and the act (ask the boy) line up.

**2. The inquiry: three counts, the ink, the ditch** (:64-75, :81-94, :60-62)
- (a) Contradicting testimony that can be tested. The story sheet's turn (4) is Bran's "not the Rì's tenth", which
  turns a miscount into a fraud.
- (b) Each topic that asserts a fact shows in `learned`, and each one's row is blue. "Search here" is
  `knowledge, undertaking`. The ink carries honest odds in its aside ("unlikely · one try"; cold play 7 praised this,
  `cold-7-report.md:20`).
- **Gaps:**
  - **The turn is unsignalled and undemonstrated.** `clerk_short_t` (:92) and `clerk_fear` (:167) assert nothing.
    Their rows carry no aspect, and the review's delta is only `said_clerk_fear()`. No instrument can tell that the
    player has met the opposing claim.
  - **An alternative closes silently.** `read_book` requires `not knows(actor, found_drowned)` and `not counted`
    (:83-84), but the aim leads to the ditch first (`held_rhyne` :198). In line A the ink row was never offered at
    the counter. In lines B and B2 the check failed, and the row vanished, with `counted` the only trace.
  - **The die is fixed on the CLI's seed.** It is keyed on the seed, the skill, the actor id and the act
    (`src/rules/checks.ts:103`). It came up 2 for all four heroes I tried, and again when Bran was asked first (the first-quarter walk tried it at step 2 and failed too), so on that seed, by the gold
    route or not, the ink is closed to a solo company that cannot make 13 with a 2.

**3. Mardle's clock** (`sale_cried`, `buyer_comes`, `half_sold` :161-165; `sent_north` :206)
- (a) ST-02's moving actor: warning, deterioration, crisis. Delay changes who has what.
- (b) Line D shows the paper nailed up at dusk and the buyer from Wrackham, both as `says` lines. `--dependents halved`
  shows the cost: the sale pays 2 coin rather than 4 (:151-152, :159-160), and the pens' prose changes.
- **Gap.** The risk is present but unsignalled:
  - no row bears `danger` or the `urgent` facet;
  - no aim names the sale;
  - "Water the drove" (:192) is drawn as exploration (`why=own`), although it is the one thing to do for the beasts
    while the clock runs, and it changes nothing but prose.

**4. The crisis and the choice** (:95-138)
- (a) The sheet's three endings that mean different things: expose him, pay and keep quiet, the drowned four only.
  The source now has five acts, at the counter or before the reeve.
- (b) What each way reaches, statically and by play:

| Way | Offered when | Its mark | What it leaves (`--dependents`, played) |
|---|---|---|---|
| pay the fine (:95) | 12 coin; the company has 6 | never seen | `mardle_paid` → the gate's `ifan_warned` |
| drowned, at the counter (:102) | `found_drowned` | knowledge | Mardle kept; `heard_kept` |
| ink, at the counter (:108) | `altered` | (not reached) | `turned`, `mardle_shown` |
| drowned, before the reeve (:124) | on the green, `found_drowned` | knowledge, undertaking (`why=advance`) | `reeve_ruled` → `heard_ruled`, the gate's `reeve_mardle` |
| ink, before the reeve (:130) | `altered` | (reached only with `--roll pass`) | `turned`, `mardle_shown`, `mardle_gone` → the gate's `prowling_early`, `ifan_unpaid` |

- **Gap.** The meanings are authored, and the graph proves they reach the sea-gate (`iscoed-gate/situation.kyr:111,
  113, 275-277`). At the moment of choice, however:
  - the rows are marked alike, and their blue is what each teaches (`knows(actor, road_west)`), the same for all
    (`src/ui/promotion.ts:372-374`, `src/presentation/aspects.ts:35-39`);
  - the only evidence of the difference is the aim's words: "at his counter or before the reeve" (:199);
  - the review cannot show a way that was not offered, and the first-quarter walk takes the quietest way (the drowned
    beasts at the counter, step 9) and leaves town at step 10.

**5. The aftermath** (:141-185)
- (a) Bran out; the drove sold and the coin; the keeper's loaf; Mardle's family on the quay; what the waterfront says.
- (b) The review attributes each change exactly:
  - `share_whole`: `quantity(party, gold)` 6 → 10;
  - `bran_thanks` and `owain_goes`;
  - on the ink path, the handcart line from `mardle_gone`.
- **Gaps:**
  - **Weak signals.** "Help Bran take the drove to the sales" is drawn as exploration (`why=own`), although it is a
    payoff. `keeper_after` (:173) gives a ration with no aspect.
  - **Inconsistencies nothing can detect.**
    - The pens still say "Bran ap Ifor, … held behind the customs-house grille, is here", because his role is fixed
      at :46.
    - On the ink path Bran pays "for the four you found" (:151), though nobody found them.
  - The engine can attribute a line but cannot judge it.

**6. What opens afterward** (`road_west` :18; `bran_west` :182; `owain_after` :52)
- (a) "Come up the pass": paid sword work in Brynach, Owain's "You could come".
- (b) `--dependents road_west`: it is read only by `bran_thanks` and as the gate's `freedword`. No objective reads it,
  no aim is taken, and the two invitations carry no aspect.
- **Gap.** Cold play 6 found the same: "Brynach made no aim … no visible route" (`cold-6-report.md:18, 43`). The
  possibility is announced in prose and absent from the model. The real onward possibilities (the sea-gate's reading
  of how Mardle was handled) are present and unsignalled until they fire there.

## 3. What the Atlas says, and of what

The meaning of a situation, the evidence for it and the actions in answer separate cleanly in this scenario. The
Atlas covers mostly the third, and only by why a row is led.

**Meaning** (a fraud with a frightened man behind it, a clock, a ruling that costs a family its home)
- The engine holds this only as facts written by acts (`turned`, `reeve_ruled`, `halved`). No aspect speaks of it.
- That is right for the Atlas. Doctrine says the world repays attention, not that it pre-labels moral weight.
- It means, however, that cost and irreversibility have no carrier at all. `danger` is for fights, traps and lurkers
  only (`aspects.ts:13, 38`).

**Evidence** (the bawling, the open grille, the paper on the door, the handcart)
- This is carried by Observes and `says` lines. Signs are drawn as exploration and teaching as knowledge
  (`aspects.ts:18`): **the right signal** where a fact is taught (Owain, the ditch, the notice).
- **Significance is present but unsignalled** where the evidence teaches no fact: Mardle's fear, the sale cried.

**Actions**
- **Undertaking and knowledge are the right signals** for the inquiry's steps.
- **They are a weak signal at the crisis**, where four ways share one mark that witnesses a side effect.
- **Exploration is a misread** for the two acts of care (watering the drove, driving it to the sale), both `why=own`.
- **The Atlas's actual record.** A witness carries only id, aspects and kind (`src/presentation/attest.ts:17-23`). The
  reason (`why`, `note`) and the Kyr declaration that made the row worth leading are dropped before anything outside
  the glance can read them. `Attest.why` (`attest.ts:133-138`) says only whether a row is attested.

## 4. Can the machinery support the experiment? What would make it automatic?

**Yes, by hand, in an afternoon.** What each instrument gave:

- **`kyrie review`** (`src/cli/review-tool.ts`): invitations, discoveries (`learned`), lasting change (`delta.by`
  with makers, measures) and the aspects of every row (`review-frame.ts:83`), on one line at a time.
- **`inspect --dependents`** (`src/cli/why-dependents.ts`): the consequence graph across modules, writers and
  readers; the whole of question 6, and the "conditions, sources and resulting changes" of the Studio view, one
  symbol at a time.
- **`inspect --why fact`**: why a fact holds. On one that does not, it said only "holds: nothing of it … no step
  changed it" (`why-turned.txt`): not which writer was shut, nor by what.
- **`first-quarter.ts`**: which way a gold-follower actually takes (the quietest). Useful against (a).
- **`boredom-census.ts`**: region totals, with no scenario attribution. It said nothing about the drove; it is not a
  profile tool.
- **Cold plays**: the only evidence of what a player noticed and wanted (Brynach, exposing Mardle).

**Two small additions to existing tools:**

1. **`review record --roll pass|fail`, and two fields per frame.** The flag is already parsed (`play-tool.ts:14, 51`)
   and applied in `PlayTool.main` (:102), but `JourneyCapture.start` (`journey-capture.ts:33-34`) never calls
   `j.roll`, so a review cannot reach a branch behind a check. The two fields:
   - `ReviewChoice` keeps the led row's `why` and `note` beside its aspects (`review-types.ts:24-25`; the glance
     already has them, `glance-types.ts:67-100`);
   - each frame lists `withdrawn`: the rows of the frame before that are gone though not taken.

   With these, sides (b) and Atlas for every segment come out of one artifact per branch. Withdrawn rows would show
   the ink's closing at the ditch and at the failed check, exactly where the player loses an alternative.

2. **`--why fact` on a fact that does not hold names its writers' first unmet condition.** `WhyDependents.uses`
   already finds the writers (`why-dependents.ts:68`). Asking each one's `Requires` of the world as it stands, part by
   part, and naming the first that fails would answer "why can't I expose Mardle now?" with
   `read_book: not knows(party, found_drowned)` and `pay_fine: quantity(actor, gold) >= 12`.

   Run for a module's outcome facts (its `exports` with role `outcome`, `module.json`) at the end of a review, this
   is the profile's alternatives-and-costs column, and the seed of the Studio's omniscient view. It needs no new
   grammar: it is the scenario's own exports, its own conditions and its own readers.

Neither addition is a quota, and neither labels meaning. A quiet act that teaches nothing and changes the clerk's
standing would show as just that: shut, open or taken, with the readers it reaches.
