# Mission 19 evidence

What was played, by whom, on what build, and what came of it: the record the process audit of 4 November asks to be
kept in the repository ([../m18-m19-process-audit.md](../m18-m19-process-audit.md) §6.7). Each entry says how far its
evidence goes:

- **Implemented**: a commit.
- **Reachable**: a spec or scripted journey reaches it from the start of a game (or, said so, from a place put).
- **Usable**: done through the page, by the builder.
- **Accepted**: judged by the owner or an independent player. The builder never accepts. As of this entry **nothing
  in Mission 19 is accepted**; the owner's notes of 4 November are findings (the register's M19-31 to M19-41), not
  acceptance.

## Ledger

| # | Date | Build | Who | World and character | Route | Viewport, input | Outcome | Level | Limits |
|---|---|---|---|---|---|---|---|---|---|
| E1 | 4 Nov | e7aeac3a to 552a002a, several | builder | a1, default creation (Coming Home; Hamo, human warrior) | Begin → Millholm's camp → the notice → Bask → the corn-store → the cellar → the rat-runs → the rats → the nest and the buck → Bask paid | 1280×900, keys and clicks (play-server) | Played through; found M19-01 to M19-30 (baseline.md) | usable | builder only; one seed, one calling |
| E2 | 4 Nov | 2f394adf | builder | a1, default creation | the camp, following the rats job; following "Ask Bask" | 1280×900, keys | The aim's act or plate marked first (M19-36) | usable | builder only |
| E3 | 4 Nov | 03c8ba4a | builder | a1, default creation | the camp after the notice | 1280×800, 820×1180, 390×844 | Every act, plate and way in view without scrolling at 1280×800 and 820×1180; at 390×844 the rail docks at the foot and scrolls within itself ([camp, laptop](evidence/2026-11-04-camp-1280x800.png), [tablet](evidence/2026-11-04-camp-820x1180.png), [phone](evidence/2026-11-04-camp-390x844.png)) | usable | captures, not a play on a real tablet or phone |
| E4 | 4 Nov | 2a454db5 | builder | a1, default creation | the corn-store → the cellar (lit) → the rat-runs → a fight with the rats | 1280×800, keys | "One storey down" at the head, no town painting over the cellar ([cellar](evidence/2026-11-04-cellar-1280x800.png)); the fight's hand clipped at the foot (fixed 90d722f2) | usable | builder only |
| E5 | 4 Nov | 90d722f2 | builder | a1, default creation | the camp → Bask → "Ask about the rats" → reload the page → Continue | 1280×800 | Before the fix: "Inconsistent saved creature facts", the game would not open (M19-42); after: opens where it was | usable | the reload path only; no other gifts tried in the browser |
| E6 | 4 Nov | 552a002a | spec | a1, human warrior "Aud" (`--as human/warrior/Aud`) | `test/first-town-job.test.ts`: the notice → Mik → the cellar → the rats → the nest and the buck → paid | headless | Passes: two fights, ten coin, a lantern and two flasks of oil | reachable | scripted labels; one calling |
| E7 | 4 Nov | 552a002a | spec | kite, a warrior and a cleric | `test/undertown.test.ts`, `undertown-orders`, `undertown-callings` | headless | The rats with a rest between fights; jobs taken out of order (half paid, then the rest); a mage by ratsbane or fire | reachable | headless; a mage's route is a spec, never played in the browser |
| E8 | 4 Nov | 2cbca24e | spec | probes | `refused`, `given-seen`, `turns-on`, `mechanical-meaning` | headless | BOF-15 fixed; GTR-X03 and LWR-02 not reproduced; ARV-A5's four symptoms hold fixed | reachable | probes, not adventures |
| E9 | 4 Nov | 0a7a9d73 and after | builder, spec | a1, default creation | the causeway → the camp on the town's plan → Bask (the rats job) → the corn-store → the cellar and the rat-runs on the plan below → the rats → back up on the plan → out into the country (the board) → back to Millholm's overview, Walk in | 1280×800 keys and clicks; 820×1180 | The place laid out as the surface at every scale, the focus beside it; nothing to scroll; `spatial-journey-browser` passes ([town](evidence/2026-11-04-town-plan-surface-1280x800.png), [wild](evidence/2026-11-04-wild-board-surface-1280x800.png), [overview](evidence/2026-11-04-town-overview-1280x800.png), [cellar](evidence/2026-11-04-cellar-plan-surface-1280x800.png), [rat-runs](evidence/2026-11-04-rat-runs-plan-surface-1280x800.png), [tablet](evidence/2026-11-04-town-plan-surface-820x1180.png)) | usable | builder only; one town, one calling; the town's plan is cells and lanes, not yet streets and districts |
| E10 | 4 Nov | after 3693ba29 | builder, spec | a1, default creation | the same journey, with the corrected surface | 1280×800 | The painting is the town's surface, its ways along its foot; the cellar's words in the light with the way up above; the board in the wild ([wild](evidence/2026-11-04-composition-wild-1280x800.png), [town](evidence/2026-11-04-composition-town-1280x800.png), [cellar](evidence/2026-11-04-composition-cellar-1280x800.png)); `spatial-journey-browser`, glance, world, reader, opening and map browser specs pass | usable | builder only; for the owner to judge the direction |

## The variations the audit asks for (§6.3)

| Journey | State | Evidence |
|---|---|---|
| The first town's loop, the reference | Usable by the builder, not accepted | E1–E6 |
| Another calling | Reachable only: a mage by ratsbane or a fire flask | E7 (`undertown-callings`) |
| Another order of the town's jobs | Reachable only: half paid, then the rest, never twice | E7 (`undertown-orders`, REV-21) |
| An expedition with retreat and return | Reachable only (headless, green on every push): out to a deep site and home, what was carried up sold (`long-expedition`); out, a night outside, back in to a cleared room filled again (`deep-expedition`); hurt by the brood, back up to rest, down again for the buck (`undertown`) | not played in the browser since the repairs; no retreat from a fight going badly in any of them |
| An authored adventure reached through ordinary play | Not yet shown this mission | journey 4 (13f1f149) reaches a generated site heard of; no authored adventure has been reached from Begin since the repairs |

## For an independent player

Nothing here needs to know how the game is made.

1. Build: `bun install`, then `bun run web:build`; serve `site/` (any static server) and open `index.html?world=a1`.
2. Character: the first card at every step of creation (Coming Home; human; warrior; Hamo). Then, a second time, a
   mage, and a third, a thief: everything else the first card.
3. Play for an hour from Begin. Play opens on the world map: press ENTER on the card for where you are. There is no
   route to follow; if it helps, the notice on the post at Millholm's camp offers three jobs (Explore…).
4. Record: the build (the commit `git rev-parse --short HEAD`), the screen size and whether keys, mouse or touch; what
   you were trying to do every few minutes; where you were stuck, misled or bored; whether you wanted to go on.
5. Keep the record beside this file as `evidence/<date>-<name>.md` and add a line to the ledger.

### The acceptance protocol (PD-14)

What the product-design review asks of five players who have not read the design documents (its §7), as a sheet to
fill in for each. Give no help beyond step 1 above. Play opens on the world map, the town you begin in described over
it with ENTER; a place is its painting, told whole beside it, with whoever is there over its foot, and four quiet
touches: Go… (where to go), Look… (the things at hand), Wait… and Search.

| Asked | When | Passes if |
|---|---|---|
| Comprehension | a minute after the first place is entered | they say where they are, why they came, what is going on, one person or thing that matters and two sensible things to do, without opening anything to answer |
| Orientation | after a building and a three-room site | they name the way in, where they are, a way not yet taken, a way barred and the way back (four of five) |
| Intention | after two rumours and one job taken up | they tell apart what they heard, what they took up, where they know to go and what is still uncertain; after buying and resting they take it up again without searching the Notes |
| Action integrity | before and after something that costs or risks | what they expected to spend or risk matches what it took; they notice the result without opening the Story |
| Continuity | after each of town → person → shop → map → journey → site → fight → aftermath → town | they name where they are and what they are about; nothing felt like another program |
| Pacing | throughout | count page scrolls, openings of Go… or Look… made only to see what is in them, accidental moves, rereadings, and the time to the first meaningful act |
| Motivation | at the return to town | they name what they want to do next, and whether they would play twenty minutes more unasked (four of five) |

Keep each sheet as `evidence/<date>-<name>-acceptance.md` with the build and screen, and a line in the ledger. Until
five are kept, M19's acceptance is unmet whatever the builder's play shows.

The builder's own driver (a headless Chromium answering small HTTP requests; `scripts/play-server.ts`) and the two
step scripts used above are in [evidence/driver](evidence/driver).
