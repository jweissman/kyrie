# The Banns at Hessel: the final revision, and what changed

*Stage 6. After the journeys passed, they were written out as transcripts (`scripts/hessel-transcripts.ts`) and read
as a player would read them. The region was also wandered at random for longer and wider than the default
(`WANDER_SEEDS=a1,…,a6 WANDER_STEPS=500`). Below is everything that reading and wandering changed, and why. Earlier
changes, from design to build, are recorded in [04-adaptation.md](04-adaptation.md) and the commit history.*

## Found by wandering

| What | Why it was wrong | Change |
|---|---|---|
| The runaway chair ran after Mrs Cherrett had died | Its event required only that the company reach the Abbey Yard by day; a late arrival brought a dead woman down the Parade | The chair runs only while she is alive, up, and not grey (`cherretts.kyr`) |

## Found by reading the transcripts

| What | Why it was wrong | Change |
|---|---|---|
| Hetty's shop opened with "The Honourable Rupert Wenlock has been married these two years to Hetty Quiney… a son, Jack…" | The engine prints a taught fact before the scene that teaches it, so the secret was told before Rupert was seen with the baby; Rupert's confession later repeated it | Every fact taught by a scene is now a short journal line ("Rupert Wenlock, whose banns are being read to Ismay Cherrett, has a wife and a son in Quay Lane"); the details are left to the people (`rooms.kyr`, `cherretts.kyr`, `carth.kyr`) |
| Ismay's window, Celia's books, the knocker: each printed twice in different words | the same cause | the same change |
| "Lady Wenlock, a Lady Wenlock, with a ribbon in her cap" | The role, used after a grandson, repeated her name | "a long thin lady in black, with a blue ribbon in her cap that goes with nothing" |
| A thief who only watched the chair crash was offered "Tell Mrs Cherrett you were the one who tried to stop her chair", and she answered "I saw you go under" | The topic asked only that the chair had been thrown | `chairTried` is asserted by a failed catch; a company that watched instead says it is new and wants work, and is hired with "next time a chair comes down a hill at you, do something" |
| Dr Hartopp's fate promised him "a hundred pounds in prospect" after Mrs Cherrett had dismissed him | No fate for a dismissed but not ruined Hartopp | `fate_hartopp_dismissed`: struck out of her will "with a pen that went through the paper" |
| "Celia… down the railings with your hands on her ankles", when the company is inside the window with her | Written from the street | "down the railings after you, with your hands to guide her feet" |
| The Old Town company earned "saw Dr Hartopp out of the Rooms" without seeing or hearing anything | The boots event is anchored at the vestibule and was told to nobody else | The boots event is told in the vestibule only to a company there; otherwise the ballroom tells it behind its fans, or Big Lanyon at the Two Poles ("In his boots… All the way down") |
| Stall Street, the Two Poles, the parlour, the Circus, Quay Lane and seven others repeated their full description on every visit | Only the Abbey Yard, the Crescent and the Pump Room had a second-visit form | Twelve places now have a short second-visit form |

## Found by testing the builds

| What | Why it was wrong | Change |
|---|---|---|
| A warrior who fought the footpads down was still offered "Give the footpads what it asks" | The shared `pay_tribute` required `warned`, which survives a defeat | **Shared rules**: `pay_tribute` requires `able(lord)`; its result "{lord} takes it" (singular for a band) is now "You pay {lord}, and are let be" (`data/rules/inhabitants.kyr`) |
| Two men felled in front of a physician, and he said nothing | — | Ottery kneels to them: two boys from the Old Town, one with a chairman's blue coat under his smock |
| A company without the sheep-path that stayed with the shepherd's child reached Orm at 12:40, after the College had sat, without warning | The cost was real and good, but invisible | Ottery says it at the hut ("An hour. That's the College, by the drove road… You choose"), the action's description says it, and a company that walks past hears about it at the crossways |
| The mage build was never played | — | A test: a mage reckons the drops by lore on the first day |

## Found by writing the critique

| What | Change |
|---|---|
| Nothing gathered the Season's round | Mopsa gives it: "Ask Mopsa how a day of the Season goes" |
| The Orm road could be missed entirely by a company that did not go into the Hospital on the first day | Mrs Scrope, asked about the Hospital on the first day, says Ottery walks to Orm at first light |

## Found by the whole repository's tests

| What | Change |
|---|---|
| One generated world holds every adventure, and no two may share a surname (`test/adventure-names.test.ts`): the Rooms' footman Fitch clashed with The Parliament of Books' Coddy Fitch, and the shepherd Amos Crane with Wrayford's Dame Isobel Crane | The footman is Pocklington; the shepherd is Amos Hebden. (The first choice, Tull, clashed with Wrayford's Robin Tull.) |

## Tests added in this revision

`test/hessel-wander.test.ts` (three builds, two seeds by default). In `test/hessel.test.ts`:

- the Old Town hears of Hartopp's boots at the Two Poles;
- a mage reckons the drops, and hears the round from Mopsa;
- Mrs Scrope on the Hospital;
- a warrior on the Orm road is warned at the hut, walks past, fights the footpads, is told about the child, and is in
  time for the College.

The helper moved to `test/support/hessel.ts` so that `scripts/hessel-transcripts.ts` can share it.
