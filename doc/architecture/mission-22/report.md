# M22: an honest account (17 November 2026)

Written for the owner. M22's commission (brief.md) asked for extraordinary quality in the first fifteen seconds, the
opening minute and the act of choosing, with six acceptance items. This says what improved, what is partial, what
evidence supports each acceptance item and what does not, and what should shape the next mission. Player acceptance
is not claimed: no person has played the first hour and accepted it (FH-01, the register's one open P0), and a
recording or a headless walk is not that.

## What improved

**The first fifteen seconds.**
- The studio's mark is drawn into the page itself (SiteBuild.mark), so it plays before the reader's script has loaded;
  the page is dark from its first frame (no white flash).
- The mark is 2.8 s, the dark after it 400 ms.
- On the deployed site (Pages at 3e6b6902) the title was in view 3.4 s after navigation and took keys at 6.8 s.
- Measured on this machine (first-touch-performance.md): the title drawn cold fell from 2.91 s to 0.55 s (0.37 s over
  http); the engine is its own script (mono.js 724 KB).
- Setting out takes 0.003–3 s at a reader's pace, against 5–12 s before, because the world is prepared while the life
  is chosen. That preparation is deterministic: the world prepared early is the world a cold start makes.

**The act of choosing (the menu row).**
- Every menu row is drawn by one component, ChoiceRow: the title's ways in, creation's rows and name field, the
  opening's Continue, the scene's acts, a conversation's questions, the map's menu, a fight's hand and the Book's menu.
- A row's states have one definition (row.css): under the hand a light tint; where the keys are, or what is
  considered, a deeper tint, white words and a full-height mark; pressed or held, deeper still. All rows are one
  height (`--choice-h`).
- A hold is a hold:
  - a held row fills as it is held;
  - a short press on a held row does nothing, and nothing arms;
  - the cursor's ring, not the row, shows a mouse's hold.
- The opening's pages go on only by a held Continue, never by themselves or by a touch anywhere.

**One structure for every page** (the owner, 16 November night), held mechanically:
- `test/action-census-browser` walks the title, each step of a life, the opening, a place and its lenses, a
  conversation, the map and the Book. It fails on:
  - anything pressable outside the page's menu or rail (allowances named with why, only to shrink);
  - a menu row of another height;
  - a menu row not drawn by ChoiceRow;
  - two menus in view at once.
- It found 150 stray pressables at first, then 26 foreign rows, then the Notes' many menus; all are now gone.
- PageFrame (background, header, narrative, menu, rail) draws the title, a life's steps, the opening, a conversation
  and a fight; a place, the map and the Book take their parts' marks from it (PageFrame.slot), and no other file may
  write a menu's or a rail's mark (test/small/page-slots). The census also fails on a page without exactly one header,
  with more than one narrative, or with anything in its menu or rail that cannot be pressed where it is drawn.

**Other first-minute repairs.**
- Creation's rows had been squashed by a regression; a geometry pin now holds them.
- The sign's sky is drawn as a star atlas draws one (OR-17): twelve figures, stars by magnitude and colour, the
  galaxy's glow.
- Rolls sit behind "How it fell", and asides keep their names.
- Notes of a kind say their label once (OR-32).
- On a phone the whole company stands above the fight's hand.

**The world map's routes** (OR-35): a place known on the map is planned across the open country, by roads only where
they are quicker, round water once it is seen. Ways laid more than 1.5 times the straight way fell from 11/137 to 0
(a1), 75/152 to 12 (b2) and 50/160 to 0 (c3).

**Sites** (the side commission, sites/phase-b.md): substantial early dungeons:
- a treasury behind a cued secret;
- an order puzzle;
- wonders that teach a fact;
- level-0 placement;
- ore at half worth (the economy had broken on it).

**SRD and engine** (srd-proving-cases.md):
- the casting route kept to the rules (CF-02: the undertown's rats slept through the one invocation route);
- the planes felt (GT-01..03: each inner plane's law in and out of a fight, Plane Shift, a ward for the Water's cold);
- an authored item kind with a use effect (OB-07);
- the aim's lead as one typed record (US-07, partly).

The SRD migration is closed with an explicit unsupported list: 34 of 363 abilities, by cause.

## The acceptance items

1. **An independently reviewed, unedited deployed recording.**
   - First review (review-e729.md) of the deployed opening at e729, scored out of 10: coherence 6, legibility 5, beauty
     at rest 7, restraint 6, responsiveness 7. Its findings became OR-22..34, most since repaired.
   - Second review (review-43697c8a.md), of the deployed opening at 43697c8a on desktop and a phone, blind to the
     first: coherence 5, legibility 5, beauty at rest 7, restraint 5, responsiveness 6.
   - By that measure the opening is no better than at e729. Coherence, restraint and responsiveness are each one point
     lower; legibility and beauty are the same.
   - The two reviews saw different worlds and different walks, so the scores are not a controlled comparison. But
     neither review says the controls have disappeared, and this one says why:
     - four control idioms in creation;
     - a reply that matters pushed off while its bookkeeping stays;
     - a first act (Follow) that tells nothing;
     - on the phone, a press that fell through onto the rail (OR-39, fixed since, with a pin);
     - a season that contradicts its painting.
   - Its findings are OR-39..46. Item 1 is met as a process (an independently reviewed, unedited deployed recording),
     not as a verdict: the verdict is that M22's structural unification is not yet felt by someone watching.
   - Repaired since, each with a pin that failed before:
     - the press that fell through (OR-39, test/press-through-browser);
     - the reply pushed off by its bookkeeping (OR-40, test/reply-in-view-browser);
     - the silent Follow (OR-41, follow-offered-browser);
     - creation's four idioms (OR-42): ancestry and calling are rows with their emblems, the rail is marks;
     - partly: the title's lit word (OR-44), winter's way in (OR-46), the sitter's late likeness and the opening's
       blank between beats (OR-43).
   - Third review (review-071f20dd.md), recorded after those repairs, blind to both earlier reviews: coherence 5,
     legibility 4, beauty at rest 6, restraint 5, responsiveness 6.

     | | coherence | legibility | beauty | restraint | responsiveness |
     |---|---|---|---|---|---|
     | e729 (first) | 6 | 5 | 7 | 6 | 7 |
     | 43697c8a (second) | 5 | 5 | 7 | 5 | 6 |
     | 071f20dd (third) | 5 | 4 | 6 | 5 | 6 |

   - Three reviewers, three worlds, three walks: not a controlled measure. But the trend is plain and is reported as it
     is. By independent eyes the opening has not become better during M22. The repairs each reviewer prompted were
     real and are pinned, and each review found the next layer:
     - after the press-through, a menu that jumps as an act is taken (OR-47);
     - after the reply pushed off, its first line faded (OR-48, fixed);
     - creation showing a life before it is chosen (OR-50);
     - a backdrop that reads as mud, and a town painted in three traditions (OR-51).
   - The structure the owner asked for is held mechanically. The feel of the first minute is not yet what the brief
     asks, and the reviews say so.
   - Repaired after the third review:
     - the conversation's four whole on a phone, and each answer's first words below the record's fade (OR-48,
       pinned);
     - creation's corner showing a life only as it is chosen, and a step opening on the page of the choice already
       made (OR-50, OR-25);
     - the country behind creation seen, not smeared (OR-51);
     - the opening's Continue a row like its answers (OR-52);
     - the menu held still while an act is under way (OR-47, unpinned);
     - the two browser specs the nightly found failing after M22's changes.
   - Not reviewed again since.
2. **A coherent, tested primary interaction across title, creation, exploration, conversation, maps and combat.**
   - Met in structure: the one row, its states, its hold, one menu a page, held by the census, the row geometry pins
     and the hold, opening, talk, fight and map specs.
   - Not met in feel until a person says so.
3. **The Colour Atlas indicator specification.**
   - Normative appendix: indicator-appendix.md (the restricted palette; condition by Indicator.condition, pinned by
     small/indicator-condition).
   - Partly wired: `data-condition` is not on every surface.
4. **Measured performance.**
   - Met, with an exact account (first-touch-performance.md).
   - What remains: a world's installs take 4.5–5.5 s, name-dependent, and are hidden only when creation takes long
     enough.
5. **Real progress on SRD, authorability, density and the backlog.**
   - Met in a bounded subset, by executable behaviour: the work above, each with its spec.
   - The opportunity census (census/opportunity-depth-2026-11-16.md) is a baseline, not yet a raised floor.
6. **A reconciled register and design recommendations.**
   - The register counts every row: 651. Fifteen are from the second and third reviews; since round 7, twelve more
     are from the owner's notes of 17 November (OR-54..65) and two from the SRD work (SR-01, CR-01). 236 fixed,
     174 open, 153 partly, 45 deferred, 35 duplicate, 7 decided, 1 ambition; P1: 127 fixed, 26 open, 64 partly. At
     the mission's start it was 615: 193 fixed, 206 open, 124 partly.
   - The last round (7) took the open P1 rows from 33 to 23:
     - the aim's lead into a site room by room (PB-16, EX-03, gold walker a1 2/11 → 4/11 guided turns for a
       warrior);
     - a novice-viability measure: a lone warrior fought to the end dies in 45% of a1's bands, a careful player in
       1–2%; how much danger the first hour should hold is open (CB-01, with BP-07).
   - Round 8 closed eight rows and moved seven to partly, each with a spec that fails before or a measure. P1 open
     is 26, not 23, because the owner's notes of 17 November added four (OR-57..60):
     - the sign chosen at creation kept on the one made (OR-13);
     - every condition told in words (CO-10's planes and laws);
     - the docs and `Costs` agreeing with the code (AX-09: kit composition 4.0 s of a1's warm start);
     - a check's difficulty read from a measure (OB-11, CB-05);
     - the courier's card naming the herb-wife it goes to (BL-06);
     - a clause naming an unnamed place left whole (NP-13);
     - the open country told eight ways a kind of land, not three (CO-03, R11-06);
     - the waits saying they mend nothing (FH-14);
     - PL-17, R10-13 and US-08 held by specs at last.
   - Round 9 took up the owner's OR-60 (play feels shallow; hooks do not onboard): the first hour diagnosed headless
     in a1, kite and thorn (onboarding-diagnosis.md), and three causes fixed and pinned. Every hook now names its
     first step; the wanderer is told the town's work at the inn; a lesson says what earns it. And a job too much for
     a company alone is said so by its giver (OR-64: a lone mage is warned of a1's quarry, a warrior is not). Left for
     the lead's ranking: the four never lead with an ordinary act (0 of a1's 91 first-town places), nor yet with the
     help the warning names.
   - Register zero was the owner's aim and is not reached: 174 rows are open and 33 are still "unverified" (mostly
     deferred ambitions, process rows, or experience rows that need a play, not a grep).
   - The design recommendations are prospectus.md.

## 17 November, the owner's two sets of notes

The owner played the deployed build twice on 17 November and asked for global rules, not one-off fixes. What each
became, and its pin:

- **Never more than four rows in view** (OR-56): a row that turns a page is one of the four (Paging); creation's
  More… and the name step keep to four; Trade is one list that scrolls in the menu's place, the one exception
  ([data-list]); the old Look/Ways/More drawers, which the keys could raise outdoors with their own buttons, are gone.
  The census now fails any menu with more than four rows in view, walked title to Book (ActionCensus.crowded).
- **A riddle is focused, then answered** (OR-59): a thing whose acts do not fit is one row; focused, its alike acts
  ("Press the word…") one row; focused, the answers are the four (LensFocus; test/riddle-door-browser).
- **A mark says only what its rows are** (OR-57): a lens's colour and companion icon come from its own four
  (Lensed.aspects); a companion perceived along a way is on that way's row in Go…, never among the scene's four.
- **The map shows what each place is** (OR-58, OR-62, OR-63): one reading (PlaceFacets) rings the aim's place in gold
  on the board and ranks the map's menu, gold first; other places are "View …" (focused on the map), the focused one
  "Travel to …", one on your own hex "Enter …"; the board's one white ring is the focused hex; a journey stopped where
  harm waits holds the map to one dull-red row, "Something is here: put away the map".
- **The hand** (OR-54, OR-55, OR-61): a finger's hold ringed round the finger, the row's fill solid to its end; the
  row's mark one height in every state; nothing on the page selectable but a name being written.
- **The title** (OR-65 partly): the saved game's line gone (said by Continue's title and name). The wider rethink is
  open.
- **The first hour** (OR-60, OR-64 partly; by the register agent): the first hour diagnosed headless in three worlds
  (onboarding-diagnosis.md); every hook now names its first step; a lesson says what opens it; the wanderer is told
  the work; a giver warns a company going alone into a fight it reckons grave ("Not on your own, you won't…"). Open:
  the glance leading with the help; the four never leading with an ordinary act; the debt's dead end.
- **The hunter's career** (CR-01, the owner's commission, career-brief.md): phase 1's review and smallest proof (the
  `felled` deed, a dragon, knighthood read by the world, a game-warden, a bounty that arises over time; four specs),
  phase 2 (the canon's Dun Rìerdan, a royal proclamation on the first notice, one named dragon per world) in hand.
- **SRD** (SR-01): Cone of Cold, Death Ward, every outer plane under a law, the `line` area and Lightning Bolt by the
  SRD's numbers; the spell draw by rank (adding a spell moves only who gains it) on a branch, then the levels.
- **Kyr's coordinates** (OR-66): what reads them and what could replace them, a decision recorded.

## What remains partial

- **A place, the map's cards and the Book drawn by PageFrame's component**, not only marked by it: their compositions
  are their own (a place's telling and acts are one component, GlanceStage). The structure is held; the code is not
  yet one component everywhere.
- **FH-01**: a person playing the first hour and accepting it. Nothing here substitutes for it.
- **From the first review:**
  - OR-23: the passage's near-black frame between setting out and the first page;
  - OR-28: labels over bright paintings on a phone;
  - OR-30: words and pictures that disagree;
  - OR-32: creation's empty left half;
  - OR-33: "You know now" on a greeting.
- **The reviews' rest**: OR-43 (the wrong painting before the opening on a phone), OR-44 (setting out on a phone),
  OR-45 and OR-53 (small), OR-46 (a place's own kind in winter), OR-47 (the menu's jump, unpinned), OR-48 (the
  sitter's name at the top edge), OR-49, OR-50 (a life shown before it is chosen), OR-51 (creation's backdrop; one
  town in three painting traditions), OR-52 (Continue's own look; holds and bars unexplained).
- **The sign's turn** sweeps the lit figure under the rows while it turns (seen in stills; by design of the turn, but
  busy).
- **US-07's rest, GT-01's rest** (drowning, level drain, the outer planes), AR-17 (a province redrawn moves the
  wild), WM-04's asked-again copy, and the 43 unverified rows.

## What should shape the next mission

- **First**, the person: run the first hour with a cold player (FH-01) before more surface. Three blind reviews of
  recordings agree with each other more than with the engineering record; a person playing will say which of the
  reviews' findings matter.
- **Then**, parting a place into narrative and menu (PageFrame everywhere); careers from resolved deeds (prospectus
  Priority 1), the smallest one first: a deed that one person and one price answer.
- **Keep the census and the geometry pins as the floor**: they caught regressions that browser specs had passed.
