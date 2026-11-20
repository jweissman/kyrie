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
