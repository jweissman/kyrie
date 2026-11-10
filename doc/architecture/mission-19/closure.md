# Mission 19: closure report

Written 10 November 2026 by the builder, at the owner's commission of 9 November ("close it responsibly"). The
brief's seven accounts as they stood on 8 November (content migration, authoring workflows, the Encyclopedia) are
kept in [closure-draft-2026-11-08.md](closure-draft-2026-11-08.md) and are not repeated here. This is an account,
not an acceptance: **no cold player has played this build**, and the brief's own test of success (§XIV, "I want to
continue") has been put to no one but the builder and scripts.

## 1. Verdict

M19 closes as an **implementation mission with its player-experience acceptance unmet**. It built a great deal that
works when a script drives it; it did not make the first hour reliably understandable to a person. The owner's play
of 9 November (register M19-224..232) found guidance, movement, combat, talk, notes and the pack each still
misleading or awkward within minutes.

What this closing pass changed is narrower and, for the first time, checked as a player meets it: the aim's target
and how it is followed; cross-hex movement as a rule of the campaign rather than of the page; and one honest-start
journey that proves the opening can be found, not only done (§3, §4).

## 2. The commission reconciled

The brief's priorities (brief.md §III–X) and journeys (§XII) as they stand. *Implemented* means in the code;
*verified* says by what. Nothing here is accepted by a person.

| Obligation | State | Evidence | What remains |
|---|---|---|---|
| III. The adventuring loop, one continuous experience | **Partial, unaccepted** | honest-start (headless, the page's leads only): the kin errand to its end; the debt from the shop to a barrow, a fight, loot, a save restored | The page leads a lone newcomer into an unsurvivable room (§5 D1); with no aim it leads nowhere (D2); light runs out in the hour (D3) |
| IV. The player-facing product | **Partial** | The followed aim's gold and the question it asks; the fight's bar with targets on the cards; the pack in three; talk with nothing to say withdrawn | The new fight and pack seen rendered only by the CI tour (§4); Notes vs Story (M19-228), narration bound to perception (M19-229), one design language (M19-231) not done |
| V. Identity consequential | Partial (unchanged since 8 Nov) | Journey 2, by the builder, 7 Nov | Talk that knows a calling (M19-141), deferred |
| VI. Content activation | Partial (unchanged) | Journey 6, 7 Nov | Adventures add no Encyclopedia entries (M19-148) |
| VII. Human-scale authorship | Partial | Journey 5, 7 Nov; `toward` is now how an author says what an aim is about | Prose generators in TypeScript (M19-44) |
| VIII. World coherence | Partial | — | Sea passage, the metropolis: deferred |
| IX. Architectural integrity | Improved | An objective target contract; the cross-hex rule in the campaign | ModuleShadow (M19-69, open risk); authored lands outside the rule (§6) |
| X. The Encyclopedia | Partial (unchanged) | — | Reached from the pack only |
| PD-14: five cold players | **Unmet** | — | The first thing M20 should do (§8) |
| Journeys 1 and 4 rendered (M19-155, M19-173) | **Unverified through the page by a person** | Headless; the CI tour (§4) is the first rendered attempt by leads alone | A person's play |
| One protagonist across the adventures | **Unverified** | Each adventure's own journeys | The 21 adventures never played together |
| Knowledge to action (PD-08) | **Partial** | §3.1 | Notes are still a state viewer (M19-228) |
| Cross-hex movement structural (M19-224) | **Implemented; verified in generated countries** | hex-ways (the campaign refuses; a journey takes it), choice-contract (a map choice set out on) | Authored countries' walks between their own places, left to their authors (§6) |

The register ([register.md](register.md)) is reconciled row by row there; at this writing it holds 252 M19 and PD
rows: 144 fixed, 24 partial, 27 open, 49 deferred to Mission 20 (each with a reason), 1 open risk, 4 not
reproduced, 1 not borne out, 2 superseded. *Fixed* means implemented and checked by a spec or the builder's play; none is a player's
acceptance.

## 3. What this pass changed

### 3.1 The aim's target

* Kyr: `Objective id when … toward a, b "…"`, parsed, namespaced with the installation's ids, refused by the
  compiler where it names no entity. Declared for every origin's aims, the drover's and the fever's, and the first
  town's three jobs and the dungeon under them: the reference opening.
* One resolver (`src/ui/objective-target.ts`) gives every aim a `subject`, an `actionAt` and a `routeTo`, and says
  whether its author said them or they were read from its words (`legacy`; `ambiguous` where its places do not
  nest). An aim without `toward` is read as before, less two old faults: a place named only as an address (the
  corn-store over the cellar, Brockfield for Lothar) is no longer the aim, nor is everything inside what it names.
* The map is given the town or site someone is in, never their room: a target is not knowledge.
* Whom the aim names is led **for what serves the aim**: a reply whose effects change what the aim waits on (matched
  call by call, one rule away), or the question its words ask; never for every question they could be asked, never
  with "Take your leave". Someone with nothing to say but goodbye is no longer offered as someone to talk to.
* Links in the chain: a road to where the aim is is set out on from a town; a site off the green no longer holds
  back the aim's journey; an aim someone waits on is the company's own; the errand's next part is followed; the debt
  goes on from the inn to the nearest place told of there.

### 3.2 Cross-hex movement

`src/hex-boundary.ts` says when a way goes into another cell of a generated country's land, for the page and the
campaign alike. `Campaign` refuses such a command unless it is the leg `Travel.go` is taking
(`src/campaign/crossing.ts`). The map's crossing step is a `travel:` journey like every other. Scripted drivers
take a crossing as a journey leg (`PlaySession.leg`), and drivers of the page's engine send a travel request.

### 3.3 The owner's defects of 9 November

| Row | Done | Not done |
|---|---|---|
| M19-225 aims | §3.1 | Seen by a person |
| M19-226 combat | Attack, Abilities, Spells, Items, Other; whom it can reach lit on their cards with the chance, clicked | Seen by a person |
| M19-227 talk | Talk with nothing to say withdrawn; the aim's reply led and gilded | Exchange rather than topics: M20 |
| M19-230 pack | Worn and in hand / supplies / carried; a thing packed at the start says where from (the firewood is a calling's kit) | — |
| M19-232 chandlery | Its own painting and kind | 33 more of the owner's backgrounds unplaced (register) |
| M19-228, M19-229, M19-231 | — | §8 |

## 4. Verification: what ran, and what it cost

| Measure | Before | After | Where |
|---|---|---|---|
| CI wall clock | 45 m 40 s, suite shard 1 of 5 cancelled at its limit, as in every run seen (the review's run at c56669b4) | **40 m 35 s, every job passing**: six suite shards of 22–41 min, both browser shards, the long descents, the player contracts, the reference hour | GitHub, run 42767926775; main fast-forwarded to it |
| Spec files with no kept timing | 160 (about 180 test-minutes the shards could not weigh) | 0, read from a complete CI run | test/timings.json |
| Player contracts job | — | 2 m 31 s, including checkout and install | GitHub |
| Reference hour through the page | — | 2 m 31 s | GitHub |
| Building the browser site, once | — | **2 s** | GitHub |
| Browser shard 1, test step, site built once | 14 m 37 s | 14 m 54 s | GitHub |
| `test:intent`: target, hex, choices, stakes (12 tests) | — | 47 s, one process | local |
| `test:honest`: the opening, two journeys | — | 20 s | local |
| `test:quick` (572 tests) | — | 42 s | local, 16 workers |
| A save after about 25 commands (kahitude) | — | 22 MB | honest probe |

**The site was not the lever.** One build takes two seconds, so the twenty-six specs' rebuilds cost under a minute;
building it once changed the shard's time by nothing measurable. The shared site also was not equivalent: built with
every fixture, its larger bundle made the handbook specs time out. It was reverted. The throughput review's
hypothesis that site rebuilds drove browser time is not borne out; the time is in the journeys themselves. Shard 1
of five had been cancelled at its 45-minute limit in every run seen, so its specs were never seen to pass: 160 spec
files had no kept timing, and the shards could not weigh them. A sixth shard and the missing timings, read from a
complete CI run, made the whole suite pass for the first time in this mission's record. The shards still range from
22 to 41 minutes; their balance is the next CI lever, before any cache or fixture service.

New in CI: a **player contracts** job (`test:intent`, `test:honest`) that answers in minutes, before the suite's
verdict; and a **reference hour** job that plays the debt's opening through the page by its leads and keeps a
picture of every step as the run's artifact. That job is evidence, not a gate.

Running the full suite locally with sixteen workers took the machine down on 9 November. Full runs belong to CI.

### 4.1 The reference hour through the page

The CI tour (run 42753530116, its pictures the run's artifact) played the debt's opening in Chromium by the page's
leads alone: the creditor's talk with the promise gilded; out to the landing and into the Stormy Horn; Aiden's
question gilded; the Map key lit, and the map opened over the place with Lapisrecs chosen, its route, its hour of
arrival and "Set out for Lapisrecs"; into the barrow by the forecourt and the long passage; the bats fought with the
new bar (Attack, Abilities, Other, one size); a torch lit; the flute's own pane with Take. What it showed amiss: a
warding thing told as "lies dead" after the fight (M19-238), and the fight's detail line still in the engine's words
(M19-121). This is a script following leads; it is not a person's play.

## 5. Defects found by playing as the page leads

From the honest-start probes (kahitude, a lone warrior, the kin and debt openings), every step the page's own lead:

* **D1 (M19-233). The page leads a newcomer into death.** The inn's nearest old place (Lapisrecs) holds a mummy in its long
  gallery that kills a level-one company as it comes in; nothing on the way warns of it. (M19-87, M19-117's family.)
* **D2 (M19-234). No aim, no direction.** Once the kin errand is done, nothing is followed (an aim only heard of is never
  followed for the player, by the owner's rule of 28 October), and the page greets people room by room and never
  points to the notice of jobs on the green.
* **D3 (M19-170). Light runs out within the hour**, and a trap was then led to in pitch dark, alone and hurt.
* **D4 (M19-235). Greetings led as if something were owed** ("Talk to Piers" → "You're back, then"): a lead that says nothing.
* **D5 (M19-236). A save is 22 MB** after a few dozen commands in a generated world.

## 6. Architectural findings and risks

* The two contracts the quest-intent review proposed were the right size. One was larger than it said: holding
  authored countries to the hex rule turned the walks of every authored adventure into refusals, so the rule holds
  over generated countries; an authored country's own map keeps its author's walks until each is reviewed (M20).
* Inference remains for every objective without `toward` (about 200 in the corpus). The resolver marks them
  `legacy`; an author lint for the ambiguous ones is not yet written.
* The campaign takes a crossing only as a leg it was told of by `Travel.go`. Any new driver must use
  `PlaySession.leg` or a travel request, or be refused. That is the intent, and a cost to spec authors.

## 7. Why so much implementation and testing did not make a playable game

* **The unit of verification was the script, not the player.** The long journeys knew their path. They proved a
  quest could be completed, never that its next step could be found. The first test to play only what the page
  leads with found five defects in its first run.
* **Each complaint was repaired where it was seen.** Aims leading out of buildings were fixed in five places
  (`whereabouts`, `inside`, `been`, `direct`, the browser's map choice), because no one statement existed of what an
  aim is about. The cure was a contract, not a sixth patch.
* **Rules were kept by hiding buttons.** Cross-hex movement was "fixed" in the page twice before it was a rule.
* **Breadth arrived faster than the opening could absorb it.** Adventures, paintings, species and planes were
  integrated during a stabilization mission; the register grew to 246 rows, and closing rows became the work.
* **The builder accepted its own work.** "Fixed" rows were checked by the builder's specs and the builder's play; no
  cold player has played since the protocol was written (PD-14).

## 8. The first days of Mission 20

The goal is one reliably enjoyable first hour: one world (kahitude), one ordinary character, the debt and the first
town's jobs. Nothing else enters main until it passes.

1. **Day 1.** Freeze content. Read the CI reference-hour tour; the owner and two cold players play the same build;
   their notes go into one list, not the register.
2. **Days 1–2.** D1 and D2: the inn tells of places a newcomer can survive; with no aim, the page points to the
   notice and its jobs; light that lasts an evening.
3. **Days 2–3.** Notes and Story as two projections, aims and leads on one side and what happened on the other, with
   no folds (M19-228). Narration bound to where the company is (M19-229, with M19-126's lint for unanchored words).
4. **Days 3–4.** Conversation as an exchange for the three or four people of the first hour (M19-227).
5. **Day 5.** The cold-player protocol (PD-14) on the frozen build. Its result decides what comes next.

## 9. What would make commissions and collaboration more effective

* **Name the journey and its acceptance, not the feature.** "A cold player finds and finishes the rats job" can be
  checked; "make aims coherent" invited a sixth patch.
* **One reviewer, one build, one week.** Reviews of a moving tree were partly stale on arrival; the cross-hex finding
  was right, but the tree it described had moved.
* **Independent authors deliver honest-start play**, a `toward` on every aim that asks something, and a failing test
  for any engine request; new adventures wait on branches while the opening is red.
* **Heavy runs belong to CI**, and the builder's machine to the inner loop: typecheck, lint, one spec at a time.
