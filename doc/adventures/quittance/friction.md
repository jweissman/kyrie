# Quittance — authoring friction report

*Evidence from building a thirteen-part, ~9,000-line adventure in Kyr against the repository at `eddf182`. Per-author detail (≈100 items with file
and command evidence) is in `friction/*.md`; this is the lead's list and the ranking across all of them. "Cost" is time lost, not importance.*

## A. Things that cost the most

1. **Surnames are a global namespace.** The `names` lint compares the last word of every Person across every adventure. Nine of my first twenty names, and about half of
   each author's first eight, collided (Lowe, Quire, Vane, Ashby, Quill, Marl, Fisk, Quennell, Strake, Hobday, Gedge, Prowse…). It is reported only at lint (≈40 s), one at a time. A
   `kyrie names <surname…>` command, or per-adventure namespacing of display names, would remove an hour from every adventure.
2. **Reserved words are found by loading.** `recorded`, `stage`, `ward`, `burning`, `knows`, `able`, `site`-as-parameter are engine or shared names; the clash is reported without the
   offending declaration's position ("Creature projections and campaign clock/pressure records are read-only" — *which* statement?). `kyrie lint --inventory` lists relations, not reserved words.
3. **`day(clock)` is 1 on the first morning**; the guide says "counted from that morning" without saying 1-based; four authors each rediscovered it after a day's work.
4. **Measures floor at nothing.** No negative reputation is expressible; an offence is "a decrease or to nothing plus a relation". The lint advice is right; the guide never says it.
5. **`Pursuit` is inert, silently, for a person who does not `Uses go`.** Parser and lint accept it. Two authors wrote schedules as teleporting rules instead.
6. **`at(<place>, site)` in a `Requires` parses, lints and is never true.** (Two authors.) `site == place` is a parse error with no hint to use `at()`.

## B. Checks, tests and randomness

7. A check's die is a function of seed, actor and moment; a test of a *failed* check is a search over seeds. Tests became seed lotteries, and any change to an earlier step re-rolls them.
8. A test cannot give the company an item (`ownedItem` is a query); cross-quest rewards (the forged writ, the key, the Ledger) are exercised only by lint or by a stand-in module spliced into the source.
9. `Journey.holds('holding', …)` returns false for a Query without complaint; `Q('coal')` prefixes a kernel good that has no prefix; `City.start(seed, party)` silently ignores a bare array.
10. A returned-to place is told by its first sentence only, so a state change made during a visit cannot be read back by re-entering; `page` and `told` disagree about revisits.
11. Observations are told once per arrival; lasting change has to live in Thing states or Topics (`qu_gor_cold`, `qu_tench_cold`).
12. An optional step `?pattern` is a regular expression where "—" and "'" matter; a way-tile that is also an act ("To the foot of the Exchange stair — put your shoulders…") must be addressed by its whole label.
13. The Mark Street fire's bells interrupt a `Wait › Until dark` at watch 12; every other author's wait-based test broke when it landed. (A good thing in play; a surprise in tests.)

## C. Language and idiom

14. `Promise … kept when … "text"` takes no effect block, only `broken` does. `Grave` cannot be conditional. A `Rule` cannot branch (an eight-rule ladder with `not settled` replaces an `if`).
15. `Role` lint: "names the Five again" fires on a role that merely repeats a *word* of the name.
16. "Prose that explains the implementation" fires on *engine-house*, a historically exact word; the check is a substring match on "the engine".
17. `stair` between two rooms of the same level warns; `ladder` between two rooms of one building warns; there is no kind for "a way up that is not a level".
18. `Item … at nowhere` needs a place that is not a room of the world (`beyond_map` + `nowhere`) in every adventure; there is no `Gift` construct.
19. A recruited companion has `at` retracted (`recruit`), so every rule that asks where Tobias is must also ask `travelsWith`. `memberOf` is engine-owned, so no company member can stay behind as a Hearthkeeper.
20. A `hidden until` takes a Discovery id and the parse error for a condition is `Expected "."`. A parse error at `{ }` after an `Observe` says `Expected "." or "teaches"`.
21. `Species … like red_dragon`: `Level` does not scale a fixed-stat species, so "the Fire" is either unbeatable or beaten by three level-10 warriors. The catalogue has no elemental and no talking bird.
22. Rules run once per action and once per watch; a per-watch measure (heat) needs a stamp. Timed actions apply their effects before their time passes. Talk costs no time, so a clocked scene is not punished by arguing.
23. Rule order across files is invisible: `ds_m_tender` was written before `ds_read_b_counts`.
24. The standard `Attack` is offered for a group in an adjoining room (the glass men, from the Hearth Below).

## D. Engine and presentation

25. The province mechanism ignores `beside`, and `among: independent` has no effect on provinces: `bin/kyrie countries` places all of them. The `countries.json` comment and the guide describe the pre-province regime.
26. Lint takes about 40 s on a campaign of this size; every iteration pays it.
27. `bin/kyrie new character --companion` is the only documentation of `willing(x, actor)` + `hire(x)`.
28. A "retry" cannot be designed (the die is fixed); failures must lead somewhere. This is a good constraint and was the single most productive one.

## E. What worked

The kernel/contract split (one author's gate, another's reward) was possible *because* Kyr modules share a namespace and `Kind`s can be declared once and `Give`n by anyone. Chapters, Occasions, Promises,
Milestones and `Ending … over` did what they said. `Speaker` actions and skill-gated Changes made "different builds, different doors" cheap. The Journey driver and `kyrie inspect` were what made thirteen
parallel authors survivable.
