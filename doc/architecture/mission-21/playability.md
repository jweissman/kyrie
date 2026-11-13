# Mission 21: playability investigation (P0/P1 list)

The independent playability investigator's evidence-backed list (brief: "Independent playability investigator" and
Phase 1). Kept current on branch `m21-play`. Started 12 November 2026, evening, on main `d3607041`.

**Method.** Cold headless play through `bin/kyrie adventure` / `bin/kyrie resume`, one process fed one line at a time
(the driver and probes are in `/var/tmp/kyrie/play21/`: `p.sh` drives a game, `tools/glance.ts` prints what the
page's glance leads with and why for a kept save). Judged from what the screen tells a player; the code read only
after a fault is seen, to name its cause. Human reports (the owner's own play) are weighed above agent ratings: an
automated positive rating never closes a reproducible human gamebreaker, and a human report that cannot be reproduced
stays listed as **not reproduced**, with what was tried.

**The instrument first.** The terminal is the same runtime as the page (`PlayerView`, `ScreenModel`, `Narrator`,
`PlaySession`), but as inherited it could not show what the page promises: no gold, no pips, no way to follow an aim,
nothing to say inside a conversation, the gold way into the next stretch of country dropped, and journeys that fought
the player's fights for them. Until that was mended (PL-01, PL-02) a headless player could not reproduce the owner's
guidance failures at all, and round 12's "foreground leaves out the step" findings were partly the terminal's own.

Severity: **P0** stops ordinary play or destroys trust in guidance within fifteen minutes; **P1** makes the first hour
not worthwhile or recurs across reports; P2 is listed only where it corroborates a P0/P1's root cause.

## The list

| Id | Sev | Statement | Status |
|---|---|---|---|
| PL-01 | P1 | The headless terminal hid the page's promises: no signals, no Follow, an empty conversation, the gold journey dropped | fixed in this branch (see below) |
| PL-02 | P1 | A journey's fights were fought for the player (headless `travel:` legs used the automatic controller) | fixed in this branch |
| PL-03 | P1 | Blue ("to learn") on an act that teaches nothing: the wagoner's "Offer him a hand" | fixed in this branch |
| PL-04 | P2 | A journey of five and a half hours arrives with nothing of the way told, and the arrival tells a fight's end before its start | open |

### PL-01: the headless terminal could not show what the page promises

- **Repro:** `bin/kyrie adventure --world a1 --origin kin --as human/warrior/Wynn`; `3` (Talk to the wagoner): no
  greeting, and the foreground drops to two ways, the four things to say to him only under `all`. At Millholm with the
  father's aim followed, the glance leads with "To the road between Mistshaw and Millholm" as the aim's next step
  (`tools/glance.ts`: `named`, `CONTINUES`) but the terminal's foreground showed Talk to Odo, the notice and the grey
  dog: the act's command is `travel:region__s4_s2_way`, which the terminal's list of choices did not hold.
- **Observed / expected:** a player could not follow an aim, see gold or a pip, or say anything in a talk; expected the
  page's own projection in words.
- **Corroborates:** round 12, A's problems 1 and 4 ("talking says nothing", "the step the aim asks for only in
  `all`", eight times) and B's T3 ("talk opens and is empty"), `mission-20/cold/round-12/`.
- **Cause (verified):** `src/cli/terminal.ts` printed `glance.acts` and `glance.ways` resolved through
  `PlayerView.observe(...).choices`; it knew neither `Attending.talk` (the page's conversation) nor the glance's
  `travel:` commands, and had no `Undertakings.follow`.
- **Status:** fixed in this branch: `aims`, `follow <n>`, `unfollow`; each foreground choice says its signal in words
  (`[gold: your aim]`, `[blue: to learn]`, `[rose: a companion]`, …) from `Promoted.continues`, `aspects` and
  `inside`, as `web/reader/emphasis.ts` draws them; a talk lists what can be said (`Attending.talk`) until leave is
  taken or the company moves; a journey's legs are printed.

### PL-02: a journey's fights fought for the player (headless)

- **Repro:** a1 kin, the father's aim seen through, follow "Whatever took the drover's oxen…", `Set out for a grassed
  mound north-west of Mossminster · 321 min`: at Tenebraetumulo "The leader comes at you without a sound. Wynn hits
  the leader … The fight is won." No choice was put.
- **Cause (verified):** `PlaySession.leg('travel:…', controller)` handed `Travel.go` a `perform` that dropped the
  controller, so every leg's fight ran on `PlaySession.auto`. The page's `EngineHost.travel` uses its own `perform`
  and is not affected.
- **Status:** fixed in this branch (the controller passed to each leg; `PlaySession.journeyed` keeps the legs for a
  client to tell). Regression: `test/small/journey-fight.test.ts` (fails with the automatic controller).

### PL-03: blue on an act that teaches nothing

- **Repro:** a1 kin, the opening: "Offer him a hand, for a share of the load · 30 min [blue: to learn]"; "Talk to the
  wagoner" is drawn blue for it. Taken: a sack, a coin and the wagoner's opinion; nothing learned.
- **Corroborates:** the owner's report of 12 November (PR-04: "a blue pip with no blue reply"); R9-03. The comment in
  `src/ui/affordances.ts` (`learned`) cites exactly this case as fixed.
- **Cause (verified):** `ChoiceGrouping.withheld` marks `teaches` for any action whose success asserts `knows(…)`;
  the prologue's `carter_bargain` asserts `knows(actor, cart_bargained)`, a record of the company's own deed for the
  Notes, not something learned of the world.
- **Status:** fixed in this branch: an act teaches when it comes to know a fact it does not itself make so
  (`ChoiceGrouping.teaches`: a fact also asserted by the same act, as `wayIn(cart_bargained)`, is the company's record
  of its deed). Thirteen of the prologue's meeting acts (every origin's road) had been blue for this. Regression:
  `test/small/blue-teaches.test.ts` (a tiny world, `test/support/tiny.ts`; fails on the old rule).

### PL-04: a long journey told by nothing; a fight's end told before its start

- **Repro:** a1 kin, after the father's aim, `follow 1` (the oxen) and set out for "a grassed mound north-west of
  Mossminster · 321 min" (the gold): arrival at 5:27 p.m. at "Tenebraetumulo" (the Bound Howe) with no line of the
  five-hour way; the scene says "The leader lies dead." above "The leader comes at you without a sound. Wynn hits the
  leader …"; the foe is "the leader", of "the zombies".
- **Corroborates:** the owner's notes of 10 November ("Travelling absolutely has to reveal the landscape you're
  passing through"; "a chance of encounter at every hex"); R9-07 / R11-07 (text and timing).
- **Cause (hypothesis):** the terminal prints only the last leg's telling (now each leg's way, PL-01); the arrival's
  standing description is composed from the state after the fight, the fight's log appended after it (narration by
  accumulation). The per-hex encounter is a design ambition (NM-06), not this defect.
- **Status:** open.

## Common root causes

(To be written as the list grows.)
