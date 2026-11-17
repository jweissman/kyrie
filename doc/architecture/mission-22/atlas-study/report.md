# The Colour Atlas and the atlas of intentions: a study (M22, 17 November 2026)

This answers the owner's commission in [brief.md](brief.md). I am an independent researcher, not the builder of the
atlas. The evidence was read and played on `origin/main` at 207eab36. Appendix A ([audit.md](audit.md)) audits 43 acts
in play. Appendix B ([matrix.md](matrix.md)) holds the intention families, the aspect cross-table, the qualities beside
the hue, and the measured colour distances.

**Nothing was changed.** No palette, lens, promotion rule, semantic contract, doctrine or design document was touched.
Outdated documents are listed in §1.4 for the owner to rule on.

Each section or paragraph carries one of four labels:
- **[Fact]**: established from the code, the data, the register or git, with file:line or a sha.
- **[Test]**: what I found by playing or walking the game headless.
- **[Judgement]**: aesthetic or design judgement, mine.
- **[Speculative]**: a proposal, not yet tried.

## The central question, answered

*Can the Colour Atlas become a comprehensive, disciplined atlas of the meaningful things a player can intend and
accomplish, without becoming a rainbow of arbitrary interface categories?*

**Yes, but only if it stays two atlases kept apart: the hues and the intentions.**
- **The hues are five promises**: the aim carried on, a danger perceived, a gain, something to learn, a wonder. They
  should stay five. Hue and intention are different axes: in the scenes played, every hue but violet was carried by
  four or more families of intention, and the social family alone was drawn gold, red, blue and neutral (matrix B.2).
- **The intentions** (about twelve families: venturing, investigating, understanding, conversing, influencing,
  companioning, confronting, protecting, handling, acquiring and exchanging, devotion, enduring) should be engine-typed
  vocabulary. Promotion should use them to choose four genuinely different possibilities, lenses to rank, and authors
  to see what their adventure neglects. They should never be painted.
- **The failure today is not too few colours.** It is promises told untruthfully or not at all:
  - 86% of the four's rows are neutral, and a quarter of them are filler with no reason to be there;
  - the largest family of authored acts (influence, 16% of 2,658) almost never reaches the four, and is never marked;
  - violet has no producer an author can use.
- **What the atlas lacks is a second, colourless channel: how an act resolves** (certain, or resting on a roll). The
  engine already knows it and says it only in words.

## 1. History: how the atlas came to be five colours

### 1.1 Timeline

| Date | What | Whose | Where |
|---|---|---|---|
| 10 Nov | Phase B's first step: a place leads with what is worth doing, each drawn by what it is: gold only for the aim followed, **silver to explore**, green to gain, blue to learn, red a danger | owner's amendment 6 (scene-first opportunities), builder's implementation | 59e399f3 |
| 10 Nov | Aspects as meaning apart from drawing (undertaking, exploration, payoff, knowledge, danger, wonder) | builder, after the owner's addendum (meaning ≠ perception ≠ presentation) | ae134710 |
| 10 Nov | "What is learned is azure and a new aim not yet followed silver" | builder | 5a8f652f |
| 11 Nov | **Companionship its own aspect, coral rose**, "only where a real recruitment reaches someone"; compound facets as an OKLab prism | **owner** (memory: m20-owner-companions-perception), built that day | b07f456a |
| 11 Nov | The strict colour grammar: one small indicator per element, everything else neutral; "the paintings supply the richness; the atlas is precise, restrained notation" | **owner** (m20-owner-strict-colour-grammar) | — |
| 11 Nov | The atlas synthesis: seven facets, **violet = magic/wonder/uncanny**, silver = "genuinely interesting/promising (not every possible action)", build-dependent perception (mages violet, thieves green, warriors red, bards coral) as an M21 direction | **owner** (m20-owner-atlas-synthesis) | — |
| 13 Nov | No aspect for being someone: the life of the place drawn neutral; a pink person pip "close to coral" removed (CN-07) | owner's finding, builder's fix | e098881f, register CN-07 |
| 13 Nov | TP-02's precedence reviewed: gold, red, green, blue, violet, silver, rose. Silver moved last: "the most general promise, worth a look, had hidden a particular green or blue" | builder (terminal and aesthetic lines) | a36900f2 |
| 13–14 Nov | **TP-03 decided by the lead: a companion is an icon, never a colour.** In a1's camp the brother's act turned from silver to rose once the aim was followed, his meaning unchanged; rose and ⚭ said the same thing twice | **builder** (register TP-03: "Decided (the lead, 14 November)") | 9367dd5f |
| 14 Nov | TP-02: one dominant colour per act by one precedence, at most two icons, meaning never by colour alone; the prism retired | **owner** (the indicator grammar), built | 1db691a0 |
| 15 Nov | Red is combat: warnings, needs and non-fight marks become neutral words and dashed lines | owner's atlas ruling, built | 9e6c23b9 |
| 15 Nov | **The colour atlas: five colours only.** "Gold is the quest or the current commitment path; blue is information or investigation; red is combat; violet is a wonder; green is a payoff or reward. Nothing else is a semantic colour." Silver and coral retired; exploration and companions are icons | **owner**, recorded by the builder in mission-21/colour-atlas.md; register PB-23 | fdf5df71 |
| 15 Nov | A visited way no longer promises exploration (PB-24: "To the great hall" four turns running, nothing new) | builder, from promise-fidelity | b972b112 |
| 16 Nov | **Wonders are violet**: "it had no producer; the atlas's violet was never drawn" | builder | 2a4053f3 |
| 16 Nov | The indicator appendix: kind by hue, condition by value and shape, never another hue | builder (M22 Phase 2), normative | 98e5388c |
| 16 Nov | A way with something heard in it, or an ambush's sign at its mouth, is red (OR-12, SI-08) | builder, from the sites audit | ffbd03e7, b4575c51 |
| 17 Nov | A lens's mark is what its four rows are (OR-57); help for a company outmatched, drawn as a companion (OR-64) | owner's findings, builder's fixes | 4c466215, 641978d6 |
| 17 Nov | This study: no sixth colour and no Heart lens yet | **owner** | brief.md |

### 1.2 Why each colour was combined, removed or restricted [Fact, from the records above]

- **Silver (exploration) was removed** because it said too little and hid what said more.
  - It was the most general promise, and it was everywhere: 1,095 exposures per 100 turns in the owner's
    opportunity-depth census (mission-22/census/opportunity-depth-2026-11-16.md), against 160 for knowledge.
  - As a colour it hid particular greens and blues (a36900f2).
  - Its promise was often broken: 11 of 17 exploration promises kept in a1 (PB-24).
  - The owner's own definition ("genuinely interesting, not every possible action") was never met by its producers.
    Every way not taken, every one of the place's own acts and every aim heard of became exploration
    (src/presentation/aspects.ts:21).
- **Rose or coral (companionship) was removed** for three reasons.
  - It said again what the ⚭ icon already said.
  - It sat last in the precedence, so it flickered on and off as other aspects came and went. The brother turned
    silver, then rose, with nothing about him changed (TP-03, human-mode.md:153-179).
  - A person's pink pip had been "close to coral" and read as an aspect for merely being someone (CN-07).
  - I measured the distance too (matrix B.4): the retired rose was ΔE 0.075 from danger red in OKLab, the nearest pair
    in the palette in normal vision.
- **Companionship became an icon** because "someone who could join" is a *fact about a person*. It is not a promise
  about an outcome, and an icon can stand beside whatever the act's colour is. The decision was the lead's (TP-03,
  14 November); the owner adopted it in the 15 November atlas ("everything else an icon").
- **General exploration has no semantic hue** for the silver reasons above. And with a hue it competed with every
  particular promise in a one-colour-per-act grammar (TP-02).
- **Red was restricted to actual danger** because it had marked many things that were not a fight. It had been on a
  grave act's "cannot be undone" line, a route's warning edge, blocked trails, barred cells, the needs line (Hungry,
  Weary, Dark), the other mark tags, and the low flame of the light (colour-atlas.md "Then: red is combat"; 9e6c23b9).
  Each became neutral words.

### 1.3 Where the builder's implementation diverges from the owner's decisions [Fact, with my reading marked]

1. **Violet.** The owner gave violet to "magic/wonder/uncanny" (11 November) and then to "a wonder" (15 November).
   - It had no producer at all until 16 November (2a4053f3).
   - Its one producer now is a regular expression on the entity id: `/(^|_)wonder_[a-z0-9]/`
     (src/ui/affordances.ts:381).
   - That contradicts the owner's instruction to "remove high-risk label heuristics where typed data exists"
     (m20-owner-atlas-synthesis). It also contradicts Affordances' own contract: "never from a choice's words"
     (affordances.ts:13).
   - No authored adventure can declare a marvel. Magic is never violet. In my census violet appeared on 0 of 1,920
     rows; in the owner's census, in 2 of 84 runs.
2. **Red.** The owner's 15 November words are "red is combat". The build gives red to more than combat:
   - being warned off;
   - a band heard behind a way, or an ambush's sign at its mouth (OR-12);
   - any gentle act toward a threat: the parley, "Tell the watch you have come about the shire-reeve's levy"
     (audit 18; affordances.ts:126-140);
   - an authored rite that ends a danger (`ending`, affordances.ts:98-103).

   The owner's 11 November synthesis ("recognisable present or impending danger") supports the ways heard of or lurking.
   No ruling I found covers drawing a *peaceful* act red because of whom it is done to. *My reading:* this is an
   extension beyond the latest ruling and needs one.
3. **Blue.** The owner's blue is "information or investigation". The build also gives blue to the first try at any
   barred way (`unlooked`: affordances.ts:339, 346). Heaving up a portcullis is drawn "to learn" (audit 15).
   Meanwhile an authored reading whose success asserts no `knows` is drawn "worth a look" (audit 12).
4. **Exploration's discipline.** "Not every possible action" was never applied. When the hue was retired the
   overload moved into the ◇ icon, which marks 29% of the four's rows (§2.4), more than all five hues together (14%).
5. **"Faint is not dim."** The owner asked twice (11 November) that faint (far, uncertain) and dim (exhausted) be
   distinct states. They are distinct in the data (`Indicator.condition`), but drawn with the same value:
   `--cond-afar: .45; --cond-idle: .45` (web/reader/row.css:49).
6. **The four.** The owner said: "Promote four meaningful choices when at least four exist … never filler"
   (DOCTRINE §3; amendment 6 B; GRAMMAR: "where there are fewer good choices, there are fewer, and none is made up").
   - The build fills the four to four from any legal act "of a type not yet shown" (src/presentation/offer.ts:52-77).
     Only type `other` with no reason is excluded as upkeep (offer.ts:67).
   - So daylight torches, plain waits and "prepare spells" fill the four. 71% of census scenes had at least one such
     row (§2.4).
7. **The intention vocabulary.** The owner asked on 14 November for "a taxonomy of ten or twelve, at most one of each
   promoted". The build answered with `ActType` (offer.ts:10-12): talk, fight, act, search, go, journey, light, wait,
   care, study, other.
   - These are engine kinds, not intentions: "act" is 38% of the four's rows, and "light" is a type.
   - Diversity of `ActType` is what pulls the daylight torch in.
8. **The prism.** The owner kept it on 11 November and retired it on 14 November (TP-02): the owner's own reversal.
   But `Emphasis.prism`, `bar` and `said` survive unused (src/presentation/emphasis.ts:78-109), and `said` takes the
   first aspect by insertion order, not by precedence. `KYRIE_PRISM=1` still reaches the terminal.
9. **Build-dependent perception** (mages see violet farther, thieves green, warriors red, bards coral): an owner
   direction handed to M21, still unbuilt. The perception tiers exist but are not tied to aspects.

### 1.4 Outdated documentation and comments (noted, not rewritten) [Fact]

- **doc/design/ATLAS.md** is the Living Design Atlas, the product's governing ideas. It has no section on the Colour
  Atlas at all, though the commission's reading list begins with it.
- The colour atlas actually lives in three places: mission-21/colour-atlas.md, mission-22/indicator-appendix.md and
  GRAMMAR.md §Focus.
- **mission-21/terminal/human-mode.md**:
  - its TP-02 table puts silver sixth;
  - its TP-03 says "It frees the seventh colour. The atlas reads as six promises".
- **mission-21/colour-atlas.md**:
  - "red is combat", while the code has reddened heard and lurking ways and threat-side acts since 16 November;
  - its three "Next" items are not marked done or not done.
- **mission-22/orientation.md:93** says GRAMMAR.md "still lists" silver and rose. GRAMMAR has said they are retired
  since its 16 November revision (GRAMMAR.md:82-84).
- **mission-22/census/opportunity-depth-2026-11-16.md**:
  - it reports exploration as "silver" and companionship as "rose";
  - its prose says "violet is absent, not merely rare" against its own table (2.38% run coverage).
- **mission-22/obligations-audit.md:92** says so itself: AP-02 still lists silver as a state.
- Comments in the code:
  - `emphasis.ts:16`: "coral, given in OKLCH, is its sRGB";
  - `glance-types.ts:69-70`: "the asking to come along in rose";
  - `affordances.ts:189-191`: "a likeness is drawn blue, or rose";
  - `web/reader/stage/talk-stage.tsx:56`: "drawn blue, or rose";
  - `web/reader/stage/pip.tsx:9`: "violet, silver";
  - `indicator.ts:34`: "a way drawn silver".
- The walkers' policy name `silver` (src/autoplay/player.ts:10, 36-37; src/autoplay/run.ts:110, 128;
  scripts/matrix-walk.ts:3, 13) still names exploration by its retired hue.

### 1.5 Unresolved hypotheses [Fact: listed as open by their own documents]

- Novelty's look.
- A hollow mark for what is only heard of.
- A treatment for urgency or intensity (indicator-appendix §4).
- `heard` on rows (§5 there).
- A census spec of computed colours (colour-atlas "Next" 2).
- Build-dependent perception (above).
- A crowd as a contested opponent (register TS-02).
- Phase C's five-colour lens hypothesis (phases-abc-brief.md §B).

## 2. The atlas today, in code and in play

### 2.1 The five promises [Fact]

| Hue | Aspect | Produced by (`Aspects.by`, aspects.ts:10-22, and the marks at :29-33) | Typical acts |
|---|---|---|---|
| gold | undertaking | advance, named, toward, about, bound, kin; drawn only on the one act `Promotion.continued` makes the next step (promotion.ts:257-270), and only after an explicit Follow | the aim's question, the ruts, the way to the aim's place, the light in the dark (Promotion.lit) |
| red | danger | danger, warned; any act with a mark fight, trap, heard or lurks | an attack, a parley with a band, a way into an ambush |
| green | payoff | spoils, means; in talk, what pays (TalkFocus.pays) | a treasure to take, a sale, a lesson for coin |
| blue | knowledge | sign, unlooked, asked; the place's own act that `teaches` (promotion.ts:352-355) | a question that teaches, a notice, a first try at a barred way |
| violet | wonder | `wonder`, from a generated `wonder_…` id (affordances.ts:378-382) | rare |

- **Precedence** (`Emphasis.precedence`, emphasis.ts:62): gold, red, green, blue, violet. The first drawn aspect is the
  act's colour. Up to two icons follow: a companion first, worth a look, then the other aspects' icons, the crossing,
  the hold. The rest is said in words on asking (`Indicator.of`, indicator.ts:35-45).
- **Icons**: ◇ worth a look, ⚭ companion, the crossing, the hold, idle, sensed. Without colour each hue's own sign
  stands in its place: ✦ ⚠ ¤ ℹ ✧.
- **Conditions** (`Indicator.condition`): present, afar, heard, idle, spent. They are drawn by value (row.css:47-55),
  never by hue.
- **Visual treatment**: a row's left mark in the hue, grown to the row's height under the keys; a likeness's pip; the
  rail's pips; the place's mark; lens tiles. Everything else is neutral. Unasked words are said only for the aim, a
  danger and a companion (`Indicator.unasked`); the editorial words "to learn", "to gain" and "uncanny" are said only
  on asking.

### 2.2 How the four are chosen [Fact]

1. `Affordances.of` gives every candidate its reasons (`Why`, 33 of them).
2. `Promotion.pick` ranks them by tier: urgent; the aim; needs; the place's own and the new; ways. It applies caps:
   three acts besides talk and at most two talks (promotion.ts:46, 88), one per subject, two ways, one of the place's
   own.
3. `HeldActs.with` inserts the "Follow: …" row after the urgent ones.
4. `Offers.scene` fills to four: the leading way, then "a type not yet shown", then any (offer.ts:52-77).

Nothing in this chain knows what a player *intends*. It knows reasons (why now) and engine kinds (what sort of
command).

### 2.3 What I played [Test]

- **Generated worlds:**
  - a1 as kin, debt (warrior, mage) and wanderer;
  - kite as kin (dwarf cleric) and wanderer;
  - thorn, wren and iscoed as wanderers;
  - iscoed as pans (the salt-house livelihood).
- **Authored campaigns:** Low Water, Skeel and the Book of Faces (openings), the Hearing read in code.
- **A tiny social square** (§5).
- **Unguided walks** for the census: eight walks of 60 steps (a1, kite, thorn, wren and iscoed investigating; a1
  fighting; a1 debt mage and kite kin cleric each following their aim). That makes 480 scenes and 1,920 four-rows.
- **Situations covered**: exploration, combat, dialogue, trade, investigation, recruitment, magic and an ordinary
  livelihood.
- **Authored adventures on disk** (27): book-of-faces, gosses-company, half-the-hive, hessel, hollins,
  house-that-grows, let-one-remember, liberty-of-the-ice, low-water, muster, parliament-of-books, patient-star,
  quiet-in-the-sky, quittance, sallowfield, skeel, skerrow, tallow, the-dorothea, the-grand-tour, the-long-man,
  the-lull, thrume, what-tessary-owes, winter-in-carth, wrayford, wrongboat. Their campaigns are in data/campaigns.

### 2.4 The census of the four [Test]

| Measure | Value |
|---|---|
| hue of the four's rows | neutral 86%, blue 11%, green 1.5%, gold 0.7%, red 0.6%, violet 0 |
| the ◇ worth-a-look icon | 29% of rows (⚭ 2%) |
| distinct hues in a four | none 58%, one 39%, two 3% |
| distinct `ActType`s in a four | three 66%, four 21%, two 13% |
| rows with no reason, filled by Offers.scene | 25% (486 of 1,920); in 71% of scenes at least one; mostly waits (156), ways (97), talks (92), lights (29) |
| the "Follow: …" row among the four | 413 of 480 scenes (the 360 unfollowed scenes nearly all) |
| a social check (persuasion, deception, intimidation, performance) among the four | 2 rows, both the same haggle over bacon as filler, neutral |
| social checks offered in the rest | persuasion 171 times and performance 18 times across the 480 scenes' rests (almost all haggling and singing) |
| gold, in the two walks that followed an aim | 13 of 120 scenes |

**Limits.** The walkers are the autoplay lab's, which repeat themselves more than a person would: 213 consecutive
scenes had the same four, mostly while a walker lingered. Authored adventures, where most social acts live, are rarely
reached in an hour of a generated world. The scenes I played by hand fill that gap only in part.

### 2.5 What the scenes show [Test, with the judgement marked]

Appendix A has each act. Grouped:
- **False or missing promises.**
  - The tiny square's plea to the reeve (the scene's crux, an even chance) is not in the four while its aim is only
    held (audit 29).
  - Speaking to the crowd is never led (32).
  - Heaving a portcullis is blue (15).
  - An authored reading is "worth a look", not blue (12).
  - The aim's second method, carrying the sacks, is a neutral chore beside the gold of poling the boat (37).
  - Daylight torches and "prepare spells" open Low Water, Skeel and the Book of Faces (40, 43).
- **Ambiguous colours.**
  - Red for the parley and the attack alike (18).
  - Gold for a certain proof and an even-chance plea alike (30, 31).
  - Green for a key and for a coin (36).
  - Blue for petting a dog (11).
  - A gold row whose ℹ belongs to another question in the same talk (16).
  - In a fight, the runner gives every move but flight `danger`, heals included (src/cli/runner-fight.ts:70). The
    page's fight hand draws by section instead (23).
- **Missed opportunities.**
  - No spell is offered outside a fight to a cleric or a mage (41).
  - Lessons were met in no walk (the boredom census, BO-04).
  - Wonders are met almost never (the boredom census, BO-01).
- **Repetitive foregrounds.**
  - The Follow row held a place for twenty turns running at Ironkeep.
  - The same haggle at every merchant.
  - "Collect a steel coin" for a dozen turns.
- **[Judgement] Important acts drawn as neutral, indistinguishable choices.** Influence is the case. The richest kind
  of authored act in the corpus (§3) is, on the indicator, indistinguishable from "Wait a while".

## 3. The vocabulary of intention: inventory and a provisional taxonomy

### 3.1 The vocabularies the code already has [Fact]

| Vocabulary | Size | What it is |
|---|---|---|
| `Why` (glance-types.ts:19-52) | 33 | why an act is led now |
| `Aspect` (glance-types.ts:17) | 7 | what it promises (five hues, two icons) |
| `Kind` (promotion.ts:12) | 15 | the command's sort, for promotion |
| `ActType` (offer.ts:12) | 11 | the sort, for the four's variety and the rest's order |
| `Lens` (glance-types.ts:96) | 4 | people, things, places, time |
| `MarkKind` (glance-types.ts:54) | 10 | what it risks |
| shared-rule action schemas (data/rules) | about 100 | the rules' verbs |
| authored corpus | 2,658 Actions, 4,346 Topics, 471 Changes | adventures, situations, sites, goings-on, origins |

**None of these is a vocabulary of intention.** Why is about timing, Aspect about outcome, Kind and ActType about
mechanics.

The authored corpus classifies by verb, speaker and check (matrix B.1). It is dominated by:
- Influencing, 426 (16%): persuasion 223, performance 68, deception 62, intimidation 39;
- Conversing, 391;
- Handling, 320;
- Exchanging and Acquiring, 432 together.

The commonest leading verbs are Ask (253), Tell (197), Take (165), Pay (99), Read (92), Give (87), and Put or Lay
(169).

### 3.2 Twelve provisional families [Speculative, grounded in B.1]

1. **Venturing**: going, entering, crossing, slipping by.
2. **Investigating**: looking, searching, reading signs and faces.
3. **Understanding**: deciphering, studying, learning, laying a case.
4. **Conversing**: asking, telling, news; consent-based talk.
5. **Influencing**: changing someone's mind or will against resistance (persuading, deceiving, intimidating,
   performing, bargaining, pleading, mediating, addressing a crowd).
6. **Companioning and leading**: recruiting, ordering, keeping, parting.
7. **Confronting**: fighting, facing down, drawing out, destroying.
8. **Protecting and tending**: healing, sitting with the sick, rescuing, guarding.
9. **Handling and making**: mechanisms, crafts, mending, building.
10. **Acquiring and exchanging**: taking, buying, selling, paying, giving, and **earning a living**.
11. **Devotion and the uncanny**: rites, offerings, spells outside a fight, wonders, planes.
12. **Enduring**: waiting, resting, camping, eating, watching, weathering.

B.1 gives each family its executable verbs, its capabilities, its resolution modes, its stakes and its gaps. The
thinnest are:
- livelihoods: `work_keep` and `sing_supper` are the only earning verbs, which matters for Phase E's commoner;
- magic outside a fight;
- Understanding: no lesson reached;
- leadership beyond "stay here";
- a crowd as an opponent.

### 3.3 Families and the hues: orthogonal [Test → Judgement]

- **[Test]** Matrix B.2 is the evidence. Every hue but violet is carried by four or more families, and most families
  carry three or more hues.
- **[Judgement]** Colours cannot be families of intention:
  - there are twelve families and five hues;
  - one family (Influencing) is legitimately four different hues;
  - painting families would break the one property that makes the atlas worth having, that a hue is a *promise about
    what this act may bring*.
- **[Judgement] Keep them orthogonal.** The hue answers "what may come of it". The family answers "what kind of thing am
  I doing". The second is better shown by the act's words and its likeness, and used by the engine to choose.
- **Gold** is not a kind of action. It is a *relation* between an act and the one aim followed. Any family can be
  gold, and exactly one act at a time is. It must stay outside any family scheme.
- **Violet** is not a verb either. It is a *quality of the thing acted on*: the marvel. It is the one hue that, rightly
  produced, would correlate with a family (Devotion and the uncanny), and it is the one hue with no typed producer.
  Its fix is authorable: a declared marvel, a Kyr clause or a thing-kind. A better id pattern would not do.

## 4. The matrix

[matrix.md](matrix.md) relates the intentions, the aspects, the action categories, the character capabilities and the
treatments. Its four tables:
- **B.1**: per family, the shared verbs, the authored counts, the capabilities, the resolution modes, the stakes and the
  missing pieces.
- **B.2**: which promise each family can carry, ● met, ○ possible.
- **B.3**: each quality beside the hue (present, afar, heard, idle, spent, fresh, uncertain, difficulty, forecast,
  urgency, grave, depletion, repetition, executable) against the engine field that knows it and its current treatment.
- **B.4**: the tokens' measured distances, for normal and colour-blind vision.

## 5. Social influence: with and without a sixth hue or a lens

### 5.1 Six distinctions, and how each stands today [Fact and Test]

| Distinction | Mechanics today | Treatment today |
|---|---|---|
| The mere presence of a person | none; "being someone here is no opportunity" (aspects.ts:18-20, CN-07) | neutral likeness |
| Ordinary conversation, willingness to cooperate | `talk_to`, Topics, `ask` (needs `testimony`), `tell` (needs `trusts`); consent | neutral; blue when a question teaches |
| A possible companion | `recruit`: `willing` and `hire` coin, `Resolve enlist`, no roll (data/rules/people.kyr) | ⚭ icon, neutral row, the words "would join you, 5 coin" |
| A social challenge with uncertainty, resistance and stakes | `talk_round` (persuasion, dc_fair; failure costs patience), `face_down` (intimidation, dc_hard; failure: they attack), `haggle` (persuasion, fair; ±1 coin), `sing_supper` (performance), and 426 authored acts | **words only** ("· an even chance", "· one try"); gold if the aim's, red if the hearer is a threat, else neutral and usually not in the four |
| Leadership, inspiration, persuasion, recruitment, intimidation, deception, mediation, a crowd | persuasion, deception, intimidation and performance are skills (Checks.qualities); a crowd is only a Person; mediation and a crowd's contest are absent (TS-02) | as above |
| Perceiving sentiment, morale, loyalty | `insight` checks (75 authored), facts learned | blue when it teaches |

### 5.2 When does influence need a roll? [Fact]

The rules and the authored corpus already answer this, case by case. **There is no universal formula, and there
should not be one.**
- **Consent** decides recruitment and ordinary favours: `willing`, `acceptsEscort`, `trusts`.
- **Evidence** decides where the truth is in hand. In the Book of Faces Hearing, `exchange_concurs` needs the true
  Pound restored and has no Resolve; its alternative `exchange_pleaded` is `check(lore, dc_hard)`; `watch_pleaded` is
  `check(persuasion, dc_hard)` (data/adventures/book-of-faces/hearing.kyr:24-50). The salvagers' watch stand down for
  the levy known, no roll (data/situations/bound-howe/situation.kyr:250).
- **A check against a difficulty** decides resistance with uncertainty: dc_easy 10, dc_fair 13, dc_hard 16,
  dc_formidable 19 (src/rules/checks.ts:24). A difficulty may also be measured from the world (OB-11: a debt's size
  sets a plea's `toBeat`).
- **Resources** decide the proud and the hired: `pay_tribute`, `hire`.
- **A contest against a group** does not exist (TS-02, open).

What the atlas should mark is therefore not "social". It is **uncertain and consequential**, which holds for a plea,
a climb, a lock and a crowd alike.

### 5.3 The tiny square [Test]

I built one Tiny world on the shared rules. Its Kyr is reproduced in §8.2 so it can be kept as a fixture. It holds:
- the reeve Odda: a plea, `check(persuasion, dc_hard)`, or her own ledger shown once it is known, certain;
- Cyril: willing, for 5 coin;
- the crowd at the well: speak for the boy, `check(performance, dc_fair)`, or listen to the square,
  `check(insight, dc_fair)`, which teaches the mood;
- Hamm the baker: ordinary talk;
- an aim: the toll-boy in the lockup.

| Case | The four the engine led with | The plea |
|---|---|---|
| aim held | Follow: …; Ask Cyril to join (⚭); Talk to the crowd (blue: the insight teaches); Take the lockup door (filler) | **not led**; inside Odda's talk, neutral, "· an even chance" |
| aim followed | the plea (**gold**, "· an even chance"); Ask Cyril (⚭); Take the lockup door (filler); **Wait a while (filler)** | gold. The crowd **left the four**: two talks are the cap (promotion.ts:88), so a reasoned blue act gave way to a reasonless wait |
| evidence known, aim followed | Show Odda her own ledger (**gold**, certain); Cyril; the door; Wait | gold, drawn exactly as the even-chance plea was |

The people lens held all four social acts in every case, by person:
- Odda: the plea, or the ledger;
- Cyril: the recruit;
- the crowd: the speech and the listening;
- Hamm: the talk.

Its mark carried undertaking, knowledge and companionship.

### 5.4 A sixth hue against none [Judgement, on that evidence]

| | A narrow rose: "a consequential social challenge" | Five hues: neutral person, words, likeness, and a colourless mark for an uncertain outcome |
|---|---|---|
| Makes the plea visible before Follow | only if it is also *led*; the hue does not promote it (it was absent from the four, not uncoloured in it) | the same: needs promotion to lead it (§6.1) |
| Tells the plea from the proof | no: both are "social" | yes, if the uncertainty is marked: the proof is certain, the plea an even chance |
| Survives the precedence | **no**: when the plea is the aim's it is gold; when the hearer is a band it is red. Rose would show only where it is the act's sole promise, which is TP-03's flicker again | yes: the shape cue sits beside any hue |
| Tells it from danger | ΔE 0.075 from red, the closest pair in the palette; for a deuteranope it is also close to green (B.4) | not a hue |
| Covers the same need beyond talk | no: a climb at even odds, a lock and a ford are equally uncertain and stay unmarked | yes: one notation for any roll |
| Cost | the palette, `Tone`, the stylesheet, `terminal-colour`'s pins, the precedence, the contract, the specs | an engine field already derivable (`resolve.name === 'check'`; Checks' odds) and one icon of the two allowed |

**Verdict: no sixth hue.**
- The distinction the owner names, a consequential social challenge, is real.
- It is common: the largest family of authored acts.
- It is badly served today.
- But what makes it consequential is *uncertainty, resistance and stakes*, which are not a promise about outcome.
- And its invisibility is first a **promotion** failure: in the square it was missing from the four, not drawn wrong in
  it.

**The strongest single piece of evidence** is that the same plea is legitimately gold, red, blue or neutral by
circumstance (matrix B.2). A rose would be hidden by the precedence in exactly the cases that matter most.

### 5.5 A Heart lens, the people lens, or a situational instrument [Judgement]

- **[Test]** A Heart lens over the square would list the plea, the speech, the listening and the recruit. Those are
  the same four acts the people lens already gives, regrouped by verb instead of by person.
- **What it would add:** an answer to "what can I do *to persuade*", across people.
- **What it would cost:**
  - a fifth lens, a mode the player must learn;
  - a second home for the same acts;
  - an empty lens in most scenes: in the census, the social checks offered (189 across 480 scenes) were nearly all
    haggling and singing.
- **[Judgement] Not now.** Within the people lens, rank the consequential, uncertain acts first, and let a person's
  likeness carry the uncertainty mark of what is within. That gives the discoverability without a new mode.
- Crowd sentiment, morale and leadership deserve a **situational instrument** where an adventure authors one: the Book
  of Faces' Hearing, a council, a muster. It would read authored quantities (a measure of the crowd's mood or each
  faction's concurrence), like the existing instruments (Sky, Provisions). It is never a lens of invented acts. It
  needs TS-02, the contested crowd, first.
- Revisit a Heart lens only if the game grows several distinct social verbs that are common outside authored set
  pieces.

## 6. Diversity, intensity, and candidate models

### 6.1 The four, by aspect and by verb [Test → Speculative]

- **[Test]** The four rarely show four different possibilities. The causes are structural:
  - the Follow row is a near-permanent occupant;
  - a quarter of rows are reasonless filler chosen for being a different `ActType`;
  - the two-talk cap can drop a reasoned act for a reasonless one (§5.3);
  - the place's own authored verbs ("Build the cairn up again", "Read the notches") all collapse to ◇.
- Hue diversity is low (58% of fours have no hue). That is right, not wrong: hue diversity must not be a target.
- **[Speculative]** Measure what the brief asks for instead. Among candidates with equally good reasons, prefer one
  that adds:
  - a family not yet shown;
  - a different subject;
  - a different method of the same aim: pole the boat, or carry the sacks;
  - a different risk: certain or uncertain.

  Never displace tier 0 (danger, the dark, an answer owed), the aim's next step, or a need. Never fill with a
  reasonless act while a reasoned one was skipped by a cap: fewer than four is better, by the GRAMMAR's own rule.

### 6.2 Shade, intensity and distance (§7) [Fact → Speculative]

- **[Fact]** The condition channel exists and is principled (indicator appendix): kind by hue, condition by value and
  shape. What it lacks:
  - `heard` on rows;
  - a visible difference between faint (afar) and dim (idle): both .45;
  - any cue for an **uncertain outcome**, though the engine computes the odds;
  - any cue for a forecast's severity beyond words: a deadly red looks like an easy one.
- **[Speculative]** Restrained treatments, none of them a hue:
  - **uncertain**: one icon in the existing two-icon budget for an act that rests on a roll, said with its odds;
  - **heard of**: the appendix's hollow mark;
  - **afar**: a thinner mark at .45;
  - **idle**: the whole row lowered, as now, at a different value from afar;
  - **grave or deadly**: the warning icon already proposed (colour-atlas "Next" 1).
- No motion, pulse or animation (the doctrine's restraint). Shapes and icons work in NO_COLOR and for colour-blind
  players, which matters doubly because blue and violet are already ΔE 0.012 to 0.030 apart for them (B.4).
- **The rule to keep: a distant or uncertain opportunity never looks executable now.** The afar mark already says
  "not here". The uncertainty icon says "here, but it may fail".

### 6.3 Candidate models [Speculative]

| Model | What it is | For | Against | Migration cost |
|---|---|---|---|---|
| **A. Five promises, made truthful** | keep everything; fix each false producer at its cause (blue only for what teaches; the first try at a barred way not blue; an authored reading that teaches typed as teaching; a typed, authorable marvel for violet; red for a peaceful act on a threat ruled on); no reasonless filler | smallest; honours every ruling | leaves influence and uncertainty invisible; the four still thin | low: Affordances, Promotion and Offers, a Kyr clause for marvels, specs |
| **B. Five promises + a colourless channel for how it resolves + intention families used, not painted** *(recommended)* | A, plus: (1) an engine-typed `uncertain` (from `resolve: check`, with the odds band) drawn as one icon; (2) an `Intent` family on each act, derived from schema, resolve and speaker, declarable in Kyr for authored acts; promotion uses it as a tie-break for diversity, the people lens to rank social challenges first, the authoring census to show neglected families | makes the most common consequential acts legible without a hue; gives diversity a meaningful key; one notation for every roll | one more icon to learn; a family field to maintain; promotion needs a careful experiment | medium: a field on Choice and Promoted, a derivation table, a Kyr clause, Indicator's icon list, promotion tie-break behind a flag, specs |
| **C. Hues as families of intention** | colour each act by what kind of act it is | "what am I doing" at a glance | twelve families, five hues; influence is four hues; destroys gold as the aim's thread; a rainbow | high: the contract rewritten |
| **D. A sixth hue: rose for a consequential social challenge** | §5.4 left column | the owner's hypothesis, narrow | hidden by gold and red where it matters; ΔE 0.075 from red; marks one family's uncertainty and not the others' | medium-high: palette, precedence, terminal pins, contract |
| **E. Five colour lenses** (Phase C §B) | a lens per hue over the authoritative set | "show me what I could learn" | a gold lens of one act; neutral acts in no lens (most social acts, most livelihoods); a fifth to ninth mode to learn; duplicates people, things, places and time | medium-high |

### 6.4 Recommendation [Judgement]

- **Adopt Model A's corrections first.** They are at their causes and need no new notation.
- **Then test Model B's two parts as the smallest experiment (§7)**, and adopt them only if it shows a benefit.
- Keep the five hues and their contracts as they are.
- No sixth hue, and no Heart lens. Ask for a ruling on red for a peaceful act toward a threat.

## 7. The smallest playable experiment [Speculative]

The experiment is warranted. Its parts:
- **Name:** the uncertain mark and the reasoned four. Everything sits behind one flag, off by default.
- **Fixed scenes:** six, each kept as a fixture:
  1. the tiny square, aim held and aim followed;
  2. Mik's salt-house (a1 debt);
  3. the salvagers' lookout (a1);
  4. the staithe at Reedbridge (iscoed pans);
  5. Skeel's quay;
  6. the Book of Faces' Strangers' Square.
- **Changes** (presentation and promotion only):
  1. `Choice.uncertain`, set from the action's `resolve.name === 'check'` with Checks' odds band, drawn as one icon in
     the existing two (`Indicator.of`), its words unchanged.
  2. A new reason for a check-resolved act spoken to someone, whose success changes their standing or what they
     allow, tiered with the place's own (tier 3). It is drawn neutral (no new aspect), so a consequential social
     challenge can reach the four on its own merits.
  3. `Offers.scene` fills only from candidates with a reason, preferring a family not yet shown, and leaves the four
     short rather than add a reasonless wait, light or preparation.
- **Measures**, before and after on the six scenes:
  - reasonless rows among the four;
  - distinct families among the four;
  - whether the scene's crux (the plea, the poling or carrying, the parley) is among the four;
  - blind readers' answer to "which of these could fail?" and "which would change someone's mind?", read from the
    terminal transcript and a page capture (the lead's browser);
  - no change to tier 0, to gold, or to any hue.
- **Adopt if:**
  - reasonless rows fall;
  - the crux is led in at least five of six;
  - readers tell the uncertain from the certain;
  - nothing urgent or gold moved.
- **Drop if:** readers read the icon as danger, or the four loses its urgent or aimed acts.

## 8. Reproduction

### 8.1 The tools

The scratch tools are in `/var/tmp/kyrie/atlas-scratch`, outside the repository:
- `probe.ts`: a step-driven dump through the runner;
- `census.ts` and `tally.ts`: the walks of §2.4, rerun with `bun census.ts <seed> <policy> <steps> [origin]
  [race/calling]`, `FOLLOW=1` to follow the first aim;
- `social.ts`: §5.3;
- `verbs.py`: matrix B.1.

Each run took 20 to 40 seconds.

### 8.2 The tiny square

```
Place square "the market square" is room at 0, 0 outdoors.
Place lockup "the lockup" is room at 1, 0.
Passage lockdoor "the lockup door" is door between square and lockup.
Company party "You" of 1 at square.
Person reeve "Odda" at square { Role "the reeve". Ancestry human. Peaceable. Pronouns she. }
Person cyril "Cyril" at square { Role "a sellsword". Ancestry human. Peaceable. Pronouns he. }
Person crowd "the crowd at the well" at square { Role "townsfolk". Ancestry human. Peaceable. Pronouns they. }
Person baker "Hamm" at square { Role "the baker". Ancestry human. Peaceable. Pronouns he. }
Relation freed(group). Relation roused(group).
Entity ledger: fact "The reeve's own ledger shows the boy paid the toll.".
Entity mood: fact "The square blames the reeve, not the boy.".
Initially Assert established(ledger). Initially Assert established(mood).
Initially Assert willing(cyril, party). Initially Set hire(cyril) to 5. Initially Set quantity(party, gold) to 20.
Action plead_boy(actor: group, site: place) "Ask Odda to let the toll-boy out of the lockup" {
  Speaker reeve. Requires able(actor) and at(actor, site) and at(reeve, site) and not knows(actor, ledger)
    and not freed(actor).
  Time 10. Resolve check(actor, persuasion, dc_hard). On success { Assert freed(actor). }
  Result "Odda sighs, and sends for the key.". Otherwise "'He stays until the assize,' says Odda.". }
Action show_ledger(actor: group, site: place) "Show Odda her own ledger: the boy paid" {
  Speaker reeve. Requires able(actor) and at(actor, site) and at(reeve, site) and knows(actor, ledger)
    and not freed(actor).
  Time 10. On success { Assert freed(actor). } Result "Odda reads the line twice, and sends for the key.". }
Action rouse(actor: group, site: place) "Stand on the well-step and speak for the boy to the crowd" {
  Speaker crowd. Requires able(actor) and at(actor, site) and at(crowd, site) and not roused(actor).
  Time 15. Resolve check(actor, performance, dc_fair). On success { Assert roused(actor). }
  Result "The square takes up the boy's name.". Otherwise "They listen, and go back to their buying.". }
Action sound_out(actor: group, site: place) "Listen to what the square is saying of the reeve" {
  Speaker crowd. Requires able(actor) and at(actor, site) and at(crowd, site) and not knows(actor, mood).
  Time 10. Resolve check(actor, insight, dc_fair). On success { Assert knows(actor, mood). }
  Result "The square blames the reeve, not the boy.". Otherwise "Nobody says anything to a stranger.". }
Topic flour with baker "Ask Hamm how trade is" when true once { Says "'The miller short-weights us,' says Hamm.". }
Objective boy when not freed(party) "The toll-boy is in the lockup for a toll he says he paid.".
Goal false.
```

It was played as a human bard. The "evidence known" case adds `Initially Assert knows(party, ledger).`; "aim
followed" is `Tiny.follow('boy')`.
