# Westernesse player-visible prose-density audit

**Date:** 13 November 2026  
**Question:** where does ordinary play present substantially more than three short rendered lines of prose without
the player deliberately asking to read further?  
**Verdict:** the ordinary *arrival* has largely been repaired. The remaining problem is not a universal excess of
authored prose. It is accumulation at transitions: an action result plus a rule, a warning, a fight log, a changed
room, a reward and an aim are each intelligible alone, but the narrator presents them as one undifferentiated answer.
The fragments needing the most attention are combat/aftermath, automatic clock events, generic danger entrances, and
multi-part opening or quest outcomes. Long conversations, examinations, notices and performances are usually chosen
reading and should remain available whole.

## Method and threshold

I played the current tree through `bin/kyrie adventure`, read the four current 30-turn terminal walks, followed their
source through `Narrator`, `SceneBudget`, action feedback and the combat projection, and sampled the generated rules,
situations and authored adventures which supply the actual words. The four ordinary walks cover debt, wanderer and
courier openings; warrior, thief, mage and cleric; settlement arrival, travel, talk, trade, examination and waiting.
Their arrival census is encouraging: 15 measured arrivals, means of 2.67–3.00 sentences, with no measured arrival over
three.

“Line” here means a short sentence-sized rendered unit, not a CSS line wrap. A long sentence with four independent
observations still counts as excess. Conversely, a compact sentence wrapping to four physical rows on a narrow screen
does not. I counted prose and dialogue, not headings, action labels or a terse aim.

A deliberate invitation to read includes choosing a named question, `look`, examining or reading a particular thing,
opening a book or notice, asking for the fight so far, and attending a staged performance. Merely walking, waiting,
buying, opening a door, taking an ordinary combat turn, or arriving somewhere is not such an invitation.

## Content atlas

| Interaction | What the player actually receives | Common? | Judgment | Editorial action |
|---|---|---:|---|---|
| First arrival / ordinary movement arrival | A place lead, one piece of life, then one further observation; extra standing detail is held | constant | **Retained** | This is the successful baseline. Preserve `SceneBudget`'s whole-sentence selection; do not browser-truncate it. |
| Arrival with a greeting or event | Place lead plus an NPC greeting/event and sometimes a warning, change or clue | common | **Redistributed** | Keep the event and one orienting place sentence; move stable scenery and secondary presence to Look/People. A clue or material change must still win over atmosphere. |
| Road-opening response | The chosen response, several beats of NPC reaction, the changed road object, reward, and sometimes an aim | every start | **Condensed** | One precise dramatic sentence, one consequence/reward sentence, then the aim. Cut stage business that merely repeats success. |
| Generic danger entrance | Creature reveal, size/body detail, threat posture, “will not wait”, and a separate odds/reckoning paragraph | frequent underground and wilderness play | **Condensed** | One vivid identification sentence plus one actionable danger sentence. Keep exact escape/odds information in the danger treatment, not duplicated in prose. |
| Warning followed by hostility | Authored warning, patience deadline, onslaught, combat opening and standing description | frequent | **Redistributed** | Warning now; deadline in the danger UI; onslaught only if the player stays. Do not replay the warning when combat begins. |
| Each ordinary combat turn | Attack sentence, hit/miss, rolled damage, applied damage, save, condition and emotional bark | constant in combat | **Cut / condensed** | Render one fictional beat for the turn. Cut zero-effect, duplicate roll/applied-damage and generic emotion lines from the live prose. Keep the detailed ledger behind “fight so far”. |
| Combat aftermath | Last blows, falls, fight outcome, down/dead state, experience, levels, loot, rules triggered by victory, new aims and the now-changed room | every fight | **Condensed / redistributed** | Three foreground beats: decisive turn, cost/outcome, consequential discovery. Put arithmetic and prior blows in the explicitly opened chronicle; put loot and new leads in their normal interactive surfaces. |
| Ordinary action result: buy, take, give, unlock, care, light | A result template plus inventory/state feedback; sometimes the same acquisition or state is said twice | very common | **Cut** where duplicated | One sentence is enough. `Narration.tidy` already removes some duplicate gains; apply the same semantic rule to all common transfers and state confirmations. |
| Search or manipulation which reveals several facts | Action result plus every new observation and knowledge note | common | **Redistributed** | Foreground the actionable find and at most one sensory corroboration. Put associated history, construction detail and secondary contents on the found thing or a further examination. |
| Wait/rest when several rules mature | Rest result, weather/time change, NPC movements, public events and warnings, potentially several authored scenes | common over longer play | **Redistributed** | Tell the event that interrupts or changes the player's options. Summarize passive changes in one time-passage sentence; leave distant/public developments in Notes until encountered. Never discard a deadline or harm. |
| Automatic chapter/day opening | Four to six crafted sentences announcing a day and its dramatic schedule | recurring in some authored campaigns | **Retained**, exceptionally | Hessel's Saturday–Tuesday openings are true chapter curtains: distinctive, time-critical and literary. Give them chapter typography so the invitation is legible; do not normalize them into incidental event copy. |
| Automatic spectacle or climax | Circus acts, trials, weddings, funerals and endings, often five to ten sentences | recurring but exceptional | **Retained** when the player chose to attend | The circus Grand Entry and comparable set pieces earn their length. If triggered merely by passing time elsewhere, defer them until the player is present or report only their consequence. |
| Named dialogue topic | Often 4–20 sentences, with gesture, hesitation and several factual disclosures | extremely common | **Retained** by default | The player explicitly asked. Preserve voice and dramatic turns. Split only where one reply contains multiple independently actionable questions or revelations; expose those as follow-ups. |
| Greeting before a dialogue menu | Sometimes a long biography, pitch or shop speech before the player has asked anything | common | **Condensed / redistributed** | Keep the characteristic greeting to one or two sentences. Move prices, history, rumours and personal testimony into named questions. |
| `look`, People, Things, places lens, “all” | Full room description, long crowd roll, stable clues already read and all available acts | common but explicit | **Retained / redistributed within the chosen view** | It is invited depth, so no global cap. Still group a crowd as people rows and stable clues under their subjects instead of one huge semicolon paragraph. |
| Examine, read notice/book/inscription, tower panorama | Several observations or a long document | common and explicit | **Retained** | These are the model for deeper reading. Keep the text whole, with a short label that honestly signals the depth. |
| Revisited place | First lasting sentence, passing life and actual changes | constant | **Retained** | The recall behavior is concise. Do not repeat stable room prose or previously read lore. |
| Creation explanations, character sheet, encyclopedia | Expository rules and reference prose | common but outside moment-to-moment narration | **Retained as opt-in reference** | Keep out of the scene's narrative channel. |

## The fragments needing the most attention

### 1. Combat narration and aftermath — highest priority

This is the only density fault that is both constant and involuntary once a fight begins. The raw event stream is
still player-visible during the fight, while `Narration.tidy` only performs its strongest condensation afterward and
only when a log is longer than six lines. That is too late. A simple rat strike can say the attack, the nominal roll,
the applied one hit point, death, an emotional bark, victory and experience as separate prose.

The central editorial rule should be **one turn, one beat**. A beat may contain action plus consequence; it should not
also narrate its calculation. Preserve a save only when it changes the fiction. Preserve a condition only when it
starts, worsens, ends, or materially alters the next choice. Preserve character barks only when authored for that
character or moment.

**Before (observed in ordinary rat play):**

> Haze lands a telling blow on the first rat with the dart, for 9.  
> The first rat takes 1 piercing damage (roll 9, critical +1, 1 was all it had left).  
> The first rat falls.  
> Haze looks away solemnly.  
> The fight is won.

**After:**

> Haze's dart kills the first rat.  
> The other rats break; the cellar is yours.  
> Haze is unhurt.

The roll, damage calculation, experience and full sequence remain in “fight so far”. “Looks away solemnly” should be
cut: it is generic, unearned characterization.

### 2. Accumulated arrival/event state — high priority

`SceneBudget` correctly budgets standing description, presence and held arrival lines, but deliberately exempts clues
and changes. Several such lines can therefore exceed three, and an exchange can also append altered observations,
gone observations and a wait warning. This is fact-preserving but not compositionally controlled.

Do not impose another blind cap. Compose by priority: (1) harm or interruption, (2) actionable change/clue, (3) who
caused it, (4) orienting place sentence. Everything else is held under the relevant subject. If four clues genuinely
arrive together, one sentence should name their common inference and the individual evidence should remain
examinable.

**Before (representative generic danger observation):**

> Something huge uncoils among the ferns at the edge of the pool and turns its head to look at you.  
> It is covered in feathers and fur in equal parts, and its eyes are round and yellow.  
> It breathes in, slowly, through a beak the length of your forearm.  
> It will not have you here long.

**After:**

> An owlbear uncoils among the ferns, its yellow eyes fixed on you and its long beak drawing breath.  
> It will attack if you remain.

Nothing observable or actionable is lost; three observations become one exact image, and the threat becomes honest.

### 3. Opening and routine quest-result bundles — high priority

The opening roads are ordinary play and establish the game's prose contract. They often use four or five dramatic
beats for a minor success, then add a changed-object line, reward and aim. The prose is usually good, but the response
needs hierarchy.

**Before (current courier opening):**

> ‘A share,’ says the wagoner, and looks at you a long moment. ‘A sack, then, and a coin, and be quick about it.’  
> Between you and the horse the cart comes up out of the ditch.  
> He counts the coin into your hand as though each one hurt him.  
> ‘You’ll go far,’ he says. He does not say it kindly.  
> The cart stands square on the road again, its load roped down, the horse quiet.

**After:**

> Between you and the horse, the cart comes out of the ditch.  
> The wagoner gives you a sack and a coin, counting as though each hurt him. ‘You'll go far,’ he says, without kindness.  
> The road is clear.

The bargain, outcome, characterization and changed road all survive. The separate inspection of the now-square cart
does not.

### 4. Automatic clock prose — medium-high priority

The corpus contains many long `Rule … says` passages. Their length alone is not a defect. The decisive question is
whether the player chose the scene. Hessel's day openings should remain; they announce the chapter, clock and stakes.
Wapshott's Grand Entry should remain when the player bought a ticket and sat down. A comparable act resolving while
the company waits elsewhere should not be replayed in full: report the public consequence and make the witnessed
scene unavailable, or preserve it as hearsay, rather than granting omniscient prose.

**Retain (Hessel, chapter opening):** the Saturday bells, Ebba's pigs, water-carts and delayed carpet-beating make a
coherent five-sentence curtain and establish what the day means. It is exceptional writing, not generic ambience.

**Redistribute (remote spectacle):** “Wapshott's performance has ended; by morning the town is talking about the
Sylph's fall.” The full wire act belongs only to attendance or a later explicit account.

### 5. Long greetings — medium priority

Generated factors, merchants, innkeepers and situation principals sometimes deliver price list, institutional history,
rumour and threat in a single greeting. A greeting is not yet a request for an interview.

**Before (factor greeting, abbreviated only here for comparison):**

> ‘Founders' Exchange,’ says the factor. ‘Bells, fittings, weir-metal, anything green. Fourteen to the pound for good
> bronze, nine for scrap, and no questions. I do not ask where a thing was, only what it weighs.’

**After:**

> The factor looks up from the ledger. ‘Founders' Exchange. Old bronze bought by weight.’

Then expose **Ask the price of good bronze**, **Ask what happens to the lots**, and **Ask why there are no questions**.
This preserves the suspicious characterization by turning it into play.

## Material that should not be “fixed” by shortening

The largest raw strings are overwhelmingly named dialogue replies and authored dramatic scenes. Sentence count is a
poor proxy there. The rat job from Bask/Mik, for example, is long on a talk page but the player explicitly asked about
the rats; it gives the infestation, loss, entrance, objective, reward, alternative method, key and aim. It should be
retained, though the key and aim should remain visually distinct from the speech. Likewise:

- tower panoramas are chosen examinations and each direction can become an actionable destination;
- notices, books and inscriptions are explicitly read;
- `look` and lens views are explicit requests for the material held back at a glance;
- confessions, confrontations, endings and staged performances may earn ten or twenty sentences;
- Hessel's chapter curtains and the circus's best acts have genuine literary shape.

For those, redistribution means adding a follow-up choice where the reply contains several separable subjects, not
turning prose into a synopsis.

## Terminal and viewport findings

### Terminal

- Four current 30-turn walks produced 15 measured arrivals. Their means were 3.00, 2.67, 3.00 and 3.00 sentences;
  every reported worst arrival was three. The resting arrival budget works.
- A fresh `a1`, debt, human warrior start likewise opened on three short fictional units before the aim and actions.
- `look` deliberately expands the scene. In the Wrenbridge taproom it exposes six prose paragraphs including a very
  long crowd roll; this is permissible depth, but the crowd belongs in People rows rather than one semicolon chain.
- Chosen tower examination produced eight directional lines and a way down. It is useful, actionable and correctly
  opt-in.
- Dialogue replies range from one sentence to long scenes. Their length is generally correlated with a named question,
  which is the correct invitation.

### Desktop and tablet

The same-day captured 1280×800 and 820×1180 play states confirm that the issue is semantic length, not simply line
wrapping. Three-sentence arrivals remain composed at both sizes. Long talk answers occupy most of the reading plate at
820×1180 but remain legible and were explicitly requested. The tablet view makes accumulated prose plus aim plus reply
menu feel heavier, so structural separation (speech / consequence / new aim) matters more than a smaller font or
clipping.

I attempted a fresh automated browser pass against the locally built site. The Playwright CLI was present and the site
served, but all installed Chromium builds failed before launch because the environment lacks `libnspr4.so`/`libnss3.so`.
No browser behavior was inferred from a failed run, and no silent truncation was introduced. The viewport conclusions
above are therefore from the repository's current same-day 1280×800 and 820×1180 captured real-play states, not a new
live session.

## Recommended order of work

1. **Compose combat turns and aftermath semantically.** One beat per turn; three beats at resolution; ledger on
   explicit request. This removes the most frequent involuntary excess.
2. **Add a transition composer above the scene budget.** It should merge facts by cause and priority, not count and
   discard them. This addresses clues, changed state, warnings and rewards arriving together.
3. **Edit the opening-road outcomes.** They are few, common and establish the standard in the first minutes.
4. **Audit automatic `Rule … says` by witness.** Retain chapter curtains and attended spectacles; summarize or defer
   remote events.
5. **Shorten generated greetings and expose their detail as questions.** This turns exposition into interaction.
6. **Leave chosen longform alone unless it contains separable subjects.** Preserve the game's strongest writing.

## Acceptance criteria

- In an ordinary unprompted arrival, opening response, routine action, combat turn, aftermath, wait or rest, the
  foreground contains no more than three short prose beats unless the moment is explicitly marked and designed as a
  chapter, climax or spectacle.
- No fact, clue, deadline, harm, reward, state change or characterization is lost. Held detail has a visible subject
  and an action by which to read it.
- Combat never states rolled damage and applied damage as if they were two fictional injuries, and never adds a
  generic emotion merely to decorate a kill.
- An explicit Look, People, Things, named question, notice, book, examination, panorama, fight chronicle or performance
  may exceed the budget and is tested for literary shape rather than raw length.
- Terminal output is the canonical prose test. Desktop and 820×1180 checks verify composition and wrapping; neither
  client truncates prose to pass.
