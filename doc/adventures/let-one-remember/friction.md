# Writing *The Road the Star Came Down* in Kyr: a critique, and the friction

*Let One Remember*, now Act I of *The Road the Star Came Down*, was designed from four documents of source material, written in Kyr
(`data/adventures/let-one-remember`, about 1,400 lines in eight files), and played headlessly by the labels a player
sees (`test/let-one-remember.test.ts`, eleven journeys). This document has two parts. The first is a critique of the
module as it stands. The second covers what Kyr made awkward or impossible, and what I would like the language and its
tools to grow. Nothing in `src/` or `data/rules/` was changed. Every workaround is in the module.

All play was done by the author, headlessly, with a scratch driver. None of it was in a browser, and none of it was
independent testing.

## Part one: a critique of the module

### What I think works

- **One law, many levers.** The balance (links, horn, lift, ballast, what Hightown's people know) is a single
  equation, and every faction's action moves a term in it. Ruth, Esk, Lene, Aron and the company never coordinate.
  They each change a number, and the gales read the result. This is the sourcebook's "use the numbers" principle,
  and the module honours it.
- **Telling as the dangerous verb.** "Tell {someone} where Hightown came from" is one generic action over every
  Counterweight. One action expresses both the careful roster and the catastrophe. The difference lies only in who is
  listening, which is the setting's point.
- **The originality choices.** Setting it in 2731 removes slowed time (*The Patient Star*). Keeping the Margin across
  the water removes the Between (*Thrume*). Making knowledge restore weight, rather than attention fix rooms, avoids
  *The House That Grows*. The module has its own centre of gravity.
- **The portfolio scenes land where a player would meet them.** Tip at the gate is the best of them, because it is
  incidental: the company is only stopping for water.

### What is weak, in order of how much it matters

1. **The world is announced, not inhabited.** Corin Webb never walks to Keld. A rule sets a flag, and "word comes" to
   wherever the company is, instantly, even 1,700 m underground. Aron never climbs down to the Askew gate. Pell never
   goes up to Hornwake. The sourcebook's table of how fast news travels is ignored entirely. The factions are clocks
   with prose attached, not people with routes. (Part two, F9 and F10.)
2. **The balance is invisible.** A player cannot see the resting weight or the distance to the Socket except through
   a few prose bands: the horn skips, the shadow is on the water. Wil Fennimore says "three thousand nine hundred
   metres" on day 27 as on day 1, because Kyr cannot put a measure into speech (F3). The Registry recites fixed
   numbers in two variants. A system whose pleasure is "players can check the plan" offers almost nothing to check
   against.
3. **The dangerous button is too cheap.** "Tell the Grounders where Hightown came from" is one click, with no warning,
   no hesitation and no refusal. Speaker Vane, the woman sworn never to learn, cannot put her hands over her ears. The
   scene's weight is entirely in the result text. A conversation that could be broken off, or a listener who could
   refuse, would make the choice a choice (F12).
4. **Teshen is a key, not a companion.** Eight actions are "Ask Teshen to…": reading every tally, two locks,
   naming the Strays, naming Webb. She joins for a one-off fee (the sourcebook says two silver a day). She never
   leaves, never objects and never wants anything after joining. Her wish to be a stranger for a week, the most
   human thing in the sourcebook, is set up and then dropped.
5. **The grammar puzzle is half a puzzle.** Without the grammar, the marks are unglossed Calvessan and the player
   guesses. With it, the room description glosses the answer outright ("kept; the keeper saw it"). The better version
   would print the raw marks always, and let knowing the grammar change only what the player can work out. Kyr cannot
   express "the player now understands" separately from "the text now says", so I chose the blunt version. The left
   and right aliases also read oddly when walking back up the road.
6. **Write-only facts.** Several facts are set and never read:
   - `licensed` is bought and never checked. Going down the rim ropes unlicensed costs nothing, though the sourcebook
     fines, bans and shutters.
   - `warmed` (the Registry given coal), `warnedChimed` and `fed` lead nowhere. Neither the Chimed blocking the stair
     nor the Registry moving its rack is written.
   - `grieved` is set on four Hightown listeners and never read.
   - `sunk` is computed and never told.
   - `unsaidStirred` changes one line of description and nothing else.

   Each is a thread with a beginning and no middle.
7. **The default timeline is hand-tuned.** The gale dates, drift distances and the day Aron finds the chain were
   adjusted until "left alone" reproduced the sourcebook's fall on the shore. That is reasonable authoring, but it is
   fragile: a small change to lift or drift reorders the catastrophes. The *Lost* ending is reachable in principle
   but no journey reaches it, because Aron's late roster always adds just enough weight first. A world with one
   reachable bad ending and one theoretical one is less alive than the design says.
8. **The Strays do not take.** The sourcebook's Strays steal belonging: a sword becomes nobody's, a farmer stops
   being sure the barn is his. In the module they stand in a field, and one "settles" as a sentence about a chair.
   Kyr has `owns` and `lends`, so a Stray could take ownership. I did not write it.
9. **Prose is told twice.** For most revelations, Kyr prints the discovery's text and then the speech that taught
   it. I wrote some discoveries as journal summaries, but many (Hask, Saska, the journals) still read as the same
   fact said twice in a row. The README's claim that the repetition reads as a note is generous.
10. **The tests prove the happy paths.** Each journey walks the right route. Almost nothing walks a wrong one:
    - Taking the decoy at a mark and choking.
    - Crossing the Diggings without Ida and breathing glass.
    - Fighting the unfed Old Silver.
    - Telling the Charge, or the rim.
    - Two cuts with nothing to offset them.

    Only one journey (the Grounders' hall) and one assertion (no theft) exercise a consequence the player would
    regret. Combat balance is untested.
11. **Scale and economy are loose.** Recruiting Teshen *added* six silver to the purse, because she joined with her
    own. Prices drift from the sourcebook's. A party of level 1 adventurers can go anywhere, since nothing scales
    or bites.

### What I would do next, if continuing

- Make the Registry, Wil and the Horn Watch report live numbers. This needs F3, or a dozen banded variants.
- Write the Chimed blocking the stair, the Registry's fine for the ropes, and the Stray who takes a thing.
- Give Teshen a want of her own after she joins, and a reason to leave.
- Add failure journeys: the decoy, the glass, the eel, the two cuts.
- Move Webb and Aron through the world with byways (`dominion.kyr`), so they can be met on the road.

## Part two: friction in Kyr

**Bugs** are behaviour I believe is wrong, with a way to see it. **Friction** is where Kyr could not say what the
design said, and what the module does instead. **Wishes** are extensions that would lift the language.

### Bugs

| # | What happens | How to see it | Severity |
|---|---|---|---|
| B1 | **A long hazardous way always turns the company back.** A passage with a dangerous thing on it is offered as a risk ("To a Concord rest-cradle — risk ice on the links › Elen goes first"). But a journey longer than one watch re-checks `passable` each watch (`src/campaign/journey.ts`, `open`), and `passable` excludes `hazardous`. The company sets out, takes the risk, and is told "The way is no longer open. You turn back to the runners' reach." | Put `Thing ice … on wet_climb { State icy dangerous … Hurts with … }` on a 12-hour ladder, then take the risk. | high: any long dangerous way is unusable |
| B2 | **A count below zero stops the game.** `Decrease socketDistance(hightown) by 1400` when 500 remain throws `Invalid quantity` from `World.change` mid-command. Lint cannot see it. | Remove the `drift_ashore` guard in `clocks.kyr` and wait to day 27. | high: a runtime crash in a module that lints clean |
| B3 | **A lit light that is shuttered stays lit.** After Ida "smothers it in her coat" (my `shuttered` fact), `capable(party, light)` is still true. Nothing in the rules puts a light out. | The chimefly scene in the Diggings. | medium |
| B4 | **Twin destinations are not told apart across exits.** Two exits whose destinations share a name are offered as two identical labels ("To the low road, further down" twice). `ChoiceGrouping.distinguish` works within one group, but each exit is its own group. | Name two rooms alike and stand where both are exits. | medium |
| B5 | **A companion who has joined is nowhere.** `recruit` retracts `at(recruit, site)`, so `Event … near ida` and `at(ida, diggings)` silently never fire once Ida is in the company. Lint says nothing. | `Event ida_hums near ida when … at(ida, diggings)` after recruiting her. | medium: silent |
| B6 | **Recruiting adds the recruit's purse.** The company's silver went from 60 to 66 on hiring Teshen for 2. | Hire Teshen and read `quantity(party, gold)`. | low |
| — | `bun install` cannot fetch the pinned `deem` and `languages` in a sandbox whose proxy allows git but not GitHub's tarball API. I installed them from local clones at the pinned commits (`file:` specs, then restored `package.json` and `bun.lock`). | Environment, not Kyr. | — |

### Friction

| # | The design says | What Kyr made me write | Proposed remedy |
|---|---|---|---|
| F1 | `resting = links × 1,100 + horn + heard × 1,000 + ballast − lift` | Arithmetic is strictly left to right, so the second product multiplied everything before it (160,146,000 t). `heard × 1,000` needs its own measure and its own rule. | Ordinary precedence, or parentheses in values. Also `min`, `max` and integer division. |
| F2 | A quantity worked out from others | `Rule reckon when x != expr { Set x to expr. }`, repeated for each derived number, with the order of rules carrying the meaning. | A computed measure: `Measure resting(place) means tailLinks(?p) * 1100 + …`, read like a `Query`. |
| F3 | Wil reports today's distance; the Registry recites today's numbers | Text cannot carry a measure. I wrote banded observations (≤ 1,500 m, ≤ 2,000 m) and two fixed variants of the reckoning. | Interpolation in prose: `{socketDistance(hightown)}`, ideally with a number-to-words filter for spoken text. |
| F4 | The drift stops at the shore | Counts may not go below zero (B2), so `driftBy` is set aside and applied by two rules, one subtracting and one setting zero. | `Decrease … by … at least 0`, or signed measures by declaration. In either case lint should warn about a decrease that can underflow. |
| F5 | The grey shore is seen with every light out | In an unlit room with no light, nothing is perceived, so an observation there is never told or learned. Nothing puts a light out (B3). | Senses beyond sight (`heard`, `felt` observations perceived in the dark) and a standard douse action. |
| F6 | The way marked *kept* versus the way marked *aun* | Exits are labelled by destination, so a decoy's room name gives it away. I gave each destination `seen as "the left-hand passage"` until reached. That reads wrongly when approached from elsewhere (the Fork from the Root needed its own teaching observation). | A per-passage label: `Passage … labelled "the left-hand way"`, or "Go by {way}" whenever the way has a name the room does not. |
| F7 | One companion who reads link-script, everywhere | Eight bespoke actions ("Ask Teshen to read …"), each repeating `able(actor) and company(actor) and at(actor, site) and at(actor, X) and travelsWith(teshen, actor)`. | A skill a person brings (`Trait link_script`) and `needing link_script` on sources and changes, i.e. `readable by party with link_script` (Thrume F13, still open). |
| F8 | Learning two things makes a third obvious (the chart and the lens; the hoists and the number) | `Observe … near party when knows(a) and knows(b) … teaches c`. It works, but it is phrased as something seen. | `Infer c when knows(party, a) and knows(party, b) "how it fits together".` |
| F9 | News travels at the speed in the sourcebook's table | `Rule … says "Word comes…"` is told to the company wherever it is, including at the Seam (Patient Star 32, still open). | `says` scoped by place (`to whoever is in wendmouth`), or a `News` construct with a route and a delay. |
| F10 | Webb walks to Keld; Aron climbs down to the gatepost | Rules teleport people, or set a flag and announce it. Pursuits plus byways can do this, but for a one-off errand the machinery is heavy and a `Peaceable` person does not pursue (Thrume F2). | `Errand webb to saska_hearth on day 18, taking 8 hours, then …`: a scheduled journey a company could meet on the road. |
| F11 | Things happen on day 11, day 19, at midwinter | Every date is a watch number (1440, 2592, 4032), computed by hand from the start hour. | `on day 11`, `at midwinter`, or `when date(clock) == 2731-12-21` against the campaign calendar. |
| F12 | Telling the hall is a grave act; Speaker Vane might refuse to hear | An action fires on one click. A topic cannot be refused or interrupted. | A `Grave` flag (or `Confirm "…"`) that makes the page ask, and topics with a listener's refusal (`Refuses when … "…"`). |
| F13 | A crowd of 300 minds versus a person | `Numbers 6` sets how many fight; how many *minds* is a separate measure set by hand (`minds(grounders) = 300`). | Let a group's size be readable (`size(group)`) and distinct from how many are on the field. |
| F14 | Hightown's summit and the halls under it | Levels may sit only in sites and buildings, and buildings not in settlements' levels. The error was "Invalid level containment for summit". I wrapped the town in a site, "the rock of Hightown". | Say in the error what is allowed. Consider levels in settlements (a town on a cliff). |
| F15 | The rim, the terraces and the Glass Floor are open to the sky | Rooms in a site's level default to indoors; `path` then warns "ends indoors". Fixed with `outdoors` per room. | Inherit shelter from the level (`Place summit … is level within … outdoors`). |
| F16 | A name I wanted (`fallen`, `rest`) | `fallen` collides with a canonical name. Found one load at a time; the module's relations are namespaced at run time but not for collisions. | Report every collision in one pass (Thrume F3). Since `corrow__` is prefixed anyway, let a module shadow a canonical name with a warning. |
| F17 | A revelation spoken once | The discovery's text, then the speech: told twice. | When a topic teaches, let its `Says` stand for the discovery in the moment, and keep the discovery's text for the journal. |
| F18 | Darkness and light as the real cost of going deep | The shop sells lamps and oil, but only "light a flask of lamp oil" is offered as an explore choice, and the item panel lists eight torches as one. I fell back to torches. | Stack identical items with a count; make a lamp light from its oil. |
| F19 | Midwinter closes the book | No ending construct (Thrume F12, still open). Endings are relations plus observations near the company, told once via `teaches ending_told`. | `Ending … when … "epilogue".` |

### Tooling wishes, in order of what they would have saved me

1. **A headless driver in the box.** I wrote one (`drive.ts`, not committed). It plays steps by label regex, waits to
   a watch, prints each response, and probes facts and measures (`?restingWeight hightown`, `!knows party fact`).
   Every module test so far (Thrume, *The Patient Star*, this one) re-implements the same `class T`. A shipped
   `bin/kyrie play --steps steps.json --probe …` and a shared `test/support/journey.ts` would remove a few hundred
   duplicated lines and most of an hour per author.
2. **A simulation readout.** Tuning the default timeline meant waiting four weeks of game time while printing five
   measures each night. `bin/kyrie simulate campaign --until 4032 --every 144 --show tailLinks,restingWeight,…` would
   make clocks something an author designs instead of discovers.
3. **Lint that understands rules.** It does not know that a rule moves people (Thrume F7), that a decrease can
   underflow (B2), or that a fact is written and never read. The last would have caught `licensed`, `warmed`,
   `grieved` and `warnedChimed` in seconds. A "write-only fact" warning is cheap and catches unfinished threads.
4. **A trace of a watch.** When the swarm did not come, the cause was `not dark()` at 3 a.m. When Ida's scene did not
   fire, the cause was B5. Both took several runs to find. `--trace` printing which rules fired, and which nearly
   did, would make Kyr's order-is-meaning (Thrume #10) inspectable.
5. **Prose review for module text.** `bin/kyrie voice review` covers voice lines. A pass over a module's observations
   and says that flags repeats, overlong lines and duplicated discovery-plus-speech pairs would catch item 9 of the
   critique.

### What Kyr did well (so nothing that worked is removed)

- `seen as … until fact` (place aliases) rescued the grammar puzzle without any new machinery.
- One generic action over a relation (`tell_origin(actor, listener, site)` with `counterweight(listener)`) produced
  every telling, from a girl in a chapel to a hall of 300, with per-listener aftermath from `Event … when
  holdsOrigin(x)`.
- `opening when …` closed the hoist and the Chain the moment Hightown fell or flew. No bookkeeping was needed.
- `Wants` plus `Event … when keeps(person, ?thing)` made the coal-for-a-reckoning trade, the deeds returned and the
  lens lent natural.
- Determinism: a 28-day default run takes two seconds and replays identically. That is what made the timeline
  tunable at all.
- Lint's passage-kind warnings (a stair that does not change level, a path that ends indoors) caught real modelling
  mistakes, not just style.

## Part three: after the second pass (Acts II to V)

The first critique asked whether this was a supermodule in the sense of the classic *G-D-Q* run (*Against the
Giants*, *Descent into the Depths*, *Queen of the Spiders*): a strategic adversary, acts with movement, faces that
change. It was not. The second pass wrote a spine ([spine.md](spine.md)) and built four more acts against it.

### What changed in answer to the critique

| Critique (part one) | What the second pass did |
|---|---|
| No strategic adversary | The Unsaid is the Nail's forgotten name, wanting its body. The Nail is beyond the gates, a thought behind the jewel. The kin come down from the new star. Each act turns on one of them |
| The world is announced, not inhabited | Still mostly announced. The Unfolded do walk: they move room by room along a route, and Hornwake and the Stake empty in front of them. The Open Hand's rite and the name's crossing are still told as news |
| The dangerous button is too cheap | The rim now has a two-hour gathering, the company can stand up in front of it, and the objective says so. The Arbiter refuses two and says why. Act V's four endings are four buttons, each with its description of what it costs |
| Teshen is a key | She still opens things. She also has a want after joining, a place where she can have it (the grey), and an ending of her own if the company lets her stay |
| Write-only facts | Several now pay off: Webb named makes the reeve's house empty; the deeds, Prew and the lens make anchors; the Unaskers' doctrine becomes the rite's largest contingent and the ship's lift; `grieved` and `licensed` are still unread |
| The hand-tuned default | It now runs through three acts on its own: the fall on the shore, the name crossing at the Open Hand's rite, the kin reading the band. It is still hand-tuned |
| Happy paths only | Act II tests three ways to deal with the Unsaid that cost something (unmaking it drops the mountain; sending it wakes the Nail; staying too long strands you). The default run tests the worst Act III |

### What is still weak

- **Fights are not the drama, and are not balanced.** The Unfolded are four level-10 iron golems that will kill a
  first-level company that meets them on the road. No journey fights them. The Act IV ship has no boarders to fight.
  A *G-D-Q* table would expect set-piece battles; this campaign has set-piece choices.
- **The later acts are thinner than the first.** Act I has 88 rooms. Act II has nine of its own, Act III two (it
  marches over Act I's plateau), Act IV one (the ship is Hightown), and Act V four. The Margin is the strongest of
  them. The voyage is a puzzle of four thresholds rather than a place.
- **The Hartmark is still offstage**, and the iron route in Act III (Bede splitting the link into blades) is
  designed but not built.
- **A company does not grow.** The acts are pitched at levels 1 to 14, but nothing in the module awards the
  experience to get there except fights it does not stage. The act fixtures start at the act's level; the single run
  plays all five acts at level 1, which is honest about the module but not about the design.
- **Time is generous.** The single run reaches Act V on day 47 having waited thirty-six of those days for the star.
  The weeks between Acts II and III want more to do in them, or a star that comes when the company is ready.

### New friction from Acts II to V

| # | The design said | What Kyr made me write | Proposed remedy |
|---|---|---|---|
| F20 | Start an act at its threshold, already knowing what Act I taught | `Invalid initial knowledge`: a module cannot start a company knowing a fact. Each act fixture has a "Begin Act N" action of time 0 that asserts the knowledge | Allow `Initially Assert knows(party, …)` in a fixture, or a campaign-level `knows` list |
| F21 | Iniry's two conditions, *lost* and *home* | A state named `lost` collides with the relation `lost(place)` in another file of the same module, and with a parameter in the shared rules. States share the entity namespace (Thrume F3, still open) | Scope state names to their thing |
| F22 | Two observations both called `court_scene` (the Keepstone Court, the Unsaid's court) | Observation ids are module-wide, and the error does not say where the first one is | Say both places, as entity collisions now do |
| F23 | An ending in Act I and another in Act V, each told once | The "told once" idiom (`teaches ending_told`) can be used only once per fact, so Act V needs its own `finale_told` | An `Ending` construct, again (F19) |
| F24 | Walking into another plane | The way is labelled "Through to the grey shore", not "To". The tests had to learn it. Fine, but undocumented | Document the label verbs a passage can take |
| F25 | A ship's altitude as a measure the player steers | Works well: `Measure altitude`, two actions, four threshold rules, and banded observations for the needle. But no number reaches the page (F3), so the player steers by prose | F3 |
| F26 | Whether Hightown is a vessel | `Query afloat(p) means (not crashed(p) and …) or relifted(p)` worked first time: a module-local query is the right tool, and the guide should say so | Document module queries with an example |
| F27 | A long plan written as steps | The single-run test reads 415 steps from a JSON file. My scratch driver grew `%` (optional), `=+N` (wait N) and `~N` (wait by dark and light) to make it writable. The other branches grew the same | Ship the driver (wish 1) |

### What worked in the second pass that I did not expect

- **Cross-plane passages with `opening when`.** The Margin is one passage from the Seam, open only while the rite is
  arranged and the anchors hold. When the voices stop, the way home is simply not there, with no extra code.
- **Rules reading Act I's facts.** Every carry-forward in the spine's table is one condition in a later act's rule or
  topic (`webbNamed`, `deedsBack`, `lensHome`, `turned`, `bandBroken`). Kyr's single world state made the five acts one
  campaign without any glue.
- **Determinism at length.** The 415-step run takes twenty seconds and replays identically. A five-act campaign with
  this many interlocking clocks would be untestable otherwise.
