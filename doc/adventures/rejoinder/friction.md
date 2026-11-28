# Rejoinder: friction

## Creative intent

The corpus had no wonder-tranche (`bin/kyrie suggest adventure`: 0 of 41). Rejoinder's wonder is the Reply, a canyon that returns what is shouted into it after a year, and it is meant as an arrival and not a spectacle: a mile of voices going by in the dark, each to its own doorstep. The play is about what lands where, and on whom. Nobody is a villain; a drunk, a proud man, an angry woman and a shy one. The company's gift is that, being strangers, it may say what the village may not (forestalling).

I first drafted a walking orchard and dropped it on finding Windfall had one; the Reply came from reading the corpus for what it lacks (no echo, no delayed speech, no courtship by canyon).

Connections: it reads the long campaign's `ash_count_begun`/`ash_broken`/`ash_triumphs` (a tally-sergeant arrives at the Rim gate if the count has begun, and the Rim's custom of wool turns him), and it is a new province of the generated world. It adds no world event: that would edit the global registry, which the brief forbids. A "the Reply returned its year" event would let neighbours read it.

## What works

- The good night plays end to end (journey 3): Orla's two voices, Amos's list and Wat in the dark, the proposal landing on the right two people, Ines's word.
- Time does the work. The company has one body and a night; the returns are at fixed watches (87/89, 92, 97, 120), so preparing by day decides what a night can hold. Orla has exactly one watch in which a hand on hers matters.
- Every thread has a cheaper, worse way and a harder, better way, and the worse way is not a dead end: wool (never knows there was a second voice), walking away (hear it on the floor of the Reply, tell her at her kitchen), Wat on the road (tell him what the list meant).
- Moral weight lives in small things: forestalling is allowed and costs only opinion; Tobe may be let to break his trade's silence or spared it.
- Deem dice (`(1d6)` at install) vary the stray word at the Brink, three Rim voices, and the stranger's voice at the company's own cairn. These are texture, not structure. See below.

## Tested (test/rejoinder.test.ts, 11 passing)

lint; arrival; the whole good way ending `sixty_one`; wool path ending `wool_night`; Orla gone; Thessaly never told (`proposalLost`); floor then late telling; Tobe lets himself tell; Wat on the road then called back; the Ash turned by wool (`j.assert('befell', 'ash_count_begun')`); Ines saying the word to a company that missed it.

## Not covered, or only by exploration

- `orla_stay_ask` (the persuasion check) and `orla_stay_rite` (a cleric) are written but unreached by reach and not journeyed; only the hand is tested. The test company is a ranger.
- The Reply's listening-by-day observations and the Ash's two Pole topics are not journeyed.
- The Wat/Amos reunion that happens off the list (any two meeting anywhere) is not written: if they meet after the list, nothing says so. `wat_turn` sends Wat to fourteen, but the late meeting has no scene. This is the one real hole.
- Of the endings only `sixty_one`, `wool_night` and `the_sending` are played; `all_heard` is held by `sixty_one` (via `over`) in the good run and needs a run that does not send Ines's word.
- **Browser preview:** `bin/kyrie preview` built and served (HTTP 200); I did not look at pages. Nothing here says how it reads on the page, or how the Rim rooms are painted.
- Passing tests are not satisfying play. I have not played it as a person.

## Authoring difficulty

- Facts need declaring before use and in an order a module's source list decides; I put every Relation and Measure in `facts.kyr`, first.
- A rule that teaches by being heard re-fires every watch until heard (the guide says so). For a one-off voice that is wrong: Ines's Yes would be replayed to a late arrival at cairn forty, so I bounded it by watch to leave her own telling reachable.
- `Observe … as sign when` order (kind before `when`) and `Measure f().` for dice are learned from compile errors.
- There is no way to say "this rule is heard by the whole Rim, but only changes things at cairn fourteen" except two rules; I wrote the same speech in four variants (together/told, together, alone, empty) because a rule cannot vary its text by who is present.
- Routes are good for a village's day, but a Person's route cannot be paused by a topic except through a relation in the route's condition; I used a condition on every route.
- Rim rooms are named "cairn three" etc.; scenery kinds are read from names, there is no cairn/cliff painting, so they show a dim ground. I did not add a painting entry (global).
- The Orla thread is deliberately a one-watch window; an interface that auto-waits could skip it. A journey step `=87` lands on it correctly, a player pressing Wait an hour at 22:00 will not.

## Proposed Kyr/Deem improvements

1. `Rule … says` variants chosen by a `when` inside one rule (or `says … when` lines as Greets again has) would cut the four near-identical rules per scene.
2. A first-class `Moment at <place> when <time> { … }` that is told if the company is there and recorded as "missed" if not, with a way to read missed moments later (what the floor, a rumour or a person can teach), instead of a bespoke latch and `knows` per voice.
3. `Initially Set x() to (1d6)` works but each variant is a rule; a Deem table of lines for a module (draw a line by seed into an Observe) would make the voices data, not eighteen rules. Module-local Deem tables outside `situations` are not documented.
4. A lint warning that a topic or rule can only be reached by hearing a rule that repeats (ines_tell was dead until I bounded the rule).
5. `Route` with a pause condition (while `following`) built in.
