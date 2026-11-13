# The world is already there: an independent review of how Kyr turns simulation into play

*30 October 2026. A deeper follow-up to an initial review of the deployed game. This is advice about the player's
experience, not an architecture audit or a restatement of the Mission 18 register.*

## Scope and evidence

I used four views of the current game:

1. The deployed reader at `https://jweissman.github.io/kyrie/`, checked as the version a player is offered.
2. A manual terminal session in *The Liberty of the Ice*, from the North Road into Pellam, the Cheaping and Swan
   Lane. This exposed the authoritative choices and state changes without relying on the graphical grouping.
3. Three fresh generated-world `playtext` walks: a wanderer/warrior in Faennmeós (100 actions), a kin/mage in
   Needlewaste (50 actions), and a debt/thief in Willowweald (24 actions before death). These are stress walks, not
   models of an intelligent player: the action selector favours movement, asking, talking, searching, gathering and
   commerce, but does not pursue an aim. Their value is showing what the ordinary choice surface tends to produce
   when intention is weak.
4. The current browser records for Pellam, generated exploration and the ordinary expedition. Those records supply
   visual evidence that the terminal cannot: hierarchy, scrolling, the map and the difference between the reader's
   staged scene and the runtime's flat list.

A fresh Chromium session was not possible in this environment because the installed browser cannot load
`libnss3.so`. I therefore do not make new claims about animation, pointer feel or touch behavior. The manual terminal
also omits most narration and conversational replies; `playtext` renders those through the same narrator used by the
page and closes that gap.

## Verdict

Kyr's hard problem is no longer making a world. The world is already there. The hard problem is **continuity of
attention**: helping a player form an intention, keep it across changes of place and mode, understand what presently
answers it, and see the world answer back afterward.

Kyr is most convincing when several systems meet in one perceptible situation. A public question at Pellam can be
theology, reputation, law and a future trial at once. A view from the swing-boat is spectacle, orientation and the
discovery of a ship. A dog with mud on its paw can be character, observation and a trail. A torch burning down in a
barrow makes time, equipment and place one event. These moments feel discovered rather than dispensed.

It is least convincing when the same systems are presented beside one another rather than through one another: a
town description, a cast, a danger, a list of roads, a pack, generic waiting, generic searching and remote
destinations all valid at once. This is not principally a content shortage. It is a failure to decide what the
current moment is about.

The distinction matters. Adding more people, sites, encounters or verbs to the existing projection would make the
problem worse. The next improvement should make the simulation more selective and responsive at its boundary with
the player.

## What the deeper play showed

### 1. Pellam proves that staging works

The manual Pellam session began with fourteen choices on the North Road: four kinds of waiting, one way forward,
camp, search, two spell changes, light and four ways to set down possessions. At the North Bar there were fifteen; at
the Cheaping, nineteen. Swan Lane also offered nineteen, including the two actions that defined the immediate scene:
shake on a penny a stair, or step over the watermen's plank.

In the terminal those actions are peers. In the reader record, the North Bar is much better: the prose occupies the
page, “To the Cheaping” is promoted, and routine actions recede into the footer. At Callow, the page narrows further
to a public question and three comprehensible responses. The underlying abundance has not been removed; it has been
edited into a moment.

That is the strongest evidence for the proposed direction. Kyr does not need to become a sparse choice game. It
needs the confidence to stage a few choices while retaining the world behind them.

### 2. Generated settlements have texture before they have drama

The generated arrivals are often lovely. Harifnof is a quay-town where three people on shore tell an incoming boat
how to sail; Eldis solders a kettle over a small fire; shutters bang in the wind. Misthythe has its landing, dog,
chandlery, home fields, eel-weirs and a circus bill whose state changes. Marsholt announces itself through charcoal
before the player sees the clearing.

These are excellent observations. They make a place imaginable. But an observation is not automatically an
affordance. The three people shouting at the boat cannot necessarily be joined, questioned or contradicted. The
smith's visible work is not normally work the protagonist can commission, assist or interrupt. The apothecary can
sell a dandelion, but the place does not first establish why that dandelion might matter.

The result is a repeated rhythm of vivid noun followed by generic verb: enter, talk, buy, search, leave. Kyr's prose
promises a more particular interaction than the action model regularly cashes.

### 3. An aim can be born cleanly and still lose the player's attention

The warrior walk reached Marsholt after fifty-three actions. Arrival did several things exactly right: it revealed
that hobs had taken the town's bell, named their hold at Reodheald, made the keep a destination, and created two aims—
recover the bell and investigate what the old lords left behind.

The next selected action was not toward Reodheald. It crossed the southern march. The following thirty actions were
mostly travel between fen hexes, waiting and empty searches.

Because this was a stochastic stress walk, it does not prove that a person would make the same decision. It proves
something narrower and more useful: after the game formed a strong intention, aim-serving actions remained only
members of the ordinary legal set. The system had no durable bias toward the story it had just made salient.

An aim should affect more than the Notes page. It should alter the projection of the world:

- the relevant person should be visually connected to it;
- the route or next uncertainty should be promoted;
- preparations that answer its known risks should explain why;
- incidental discoveries should say whether they divert, help or threaten it;
- returning to town should first report its aftermath.

The player may still abandon the aim. Abandonment becomes meaningful only when the game makes clear what is being
set aside.

### 4. Wilderness travel has geography but too little event grammar

The new exploration loop is real. A player can leave the road, cross terrain, look out from height, discover a site,
choose it on the map and retain that knowledge. The descriptions notice weather, light, footing, water and elevation.
That is a stronger foundation than conventional map-icon discovery.

But the long stress walk exposes the empty middle of the loop. Many successive actions moved from “the fen of
Merefen” to another “fen of Merefen,” with modest descriptive variation. Searches repeatedly found nothing. Gathering
willow bark, sphagnum and meadowsweet produced objects without creating an immediate reason to value them.

The answer is not a permanent point of interest on every hex. It is a sparse grammar of **terrain-caused events**:

- evidence that updates a route or danger;
- a temporary opportunity that will not wait;
- a cost that asks for equipment or judgment;
- another traveller whose purpose intersects the player's;
- a partial discovery whose meaning becomes clear elsewhere;
- a choice between progress, safety and curiosity.

One such event every few legs would do more than ten additional ruins. It would make the country between named sites
part of the adventure rather than its loading screen.

### 5. Danger can be well signalled and still lose the decision hierarchy

The thief walk entered the bee orchards at night. The game gave excellent warning: a young owlbear rose among smashed
skeps, screamed, stepped closer, and would wait nine minutes before attacking. The walk then chose “Wait an hour.”
The owlbear attacked, critically hit the lone protagonist for eight damage and ended the journey.

Again, the selector is not a human. The diagnostic fact is that a one-hour wait remained an ordinary peer while a
nine-minute threat was active. Urgency was represented by the simulation and beautifully narrated, but insufficiently
represented in the action surface.

When a clock is shorter than an offered action, the choice should be framed as a commitment: “Wait an hour—letting
the owlbear come on.” Generic utility actions should either acquire contextual consequences in their labels or move
behind a deliberate “other actions” control. This principle applies equally to a burning torch, a closing shop, a
trial at four and a companion bleeding out.

### 6. Character identity does not yet reliably steer ordinary play

The three walks began as warrior, mage and thief, but their ordinary verbs were strikingly similar: move, wait,
search, buy, gather and talk. The mage bought candles and crossed the country; the thief bargained once, bought food
and died to an owlbear; the warrior gathered medicinal plants without a profession-specific use surfacing.

Class need not become a set of colored dialogue buttons. It should change what the protagonist notices and what
transformations they can attempt. A thief might recognize who profits from the watermen's toll, a mage perceive what
kind of working made the flash in the Strewnfield, a bard turn the circus crowd into income or influence, and a
physician see a use for the willow bark before it becomes pack clutter.

The important unit is not “a class option.” It is **a class-specific reading of a shared situation**.

## A proposed experience model

Every scene should answer five questions, in this order:

1. **What do I notice?** One particular image, not a gazetteer.
2. **What is happening?** An activity, change, danger or charged quiet.
3. **Why might I care?** Connect it to an aim, relationship, need, identity or visible reward.
4. **What can I do about it now?** Usually no more than three promoted interventions.
5. **What else is here?** The full legal world, deliberately inspectable.

This is a projection over the existing runtime, not a second quest engine. The runtime remains authoritative about
what is legal. The scene projection becomes authoritative about what deserves attention.

Four facets seem sufficient for a first implementation:

| Facet | Meaning | Presentation |
|---|---|---|
| Immediate | Answers visible activity, danger or a short clock | Prominent, contextual label |
| Aim-serving | Advances or prepares for a current intention | Prominent, with the connection stated |
| Revealing | May form a new intention or materially revise knowledge | One or two invitations |
| Reference | Legal, routine, familiar or inventory-level | Behind inspection/footer |

An action may occupy more than one facet. “Ask why the bell was taken” can be immediate, aim-serving and revealing.
That is precisely the kind of density Kyr handles best.

## Recommendations

### 1. Make aims active projections, not journal entries

When an aim is created, identify its next known uncertainties and the local actions that answer them. Promote those
actions wherever relevant. Let an aim be pinned, suspended or abandoned explicitly; do not silently let it dissolve
into the legal set.

### 2. Give situations initiative

Important people and events should act before being selected. Callow already does this by calling the stranger into
his argument. Generalize the pattern modestly: one unsolicited question, request, warning, contradiction or visible
act is enough to turn an NPC from an interface into a person.

### 3. Contextualize generic actions under pressure

Waiting, resting, searching, leaving and travel should say what will probably happen to the visible clock. “Search
the orchard; the owlbear will attack before you finish” is a meaningful decision. “Search here, 20m” is arithmetic the
player must perform against a clock shown elsewhere.

### 4. Build three operational noncombat loops

Choose three—performance, medicine and trade would cover distinct systems—and make each a complete loop with:
preparation, a perceptible situation, uncertainty, a distinctive intervention, material/social aftermath and a new
capability. Reuse those loops across generated settlements before adding more professions.

### 5. Require aftermath surfaces

Every significant situation should declare at least one later perceptible change: a greeting, price, absence,
rumour, route, danger, invitation, obligation or visibly settled quiet. Persisted state that never reaches perception
does not yet exist for the player.

### 6. Populate journeys with sparse causal events

Measure not points of interest per country but consequential decisions per travel hour. Prefer temporary, terrain-
caused events over more permanent destinations.

## Acceptance tests for the next pass

These are experiential gates, not unit tests:

1. **First-town test:** after creation, five new players can each name what is happening, one person who wants
   something and two sensible next acts without opening every person or way.
2. **Aim-retention test:** after accepting the stolen-bell aim, a player can travel, shop and sleep, then still see
   the next relevant uncertainty without consulting Notes.
3. **Urgency test:** no action longer than a visible threat clock is offered without stating that the threat will
   mature during it.
4. **Profession test:** in the same generated settlement, warrior, mage and thief each discover one materially
   different way to alter the same situation within ten choices.
5. **Journey-density test:** a four-hour cross-country trip contains at least one decision caused by its terrain,
   weather, travellers or current aim, without requiring a permanent site.
6. **Return test:** after resolving a den, rescue or public dispute, the first return scene contains a perceptible
   consequence before generic navigation.
7. **Restraint test:** an ordinary arrival promotes at most three interventions; every other legal action remains
   reachable in one deliberate inspection.

## Final assessment

Kyr should resist the temptation to demonstrate the size of its simulation on every screen. Its world feels largest
when one small fact connects to another: mud to a cart, a bell to hobs, an oath to a court, a view to a journey, a
torch to a sealed room. Those connections are the game.

The next design phase should therefore optimize neither content count nor menu completeness. It should optimize the
rate at which chosen attention produces a new relation, and the reliability with which that relation changes what
the player sees and can meaningfully do.

The encouraging conclusion is that the expensive work is visible everywhere: language, geography, time, people,
equipment, danger, memory and authored situations already coexist. Kyr does not need to invent its identity. It
needs to trust that identity enough to edit the moment.
