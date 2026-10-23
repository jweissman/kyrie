# Writing what the page says

This is for whoever writes or edits Kyrie's prose: the lines a person, an animal, a road or a fight is told in. It
says where each kind of text lives, how a line is chosen for a moment, and the workflow that keeps the text right:
write, review in every person, check coverage, read in play, and test. The standards the text is held to are in
[editorial.md](../architecture/editorial.md); this is how to meet them.

## Where text lives

| Text | Where | Chosen by |
|---|---|---|
| What a place is, what is in it, how a thing looks in each state | Kyr modules: `Observe`, `State`, `Place` | The world: what is true now, perceived from here |
| What someone says when asked | Kyr modules: `Topic … Says` | The company asking |
| What happens on its own (a storm, a rider) | Kyr rules: `Rule … says "…"`, `Event` | The rule firing |
| How someone joins, parts, greets, is patted, turns, thanks, objects | `data/voice/*.json` | The happening, and who it happened to |
| A road told as it goes | `data/voice/journey.json` | The land the road crosses, the hour, the weather |
| What a fighter says at a turning point | `data/voice/combat.json` (83 lines are Orsino's) | The fighter's manner or role, and what just happened |
| Work, evenings and what a trade knows | `data/generation/scenes/occupations.json` | The generator, for each resident |
| Wonders and traps | `data/generation/scenes/wonders.json`, `snares.json` | The generator; the world when they are met |

Prose that belongs to one place or one thing is written beside it in Kyr. Prose that can be said of anyone is a
voice line, so that it can be written once and said of many.

## How a voice line is chosen

The world reports what changed. `src/narrative/happening.ts` reads those changes as happenings: someone joined,
parted, followed, greeted, was patted, turned, thanked, objected, refused. For each happening,
`src/narrative/voice-context.ts` says what is known about the moment:

| Key | What it is | Examples |
|---|---|---|
| `bond` | Who the actor is to the company | `kin`, `friend`, `hire`, `fellow`, `escort`, `stranger` |
| `manner` | The actor's manner | `cheerful`, `grim`, `proud`, `acerbic` |
| `species`, `kind` | What the actor is | `dog`, `cat`, `goat`; `person`, `animal` |
| `role` | What the actor does (Orsino's NPC barks) | `necromancer`, `bandit` |
| `side` | Whose side, in a fight | `company`, `foe` |
| `moment` | First time, or again | `first`, `again` |
| `time`, `shelter` | The hour and where | `night`, `day`; `indoors`, `outdoors` |
| `cause` | What the company did, when someone turns on it | `spell`, `attack`, `theft`, `toll` |
| `land`, `sky`, `size` | For journeys: the country, the weather, the place reached | `fen`, `rain`, `town` |

A line's `when` names the circumstances it is written for. Of the lines whose `when` all hold, the narrator uses only
those that name the most circumstances: a line for a cheerful brother beats a line for any brother, which beats a
line for anyone. Among those, `src/narrative/editor.ts` chooses one by a hash of the moment, so the same moment
always reads the same and different moments read differently. A line is never repeated within one fight.

`src/narrative/telling.ts` decides how much is told: at most three lines for one command, the most important first,
and nothing a line from the world has already said (a thank-you the world says in its own words is not said again).

## Writing a line

```json
{ "id": "join.kin.cheerful", "when": { "bond": "kin", "manner": "cheerful" },
  "text": "'I was hoping you'd ask,' says {Actor}, grinning for the first time since you came home." }
```

- `{actor}` and `{Actor}` are the name, lower or capitalised; `{target}`, `{place}`, `{from}` and `{to}` as the
  moment gives them.
- `{they}`, `{them}`, `{their}`, `{theirs}`, `{themself}` follow the actor's pronouns (he, she, they, it).
- `[are|is]` chooses by number: the first for *they*, the second for *he*, *she*, *it*.
- Write straight quotation marks; the page curls them.
- An `id` is the happening, then the circumstances, then a number: `pet.dog.first.2`.

Say one thing, from where the company stands. A dog does not "seem happy"; it "leans its whole weight against your
knee". Do not name what the company has not learned, and do not explain the game ("you can now…").

## The workflow

1. **Write** the line in `data/voice/<happening>.json`.
2. **Review it in every person.** `bin/kyrie voice review <happening>` prints each line as it reads of he, she, they
   and it, of one target and of several, and marks what reads wrong: a blank left unfilled, a word doubled, *they is*,
   a stray space, quotation marks that do not pair, a sentence with no end.
3. **Check coverage.** `bin/kyrie voice coverage` lists each happening's circumstances, and which have lines of
   their own and which fall back to a more general line. `bin/kyrie voice moments join bond=kin manner=grim`
   shows which lines one moment would choose among.
4. **Read it in play.** `bin/kyrie playtext <seed> 60 --origin kin --class mage` walks a fresh country and writes
   the page as Markdown: each thing done, what came of it, each new place. Walks from Mission 12 are in
   [doc/playtests/mission-12-text](../playtests/mission-12-text/). Read them as a player would; most faults show
   only in place (a cat in the sun at midnight, a clue told every time the dog is seen).
5. **Test.** `bun test test/voice.test.ts test/narration-audit.test.ts`. The first checks every line reads whole and
   without fault in every person. The second walks two fresh countries and checks that nothing on a page is said
   twice, that nobody absent or no animal speaks, that no id or blank shows, that no place is named before it is
   known, and that nothing done is answered with nothing.

## Fixing a fault in place

Most faults are in when a line is said, not in the line:

| Fault | Fix |
|---|---|
| Said every time the place is seen ("You have come over the hills…") | Give the observation a condition that ends: `when watch(clock) < 1`, or a fact it teaches |
| A clue told again and again ("Under your hand her coat…") | Condition it on not yet knowing what it teaches: `when … and not knows(party, dog_mud)`; add a plainer lasting line if the thing still looks so |
| Wrong for the hour (a cat in the sun at night) | Two observations, `and not dark()` and `and dark()` |
| Two of a kind told twice | The narrator tells identical lines once; better, make them differ |
| A change told in the reply and again in the description | The narrator says it once, in the reply |
