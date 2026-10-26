# Priority III, step 1: what gets in the way of attention, on main

The first step of [`doc/design/AESTHETICS.md`](../../../design/AESTHETICS.md) §10: the attentional and navigation
failures, from the owner's own play (the atlas's §28), the cold playtest of 2684952
(`review/cold-playtest-2026-10-25`, its findings C1–C12 and its five changes), and the independent review of 483e3af
(`review/architecture-2026-10-25`, its E1, E3 and B1). Each failure is filed under the moment of the playbook's fixed
journey where a player meets it, and classed as **correctness** (the engine or the content is wrong, whatever the page
does), **semantics** (what the page needs the engine cannot yet say), or **presentation** (how the page composes what
it has). Repaired since the reports came in is marked so; where repaired, the commit is named.

## Arrival: someone, somewhere, with a reason

| What a player meets | Class | Evidence | Stands |
|---|---|---|---|
| The authored adventures could not be found from an ordinary start | semantics | cold C1, review E1 | in part: each world holds one of the independent adventures beyond its first country, named by its folk and rumoured by the innkeeper of the town its road leaves from (e6f69c1, b37b354, e4fad40). The title page still lists them only under `?dev` |
| The opening asks for a party | presentation | atlas §2, §27 | open: the generated world begins with one protagonist (the wanderer, a debt, a kin); the authored campaigns still begin "Choose three companions" |
| No sheet for a solo protagonist until a companion joins; stats contradict the calling; spell text only on hover | presentation, correctness | cold C4 | open |

## Conversation: a precise warning, a consequential follow-up

| What a player meets | Class | Evidence | Stands |
|---|---|---|---|
| Two people give the same line; greetings and rumours repeat word for word | correctness (content) | cold C5 | open |
| The Story replaces dialogue with "You carry out the action." or "X tells you what they have heard" | correctness | cold C5, C7 | open |
| Topics vanish after one ask; no follow-up | semantics | cold C6, AESTHETICS §5.3 | open |
| A rumour filed as "seen for yourself"; Notes knows what nobody said | correctness | cold C7 | open in part (rumours of authored countries are heard from the innkeeper, b37b354) |

## Travel: directions to a known landmark, an interruption

| What a player meets | Class | Evidence | Stands |
|---|---|---|---|
| Every later march crossing refused ("invalid knowledge") once something was learned | correctness | owner, review A1 | repaired (e0d2d04) |
| A march-stone named one country and led into another | correctness | review E2 | repaired (e4fad40) |
| A place told of was not on the map until its way was known | semantics | AESTHETICS §5.5 | repaired: a fact may lead to a place (c3d0a0f) |
| Unexplained injury and death on the road; a long risked way turned back | correctness | owner, Road B1 | in part: a risk taken stays taken (c6dbce9); road hazards are not yet told as causal events |
| Two exits called the same; routes repeat verbatim; duplicate map names | correctness (content), presentation | cold C10, Road B4 | open |
| No travel along known routes; every leg a click | semantics | review E3, AESTHETICS §4 | open |

## Investigation: examine, read, manipulate, without losing the place

| What a player meets | Class | Evidence | Stands |
|---|---|---|---|
| "Listen at it" on a speaking door: "Nothing comes of it." Verbs offered that cannot answer | semantics, correctness | cold C6, AESTHETICS §5.4, §9 | open (the tries a thing is offered follow its look since bb228f4; the answers do not) |
| A riddle the reverse of its answer; an inscription that reads like a data record | correctness (content) | cold C5 | open |
| Old script pre-translated for every reader | semantics | cold C6, atlas §10 | open |
| Inspection opens in place and returns to the scene (safe inspection) | presentation | cold D1 (kept) | good |

## Danger: understand the threat, act, avoid or withdraw

| What a player meets | Class | Evidence | Stands |
|---|---|---|---|
| The first expedition kills a level-1 protagonist before they act | correctness (balance) | cold C2 | open |
| The epitaph omits the protagonist, says "one against one", hides the last action, says "set upon" when the company attacked | correctness | cold C3 | open |
| Flee's outcome untold; bleeding and not bleeding in one round | correctness | cold C3 | open |
| An irreversible act on one click | semantics | AESTHETICS §6, Road F12 | repaired: `Grave` acts ask first (ba39b86) |
| The whole page goes dark in a fight, a dark room, underground | presentation | AESTHETICS §2.3, §9 ("fantasy as constant darkness") | open (`Stage.light`) |

## Return: what changed, kept in memory

| What a player meets | Class | Evidence | Stands |
|---|---|---|---|
| A rival band leaves; four days of silence; no thread in Notes | semantics | cold C8, atlas §15 | open |
| After loading a save, the Story starts at the load | correctness | cold C7 | open |
| "Begin again in this country" resets the clock while saying the country goes on | correctness | cold C8 | open |
| "Since you were last here" reports the weather | presentation | cold C11 | open |

## What the page already does well, to keep

Safe inspection (looking costs no time and commits nothing); Notes' provenance (who told you, when, unfinished and
known); visited, known and heard-of places told apart on the map; combat's committed intents, resistances, per-target
odds and dice that can be hidden; explicit requirements ("Needs digging or a shovel"); light as a clock; a clean
phone layout at 390 px; scene craft at its best (the tally's "WE HAVE SHUT IT IN", Brother Anselm's letter).

## What follows for the compositions

The compositions of step 3 are judged against the same six moments and must not hide a correctness failure under a
style: the epitaph, the Story's placeholders and the template repeats are repaired in the engine and its content,
whatever the page becomes. What is presentation here (the dark theme switch, the party-first opening, the sheet that
appears only with a companion, hover-only text, the undifferentiated choice list) is what the compositions answer.
