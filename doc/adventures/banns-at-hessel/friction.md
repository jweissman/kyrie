# Authoring friction: The Banns at Hessel

October 2026, on branch `adventure/banns-at-hessel`. These are the places where writing
[Hessel](../../../data/adventures/hessel) in Kyr went against the grain. Severity and kind follow
[The House That Grows' ledger](../house-that-grows/ledger.md) and [Low Water's report](../low-water/friction.md).

**Severity:**

* **severe**: it works only through machinery that hides it.
* **moderate**.
* **minor**.

**Kind:**

* *missing*: the capability does not exist.
* *hidden*: it exists but is hard to find.
* *defect*: it exists and behaves wrongly.
* *frontend*: the world is right but the page presents it badly.
* *tooling*: the friction is in tests or lint, not the game.

Nothing was blocking. One shared rule was changed, `pay_tribute` (entry 9). Everything else was worked around inside
the module, and each workaround is named so that it can be removed when the engine changes.

## The clock and the anchor

**1. An `at` anchor scopes where a thing is told, not whether it happens.** *Severe, hidden.*
`Event chair_runs at abbey_yard when daytime() …` fired while the company was at the bridge: the anchor decides where
the text is shown, not the condition. The chair ran, crashed, and had Kit dismissed while the company was still
crossing the river. Every scene-event in Hessel now repeats its anchor as a condition: `at(party, abbey_yard)` (the
chair, the stile, the crossways, the gate, the laundry). The same applies to `Rule … at … says`. The Two Poles'
retelling of Hartopp's boots (`ball.kyr`) first said "at two_poles … or at(party, stall_street)", and would have
fired silently on Stall Street.
*Remedy:* lint an anchored event or says-rule whose condition does not mention the anchor; or make the anchor a
condition.

**2. Taught facts print before the scene that teaches them.** *Moderate, frontend.*
An observation that `teaches` a fact prints the fact's text before the observation's own. The first draft had Hetty's
shop open with "The Honourable Rupert Wenlock has been married these two years to Hetty Quiney, … they have a son,
Jack…", and only then showed Rupert with the baby. The secret was told before it was seen. The same happened with
Ismay at the window, Celia's books, and the knocker. Worked around by rewriting every scene-taught fact as a short
journal line that reads acceptably in either order ("Ismay Cherrett watches Kit Danby from the parlour window").
*Remedy:* print taught facts after the page's scene text, or as a margin note.

**3. Events and says-rules print before an action's combat narration.** *Moderate, frontend.*
Fighting the footpads, the page reads "Ottery is down on his knees in the heather beside the two men… 'You'll live'"
and *then* "Hob hits the second of the footpads… falls." A fight takes one watch, so the module cannot delay the
reaction to the next page without leaving the player nothing to do. Left as it is.
*Remedy:* the same as 2: narration first, consequences after.

**4. A line held `not knows(party, X)` that teaches X is gone before the page is drawn.** *Moderate, hidden.*
The observation teaches; the world reaches fixpoint; the guard is false; the line is not drawn. Worked around with a
generic latch in `clock.kyr`. `teachesAt(fact, place)` holds the line until the company has learned the fact *and left
the place*; `seenOnce` then shuts it. It is twelve lines and a little hidden machinery, and every adventure that
teaches by observation needs it.
*Remedy:* an engine notion of "shown this visit".

**5. Hourly routines fight `following`.** *Moderate, missing.*
Rupert, asked to come and tell his mother, walked off to the King's Bath at two because his routine said so. Every
routine in Hessel (about forty rules) carries `and not following(x, party) and not travelsWith(x, party)`. Nothing
makes a person's schedule yield to an agreement.
*Remedy:* a `Routine` construct, or an engine rule that a person who is following is not moved by unrelated rules.

**6. The followers' keep-up rule is per-adventure.** *Minor, missing.*
A person who is following does not ride a chair or a carrier's cart with the company. Hessel has
`Rule keep_up when following(?x, party) and at(party, ?p) and not at(?x, ?p) { Assert at(?x, ?p). }`.
*Remedy:* in the shared rules.

## People

**7. A grave action executes on its first choice in Journey and the CLI.** *Moderate, tooling.*
`open_door_for_him` (Nan flees for good) and `let_ottery_go` are `Grave`. In the browser they ask for confirmation; in
Journey and in `bin/kyrie play` the first choice performs them. That is right for scripts, but it means the
confirmation is never tested.

**8. A proud band is spoken of in the singular.** *Minor, frontend.*
`Give {lord} what it asks` and the old result "{lord} takes it, and lets you be" became "Give the footpads what it
asks" and "The footpads takes it". The templates have no verb agreement. The shared result is now "You pay {lord}, and
are let be". The label still says "what it asks".
*Remedy:* agreement in templates (`{lord:takes}`), or a pronoun slot.

**9. Tribute was offered to the fallen.** *Moderate, defect. Fixed in `data/rules/inhabitants.kyr`.*
`pay_tribute` required `warned(lord, actor)`, which survives the lord's defeat. A warrior fought both footpads down and
was still offered "Give the footpads what it asks". The fix adds `and able(lord)` to its requirements. (The
spoken ways to the band were already withdrawn after a fight.)

**10. Roles must not repeat the name.** *Minor, hidden.*
"Lady Wenlock, a Lady Wenlock, with a ribbon in her cap": the page composes "{name}, {role}", so a role that begins
with the name doubles it. Several were caught this way (Kit, Celia, Brocca, the pumper, the footpads, Lady Wenlock).
*Remedy:* lint a role that contains its person's name.

**11. Typography curls a leading apostrophe.** *Minor, frontend.* A chairman's "'em" became an opening quote. Avoided by
writing "them".

## Places

**12. Level names appear in passage labels.** *Minor, hidden.* A level's name is read out in the labels of the ways through it,
so Carth House's two levels are named for how a player would say them ("the floor above", "the rooms below stairs"),
not for what they are.

**13. There is no containment query.** *Minor, missing.* "Is the company anywhere in Mrs Cherrett's lodgings?" is
written as `at(party, cherrett_parlour) or at(party, cherrett_bedroom)`, and "in the Rooms" as three rooms. A building
or area can anchor an event but cannot be asked about.
*Remedy:* `within(party, cherrett_lodging)`.

**14. Items cannot be given by a topic.** *Moderate, missing.* `Resolve` is not allowed in an effect, and inventory
cannot be set directly. Ismay's note, Rob's poem and the compass are placed in the room for the company to Take. The
Take step shows an empty page, which reads as a dropped beat in every transcript.
*Remedy:* a `Give item to party` effect; or Take narrates what was taken.

## Tooling

**15. `Journey`'s `=N` throws once the book has closed.** *Minor, tooling.* "Nothing to wait by". The test helper waits an
hour at a time and stops at an ending.

**16. `~pattern` retries until the company moves.** *Minor, tooling.* It is right for ways and wrong for anything else; a
purchase written with `~` looped.

**17. `bun install` was refused (403) for the two GitHub-hosted dependencies.** *Environment.* `deem` and `languages`
were cloned at their locked commits into `node_modules` by hand. `package.json` and the lockfile are untouched.

**18. The vocabulary warnings.** *Minor, tooling.* `bin/kyrie lint` reports about 1,700 repository vocabulary warnings,
almost none of them Hessel's. Hessel's own campaign lints with 0 errors and 0 warnings, but the repository-wide count
hides any new warning.

## Found in the second pass

These came from the literary revision ([14-second-pass.md](14-second-pass.md)): the tablets, the canal map, the cloves,
the chapters, and the knowledge-based ways past Sir Gervase and the footpads.

**19. An event cannot assert knowledge; an action can.** *Minor, hidden.*
`Event footpads_tended … then { Assert knows(party, hartopp_paid_pads). }` is refused at load: "a rule teaches what it
says: says "…" teaches fact". The same assertion inside an Action's `On success` is accepted (`name_lanyon`). The
lint message names the remedy (`"…" teaches fact then { … }`), so the friction is only that the two constructs
differ.

**20. `is scenery` takes away the choice to examine.** *Moderate, hidden.*
The tablets in Saint Ebba's and the canal map were first written `is scenery`, because they are part of the room. With
`Tries looking`, they still offered no "Look closely". A thing must not be scenery to be examined, and then it is
listed among the room's things. Nothing says which is which except trying.
*Remedy:* let scenery be examined when it `Tries looking`; or lint a scenery thing that tries looking.

**21. Taught-first printing (entry 2) now shapes clue design.** *Moderate, frontend.*
The boys' confession teaches its fact before the scene in which they confess. Their discovery could not say "Dr Hartopp
paid them" without the page saying it before Davy does. It says instead "by a gentleman who smelt of cloves", and the
player makes the inference. That turned out better writing, but it was forced by the engine, not chosen.

**22. A says-text cannot begin a paragraph.** *Moderate, missing.*
The chapter openings ("SATURDAY. The bells of Saint Ebba's ring six…") run on after whatever else the page told:
"You eat what is put in front of you, and sleep long, under a roof. SATURDAY. The bells…". There is no way to ask for
a paragraph break, a heading, or a page of its own, so a chapter cannot look like a chapter.
*Remedy:* a `Chapter` construct, or a paragraph mark in says-text.

**23. A warning's patience is one watch, and it is invisible.** *Minor, hidden.*
A territorial or proud group that warns falls on whoever stays once `patience` (one watch) has passed. A module's own
answer to a warning (telling Sir Gervase about the letter; naming Davy's uncle) must therefore be an action that
retracts `warned` and asserts `tolerates` inside that window. It works, but it was learned by reading
`data/rules/inhabitants.kyr`; nothing in an encounter's page or a lint says how long the company has.

**24. A thing's place in the page is not chosen.** *Minor, frontend.*
The tablets' state text ("Under the west window one tablet is newer and whiter than the rest…") is told after the
nave's scene, whose last sentence is "One tablet only says, HE CAME TOO LATE." Read in order, it is a good
foreshadowing beat. But it is that only because the engine happens to order things after observations. An author
cannot say "this sentence goes after that one".
