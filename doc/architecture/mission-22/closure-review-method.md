# Closure review — method and pilot (19 Nov, lead)

Sample: /var/tmp/kyrie/m22/closure-sample.json (seeded, reproducible; 30 "no test/ path" + 20 "names test/ path" of 418
closed at 322eb934f). Note: the split regex missed specs named in backticks without `test/` (`told-way`,
`small/gold-fight`), so "no spec" overstates; classify by reading, not by regex.

Verdict per row:
- MET — a spec named (or found) tests the row's own claim; it would fail if the defect returned. Cite spec:line.
- WEAK — a spec exists but tests something weaker (staged facts instead of the played chain, a neighbour that passes
  either way, a generic actor instead of the route's). Say what's untested.
- UNSUPPORTED — closed with no evidence ("done"), no spec found by searching for its words.
- REGRESSED — evidence it no longer holds (a spec fails, code reverted, a probe shows it).
- NOT-A-FIX — closed as not reproduced / superseded / out of scope: legitimate, but counted apart from fixes.
- DECISION — a ruling or process rule, not a defect: counted apart.
- HEADLESS-UNVERIFIABLE — needs a browser/human; say what would prove it.

Pilot (5): PL-10 MET (test/small/gold-fight.test.ts:38 tests exactly the dark-cellar claim); R10-17 WEAK
(test/told-way.test.ts asserts knows(...) directly and checks Itineraries.plan; the claim's chain — the debt's aim going
on to the next old place once Ísencepan is spent — is never played); EX-02 UNSUPPORTED (status "done"); AP-10
NOT-A-FIX (not reproduced); FH-23 DECISION.

Output: per-row table; rates for the two strata with the stratum sizes (extrapolate to 418 honestly, with the
interval); proposed status edits (WEAK/UNSUPPORTED → partly with what's missing; REGRESSED → open); proposed counting
of NOT-A-FIX/DECISION apart in m22-status.

Lead's rows 6–10: PL-22 MET (test/small/opened-box.test.ts:24-28: the chalice told once open, the take named);
SP-08 NOT-A-FIX (dropped, unverified: a per-world grounding cost, belongs with OR-91's measurement, re-check there);
OR-12 MET (small/indicator-condition:25 red on a way with something heard; small/ambush-marked:29,33 the sign lit and
dark); AT-07 WEAK (its M22 part's marks are held by construction (Fold, Attest), but the sprint audit found AT-04's
words-against-act untested; met only once lens-rows-valid checks words name the act); PR-07 NOT-A-FIX (not reproduced,
by a probe over PlaySession.resume; wants the probe kept as a small spec).

Lead's rows 11–15: PL-02 MET (test/small/journey-fight.test.ts:24, the fight put to the journey's own controller);
IG-09 NOT-A-FIX (superseded by IG-15); CO-10 WEAK (two of its phrases pinned: small/conditions-told:32 for
inspired/migraine, small/alone-echo for the collect line; "2 true damage" in prose and raw `*habit*` asterisks pinned
by nothing); PP-04 WEAK (47 passages rewritten, the census in prose-comparison.md, but no spec holds them: a
regression to the old wording would pass); BL-01 MET (test/lens-all-browser at 1280×800 and 820×1180, mutation-checked;
its evidence sits in the row's what cell, which the tickets reader takes for the what, not the status — the "names a
spec" count undercounts such rows).

## Rows 16–30 of no_spec and all 20 of with_spec (19 Nov, closure-review agent, at wt-m21 cc35b5c48)

Read against the specs on disk; ran test/small/debt-purse (2 pass) and test/small/starving-will-not-wait (1 pass);
browser specs read, not run (KYRIE_BROWSER), counted MET where their assertions are the claim, as the pilot did BL-01.

### no_spec, 16–30

| # | Row | Verdict | Evidence |
|---|---|---|---|
| 16 | BP-04 | MET | test/small/starving-will-not-wait.test.ts:19-20: a starving rat is savage and falls on the company (`- able(t__rats)`), a wary one does not. Ran: pass |
| 17 | PL-09 | MET | test/small/care.test.ts:45-50: a lit torch, Torchlit on the sheet, `needsCare` empty, no "binds the hurt"; :54-61 old saves brought up to date |
| 18 | T24-10 | MET (process, by inspection) | .github/workflows/ci.yml:39-43, 63-67, 89-91: actions/cache of node_modules/.cache/kyrie-parse, keyed on the compiler and the texts. No behaviour to spec |
| 19 | OR-20 | MET | test/small/talk-how.test.ts:11-18: the check line classed by Check.read and drawn inside `<details class="how">How it fell` (web/reader/stage/talk-stage.tsx:210) |
| 20 | PB-01 | MET | test/news-asked.test.ts:44-46: across 160 a1 places no one lists 3 asks; "Ask Osborn for news" present. Named in the what cell |
| 21 | PB-25 | MET (browser) | test/lens-all-browser.test.ts:22-48: ≤ 4 ids a page, pages > 1, round to the first. Named in the what cell. (The 17 Nov LensFocused ruling narrows paging to things at hand; spec follows it via LensPages) |
| 22 | T24-04 | WEAK (narrow) | test/action-system.test.ts:22,82 holds the mark (data-act) and the atom; test/small/no-old-button.test.ts:10 the old .act class. Nothing draws a fight's moves or a trade's rows and asserts the one row; the census (test/support/action-census.ts:134-170) walks no fight |
| 23 | R10-02 | NOT-A-FIX | superseded by PB-23 (silver retired); remainder homed to AP-01/PB-17 |
| 24 | PL-25 | MET | test/small/debt-purse.test.ts:42-47: the cleared den's search offered and gold-marked. Ran: pass. ("spent" wording in data, unpinned, minor) |
| 25 | TP-03 | MET | test/small/terminal-awkward.test.ts:45-51: companion by icon, no tone, before and after; `Emphasis.precedence` lacks companionship. A decision with its implementation pinned |
| 26 | TP-08 | NOT-A-FIX | not reproduced by a straight walk; transcript never kept |
| 27 | CN-08 | MET | test/interior-walk.test.ts:46-101: in, lenses, compass in and out, look, talk, fight with >1 target (:87), context restored (:90), back to town (:97); browser twin test/interior-walk-browser |
| 28 | PL-20 | MET | test/small/talk-when-asked.test.ts:75 (no talk on the Gaffer with nothing to say), :78 (talk once tolerated). Tolerance staged by commitWorld, but the defect is the first assertion |
| 29 | R10-04 | MET (process, by inspection) | the probes stand in doc/history/missions/20/evidence-tools/ (gold-survey.ts, signals.ts, safe.js, parley.ts, camp-night.ts…); the row's path `mission-20/evidence-tools/` is stale since the history move |
| 30 | PB-15 | DECISION | by design under the foreground rule (BN-04, ruling 2) |

### with_spec, 1–20

| # | Row | Verdict | Evidence |
|---|---|---|---|
| 1 | NP-04 | MET (its part) | test/small/greeting-penned.test.ts:13-14: a penned boy's address is `address.troubled.*`; the farewell is DN-05's, as the status says |
| 2 | OB-09 | MET | test/silent-lord-turns.test.ts:34-56 is `it(`, not `it.skip`; the remission forced and the spate waited out (:50). Heavy, not run |
| 3 | OR-98 | MET | test/small/first-spells-chosen.test.ts:28-70: one step for the hand, every spell, Hand full, Learn these three shut until full and of the art, the life knows them; browser layout in composed-creation-browser:86 |
| 4 | OR-94 | MET | test/small/page-controls.test.ts:21-69: every `<button` by kind, file by file; a new kind fails (a ratchet) |
| 5 | CL-50 | WEAK | test/store-wares.test.ts:21-33 holds the shelf, the "not sold here" line and the carrier by share. Items (28) "Set out for Gatesend stops after one hex" and (20) "1 candle to spare" are answered neither by the status nor any spec found; the status quotes a sentence ("folk go to the chandler's") the data no longer has (general-stores.json:5 says "Meal and lamp-oil are not sold here.") |
| 6 | R11-01 | REGRESSED (by ruling) | 506ae0e64 (OR-03): "keys are each row's place, 1 to 4, not numbers kept through the conversation"; test/talk-numbers.test.ts:4-27 now pins paging, the opposite of the claim. The accidental-informing hazard is unguarded |
| 7 | CL-37 | WEAK (narrow) | every-blow-told:38-41, barks-remembered:50-63, kyr-template:32-34, named-once:30-36 hold four of six; "named once" (19) only on a staged glance (named-once:9-24, Introduced.said called directly): removing it from Narrator.leaf (src/presentation/narrator.ts:159) passes every spec |
| 8 | NM-02 | WEAK | test/map-browser.test.ts:36-41 holds the card's title and time only; eyebrow (route-card.tsx:28) unpinned; "Explore nearby" no longer exists (superseded by the map menu); phone share unmeasured (row admits) |
| 9 | BP-02 | MET (evidence wrong) | fight-told-once:24-32, small/fight-said-once:15-30, small/fight-told-once:21-26 hold "said once". The status's "looks away solemnly is in no voice table (grep of data/ and src/)" is false: data/voice/combat.json:302-311 has it, tied to a compassionate fighter slaying a person, pinned by fight-said-once:32-36, which meets the what cell's "tied to the character and the moment" |
| 10 | CO-09 | WEAK | map-set-out:41-51 (no-way-known goes across country), map-charted-browser:22 (card clear). The menu's verbs by cell (View / Travel to / Enter on own hex only) are asserted nowhere: the original "Enter the town just left" could return |
| 11 | OR-111 | WEAK | hold-rule:19-22 holds the engine's rule; nothing asserts the map's Travel to / Go on need a hold (browser specs press by MonoDriver.press, which holds, so they pass either way), nor the 19 Nov pointer-at-rest fix |
| 12 | OR-49 | WEAK | reply-in-view-browser:21-43 is phone-only (390×844); the claim's case, a long reply at 1280×800 against the divider, has no spec; the 282→319 px was a probe |
| 13 | TB-12 | WEAK | one-projection:46-62 holds page = terminal = runner. "bin/kyrie serve … retired" is not so: src/cli/kyrie.ts:89, src/cli/serve.ts builds led acts from glance.acts, not Doable |
| 14 | OR-54 | MET (browser) | test/hold-fill-browser.test.ts:43-65: ring has `finger` and `holding`, fill part way, nothing done until full |
| 15 | TO-04 | MET | small/sky-gifts:24-42 (engine's twelve signs and what one settles), creation-conformance:62 (terminal = page life), sign-zoom-browser:36-68 |
| 16 | OR-87 | MET (browser) | test/hold-hint-browser.test.ts:29-44: one hinted row, moved, cleared; "fails on the old Hold" |
| 17 | OR-38 | WEAK (narrow) | page-slots:13-21 and the census (action-census-browser:22-28, uneven rows, stray, unframed) over title → Book; the census walks no fight, trade or rest scene |
| 18 | AP-02 | WEAK | indicator-condition:32-50 and indicator-page:49-73 hold the derivation from flags given; "a repeatable act never goes dim" (spent only for asked topics, idle only for twice-left places) is "checked in code", no spec plays wait/rest/buy twice |
| 19 | TO-01 | MET (browser) | title-geometry-browser:35-51 (rows one geometry, centred, still), reticle-browser, action-census-browser over the title |
| 20 | US-01 | MET | test/sister-asked.test.ts:11-31: asked at the inn, told where, the pin found and told, experience given (not replayed cold, as the status says) |

### Counts (pilot 15 + these 35)

| Stratum (N in 418) | n | MET | WEAK | UNSUPPORTED | REGRESSED | NOT-A-FIX | DECISION |
|---|---|---|---|---|---|---|---|
| no_spec (210) | 30 | 16 | 5 | 1 | 0 | 6 | 2 |
| with_spec (208) | 20 | 10 | 9 | 0 | 1 | 0 | 0 |

(no_spec = pilot MET 5, WEAK 4, UNSUP 1, NAF 4, DEC 1, plus mine MET 11, WEAK 1, NAF 2, DEC 1.)

### Rates, extrapolated to 418 (stratified, 20 000 bootstrap resamples within strata; 95% intervals)

- MET of all closed rows: no_spec 53%, with_spec 50%; weighted **52% (38–66%)**, about 216 rows (157–275).
- MET of the rows that claim a fix (NOT-A-FIX and DECISION set apart; ~362 of 418): **60% (45–75%)**.
- Not held (WEAK + UNSUPPORTED + REGRESSED): no_spec 20%, with_spec 50%; ~146 rows (91–201), 35%.
- Lenient reading (the three "narrow" WEAKs, T24-04, CL-37, OR-38, counted MET): 58% of all (44–72%), 67% of fixes (52–81%).
- NOT-A-FIX + DECISION: ~56 rows (all from the no_spec stratum in this sample), to be counted apart in m22-status.
- Odd result worth saying plainly: rows that name a `test/` path are *less* often held (50% not held) than rows that do not
  (20%). Naming a spec is not evidence; the with_spec rows are newer, longer, multi-part claims (M22's 17–19 Nov
  rows), where one spec covers one part and the status says "fixed" for all. Sample sizes are small (20): the
  interval on this difference is wide, but the direction matches the sprint audit's 6 of 13.

### How far the split undercounts

Of the 30 no_spec rows, 18 name a spec after all: 11 in backticks or bare in the status (`told-way`,
`small/care`, `action-system`, small/talk-how…), 7 only in the what cell (BL-01, BP-04, PB-01, PB-25, TP-03, CN-08,
CO-10; EX-02 too). That is 60% (95% bootstrap 43–77%), i.e. ~126 of the 210 (91–161). So about 334 of 418 (80%) name
a spec somewhere, not 208 (50%). The strata are therefore really "test/ path in the status" vs "not", and they do not
separate evidence from no evidence. A reader of the register must read the what cell: the tickets reader takes the
status alone.

### Patterns of weak closure, and cheap checks

1. **Multi-part row, one part pinned, status "fixed".** CL-50 (two of five complaints unanswered), CL-37, NM-02, CO-09,
   TB-12, OR-38. The what cell lists numbered defects (cold-play line refs "(20)", "(28)") and the status answers some.
   *Check:* a register lint that, for a row whose what cell carries parenthesised cold-play refs or "; " clauses,
   requires each ref to appear in the status (answered, ruled, or homed to a row id); unmatched refs fail. And: a
   closure must name a spec per clause, or say "ruling"/"homed to XX-NN" for it.
2. **Staged unit, played chain unpinned (wiring gap).** CL-37 (Introduced called directly), AP-02 (Indicator.condition
   from given flags), PL-20 (commitWorld tolerance), R10-17 in the pilot. The function is right; nothing proves the
   game calls it. *Check:* a mutation smoke: for each spec cited by a closure, a script comments out the call site the
   status names (e.g. `Introduced.said` in narrator.ts) and confirms some cited spec fails; record "mutation-checked"
   only from that script's output. Cheaper still: require each closure that names a unit spec to name one played spec
   (Tiny/Runner/journey) as well.
3. **The driver does what the rule is supposed to force.** OR-111: MonoDriver.press holds, so specs pass with or without
   the hold on the map. *Check:* for each "must be held"/"must not" rule, one negative assertion (a plain click does
   nothing); a grep that every spec citing OR-111/hold has a `.click(` → unchanged-log assertion.
4. **Spec rewritten under a later ruling, row not reopened.** R11-01 (talk-numbers now pins the opposite), NM-02
   ("Explore nearby" gone), PB-25 (narrowed by LensFocused). *Check:* when a commit changes a spec file, list register
   rows that cite it (grep by basename, status and what cells) in the commit hook / landing checklist; the author
   re-reads each. A one-line script: `git diff --name-only | xargs basename | grep -f - open-register.md`.
5. **Evidence asserted in prose that is false or stale.** BP-02 ("in no voice table": it is), CL-50 (a sentence the data
   no longer has), R10-04 (a moved path), TB-12 ("serve retired": it stands). *Check:* a register lint resolving every
   path and backticked spec name in a closed row to a file on disk, and every quoted sentence claimed as "now says"
   to a grep hit in data/ (warn on miss).
6. **Viewport/case named in the defect not the one pinned.** OR-49 (defect at 1280×800, spec at 390×844). *Check:* the
   lint above can flag a closure whose what cell names a size (\d+×\d+) not present in any cited spec's text.
