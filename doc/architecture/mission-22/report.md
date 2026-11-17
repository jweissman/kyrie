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
  and a fight. A place, the map's cards and the Book are not yet drawn by it (below).

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
   - Not yet recorded and reviewed again after these repairs.
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
   - The register counts every row: 630 (eight from the second review); 216 fixed, 186 open, 139 partly,
     46 deferred, 35 duplicate, 7 decided, 1 ambition. At the mission's start it was 615: 193 fixed, 206 open,
     124 partly.
   - Register zero was the owner's aim and is not reached: 186 rows are open and 43 are still "unverified" (mostly
     deferred ambitions, process rows, or experience rows that need a play, not a grep).
   - The design recommendations are prospectus.md.

## What remains partial

- **A place, the map's cards and the Book drawn by PageFrame.** A place's telling and its acts are one component
  (GlanceStage); parting them is the next structural step. Then the census can require every menu to be a PageFrame
  slot.
- **FH-01**: a person playing the first hour and accepting it. Nothing here substitutes for it.
- **From the first review:**
  - OR-23: the passage's near-black frame between setting out and the first page;
  - OR-28: labels over bright paintings on a phone;
  - OR-30: words and pictures that disagree;
  - OR-32: creation's empty left half;
  - OR-33: "You know now" on a greeting.
- **The second review's rest**: the wrong painting before the opening on a phone (OR-43), setting out on a phone
  (OR-44), a place's own kind in winter (OR-46), the small findings (OR-45).
- **The sign's turn** sweeps the lit figure under the rows while it turns (seen in stills; by design of the turn, but
  busy).
- **US-07's rest, GT-01's rest** (drowning, level drain, the outer planes), AR-17 (a province redrawn moves the
  wild), WM-04's asked-again copy, and the 43 unverified rows.

## What should shape the next mission

- **First**, the person: run the first hour with a cold player (FH-01) before more surface.
- **Then**, parting a place into narrative and menu (PageFrame everywhere); careers from resolved deeds (prospectus
  Priority 1), the smallest one first: a deed that one person and one price answer.
- **Keep the census and the geometry pins as the floor**: they caught regressions that browser specs had passed.
