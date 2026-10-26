# Mission 16 reconciliation

Where the obligations Mission 16 inherited stand at its close: Mission 15's next steps, the reviews and the cold
playtest, Low Water's friction list and this mission's own findings, and what became of each branch. Each row is
**fixed** (done, and pinned by a test or a play), **partial**, **open**, **superseded** (overtaken by a later
decision) or **deferred** (left on purpose, with the reason). A row that says "not re-checked" is open as far as this
record knows. The reviews are evidence, not the roadmap.

## 1. Mission 15's report: what it set next

| Item | Status | Evidence |
|---|---|---|
| Settle the direction with a new player on the prototypes | superseded | The owner kept the portrait conversation page; the white literary page carries the rest. No new player (§8) |
| Topics that keep a follow-up | partial | A topic asked is marked "asked" for the rest of the conversation; the return gives the Merrowdale lead its follow-up. A `once` topic still vanishes, and there is no general follow-up form |
| A return told as one | fixed | `test/return.test.ts`; the journey home told leg by leg |
| Ways that name the known place they lead toward; travel along a known route | fixed | Gate B; `test/travel.test.ts` |
| The doer of an act shown and chosen | partial | An act one member does names them ("Collect a lantern for Wenna"); spells, their preparing and every development are done by the member the player picks. There is no general choice of who does an act |
| Exceptional moments marked | partial | Seeing something through ends as a chapter of its own. A level gained and a body found are still told in the ordinary register |
| The cold playtest's correctness defects | partial | §4 |
| The mine's galleries giving shelter as "outdoors" | open | Not met in this mission's play |
| An editorial pass over the paintings | fixed | 41 paintings refused, each with its reason (`data/paintings/unfit.json`); a sitter is chosen by what the person's role says they are, or none; `test/paintings.test.ts` |
| The inner loop: order-preserving projection; the game kept in unchanging pieces; time advanced to the next watch that matters | deferred | Not a gate of this mission. The wren record still plays through (334 commands) and its hashes are recorded anew in the ledger |
| Assess Low Water on its branch | fixed | Merged whole (81eaa26) as one of the independent adventures |

## 2. The audit of `ab9055a` (25 October)

| Finding | Status | Evidence |
|---|---|---|
| F2–F7, F9 | fixed in Mission 15 | Mission 15 ledger |
| F1 module kinds in process-global catalogs | open | Partly repaired in Mission 15; the 26 October review (N7) shows it reaching the parse cache. No player-visible defect met this mission |
| F8 event and knowledge forms narrower than authors expect | partial | Talk overheard is now known as heard (an observation's `hearsay` aspect); the rest is a boundary of the language, not a defect |

## 3. The review of `483e3af` and its readiness memorandum (25 October)

| Finding | Status | Evidence |
|---|---|---|
| A1 a learned fact blocking every later country; A2 a checkpoint during a crossing; E2 a march-stone naming the wrong country | fixed in Mission 15 | Mission 15 ledger and specs |
| B1 presentation inside the authority boundary | open | Unchanged |
| B2 module kinds in global catalogs | open | As F1 |
| C1 kinds one world-wide namespace | partial | Every colliding name reported in one load (Mission 15, 6780b43); still found at installation, not by lint |
| C2 a module's actions range over the whole world | partial | Two actions worded alike are told apart (Mission 15, F7); the scope not re-checked |
| D1 knowledge one bit per company | partial | The Notes keep how each thing is known: seen, heard, read or found. Knowledge per member is open |
| D2 gaps in a companion's lifecycle | partial | A companion who leaves (Mission 15, F4); the rest not re-checked |
| E1 authored adventures unreachable from Begin | fixed | Mission 15 placed them in generated worlds; this mission made them found from Begin (Gate B). Free play reached Merrow green 4½ minutes after Begin |
| E3 travel over known routes; transport services | partial | Known-route travel fixed (Gate B); services deferred with the city |
| G1 saves with no version, growing with the log | partial | The browser's kept game carries its build's stamp, and one from another build is checked as it opens (N2). A session's own save has no stamp; the log still grows |
| H1 tests prove scenes more than journeys | open | This mission's new specs also put the company where they test |
| Handoff items 4 (`{?x}` printed), 5 (observations near a variable not teaching), 8 (identical labels) | fixed in Mission 15 | 0efdc56; F5; F7 |
| Two vacuous tests (`community.test.ts:151`, `wild-country.test.ts:103`) | open | Recorded, not repaired |
| Item 25, the audit's report missing from the record | deferred | The audit is the owner's material, kept out of the record on purpose |
| M16A "Two adventures, one road" | fixed except one measure | The Long Man and an independent adventure in one Begin world, both entered (Coldwaste, then Thrume); known destinations and assisted travel; save and restore in the browser. The eager-installation measurement was not taken |
| M16B a city, a companion who remembers, a service | deferred | Not this mission's brief |
| Owner decisions: compatibility; shared kinds; knowledge granularity | partial | Compatibility settled as the build stamp (N2); the other two open |

## 4. The cold playtest of `2684952` (25 October)

| Finding | Status | Evidence |
|---|---|---|
| 1 The authored adventures effectively unfindable | fixed | E1 above |
| 2 The first expedition a coin-flip party wipe | partial | A danger is reckoned in simulated trials, and again where the odds are uneven; The Long Man can be seen through without a fight, for a level. Level-1 margins are unchanged: shortening the knockdown that locked fights made them worse for the company (ledger) |
| 3 Defeat and casualty text misreports | partial | Fixed: everyone who fell named, the protagonist first; both sides counted; a fight the company began is said to be its own; a flight that gets away goes back the way it came, and nothing comes at it after (`test/engagement.test.ts`). Open: the last chosen act unseen before the end; bleeding begun and ended in one round; a member "infected" by their own miss |
| 4 Building and understanding the party nearly opaque | partial | Fixed: a Character view from the start, every figure from the rules, each development shown with what it changes and what it opens; a Light spell on the light line, with the time it has left (`test/darkness.test.ts`); a specialist's domain or school named, and a spell above any slot the member has marked "not yet" (`test/advancement.test.ts`). Open: no allocation of rolled qualities; preparing a spell's hour unsaid; a recruit before hiring not re-checked |
| 5 Generated prose shows its templates | partial | Fixed: "You carry out the action." gone; lines spoken of many agree; the dale's people greet in their own manner; a journey sets out once, without a land line repeated. Open: one piece of news word for word in two mouths; rumours alike but for a name; assembled place phrases and twice-used names. The inscription and the riddle not re-checked |
| 6 The game invites interactions it can't answer | partial | Fixed: every close look in The Long Man answered in its own words; a fruitless try elsewhere is said as itself; the brothers can be asked after. Open: tries over generated things are still offered by what they can be done to, not by what answers; no copying action for a scribe |
| 7 Notes and Story less trustworthy than they look | partial | Fixed: talk overheard filed as heard; the Story whole across a reload (`test/reader-store.test.ts`, `test/deep-rivals.test.ts`); a brood the company never heard of no longer among its unfinished matters. Open: a thing heard of and since taken stays "heard, not yet seen"; other situations not re-checked |
| 8 Consequences happen but are hard to see | fixed | The brothers' going heard; their prior says where they went; their mark on each level from the day they reach it; their fate heard where it is talked. "Begin again in this country" not re-checked |
| 9 The economy dissolves the stakes | deferred | An economy is outside the brief |
| 10 Navigation repetitive and duplicated | open | Two places with one name met again (Icereach) |
| 11 Small state contradictions | partial | A torch burns only while wanted (Mission 15); "Nothing lit" no longer said under a Light spell; the dark said once on a page. The rest not re-checked |
| 12 Unverified suspicions | open | A failed check that cannot be retried is still not said to be so |

## 5. The architecture review of `0e066e5` (26 October)

| Finding | Status | Evidence |
|---|---|---|
| N1 the browser save torn by its quota, silently | fixed | Written into the slot not in use, the pointer last; the player told, with a download, when a game cannot be kept; `test/reader-store.test.ts` |
| N2 a save trusted by its format, not its build | fixed | Every kept game carries the stamp of its build; only one from this build is trusted, and any other is checked as it opens |
| N3 Kyr written as strings and read back by pattern | deferred | No player-visible defect; a builder's seam for a mission of its own |
| N4 generation data with no schema | deferred | As N3 |
| N5 the layer table unenforced | deferred | As N3. The build stamp sits in the session layer, so `web/` does not reach into the CLI |
| N6 the shipped engine: polyfills, no source map | deferred | |
| N7 the parse cache keyed by text over global catalogs | open | The strongest case for F1's full repair |
| N8 the repository's weight | deferred | History is the owner's call |
| N9 classes as namespaces; N11 smaller items | deferred | Read, not acted on |
| N10 the record hard to search | deferred | The record's house style is the owner's |
| N12 review saturation; findings scattered | partial | This document gathers them; the reviews themselves remain on their branches (§9) |
| Its re-checks: B1, F1/B2, F-15 (semantics keyed to English), H1 | open | As above |
| Its re-checks: F-10/G1 | partial | As G1 above |
| Its re-checks: Mission 14's `complete()` as a pipeline | deferred | |

## 6. Low Water's friction list (27 entries)

`doc/adventures/low-water/friction.md`, kept as its author wrote it. This mission did not work through the list: it
merged the adventure and placed it. Of the entries, 27 (nothing compares an encounter with the party) is partly met:
the page reckons each danger in simulated trials, though lint still does not. The rest stand as reports for the
builder.

## 7. Mission 16's own findings

In [ledger.md](ledger.md), under "Found, not yet done".

## 8. Independent feedback

None. No player or reviewer outside this session has played Mission 16's build. The cold playtest, the reviews and
Low Water's author are evidence from before it or beside it, not of it.

## 9. Branches

A branch is pruned once nothing on it is missing from main. For the five not merged as commits, every file each one
adds is in main; where a file differs, main's is the later form. That was checked file by file: the branch kept its
own copy of a driver main shares, a company main now declares apart, and kinds main moved into the catalog. Each
pruned head is kept in this clone as `refs/archive/<branch>`. To restore one: `git push origin <head>:refs/heads/<branch>`.

| Branch | Head | Its content | Done |
|---|---|---|---|
| `adventure/low-water` | `f3e4f08` | merged as commits (81eaa26) | pruned |
| `claude/laughing-cerf-lwk6hb` | `eede9a9` | Low Water's first pass, merged as commits | pruned |
| `adventure/thrume` | `9076108` | Thrume; main carries it further | pruned |
| `adventure/corrow` | `0f37025` | Let One Remember to Act V; main carries it further | pruned |
| `claude/clever-maxwell-4kz68q` | `ac53969` | Let One Remember's design, an earlier state | pruned |
| `hold-one-season-authoring` | `64e8a5d` | The Patient Star; main carries it further | pruned |
| `house-that-grows-authoring` | `199db32` | The House That Grows; main carries it further | pruned |
| `claude/youthful-cori-a0rqup` | `b5edef0` | the same commit as `review/architecture-2026-10-25` | pruned |
| `review/architecture-2026-10-25` | `b5edef0` | the review of `483e3af` and its memorandum | kept: §3 is not all addressed |
| `review/cold-playtest-2026-10-25` | `8bba500` | the cold playtest, with its saves and screens | kept: §4 is not all addressed |
| `review/architecture-2026-10-26` | `112d61f` | the review of `0e066e5` | kept: §5 is not all addressed |
| `adventure/tessary` | `242d3cd` | What Tessary Owes, a new independent adventure pushed on 26 October, not merged | kept: arrived during this mission and not assessed in it |
