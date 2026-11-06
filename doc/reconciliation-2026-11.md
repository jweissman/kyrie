# Documentation reconciliation, November 2026

6 November 2026, on `fbf38d58` (branch `docs/consolidation`). The owner asked for one reliable account of what
Westernesse is meant to be, what it implements, what remains unresolved, and how an author can work with it today.
This report says what was done to the documents and what the reconciliation found. **It changes no engine code and
no content, and it is not evidence that any defect was fixed.** Every count below is reproducible:
`python3 doc/architecture/findings/src/index.py`.

## 1. The entry points

| Question | Entry |
|---|---|
| What has been promised? What do we want someday? | [design/VISION.md](design/VISION.md); [architecture/findings/briefs.md](architecture/findings/briefs.md) (what each commission asked, and what became of it) |
| What has been built? What remains broken? | [architecture/findings/index.md](architecture/findings/index.md): every register's ids, last status, kind, and whether a Fixed row's commit and spec exist; [gaps.md](architecture/findings/gaps.md) |
| How does somebody author something new today? | [authoring/README.md](authoring/README.md): nine short pages, every command run |
| Everything else | [README.md](README.md): each document marked current, historical, aspiration, proposal or obsolete; and the repository's [README](../README.md) |

## 2. What was consolidated or archived

- **No master list was added beside the registers.** The findings index is generated from them and from two TSVs
  (the gap rows and the brief requirements); rows are still changed in their own register, and Mission 19's inherited
  ledger only through `inherited-src`. The index supersedes nothing; it says where each id lives.
- **Mission 19's ledger sources were not touched.** The owner's working tree holds uncommitted changes to them (the
  seven carried rows, `closures.md`, register rows M19-72 to M19-79); editing them here would have collided. The
  index lists those rows as *pending* and stops doing so once they are committed.
- **Archived:** `doc/design/kyr-player-experience/` (20 October, "the recommended product contract for review") moved
  unchanged to [archive/2026-10-20-kyr-player-experience/](archive/2026-10-20-kyr-player-experience/README.md) with a
  dated note, a stub where it stood, and its one inbound link fixed. [archive/README.md](archive/README.md) lists it
  and the documents superseded in place (Deem's creature grammar in `doc/generation`, marked on 5 November).
- **Dated notes, text kept:** AESTHETICS.md §2 (its white ground superseded by Mission 18's A2, as the Mission 18
  audit asked, SLIP-06; the 4 November review's contrary view recorded, so the palette is an open owner decision);
  data/README.md's "Current composition" (obsolete); the guide's §3 default party (the standalone shape only).
- **Rewritten:** the repository README (Westernesse, the five entries, where it stands; two obsolete lines removed).

## 3. The audited register and wishlist

| Register | Rows | At its close (or now) |
|---|---|---|
| Mission 16 | 203 | Fixed 93, Open 63, Partial 42, Deferred 2, Not reproduced 2, Superseded 1 |
| Mission 17 | 289 | Fixed 216, Partial 61, Open 11, Not reproduced 1 |
| Mission 18 | 430 | Fixed 383, Partial 7, Not reproduced 12, Superseded 3, held elsewhere 25 |
| Mission 18 wishlist | 138 | all carried to Mission 19 |
| Mission 19 inherited | 138 committed; **145** in the owner's tree | Open risk 52, Deferred 44, Partial 22, Fixed 14, Not reproduced 6 (committed) |
| Mission 19 | 85 committed (93 in the owner's tree) | Fixed 66, Partial 14, Open 2, Open risk 1, Superseded 1, Not reproduced 1 (committed) |

**Carry, checked id by id.** Mission 16's 105 Open and Partial rows are all in Mission 17's register; Mission 17's
73 Open, Partial and Not-reproduced rows are all in Mission 18's register or wishlist; the wishlist's 138 are all in
the inherited ledger. What was lost: Mission 18's seven **Partial** rows (OWN-55, OWN-76 to OWN-79, OWN-81, NVR-23),
which its wishlist never carried (found by the owner's review on 6 November; carried in the owner's tree, making
145), and Mission 16's two **Deferred** rows (COR-15, CMB-10), which Mission 17 never carried because it carried only
Open and Partial (UNT-119).

**136 against 138**, settled: the first Mission 19 settlement (4 November) listed 136 and omitted **M17-73** and
**M17-99**; both are restored by the generator and re-examined (M17-73 Partial, M17-99 Fixed, M19-43). Both are
represented.

**Not closed, by the owner's six kinds** (230 ids: 156 in registers, of which 12 are pending in the owner's tree, and
74 never before registered):

| Kind | Not closed | Of which new from the gap report |
|---|---|---|
| defect | 32 | 21 |
| foundational architecture obligation | 31 | 8 |
| gameplay requirement | 59 | 12 |
| authorability blocker | 61 | 22 |
| aesthetic/UX problem | 12 | 6 |
| creative aspiration (the wishlist) | 35 | 5 |

The **wishlist proper** is the 35 creative aspirations: 30 ambitions the process audit named (three-sided combat,
shared temperature, giant gentry, the Grand Tour's further planes, interior 3D, Kyr's once-only rules and module
calendars…) and five new ones (a moral record across modules, an ensemble that is not the party, signed speech, a sky
purpose for the deep sites, a world that changes on its own). A class-D row the audit calls a defect or an obligation
is sorted by what it is, not as a wish (QTC-A10, WPC-14, GTR-21 among them).

**Fixed claims, cheaply checked.** Every commit hash a Fixed row cites exists in this repository (the one "missing",
in M19-22, is a measured number); every spec cited exists except `arms` (M17-19). 127 of Mission 18's 383 Fixed rows
cite neither a commit nor a spec (a guide section, a play, or the row that answered them): the least re-checkable
claims. Re-run on this checkout, passing: `test/undertakings.test.ts` (M19-01), `test/interrupted.test.ts` (LUL-02),
`test/bed-hour.test.ts` (M17-73's partial fix), `test/two-modules-one-town.test.ts` (COR-05),
`test/authoring-guide.test.ts`. No Fixed row since Mission 16 has the owner's or an independent player's acceptance
(PD-14, open).

## 4. Material discrepancies between claims and evidence

1. **OWN-28 is Fixed; its own repair says otherwise.** The commit that answered it (6ec15983) says "Not yet: an inside
   for dens, the two-key check over every work, scenario hooks going stale"; dens still promise "A dark mouth opens
   in the hillside" (`data/generation/scenes/sites.json:6`) and are one room; scenario word still has no stale rule
   (UNT-101, UNT-102, UNT-103).
2. **Mission 18's register says the Parliament of Books' friction was carried in Mission 17's register.** None of its
   34 items is in any register (UNT-201); the same sentence puts What Tessary Owes and Thrume in Mission 17, which
   were carried in Mission 16 (`mission-18/register.md:576-579`).
3. **Mission 18's handoff supplement lists gate carry-overs "with rows"** that have none: the placement report (B4),
   `kyrie stats` and `kyrie info` (D6; absent from `src/cli/kyrie.ts`), one save continued across terminal and
   browser (D7, F1.11), `kyrie bench` (D8), a substantial NPC verified (F1.7), a civilization acting (F1.9), trace
   minimisation (F2) (UNT-122; BRF-56 to BRF-63).
4. **The committed inherited ledger is not reproducible from its sources**: `inherited.md` at `fbf38d58` carries a
   paragraph and a closure-kinds table its generator does not write. The owner's uncommitted `closures.md` cures it.
5. **Mission 18's closure.** Its first draft says of the first town "yes … every step was a visible choice doing what
   it said"; the same document records the owner's verdict that ordinary play "does not yet feel like a game", and
   Mission 19's first play found wrong aims, dead keys and false danger (the process audit, §1). The audit's 26 SLIP
   findings were never given rows, and four of its proposed reclassifications (PT-09, PRE-03, PT-42, NAV-12 Fixed
   though contradicted; M17-21 Fixed by tests alone) were not made (UNT-130).
6. **The novice covenant narrowed.** PT-11's Mission 19 disposition speaks of lone casters and thieves; Mission 18's
   closure measures show road troubles killing a lone warrior too (deserters 93%, customs-men 81%) (UNT-124).
7. **A shown-twice label, reproduced today.** `bin/kyrie play --world a1 --as human/thief/Wat "To the landing at
   Lowmouth"` offers two bare "Examine — Look closely" (a lone thing's look, named by no thing): the friction of three
   authors, closed inside TTN-21 (UNT-211).
8. **The Encyclopedia.** Mission 19's progress says modules do not add entries; its workstreams call the Encyclopedia
   built, and the gap is in no row (BRF-89).
9. **Design authority conflict.** AESTHETICS.md asked for a white ground; Mission 18 commissioned a dark one; the 4
   November product-design review argues for "bright literary modernism". Now noted at the doctrine's head; the
   decision is the owner's.

## 5. Friction and play findings never entered in a register

The [gap report](architecture/findings/gaps.md): **74 rows**, UNT-101 to UNT-131 from plays, reviews and audits
(25 October on) and UNT-201 to UNT-243 from every adventure's friction report. By assessment: 35 never registered,
19 dropped between missions, 16 narrowed until a distinct concern was lost, 3 misclassified, 1 an unverified closure.
The most consequential:

- **UNT-101, 102, 103**: dens with no inside, no guard that a gated work has a second way in, scenario word never
  stale (above).
- **UNT-106**: things named in a place's prose cannot be taken (the cold evaluation's candle-end; the expedition's
  rope in the kist).
- **UNT-107, 108, 109**: a companion "binds the hurt" when no one is hurt (`needsCare` from any condition,
  `src/campaign/creature-facts.ts:175`); an NPC act's engine name leaks ("The raiding party: Fall on You"); a trap
  named by its mechanism before it is found.
- **UNT-124**: road troubles kill a lone warrior; the covenant's row speaks only of casters and thieves.
- **UNT-201**: the Parliament of Books' 34 friction items, never carried; among them **UNT-204** (anything a rule says
  cuts a timed search short and silently closes a route, filed only inside the deferred IFR-08), **UNT-210** (an
  unloaded ability lints clean and throws when it strikes, `src/effects.ts:149`), **UNT-207** (no negative grid
  coordinates, `src/lang/Kyr.ohm:293`).
- **UNT-237**: two campaigns sharing a module's files break each other; lint passes, play fails.
- **UNT-242, 243**: "a won fight kills, Pleads never fires" (QTC-A10) deferred as an authoring convenience, though it
  is a combat rule; four general authoring defects deferred as one adventure's "own needs".
- **UNT-117, 118**: no screen-reader path (the map is a canvas); the iPad and Safari slowdown never measured on a
  device.

Not swept item by item: the playtests of 19 to 24 October (each answered by its own mission's report and overtaken
by four interface rebuilds since) and the adventures' literary critiques beyond their engine points.

## 6. Requirements dropped from earlier briefs

[briefs.md](architecture/findings/briefs.md): 109 requirements traced; implemented 24, superficial 34, superseded 11,
deferred 13, disappeared 16, unverified 11. **The commissions of Missions 15, 16 and 17 are not in the repository**:
their rows rest on the builder's memory summaries, a gap in the record itself. Disappeared without a recorded
decision:

- a real tablet (iPad), asked in Missions 15, 17 and 18 (BRF-16; with UNT-118);
- adventure quality: strategic antagonists and pacing variety (M15; BRF-20);
- 10–100× points of interest, measured (M17 VI; BRF-43; Mission 18's closure says "carried: the measure", with no row);
- rare Manuals as a development path (BRF-47); reinterpretation of the past and a bounded group project with
  opposition (BRF-48); a bounded authored battle (M17 XX, M18 E10; BRF-49);
- reconciling the Atlas with the Doctrine and marking superseded design documents (BRF-50; this reconciliation's
  notes are a first step, the decision is the owner's);
- Mission 18's D6 to D8 and F1.7, F1.9, F1.11, F2 carry-overs (BRF-56 to BRF-63; UNT-122);
- modules contributing Encyclopedia entries (BRF-89);
- casualty and gear custody: one companion carries one fallen, gear kept where it fell (the October specification's
  PX06; BRF-95).

Deliberately superseded, and recorded: the Long Man as principal adventure (only implicitly), the white page, assisted
travel (by the map alone, OWN-85), a preset company of three (by one situated person), zone tactics, Deem's creature
grammar (by catalog records).

## 7. Documentation gaps that block authors

- **No command-line route walks a generated world to a province's gate**; an author proves a placed adventure only
  through `test/support/province-play.ts` (the trail's page 4 shows how; pass `party`, or the default trio is used).
- **The scaffold contradicts the ownership rule**: `bin/kyrie new` writes a preset trio and "Choose three companions"
  (`src/cli/new-tool.ts:35-46`; M19-75). Documented as a known limit; the code is the builder's to change.
- **Authored lines for "whoever qualifies"** are possible only through rules and member-parameter actions; no
  companion fact, no "you" or pronouns for a bound member (M19-75, ARV-M7).
- **Contributing to an authored city is unsupported** (M19-77): the trail says so and says not to duplicate a city.
- **Creature authoring's last step is landing on main** (`bin/kyrie bestiary challenge`, measured danger): page 6
  describes it as in progress and will need its example.
- **Most generated content is TypeScript** (27 of 61 `src/world` files build Kyr in strings, beside 21 templates):
  ARV-H4, AUT-25, UNT-120; no document can make it authorable.
- Smaller, now written down in the trail: a `Topic` is module-level and needs a `when`; `--probe` needs namespaced ids
  (`state lanternwell__lid lanternwell__open`); an ending's epilogue is told before the state change that caused it.

## 8. Broken examples and obsolete instructions found

| Where | What | Done |
|---|---|---|
| README.md | `KYRIE_BROWSER=1 bun test ./test/caught-below-browser.test.ts`: the spec no longer exists | replaced by `opening-browser` |
| README.md | "the other files in `bin/` are development tools": `bin/` holds only `kyrie` (CONTRACT §1) | corrected |
| data/README.md | "Current composition" names `serewater-march`, `silkholme`, `skellfold`, `red-crag` campaigns, all gone from `data/campaigns`; `catalog/` "organisms" retired | dated note |
| doc/authoring/guide.md §3 | members "from the campaign's default `party`" | dated note: standalone shape only |
| doc/architecture/player.md | describes Mission 6's `web/play-*`; the client is `web/reader`, `web/engine` | marked obsolete in the index |
| doc/design/AESTHETICS.md §2 | white ground, darkness an anti-pattern | dated note |
| doc/design/kyr-player-experience | "the recommended product contract for review" | archived with a stub |
| archive/…/capabilities-and-authoring.md | links to `data/sites/reedwake`, `skellfold`, `thrale`, long deleted | left as history |
| `bin/kyrie new` | pitch "Choose three companions"; preset trio | code, not changed: M19-75 |

The trail's examples all ran: `bin/kyrie new`, `compile`, `lint`, `play` (by labels, `--choices`, `--probe`),
`new scene`, `play scene`, `verify`, `reach`, `countries`, `world`, `play --world … --as …`, the scaffold's specs,
and a placed spec with a save and reload. None failed except as described (the two compile errors the trail shows on
purpose).

## 9. The consequential unresolved obligations, in order

1. **Independent acceptance** (PD-14; the audit's F1; BRF-40): no build since the Mission 19 repairs has been played
   by the owner or an independent player. Nothing player-facing closes experientially until it is.
2. **Who owns the company** (M19-75, ARV-M7): preset parties reachable by a player, the default trio in the
   assembler and the scaffold, 37 adventure specs proven only in the standalone shape, no companion fact.
3. **Knowledge, intention and route as separate records** (PD-08, with ARV-H5, COR-12, NAR-12, UNT-113, UNT-123): the
   aim followed is the engine's, but what is heard, led, chosen and known of the way is not kept apart.
4. **The reference loop's own defects** (UNT-101, UNT-103, UNT-106, UNT-107, UNT-124; PT-11, SYS-05): dens without
   insides, stale word, prose things that cannot be taken, a companion tending no wound, a covenant that does not
   hold for a lone warrior on the road.
5. **Action integrity at the language's edge** (ARV-A5 Partial; UNT-204, UNT-210, UNT-242): ability text against
   execution, a rule's speech cutting a search short, an unloaded ability, a won fight that always kills.
6. **Generated content as data** (ARV-H4, AUT-25, ARV-M6, UNT-120): the precondition for most authorship.
7. **One persistent city** (M19-77, M19-73, BRF-54): adventures cannot share a town; a town has no quarters.
8. **Mission 18's lost gate obligations** (UNT-122): stats, info and bench; one save across terminal and browser; the
   placement report; trace minimisation.
9. **Breadth of device and access** (UNT-117, UNT-118, BRF-16): a real tablet and WebKit measure; a screen-reader
   path.
10. **The ledger itself**: commit the 145-row ledger and the M19-72 to M19-79 rows; give the 74 gap rows register rows
    under their UNT ids (or close them by decision); give the audit's SLIP findings rows; commit the process audit and
    the product-design review, which this repository cites but does not hold.

## What could not be verified

That the 74 gap findings still occur was checked for some (UNT-101, 103, 107, 108, 109, 207, 211, 235, 241, by code or
play) and not for the rest; each row says what was grepped. Code references in the gap rows are line-accurate to
`fbf38d58` where checked, approximate where noted. The memory summaries of the Mission 15 to 17 briefs were not
checked against the owner's original messages. No browser was run and no full suite.
