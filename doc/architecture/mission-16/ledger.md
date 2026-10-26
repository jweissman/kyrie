# Mission 16 ledger

The running record of Mission 16: what is done and verified, what was found and is not yet done, and what is
deliberately left. Newest entries first in each part. The plan and its decisions are in [plan.md](plan.md).

## Gates

| Gate | Stands |
|---|---|
| A. A transformed, trustworthy interface | in production: the place, road, conversation, object and fight pages on one white page; the Character view from the start, with development and its previews |
| B. The way into adventure | in production for every world Begin draws: Merrowdale's notice and rumour in every first-country town, its road known, one journey there; free play from Begin across seeds still to do |
| C. A complete RPG expedition | in production: The Long Man played from Begin in two drawn worlds (Lonelymoor, Coldwaste) to its peaceful end, with withdrawal, return and a reload midway; its findings repaired; the storm and its aftermath still to play |
| D. Becoming and continuing | in part: seen through for 1,000 experience, level 2 after a night under a roof, a development chosen in the Character view by what it opens; the Story whole across reloads; Saltgrave entered from the same world. The return is not yet acknowledged |
| E. Independent acceptance and accounting | not begun |

## The baseline (`0e066e5`, the public page, seed drawn by Begin)

Played from the title page at 1280 × 860:
- Begin chose Palereach, a frost country, so no Merrowdale.
- I chose the brothers' errand, a scribe: at the shrine of Chealdtun the letter is given, and the priest teaches the
  way to Riwustagn.
- In the taproom, the innkeeper's eighth of eleven topics, "Ask about the road east", tells of Saltgrave (Thrume).
- The old road east (2 h 50 m), the march crossing (0.4 s), and Saltgrave's market square: 96 seconds for a player
  who knew what to ask. Nothing in the town pointed at that topic.
- Seen on the way:
  - the priest painted as *David with the Head of Goliath*;
  - the market's twenty choices, all of equal weight;
  - the road across the march told as fen ("Out on the fen the sky is enormous") in a frost country.

## Done and verified

- **C, D. The Long Man, played from Begin.** Two free plays from the title page, in worlds Begin drew. Lonelymoor: a
  dwarf warrior on the brothers' errand. Coldwaste: a human warrior who owes a smith fifty coin. Begin to Merrow
  green took 4½ minutes of the player's time. What the plays found, repaired:
  - **Seen through, and worth it.** The Long Man has a goal at last: Merrow safe from its wall, by the leak shut, the
    lake drawn down, or the wall broken with Merrow up the hill. Seen through, it is 1,000 experience for each of
    the company: a level, taken up after a night under a roof. The goal had been written all along in the
    adventure's second file, and the merge kept only the first file's (`ModuleBundle.merge` now takes it wherever
    it is, and refuses two).
  - **The moment is set as one.** Giving the Mower its teeth ends a chapter: what happened, then "Seen through", the
    adventure's name large, what it was worth and what it brings. The Mower's own words were going unheard, because
    the event moved it out of earshot as it told them.
  - **What is newly seen is told.** Staying in a place, the page recalls only its first sentence, so the Mower coming
    onto the crest at nightfall ("a long blade flicks, and something small falls") and the wheels a torch shows in
    the sluice chamber were cut. What a command makes seen is now told as what happened. A wait tells the place,
    then whoever came, as they are seen (`Interruption`), not "The Mower comes where you are".
  - **The people of the dale are themselves.** Each has the manner, pronouns and first greeting the adventure's
    design gives them. Four of them had greeted the company as a jovial landlord ("Sit, sit. Or stand. What'll it
    be?"), Dunnet in a yard.
  - **A likeness that fits, or none, again.** Mother Ysolt was Valentin's young Samson. A role is now read by its
    work ("priest of the Chapel of the Ford" is a priest, not a ford), a title says sex and age (Mother, Gammer,
    Sir), and someone nothing places is met in type. Twenty-four more paintings are refused: faces the player may
    know (the Mona Lisa, Franklin, Darwin, Voltaire, Erasmus, Shakespeare, Newton, Dickens, Lovelace, Napoleon,
    the Lady with an Ermine), saints with their emblems, a cardinal in scarlet, sketches and posters.
  - **No empty answers.** Looking closely at the springs found nothing, though the spade-cuts are the dale's
    secret, and the thing was named "the cuts" before anyone knew. The Story said "You carry out the action." under
    every greeting. A source is read, not examined. An act and its telling are not said twice ("You light a torch.
    / Hild lights a torch.").
  - **The Story is the whole story.** A save kept its last eighty entries, so after a reload the story began
    mid-way. It now keeps all of it, and the Story page asks the engine for the whole.
  - **Development where the character is.** Seven "take up" acts crowded the place. The skills were not even
    choosable in the Character view, being grouped nowhere. Now the place says only that there is a development to
    spend, and opens the character, where each skill says what it opens (`Openings`, from the rules' own needs):
    "Climbing … Opens the gauge shaft, to the foot of the gauge shaft". Taken up, the shaft opened.
  - **A kept game goes on after the rules change.** A save from before "Examine" became "Read" could not go over a
    march ("Conflicting shared definition examine", in a toast). Shared definitions all come from one edition of
    the rules, so two that differ mean a kept world joined by newer content. The world keeps its own.
  - Tests: `test/paintings.test.ts`, `test/the-long-man.test.ts`, `test/travel.test.ts`, the browser specs and the
    long descents.

- **A. A likeness that fits, or none.** Eighteen portraits the game will not cast for anyone it makes are listed
  with why (`data/paintings/unfit.json`): the two severed heads, another world's saints, apostles, Virgin and pope
  (named in the credits the page shows), friars at crucifixes, and kings, queens and a prince for people who are
  none of these. A work whose own painting is not a portrait (a priest's is a shrine) is painted in its family's
  station, so a priest of Aine is painted as someone of faith ("an old preacher in black with a ruff"), not as
  David with the head of Goliath and not as a halberdier. Where nothing fits, the conversation page is in type. An
  author who names a painting still has it. Test: `test/paintings.test.ts`.

- **B. The way into Merrowdale, by ordinary play.**
  - **Placement:** every world Begin draws now holds Merrowdale beyond its north march (its `beside` is every
    terrain), and the independent adventure the seed chooses on another side.
  - **The lead:** in every town of the first country, whoever keeps travellers can tell of it, asked by name ("Ask
    Fargrim about the forty crowns in Merrowdale"), with the way from that town. The steward's notice is nailed up
    where travellers are kept, and the room's telling says so. Reading it or hearing it puts the march-stone on the
    map, as "the march-stone of Merrowdale".
  - **Known roads:** the roads of a country (roads, and the fords, bridges, ferries and causeways they cross by) are
    known to anyone in it, as its folk know them. Tracks and paths into wild country are known only once walked or
    told.
  - **Assisted travel:** a known place more than a step away is somewhere to set out for (`Itineraries`, in
    `src/ui/itinerary.ts`). Opened, it shows its way leg by leg with the time each takes, before anything is done.
    Setting out (`Travel.go`, the engine's `travel` request) makes the journey one ordinary command per leg, told
    as it goes, and stops for a fight, danger where it comes, a way that will not let it by, a hurt, nightfall,
    weariness, hunger or something staged.
  - **In wren, from Begin:** bailey, taproom (the notice in its telling), the lead, one journey of four legs (six and
    a half hours of the world's time, about a second of the player's), the march, and "Into Merrowdale". Tests:
    `test/travel.test.ts`, `test/frontier.test.ts`.

- **A, D. The Character view, from the start, and a level's development.** One person has a character page as soon
  as play begins; a company has one each.
  - **Everything on it is worked out by the rules the game plays by** (`src/presentation/character-sheet.ts`):
    - each quality as it stands, its modifier in a fight (Orsino's rounding) and in a check (rounded down), and what
      rests on it;
    - what they strike with and what a blow does;
    - what they need to land one on someone unarmoured, and what a common foe needs to land one on them;
    - their saves, by the quality each rests on;
    - their skills and where each comes from;
    - their techniques in full, never in a tooltip.
  - **A development is a skill or a point.** Each level gained gives one development (`advances.qualities`, now
    counted so): a point of a quality, or a skill the calling teaches (`learns` in the classes catalog, new). A skill
    taken up counts as trained in every check that rests on it, and opens what it is for (`learn_skill` beside
    `raise_quality` in `data/rules/care.kyr`).
  - **Each option shows what it would change**, found by doing it to a copy and comparing: "Strength 12 → 13: To
    land a blow 9 → 8"; "Persuasion: a check +0 → +2". When the modifier will not move yet, it says so. Each option
    is taken there and then, by the engine's own command; the page stays open to show what changed.
  - Tests: `test/advancement.test.ts` (a skill taught, taken, and trained; offered from the company after a night
    under a roof).

- **A. The page, in production.** The walled field, the portrait grid, the cream paper and the dark theme are gone.
  - **A place is a page to read:** a running head, the place's name, its telling, and who is about, each person
    named in the telling and spoken to from there.
  - **Under the telling, a line each:** danger first (anyone the company reckons a fight with, every way of meeting
    them shown at once), then people, animals, things to look at, and whoever is with you. Then the ways about the
    place in a line, and the roads out as routes (by what way, how long, been).
  - **The conversation is the painted page kept, on white,** and in type when no painting fits.
  - **An object is set large;** words that differ in one part are said once ("Press the word … on the casket").
  - **A fight is the two sides on white,** with each fighter's state in words and numbers. Red is kept for harm.
  - **The one dark page is a death.**

  Played at 1280 and 390 px; the browser specs and the long descents pass.

## Found, not yet done

- **The return is not acknowledged.** Back in Machatdûm after Merrowdale, the innkeeper who sent the company
  greets it as anyone. The notice and the talk of forty crowns go on as if nothing had happened.
- **A journey says it sets out on every leg:** "You set out from X in the middle of the afternoon, and the rain sets
  out with you" on four legs running. Climbing down a shaft is told as a walk in the rain. "The road follows the
  river a while…" and "Partway, the road goes down to the water…" came on two legs of one journey.
- **A road page offers no "Set out for",** so a journey stopped on the road cannot be taken up again from there.
- From the plays:
  - the Mower's danger line says "Automaton", which gives away what the dale must discover;
  - Hild's lore read the Mower's breastplate, but nothing says it was her learning that did;
  - a thing page shows the last exchange even when it was about someone else;
  - the gauge shaft, once climbable, is listed among the roads out;
  - "The company is weary" for a company of one;
  - "You go out of Merrow" from the Hall yard to the green;
  - "Aldous Venn sees what you have taken" while he is in his study;
  - the map draws the south road hanging from the Drowned Ox;
  - state names as notes ("worn", "hung") and "Examine — Look closely".

- **A level-1 warrior knows all ten of its calling's techniques,** so a technique cannot be what a level adds
  without rebalancing every fight. The first stage is skills and qualities; techniques stay the calling's features.

- The road across a march is told from the far country's terrain list, not the land it crosses.

## Deliberately left

(none yet)
