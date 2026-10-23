# Mission 13: three playthroughs

**There was no independent human tester.** All three were played by me (Claude) in Chromium through the published
reader, choosing only by what the page shows: the visible labels, the prose, the map and the notes. I did not use
ids, the generator's report or the modules' text to decide what to do; I read a module only after I had been
confused by it, to find where the confusion was made. That is a real limit: I know what Kyrie is meant to do, so
I notice less than a stranger would, and I cannot say what a person enjoys. Where the report says "a newcomer", it
means my best reading of one.

Each world was fresh (never played before), each with a different origin, terrain and calling. Every confusion
was fixed where it is made (the table, the generator, the rule, the reader), the fix rebuilt, and the same step
replayed. Screenshots at 1440×900 (desktop), 820×1180 (tablet) and 390×844 (phone) are in
[`doc/design/mission-13/shots`](../../design/mission-13/shots).

## 1. Palewold (`heron`): the brothers' errand, alone

Cold northern country; Wenna, a warrior. Route: the shrine of Dagda (Sienna, the priest) → give the letter → the
landing at Hrīmtún → the road west → the foot of Sharpmunt → the tarn (the visions, an Orsino wonder) → the crag →
Caelumtur, a square tower → the guard-floor (a glyph trap on the stair) → the well-chamber, dark: light a torch,
read the tablets → camp in the tower → walk home → show the priest what was copied (+40 coin).

What confused or jarred, in the order met, and what was done:

| # | Met | Fixed |
|---|---|---|
| 1 | The priest, who has never met you, "knows you before you are close… 'I wondered if you'd come this way.'" | A bond of its own, *expected*; *friend* now means someone you did a good turn |
| 2 | "There is a bed in the back, such as it is" — and no bed | The order origin offers it |
| 3 | "YOU KNOW NOW: The way to the south-eastern round tower on the…" (cut at nine words) | Notes keep the sentence |
| 4 | "It grew up beside the Albeex. It looks out over Seolforclaene. The fells rise behind it." | One sentence: "It grew up beside the Albeex, looking out over the Seolforclaene, with the fells at its back." |
| 5 | A fact known from the start filed under "Seen for yourself" | "Known before you set out" |
| 6 | Told the way, the map showed nothing of it | Ways revealed by what the company knows are drawn |
| 7 | The wild country's name across the town marker | Zone names avoid marks |
| 8 | Trails in wild country not drawn; the "Here" chart a huge empty duplicate | Trails drawn on the land; no room chart in wild country; the map 1.4× larger |
| 9 | "A stoat in its winter white bounds across the snow" — in Haysel, in rain | Open roads take the animals of their ground; heath and meadow signs added |
| 10 | A painting credit naming its painter twice | Generator fixed; credit corrected |
| 11 | "Bartle hears you out with his hands still… until you have finished" — before a word was said | Rewritten |
| 12 | Questions already asked looked the same as new ones | Marked "· asked", quieter |
| 13 | "The way to the round tower on the roof of Sharpmunt" — no route | "…: into Sharpmunt and on to the tarn, then the crag, where the track to it starts." |
| 14 | "The road pale with dust" in rain; "still on the road" on a scree path; one moor line three legs running | Lines say *road* or *path*; weather lines bound to weather; fresh looser fits before repeats; the oldest repeated last |
| 15 | "There is visions that appear and disappear at the edge of your sight here." | 43 wonders with hand-written looks, told in the place's prose |
| 16 | "An intricate glyph etched into the wall, shimmering faintly." (a fragment) | Six mechanism signs as sentences |
| 17 | Told "a round tower"; found "It is square, of three storeys" | A plan may give a look per shape |
| 18 | "ration: 2 → 1" on the page | "−1 ration (1 now)" everywhere |
| 19 | Listen/Prod/Push before Read on an inscription; the reading printed twice | A thing's own uses first; said once |
| 20 | Reading the tablets did not count as copying the old writing | Either the tablets or the ring counts; the errand then says go home |
| 21 | A trapped stair door cut off the top of the page | The field makes room; the door named for where it goes, the tries under it |
| 22 | "sleep in turns" alone; "Take the bed · 0 coin" | Fixed |

Pinned end to end by `test/order-errand.test.ts`.

## 2. Wychwudu (`alder`): coming home, then with your brother

Forest; Wenna, a warrior. Route: the road into Grenestede (a brothers' house, the village against its wall) → the
gate-yard: Fenris, your brother, on the rail with your father's spear; neighbours; the grey dog → Fenris joins →
your mother in the guest-hall → make much of the dog (ditch-mud to the belly, a forefoot cut as if on iron) → the
bridge road: fresh ruts, and Fenris knows the wheel → search: the cart in the ditch, your father under it; Fenris
kneels → take the knife → home: "I knew. The dog knew." → show her the knife: "Keep it." → wait for dark → Bordtun
at night, a hayloft → morning → lead a neighbour's goat home.

The comparisons the brief asked for:

- **Kin, neighbour, stranger.** The brother and the mother hold on to you; a neighbour: "'You're back, then,' says
  Glen, as if you had been gone a week and not three years"; in Bordtun at night, "Lindal peers at you in the bad
  light. 'It's late to be making acquaintances.'"
- **Known and unknown place.** Home, where you are known, against Bordtun, where nobody knows you.
- **Sunrise and night.** Bordtun after dark: "Bordtun is dark. A dog barks once, somewhere, and thinks better of
  it", the dark ground, faces dimmed; at dawn the place's life (two families at one fire, a tinker crying wares).
- **Tame animals.** The grey dog (petting is how the clue is found), Storm in Palewold, a loose goat led home for a
  coin, cats; a boar or a wolf cannot be petted.
- **A carried object.** The father's knife, from the ditch to the mother's hands and back.
- **Differing consequences.** With Fenris along, he reads the ruts and kneels at the cart; without him the road says
  nothing of the kind.

| # | Met | Fixed |
|---|---|---|
| 1 | Neighbours in your own village greeted you as a stranger | The kin origin says where home is; its people are *neighbours* |
| 2 | Your mother greeted you with a grim stranger's line (it tied with the kin line and won by chance) | Who someone is to you outranks their manner |
| 3 | Your brother "goes for their boots" | The drover's family have pronouns; townsfolk are drawn he or she, consistent with their role |
| 4 | The dog's tell-tale never shown, only a nine-word gist | The observation that teaches is told in the moment |
| 5 | Fenris kneeling (seen once the cart is found) learned one action late | What is perceived and learned settles within the action |
| 6 | Two notes run together on one line | Each its own line |
| 7 | A carrier's cart in the ditch, same road, same morning, as the father's | A story's scene is *staged*; chance trouble keeps off it |
| 8 | "You go over the bridge over the Āforex carefully" (searching) | "You search … with care" |
| 9 | After finding the father, the brother still "the drover's son, who wants to go after his father", met by the road | Companions named by kinship, shown with the company |
| 10 | "the ewes taken on the south-western cave" | "near" |
| 11 | After a night in the hayloft, still "talking" to the host, the morning in the transcript; "a hot supper… a dry bed" | Six hours' sleep ends a conversation; the line fits a loft |
| 12 | "It stands, with the fells at its back." | No comma |
| 13 | The goat, home and tied, still "loose" and leadable | Tied |
| 14 | (Caught by the suite) a grateful goat: "'You know where to find me,' says Gruff" | Spoken bonds are for people |

## 3. Loxorloew (`lark2`): what is owed, Orsino-heavy

Fen; Wenna, a human cleric (an elf cleric was refused, see 1). Route: Caelynn's salt-house (thirty coin by market
day; 21 in hand) → Sariel's still-room (an Orsino alchemist's stock) → the Black Crown: word of trouble at a grassed
mound → Fen Howe: bone hounds, an Orsino undead template, one "sacred" by aspect → say the rites of the dead (no
fight) → what they dragged in: 9 coin → pay the debt → Nocsrechies: a speaking door with an Orsino riddle ("What
has hands but can't clap?"); a wrong word (the stone's cold breath: 5 damage, frozen), then "Clock" → a seal-stone
that needs brawn → hire Orym, a pilgrim and an elf warrior, for 3 coin → Muscivigilia, the lone tower → the crypt,
dark: the risen dead and a knitted hound → a torch → fight the hound.

| # | Met | Fixed |
|---|---|---|
| 1 | The page let an elf be a cleric, then failed on Go: "region__party_1: an elf cannot be a cleric" | Callings a people cannot follow are marked "(not for an elf)" and cannot be chosen |
| 2 | A harbour told its boats twice | A harbour's own telling says its shore |
| 3 | The alchemist seemed to sell one potion (only what you could afford was offered) | The whole counter shows in conversation; what you cannot afford quieter |
| 4 | A painting credit was a museum accession note; five were junk (scanner settings, XML, a rights line, a photographer) | One credit rule: painter, title, date; junk dropped to "Painter unrecorded" |
| 5 | The echo of a question named the barrow before anyone had said its name | Echoed in the names you knew when you asked |
| 6 | With wayfinding, every trail of every wild country on the map | Trails drawn once walked or told |
| 7 | "the sun low behind you" on a cloudy day | Grey, hot and ash skies |
| 8 | "…in the old script: FEN HOWE." then "This is Fen Howe." | Once |
| 9 | The creditor greeted you like a passing stranger | A debt is a bond: "Caelynn looks at your hands before your face" |
| 10 | The riddle's four words at the foot of the page | Offered at the door |
| 11 | "Roll the seal-stone aside" did nothing when pressed (needs brawn) | The reason is shown |
| 12 | "Ask Orym what brings them" — the page calls her she | The inn's traveller is drawn he or she |
| 13 | "Say the rites of the dead over" | Keeps its subject |
| 14 | "Wenna takes 2 physical." | "Wenna is hurt, for 2"; other kinds "takes 5 cold damage" |

## What was left as found

- A wrong word at the speaking door does Orsino's 1d6 cold and freezes a first-level hero; harsh, and fair.
- A door with two locks (the riddle and the seal-stone) shows the second only once the first is past.
- Generic tries (listen, prod) are offered on an inscription; the crows on the barrow "do not fly" after its dead
  are laid; a way heard of stays "Heard, not yet seen" after it is walked; the grey dog cannot lead you to the cart.
- The mother has one thing to say before the news and one after; the carrier on the road has only news.

## Visual evaluation

Each of the five modes at three widths ([shots](../../design/mission-13/shots)):

| Mode | 1440 | 820 | 390 | Notes |
|---|---|---|---|---|
| Place | `1-place-1440.jpg` | `1-place-820.jpg` | `1-place-390.jpg` | Walled field with doors on its sides on a desk; tablet and phone a list by side. Night and indoor grounds. |
| Talk | `2-talk-1440.jpg` | `2-talk-820.jpg` | `2-talk-390.jpg` | Painting half the page on a desk, header band on a phone; numbered replies; the trader's counter. |
| Thing | `3-thing-1440.jpg` | `3-thing-820.jpg` | `3-thing-390.jpg` | Dark page, the thing large, its uses grouped by kind of doing. |
| Road | `4-road-1440.jpg` | `4-road-820.jpg` | `4-road-390.jpg` | The strip of country with you on it; branches; who is by the road. |
| Fight | `5-fight-1440.jpg` | `5-fight-820.jpg` | `5-fight-390.jpg` | Sides with bars, the exchange in the middle, moves as cards. |
| Begin | `0-begin-1440.jpg` | `0-begin-820.jpg` | `0-begin-390.jpg` | The protagonist page: still the plainest page in the game. |

Found by looking, and fixed: a north door with tries clipped off the top of the page; band names on the road strip
running into each other on a phone; notes run together; faces as bright at night as by day.
