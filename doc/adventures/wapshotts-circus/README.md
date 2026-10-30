# Wapshott's Peregrine Circus — Phase I

*The first adventure of a recurring company. Written 30 October 2026. Spoilers throughout. Phase II, which follows
the Goose Fair under all three of its reckonings, is [phase2.md](phase2.md); what has and has not been verified, and
by whom, is [verification.md](verification.md); what might come after, kept apart from what is built, is
[future.md](future.md).*

A travelling circus goes round three towns of the first country, three days in each, and has done for nineteen years.
Its proprietor, Colonel Florian Wapshott, is the best showman in the country and the worst man of business in the
world. Phase I is the circus's ordinary life, its people, its first menagerie, a training path in martial clowning,
and one regional crisis: an old debt bought up by his former partner and fiancée, payable at the Goose Fair.

The aim was a place the player is glad to find again with no quest pulling them there: humour from situations and
people rather than names, warmth, theatre, a social life, and play that is self-directed.

## Shape and themes (second pass)

The second pass ([critique.md](critique.md)) gave it acts and a spine. Four **chapters** open on the page:
**The Wagons** (the first step onto a pitched ground), **The Note** (when the company learns of the debt),
**The Goose Fair** (in the fair town once the Fair is on), **On the Road Again** (the strike after the reckoning).
The note is foreshadowed before it is served: a man in a grey hat at the back of the house counting benches,
Nance's warning, a portrait turned to the wall among the Colonel's relics. The Fair has a worst hour (the raiders)
and is heralded for days by geese on every road.

Three themes run through the threads and are made to rhyme:

- **The roof and the road**: the Colonel's amphitheatre, Honoria's tea-shop, Nell and her gran's *a circus is a thing
  that leaves*, the Sylph who left a tripe-lane, the hob who must leave his mill, a tortoise that has gone round with
  one household or another for three hundred years. Mumchance hears of Mrs Pruett on the back bench and tells of his
  own father at the back of the house at Dunmere for twenty-two years.
- **Humbug and the true thing**: the bills, the basilisk "theory", Slee who "makes things easy", Sallow who "has never
  cheated". The fair town's priest says *I don't mind it being impossible; I mind it being false*, and says it again
  as a juror, about whichever true thing the company made possible.
- **The fall and the get-up**: Mumchance's whole art. The Colonel falls over the ring boards every night and has never
  once meant it; Mumchance says the day he means it he will be a clown; at the paid reckoning he means it.

Arcs: the Colonel (relics, the box counted alone at night, *I did not dare* about the lion, the fall meant, a true
*thank you*); Mumchance (forty years' silence, one word at the Flyting, if earned); Ada (Sallow's offer of the
quarter-share she wanted; the Colonel's pen, if he learns of it and the note is paid); Jos (for or against Wapshott's
at the Fair, by how he was beaten).

## Where it lives in the shared world

The circus is not a country of its own. It is a **standing scenario** of the first country
(`data/scenarios/standing.json` → `circus.scenario.json`): every world places it, after everything drawn from the
library, so nothing drawn before it moves.

| Role | Bound to | How |
|---|---|---|
| The fair town (`a`) | the country's largest settlement | `"settlement": "largest"` |
| The second town (`b`) | the next town along the roads from it | `"settlement": "along:a"` |
| The third town (`c`) | the next along from the second | `"settlement": "along:b"` |
| The roads between | the road joining each pair, or the nearest road into the next | `"way": "between:a,b"` and so on |
| Inns, shrines, shops | each town's innkeeper, priest and merchant | `@a.innkeeper`, `@a.priest`, `@a.merchant` |

These three placement needs are new, general, and claim nothing: the circus shares its towns with whatever else is
going on in them (a drover, a fever, a disputation), so another adventure set in a town the circus is visiting
coexists with it. Its ground in each town is a field off the green (`tober_a`, `tober_b`, `tober_c`); its ring,
backyard, living-wagons and menagerie are rooms of that field that are open only while it is pitched there.

**The circuit.** The circus is on the fair town's ground on the first morning (it came in the evening before),
parades the town's heart at four, plays at seven, and plays three nights; at six on the fourth morning they strike and are on the road until two; then the next
town. So: the fair town days 1–3, the second 4–6, the third 7–9, the fair town again 10–12, and on round for as long as
the world lasts. On the road the whole company is in the road room between the towns, and can be met there. Sidney
Quirk goes ahead the day before and bills the next town (`COMING!`); behind them the bills say `GONE ON TO …`. Every
innkeeper of the three towns can say where the circus is now and where it goes next; word of it is carried by the
generated country's innkeepers, merchants and travellers.

Persistence is the world state: whatever the company did with the circus (its menagerie, its debts, its friendships,
who left and who came) goes round with the wagons.

**Standalone.** `test/fixtures/circus/circus.campaign.json` installs it over three small towns (Ashby Lowe, Burl,
Cotter's Cross) for fast authoring and the journey tests.

## The company

| | Who | Wants | Grievance, history |
|---|---|---|---|
| **Colonel Florian Wapshott** | proprietor, ringmaster | a building, a Royal Warrant, a menagerie; to beat Cordelia Sallow | a colonel by a commission bought for a pie; secretly pays a dead flyer's widow a coin a week |
| **Ada Thripp** | book-keeper | a quarter-share by thirty | came to collect an IOU and stayed; secretly writes *The Brigand's Bride* as "A Lady of the Road" |
| **Mumchance** | the silent clown | one more good season; to pass on the Art | a fencing-master's son; his name made smaller on the bills; his knees |
| **Pip Gallant** | ring-girl, apprentice | to be a loud clown and see the world | can fall; cannot yet get up funny. Recruitable (monk) |
| **Mademoiselle Zéphyrine** | the Sylph of the Wire | the Ascension: a wire from a steeple | is Susan Pruett of the third town, who ran away at fifteen |
| **Hal and Dunstan Quincey** | tumblers | the credit for the Quincey Turn | not speaking for three weeks; the pyramid falls nightly |
| **Honoria Bulstrode** | the Ox of Abernant; cook | a tea-shop with a bow window | lifted a slate-cart off her brother at fourteen; nearly married Mumchance at Wakeham |
| **Signor Cornelius Fipps** | bandmaster (serpent) | the low G; a Grand Overture for twenty | has asked for a new serpent eleven times |
| **Lucius Hench** | wardrobe-master | to be paid for the gold braid | eleven years valet to the Margravine of Oster; knows every court's forms |
| **Gideon Lusk** | boss canvasman | his lads paid; his daughter Nell | speaks a word at a time |
| **Nance Tibbet** | the Sibyl of the Seven Rivers | money, which never comes | reads faces, not hands; knows everyone's secret |
| **Billie Ostrander** | horse-keeper, then keeper of the menagerie | beasts kept right | "anything that can talk is asked, not caught" |
| **Bucephalus** | the old grey horse | apples | knows every cue better than the Colonel |
| **Sidney Quirk** | advance agent | flat surfaces | billed a hearse once, by mistake |

Rivals and locals: **Madame Cordelia Sallow** of the Imperial Hippodrome (not a villain: the only person in the story
who can add), her man **Varney Slee**, her clown **Captain Bombazine**; **Jos Haverhill**, the cobbler-wit who heckles
every show in the second town; **Master Obadiah Pettigrew**, Clerk of the Goose Fair; **Mrs Pruett**, a tripe-dresser;
**Mrs Thrussell** and the mill; **Goody Tarrant** the bee-wife; **Joby Wiltshaw** the carrier; **Mrs Aske** and **Nell**;
**Wat Coppock**, a lad with a paste-pot. The generated towns' own innkeepers, priests and merchants are given parts:
rumours of the circus, the price of flour, an old serpent in a shrine loft, a hob for an inn's brewhouse, and two
places on the Fair's jury.

Talk among the troupe is overheard (Hench on Hal's knee, Honoria feeding Mumchance, Ada and the Colonel's ideas), and
the backyard, the ring and the front change with the hour and the day of the stand: the bacon queue at seven,
rehearsal from nine, the dead hour after dinner, washing day, the half-hour before the show, stew and a fiddle after.

## The circus's economy

Measures on the concern `wapshotts`: the **strongbox**, the **larder** (days of food; a day eaten every morning;
Honoria buys at the Colonel's price when the box will bear it), the **canvas** (0–3; every strike wears it; rain on a
rotten canvas halves the house), **arrears** (wages, ten coin a stand, due at the strike; unpaid twice, the canvasmen
sit down and there is no show), **feed** for the menagerie, and each town's **standing** (what fills its benches).
The **house** each night is the town's standing, the parade, the bills, the menagerie's draw, the rain and a rival
show across the green; the **quality** of the show is what is right or wrong behind the canvas that night.

The company can help: buy a ticket, sign on as a hand (two coin a stand, ride the wagons), haggle the larder down with
each town's merchant, give rations, mend a seam with Lusk, pay or talk round the canvasmen (a Promise), lend the
Colonel ten coin (repaid "tenfold", which Ada makes eleven), repaste Sallow's bills, buy feed, muck out, sew
spangles with Hench before a show (the Grand Entry glitters), and put a shoulder under the canvas wagon when a wheel
comes off on the road (likelier on rotten canvas; left alone, the wagons come in late and there is no parade).

## A night at the circus

Seven parts of twenty minutes from seven o'clock, each with its variants:

1. **The Grand Entry** — or the same to a hymn, if the band's books were changed.
2. **Bucephalus at liberty** — plus the hat that floats off the Colonel's head, if the hob has joined; plus the new
   serpent's low G under the Galop, if Fipps has it.
3. **The Brothers Quincey** — the pyramid that falls out of spite; the Quincey Turn, once mended; Hal alone, if
   Dunstan has gone to Sallow. Jos Haverhill heckles here at the second town.
4. **The Ox of Abernant** — or an inch, if the larder is empty; or no Ox, if she carried the tortoise.
5. **Mumchance** and his ladder (sharper with Honoria's liniment) — then **the company's own turn**, if booked.
6. **The Sylph of the Wire** — or the near-fall on a greased wire; or dancing on it, the night her mother is on the
   back bench.
7. **The close**, the Colonel's nightly accidental fall over the ring boards, and the takings.

Each act is told in full the first night the company sees it and briefly after; and every night one incident from a
small table happens only that night (a dog Mumchance adopts into the act, a drunk thrown by the Quinceys, the lamps
guttering and Pip holding a lantern up for the wire, a sleeping child waking into the silence, a goose and
Bucephalus, a proposal in the gallery).

### A turn of your own

Ask the Colonel, audition at the morning rehearsal (performance), and book a turn: a **clown's turn** with Mumchance
(after the Fall), a **tumbling turn** with the Quinceys (after practising with them), a **turn with the band** (after
learning a part), or the **spiel** as the Colonel's second (always). Preparation counts: rehearsed that day with the one
who knows it, a costume from Hench (the motley, which grants performance), a cue agreed with Fipps. So do
circumstances (a warm house after good acts; a wet one under rotten canvas). In the turn the player chooses: do it as
rehearsed (performance, easy), go for the big finish (tumbling or performance, hard; a fall can be saved by one who
has learned the Fall), or throw away the rehearsal and play to the house (persuasion). The score gives a triumph, a
fair turn or a flop, each told in its own words for each kind of turn, and each with consequences: the town's
standing, the takings, the company's renown (and its name on the bills), the troupe's regard.

## The Gentle Art: foundations of martial clowning

Mumchance teaches the clown's art as his father taught the sword, in four foundations, each a lesson with a check that
can be retried the next day, each opening a combat technique he will then drill into a member at the usual cost in
experience (the shared `train_member`):

| Foundation | Lesson | Technique taught | Out of combat |
|---|---|---|---|
| **The Fall** | an hour falling (tumbling) | **Pratfall** (new): go down as the blow comes, dodge for two turns | slap-shoes (grant tumbling); a fall in the ring saved; falling for a heckler |
| **The Look** | watch his entrée from the wing, then forty dropped plates (performance) | **Taunt** (Orsino): draw a foe's eye | the Look at a heckler, at the gurning match, at an owlbear |
| **The Feint** | fence with broom handles (deception) | **Feint** (new): distracted, unless a wisdom save; and **Dodge** (Orsino) | looking past a heckler at nobody |
| **The Answer** | won from a heckler: Jos Haverhill, or Bombazine at the Fair | **Vicious Mockery** (Orsino): wit that wounds composure | the Flyting |

**The Wire** (Zéphyrine, after the Fall) is balance: a hard tumbling lesson and then one walk that raises a member's
dexterity for good (`endow`). Heckling is a bout of its own: the heckler's composure against the answerer's poise,
over three jabs, with answers that open as the foundations are learned.

What comes after (the Riposte, and the Mirror, the old clown at Dunmere who sent a conjuror's fire back the way it
came) is only spoken of. Nothing of spell reflection or mimicry is granted.

Two shared skills were added for this (`tumbling`, dexterity; `performance`, charisma): bards bring performance, monks
tumbling, and bards and thieves may take up tumbling at a level.

## Side stories (any order, each optional)

- **The Brothers Quincey.** Dunstan mentions their father; Hench has the late Barnaby Quincey's trunk; his playbill
  shows he performed the Turn before either son was born. Or ask Honoria to bang their heads together. Left alone, by
  the Fair Slee buys Dunstan for the Hippodrome; the playbill brings him back.
- **The Sylph's mother.** Nance reads Zéphyrine's face; Mrs Pruett of the tripe-lane sits on the back bench every
  night. Walk the Sylph down the lane. Tripe for thirty, and the horse.
- **Mumchance's knees.** Camphor from a merchant, Honoria's liniment: a better entrée for four days.
- **Lusk's Nell.** Talk Mrs Aske round to bring her to the show; Lusk says more words than he has said all year.
- **Jos Haverhill**, who has been trying for nine years to make Mumchance say a word.
- **Pastimes:** the Grand Gurning Match (second afternoon of a stand), arm-wrestling the Ox, juggling with Pip, the
  Sibyl's fortune, a heel of bread for Bucephalus.
- **Recruiting Pip**: once the company has the Fall and Pip's regard, ask Mumchance whether she might go and see the
  world; she joins by the shared recruit rules, leaves the ring while she travels, and goes home to it when sent.

## The menagerie enterprise

Begun on the Colonel's word ("WAPSHOTT'S CABINET OF LIVING WONDERS"), kept by Billie on her terms, pitched as its own
tent; what it holds travels with the wagons, draws at the flap by what it holds and how well it is kept (welfare 0–4,
kept by feed and mucking out), and gets out when it is not. Six commissions, each a different kind of problem:

| Wonder | Where | The problem | Choices |
|---|---|---|---|
| **The Basilisk** | in a crate, from the start | identification: listen, read the bill of sale, look in Hench's glass (never in its eyes) | bill Sir Roderick honestly ("A COCKEREL OF UNCOMMON MALICE") or as the Basilisk, which the jury will find out |
| **The Glimmer-Fox** | the third town's water-meadows | tracking, at night: the frost-line, stealth in the reeds, giblets and a sack | catch her (she pines without a dark tent; Lusk's black canvas), or only watch her and let Ada make a legend of her; free her later |
| **Ninepence the Hob** | the fulling-mill at the second town | negotiation with an intelligent creature, and with the Colonel, who wants a cage | the Invisible Stagehand (no cage, cream, his name an inch high), or a hearth in the inn's brewhouse instead |
| **The beast in the orchards** | the bee orchards of the fair town, at dusk | danger and nonlethal capture: iron-strapped cage, a net, honey, and Billie or the Look | bring Bramble in alive, or fight a young owlbear (it can kill a first-level company in one blow) |
| **Methuselah** | the carrier's yard, third town | transport: forty stone of tortoise who walks only toward cabbages | five hours with a cabbage on a stick; a sledge and Bucephalus; or Honoria, who does her back |
| **A Serpent, for Fipps** | everywhere | a misunderstanding: the Colonel thinks it is a beast | a grass snake in a bucket for the Colonel; the shrine loft's old band serpent for Fipps |

**The escape.** An owlbear ill kept (welfare at nothing), or one whose pin Slee draws on the Fair's second morning, is
loose on the green with the baker's buns: lead her home with honey, or walk backwards with the Look; leave her and
she goes to the hills with the town's washing, at a cost to the box and the town's regard.

Sallow's own show can be seen across the green: flawless, and at the end an old blind lion, Nebuchadnezzar, who was in
the cage at Dunmere on the wedding morning. If the hob and the tortoise are both with the circus, Ninepence knows
him: he saw him go by on the mill road in a cart at the back of the old Royal Progress, and they called him the
Bishop.

Methuselah's shell bears **MENAGERIE ROYAL** and the crowned wheel of the old kings' Royal Progress (Hench knows it).

## The principal conflict: the Note and the Goose Fair

Once the company knows the circus and the third day has come, Varney Slee serves the Colonel: his old note of hand to
the Dunmere Discount House, sixty coin, bought by Madame Sallow, payable at the **Goose Fair** at the fair town the
next time the circus is there (three days off at least), or the wagons, canvas, effects and beasts are hers. Her
Hippodrome pitches in a far meadow there and plays every night it is there, taking a share of the house.

**Slee works against the circus**, beyond Sallow's orders, through Wat Coppock: Sallow's bills pasted over
Wapshott's; the band's books changed for a hymnal; goose-grease on the foot of the Sylph's ladder on the Fair's first
night; an owlbear's cage pin on its second morning. Each leaves something to find: catch Wat (and he tells), the
ticket in the hymnal, the grease and the stub on the platform, Slee himself in the menagerie at dawn. Watch the
band's stands, check the rigging, sit up with the cage. Two pieces of evidence set before Madame Sallow, and she
dismisses him.

**The worst hour.** At eleven on the Fair's first night three men from Dunmere, paid a shilling a rope, come over the
hedge to cut the guy-ropes. Fight them (they are three warriors of the second level; a first-level company can die);
raise the circus's old cry, **Hey Rube!** (a hand of the circus is answered at once, a stranger only with a hard
performance check), and the whole backyard turns out behind Honoria and a frying-pan; outbid Slee; tell them who
sleeps in the cookhouse wagon; lead them through the guy-ropes in the dark; or feint at an Honoria who is not there.
Nobody on the ground, and the big top is down by morning: the contest is played in a patched tent, which costs the
show and, to the fair town's innkeeper, says something in its favour.

**The Fair** (three days): the town white with geese; the Clerk's pitch-toll (the jury notes who pays); on the second
afternoon, the **Flyting** on the green, Captain Bombazine against Wapshott's fool, and Mumchance will not speak, so
someone must; on the third night the jury (the Clerk, and the fair town's own innkeeper and priest) sees the show. The
verdict at nine (each juror first gives a reason aloud, from what the company made true) weighs the night's quality with what the Fair has seen: the Flyting, the toll, the menagerie, an
honest basilisk or a dishonest one found out, and how fond the town is of the circus.

**The reckoning** at ten, in the Colonel's wagon:

- **Paid** from the box (the prize is forty coin), coin by coin, and the Colonel falls over his boot-scraper on purpose.
- **Torn**: if Slee was exposed and the box is short, Sallow will not take a thing she has half-stolen.
- **United**: otherwise, *Sallow & Wapshott's United Circus*: his ring, her strongbox. Sallow goes round with them.

Every outcome keeps the circus on the road. Afterward the Colonel has heard of a thigh-bone as long as a man in the
third town's marl-pit; and, if he won the Pitch or shows a tortoise with a crowned wheel on its shell, a gentleman of
the Household of the Progress has asked whether he would bring his company, and his tortoise, to perform.
Mumchance says Honoria asked him whether he remembered Wakeham. Nothing more is resolved.

## How it is built

`data/goings-on/circus/` (one module, seven files): `circus.kyr` (the towns, the grounds, the circuit, the bills, the
towns' talk), `troupe.kyr` (the company and its life), `show.kyr` (the show and a turn of one's own), `art.kyr` (the
Gentle Art, heckling, pastimes), `ledger.kyr` (the economy and the troupe's own stories), `menagerie.kyr`,
`acts.kyr` (chapters, foreshadowing, the relics, the raiders, the jury's reasons, the arcs added in the second pass),
`note.kyr` (the conflict, the Fair, milestones). About 2,600 lines of Kyr.

Engine and shared content changed for it, each general:

- `ScenarioTowns`/`WorldAssembler`: settlement needs `largest` and `along:<role>`, way need `between:<a>,<b>`, and
  standing scenarios (`data/scenarios/standing.json`), placed after the drawn ones.
- Shared skills `tumbling` and `performance` (`core.kyr`, `skills.json`, `Checks.qualities`, the bard's and monk's
  skills, and bard and thief may learn tumbling); techniques `pratfall` and `feint` (`abilities.json`).

The circus uses no `Ending`: it lives in the shared country, and the book must not close on it.

## Tests and what was verified

`test/circus.test.ts` (27 tests, by the labels a player sees): lint clean; the first afternoon's parade and show;
the circuit and the road; riding with the wagons; the Fall and its technique; a turn in the ring; the basilisk; the
hob; the glimmer-fox; the tortoise and its crest; the owlbear (with Billie); the serpent; Jos's heckling; Nell; the
Quinceys; the Sylph's mother; the note served and the Fair set; the three reckonings (with outcomes staged, since a
whole run is longer than a test); the Flyting and Wat; and the circus placed, visited and found again in the second town on the fourth day in a generated country
(`thorn`); and the second pass's chapters, brief repeats, the raiders stopped and not stopped, Mumchance's word,
and Ada's quarter-share.

Played by the developer at the command line (`bin/kyrie play`), not by an independent player. Not verified in play:
the browser presentation of the circus, the map's drawing of the three grounds, a full unhurried run from the first
day to the reckoning with every thread, a run of several cycles after the Fair, Pip as a companion in a fight, and
worlds with fewer than three settlements (the placement falls back to sharing a town).
