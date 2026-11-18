# Trust contracts: the owner's commission (18 November 2026)

Kept verbatim. Its rows in the register are TB-12 (Doable) and TR-01..TR-03 (travel), beside the rows it closed; the
investigation and the contracts' state are in trust-contracts.md.

---

My latest cold playthrough still exposes serious failures in the basic interaction contract.

The Color Atlas presents promises that do not consistently lead to anything. Lenses do not reliably reflect the actions they contain. Gold navigation can disappear when its destination is reached. The map and travel systems do not yet make movement through the world feel continuous and materially consequential.

These defects are more important than adding further content or visual complexity.

I would like us to **derive and enforce a small set of mechanical invariants**, using the actual engine and reader, so that we can stop correcting these failures one at a time.

## A. Every opportunity indicator must have a witness

A displayed Atlas aspect must be justified by an authoritative opportunity or a well-defined, explicitly communicated continuation toward one.

We should be able to trace:

**World fact → character perception → eligible opportunity → action or destination → aspect → visible indicator.**

Do not calculate a rail pip separately from the actions that rail control can reveal.

For each indicator, provide a testable explanation of which opportunity justifies it and why the character can perceive that opportunity.

A colored indicator without an eligible, reachable witness is a defect.

An indicator must also disappear or change when the underlying opportunity changes, including after an action, movement, a failed check, a change of undertaking, or restoration from a save.

The interface must not preserve stale promises.

## B. Enforce navigation continuity, especially for gold

I continue to encounter gold navigation guidance telling me to travel somewhere, followed by no gold opportunity when I arrive.

Please trace and reproduce this behavior.

A gold route should identify the followed undertaking and the intended action or intermediate destination.

When the player reaches the indicated destination, one of the following must occur:

1. The undertaking's actionable next step is now perceivable and accessible.
2. A further justified step toward it is presented.
3. An actual world event has changed, blocked, or completed the undertaking, and the player is told why the guidance changed.
4. The player has reached a legitimate investigative frontier, clearly identified as such, where they must discover a route or prerequisite.

Gold must not vanish silently because the route planner and local opportunity projection interpret an objective differently.

Please use the existing resolved objective-target machinery where possible rather than adding another heuristic.

Test this across multi-leg routes, towns, enclosed sites, underground rooms, interruptions, changed objectives, and return journeys.

## C. Make lens indicators inherit from their contents

I would like to examine a simpler governing model:

**A rail lens is a way of focusing attention on available actions. Its indicators summarize the actionable opportunities it exposes.**

If a lens is marked green, blue, red, gold, or violet, opening it should reveal the corresponding opportunity.

For the Map, "Put away the map" should return to the local area and inherit the meaningful opportunities available there. It should not be a semantically blank control when the return destination has significant opportunities, nor display promises the local scene cannot justify.

Make the return indicator a projection of the underlying scene rather than a separately inferred classification.

Focus, opened state, and availability must be visually distinguishable and accessible.

Please audit the entire rail for inconsistent treatment of these states.

## D. Reconsider the Book and propose Gather Your Thoughts

The Book currently appears in the same rail as the action lenses and may display a pip.

Its record of what has been learned is not itself an available action.

Please distinguish unread information or journal updates from Color Atlas opportunities. They must not use the same visual signal in ways that can be confused.

Consider whether the Book belongs outside the action-lens rail, accessible as a separate persistent reference instrument.

Explore a possible **Gather Your Thoughts** lens or instrument for internal actions such as:

- Reflecting on known facts.
- Drawing supported deductions or inferences.
- Preparing spells and studying.
- Recalling relevant knowledge.
- Other character-owned mental or preparatory activities.

A deduction must be supported by facts the character actually knows and by a real authored or systemic inference. It cannot simply create information because the player pressed a reflection button.

For now, study the distinction and prototype only if it helps clarify the interaction architecture.

## E. Give travel an authoritative sequence of perceptible steps

Travel should unfold through actual movement, not appear to transport the company to a distant location before revealing the terrain it traversed.

Review the current `Travel.go`, `Itineraries`, hex-boundary, world-expansion, and browser-map contracts.

For every leg of a journey:

- Update the company's true location.
- Advance time by the appropriate cost.
- Apply relevant fatigue, provisions, and travel effects.
- Update perception and map knowledge from the new location.
- Show the company's progress through the route.
- Evaluate meaningful interruptions using the world state reached at that step.

The displayed map must not reveal information before the character has earned it, or fail to reveal information the character should already know.

A route's animation must describe real state transitions, not conceal a premature teleport.

Use semantic journey assertions as well as browser recordings.

## F. Make longer journeys expensive but not laborious

I want overland travel to matter.

A journey across six or eight hexes should feel substantially different from crossing one neighboring hex.

Investigate the actual costs and balance of:

- Travel time over roads and difficult terrain.
- Provisions and water.
- Fatigue, rest, weather, and exposure.
- Load and carrying capacity.
- Horses, mules, donkeys, carts, and other pack or draft animals.
- Different travel speeds and feasible modes of transport.

Equipment and animals should create real choices and meaningful advantages.

A pack animal might increase carrying capacity and support a longer expedition without necessarily making everyone travel faster. A riding horse might increase speed but have its own costs. Roads, terrain, supplies, and circumstances should determine those tradeoffs.

Avoid making ordinary travel artificially slow through excessive mandatory clicks or animations.

The player should spend meaningful fictional time, not unnecessary real time.

Before setting out, provide a compact, honest reckoning of the expected time, supplies, and known risks. Unknown hazards should remain unknown.

## G. Reduce meaningless interruptions

I repeatedly encountered interruptions while traveling, sometimes almost every other step, without encountering particularly interesting situations.

Please investigate encounter frequency and interruption quality separately.

A routine event does not necessarily need to stop an automatically progressing journey.

An interruption is justified when the player must make a meaningful decision, is endangered, discovers something significant, encounters a changed route, or has a material reason to reconsider the journey.

Distinguish background events, narrated travel incidents, optional discoveries, and mandatory interruptions.

Preserve uncertainty and occasional danger without turning every journey into a sequence of low-value encounters.

Measure the frequency and consequences of interruptions across representative six-to-eight-hex journeys.

## H. Create mechanical trust contracts

Please develop focused, predominantly headless tests for the following invariants:

**Indicator soundness:** every colored pip has a valid witness in the opportunities it represents.

**Indicator freshness:** pips update after relevant world and session changes.

**Lens inheritance:** a lens derives its semantic indicators from the actual opportunities it exposes.

**Return inheritance:** closing a map or another view restores the correct local opportunities and their meanings.

**Gold continuity:** following a justified gold route produces a legitimate continuation, a changed undertaking, or an explicit, grounded interruption.

**Travel continuity:** every traveled leg has an actual location transition, appropriate costs, perception updates, and an opportunity for interruptions at the correct point.

**Knowledge integrity:** neither a lens nor the map reveals undiscovered information merely because the engine knows it.

**Restoration:** saving and resuming produces the same truthful opportunities, route state, and character knowledge.

Include concrete counterexamples that should fail each contract. Test the authoritative projection first, then verify a few representative cases through the real browser interface.

Do not create a second simulator or independently infer game meaning in the browser.

## I. Delivery and priority

Please begin with a short investigation of the specific observed failures and their common causes.

Then fix the smallest shared mechanisms necessary to enforce the contracts.

The highest priorities are:

1. Gold guidance that vanishes at its destination.
2. False or stale Atlas pips on rail controls.
3. Inconsistent lens contents and focus.
4. Travel that fails to unfold leg by leg in the player's experience.
5. Travel balance and excessive meaningless interruptions.

The Book and Gather Your Thoughts questions should receive a design recommendation, not an immediate large feature implementation.

Provide concise, reproducible playthrough evidence and regression tests. Show that these fixes work across multiple generated worlds, characters, and routes—not only one repaired example.

**The criterion for acceptance is that a player can trust what the interface promises, understand where they are going, discover what awaits them as they travel, and rely on the world to respond consistently.**

Until that foundation works, further expansion of the Atlas and other interface systems should be treated cautiously.
