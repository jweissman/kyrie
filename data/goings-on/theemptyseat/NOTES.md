# The Empty Seat: notes

What it is for, who comes to it, and what is open.

The [final literary and language assessment](../../../doc/adventures/theemptyseat/review.md)
and [detailed friction log](../../../doc/adventures/theemptyseat/friction.md)
separate the executable proof from the promised kingdom saga and record the
post-rebase publication limits.

## Current slice

This is a standalone four-act causal proof in Dun Rìerdan and its gate cottages: the dead king's two sons, the
Queen's evidence decision, a compromised courier, an unexpected provincial visitor, the first incursion at the
north gate, and an expedition through a working Mathematical instrument into Earth. It is not the entire kingdom
campaign or a defeat of the dark lord. The Venturing Guild retains its
three-coin membership, level-three ranger for four coin, world-backed mathematical-relic lead and strange paper
prize. The shared succession facts live in [events.kyr](../../imbar/events.kyr).

The original forty adventure entries in [countries.json](../countries.json) introduce a member of their own cast through
succession and advancing-Ash rumours. Each area's Kyr now also has a `seat_reflection` exchange, earned by its own
local knowledge or events, which teaches a durable `seat_witness` record: a personal complication and a reason to
meet again at the council. The new council is a smaller proving slice, not a reunion of all forty witnesses.
The world-wide safehouse network and full cast integration remain open. The standalone module is not listed
as a province: the canonical Dun Rì overlay for metropolitan adventures remains an engine gap
([WM-06 / M19-107](../../../doc/architecture/open-register.md)), and placing this as a province would create
a second Dun Rì. This is a **landing blocker**, not an accepted exemption: `every-adventure-placed.test.ts`
fails for this module. The gate remains unchanged. Production integration requires the actual city overlay;
moving the book out of the instrument's scope would not solve it.

[The High City design chapter](HIGH-CITY.md) captures nine contrasting routes to
the throne, ten noble houses, the Black Pool and seven class-resonant paragon
questlines. It preserves the canonical tower identities and separates proposed
law, architecture and future quests from the playable proof.

### Decisions that return

| Earlier act | Later consequence |
|---|---|
| Keep the letters | A documentary claim survives a missed supper, but the letter-bearer can be detained on the sold route. |
| Burn the letters | The visitor travels without that identifying packet. Aled needs the visitor's freely given testimony beside Nerys; missing the encounter leaves an emergency command, not invented proof. |
| Stop Tarian before he rides | The route stays secret and the watch keeps its second escort. Confession gives a chance to intervene, not an automatic betrayal. |
| Send him, or let his departure hour pass | The enemy gains two companies on the blind approach and the watch loses an escort. Rerouting the visitor avoids detention without undoing the leaked approach. |
| Spend an escort rescuing the detained visitor | The visitor returns, but that escort misses the wall muster. Hospitality may earn help; it does not erase the cost. |
| Share one ration and stay after supper | The guest offers provisions or an escort, according to their actual drawn role, then accompanies the company to the council. A missed encounter does not grant its testimony. |
| Promise Seren shelter | Admitting the carts keeps the Promise; sealing the gate breaks it. Aled refuses a crown bought by shutting his neighbours out. |
| Recover the Ninefold Disk | Its actual carried item can be spent to hold the winch when escorts are missing. It cannot be spent twice or recovered from the ending's prose. |
| Hear Gareth's private answer, then ask him to muster volunteers | His coronation guard becomes one additional escort at the siege, once. The betrayed approach still brings the enemy's extra companies. |
| Accept the comic Guild title, then help Hest check the refugee roll | Listed carts require one escort rather than two. The order spends that actual number and the usual two stores; the joke becomes useful civic work. |
| Ask Cadi whether she is in Tarian's promised future | Her question opens an admission about his bargain, which can be taken to Hest or used to demand a useful warning at the council. |
| Make Tarian name the blind approach | The watch gains one defence point, once. The enemy's extra companies and the missing escort remain real. His warning does not reopen a sealed gate. |

Aled now speaks for himself. Gareth wants the crown and will not kill his brother for it; these are different
commitments. The royal household actually moves to supper, to council, and to the kitchens. Visitors arrive once,
and leave when their encounter is missed. The schedule advances while the company is elsewhere.

The council allocates stores and escorts, not decorative approval points. The generated attacking force is four
or five companies, with two more if the approach was sold. A full open-gate watch holds six, the spent Disk eight,
and a deliberately sealed gate seven; unanswered business leaves only three. The comparison settles the first
incursion. Ownership of the ward changes through the existing `holds` relation to Aled, Gareth's limited command,
or the occupying column. The refugee group is actually moved into shelter or left at the gate.

Burned letters require a witness who is present and able to testify, and whose confidence the company actually
heard. A saved `guestConfided` flag alone cannot make an absent witness stand beside Nerys.

### A court that does not wait, and a private answer

The death bell now starts the succession clock without a conversation with Rhun. Hearing him teaches the news;
it does not start or reset the world's clock. After three hours without an evidence decision, a living Nerys
publicly keeps the letters. Invitations, supper, council and the assault follow even if the company stays away.
An earlier decision to burn the letters remains irrevocable. Offstage events do not silently teach the company.

Cadi (25) and Tarian (27) are the proof's adult couple. She wants a shared road, not an extra place in his court
ambition. Her question gives the company a different entrance into his betrayal. At the council, Gareth demands
a guard for Tarian; Nerys asks for his information first. Naming the approach makes an actual defensive difference.
He then goes to the gate, rather than receiving forgiveness for a speech.

The command question and Cadi's answer occupy the same scene. If Tarian acts and the carts are admitted, she
believes his uncertain promise to return. Without that action she can love him and still leave. If he warns the
watch but the council bars the carts, she believes him without agreeing to wait indoors: she returns to the
safehouse outside the wall. Political success and romantic reconciliation are not interchangeable.

When the gate holds, a repentant Tarian returns to the palace kitchen. The company may hire him for three coin;
neither he nor Cadi is automatically enlisted. A previously hired Cadi remains with the company. The court's
presence query reads `joinedAs`, `memberOf` and wakefulness for companions rather than inventing an independent
location or moving someone out of paid employment. This subplot does not replace the existing adventures'
romances or pretend their full cast has been imported.

Admitted refugees now enter the **palace kitchen within the ward**, not the Guild safehouse outside it.
The royal household's kitchen move uses that same room. This corrects a physical contradiction in the earlier
proof: a flag saying "admitted" had concealed people still outside the wall.

This is a strategic pressure model in the manner of the corpus's siege rules, not a full tactical battle or an
assertion that an entire army disappears. The armies remain outside a successfully held city. The story is installed
as a chapter: its ending does not stop the world or prevent later newspapers arriving. Its epilogue is local to the
ward, not broadcast into a distant player's narration.

### Deem makes possibilities; Kyr makes events

[tables.json](tables.json) draws a coherent visitor profile: name, arrival, private difficulty and practical aid.
The kept-letter branch draws Gosse or Tallis; the burned-letter branch draws Bet Kettering or Agnes Ruddle.
[templates.json](templates.json) binds the same profile into the person's cast, the rendered words and `guestAid`.
These are seeded standalone appearances, not imports or teleports of people already installed in other adventures.
Preserving those people's full local state at a metropolitan reunion remains part of the city-overlay work.

The same templates draw the opposing force and a quiet supper beat. Kyr chooses the applicable visitor from the
evidence decision, moves people, consumes resources and enforces deadlines. It does not reroll a justification for
the player's outcome. The `supper` and `council` Occasions retain matters, participants and source provenance; the
shelter Promise retains its making and eventual keeping or breaking. No client phase machine or new language
keyword is needed.

### Firsthand, village talk, or the Evening Tattle

[news.module.json](news.module.json) binds a room and an existing local teller. The campaign installs it at Rhun's
square and Hest's safehouse among the gate cottages. It can also bind any village's exported room and innkeeper;
the short proof installs it at two different places with no replacement characters.

An event starts a delivery clock, not player knowledge. After thirty minutes a rider brings its edition and the
teller can discuss the confirmed bulletin. Gossip and lurid headlines are drawn separately from the actual event:
the speculation is marked as speculation. Neither channel advances or resolves the court's business.
The gate question stays open for fifty minutes, with the first assault at eighty: a nearby reader has time to learn,
choose an undertaking and intervene. A more distant reader may receive the outcome instead. This is an authored
decision window, not a pause that waits for the player to arrive.

Each edition is an ordinary carried item with an immutable headline and bulletin. Its Kyr reading action uses the
standard ownership, wakefulness and light guards and teaches the same canonical event as the teller. It renders the
headline and bulletin together; a `document teaching fact` alone would show only the fact. These editions therefore
have one authored Read action, not an additional generic Read row. Old papers remain old papers after new news, and
the teller offers the latest delivered stage rather than yesterday's headline. Hearing of the siege opens the same
optional council undertaking as learning it firsthand; reading never chooses that undertaking for the company.

The portable reporting kit is not yet installed at all forty provinces. Their existing hook blurbs introduce the
cast; they are not substitutes for event-gated reporting or outcome-specific local reactions.

The short proofs are [theemptyseat-pressure.test.ts](../../../test/small/theemptyseat-pressure.test.ts) and
[theemptyseat-news.test.ts](../../../test/small/theemptyseat-news.test.ts). They cover distinct evidence paths,
offstage pressure, a broken promise, physical relic sacrifice, saved consequences, delayed news, readable headlines,
unchanged old editions and coherent seeded roles. Literary and browser acceptance remain outstanding.

## Conversation audit: preceding corpus snapshot

These are the preceding full-corpus audit's counts, not a new census after the final story revision below.

The existing `InertCensus` / `Consequence` instrument was run over **all 42 authored campaigns**, with their whole
installed modules at seed `campaign`, not a sample selected after finding problems. It counted 4,136 topic
instances. The initial 1,367 flagged topics fell to 1,260, with no new allowances in the ratchet.

This is not 107 rewritten conversations: **103 were measurement corrections**, and four were content repairs.
The instrument had discarded every `said_` / `tried_` latch, including those read by a different answer, action or
rule. It now counts a question opening a later possibility; a topic closing itself or enabling only its own
recalled wording still counts as inert. Failed attempts with a meaningful subsequent path count too.

The content repairs make Pyne's fear open his preparation for an actual impediment, Hetty's ultimatum open her
backed testimony, Dorcas's offer open a timely warning, and Kit Lowes's frightened question open the existing
kindness and coercion choices. Those choices retain their costs, checks and consequences. Hessel's glove,
bell-peal and footman recollections remain deliberate respite, not a new bag of royal documents.

Two Empty Seat conversations also acquired actual downstream uses rather than merely passing the instrument:
Gareth's confidence can lead to a muster, and the goose title can lead to a better-organised crossing. The
witnessed claim now requires heard testimony and a present witness. Narrow source-backed proofs are
[conversation-consequence](../../../test/small/conversation-consequence.test.ts),
[conversation-replies](../../../test/small/conversation-replies.test.ts),
[conversation-pressure](../../../test/small/conversation-pressure.test.ts) and
[theemptyseat-conversations](../../../test/small/theemptyseat-conversations.test.ts).

The audit also indexes 459 taught local facts with no authored condition or route consuming them. These are review
candidates, not an automatic new defect count: another effect may carry the conversation, and a fact can be used
through a shared engine mechanism. Conversely, `knows` writing a journal entry is not proof of causal plotting.
In particular, the forty `seat_witness` records are still **future reunion hooks**, not forty implemented council
payoffs. They must not be cited as closed consequential conversations.

At that audit there remained 1,260 flagged topics and thirteen acts. Nor does a speaker with only flagged topics necessarily
provide an inert encounter: Marlin trades in tin, and Lowes already had consequential spoken actions. The
remaining inventory needs editorial judgement about respite, duplicated exposition, missing questions and
unpaid-off evidence. This pass establishes the full inventory and proves several repair forms; it is not a claim
of exhaustive literary acceptance or a complete forty-character reunion.

### Validation and remaining integration

The preceding focused checks passed fifty tests covering the conversation repairs, Guild surveys, witnesses,
three-act consequences, news and four repaired repository checks. Root and browser typechecks, lint and the
browser build passed. The broader fast gate previously passed 2,358 tests and failed five; four failures were
repaired and individually rechecked, but that whole suite was not rerun. The province-placement check still
fails, for the city-overlay blocker above.

The handbooks were regenerated; their four existing ancestry-reachability warnings are unchanged.
No browser journey, contact sheet, human acceptance, commit or landing is claimed.

The final revision adds four consequential conversations and source-backed checks for the deadline, private
answers, one-time defensive aid, actual paid recruitment and physical shelter inside the ward. Six provincial
exchanges now use less formulaic questions; four replace the repeated moral-and-royal-document structure with
embarrassment, disagreement or a material demonstration. Tallis's generated visit now belongs to a verger and
his parish cooks, not an unexplained boat crew. The full-cast reunion and metropolis placement remain open.
The initial herald exchange and running-betrayal caption retire with their stages rather than reporting yesterday's
crisis as the current scene. Final focused verification passes 51 tests, with typechecks, lint and the browser build
passing; no full-corpus recount or literary acceptance is implied.

## The Guild's commissions

The shared [venturing rules](../../rules/venturing.kyr) query actual nearby wonders and valuables. Hest's catchment
is the seven-tower ward. Membership works at every registered hall; a hall's keeper issues an unknown location
report, which teaches the company and opens the ordinary map and chosen expedition. Recovery closes the objective.
The Ninefold report remains authored because it also teaches the secret counting-room entrance.

There is no quest-count limit or fixed pool. New installations add surveyable finds; the query reads their live
locations and excludes wares, recovered finds and known reports. Containers qualify, and knowing a place does not
mean knowing every find within it. A moved report is withdrawn and its commissioned company warned.

An unchanged finite world can run out of unknown local finds. Hest admits that honestly. This delivers renewable,
world-backed commissions, not infinite new terrain: automatic site generation, a kingdom-wide hall network,
category or specific-kind requests, refreshed reports after relocation, and a distributed hireling roster are
not implemented. The goose certificate is a playable comic prize, not yet a generated funny-story commission.
The short two-hall proof, replenishment, save and warning cases are in
[venturing-surveys.test.ts](../../../test/small/venturing-surveys.test.ts).

## Five institutions, one human drama

This is the larger shape beyond the causal proof, **not a claim that every institution below is implemented**. The colours describe what an act offers,
never an institution's badge. Gold stays the player's chosen undertaking; a religious or political commitment
becomes gold when chosen. The other meanings remain knowledge, mathematical wonder, real danger and material gain.
No dialogue receives a colour merely because its speaker belongs to a guild.

| Dramatic institution | What it contributes | The price of its help |
|---|---|---|
| Blue: the Venturing Guild | Routes, surveys, safe beds and firsthand witnesses from the adventures. Hest can get the witnesses to Dun Rì; Tarian knows who carries their letters. | Publish a route to reunite the witnesses and risk exposing their safehouses, or keep it secret and lose testimony before the vote. |
| Violet: the College and the Tower of Doors | The Ninefold Disk can authenticate the king's old seals and expose an altered succession record. Researchers disagree about whether certainty excuses cruelty. | Spend the disk to hold a breach against the Ash, losing independent proof of Aled's claim; or preserve it and ask people to hold the breach themselves. |
| Chosen gold: the Cauldron, Judges and Scales | Sanctuary, oaths, law and the grain credit that keeps a divided kingdom fed. Nerys's word must survive without treating either son as expendable. | Accept an emergency levy that feeds the frontier but burdens the towns, or forgive debts and risk an army with empty stores. Neither policy is automatically the player's aim. |
| Red: the Teulu and territorial fighting halls | Tactical skill, escorts and the loyalties that make a ruler's orders real. Gareth must earn soldiers' trust rather than inherit it. | Keep the best fighters at the council, or send them to evacuate a threatened district and leave the royal brothers exposed. Arena skill must transfer to a real fight, not a ceremonial score. |
| Green: kitchens, markets and artisans' houses | Food, wages, gifts, repairs, flirtation and the ordinary pleasures worth saving. Guild beds depend on people who bake, clean and mend. | Open the stores to refugees at the cost of the coronation feast and profitable contracts, or keep the city comfortable while the roads fill with hungry people. |

Each institution depends on the others: the Guild brings testimony, the College tests it, the judges decide what
proof permits, the traders make the decision affordable, and the Teulu decides whether it can be defended.
The Ferryman buys the seams between them. A keeper need not be evil to sell a route for a child's ransom; a scholar
need not be foolish to conceal the one result that would ruin her lover. The player meets the person before the
political consequence.

### Beyond the proof: Act II's larger meeting

1. **Arrival, not a roster.** Returning adventure characters arrive in small, consequential groups: a shared kitchen,
   an interrupted rehearsal, an escort delayed at a gate. Each brings evidence, a practical skill or a relationship
   the player remembers. The other returning witnesses stay present through letters and specific testimony.
2. **A little happiness.** Cadi teaches Gareth how to lose a practice bout gracefully. Seren helps Nerys rescue a
   ruined supper without mentioning the king. The goose certificate gets the company mistaken for an official
   delegation. These scenes repay attention with a meal, an ally or a useful introduction.
3. **The confession has consequences.** Tarian's disclosed betrayal lets the company move the meeting; his concealed
   betrayal gives the Ferryman a hostage. Saving him requires more than absolution: he must carry a warning through
   a route he sold, and someone must decide whether to trust him.
4. **No safe order.** The breach, the grain convoy and the witnesses need help at once. Sacrifice removes something
   real: the disk, an escort, credit or a claimant's public standing. Proof kept in Act I protects Aled's claim but
   identifies the people carrying it; proof burned makes Nerys's personal credibility indispensable.
5. **The crown is a means, not the last scene.** Whoever is named must assemble a coalition against the dark lord.
   Gareth can relinquish his claim without abandoning his brother. Aled can refuse to buy legitimacy with Gareth's
   death. Romance, pride and private debts determine who stays when victory stops looking likely.

### Tremors beyond the hall

The reporting kit now carries actual shared events into another room's news and knowledge. The next implementation
should make existing adventures read those outcomes through their own
people: a trader extends or withdraws grain credit, an escort leaves for the frontier, a refuge admits a witness,
a scholar challenges a forgery, a lover sends a warning instead of a wedding invitation. Changes must be grounded
in evidence reaching that place, not omniscient narration. Preserve an adventure's local resolution; add a useful
human connection rather than replacing its premise with the main plot.

A funny story can be the Guild's invitation to a real site: the missing Inspector of Geese stole a seal, not just
a punchline. Mathematical relics, wondrous tools, sought-after gear and strange prizes should all use the same
survey-to-expedition contract. The prose varies because the people and finds vary, not because the engine cycles a
bag of unrelated errands.

## Act III sketch: the city at the door

**A proposed climax, not executable siege content.** Act II assembles people and relationships; Act III makes those
relationships answer an urgent practical question. Nothing below means the Ash caused the adventures' original
troubles. The Ferryman exploits losses, debts and badly understood wonders that already existed.

### The first bell: nobody will give an order

The Ash's armies stand at Dun Rì's north gate. Rain runs down their grey boards. Their fires are close enough for
the smoke to enter the oath hall. The siege engines have begun ranging the wall; the first shot interrupts the
advisors before anyone has welcomed the returning witnesses.

Haverick wants the grain released and the creditors guaranteed. Tallis refuses the guarantee's hiring oath. Varne
demands the gate sealed, including the people still outside it. Maelin asks whether the prisoners count as people.
Halm begins explaining why the ward calculations are wrong. Gundred bangs the defective coronation bell with a
spoon so that he can hear how little time the calculation has bought.

Gannick puts a cold loaf on the council table.

> "Who gets this? Decide that, and perhaps I can take an order from you."

Gareth asks the towers to recognise Aled. Aled asks who is going to open the gate for the families under the wall.
Neither request answers the other. Nerys takes off her widow's crown and sets it beside the loaf.

> "You can settle my reputation tomorrow. We have people outside today."

The player can back a claimant, propose an emergency captain under a binding public undertaking, or refuse the
throne dispute and organise the rescue directly. None pauses the siege. Naming an emergency leader does not settle
the succession by a hidden score; the terms, witnesses and dissent must be spoken.

### Three entangled jobs, not forty speeches

1. **Bring people through the gate.** The crossing must stay open long enough for the last families, then close
   against an advancing enemy. Earlier evacuation routes and reconciliations decide which passages and crews exist.
2. **Keep the city alive.** Grain, water, light and shelter need actual people, stores and working devices.
   A royal guarantee cannot conjure them. The supply witnesses can reveal double sales and recover held stock.
3. **Break the count.** The Ferryman's boards divide the city into assets to retain and mouths to discard.
   Testimony exposes who has already accepted that bargain; the Mathematical Age instruments can obstruct it,
   at a cost. The enemy still has an army when its arithmetic fails.

The player chooses which job to accompany and whom to entrust with the others. A friendship is useful because its
person has learned something or can do something, not because it fills a loyalty bar. Delegation may fail; an
advisor's persuasive speech is not proof of competence. The wall and gate remain a real tactical fight.

### The returning company: every area has a job

The rebase also brings in the Organ Stair. Marta Vellacott's reflection waits
for the mirror's answered signal, then nominates Gnomon before a king who would
discard the people whose labour an instrument saves. Her proposed siege role
is organising signal crews and carriers, with the Cut's fatal silence behind
her refusal to treat an unheard warning as no danger. This is a conditional
contribution to the sketch below, not a newly implemented capital reunion.

These are **conditional contributions**, not a requirement to finish forty adventures. A trusted witness can act,
an estranged one may bring a difficult bargain, and an absent one may send testimony already earned. Never invent
a completed local outcome. A dead person remains dead; a lost person is not conveniently recovered for the finale.
Letters, heirs and memorials carry what was actually preserved, and a missing contribution changes the available
plan. The core city retains a costly fallback for each job, so the siege cannot softlock on an unvisited province.

| Area and returning witness | Act III payment of the local thread |
|---|---|
| Merrowdale — Aldous Venn | Reads the water survey against his accounts. His wife's handwriting exposes an erased engineer; her testimony can recover a sluice plan, not absolve his stripping of the Long Man. |
| Thrume — Sir Odo Varne | Confesses his blank warrants before commanding an escort. Acknowledging the red-salt truth makes his soldiers protect miners rather than confiscate their stores. |
| Strewnfield — Kezu | Recognises the false lullaby at the ward door. Hanu shares the watch; Kezu refuses another solitary vigil. If the house was sold, its buyers must release access rather than pretending the sale never happened. |
| Corrow — Agnes Ruddle | Supplies names and rooms absent from the rolls. An empty royal entry is answered by a guest who still owes nineteen coin; her book protects people the count would erase. |
| Ghessil — Rusk | Gets the frontier blankets out of impound. Her missing poet is the sky surveyor Judith once waited for: detention, not silence, stopped the letters. Their reunion also exposes the copied orders. |
| Bowl of Ammerlin — Teodor Halm | Challenges his pupil's succession proof and the ward's census. He must admit which omissions were his teaching before anyone accepts his corrected calculation. |
| Ossel delta — Lucius Haverick | Names the Muster's people rather than offering their oaths as collateral again. Paid and unpaid veterans respond differently; buying obedience is not the same as earning it. |
| Vale of the Wray — Amos Pinch | Produces the six prepaid crossings. The tally gives a warning about an assassination order, not proof that its six intended victims must die. He must identify the payer in public. |
| Calamy — Bet Kettering | Puts the spoiled two-king proclamation on the table, then supplies the fish kitchens. She refuses to let a forgery accusation become another witch-hunt like her mistaken heron. |
| Vale of the Arle — Absalom Gosse | Turns the commissioned surrender pageant into a public contradiction. Clemency's authorship and the company's earlier treatment govern who will stand beside him. His voice buys attention, not an automatic victory. |
| Pellam — Amos Tallis | Crosses out the bondage clause in the emergency oath. If the ice's old bargain survived, he must acknowledge who still bears it before asking the city to swear a better one. |
| Lim valley — Mrs Abigail Cherrett | Sends Josiah's map through Mopsa, or brings it herself if alive. A last-dance reconciliation earns a reunion; her death instead leaves a letter and a dependent whose place at the table must be honoured. |
| Levels of Gaunt — Ninian Hern | Asks the advisor signing the evacuation order to bear its legal sentence if it fails. If Hern fled or cannot attend, his question arrives in his sister's copy, with the instruction about socks. |
| Gannet Reach — Mother Jago | Forces the charter's definition of a living thing to include refugees. Her godson repairs his copied exclusion by helping feed those it would have abandoned. |
| Wold of Hume — Kestrel Dunn | Puts rest stops back into the evacuation march. Her treatment of the old and the brocks supplies allies or an argument she cannot evade; the city's slowest people set the pace. |
| The Lull — Dorcas Trewin | Makes her royal correspondent answer promises outside sunset's undoing. She may accept him, refuse him or postpone him; nobody gets to treat her twenty years as a comic exemption from consent. |
| Larum and the Pass — Bet Garside | Gives the frontier drums their missing words. Survivors, mourners and any restored bread reach the same courtyard; the army must hear whom its heroic tune has left out. |
| Hollins — Jory Mudge | Opens his daughter's named model and organises shelter in spaces the siege engineer called empty. If the people of the wainscot were betrayed, the remaining names become an indictment, not a miraculous rescue. |
| Sennet — Peg Arklow | Reclaims the evacuation berths her brother sold as coronation seats. Their reunion occurs while guests are being asked to surrender tickets; the recovered tablecloth becomes a stretcher cloth. |
| Quittance — Mr Prest | Registers the condemned blocks openly. His intended comes for an explanation about the ring and stays to copy declarations; any surviving compact with the Fire determines which shelter can be offered safely. |
| Ombra — Ferris Moll | Fits the funeral measurements to their collector. Ordering a dying king's mask early did not itself prove murder; his beloved may be a witness, a coerced courier or the person who chose the bargain. Naming her requires evidence and consent where possible. |
| Tolleth — Captain Ingrith Bascom | Brings oil and a ship if the light and voyage allowed it. She puts her debt beside Rune's theft and refuses a pardon that purchases her loyalty by sacrificing the mate. |
| Tallow Edge — Lowen Pook | Traces the wages paid in her brother's name into the siege payroll. Finding a fraudulent account does not bring Abner back; whether he was recovered still matters. |
| Hesper Fells — Marra Tellis | Marks the rotten arch on the march order. Greta Hennick carries the warning if Marra stayed or was lost; a boy brought south is sheltered, not recruited. |
| Aldwater — Bess Lowther | Gives the ferrymen the last verse of Tom's song and their arrears. The tune can authenticate a signal when the court's orders are false, but a stolen or lost box is not silently restored. |
| Scarth Holm — Edmund Seddon | Holds the tide window with Hettie only if she chose it. Apart, lost or still at the light remain different situations; his old habit of volunteering her future cannot become a heroic solution. |
| Vale of the Brimble — Nan Ashworth | Breaks the double grain invoice and turns the cellar into a ration point if it survived. Fothergill's violence does not disappear because a different captain now needs supper. |
| Sere country — Hannibal Muckle | Admits he admired the seal while his daughter did the sums. Allocates water with the coast rather than promising the same rain twice; an injured salt economy still needs compensation. |
| Quillet washes — Perpetua Sount | Repairs the alarm bell with her apprentice instead of letting the court prosecute the apprentice alone. The tide-bell's earlier tuning decides whether a good crew or extra lamps must carry the signal. |
| Hexworth country — Gundred Ludlam | Traces the foundry key and names Edric without turning grief into permission to condemn every clerk. Her material knowledge decides which bell metal can safely be reused. |
| Seethe country — Maud Veale | Pairs the two wheel crews through the hatch, or negotiates across a wall that still stands. Nesta gets her own voice; a previous lie about the spring cannot become effortless reconciliation. |
| Haddle country — Captain Hester Gannick | Rejects payment in drowned Skellet and asks for a practicable commission. Imke's presence or absence changes the reunion; the meal the player made determines what she believes of their promises. |
| Lantana Cay — Oyelle Marre | Refuses private ownership of the weather. Her lesson can arrive by letter; if she travels, the city supplies help on both sides of her, as the goat-track taught it to do. |
| Saltings — Tamsin Soames | Shows what living roots hold back and plants the graft she saved. A burned orchard offers neither free timber nor an army of trees; earlier care determines whether any living defence remains. |
| Gape country — Pipit Anstey | Corrects the nine-pace gap from a protected map table, with a responsible adult listening. The moving bank's actual fate changes the route. She is never sent to scout the siege. |
| Tolt shore — Mabet | Supplies the mill's oil figures from the kitchens. The calf's actual fate stays in the room with her; the city must hear the arithmetic without asking her to excuse what was done. |
| Ebb — Captain Pomfret | Brings a chorus and a crew, where the voyage permits it. The long song identifies the water-carriers and assigns shifts; the shortened royal version is no longer enough to give orders. |
| Brackmoor — Judith Sowden | Rejoins the detained surveyor Rusk has been seeking. Resolving a missed wedding visit supplies a corrected cloud-lane chart; it does not summon a whale that was driven off or killed. |
| Summermark — Maelin Vale | Puts the omitted open hand beside the steel on the royal banner. Freed treasure-seekers can help at the wall; Arda's book and the returned bell contribute only if actually recovered. |
| Cleave — Hesper Lunn | Opens the old royal birth register and insists the mother be named first. The entry concerns the dead Rì's own birth, not fresh proof of Aled: burning Seren's letters remains a real sacrifice. Her bridge and birth work inform a protected infirmary. |

### The second bell: the offer that almost works

The Ferryman sends eleven chairs and a twelfth place left empty. His terms preserve the advisors' estates and the
city's monuments. The people outside the rolls are not mentioned. He has bought promises, not invented every
disaster: several advisors signed because they believed surrender would save their own dependants.

The procurement witnesses assemble the common pattern from independent records: the same grain sold twice,
evacuation places sold as honours, workers omitted from the march. None alone proves the whole plot. The player
can distinguish fraud, coercion and an honest mistake; treating every implicated clerk as a traitor loses the
very people who can open the stores and mend the bell.

Gosse's surrender speech is performed at the gate exactly as commissioned. The enemy begins to advance. Then he
reads the missing stage direction aloud: the people to be left outside. Bet holds up the fish-wrapper version;
Haverick names the sold oaths. This is a revelation the assembled public can verify, not a spell that defeats an army.

Tarian appears to betray the new meeting place. If trusted with the decoy in Act II, he has instead led the
Ferryman's listeners to the empty rehearsal room. His old betrayal is still true. He must admit it where the
witnesses can hear, and he may refuse or fail the second journey. Without him, Cadi must use a slower warning route,
leaving fewer hands at the gate; do not manufacture a redemption the player never enabled.

### The third bell: someone must spend something

The repaired bell rings. The siege engines are close enough to answer it.

The Ninefold Disk can hold the ward long enough for one movement: the families coming in or the relieving company
going out. Spending it destroys the independent seal proof sought in Act II. If it was lost, the city can hold
the passage by fighters and lamps at a greater cost; no irreplaceable prop is required to finish.

Gareth's clean claim, Aled's uncertain one and Nerys's word now face the same test: **give a useful order, accept its
cost, and remain answerable to the people carrying it out**.

- **Gareth can claim the moment** by taking the gate command while publicly refusing a coronation until the
  refugees are in. He accepts Varne's testimony against the court and pays the ferrymen before paying the feast.
  Aled can insist on the rescue plan rather than being packed away as Gareth's protected symbol.
- **Aled can claim it** by asking the towers to entrust him with an emergency mandate, not pretending the burned
  proof survived. He gives Gareth independent command and names Nerys as guarantor. He must win people who have
  reason to distrust a stranger, and cannot demand their faith as an inheritance.
- **Nerys can hold a regency** if neither son can assemble the company. She gives up the private protection she
  purchased with concealment and submits her orders to the same public undertaking as everyone else.
- **An emergency company can succeed without a coronation.** The player and a consenting captain may hold the
  city under a limited command witnessed by the towers. This is an earned coalition, not a secret chosen-one route
  or an automatic grant of the crown to the player.

Success requires the gate held, a viable supply plan and the Ferryman's immediate assault broken. Correct papers
alone do not win; a victorious sortie alone does not feed the people behind it. Let the final tactical clash
target the counter standard and siege train while the other groups keep the city functioning. The dark lord must
commit his own power when his lieutenants' bargain fails; the company confronts him at the gate, not in an unrelated
late dungeon. Defeat need not be execution: breaking his claim on the city and forcing withdrawal is a genuine,
visible victory. There is no cost-free ending in which every relationship is repaired.

### Morning: the seat is filled by an obligation

The coronation, if earned, takes place on the gate stair among the returning workers and fighters. Gosse has
forgotten the formal speech. Somebody brings the cold loaf. Hesper demands a chair before she approves anything.
The goose certificate turns up as the only dry sheet large enough to record the undertaking.

The repaired kingdom has consequences away from Dun Rì: wages paid or still contested, refuges honoured or closed,
dead people remembered, lovers reunited or honestly parted. The end reports which districts got through, which
resources were spent and whose trust was broken. A military victory with debt-bondage intact is **the rented
crown**, not the same success as **the open gate**. A saved company abandoning the city is **the road out**,
not a victory screen. The question is not whether one person silenced the advisors. It is whether one person
helped them do something together that they could not do while arguing.

## Act IV: the implemented mathematical expedition

[The Unspent Door storyboard](ACT-IV.md) names five principals and eight scenes,
with three contrasting movements: domestic aftermath, experimental exploration
in another plane, and one bounded strategic commitment. Its executable source is
[expedition.kyr](expedition.kyr).

The Equivalence Engine moves the actual trial bowl to a ledge in Earth. Its
record room and lost-property alcove are also in Earth, reached through the
tested passage, not an ungated shortcut. An occupied or vacant station changes
how its limit is learned. No proof supplies unseen occupancy or the third
socket's properties. Physical measurement remains an alternative to a difficult
mathematical check.

Three optional episodes have concrete payoffs without committing the engine:
returning a household ledger for supper, buying Earth salt with a meal, and
recovering a courier's balanced pocket clock for two actual meals. The third
socket is a separate, openly dangerous experiment. Retreat remains possible
after an unused disconnection, a civilian crossing or the military exchange.
The latter moves a real counterweight and breaks one enemy supply span; it does
not erase the army, the earlier incursion, the chosen ruler or a betrayal.

The enemy's construction clock starts independently after the incursion.
Eight hours after the kitchen lead is due, the counterweight is fixed even if
the company never investigates. Kept records save survey time; Tarian's bracing
opens the shorter route; an earlier rubbing reduces calibration food; Cadi or
Nerys can prepare a cheaper civilian crossing.

Halm's identity, reports and caution now open an early introduction with a
usable diagram, without claiming that the company heard the Reckoner. His
aftermath answers supply distinct copies. Fabian supplies a door-load diagram.
Martin's circular clocks open a question to Gammer Coller, whose independent
water measure supplies another rubbing. Mared reads their shared canonical kind
for a real later calibration advantage.

Mathematician grants Mathematics and guaranteed proof checks on encountered
evidence, retaining its intelligence and Lockwork. Other mathematical attempts
roll at DC 30 or above when trained, DC 35 without training; natural twenty is a
breakthrough. Dead or stunned
providers cannot supply the guarantee. Creation now retains the selected perk
in the campaign's character context rather than silently dropping it.

The ordinary-remains kit adds a Mathematical trace on four of twenty draws in
generated works with a recognised inner way. It writes ordinary Kyr: a contested
interpretation and a portable rubbing, **not a marvel**. Purple remains for
actual wonders; there is no additional client lens or coloured narration.
Rubbings, the courier's salt and the delivery clock are research or trading
gear, not authored treasure-cache placements.

### Measurements and limits of the Act IV proof

- The source contains **33 table-selected delivery slots out of 38 (86.8%)**.
  This counts whole deliveries, including multiline observations, not generated
  words, unique stories or the plot graph. Station names, occupancy and testimony
  reuse one coherent Deem draw.
- A fresh census of **all 42 campaigns** retires twelve topic flags:
  **1,260 → 1,248**, with **no additions**. Thirteen flagged acts remain.
  The shrink-only baseline records the exact removals. No census logic was
  changed in this pass; an answering link is distinguished from a decorative
  knowledge grant.
- The focused source-backed proofs cover planar exchange, actual gifts and
  returns, optional episodes, one-use outcomes, a missed deadline, replayed
  profiles, ordinary traces, true-wonder opportunity and mathematical check narration.
  Static census results alone are not reachability or literary acceptance.
- Final root and browser typechecks and lint pass. The focused run passes
  **73 tests and 537 assertions**, including the complete inert-topic ratchet.
  The broader fast gate passed 2,373 tests and failed four: its three new
  architectural regressions were repaired and rechecked in that focused run.
  The province-placement failure remains blocked by WM-06 / M19-107; the whole
  fast gate has not been rerun after those repairs.
- The browser bundle builds, and the handbooks are regenerated. Their four
  existing ancestry-reachability warnings remain. Mathematical traces bootstrap
  their own Deem tables rather than importing character generation; checks use
  the installed traits and conditions ports. No architecture baseline was widened.

This remains a bounded city-and-expedition proof. Arbitrary planar destinations,
physically simulated load limits, a full siege battle and forty-character
metropolis convergence are not implemented. The city-placement blocker remains
open. No browser journey, contact sheet, human acceptance or main landing is
claimed; branch review and publication evidence live in the assessment linked
above. The final war act and the lower door remain directions, not shipped
endings.

## Mathematical-world follow-up

[Books, ruins and earned senses](MATHEMATICAL-WORLD.md) separates ordinary
mathematics from true wonders. The implemented additions are five table-selected
antique-book profiles with real location leads, more common non-purple research
remains, recurrent Numbered Houses on available ground, the counting glass's
saved structural sense, and ordinary astronomy earned from the star-tower
orrery. New book and glass conversations are checked for actual consequences.

The Mathematical Orrery, its three-dimensional stellar map and the next eclipse
remain a designed direction. The current constellation drawings do not supply
the orbital model needed to make those predictions honestly. Repeated counting
glasses do not yet supply seven different faculties; the portfolio records
their intended composition rather than claiming it is built.

The follow-up passes 30 focused tests across ten files, with 204 assertions.
Root and browser typechecks, targeted lint and the browser build pass.
Handbooks were regenerated; the generator reports four problems, which this
follow-up does not resolve. That follow-up did not rerun the earlier full-corpus
conversation census, an assembled-world population census or visual acceptance.
The later publication checks reran the inert-act ratchet and retired two more
Wrong Boat topic entries; that is not an assembled-world population reading.
The work is carried on the `copilot/empty-seat-saga` review branch; this
follow-up does not claim to resolve the capital-overlay blocker.

## Before you hand it in

```
The author's path (doc/authoring/checklist.md), in this order:
  bin/kyrie names <Surname> <Place> ...           is each name free, across every adventure?
  bin/kyrie lint data/campaigns/theemptyseat.campaign.json   does it load and lint clean?
  bin/kyrie play data/campaigns/theemptyseat.campaign.json --choices   does it play as you meant, by hand?
  bin/kyrie inspect --why fact data/campaigns/theemptyseat.campaign.json "<fact>"   why is something so, or not?
  bin/kyrie reach data/campaigns/theemptyseat.campaign.json --detail   what does a curious player never reach?
  bin/kyrie voice repeats data/adventures/theemptyseat   which of your phrases come again and again?
  bun test test/theemptyseat.test.ts   do its journeys play as written?
  bin/kyrie verify theemptyseat [--played "who, when, how far"]   all of it at once, before you hand it in
People or scenes in files of their own, if you like: bin/kyrie new character <id> --in theemptyseat [--major|--companion|…], bin/kyrie new scene <id> --in theemptyseat.
```

Human play is evidence of its own: say who played it, when and how far (`--played`), or verify says none.

The campaign's company is a test company of one, Tester: no line of the adventure names them, as no line names a player's company (a player comes with their own).
