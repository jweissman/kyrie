# Atlas perception, characterized (the owner, 15 November)

A tiny, parameterized Kyr fixture that measures how the atlas tells an opportunity across three distances:
- spatial: here, a step away, further, beyond a barrier;
- story-action: the act itself, one step before it, several;
- both together.

The existing class definitions (callings, skills, perception tiers) are crossed with the authoritative opportunity
facets (Aspects, Offer types, Marks, Indicator.of). For each combination the fixture records whether the signal is
absent, vague, dim, or clearly identified, as the browser and the terminal both read it.

**Cases to vary:**
- ordinary against specialized perception (a calling or skill that senses more);
- prior knowledge (told, seen, read);
- barriers;
- followed-undertaking gold;
- the world changing;
- actions with several facets.

**Rules:**
- Report what happens now and the gaps first. Invent no opportunity to fill the matrix.
- Where the engine cannot express class-dependent sensing or graduated specificity, keep a minimal failing case and
  name the missing generic capability.
- Add a few cheap regressions.
- Make only the most surgical repairs that fit the M21 atlas work: the indicator table (TP-02), perception range and
  actionability, faint against dim, and silver.

The matrix, the findings and the failing cases go in this file.

## The fixture

The fixture is `test/support/atlas.ts`. Its regressions and failing cases are in `test/small/atlas-perception`, which
runs in about 2 s.

**The ground.** A hamlet of four places in a line:
- the green, where the company stands;
- the lane, a step off;
- the yard, two steps off;
- the shed, beyond the yard's padlocked door (a thief can pick it; anyone else only looks at it).

**The kinds.** One opportunity is put at one place, written as the shared rules write it:
- **companion:** someone who will come along if asked;
- **danger:** rats in their lair;
- **payoff:** a jewelled box;
- **knowledge:** someone with something to teach;
- **sign:** an `Observe … as sign`, once for anyone and once only for `capable(party, woodcraft)`.

**Who looks.** A warrior, a ranger and a thief stand for ordinary perception. A bard with the Gregarious capability
stands for specialized perception: the only one the engine has.

**Gold.** An aim names what is there (`Objective seek … "Find {casket}."`) and is followed.

**How each place is read.**
- *The page* reads the glance: its acts and likenesses with the facet drawn, `Glance.sensed` along a way, gold on a way
  for the aim, and `Glance.idle`.
- *The terminal* reads its rows: `TerminalSigns` and `Indicator.of` for each of the offer's choices.

**The readings.**
- **clear:** an act here, its facet drawn.
- **vague:** something perceived off along a way, or a way gold for the aim. It says which way, and never what or
  who.
- **dim:** the way there drawn as having nothing new.
- **absent:** nothing.

In every cell the two clients read the same.

## The matrix (the company on the green)

| Kind | Who looks | here (green) | a step (lane) | further (yard) | beyond a barrier (shed) |
|---|---|---|---|---|---|
| companion | warrior, ranger, thief | clear | vague | absent | absent |
| companion | bard, Gregarious | clear | vague | vague (far 2) | absent (repaired, below) |
| danger | all four | clear | absent | absent | absent |
| payoff | all four | clear | absent | absent | absent |
| knowledge | all four | clear | absent | absent | absent |
| sign, anyone's | all four | absent (told) | absent | absent | absent |
| sign, by woodcraft | ranger | absent (told) | absent | absent | absent |
| sign, by woodcraft | warrior, thief, bard | absent | absent | absent | absent |

**Gold, by story-action distance** (the aim followed names what is there):

| Kind named by the aim | the act (here) | one step before it (lane) | several steps (yard) | beyond a barrier (shed) |
|---|---|---|---|---|
| companion, danger, payoff, knowledge | clear | vague (the way gold) | absent | absent |
| sign (aim toward its place) | absent | vague | absent | absent |

**From the yard, the shed beyond its padlock.** Every kind reads absent, for a warrior and for a thief alike, and for
a Gregarious company too. The thief's only difference is that the door's act is "pick the padlock" where the
warrior's is "look at the padlock": what it can do, not what it perceives.

**The world changing.**
- The rats killed: danger goes from clear to absent.
- The box taken: payoff goes out.
- A way gone along and back twice for nothing turns dim (`Glance.idle`), and is not led with.

**Multi-facet acts.**
- Before the aim, the box here is to gain and worth a look. It is drawn green, with silver as an icon: since TP-02's
  review, silver is last.
- Followed, it is the aim's and to gain: gold, with ¤.
- With the rats and the box together in the lane, the fight is red and the box is gold with ¤. The aim names the
  box, so the fight is not gold.

**Prior knowledge.** Osric, asked, tells of a box in the yard (`knows(party, heard)`). Nothing on the green or in the
lane changes: the way to the yard stays plain silver.

## Findings: what happens now, and the gaps

1. **Only companionship is perceived at a distance.** `Perception.reach` is a table in code with one row: a
   companion one place off for anyone, three for a Gregarious company. No calling, skill or ancestry extends the reach
   of danger, payoff, knowledge or wonder. A ranger and a warrior read the rats a step off exactly as a mage would:
   absent.
   - *Missing generic capability:* an authorable perception reach per facet and capability, declared beside the
     rules (Kyr or catalog), not in code.
   - *Failing case:* "a ranger perceives danger a step off".
2. **Graduated specificity exists only as "which way and what kind".**
   - A sensed thing gives `{ to, aspect, far }`. It is said "a companion, that way" one place off, and now "perhaps a
     companion, farther on" past that. The page's wayfinder had its own words for the second; the shared table now
     holds both.
   - Nothing becomes more specific with skill or nearness: no "someone with a bow", no "rats, by the smell".
   - *Missing:* a specificity grade that rises with nearness and capability.
3. **Class-dependent sensing exists only as authored conditions at the place.** `Observe … as sign when
   capable(party, woodcraft)` is seen by a ranger and not by a warrior. That is real class-dependent perception, but
   it works only where the company stands, and the atlas says nothing of it.
   - A place's own sign is told (in the situation, on a look) and gives no facet: only a subject's sign is a reason
     (`Affordances`).
   - *Missing:* a place's sign as an opportunity's facet (knowledge), and signs that can be perceived along a way.
   - *Failing case:* "a sign seen by skill shows on the atlas".
4. **Violet is unreachable.** No reason (`Why`) maps to `wonder` (`Aspects.by`), so no act is ever drawn uncanny,
   although the world has wonders (region marvels).
   - *Missing:* a reason for the uncanny, from authored marvels.
5. **Gold reaches one step.** The followed aim lights the act itself, and the way to a place a step off. Two steps
   off, nothing is lit until the company stands a step away. Over the country, journeys carry gold far (Itineraries);
   inside a settlement or site, the aim's route does not.
   - *Missing:* the aim's route along the known ways of a place.
   - *Failing case:* "gold two steps from the aim".
6. **Prior knowledge does not light the way.** A thing told of (a fact known) changes nothing on the atlas unless an
   aim names it.
   - *Missing:* knowledge-sourced propagation, faint and toward.
7. **Barriers hold for what is here, and now for what is perceived** (repaired below).

## Repairs (surgical, within TP-02 and perception range against actionability)

- **Perception stops at a shut door, however far the reach.** A Gregarious company had perceived someone three places
  off through the shed's padlocked door: past the first step, perception had read the raw `connects` relation.
  `Perception` now goes on only along the ways the company could take (`PassageModel`: not blocked, guarded or wanting
  a skill), as it already did for the first step.
- **What is perceived along a coloured way is kept.** In both clients, a way drawn silver had lost the companion
  perceived along it: the pip was the way's own, and the words were said only on a way with no colour.
  - `Indicator.of` now takes `sensed`. It is the faint pip where the way has no colour and the thing is no companion
    (`Indicator.faint`); otherwise it is an icon, said by how far off (`Signs.sensed(aspect, far)`).
  - The terminal draws it now. The page's ways (`attention.tsx`, `lenses.tsx`, `wayfinder.tsx`) keep their own
    `far && !lit` rule until the aesthetic line adopts `Indicator.of` there.

None of the gaps above was filled: no opportunity was invented, and no facet was given to a class by name.
