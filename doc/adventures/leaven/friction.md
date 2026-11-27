# The Mild Intention: friction

*Author's report, 27 November 2026. Branch `adventure/leaven`; module `leaven`; campaign `data/campaigns/leaven.campaign.json`.*

## Creative intent

A crossing, not an investigation. Forty miles of dry lake bed, a land-sloop, a sourdough starter in a ham-sized crock that a city of sixty thousand cannot bake without, and four people each short of something: a pilot who has gone deaf in one ear and told nobody, a deckhand who wants her job, a baker whose guild killed its own Mother by refusing to share her, and a pirate whose people have been eating gulls for six years and who asks, first, "Is that bread?"

The shape I wanted: the player is the ear. The Pan is read by sound; Ysmay Dreel's calls come from her good side; the thin crust is on the side she cannot hear. A pilot's "quiet to port" is the worst news the Pan can give, and the clue is that nothing on the Pan is ever quiet. The pirate is a person, her price is a thing the player can give, and the best ending is one where nobody wins and everybody eats.

It is deliberately free of ledgers, ancient obligations and bureaucracy. The nearest thing to an old rule is the Corsey guild's ban on cuttings, and the story is about that rule being what killed the bread.

Nothing here repeats Cleave or Gape (gorges, silk and grass bridges, villages on two lips), Tailrace (a whale), or Windfall. It is a wide flat floor, not a gorge; the crossing is a sail, not a walk.

## What works

- **One room, one measure.** The whole crossing is played on the deck, advanced by `mile()`. Four legs (miles 0, 10, 20, 30). No rooms to model for the Pan; the landscape is Observes keyed on `mile()`. It plays as a journey and costs few lines.
- **A Deem roll that matters.** Each leg's thin crust is `(1d3)`, rolled at install (`thin1`, `thin2`, `thin3`). Seed `journey` draws 1, 3, 2; `c` draws 1, 3, 1; `k` draws 3, 1, 1. A different world is a different Pan, and the `Ysmay says quiet` clue is only true on side 1. Tests choose seeds for it by name.
- **The ear has four ways in.** Rabin, Gert Undery, Holin Odiot, and the Pan's own song teach `ear_known`. Ysmay can be told gently (it works, because the player has grounds) or bluntly (a hard check that closes her up). Each of these has a test.
- **The Weatherwife can be fought, paid or fed.** The cutting needs Avert's consent (Avert gives it unrolled to a player who knows what Corsey did and what Holin's people eat; a hard persuasion otherwise) and Holin's (she will not take charity; she takes a thief's bread, or a gift she may give back). That is two gates, and each is a conversation, not a lock.
- **Consequence goes past the ending.** If the Mother dies and a cutting went to the reavers, the Corsey bakers bake from the pirates' pot: `The Thief's Pot`. A company that gave nothing and lost the Mother gets `Flat Cakes`.
- **Wonder with a use.** The singing at mile 20. A stoked stove makes the Mother rise to it; humming it back wakes her, and lets Ysmay hear the deck with her bad ear.

## Strongest playable moments

1. Lying on the planks and hearing the thin crust where Ysmay said there was nothing.
2. "Is that bread?"
3. Avert on the Corsey guild: the Mother died of being kept. Then the baker's boy who stole the cutting, burned in effigy for two centuries, "the reason I am here."
4. The Weatherwife sitting at Ysmay's left elbow: "You are sitting in my wind." "Yes."

## What is incomplete, or not yet satisfying

- **Nobody has played this but me.** Tests and exploration pass; that is not play. Human play: none recorded.
- **Not looked at in a browser.** `bin/kyrie preview` built and served (HTTP 200); this machine has no Chromium binary, so no contact sheet at 1280 or 390 was made, and the page was not judged by eye. The conversation page, a long deck description at every Observe, and the many topics on one deck are the thing I would look at first.
- **The first leg is a gamble for the player who does not listen.** One leg in three is thin to port; a player who never lies on the planks, and sails "as Ysmay calls it", holes the hull a third of the time per leg, with no warning. That is by design (a warning can be read: the topic "Ask Ysmay what she hears" is the warning), but it may feel arbitrary to a first-time player. The label of the safe and unsafe actions is identical on purpose, which is also the thing that might feel unfair.
- **The fight is lethal for a lone novice.** Holin's hand is one level-1 warrior, and a solo level-1 Tester loses it on some seeds, and wins on others (journey: win; a, b: not). The action's label does not say the fight is dangerous. No odds are shown for `Bring`-started fights.
- **Reavers are the only combat.** The brief names a gauntlet as the form the collection lacks; this is a crossing with a single optional fight and no gauntlet.
- **The landing is never walked.** I cut the Corsey landing room and plank: the ending fires the moment the sloop arrives, so the room was stranded. A last scene on the quay would be good; the fate rules tell it instead.
- **Time is deterministic around the song.** The furl always happens at mile 20, whatever the hour; if a player dawdles, the song is sung in daylight. The hour is not read. The Mother's hunger thresholds (96, 150, 230 watches) were tuned only by arithmetic against a ~190-watch crossing, not by play.
- **Ysmay's blunt route can strand a player.** If the blunt persuasion fails (`ysmayCold`), the only way to bring her round is Holin's `Ask Holin to be Ysmay's left ear`, which needs a cutting given first. A player who fails the check, has no Holin, and keeps listening still has the "yours" path blocked; they may sail as called (a third of legs bad). Not a softlock, but a hard road.
- **Rabin has no arc of his own.** He is the ear's first teller and has a closing fate; he cannot be the second ear. That was the substantial refinement I did not make.
- **Deck-heavy.** Seven people, one room. The Dry Mooring and Hawin Selve hold only a wager and two topics. The first-hour ratchets (composition by contrast) suggest the quay is thin; it is, but not mundane enough to make the sloop's crew stand out.
- **The fates rely on `fateTold(entity)`, an entity of the module.** I used `deck`, `stove`, `mother` as bookkeeping; they are not what the fact is about.

## Authoring difficulties

- **`fateTold(entity)` wants a module entity.** A fresh word `landing` failed. I borrowed existing entities. A free-standing `Relation done(flag)` would read better.
- **A Wonder needs a place.** `Wonder song … nowhere` is refused, and a Wonder's text is shown whenever its thing is visible, so I could not hold the song's wonder back until the singing. I rewrote its text so it foreshadows at the quay instead of describing the singing.
- **Kyr cannot branch inside an action.** The good and bad outcomes of each leg had to be two actions with identical labels and exclusive `Requires` (`wrongNow()` / `not wrongNow()`). It works, and it is the right shape for a hidden hazard, but the legs are 3 legs × 3 actions of authored text.
- **Journey tests need a seed to be an author's choice.** The Deem roll cannot be set from the test, so I picked seeds by their draws and documented them. A `j.set('thin1', 1)` for fixtures would be better than a seed search.
- **A rule cannot teach by `Assert knows(...)`; it must say `teaches`.** The error was clear.
- **`dead` as a state name collides with the shared relation.** The error named the file and line. I renamed the Mother's state `spoiled`.
- **Label doubling.** A change that consumes a kind is offered "Bank the stove using a brick of peat". I had written "Bank the stove with a brick of peat" first, and the engine added its own.
- **The shared `listen` action name.** Redefining a canonical action is a lint error; I renamed mine `listen_pan`.
- **Lint "everywhere" advice on an Ending.** There is no way to anchor an Ending, so five `advice everywhere` lines remain.
- **No way to say "this Role is an article-less phrase" except by trying.** `Role "pilot of the Mild Intention"` became "a pilot of the Mild Intention" on the page; "who pilots the Mild Intention" reads better. Learned by running it.

## Proposed Kyr / Deem improvements

1. A fixture-setting call for Deem draws (`Journey.set('thin1', 1)`), so a test names the world it wants.
2. A free `Relation`-less `fateTold`: a plain flag with no entity.
3. `Wonder` on a thing that is `nowhere` until it holds, or a `when` on the wonder.
4. Branching in an action's result (`If … Result …`) for hidden hazards, to avoid pairs of actions with the same label.
5. A way to show the odds of a fight begun by `Bring`.
6. An `Ending` anchor, so endings do not draw `advice everywhere`.
7. A vehicle or `Place` that travels, so a crossing can be a room moving past rooms. I used a measure as a stand-in; it has no map presence.

## Verification (27 November 2026)

- `bin/kyrie lint data/campaigns/leaven.campaign.json`: 0 errors, 0 warnings, 5 advice (endings are heard everywhere).
- `bun test test/leaven.test.ts`: 21 pass, 0 fail. Journeys: the kind crossing (Two Pots); the thief's pot; flat cakes; corsey rises by toll, by wager, by a won fight; into the eye; a patch between two bad legs; the ear learned three ways; gentle and blunt persuasion; Holin's pride, by thief's bread and by dice; Avert's consent, informed and uninformed; the Mother's hunger, the stove, the song.
- `bin/kyrie verify leaven`: compiles clean, no shared names, repeats: a few phrases ("a long time", "the south shore", "a long way") remain, 21 tests, reach 4/4 rooms, topics 44/48, acts 8/15; it ends by `two_pots`, and the other four endings want the journeys above.
- Browser preview: served, not looked at (no browser binary). Human play: none.
