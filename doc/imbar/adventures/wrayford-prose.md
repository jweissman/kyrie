# Wrayford (The Third Night): prose quality pass

Lens: boredom and interest. Read in full: `bin/kyrie prose` of `the-third-night.campaign.json` (578 lines) and
`voice repeats` over `data/adventures/wrayford/`.

## What I found

Grave and, for the most part, specific: the tin Saint Wades, the portrait with the money-box painted out and a dove put
in, the gander tried before twelve watermen on a sheep's skull, the lantern on the hook "nobody is here to have lit".
The voices are already the most distinct in the corpus (Maudie in verbs of work, Pinch in tariffs and the unfinished
"therefore", Gidley in tears and "it costs nothing", Gault's single-word openers, Corbin in negations and tallow, Kit's
looping "I was at the chain"). The faults:

- **The long look.** "looks at you for a long time / moment" and "a long time" 36 times, "looks at you" 51: Sefton,
  Hulme, Hal, Gault, Maudie, Annis, Win, Lumley, Tull's mother all react the same way, so the scenes' emotional turns
  read as one gesture.
- **"Word goes round / Word comes ..."** opened 14 reports in the rules, always from nowhere. Reports without a
  teller are the least interesting kind of news.
- **Flat places:** the Ferry Inn, south road, Cutler's Lane were lists.
- **Authorial verdicts at the end of a beat:** "on the whole it is a better morning than the city deserved", "You go on
  a good deal less alone", "Nobody ... will ever look at you the same way" (told, not shown).
- **A running gag worn thin:** the Abbess's upside-down framed letter appeared in four places.
- **A cross-link joke repeated across adventures:** Pell's "a ship out of a cellar" duplicated Gosse's Pudding joke.
- Hal and Kit both answered "How are you" with a quoted echo ("How I am." / "How I've been.").

## Before and after

1. Hal Hulme, greeting (`hill.kyr`)
   - Before: "'How I've been.' He looks at you as if you were a word he had been trying to remember for three years. 'I've been writing my father's letters ...'"
   - After: "He does not get up. 'You've got thin,' he says ... 'I wrote to you. Three times. I didn't send them. I've been writing my father's letters instead.' A breath. 'His decrees.'"
2. Captain Sefton, the cellar verdict (`captain.kyr`)
   - Before: "She looks at you for a long time. 'You did what you did,' she says."
   - After: "She goes on peeling an apple, one long curl. 'You did what you did,' she says."
3. The reeve (`hill.kyr`)
   - Before: "He looks at you for a long time. 'You were in my house every day of your childhood,'"
   - After: "He squares the papers on the desk, edge to edge. 'You were in my house every day of your childhood,'"
4. Sergeant Gault, the letter (`northgate.kyr`)
   - Before: "He looks at you for a long time across the jug."
   - After: "He turns the jug a quarter-turn on the table."
5. Rule reports (`night.kyr`, `fire.kyr`, `market.kyr`, `northgate.kyr`, `captain.kyr`)
   - Before: "Word comes over the water: at the end of the day old Corbin found {?b} lying ..."
   - After: "Dorcas Mudd, who has seen it from her jetty, tells the whole Wharf at the top of her voice: at the end of the day old Corbin found ..." (and: the milk-boy, a pot-boy, Pell, a constable's boy, Jack Kemp's cousin)
6. The Ferry Inn (`liberty.kyr`)
   - Before: "The Ferry Inn: low, smoky, full of watermen and tanners and people who have business in the Liberty that they would not have in the city."
   - After: "a low room that smells of wet wool and pipe-ash, with the floor sloping to the river so that every pot has to be put down on purpose ... and by the window two men in good coats drinking slowly, who have business in the Liberty ..."
7. The omen at the Step (`wade.kyr`)
   - Before: "Once, quite close, you think someone says your name, and it is the river."
   - After: "Under your palm, on the foot of the pier, the stone gives a small steady knock, like a man testing a door, and stops when you hold your breath."
8. The hook (`voices.kyr`, ends the Step crossing)
   - Before: "You do not feel any lighter. You go on a good deal less alone."
   - After: "You do not feel lighter. You go on."

## Patterns fixed (passages touched)

- Long-look beats replaced by business: 17.
- "Word ..." reports given a teller: 7.
- Flat places given a detail: 3 (Ferry Inn, south road, Cutler's Lane).
- Authorial verdict lines cut or made concrete: 4 (hook payoff, cut-down, Liberty's Charity ending, omen).
- Abbess's framed-upside-down gag: removed from the Wade speech (still in the court and sanctuary lines).
- Cross-link: Pell's rumour reshaped (a black square, a kettle that boils by itself) so it no longer repeats the
  ship-in-a-cellar joke.
- "a long time" 36 to 21, "looks at you" 51 to 39, "Word " 14 to 7.

Total 35 passages, about 6 percent of the prose by volume. As with Gosse, the rest was working and I did not
manufacture rewrites to reach the quota.

## Still weak

- The calling voices (`voice_sky` ... `voice_paint`) all end "they say" and all explain the clue; the formula is
  visible once you have heard three.
- "The church door" 18 times, "the toll money", "the first arch": place-names doing duty as rhythm.
- The Abbess, Hulme and the captain all state their jurisdiction in the same balanced two-clause sentence.
- Dry aphorism closers survive ("Fair's not the same as kind", "Nobody likes a burning").
- The ending paragraphs all follow "When the captain comes up the south road ..." for six of nine endings.

## What a structural fix would need

- A **per-person reaction table** keyed by character (what the person does with their hands) that Says lines can
  call, instead of hand-written "looks at you".
- **News as events with a witness**: rules like `win_claim_spreads` should carry a speaker person id so the report is
  delivered by someone who could plausibly have seen it (and silenced when that person is elsewhere or dead).
- Ending **openers varied by branch** rather than six endings sharing a frame; this needs the ending list restructured
  so a shared "captain arrives" beat is printed once and each ending supplies only its consequence.
