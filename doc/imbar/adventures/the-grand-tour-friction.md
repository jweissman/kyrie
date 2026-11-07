# The Grand Tour: friction

| # | Tried | What happened | Cost | Smallest repair | Status |
|---|---|---|---|---|---|
| 1 | The `whelm` fixture phase alone, then Bethan | `No /Pack › .*brine-glass helm.*/`: the phase needs the `fire` phase before it (a helm is bought there) | one cycle | Play `fire, fabian_earth, whelm, cloudgate` in order; it takes about eleven seconds | worked round |
| 2 | A negative test: the verse without the casement | Cannot be played on the shipped route; the `cloudgate` phase already passes through the drawing room, and `casement_known` is true by then | one cycle | A separate fixture that skips the drawing room (not written) | **not done** |
| 3 | `>sennet__drawing_room` from the Quay | `No way ... from quay to drawing_room`: the winch is a timed way (`=day 3 11:00`, `Go up in the basket|Pay five coin`) | one cycle | Copy the `air` phase's lead-in | worked round |
| 4 | Bard-only Topic condition | `memberOf(?m, actor) and hasCalling(?m, calling_bard)` in a Topic `when` works; a company without a bard is not offered the Topic | none | none | works |
| 5 | Rename `Tamsin Quaye` (shipped bard is `Tamsin`; Low Water had a Tamsin) | `gifts.test.ts` and `the-slack.test.ts` ask for her by label | none | Rename when those tests next move | **not done**; Low Water's own Tamsin was renamed instead |
