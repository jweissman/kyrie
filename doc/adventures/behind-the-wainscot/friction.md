# Friction: where Kyr, the engine and the page resisted

*By severity. Each says what happened, what was done in this branch (always inside the module; no engine change was
made), and what a general remedy would be. Nothing here was patched in the engine.*

## Serious

**F3. The browser turns anyone an action is about into a conversation.** `Attending.opener` (`src/ui/attention.ts`)
collapses every choice under a person into one "Talk to X" choice, and `ChoiceGrouping.fallback`
(`src/ui/choice-grouping.ts`) files an action under whatever present entity its success changes or its requirements
name. So "Keep still, as the Wainscot does" and "Step out into the light" became "Talk to the Lady", before she could be
talked to, in a story whose whole tension is that she cannot be. The CLI showed them correctly.
*Worked round* by asking about her through queries (`ladyUnaware()`, `primedReady()`) and making the outcome a rule on
a fact of the company's (`steppedOut`), so the action is filed as the company's own. *Remedy:* a person who does not
`talk` should not be given a "Talk to" opener; their actions should be shown as acts toward them ("before the Lady:
keep still"). An author should be able to say an action's subject (`About lady.`) rather than have it inferred.

**F4. The glance shows one sentence of a place.** In the browser a place is its first sentence until Look about. A
hook in the third sentence (the ratcatcher's notice on the inn door) was invisible on arrival; so were the colliers in
the grate, who are the reason the Hearth matters. *Worked round* by moving the hook into the first sentence and writing
two versions of the street (with and without the notice). *Remedy:* a way to mark an observation as the one the glance
must show (`as hook`), or to promote a sign that a live objective depends on.

**F10. World events are not yet canonical.** The Freehold is the kind of outcome another module should be able to read
("the county rolls record a freehold held by people living in a giant's house"). The Mission 18 design for
`befell(...)` and `data/rules/canon.kyr` is not on main, so the outcome is recorded only in this module and in the
`after` talk of `countries.json`. *Remedy:* land the canon rules; this module would assert `befell(hollins_freehold)`
and the like in its endings.

## Moderate

**F1. Passage kinds assume our scale.** The lint warns that a ladder up a table leg "does not change level" and that a
path across a sixty-yard floor "ends indoors". Both are right for an ordinary house and wrong for a giant's. Written
as `steps` and `passage`, which lose the sense of a climb (nothing distinguishes a knotted rope from a staircase).
*Remedy:* a `climb` kind with no level promise, or a place property that says the furniture is terrain.

**F2. A level for "up on the furniture" would cost the map.** Considered and rejected: making table-tops their own level
would satisfy the lint and split the ground floor's map in two. Noted because it is the kind of choice an author at
any unusual scale will face.

**F5. A toll is both ways.** A `blocking` thing on a passage blocks both directions; Ma Riser's sign says DOWN, FREE.
Written as two one-way passages, which shows two ladders on the map where there is one. *Remedy:* a direction on a
blocking state (`blocking up`).

**F6. A standard give has no Grave.** Selling the deed to the Concern is irreversible and should be asked twice; `Wants`
makes the standard give available, with no place for a Grave. Written as an action. *Remedy:* `Wants deed_kind
gravely "…"`, or a Grave on a kind.

**F7. Day counts in a placed country.** A country's clock runs from the morning after it is reached, so a dawn rule on
`watch(clock) >= 0` does not count the arrival day's own dawn; the first in-world day lasts until the second dawn when
the country is entered in the morning. Harmless here (the first day's events are hour-keyed), but an author who keys
"day one at noon" will be surprised. Documented in the guide; still easy to trip on.

**F9. Lethality at level one.** A level-one protagonist has six or seven hit points. A cat's paw meant as play (2d6)
killed a thief in testing; the rats as first written (four like cave hounds) killed a warrior in the ambush. Both were
cut (a paw 1d6; two rats). Real danger is right for the cat and the smoke; but an author has no way, short of playing,
to know what "a hard knock" is at level one. *Remedy:* the danger forecast the novice-viability work is building,
available to an author (`kyrie inspect --danger`).

## Small

**F8. Surnames are global.** The lint refuses a person whose surname another adventure's person has (Pye, Tallis, Ames,
Brack were all taken). Good for the one universe; it cost the Lady's companion her short name. An author should be able
to see the taken names before writing (`kyrie names --taken`).

**F11. The giant gentry are new canon.** Giants are established (Thrume's fells, the Long Man's king), but giant gentry
with pianos, portraits and harbour charts are this work's claim. Kept small: the Whitlocks are "the last of the tall
gentry west of the march", and the Whitlock charts are only said to be in harbour-masters' offices. A canon owner
should decide whether giant households exist elsewhere.

**F12. Manners are seven.** `Manner` takes only acerbic, cheerful, compassionate, grim, jovial, proud and stoic. Twenty
people needed mapping onto them (a theatrical Cantor is "jovial"; a stiff tin captain "stoic").

**F13. Role articles.** A role is given "a" unless it starts with "the"; "Postmistress of the Wainscot" read "a
Postmistress". Fixed by writing "the" in each office's role, as the guide says; easy to miss.

**F14. Topics in a placed bundle cannot name the world's inns.** Jory Mudge is the innkeeper of Bootscrape; the
innkeeper of the country next door tells the rumour in the voice `countries.json` gives. The two cannot know each
other. Not a defect; a limit worth knowing.

## What worked well

- Occasions and matters: the Moot is short to write and plays as a comic scene with real decisions.
- `Promise`, `Chapter`, `Grave`, `Known as`, `Seen when`, `leadsTo`, `once` topics, `Remarks at`: all did what the
  guide says, first time.
- `bin/kyrie play … --choices` is an excellent authoring loop; most of the build was written against it.
- `bin/kyrie countries` made it possible to place the country without moving anyone else's.
