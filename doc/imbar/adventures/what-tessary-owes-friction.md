# What Tessary Owes: friction

| # | Tried | What happened | Cost | Smallest repair | Status |
|---|---|---|---|---|---|
| 1 | Assume the sign lets a thief rob the quay | After `chalk_the_sign`, `Pick the lockbox` in Slake's sight still makes her hostile (`box_watched`). The test now asserts that | one cycle | none: it is the right behaviour | worked round (documented) |
| 2 | Journey steps for the Lowtide approach | The `To the ...` labels from `what-tessary-owes.test.ts` (not `>` ids) are the reliable way; the `=156` wait must come between the head of the Swatch and the foot | trivial | Copy the existing steps | worked round |
| 3 | `j.holds('hiredBySault', ...)` | Needed the prefix: `tessary__hiredBySault`, with `t(...)` in the test | trivial | none | worked round |
| 4 | Rename `Josiah Quire` | The id `quire` is pinned in `what-tessary-owes.test.ts` (`g.at('quire')`, `quireHope`) and the display name shares only a first name with the Grand Tour's `Josiah Pumphrey` | none | none | **not done** |
