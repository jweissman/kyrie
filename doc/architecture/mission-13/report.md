# Mission 13: report

The brief: "Kyrie remains a poor experience to play." Keep Mission 12's sound foundations; stop turning aims into
checklists; build an experience around what the player is doing, on a general architecture; prove it by playing.

Commits: `eb55874` (paintings) → `416805c` (the stage reader) → `d447566` (foundings) → `f3cbd04` (roads, saves) →
`4e3b742` (Begin) → `7efb086` (Orsino) → `a263b42` (authorability) → `04d8606` (world audit) → `598686e` (lines that
fit) → `56ee4ad` (three playthroughs and their fixes). The suite: 525 tests, 512 pass, 0 fail, 13 skipped: the
browser suites, which pass when run with `KYRIE_BROWSER=1` (7 of 7), and the Orsino regeneration check, which needs
a pinned Orsino checkout.

The reports: [playthroughs](playthroughs.md) · [settlements and wild country](world.md) ·
[narrative](narrative.md) · [Orsino closure](orsino.md) · [authorability](authorability.md) ·
[performance and persistence](performance.md) · [diagnosis](diagnosis.md) · [plan](plan.md). Screenshots:
[`doc/design/mission-13`](../../design/mission-13).

## What was wrong

From the [diagnosis](diagnosis.md), played fresh before any work: one invariant page for every activity (a place's
whole description reprinted under every line of speech, a right-hand control panel of links and thumbnails); every
settlement the same five rooms; roads as rooms; conversation not known to the world; paintings chosen by a word and
wrong as often as right. The causes were in every layer, not in the styling.

## Art direction

Five directions were built as static pages from the same moment (a green, four people, a dog, the ways out) and
compared at 1440 and 390 ([prototypes](../../design/mission-13/prototypes)):

| | Direction | Verdict |
|---|---|---|
| a | A broadsheet: text column and a side column for ways and map | The two-column split the brief ruled out, again |
| b | Lamp-lit: dark ground, everything on one long page | Handsome at night; by day a list again under the people |
| c | A white page with a rail and a compass of ways | Clever and cold; round thumbnails made people a census |
| d | An open page with the ways at the screen's edges | Right idea (ways where they lie); nothing held the place together |
| **e** | **A walled field: the place is a framed field, its ways go out through its walls on the side they lie** | **Chosen**, then drawn for talk, thing, road and fight |

The system (`web/reader/stage.css`): geometric type for names and structure (Jost), a text face for prose
(Newsreader), black and white with colour only where it means something: the accent for what just happened and for
the way you came, red for danger and for a choice that risks something, the bands of country on a road. The ground is
lit as the company is: paper by day, warm indoors, ink at dusk and night, near-black underground and in a fight
(`data-light`). No permanent top bar; no fixed split; sheets (map, notes, pack, story) are pages of their own.

## The reader: a stage for what the player is doing

`web/reader/stage/*`. Attention (a place, a person, a thing) is reader state; the engine says whether it holds.

| Mode | What the page is | Built from |
|---|---|---|
| **Place** | The walled field: the place's name, what it is, what just happened, its people as paintings with what they are doing, what might be looked at, and along its foot the animals, your company and yourself. Ways out through the walls on their side (`Bearings`); a way with tries (a trap, a riddle) lists them under it, with why one cannot be done. On a phone the walls fall away and the ways are a list by side. | `place-stage.tsx`, `src/ui/bearings.ts`, `src/ui/scene.ts` |
| **Talk** | Their painting, large, credited as far as the painting itself says ("Painter unrecorded" otherwise); the conversation from what they were doing when you came over, numbered replies, what was asked marked; a trader's counter; leaving returns to the place. | `talk-stage.tsx`, `web/reader/conversation.ts`, `talk_to`/`take_leave` in `people.kyr` |
| **Thing** | The thing large, what is seen of it, what came of the last thing done to it; its own uses first, then taking, looking, handling, and going through it anyway last, in red. | `thing-stage.tsx`, `src/ui/attention.ts` |
| **Road** | A line across the country from where you left to where you are going, in bands of the land it crosses, you on it, branches off it, who is by the road, the two ways on at its foot. Not a room. | `road-stage.tsx`, `src/ui/route.ts` |
| **Fight** | The two sides with their state, what just happened between them in the middle, the acting member's moves as cards with their odds, the fight so far folded away. | `fight-stage.tsx`, `src/ui/combat-telling.ts` |

## Architecture: what is general

- **The world knows a conversation** (`talk_to`, `take_leave` in `people.kyr`), and the voice tables choose what is
  said by bond, manner, hour and memory. The bond is read from relations an author states (kin, expects, inDebtTo,
  grateful, homeOf); who someone is outranks their manner; repetition falls back to the line said longest ago.
- **Settlements from foundings** (`src/world/founding.ts`): a table of reasons, each giving a heart, keeping, holy
  place, selling, a sight from the road, preferred work; every story's role survives every founding.
- **People on the roads** (`src/world/region-traffic.ts`): rounds, news, trouble, tracks, renown, as region rules.
- **What is perceived settles within an action** (`src/campaign/perceptions.ts`): seeing teaches; what is taught may
  show more, and is seen in the same moment.
- **Saves are what changed** (`web/engine/kept-game.ts`): the world kept once by content; each save the state and an
  order-exact delta.
- **A world that audits itself** (`src/world/world-audit.ts`): every story findable and finishable, read off the
  world, for any author's modules.
- **One credit rule** (`src/paintings/credits.ts`): a painting is credited only from what its file says, trimmed to
  painter, title and date; anything that is not a credit is dropped, never guessed.

## Frank assessment

**What is better.** The page now changes with what you are doing, and each mode reads at a glance at every width.
Places differ by why they exist. The first errand of each origin can be followed from what the page says, and the
three played here could be finished: the letter to the copied tablets, the missing father to the knife in your
mother's hands, the debt paid from a den laid to rest. What people say fits who you are to them. A great many small
untruths (a stoat in winter white in Haysel, a round tower that is square, "There is visions") were found by playing
and fixed where they are made, with tests that hold the most important of them.

**What is not good enough.**

- *People are thin.* Most have two or three things to say; nobody argues, jokes back or changes their mind. The
  mother, at the centre of the best story here, has one line before the news and one after. This is now the largest
  gap between Kyrie and a game someone would choose to keep playing.
- *Wandering is quiet.* Wild country has signs, dens, wonders and weather, but almost nobody: few chance meetings off
  the road, nothing that follows you, little that changes because you passed.
- *The first minute is still plain.* The protagonist page is a form; the first place is good, but nothing pulls the
  player in before they press Go.
- *Some systems still show their gears*: "Listen at the letters round the door", "Torchlit" in a fight's status line,
  a door's second lock found only by trying it.
- *Begin is 2.3–2.9 s.* Better than 3.9 s, and a little worse warm than a week ago, because there is more to read.
- *I am not a new player.* Three playthroughs by the developer are not a test with people (see below).

## Would a new player willingly continue after fifteen minutes?

**Some would, and the game now earns it in the right places; many still would not.** In fifteen minutes a player
gets a clear arrival, a person who greets them as who they are, an errand with a way to follow, a road that looks
like a road, and, in two of the three worlds played, a moment that lands (the dog's coat stiff with ditch-mud; the
rites said over Fen Howe and the cold going out of it). A player who likes reading and finding things out would go
on. A player who wants other people to *respond*, or who wants something to happen to them on the way rather than
because they went looking, would likely stop around the quarter hour, because the people run out of things to say
and the country does not come to meet them. This answer is my judgement from playing, not a measurement: **no
independent human tester played it**, and the next step that would most change the answer is to put it in front of
three people who have never seen it and watch them, before writing more systems.

## What next

1. Conversation with depth: people who answer what you have done and who you have with you, and who have more to
   say as a story moves; the mother, the creditor, the priest first.
2. Chance meetings in wild country (a hermit, a charcoal-burner, someone lost), drawn from the same causal ecology.
3. The first minute: a protagonist page that is part of the story, and a first place that asks something of you.
4. Parsed modules cached by content (most of a cold Begin).
5. Real players, watched.
