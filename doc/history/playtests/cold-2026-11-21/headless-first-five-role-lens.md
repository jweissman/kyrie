# Headless cold plays: first five minutes with an emotional lens (21 November 2026)

## Scope

Three headless cold plays in the same generated world (kahitude), using different starting builds, focused on opening turns only.

- Run 304: human warrior Wenna
- Run 305: elf ranger Elen
- Run 306: dwarf cleric Dori

Method:

- Start each run with scripts/cold-play.sh
- Drive actions through scripts/cold-play/send.sh
- Capture the first 10 to 12 JSONL entries from out.jsonl
- Analyze moments where the player wants something, knows how to pursue it, gets an interesting choice, feels emotion, or hits confusion/waiting/repetition/disappointment

This report prioritizes felt playability signals over defect counting.

## Quick read

The opening is readable and motivating across all three builds. The game reliably gives immediate wants and concrete verbs. The largest first-five-minute weakness is not broken flow, but emotional flattening: role identity barely changes the early feeling, and local charm is quickly submerged by many equally weighted hooks.

## Evidence snapshots

### Shared opening (all runs)

- Arrival frames a social problem immediately (wagon in ditch, wagoner straining).
- Primary actions are concrete and understandable: help, talk, move on.
- Entering Thornhaven expands to many hooks at once (Silverford strongroom, tinker daughter, notice, castellan).

### Divergence by build

#### 304 Warrior (forceful path)

Observed sequence:

- Heaves the wheel out (direct physical action)
- Moves through Asholt to Silverford
- Chooses attack at the gate and enters a fight quickly

Felt pattern:

- Strong agency spike once combat appears
- Clear anticipation and danger in first minutes
- Distinctive class feeling appears only when combat finally triggers, not earlier

#### 305 Ranger (curious and social path)

Observed sequence:

- Talks, bargains for a share, reaches landing
- Talks to tinker daughter, castellan, then reads notice
- Collects layered social/world information before leaving town

Felt pattern:

- Highest coherence for social motivation and world curiosity
- Good pleasure from conversational payoffs
- Mild menu fatigue after several talk outcomes that all feel similarly weighted

#### 306 Cleric (support and prep path)

Observed sequence:

- Talks, bargains, reaches landing
- Reads notice early, then follows travel/social hooks
- Did not surface a strong support or preparation beat in the opening primary flow

Felt pattern:

- Support fantasy is underexpressed in opening turns
- Core feeling is similar to ranger path until later
- Cleric identity is present in system options, but not strongly felt in emotional texture

## Lens findings

### 1) Wants

Present and strong.

- Immediate micro-want: resolve wagon scene
- Immediate macro-wants on town arrival: investigate Silverford, relationships, notices, local politics

### 2) Understands how to pursue wants

Mostly strong.

- Action labels are concrete and readable
- Cause and effect is understandable in opening outcomes

Friction:

- After town arrival, too many plausible next steps with similar visual/structural weight

### 3) Interesting choices

Good at first, then diluted.

- Wagon scene offers meaningful social/moral/economic branching
- Town menu broadens quickly; interestingness drops when options feel equivalent in urgency

### 4) Felt emotion (anticipation, danger, pleasure, surprise, affection)

- Anticipation: high in all runs
- Danger: high in warrior run once Silverford fight starts; low earlier
- Pleasure: moderate from prose and social texture
- Surprise: low to moderate; outcomes are coherent but expected
- Affection: low in first five minutes; not enough reactive bonding yet

### 5) Confusion, waiting, repetition, disappointment

- Confusion: low mechanical confusion, moderate priority confusion (what should matter first)
- Waiting: low in interaction pacing
- Repetition: moderate from repeated inspect turns and broad offer lists
- Disappointment: moderate when role fantasy does not differentiate early enough

## Most important absence of expected feeling

Expected feeling: distinct role identity in the first five minutes.

Observed absence:

- Warrior, ranger, and cleric openings share very similar emotional contour until either combat arrives (warrior) or more extended social detail accumulates (ranger).
- Cleric support identity especially feels delayed.

Likely causes:

- Early hooks are world-rich but role-agnostic
- Build-specific affordances are present but not emotionally foregrounded
- Early rewards acknowledge progress, but not strongly in a class-specific voice

## Opaque/challenging/frustrating moments worth preserving

1. Priority opacity after landing: many good hooks, weak ranking signal for a new player.
2. Role-expression opacity: class differences exist mechanically, but emotional differentiation arrives later than expected.
3. Mild repetition drag: repeated inspect states and dense offer sets can flatten momentum.

## Practical recommendations

1. Add one class-specific emotional beat before the first town fanout.
2. After the first resolved vignette, highlight one recommended next thread with a clear reason.
3. Keep broad options available, but increase salience on one or two strongest leads for first-hour pacing.
4. Add a tiny immediate callback line after opening choices to reinforce personal impact and tone.

## Evidence locations

- Run 304 JSONL: /var/tmp/kyrie/cold/304/out.jsonl
- Run 305 JSONL: /var/tmp/kyrie/cold/305/out.jsonl
- Run 306 JSONL: /var/tmp/kyrie/cold/306/out.jsonl
- Command logs:
  - /var/tmp/kyrie/cold/304_commands.log
  - /var/tmp/kyrie/cold/305_commands.log
  - /var/tmp/kyrie/cold/306_commands.log
