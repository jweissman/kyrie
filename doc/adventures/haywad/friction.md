# The Still Hours: friction

Adventure id `haywad` (the module), branch `adventure/standing-wood`. Files: `data/adventures/haywad/`, `data/campaigns/haywad.campaign.json`, `test/haywad.test.ts`, `test/fixtures/haywad/journey.json`, `doc/adventures/haywad/story.md`.

## Creative intent

Wonder, as the corpus is thinnest there (`bin/kyrie suggest adventure`: 0 of 41), without a whale (Over Exall has one) and without a ledger. Every thirty-one years a forest gets up and walks through a village. It goes round whatever stands still and through whatever moves. The verb of the adventure is **standing still**: the opposite of go, ask, carry. The harm in it is something people do to themselves for love. Edda stood in her door while her husband walked away into the wood, and has called it grief for thirty-one years. Tibyl, the child the wood left in her place, means to go after him.

New to the corpus: a night of holding rather than investigating; a deaf lampwright whose lamps "are for your hands"; a rule of the world (the wood does not tread what walks *with* it) that is a discovery which changes what can be done; a boy saved by a word taught at noon; two women at opposite ends of one street, each waiting for the other to speak; the company standing someone else's door so that she can leave it.

## What works

- The vigil. `Hold still in the doorway` is three beats of six watches. The check is `stealth` against a difficulty of the module's own (`toBeat(stillness)`), which a lamp bought from Rogot and Edda's breath each ease by a step. The lamp does nothing for the wood; it does something for the stander. The mechanics say what Rogot says.
- Preparation pays at night without a flag the player is told of. A boy taught "Stand" at noon freezes at ten at night wherever the company is. A company that did not teach him, and is at the bakehouse, can go out among the trees.
- Edda's departure is the company's act (`Tell Edda to go`), after it has shown it can hold the first beat of her door.
- The Leaner (a wonder with a Change and a Try) arrives and waits, and the Tibyl question is a question put to the company with answers that depend on what it knows.
- Five endings from four independent facts (Tibyl stays or goes; Edda stays, arrives in time or arrives late), plus a dawn coda in the doors themselves (stood, scarred, lost), Dunn Fender's bell in the Bare (a search that pays Sorel), and Orrin's seedling carried home to Edda.

## Tested (11 specs, all pass)

lint; arrival; nothing done (carried, bakehouse lost, Pipet hurt); Both (Edda freed, walk east, Orrin told to Tibyl); Held (Edda's word relayed; Mere; seedling planted); Pipet taught; Pipet fetched by hand; a flinch hurts; Edda late; the bell; the Way-fund pays. `bin/kyrie verify haywad`: compiled clean, 11 tests, reach topics 35/45, acts 3/4, rooms 10/12. What reach leaves unanswered is the Mere scenes, the lost and scarred doors, the Orrin topics and four of five endings: tests cover Held, Both, Late and Carried; **Longway (Tibyl stays and Edda arrives) has no journey**.

Passing is not the same as satisfying. No human has played it. I read the prose of every beat aloud, but I did not play the whole night as a player in the page. `bin/kyrie preview` served the page (HTTP 200); I did **not** look at it in a browser, so none of its painting, foreground or colours is checked.

## Incomplete or weak

- **Wait-heavy middle.** From dusk to the Walk a company can only Wait. `=day 1 21:00` in a test is an honest player's "Wait until dark" and one more wait. A player who arrives at 9 am has twelve idle hours unless they talk. Intended, but a sparse afternoon.
- **The Hollow stands by itself.** Tibyl holds it by default (3 resident beats), so the company's beats there only earn crowns. It is the quietest of the three doors; its drama is the Heart, not the holding.
- **One flinch is one bough.** A failed beat does 1d6 and a flinch count; it does not scar the door beyond the count. A door a company flinches at twice and holds once is "scarred", which is right, but the text does not say who flinched.
- **Mere scenes are short.** Orrin has six topics; the reunion rule fires only for Both. Edda late and Tibyl alone never meet him again in play.
- **Ending is a clock.** All endings fire at day 2, 18:00. A company that goes to the Mere may or may not still be there. An act of the player's ("Go home"), not a clock, would be better.
- **Descriptions overlap.** The Leaner is told by a chapter, a sign, a wonder and a state in the same step. I cut one; more could go.
- **Repeated images** (`like water round a woman wading the same way`; `near side of the wood`) are leitmotif, partly; `voice repeats` lists them. Two failure texts were varied; the leitmotif stays on purpose.
- **First name Orrin** is also given by Orrin Gadd (book-of-faces) and Orrin Day (parliament-of-books): advisory only. A rename would be kind.

## Authoring difficulties

1. **A long activity is a false friend.** `Interrupted when …` defers the action's effects to its end, and any telling rule heard during it counts it **failed**, so On failure ran (the bough struck) when Edda's departure was merely told mid-hold. I removed `Interrupted` and kept holds short (six watches), and scheduled crises to fall between them. Wanted: a distinct `On interrupted` (or interruption that does not select On failure).
2. **Result is told after the changes of an immediate action**, but before them for a deferred one. A `Result … when held == 0` is off by one between the two. Wanted: Result conditions evaluated on the state before the act, or the guide stating which.
3. **`Topic … when addressed(x, actor)`** (a question someone puts to the company) lints as "action has no possible target" and "unbound" for me even as written in the guide, and I could not find the cause; I used a plain `Ask Tibyl what she means to do` and a `tibylAsked` fact. Wanted: the guide example as a test that fails if it lints.
4. **A Wonder cannot be `nowhere`.** The Leaner comes at 1 am; I placed it `hidden until heart_seen` and taught the discovery from an Observe. Works; clumsy.
5. **`teaches` and `as sign` go in different places** in an Observe than a reader expects (`as sign when …`, text, then `teaches`); two compile failures.
6. **Moving the company from a rule or act** is `Retract at(actor, a). Assert at(actor, b).` Good; but a Grave on an act that moves the company within a settlement is a nicety I wanted, not a requirement.
7. **Deem.** I could not use Deem inside a module. Tables are for generators. Two things I wanted were Deem's: what the wood carries past each doorway (so a second walk does not read as the first), and the baby's name. Wanted: a module-level `Table` drawn by seed and keyed by stable identity, with a way to say what was drawn in the journal. Variation here is by site and beat only; three doors, three beats, nine fixed passages.
8. **Time.** The shared world's clock is 0 at 8 am of the first morning after arrival, so the Walk is "day 1, 21:00" only for that company. A company that reaches Haywad after dark with the Rising already past finds the Bare, and the endings still come (carried, if nothing was done). Not play-tested.

## Integration: what is needed and not done

I did **not** touch `data/adventures/countries.json` (a global registry). To place Haywad as a province of a generated world, a maintainer must add an entry like:

```json
{ "id": "haywad", "province": true, "bundle": "haywad/placed.json", "entry": "road", "marker": "stile",
  "side": "south", "beside": ["forest", "hills", "marsh"], "name": "Haywad on the Sellow", "terrain": "forest",
  "topic": "Haywad, where the Sellow Wood walks through on the night of the Rising",
  "rumour": "'Down the south road there is Haywad,' says {keeper}, 'on the edge of the Sellow Wood. It gets up every thirty-one years and walks through the village. They are hiring anyone who can stand still.'",
  "heard": "South of here lies Haywad, which the Sellow Wood walks through once in thirty-one years, going round whatever stands still." }
```

The marker `stile` must be an entity no other country has; I have not checked that against the frontier. `placed.json` is written and loads (lint is clean on the standalone campaign; the placed bundle itself I have not walked). `web/bundles.generated.json` was rewritten by `preview` and not committed.

## Proposed Kyr / Deem improvements

- `On interrupted { … }` in an action, and interruption must not select On failure.
- A way to say "Result reads the state before this act".
- A wait-until-the-wood-comes act whose own words are authored (`Wait until nine`), so a day of waiting is not a row of "An hour passes" and a repeated room.
- Module-level `Table` with seeded draws (the Deem workbench for a module), for passings that vary by play.
- A `Vigil` form: a held posture with beats, a difficulty, and an outcome per door, since I wrote one by hand from a measure, three rules and an action.
- `Ending … when` with an anchor, so five tellings are not "heard everywhere".
