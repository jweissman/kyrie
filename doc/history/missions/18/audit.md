# Mission 18 audit

2026-10-30, at main `a69af27`. Mission 18 began at `7b62d99`. This audit was made by reading only: no tests, builds, browsers or `kyrie reach` runs were made for it. Work sitting in an uncommitted worktree counts as not implemented here, and the gap column says where it is.

## 1. Verdict

Mission 18 has built a good deal of the interface and very little of anything else.

- **Gate A.** The lantern stage, the title, the quiet creation, the fight and the board map are on main and can be reached from Begin.
- **Gate B.** One province (the Strewnfield) and the `within` install.
- **Gate C.** Never worked as a phase. On main there are shops, the reach repairs, Pellam's fair, Callow, the commons and the open country.
- **Gate D.** M18's whole diff over `src/lang`, `campaign`, `canon`, `cli` and `session` is 132 lines.
- **Gate E.** No construction, as the order intends.

Much more sits uncommitted in worktrees: the circus, one universe, the opening, faces, the map's knowledge model, the inherited batch, friction and the Grand Tour.

In the four senses:

- **Implemented.** Gate A in part; elsewhere in pieces.
- **Reachable.** Most of what is built, except authored adventures. An ordinary player cannot choose them from the title.
- **Usable.** Shown only in builder-scripted runs and in a cold review that could not open a browser.
- **Enjoyable.** Nobody's verdict yet, and the owner's verdicts so far are negative. No requirement in any gate has been both played by an independent player in a browser and accepted by the owner.

What stands between the owner and an enjoyable ordinary game is the expedition itself, not the palette or the map's art:

- a first arrival of 142 words with 45 peer commands;
- a lead, an aim and a map that tell three different stories;
- a promised site that turns out to be one room;
- a clue that leads nowhere;
- an empty wild between towns;
- a lone novice who meets danger without a warning or a way back (7 of 17 solo mages fall in the first ruin).

The common cause is that the runtime offers every legal act and the page shows them all. The engine does not yet decide what can meaningfully be done now.

The register stands at:

| Rows | Fixed | Partial | Open |
|---|---|---|---|
| Inherited | 2 | 61 | 9 |
| Owner (of 42) | 0 | 17 | 25 |
| Authors | 0 | 11 | 58 |

## 2. The gates

Column meanings:
- **Implemented:** on main.
- **Reachable:** by an ordinary player from Begin, or by an author for tools.
- **Usable:** shown working when reached.
- **Enjoyable:** a verdict from play, the owner's where there is one.

### Gate A: the interface

| Id | Requirement | Implemented | Reachable | Usable | Enjoyable | Gap |
|---|---|---|---|---|---|---|
| A1 | Bounded stage at desk, tablet, phone | yes | yes | partly | unknown | Bounds spec covers only creation and the first place, in Chromium; the 390-wide fight clips the third card |
| A2 | Near-black ground, luminous colour, no web cards | yes | yes | yes | partly | Palette right; the place page is still bordered cards, stacked lists and a status footer |
| A3 | Ident, title, centred menu | yes | yes | yes | yes | The ident has no words and the title reads KYRIE (OWN-42) |
| A4 | One state vocabulary; keyboard, touch, reduced motion | partly | yes | unknown | unknown | `.act` states exist; no spec for states, focus or layout shift; never played by touch |
| A5 | A composition for each activity | partly | partly | partly | no | About 4 of 11; room, object, road, commerce and pack, advancement, public events have none |
| A6 | Creation as the choice of a life | yes | partly | yes | unknown | Authored campaigns still open the old dropdown page; five origins; the weapon is behind Details |
| A7 | Lenses; a narrator that never contradicts the world | no | no | partly | unknown | No perceived view in the engine; the page reads prose by regex (`moments.tsx`) |
| A8 | Arrival, return and weight told differently | no | no | no | unknown | Glance not begun; 142 words and 45 commands on arrival; returns relist everyone |
| A9 | One terrain-first map | yes | yes | partly | no | OWN-22 to 25 open; no step, journey or going-in on the board; not accepted |
| A10 | Portraits fitted to people; art for great places | partly | yes | unknown | unknown | The inherited 804-painting audit goes uncredited; no census, spot review or place art |
| A✓ | Integrated play on a real tablet, owner assessed | partly | partly | partly | no | Pellam and Callow reachable only by `?dev` or `?campaign`; no iPad session |
| OWN-02 | Terrain-first map replaces the diagram | yes | yes | partly | no | Register still Open with no evidence; a place only heard of shows its route |
| OWN-03 | Less on screen | partly | yes | partly | unknown | Creation and sheet compact (`507f68e`, `49c4338`); the place still offers 30 to 45 commands |
| OWN-08 | Map from first principles, three treatments | yes | yes | partly | no | Superseded by OWN-12; close it with OWN-22 to 25 |
| OWN-10 | Visual hierarchy; compact sheet and pack | partly | yes | no | unknown | Pack not recomposed; the place gained panes (`f076c8e`) |
| OWN-12 | Explorable 3D board | yes | yes | partly | no | No acts on the board; never judged on an iPad |
| OWN-14 | Creation as centred cards | yes | partly | yes | unknown | Owner's verdict awaited; authored campaigns bypass it |
| OWN-15 | A school's spells shown; icons useful in play | yes | yes | yes | unknown | Icons appear only in creation |
| OWN-16, 30 | Drawn protagonist names; Common heartland names | yes | yes | yes | unknown | Region names (stage 4) remain |
| OWN-17 | A nearly empty opening scene | no | no | unknown | unknown | In the opening worktree, ungated; authored campaigns get none |
| OWN-18 | Locations radically shorter | no | no | no | no | Not begun; the glance worktree is empty |
| OWN-19 | Quiet play view | no | no | no | no | Not begun; needs a runtime affordance projection |
| OWN-20 | Each activity its own composition | partly | partly | partly | unknown | Exploration and place not done |
| OWN-22 | A world without an abrupt edge | no | no | no | no | Islands of known land among dark hex outlines |
| OWN-23 | One knowledge model | no | no | unknown | unknown | In a map worktree (`land-knowing.test.ts`), uncommitted |
| OWN-24 | Places marked by what is known | no | no | unknown | unknown | In a map worktree; reads a place's kind from its English name |
| OWN-25 | Terrain and composition refined | no | no | no | no | Not begun ("a world, not a rough tile prototype") |
| OWN-29 | Party portraits on fight cards | yes | yes | yes | partly | Owner asked for larger (OWN-39) |
| OWN-39, 40 | Larger card portrait; presentation and a roll of names | no | no | unknown | unknown | In the faces worktree, ungated |
| OWN-42 | Words for the ident; a product name | no | yes | yes | partly | No names proposed; intro worktree empty |
| M17-25 | No dropdowns, folds or link lists in play | partly | yes | partly | unknown | Selects on the old company page; "Every way from here"; no counting spec |
| M17-27 | Wide, explained creation choices | partly | yes | yes | unknown | Origins not widened; weapon hidden by default |
| M17-29 | Navigation without trees or dead ends | partly | yes | partly | no | 19 ways at Ramavor's bailey; three interior exits all "the gallery" |
| M17-31 | Nothing clipped on an iPad | partly | yes | partly | unknown | Chromium only; no WebKit, no real iPad |
| M17-71 | Places not lists, travel not a log | partly | yes | partly | unknown | Fight recomposed; place and road are not |
| PRE-04 | The map beautiful and legible | partly | yes | partly | no | Map spec covers 1440 and 390 only |
| ARV-H5, COR-12 | Presentation never reads truth or prose | no | n/a | no | n/a | The Perceived view and its boundary test |
| NAR-12 | Every note has a source | no | n/a | unknown | unknown | Waits on A7 |
| NAR-14 | Exceptional events on their own stage | partly | partly | partly | unknown | Two moments found by regex; no authorable Moment |
| M17-23, PRE-05 | Likeness for the long tail; refusals with reasons | partly | yes | unknown | unknown | 54 PC portraits reviewed; no pass over NPCs, no census |
| M17-65, 67, 93 | One painting per person; the widow; "your mother" | no | no | unknown | unknown | Fixed in the inherited worktree, not landed |
| M17-69 | Map names never crossed | partly | yes | unknown | unknown | Its tests guard the retired `atlas.ts`; the live labels have none |
| M18-02, 03 | No outdoor painting indoors; land revealed about roads walked | yes | yes | yes | unknown | Keep M18-03 green through the knowledge model |
| GTR-17, X02, X05, 19 | Splitter, presence, result order, who pays | no | yes | partly | n/a | Small telling faults; GTR-P2 still to reproduce |
| WPC-11 | "Known as" names in every label | partly | no | partly | n/a | Needed before the circus lands |

### Gate B: one country

| Id | Requirement | Implemented | Reachable | Usable | Enjoyable | Gap |
|---|---|---|---|---|---|---|
| B1 | Adventures composed into one country | partly | partly | unknown | unknown | One province, never reached in play; 12 adventures beyond marches; none share a town |
| B2 | The City of Seven Towers | no | no | n/a | unknown | Not begun |
| B3 | Imbar's chassis | no | no | n/a | unknown | No canonical atlas; its home undecided while universe phase 1 fills `data/imbar` |
| B4 | Declarative placement with provenance | partly | n/a | partly | n/a | Written in shared lists (`countries.json`, `standing.json`), the edits B4 forbids; no report |
| B5 | Knowledge states; discoverability | partly | yes | partly | unknown | Journal sources and map hexes exist; no single ladder |
| B6 | Surveying, vantage, spyglass | yes | yes | yes | partly | Brief still says "—"; no companion names a sighting; little to find |
| B7 | One clock and state across modules | partly | partly | n/a | no | No cross-module consequence; a late module's clock is wrong (GTR-01) |
| B✓ | Report; adventures sharing a town; one protagonist through three | no | no | n/a | unknown | All four conditions |
| ADV-01 | Every adventure in one continuing world | partly | partly | unknown | unknown | Tracks B1 |
| COR-05 | A module's actions range over its own places | partly | no | n/a | n/a | No spec with two modules in one town; becomes P0 when the circus lands |
| NAV-10 | Authored content found in ordinary play | no | partly | n/a | unknown | The tour entered 9 of 13; not re-run |
| ADV-07 | The Third Night in the one world | partly | partly | yes | unknown | Still beyond a march; a good second province |
| NAV-09 | A deep site reached from a town | partly | no | n/a | unknown | A minor cave still passes for a long journey's reward |
| NAV-17 | Newcomers go where rumours go | partly | yes | unknown | unknown | Not measured in M18 |
| CTH-06, ICE-02 | News told where it happens, or late on return | partly | n/a | n/a | unknown | No late telling |
| NAV-04 | One name per place in a country | partly | n/a | n/a | n/a | No census |
| M18-04 | Four adventures in the reader's list | yes | no | yes | unknown | Developers only (`?dev`) |
| OWN-13 | Grand Tour examined, questions first | yes | n/a | n/a | n/a | The owner's word on one-universe decisions 1 and 3 |
| OWN-31 | One canonical instance of each plane | no | no | n/a | unknown | Universe worktree, ungated |
| OWN-32 | Inner and outer planes kept apart | no | no | n/a | unknown | Canon side in worktree; the Grand Tour's Fire still uses Gehenna's law |
| OWN-33, 34 | One House of Doors; the Rose opens its upper part | no | no | n/a | unknown | Identity only, in worktree; Sennet unbound |
| OWN-35 | Identity before installation | no | no | n/a | unknown | Half done in worktree; the Library not yet a plane |
| OWN-36, 37 | Grand Tour integrated and playable by anyone | no | no | n/a | unknown | Phases 2 and 3 not begun; it fixes Tamsin as the protagonist |
| OWN-38 | Seven demonstrations | no | no | n/a | unknown | One, at fixture level, uncommitted |
| GTR-01, 13 | A late module's clock; `been` written on every move | no | yes | no | no | Fix before more placements and before the map's ladder |
| WPC-16, 17, 18 | Standing placement; the next town; claims | no | no | unknown | unknown | In the circus worktree; claims implicit; no report line |
| WPC-X06 | Endings in placed scenarios | no | yes | no | no | A going-on's Ending closes the whole book; raise to P1 |
| Universe ph. 1 | Canon first, refusals, Imbar bound | no | no | n/a | n/a | About half done, some 34 files, no gate; will move digests |
| Grand Tour | The branch brought into main | no | no | n/a | unknown | Staged merge five commits behind; gate log empty; merge after phase 2 |
| Circus | Wapshott's Circus merged | no | no | unknown | unknown | Typecheck fails, one kept trace fails; brings shared-registry edits |

### Gate C: the ordinary loop

| Id | Requirement | Implemented | Reachable | Usable | Enjoyable | Gap |
|---|---|---|---|---|---|---|
| C1 | 10–100× POI density, measured | no | partly | partly | unknown | No baseline or after; the 380 places are mostly empty tracts |
| C2 | Places arise from their surroundings | partly | yes | partly | unknown | A livelihood gives a name and a trade, never an activity; no battlefields, no city |
| C3 | Things described respond | partly | yes | partly | unknown | The prose names a rope that cannot be taken; search yield unmeasured |
| C4 | A deep dungeon | partly | partly | partly | unknown | Ordinary leads point to one-room dens; exits share names; not played in M18 |
| C5 | An adventuring economy | partly | yes | partly | unknown | Supplies fixed; no census since 8.75×; a sale still counts as experience |
| C6 | Novice survival for every calling | partly | partly | no | unknown | 7 of 17 solo mages fall; no simulation in M18 |
| C7 | Combat as an encounter | partly | yes | unknown | unknown | Two teams only; no negotiated endings; no owner verdict |
| C8 | 10× conversation for major NPCs | partly | partly | partly | partly | Callow alone; phantom audience untested; generated NPCs never take the initiative |
| C9 | Noncombat lives | no | partly | no | no | No repeatable livelihood; the acceptance not attempted |
| C10 | Renewal; less repetition | no | partly | unknown | partly | One fever beat; 33% of sentences appear in 75% of countries |
| C✓ | One full ordinary expedition, and the rest | no | partly | no | no | Every part (see OWN-28) |
| OWN-01 | Audit what play reaches | yes | n/a | partly | n/a | After-numbers unpublished; generated worlds not covered |
| OWN-04 | Settlements with observable life | partly | yes | partly | partly | Pellam lives; generated towns are cast lists |
| OWN-05 | Ordinary commerce | yes | yes | partly | unknown | No services list upright or in the terminal; no outfitter in Hessel or Carth |
| OWN-06 | Significant conversations | partly | partly | partly | partly | The pattern is not in the generated disputation kit |
| OWN-09 | Wilderness as a central pleasure | partly | yes | partly | partly | One discovery, little between |
| OWN-26 | Cumulative discovery | no | partly | no | unknown | In the map worktrees, uncommitted |
| OWN-27 | A wilderness worth exploring | no | no | no | no | No code anywhere |
| M17-56 | Traps with many answers | partly | yes | no | unknown | Without a pole or the skill, the only answer is who goes first; 3d6 at the first ruin |
| NAR-01 | Residents with home, work and routine | partly | yes | partly | unknown | No routine by the watch; no visible relations |
| NAV-01 | No long wandering without opportunity | partly | n/a | no | unknown | Lead, aim and map not linked; no long-play measure |
| PT-11, 23 | Every calling's first fight answerable; no grinds | partly | yes | no | unknown | No simulation re-run; no warning, no answer on sale |
| PT-38 | Danger told honestly | no | no | partly | unknown | In the inherited worktree; "easily won" sits beside "A RISK" |
| CMB-02, PT-33 | Truthful defeat text; Hamo's men react | no | no | n/a | unknown | In the inherited worktree |
| PT-01, 29 | Successors and aftermath | partly | n/a | no | no | "Nothing more is asked of you" |
| PT-02, 35 | Reward balance; treasure with a buyer or a use | no | n/a | n/a | no | No census, no sinks |
| PT-14 | Performance, toll talk, trade, inn work | partly | yes | unknown | no | No trade between towns |
| PT-15 | Less verbatim repetition | no | n/a | n/a | no | The circus adds one more identical institution |
| NAR-17 | Offscreen undertakings leave traces | no | n/a | n/a | no | Raise to P1 |
| M17-99 | One inn topic per site | no | n/a | n/a | unknown | Small batch fix |
| GTR-25 | An ambusher gives a moment to see it | partly | yes | partly | unknown | Ambush strikes at once; no lint |
| CMB-12 | Encounter strength against expected level | no | n/a | n/a | n/a | Authoring tool |
| M17-21, 45 | Fever's second beat; a fair fight at Doble's yard | yes | yes | partly | unknown | Shown by tests only |
| M18-05 to 10 | No early book-closings; outfits stocked; nobody mute | yes | yes | yes | unknown | Done, but "not mute" is not "worth opening" |

### Gate D: language, tools, architecture

| Id | Requirement | Implemented | Reachable | Usable | Enjoyable | Gap |
|---|---|---|---|---|---|---|
| D1 | Independent Kyr review | no | n/a | n/a | n/a | Absent; about 15 rows wait on it |
| D2 | Self-contained `kyrie new adventure`, install, uninstall | partly | partly | partly | unknown | Writes outside its folder; scaffolds a march, not a province; no install |
| D3 | No fiction from TypeScript; module tables | partly | n/a | partly | unknown | Going backwards: three new emitters (tracts, outfitters, commons) |
| D4 | CLI family audited for fidelity | partly | yes | partly | unknown | No `new table` or `new generator`; five known faults; no audit |
| D5 | Character laboratory, nine examples | partly | yes | partly | unknown | Four behaviours missing, "asks and acts" among them |
| D6 | `kyrie stats`, `info`, diagnostics | partly | yes | yes | n/a | Only `reach`, which paid off (M18-04 to 10) |
| D7 | Interactive play, one authority, save parity | partly | partly | partly | unknown | The interactive shell is the old Campaign view; saves do not cross between interfaces |
| D8 | `kyrie bench` with history | partly | partly | partly | n/a | M15's scripts only; nothing measured since the world nearly tripled |
| D9 | Architecture repairs by severity | no | partly | n/a | unknown | Not begun; several of its classes grew in M18 |
| D✓ | An outside author, no engine edits | no | n/a | n/a | unknown | Both authors edited `src` and the shared catalogs |
| FRICTION-1 | Rule timing and telling (GTR-02, 23, X03, 04, 05) | no | yes | partly | unknown | One failing test, in the friction worktree |
| FRICTION-2 | Late-installed clocks and records | no | yes | no | no | In no worktree |
| FRICTION-3 | Standing placement and road roles | no | no | unknown | unknown | With the circus |
| FRICTION-4 | Composition in one country (WPC-X06, 04, 14, X03, X04) | no | yes | no | no | Chapters for placed scenarios; a shared offstage; kinds scoped by module |
| FRICTION-5 | Cheap telling faults | no | yes | partly | no | Each S; raise to P1 because they serve OWN-18 and 19 |
| FRICTION-6 | Variation of repeated texts | no | yes | partly | no | A first and a later telling; a conditional Result |
| FRICTION-7 | Kyr forms authors asked for | no | n/a | partly | n/a | Four cheap ones (WPC-08, 05, 03, GTR-11); the rest wait on D1 |
| FRICTION-8 | Tools and diagnostics | no | n/a | partly | n/a | Mostly S; `--as` and `@relation` already written on the branch |
| FRICTION-9 | Rows still to reproduce | no | unknown | unknown | unknown | GTR-16, GTR-P2, WPC-19, WPC-21 |
| FRICTION-10 | Rows answered on main | yes | n/a | yes | n/a | Tell the authors |
| ARV-M6 | Hidden registries | no | partly | no | n/a | Grew in M18 (`web/scenarios.ts`, `standing.json`) |
| ARV-M7 | One membership lifecycle | no | yes | partly | unknown | A companion's death goes unseen; followers are left behind |
| ARV-H4, AUT-25 | Emitters; module tables | partly | n/a | partly | unknown | Emitters grew; Kyr has no Table form |
| ARV-H7, COR-04 | Process-global caches | partly | n/a | yes | n/a | One universe will co-install more modules |
| ARV-M5 | Only two teams | no | no | n/a | unknown | Candidate for M19 |
| ARV-M8 | Swallowed Deem failures | partly | partly | n/a | n/a | Three catch sites; cheap |
| ARV-L2 | Identity in id strings | no | n/a | n/a | n/a | Grew (`reach-tool`, `world-assembler`) |
| ARV-A24, H6, A9, A19, M2, M3, M4 | Saves, determinism, binding, wording, Kyr's middle | partly | n/a | partly | n/a | No M18 work |
| AUT-05, 07, 19, 23; CTH-05, 09 | Arithmetic, names, sources, lint, windows, setting-out voice | partly | n/a | partly | n/a | AUT-05's division and CTH-09 are cheap |
| OWN-41 | Common names through `languages` | no | yes | yes | unknown | Owner: not urgent; do it once, with region names |
| M18-01, AUT-06 | The a1 record replays; `carries … or` | yes | n/a | yes | n/a | Kept records break whenever names change |

### Gate E: careers, culture, cosmology

| Id | Requirement | Implemented | Reachable | Usable | Enjoyable | Gap |
|---|---|---|---|---|---|---|
| E1 | Orsino's inheritance; formations; mimicry, reflection | partly | partly | partly | unknown | No rule reads a formation; reflection not executed; 0 of 27 companion types |
| E2 | Multi-stage careers | no | no | n/a | no | Needs C9 first |
| E3 | Companion arcs | partly | partly | partly | unknown | ARV-M7 first |
| E4 | Planes and the House of Doors | no | no | n/a | unknown | Canonical identity in worktree (moved to Gate B, P0) |
| E5 | The elemental grand tour | no | no | partly | unknown | On the unmerged branch, played as the fixed bard |
| E6 | Supermodules | no | no | n/a | unknown | Deferred by the brief's own condition |
| E7 | One chronology; seasons, festivals | partly | yes | yes | partly | No month or year query; night is nine to six all year; no festivals |
| E8 | Art and culture as play | partly | partly | partly | unknown | Gosse's Company only; reach finds 16 of its 76 actions |
| E9 | Physical semantics | partly | yes | yes | unknown | No substances, pouring, mixing or breaking |
| E10 | Literary variety; a large battle | partly | partly | partly | unknown | No horror, satire or romance; no battle |
| E11 | The Encyclopedia of Imbar | no | yes | partly | unknown | The title's link opens the M7 handbooks and an Orsino coverage table |
| ARV-A5 | Every ability's text against what it does | partly | yes | unknown | unknown | No catalog-wide spec |
| AUT-09 | Module calendar; date queries | partly | n/a | partly | n/a | The row's text is stale: `day(clock)` exists |
| ICE-15 | Dark by season | partly | yes | partly | unknown | Midsummer nights in Wolfmoon |
| M17-73 | Ranger specialty; summons by level | partly | yes | partly | unknown | No specialty; a deer of three hit points |
| NAR-18 | One substantial companion across modules | partly | partly | partly | unknown | Waits on ARV-M7 and B7 |
| GTR-X07 | A parting line against the list of who is present | no | unknown | n/a | n/a | Mis-filed; belongs under A7 or D |

### Gate F: verification

| Id | Requirement | Implemented | Reachable | Usable | Enjoyable | Gap |
|---|---|---|---|---|---|---|
| F1.1 | The first fifteen minutes | partly | yes | partly | no | No quiet opening, no short arrival, no name |
| F1.2 | A shared country, several adventures | partly | partly | unknown | unknown | No two adventures share a settlement |
| F1.3 | POI richness | partly | yes | partly | no | Counted, never measured; the tracts are empty |
| F1.4 | Geographic perception | yes | yes | partly | unknown | No single knowledge ladder; no owner verdict |
| F1.5 | An ordinary expedition | no | partly | no | no | OWN-28 unreported |
| F1.6 | Solo novice combat by calling | partly | yes | unknown | unknown | Not played by calling |
| F1.7 | A substantial NPC | partly | partly | partly | partly | Callow only; the debate not played in the reader |
| F1.8 | Progress that opens a capability | partly | yes | unknown | unknown | No reward opens a route, contact or technique |
| F1.9 | A civilization acting on its own | partly | partly | partly | partly | No aftermath; offscreen work leaves no trace |
| F1.10 | Authoring with public facilities | partly | n/a | partly | unknown | Both authors edited `src` |
| F1.11 | Interactive terminal, save parity, perf reports | partly | partly | partly | unknown | Nothing in M18 |
| F1.12 | Extended cold and owner play | partly | yes | no | no | The cold review was blocked from the browser; no acceptance |
| F2 | Long-horizon, cross-module verification | partly | n/a | partly | n/a | No autoplay over a composed country |
| F3 | Boredom and pull measured | partly | n/a | n/a | n/a | Only reach's idle steps |
| F4 | Performance before and after | partly | n/a | n/a | n/a | Baseline only in the builder's notes; start-up went from 3.5 s to about 4 s |
| F5 | Final register and report | partly | n/a | partly | n/a | The brief's status column is stale since `87f57dd`; no report |
| OWN-07 | Pellam's Frost Fair through the reader | yes | no | partly | unknown | Not from the title; played before the debate and the quiet creation |
| OWN-11 | Exploration demonstration | yes | yes | partly | unknown | Site never entered, nothing found, home never reached |
| OWN-21 | The quiet flow at desk and tablet | no | no | n/a | n/a | quiet.md phases 2, 3 and 5 |
| OWN-28 | Diagnose one expedition, repair it | no | n/a | n/a | n/a | 74 frames and probes; no report, no repair |
| COR-18 | Tests journey rather than teleport | no | n/a | n/a | n/a | No audit list |
| WPC-X08 | The circus played by someone other than its author | no | no | unknown | unknown | Never played in the reader |
| WPC-20, 21 | Odds suffix; a grave choice's steps | no | n/a | partly | n/a | Small |

### Phases

| Phase | Scope | Where it stands | Missing |
|---|---|---|---|
| 0 | Reconcile and baseline | Register and brief done; a1 record repaired | Performance and density baselines never committed |
| 1 | Interface | A1, A2, A3, A6, A9; creation, board, sheet, portraits | A4, A5, A7, A8, A10; owner acceptance on a tablet |
| 2 | One country | One province | Two adventures in one town, the library, the City, B4's report, B7 |
| 3 | Ordinary loop | Shops, reach repairs, Pellam, the commons, open country | C1, C4, C7, C9, C10, C✓ |
| 4 | Kyr, Deem, tools, architecture | `reach`, a deterministic lint, the friction catalogue | D1 to D9, D✓ |
| 5 | Careers, culture, cosmology | Cosmology designed; phase 1 in a worktree | All of E except the canon |
| 6 | Register, independent play, report | Register current; one terminal-only cold review | Browser play, owner acceptance, the report |

## 3. What slipped from earlier missions

Every open or partial row has been carried forward: 73 of 73 from M17 into M18, and all 105 from M16 into M17. What slipped are rows dropped by status, rows still reading Fixed against current evidence, and next steps that were never given a row.

| Id | What slipped | Where it was promised | What to do |
|---|---|---|---|
| SLIP-01 | The M18 accounting table counts 41 owner rows; OWN-42 makes 42 (25 open) | M18 register | Correct it to 0 / 17 / 25 |
| SLIP-02 | COR-15 (choices regrounded in each new world) and CMB-10 (the economy dissolves the stakes), both Deferred, dropped | M16 register :54, :101; M17's own rule "superseded by name, never dropped" | Re-add CMB-10 as superseded by PT-02/C5, and COR-15 as a bench line |
| SLIP-03 | NAR-11, a room not re-told when the light changes; the retrial in Tessary never made | M16 register :120 | Change the light in the Hall of Oaths and record the result |
| SLIP-04 | PT-09, PRE-03, PT-42 and NAV-12 still read Fixed, although the 45-command arrival contradicts them | M17 register :48-72; M16 :78 | Supersede them by OWN-19/28; adopt promoted-against-legal commands as OWN-19's acceptance |
| SLIP-05 | M17's fixed UI rows not re-proved after the lantern, the board, the sheet and the quiet creation; weapon and qualities moved behind Details | M18 register :13-14 | List the spec that holds each row; check that the default weapon fits the calling |
| SLIP-06 | `AESTHETICS.md` still asks for a white ground and calls constant darkness an anti-pattern | M17 brief XXII | Add a dated note that M18 A2 supersedes it |
| SLIP-07 | Foes strike whoever has the fewest hit points (`src/tactics.ts:25`), which kills lone mages; never registered | M14 report :870-879 | Choose targets by kind; let tactics guard a frail ally; re-run the simulation |
| SLIP-08 | A check that cannot be retried is not said to be final before it is tried | Cold playtest 25 Oct, item 12; M16 reconciliation :70 | Mark it, or make failure cost time or reveal something; add a row |
| SLIP-09 | One-way and irreversible choices are marked case by case, with no guarantee | M15 grave confirm; M16 PT-17; M17 brief VII | A lint over the library and generated sites (plausible, not re-verified) |
| SLIP-10 | What each member knows; claims two sources tell differently | M14 F-05; R25-D1; M17 brief XIX | Put it to D1; register it as a row or a stated boundary |
| SLIP-11 | Things made in play, conditional destinations, counted offers, rule tracing | M13 authorability :48-52, orsino :68-80; M14 report | Make them D1 examples, counted offers first |
| SLIP-12 | A sky purpose for the deep sites (the Star-Readers' tower) | M14 report :885 | Note it under C4/C10, or close it by decision |
| SLIP-13 | A world that changes on its own: ecology, a settlement's fortune, belief acted on | M13 world.md :87-91; M14 Proof C | Make fortune one kind of OWN-04 situation; ecology to M19 by decision |
| SLIP-14 | People at work in the wild; chance meetings | M13 next 2; M17 ahead §3 VI | Carried as OWN-27, still unbuilt after five missions |
| SLIP-15 | Independent players watched in a browser | M13; M15; M16 §9.7; M17 ahead, Gate F | No independent player has used the M18 interface in a browser; use the local NSS libraries |
| SLIP-16 | Transport services (a carter, a ferry, passage paid on a road) | M16 reconciliation :45, :52 | Make it part of C5 or B2, or record the deferral |
| SLIP-17 | Nonvisual access narrowed to keyboard, touch and reduced motion; the map is now a canvas | M16 brief priority 1; M17 brief IV | A screen-reader pass; a map path that does not need the canvas |
| SLIP-18 | The iPad and Safari slowdown that started M15, never measured on the device | M15 performance :20, :175; M16 reconciliation :22 | A WebKit and iPad measurement in D8 |
| SLIP-19 | R26 N4, N6, N8 to N11; required CI checks; AUD-F8 | M16 reconciliation; M15 ledger | One "Deferred, with reason" row |
| SLIP-20 | Acts offered by what answers, not by what is legal | Cold playtest 25 Oct, item 6; M13 | The structural cause behind OWN-19; make it one of OWN-28's corrections |
| SLIP-21 | M17 brief X, XII, XV, XVIII, XIX items absent from the M18 brief; the M17 commission is not in the repository | M17 brief (held in memory only) | Record them as not carried; commit the M17 commission text |
| SLIP-22 | A fast, reliable gate; a runner for the tests a change touches | M17 brief XXI; M17 ahead §4 | Time the gate and its memory peak; make the affected-tests runner the default |
| SLIP-23 | M17-21 marked Fixed by tests alone, though its acceptance asks for a play | M17 register | Call it Built until a cleric with feverwort is played in the reader |
| SLIP-24 | The builder's edits to twelve authors' adventures, with no notice recorded | M18 brief, Responsibility; M17 ahead | Note each in the adventure's own doc; get the owner's leave once |
| SLIP-25 | The sale description says "its worth is experience"; the engine grants half | M16 PT-03 | Correct the text; put sale experience into the economy census |
| SLIP-26 | The library tour not re-run; the four farthest countries never reached | M17 ahead §1, §5.1 | Run the budgeted tour after placement |

The Gate C and D audits found four more slips:
- `kyrie new table` and `kyrie new generator` (M17 X) were never built.
- The character lab's nine runnable examples (M17 XI) are not done.
- No module has shown a new plant, animal, profession, substance, table and generator through public facilities (M17 XII).
- M17's "one public activity, a performance" has become C9, still unbuilt.

## 4. The plan to close M18

The order is chosen so that ordinary play gets better soonest. W0 clears the bench. W1 to W3 are the core adventuring loop and come before anything else. Every gate runs alone and its exit is read before any commit. Kept traces are re-recorded on purpose after any landing that moves digests.

### W0. Land what is built, and the cheap visible fixes (S each; about two days of gates)

Land one at a time, in this order:
1. The inherited batch: CMB-02, PT-33, PT-38, M17-65, M17-67, M17-93.
2. Faces (OWN-39, 40). Check the 390-wide fight.
3. The opening (OWN-17).
4. The map's knowledge model (OWN-23, 24), passing a site's kind as data instead of reading it from its name.
5. The circus, last:
   - fix the typecheck at `circus-phase2.test.ts:31` and re-record `wren-tower-climbed`;
   - do WPC-11 first;
   - move the skill quality out of `checks.ts`, and Pratfall and Feint out of the shared `abilities.json`, or record both as accepted debt.

Alongside the landings:
- OWN-42: offer the owner a short list of studio and game names, including Freehaven and Seventh Star, each rendered in the ident and the title. Make the name a single constant.
- Rename "The encyclopedia" on the title to the rules, and correct the handbook's "A company is three companions".
- Correct the sale-experience description (SLIP-25).
- Delete `atlas.ts` and `terrain.tsx`, and move M17-69's collision tests onto the live labels.

**Verified by:** each gate's exit; the ident, title, name step and fight rendered at 1440×900, 1180×820, 820×1180 and 390×844.

### W1. One ordinary expedition that works (XL; first priority)

Rows: OWN-28, C✓, OWN-18, OWN-19, A8, OWN-03, M17-71, M17-29, NAV-01, C3, C4, NAV-09, SLIP-04, SLIP-20, GTR-X02, GTR-17, FRICTION-5.

- Finish the OWN-28 report and reconcile it with the cold review's ranking.
- A lead heard becomes the aim and a marker on the map, with its route, as one object.
- **The glance.** A first arrival is one observation, one sign of life and at most three promoted acts. The rest sits under "Look about". Returns are brief, and the place's first moment comes above the travel log.
- **A runtime affordance projection** (what is perceptible now, what answers the aim, what is changing or urgent) for the page to stage. Build it as the first slice of COR-12's perceived view, so that A7, ARV-H5 and the map's knowledge all read one thing.
- A site that a lead promises either has an interior or is said to be small before the journey. Interior exits from one room never share a name.
- A lint that every portable thing a place's prose names exists and can be taken.
- The FRICTION-5 telling batch, and one sentence splitter.

**Verified by:**
- promoted against legal commands at each decision: target three promoted, against 45 legal today;
- words on first arrival: 142 today;
- a cold agent plays one kite expedition in Chromium, using the local NSS libraries, from Begin to home, and reports it in the four senses;
- the owner plays the same expedition on an iPad.

### W2. A lone novice who can live (L)

Rows: C6, PT-11, PT-23, PT-38, M17-56, GTR-25, M17-73, F1.6, SLIP-07, SLIP-08, SLIP-09.

- Before any change, run the viability simulation by calling (warrior, mage, thief, cleric, bard), alone and with the first hire, over 20 seeds.
- Beasts choose targets by kind (the nearest, or whoever struck them), not the weakest. Tactics guard a frail ally.
- **The novice covenant:**
  - every ambush gives a clue on the approach;
  - a warning agrees with its risk tag;
  - an answer is on sale nearby;
  - retreat is honoured.
- Every trap kind can be answered by a warrior with a chandler's gear; first-ruin damage is scaled down.
- One-shot checks and one-way passages are marked before they are taken, and a lint enforces it.
- Ranger specialties; the summon list scaled by level.

**Verified by:** the simulation again (7 of 17 mages fall today); then a warrior, a mage, a thief and a cleric each played alone through the reader to the first ruin and back.

### W3. A wild worth crossing, and the map revisited (L)

Rows: OWN-27, OWN-09, OWN-11, OWN-12, OWN-22, OWN-24, OWN-25, OWN-26, B5, B6, C1, F1.3, F1.4, GTR-13, PRE-04, SLIP-14.

- **The wild comes first, so the map has something to show.** Sparse meetings and finds caused by the land: a charcoal-burner, a shepherd's fold, a track, a small find with a use, water and weather that answer to gear. A few per day's travel.
- **One knowledge ladder** (heard of, seen, identified, visited, explored) that the map, the journal and travel all read. `been` is written by the engine as the single record.
- Mist runs continuously to the horizon over unknown land, with no outlines on unknown hexes. Then the art pass on land, roads, rivers, palette and tilt.
- Step, journey and going-in become the board's own acts, each with its own transition.
- A companion with lore names what is sighted.
- Take C1's baseline before the wild work and again after it: per region and per travel-hour, places by kind, interactions, discoveries, consequences.

**Verified by:**
- significant discoveries per hour of unquested exploration: one in the whole recorded session today;
- OWN-11 replayed by a cold agent at a random seed, with the site entered, something found and the return completed;
- the owner's review of the map in play, on desktop and on an iPad.

### W4. Towns with life, work and consequence (XL)

Rows: OWN-04, OWN-06, NAR-01, NAR-17, C2, C5, C8, C9, C10, PT-01, PT-02, PT-14, PT-15, PT-29, PT-35, F1.7, F1.8, F1.9, WPC-X06, SLIP-13.

- **One public situation a day in each generated town:** invitation, pressure, intervention, aftermath. It draws on residents' relations, and a settlement's fortune is one of its kinds.
- **An aftermath contract** for significant situations. Placed scenarios are installed as chapters, so a going-on can have an epilogue.
- **Two noncombat loops, end to end:** performance, built on the circus's skill, and medicine or trade. Each has preparation, uncertainty, a consequence and progress.
- **The economy:**
  - a census over 12 countries;
  - sale value decoupled from experience;
  - a buyer or a use for every wonderful object;
  - something worth saving for in each town.
- **Conversation.** Major NPCs raise one question or request of their own, and Callow's call-over goes into the generated disputation kit.
- One expedition's major reward opens a capability: a route, a contact or a technique.
- Vary the circus by Deem, so every first country does not get the same troupe.

**Verified by:**
- a bard and a physician, each played for an hour through the reader;
- the census ratios;
- the dialogue funnel: written, offered, chosen, conduct-changing;
- repetition over eight countries (33% of sentences shared today).

### W5. The stage finished (L)

Rows: A1, A4, A5, A6, A10, A✓, OWN-10, OWN-14, OWN-15, OWN-20, OWN-21, M17-23, M17-25, M17-27, M17-31, NAR-14, PRE-05, E11, SLIP-05, SLIP-17.

- Authored campaigns go through the card creation; the old company page and its selects are retired.
- Owner's decision: an "Adventures" way in from the title, or placement only (W6).
- **The compositions still missing:**
  - the pack, as a dense sheet opened on purpose;
  - the road;
  - the object;
  - commerce;
  - a Moment for exceptional events, carried as a fact rather than found in prose.
- The spell icons used in play: fight ability keys and the prepare-spells sheet.
- **Specs:**
  - bounds at four sizes for the fight, talk, the map and an open sheet;
  - states, focus and no layout shift;
  - a count of selects, folds and bare links per composition;
  - a WebKit pass.
- A portrait census across three worlds, and a spot review of 50 assignments.

**Verified by:** OWN-21's whole quiet flow, rendered at desk and tablet sizes and published; then one integrated owner session on an iPad from Begin (A✓).

### W6. One country (XL)

Rows: B1, B4, B7, B✓, ADV-01, ADV-07, COR-05, NAV-04, NAV-10, NAV-17, CTH-06, ICE-02, GTR-01, M18-04, WPC-16 to 18, ARV-M6, ARV-M8, OWN-31 to 38, F1.2, F2, SLIP-26.

- Once the circus is on main: the COR-05 spec with two goings-on in one town.
- Fix GTR-01 (a late module's clock) before any further placement.
- **Finish one-universe phase 1** and gate it alone:
  - generated countries placed within Imbar;
  - `nest` re-parenting only the material region;
  - Parliament's Commonplace moved into the Library plane;
  - demonstration 2.
- **Placement moves into each module's own manifest.**
  - WorldAssembler writes a report of where each module landed and why, with conflicts, Deem failures and a name census.
  - `countries.json` and `web/scenarios.ts` are generated, no longer kept by hand.
- A second province that shares a town or valley with the first: the Third Night's drove roads, or Hessel.
- One consequence carried across modules, with news told where it happens or late on return.
- Re-run the library tour, with a budget, after each placement.
- The Grand Tour's phases 2 and 3 only after the owner confirms decisions 1 and 3.

**Verified by:**
- Begin → rumour → Cobble Ring, played through the reader with no teleport;
- one protagonist through significant parts of three adventures, with their outcomes carried;
- the tour's count of countries entered (9 of 13 now).

### W7. Engine and tools that serve play (L)

Rows: FRICTION-1, FRICTION-2, FRICTION-3, ARV-M7, D1, D2, D3, D5, D6, D7, D8, D✓, F3, F4, F1.10, F1.11, ARV-H4, AUT-25, AUT-05, CTH-09, SLIP-18, SLIP-22.

- **Membership:** FRICTION-1 (in flight) and GTR-03's fact that a companion has fallen, then one membership lifecycle.
- **Interactive play:** `kyrie play -i` over PlaySession, reading and writing the browser's save format. It is the way cold play continues when the browser fails.
- **Diagnostics:** `kyrie info` built on reach, adding:
  - rules, endings and promises that never fire;
  - the F3 measures that W1 to W4 use.
- **Performance:**
  - `kyrie bench` with a JSONL history;
  - the M18 baseline measured against `7b62d99` and written into the repository;
  - a WebKit measurement of a sustained session and of the board.
- **Authoring:**
  - D1 as a review done by reading only, fed by `friction.md`;
  - D2 scaffolding a province, with `kyrie install` and `uninstall`;
  - D5's nine examples, "asks and acts" first.
- **No new TypeScript emitters of fiction.** Convert one emitter (outfitters or commons) to a Deem table, as D3's demonstration and the first module Table.

**Verified by:**
- the next author's module installs with no edits to `src`;
- a save made in the reader resumes in the terminal, and the reverse;
- the W1 to W4 measures are read off `kyrie info`.

### W8. The record (S to M)

- Restate the brief's status column by the four senses. It is stale since `87f57dd`; A4, A6, A9, A10, B5 and B6 are misstated.
- Correct these rows:

  | Row | Correction |
  |---|---|
  | OWN-02 | Partial, with commits |
  | OWN-05 | "What remains" is stale |
  | AUT-09 | Its text is stale |
  | M18-04 | Fixed for developers only |
  | M17-21 | Built, not Fixed |
  | GTR-X07 | Refile under A7 or D |
  | NAR-17, WPC-X06, FRICTION-5 | Raise to P1 |

- Do the SLIP-01 to 04 bookkeeping.
- Add a supersession note to `AESTHETICS.md`.
- Commit the M17 commission and the 10-30 cold review, which is untracked.
- Tell the authors about the FRICTION-10 answers and the builder's edits to their books.
- Write the final report, with the owner's acceptance named row by row.

**Effort:** W0 S; W1 XL; W2 L; W3 L; W4 XL; W5 L; W6 XL; W7 L; W8 M.

### What may move to Mission 19

**By the brief:** E6, the supermodules, which wait until A to C are complete.

**With the owner's word.** The cold review's section G allows these once the conversion path works:
- E2 multi-stage careers;
- E3 arcs, capstones and romance;
- E4's distant planes as places (the canonical identity stays in M18);
- E7 cultural calendars beyond seasonal dark and date queries;
- E9 physical substance;
- E10's large battle;
- E11 the full encyclopedia;
- E1's Orsino expansions;
- B2 beyond a minimal anchor, and B3's content (decide its home now);
- ARV-M5, sides as data;
- the deep-site emitters under D3;
- the Kyr forms D1 decides but does not build;
- the low-severity architecture rows (SLIP-19, ARV-A9, A19, H6, L2, M3, M4);
- COR-18, WPC-20, WPC-21;
- OWN-41, which the owner marked not urgent.

**Must not move.** The review and OWN-28 both forbid deferring these: A4, A5, A7, A8, B1, B4, B5, B7, C1, C3, C5, C6, C8, C9, C10, and the playability of the ordinary expedition.

### Decisions the plan needs from the owner

1. The studio's words and the game's name (OWN-42).
2. An "Adventures" way in from the title, or authored adventures reached only by placement in the country.
3. One-universe decision 1 (the House at Sennet, the college seated at Dun Rì) and decision 3 (a world that never visits Sennet records nothing).
4. Whether B2's full city and B3's chassis content move to M19, and whether the chassis shares `data/imbar` with the planes.
5. Amending A6's "no likeness of any kind" to match OWN-29, 39 and 40.
6. Whether ARV-M5 (several sides in a fight) stays in M18 or is reported out.
7. Leave, once, for the builder's edits to authors' adventures (SLIP-24).
8. Whether required CI status checks guard main (SLIP-19).