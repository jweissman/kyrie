# The content thread (19 November)

The owner, 19 November, after their own play on 44565fb4: "the conflicts are just way too thin — quests are over too
quickly, we're sent out of town immediately and the 'dungeons' we go are deathly dull and boring and have almost no
content or combat; and it just seemingly sends you on a random chain of quests that don't circle back or explain
themselves… a thread we need to follow for at least a day (3x–10x content in the first 15m)".

## The measure

`bun scripts/first-quarter.ts [--origins …] [--timeline] [--lead N]`: a player who follows the gold, as the owner
does, in each origin of Iscoed, sixty acts. Per walk: fights, places, rooms under ground, aims taken and ended, the act
the company first leaves town, talks, looks.

Baseline (44565fb4, the walker able to ask a question led inside a talk and to take a fight the gold leads to unless
deadly):

| walk | fights | places | sites | aims taken | aims ended | first out (act) |
|---|---|---|---|---|---|---|
| iscoed/drove | 1 | 24 | 1 | 24 | 14 | 11 |
| iscoed/debt | 3 | 14 | 7 | 14 | 8 | - |
| (kin, herbs, wanderer: the debt walk act for act; order: 4 fights) | | | | | | |

The debt walk: the rat job in twelve acts and two fights; the dead job in ten acts and no fight (one intimidation);
the spiders' gallery, where the lone warrior died. Each site three or four rooms; only the room with the foe holds
anything. The drove walk: across three towns on two- and three-step errands (search, take, use, done), one fight.

## What was found first: the content written is not reached

The undertown (data/generation/town/undertown.kyrt) is far more than the walk saw: past the three troubles an old
drain with its centipede, an undercroft where the three ways meet (a resting place), a charnel passage with the
raiser's first dead, a working face with the quarrymen's wages, a lettered flag that is a puzzle (letters cut in three
other rooms), a sealed vault and its keeper, and the deep site below. The gold never led there:

1. **The old ways' aim arose with the job's first half and had no place it was toward**: one aim among the town's,
   never followed on; the gold went up to be paid and off to the next notice. Now it arises as the job is paid (the
   payer says the drain goes on) and is followed on as the job's next part, toward the undercroft by the room the job
   ended in.
2. **A route's waypoint counted as spent once been to** (AimLeads.spent), so the rat-runs were never the way back
   down. Not while the route is still to be taken.
3. **"Within a site" leads never held under a town**: the undertown's rooms are the town's, not a site's. The ground
   under a town is now one site to what an aim waits on (AimLeading.site).
4. **What an aim waits on through an act was not traced**: the flag lifts by pressing letters, pressing wants the
   letters known, they are found by searching three rooms. AimAdvances.waits now reads one act back (its needs to be
   known, been to or held), an act's own parameters free.
5. **Where the clue lies here, the lead was the next place it lies in**, and the glance gilded the way to the room the
   aim names: in the drain, back to the undercroft; there, back to the drain. Here is now the step (AimLeading.lies),
   its search the aim's act.

After these, the debt walk goes rats → paid → corn-store → cellar → runs → drain → undercroft → flag (levered, failed)
→ the drain searched (the centipede woke) → letters → flag pressed → the vault, gold on its keeper.

## Still open, in order

- More happening in the rooms on the way: credible foes where a room has a reason for one (the cellar's sentry rats,
  the crypt's restless dead before the ossuary, spiderlings in the adit), hazards (Hazard: the crypt's broken stair,
  the adit's loose roof, the drain's foul air), finds that say what happened here. Target, the debt walk: fights 3 → 9+
  in sixty acts, every room on the gold's way with something to do.
- The drove origin sends the company out of town at act 4: its errand chain (customs → Reedbridge → Gatesend) is
  three towns of two-step fetches. Keep the first errand's first act in town, and the town's undertown before the road.
- Quests that circle back: each payer says what comes next (done for the rats), and the three troubles' one story
  (the undercroft they were all dug into) told as it is found.
- Lone-company balance under more fights: rests (the undercroft), the priest's potions before, not after.

## 19 November, afternoon

- In: the cellar's rats, the crypt's bats and the adit's beetles, each coming at the company once as it arrives; at the
  route's place, its ways on beside the rest where all else led back (AimRoute.join: the quarry pit). The debt walk:
  6 fights in its first 47 acts (from 3), the adit and gallery reached.
- Held back: the culvert's foul air and the cutting's cracked roof (Things with a dangerous state and their risk
  rows). Their rows moved the kept cold plays' replays (cold 4–6, the terminal's again); they come back with those
  plays' specs reading rows by what they do, not where they stood. The kept plays set the new arrivals aside
  (test/support/before-rooms).
- Still to do: the lone warrior's balance with more fights (the census rests when hurt; the gold does not say so), the
  drove origin, and quests that circle back.

## The first choices, the owner's thought (19 November, late)

The owner: the very first choices should be (a) help someone or ignore them, (b) explore a cave and fight or go into
town, (c) find companions or go alone, very present in the first fifteen minutes; people should talk about the cave;
the cave deep and explorable by an "Explore…" act that runs a lottery over what is found (room, people, things,
wonders, treasure); someone recruitable in the very first space; perhaps begin in the dark, a light before anything
but waiting. "Just some thought": not to displace the priorities (the opportunity architecture, the route finder).

What exists: (a) is the opening's road meeting (data/origins/prologue.kyrt, drawn by seed); (c)'s rules exist (people,
hirelings: S2-6) but the one met goes on to the inn as a memory, not a companion; (b)'s sites exist, generated whole
and walked, with no lottery; people already tell of sites when asked of the country.

Proposed, smallest first, each Deem-drawn and seeded:
1. The one met on the way in recruitable: helped, they offer to come along; robbed or ignored, not (prologue.kyrt,
   data only).
2. The cave talked of: the innkeeper and the one met each name the nearest deep site; a lead, never a held aim (HP-01).
3. "Explore deeper…": a cave's rooms generated as now, but entered by a lottery: each try reveals one hidden room drawn
   by the world's seed (a band, a find, a wonder, someone lost, a trap), costing time and maybe waking something
   (rooms.kyrt, hoards.json, powers.json); deterministic, so saves and replays hold. Generation at play time is M23's.
4. Beginning in the dark: reconciled with the opening's painting (dim, at night), the first act a light that shows the
   meeting; the owner's word wanted first.

## The reference route (the owner, 19 November, night)

The drove stays the primary acceptance route for the first hour; debt is a comparison for dramatic density, and the
alternate mage route is kept. The reference does not move because debt plays better: the drove is brought up to it.
