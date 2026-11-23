# M22 alpha: retrospective and handoff

Written at alpha's close (21 November) to help shape beta, gamma and delta. It is a decision document, not a plan. Each
judgment is marked **fact** (measured or observed, with its source), **inference** (my reading of the facts), or
**open** (not known). Sources are the register, the alpha acceptance record (alpha-acceptance.md), the CI runs of
20–21 November, the agents' walk measurements, and the owner's playtests.

## Why progress hasn't yet translated into play

**Fact.** In two days of this mission's end, the register closed dozens of rows, CI went green on every landing, and
the browser lane passed 140-odd specs, including every acceptance route, at two or three sizes. In the same two days
the owner's human play found, within minutes: a riddle with no focus, a map active with nothing in view, glyphs no
one can read, a reward not led to, and blue promises that their topics do not keep. Earlier the same week: three
"Open the world map" rows (OR-159), two golds on the map (OR-161), paths that double back (OR-162), the gold leading
back and forth at Porthalen Hall and the vault (OR-167, OR-171).

**Inference.** The two are not in contradiction: they measure different things. Nearly every spec this mission wrote
proves *a scenario*: at this place, after these lines, this row is gold. A player meets *the space of states between
scenarios*, and the failures live there: the turn after an aim completes, the room around an activity, the topic
beside the one the spec asked, the map opened from a lens nobody walked. Every fix this mission made at its cause
(OR-159's relabelling, OR-167's guard, OR-171's shut ways, OR-174's engagement) generalized because it was made in the
engine for a *class* of states; every fix that pinned one walk left the class open.

Four things in how we work made that worse, and I took part in each:

1. **Acceptance by row, not by contract.** A row closes when its own scenario passes. Rows are split to keep them
   honest ("no partly"), which is right for the record and wrong as a measure of quality: 1,113 rows, 103 P0/P1 live,
   and the count says little about whether ten ordinary minutes hold. The planning views improved this; they still
   count tickets.
2. **Headless evidence standing in for play.** The runner and HonestPlayer are good instruments, but an honest player
   that follows the gold cannot notice that gold is missing, and a walk scripted from a cold play cannot notice the
   room around it. The page was proved by specs that ask the page's DOM the same narrow questions.
3. **Breadth on a weak floor.** Sixteen town pastimes, eight Fun Friday pins, three SRD creatures, an undertown and a
   card game were all added this mission, most as *fiction without participation* (the focus audit). Each passed its
   pin; each added states the contracts were never checked over.
4. **Parallel stacks.** Two agents and the lead landing in batches meant two full CI failures caused by
   integration (stack-7, stack-8), not by defects, and a lead whose attention went to traffic. The work got done; the thinking about
   the whole was thinner for it.

The mission structure also asked for incompatible things at once: zero client divergence, Atlas trust, maturity
closed, register at zero, delight every Friday, an M23 head start. **Inference:** alpha delivered real parts of each and
completed the one that was a single contract (client divergence), not the ones that are properties of the whole.

## 1. Actual achievements

**Genuinely reliable (fact, with evidence):**

- **One projection.** The page, the terminal and the runner offer the same rows in the engine's words (OR-159 closed;
  scripts/client-parity reads the page's drawn words; MT-18). Divergence now has a measure and a ratchet.
  *Corrected 23 November (the independent audit, mission-22-beta/preparation-report.md):* partial, not reliable.
  The parity tool does not measure the terminal or the talk drawer, and the page still decides focus, leading and
  tone from label text and id shapes.
- **Input answered.** Every press is drawn taken within 100 ms in the browser on mouse at 1280 and touch at 390, and a
  held journey commits once (test/input-answered-browser, CI 44897906386; OR-91, the P0, closed).
- **The wall of rows.** At the golden route's crowded places the page draws at most four acts with the one that
  matters gold among them (CL-33, test/cl33-four-browser).
- **Engagement as a frame state.** A live threat, and now any engagement (a hand of cards, the riddle), narrows the
  frame for every client to its own moves and the ways out (Engaged; OR-163's threat half, OR-174).
- **Aims that cannot loop on a barred or guarded way.** Guarded and Shut make "beyond the company" and "the way is
  locked and nothing opens it" a need, not a step (OR-167, OR-171, OR-172): to-and-fro steps on six walks 30–53 → 1–3.
- **The landing pipeline.** land.sh, full CI on a check branch, and the owner's checkout kept current. It works, at a
  cost (see §5).

**Partial (fact):**

- **Atlas trust.** Attest gives every indicator a witness, but witnesses are *issued* from heuristics that misfire:
  the old quarry teaches and is not blue; "Ask what his boats are for" is blue and teaches nothing new (OR-178, measured
  on the warrior's walk: 3 unflagged teachers, 1 empty blue of 21).
- **Undertaking continuity.** Strong where an author wrote a payoff step the engine can see (the weir's rats job is
  led to its payment, test/weir-route); weak where the next step is a rule on the clock (OR-176) or a separate aim
  (OR-179, not yet reproduced).
- **Travel.** Routes no longer jump (OR-162's course half), and the board updates in place; the reveal at every step
  and a route recomputed from what is known are not done.
- **Startup.** Set out now reaches the world within a second of the press in the browser spec, but a new world takes
  5.4–5.8 s warm and ~6.6 s cold in the engine (AX-04; maturity-22's measurements).

**Where automated evidence exceeds human play (inference):** everything in the first list has been seen by specs at
multiple sizes; only OR-159 and OR-91 have been seen to hold by the owner in play. The first fifteen minutes as a
whole have no human evidence of holding, and the owner's last two playtests are evidence that they do not.
**Open:** whether the reliable list survives a cold player who does not follow the gold.

## 2. Recurring trust failures

The five families the owner keeps meeting (unstable rows, indicators that do not carry into actions, broken focus,
broken undertaking continuity, incoherent map states) share three causes.

**Cause A: consumers reconstruct causality from predicates and words (fact, then inference).** The semantic
boundaries report (doc/design/kyr-semantic-boundaries.md) names it for the language; this mission's defects confirm it
in the presentation. Each of these was found to be a scanner disagreeing with the world:

- ChoiceGrouping.teaches decides "this reply teaches" by scanning a success's asserts, and excludes facts whose subject
  the act "makes"; a job's own given-marker counts as making it, so learning of the job is never blue (OR-178).
- AimAdvances and AimLeading scan objective predicates, rule effects and `teaches` to find a next step; a step that is a
  rule waiting on the clock is read as "talk to the reeve" again (OR-176), and a barred or guarded way was read as a
  step until Shut and Guarded were added (OR-167, OR-171).
- The page's glyphs and Attention decide focus and marks in src/ui and web/reader, apart from the engine (OR-173,
  the anchor-like glyph).

Every consumer that scans re-derives a slightly different model of "what this act does"; the Atlas, the gold, the
focus and the journal disagree because they are not reading one answer.

**Cause B: no state machine for the player's situation (inference).** Focus, engagement, the map in view, an aim
following, a journey under way and a fight are each a flag or a lens in a different layer. Nothing says which one the
player is *in*, so nothing guarantees their transitions: an aim completing does not hand the thread on (OR-179); the
map can be "in view" with the place drawn (OR-177's map case); an activity has no "during" (the focus audit). Engaged
was the first piece of such a state; it should be the model, not the exception.

**Cause C: tests check scenarios, not invariants over reachable states (fact).** test/one-world-map, test/one-gold-on-
map and test/journey-course-walked are the exceptions: they assert a contract at *every turn of a walk*, and the classes
they cover have not regressed. Most specs assert one turn.

**Gaps in tests (fact):** there is no spec that, at every turn of the golden walks, asserts (a) every coloured mark has a
witness *and* a reachable child act that keeps it, (b) the followed thread after an aim completes is its successor or
its payoff, or (c) the frame's view and the page's drawn stage agree. There is no browser walk that wanders (does not
follow the gold).

**The most important architectural correction (inference):** one engine-owned *transition summary* per action: what
it changes, teaches, risks, advances and ends, computed once from the declared effects and the world, and read by
Doable, Attest, AimContinuity, Engaged and the journal alike. This is the semantic boundaries report's Stage 2, and I
think it should be beta's spine rather than a maturity side-track: it removes the scanners that produce the trust
failures, instead of adding guards to each.

## 3. Responsiveness

| Layer | What we know | Kind |
|---|---|---|
| Engine, an ordinary act | median 104–126 ms locally, ratcheted under 170 ms (500 on CI); main-thread ~88 ms on perf-5; the row's own bar is 20 ms and the engine's 2 ms (OR-170) | fact |
| Engine, worst case | ~940–1,010 ms for acts that install (OR-91's history) | fact |
| Generation, a new world | 5.4–5.8 s warm, ~6.6 s in a fresh process; ~1.0 s of it parsing generated Kyr; installs 1.3–1.5 s; target 3 s (AX-04) | fact |
| Presentation | a press drawn taken < 100 ms at both sizes; a held journey committed at its hold's end (522–531 ms with drift paused); the map's rebuild at a journey's end (1.3–1.6 s) removed by updating in place | fact |
| Unnecessary steps | a focused activity still behind a "look at the thing" row (OR-173); aims needing a separate follow (OR-179); talks opened before a topic | fact (observed), cost unmeasured |
| Unmeasured | real devices (SP-05: no iPad or Safari measurement ever), the deployed page's cold load over the network, perceived settle (animation and fades), and intention-to-understanding: how long a player reads before knowing what to do | open |

**Inference:** the latency a player feels is now dominated less by any one engine cost than by *steps*: the extra press
to open, to follow, to put away. We measure milliseconds well and steps not at all.

**Measure next:** (1) intention to settled result per act on the deployed page on an iPad and a phone, by trace, not by
spec; (2) presses per completed intention over the golden walks (a "steps" ratchet); (3) the first new world on the
deployed page from Set out now to a readable first scene.

## 4. Gameplay maturity

**Closest to excellent (fact, from browser specs and the owner's earlier ratings; inference, as to "excellent"):** the
authored adventures with a strong single thread (The Long Man, The Lull, The Quiet in the Sky, Fair Weather) play end
to end in the browser and were the owner's best-rated pieces in earlier missions; the window table is the first
activity with real choices, stakes and endings; the vault keeper's warning and the old drain's centipede are the
first creatures that are *situations* (answers other than a fight).

**What prevents fifteen to thirty voluntary minutes (fact, then inference):**

- **Fights do not matter.** On the weir route both fights cost no hit point (test/weir-route); CB-01 is still open.
  Without risk the first hour has no tension.
- **Half the first hour has no picture.** 409 of 810 first-quarter steps drew a dim ground, mostly because Porthalen is
  raining and every painting of it is sunlit (doc/history/paintings/art-wishlist.md, the World agent's measurement).
- **Activities narrate instead of being played** (the focus audit: six of eight pins fiction or partial).
- **Trust failures break immersion** within minutes (§2), and each one teaches the player not to believe the marks.
- **Open:** whether the opening's *story* (the debt, the sea-gate, the kin) is compelling once the mechanics hold. We
  have never had a session long enough without a trust failure to know.

## 5. Architectural and authoring health

**Costs most (fact, then inference):**

- **Parallel scanners** of causality (§2, Cause A): AimAdvances, AimLeading, ChoiceGrouping.teaches, Teaching, Threshold,
  Means, Guarded, Shut and DangerSense each read predicates their own way. Consolidate into the transition summary.
- **Presentation decisions in two layers.** src/ui holds Attention, ScreenModel (at its 380-line limit) and choice
  grouping; src/presentation holds Doable, Glance and Attest; web/reader still holds icons and some focus. The one
  projection is real for rows and not yet for focus or marks.
- **Authoring through templates with conventions.** `{t}`/`{s}` templates, magic id shapes and label conventions
  (the report's §2) make the World agent's work possible and fragile: two agents' rows collided on an id (OR-169),
  and the SRD buck broke scripted replays in three spec files that encoded fight lines.
- **The process itself.** register-kinds, features.json, planning.json, closure-lint, the slice and queue: each
  check is sound; together every register edit touches four files and three linters, and much of the lead's day went
  to keeping them consistent.

**Simplify rather than extend:** retire scripted replays that encode moves (as-meant now plays fights out; finish
that); fold the pleasure template's sixteen two-step chains into a few engagements; make features.json and planning.json
generated from the register's own columns where possible; one landing lane at a time.

## 6. Next decisions

**Three changes for the greatest experiential improvement in beta (inference):**

1. **The transition summary, and every consumer moved onto it.** One engine answer to "what does this act do", read
   by the Atlas, the gold, the journal, focus and the aim. Proved by invariants over every turn of the golden walks:
   a mark has a witness and a child that keeps it; a completed aim hands the thread on; a blue reply teaches.
2. **The player's situation as one engine state.** Place, conversation, engagement, map, journey and fight as modes
   with explicit transitions and one focus, of which Engaged is the first. The page draws the mode it is given;
   Attention reads it.
3. **Risk and picture in the first fifteen minutes.** Fights that cost something on both acceptance routes (CB-01),
   and rain, dusk and night paintings for the ten most-seen subjects. Not new content: making what exists felt.

**Preserve:** the one projection and its parity measure; Engaged; Guarded and Shut (as consumers of the summary, later);
the walk-wide invariant specs; the window table as the engagement exemplar; land.sh.

**Retire:** fiction-only pastimes (keep three, as engagements); scripted fight lines in replays; closing rows on a single
scenario where an invariant exists.

**Defer to gamma/delta:** the Arcana and the perk stage, new SRD creatures, new adventures, conversation as dialectic
(OR-165), the studio (OR-164).

**Investigate independently (studies, not tickets):** (a) cold-play agents of different kinds, each fifteen minutes on the
rendered page with no instruction (amended 23 November: no gate waits on a human player); (b) the steps per intention measure; (c) whether a transition summary can
be derived for the existing corpus without author changes (the report's Stage 1 inventory).

**Assumptions the evidence challenges:**

- *That closing rows converges on quality.* It converges on the record; quality moved when contracts were fixed.
- *That headless proof generalizes to the page.* Each of today's five findings had a passing headless neighbour.
- *That breadth makes the first hour delightful.* The measured blanks are risk, pictures and focus, not quantity.
- *That parallel agents speed a mission whose problems are coherence.* They sped content and slowed integration.

## Alpha's disposition (recommendation)

**Declare complete:** zero client divergence for rows (OR-159 and the parity measure); input answered within 100 ms
with a secure long press (OR-91); the wall of rows resolved (CL-33); engagement as a frame state, with the window table
and the riddle as proof (OR-174, OR-177's riddle half); aims that do not loop on barred or guarded ways (OR-167, OR-171,
OR-172); the planning views and landing pipeline.

**Withhold acceptance of:** the first hour as trustworthy play. The three continuity invariants (OR-177 focus, OR-178
opportunity, OR-179 undertaking) are stated, partly diagnosed and not held; the map state, the reward hand-off and the
blue semantics are open; startup is 5–6 s against 3; fights are riskless.

**Before committing beta, three demonstrations:**

1. **The invariants as walk-wide specs**, written and run (failing is fine) over the golden walks, so beta starts from
   a measured count of contract breaches, not a ticket count.
2. **A transition-summary spike** over Iscoed's first hour: can one summary per action reproduce what ChoiceGrouping.
   teaches, AimAdvances and Attest compute today, and where it disagrees, which one is right?
3. **Cold-play agents of different kinds** (a careful reader, an impatient presser, a gold-follower, a wanderer),
   fifteen minutes each on the rendered page, to set beta's gate in what a player does rather than what a spec
   asserts (amended 23 November: agents, not a human).
