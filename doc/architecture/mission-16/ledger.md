# Mission 16 ledger

The running record of Mission 16: what is done and verified, what was found and is not yet done, and what is
deliberately left. Newest entries first in each part. The plan and its decisions are in [plan.md](plan.md), and the
mission's closing account is the [report](report.md).

## Gates

| Gate | Stands |
|---|---|
| A. A transformed, trustworthy interface | in production: the place, road, conversation, object and fight pages on one white page; the Character view from the start, with development and its previews; played by keys alone at 1440 and 900, and without images |
| B. The way into adventure | in production for every world Begin draws: Merrowdale's notice and rumour in every first-country town, its road known, one journey there; a newcomer who sees only the page finds the lead in every one of eight worlds |
| C. A complete RPG expedition | in production: The Long Man played from Begin in two drawn worlds (Lonelymoor, Coldwaste) to its peaceful end, with withdrawal, return and a reload midway; its findings repaired; in a third (Bushweald), on through the storm to the morning after |
| D. Becoming and continuing | in production: seen through for 1,000 experience, level 2 after a night under a roof, a development chosen in the Character view by what it opens; the return acknowledged in the country below; the Story whole across reloads; Saltgrave entered from the same world; the deep rivals' brothers heard of, asked after and traced, own history kept apart from reports and traces |
| E. Independent acceptance and accounting | the reconciliation ([reconciliation.md](reconciliation.md)), eight branches pruned, and free play at 1440 and 900 by keys alone and without images. No independent player or reviewer has played this build |

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

- **A, C, E. Free play at 1440 and 900, by keys alone, and without images.** Bushweald, drawn by Begin: a human
  cleric carrying feverwort for a sick child, from the title page to the morning after Merrowdale's storm. Nothing
  but the keys, past the first screens at 1440 and the rest at 900; part of it with every image refused.
  - The lead was in the second page's telling, and the march-stone offered 3½ minutes after Begin.
  - A detour to the ruins of Liliumlapis, then six legs and a night's camp to Merrowdale.
  - The Long Man by its bronze. It was moved at nightfall to a barrel in the cellar, and the cart's gouged bed said
    so. Then the storm, and the morning after: "The beck runs brown but low between its banks".
  - Level 2 at a night under a roof, set as a moment.

  Repaired from it:
  - A conversation without images was a black slab with a broken picture and its painter's credit. It is in type.
  - A journey's legs named a way by its raw name ("By the track to {region__w13}").
  - In conversation an act was said twice ("Give healing herbs to Erevan" over "Aldith gives healing herbs to
    Erevan"); so was a taking, in two verbs ("You collect the rod for Aldith" over "Aldith takes").
  - Something seen through, or a level gained, was a plain line in a conversation. It is set apart there too.
  - The dale counted its days from the hour its country was reached, so the storm's end, "The rain stops before
    dawn", came at nine in the evening. A country reached partway through a day counts from the morning after.
  - The Ox talked of the low field going under the evening after the leak was shut. It talks of the springs running
    clear.
  - The Notes asked the company to tell Garth and Odile that a brood was quiet, though it had never heard of either.
    What a company is asked to see to is what it has heard of or met.
  - A cleric of the death domain prayed curses and drains under the calling's "Prayers that heal". The Character view
    names a specialist's domain or school, and a spell above any slot the member has says "not yet".
  - A thing's page told what a close look found twice, in the thing's telling and as what came of looking. It is
    told once, as part of the thing.

  Tests: `test/placed-days.test.ts`, `test/talk-lines.test.ts`, `test/the-long-man.test.ts`,
  `test/advancement.test.ts`, `test/travel.test.ts`.

- **B. A newcomer who sees only the page.** The way in was played across worlds by a policy that knows nothing of the
  game: set out for any place newly offered to set out for, and again when a journey is stopped; else read what can
  be read; else ask the first question not yet asked; else go somewhere not yet been, in the page's order. It names
  no place, person or adventure.

  | World | Origin | Commands to the lead | To the march-stone |
  |---|---|---|---|
  | wren | wanderer | 12 | 13 |
  | a1 | kin | 12 | 13 |
  | b2 | wanderer | 12 | 15 (stopped once by danger, set out again) |
  | thorn | order | 13 | 14 |
  | cov11 | kin | 17 | 18 |
  | f1 | debt | 16 | 17 |
  | mere | kin | 15 | 16 |
  | e5 | debt | 15 | 16 |

  In every world the lead was the notice where travellers are kept. The policy reads it on entering, before asking
  anyone anything. Two worlds are kept as a test (`test/newcomer.test.ts`).

- **C, D. Found in the free plays, and repaired.**
  - **The father under the cart.** Coming home, the protagonist found "a man under it, a day or more dead", in the
    words a stranger finds him in. To the drover's child that is now followed by "It is your father. You know the
    coat first, and the hands, before you will let yourself know the face."
  - **The brother kneeling.** His kneeling was filed under what the company knew ("Kildrak knelt by the cart"), and
    the scene itself had never been shown: an observation that teaches what turns it off was visible only while the
    command was settling. What a command taught is now read from the command itself. A fact an author keeps with no
    words is a mark, not knowledge: it is never listed or noted. Test: `test/origins.test.ts`.
  - **A bridge is crossed as a bridge.** The land along a way was told from its cells alone, so a road over the
    river by its bridge was waded "with your boots full". A river leg is told now by the bridge, ford or ferry the
    road comes to, and by neither where it comes to none. Test: `test/travel.test.ts`.
  - **A level gained is a moment.** It was one more line after a night's rest. It is set apart now, lighter than a
    chapter's end: who, and the level, what it gave, and the development it brings to be spent. Test:
    `test/told-moments.test.ts`.

- **E. The accounting.** Every obligation the mission inherited is in one table with its state
  ([reconciliation.md](reconciliation.md)): Mission 15's next steps, the audit, both architecture reviews and the
  readiness memorandum, the cold playtest, and Low Water's friction list.
  - Eight branches are pruned, each once nothing on it was missing from main: two merged as commits, five that main
    carries further (checked file by file), and a second name for a review's commit. Each head is kept in this
    clone under `refs/archive/`. The three review branches stay, since their findings are not all addressed. So does
    `adventure/tessary`, a new adventure that arrived during the mission.
  - Found while checking the cold playtest's list: a company under its own Light spell was told "Nothing lit". The
    light line now counts a conjured light, with the time it has left (`test/darkness.test.ts`).
  - The wren record still plays through, all 334 commands. At `3491ecd` it ends at canonical `91802e0a2936462`,
    facts `b647c301c89a6c46`, told `a79d41d377479b5`. These are the new baseline for the inner loop's
    equivalence checks; Mission 15's hashes stand for the game before this mission changed what happens and is told.

- **D. The brothers' expedition, the offstage diagnostic.** The deep site's rivals (the brothers who go up after
  the prize, a level every two days) were all there in the world, but out of the player's sight. The cold playtest
  heard of their going, found no sign of them, heard nothing from their prior, and its Notes filed the talk as "seen
  for yourself". Now:
  - the talk of their going, and later of their fate, is heard where it was talked (Notes: heard), not seen: a new
    observation aspect, `hearsay`, files what it teaches as told there;
  - while they are below, their head says where they have gone, in each power's voice ("If you go after them you
    will find their cross on the walls, at every turning");
  - their mark is on each level from the stage they go down it, so a company that follows the same day finds it.
  - Own history (seen), reports (heard) and traces (their marks, and what they left where they fell) are three things
    the Notes and the page keep apart.

  Test: `test/deep-rivals.test.ts`.

- **C. No empty answers in the principal expedition.** Thirteen of The Long Man's things offered a try with nothing
  written for it: about thirty-five answers of "Nothing comes of it.", in the expedition the brief singles out. Each
  now answers a close look in the adventure's own words: texture, and fair clues where the design has them (the
  barrel's staves smeared bronze-green, the wheel's socket "made for something that is not here", the grate's mud
  walked through in boots). Elsewhere, a try that finds nothing says so in the words of the try ("There is nothing
  to hear from it"; "It does not shift, either way").

  A heading of tries with one try under it is shown as that try ("Look closely", not "Examine — Look closely"). Its
  label stays as it is, since four adventures' journeys name it.

- **C. A fight told truly** (the cold playtest's finding 3, met again in free play: Sefa and Kildrak, Sefa's brother, against a
  toll sergeant).
  - The ending names everyone who fell, the one the player made first, and counts both sides ("one against two"),
    no longer "one against one" whenever there was one foe.
  - A company that runs from a fight it chose goes back the way it came, as one that runs from an ambush does.
    Before, it stayed where it stood, and what it ran from fell on it again in the same command ("The Wet comes down
    the gallery at you", then a second fight).
  - A danger reckoned in the uneven middle (could be lost, or likely won) is played six more times before it is said:
    free play heard "you would likely beat them" of a fight the company wins less than half the time.
  - Tried and left: shortening Sweeping Strike's knockdown (three rounds to one, with a recharge), because the
    sergeant kept the brother on the ground. Two hundred simulated fights of that toll fight showed it made things
    worse for the company (45% of fights won → 26%) and twice as long (13 rounds → 29): a company's own warrior keeps
    a lone foe down at least as often. Reverted, and recorded here.

  Tests: `test/engagement.test.ts`, `test/obituary.test.ts`.

- **E. A game kept in the browser is kept whole, and says when it cannot be** (the architecture review of 26 October,
  N1 and N2).
  - The state and the world are each written to the slot not in use, and the summary that names the slots is
    written last. So a write the browser's quota refuses part-way leaves the game as it was last kept.
  - The summary's world key no longer shares a name with the world's text.
  - A game that cannot be kept is said so on the page, with a save to download.
  - Every kept game carries the stamp of the build that kept it: a hash of the built engine, code and data together.
    Only one kept by this very build is trusted unchecked; any other is checked as it is opened, and if it cannot be,
    the player is told why in words.
  - A game kept before slots opens and moves into them on its next keeping.
  - Played: Sefa's game, kept by the build before, continued under the new one.

  Test: `test/reader-store.test.ts`, with the review's probe as a quota fake.

- **D. Low Water integrated.** The branch `adventure/low-water`, marked complete by its author, is merged whole: 23
  files of Kyr, its standalone campaign and its 36 journeys. Its two shared changes are taken:
  - underground ways are told without the sky, which also mends "climbing down a shaft told as a walk in the rain";
  - state names are shown as words.

  Two integration decisions:
  - The Bowl of Ammerlin is one of the independent adventures, so a world holds it when its seed chooses it.
  - The country below tells of it in its own terms: a city whose Mere is falling, wanting someone from outside to
    measure it.

  Two specs pinned a seed that now draws another independent and were moved to seeds that hold their country (`mere`
  for the Bowl, `f1` for Thrume). The journeys' two long describe blocks were split to the tests' function-length
  limit, unchanged otherwise. Its friction list (27 entries) is part of the reconciliation.

- **D. A world that remembers the company coming back.** Merrowdale, seen through, marks what the country below says
  of it old news: the country imports the first region's rumour of it (optional, so a world kept from before goes on
  without). The country below then says so.
  - Where the notice hangs, the talk is of the word down the north road.
  - The forty crowns are no longer asked about.
  - Whoever keeps travellers can be told "you have been to Merrowdale", and answers with what the road brought down
    first ("There was word of it already… Nobody said who"), which keeps the report apart from the company's own
    part. Then the notice goes on the fire.

  The same plays repaired the telling of the way there and back:
  - A journey sets out once, not on every leg, and does not tell the same land twice over.
  - A walk inside one town does not "go out of" it.
  - A road page offers "Set out for", so a journey stopped on the road can be taken up there.
  - One traveller is weary as "you", not "the company".

  And the pages:
  - A thing's page tells what came of the last act only when it was done to that thing, from there.
  - A creature its author gave a role is said by it (the Mower's danger line said "Automaton", what the dale has to
    find out).
  - What was found only by a skill says whose it was ("It is Hild's lore that makes it out").
  - Word of a theft reaches someone who was not there, rather than their seeing it.
  - Lines said of many agree with them ("say the elders").
  - The keys' first arrow shows where they are rather than passing over the first choice, and Enter does nothing
    unseen.
  - Turning to someone opens their page at the top, so a phone shows the face, not the coat.

  Tests: `test/return.test.ts`, `test/travel.test.ts`, `test/voice.test.ts`.

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

From the free plays, in the order met:
- the road across a march is told from the far country's terrain list, not the land it crosses (fen in a frost
  country);
- a technique is said in the rules' shorthand ("Charge: End on yourself; 3d8 + 1 + 1"), under names a player would
  not use ("Vigor Up"; "Sets Spear" for a swordsman);
- state names stand as notes under a thing ("worn", "hung", "in the hook");
- a topic once asked is gone, and a notice once read leaves the things to look at;
- the map draws the south road hanging from the Drowned Ox;
- the wet gallery says it is dark before the torch gutters out;
- ways are sorted by how long they take, not by whether they leave the place, so the gauge shaft, once climbable,
  and the Hall lane inside Merrow are listed among the roads out;
- two places with one name are two roads out of Marirkom, alike to the letter ("To the bridge over the Karnahar"),
  and two people with one name stand in one yard (Erevan the charcoal-burner and Erevan the child's mother);
- on a phone, the map cuts its labels at the left edge;
- a wait cut short is told as done ("You wait until first light", at night, as the storm comes on);
- the feverwort is given as "healing herbs";
- the region's sky stays as it was through a placed adventure's storm (the running head said "fair");
- something heard of and since taken stays "heard, not yet seen" (the dyke-reeve's rod);
- a company without brawn or rope is told it cannot push the punt or get into the galleries, but not where either
  may be had;
- a development can be shown that cannot be taken, with no reason given ("Reading the dead", among the skills a
  cleric's calling teaches).

## Deliberately left

- **Each group of enemies is reckoned alone** (the toll sergeant "likely beat them", his deserters "beyond you"),
  as the engine fights them: one group to a fight. The reckoning plays the fight the company would have. What was
  wrong at the bridge was the reckoning's confidence, now played again when uneven.
- **"Set out for" lists the edges of the country only once told of or been to,** though the map draws the roads to
  them. An edge beyond which a country is told of is named for it ("the march-stone of Merrowdale"), so to list every
  edge from the start would tell the lead that the town is there to tell.
- **A level-1 warrior knows all ten of its calling's techniques,** so a technique cannot be what a level adds
  without rebalancing every fight. The first stage is skills and qualities, and a skill taken up opens what it is
  for; techniques stay the calling's own.
