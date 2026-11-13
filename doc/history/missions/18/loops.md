# Mission 18: the adventuring and economic loops

The owner, 2026-10-30: "certainly the economic and adventuring loops need care and attention". Two documents of the
same day agree on why ordinary play does not yet feel like a game. The OWN-28 diagnosis
([diagnosis.md](diagnosis.md)) traces one ordinary expedition. The independent cold review, section H
([../../playtests/systemic-enjoyment-2026-10-30/review.md](../../playtests/systemic-enjoyment-2026-10-30/review.md)),
names the general rule: Kyrie has rules for the states of an adventure, but no grammar that turns them into a loop that
repeats. This note is the design the loop work follows. Register rows REV-01 to REV-05 hold it.

## The order

1. **Repair one expedition whole: the bell and the hobs from Brightbridge.** The expedition repair is under way, in
   the worktree `expedition`.
2. **Render that expedition through decision frames** (the glance, in the worktree `glance`).
3. **Generalise the contract to every scenario, work and kit.**
4. **Then Search, the wild's decisions and the capability market**, each measured in play.

More sites, shops or treasure added before the contract and the frame would only enlarge the inventory of
disconnected things.

## The expedition contract (REV-01)

Every scenario, makers' work and kit placed in a world declares each of these links, or declares that it declines one
and why:

| Field | What it is | Holds today in |
|---|---|---|
| `lead` | How ordinary play first perceives it: a sight, a sign, a word in the place it is bound to | Scenarios; the hobs kit after the repair |
| `aim` | The desire the lead supports, an Objective, without prescribing a solution | Scenarios, the bounty |
| `place` | Where it is on the one map, and how much of the route the lead grants | Scenarios and works; kits after the repair |
| `threshold` | What entering commits the company to, said before it is entered | Nowhere as a rule |
| `inside` | At least one spatial or causal development past the threshold | Works and kits; dens after the repair |
| `answers` | At least two materially different ways through the first obstruction, or a place to learn the missing one | Kits; the works after the gate check |
| `yield` | Information, a resource, a person, a route or an object worth taking out | Works' treasure; the hobs' boy and bell |
| `aftermath` | Who or what changes on the return | Authored adventures; generated, after the repair |
| `successor` | A new possibility opened, or a settled state that is plainly final | Authored adventures only |

The world audit reports each field separately, for each placement in each surveyed seed. It is a gate across the
countries' seeds. "The module loaded", "the room is reachable with state put there" and "a player can complete the
expedition" are three different claims, and the audit keeps them apart.

## Search: a cue, or a sweep (REV-02)

Today `Search here` (data/rules/discovery.kyr:71-76) is offered once in every lit place. It costs twenty minutes and
always answers the same sentence. Its yield exists only where some author happened to watch for `searched(...)`.
The player learns to search every room for luck.

- **Examine a cue.** Generation and authors give places perceptible cues: tracks, cold air, disturbed dust, a hollow
  wall, beads among bones. Examining one is the act the page promotes when there is a reason to look. Skills and
  tools change what is read and how safely.
- **Sweep.** The fallback is offered only where something can be found or plainly ruled out. It states its scale and
  cost before it is done ("a small chamber; twenty minutes"). It always ends with what was found or a confident
  negative ("nothing is hidden here").
- **Measure.** Of the first twenty searches an uninformed player chooses, how many reveal a new actionable fact,
  thing, route or confident negative.

## The wild asks (REV-03)

The terrain, sight, survey and map knowledge are the spatial chassis. What the wild lacks is a turn that asks for a
decision, not more permanent places. Sometimes, by terrain, weather, hour and supplies, a stretch asks one of a
restrained set of questions:

- press on or camp;
- the high route or the sheltered one;
- follow a sign or keep the bearing;
- spend a tool, or time;
- approach travellers or avoid them;
- mark a partial discovery, or look now.

The answer changes position, supplies, knowledge, risk or a moving situation. Quiet stretches stay quiet. This
refines OWN-27, and it is measured as significant discoveries and choices per hour of unquested travel.

## A capability market (REV-04)

A return today converts treasure to coin, and the sale pays its worth again as experience. That makes liquidation the
only reading of treasure (SLIP-25; the sale says "its worth is experience"). Food, light and lodging are too cheap to
matter after a delve. A recruit costs a few coins once.

Each substantial town offers two or three expensive, visible possibilities tied to what the town is:

- **A mentor** who teaches a technique or opens a skill, after proof and payment. Training already exists in the
  rules; generated residents do not yet declare what they teach.
- **A specialist** who identifies, alters or uses a class of treasure.
- **A companion** whose continued service asks a share, gear or a fulfilled aim.
- **An expedition asset:** pack animals, a boat, a guide, a survey, a permit, a safe house.
- **An institutional threshold:** membership, library access, a workshop, a shrine's rite, a guild's standing. These
  connect to the canonical institutions of [one-universe.md](one-universe.md).
- **A commission** that changes an item, not a larger number.

Selling stops granting experience; experience comes from the expedition's yield and aims. A census over 12 countries
measures the ratios ruin to shop, expedition to service, and experience to capability, before and after. The test of a
good reward: "because I returned with this, I can now play differently."

## The decision frame (REV-05)

This extends the glance (OWN-18, OWN-19) from arrival to every act. The frame has five parts, computed by the runtime:

| Part | What it holds |
|---|---|
| `now` | The most important changed or threatening fact |
| `aim` | The one or two intentions affected here |
| `acts` | At most three promoted, each with its commitment and cost |
| `inspect` | Perceptible cues that can reveal more |
| `reference` | Everything else, opened on purpose |

After an act, the page shows attempt, result, changed state and the newly relevant act, in that order. That gives
the player anticipation, commitment, response, explanation and changed possibility. Today a Search that says only
that a search happened, a truce that ends without a change of stance, and a one-way way shown as an ordinary exit
are the failures this answers.
