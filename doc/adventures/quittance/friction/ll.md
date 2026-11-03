# Authoring friction: the Glass Quarter (`q_lamplighter.kyr`, `q_coldlamp.kyr`)

Met while writing both quests. Evidence is a file/line or a command. These are about the tooling, not the book.

1. **`day(clock)` is 1 on the first morning, not 0, and the contract says 0.** `kernel.kyr`'s brief and
   `slate.kyr:slate_day0` (`when day(clock) == 0`) assume the first morning is day 0. In the campaign as installed,
   `src/campaign/clock-shift.ts:56` starts `day` at 1 (`start ? ... name === 'day' ? 1 : 0`). Probe: a fresh
   `Journey.start('data/campaigns/quittance.campaign.json')` then `j.measure('day', 'clock')` gives 1 at watch 4, and
   `=day 5 17:00` is `day(clock) == 5`. `slate_day0` can never fire, and every "day 6 or later" in the contract means the
   sixth morning, not the seventh. Nothing lints a comparison of `day(clock)` against 0. I wrote both quests to the
   literal numbers (demonstration `day(clock) == 4`, last Round `day(clock) == 5`, coal `>= 6`).

2. **`site == round_steps` is a parse error in a `Requires`.** `Expected "("` at the `==` (`q_lamplighter.kyr` first
   draft, line 178). There is no way to say "this action is offered only in this place" except to name something that
   stands there: `at(ll_lamp_s, site)`. The brief says to put the place in `Requires` and the guide's examples use a
   parameter that is never compared with a place id. I had to invent a Thing for every room that an action belongs to
   (`at(ll_locker, site)` for the Hall, `at(booth_clerk, site)` for the Booths).

3. **`at(x, site)` for a place `x`.** `at(booths, site)` loads and lints and is silently never true; the action is simply
   never offered (`Unoffered: No /Have a gilt first-lamp key struck/ at watch 78`). A lint on an `at(<place id>, ...)`
   whose first argument is a Place would have saved an hour.

4. **Surname collisions are only visible after the file is written.** Five of my first eight surnames collided
   (Pennick, Pask, Trewin, Dace, Brack: `names [legacy]: 2 errors` each run). There is no `kyrie names --free` or a way to ask
   "is this surname taken" before choosing; I renamed with `sed` four times. The collision list names the other adventure
   but not a suggestion.

5. **Action effects read the clock at the start of a long action.** `Time 36. ... Set cl_ventedAt(wynne) to watch(clock)`
   stores the watch at which the action began (probe: before 354, after 390, `cl_ventedAt` 354), so a "lasts twenty hours"
   rule was six hours short. Nothing in the guide says which side of `Time` an effect sees. I added the action's own length
   to the rule's constant (`cl_ventedAt(wynne) + 156`), which is a number nobody can find by reading the action.

6. **Two rules in one watch race, and the order is the file's order.** In `ll_late` (release the walking company at nine)
   and `ll_round_done` (the fourth lamp is lit), the fourth lamp lit in the last minutes of dusk crosses nine o'clock inside
   the action's `Time 3 minutes`; `ll_late` ran first and walked Hob away just before "That's the four" was said
   (`q_lamplighter.kyr`, first probe; told "The dusk is gone ..." then "Behind you ... the fourth lamp"). The guide says
   rules fire in the order written, but there is no way to say "this rule goes after that one" except by moving text
   around. I added `and ll_lit(hob) < 4` to the earlier rule.

7. **`Rule ... says` is told wherever the company is unless anchored, and `within(party, glass)` is a condition, not an anchor.**
   I wanted an event that happens in the Glass Quarter and is only *told* to a company that is there. A rule with
   `within(party, glass)` in its condition happens only if the company is there, which is not what the world should do (the
   pilots breathe whether or not anyone looks). I made it a watched event on purpose, but there was no way to have the
   event happen and teach only if seen without writing two rules.

8. **Walking an escorted person through a country needs an `acceptsEscort` or direct `following`; the topics and the lead action overlap.**
   `data/rules/people.kyr:48` has an action `lead` ("Ask X to come with you") that requires `acceptsEscort`; I asserted
   `following(hob, actor)` straight from a topic instead and the escorted person walks with the company through
   passages (`>quittance__round_tinkers` etc. all carry him). It works and is undocumented in the guide's §3-10 apart
   from "Kin, companions and animals": "led, in custody, a child brought home". I also had to put `not following(hob,
   party)` in every schedule rule that would otherwise take him home.

9. **Persons moved by a schedule trigger a lint `advice role` (the role is true "wherever they are").** `Role "day stoker at
   the retort-house"` for a person who is at nowhere half the day: `advice role: quittance__mallow is "day stoker at the
   retort-house" wherever they are, and quittance__cl_mallow_off moves them`. The advice is right but the remedy
   (`Role "…" when at(...)`) isn't in the guide's §3 and I did not try it; I wrote vaguer roles. A schedule is expressible
   only as rules that `Retract at(x, ?p)` and `Assert at(x, y)`, three or four per person; there is no `Keeps hours`.

10. **Journey and the conversation menu.** A topic is offered both under "Talk to X" and, once met, at the top level of
    the page ("Ask Hob again what he is doing with that pole"). A journey step that takes the top-level one does not enter
    a talk, so a following `Take your leave` is `Unoffered`; the other way round it is. Every test step
    after a topic has to be `?Take your leave` to be safe (`test/quittance-lamplighter.test.ts` passim).

11. **`=day D HH:MM` waits an hour at a time and keeps every hour's page.** A single wait from the first morning to the fifth
    day builds a hundred pages in `taken`, and `City.said`/`City.pages` then include all of them, so a `toContain` on a
    rule's words after a long wait matches text from days ago. It also made each test seconds slow (the Round tests run
    4-8 s each; the cold-lamp ones 10 s). I split long waits and asserted on `from` indexes.

12. **`write-only` advice on outcome relations that are meant for the Hearing.** `ll_howPension`, `cl_gaswon`, `cl_confessed`,
    `ll_slighted_gasco` and a dozen more are written for the spine and the Hearing to read by name; the lint reports each
    as "written and never read: a thread not yet taken up?". The brief says this advice is expected until the spine
    lands, but there is no way to declare a relation as published (`Exports`), so the noise is permanent in the file.
    I read a few in my own Observes to keep the file honest.

13. **No `Kind ... like lantern` equivalent for a person's open door.** I wanted the Salamander lantern to be an item the
    player can *open* (the spark asks, the player opens a door, the lamp goes out). The kernel kind `salamander_lantern` is
    `like lantern`, which is lit or not; there is no state on a carried item. I used a topic that gives it and prose that
    says "open the door if it asks", which nothing can do.

14. **Check dice are fixed per seed and moment; the quest wants a retry.** A failed flattery of the chairman by one skill
    leaves the other skill (a different `once` flag per attempt), which is the workaround the brief describes. The tests
    use `?` steps and branch on the result (`it('is flattered by a performance...')`) because the die for the default
    seed decides which branch ran; the quest's own second tries are covered, but I could not choose the roll.

15. **Kinds and goods are global names; everything else is `quittance__`-prefixed.** `j.holds('holding', 'party', 'salamander_lantern')` is
    true while `'quittance__salamander_lantern'` is false and there is no error: probe `world.one('itemKind', 'quittance__cl_lantern')`
    prints `salamander_lantern`. The same for the good `coal`: `j.measure('quantity', 'party', 'coal')` is 1 after Wynne's coal,
    `'quittance__coal'` is 0. A test author wastes an hour deciding which side of the prefix a name is on; `test/support/quittance.ts`
    has `Q()` for entities but nothing for kinds, goods or core relations like `holding`.

16. **A revisited place is told in a few lines, and an `Observe` is only told once it becomes true while the company is there.**
    Probe: the Hall at `=day 5 22:00` on first sight tells the whole scene and the `ll_hall_hurt` Observe; leaving and coming
    back tells "A tall locker ... Here are an old man with a pole ..." and neither. So "a place has changed after the quest" cannot
    be shown by an Observe on a place the company has seen; it has to be a topic or an event told at the moment (I wrote a
    "Ask Hob how he does" topic per outcome, and the Hall's observations only as first-sight).

17. **`Known as` shows an old identity on a revisit even though the company has met him** (`knows(party, ll_hob_met)` is only
    taught by one topic, so a company that reaches Hob by another way sees "an old man with a pole" in the Hall while the topics
    say "Ask Hob"). There is no way to teach on first greeting; the `Greets` line cannot carry `teaches`.

18. **The Journey wait rounds up to whole hours.** `=day 3 17:30` from ten in the morning waits an hour at a time and lands at
    18:00, past a shift change I wanted to test. Times in tests had to be on the hour.
