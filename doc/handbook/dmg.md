# Dungeon Master's Guide

How the world runs. Everything in a Kyr world is a fact (a relation or a measure) that actions and rules change. The rules modules below are loaded by every world; each entry gives the authors' statement of a rule above the condition and the change the engine applies. A place, a person or a band behaves as these rules say, and nothing else decides for them.

Time passes in watches of ten minutes. A rule fires as soon as its condition holds; an action takes its time and then makes its change, unless something interrupts it.

## The world's rules

### What a power is after, and how it goes about it, a stage at a time

Also kept, without comment: stage, stageDue, pace.

| Kinds | Relations | Measures | Queries | Rules | Actions |
|---|---|---|---|---|---|
| 1 | 3 | 3 | 0 | 1 | 0 |

#### pursues, won, foiled

*Kyr · relation(group, ambition); relation(ambition); relation(ambition)* · `rule:world_ambitions.pursues`

A power pursues an ambition in stages, the next due so many watches after the last (its pace), while the power is able and the ambition is neither won nor foiled. What each stage does is the ambition's author's: rules on stage(ambition), and on won and foiled.

#### ambition_advances

*Kyr · rule* · `rule:world_ambitions.ambition_advances`

> When: pursues(?g, ?a); able(?g); not (won(?a)); not (foiled(?a)); watch(clock) >= stageDue(?a)

> Then: Increase stage(?a) by 1. Increase stageDue(?a) by pace(?a).

### What people hold true, and how they come to let it go

Also kept, without comment: refutes, scorns.

| Kinds | Relations | Measures | Queries | Rules | Actions |
|---|---|---|---|---|---|
| 1 | 7 | 1 | 0 | 2 | 0 |

#### believes, conviction, disputant

*Kyr · relation(group, claim); measure(group, claim); relation(group)* · `rule:world_belief.believes`

A claim someone holds, and how firmly they hold it: 2 sure of it, 1 shaken, and at nothing they let it go. Whoever will hear reasons (a disputant) can be argued with; what tells against a claim is a fact about the world (refutes), true whether anyone knows it or not.

#### reasoned, swayedBy, doubts

*Kyr · relation(group, claim); relation(group, claim, group); relation(group, claim)* · `rule:world_belief.reasoned`

How a claim was let go: for a reason the world gave (reasoned), or only to good arguing, and whose (swayedBy). A reason may shake a claim without its being let go: whoever was given one holds it still, less firmly, until the rest of the way is argued. Let go for a reason it stays let go. Argued away without one, it is back by morning, and the one who argued it away is scorned for it: not listened to again.

#### let_go

*Kyr · rule* · `rule:world_belief.let_go`

> When: believes(?g, ?c); conviction(?g, ?c) < 1

> Then: Retract believes(?g, ?c). Assert doubts(?g, ?c).

#### sway_wears_off

*Kyr · rule* · `rule:world_belief.sway_wears_off`

> When: doubts(?g, ?c); swayedBy(?g, ?c, ?a); not (reasoned(?g, ?c)); untilLight(clock) == 1

> Then: Retract doubts(?g, ?c). Retract swayedBy(?g, ?c, ?a). Assert believes(?g, ?c). Set conviction(?g, ?c) to 2. Assert scorns(?g, ?a).

### What the company carries

Also kept, without comment: itemKind, ownedItem, wearing, forSale, soldBy, wearable, consumable, canTrain, teaches, proficient, wants, weighed, objection, pays, price.

| Kinds | Relations | Measures | Queries | Rules | Actions |
|---|---|---|---|---|---|
| 2 | 24 | 9 | 2 | 7 | 18 |

#### relieves

*Kyr · relation(member, itemkind)* · `rule:belongings.relieves`

What could be used on a member to any end: a remedy for a hurt or an ill they have, a light while they carry none burning, or a draught for what it does.

#### lightsUp, burns, fuel

*Kyr · relation(itemkind); relation(itemkind, itemkind); relation(itemkind)* · `rule:belongings.lightsUp`

What is used by lighting it, on whoever carries it (a torch, a candle); what burns in something else, and what it burns in (lamp oil, in a lantern).

#### worth, buysValuables, realized, valuable

*Kyr · measure(itemkind); relation(group); relation(item); relation(itemkind)* · `rule:belongings.worth`

What a kind of thing is worth (its catalog value), and those who deal in valuables: a merchant who buys any treasure brought in, at its worth, if they have the coin (as Orsino's shops buy junk). Treasure brought home and sold is the company's experience, the first time it is sold: its worth, to each who brought it.

#### mass

*Kyr · measure(itemkind)* · `rule:belongings.mass`

What a kind of thing weighs, where it says (a module's own kind, "weighing 2"); selm weighs less than nothing.

#### carried, capacity

*Kyr · measure(member); measure(member)* · `rule:belongings.carried`

What each member carries, and can carry (see Burden): a company with anyone carrying more is laden, and goes slowly, at half its pace.

#### laden_felt

*Kyr · rule* · `rule:belongings.laden_felt`

Says: "What you carry drags at you: you will go at half your pace until you set something down."

> When: laden(?a); company(?a); not (weighed(?a))

> Then: Assert weighed(?a).

#### laden_eased

*Kyr · rule* · `rule:belongings.laden_eased`

Says: "You go easier for what you have set down."

> When: weighed(?a); not (laden(?a))

> Then: Retract weighed(?a).

#### speed

*Kyr · measure(member)* · `rule:belongings.speed`

How fast a member goes, in hundredths of their own, where a module says (the stilling: half at a point of dose); unset is their own. A company walks at its slowest member's speed, and laden at half that.

#### purse, appraised

*Kyr · measure(group); relation(item, group)* · `rule:belongings.purse`

How much coin a dealer keeps in the house: what they pay out, trade brings back by the next morning.

#### purse_refilled

*Kyr · rule* · `rule:belongings.purse_refilled`

> When: untilLight(clock) == 1; buysValuables(?m); purse(?m) > quantity(?m, gold)

> Then: Set quantity(?m, gold) to purse(?m).

#### owns, lends, objected

*Kyr · relation(group, item); relation(group, item, group); relation(group, item)* · `rule:belongings.owns`

Whose a thing is, and to whom they have lent it. An owner, or one who serves them, who sees the company with it unlent (awake, and there to see it), says so once, in their own words if they have them ("Objects" in a person), and is not the company's friend after. One asleep sees nothing.

#### owner_objects

*Kyr · rule* · `rule:belongings.owner_objects`

Says: "{?o} sees {?i} in your hands. 'That is mine.'"

> When: owns(?o, ?i); company(?c); unlent(?o, ?i, ?c); perceives(?o, ?c); not (objection(?o, ?w))

> Then: Assert objected(?o, ?i). Assert hostile(?o, ?c).

#### owner_objects_aloud

*Kyr · rule* · `rule:belongings.owner_objects_aloud`

Says: "{?w}"

> When: owns(?o, ?i); company(?c); unlent(?o, ?i, ?c); perceives(?o, ?c); objection(?o, ?w)

> Then: Assert objected(?o, ?i). Assert hostile(?o, ?c).

#### servant_objects

*Kyr · rule* · `rule:belongings.servant_objects`

Says: "{?s} sees {?i} in your hands, and goes to tell {?o}."

> When: owns(?o, ?i); company(?c); unlent(?o, ?i, ?c); serves(?s, ?o); perceives(?s, ?c); not (objection(?s, ?w))

> Then: Assert objected(?o, ?i). Assert hostile(?o, ?c).

#### servant_objects_aloud

*Kyr · rule* · `rule:belongings.servant_objects_aloud`

Says: "{?w}"

> When: owns(?o, ?i); company(?c); unlent(?o, ?i, ?c); serves(?s, ?o); perceives(?s, ?c); objection(?s, ?w)

> Then: Assert objected(?o, ?i). Assert hostile(?o, ?c).

#### shelf

*Kyr · measure(group, itemkind)* · `rule:belongings.shelf`

How many of a kind a seller has out for sale. What is used up (a torch, a flask of oil) comes back to the shelf: each dawn whatever of theirs has been bought and spent is set out again, up to what they began with.

#### take item

*Kyr · action (group, item, itemkind, member, place)* · `rule:belongings.take_item`

- Shown as: Collect {find} for {recipient}
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); at(actor, site); at(find, site); not (forSale(find)); not (benighted(actor)); itemKind(find, form); memberOf(recipient, actor); awake(recipient); noticed(find, actor)

> Then: Retract at(find, site).

#### take out

*Kyr · action (group, item, itemkind, thing, member, place)* · `rule:belongings.take_out`

- Shown as: Take {find} out of {box} for {recipient}
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); at(actor, site); at(box, site); inside(find, box); not (shut(box)); noticed(box, actor); noticed(find, actor); not (benighted(actor)); itemKind(find, form); memberOf(recipient, actor); awake(recipient)

> Then: Retract inside(find, box).

#### put in

*Kyr · action (group, item, member, thing, place)* · `rule:belongings.put_in`

- Shown as: Put {cargo} in {box}
- Takes: 10 minutes
- Costs: 1

Set it in, on or into the thing, where it stays until someone takes it out.

> Needs: able(actor); at(actor, site); at(box, site); receptacle(box); not (shut(box)); noticed(box, actor); not (benighted(actor)); memberOf(carrier, actor); awake(carrier); ownedItem(cargo, carrier)

> Then: Assert inside(cargo, box).

#### buy item

*Kyr · action (group, item, itemkind, member, group, place)* · `rule:belongings.buy_item`

- Shown as: Buy {find} for {recipient}
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); at(actor, site); at(find, site); forSale(find); itemKind(find, form); memberOf(recipient, actor); awake(recipient); soldBy(find, merchant); able(merchant); not (refusesService(merchant, actor)); at(merchant, site); distinct(actor, merchant); quantity(actor, gold) >= price(find)

> Then: Retract at(find, site). Retract forSale(find). Decrease shelf(merchant, form) by 1.

#### equip item

*Kyr · action (group, item, itemkind, member)* · `rule:belongings.equip_item`

- Shown as: Equip {tool} on {wearer}
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); memberOf(wearer, actor); awake(wearer); ownedItem(tool, wearer); itemKind(tool, form); wearable(form); proficient(wearer, form); not (wearing(tool, wearer))

> Then: nothing changes

#### use item

*Kyr · action (group, item, itemkind, member, member)* · `rule:belongings.use_item`

- Shown as: Use {dose} on {recipient}
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); memberOf(carrier, actor); memberOf(recipient, actor); awake(carrier); awake(recipient); ownedItem(dose, carrier); itemKind(dose, form); consumable(form); not (lightsUp(form)); not (fuel(form)); relieves(recipient, form)

> Then: nothing changes

#### light item

*Kyr · action (group, item, itemkind, member)* · `rule:belongings.light_item`

- Shown as: Light {dose}
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); memberOf(carrier, actor); awake(carrier); ownedItem(dose, carrier); itemKind(dose, form); lightsUp(form); relieves(carrier, form)

> Then: nothing changes

#### light lamp

*Kyr · action (group, item, itemkind, item, itemkind, member)* · `rule:belongings.light_lamp`

- Shown as: Fill {vessel} from {dose} and light it
- Takes: 10 minutes
- Costs: 1

A lantern is filled and lit: the flask of oil is spent, and burns in it as long as the flask says.

> Needs: able(actor); memberOf(carrier, actor); awake(carrier); ownedItem(vessel, carrier); itemKind(vessel, shape); burns(shape, form); ownedItem(dose, carrier); itemKind(dose, form); relieves(carrier, form)

> Then: nothing changes

#### transfer item

*Kyr · action (group, item, member, member)* · `rule:belongings.transfer_item`

- Shown as: Give {cargo} to {recipient}
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); memberOf(carrier, actor); memberOf(recipient, actor); awake(carrier); not (ownedItem(cargo, recipient)); awake(recipient); ownedItem(cargo, carrier)

> Then: nothing changes

#### take from

*Kyr · action (group, item, member, member)* · `rule:belongings.take_from`

- Shown as: Take {cargo} from {carrier} for {recipient}
- Takes: 10 minutes
- Costs: 1

What a companion who has fallen, or cannot stir, was carrying, the others can take.

> Needs: able(actor); memberOf(carrier, actor); memberOf(recipient, actor); not (awake(carrier)); awake(recipient); ownedItem(cargo, carrier)

> Then: nothing changes

#### give

*Kyr · action (group, item, itemkind, member, group, place)* · `rule:belongings.give`

- Shown as: Give {gift} to {recipient}
- Takes: 10 minutes
- Costs: 1

Hand it to someone who has asked for it, or will take it. What they do with it is theirs to decide.

> Needs: able(actor); at(actor, site); able(recipient); at(recipient, site); distinct(actor, recipient); memberOf(carrier, actor); awake(carrier); ownedItem(gift, carrier); itemKind(gift, form); wants(recipient, form)

> Then: Assert keeps(recipient, gift).

#### give back

*Kyr · action (group, item, member, group, place)* · `rule:belongings.give_back`

- Shown as: Give {gift} back to {owner}
- Takes: 10 minutes
- Costs: 1

What was taken in front of its owner can be handed back: they will not forget it, but they need not fight for it.

Hand back what is theirs. They will remember it was taken; they need not fight you for it.

> Needs: able(actor); at(actor, site); able(owner); at(owner, site); memberOf(carrier, actor); awake(carrier); ownedItem(gift, carrier); owns(owner, gift); objected(owner, gift)

> Then: Assert keeps(owner, gift). Retract hostile(owner, actor).

#### sell

*Kyr · action (group, item, itemkind, member, group, place)* · `rule:belongings.sell`

- Shown as: Sell {ware} to {buyer}
- Takes: 10 minutes
- Costs: 1

Someone who buys this kind of thing pays what they said they would, if they have the coin.

> Needs: able(actor); at(actor, site); able(buyer); at(buyer, site); distinct(actor, buyer); memberOf(carrier, actor); awake(carrier); ownedItem(ware, carrier); itemKind(ware, form); pays(buyer, form) >= 1; quantity(buyer, gold) >= pays(buyer, form); not (refusesService(buyer, actor))

> Then: Assert keeps(buyer, ware). Assert realized(ware). Decrease quantity(buyer, gold) by pays(buyer, form). Increase quantity(actor, gold) by pays(buyer, form).

#### sell valuable

*Kyr · action (group, item, itemkind, member, group, place)* · `rule:belongings.sell_valuable`

- Shown as: Sell {ware} to {buyer}
- Takes: 10 minutes
- Costs: 1

Someone who deals in valuables pays what a thing is worth, if they have the coin. The first time a treasure is sold, what it is worth is experience for each of the company.

> Needs: able(actor); at(actor, site); able(buyer); at(buyer, site); distinct(actor, buyer); memberOf(carrier, actor); awake(carrier); ownedItem(ware, carrier); itemKind(ware, form); buysValuables(buyer); valuable(form); worth(form) >= 1; pays(buyer, form) < 1; quantity(buyer, gold) >= worth(form); not (refusesService(buyer, actor))

> Then: Assert keeps(buyer, ware). Assert realized(ware). Decrease quantity(buyer, gold) by worth(form). Increase quantity(actor, gold) by worth(form).

#### appraise

*Kyr · action (group, item, itemkind, member, group, place)* · `rule:belongings.appraise`

- Shown as: Show {ware} to {buyer}
- Takes: 10 minutes
- Costs: 1

A dealer without the coin for a treasure still says what it is worth, and whether to wait or go elsewhere.

Someone who deals in valuables says what a thing is worth, when they have not the coin for it.

> Needs: able(actor); at(actor, site); able(buyer); at(buyer, site); distinct(actor, buyer); memberOf(carrier, actor); awake(carrier); ownedItem(ware, carrier); itemKind(ware, form); buysValuables(buyer); valuable(form); worth(form) >= 1; pays(buyer, form) < 1; quantity(buyer, gold) < worth(form); purse(buyer) >= worth(form); not (appraised(ware, buyer)); not (refusesService(buyer, actor))

> Then: Assert appraised(ware, buyer).

#### appraise beyond

*Kyr · action (group, item, itemkind, member, group, place)* · `rule:belongings.appraise_beyond`

- Shown as: Show {ware} to {buyer}
- Takes: 10 minutes
- Costs: 1

Someone who deals in valuables says what a thing is worth, when it is worth more than they ever have.

> Needs: able(actor); at(actor, site); able(buyer); at(buyer, site); distinct(actor, buyer); memberOf(carrier, actor); awake(carrier); ownedItem(ware, carrier); itemKind(ware, form); buysValuables(buyer); valuable(form); worth(form) >= 1; pays(buyer, form) < 1; purse(buyer) < worth(form); not (appraised(ware, buyer)); not (refusesService(buyer, actor))

> Then: Assert appraised(ware, buyer).

#### put item

*Kyr · action (group, item, member, place)* · `rule:belongings.put_item`

- Shown as: Set down {cargo}
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); at(actor, site); memberOf(carrier, actor); awake(carrier); ownedItem(cargo, carrier)

> Then: Assert at(cargo, site).

#### train member

*Kyr · action (group, group, member, ability, place)* · `rule:belongings.train_member`

- Shown as: Train {student} in {lesson}
- Takes: 60 minutes
- Costs: 1

> Needs: able(actor); able(mentor); distinct(actor, mentor); at(actor, site); at(mentor, site); memberOf(student, actor); awake(student); teaches(mentor, lesson); canTrain(student, lesson)

> Then: nothing changes

### Rest, mending and lessons

Also kept, without comment: swappable, improvable, learnable, skillOpen, featOpen, memberOf, fieldUsable, restful, offeredAt, giftEffect, rewardFor, claimed.

| Kinds | Relations | Measures | Queries | Rules | Actions |
|---|---|---|---|---|---|
| 6 | 19 | 1 | 0 | 2 | 10 |

#### awake, fallen, slain, needsCare, canCast, treatable

*Kyr · relation(member); relation(member); relation(member); relation(member); relation(member, ability); relation(member, ability)* · `rule:care.awake`

One who falls lies senseless (fallen) until a rest, when they come round or die where they fell (slain).

#### field spell

*Kyr · action (group, member, ability, member, place)* · `rule:care.field_spell`

- Shown as: Have {caster} use {technique} on {recipient}
- Takes: 10 minutes
- Costs: 1

A healing, a cleansing or a ward, used between fights, for its usual cost in mana.

> Needs: able(actor); at(actor, site); memberOf(caster, actor); memberOf(recipient, actor); fieldUsable(technique); awake(caster); awake(recipient); canCast(caster, technique); treatable(recipient, technique)

> Then: nothing changes

#### prepare spell

*Kyr · action (group, member, circle, ability, ability)* · `rule:care.prepare_spell`

- Shown as: Have {caster} prepare {incoming} in place of {outgoing}, in a {tier}
- Takes: 60 minutes
- Costs: 1

An hour of study or prayer. A spell prepared in a slot still ready can be cast at once; in a slot already spent, after the next rest.

> Needs: able(actor); memberOf(caster, actor); awake(caster); swappable(caster, tier, outgoing, incoming)

> Then: nothing changes

#### raise quality

*Kyr · action (group, member, quality)* · `rule:care.raise_quality`

- Shown as: Have {member} raise {quality}
- Takes: 10 minutes
- Costs: 1

Each level gained gives a companion one development: a point of a quality, or a skill their calling teaches. Strength lands blows and Dexterity turns them; Constitution adds hit points at the next level; Intelligence, Wisdom or Charisma feeds a caster's spells and what they can be talked or taught into.

> Needs: able(actor); memberOf(member, actor); awake(member); improvable(member)

> Then: nothing changes

#### learn skill

*Kyr · action (group, member, capability)* · `rule:care.learn_skill`

- Shown as: Have {member} take up {skill}
- Takes: 10 minutes
- Costs: 1

Each level gained gives a companion one development: a point of a quality, or a skill their calling teaches. A skill opens what it is for (a lock picked, a wound bound, a lie told) and counts as trained in every check that rests on it.

> Needs: able(actor); memberOf(member, actor); awake(member); skillOpen(member, skill)

> Then: nothing changes

#### learn spell

*Kyr · action (group, member, ability)* · `rule:care.learn_spell`

- Shown as: Have {member} learn {spell}
- Takes: 10 minutes
- Costs: 1

Each level gained lets a caster add a spell of their tradition, of a level they can cast, to what they know. It can be prepared from then on.

> Needs: able(actor); memberOf(member, actor); awake(member); learnable(member, spell)

> Then: nothing changes

#### take feat

*Kyr · action (group, member, feat)* · `rule:care.take_feat`

- Shown as: Have {member} take up {choice}
- Takes: 10 minutes
- Costs: 1

At the fifth, tenth and fifteenth levels a companion takes up one of their calling's feats. Some rule others out: a knight is no barbarian.

> Needs: able(actor); memberOf(member, actor); awake(member); featOpen(member, choice)

> Then: nothing changes

#### bury companion

*Kyr · action (group, member, place)* · `rule:care.bury_companion`

- Shown as: Lay {lost} to rest
- Takes: 60 minutes
- Costs: 1

The dead the company cannot have raised it lays to rest, and goes on without them.

A grave dug and words said over it: an hour. They leave the company, and what they carried goes with them.

> Needs: able(actor); at(actor, site); memberOf(lost, actor); slain(lost); not (indoors(site))

> Then: nothing changes

#### rest

*Kyr · action (group, place)* · `rule:care.rest`

- Shown as: Rest and recover at {site}
- Takes: 360 minutes
- Costs: 1

Six hours and a ration, somewhere safe. The living get their strength and mana back, and bleeding is stopped; poison is not mended. Whoever has fallen comes round, or dies where they fell (a d20 and their Constitution against 10). The world does not wait while you sleep.

> Needs: able(actor); at(actor, site); restful(site); quantity(actor, rations) >= 1

> Then: Assert rested(actor). Set restedAt(actor) to watch(clock). Set lastSlept(actor) to watch(clock). Retract weary(actor).

#### rested, restedAt

*Kyr · relation(group); measure(group)* · `rule:care.rested`

Its ration is the company's meal: one the day's meal has already eaten in the six hours (the next is a day off) is not eaten twice; else it is eaten now, and is the day's meal. A meal eaten while it slept put the next a day after one due in its six hours: at least a day less six hours on.

#### rest_meal

*Kyr · rule* · `rule:care.rest_meal`

> When: rested(?g); nextMeal(?g) < (restedAt(?g) + 108); quantity(?g, rations) >= 1

> Then: Decrease quantity(?g, rations) by 1. Set nextMeal(?g) to (watch(clock) + 144). Retract hungry(?g). Retract rested(?g).

#### rest_fed

*Kyr · rule* · `rule:care.rest_fed`

> When: rested(?g); nextMeal(?g) >= (restedAt(?g) + 108)) or (quantity(?g, rations) < 1

> Then: Retract rested(?g).

#### rest unfed

*Kyr · action (group, place)* · `rule:care.rest_unfed`

- Shown as: Rest and recover at {site}
- Takes: 10 minutes
- Costs: 1

A company with nothing to eat is still offered its rest, and told why it cannot have it.

Six hours and a ration, somewhere safe; and there is no ration left.

> Needs: able(actor); at(actor, site); restful(site); quantity(actor, rations) < 1

> Then: nothing changes

#### learn reward

*Kyr · action (group, reward, member, ability, fact, place)* · `rule:care.learn_reward`

- Shown as: Accept {gift} for {recipient}
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); at(actor, site); offeredAt(gift, site); memberOf(recipient, actor); awake(recipient); giftEffect(gift, lesson); rewardFor(gift, proof); knows(actor, proof); not (claimed(gift))

> Then: Assert claimed(gift). Retract offeredAt(gift, site). Retract at(gift, site).

### Bodies, places, time and the shared catalog

Also kept, without comment: at, able, dead, distinct, closed, indoors, settled, peaceable, routed, dark, witnessedAttack, refusesService, capable, brings, serves, unlit, company, pronouns, quantity, watch, encounterXp, untilLight, untilMorning, untilDark, untilTurn.

| Kinds | Relations | Measures | Queries | Rules | Actions |
|---|---|---|---|---|---|
| 14 | 33 | 11 | 5 | 1 | 8 |

#### ending, reached

*Kyr · kind; relation(ending)* · `rule:world_core.ending`

An ending an author writes (Ending … when … "epilogue"): reached once, and the book closes on it.

#### difficulty

*Kyr · kind* · `rule:world_core.difficulty`

What a keeper of the deep fears that only its makers' own bane brings: the Stone-Singers' bell, the Wardens' oath. How hard a check is (Resolve check(actor, persuasion, dc_fair)): ten, thirteen, sixteen or nineteen to beat.

#### terrainkind, terrain

*Kyr · kind; relation(place, terrainkind)* · `rule:world_core.terrainkind`

The lie of the land a region is: what a party's perks of place (an elven tribe in a forest) answer to.

#### landkind, landform

*Kyr · kind; relation(place, landkind)* · `rule:world_core.landkind`

The land a stretch of country is (a river's vale, a wood, a mere, a pass): what a chart draws it as. The names are prefixed, as every module shares them and an author's own place may well be called "pass".

#### sizekind, townSize

*Kyr · kind; relation(place, sizekind)* · `rule:world_core.sizekind`

How big a settlement is: what can be seen of it from the road, and what it can spare.

#### been

*Kyr · relation(group, place)* · `rule:world_core.been`

Where a company has been: once it has stood somewhere, it knows the place and can find it again.

#### been_there

*Kyr · rule* · `rule:world_core.been_there`

> When: company(?c); at(?c, ?p); not (been(?c, ?p))

> Then: Assert been(?c, ?p).

#### law, law

*Kyr · kind; relation(place, law)* · `rule:world_core.law`

A place's law: everyone in it, or anywhere within it, fights under that condition (a plane where fire burns small, a temple where no blade is drawn). The law names a catalog condition.

#### lightless

*Kyr · relation(place)* · `rule:world_core.lightless`

A place where light dies: only sunlight shows anything there.

#### tolerates

*Kyr · relation(group, group)* · `rule:world_core.tolerates`

One who lets another be: does not bar its way or fall on it (a toll paid, a bribe taken, recruits believed).

#### assails

*Kyr · relation(group, group)* · `rule:world_core.assails`

Someone falling on another: on the company, it starts a fight there and then.

#### halts

*Kyr · relation(group, group)* · `rule:world_core.halts`

Someone stopping another where they stand (a challenge, a hold-up): on the company, whatever it was doing is broken off, and it must deal with them.

#### enRoute

*Kyr · relation(group, passage)* · `rule:world_core.enRoute`

A company on the way, between where it set out and where it is going: enRoute(company, by this passage).

#### craft, craft

*Kyr · kind; relation(group, craft)* · `rule:world_core.craft`

The kind of work the company has done (its backgrounds' families): what those who do the same work know it by.

#### manner, manner

*Kyr · kind; relation(group, manner)* · `rule:world_core.manner`

How someone carries themselves, which shows in what they say (Orsino's personalities); and the words they are spoken of in. Someone with no manner given has one all the same (see VoiceContext).

#### asleep

*Kyr · relation(group)* · `rule:world_core.asleep`

Who is awake to the world. A group that the day's round or a spell has put to sleep sees nothing that happens.

#### unseen

*Kyr · relation(group, group)* · `rule:world_core.unseen`

Whether one would see what another does where both are: awake, there, and not hidden from them.

#### threatened

*Kyr · query(a: group)* · `rule:world_core.threatened`

Someone who means the company no good where it is: a long wait or a rest is broken off when one arrives.

#### wait

*Kyr · action (group)* · `rule:world_core.wait`

- Shown as: Wait a while
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor)

> Then: nothing changes

#### lie still

*Kyr · action (group)* · `rule:world_core.lie_still`

- Shown as: Lie as you are
- Takes: 10 minutes
- Costs: 1

A company that cannot move (all of it asleep, or held fast) can only lie as it is until it can.

You cannot move. Time passes over you until you can.

> Needs: company(actor); not (able(actor)); not (dead(actor))

> Then: nothing changes

#### wait hour

*Kyr · action (group)* · `rule:world_core.wait_hour`

- Shown as: Wait an hour
- Takes: 60 minutes
- Costs: 1

> Needs: able(actor)

> Then: nothing changes

#### hour, day

*Kyr · measure(clock); measure(clock)* · `rule:world_core.hour`

The hour of the day (0 to 23) and the day since the company came (1, 2…): what people's days are kept by.

#### dice

*Kyr · measure(entity)* · `rule:world_core.dice`

A die thrown each watch, 1 to 100, for what is left to chance: dice(clock) for the world, and dice(x) for each thing's own, so that what is left to chance in two places, or for two people, does not fall out alike.

#### season

*Kyr · measure(clock)* · `rule:world_core.season`

The season by the campaign's calendar, when it keeps one: 1 spring, 2 summer, 3 autumn, 4 winter (0: none).

#### wait for light

*Kyr · action (group)* · `rule:world_core.wait_for_light`

- Shown as: Wait until first light
- Takes: the untilLight of the way
- Costs: 1

> Needs: able(actor); dark()

> Then: nothing changes

#### wait for dark

*Kyr · action (group)* · `rule:world_core.wait_for_dark`

- Shown as: Wait until dark
- Takes: the untilDark of the way
- Costs: 1

> Needs: able(actor); not (dark())

> Then: nothing changes

#### wait watch

*Kyr · action (group)* · `rule:world_core.wait_watch`

- Shown as: Wait and watch
- Takes: the untilTurn of the way
- Costs: 1

Until someone comes or goes, or something changes here; or until the day turns.

> Needs: able(actor)

> Then: nothing changes

#### assail

*Kyr · action (group, group, place)* · `rule:world_core.assail`

- Shown as: Fall on {prey}
- Takes: 10 minutes
- Costs: 1

Someone who means harm closes and attacks.

> Needs: able(actor); at(actor, site); at(prey, site); able(prey); distinct(actor, prey); not (peaceable(actor)); not (allied(actor, prey)); not (tolerates(actor, prey)); not (company(actor))

> Then: Assert assails(actor, prey).

#### attack

*Kyr · action (group, group, place)* · `rule:world_core.attack`

- Shown as: Attack {opponent}
- Takes: 10 minutes
- Costs: 1

Once it starts it goes on until one side is down or runs, and whoever falls may not get up.

> Needs: able(actor); able(opponent); distinct(actor, opponent); at(actor, site); reaches(actor, opponent); not (peaceable(opponent))

> Then: nothing changes

### Shrines, offerings and the favour of the gods

Also kept, without comment: shrineOf, honored, offering.

| Kinds | Relations | Measures | Queries | Rules | Actions |
|---|---|---|---|---|---|
| 2 | 2 | 1 | 0 | 1 | 1 |

#### shrine, faith

*Kyr · kind; kind* · `rule:world_devotion.shrine`

A shrine is a thing kept for a god (an altar, a statue, a spring led into a basin), and a god is of a faith: a domain of Orsino's pantheon, whose blessing the god gives to those who keep the shrine's observance. The faith names are prefixed, as every module shares them and an author may well call a place "light".

#### make offering

*Kyr · action (group, shrine, faith, member, place)* · `rule:world_devotion.make_offering`

- Shown as: Leave an offering, and ask the god's favour for {recipient}
- Takes: 30 minutes
- Costs: 1

Coin left at a shrine and its observance kept, as Orsino's shrines ask. A good god's favour heals a little and another's hurts a little; either goes with the one it was asked for into their next ten turns of fighting, with the blessing of the god's faith. Once a day at each shrine.

> Needs: able(actor); at(actor, site); at(altar, site); shrineOf(altar, devotion); memberOf(recipient, actor); awake(recipient); quantity(actor, gold) >= offering(altar); not (honored(actor, altar))

> Then: Decrease quantity(actor, gold) by offering(altar). Assert honored(actor, altar).

#### devotion_renewed

*Kyr · rule* · `rule:world_devotion.devotion_renewed`

An observance can be kept again the next day.

> When: untilLight(clock) == 1; honored(?g, ?a)

> Then: Retract honored(?g, ?a).

### Reliable discovery and trusted reports

Also kept, without comment: established, reveals, intact, noticeable, destructible, mayExamine, knows, assumesFalse, trusts, learnedFrom, toldBy, publicPlace, testimony, witnessed, searched.

| Kinds | Relations | Measures | Queries | Rules | Actions |
|---|---|---|---|---|---|
| 2 | 19 | 0 | 0 | 0 | 5 |

#### readIn

*Kyr · relation(group, fact)* · `rule:discovery_rules.readIn`

Known by reading it (a tally, a tablet): the writing's own account, as good as whoever wrote it.

#### staged

*Kyr · relation(place, fact)* · `rule:discovery_rules.staged`

A place where a story is being told (a cart gone off the road, a man under it), and the story: nothing else that could be taken for part of it happens there by chance (a carrier's wheel in the ditch).

#### leadsTo

*Kyr · relation(fact, place)* · `rule:discovery_rules.leadsTo`

What a fact tells of where something is (a site named, a country rumoured beyond a march): known, the place is on the company's map, as told, before it has been there or knows the way.

#### stale

*Kyr · relation(fact)* · `rule:discovery_rules.stale`

What was so and is no longer (a child's fever, once it has broken or the child has died): still known to whoever knew it, but no longer passed on as news.

#### examine

*Kyr · action (group, source, fact, place)* · `rule:discovery_rules.examine`

- Shown as: Read {witness}
- Takes: 10 minutes
- Costs: 1

What a source tells is read in it (a notice, a ledger, notches cut in stone), and is said so.

> Needs: able(actor); at(actor, site); at(witness, site); not (benighted(actor)); noticeable(witness); intact(witness); mayExamine(actor, witness); reveals(witness, statement); established(statement); not (learnedFrom(actor, witness, statement))

> Then: Assert knows(actor, statement). Retract assumesFalse(actor, statement). Assert learnedFrom(actor, witness, statement).

#### tell

*Kyr · action (group, group, fact, place)* · `rule:discovery_rules.tell`

- Shown as: Tell {recipient}: {statement}
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); able(recipient); distinct(actor, recipient); at(actor, site); at(recipient, site); trusts(recipient, actor); knows(actor, statement); established(statement); not (stale(statement)); not (toldBy(recipient, actor, statement))

> Then: Assert knows(recipient, statement). Retract assumesFalse(recipient, statement). Assert toldBy(recipient, actor, statement).

#### ask

*Kyr · action (group, group, source, fact, place)* · `rule:discovery_rules.ask`

- Shown as: Ask {informant} about {topic}
- Takes: 10 minutes
- Costs: 1

They tell you what they know of it.

> Needs: able(actor); able(informant); distinct(actor, informant); at(actor, site); at(informant, site); testimony(informant, topic); reveals(topic, statement); noticeable(topic); knows(informant, statement); established(statement); not (stale(statement)); not (knows(actor, statement))

> Then: Assert knows(actor, statement). Retract assumesFalse(actor, statement). Assert toldBy(actor, informant, statement).

#### search

*Kyr · action (group, place)* · `rule:discovery_rules.search`

- Shown as: Search {site}
- Takes: 20 minutes
- Costs: 1

Go over the place: walls, floor, furniture, the backs of things. Twenty minutes, once; a search the light gives out on is not made.

> Needs: able(actor); at(actor, site); not (benighted(actor)); not (searched(actor, site))

> Then: Assert searched(actor, site).

#### destroy source

*Kyr · action (group, source, place)* · `rule:discovery_rules.destroy_source`

- Shown as: Destroy {witness}
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); at(actor, site); at(witness, site); noticeable(witness); intact(witness); destructible(witness)

> Then: Retract intact(witness).

### Who holds what, how a power stands toward a company, and how its agents go about the land

Also kept, without comment: holds, keeps, covets, bywayFrom, bywayTo, knowsWay, travelling, bywayTime.

| Kinds | Relations | Measures | Queries | Rules | Actions |
|---|---|---|---|---|---|
| 1 | 16 | 3 | 1 | 4 | 2 |

#### takesPrisoners, captured

*Kyr · relation(group); relation(group, group)* · `rule:dominion.takesPrisoners`

Those who take prisoners rather than kill (the lord's riders, a reeve's men), and whom they have taken: what happens to a company beaten by them is theirs to say (see Mercy).

#### alarmed, admits, hostile

*Kyr · relation(group); relation(group, group); relation(group, group)* · `rule:dominion.alarmed`

How a power stands toward a company, kept by the power and obeyed by everyone who serves it: alarmed when something has gone wrong in what it holds; admitting a company to come and go; or hostile to it on sight.

#### admitted

*Kyr · rule* · `rule:dominion.admitted`

> When: admits(?power, ?company); serves(?member, ?power); not (tolerates(?member, ?company)); not (hostile(?power, ?company))

> Then: Assert tolerates(?member, ?company).

#### turned

*Kyr · rule* · `rule:dominion.turned`

> When: hostile(?power, ?company); serves(?member, ?power); tolerates(?member, ?company)

> Then: Retract tolerates(?member, ?company).

#### unadmitted

*Kyr · rule* · `rule:dominion.unadmitted`

> When: hostile(?power, ?company); admits(?power, ?company)

> Then: Retract admits(?power, ?company).

#### tolls

*Kyr · relation(group, place)* · `rule:dominion.tolls`

Who takes a toll where: a collector standing on a road. A road nobody tolls is open; trade on it moves.

#### credit, owes

*Kyr · relation(group, group); measure(group, group)* · `rule:dominion.credit`

Where a power buys on credit, and what it owes there.

#### losses

*Kyr · measure(place)* · `rule:dominion.losses`

What raiders, tithe-takers and foragers have taken from a place.

#### vacant, posts

*Kyr · relation(place); relation(group, group)* · `rule:dominion.vacant`

A stronghold its holder has left. A power that covets it sends the band it posts, by night, and holds it.

#### seized

*Kyr · rule* · `rule:dominion.seized`

> When: vacant(?site); covets(?power, ?site); posts(?band, ?power); able(?power); able(?band); untilLight(clock) == 1

> Then: Retract vacant(?site). Assert holds(?power, ?site). Assert at(?band, ?site).

#### depart

*Kyr · action (group, byway, place, place)* · `rule:dominion.depart`

- Shown as: Set out by {way} toward {destination}
- Takes: 10 minutes
- Costs: 1

Someone who knows the land's old ways leaves for a distant place, and is out of sight until they arrive.

> Needs: able(actor); knowsWay(actor, way); at(actor, origin); bywayFrom(way, origin); bywayTo(way, destination)

> Then: Retract at(actor, origin). Assert travelling(actor, way).

#### arrive

*Kyr · action (group, byway, place)* · `rule:dominion.arrive`

- Shown as: Come by {way} to {destination}
- Takes: the bywayTime of the way
- Costs: 1

> Needs: travelling(actor, way); bywayTo(way, destination)

> Then: Retract travelling(actor, way). Assert at(actor, destination).

### Fire, frost and other elements let loose in a place

Also kept, without comment: exposedTo.

| Kinds | Relations | Measures | Queries | Rules | Actions |
|---|---|---|---|---|---|
| 1 | 1 | 0 | 0 | 0 | 0 |

### What grows where, and what can be gathered from it

| Kinds | Relations | Measures | Queries | Rules | Actions |
|---|---|---|---|---|---|
| 0 | 2 | 0 | 0 | 0 | 1 |

#### grows, crop

*Kyr · relation(scenery); relation(item, scenery)* · `rule:world_growing.grows`

A stand of something that grows (willows over the water, yarrow at the wayside), and what can be gathered from it there a little at a time: each crop an item of the kind it yields, until the stand is stripped.

#### gather

*Kyr · action (group, item, itemkind, scenery, member, place)* · `rule:world_growing.gather`

- Shown as: Gather {find} for {recipient}
- Takes: 10 minutes
- Costs: 1

Cut it, strip it or pick it, and carry it away: what grows wild is anyone's who takes the trouble.

> Needs: able(actor); company(actor); at(actor, site); at(stand, site); grows(stand); crop(find, stand); itemKind(find, form); memberOf(recipient, actor); awake(recipient); not (benighted(actor))

> Then: Retract crop(find, stand). Retract inside(find, stand).

### How creatures that live somewhere answer those who come into it

Also kept, without comment: plea, greeting, greeted, petted, warned, yielded, warnsFirst.

| Kinds | Relations | Measures | Queries | Rules | Actions |
|---|---|---|---|---|---|
| 1 | 18 | 2 | 1 | 16 | 5 |

#### temperament

*Kyr · kind* · `rule:inhabitants.temperament`

A creature's temperament says how it meets a company that comes where it lives. A territorial one warns, then falls on whoever stays; a defensive one warns, and fights only for its lair; a proud one names a price; a savage one falls on you at once; one that lies in ambush strikes unless keen eyes spot it first; an obedient one keeps its post and nothing else; a wary one slinks away, and fights only when cornered in its refuge. A group of one species takes its species' temperament; a place may give any group one (temper_savage, temper_proud…).

#### temperament

*Kyr · relation(group, temperament)* · `rule:inhabitants.temperament`

A tame creature (a dog, a horse, a cat about a house) knows people: it comes to see who you are, and lets you make much of it.

#### lair, refuge

*Kyr · relation(group, place); relation(group, place)* · `rule:inhabitants.lair`

Where it lives and what it defends; where it goes when beaten or frightened off.

#### warning, onslaught, flinch

*Kyr · relation(group, entity); relation(group, entity); relation(group, entity)* · `rule:inhabitants.warning`

What it does, in the place's own words: its warning, its onslaught, what makes it flinch, how it yields.

#### fears, tribute

*Kyr · relation(group, capability); measure(group)* · `rule:inhabitants.fears`

What drives it off (sunlight, flame), and the price a proud one names.

#### patience

*Kyr · measure(group)* · `rule:inhabitants.patience`

Plain words for a creature whose place gives it none, by temperament: temper_words_<temperament>_<what>. The same words for a band of more than one, where they differ. And for one who is someone, not something (a robbers' captain): not "it", and no he or she. The watch it waits until, once it has warned, before it comes at whoever stays: the rest of this one, however many small things are done in it.

#### temper_shies

*Kyr · rule* · `rule:inhabitants.temper_shies`

Fear comes first: whatever it fears, brought into its presence, drives it back to its refuge.

Says: "{?f}"

> When: fears(?g, ?k); company(?c); together(?g, ?c); capable(?c, ?k); able(?g); refuge(?g, ?r); not (at(?g, ?r)); flinch(?g, ?f)

> Then: Assert at(?g, ?r). Retract assails(?g, ?c). Retract warned(?g, ?c).

#### temper_yields

*Kyr · rule* · `rule:inhabitants.temper_yields`

Beaten, it may beg; then it goes back to its refuge, and comes out again the next day.

Says: "{?p}"

> When: routed(?g); company(?c); together(?g, ?c); able(?g); plea(?g, ?p); not (yielded(?g, ?c))

> Then: Assert yielded(?g, ?c). Assert tolerates(?g, ?c). Retract assails(?g, ?c).

#### temper_falls_back

*Kyr · rule* · `rule:inhabitants.temper_falls_back`

> When: routed(?g); refuge(?g, ?r); not (at(?g, ?r))

> Then: Assert at(?g, ?r).

#### temper_rallies

*Kyr · rule* · `rule:inhabitants.temper_rallies`

> When: routed(?g); refuge(?g, ?r); at(?g, ?r); untilLight(clock) == 1

> Then: Retract routed(?g).

#### temper_closes

*Kyr · rule* · `rule:inhabitants.temper_closes`

A warning spent: whoever stayed is fallen on (for a defensive one, only in its lair).

Says: "{?o}"

> When: warned(?g, ?c); together(?g, ?c); able(?g); not (routed(?g)); not (tolerates(?g, ?c)); patience(?g) <= watch(clock); not (temperament(?g, temper_defensive)); onslaught(?g, ?o)

> Then: Assert assails(?g, ?c). Retract warned(?g, ?c).

#### temper_defends

*Kyr · rule* · `rule:inhabitants.temper_defends`

Says: "{?o}"

> When: warned(?g, ?c); temperament(?g, temper_defensive); lair(?g, ?l); at(?c, ?l); at(?g, ?l); able(?g); not (routed(?g)); not (tolerates(?g, ?c)); patience(?g) <= watch(clock); onslaught(?g, ?o)

> Then: Assert assails(?g, ?c). Retract warned(?g, ?c).

#### temper_let_go

*Kyr · rule* · `rule:inhabitants.temper_let_go`

> When: warned(?g, ?c); not (together(?g, ?c))

> Then: Retract warned(?g, ?c).

#### temper_warns

*Kyr · rule* · `rule:inhabitants.temper_warns`

The first meeting: a warning stops the company where it stands, whatever it was doing, and it must answer.

Says: "{?w}"

> When: temperament(?g, ?t); warnsFirst(?t); company(?c); confronts(?g, ?c); not (warned(?g, ?c)); warning(?g, ?w)

> Then: Assert warned(?g, ?c). Assert halts(?g, ?c). Set patience(?g) to (watch(clock) + 1).

#### temper_falls_on

*Kyr · rule* · `rule:inhabitants.temper_falls_on`

Says: "{?o}"

> When: temperament(?g, temper_savage); company(?c); confronts(?g, ?c); onslaught(?g, ?o)

> Then: Assert assails(?g, ?c).

#### temper_springs

*Kyr · rule* · `rule:inhabitants.temper_springs`

Says: "{?o}"

> When: temperament(?g, temper_ambush); company(?c); confronts(?g, ?c); not (capable(?c, perception)); not (warned(?g, ?c)); onslaught(?g, ?o)

> Then: Assert assails(?g, ?c).

#### temper_spotted

*Kyr · rule* · `rule:inhabitants.temper_spotted`

Says: "{?w}"

> When: temperament(?g, temper_ambush); company(?c); confronts(?g, ?c); capable(?c, perception); not (warned(?g, ?c)); warning(?g, ?w)

> Then: Assert warned(?g, ?c). Assert halts(?g, ?c). Set patience(?g) to (watch(clock) + 1).

#### temper_keeps_post

*Kyr · rule* · `rule:inhabitants.temper_keeps_post`

Says: "{?o}"

> When: temperament(?g, temper_obedient); company(?c); confronts(?g, ?c); lair(?g, ?p); at(?g, ?p); onslaught(?g, ?o)

> Then: Assert assails(?g, ?c).

#### temper_cornered

*Kyr · rule* · `rule:inhabitants.temper_cornered`

Says: "{?o}"

> When: temperament(?g, temper_wary); company(?c); confronts(?g, ?c); refuge(?g, ?r); at(?g, ?r); onslaught(?g, ?o)

> Then: Assert assails(?g, ?c).

#### temper_slinks

*Kyr · rule* · `rule:inhabitants.temper_slinks`

Says: "{?f}"

> When: temperament(?g, temper_wary); company(?c); confronts(?g, ?c); refuge(?g, ?r); not (at(?g, ?r)); flinch(?g, ?f)

> Then: Assert at(?g, ?r).

#### temper_greets

*Kyr · rule* · `rule:inhabitants.temper_greets`

A tame one greets whoever comes, once, if it is awake: in its own words (Greets), or as its kind does (data/voice/greet.json).

> When: temperament(?g, temper_tame); company(?c); together(?g, ?c); alert(?g); not (greeted(?g, ?c)); not (hostile(?g, ?c))

> Then: Assert greeted(?g, ?c). Assert tolerates(?g, ?c).

#### pet

*Kyr · action (group, group, place)* · `rule:inhabitants.pet`

- Shown as: Make much of {animal}
- Takes: 0 minutes
- Costs: 1

A tame creature lets itself be made much of, by anyone it has not taken against.

Crouch down, hold out a hand, scratch behind its ears.

> Needs: able(actor); company(actor); at(actor, site); at(animal, site); temperament(animal, temper_tame); able(animal); not (hostile(animal, actor))

> Then: Assert petted(animal, actor). Assert tolerates(animal, actor). Assert greeted(animal, actor).

#### hears, spokenTo

*Kyr · relation(temperament); relation(group, group)* · `rule:inhabitants.hears`

Words instead of blows, for a band that can be spoken to and will hear words (one that warns, or watches from the edge of the light): talked round, it lets the company be; faced down, it gives way. The one of the company best at it speaks, once; it is rolled only when it could go either way. Talked to badly, a band gives you the rest of the watch to be gone, and then comes at you; warned off badly, it comes at you at once.

#### talk round

*Kyr · action (group, group, place)* · `rule:inhabitants.talk_round`

- Shown as: Ask {hearers} to let you by
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); company(actor); at(actor, site); at(hearers, site); able(hearers); talks(hearers); temperament(hearers, ?t); hears(?t); not (tolerates(hearers, actor)); not (assails(hearers, actor)); not (routed(hearers)); not (spokenTo(hearers, actor))

> Then: Assert spokenTo(hearers, actor). Assert tolerates(hearers, actor). Retract warned(hearers, actor).

#### face down

*Kyr · action (group, group, place)* · `rule:inhabitants.face_down`

- Shown as: Warn {hearers} off
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); company(actor); at(actor, site); at(hearers, site); able(hearers); talks(hearers); temperament(hearers, ?t); hears(?t); not (tolerates(hearers, actor)); not (assails(hearers, actor)); not (routed(hearers)); not (spokenTo(hearers, actor))

> Then: Assert spokenTo(hearers, actor). Assert tolerates(hearers, actor). Retract warned(hearers, actor).

#### pay tribute

*Kyr · action (group, group, place)* · `rule:inhabitants.pay_tribute`

- Shown as: Give {lord} what it asks
- Takes: 10 minutes
- Costs: 1

A proud creature's price, paid: it lets the company be.

A proud creature names a price for letting you pass; paid, it keeps its word.

> Needs: able(actor); company(actor); at(actor, site); at(lord, site); warned(lord, actor); temperament(lord, temper_proud); quantity(actor, gold) >= tribute(lord)

> Then: Decrease quantity(actor, gold) by tribute(lord). Increase quantity(lord, gold) by tribute(lord). Assert tolerates(lord, actor). Retract warned(lord, actor).

#### drawable, awaits

*Kyr · relation(group); relation(group, group)* · `rule:inhabitants.drawable`

What can be heard from the next room can be drawn out of it, and met where the company waits for it, ready: the first blow is the company's (see Environment). The follow-up review met a banshee as a fight the moment its room was entered, with no say in how. A place says which of its dwellers will come (drawable). The company awaits what it drew out until it is met: once they part, or it can fight no more, the waiting is over.

#### awaiting_over

*Kyr · rule* · `rule:inhabitants.awaiting_over`

> When: awaits(?c, ?g); not (together(?c, ?g))) or (not (able(?g))

> Then: Retract awaits(?c, ?g).

#### draw out

*Kyr · action (group, group, place, passage, place)* · `rule:inhabitants.draw_out`

- Shown as: Draw out what is in {whence}, and wait for it here
- Takes: 10 minutes
- Costs: 1

Make a noise at the way in, and step back to meet whatever comes, weapons out.

> Needs: able(actor); company(actor); at(actor, site); drawable(lurker); able(lurker); not (routed(lurker)); at(lurker, whence); connects(way, whence, site); visibleTo(way, actor); passable(way, lurker)

> Then: Assert at(lurker, site). Assert awaits(actor, lurker).

### Food and sleep

Also kept, without comment: eats, hungry, nextMeal, lastSlept.

| Kinds | Relations | Measures | Queries | Rules | Actions |
|---|---|---|---|---|---|
| 0 | 4 | 2 | 0 | 3 | 0 |

#### sleeps, weary

*Kyr · relation(group); relation(group)* · `rule:world_needs.sleeps`

A company that sleeps grows weary eighteen hours after it last woke from sleep (a bed, a camp, a rest), and stays so until it sleeps again; a weary company fights the worse for it (see Campaign.encounterBattle). A sleep that can be broken (a camp, a rest) has its effects when it ends; a bed at an inn cannot, and has them when it begins, so it sets lastSlept to when the night will end.

#### meal

*Kyr · rule* · `rule:world_needs.meal`

> When: eats(?g); watch(clock) >= nextMeal(?g); quantity(?g, rations) >= 1

> Then: Decrease quantity(?g, rations) by 1. Increase nextMeal(?g) by 144. Retract hungry(?g).

#### hunger

*Kyr · rule* · `rule:world_needs.hunger`

> When: eats(?g); watch(clock) >= nextMeal(?g); quantity(?g, rations) < 1; not (hungry(?g))

> Then: Assert hungry(?g).

#### weariness

*Kyr · rule* · `rule:world_needs.weariness`

Told by the narrator when it comes (see Narrator.exchange), not said: it does not stop a wait for light.

> When: sleeps(?g); watch(clock) >= (lastSlept(?g) + 108); not (weary(?g))

> Then: Assert weary(?g).

### Passages, obstacles and the condition of things

Also kept, without comment: passageKind, connects, on, guards, state, blocksWhen, harmsWhen, hurtsWith, hurtsInto, revealedBy, needs, changeOf, changeFrom, changeTo, changeKnows, consumes, spends, hobbled, following, travelTime.

| Kinds | Relations | Measures | Queries | Rules | Actions |
|---|---|---|---|---|---|
| 8 | 31 | 2 | 23 | 0 | 6 |

#### scenery

*Kyr · kind* · `rule:world_passages.scenery`

What is seen and changes but is not handled: the weather, a river, a beacon on a far hill.

#### roadway, tookWay

*Kyr · relation(passage); relation(group, passage)* · `rule:world_passages.roadway`

The ways that are road (a road, a bridge, a ford on one), and the way a company last went by.

#### travelMinutes

*Kyr · measure(passage)* · `rule:world_passages.travelMinutes`

A way walked in less than a watch: how many minutes (see ActionTime.minutes).

#### unopened

*Kyr · relation(passage)* · `rule:world_passages.unopened`

A way that opens only while something holds (Passage … opening when …), while it does not.

#### inside, receptacle, closesWhen

*Kyr · relation(entity, entity); relation(entity); relation(entity, condition)* · `rule:world_passages.inside`

Containment: a thing or item inside another, reachable while that one is not shut; a receptacle can take more.

#### strikes

*Kyr · relation(hazard, group)* · `rule:world_passages.strikes`

A hazard that strikes a company: the world turns it on one of its members (a trap sprung, a stone that falls).

#### verb, probeable, suits, tried

*Kyr · kind; relation(entity); relation(entity, verb); relation(entity, verb)* · `rule:world_passages.verb`

What can be tried on a thing (looked over closely, prodded, pried at...), and what has been.

#### changeAt

*Kyr · relation(change, place)* · `rule:world_passages.changeAt`

A change only one side reaches (the bar on the cellar side of a door) is made from that place.

#### carries

*Kyr · query(a: group, i: entity)* · `rule:world_passages.carries`

Carrying a particular thing: this key, not any key.

#### meets

*Kyr · query(a: group, n: entity)* · `rule:world_passages.meets`

What a way or a change needs: a skill, a kind of thing, or one particular thing.

#### keyholder

*Kyr · relation(group, entity)* · `rule:world_passages.keyholder`

Who holds the key to what bars a way, and those who serve them, go through it as if it were open.

#### harmless

*Kyr · query(t: entity)* · `rule:world_passages.harmless`

Something that can do harm, in a state where it does none: a trap gone off, or one made safe.

#### undone

*Kyr · query(t: entity)* · `rule:world_passages.undone`

Something that can bar a way or shut something in, in a state where it does neither: a seal broken, a lid off.

#### onHiddenWay

*Kyr · query(x: entity, a: group)* · `rule:world_passages.onHiddenWay`

A thing hidden until something is known is not there, for a company that does not know it; nor is a thing on a way the company does not know of.

#### go

*Kyr · action (group, passage, place, place)* · `rule:world_passages.go`

- Shown as: Take {way} to {destination}
- Takes: the travelTime of the way
- Costs: 1

> Needs: able(actor); at(actor, origin); connects(way, origin, destination); passable(way, actor); mobile(actor)

> Then: Assert at(actor, destination). Assert tookWay(actor, way).

#### slip past

*Kyr · action (group, passage, place, place, group)* · `rule:world_passages.slip_past`

- Shown as: Slip past {gatekeeper} by {way}
- Takes: the travelTime of the way
- Costs: 1

Someone who moves quietly takes the company past a watcher without a fight or a bargain. The watcher stays where it is, and will be there on the way back.

> Needs: able(actor); at(actor, origin); connects(way, origin, destination); guards(gatekeeper, way); able(gatekeeper); state(gatekeeper, ?t); blocksWhen(gatekeeper, ?t); not (tolerates(gatekeeper, actor)); at(gatekeeper, origin)) or (at(gatekeeper, destination); capable(actor, stealth); visibleTo(way, actor); not (barred(way)); not (hazardous(way)); equippedFor(actor, way); mobile(actor)

> Then: Assert at(actor, destination). Assert tookWay(actor, way).

#### risk

*Kyr · action (group, passage, place, place, entity, hazard, condition, member)* · `rule:world_passages.risk`

- Shown as: Risk {trap}; {victim} goes first
- Takes: the travelTime of the way
- Costs: 1

> Needs: able(actor); at(actor, origin); connects(way, origin, destination); on(trap, way); state(trap, ?s); harmsWhen(trap, ?s); hurtsWith(trap, blow); hurtsInto(trap, after); memberOf(victim, actor); awake(victim); visibleTo(way, actor); not (obstructed(way)); equippedFor(actor, way); mobile(actor)

> Then: Assert state(trap, after). Assert at(actor, destination). Assert tookWay(actor, way).

#### change thing

*Kyr · action (group, change, entity, condition, condition)* · `rule:world_passages.change_thing`

- Shown as: {how}
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); changeOf(how, thing); changeFrom(how, origin); changeTo(how, result); state(thing, origin); reaches(actor, thing); equippedFor(actor, how); informedFor(actor, how); placedFor(actor, how); not (dead(thing)); not (benighted(actor)); not (consumes(how, ?g)); not (spends(how, ?k))

> Then: Assert state(thing, result).

#### change thing spending

*Kyr · action (group, change, entity, condition, condition, item, itemkind, member)* · `rule:world_passages.change_thing_spending`

- Shown as: {how}, using {spent}
- Takes: 10 minutes
- Costs: 1

What it takes is used up doing it.

> Needs: able(actor); changeOf(how, thing); changeFrom(how, origin); changeTo(how, result); state(thing, origin); reaches(actor, thing); equippedFor(actor, how); informedFor(actor, how); placedFor(actor, how); not (dead(thing)); not (benighted(actor)); spends(how, form); memberOf(carrier, actor); awake(carrier); ownedItem(spent, carrier); itemKind(spent, form)

> Then: Assert state(thing, result).

#### change thing paying

*Kyr · action (group, change, entity, condition, condition, good)* · `rule:world_passages.change_thing_paying`

- Shown as: {how}
- Takes: 10 minutes
- Costs: 1

Said by the thing's own name ("the Abbess's Eye is used up", not "Elen's the Abbess's Eye").

> Needs: able(actor); changeOf(how, thing); changeFrom(how, origin); changeTo(how, result); state(thing, origin); reaches(actor, thing); equippedFor(actor, how); informedFor(actor, how); placedFor(actor, how); not (dead(thing)); not (benighted(actor)); consumes(how, spent); quantity(actor, spent) >= 1

> Then: Assert state(thing, result). Decrease quantity(actor, spent) by 1.

### Company and intention

Also kept, without comment: acceptsEscort, dismissed, thanks.

| Kinds | Relations | Measures | Queries | Rules | Actions |
|---|---|---|---|---|---|
| 0 | 21 | 3 | 0 | 5 | 6 |

#### freedBy, home, cameHome, grateful

*Kyr · relation(group, group); relation(group, place); relation(group); relation(group, group)* · `rule:world_people.freedBy`

Someone taken from home: who set them free, where home is, and what their people will give whoever brings them back. Brought home by a company they are home, and grateful to it, and the thanks are paid.

#### brought_home

*Kyr · rule* · `rule:world_people.brought_home`

> When: following(?person, ?company); home(?person, ?place); at(?person, ?place); not (cameHome(?person))

> Then: Retract following(?person, ?company). Assert cameHome(?person). Assert grateful(?person, ?company). Increase quantity(?company, gold) by thanks(?person).

#### kin, expects

*Kyr · relation(group, group); relation(group, group)* · `rule:world_people.kin`

Who someone is to the one who plays: family (kin), or someone expecting them with a letter or an errand (expects); what they owe someone is dominion's owes. An origin says so at the outset; what people say and do follows it.

#### homeOf, inDebtTo

*Kyr · relation(group, place); relation(group, group)* · `rule:world_people.homeOf`

The settlement the one who plays grew up in, where its people know them (neighbours, not strangers); and someone they owe money, until it is paid.

#### kinship

*Kyr · relation(group, entity)* · `rule:world_people.kinship`

What someone is to the one who plays, in the words the page names them by ("your brother"), where the origin says.

#### willing, hire, travelsWith

*Kyr · relation(group, group); measure(group); relation(group, group)* · `rule:world_people.willing`

Someone who would join the company, once they are willing, for their hire (which may be nothing); and whoever has joined it, who goes where it goes and can be talked to on the way.

#### joinedAs

*Kyr · relation(member, group)* · `rule:world_people.joinedAs`

Who someone who has joined now is among the company's members: they answer on the way only while that member is awake (not fallen, not asleep, not laid to rest).

#### fellow, confided, hushed

*Kyr · relation(member); measure(group); relation(group)* · `rule:world_people.fellow`

A traveller of the country who has joined (a fellow, as against the one who plays): how much of their own story they have told, and whether they have told some tonight. A story is told a part a night.

#### joining, parting

*Kyr · relation(group, entity); relation(group, entity)* · `rule:world_people.joining`

What someone says on joining the company, or leaving it, in their own words (Joins, Leaves): said instead of the voice tables' (data/voice/join.json, part.json), which speak by what they are to the one who plays.

#### likeness

*Kyr · relation(group, entity)* · `rule:world_people.likeness`

The painting shown beside someone in conversation (Likeness "fisherman"): one of the corpus, for what they do.

#### hush_lifts

*Kyr · rule* · `rule:world_people.hush_lifts`

> When: hushed(?c); not (dark())

> Then: Retract hushed(?c).

#### recruit

*Kyr · action (group, group, place)* · `rule:world_people.recruit`

- Shown as: Ask {recruit} to join the company
- Takes: 10 minutes
- Costs: 1

They come with you from now on: they fight beside you, and what they can do, you can.

> Needs: able(actor); company(actor); able(recruit); distinct(actor, recruit); at(actor, site); at(recruit, site); willing(recruit, actor); quantity(actor, gold) >= hire(recruit)

> Then: Decrease quantity(actor, gold) by hire(recruit). Retract willing(recruit, actor). Retract at(recruit, site). Assert travelsWith(recruit, actor).

#### lead

*Kyr · action (group, group, place)* · `rule:world_people.lead`

- Shown as: Ask {companion} to come with you
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); able(companion); distinct(actor, companion); at(actor, site); at(companion, site); acceptsEscort(companion, actor); not (following(companion, actor))

> Then: Assert following(companion, actor). Retract dismissed(companion, actor).

#### part ways

*Kyr · action (group, group, place)* · `rule:world_people.part_ways`

- Shown as: Let {companion} make their own way
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); able(companion); at(actor, site); at(companion, site); acceptsEscort(companion, actor); following(companion, actor); not (hobbled(companion))

> Then: Retract following(companion, actor). Assert dismissed(companion, actor).

#### send off

*Kyr · action (group, group, place)* · `rule:world_people.send_off`

- Shown as: Tell {companion} not to wait for you
- Takes: 10 minutes
- Costs: 1

Someone who would come with you, if you led them, can be told not to wait: they go their own way. (A goat that would follow is not told anything.)

> Needs: able(actor); able(companion); at(actor, site); at(companion, site); talks(companion); acceptsEscort(companion, actor); not (following(companion, actor)); not (dismissed(companion, actor)); not (hobbled(companion))

> Then: Assert dismissed(companion, actor).

#### talks, addressed

*Kyr · relation(group); relation(group, group)* · `rule:world_people.talks`

Talking to someone: the company's attention on one person, until it takes its leave or goes. Anyone who is a person (not an animal or a beast) talks, and anyone with something to be asked (Topic) does. Speaking to them takes no time; they answer it (a greeting, from the voice tables), and what can be put to them is put in it.

#### talk to

*Kyr · action (group, group, place)* · `rule:world_people.talk_to`

- Shown as: Talk to {person}
- Takes: 0 minutes
- Costs: 1

Go over and speak to them.

> Needs: able(actor); company(actor); at(actor, site); at(person, site); talks(person); able(person); not (asleep(person)); not (hostile(person, actor)); not (addressed(person, actor)); distinct(actor, person)

> Then: Assert addressed(person, actor).

#### take leave

*Kyr · action (group, group, place)* · `rule:world_people.take_leave`

- Shown as: Take your leave of {person}
- Takes: 0 minutes
- Costs: 1

> Needs: able(actor); at(actor, site); addressed(person, actor)

> Then: Retract addressed(person, actor).

#### conversation_ends

*Kyr · rule* · `rule:world_people.conversation_ends`

> When: addressed(?p, ?c); not (together(?p, ?c))

> Then: Retract addressed(?p, ?c).

#### conversation_falls

*Kyr · rule* · `rule:world_people.conversation_falls`

Nor does a conversation outlast whoever it was with falling, nor their turning on the company: nobody dead says goodbye.

> When: addressed(?p, ?c); not (able(?p))

> Then: Retract addressed(?p, ?c).

#### conversation_breaks

*Kyr · rule* · `rule:world_people.conversation_breaks`

> When: addressed(?p, ?c); hostile(?p, ?c)

> Then: Retract addressed(?p, ?c).

### Trying things: looking closely, prodding, prying, burning, pushing, listening

| Kinds | Relations | Measures | Queries | Rules | Actions |
|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 6 |

#### look closely

*Kyr · action (group, entity, place)* · `rule:probing.look_closely`

- Shown as: Look closely at {target}
- Takes: 10 minutes
- Costs: 1

Anything that can be handled can be tried, in the ways its look suits (and any its author adds); what it does when tried is the author's (an observation, an event, a rule on tried). A try that finds nothing says so; offering it never reveals anything. Something already undone (a trap gone off, a seal broken, a lid off) is not prodded, pried at, pushed or listened at.

> Needs: able(actor); at(actor, site); probeable(target); reaches(actor, target); not (benighted(actor)); suits(target, looking); not (tried(target, looking))

> Then: Assert tried(target, looking).

#### prod

*Kyr · action (group, entity, place)* · `rule:probing.prod`

- Shown as: Prod {target} with the pole
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); at(actor, site); probeable(target); reaches(actor, target); not (benighted(actor)); equippedFor(actor, prodding); suits(target, prodding); not (tried(target, prodding)); not (harmless(target)); not (undone(target))

> Then: Assert tried(target, prodding).

#### pry

*Kyr · action (group, entity, place)* · `rule:probing.pry`

- Shown as: Pry at {target} with the bar
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); at(actor, site); probeable(target); reaches(actor, target); not (benighted(actor)); equippedFor(actor, prying); suits(target, prying); not (tried(target, prying)); not (undone(target))

> Then: Assert tried(target, prying).

#### burn

*Kyr · action (group, entity, place)* · `rule:probing.burn`

- Shown as: Hold a flame to {target}
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); at(actor, site); probeable(target); reaches(actor, target); equippedFor(actor, burning); suits(target, burning); not (tried(target, burning))

> Then: Assert tried(target, burning).

#### push

*Kyr · action (group, entity, place)* · `rule:probing.push`

- Shown as: Push and pull at {target}
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); at(actor, site); probeable(target); reaches(actor, target); not (benighted(actor)); suits(target, pushing); not (tried(target, pushing)); not (undone(target))

> Then: Assert tried(target, pushing).

#### listen

*Kyr · action (group, entity, place)* · `rule:probing.listen`

- Shown as: Listen at {target}
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); at(actor, site); probeable(target); reaches(actor, target); not (benighted(actor)); suits(target, listening); not (tried(target, listening)); not (undone(target))

> Then: Assert tried(target, listening).

### Lodging, goods and camping

Also kept, without comment: offers, serviceOf, sells, fee, goodsPrice.

| Kinds | Relations | Measures | Queries | Rules | Actions |
|---|---|---|---|---|---|
| 2 | 4 | 2 | 0 | 0 | 6 |

#### onTheHouse

*Kyr · relation(group, group)* · `rule:world_services.onTheHouse`

A host who owes the company a night for what it did (it brought up what a deep site's makers died for) keeps it as a guest once: the next bed and supper are on the house. (Not "guest": an adventure of its own may say that.)

#### take lodging

*Kyr · action (group, group, service, place)* · `rule:world_services.take_lodging`

- Shown as: Take {service} from {host}
- Takes: the untilMorning of the way
- Costs: 1

> Needs: able(actor); able(host); distinct(actor, host); at(actor, site); at(host, site); not (refusesService(host, actor)); not (onTheHouse(host, actor)); offers(host, service); serviceOf(service, lodging); quantity(actor, gold) >= fee(service)

> Then: Decrease quantity(actor, gold) by fee(service). Increase quantity(host, gold) by fee(service). Retract hungry(actor). Increase nextMeal(actor) by 144. Set lastSlept(actor) to (watch(clock) + untilMorning(clock)). Retract weary(actor).

#### take lodging guest

*Kyr · action (group, group, service, place)* · `rule:world_services.take_lodging_guest`

- Shown as: Take {service} from {host}, on the house
- Takes: the untilMorning of the way
- Costs: 1

> Needs: able(actor); able(host); distinct(actor, host); at(actor, site); at(host, site); onTheHouse(host, actor); offers(host, service); serviceOf(service, lodging)

> Then: Retract onTheHouse(host, actor). Retract hungry(actor). Increase nextMeal(actor) by 144. Set lastSlept(actor) to (watch(clock) + untilMorning(clock)). Retract weary(actor).

#### take healing

*Kyr · action (group, group, service, place)* · `rule:world_services.take_healing`

- Shown as: Ask {healer} for {service}
- Takes: 60 minutes
- Costs: 1

> Needs: able(actor); able(healer); distinct(actor, healer); at(actor, site); at(healer, site); not (refusesService(healer, actor)); offers(healer, service); serviceOf(service, healing); quantity(actor, gold) >= fee(service)

> Then: Decrease quantity(actor, gold) by fee(service). Increase quantity(healer, gold) by fee(service).

#### take raising

*Kyr · action (group, group, service, member, place)* · `rule:world_services.take_raising`

- Shown as: Ask {healer} to raise {lost} from the dead
- Takes: the untilMorning of the way
- Costs: 1

A priest who can call the dead back (Orsino's Raise Dead) does it at the shrine, for a great price, through a night's vigil: the companion comes back weak, with half their health, and what killed them gone.

A long vigil at the shrine, a night's worth of hours, and the price of it. They come back with half their health.

> Needs: able(actor); able(healer); distinct(actor, healer); at(actor, site); at(healer, site); not (refusesService(healer, actor)); offers(healer, service); serviceOf(service, raising); memberOf(lost, actor); fallen(lost); quantity(actor, gold) >= fee(service)

> Then: Decrease quantity(actor, gold) by fee(service). Increase quantity(healer, gold) by fee(service).

#### buy goods

*Kyr · action (group, group, good, place)* · `rule:world_services.buy_goods`

- Shown as: Buy one {goods} from {seller}
- Takes: 10 minutes
- Costs: 1

> Needs: able(actor); able(seller); distinct(actor, seller); at(actor, site); at(seller, site); not (refusesService(seller, actor)); sells(seller, goods); quantity(seller, goods) >= 1; quantity(actor, gold) >= goodsPrice(seller, goods)

> Then: Decrease quantity(actor, gold) by goodsPrice(seller, goods). Increase quantity(seller, gold) by goodsPrice(seller, goods). Decrease quantity(seller, goods) by 1. Increase quantity(actor, goods) by 1.

#### camp

*Kyr · action (group, place)* · `rule:world_services.camp`

- Shown as: Make camp at {site}
- Takes: the untilMorning of the way
- Costs: 1

> Needs: able(actor); at(actor, site); not (indoors(site)); not (settled(site)); not (hungry(actor))

> Then: Set lastSlept(actor) to watch(clock). Retract weary(actor).

## Making worlds

A generated world is assembled from a region's geography and kits. A kit is a situation that can be placed: slots it fills from the region (a road with a chokepoint, an inn within four hours), proposals it draws from its tables (who keeps the toll), and the facts it provides once placed. The assembler places a kit only where its slots can be filled, and records every choice it made in the world's report.

### Kits

#### A price on a power

*Kyr* · `kit:bounty`

- Fills: victim (raids(?raider, ?victim)); power (raids(?power, ?victim) and power(?power)); chief (chief(?power, ?chief)); band (band(?power, ?band))
- Draws: patron from bounty_patron by terrain
- Provides: 1 facts
- Modules: 2

> A settlement that a power preys on puts a price on the power's chief. It needs a power some earlier placement established, the settlement that power raids, and the people the power acts through; who offers the money, and what they want for it, is Deem's to propose.

#### A raiders' hold

*Kyr* · `kit:raider_hold`

- Fills: approach (waypoint(?approach)); road (waypoint(?road) and onRoad(?road)); prey (square(?town, ?prey))
- Draws: hold from raider_hold_shape by terrain; folk from raider_hold_folk by terrain
- Provides: 7 facts
- Modules: 4

> A band that lives by raiding: a hold in wild country off the road, a road they lie in wait on, and a settlement they rob. Where it stands, which road and which settlement are bound to the region; who they are and the shape of their hold are Deem's to propose, and each changes what the company can do about them.

#### A toll on a road

*Kyr* · `kit:toll_road`

- Fills: post (waypoint(?post) and onRoad(?post)); market (square(?town, ?market)); provider (keeper(?provider, ?market))
- Draws: keepers from toll_keepers by terrain
- Provides: 6 facts
- Modules: 2

> A band that has made a stretch of road between two settlements its own: it stops whoever comes and takes a toll, and buys its bread on credit at the nearest inn. While the road is tolled the settlements it joins pay more for their meal and are not restocked; an inn bought empty means the band comes for bread in the night. Where the road runs and which inn feeds it are bound to the region; who keeps the toll is Deem's to propose, and each kind is dealt with differently.

### Frameworks

#### Frontier

*Kyr* · `framework:frontier`

- Places: raiders, toll, price

> A frontier region: besides the troubles its scenarios bring, a band that lives by raiding its roads and farms, another that has made a road its own and tolls it, and a settlement that has put a price on one of them. Kits listed here are placed into every generated region that uses this framework, in order, composed with the campaign's seed when it loads.

## Campaigns

The worlds that ship with the game.

### Hold One Season

*Kyr* · `campaign:hold-one-season`

- Regions and sites: season
- Kits placed: —

> You owe the Cutters' Mutual fourteen felt-lengths. Your uncle Garret walked into an open granary vault under the glass last autumn and has stood in its light ever since, alive. The Mutual's Master will halve your debt the day he walks into her hall on his own feet.

### The Road the Star Came Down

*Kyr* · `campaign:let-one-remember`

- Regions and sites: corrow
- Kits placed: —

> Ninety years after the star at the bottom of the Well got up and went after the jewel, the floating mountain the Corrow calls Hightown is drifting on its chain toward the lake it was lifted out of, the memory-stones are going blank, and lost things are coming home. Something in the grey country beyond the Seam is gathering itself a syllable at a time, and a new star is brightening over the Teskarn. It begins in the Stake ruins in the last week of autumn; it ends at the end of the road the star came down. Choose three companions.

### Low Water

*Kyr* · `campaign:low-water`

- Regions and sites: lowwater
- Kits placed: —

> Ammerlin goes down the inside of an old crater in four terraces, and its life is the water of the Stair. For three years the Mere at the bottom has been falling, and everybody in the city has a reason, and every reason is also a claim on somebody else's water. The Office of Measures has engaged you as Independent Assessor, because nobody who lives there can be neutral. Choose three companions.

### The House That Grows

*Kyr* · `campaign:the-house-that-grows`

- Regions and sites: hhg
- Kits placed: —

> You are in your second year learning the Watch, and Kezu of Cobble Ring is your teacher. Two nights ago she sat up with a room of glass that fell into Haddo's barley, and at dawn she shut her eyes on purpose and let its small door open. Since then she sleeps too much, and lies about her dreams.

### The Long Man

*Kyr* · `campaign:the-long-man`

- Regions and sites: longman
- Kits placed: —

> At the head of Merrowdale a long green ridge lies across the valley, and the village under it says a giant king is buried there. Something tall walks its crest at night. The steward of the Hall has posted forty crowns for whoever will lay it, and the autumn storm is three days off. Choose three companions.

### The Patient Star

*Kyr* · `campaign:the-patient-star`

- Regions and sites: season
- Kits placed: —

> Two thousand years ago a seed fell on the Ghessil Uplands and did not go out. Its light stops time in stone and slows it in flesh. You are a cutter of Quell, in debt; your uncle has stood eleven months in an open granary vault under the glass, alive. Under the plateau a citadel is building itself downward, and above it something is coming down the light.

### Thrume

*Kyr* · `campaign:thrume`

- Regions and sites: thrume
- Kits placed: —

> In the salt town under the fells, people pay to sleep, and some of them do not come home. The giants of Thrume have come down off the mountain for the first time in living memory, and the Margravine of Ebb will pay a barony for the thane's head before the Duke of Harle's host crosses the river. Choose three companions.

## Appendix: Orsino's world material

Orsino's planes, traps, wonders, treasure and magic items, with how much of each Kyr holds.

### Planes

10 in Orsino; 10 held by Kyr.

#### Arcadia

*Represented · plane* · `orsino:plane:Arcadia`

- Terrain: forest
- Alignment: neutral good
- Domain: life
- Weather: pleasant
- Native: fae
- Laws: bonusSpellDC 1, spellDurationMultiplier 1.2, bonusSpellSlots 1

> A lush, idyllic realm of eternal spring, where nature thrives and harmony reigns.

*A place's law (law(place, plane_arcadia)): everyone fighting there fights under the plane's spell DC. Its spell durations are not modelled: spells last as their own definitions say, and slots are a calling's.*

#### Cthelll

*Adapted · plane* · `orsino:plane:Cthelll`

- Terrain: swamp
- Alignment: neutral evil
- Domain: death
- Weather: foggy
- Native: —
- Laws: bonusSpellDC 1

> A dark, swampy plane shrouded in mist and mystery, home to ancient secrets and lurking dangers.

*A place's law (law(place, plane_cthelll)): everyone fighting there fights under the plane's spell DC.*

#### Gehenna

*Adapted · plane* · `orsino:plane:Gehenna`

- Terrain: mountain
- Alignment: lawful evil
- Domain: war
- Weather: sulfurous clouds and ash
- Native: —
- Laws: bonusSpellDC -1

> A fiery, volcanic landscape filled with treacherous terrain and the echoes of eternal conflict.

*A place's law (law(place, plane_gehenna)): everyone fighting there fights under the plane's spell DC.*

#### Hades

*Represented · plane* · `orsino:plane:Hades`

- Terrain: cave
- Alignment: lawful evil
- Domain: knowledge
- Weather: permanently overcast
- Native: —
- Laws: bonusSpellDC -1, spellDurationMultiplier 0.8

> A shadowy underworld of gloom and despair, where lost souls wander and forgotten knowledge lies buried.

*A place's law (law(place, plane_hades)): everyone fighting there fights under the plane's spell DC. Its spell durations are not modelled: spells last as their own definitions say, and slots are a calling's.*

#### Limbo

*Represented · plane* · `orsino:plane:Limbo`

- Terrain: desert
- Alignment: chaotic neutral
- Domain: chaos
- Weather: windy
- Native: —
- Laws: bonusSpellDC 1, spellDurationMultiplier 1.3

> A chaotic desert wasteland where the sands shift unpredictably and reality bends to whimsy.

*A place's law (law(place, plane_limbo)): everyone fighting there fights under the plane's spell DC. Its spell durations are not modelled: spells last as their own definitions say, and slots are a calling's.*

#### Mechanus

*Represented · plane* · `orsino:plane:Mechanus`

- Terrain: mountain
- Alignment: lawful neutral
- Domain: order
- Weather: clear skies
- Native: —
- Laws: bonusSpellDC 1, spellDurationMultiplier 0.8

> A realm of perfect order and precision, where everything operates like clockwork in harmonious balance.

*A place's law (law(place, plane_mechanus)): everyone fighting there fights under the plane's spell DC. Its spell durations are not modelled: spells last as their own definitions say, and slots are a calling's.*

#### Pandemonium

*Represented · plane* · `orsino:plane:Pandemonium`

- Terrain: cave
- Alignment: chaotic evil
- Domain: trickery
- Weather: howling winds
- Native: —
- Laws: bonusSpellDC -1, spellDurationMultiplier 0.9

> A tumultuous plane of howling winds and swirling chaos, where nothing remains constant for long.

*A place's law (law(place, plane_pandemonium)): everyone fighting there fights under the plane's spell DC. Its spell durations are not modelled: spells last as their own definitions say, and slots are a calling's.*

#### Prime Material

*Adapted · plane* · `orsino:plane:Prime Material`

- Terrain: —
- Alignment: 
- Domain: —
- Weather: —
- Native: —
- Laws: bonusSpellDC 0, spellDurationMultiplier 1, bonusSpellSlots 0, resurrectable true

> The mundane world of everyday life, where magic is present but not overwhelming.

*A place's law (law(place, plane_prime_material)): everyone fighting there fights under the plane's spell DC.*

#### Ysgard

*Represented · plane* · `orsino:plane:Ysgard`

- Terrain: snow
- Alignment: lawful good
- Domain: war
- Weather: snowstorms
- Native: dwarf
- Laws: bonusSpellDC -1, spellDurationMultiplier 1.2

> A frigid, mountainous realm of valor and heroism, where mighty warriors clash amidst snowstorms.

*A place's law (law(place, plane_ysgard)): everyone fighting there fights under the plane's spell DC. Its spell durations are not modelled: spells last as their own definitions say, and slots are a calling's.*

#### Zephyrus

*Represented · plane* · `orsino:plane:Zephyrus`

- Terrain: forest
- Alignment: neutral neutral
- Domain: storms
- Weather: thunderstorms
- Native: elf
- Laws: bonusSpellDC 1, spellDurationMultiplier 1.1, bonusSpellSlots 1

> A vibrant forested plane perpetually stirred by thunderstorms, alive with elemental energy.

*A place's law (law(place, plane_zephyrus)): everyone fighting there fights under the plane's spell DC. Its spell durations are not modelled: spells last as their own definitions say, and slots are a calling's.*

### Traps

100 in Orsino; 0 held by Kyr.

| Name | Springs | Seen as | In Kyr |
|---|---|---|---|
| Acid pool | type damage kind acid amount =3d6 | A pool of acid forms | — |
| Acid rain | type damage kind acid amount =6d6 | A rain of acid pours down | — |
| Acid spray | type damage kind acid amount =2d6 | A spray of acid burns | — |
| Apocalypse | type damage kind true amount =20d6 | Apocalyptic energies ravage the area | — |
| Blinding flash | type debuff status blinded | A flash of blinding light erupts | — |
| Blinding rune | type debuff status blinded | A rune glows with blinding energy | — |
| Bone spear | type damage kind piercing amount =6d6 | A spear of bone shoots out | — |
| Chaos rune | type debuff status insane | A rune glows with chaotic energy | — |
| Concealed blade | type damage kind slashing amount =1d8 | A concealed blade swings out | — |
| Confusion gas | type damage kind psychic amount =1d4; type debuff status confused | A gas of confusion spreads | — |
| Confusion rune | type debuff status confused | A rune glows with confusing energy | — |
| Cursed mark | type debuff status cursed | A cursed mark appears | — |
| Darkness field | type debuff status blinded | A field of magical darkness envelops the area | — |
| Darkness rune | type debuff status blinded | a rune glows with dark energy | — |
| Death word | type damage kind necrotic amount =5d6 | A word of death is spoken | — |
| Dimensional shred | type damage kind force amount =6d6 | Dimensions tear apart | — |
| Disease cloud | type debuff status disease | A virulent disease spreads | — |
| Divine light | type damage kind radiant amount =10d6 | A beam of harsh judgment shines down | — |
| Doom rune | type debuff status doom | A rune glows with ominous energy | — |
| Electrified floor | type damage kind lightning amount =3d6 | The floor becomes electrified | — |
| Energy burst | type damage kind force amount =10d6 | A burst of energy explodes | — |
| Energy drain | type debuff status fatigue | Energy is drained away | — |
| Entangling vines | type debuff status entangled | Vines erupt from the ground | — |
| Falling rocks | type damage kind bludgeoning amount =3d6 | Rocks fall from above | — |
| Falling spikes | type damage kind piercing amount =4d6 | Spikes fall from above | — |
| Fear gas | type damage kind psychic amount =1d4; type debuff status fear | A noxious cloud fills the area | — |
| Fear rune | type debuff status fear | A rune glows with fearful energy | — |
| Flame burst | type damage kind fire amount =2d6 | A burst of flame erupts | — |
| Flame jet | type damage kind fire amount =3d6 | A jet of flame shoots out | — |
| Flame tornado | type damage kind fire amount =8d6 | A tornado of flame swirls | — |
| Flame wave | type damage kind fire amount =5d6 | A wave of flame surges | — |
| Flame whip | type damage kind fire amount =4d6 | A whip of flame lashes out | — |
| Force blast | type damage kind force amount =8d6 | A blast of force energy erupts | — |
| Force field | type damage kind force amount =3d6 | A force field surrounds the area | — |
| Force push | type debuff status prone | A forceful push knocks you back | — |
| Force spike | type damage kind force amount =4d6 | A spike of force energy shoots out | — |
| Freezing blast | type damage kind cold amount =2d6; type debuff status slow | A sudden blast of freezing air chills | — |
| Freezing rune | type damage kind cold amount =3d6 | A rune glows with icy energy | — |
| Freezing spray | type damage kind cold amount =4d6 | A spray of freezing air chills | — |
| Frost bite | type damage kind cold amount =7d6 | A bite of frost chills deeply | — |
| Frost nova | type damage kind cold amount =5d6 | A nova of frost erupts | — |
| Gate of shadows | type planeshift location Cthelll | A gate to the shadow realm opens | — |
| Gravity well | type debuff status agony | A well of gravity pulls inward | — |
| Hateful whisper | type debuff status fear; type debuff status mocked | A hateful whisper fills the mind | — |
| Hidden dart | type damage kind piercing amount =1d6 | A hidden dart shoots out | — |
| Holy burst | type damage kind radiant amount =5d6 | A burst of holy energy explodes | — |
| Ice spikes | type damage kind cold amount =6d6 | Spikes of ice shoot up | — |
| Lava spray | type damage kind fire amount =6d6 | A spray of lava erupts | — |
| Life drain | type damage kind necrotic amount =5d6 | Life energy is drained | — |
| Lightning bolt | type damage kind lightning amount =2d6 | A bolt of lightning strikes down | — |
| Lightning wave | type damage kind lightning amount =4d6 | A wave of lightning surges | — |
| Maze rune | type debuff status mazed | A rune glows with maze-like energy | — |
| Mental shock | type damage kind psychic amount =6d6 | A shock of mental energy assaults the mind | — |
| Mind fog | type debuff status confused; type debuff status distracted | A fog of confusion clouds the mind | — |
| Mind spike | type damage kind psychic amount =8d6; type debuff status stun | A spike of mental energy pierces the mind | — |
| Necrotic aura | type damage kind necrotic amount =3d6 | An aura of necrotic energy radiates | — |
| Necrotic burst | type damage kind necrotic amount =4d6 | A burst of necrotic energy explodes | — |
| Necrotic touch | type damage kind necrotic amount =2d6 | A necrotic touch drains life | — |
| Necrotic wave | type damage kind necrotic amount =8d6 | A wave of necrotic energy washes over | — |
| Petrification rune | type debuff status petrified | A rune glows with petrifying energy | — |
| Pit opening | type damage kind bludgeoning amount =2d6; type debuff status prone | The ground gives way | — |
| Plague cloud | type debuff status disease | A cloud of plague spreads | — |
| Planar rift | type planeshift location =oneOf(Limbo, Pandemonium, Mechanus) | A rift to another plane opens | — |
| Poison cloud | type damage kind poison amount =1d4 | A cloud of poison gas swirls into the room | — |
| Poison darts | type damage kind poison amount =2d6 | Darts coated in poison shoot out | — |
| Poison gas | type damage kind poison amount =3d6 | A cloud of poison gas fills the area | — |
| Poison mist | type damage kind poison amount =7d6 | A mist of poison fills the area | — |
| Poisoned spikes | type damage kind piercing amount =2d6; type damage kind poison amount =1d6 | Spikes coated in poison shoot up | — |
| Psychic rune | type damage kind psychic amount =4d6 | A rune glows with psychic energy | — |
| Psychic scream | type damage kind psychic amount =2d6 | A psychic scream assaults the mind | — |
| Psychic wave | type damage kind psychic amount =3d6 | A wave of psychic energy washes over | — |
| Radiant burst | type damage kind radiant amount =3d6 | A burst of radiant energy explodes | — |
| Radiant flash | type damage kind radiant amount =2d6 | A blinding flash of radiant light shines | — |
| Radiant rune | type damage kind radiant amount =4d6 | A rune glows with radiant energy | — |
| Radiant surge | type damage kind radiant amount =8d6 | A surge of radiant energy bursts forth | — |
| Scything blade | type damage kind slashing amount =2d8 | A scything blade swings through the air | — |
| Shadow bolt | type damage kind necrotic amount =7d6 | A bolt of shadow energy strikes | — |
| Shadow grasp | type debuff status hexed; type debuff status slow | Shadows reach out to grasp | — |
| Shock wave | type damage kind lightning amount =6d6 | A wave of shock energy reverberates | — |
| Silence rune | type debuff status silence | A rune glows with silencing energy | — |
| Silencing field | type debuff status silence | A field of silence envelops | — |
| Sleep gas | type debuff status asleep | A gas of sleep spreads | — |
| Sleep rune | type debuff status asleep | A rune glows with soporific energy | — |
| Sonic boom | type damage kind sonic amount =2d6 | A booming sonic wave reverberates | — |
| Sonic rune | type damage kind sonic amount =3d6 | A rune glows with sonic energy | — |
| Sonic wave | type damage kind sonic amount =1d8 | A wave of sonic energy erupts | — |
| Spike trap | type damage kind piercing amount =2d6 | Spikes shoot up from the ground | — |
| Spinning blade | type damage kind slashing amount =3d8 | A blade spins rapidly | — |
| Spore burst | type debuff status poison; type debuff status disease; type debuff status slow | A burst of spores erupts | — |
| Stun rune | type debuff status stun | A rune glows brightly | — |
| Stunning dart | type damage kind piercing amount =1d3; type debuff status stun | A stunning dart shoots out | — |
| Sunburst | type damage kind radiant amount =2d6; type debuff status sunmarked | A sudden burst of sunlight blinds and marks you | — |
| Telekinetic push | type debuff status prone | A telekinetic push knocks back | — |
| Thunder clap | type damage kind lightning amount =5d6 | A clap of thunder reverberates | — |
| Thunder strike | type damage kind lightning amount =8d6 | A strike of thunder crashes down | — |
| Time dilation | type debuff status slow | Time dilates unnaturally | — |
| Time warp | type debuff status slow; type debuff status weakened; type debuff status confused | Time warps unpredictably | — |
| Vine snare | type damage kind slashing amount =2d6; type debuff status entangled | Vines erupt to entangle | — |
| Vine whip | type damage kind slashing amount =4d6; type debuff status entangled | A whip of vines lashes out | — |
| Withering gas | type debuff status weakened | A gas of withering spreads | — |

### Wonders

80 in Orsino; 0 held by Kyr.

| Name | Does | Seen as | In Kyr |
|---|---|---|---|
| Ancient obelisk | type upgrade stat wis amount 2 | a towering obelisk inscribed with ancient runes of power. | — |
| Ancient trees | type heal amount 2d8 | a massive tree with gnarled roots and a trunk that seems to pulse with life. | — |
| Arcane clock | type buff status haste duration 20 | a clock that seems to measure time in a non-linear fashion. | — |
| Arcane lantern | type learn abilityName true_sight | a lantern that emits a magical light, illuminating hidden truths. | — |
| Arcane sculpture | type learn abilityName dispel_magic | a sculpture that seems to shift and change form when not being observed. | — |
| Arcane symbols | type buff status focus duration 10 | symbols that glow with magical energy, pulsing rhythmically. | — |
| Arcane tree | type upgrade stat int amount 1 | a tree that seems to grow magical energy within its branches. | — |
| Arcane well | type heal amount 3d8 | a well that seems to draw water from other planes of existence. | — |
| Celestial fountain | type heal amount 3d6; type upgrade stat con amount 1; type buff status protected duration 50 | a fountain that flows with water imbued with celestial energy, healing those who drink from it. | — |
| Celestial glow | type buff status scaleskin duration 10 | a soft glow that seems to come from the heavens themselves. | — |
| Celestial map | type learn abilityName sunburst | a map that depicts the starfall_crystals and constellations of distant realms. | — |
| Celestial observatory | type learn abilityName meteor_swarm | an observatory that seems to connect to the stars and celestial realms. | — |
| Color shifts | type buff status acidproof duration 10; type buff status lightproof duration 10; type buff status soundproof duration 10 | colors that shift and change in a mesmerizing way. | — |
| Dancing lights | type buff status agility duration 10 | lights that move and dance in intricate patterns. | — |
| Divine aegis | type grantPassive traitName favored | an invulnerable sphere of light imbued with divine protection. | — |
| Dragon statue | type upgrade stat str amount 1 | a majestic statue of a dragon that seems almost alive, its eyes gleaming with intelligence. | — |
| Dreamscape portal | type planeshift location Arcadia | a portal that seems to lead to a realm of dreams and imagination. | — |
| Eerie chimes | type buff status calm duration 30 | chimes that produce otherworldly sounds when the wind blows. | — |
| Enchanted aura | type buff status protected duration 10; type buff status mageproof duration 10 | a shimmering aura that seems to protect the area from harm. | — |
| Enchanted flute | type buff status inspired duration 30 | a flute that produces haunting melodies when played. | — |
| Enchanted grove | type heal amount 3d6 | a grove of trees that seem to radiate magical energy. | — |
| Enchanted labyrinth | type learn abilityName maze | an intelligent painting of a labyrinth that shifts and changes, confounding those who enter. | — |
| Enchanted mirror | type learn abilityName reflection | a mirror that shows not just reflections, but glimpses of other places. | — |
| Enchanted obelisk | type upgrade stat str amount 1 | an obelisk inscribed with runes of great power. | — |
| Enchanted statue garden | type learn abilityName flesh_to_stone | a garden filled with statues that seem to come to life when not being observed. | — |
| Enchanted statues | type buff status shielded duration 10; type buff status warded duration 10 | a statue that appears to move slightly when not directly looked at. | — |
| Enchanted tapestry | type learn abilityName invisibility | a tapestry that depicts scenes that seem to move and change. | — |
| Endless staircase | type teleport location lastRoom | a staircase that seems to go on forever, leading to unknown places. | — |
| Eternal candle | type buff status lightproof duration 20 | a candle that burns without ever melting, its flame flickering eternally. | — |
| Eternal flame | type grantPassive traitName firekissed | a flame that burns without fuel, its light never fading. | — |
| Eternal garden | type upgrade stat con amount 2 | a garden that blooms eternally, filled with plants of otherworldly beauty. | — |
| Ethereal fountain | type heal amount 4d6 | a fountain that flows with water from another plane of existence. | — |
| Ethereal music | type buff status inspired duration 10; type buff status courage duration 10 | a haunting melody that seems to come from nowhere, filling the air. | — |
| Floating disk | type buff status flight duration 10 | a disk that hovers in the air, rotating slowly. | — |
| Floating lights | type buff status mind_blank duration 10 | small lights that float in the air, moving in intricate patterns. | — |
| Glowing crystals | type buff status cunning duration 10 | a crystal that emits a soft, radiant glow. | — |
| Glowing pool | type heal amount 4d8 | a pool that glows with a soft, radiant light. | — |
| Glowing runes | type buff status insight duration 10 | runes that glow with an inner light, pulsing softly. | — |
| Illusory visions | type buff status clarity duration 10; type buff status wisdom duration 10 | visions that appear and disappear at the edge of your sight. | — |
| Intelligent painting | type learn abilityName polymorph | a painting that seems to change and shift, depicting different scenes. | — |
| Levitating objects | type buff status grace duration 10 | various objects levitating gently in the air, defying gravity. | — |
| Life tree | type upgrade stat con amount 1 | a magnificent tree that radiates life energy, its leaves shimmering with vitality. | — |
| Living book | type learn abilityName lightning_bolt | a book that seems to write itself, its pages filled with ever-changing text. | — |
| Living mural | type learn abilityName haste | a mural that seems to depict scenes that change and shift over time. | — |
| Living statue | type upgrade stat str amount 1; type upgrade stat con amount 1 | a statue that appears to move and breathe when not being observed. | — |
| Magical fountain | type heal amount 2d10 | a fountain that flows with water imbued with magical properties. | — |
| Magical lantern | type buff status warded duration 50 | a lantern that emits a light that reveals hidden truths. | — |
| Magical sundial | type buff status haste duration 50 | a sundial that seems to measure time in a mystical way. | — |
| Magical weather | type buff status fireproof duration 10; type buff status waterproof duration 10; type buff status stormproof duration 10 | weather phenomena that seem to be controlled by magic. | — |
| Mysterious portal | type teleport location =oneOf(firstRoom, lastRoom, randomRoom) | a swirling portal that seems to lead to another place. | — |
| Mystic compass | type upgrade stat dex amount 1 | a compass that always points toward a place of great magical power. | — |
| Mystic conduit | type learn abilityName plane_shift | a conduit that channels mystical energies from other planes of existence. | — |
| Mystic pedestal | type upgrade stat dex amount 1 | a pedestal that seems to radiate magical energy. | — |
| Mystic statue | type upgrade stat int amount 1 | a statue that seems to radiate an aura of ancient power. | — |
| Mystical fog | type buff status splendor duration 10 | a thick fog that seems to have a life of its own. | — |
| Mystical jewel | type upgrade stat cha amount 1 | a jewel that emits a soft, radiant light, pulsing with magical energy. | — |
| Mythic portal | type planeshift location =oneOf(Arcadia, Cthelll, Gehenna, Hades, Limbo, Mechanus, Pandemonium, Ysgard, Zephyrus) | a portal that connects to legendary realms and mythical places. | — |
| Oathstone circle | type buff status oathbound duration 100 | a circle of stones that seem to bind those who stand within it to their oaths. | — |
| Petrified forest | type upgrade stat con amount 1 | a forest of petrified trees that seem to pulse with ancient energy. | — |
| Phantasmal orb | type teleport location randomRoom | an orb that glows with an inner light, showing visions of distant places. | — |
| Phantom flame | type buff status fireproof duration 10 | a flame that burns without heat, flickering in the air. | — |
| Phantom garden | type heal amount 5d6 | a garden that seems to bloom with flowers of ethereal beauty. | — |
| Phoenix heart | type upgrade stat maxHp amount 5 | a radiant heart that pulses with fiery energy, symbolizing rebirth and immortality. | — |
| Seeing stone | type upgrade stat wis amount 1 | a polished stone that allows one to see distant places or events. | — |
| Shadow portal | type planeshift location Cthelll | a dark portal that seems to lead to a shadowy realm. | — |
| Shifting walls | type buff status steelskin duration 10 | walls that subtly shift and change position when not being observed. | — |
| Shimmering veil | type buff status warded duration 50 | a veil of shimmering light that seems to separate two realms. | — |
| Singing crystal | type buff status inspired duration 20 | a crystal that emits a melodious sound when touched. | — |
| Soul mirror | type upgrade stat cha amount 1 | a mirror that reflects not just physical appearances, but the true nature of one's soul. | — |
| Spectral figures | type buff status splendor duration 10 | ghostly figures that move silently through the area. | — |
| Starfall crystal | type upgrade stat int amount 2 | a crystal formed from fallen stars, radiating cosmic energy. | — |
| Storm core | type upgrade stat dex amount 1 | a swirling core of storm energy, crackling with lightning. | — |
| Time dilation | type buff status haste duration 10 | an area where time seems to pass differently | — |
| Time stop aura | type learn abilityName time_stop | an aura that can temporarily halt the flow of time within its vicinity. | — |
| Timeworn relic | type upgrade stat con amount 1 | an ancient relic that seems to pulse with the energy of ages past. | — |
| Titan golem | type upgrade stat str amount 2 | a colossal golem imbued with the strength of titans. | — |
| Unearthly silence | type buff status focus duration 10; type buff status calm duration 10 | a profound silence that seems to absorb all sound. | — |
| Void singularity | type upgrade stat int amount 1; type upgrade stat wis amount 1; type upgrade stat cha amount 1 | a swirling vortex of darkness that seems to absorb all light and matter around it. | — |
| Whispering tree | type upgrade stat wis amount 1 | a tree that seems to whisper secrets to those who listen. | — |
| Whispering voices | type buff status wisdom duration 10 | soft whispers that seem to come from the walls themselves. | — |

### Treasure tiers

6 in Orsino; 0 held by Kyr.

| Name | Worth | Holds | In Kyr |
|---|---|---|---|
| Basic | 10 | wooden bowl, cloth pouch, broken dagger, tattered map, wooden figurine, minor healing potion, firewood, shoes, candle, manacles, waterskin, flask, rations, torch, bedroll, blanket, soap, fish hook, needle and thread, skillet, whetstone | — |
| Grand | 2500 | emerald, sapphire, crown of insight, helm of the stars, ring of strength, ring of major protection, amulet of focus, amulet of protection, ring of regeneration, ring of spell turning, ring of the firmament, priceless painting, royal scepter, dragons egg, jeweled crown, golden idol, titan statue, celestial chart, scroll of domination, deck of multiplicity, sword of ages, robe of elvenkind, darkwood staff, angelmail, dragonhelm | — |
| Legendary | 5000 | black diamond, diamond, black opal, fire opal, star ruby, scroll of apocalypse, fallen star, crystal eye, diamond necklace, kraken claw, phoenix feather, divine scepter, jeweled statue, vial of phoenix tears, tirions fury, ring of perfect turning, arcane conduit, aegis of eternity, aeon stone, jeweled zodiac, diamond eye, opalescent skull, intelligent book | — |
| Major | 1000 | amethyst, tourmaline, bolt blade, potion of barkskin, scroll of domination, ancient orrery, ancient crown, sacred idol, lost tome, ring of protection, ring of thorns, belt of giant strength, boots of swiftness, crystal orb, nunchaku, wardstone, katana, longbow, galvorn mail, longsword of flames, wardstone, gloves of dexterity, helm of intellect, mantle of charisma | — |
| Minor | 200 | dagger, longsword, shortbow, chainmail, major healing potion, wand of magic missile, scroll of fireball, scroll of cure disease, agate, carnelian, moonstone, onyx, quartz, broken crown, lensing crystal, music box, ancient tome, broken scepter, dowsing rod, holy symbol, thieves tools, antidote, ring of minor protection, elixir of strength, amulet of vitality, amulet of health, ring of minor strength, mantle of charisma, wand of cure minor wounds, wand of paralyzing touch, canvas, lock, hammer, ladder, musical instrument, rope | — |
| Negligible | 50 | simple ring, bronze statue, bronze bracelet, faded painting, faded tome, crowbar, dice, lantern, oil flask, pouch, quill, shovel, signal whistle, tent, vinegar, wind chime, alchemist fire, first aid kit, holy water, cloak pin, healing potion | — |

### Magic items

48 in Orsino; 48 held by Kyr.

| Name | Kind | Rarity | Does | In Kyr |
|---|---|---|---|---|
| Aegis of Eternity | shield | legendary | ac -6 resistAll 0.3 onAttacked [{"type":"damage","amount":"2d6","kind":"true","target":"attacker"}] | faithful |
| Aeon Stone | orbital | legendary | onCombatStart [{"type":"buff","status":"haste","target":"self"}] onAttacked [{"type":"debuff","status":"slow","target":"attacker","saveDC":35}] | faithful |
| Amulet of Focus | amulet | rare | int 3 wis 3 bonusSpellDC 2 | faithful |
| Amulet of Health | amulet | uncommon | con 2 | faithful |
| Amulet of Protection | amulet | legendary | ac -2 resistAll 0.1 | faithful |
| Amulet of Vitality | amulet | — | con 1 | faithful |
| Angelmail | body | legendary | ac -4 resistRadiant 0.5 onAttacked [{"type":"damage","amount":"1d8","kind":"radiant","target":"attacker"}] | faithful |
| Arcane Conduit | weapon | legendary | bonusSpellDC 5 int 5 | represented |
| Belt of Giant Strength | belt | rare | str 6 | faithful |
| Bolt Blade | weapon | rare | onAttackHit [{"type":"damage","amount":"1d6","kind":"lightning","target":"target"}] | faithful |
| Bone Armor | body | rare | resistNecrotic 0.4 onAttacked [{"type":"damage","amount":"1d3","kind":"necrotic","target":"attacker"}] | faithful |
| Boots of Swiftness | boots | uncommon | dex 2 | faithful |
| Censer of Consecration | special | rare | bonusSpellDC 3 wis 3 onCombatStart [{"type":"cast","spellName":"consecrated_ground","target":"self"}] | faithful |
| Cloak of Invisibility | cloak | legendary | onCombatStart [{"type":"buff","status":"invisible","target":"self"}] | faithful |
| Cloak of Protection | cloak | common | ac -1 saveVersusAll 1 | faithful |
| Crown of Insight | helm | legendary | wis 4 | faithful |
| Darkwood Staff | weapon | rare | bonusSpellDC 2 int 2 | represented |
| Dragonhelm | helm | legendary | ac -3 resistFire 0.5 onAttacked [{"type":"damage","amount":"1d6","kind":"fire","target":"attacker"}] | faithful |
| Dun Rìerdan Waystone | amulet | rare | con 2 resistAll 0.05 revealLocation dun_ri | represented |
| Galvorn Mail | body | legendary | ac -5 resistAll 0.2 | faithful |
| Gloves of Dexterity | gloves | uncommon | dex 1 | faithful |
| Helm of Intellect | helm | uncommon | int 2 | faithful |
| Helm of the Stars | helm | rare | str 1 dex 1 con 1 int 1 wis 1 cha 1 | faithful |
| Ironglass Dagger | dagger | common | bonusDamage 1d2 | faithful |
| Longsword of Flames | weapon | rare | onAttackHit [{"type":"damage","amount":"1d6","kind":"fire","target":"target"}] | faithful |
| Mantle of Charisma | cloak | uncommon | cha 4 | faithful |
| Phoenix Talon | weapon | legendary | onAttackHit [{"type":"damage","amount":"=3d6","kind":"fire","target":"target"},{"type":"heal","amount":"=1d8","target":"self"}] | represented |
| Ring of Major Protection | ring | legendary | ac -3 | faithful |
| Ring of Minor Protection | ring | uncommon | ac -1 | faithful |
| Ring of Minor Strength | ring | — | str 1 | faithful |
| Ring of Perfect Turning | ring | legendary | resistAll 0.5 reflectSpellChance 0.75 | represented |
| Ring of Protection | ring | rare | ac -2 | faithful |
| Ring of Regeneration | ring | legendary | onTurnEnd [{"type":"heal","amount":"=1d2-1"}] | faithful |
| Ring of Spell Turning | ring | legendary | reflectSpellChance 0.5 resistAll 0.2 saveVersusMagic 4 onSaveVersusMagic [{"type":"damage","amount":"=1d6","target":"attacker","kind":"true"}] | represented |
| Ring of Strength | ring | uncommon | str 2 | faithful |
| Ring of the Firmament | ring | rare | resistFire 0.5 resistCold 0.5 resistLightning 0.5 | faithful |
| Ring of Thorns | ring | rare | onAttacked [{"type":"attack","target":"attacker","kind":"force"}] | faithful |
| Ring of True Sight | ring | legendary | seeInvisible true | represented |
| Robe of Elvenkind | body | rare | dex 2 evasion 10 onAttacked [{"type":"debuff","status":"blinded","target":"attacker","saveDC":25},{"type":"debuff","status":"slow","target":"attacker","saveDC":25}] | faithful |
| Robe of the Archmagi | body | legendary | int 4 wis 4 bonusSpellDC 4 resistAll 0.15 | faithful |
| Silvered Bracers | bracers | common | ac -1 | faithful |
| Singing Stone | amulet | uncommon | bonusSpellDC 1 bonusSpellDamage 1 | represented |
| Staff of Power | weapon | legendary | bonusSpellDC 6 int 6 onAttackHit [{"type":"damage","amount":"=3d6","kind":"force","target":"target"}] | represented |
| Staff of the Necromancer | weapon | legendary | bonusSpellDC 5 int 5 onAttackHit [{"type":"damage","amount":"=2d6","kind":"necrotic","target":"target"}] | represented |
| Sword of Ages | weapon | legendary | onAttackHit [{"type":"damage","amount":"=1d4+1","kind":"true","target":"target"},{"type":"debuff","status":"weakened","target":"target","saveDC":30}] | faithful |
| Sword of Goblinkind | weapon | rare | dex 3 int 3 onAttackHit [{"type":"debuff","status":"confused","target":"target","saveDC":20}] | faithful |
| Tirion's Fury | weapon | legendary | onAttackHit [{"type":"damage","amount":"=2d6+2","kind":"true","target":"target"},{"type":"debuff","status":"stun","target":"target","saveDC":35}] | faithful |
| Wardstone | amulet | rare | onCombatStart [{"type":"buff","status":"warded"}] | faithful |

### Consumables

28 in Orsino; 28 held by Kyr.

| Name | Kind | Does | In Kyr |
|---|---|---|---|
| Alchemist's Fire | flask | type damage amount 1d6 kind fire | represented |
| Antidote | potion | type removeStatus statusName Poison | adapted |
| Cloudberry | food | type heal amount 1d4+1 | faithful |
| Comfrey | herb | type heal amount 2d4; type removeStatus statusName Bleeding | faithful |
| Dandelion | herb | type heal amount 1d3; type removeStatus statusName Poison | faithful |
| Deck of Multiplicity | special | type randomEffect randomEffects [{"description":"Ace of Clubs","type":"buff","status":"haste","target":"self"},{"description":"King of Clubs","type":"buff","status":"scaleskin","target":"self"},{"description":"Dame of Clubs","type":"buff","status":"major_strength","target":"self"},{"description":"Jack of Clubs","type":"buff","status":"wisdom","target":"self"},{"description":"Ten of Clubs","type":"buff","status":"clarity","target":"self"},{"description":"Nine of Clubs","type":"buff","status":"focus","target":"self"},{"description":"Eight of Clubs","type":"buff","status":"rage","target":"self"},{"description":"Seven of Clubs","type":"buff","status":"steelskin","target":"self"},{"description":"Six of Clubs","type":"buff","status":"strength","target":"self"},{"description":"Five of Clubs","type":"buff","status":"ironskin","target":"self"},{"description":"Four of Clubs","type":"buff","status":"cunning","target":"self"},{"description":"Three of Clubs","type":"buff","status":"splendor","target":"self"},{"description":"Two of Clubs","type":"buff","status":"courage","target":"self"},{"description":"One of Clubs","type":"buff","status":"barkskin","target":"self"},{"description":"Ace of Coins","type":"cast","spellName":"death"},{"description":"King of Coins","type":"cast","spellName":"disintegrate"},{"description":"Dame of Coins","type":"cast","spellName":"flesh_to_stone"},{"description":"Jack of Coins","type":"cast","spellName":"meteor_swarm"},{"description":"Ten of Coins","type":"cast","spellName":"polymorph"},{"description":"Nine of Coins","type":"cast","spellName":"sandstorm"},{"description":"Eight of Coins","type":"cast","spellName":"chain_lightning"},{"description":"Seven of Coins","type":"cast","spellName":"ice_storm"},{"description":"Six of Coins","type":"cast","spellName":"fire_storm"},{"description":"Five of Coins","type":"cast","spellName":"cone_of_cold"},{"description":"Four of Coins","type":"cast","spellName":"dispel_magic"},{"description":"Three of Coins","type":"cast","spellName":"lightning_bolt"},{"description":"Two of Coins","type":"cast","spellName":"fireball"},{"description":"One of Coins","type":"cast","spellName":"ice_bolt"},{"description":"Ace of Swords","type":"damage","amount":"1d100","kind":"radiant"},{"description":"King of Swords","type":"damage","amount":"1d60","kind":"psychic"},{"description":"Dame of Swords","type":"damage","amount":"1d20","kind":"true"},{"description":"Jack of Swords","type":"damage","amount":"1d12","kind":"acid"},{"description":"Ten of Swords","type":"damage","amount":"1d10","kind":"sonic"},{"description":"Nine of Swords","type":"damage","amount":"2d8","kind":"poison"},{"description":"Eight of Swords","type":"damage","amount":"2d8","kind":"cold"},{"description":"Seven of Swords","type":"damage","amount":"3d6","kind":"fire"},{"description":"Six of Swords","type":"damage","amount":"3d6","kind":"necrotic"},{"description":"Five of Swords","type":"damage","amount":"3d6","kind":"lightning"},{"description":"Four of Swords","type":"damage","amount":"4d4","kind":"force"},{"description":"Three of Swords","type":"damage","amount":"4d3","kind":"slashing"},{"description":"Two of Swords","type":"damage","amount":"6d2","kind":"piercing"},{"description":"One of Swords","type":"damage","amount":"8d2","kind":"bludgeoning"},{"description":"Ace of Cups","type":"debuff","status":"asleep","saveDC":30},{"description":"King of Cups","type":"debuff","status":"confused","saveDC":30},{"description":"Dame of Cups","type":"debuff","status":"fatigue","saveDC":30},{"description":"Jack of Cups","type":"debuff","status":"fear","saveDC":30},{"description":"Ten of Cups","type":"debuff","status":"slow","saveDC":30},{"description":"Nine of Cups","type":"debuff","status":"weakened","saveDC":30},{"description":"Eight of Cups","type":"debuff","status":"feebleminded","saveDC":30},{"description":"Seven of Cups","type":"debuff","status":"petrified","saveDC":30},{"description":"Six of Cups","type":"debuff","status":"charmed","saveDC":30},{"description":"Five of Cups","type":"debuff","status":"blinded","saveDC":30},{"description":"Four of Cups","type":"debuff","status":"deafened","saveDC":30},{"description":"Three of Cups","type":"debuff","status":"paralyzed","saveDC":30},{"description":"Two of Cups","type":"debuff","status":"poison","saveDC":30},{"description":"One of Cups","type":"debuff","status":"silence","saveDC":30},{"description":"Ace of Hearts","type":"heal","amount":"3d20","target":"self"},{"description":"King of Hearts","type":"heal","amount":"4d12","target":"self"},{"description":"Dame of Hearts","type":"heal","amount":"4d10","target":"self"},{"description":"Jack of Hearts","type":"heal","amount":"4d8","target":"self"},{"description":"Ten of Hearts","type":"heal","amount":"3d8","target":"self"},{"description":"Nine of Hearts","type":"heal","amount":"4d6","target":"self"},{"description":"Eight of Hearts","type":"heal","amount":"5d4","target":"self"},{"description":"Seven of Hearts","type":"heal","amount":"6d3","target":"self"},{"description":"Six of Hearts","type":"heal","amount":"8d2","target":"self"},{"description":"Five of Hearts","type":"heal","amount":"14","target":"self"},{"description":"Four of Hearts","type":"heal","amount":"10","target":"self"},{"description":"Three of Hearts","type":"heal","amount":"9","target":"self"},{"description":"Two of Hearts","type":"heal","amount":"8","target":"self"},{"description":"One of Hearts","type":"heal","amount":"6","target":"self"},{"description":"Ace of Shields","type":"summon","creature":"dragon"},{"description":"King of Shields","type":"summon","creature":"pc"},{"description":"Dame of Shields","type":"summon","creature":"monster","options":{"_class":"elemental"}},{"description":"Jack of Shields","type":"summon","creature":"monster","options":{"_class":"aberration"}},{"description":"Ten of Shields","type":"summon","creature":"monster","options":{"_class":"fey"}},{"description":"Nine of Shields","type":"summon","creature":"monster","options":{"_class":"demon"}},{"description":"Eight of Shields","type":"summon","creature":"monster","options":{"_class":"giant"}},{"description":"Seven of Shields","type":"summon","creature":"monster","options":{"_class":"celestial"}},{"description":"Six of Shields","type":"summon","creature":"monster","options":{"_class":"construct"}},{"description":"Five of Shields","type":"summon","creature":"monster","options":{"_class":"beast"}},{"description":"Four of Shields","type":"summon","creature":"npc","options":{"race":"human"}},{"description":"Three of Shields","type":"summon","creature":"npc","options":{"race":"elf"}},{"description":"Two of Shields","type":"summon","creature":"npc","options":{"race":"dwarf"}},{"description":"One of Shields","type":"summon","creature":"animal"}] | represented |
| Elixir of Strength | potion | type buff status strength | faithful |
| First Aid Kit | kit | type heal amount 1d4+1; type removeStatus statusName Bleeding | faithful |
| Foxglove | herb | type heal amount 1d4+2; type removeStatus statusName Poison\|Fatigue\|Weakened | represented |
| Goodberry | food | type heal amount 1d4+1 | faithful |
| Potion of Healing | potion | type heal amount 3d4+3 | faithful |
| Heather | herb | type heal amount 1d3+1; type removeStatus statusName Fatigue | faithful |
| Kingsfoil | herb | type heal amount 2d4+2; type removeStatus statusName Poison | faithful |
| Major Potion of Healing | potion | type heal amount 4d4+4 | faithful |
| Minor Potion of Healing | potion | type heal amount 2d4+2 | adapted |
| Flask of Oil | flask | type debuff status oiled saveDC 25 | represented |
| Potion of Barkskin | potion | type cast spellName Barkskin | represented |
| Rashers of Bacon | food | type heal amount 1d3 | faithful |
| Scroll of Apocalypse | scroll | type cast spellName Apocalypse | represented |
| Scroll of Cure Disease | scroll | type removeStatus statusName Disease | faithful |
| Scroll of Domination | scroll | type cast spellName dominate_person | represented |
| Scroll of Fireball | scroll | type cast spellName Fireball | represented |
| Scroll of Shapechange | scroll | type cast spellName shapechange | represented |
| Wand of Cure Minor Wounds | wand | type cast spellName Cure Minor Wounds | represented |
| Wand of Magic Missile | wand | type cast spellName Magic Missile | represented |
| Wand of Paralyzing Touch | wand | type cast spellName Paralyzing Touch | represented |
| Wand of Polymorph | wand | type cast spellName Polymorph Other | represented |
| Wand of Wonder | wand | type randomEffect randomEffects [{"type":"cast","spellName":"magic_missile"},{"type":"cast","spellName":"fireball"},{"type":"cast","spellName":"lightning_bolt"},{"type":"cast","spellName":"cone_of_cold"},{"type":"cast","spellName":"invisibility","target":"self"},{"type":"cast","spellName":"flight","target":"self"},{"type":"cast","spellName":"heal","target":"self"},{"type":"cast","spellName":"summon_monster"},{"type":"cast","spellName":"summon_elemental"}] | represented |

### Gear

68 in Orsino; 67 held by Kyr.

| Name | Worth | Does | In Kyr |
|---|---|---|---|
| Ale | 2 | type heal amount 3d4 | faithful |
| Backpack | 5 | A sturdy backpack for carrying your gear on your adventures. | adapted |
| Barrel | 10 | A large barrel for storing liquids or bulk goods. | adapted |
| Bedroll | 1 | A comfortable bedroll for sleeping outdoors. | faithful |
| Bell | 1 | A small bell that can be used to signal others or scare off wildlife. | adapted |
| Blanket | 1 | A warm blanket for cold nights around the campfire. | faithful |
| Boots | 2 | A sturdy pair of boots for trekking through rough terrain. | faithful |
| Box | 3 | A sturdy box for storing small items and valuables. | adapted |
| Bracers | 4 | A pair of leather bracers for protecting your forearms in combat. | faithful |
| Caltrops | 1 | A bag of caltrops that can be scattered on the ground to slow down pursuers. | faithful |
| Candle | 1 | A simple wax candle that provides light in dark places. | adapted |
| Canvas | 2 | A roll of canvas for making tents, sails, or other fabric items. | faithful |
| Chain | 5 | A length of sturdy chain for securing items or climbing. | faithful |
| Chalk | 1 | A piece of chalk for marking walls or drawing maps. | faithful |
| Cloak | 3 | A warm cloak for protection against the elements. | faithful |
| Cloak pin | 2 | A pin for securing a cloak in place. | faithful |
| Crowbar | 2 | A sturdy crowbar for prying open doors or crates. | adapted |
| Dice | 1 | A set of dice for gambling or passing the time. | faithful |
| Doublet | 3 | A stylish doublet for formal occasions or impressing nobles. | faithful |
| Firewood | 1 | A bundle of firewood for starting campfires. | faithful |
| Fish hook | 1 | A sharp fish hook for catching fish. | faithful |
| Fishing net | 3 | A sturdy fishing net for catching multiple fish at once. | faithful |
| Flask | 1 | A small flask for carrying liquids. | adapted |
| Flint and steel | 2 | A flint and steel for starting fires. | faithful |
| Gloves | 2 | A pair of gloves for protecting your hands. | faithful |
| Gown | 3 | An elegant gown for formal occasions. | faithful |
| Hammer | 2 | A sturdy hammer for driving nails or breaking objects. | faithful |
| Holy symbol | 5 | A holy symbol for religious ceremonies or warding off evil. | faithful |
| Holy water | 25 | type damage kind radiant amount 2d6 condition {"trait":"undead"} | represented |
| Hose | 2 | A length of hose for carrying water or other liquids. | faithful |
| Iron spikes | 1 | A set of iron spikes for securing tents or climbing walls. | faithful |
| Ladder | 4 | A portable ladder for reaching high places. | faithful |
| Lamp | 3 | An oil lamp that provides light in dark places. | adapted |
| Lantern | 7 | A lantern that provides bright light for extended periods. | adapted |
| Lock | 10 | A sturdy lock for securing doors or chests. | faithful |
| Manacles | 8 | A pair of manacles for restraining prisoners. | faithful |
| Mirror | 5 | A small mirror for signaling or personal grooming. | faithful |
| Musical instrument | 10 | A musical instrument for entertainment or rituals. | faithful |
| Needle and thread | 1 | A needle and thread for repairing clothing or gear. | faithful |
| Piton | 1 | A metal spike for anchoring ropes in rock or ice. | faithful |
| Pole | 2 | A long pole for support or investigation. | faithful |
| Pot | 3 | A cooking pot for preparing meals while traveling. | adapted |
| Pouch | 2 | A small pouch for carrying personal items. | adapted |
| Quill | 1 | A feather quill for writing or drawing. | faithful |
| Quiver | 3 | A quiver for holding arrows or bolts. | adapted |
| Rations | 2 | type heal amount 1d4 | — |
| Robe | 4 | A flowing robe for wizards or priests. | faithful |
| Rope | 1 | A length of sturdy rope for climbing, tying, or securing items. | adapted |
| Sack | 2 | A large sack for carrying bulky items. | adapted |
| Satchel | 3 | A small satchel for carrying books or scrolls. | adapted |
| Scrollcase | 2 | A protective case for carrying scrolls or maps. | adapted |
| Shoes | 2 | A comfortable pair of shoes for everyday wear. | faithful |
| Shovel | 3 | A sturdy shovel for digging or moving earth. | adapted |
| Signal whistle | 1 | A whistle for signaling allies or alerting to danger. | faithful |
| Skillet | 2 | A cast iron skillet for cooking meals over a campfire. | faithful |
| Soap | 1 | A bar of soap for personal hygiene while traveling. | faithful |
| Spellbook | 15 | A book containing spells and magical knowledge for wizards. | faithful |
| Tent | 10 | A portable tent for shelter while camping outdoors. | faithful |
| Thieves tools | 25 | A set of tools for picking locks and disarming traps. | adapted |
| Torch | 1 | A wooden torch that provides light and can be used as a weapon. | represented |
| Tunic | 2 | A simple tunic for everyday wear. | faithful |
| Twine | 1 | A ball of twine for tying or binding objects. | faithful |
| Vellum | 3 | A sheet of vellum for writing or drawing. | faithful |
| Vinegar | 2 | type heal amount 1d4 | faithful |
| Waterskin | 2 | A waterskin for carrying fresh water on long journeys. | adapted |
| Whetstone | 1 | A whetstone for sharpening blades and tools. | faithful |
| Wind chime | 3 | A decorative wind chime that produces soothing sounds when the wind blows. | faithful |
| Wine | 3 | type heal amount 2d4 | faithful |

### Statuses

141 in Orsino; 141 held by Kyr.

| Name | Does | In Kyr |
|---|---|---|
| Acid Burn | onTurnEnd [{"type":"damage","amount":"=1d6","kind":"acid"}] | faithful |
| Acidproof | resistAcid 0.5 | faithful |
| Agility | dex 4 evasion 10 initiative 5 | faithful |
| Agony | int -1 wis -1 onTurnEnd [{"type":"damage","amount":"=2d4","kind":"necrotic"}] | faithful |
| Anointed | resistRadiant 0.5 bonusDamage 1 toHit 1 saveVersusAll 2 | faithful |
| Asleep | noActions true | faithful |
| Augured | allRolls 2 saveVersusAll 2 initiative 5 | faithful |
| Barkskin | ac -2 | faithful |
| Battlecry | bonusDamage =1d3 | faithful |
| Bleeding | onTurnEnd [{"type":"damage","amount":"=1d2","kind":"bleed"}] | faithful |
| Blessed | toHit 1 bonusDamage 1 | faithful |
| Blinded | toHit -4 evasion -10 allRolls -2 | faithful |
| Blood Frenzy | toHit 2 bonusDamage 2 ac 2 | faithful |
| Blurred | saveVersusMagic 2 ac -1 evasion 10 | faithful |
| Burning | onTurnEnd [{"type":"damage","amount":"=1d3","kind":"fire"}] | faithful |
| Calm | immuneFear true immuneInsanity true toHit 1 saveVersusWill 2 | faithful |
| Chanting | saveVersusAll 1 bonusSpellDC 1 bonusSpellSlots 1 toHit 2 onTurnEnd [{"type":"heal","amount":"=1d3 + #level","target":"allies"}] | represented |
| Charmed | changeAllegiance true | faithful |
| Clarity | allRolls 2 immuneCharm true | faithful |
| Confused | randomActions true | faithful |
| Courage | saveVersusAll 2 immuneFear true | faithful |
| Fox's Cunning | int 2 allRolls 1 | faithful |
| Cursed | str -1 dex -1 int -1 wis -1 cha -1 con -1 | faithful |
| Darkproof | resistNecrotic 0.5 immuneCharm true immuneFear true immuneSleep true | faithful |
| Deafened | resistSonic 0.5 bonusDamage -2 ac 2 toHit -2 saveVersusAll -1 | faithful |
| Death Ward | saveVersusDeath 5 | faithful |
| Defending | ac -2 | faithful |
| Deflection | ac -3 evasion 10 | faithful |
| Despair | cha -2 toHit -2 bonusDamage -2 saveVersusAll -2 | faithful |
| Disabled | noActions true noStatusExpiry true | represented |
| Diseased | con -2 saveVersusAll -2 onTurnEnd [{"type":"damage","amount":"=1d4","kind":"necrotic"}] | faithful |
| Distracted | toHit -1 bonusDamage -1 evasion -5 | faithful |
| Divine Champion | toHit 3 bonusDamage 3 saveVersusAll 3 immuneFear true | faithful |
| Dodging | ac -2 evasion 5 | faithful |
| Dominated | changeAllegiance true controlledActions true | faithful |
| Doomed | str -4 dex -4 con -4 int -4 wis -4 cha -4 | faithful |
| Drenched | toHit -2 resistLightning -1 resistCold -2 | faithful |
| Dug In | ac -2 saveVersusAll 3 toHit -2 | faithful |
| Bear's Endurance | con 2 tempHp 15 | faithful |
| Engulfed | onTurnEnd [{"type":"damage","amount":"=2d6","kind":"acid"}] noActions true | faithful |
| Enlarged | str 4 bonusDamage =1d4 toHit 1 ac 1 evasion -5 | faithful |
| Enlightened | int 4 wis 4 allRolls 2 bonusSpellDC 2 | faithful |
| Entangled | dex -5 toHit -2 evasion -5 initiative -5 | faithful |
| False Life | tempHp =10d6 + 2 * #level | faithful |
| Fatigued | str -1 dex -1 con -1 allRolls -1 | faithful |
| Frightened | toHit -2 initiative -5 allRolls -1 saveVersusAll -2 | faithful |
| Feebleminded | int -4 wis -4 cha -4 allRolls -2 mayUseItems false | represented |
| Fireproof | resistFire 0.5 | adapted |
| Flight | evasion 20 ac -5 | faithful |
| Focus | toHit 2 saveVersusMagic 3 bonusSpellDC 2 bonusSpellSlots 1 | represented |
| Frozen | noActions true dex -5 | faithful |
| Ghost Touch | onAttackHit [{"type":"damage","amount":"=1d3","kind":"necrotic","target":"target"}] | faithful |
| Cat's Grace | dex 2 evasion 5 | faithful |
| Haste | dex 4 initiative 10 extraAttacksPerTurn 1 ac -2 | faithful |
| Hexed | allRolls -2 saveVersusAll -2 | faithful |
| Hidden | ac -4 evasion 10 onAttack [{"type":"removeStatus","statusName":"Hidden"}] | faithful |
| Infected | con -1 saveVersusAll -2 toHit -1 bonusDamage -1 | faithful |
| Insane | randomActions true allRolls -1 saveVersusWill -2 | faithful |
| Sage's Insight | int 4 allRolls 2 saveVersusAll 3 bonusSpellDC 2 | faithful |
| Inspired | toHit 2 tempHp 5 saveVersusAll 1 | faithful |
| Invisible | invisible true onAttack [{"type":"removeStatus","statusName":"Invisible"}] onOffensiveCasting [{"type":"removeStatus","statusName":"Invisible"}] | represented |
| Invulnerable | untargetable true | represented |
| Ironskin | ac -5 | faithful |
| Keen Weapon | toHit 2 bonusDamage 2 criticalRangeIncrease 2 | faithful |
| Keen Senses | toHit 2 evasion 5 bonusDamage 1 saveVersusAll 1 | faithful |
| Lightproof | resistRadiant 0.5 | faithful |
| Mage-Armored | ac -4 tempHp 20 | faithful |
| Mageproof | resistForce 0.5 saveVersusMagic 2 | faithful |
| Major Augured | int 4 wis 4 allRolls 3 saveVersusAll 3 initiative 10 | faithful |
| Perfect Clarity | int 2 allRolls 3 saveVersusAll 2 immuneCharm true immuneInsanity true | faithful |
| Heroism | toHit 2 bonusDamage 2 saveVersusAll 3 immuneFear true | faithful |
| Raven's Cunning | int 4 allRolls 2 | faithful |
| Major Deflection | ac -5 evasion 15 | faithful |
| Severely Distracted | toHit -2 bonusDamage -2 evasion -10 allRolls -1 | faithful |
| Mammoth's Endurance | con 6 tempHp 40 | faithful |
| Major False Life | tempHp =20d6 + 4 * #level resistNecrotic 0.5 saveVersusDeath 2 | faithful |
| Greater Focus | toHit 4 saveVersusMagic 5 bonusSpellDC 4 bonusSpellSlots 2 | represented |
| Archmage's Insight | int 6 allRolls 3 saveVersusAll 5 bonusSpellDC 4 bonusSpellSlots 1 | represented |
| Greatly Inspired | toHit 4 bonusDamage 2 tempHp 15 saveVersusAll 2 | faithful |
| Major Reflect | reflectDamagePercent 0.75 | represented |
| Major Spellturn | reflectSpellChance 0.75 | represented |
| Phoenix's Splendor | cha 4 toHit 2 bonusDamage 1 | faithful |
| Giant's Strength | str 6 bonusMeleeDamage =1d3 | faithful |
| Major Warded | saveVersusMagic 2 saveVersusAll 1 resistFire 0.25 resistCold 0.25 resistLightning 0.25 resistForce 0.75 resistAcid 0.25 resistSonic 0.25 resistNecrotic 0.25 tempHp =21 + 3 * #level | faithful |
| Major Weakened | str -4 bonusDamage -4 | faithful |
| Sage's Wisdom | wis 4 allRolls 2 saveVersusAll 2 | faithful |
| In Maze | noActions true untargetable true | represented |
| Meditating | noActions true saveVersusMagic 2 resistForce 0.25 onTurnEnd [{"type":"heal","amount":"=1d2 + #level","target":"self"}] | faithful |
| Migraine | resistRadiant -2 resistSonic -2 | faithful |
| Mind Blank | resistPsychic 0.5 saveVersusWill 2 immuneCharm true immuneInsanity true immuneFear true immuneSleep true | faithful |
| Mindproof | resistPsychic 0.5 immuneCharm true immuneInsanity true immuneFear true immuneSleep true | faithful |
| Insight | saveVersusAll 2 bonusSpellDC 1 | faithful |
| Minor Reflect | reflectDamagePercent 0.25 | represented |
| Minor Warded | saveVersusMagic 1 resistForce 0.25 tempHp =7 + #level | faithful |
| Mirror Images | ac -2 saveVersusAll 2 evasion 15 | faithful |
| Mocked | toHit -1 bonusDamage -1 saveVersusAll -1 | faithful |
| Naturality | resistPoison 0.5 resistAcid 0.25 immuneDisease true saveVersusAll 1 | faithful |
| Oathbound | ac -2 toHit 2 bonusDamage 2 onEnemyMelee [{"type":"attack","target":"attacker","description":"oathbound attack"}] | faithful |
| Oiled | resistFire -2 | faithful |
| Overwatching | bonusDamage 2 onEnemyMelee [{"type":"attack","target":"attacker","description":"overwatch attack"},{"type":"removeStatus","statusName":"Overwatching"}] | faithful |
| Paralyzed | noActions true str -5 dex -5 | faithful |
| Petrified | noActions true immuneFear true immuneCharm true immuneStun true immuneSleep true immunePoison true immuneDisease true | faithful |
| Poison | onTurnEnd [{"type":"damage","amount":"=1d4","kind":"true"}] | faithful |
| Praying | toHit 1 saveVersusAll 2 bonusHealing 2 tempHp 10 | faithful |
| Hunting Prey | ac 2 onAttacked [{"type":"damage","description":"being a marked target","target":"self","amount":"=1d8","kind":"true"}] | faithful |
| Prone | noActions true dex -2 | faithful |
| Protected | resistNecrotic 0.5 immuneCharm true | faithful |
| Pure Strike | toHit 4 bonusDamage 4 onAttackHit [{"type":"damage","amount":"=2d6","kind":"true","target":"target"}] | faithful |
| Raging | toHit 1 bonusDamage 2 ac 3 | faithful |
| Rallied | con 2 toHit 1 saveVersusAll 1 | faithful |
| Reckless | toHit -2 ac 2 | faithful |
| Reflect | reflectDamagePercent 0.5 | represented |
| Riposting | evasion 3 ac 1 onMissReceived [{"type":"attack","target":"attacker","description":"riposte"}] | faithful |
| Scalded | allRolls -1 | faithful |
| Scaleskin | ac -8 resistFire 0.25 | faithful |
| Shielded | ac -1 tempHp 10 saveVersusMagic 1 | faithful |
| Armor Shred | ac 2 | faithful |
| Silence | noSpellcasting true | faithful |
| Slimed | resistAcid -2 | faithful |
| Slow | dex -5 initiative -10 extraAttacksPerTurn -1 | faithful |
| Soundproof | resistSonic 0.5 | faithful |
| Spellturn | reflectSpellChance 0.5 | represented |
| Eagle's Splendor | cha 2 toHit 1 | faithful |
| Steelskin | ac -10 resistPiercing 0.5 resistSlashing 0.5 | faithful |
| Stoneskin | ac -3 | faithful |
| Stormproof | resistLightning 0.5 | faithful |
| Bull's Strength | str 2 | faithful |
| Stunned | noActions true allRolls -2 | faithful |
| Sunmarked | saveVersusMagic -1 resistFire -0.25 resistRadiant -0.25 onAttacked [{"type":"damage","description":"being sunmarked","target":"self","amount":"=1d4","kind":"radiant"}] | faithful |
| Taunted | forceTarget you | faithful |
| Thirst | con -2 saveVersusAll -1 resistFire -1 | faithful |
| Time Stopped | extraTurns 3 triggerReactions false | represented |
| Time Walk | untargetable true ac -5 evasion 20 extraAttacksPerTurn 4 | represented |
| True Sight | seeInvisible true | represented |
| Vigorous | toHit 1 criticalRangeIncrease 2 con 2 tempHp 10 saveVersusAll 1 bonusDamage 1 | faithful |
| Vital Boost | con 4 tempHp 20 saveVersusAll 2 | faithful |
| Warded | saveVersusMagic 1 resistFire 0.15 resistCold 0.15 resistLightning 0.15 resistForce 0.5 tempHp =14 + 2 * #level | faithful |
| Waterproof | resistCold 0.5 | faithful |
| Weakened | str -2 bonusDamage -2 | faithful |
| Wildheart | toHit 2 bonusDamage 2 con 4 resistPoison 0.5 resistAcid 0.25 immuneDisease true | faithful |
| Owl's Wisdom | wis 2 saveVersusAll 1 | faithful |

### Difficulty tiers

6 in Orsino; 0 held by Kyr.

| Name | Ranks | In Kyr |
|---|---|---|
| 0 | peasant, grunt, untested | — |
| 1 | untested, rookie | — |
| 2 | seargeant, captain | — |
| 3 | veteran, champion | — |
| 4 | elite, paragon | — |
| 5 | epic, legendary | — |

### Dungeon kinds

5 in Orsino; 0 held by Kyr.

| Name | Shapes | In Kyr |
|---|---|---|
| Fortress | tower, keep, stronghold, citadel, bastion, redoubt, barbican, martello, outpost, fastness | — |
| Library | archive, vault, scriptorium, repository, bookhouse | — |
| Mine | cave, cavern, lair, delve, tunnel, hollow | — |
| Temple | fane, shrine, sanctum, reliquary, sanctuary, monastery, cathedral | — |
| Tomb | ossuary, cenotaph, crypt, catacomb, mausoleum, necropolis, sepulcher, charnel | — |

