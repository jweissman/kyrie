# A Winter in Carth: authoring friction

*Where Kyr and the engine resisted this adventure, by severity, with what was done and what would remove the need. No
engine code was changed for Gaunt: everything below was worked round in the module. Numbers are referred to from the
other documents.*

## Severe: silent, and wrong on the page or in play

**1. Night is fixed at nine to six.** The engine's `dark()` has no seasons. February in the north is dark at five, and
a farm keeping a cold vigil is the whole story of the dark hours. Every rule that means "night" asks the module's own
`nightfall()` (seventeen to seven), and the module sets `unlit` on the house-place and the byre itself. *Remedy:* a
season or latitude on the region, read by `dark()`; or let a module declare its own dark.

**2. An action whose effects would take a count below nothing is not offered, and nothing says so.** This is
deliberate (`src/lang/counts.ts`: "what cannot be paid for is not bought") and right for gold. For a debt it is
backwards: a company owing one pain could not kneel a night on the Steps "for six of your pains", or fast, or take
stripes, and the action simply never appeared. Found only because the monk's soles test failed. Worked round with
`Set pains(actor) to pains(actor) - 6` and a module rule that clamps at zero ("Gaunt gives no credit"). *Remedy:* a
`Decrease … by … at most to nothing` form, or a lint warning when a Decrease's amount can exceed the count its
Requires guarantees.

**3. Says on one page are reordered.** Several rules that fire in the same watch have their texts put on the page in
an order the author does not control: the morning came before the night it ended; the Joins line before the question
that made Hern join; the closing account opens with the company's tally rather than Carth. Worked round by spreading
moments over watches with measures (`morningAt`, `answeredAt`, `proxyAt`, `accountAt`) and comparing `watch(clock)`
against them. *Remedy:* declaration order for same-watch rules, or an explicit `after <rule>`.

**4. Cold damage paralyses.** The engine's cold damage carries a "frozen" condition; a bard kneeling one night on the
Steps was frozen and died. All of Gaunt's cold is told as cold and dealt as *physical* damage, small, with a
constitution save. *Remedy:* a mild cold (chill, exhaustion) separate from a freezing blast.

## Serious: forced a workaround that costs clarity

**5. No speaking through a window, and no mask.** A person is where they are. Hern at the barred window over Gaol
Lane is a second Person (`hern_window`, "Ninian Hern"), seen when the real one is in the cell, whose topics
duplicate the cell's; the Lady under her mask is a second Person (`masked`) seen when she is masked, because a Person's
name is told on the page and the mask is the scene. Every topic about Hern's mind exists twice. *Remedy:* `Seen from
<place>` for a person audible from an adjoining room; a `Called … when …` name variant.

**6. `at` scopes the telling of a rule but not its firing.** A verdict rule `at chapter_house` fires wherever the
company is and latches its fact, so a player in the Row learned nothing of the verdict and nothing could tell them
later under the same latch. Separate "news" rules with their own latch, `inTown() and not inChapter()`, carry the
verdict to the city. `within` does the opposite (waits for the company), which suits news but not events. *Remedy:*
document the pair; perhaps `told at … else told within … as "…"`.

**7. Greeting is chosen by what the page remembers, not by acquaintance.** Hern joins the company by custody, walks a
day with it, and when it visits his cell he greeted it as a stranger ("'Ninian Hern,' he says… 'I'm expected'"),
because no Greets had yet been told. His Greets was rewritten to read true either way. *Remedy:* count a `Joins` (and
any topic) as a greeting.

**8. `Leaves` is said for every end of following.** Hern's "lifts a hand, without turning round" was said as the gaol
door shut on him; removed, the engine supplied "nods, and lets you go about your business". The line is now "For now,
that is the last of Hern." *Remedy:* `Leaves when …`, as for Role.

**9. Generic voice is chosen by facts a module may not know it must state.** The journey voice told "dew still on the
grass" across a frozen fell until the module gave itself a Thing called `sky` with `weather_freezing` and
`weather_snowy` states (discovered by reading `src/narrative/journeys.ts`). The masked Lady's farewell came from the
cheerful table ("Come back and tell me how it goes!") until her manner was set to grim. *Remedy:* a region's terrain
(frost) should imply its default sky; the manner tables should be listed in the authoring guide with their lines.

**10. Topics cannot roll, events cannot teach by assertion.** Persuading Will, lying to Raistrick and talking the Row
out are Actions, not Topics, so they sit in the action list rather than the conversation; events teach with
`teaches`, not `Assert knows`. Livable, but the conversation feels thinner than the design.

## Moderate: presentation

**11. The room's list of people is visual in the pitch dark.** "Here are Ninian Hern, a barefoot old man in a frieze
coat…" is told inside the dark house, and a Thing's state ("The hearth is dead: a bed of grey ash swept flat") is a
seen description. Roles at Carth are written to be half-heard where possible. *Remedy:* `unlit` should suppress Role
details and Thing states, or select `Heard` variants.

**12. Passage shut texts repeat.** "The gaol door is shut. The Consistory's gaol admits visitors between ten and four"
is told each time the company is beside it out of hours.

**13. Roles do not follow people.** A Role is a fixed description; Dinsdale "at a high desk, doing sums" was standing
barefoot in the Minster porch. Conditional Roles (`Role "…" when …`) fix it, and are easy to forget.

**14. Weariness is told mid-scene.** "It is a long time since you slept. You are weary…" lands in the middle of the
Ash-reeve's visit or Hern's coat. It is the engine's fatigue notice and has no sense of a dramatic beat.

## Mild: the ecosystem

**15. Names are unique across every adventure,** surnames and proper place names included
(`test/adventure-names.test.ts`). Tunstall, Pellow, "the Schools", "the Close", "the Shambles" were all taken; they
became Sugden, Laverock, the Divinity Schools, the Close of Saint Oswy, the Long Shambles. Canonical predicate names
(`burning`, `closed`, `offeredAt`) cannot be reused either. Correct, and costly late.

**16. Placement is fragile to `beside`.** Offering Gaunt beside mountain countries moved existing placements and broke
`test/frontier.test.ts`; frost and forest did not. A placement simulator in the authoring guide would help.

**17. Dependencies.** `bun install` could not fetch the GitHub-hosted `deem` and `languages` packages in this
environment (403); they were cloned into `node_modules` by hand at the locked commits.

## Found in the second pass

**18. An observation that teaches cannot be conditioned on not knowing what it teaches.** `Observe … when not
knows(party, x) "…" teaches x` teaches before the page is told, so its own condition turns false and the text is never
shown, while the knowledge is silently gained (the coin's mark matched over the Exchange door; a test checking only
the knowledge passed). The module's `teachesAt`/`seenOnce` latch, which closes only after the company leaves the
place, is the workaround. *Remedy:* evaluate an observation's condition before applying what it teaches, or warn in
lint when an Observe's condition negates its own `teaches`.

**19. Rules cannot assert knowledge.** `Assert knows(party, …)` in a rule is refused at load ("a rule teaches what it
says"), which is right, but the rule must then be shaped as `says "…" teaches fact { … }`, and a scene that teaches
two things must be two rules. Hern's meeting at the fold teaches the after through its text.

**20. Watches are hard to author against.** Step files wait by watch number (`=222`), counted in ten-minute watches
from eight on the first morning. Nine at night on Shrove Monday is 222; I wrote 216, which is eight o'clock, and spent
three runs finding out. *Remedy:* a journey step that waits to a named time (`~Monday 21:00`), as `~N` waits by dark
and light.

**21. A companion has no reaction to a place unless the author writes one.** Hern walked into the put-outs' fold, the
place his whole story points at, and the page said only that he "is here". Nothing in the engine said a following
person had arrived somewhere that mattered to them. The module adds a rule for it (`hern_at_fold`). *Remedy:*
`Remarks at <place> "…"` on a Person, said once when they arrive there with the company.

## What worked well

- **Things with states as the hinge of a scene.** The hearth (*cold*, *ablaze*, *snowed*) carries every way through
  the night, and the Ash-reeve's test is one predicate on it.
- **Passages with `opening when`.** The whole satire of the city is in its doors: the Close Gate opens to the
  shriven, the Fell Gate shuts on the put-out, the gaol keeps visiting hours "because the Consistory is merciful".
- **Discoveries carried between people.** "Who paid for Carth" is one fact taught three ways, and every door it opens
  is a `knows(actor, …)` away.
- **Journey, checkpoint and the wander.** Playing by labels kept the tests honest about what a player can see.
  The wander's page checks caught id leaks and generated-name breakage that no scripted journey met.
