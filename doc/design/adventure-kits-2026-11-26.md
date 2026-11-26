# Adventure kits: what the authored adventures share, and how it could travel

26 November 2026. Research and a recommendation only: nothing here is wired in. It follows the owner's "abstraction
tower" idea of 25 November: take the best fifth of the stories, make them as general as they will go, cast their roles
locally, and offer portable city-stories with several versions of an arc. It also follows the ruling of 26 November that
every adventure is a small book-level investment, to be studied and shepherded, not left to rot.

## The question

Westernesse aims to be maximal. Thirty-seven authored adventures stand in data/adventures/, each placed as a province of
the first country (data/adventures/countries.json). Each is a whole country of its own. It brings its own inn, bell,
river and dead, and it imports only the company: every placed.json imports `party` and nothing else. So nothing an
author wrote can happen twice, and nothing in a generated world can take part in it.

The question is which situations and scenarios could be broken into **kits** that a later setting installs. A kit is
three things:
- cast roles, bound to people that setting already has;
- an arc: its beats, its clock, the facts that gate each act, its ways out;
- what it takes from its environment: kinds of place, institutions and objects.

The author keeps every sentence. This project lives and dies by its prose, so a kit that templated its words would be
worse than none.

## Evidence

**What I read.**
- For the ten small works of 21 to 26 November (eelbell, hexworth, leaving, tailrace, warmwall, goingbank, weatherdrove,
  wetdrusilla, windfall, raingourd, and Over Exall, integrated today), I read story.md, the people files and the
  endings.
- For the larger works I read doc/adventures/repertoire-2026-11-03.md and the modules' clock and description headers.
- Seven have no docs (muster, sallowfield, skerrow, tallow, the-dorothea, wrongboat, book-of-faces), so their reading is
  thinner.

**How much one shape recurs.**
- Of the corpus's 3,834 topics, 1,078 are gated on `knows(…)`, and 673 are "Tell…" or "Show…" topics.
- The gated topics are spread across all 36 adventures that have topics.

**Nine structural patterns recur.**
- **P1. The withheld thing.** A person refuses a stranger, and gives once the company knows their story, learned from
  someone else. Examples:
  - eelbell/people.kyr:74-84;
  - wetdrusilla/people.kyr:102 (Ravel's verse once he is known to have loved her) and :175 (Cleat's verse once the quay
    child is known);
  - overexall/people.kyr ("Tell Perrin where the Old Leaven came from");
  - windfall/people.kyr:52;
  - the-long-man/dale.kyr:278.
- **P2. The vessel.** One thing (a pot, a bell, a song, a gourd) is filled from many hands, each slot right or wrong. A
  failing master needs the company's body or senses, and the vessel is poured at a fixed hour. Examples:
  - leaving/pot.kyr:2-3, "The pot has four places and a fifth that has to be taught";
  - eelbell/foundry.kyr and hexworth/pour.kyr:72-84 (the bell, written twice and independently from one premise);
  - wetdrusilla, a song of nine verses, one per person who loved or robbed her;
  - weatherdrove, three voices of one call, held by three people;
  - raingourd.
- **P3. The professional on a deadline.** A lawful, sincere outsider brings a brute answer and an hour. The answer can be
  persuaded, made useful or sabotaged; let happen, it is a named ending. Examples:
  - tailrace's gauger (folk.kyr:86; the Boiling Day);
  - goingbank's pinwright (folk.kyr:67);
  - weatherdrove's rainmaker and his gun (folk.kyr:79);
  - windfall's bailiff with a writ (people.kyr:81);
  - leaving's reeve and his swan;
  - Over Exall's Captain Saley, whose own old harpoon is in the whale.
- **P4. The two silences.** Two estranged people each hold the other's missing fact, often a hidden kindness. The company
  carries it across, and the resolution needs both. Examples:
  - warmwall/endings.kyr:92-94 (`bothEased`);
  - weatherdrove/folk.kyr:192;
  - eelbell/people.kyr:125;
  - leaving's father and son;
  - wetdrusilla's daughter and her dead mother;
  - skerrow/folk.kyr:148.
- **P5. The living wonder on the march.** A wonder advances a step each night, and is to be guided, not killed. There are
  several independent ways out, any two of which convince. Doing nothing ends strangely, not in catastrophe. Examples:
  - windfall (`walked()`);
  - goingbank ("four independent proofs; any two make the truth believable", story.md);
  - tailrace;
  - weatherdrove;
  - half-the-hive;
  - Over Exall (three lifts, two raise it).
- **P6. A hidden measure of regard.** Examples:
  - wetdrusilla `warmth()`, skerrow `love`, hessel's goodwill, quittance's regard, book-of-faces' per face,
    sallowfield's nerve;
  - Over Exall's `lifted()`.

  The player is never told the threshold. Integration today mended two such measures by hand, telling each as a quiet note
  as it crosses (OR-1113).
- **P7. The public occasion that gathers every thread.** Examples: a court, a hearing, a moot, a calling, a ball.
  - The repertoire already asks for a moratorium on it as the climax (repertoire-2026-11-03.md).
- **P8. The child who holds the missing part.** Examples: Posy's hum, Nettle's Calling, Pipit's knot-cord, Tiggs's verse,
  Pen at the hatch, Mabet. This is a role, not an arc.
- **P9. The dawn composed from what was done.** Fates fire before the ending, written as rules strictly ordered ahead of
  it. Examples: warmwall/endings.kyr:92-95, weatherdrove/endings.kyr:77, Over Exall's aftermath rules. Its authors ask
  for an aftermath form (AU-24, OR-781).

## What the engine already has

The pieces exist, but nothing joins them to the authored adventures.

- **Roles bound to a host town exist for one going-on.**
  - data/goings-on/quarrel/module.json imports `town`, `taproom`, `shop`, `shrine`, `keeper`, `trader` and `priest` as
    roles.
  - data/scenarios/quarrel.scenario.json binds them to a generated town, and hessel-quarrel.scenario.json binds the same
    quarrel inside an authored city.
  - It also states how the quarrel stands when no clock runs (`unclocked`).
  - It is the nearest thing to a kit today. Its prose names roles (`{keeper}`), which is the prose risk in small.
- **Kits with slots and Deem proposals exist,** for the world's furniture rather than for stories:
  - data/kits/bounty, toll-road, raider-hold, tinker and word;
  - the engine side is src/world/compose/kit.ts, binder.ts and proposer.ts.
- **Situations with role tables exist,** under data/situations/ (caught-below, den, brood-hollow, arcology…). The data
  README requires that "a situation must install in at least two settings". caught-below's README states the contract: a
  situation never names a site's place.
- **Kyr keeps the semantic forms a kit's beats would be.**
  - `Situation`, `Incident`, `Core` and `Turn` (src/lang/situations.ts), used in raingourd/gourd.kyr:5-11 and
    data/openings/adit.
  - `Occasion`, `Promise` and `Route` also survive compilation as objects.
- **The variety study already drew the boundary** (doc/architecture/mission-22/variety-study/report.md §6). A reusable
  shape owns its roles, causes, clock and outcome facts. The adventure owns every sentence that carries tone, and a shape
  is never installed on its own. Its §4 names the missing capability: the assembler cannot see people, so a kit cannot ask
  a generated world for "a town with a bell-ringer and a grieving widower".

## The five strongest candidates

I ranked them by three things:
- how many adventures share the shape;
- how cleanly the roles come apart from what is particular to a setting;
- how much of an author's prose survives the abstraction.

### 1. The withheld thing (P1)

The most portable, because it takes almost nothing from its environment. It is present in every adventure.

- **Roles:**
  - the keeper, who holds a thing and refuses a stranger;
  - the source, someone else who knows the keeper's story;
  - the thing itself.
- **Arc:**
  1. the refusal, which says what it would want (Over Exall's Marta: "I will not give it for a joke");
  2. the story learned from the source;
  3. the return with it;
  4. a different silence, then the gift.
- **Gates:** `knows(story)` opens the gift. Telling the story where it wounds is its own act, with its own cost
  (eelbell/people.kyr:125).
- **Environment:** two people with a tie, and somewhere the keeper keeps the thing.
- **Evidence:** wetdrusilla (seven verses), overexall (the leaven and the tan-liquor), eelbell, windfall, the-long-man,
  leaving.
- **Risk:** "generic NPC persuasion" is what the repertoire forbids. The kit should hold the topology only:
  - a refusal that names what it wants;
  - a source who is not the keeper;
  - a return.

  Its lint is the useful part. Two of today's mends were refusals that said only their words, and they now teach what they
  ask (OR-1114).

### 2. The vessel (P2, with P8 and P1)

The strongest arc. Six adventures share it, and two were written independently from the same premise.

- **Roles:**
  - the failing master, whose ear, hip or hands are gone ("you are my hands");
  - three to five holders, each keeping one part for a reason;
  - one holder who refuses (kit 1);
  - the child with the irreplaceable part;
  - the recipient: a town, a captain, a sea.
- **Arc:**
  1. the need named;
  2. the parts gathered, some wrong ones given freely;
  3. the master teaches how to tell right from wrong;
  4. the pour, at a fixed hour;
  5. the carrying;
  6. the reception, which the master cannot perceive.
- **Gates:** each right part is behind its holder's story. The wrong, tempting parts are given ungated.
- **Environment:**
  - a work-site (a foundry, a kitchen, a ship's galley);
  - a public place for the result (a tower, a table, a salt pan);
  - the holders' houses.
- **Evidence:** eelbell, hexworth, leaving, wetdrusilla, weatherdrove, raingourd. The eelbell author asked for it as a
  primitive: "a craft batch (ingredients, a recipe test, a result)" (doc/adventures/the-eel-bell/friction.md).
- **Risk:** the repertoire warns against one quality score for art or a meal, and leaving's `goodness() >= 5` and
  hexworth's tier are exactly that. A kit should own slots, each with its own check and its own consequence, never a sum.

### 3. The professional on a deadline (P3)

This binds best to a generated world, because the professional comes from an institution the setting already has: a
licence from the Rì, a Collegium, a Reeve's writ, a whalers' guild.

- **Roles:**
  - the professional: lawful, sincere, with an hour;
  - what the professional's answer would destroy;
  - an economic ally of the brute answer (the charcoal-burner, the salters, the tanner who would sell the hide).
- **Arc:**
  1. the arrival, and the hour declared openly ("I will tell you what and when, because I was brought up to");
  2. the company learns what stands at the end of the line;
  3. four handlings, each its own ending: persuade with proof, make useful, sabotage, or let it happen.
- **Gates:** a proof fact opens persuasion. Over Exall's harpoon head is stamped S.O. CLOUDGATE, and Saley's own
  history is the proof (weatherdrove/folk.kyr:88; goingbank's Varnish going down to see).
- **Environment:** an issuing institution, and a place the answer would be carried out.
- **Evidence:** tailrace, goingbank, weatherdrove, windfall, leaving, Over Exall.
- **Risk:** the stock antagonist. Every source insists the professional is not a villain, and the turn ("I will not shoot
  her with the other one") must stay the author's.

### 4. The living wonder on the march (P5)

The arc that hosts kits 2 and 3. It is also the corpus's answer to the wonder tranche: four of the five declared Wonders
are in adventures of this shape.

- **Roles:**
  - the wonder;
  - an elder who has seen it before (Dorcas; the blind elder at the Gape);
  - a denier (the reeve);
  - the professional (kit 3);
  - the child.
- **Arc:**
  1. a nightly step on a visible measure;
  2. several independent proofs or remedies, any two of which suffice;
  3. at dawn, an ending composed from which ways were taken.

  Doing nothing is strange, not catastrophic.
- **Gates:** each way out is an independent act. Proofs open "tell everyone", or the remedy that needs them.
- **Environment:** a terrain feature (a loch, a gorge, a shore, a ridge, the sky), a settlement, and a public place.
- **Evidence:** windfall, goingbank, tailrace, weatherdrove, half-the-hive, Over Exall, the-long-man.
- **Risk:**
  - the endings sprawl (repertoire item 9: the ending table has become the chief formal constraint);
  - the public climax is under the moratorium.

  The march's measure must be shown (OR-1113). Both of today's integrations had to tell theirs by hand.

### 5. The two silences (P4)

The kit most dependent on prose. It is on the list because it is the corpus's most moving shape, and the abstraction can
be very small.

- **Roles:**
  - two estranged parties, each holding the other's missing fact;
  - a go-between, often the child (kit 2's child, P8);
  - a joint act that needs both: the hatch, the three voices, the bell-rope, the scattering.
- **Arc:**
  1. each blames the other;
  2. one secret is found by evidence (a warm wall, a letter, a jib in a basket);
  3. it is carried across;
  4. the joint act, which either can refuse.
- **Gates:** the joint act needs willingness on both sides (weatherdrove/folk.kyr:192). A lie is an alternative gate,
  with its own ending (warmwall).
- **Environment:** a resource split in two: one spring with two pipes, one drove in two halves, a daughter and a song.
- **Evidence:** warmwall, weatherdrove, eelbell, leaving, skerrow, wetdrusilla.
- **Risk:** its whole value is the reveal. Abstract only the two halves, the carrying and the joint act, and never a line.

## Material demoted to the shared world

The owner asked how situations can be extracted even from material demoted to the shared world. The same five apply, and
the adventures' own words show where each could come apart:
- the funerals of wrayford and quiet-in-the-sky are vessels whose parts are permissions, not things;
- the hearings of quittance, skeel and low-water are kit 3 with an institution for the professional;
- hessel's matchmaking and the-grand-tour's petals are kit 1 repeated across a cast.

A demoted adventure would keep its prose as one binding of a kit. It would be "the Dryquay casting of the Vessel", not a
template with blanks, so a second setting brings its own casting and the first loses nothing.

## Recommendation

1. **Build kit 1 first, as a lint and a role topology, with no prose.** It retires rows at once: every integration
   mends refusals and talk that say only their words by hand. A kit-1 check would say, as an author drafts, "this
   refusal names nothing the company could bring back" (with AU-56 and test/small/inert-acts).
2. **Build kit 2 next, as the craft batch eelbell's author asked for.** Give it slots, each with its own check and
   consequence, never a score. Prove it by expressing the Leaving Supper's pot and Hexworth's pour in it, with their
   journeys unchanged. That is the test of the abstraction: two independent authors, one kit, both stories playing as
   written.
3. **Bind roles the way the quarrel does,** but let the installing adventure, or a setting's own casting file, supply every
   line. The kit supplies gates, beats and the clock. That is the variety study's boundary, kept.
4. **Make the one missing capability first:** people projected into the assembly ledger, so that a kit can ask a world for
   "a town with a bell-ringer and a grieving widower" (the variety study's §4). Without it, kits 3 to 5 can be cast only
   in authored towns.
5. **Do not start with a portable city-story.** It is kits 1, 3 and 4 composed, and composition should come after two of
   them each install in two settings, as the data README already requires of a situation.

The reference game is the place to prove it. Its tiny settlement has two traders and a shrine, which is enough for one
withheld thing and one vessel. Its question, whether a player would make a fifth expedition, is the measure: a kit is
worth having if the fifth return finds a new casting of a known shape, not the same one.

## What I could not check

- The seven undocumented adventures are read from their Kyr and endings only.
- I did not play the larger works. Their patterns come from the repertoire's own analysis and their headers.
- I counted topics with a grep, not by compiling.
