# M22 alpha acceptance record

The owner's acceptance of M22 alpha rests on ordinary first-hour play keeping its fundamental contracts, not on the
count of polish issues left. This record keeps what the owner found in human play and what was done about it, finding
by finding, with evidence. Larger creative expansion is beta's and gamma's.

## 21 November: continuity of focus, opportunity and purpose

The owner's playtest found five failures, which are to be treated as projection and continuity failures, not as
five cosmetic tickets:

1. Listening to the old woman's riddle entered no clear focused engagement: her answers were mixed with unrelated
   world actions, not presented together with a way to leave or refuse.
2. The map could be active, offering "Put away the map", with no coherent visible relation between the map and the world.
3. Some action rows display anchor-like symbols whose meaning is not apparent.
4. Following a gold undertaking to its resolution did not guide the player through claiming its reward; the payoff
   had to be chosen as a separate aim.
5. Blue indicators promise knowledge through particular people, while their conversation topics carry no blue mark,
   even where a topic does teach something.

### The three invariants

| Invariant | Statement | Row | Findings |
|---|---|---|---|
| Focus continuity | A riddle, conversation, performance, card game or other engagement presents its relevant actions together; unrelated actions recede; leaving stays possible | OR-177 | 1, 2 |
| Opportunity continuity | Every coloured Atlas promise has an authoritative witness and a discoverable path to the act or knowledge it stands for; a parent indicator and its child acts agree under the documented semantics (indicator-appendix.md) | OR-178 | 3, 5 |
| Undertaking continuity | A pursued goal guides the player through its resolution and aftermath, the claiming of a promised reward included; progress does not vanish because the next step has another label | OR-179 | 4 |

Each is to be held by the machinery that exists (Engaged and Engagement for focus; Doable, the one projection; Attest
for witnesses; AimContinuity for the thread), proved by a regression journey, and verified on the page, not only by
the runner.

### Diagnosis, case by case

**1. The riddle (focus).** Cause: the riddle was a pleasure template's two-step chain (data/generation/town/
pleasures.kyrt: listen, then the one right answer as a Change), drawn in Porthalen, the first town; nothing narrowed
the frame. Fixed with the engagement model proved at the window table (OR-174): stopping for it asserts
engaged_in, and the frame is her riddle's three answers (a river, a well, not knowing) and the ways off the green;
walking off refuses it, and she says so next time. Found on the way: while engaged, acts on a barred way (the
corn-store's padlock: wrench, push, listen) stood beside the answers, since an engagement kept the ways whole; a way
out now offers only going (Engaged). test/features/pleasure/the-old-womans-riddle.pin (mutation-checked).
Browser: to verify on CI (the riddle in a browser walk at 1280 and 390).

**2. The map active without a visible map (focus).** Not yet diagnosed. To find: whether the frame's view is the map
while the stage draws the place (the map's own put-away row is the engine's, MapRows), and what state the page
reached it from. Wanted: a browser journey that opens the map from each lens and puts it away, the map drawn
whenever the frame says it is in view.

**3. The anchor-like symbols (opportunity).** Likely cause, not yet confirmed on the page: the journey glyph a row
draws when it leads out over the next stretch of country (GlanceStage.Icons; data/paintings/emblems.json, "journey":
a back-stroke, a shaft and an arrowhead), which at row size reads as an anchor and is explained nowhere. Under the
invariant every mark on a row is either an Attested indicator or a glyph with a stated meaning a player can find;
to decide with the owner: redraw it, label it, or drop it.

**4. A reward not led to (undertaking).** Not yet reproduced. On the weir route the rats job's payment is led
(test/weir-route: "Tell Gek the rats under the corn-store are dead"); the case the owner met is to be found by
following each first-hour job to its end with the page's honest player, and asserting that when its last step is done
the followed thread is the payoff, not nothing.

**5. Blue on a person, none on their topics (opportunity).** Measured on the warrior's walk by asking every reply
and seeing whether the company's knowledge grew: 18 replies flagged as teaching, 20 that taught; three taught with no
flag ("Ask about the old quarry", the spiders job; "Talk to your cousin", Owain's opener; a gathered dandelion), and
one was flagged and taught nothing new ("Ask what his boats are for"). By the engine's own reckoning no person's
likeness promised knowledge with no reply to keep it; the page's disagreement is to be found where its talk rows read
the flag (TalkStage) against Attest.reply. Wanted: one invariant spec, over the golden walks, that a reply is blue
exactly when asking it teaches, and that a likeness is blue only while a blue reply stands.
