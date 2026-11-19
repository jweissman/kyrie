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
