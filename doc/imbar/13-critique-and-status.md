# 13. Second editorial review, and the state of the work

*After the second pass: the Dorothea, the Slack, the Exchange as an opponent, and the revisions that came with them.
Written after playing them. Severe, as the commission asked.*

## 13.1 What was done, against the second brief

| The ask | Done | Not done |
|---|---|---|
| Substantially revise more existing adventures | The Grand Tour got a new descent and a ship (319 lines in two files); The Long Man got companion voices, a quarrel with a choice and two cross-adventure gifts; Low Water got three scenes (letter, tray, bare cloth); What Tessary Owes got a topic and a place; two corpus-breaking clashes fixed; Hollins's name | Of 23 adventures, five were meaningfully changed in this pass (and two in the first). **Eighteen have not been touched.** The brief asked for "several"; I made a few, deeply. |
| Broaden the dramatic repertoire | the Dorothea is a *loyalty and necessity* story (a mate stealing to cover a Captain's debt; an island's winter); the Slack is *obligation* (a surety) and *dread* (a thinning pin) | no romance; no comedy of the quality of Hessel; the Slack's registers are elegiac and a little solemn throughout |
| Companions | calling-keyed voices in two adventures (12 rules, one a quarrel with two actions); a choice that splits a company; a follower surveyor who carries a skill | the preset party still cannot be addressed by race, background or name; companions in the Slack have no lines; the quarrel is one scene |
| Practical connections | §12: twelve consequences, tested | the `befell` events nobody reads; Fair Weather ↔ the Dorothea (both coastal, no link) |
| An ordinary sailing voyage between separated landmasses | `07-voyage.md`; 12 tests; from a generated world; reload at sea | foundering is announced, not enacted; no chart of the voyage; events scheduled, not drawn |
| A meta-adventure that opens onto the outer planes | the black square, the Slack, the Remainder, the Mechanus threshold; 8 tests | the interest the Slack charges, the second destination, the Watch ashore, a ship that navigates |
| A strategic adversary with persistence | the Exchange, six answers by what it knows and has, durable effects in two other adventures, reload | it does not plan |
| Playthrough evidence beginning in the ordinary world | `playtests/ordinary-world-voyage.md`, `ordinary-world-slack.md` | the Slack transcript *gives* the five items and *puts* the company in the Nexus (stated at its head) |
| Whole-suite verification | see §13.5 | |

## 13.2 What works, and why I think so

1. **Gammer Coller at the door of the study** (first pass) and **Tamsin Quaye at the table of the count-room** are
   the same scene in different keys: a person who was told what her office was, learns what it was. The second is
   the more interesting because the person is *young*: she is not recovering a past, she is deciding whether to
   bind herself to a present. The line I would keep: *"I will not take the remainders into the dark and I will not
   leave them to be counted."*
2. **The mate.** Tobias Rune is the best new person: loyal, thieving, loved. The company can leave him, report him,
   buy his silence, or shame him into carrying the casks back; and the one who shames him gets, at the Combs, a man
   who takes the wheel as one takes a hand offered once in a life. It is a **personal loyalty** story inside a
   voyage, not a document.
3. **The Exchange's rich and poor endings** being decided by Deem's roll of *stock* is the nearest I got to the
   brief's "generated institutions are consequential": the same player act makes one world's innkeeper turn the
   company out and another world's factor disappear in the night, and each of these is read by someone else.
4. **The surety.** A blind surety costing a boy at nine each morning is a small, mean, correct consequence, and the
   Valuer's one-line note is the right *kind* of key: not access but a term.
5. **Every province installing in one world** is not literary. It is the most useful change in this pass for the
   next author, and it was invisible until asked.

## 13.3 What does not work, or less than it appears to

1. **The black square is a three-key door.** I described it as unlike "three quest flags turn true", and the
   difference is real (items, each used in a distinct act with its own text; alternatives; costly routes; any may
   be missing), but a hard critic can still read it as *a lock with three slots*. The mitigations are in the
   fiction, not the structure: each key is *also* a gift to a person in its own adventure (Hosken's rubbing is an
   act of love for a town's drowned; Ysolt's copy is her apology) and none was made *for* the square. Still, the
   square asks for tokens.
2. **Exposition returns in the Remainder.** Sabe's and Tamsin's speeches are the longest in the corpus I have
   written; "what the Slack is" is delivered in two paragraphs by a man who is sure of it. The conceit of the
   **remainder** is neat enough to be suspicious. It also echoes Low Water's Remainders (First, Seventh) and may
   read as the Mathematical Age *explaining itself*. I labelled it **[P]** and put it in a doubtful mouth; I did
   not make it less tidy.
3. **The Aenean roll.** Two rolls, one in a hand "a thousand years younger", forty names, thirty-eight struck
   through, is a more *specific* account of the Aenean disappearance than the commission asked for. I protect it with a
   dispute (Captain against Reckoner) and it remains one account, but it **lends** the ship an Aenean history and
   will tempt a later author to make it true.
4. **The Slack has no wonder you cannot read.** The ruled sky, the second sky in the level surface of the quay: these
   are good. But everything on the ship is explained by someone within a minute. **A scene in which the company
   saw the Remainder, and could not ask anyone, would have been better.**
5. **Companion lines are barks.** They are decent barks (a cleric lays a hand on a font and says a thing no one else
   would). The only participation that *changes* anything is the quarrel, and it is one.
6. **The sea is a stage set.** Fog at progress 22, a cutter at 66, the reef at 108: dice play no part but in the
   skill checks. A second voyage is the first voyage again. This is the biggest practical shortfall of the Dorothea
   as an architecture proof: it proves the **primitive**, not a **sea**.
7. **Tests use shortcuts.** `give` and `put` are test aids; the Slack tests (and the Slack transcript) use them to
   avoid replaying five adventures; each source adventure is tested separately. A reader who wants the single
   unbroken play from the ordinary world to the Nexus will not find it, and I say so.
8. **The prose has a house voice that I imitated.** The Dorothea's narrator and the Remainder's are the
   Kyrie house voice, with one difference: they use more adjectives. I did not give the ship a distinct syntax,
   which the repertoire survey asked for. The Remainder's *Watch* should speak in elevens.

## 13.4 Where the implementation falls short of the creative design

| Design | Implementation |
|---|---|
| The Slack charges interest on the stair | announced; not charged (no `Time` expression on actions) |
| The ship goes among worlds | the ship goes to one threshold of one outer plane, and back |
| The Watch comes ashore | recorded as a world event, then nothing |
| The Aeneans' household aboard | a roll; no person |
| The remainders are a cargo of consequences | three tableaux; the bend and the winter are scenery; one hazard |
| The Exchange plans | the Exchange reacts |
| A voyage under weather | a voyage under a schedule |

## 13.5 Verification, honestly

**Known passing, targeted** (run individually in this session on the final tree): `the-dorothea` (12),
`the-slack` (8), `exchange-responds` (6), `factors-handoff` (3), `all-in-one-world` (1), `the-long-man` (14),
`the-long-man-charter` (5), `skeel` (16 incl. placed), `skeel-keeper` (1), `canon`/`one-plane`/the Grand Tour set
(33 of 34 on their first run; the one failure was the same test running during an edit of the Exchange's file and
passes on rerun).

**Whole-suite: complete.** `bun run check` (eslint with zero warnings, `tsc --noEmit` for both configs, then
`bun test --parallel` over the whole repository), run on the final tree at commit `5e34337`: **2720 pass, 115 skip,
0 fail, exit 0.** The 115 skips are the repository's own opt-in tiers (browser, long-expedition, `KYRIE_LONG`),
which I did not enable; they are not claimed.

How it got there, because the path matters to a merge: earlier runs were lost to a container restart and to my own
edits under them; one stopped on lint, one on a typecheck error in my own test. The first complete run found 29
failures, and all were consequences of this branch: 24 were a stale page bundle (`bun run web:build` rewrites
`web/bundles.generated.json`); **adding any province to `countries.json` re-seeds every drawn world** (I tried all
four sides), which broke one recorded trace (`wren-tower-climbed`, re-recorded with `scripts/redigest-trace.ts`:
"it comes where it came") and two tests tied to a seed (`wild-meetings` now draws seed `jade`; `exploration` takes up
a journey again after a boar stops it). A merge that adds a province on `main` will need the same three steps.

## 13.6 What I would do next, in order

1. Give the Remainder one scene with no one to ask.
2. Draw the sea: a `generation` table of sea events, and a `sea` passage kind in the chart.
3. Let the Watch walk up the stair, and make Sennet a different place for it.
4. Make the interest real (`Time <expression>`).
5. Project race and background into the world, and give the preset party their own voices.
6. Give two other adventures the treatment the Long Man got: Hessel (a protagonist who is courted, and may refuse)
   and The Third Night (a bridge that once was a ferry).

## 13.7 Third pass: reviewed again, severely

**What I was not happy with, and what I did.** The sea was a stage set; the Slack explained itself; the evidence chain
was partly decorative; fights were absent. Done: Skerrow's night (a receipt, a device, a lens, Quillon's men, a storm and
a boy, each with a noncombat exit); the Slack's second bell, mast-bracket, tally and lens, and the Divider (four answers,
two of them without a blow); the Kestrel's hands boarding on a failed unloading (fight, bribe eight coin, or Rune who
drank with them); a lamp seen burning at the Combs at dawn, and a quay notice board with a column of ships lost this year
(texture that says the world is bigger than the story). The most important finding was not literary: **the gifts did not
work** (`friction.md` #1). The first two passes' relationship map was, in that respect, partly untrue until this one.

**Still not right.** The Remainder still explains itself (no scene with no one to ask). The sea is still a schedule plus
three set pieces. The Orsett reckoning, the Long Man's "eleven and a blank" foreshadow and the Slack's pin clock are
unwritten (`friction.md`, last section). Tone is still elegiac; the comic register is absent. Verification of this pass:
targeted tests (`the-dorothea`, `skerrow-night` 17 pass) and lint/typecheck clean; **the whole suite was not re-run at the
final tree**, so the 2720/0 figure in §13.5 belongs to commit `5e34337` only.

## 13.8 Fourth pass: the broad pass, an external review, and what it found

**Done since 13.7.** A series bible (`14-bible.md`: theme "the Account", shared motifs, rulings on the contradictions);
all 16 untouched adventures revised against it by parallel authors (each has a ledger in `adventures/` with count,
keeper, first page and price, acts and scenes, characterization, companions, links, tests, shortfalls, and a friction
file); a lore ledger and cross-reference sweep (`15-lore-ledger.md`: 23 rows, link matrices, world-event reads and
item hooks in previously silent adventures, itinerants as talk, entry points toward Tolleth); the Dorothea grown into a
six-call archipelago (Skerrow, Port Ness, the Antlers, Wrack Holm, Ashkeld, Mangrow) run by the House of Marchbank, with
destination choice at booking, a sea-events table drawn by the ship's die, five entry points and a jungle island done
in prose and mechanism; and a severe external review (`16-critical-review.md`), whose findings were then acted on.

**What the review found, and what became of it.**

| Finding | Status |
|---|---|
| Calling-unique flagship beats were locked to the shipped company of one (8 adventures) | Weaker, costly routes added for the shipped party in Book of Faces, Carth, Liberty, Gosse, the Hive, the Lull and the Quiet; each played by a test with no give/assert on the path. The Patient Star's shipped thief was not locked out |
| "Eleven and a blank" in 12 adventures, kept lights in 14, fish-and-flame explained twice | Cut to about one of each per adventure; glosses removed. Not fully clean: the lore sweep counted about seventeen mentions before the cuts and I have not recounted |
| Dorothea boarding routes untested; floorless cargo decrease | Tested (`dorothea-boarding`), floors added |
| Payoffs set by hand (Thrume, Quittance, Carth) | Several now played; the rest are labelled asserted in the ledgers |
| False ledger claims (Thrume "all five acts", House That Grows "three ways in") | Corrected; Thrume got Act IV voices; the `pick` route is tested but unreachable by the shipped monk |
| The Remainder explained itself | One long speech replaced by a scene in which nobody answers (`rail_unasked`) |
| Prose tics ("Nobody says why", the dry quoted closing line, "two hundred or two thousand years") | Varied and cut in part (about 17 percent of closing lines in wave C, about a third in waves A and B). **Not solved**; another pass is due |

**Still wrong.** The Grand Tour, Skeel, the Long Man, Low Water and Tessary have no ledger file; Sabe Orrel / Orrel Sabe and
the three Hesters are not renamed (tests depend on the labels); `hasCalling` voices did not fire in one standalone
campaign (Gosse switched to `capable`) and I have not audited the others; three older long suites per author never
finished under load; Orsett is not a place (a province would re-seed every world); the volcano and the jungle are prose
(no terrain kinds); the archipelago has no world-map distance, only the clock; the Exchange still reacts and does not
plan; the "institution hierarchy you roll up and defeat, whose fall opens a new authored adventure" is **not built**
(the House of Marchbank is authored, not Deem-generated, and has no strategic agent that moves).

**Verification.** Lint and typecheck clean on the final tree. `all-in-one-world` and the targeted tests named in each
ledger pass; one full `bun test --parallel` was started on the final tree and its result is recorded below when it
ends (not claimed before).
