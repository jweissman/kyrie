# The Going Bank: friction

## Creative intent
A perilous crossing with a wedding in it. The east bank of a gorge is the back of something walking to the sea; two villages
and a pinwright have three days and a rope. The player is not asked to fight anything. Danger is the span (poles, then a
rope, then nothing), the clock, and one competent man with nine iron pins who is not wrong by his own lights. Wonder is the
east wall breathing. The aim was a story where the hinge is saying a true thing to a hundred people on a grass rope.

## What works
- The default is the worst ending: leave Varnish alone and the pins go in at the hour of the wedding. Every other ending is
  something the company did (took him to the wall, argued him down on the shelf, or dragged the pins out).
- Four independent ways to learn the bank is going (Sabra's cord, the cairns, the breath at the ledge, Meggan) and calling
  voices that give a calling-specific route (thief lifts the cord; ranger reads the cairns; bard hears the stone answer;
  cleric reads the graves).
- Rope, crowbar, kite and the guide-line are each a different crossing with a different cost; the hand-line (day 2) decides
  between "Across the Gap" and "Half the Bank".
- Fate rules before the ending read the company's small acts (the vows witnessed, Sabra told, Varnish turned).

## Incomplete or weak
- **Ketter's decision is one question.** Osbel asks, you answer ride or cross, and the village follows. There is no
  moment where individual Ketter people (Moll, the Pettifer twins) are met, though the endings name them. The churchyard count
  is only prose.
- **Kite east at dusk is a one-way stunt** with little payoff beyond arriving; Bettony has no ending text.
- **Tamsy, Fell and Pipit are mostly talk** (Fell and Pipit teach nothing later play reads beyond the vows). The vows are
  an act with a milestone and an ending line, but nothing changes in play.
- Only 6 ending conditions are exclusive by construction; they were each tested except Harbour with a failed-then-pulled
  pins mix.
- Browser preview was served (HTTP 200, linted and built) but there is no browser in this sandbox: **no screenshots were
  looked at**, so the contact-sheet obligation is not met.
- No paintings were commissioned: rooms and people use whatever the page draws by default.
- The ranger's pack contains rope already, so the hand-line is not scarce for rangers.
- Only the ranger company was played (the scaffold's party); thief, bard, cleric voices are written but not walked.
- Not installed as a province (no countries.json entry, deliberately: shared registry).

## Authoring difficulties
- `Rule` cannot teach a discovery with `Assert knows`; it needs `says … teaches fact`. The error said so, but only after I
  had written three such rules. A Query (`bankGoing()`) was the clean way to say "any of three sources".
- `Change … needing brawn` offered nothing to a ranger; I do not know which callings carry the skill. I made a crowbar
  buyable instead. `inspect --why` shows who could write a fact but not why a Change is not offered.
- Person-surname uniqueness is global; five names (Brack, Rudd, Fairley, Teague, Lorne) were taken by minor characters elsewhere.
  `bin/kyrie names` found them but only one at a time; a draw of surnames would help.
- Every ending, chapter and world-news rule draws "heard everywhere" advice; there is no way to mark an ending as
  intentionally global.
- Talk that moves its speaker (asking Varnish to come to the ladder) ends the conversation, which is right but is not
  announced by the label.

## Proposed Kyr/Deem improvements
- Let a Rule's `Assert knows(party, fact)` be allowed when the rule `says` something, as a shorthand for `teaches`.
- A `Clock` form (`Phase poles_go at day 2 06:00 …`) instead of repeated `day(clock) >= … and hour(clock) >= …`.
- A `Crossing` declaration: a way with states that worsen on a schedule and whose repair is a Change.
- `inspect --why act`: why a Change or Action is not offered now.
- A deem table of "folk who will not leave" so mass choices (a village's) can name individuals without hand-writing each.

## Verification
`bin/kyrie verify goingbank`: lint clean (24 advice, all "heard everywhere" on endings, chapters and world-news rules, plus
one unheard); names none shared; 5 repeated phrases (all place names or "at first light"); 16 journey tests pass
(honest harbour road, hard ride, across, half bank, iron, neither bank, pins pulled, Varnish turned by lamp and on the shelf, public
speech pass and fail, cord pass and fail, kite, cairns, breath). Reach: topics 21/22, acts 4/7, rooms 13/13; the uncovered
topics and acts are covered by the journey tests, which reach does not read. These are passing tests, not human play: **no human
play is recorded**, and the first-time feel of the three days is unverified.

