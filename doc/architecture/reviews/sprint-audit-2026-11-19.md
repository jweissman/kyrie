# Sprint 1 and 2 audit, and a Sprint 3 strategy (19 November 2026)

Read in `/var/tmp/kyrie/wt-m21`, branch m22 at `81a26d794` (main `bab94552c` plus the pending batch). I changed nothing
in either tree. The specs below were run one file at a time today; all are on m22. One scratch probe ran from
`/var/tmp/kyrie/s3audit-scratch/` (since removed).

I built on audit-plan-2026-11-19.md, written at `781af0bec`, 87 commits earlier. That audit mostly checked whether the
pins pass. This one asks whether each pin asserts the story's claim.

**What has moved since that audit:**

- OR-94, OR-114, OPR-01, MT-01, CL-34 and AT-07 are now fixed or met.
- `one-projection`'s `it.failing` is now a plain `it` (21 pass).
- `page-controls` counts 35 buttons, down from 53.
- Live P0s: FH-01, PP-05, OR-91 and AT-04.

**Verdict counts (13 stories):**

| Verdict | Count | Stories |
|---|---|---|
| MET | 6 | S1-2, S1-5, S2-1, S2-2, S2-5, S2-8 |
| WEAK | 6 | S1-1, S1-3, S1-4, S2-4, S2-6, S2-7 |
| Partly met by design | 1 | S2-3: met on its own acceptance; its HP-01 remainder is NOT MET |

No story has regressed: every pin passes today.

**Sprint gates:**

- **Sprint 1's gate** is met only as the owner re-scoped it. Its close note overclaims OR-91.
- **Sprint 2's gate** is NOT MET:
  - cold play 6 scored 5/10, below the 6.5 it was measured against;
  - cold play 7 scored 6/10;
  - no single run plays the eight beats.

---

## 1. Sprint 1: "Observe a cold player; repair the first passage"

| Story | Verdict | Evidence | What is missing |
|---|---|---|---|
| S1-1: cold play 4 on the deployed revision | **WEAK** | cold/cold-4-report.md:4,8 (6.5/10); CL-42..CL-50 registered (CL-42 and CL-44 closed 19 Nov, burn-7). test/iscoed-cold-four: 9 pass (19 s) | (a) **Not played on the deployed build.** OB-05 says so: "cold plays 2–7 were all played locally by bin/kyrie run… none on the deployed build". (b) The pin replays the kept lines only with the 19 Nov arrivals set aside (`test/support/before-rooms.ts`: cellar rats, crypt bats, adit beetles, the hand). So it pins the 18 Nov world, not the shipped one |
| S1-2: 9 CL rows fixed and pinned; CL-04 and CL-05 closed | **MET** (one weak pin) | All 11 rows are `fixed` in open-register.md. Pins pass today: small/warned-take 1, small/creature-presence 1, small/every-blow-told 4, small/fight-draught 1, objects 8, owed-borne 1, small/healing-priced 1, glance-rules 11, neighbours (audit), small/runner-labels 1, iscoed-cold-two 3, iscoed-cold-three 2 | **CL-05's sale half is vacuous in its pin.** test/small/runner-labels.test.ts:8 says "A buyer of what the company carries", but the yard's factor has no trade and the company sells nothing. A probe of the yard's offer showed only Talk, Wait, Camp, Light and Set down rows. So "a Talk row that is really a sale" can never arise there. The notice half is held by iscoed-cold-two:25–29. Fix: give the factor a Buys line and the party an item. small/warned-take injects a synthetic `screen.warned` into `Offers.scene`; the real vault is held by iscoed-cold-six-vault |
| S1-3: deployed recording, laptop and phone | **WEAK / UNVERIFIABLE HEADLESS** | recordings/s1-3-opening.md: no flash, no flicker; setting out takes 10.8 s on the laptop and 7.8 s on the phone. In the repo: only the md and s1-3-opening-desktop.png. The phone frames live only in /var/tmp/kyrie/m22/rec-s13/phone/, which a WSL restart wipes | **Reduced motion was not checked** (TO-03's own status says so). The phone evidence is not checked in. "No unexplained black" stands only because the ~10 s "Setting out…" checklist counts as explained (OR-08 and OR-23 are partly). Proof: a CI browser lane recording title → creation → setting out with `prefers-reduced-motion` on and off, its sheets checked in |
| S1-4: cold play 5, the elf mage | **WEAK** (same clause as S1-1) | cold/cold-5-report.md:6 (6.5/10). test/iscoed-cold-five: 13 pass (133 s); it also uses BeforeRooms | Played locally, not on the deployed build (OB-05). The triage's causes are all closed (CL-32 partly, CL-33 partly, CL-34 fixed, CL-42 fixed, CL-43 fixed) |
| S1-5: the opening's generic lines rewritten | **MET as carried** | CL-41, CL-39, CL-50 and CL-48 are closed | OR-75 is still `partly`: the owner's reading (Gate 2) is owner-blocked |

**Sprint 1's gate.** The goal: "a cold player reaches the first meaningful action without accidental interruption…;
top causes fixed".

- **Met for robots**, as the owner re-scoped it. No person has played (FH-01, P0, open).
- **The close note's "every input answered at once and a long press's commit held (OR-91)" is NOT MET.** OR-91 is
  still P0 `partly`: ordinary acts take 163–191 ms on iscoed and 282 ms on a1, against the owner's standard of
  microseconds to low milliseconds headless. Its browser half was split off as OR-127, open.
- The long-press half has no headless pin. Only a browser can prove it.

---

## 2. Sprint 2: "Make one first hour worth completing"

| Story | Verdict | Evidence | What is missing |
|---|---|---|---|
| S2-1: cold play 6 | **MET** | cold-6-report.md:5 (5/10). CL-51 to CL-56 registered. test/iscoed-cold-six: 2 pass; test/iscoed-cold-six-vault: 3 pass | The board's text says "CL-52… open", but CL-52 is fixed. Stale text |
| S2-2: beat map | **MET** | beat-map.md and scripts/beat-map.ts. Raw maps: /var/tmp/kyrie/m22/beat-{warrior,mage}-burn7.txt | The map now replays a world with the 19 Nov arrivals set aside, and the warrior's replay still stops at T90. The raw maps are not in the repo |
| S2-3: a new aim only on desire or work sought | **Met on its own acceptance; HP-01 NOT MET** | Every aim after T1 comes of a question or a find (beat-map.md, "19 November, later"). The five `{t}_u_*_job_sought when knows(party, {t}_u_notice)` Objectives are still in data/generation/town/undertown.kyrt, lines 238, 345, 422, 589 and 694. test/stories-apart (1 pass) orders the aims; it does not limit them | HP-01's bar: at most one principal aim and two prospects; a notice gives leads, not held aims. Nothing landed: the lead-aim branch holds only MT-11 (aca9cf9f7) |
| S2-4: one ordinary act changes the expedition, for both characters | **WEAK** | Warrior: test/barrow-forewarned, 4 pass (20 s). Mage: test/small/hireling-viable, 2 pass | **Warrior:** `Barrow.enter` (barrow-forewarned:31–37) teleports the company and retracts the groups and the dark, so the halls between are never played. Its own 4th case shows the jar *without* the forewarning also passes the king. So the measured change is "an aim appears", not a changed outcome; nothing shows an unwarned company would miss the jar. **Mage:** the pin is `Gauntlet`'s generic *human* mage, not the route's elf mage and its hire at Gatesend (Gesk). Nothing pins that the hire is offered and affordable on the weir route, or that the route's forecast changes with it |
| S2-5: a decision changes a person or place; a changed reception; through save and resume | **MET** (warrior) | test/drove-reeve: 2 pass. test/drove-resumed: 1 pass (`Digest.of` equal; freed, sold and paid all hold; "got the Brynach drover out" heard after resume) | The resume is an in-process checkpoint JSON round-trip, not the page's save. The weir life's return (sea-gate-claim's Porthalen line) has no save/resume pin, and S3-5 wants one |
| S2-6: the mage viable by help; a warning names the help | **WEAK** | hireling-viable passes. The vault's warning names help: iscoed-cold-six-vault:30–36 | The board's "a first-level abjurer alone wins 90.5 % of 200" is a census figure (srd-proving-cases.md:754) that **no spec holds**. The pin's mage alone *loses*, under 0.5 (hireling-viable:13), a different mage. Two numbers for "the mage", neither the route's, read as a contradiction. CB-03 stays open: "the route end to end (discover, afford, recruit, journey, survive or retreat)". The warning naming help is pinned only for the warrior's vault keeper, not for the mage's rats. CL-52 itself says "Not proved: that Carlin makes the keeper winnable" |
| S2-7: story sheets; ST-02 and ST-03 rebuilt; the handoff | **WEAK** (partly, honest) | ST-01 and ST-02 closed. pans-shared 2, pans-cut 2, sea-gate-claim 3, iscoed-roads 2 and stories-apart 1 all pass today | ST-03 is open on Nest at the gate. ST-04's status is internally contradictory: it says "the cold pans read the chain" and also "Open: the cold pans reading the chain"; the second is stale. WD-16 is held by the stop rule |
| S2-8: cold play 7 | **MET** | cold-7-report.md:2 (6/10). CL-58 fixed (small/road-waylaid, 2 pass); CL-59 fixed (small/runner, 5 pass); CL-60 and CL-61 fixed | CL-61 was a viewer fix (scripts/cold-play/show.py), not the game's: that is correct |

**Sprint 2's gate.** "Measured first by a sixth robot cold play… against 6.5, then by the beat map." **NOT MET.**

- Cold play 6 scored 5/10, and cold play 7 scored 6/10. Both are below 6.5, and two of the last three plays ended in
  sudden deaths.
- The goal, all eight beats for both characters, is not shown by one run. Each beat is proved by its own spec, from a
  teleport or a line prefix.
- **A structural gap the board does not name.** Since 19 Nov the content thread puts new foes into the first town's
  rooms. Every kept-play pin (cold 4, 5 and 6, terminal-again) and the beat map now sets those foes aside
  (`BeforeRooms`).
  - So the route as shipped is held only by the specs that do not replay kept plays: cold-two, cold-three,
    drove-reeve, drove-resumed, barrow-forewarned and lens-rows-valid.
  - Cold play 8 will meet a different, more dangerous first town than any pin covers.

---

## 3. Sprint 3 strategy

**Starting state** (what S3's board does not show):

- **S3-P is mostly done.** OR-94, OR-114 and OPR-01 are fixed. AR-21's single way-finder landed (KnownWays). Only
  OR-91's headless half (P′) remains in the sprint; its browser half is OR-127.
- **AT-07 is met; AT-04 (P0) is still partly.**
  - test/lens-rows-valid (1 pass, 7 s) checks that every row has words and *some* valid target.
  - It does not check that a row's words match what it does. AT-04's complaint was "took the company back to the
    landing": a navigation the row did not say.
  - It covers only the warrior's drove prefix.
- **`scripts/promise-fidelity.ts` does not run on iscoed**, which S3-2's acceptance names:
  - `bun scripts/promise-fidelity.ts iscoed 12` throws "no wanderer origin in iscoed";
  - its origin table (line 18) knows only a1, b2 and c3, and the walker is a human ranger, not a golden-route
    character.
- **S3-5 is partly done:** drove-resumed (completed facts through a resume), small/near-dead (the Gaffer's half of
  WM-01) and small/deed-and-note (a deed attributed at its time, NP-03).

**Order, by the owner's priorities:**

1. Atlas trust, including S3's promise and marks rows.
2. Base content (the content thread), which moves worlds and should land before any recorded clean run is kept.
3. P′.
4. The rest of the sprint.

| # | Story | Smallest proving slice | Invariant spec | Size | Moves worlds? | Depends on | Rows closed (→ advanced) |
|---|---|---|---|---|---|---|---|
| 0 | **S3-H, hygiene (no code)** | S3-P's row list cut to OR-91 (+OR-127). Fix ST-04's stale "Open" line and S2-1's CL-52 text. Give `promise-fidelity.ts` `iscoed: 'drove'` and an `--as`. Add a buyer to runner-labels' yard (S1-2's weak pin) | small/runner-labels, made non-vacuous: a factor that buys, the company carrying a thing | XS | no | — | ST-04 text; sharpens CL-05 |
| 1 | **S3-2 + AT-04, the promise corpus, golden route first** | promise-fidelity over iscoed/drove as `human/warrior/Wenna` and iscoed/weir as `elf/mage/Ilse/scholar`, 24 turns each. Cold plays 2–7 read for cases, each as state / signal / act / result / contract, with AT-04's blank row as case 0. Extend lens-rows-valid: (a) a `travel:` or `go(` row's words name its destination; (b) the weir prefix; (c) the paged places lens with its cursor at row 0 (AT-04's "first row blank" may be the pager's) | test/lens-rows-valid extended: words ↔ target, both routes. A new test/golden-promises: promise-fidelity's `Promises.broken` empty over both 24-turn walks (a pin, not a census) | S | no | 0 | AT-04 (P0, if the stronger invariant passes and holds it: close as not reproduced under it); PB-24 (iscoed), AP-01 → AP-07, CL-33 |
| 2 | **S3-3, repair the corpus causes in the projection; HP-01 first** | HP-01: the five `*_job_sought` (undertown.kyrt:238–694) collapse into one lead, "Ask {merchant} about the work on the notice". Each job's aim arises on speaking to its giver. Then each S3-2 case, fixed in Doable or Offers and never in CSS | test/stories-apart extended: after "Read the notice", at most one principal aim and two prospects, on iscoed (the mage at Gatesend, cold-5 T1) and a1. One compact fixture per S3-2 causal class | M | **yes**: `compat --quick`, then CI (expect a1 and iscoed/weir aims to move; the kept plays' prefixes re-checked). Pairs with the lead-aim branch (L) | 1 (corpus) | HP-01, CP-13, the remainder of FH-05, S2-3's remainder; CL-33 (verify-close) → OR-74, US-07, AP-07 |
| 3 | **S3-0, one clean run of the eight beats, on the shipped world** | Two line files driven by label regexes (as drove-reeve's `take`), **without** BeforeRooms. Warrior: notice → Owain → rhyne → the reeve's ruling → the innkeeper's bane → the barrow walked through its halls with a hire → the crown → the landing's word → Bran west. Mage: cold-5 → Gesk hired at Gatesend → gate shut → Porthalen. Record each with `bin/kyrie review record` into mission-22/review/golden-{warrior,mage}/ | A new test/golden-run, one `it` per character: each beat's witnessing fact asserted at the step it occurs (`knows`, `freed`, `reeve_ruled`, the gate shut, a reception line), and a save/resume at beat 7. **This replaces S2-4's teleport and S2-6's proxy** (the mage's hire offered, affordable and changing the forecast on the route) | M | no (but moved by every content change: assert facts, not lines) | 2 and the content thread's current batch (the arrivals and held hazards) so the run is not re-cut at once | the Sprint 2 goal; CB-03's "route end to end" → S2-4 and S2-6 made strong; CL-52's "Carlin makes the keeper winnable" |
| 4 | **S3-P, P′ per-act cost (OR-91 headless)** | One harness (like small/forecast-time and small/screen-once): pure simulation vs headless session, by act class (talk, go, take, fight round, travel leg), on iscoed. The largest session cost first (the offered actions' `at` re-read ~25 ms, then the screen's parts, ways and leaf). A causal-extent invariant: the number of projections rebuilt is bounded by what the act changed | small/screen-once extended to counts per act class, plus a timing ceiling on a quiet runner, CI only. test/projection's "only those whose part changed" asserted for every act class | M–L | no | none (runs beside 1–3, the maturity track's first step) | OR-91 (headless half) → AX-05, OR-08, OR-114 (stays fixed); OR-127 stays on the CI browser lane |
| 5 | **S3-4, prose and painting against the golden trace** | Over S3-0's two traces: each step's painting against fit.json (light, time, weather, underground), and every narrated line from a rule the company did not perceive (CampaignTick.heard). Fix only the cases found. A painting that contradicts is removed, not made conditional | test/golden-told: no line or painting in the golden traces contradicts time, light, life or death, or location (a reader over the recorded frames) | S–M | no (paintings and prose binding are presentation; data/paintings/fit.json only) | 3 | OA-13 (golden route), NP-02 (golden route) → NP-01, CO-17 |
| 6 | **S3-5, the return verified** | The weir life's return through a resume: gate shut, the reeve's "So that is who" at Porthalen after `PlaySession.resume`. Dead people do not speak on the golden route: Joss Hatherly, and the dead after the vault, asserted silent. WM-01's remainder is a1's deserters, off the route: re-home it to its own row or verify it there | test/drove-resumed's twin for the weir (test/weir-resumed). small/deed-and-note covers attribution. A "no talk row for the dead" assertion over test/golden-run's trace | S | no | 3 | FH-08 (golden route part), CL-09, CL-46 (verify-close), CP-04 (likeness against the person: fold into 5) → WM-01 |
| 7 | **S3-1, cold play 8 on the deployed build** | `scripts/cold-play.sh` against Pages (the deployed main after 2–4 land), a robot, the post-play questions on marks and colours (§8 step 1). Run only when the machine is free (one heavy job) | its CL rows pinned as before; and the cold-play pins stop needing BeforeRooms (the new kept play is of the shipped world) | M (wall time), XS code | no | 1–4 landed and deployed; FH-01 (a person) only after AT-07's steps and the worst trust failures (the owner's ruling of 19 Nov) | OB-05 → OB-17, FH-01 (still the owner's) |
| R | **Reserve: lone-novice danger** | AP-13: a last-seen record on a way into a room where a deadly band was seen. SI-08: a look before a one-way drop. This is the content thread's "lone warrior's balance with more fights" | small/ambush-marked's sibling for a seen band; novice-viability over the first town *with* the 19 Nov arrivals | S each | AP-13 no; balance yes | 3 (where S3-0 dies, it decides) | AP-13, SI-08 → SI-01, CB-03, FF-05 |

**Rationale.**

- **Atlas trust is S3's goal.** The owner's top priority, AT-04 (P0), and S3-2's corpus are the same work: do they
  together first, both cheap and no world moves.
- **HP-01 is the one corpus cause already known.** It moves worlds, so it goes through compat before the clean run is
  recorded. A clean run recorded first would be re-cut by HP-01 and by the content thread's next batch.
- **S3-0 is the Sprint 2 debt.** It should replace the weak S2-4 and S2-6 pins and the BeforeRooms masking with one
  route played as shipped. Asserting facts rather than lines keeps it alive through content work.
- **P′ is independent and touches no worlds.** It runs beside 1–3 as the maturity track's first step, closing the last
  engineering P0.
- **S3-4 and S3-5 are cheap once S3-0's traces exist.** They read those traces rather than building new walks.
- **Cold play 8 goes last.** It is the sprint's measure, on a deployed build that carries the repairs.

---

## 4. Proposed register edits (not applied)

```json
{
  "ST-04": {"status": "partly (19 Nov, sprint audit): the cold pans read the chain (pans.cut_clear, pans.poled, the salt in the reeve's tally: test/pans-cut, test/export-roles, run 19 Nov: pass). Open: only the Tower's reckoning of that tally past the march, WD-16's (recorded, not built, under the stop rule). The older line 'Open: the cold pans reading the chain' is withdrawn as met"},
  "AT-04": {"status": "partly (19 Nov, sprint audit): Doable.made and test/lens-rows-valid (run: 1 pass) hold that every drawn row has words and some valid target on the drove prefix; they do not hold that a row's words name what it does (the complaint: a row that took the company back to the landing), nor the weir route, nor the paged places lens at its first row. Next: lens-rows-valid extended (words ↔ destination, both routes, the pager at row 0), then close as not reproduced if it holds (Sprint 3, S3-2)"},
  "CB-03": {"status": "partly (19 Nov, sprint audit): test/small/hireling-viable holds a generic human mage (alone < 0.5, with any hire ≥ 0.85); the route's elf mage (an abjurer: 90.5 % alone over 200, srd-proving-cases.md:754) is unpinned, as is the hire at Gatesend offered and affordable on the weir route. Open: the route end to end (discover, afford, recruit, journey, survive or retreat), to be held by test/golden-run (S3-0)"},
  "CL-05": {"status": "fixed (18 Nov): a talk's row that does another act is called by that act's words (test/small/runner-labels), and Bran's tally-stick is taken only when taken (test/iscoed-cold-two). 19 Nov, sprint audit: runner-labels' yard has no buyer and nothing to sell, so its sale half is vacuous; give the factor a trade (S3-H)"},
  "HP-01": {"status": "open (19 Nov, sprint audit, verified): the five `{t}_u_*_job_sought when knows(party, {t}_u_notice)` Objectives (data/generation/town/undertown.kyrt:238, 345, 422, 589, 694) still make each job a held aim; nothing landed on lead-aim beyond MT-11. Sprint 3, S3-3's first: one lead from the notice, each job's aim on speaking to its giver; compat --quick then CI (world-moving)"},
  "OB-05": {"status": "open (19 Nov, sprint audit): also S1-1's and S1-4's 'on the deployed revision' were met only as 'at the deployed revision, played locally'; the kept-play pins now set the 19 Nov arrivals aside (test/support/before-rooms), so cold play 8 on Pages is the first measure of the shipped first town (S3-1)"},
  "OR-91": {"status": "partly (19 Nov, retargeted by the owner: \"unacceptable … sometimes 200 millis\"; sprint audit: Sprint 1's close note 'every input answered at once… (OR-91)' does not hold): ordinary acts 163 to 191 ms on iscoed, 282 ms on a1, almost all the session layer rebuilding after each act. Next: P′ (Sprint 3, S3-P), layers measured apart by act class, the largest costs first, a causal-extent invariant; the browser half is OR-127"},
  "TO-03": {"status": "partly (19 Nov, re-checked; sprint audit): unchanged; the S1-3 recording's phone frames are kept only in /var/tmp/kyrie/m22/rec-s13/phone (not in the repository); the proof wanted is a CI browser recording with reduced motion on and off, its sheets checked in"}
}
```

Also outside the register: current-sprint.md's S3-P row should name only OR-91 and OR-127. OR-94, OR-114 and OPR-01
are fixed.

## 5. Specs run today (m22 at 81a26d794, one at a time)

All pass:

| Group | Specs (pass count, seconds) |
|---|---|
| Small | warned-take 1 · creature-presence 1 · every-blow-told 4 · fight-draught 1 · healing-priced 1 · runner-labels 1 · hireling-viable 2 · one-projection 21 · page-controls 3 · road-waylaid 2 · runner 5 · spoken-deed 1 · register-count 4 · shut-site-means 1 · aim-continuity 4 · promises-kept 5 · signals 2 · atlas-perception 7 · screen-once 1 · paintings-fit 5 · heard-where 2 · near-dead 1 |
| Medium | glance-rules 11 · objects 8 · owed-borne 1 · lens-rows-valid 1 (7 s) · iscoed-cold-two 3 (10 s) · iscoed-cold-three 2 (9 s) · iscoed-cold-four 9 (19 s) · iscoed-cold-six 2 (23 s) · iscoed-cold-six-vault 3 (16 s) · drove-resumed 1 (9 s) · drove-reeve 2 (11 s) · pans-cut 2 (19 s) · pans-shared 2 (13 s) · barrow-forewarned 4 (20 s) · sea-gate-claim 3 (30 s) · stories-apart 1 (4 s) · iscoed-roads 2 (28 s) |
| Longer | iscoed-cold-five 13 (133 s) |

One script failed: `bun scripts/promise-fidelity.ts iscoed 12` throws "no wanderer origin in iscoed"
(scripts/promise-fidelity.ts:18,25).
