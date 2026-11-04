Westernesse already has the foundation of a distinctive expedition RPG. Its strongest material is not its quantity of rumors, destinations, or generated objects. It is the way a place remembers the player: wounded enemies remain wounded, corpses are moved, traps stay spent, barricades stay broken, pumps change flooded spaces, light burns down, and a failed expedition can be resumed rather than reset.

The current build too often hides that strength behind interface exhaustion. Discovery is frequently performed by exhausting buttons rather than interpreting the fiction. Known travel is repeatedly interrupted without producing a new decision. Combat sometimes continues after its tactical question has been answered. Loot simultaneously awards large amounts of money and experience, rapidly trivializing the field economy.

The creative priority should be: **fewer, clearer, more consequential expedition decisions**. The game does not need more content density. It needs stronger hierarchy, clearer causality, and an economy that preserves pressure after the first successful delve.

## Scope of this review

The playthrough covered the family/drover arc, Neblalac, several settlements and merchants, the road toll, recruiting and training surfaces, and a prolonged Ruberport expedition through the Delvers' hall and sealed stair. The party reached level 2, retreated from Ruberport twice, recovered a downed companion twice, depleted a lantern and torch, restarted the mine pump, and returned to town with expedition loot.

The review concentrates on economy, boredom, navigation, attrition, progression, and dramatic hierarchy.

## What is already working

### Persistent expedition state

This is the game's clearest identity.

- A mud elemental retained its remaining HP across two retreats.
- Dead spiders were later described as dragged aside and picked over.
- A barricade, an arcane glyph, and a hidden switch remained cleared.
- Restarting the bucket-chain changed the flooded stair's description.
- A lantern burned dry underground; a spare torch and later a candle became necessary.
- A downed companion required retreat and a system-shock roll at the next rest.

These events make retreat feel like part of play, not failure followed by reloading.

### Object-based problem solving

The best interaction in Ruberport was the arcane glyph. Close inspection revealed how it functioned, and the ten-foot pole allowed it to be triggered safely. The hidden pump-room switch eventually supported the same solution. This creates a satisfying chain:

> observe the fiction -> infer a risk -> apply carried equipment -> permanently change the location

This should be the template for exploration.

### Tactical combinations

The sacred pale pack fight supported readable combinations: Guard protected an injured companion, Second Wind used that protection window, Sweeping Strike exposed armor, and Cleave converted setup into a kill. That combat involved decisions rather than merely repeated attacks.

### Advancement choices

Level-up developments such as Mending, Digging, and Persuasion are more interesting than numerical bonuses because they promise new verbs. Persuasion immediately unlocked an inn performance that earned 5 coin. This is the right direction for progression.

## Economy

### The field economy collapses after one delve

Observed prices and rewards:

| Item or service | Value |
| --- | ---: |
| Ration | 2 coin |
| Torch or candle | 1 coin |
| Bed and supper | 3 coin |
| Training lesson | 25 coin |
| Ring mail | 25 coin |
| Fine longbow | 120 coin |
| Stolen chalice | 24 coin + 12 XP each |
| Music box | 50 coin + 25 XP each |
| Delver's silver lamp | 24 coin + 12 XP each |
| Ancient map | 75 coin + 37 XP each |
| Lump of star-iron | 30 coin + 15 XP each |

The last three objects from Ruberport produced 129 coin and 64 XP for each character. The party's cash rose to 191 coin. At that point:

- sixty-three nights at an inn are affordable;
- ninety-five rations are affordable;
- ordinary armor and most weapons are negligible purchases;
- a 25-coin training lesson is no longer a meaningful sacrifice.

The promised main reward is 1,980 coin. Unless a separate high-level economy appears immediately, that payment will erase the price system entirely.

### Selling loot awards both currencies

Treasure yields coin and approximately half its coin value in XP. This is a powerful positive feedback loop:

> successful delve -> more equipment and recovery money -> XP and levels -> easier delve -> more treasure

It also makes selling nearly universal. Keeping a historical map, strange lamp, sentimental object, or unusual material must compete against both money and advancement.

#### Recommendation

Separate the rewards:

- Award XP for recovering, identifying, returning, donating, or making a consequential decision about an object.
- Award coin only when it is sold.
- Let different recipients create different outcomes: a scholar provides lore, a faction provides standing, a craftsperson unlocks an item, and a merchant provides cash.
- Reserve XP from sale for explicitly mercantile or criminal characters.

The choice should be **what this object becomes**, not whether the player accepts two rewards at once.

### Create economic tiers

The game needs expenses above food and beds.

1. **Field economy:** food, light, medicine, tolls, beds.
2. **Expedition economy:** retainers, pack animals, repair, rope replacement, specialist tools, guides, maps, recovery of downed characters.
3. **Domain economy:** claims, workshops, faction payments, patronage, construction, and major training.

Illustrative prices could place a pack animal around 60-100 coin, a specialist at 10-25 coin per expedition, equipment repair at 10-30 coin, and a permanent workshop or claim in the hundreds. The exact figures matter less than ensuring treasure opens new decisions instead of merely buying decades of rations.

### Rest and food are interesting but opaque

The underlying model appears to charge food on a daily or long-rest cadence, not every time the Rest button is pressed. Several same-day rests restored HP without consuming a ration; a later six-hour rest consumed one. Waiting until dark also consumed food. At zero rations, a long wait produced no immediate visible consequence.

This may be coherent internally, but the player cannot predict it.

#### Recommendation

Show a small expedition ledger before time-consuming actions:

> Rest six hours  
> Expected: +recovery, 1 ration if this crosses the next meal, 6 hours, rival expedition may advance

Also show a persistent state such as `Fed until dawn`, `Hungry`, or `Next meal in 5h`. The player should be able to plan rather than reverse-engineer the ration clock.

### Money alternatives become flavor too quickly

The inn offered several good alternatives: pay 3 coin, work three hours, or use Persuasion to perform for an hour. This is excellent when the party is poor. At 191 coin, the alternatives are dominated by simply paying.

Time-based alternatives should offer something money cannot fully replace: contacts, rumors, reputation, a recurring audience, or access to work. Otherwise they expire as systems after the first treasure sale.

## Boredom and pacing

### Search is functioning as an interface tax

Repeated examples showed `You find nothing out of the ordinary` while the action nevertheless exposed coins or changed the available object list. Other searches labeled `where your aim is` produced no result. This teaches the player to click Search everywhere while distrusting its prose.

#### Recommendation

Give searches one of three explicit outcomes:

- **Discovery:** name what was found and why it was missed before.
- **Information:** reveal a clue, safety assessment, or absence that changes a decision.
- **No search needed:** if an object should be automatically visible, surface it without a button.

Do not consume a search action while reporting that nothing happened if the state changed.

### Combat sometimes outlives its decision

The mud elemental reached 1 HP and then survived numerous low-accuracy attacks while continuing to act. The strategic outcome had been decided; play became repeated clicking and random delay. Similar, shorter stalls occurred when high-probability attacks missed repeatedly.

#### Recommendation

- Add enemy morale and surrender/withdrawal.
- Allow an `End it` or `Press the advantage` resolution when the remaining enemy is helpless or overwhelmingly outmatched.
- Give near-death states mechanical consequences, not just labels.
- Ensure advertised vulnerabilities have accessible answers in the expedition's equipment or environment.
- Consider bounded bad-luck protection for repeated basic misses.

### Known travel is insufficiently compressed

A planned route from the deepest explored mine level to Gothdum contained roughly fourteen segments. Travel stopped at previously known bats, rats, and the shift-boss. After each interruption, the player had to locate the real route among duplicated labels or reopen `Every way`. The destination sometimes remained in the background but was not presented as a simple continuation.

This is not tension unless the obstacle creates a new decision. Passing the same non-attacking rats for the fourth time is clerical work.

#### Recommendation

For known routes, provide:

> Continue to Gothdum - 4h 30m  
> Known hazards bypassed: bats, rats  
> Stop for: new danger, depleted light, injury, discovery, or player-set waypoint

Let players opt into `Travel cautiously` if they want every intermediate stop. Preserve the itinerary across interruptions and make the continuation button unambiguous.

### Rumor and destination abundance lacks hierarchy

The Notes page listed roughly thirty destinations with identical `Set out` treatment. The innkeeper similarly offered more than twenty rumor topics at once. This communicates abundance but weakens desire: everything is presented as equally actionable and equally important.

#### Recommendation

Organize Notes into:

- **Current expedition** - one primary objective and its immediate dependencies.
- **Nearby opportunities** - three to five geographically relevant leads.
- **Rumors** - collapsed by region or theme.
- **Archive** - resolved and historical information.

Allow the player to pin one aim and two secondary leads. NPCs should initially volunteer only the rumors relevant to their personality, present events, or the player's demonstrated interests.

## Navigation and interaction design

### P0: drained-stair progression softlock

Reproduction:

1. Reach the flooded foot of the sealed stair.
2. Use `Search here` before restarting the pump. It reports nothing and disappears.
3. Find the pump room, restart the bucket-chain, and return.
4. The description correctly changes from black water to a drained floor of grey silt.
5. No onward route and no renewed Search action appear.
6. Reloading and waiting do not repair the state.

The most likely cause is that a one-shot discovery flag was consumed before its environmental prerequisite changed.

#### Recommendation

- Key searches to world-state versions, not only locations: `foot_stair: flooded` and `foot_stair: drained` should have separate discovery states.
- When an environmental state changes, invalidate or re-evaluate dependent exits.
- Never require a one-shot action that can be consumed before its prerequisite.
- Add an automated quest-path test that performs relevant actions in adversarial orders.

### The pump room was hidden behind the wrong disclosure layer

The main location view showed two entries both called `The pump-room`. Clicking them appeared inert. Expanding `Every way` finally revealed a section called `The hidden switch` with `Look closely` and `Prod it with the pole`. Close inspection then unlocked the safe pole solution.

The underlying interaction was good; the route presentation concealed it.

#### Recommendation

Replace duplicate destination labels with stateful verbs:

- `Inspect the trapped way to the pump room`
- `Risk the hidden switch`
- after inspection: `Trigger the vine snare with the pole`
- after disarming: `Enter the pump room`

Critical-path interactions should never exist only in a secondary all-routes sheet.

### Duplicate labels routinely select the wrong action

Locations often displayed several identical names representing travel, inspection, remembered features, or alternative interactions. At the head of the winze, two `The crossing` entries were actually inspections of different objects; the real route appeared only inside `Every way`. `Out to the country` could mean resume a journey, open the map, or leave locally.

#### Recommendation

Every button should state a verb and consequence:

- `Travel to the crossing`
- `Inspect the hidden switch toward the crossing`
- `Resume journey to Gothdum`
- `Open the world map`
- `Leave Ruberport`

Destination nouns alone are insufficient once a location supports several interaction types.

### Important actions are gated by schedules without advance notice

The innkeeper and ration shop appeared only at night. Arriving in the morning could require waiting thirteen hours to buy provisions. Scheduling can make a world feel alive, but the player needs to know where and when an essential service is available.

#### Recommendation

Show merchant hours in location information and offer alternatives: buy travel food from a chandlery, ask where the innkeeper is, leave an order, or pay a premium to wake someone in an emergency.

## Progression and difficulty

### Level 2 creates a large discontinuity

Harbek rose from 17 to 32 HP and Fargrim from 15 to 22 after one inn night. Threat assessments changed dramatically. Yet double enemy actions and low hit rates could still down Fargrim, making difficulty feel volatile rather than smoothly escalating.

Large HP jumps also risk making field supplies irrelevant immediately after leveling.

#### Recommendation

- Flatten HP growth and place more advancement value in skills, techniques, resistances, and new options.
- Show initiative order and explain why an enemy sometimes acts twice between player turns.
- Preview Guard's actual interception window in the current initiative order.

### XP arrives in large, accelerating bursts

Examples included 182 XP each for two spiders, 932 each for the sacred pale pack, and 332 each for ordinary cave hounds. Treasure then adds more XP on sale. After reaching level 2, the party moved rapidly toward level 3 during one mine expedition.

#### Recommendation

Choose an intended number of meaningful expeditions per level and budget XP backward from it. If levels are meant to be fast, reduce the numerical discontinuity. If levels are meant to be major, reduce combat and sale XP.

### Training is currently opaque

Hulda advertises lessons for 25 coin. Selecting Train reveals `Dodge` and `Riposte` without descriptions, eligibility, recipient, or confirmation. Selecting Dodge merely collapses the menu without feedback or purchase.

#### Recommendation

Training should show:

> Dodge - 25 coin - Harbek  
> Requirement: Dexterity 13 (Harbek has 12)  
> Effect: once per 3 turns, improve defense against one attack

If unavailable, keep it visible with the unmet requirement. If available, preview the permanent change and request confirmation.

## Time pressure and the rival expedition

On Day 3 the party heard that six of the castellan's people had left for Ruberport at first light with picks, rope, and a mule. By Day 9, after multiple rests and retreats, the journal still contained only that original rumor. Their chalk mark appeared deep in the mine, but the prolonged delay had no visible strategic consequence.

This makes time pressure feel theatrical. Because resting is powerful and relatively cheap, the correct play is to rest whenever hurt.

#### Recommendation

Give the rival expedition a visible state machine:

- Day 3: they enter Ruberport.
- Day 4: signs of their camp and opened routes.
- Day 5: a survivor, a warning, or evidence they took treasure.
- Day 6+: they reach or disturb the objective, split, become trapped, or bargain with the player.

Update Notes with current evidence and use environmental changes rather than invisible failure timers. Delay should transform the story, not simply fail the quest.

## Prioritized improvement backlog

### P0 - blocks or invalidates play

1. Fix the drained-stair softlock and add state-order tests.
2. Ensure every critical route is accessible from the primary location view.
3. Replace duplicate noun-only route labels with explicit verbs.
4. Add item comparison and recipient confirmation before purchases; the current direct-purchase flow allowed buying inferior chitin armor without a comparison.

### P1 - preserves tension and reduces boredom

1. Rebalance treasure against field costs and separate sale XP from coin.
2. Add expedition-scale and domain-scale money sinks.
3. Compress travel along known routes and preserve itineraries through interruptions.
4. Make Search outcomes truthful and re-evaluate searches after world-state changes.
5. Add enemy morale or a fast resolution for strategically finished combats.
6. Surface ration timing, rest costs, light duration, and schedule constraints before committing time.
7. Make rival progress visible and consequential.

### P2 - strengthens hierarchy and expression

1. Reorganize Notes into current, nearby, rumor, and archive layers.
2. Curate NPC rumor menus according to character and situation.
3. Flatten HP growth and emphasize verb-granting developments.
4. Add descriptions, prerequisites, and confirmation to training.
5. Give important treasure multiple destinations and transformations beyond sale.

## A proposed target experience

A healthy Ruberport loop would look like this:

1. The player buys provisions while seeing an estimated expedition duration.
2. Known travel compresses to the mine entrance, stopping only for a new event.
3. Inside, observation exposes hazards and alternative preparations.
4. Tools and skills solve some dangers; combat and wounds consume others.
5. Retreat remains viable, while time visibly advances the rival expedition.
6. Recovered objects create competing rewards: cash, knowledge, faction standing, or equipment.
7. Returning to town opens meaningful purchases at several economic scales.
8. The next expedition begins with a changed mine, not merely reset enemies.

That experience is already latent in the build. The goal is to remove the interface and balance structures that obscure it.