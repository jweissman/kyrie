# Quittance — Stage 2: severe editorial review of the Stage 1 design

I read `01-design.md` as a hostile editor would. These are the findings, in order of damage, and what the design now
does about each. Findings carry an id (R1…) so the final critique can say which were honoured.

## R1. The city is described, not alive

*Finding.* §5 lists a Slate, small fires, hours and idioms. Every one is an ambient promise that, left as prose, becomes
wallpaper. A city is alive when it does things the company did not ask for and when the company's presence is *noticed* by
a schedule.

*Revision.* Commit to a **small number of real clocks**, each implemented as a rule and each visible from at least
two districts: (a) the **Slate**, rewritten each morning from a table of claims that open on a day and close on a day;
(b) a **morning fire** in the Brickfields on days 1, 4, 7 with a brigade contest (Mark Street is the first, and the
others are *the same event done by the world without the company*, so the rivalry is established as routine and the
company sees how it goes unattended); (c) the **lamplighter's dusk round**, which relights real lamp-things;
(d) the **Exchange bells** at nine and four, and the **Arch closing** at ten; (e) the **Night Market**, which exists only
after dark and does not exist by day; (f) **Prewitt's schedule** (a Pursuit) between Phoenix House, the Hall, and Lantern
Hill. Everything else stays prose. The city's idiom is carried by the *wording of every offered action* ("Take the claim
on the Mark Street fire", "Lodge a counter-claim").

## R2. Several small quests are request → action → reward in costume

*Finding.* Honest test against the seven-point rule. Failures: **The Lamplighter's Round** (seven lamps is seven
conversations; sentimental). **The Cold-Lamp Demonstration** (the mechanism was never designed: "rig it to fail" is a
verb with no object). **Pip's Tin** (sweet, but the only decision is "be kind"). **The Bakery Inspection** (a fix-it
with no person who wants anything the player might dispute). **The Penny Mutual** (find the treasurer: a tracking
task). The strong ones — Mark Street, the Annuitant, the Wake, the Queue, the Surveyor's Daughter — each have an
actual *dilemma*, whose resolution costs someone something.

*Revision.* Every quest now has a **named dilemma** and **a thing that goes wrong that the company could have
prevented but not both**:

| Quest | Dilemma (the decision that matters) | Complication that changes the reading |
|---|---|---|
| Mark Street | Save the house, or win the precedent? (A bucket-line saves it but ends the dispute in the Phoenix's favour *wrongly*; certifying the mark is slower and the family's furniture burns.) | The Lamprey captain is correct about the mark; the Phoenix captain is correct about the law. |
| Annuitant | Protect seven people with a lie, or tell the truth to a man who will use it? | The family *honoured the wording*; the lie is a form of truth. |
| Scuttled Barge | Whose salvage, whose fraud, whose girl? Handing in the fraud returns the girl to the list. | The owner is the girl's mother's employer; the fraud *saved her*. |
| Lamplighter's Round | **Four** lamps, each a different kind of problem (a lamp that needs a mantle, a lamp over a quarrel, a lamp a child has hidden in, a lamp that is out for a reason). Decide how he is retired: pension, a place at the Hall, left to finish, or told. | The old man *knows* the pilot-flames are answering and has told no one, because no one asked. |
| Teague's Wake | Which Rosalind; or do you tell either what her husband actually said? | The parrot's last words are not about Rosalind. |
| Cold-lamp | Whose failure do you stage, and what does it cost the inventor's sleep? **Mechanism designed:** each lamp holds a *glass-bound spark* which must be *vented* every night; the demonstration fails if unvented. The company can vent them (honest help), leave them (honest sabotage), or vent them *into the Gas Company's boiler-room* (the cheeky option). | Wynne realises her lamps are *slaves*. |
| Penny Mutual | Bring the fund home with your own coin, or let the club find the real culprit and lose the thing that made it a club? | The treasurer was bought, and the club has *voted* to forgive her. |
| Pip's Tin | The coal is dying: sit with it (cost: a night) or carry it to a place that will keep it (cost: Pip's company). Either way the coal wants **a name**; what the company gives it is recorded and heard again in the Descent. | The name given matters to the Fire. |
| Surveyor's Daughter | Is Ianthe's integrity a thing the company respects? Helping them elope saves a romance and ruins a career; forging the survey saves the family and corrupts the one honest surveyor. | She has *not* written the Decline; she is deferring it. |
| Forger | Report her (reward), join her, upgrade her marks, or fix the Phoenix hunter's mind. | The marks *work*, some of the time, and she knows why. |
| Queue | Pay the claims fairly (Fisk wants to) or break the Queue? Eleven hundred cannot be paid; pay representatively and the rest leave. | One claimant is alive; one claim is for the fire. |
| Bakery | Pass the survey honestly (a fix), pass it by showing her oven's fame to the committee, or lose cover and rely on a mark of one's own. | The oven's draw is a Lent coal. |

*Cut.* The Lamplighter's seven lamps → four. Wake's "propose a settlement" kept but with a cost. The Forger quest is
shortened to three scenes. Pip's Tin and the Bakery Inspection stay but are no longer allowed to be pure comfort: both
have a clock.

## R3. The satire is a long passage of dialogue

*Finding.* In the draft the Offices are funny only if people talk about them. The satirical engine — rival
brigades, marks, premiums, Declined houses — has to be something the company *plays against*.

*Revision.* Three small **games** carry the satire mechanically:

1. **The Mark Street Rule** (marks as a rules-game). Brigades obey a table of facts: a mark on the door, a mark of the
   Office who attends, a certification by a third party. The company can alter exactly those facts (move a mark, certify
   a mark, challenge a mark, bribe a captain, burn a mark). Different facts, different outcomes.
2. **The Honest Bell** at the Arch. It rings when a declaration is false. The company decides what to declare *and what
   it intends*; the Bell punishes the false and rewards a curious truth (a true thing said oddly is accepted).
3. **The Hearing** (an `Occasion`): four matters, five Offices, a vote each. The company's *regard* with each Office is
   accumulated by small adventures and lost by bad ones.

## R4. Do people change their minds for reasons other than evidence?

*Finding.* In the draft Prewitt, Cray, Garrity and Gaunt all "change their minds when shown X". Worse: three of the
four were to be convinced by documents.

*Revision.* A table of **levers** per principal figure, each different, none a document. Documents are one lever for
Ashby alone (who *is* evidence).

| Figure | Levers (any one moves them a step; three turn them) | What does *not* move them |
|---|---|---|
| Prewitt | **Witness** (to stand with him in the ward on the Night); **kin** (Ottoline's request); **arithmetic** (a better sum: General Average); **grief** (Margery's coal, kept by Quill) | The Ledger, the Roll, the Tables: he wrote them. |
| Cray | His mother (he grew up in the Mortmain almshouse); a witnessed kindness; being offered a better bonus | Evidence of the fraud: he already knows. |
| Garrity | Her crew's safety; being *asked* instead of ordered; a public win over Dree | Argument. |
| Dree | Being out-bargained; being named in the Slate as generous; his fear of Garrity | Sentiment. |
| Gaunt-Halloran | Flattery; profit; a gas-hearth; a role in the ceremony | Any appeal to the poor. |
| Ianthe | An example (a colleague who bent a rule and was right); time; Tobias's honesty | Pressure. |
| The Fire | Being attended; being named; the Return said; an apology made by someone who owes one; terms | Threats (they enrage), bribes (they insult). |

A person can be moved *in a direction they would not have chosen*. Garrity's change is the model: she helps the
company at the Night because they asked her, not because they proved anything.

## R5. Are there real alternatives?

*Finding.* The two approaches were drawn as "social" versus "dungeon". The Hearth Night risked being a fetch
list (visit six wards, collect six tokens); the Descent risked being "reach the end and click Talk".

*Revision.*
- The Hearth Night is a **budget problem**: each ward needs *coal, fuel, a bearer and a reprieve* (an exemption from
  the Ordinance for that night). The company has limited time on Reckoning Eve and cannot do all six; which it
  skips is a moral decision (the Wards come last by the city's logic, and the Wards are the ones who need it most).
  The wards give back differently (the Foundry's furnaces can light the others; the Wharves' lightermen carry coals
  across the river; the Hill can fund). Count `lit` wards 0–6; the Hearth Night is decided by the count *and which*.
- The Descent is a **route and endurance game**: four ways down, each with a toll; the Slag Galleries have heat
  (a measure), shade (places), glass (fragile things), and the Queue (a literal queue that blocks a corridor); the
  Vault has a notarial lock needing a phrase. The Fire's parley is a **mood game**: five stances, each with its own
  offerings, none of which is "evidence".
- **Hybrid** endings exist: General Average needs the Offices (Hearing) *and* the Fire's consent (Descent).

## R6. Does the adventure reward different builds?

*Finding.* The draft listed skills but not where they bite. A warrior without charisma had Mark Street's bucket-line and a
Wharf fight; a mage had "lore" in three places and nothing else.

*Revision.* A build matrix, verified in Stage 5, designed so every skill and the commonest kit (coin, a rope, a lantern, a
holy symbol) has at least three **non-redundant** uses and no build is locked out of either finale:

- **Brawn/warrior**: Mark Street bucket-line; hauling the diving-bell chain; the Wharf crew; the Torchmen at Candlewick
  Court; the Slag Galleries' glass-men; the Slaying.
- **Stealth/thief**: moving a mark; the rival salvors' yard; the Cinder Gap entry; the Surveyors' Roll; the Penny
  Mutual's treasurer; Candlewick Court's arson prevention.
- **Lore/mage**: the manifest; the Policy wording; the Cold-lamp's glass; the Vault's notarial lock; the Fire's idiom.
- **Rites/cleric**: the Queue; the Return (the only way to *say* it besides Quill); the wake; healing at the Night.
- **Persuasion/bard**: the Declaration Arch; the Hearing; the wake; the captains; the Surveyor's courtship.
- **Insight**: Cray; Prewitt's grief; the parrot; Gedge's marks.
- **Mending**: the Candlewick wounded; the Night.
- **Trapwork/lockwork**: the flue; the Vault; the strongroom.
- **No relevant skill**: a plain companion with coin and a lantern can pay claims, carry coals, sit with the Fire and take
  the Candlewick fight, and can recruit **Ashby** (lore/insight) and **Tobias** (brawn) to fill gaps.

## R7. Too much exposition; the Fire's secret is too easy to tell

*Finding.* Ashby, Quill and the Fire each hold part of the truth and the draft let each recite it. The mystery
dissolved into three monologues.

*Revision.* The truth is **assembled from objects and events**. The Treaty is a physical document in the Vault with
clauses the company *reads off* one at a time (and not in order); each small adventure seeds a physical fragment or
a fact the Treaty explains: the Annuitant's wording (Honora's drafting style), the Lamplighter's pilot-flames (the Fire's
presence), Pip's coal (the Lent coal), the Queue (the Tithe is a *debt of the burned*), the Bakery (the draw), the Wake
(the way down). Ashby gives numbers; Quill gives fragments; the Fire speaks in the fewest words in the book. Nobody
delivers the history in a paragraph; the company reconstructs it, and the game says which pieces they hold.

## R8. Comedy has to be earned

*Finding.* Jokes in a draft are plans for jokes. A joke is earned by a setup that is paid.

*Revision.* Four running gags, each a three-beat structure: (1) the **Honest Bell** rings for the wrong person at the
Arch (set-up), again in the coffee-house (second), and at the Hearing for Prewitt (payoff); (2) **the mark that is
always on the wrong door** (Mark Street, the Forger, the Bakery's missing mark, the Wards' counterfeit plates);
(3) **fusby the parrot** (the Wake's evidence; reappears at the Descent with directions; at the Hearing as the
only witness who cannot be bribed); (4) **everything is quoted a premium** (shopkeepers, ghosts, the Fire).

## R9. Does a character meaningfully change?

*Finding.* In the draft only Prewitt was designed to move, and his move was binary.

*Revision.* Four **arcs** with explicit stages the world remembers (a measure, not a flag): Prewitt (hard → shaken →
open → turned; or hardened), Garrity (rival → asked → partner), Ianthe (deferring → decided), Ashby (silent → speaks).
Their stage at the Hearing selects what they do there.

## R10. Scale

*Finding.* Twelve quests, six districts, six endings and two finales is more than can be finished at quality in the
available time, and a wide thin Quittance would fail every criterion above.

*Revision.* A **depth budget** and an **order of work** (see `03-engine-plan.md`). The kernel (city, Arch, Slate, Offices,
spine, endings) comes first and is owned by me; quests are authored against a fixed kernel contract in their own
file and prefix. The Sovereign Mutual, Providence and Residuary Offices are named and vote but have no brigade
and no house to explore; the Belvedere Club and the Teague house are one room each.

## R11. The entry

*Finding.* "Portal approaches" were an afterthought. The Arch is the first thing a player meets.

*Revision.* The Arch is a designed set-piece with five approaches (honest declaration, false declaration against
the Bell, the water-stair, the hearse, the Cinder Gap), each changing what the company is *recorded as*, what it
carries in, what it knows, and where it begins. Entry is playtested five ways.

## R12. What the original treatment loved too much

The Fire as a sweet lonely creditor is the design's weakest sentiment. Revision: the Fire has an **edge**. It *did* burn
Cindermouth, and it is not sorry; it is owed, and at Reckoning it will take what the Treaty says whether or not it is
fed. It is courteous the way a bailiff is courteous. Its tenderness is real but costs the company something
(the Hearthkeeper; a name; an apology). Prewitt is not a dupe: his arithmetic works *for most of the city*, and the
General Average ending is the only one that satisfies it on its own terms.
