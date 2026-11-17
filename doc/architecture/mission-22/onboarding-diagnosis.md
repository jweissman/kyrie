# Onboarding: a headless diagnosis of the first hour (OR-60)

The owner, 17 November: "play-feel still seems dull and shallow with very little clarity on how to do interesting
things; or unlock new adventuring verbs; or even just do something normal and mundane. It feels like most of the story
hooks don't really onboard you properly."

This round played the first hour as a player who knows nothing, through the terminal's own projection (the runner:
the scene's lines, the four rows the glance leads with, the rest, the aims). Three countries (a1, kite, thorn), a lone
human warrior, the "over the hills" origin in each, and in a1 every other origin too (kin, debt, order, map, lost,
courier). Each aim held after the opening was followed in a session of its own, resumed from one checkpoint. Each turn
took the gold row (the page's lead), or else the terminal's led row, for up to sixteen acts. The walk stopped at a
fight, a loop, no lead, or nothing followed. The scratch drivers are kept outside the repository, in
`/var/tmp/kyrie/m22/onboard/` (`drive.ts`, `hooks.ts`, `ordinary.ts`); their transcripts are beside them.

## What the opening offers, and whether each hook pays

| country, origin | hooks held | first act it leads to | pays off |
|---|---|---|---|
| a1, over the hills | the boundary stones (quarrel) | into the inn, out to its garden, "Search here" | 5 acts: the old holes found, Mik told, 300 experience |
| a1, after the notice | rats, the dead, the spiders | "Ask Mik/Eogan/Eamon about …" | 1–2 acts: the key; then 4 to the fight |
| a1, kin | your father on the road | to the camp, the road, "Follow the ruts" | 6 acts: told your mother, 300 experience |
| a1, debt | 50 coin owed to Mik | "Tell Mik you will have it" | the inn names Ironkeep; there one steel coin; then the gold walks out into open fields and leads nowhere (**dead end**) |
| a1, order | the brothers' writing | "Give Eogan the brothers' letter" | to Mistlake; at the speaking door the answer must be known (**asks what the player cannot know**; a riddle, the lead's OR-59) |
| a1, map / lost | Ironkeep's cross / your sister | "Set out for Ironkeep", "Search here" | 2 acts; the sister's thread is seen through on a cloak-pin (BL-11, thin) |
| a1, courier | the sealed letter | "Set out for Mistshaw", "Give Edrick the sealed letter" | 2 acts, 200 experience |
| kite, over the hills | the fevered child | herb-shop, buy, give, sit | 5 acts, a good small scene |
| thorn, over the hills (no trouble) | "There is work in Misthythe …; the place to hear of it is the taproom" | "Into the Laughing Flame" | **0 acts, and nothing**: the aim was seen through on the threshold; nothing was said of any work, only "Arlen there is looking for work" (a recruit) |

What succeeded each first aim, when one was seen through, was nearly always a work's next aim. Here they are as they
were offered:
- a1 kin, kite: "A salvage crew, the Spade-Company, has made a camp on the ridge …"
- a1 map and lost: "Nobody has held Ironkeep since the kingdom fell, and what its lords left there is there still."
- a1 courier: "Whatever was buried with the dead of Shadowrest lies there still."

Each says how things stand, and no act. The goings-on of every town were worded the same way: "The innkeeper and the
merchant are at odds over the boundary stones in the inn's back garden", "A drover from Lowmouth went out on the road
and did not come home", "Gosse's Company, players, are stuck at Lowmouth until someone pays their reckoning". All 17
goings-on aims and all 14 works' aims (31 of 31) named no first step. The gold leads well once an aim is followed (the
walks above). But an aim read in the Notes, or offered as what comes next, does not say what to do.

## Where hooks dead-end, loop or ask the impossible

- **The wanderer's work in a town with no trouble of its own** (thorn): no payoff at all (above).
- **The debt after Ironkeep** (a1): one steel coin found, and the gold walked the company out into "open fields
  north-west of Mistshaw", then led with nothing: "Look out over the country from here", "Wait".
- **The speaking door** (a1, order): the walk pressed "Shadow" again and again. The answer is a riddle's; nothing
  offered says which word, and the lead is already on it (OR-59).
- **The lessons** (a1's drill-yard): "Ebba teaches Taunt, Riposte and Rapid Strike, 20 coin a lesson … only to one
  who has done enough out in the world to have earned it." Nothing said what "enough" is (it was 20 experience), and
  "Talk to Ebba" gave only a greeting. The one verb a warrior could unlock in the first town had no way into it.
- **The same opening in every country**: a1, kite and thorn all open on the wagoner's cart down in the ditch, and a1
  and thorn on the same man cutting reed (CO-03's kit sameness).

## Ordinary acts

At a1's first town, 91 places were visited by putting the company there (`ordinary.ts`), with these ordinary acts
offered:
- buy, at 38 rows;
- haggle, at 30;
- gather a plant, at 28;
- a bed and supper, and work for your keep, at the taproom;
- rest, in the cellars.

**The glance's four led with an ordinary act at none of the 91.** In the chandlery, with 24 ordinary acts, the four
were "Follow …", "To the landing", "Talk to Ulf" and "Wait"; in the general store, with 22, the same. Buying is
reached through "Talk to …", or through the rest of a long list: at the taproom the rest ran to about 130 rows, with
some forty "Ask Eamon about …" and, at every outdoor place, some forty "Set out for …". At kite's market the town's
notice of work was not among the four or the rest at all, only under the things lens. The ranking of the four is
the lead's (lens ranking, the four-row rule), and is left to it with these figures.

## Verbs unlocked

No hook taught or unlocked a verb. The first hour's new verbs are the teachers' lessons: the drill-yard's techniques
and, behind the scrivener's curtain, spells. Both were said as "only to one who has done enough", with no act that
said what would earn one.

## Fixed this round (engine and content), each pinned by a spec that failed before

1. **A hook names its first step.** The 17 goings-on aims and the 14 works' next aims are said as something to do,
   and where, before why:
   - "Look at the boundary stones in the inn's back garden: the innkeeper and the merchant are at odds over them";
   - "Go down into Shadowrest: whatever was buried with its dead lies there still";
   - "Pay the players' reckoning, or find who will".

   None is heavier by ClauseLoad (four heavy sentences before, one after). Held by `test/small/hooks-first-step`
   (31 of 31 failed before).
2. **The wanderer's work is told where it is heard of.** Come to the inn, its keeper sends the company to the notice
   ("'Work?' says Cyril. 'The notice on the well-post has jobs on it …'"), and the company holds each job as an aim.
   The aim now reads "Go to the taproom of the Laughing Flame and ask after work". Held by `test/wanderer-work`
   (thorn).
3. **A lesson says what opens it.** "Ask Ebba for a lesson" (and the same of the one behind the scrivener's curtain)
   is answered with what earns one ("a nest cleared, a debt paid, the dead laid"), then with its fee once it is
   earned. Paid, "Train Wenna in …" is offered. Held by `test/lesson-unlock` (a1).

## Left open

- **The glance never leads with an ordinary act**, and kite's notice of work sits only under a lens: the lead's
  ranking.
- **The rest list**: about 130 rows at a taproom, and forty destinations at every outdoor place.
- **The debt's dead end after the first old place** (aim route).
- **The riddle at the speaking door** (OR-59).
- **One opening** in every country (CO-03).
- **The sister's thin payoff** (BL-11).
- **Origins whose first aim states a situation**: the debt's "50 coin by market day, owed to Mik". Several origin aims
  are pinned word for word by browser specs, so they were not reworded here.
