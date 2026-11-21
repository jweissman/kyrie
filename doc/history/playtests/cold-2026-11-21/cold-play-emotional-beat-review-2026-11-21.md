# Cold-play emotional beat review

**Reviewed:** 21 November 2026  
**World:** kahitude  
**Runs:** 404 (human/warrior/Wenna), 405 (human/thief/Wat), 406 (elf/mage/Lira)  
**Lens:** first-five-minutes player experience, emphasizing intent, clarity, emotional texture, and missing expected feeling.

## Question and method

This review does not count defects. It tracks experiential beats in the opening window:

1. when the player wants something;
2. when the player understands how to pursue it;
3. when an interesting choice appears;
4. when anticipation, danger, pleasure, surprise, or affection are felt;
5. when confusion, waiting, repetition, or disappointment are felt;
6. where expected feeling is absent.

All three runs were played headlessly with a cold-play driver and the same decision policy (favor active, non-wait actions). The first eight response rows were used as the opening evidence slice, which covered the first scene interaction and the early handoff toward the Silverford thread.

## Opening beat map (shared across runs)

The opening sequence was highly stable across all three builds:

1. arrive at road into Thornhaven with stranded cart;
2. inspect at 8:00 a.m.;
3. help wagoner (outcome);
4. receive gratitude plus coin/inn invitation (outcome);
5. move to landing at Thornhaven;
6. inspect at landing (8:13 in run 404, 8:40 in runs 405/406);
7. choose strongroom undertaking;
8. map/travel toward Silverford.

This stability is useful for consistency but suppresses early class distinctiveness.

## Findings by requested lens

### 1. Wants

The player gets a clear immediate want:
- resolve the visible cart problem.

A larger strategic want appears quickly at the landing:
- get into the strongroom of Silverford.

Observed effect:
- the strategic undertaking becomes the dominant gravitational center almost immediately, reducing dwell time on local social hooks.

### 2. Understanding how to pursue it

Pursuit legibility is strong in this window:
- labels are explicit;
- next-step affordances are present at each transition;
- immediate payoff follows the first local action.

Observed effect:
- low procedural confusion about what to do next.

### 3. Interesting choice

There is breadth of options at Thornhaven (talks, notice, castellan, undertaking, route options), but practical weighting is uneven.

Observed effect:
- one branch reads as "real" (strongroom undertaking), while adjacent social or local hooks feel sideband;
- the choice set is broad in count but narrower in felt dramatic legitimacy.

### 4. Felt anticipation, danger, pleasure, surprise, affection

Present but muted:
- anticipation/danger are seeded by rumor and ambient lines (predator at sink, hobs, local unease), but mostly as background mention, not immediate pressure;
- pleasure appears in the successful wagoner help and gratitude payment;
- affection/charm appears in surface detail (puppies, dog, harbor life), but with low immediate consequence.

Observed effect:
- evocative prose creates atmosphere, but emotional lock-in is often weak because consequences and social reaction depth are brief.

### 5. Confusion, waiting, repetition, disappointment

Confusion:
- limited mechanical confusion in the opening sequence;
- some cognitive flattening occurs when dense route/menu options appear without stronger framing of "why this now".

Waiting:
- no hard waiting required, but local beats can feel pre-empted by the stronger undertaking pull.

Repetition:
- opening shape is near-identical across warrior/thief/mage;
- class identity has little effect on emotional contour in this window.

Disappointment:
- local hooks feel lower-stakes once the strongroom undertaking is offered;
- decorative charm does not reliably convert into attachment or commitment.

## Absence of expected feeling (primary concern)

Most important absence in this sample:
- **charm without attachment**.

The opening has many ingredients of charm, but the player often does not feel charmed in a durable way because:

1. **Context hierarchy:** the undertaking is introduced with stronger practical weight than local character moments.
2. **Outcome presentation:** local interactions resolve quickly and transactionally (help -> thanks/coins), then momentum shifts away.
3. **Reaction depth:** nearby world/NPC reaction is not prolonged enough to create social memory.
4. **Consequence linkage:** charming details are rarely tied to near-term strategic relevance.

### Applying the old-lady riddle diagnostic

The same failure mode likely explains why an old-lady riddle can feel uncharming, even if text quality is good:

1. wording may be fine, but the player is currently committed to a stronger undertaking;
2. context does not frame the riddle as consequential to current intention;
3. answer presentation may be informational rather than emotionally reactive;
4. the world may not acknowledge resolution with meaningful follow-on;
5. therefore the player experiences diversion, not enchantment.

## Build contrast notes

Differences by build in this opening slice were minor:
- first cart option wording differed slightly between run 404 and runs 405/406;
- mage had extra spell-management affordances in non-primary options;
- primary emotional arc remained functionally the same.

Implication:
- opening emotional differentiation by class is currently low despite systemic differences later.

## Recommendations

### Highest-value short-term changes

1. Add one explicit social callback after the cart help beat (named recognition, changed future line, tiny unlock).
2. Let one local hook temporarily compete with the undertaking by giving immediate practical leverage.
3. Increase reaction richness after small choices (who noticed, who comments, what changed right now).
4. Add class-colored opening beats that alter emotional tone, not only inventory/action affordances.
5. Reframe dense route choice moments with one sentence of intent guidance.

### What to measure in next pass

1. "Charm retention": does a charming beat produce a callback within 2-4 subsequent actions?
2. "Choice legitimacy": do non-main-thread choices receive equivalent consequence density in first 10 minutes?
3. "Class emotional divergence": do first-eight-beat trajectories differ in feeling, not just action catalog?

## Evidence references

Run artifacts:
- /var/tmp/kyrie/cold/404/out.jsonl
- /var/tmp/kyrie/cold/405/out.jsonl
- /var/tmp/kyrie/cold/406/out.jsonl
- /var/tmp/kyrie/cold/404/lines.txt
- /var/tmp/kyrie/cold/405/lines.txt
- /var/tmp/kyrie/cold/406/lines.txt

Key observed early timestamps:
- run 404: 8:00 a.m. inspect -> 8:13 a.m. landing inspect;
- runs 405/406: 8:00 a.m. inspect -> 8:40 a.m. landing inspect.

This report intentionally focuses on experiential interpretation of these traces, not formal defect triage.
