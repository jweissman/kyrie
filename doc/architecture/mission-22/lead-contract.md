# The lead's contract: AT-12, AT-14, CL-65, AT-13 (research, 20 November)

A read-only diagnosis of the open lead rows, made on mt-18d (43fa472e1 and the MT-18 runner edits), every fix tried
as a runtime patch (no source edited); its drivers and patches kept in /var/tmp/kyrie/scratch/lead-research/
(drive.ts, barrow.ts, probe.ts, patch-*.ts). Not yet commissioned: the order of the fixes below is the proposal.

## One cause: three readers of the lead deciding apart

aim-continuity.ts says "the lead decides", but three readers decide on their own:

1. `AimLeading.of` (aim-lead.ts:51): `lead.next` from a cascade of sources (route, within, toward, deeper, means,
   here), each reading places its own way.
2. The glance's reading (glance.ts:134-149, 353-421: going, toward, inward, onward): Promotion's `continues` (the gold)
   and `following`.
3. `AimContinuity.of`: takes reader 2's gold first where there is any (aim-continuity.ts:36-37), the lead only where
   there is none (`acting`, :81-105).

A fourth copy of `acting` is the runner's own (src/cli/runner-led.ts: Said.led), against MT-18.

| Row | Reproduced | Gap |
|---|---|---|
| AT-12 | both rooms | indoors, a way out only by a plan to the named one's own place; outdoors, a journey to the town holding it |
| CL-65 | yes | no lead source knows the aim comes true by standing somewhere; a way counts only straight to the target |
| AT-14 | warned walk | a winch's bar is invisible; exploration gold beats the lead; the first room not seen wins |
| AT-13 | 0 left on mt-18d | the runner names Doable's ids; but the measure's walk is stale (below) |

## AT-12: silent a step from the way out

From the Stone Horn's taproom (enclosed), the fuel-boat aim toward Ianto says "Nothing here bears on your aim now";
from Holgar's (not enclosed) the gold is `travel:region__s5`. Likewise the sea-gate aim from the chandlery.
`AimRoute.outward` (aim-route.ts:31-47) plans only to the named thing's own place and refuses a person's room not
visited (:42); `Glance.going` (glance.ts:143-149) takes a journey whose destination holds the thing, which can be
planned from inside too. **Fix:** where no plan reaches the thing's own place, `outward` takes the nearest settlement
or site above it that `Itineraries.plan` reaches (never the company's own town); the plan's first leg not enclosed is
the way out (patched: both rooms give `exit:region__s1_green`, gold). Risk: a town seen only on the map must not leak.

## CL-65: the crown held, nothing to the surface

The aim waits on `_raised()`, asserted only by `_brought when at(party, ?p) and not unlit(?p) and not dark() and
ownedItem(_heart, ?m)` (src/world/deep/deep-sites.ts:170-178); no lead source reads its place, so the cascade falls to
`deeper` ("still to be explored"); and `acting` (aim-continuity.ts:103) takes only a way straight to the target.
**Fix:** (1) a lead source `placed`: where a rule asserting what the aim reads needs `at(party, ?p)`, the nearest
known place (KnownWays, barred ways counted) where it would hold, the company moved there (`world.apply`, as
`AimLeads.reckoned` does); cached per world and aim; at night, wait for day. (2) `acting` also takes the first leg of
the known way to the target (`KnownWays.first(…, {able: true})`). Patched: each hall gilds the exit outward.

## AT-14: leads that point at each other

On the warned barrow walk, the cross-chamber leads to a recess, the back-stone back to the chamber; the counterweight
third in the four, never gilded. (a) `AimLeading.bar` (aim-lead.ts:137-143) reads only `on`/`blocksWhen`; a winch is
a passage `opening when state(gear, turning)` compiled to `<passage>__opens` (deep-mechanisms.ts:25-31), its exit with
no acts (the right reader exists: `GlanceLines.works`, glance-lines.ts:210-222). (b) aim-continuity.ts:36-37 takes any
`continues` act (here `Glance.onward`, glance.ts:400-411) unchecked against the lead. (c) `deeper` takes the first
room not visited in exit order (aim-lead.ts:88). **Fix:** `bar` also gives the gear of an unopened way's `__opens`
rule (shared with GlanceLines.works); a deeper lead to a thing becomes `barred`; a `continues` act is the step only if
`acting(lead)` holds it. Patched: the back-stone gilds the wheel. Not patched: the cross-chamber still gilds the
recess; proposal: with the target on another level, deeper prefers the known way to that level's nearest room.
**Invariant:** following only the gold, the company never stands twice in one place under one lead; it reaches the
lead's step or a stated frontier.

## AT-13 and the measure

On mt-18d every lead's step on every walked turn was a Doable row id. But the parity measure is weaker than it reads:
offer-parity.ts skips a line that errors, and warrior-lines.txt is stale (`{"follow":"pans__cold_aim"}` four times
and `{"follow":"gate__gate_aim"}` say "no aim": those aims now arise by asking Holgar, `pans__trader_cold`, and the
reeve, `gate__reeve#talk` then `gate__reeve_gate`; `travel:region__s1_green` is not offered), so an aim is followed
only on T1-T8. **Fix:** the measure fails on an errored line; the lines re-taken; the barrow walk added; an engine
invariant that the step is a Doable id or a map journey; `Said.led` from the engine, RunnerLed retired.

## The fix in one place

Give `AimLead` a resolved `step` (a Doable row id or a map journey) computed once in AimLeading, by preference: an
act here bound to the target; the first leg of the known way to it; the way out of an enclosed place; a journey whose
destination holds it. Promotion gilds exactly that row; AimContinuity says it, or a stated frontier; `following` and
`Said.led` read it; the glance's toward/inward/onward only order the rest. The outward, bar and continuity fixes and
`acting`'s first leg are each small and close their rows alone. Likely touched too (not verified): OR-130 (the debt's
gold walking into open fields: AT-14 b), US-15, PR-08, MT-18 (RunnerLed).

Pins proposed: test/features/world/aim-lead.pin.test.ts (free 20 November) with cases "a step from the way out",
"what the aim waits on comes true outside", "the gold never goes round".
