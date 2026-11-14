# Design pull and astonishment review

**Reviewed:** 13 November 2026  
**Scope:** the creative vision, aesthetics and design atlas; the current undertaking, knowledge, succession,
companion, narration, story and world-event representations; and representative authored material in the origins,
*Let One Remember*, the fellowship and the circus.  
**Question:** what is missing between Westernesse's unusually strong conception of a persistent literary world and
an experience with enough emotional pull, intimacy and consequence to become astonishing?

## Executive summary

Westernesse has an extraordinary theory of the world, but its general machinery has a thinner theory of desire.
The project already represents operational facts well: what the company means to do, where something is, what is
known, who will travel with it, which event befell, and which action advances an aim. Its best authored material also
demonstrates the desired larger experience: the debt origin creates pressure and social memory; the fellowship makes
returning home meaningful; *Let One Remember* turns evidence, language, companionship and mourning into action; the
circus makes a contract mean different things to different people.

The gap is therefore not primarily a shortage of ideas or content. It is that **dramatic facts are seldom first-class**.
Longing is usually represented as an objective, attachment as willingness to join, history as an authoritative event,
mystery as a fact not yet known, cost as an irreversible action, and return as movement back to a place. Authors can
and do exceed those representations with bespoke predicates and prose, but the ordinary grammar of the game does not
yet help them reproduce the achievement.

This produces recognizable symptoms:

- aims accumulate while few become things the player cannot stop thinking about;
- succession can choose the nearest useful lead, but cannot know what the player longs for;
- a return can close a job without becoming a homecoming;
- companions are mechanically discoverable before they become relationally important;
- the world preserves what happened more readily than who witnessed it or what people think it meant;
- mysteries tend to collapse into established facts when discovered;
- exceptional prose can enter the same event stream and visual register as ordinary activity;
- *The story so far* is a useful transcript, but not yet the promised *History of Emprise*.

The recommended response is **not seven large new systems**. It is a two-gate program:

1. **Prove the emotional loop in authored content, using existing Kyr wherever possible.** Finish one small story—
   “Gone under” is the best candidate—through longing, preparation, a companion's involvement, discovery, cost,
   return, another person's interpretation and a durable alteration of home.
2. **Promote only the repeated semantic needs exposed by that proof.** The highest-value candidates are a return
   context, open questions with evidence, and authored accounts of shared events. Existing `Promise`, `revelation`,
   provenance-aware knowledge and the event log should be extended rather than displaced.

The north-star experience can be stated compactly:

> The player belongs somewhere, encounters something they cannot forget, and sees what they did acquire meanings
> they did not entirely control.

That promise compresses Westernesse's simulation, literature, history, companionship and exploration into something
a player can actually feel.

## Major recommendations

### 1. Build one complete emotional expedition before enlarging the world

Extend `data/origins/lost/origin.kyr` rather than beginning with a general-purpose subsystem. It already contains a
strong inciting image: the sister's letter has come apart at the folds; the men who returned will not say why; the
cloak-pin bears her mark and date. Its present ending says that the pin is “something to take home to your mother,”
but there is no mother, playable homecoming, choice of what to say, or changed home afterward.

The proof should include:

1. a mother and a recognizable home;
2. an anticipated act of putting the pin into her hand;
3. one substantial companion observation during the search;
4. one choice about what the protagonist says or withholds;
5. a response shaped by the evidence actually found;
6. a changed room, relationship or local account on the next visit;
7. a durable entry suitable for a later chronicle.

This single slice tests longing, attachment, evidence, cost, return, interpretation and memory without first
committing the architecture to speculative abstractions.

### 2. Separate desire from obligation and navigation

Keep `Objective` as the representation of an actionable undertaking. Add, only after the proof, a lighter authored
notion such as `Prospect`: an anticipated possibility the player may care about without anyone having assigned it.
A prospect may be unresolved indefinitely, need not produce route highlighting, and should be expressed through an
image or desired moment rather than a task formulation.

Examples include putting the pin into the mother's hand, seeing what lies behind a repeatedly encountered sealed
door, earning a companion's trust, restoring a room, learning the missing part of a spell, or reaching lights seen
from a familiar hill.

The player should be able to keep at most two or three prospects visibly close. This is an economy of longing, not
another comprehensive list. `Succession` may continue to prevent dead ends, but “nearest unvisited site” should be
presented as an available horizon rather than the story's answer to what matters next.

### 3. Make return an authored dramatic context

The runtime already knows movement history, elapsed time, previous interlocutors, carried objects and changed facts.
Derive a small `ReturnContext` when a company re-enters a declared home after meaningful absence. It should expose
time away, who left and returned, promises that came due, relevant world events, changed local people and places, and
objects now carried for which a local action exists.

Authors should then be able to write particular homecomings without relying on generic welcome prose. Acceptance
should require that a return after a substantial expedition can show, through the same people and places:

- one familiar detail;
- one changed condition;
- one human acknowledgment of the absence.

### 4. Author one companion across the whole expedition rhythm

Do not build a general psychology or affection model. Choose one major companion and require meaningful authored
presence at recruitment, preparation, first danger, rest, discovery, disagreement, return and possible loss.

A reusable companion scaffold should encourage, not prescribe:

- three observations grounded in the companion's competence;
- one recurring expedition ritual;
- one independent want;
- one disagreement that changes conduct rather than a loyalty number;
- one vulnerable moment expressed through action;
- one specific response to the protagonist's death;
- one authored departure or burial.

The existing content already shows the right direction when a cleric in *Let One Remember* notices that Calvessan
grammar records whether a statement was seen or merely told. That is a companion changing the player's perception of
the world, not decorating it with banter.

### 5. Preserve events, but let people own accounts of them

Keep `befell(fact)` as authoritative cross-module continuity. Add authored `Account`s as propositions held by named
people, institutions or communities about an event. Several accounts may be compatible, opposed or selectively true.
Their provenance should travel through the existing knowledge machinery.

The circus contract is the model: Sir Gervase sees harmless first refusal, Billie sees every animal made conditionally
saleable, Ninepence sees an intolerable promise of measurement, the Colonel sees urgently needed money, and Cordelia
sees dependency. The action becomes dramatic because its state change passes through several minds.

Start with one shared world event, three accounts and one practical difference in dialogue, hospitality, price,
authority or aid. Do not begin with universal rumor diffusion.

### 6. Represent open questions and evidence without requiring final truth

Add only `Question` and `Evidence` as the first epistemic extension. A question may remain open forever. Evidence has
a source, may bear on several questions, may conflict with other evidence and may enable action without settling what
ultimately happened.

This permits Notes to distinguish:

- what the company is trying to understand;
- what it was told and by whom;
- what it observed;
- what it currently infers;
- what has actually been seen through.

Reserve `Discovery` for what the company treats as established. Each major mystery should admit at least one
consequential inference before its final truth is known.

### 7. Give exceptional moments exceptional form

Build on the narrator's existing `revelation` aspect rather than creating unrelated special screens. A minimal
dramatic vocabulary—ordinary, speech, revelation, reckoning and loss—can control composition and pacing:

- suppress unrelated controls during the moment;
- retain the relevant person, object or place;
- require a deliberate continuation;
- delay automatic successor promotion;
- preserve the full event in Story;
- permit one authored companion aftermath.

The essential behavioral change is that a death, revelation or homecoming must not be immediately overwritten by a
helpful advertisement for the next lead.

### 8. Derive a living history from explicitly significant material

Do not replace *The story so far*. It answers “what happened during play?” Add a later Chronicle projection that
answers “what has this life come to mean?” It can be derived from structures Kyrie already has: deterministic history,
significant narration, provenance-aware knowledge, promises, `befell` events, completed undertakings, persistent
people and places, and authored accounts.

The first version should include only explicitly marked material: named undertakings, deaths, promises, world events,
accounts, important objects and corrections to earlier understanding. It should preserve disagreement and absence;
it must not turn the world into an omniscient encyclopedia.

## Findings and evidence

### A. Longing is usually reduced to an aim

The debt origin is a strong exception. It attaches fifty coin to a ten-day deadline, a creditor, a known home and
social consequences (`data/origins/debt/origin.kyr`, lines 15–18 and 57–62). Paying late clears the debt but does not
clear the memory: “It is paid. It is not forgotten.” This is effective pull because the player can anticipate both a
material and a social future.

The general undertaking representation in `src/presentation/undertakings.ts` knows whether an objective is held,
followed and chosen, and derives the people and places it names. `src/presentation/aim-leads.ts` can infer actions that
advance it. These are valuable operational semantics, but they do not encode whether an aim is a duty, temptation,
fear, aspiration, relationship or unanswered question.

When an aim closes, `src/presentation/succession.ts` chooses a consequence, another held aim, the nearest known lead,
an available telling, or the nearest unvisited site. This is good anti-stall guidance; it substitutes navigational
availability for desire. The Notes presentation in `web/reader/sheet.tsx` consequently orders one followed aim and
the rest by proximity. The register records the visible result as nine or ten aims on day one and a twenty-seven-
rumor list (`FH-05`).

**Risk:** Westernesse can remain full of things to do while producing little appetite for one particular future.

**Mitigation:** finish the lost-sister loop; test a bounded `Prospect`; stop treating automatic succession as the
emotional center of the page.

### B. Closure is available more often than homecoming

The fellowship situation provides a successful authored pattern. Its “Home again” scene reunites the half-tally,
lets the exhausted head finally sit down, and changes the room on later visits
(`data/situations/fellowship/situation.kyr`, lines 188–193). The same person, object, institution and room acquire a
different meaning.

`src/presentation/company-recall.ts` already tracks where the company has been, where it came from, whom it spoke to
and whether a place has become idle. This is presently used principally for navigation and presentation hygiene. It
does not identify home, meaningful absence or awaited return. The register calls the missing experience “Return told
through people” (`WM-05`).

**Risk:** the expedition loop can resolve into travel, payment and another lead without the return becoming the
moment that gives the expedition human meaning.

**Mitigation:** derive a return context from existing history; author returns through familiar people and places;
test recognition after absence.

### C. Companionship is detected through willingness, not relationship

`src/presentation/companions.ts` intentionally finds recruitable people from `willing`, applicable topics and
`able`. This prevents friendliness from being mistaken for recruitment, but answers only who can join now.
`data/rules/care.kyr` provides sound generic treatment, development, rest and burial. Its burial necessarily says
the same thing for a beloved friend and a recent hire unless content intervenes.

The stronger model is already present in `data/adventures/let-one-remember/witness.kyr`. A cleric companion's
competence reveals the moral force of a whole community's grammar. At the niche, a cleric can enact either mourning
or continued vigil through precise physical gestures. These moments bind ability, character, place, interpretation
and consequence.

**Risk:** companions may be valuable party members and occasional speakers without becoming people whose presence
changes the meaning of a destination.

**Mitigation:** author one companion longitudinally; provide scaffold and linting only after the required beats are
known; use rest and return as relational spaces.

### D. History preserves events more readily than interpretation

`data/imbar/events.kyr` and `data/rules/canon.kyr` provide clean shared continuity through facts and `befell`. They
record consequential states such as Cloudgate's fall, Perrin's death, the burning of Sallowfield and the names of the
Brasiers' dead. This is a strong substrate for a persistent world.

But an event has one canonical fact. It does not itself represent witnesses, political uses, disputed names or later
retellings. `web/reader/sheet.tsx` similarly renders Story as a chronological transcript grouped by place. Repetition
is compressed to “The same as before.” It is a useful record, not yet historiography.

The circus material in `data/goings-on/circus/progress.kyr` demonstrates the richer possibility. One contract is
interpreted through Gervase, Billie, Ninepence, the Colonel and Cordelia. Its `Promise` can be kept or broken later,
and the breach matters when it becomes known.

**Risk:** the world remembers state while failing to become a society that argues about the player's deeds.

**Mitigation:** attach authored accounts with provenance to existing events; later project selected accounts into a
chronicle.

### E. Irreversibility exists, but cost is not generally expressed as competing goods

`src/presentation/grave.ts` ensures that grave choices ask twice and say when they cannot be undone. This is correct
safety and interface behavior, not yet dramatic stakes. `Promise` is more expressive because it creates a commitment
that later circumstances can strain.

The niche in *Let One Remember* is the exemplary authored choice. Closing it allows mourning but ends the vigil on
which Teshen's purpose and the reeve's house are built; maintaining it preserves possibility but prevents an ending.
Neither branch is merely success or failure.

**Risk:** permanent state changes can still feel like optimization choices if the player does not understand which
valuable things are in tension.

**Mitigation:** allow grave actions to name only the stakes the protagonist can reasonably know; reuse `Promise` for
delayed cost; lint major conclusions that leave no durable mark, commitment, altered relationship or changed place.

### F. Mystery tends to resolve into knowledge

The ordinary transition is `Assert knows(actor, fact)`. Notes distinguish reported knowledge and other knowledge,
which is already an important safeguard against omniscience. Yet the terminal object is still generally a settled
fact. Even Mother Saska's impossible smoke becomes a `Discovery`, though its literary power lies in what remains
unexplained.

Calvessan's distinctions among seen, told and kept show that the project understands the artistic opportunity. That
epistemic structure is presently a singular authored achievement rather than an ordinary authoring affordance. The
register accordingly calls investigable, alterable history superficial (`WM-08`).

**Risk:** investigation becomes acquisition of facts rather than the formation, testing and revision of
interpretations.

**Mitigation:** introduce open questions and sourced evidence; allow consequential action under uncertainty; keep
some questions permanently unresolved.

### G. Exceptional events can be flattened by ordinary presentation

`src/presentation/narrator.ts` now recognizes authored revelations and marks them apart from ordinary lines. The
aesthetics document explicitly requires exceptional composition for difficult conversations, fatal outcomes and
cosmological discoveries. The register nevertheless records that exceptional moments do not yet take the page
(`NP-08`).

The successor machinery's useful eagerness creates a particular hazard: a discovery, death or return can be followed
immediately by the next actionable lead. Story then folds it into the same chronological stream as routine acts.

**Risk:** excellent authored events occur but fail to become memories because the interface gives the player no time
or form in which to experience them.

**Mitigation:** extend revelation into a small dramatic vocabulary; delay succession during reckonings and losses;
accept exceptional moments by rendered behavior, not only by presence of prose.

## Proposed experience grammar

The project's existing rhythm of desire and fulfillment can be made more exact:

```text
glimpse → longing → preparation → threshold
        → discovery → cost → return
        → reckoning → changed desire
```

A substantial expedition should usually contain:

- something anticipated;
- something genuinely unanticipated;
- a choice that cannot be perfectly repaired;
- a moment between people;
- a discovery that changes an earlier interpretation;
- a materially and socially changed return;
- a new desire born from the consequences.

This is not a mandatory plot template. It is an acceptance lens for whether the simulation and authored content have
combined into an experience with shape.

## Bounded delivery sequence

### Gate 1 — content proof, no speculative subsystem

Build and cold-play the completed “Gone under” loop with one companion and one homecoming. Use existing predicates,
observations, topics, grave choices, promises and revelations wherever possible. Record every place where the author
must use an awkward proxy or duplicate state.

Gate 1 is passed only when an unfamiliar player can answer:

- What are you longing to do next?
- Who would you be sorry to lose?
- What question are you pursuing?
- What changed while you were away?
- What decision do you still wonder about?
- How does someone else understand what you did?

### Gate 2 — semantic promotion

Review the proof's awkward proxies. Promote only concepts that recur and cannot be expressed clearly with current
Kyr. The likely order is:

1. return context;
2. question and evidence;
3. account of an event;
4. prospect, only if objectives and ordinary facts cannot carry anticipation without list pressure;
5. chronicle projection, once accounts and significant events exist to project.

Each addition should include one authoring example, one small-world test, one browser acceptance path and one use in
the proof adventure before it becomes shared vocabulary.

## Measures of success

System counts are inadequate for this work. In addition to ordinary correctness and replay tests, measure:

| Promise | Observable acceptance |
|---|---|
| Pull | after an hour, a player names one desired future without reading Notes |
| Belonging | the player recognizes a home place and notices one change on return |
| Attachment | the player can describe a companion by a remembered act, not only class or combat use |
| Mystery | the player can state a live question and cite conflicting or incomplete evidence |
| Cost | the player understands what was sacrificed without being told a moral score |
| Interpretation | at least two people or institutions understand a consequential event differently |
| Dramatic form | a revelation, loss or return is recalled as a scene rather than a notification |
| History | a later account changes the meaning of an event the player remembers performing |

## Conclusion

Westernesse is not missing its artistic destination. Its own best content has already reached it in pieces. The
project's opportunity is to make those achievements reproducible without reducing them to generic psychology,
procedural prose or another dashboard of state.

The shortest path to an astonishing experience is not more world. It is a small sequence in which distance feels
long, return feels human, knowledge remains dangerous, a companion becomes irreplaceable, and an action continues to
change meaning after it is done. Once that sequence works reliably, the larger geography, history, planes and
strategy can magnify it without losing the ordinary lives that make the grandeur matter.
