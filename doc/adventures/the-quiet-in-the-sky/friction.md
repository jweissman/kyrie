# The Quiet in the Sky — friction

What resisted, written as an author-builder against `db92e98` on `adventure/quiet-in-the-sky`. I did not patch the
engine. Every item below is either worked around in the module, with the workaround named, or left as a limitation of
the work. Items are ordered by how much they cost the adventure.

## Missing capabilities

1. **No authored way to restore a creature defeated in a fight.** `able`/`dead` are projected from the creature store's
   hit points (`src/campaign/creature-facts.ts`), so a module cannot make anything get up at the Hour, which is
   Ysgard's whole law. *Worked around*: the law is shown only where nobody fights (the dead killing each other is told,
   never simulated). The one law that needs no restoring, that a living hand ends what it strikes, is Kyrie's ordinary
   death, and that is used directly: kill the bear or the press and they stay dead, and the module notices (`dead(bear)`,
   `press_died`). *Cost*:
   - Ned cannot be a fighting companion. A dead companion who fell in a fight would have to rise at the Hour, and
     nothing can make him, so he follows (`acceptsEscort`) and never fights.
   - A training bout with the dead cannot be a fight. Sparring is an action with a roll (see 9).
   - *Wanted*: `Resolve restore(group)` and `Resolve restore(member)`, the effect of a raising without the spell.
2. **The canonical planes are not on main.** Mission 18's `data/imbar/` canon, with Ysgard as one world-owned plane that
   modules extend, is a design (`doc/architecture/mission-18/one-universe.md`) and not code. *Worked around*: I declared
   `Place ysgard "Ysgard" is plane` in the module, and `Entity plane_ysgard: law` so that Orsino's law (−1 to spell DCs)
   holds on the Field. *Cost*: this is the first private outer plane, and a second author's Ysgard will be a different
   one. When the canon lands, `ysgard` should be dropped and the canonical id named in the manifest. The region,
   `field_country`, is written to be a sibling within it. I did not put the law on the plane itself; it is on my region,
   as the design asks.
3. **No temperature.** The cold is the work's material pressure, and Kyr has no heat. *Worked around*: a module measure
   (`chill`) with `warm` and `bitter` places, a sheepskin that raises the thresholds, warnings told as rules, and a
   hazard (`frostbite`) at the limit. The cold is real: two of six random walkers and one of my own fixtures froze. A
   shared `exposure` idea (cold, heat, wet) would serve the Lull's winter, Carth, Pellam and this alike.
4. **A placed country's `after` has one voice.** `countries.json` gives one `after.talk` and `after.told`, so the
   country next door says the same thing whether the Daily came back or Halt was chosen. *Worked around*: the talk is
   written ambiguously ("cannot agree whether the dead up the Pass have started again or not"). *Wanted*: `after` keyed
   by a fact the module asserts, so the world can recognise *which* outcome.
5. **No cross-module world event.** Mission 18's `befell` is not on main, so no other adventure can read what happened
   here. Larum's sky is told only in Larum and through the shared `after`.

## Simulation and presentation defects met

6. **Generic weather prose ignores the place.**
   - The world's weather line told "the ruts are hard with frost" on the highest Tooth and in Ysgard, a plane with no
     roads and its own sky.
   - In the placed run it told "Rain comes over in grey curtains" while the company was inside the White.
   - It told "Night comes on while you are still on the road; an owl keeps pace" crossing the Old Ice.
   - `elsewhere` would silence the weather entirely, and that would be wrong too: Ysgard has a sky, just not Imbar's.
   - *Wanted*: a region that owns its weather table, or can say "no weather lines here, my own instead".
7. **The glance shows a place's first sentence or two.** In the browser a place is its opening sentence until "Look
   about". I learned this from screenshots: the Hark's ballad and the Pass were invisible behind the fold. *Fixed in the
   work*: every important description was rewritten so its first sentence carries the place. *Wanted*: the authoring
   guide should say this in its section on descriptions. Lint could measure a description's first-sentence length.
8. **A portrait chosen by occupation ignores the person.** Bet Garside, `Likeness "innkeeper"`, was shown as an old
   bearded man. *Worked around*: likenesses chosen by gendered words from the corpus ("laundress", "prioress",
   "heroine", "goose-girl"). *Wanted*: Likeness filtered by `Pronouns`.
9. **No bout short of death.** "Spar with Mab" is an action with a tumbling roll, and whichever way it goes, her lip is
   split. The page says "an even chance · one try", which is true of the roll and misleading about the consequence: the
   blood is drawn either way. *Wanted*: a fight `to yielding` that uses the combat system and ends on `routed`.
10. **Engine lines after a scripted parting.**
    - When a rule retracts `following`, the page adds "Edith Marl nods, and lets you go about your business." This
      comes after a paragraph in which she has already walked off down the valley road.
    - The same happens when Ned is taken on at the Oven.
    - *Wanted*: a `parting` the rule can say, or suppression when the rule's own words move the person.
11. **Greeting after a scripted reaction.** A rule fired on `addressed(mab, party)` (Mab taking a letter) was followed
    by her `Greets again` ("Breather!") at the end of her furious line. *Fixed*: letters are given (`Wants` and an
    `Event` on `keeps`), not shown in conversation.
12. **Travel through generated countries in a test is flaky.** `GeneratedWorld.travel` failed mid-route with
    "Unavailable command" (a band, or a way shut). *Worked around*: the placed test sets the company down at each
    generated march, and walks only in Larum.

21. **A module cannot say what happens when the company dies.** A company killed on the Field (by the wolves, the cold,
    the press) should, by this place's law, walk in out of the snow at the Coming-in, and be asked its hour. I wrote it
    as an `Ending` on `dead(party) and inYsgard(party)`. `dead(party)` holds after the lost fight, but no rule pass runs
    after the company falls, so the ending is never reached; the page closes on the shared "The fight is lost." The
    text I wanted, for whoever adds a death epilogue a module can own:

    > The cold, or the iron, or both; and then nothing; and then you are walking in snow, out of a white curtain, onto a
    > height over a white plain between two halls, and your breath does not steam. A thin old man in a faded tabard
    > comes out of a booth with a ledger. 'Name,' he says, 'and hour of death.' He looks at you properly, and stops,
    > and then, very gently, he dips his pen. 'Well,' says Cleeve. 'You have one now.'

## Awkward abstractions

13. **Rules run on every zero-time action.** A rule meant to fire once a watch (chill, a cold bite) fires on every talk,
    every topic and every look. *Worked around*: a `chilledAt` latch on `watch(clock)`, the idiom other modules reinvent.
    *Wanted*: `Rule … each watch`.
14. **Kinds must precede their use in file order.** `Buys crossbow_find` in `larum.kyr` failed ("no kind of item")
    because the kind was declared in `field.kyr`, read later. *Worked around*: every `Kind` moved into `kinds.kyr`, first
    in the manifest. The error message should say "declared later, in field.kyr".
15. **`visitedBefore` is every module's own.** The Liberty of the Ice, the Lull and this module all re-declare it. It
    belongs in the shared rules.
16. **`Known as` on a person whose name is the mask.** I twice wrote `Person ned "a boy in a carter's smock"`, so the
    name never changed. Lint could warn when a person's `Known as` equals their name.
17. **Placing a country is trial and error.**
    - My first choice (east, beside mountain and frost, independent) filled the first ring of the world `wren`, and
      walled in every other country beyond it.
    - Non-independent west beside frost and mountain missed the world `thorn`.
    - West beside frost, mountain and forest placed it in all nine test worlds and moved nobody. I found that by
      scripting `bin/kyrie countries` over each candidate and diffing the result.
    - *Wanted*: `bin/kyrie countries --try '{"side":…,"beside":…}'`, which reports moved and missing countries per seed.
18. **A journey's `=day N` counts the world's days.** A placed country counts its own from its first morning, so a test
    of a placed country cannot say "wait until the Morning After" by day. *Worked around*: `=+900` watches.
19. **Grave confirmation in journeys.** A step on a grave choice is asked first and done on the next matching step, and
    I could not tell from the guide when the confirmation is consumed. Two of my fixtures doubled a step that was then
    refused.
20. **Names are one adventure's own across the library.** This is a good rule, and it is found only by the lint's
    `names` pass. Five of my surnames (Ottery, Askew, Pellow, Fenwick, Pask) and one kind (`ballad_kind`) collided and
    were renamed. A `bin/kyrie names --free Ottery` before drafting would save the work.

## Things that were good

- `Chapter`, `Promise`, `Ending … over`, `within` anchors, `opening when` and `Grave` did exactly what the guide says.
- The wolves blocking the climb is one `opening when` line.
- Hild's promise is kept or broken by the world with no bookkeeping of mine.
- `holding(actor, kind)`, `Give`, `Spend` and `Wants` with an `Event` on `keeps` made every handed thing (the crock,
  the challenge, the letter, the tobacco, the slab) a one-liner.
- The lint's write-only advice found eight threads I had dropped.
- Journeys by offered labels caught several real defects.
