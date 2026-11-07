# Friction: the Repertory

Authorability frictions found building and playing `rep_*.kyr` (The Repertory). Each: what happened, what it cost, what I did, what
the engine or tools should do.

## F1. Every `Retract at(?x, ?y)` must be bound by the rule's condition
`Rule X writes ?q, which its condition does not bind` (rp_x2, e4_begin, rp_dawn). A rule that moves a person from "wherever they are"
must state `at(person, ?q)` in its condition, one binding per person. A rule that gathers six people carries six `at(…, ?v)` terms
and silently *does not fire* if any one is `nowhere`. Cost: three lint cycles, and a latent stall (a gathering rule that waits on a
person who was never placed). Wanted: a `Move person to place` effect, or `Retract at(?p, _)` with an anonymous binder.

## F2. An Ending closes the book, so nothing can follow Act V
The brief put the tour after the command performance. Reached through `commandDone`, Act V's Endings end the page; a probe with the
fixture campaign and with the real campaign both showed zero choices. The tour had to be re-gated to `commandOn` and made to *hold*
Act V (`tour_holds`, `commandDay`). Cost: a design change, and a coupling from my files into Act V's measure. Wanted: an Ending flag
`continues`, or a documented "epilogue chapter" mechanism, as `after` in `countries.json` does for generated worlds.

## F3. Clock chains stall unless every incident has a "prevented" twin
Ep 1's day is a chain of incidents (i1 ... i8) each gated on the last, and each skipped by a player action (pledge, pay, hold). Gating the
*effect* by `not pledged(cv)` also gated the *flag*, so a player who did the right thing stalled the day forever; found only by
playing it for seven hours and looking at `HOLDS i8`. Fix: every guarded incident has a `rp_iNp` rule that sets the flag and nothing else.
Wanted: an `Effect when / Otherwise` block on a Rule so one rule can set a flag and conditionally do its work.

## F4. A "counter" rule that requires the player to be absent can stall
`rp_x1h` fired only `when not at(party, hm_rampart)`; a player who arrived and did *not* act left x1c unset and the whole chain waiting. Fixed by dropping the
location from the deadline rule. Wanted: lint for a flag chain whose link is set only by one branch of a condition (`x1c` has two setters, but one needs an absence the player can defeat).

## F5. `Observe ... as sound when` order
The clause order is `Observe id at place as sound when cond "text"`, not `when ... as sound`. Error message is a parse failure at the `as`. Cost: one cycle.
Wanted: the parser should accept either order or name the correct one.

## F6. A kind and a place may share a name, and the error blames the wrong file
I wrote `holding(party, lantern)` in the bog's rule meaning the carried lantern. Act V's `rierdan.kyr` declares `Place lantern "the Wick"`, so
`lantern` is a place in this module and the lint reported the fault at `rierdan.kyr:40` ("Invalid argument lantern in holding(party, lantern)"), a file I never
touched. Cost: twenty minutes to find that my rule, not theirs, was the cause. I used `torch` instead. Wanted: the error should name the declaration that shadows.

## F7. `lord` is a rule parameter in a shared file
My person id `lord` was refused: `'lord' is a parameter of a shared rule at data/rules/inhabitants.kyr:228`. The same applies to any id the shared
rules use as a variable. Wanted: shared rules should use `?`-variables or a reserved prefix, or the refusal should list all reserved ids.

## F8. `stair` passages must change level
`Passage ... is stair between a and b` warns "does not change level"; rooms have no level in the module. Used `path`. Wanted: `stair` should not warn
inside one building unless levels are declared, or levels should be a place attribute.

## F9. `homeOf` is a canonical shared name
I declared `Relation homeOf` and the vocabulary check reported `redefines canonical homeOf`. Renamed `touredFrom`. Wanted: the error should show the canonical signature so one may use it.

## F10. Write-only flags, again
First lint: eighteen `write-only` advisories, every one a real fault of mine: `swaleHand`, `dorcasWants`, `e3Spared`, `tiernanLonely`, `chainTaken`, `houseBarred`, `e4QueenLoves`, `gosseBeside`, `e4Rested` and more. Every troupe question I wrote had its answer
written and never read. The fix was to add a reader (an Observe or a topic) to each; two were dead (`e2Paid`, `sideNone`) and were deleted.
This is the craft checklist's biggest repeated fault, and it is still the commonest. Wanted: a lint *error* for a `Topic ... answering` whose
asserted flag has no reader, and the same at author time in the editor.

## F11. A topic's `Says` cannot depend on a flag
Cross-episode arcs need the *same* question to be answered differently by what was said before (Dorcas playing Iseult as hungry or afraid). A `Says` has no `when`. I wrote two topics with
identical menu labels and complementary `when` conditions (`dorcas_iseult_a/b`, `kit_wood_a/b/c`). It works, but the labels have to be identical by hand and the pair can drift. Wanted: `Says … when cond` variants inside one topic.

## F12. Forced rolls persist
`Journey.roll('pass')` stays forced for every following check until `roll(undefined)`. A spec that wants one pass and then normal dice must reset it; I got a spurious pass in Ep 1. Wanted: `roll('pass', 1)` or a scoped form.

## F13. A territorial creature cannot be fought out of a spec
The pixie was `territorial` with a `Comes`; the first `Search here` at the hollow began a combat the journey harness cannot play ("Transcript ended during combat"). I made her peaceable and put the mischief into a rule. The Lord of the Green stays territorial but his glade is entered only after the Hunt is tolerated (coats or the hautboy).
Wanted: a harness verb for "flee/avoid" and a documented way to give a creature a *warning without a fight* ("Warns" without "Comes" was the only tool).

## F14. Companions who are not in the party cannot be at the site
Swale's actions and topics (`at(swale, site)`) need him in the place; he was in the taproom while the action was at Harrowmere. A rule brings him (`e3_swale`: "fetched in the Chancellor's cart"). Likewise the hautboy had to be played on the lawn because Tam does not come. Wanted: an `Ask X to come along` generic action with a cost, as Act I's Oriel has, usable by any tourer.

## F15. `Wait` is the only way to cross a clock, and rules fire on the next tick
Every specs' "epilogue" counts need an extra `waits(1)` before `repertoire` shows (the rule that counts it runs on the next tick). Specs that read a measure just after an ending are wrong by one hour. Wanted: rules whose condition becomes true in the same turn should run in that turn's closing pass; or an `await settled()` in the harness.

## F16. Labels
`Journey.play` matches substrings, so `Ask Gosse how the rehearsal is going` and `Run the rehearsal yourself` both fire on the first match. A later topic whose label contains an earlier one's text can be played by accident. I found no clash but had to read the choices to know. Wanted: a `playExact`.

## What I left alone
- The other fork's act files (`act1`..`act5`, `rier_*`): I wrote into them nothing. I do *read* `commandOn`, `commandDay`, `holdingCommand`, `chaos` and `repertoire` from Act V, and **write** `commandDay` and `chaos`, which is a coupling the doc names.
- `player.json`/portraits: none added.

## Found by hostile review and by playing a bare route (second pass)

## F17. A bare-route spec finds what a forced-roll spec cannot
The first specs forced `roll('pass')` and walked one path per ending; the reviewer played the *shortest* route and found four episodes with a dominant line that skipped the signature
beat (Ep 1: three moves to "early"; Ep 3: hand the letter over unread = escape; Ep 2: do nothing after a "genuine" report = the quiet ending; Ep 4: pay a name for nothing). Each now has a spec asserting
where its dominant line ends. Wanted: an autoplay probe that plays "the cheapest legal move to each ending" and reports the cheapest path per ending, as `bin/kyrie` does for mazes.

## F18. An ending that is a *meeting* cannot be a *state of knowledge*
Ep 1's reversal depends on the company having reconstructed the day; the engine has `knows(actor, discovery)` and relations but no way to say "the company has understood": the early ending had to
list two discoveries by name, and the discoveries had to be made hard to get (gated on `chainTaken`, i.e. on the day having happened). Wanted: a `Understanding` bundle (several discoveries as one condition).

## F19. A tour that borrows another act's clock couples two files by hand
`commandDay`, `chaos`, `holdingCommand`, `standingR`, `puddingBrave`, `swaleBlurted` are Act V's and Act IV/V-side's names; the Repertory reads or writes them. A change to Act V's clock would break the tour silently
(only the specs notice). Wanted: an `Export` list on a module so a borrower may name what it depends on, and a lint that names the dependents when a measure is renamed.

## F20. A second source of the same credit is invisible to the author
`renown` plus `standingR` credited the same two plays twice; nothing flagged it because both are legal measures. The fix was to delete mine. Wanted: when a rule increases or decreases a measure that a shared mechanism in the same
campaign also moves from the same trigger (`repertoire`), say so.

## F21. A person's id can collide with a rule variable, a shared entity, or a name in another adventure
Four of my names were refused in turn (`lord`, `marsh`, `tarrow`, and the person-name check against `Marsh`/`Tarrow` in two other adventures). The refusals are right, but the error comes one at a time; an author with eight new people
pays eight lint cycles. Wanted: one pass that lists every collision.

## F22. Gating a flag-setting rule on the very condition it reports makes a stall
Repeated from F3 for the second episode that did it (Ep 3's `x1h` deadline, Ep 2's report). The reviewer's lesson: every deadline chain needs a test that plays the *absent* route and the *present-but-passive* route.
