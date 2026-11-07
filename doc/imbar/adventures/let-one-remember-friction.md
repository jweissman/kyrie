# Let One Remember: friction

1. **A hired companion's calling cannot be keyed.** `hasCalling` works for `memberOf(?m, party)` only; Teshen, a ranger, is a `travelsWith` hireling, so the ranger-only exit at the Old Silver is the member Elen's, not Teshen's. Smallest repair: let `hasCalling` be asked of anyone `travelsWith(?p, party)`. Worked round: the player's own ranger.
2. **Measure `hire` is global and unprefixed.** Test and data must call `hire(teshen)` and not `corrow__hire`; the error is `Unknown measure corrow__hire`. Cost: a failed test. Repair: say so in 04-authorability.
3. **`capable(actor, light)` needs a lit source.** An unlit lantern does not count; players must light a candle first. Fine, and in the Patient Star test.
4. **Reading another module's world event is untried.** `befell(...)` is asserted by nobody outside the Grand Tour; no adventure reads one. I did not try (blocked by not wanting to change imports in a module that does not import canon). **blocked** for links by event.
5. Fixtures list sources by path, so every new `.kyr` has to be added to four fixture `module.json` files as well as the two bundles. Smallest repair: let a fixture bundle extend the real one.
| 8 | Review items 2, 8: cut the motif | The bell's "eleven strokes and a space" (witness.kyr) and the bucket's "eleven strokes" (act2_margin.kyr) are cut; the niche lamp stays because `keep_the_niche` / `Have {c} trim the lamp` is an action with a test. | trivial | none | fixed |
