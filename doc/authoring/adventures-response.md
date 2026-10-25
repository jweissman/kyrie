# Response to four independent adventures

Mission 15 brought four adventures written by authors who did not make Kyr onto `main`, played each on the engine as
it now stands, and read their reports together. This is what they found, grouped by the mechanism underneath, with
what was done and what is open. Mission 12's response to the first of them,
[findings-response.md](findings-response.md), stands for its twenty-one findings; this one takes up what is new.

| Adventure | Branch, as taken | On main | Its reports |
|---|---|---|---|
| *Thrume* | `adventure/thrume` 9076108 | 93d03f4 | [README](../adventures/thrume/README.md), [friction](../adventures/thrume/friction.md) |
| *The House That Grows* | `house-that-grows-authoring` 199db32 | 41ba11a | [README](../adventures/house-that-grows/README.md), [ledger](../adventures/house-that-grows/ledger.md) |
| *The Road the Star Came Down* (*Let One Remember*) | `adventure/corrow` 0f37025 | 5a2dec7 | [README](../adventures/let-one-remember/README.md), [friction](../adventures/let-one-remember/friction.md) |
| *The Patient Star*, with *Hold One Season* | `hold-one-season-authoring` 64e8a5d | 0efdc56 | [README](../adventures/patient-star/README.md), [ledger](../adventures/patient-star/ledger.md) |

Each is played by its own journeys (72 in all, by the shared driver, `Journey`) and offered on the title page. What
each needed to play on `main` is in its commit: for the House, its own kinds declared in it, two names the shared rules
had grown since renamed, a try its seams take, and a map journey timed to the minutes asks now cost; for The Patient
Star, the speed its stilling meant. The authors' documents are as they wrote them; where a finding is answered, it is
answered here.

**Done** means the author's natural expression, or one as short, works and is tested. **Exists** means Kyr could
already say it, and the guide did not say so; it does now. **Open** means nothing was done; the remedy the report
proposed stands.

## Bugs: what was wrong, and what is now right

| Finding | Mechanism | Status | Test |
|---|---|---|---|
| Thrume B1: in the dark, "Bran: light a torch" set the torch down | The dark's light choice took the first of the thing's acts | Done (508bfbf): taken by its command; a flask of lamp oil by being spent on its carrier (0efdc56) | `light-in-the-dark`, Hold One Season J1–J8 |
| Thrume B4: "using Elen's the Abbess's Eye" | A label and a result made a possessive of a name with its own article | Done (508bfbf, 6cbe371): "using the Abbess's Eye", who carries it beside the choice; "the Abbess's Eye is used up" | `spending-change` |
| Thrume B2: lint refused `consuming` a module's own treasure kind | Lint and play lowered it differently while a module's own kinds were the process's (the audit's F1) | Done (since 0ecbf8f): both lower it to `spends` | `spending-change` |
| Thrume B3, B5: twin tries and a bare "Take" | The test driver dropped the heading each thing's choices are under | Not a bug of the page; the shared driver matches under headings ("the Sleeper's left eyelid: Examine › …") | `thrume`, `journey-driver` |
| Thrume B6, B7, B8 | Told twice; told out of order; an empty choice once fallen | Do not happen on `main`: the page tells what happened before the place, and a fallen company's frame carries its ending | — |
| Patient Star P8's module was lost | `.gitignore` ignored every folder named `site` | Done (0efdc56): only the built site at the root is ignored; the module rebuilt | `patient-probes` P8 |
| Patient Star: "Let Saro hold on" had "no possible target" | Lint's list of what the engine writes lacked `joinedAs` | Done (483e3af): one list, `EngineWrites`, for lint and the world audit | `engine-writes` |
| Patient Star P1 text: "?m's own footsteps" | An observation's text named a variable it could not fill | Done (0efdc56): said of whoever its condition finds first | `patient-probes` P1 |
| Road B1: a long hazardous way always turned the company back | Each watch of a journey judged the way by the hazard the risk itself was breaking | Done (c6dbce9): judged as the command will leave it | `journey` |
| Road B2, Patient Star 5: a decrease past nothing stopped play | A count may not be negative, and a rule's write threw | Done (c6dbce9): a count taken past nothing stops at nothing (an action that would still is not offered) | `patient-probes` P5 |
| Road B3: a shuttered light stays lit | Nothing puts a light out | Open | — |
| Road B4, Patient Star 7: alike destinations, alike changes | Choices are told apart within one group, not across exits or things | Open | — |
| Road B5, Patient Star 6: a companion who has joined is nowhere | A person and the member they become are two entities; joining retracts where the person is | Open (the audit's F4, companion lifecycle) | — |
| Road B6: hiring adds the hired person's purse | Their own coin joins the company's | Open | — |

## What authors could not say, and can now

| Finding | Status | What an author writes now |
|---|---|---|
| Patient Star 1 (severe): a body's pace cannot be changed by a module | Done (0efdc56) | `Set speed(?m) to 50.`: a member at half their speed; a company walks at its slowest member's (guide, "How fast a member goes") |
| Road F27, tooling wish 1: every author wrote the same driver | Done (6cbe371) | `Journey` in a test; `bin/kyrie play campaign.json --steps … --probe …` from the terminal (guide §9) |
| Road F3: a measure cannot be said in prose | Exists | `{owed(loan)}` in any text says the measure as it stands; a number in words is open |
| Road F9, Patient Star 32: a rule's words reach the company anywhere | Exists | `Rule … at place` / `near someone` is told only to a company that perceives it (guide, "Who hears what a rule says") |
| Road F4, Patient Star 5: there is no floor | Done (c6dbce9) | A count stops at nothing |
| Thrume F1, Patient Star 8, Road F8: a rule cannot teach what is known | Done | `Rule … says "…" teaches fact { }` and `Event … "…" teaches fact.`: known, as witnessed, by a company that hears the words; an `Assert knows` is still refused, and the refusal names the rule (guide, "Words that teach") |

## Open, by how many authors met it

| Mechanism | Who met it | Remedy proposed |
|---|---|---|
| Knowledge from a source, and at the start | Thrume F1 (the person as its source), Road F20 | A taught fact recorded as told by someone (`toldBy`); a fixture that starts knowing |
| No ending construct | Thrume F12, Patient Star 28, Road F19, F23 | `Ending … when … "epilogue"` that closes the book |
| Names collide one load at a time; states share the entity namespace | Thrume F3, Patient Star 35, Road F16, F21, F22 | Every collision in one pass; state names scoped to their thing; both places named |
| A skill a source or change needs | Thrume F13, Road F7 | `readable by party with lore`; `needing link_script` |
| Arithmetic: precedence, min, max, division, counting; computed measures | Road F1, F2, Patient Star 5, 38 | Ordinary precedence and parentheses; `min`, `max`, `/`; `Measure x(p) means …` |
| Time: a long move is simulated watch by watch | Patient Star 27 (a fourteen-day walk, 35 s); Patient Star 26, 31 | Advancing to the next watch anything can happen ([time.md](../architecture/mission-15/time.md)) |
| Dates and periods | Thrume F9, Road F11 | `Every 6 watches`; `on day 11`, `at midwinter` |
| People who move on their own errands | Road F10, Thrume F2, House 13 | `Errand webb to saska_hearth on day 18 …`; a pursuit that overrides `Peaceable` |
| Passages: hidden on any condition; per-end words; their own labels | Thrume F5, F6, Road F6, Patient Star 30, 36 | `hidden until state(…)`; per-end descriptions; `labelled "…"` |
| Perception beyond sight; dark speech | Patient Star 4, Road F5 | `heard`, `felt` observations; a douse action |
| Identical things listed one by one | Thrume F14, Road F18 | Stack them with a count |
| A grave act on one click; a listener who refuses | Road F12 | `Confirm "…"`; `Refuses when … "…"` |
| A discovery and the speech that taught it told twice | Road F17, critique 9 | Let a topic's words stand for the discovery in the moment |
| Lint that understands rules | Thrume F7, Road wishes 3–4 | Rule moves as reachability; write-only facts; a trace of a watch |
| A shared law's kinds cannot be sold by the module using it | Patient Star 12 (P8) | `Sells` refers to an existing kind before declaring one |
