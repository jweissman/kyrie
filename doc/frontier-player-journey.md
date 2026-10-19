# Saint Orra: a playable expedition loop

This increment starts with Saint Orra, rather than replacing it with a new game. The refuge accusation, poisoned water, missing expedition and watchtower remain connected. A northern margin adds a supply camp, alternative approach, altered wolf and winter shrine. The result has twelve places, authored connectivity, generated inhabitants and environmental parameters. It is a partially generated region, not a simulated economy or ecosystem.

## The design and the implemented journey

The concrete problem was that a player could execute commands without understanding their situation or seeing a reason to continue. The smallest coherent change connects three contracts: a scene projection, authored responses to ordinary actions, and useful persistent rewards. No new execution engine was introduced.

1. **Prepare.** Name three companions and choose ancestry/class through the existing DEEM creature constructor. Two editable examples explain ranger woodcraft and the three-ancestry Fellowship. Names, choices and seed enter the replay. The authored starting level remains authoritative.
2. **Arrive.** The location, changing description, people, discoveries and contextual actions dominate the page. Ask Mere about the accusation and Ys about her expedition. Travel is listed in words; the map is secondary.
3. **Investigate and commit.** Topics give motives and alternatives. Existing examination and communication rules move information between actors. The player can clear Tamsin, investigate the tower, support other concerns or leave.
4. **Spend and recover.** Battles use the canonical store and existing ability machinery. Field healing uses the same effect executor and costs mana. Safe recovery costs one shared ration and six hours, during which NPCs and pressures continue. Shelter must still be safe at completion. Death is permanent under rest.
5. **Acquire a useful reward.** Ys's one-use cinder seal teaches one chosen companion a permanent fire invocation and grants 40 XP. It is an actual consumable world object, not a claim that Ys knows every granted spell. The invocation is useful against the northern wolf's fire vulnerability; XP alone does not implement leveling.
6. **Choose another expedition.** Buy finite rations, learn the shepherds' ledge, fight or bypass the wolf, dismantle the ice-pump, take finite salvage or abandon the site. Killing the guardian does not stop the frost. Stopping the pump after the camp freezes does not repair it.

The two demonstrated created parties are ranger/fighter/cleric and thief/fighter/magic-user. The former gains woodcraft and institutional Fellowship access; the latter has different combat and information capabilities. These are Kyr adaptations, not an assertion of complete Orsino class/ancestry compatibility.

## Authoritative boundaries

- DEEM constructs and freezes instances through nested templates, inherited contexts, tables and overlays. The fen/pine contexts change place names, weighted guide ancestry, supply quantities, beast level and pressure timing. The route topology remains authored.
- Kyr declares relationships, topics, discovery sources, permissions, rules and pursuits. `Person` constructs canonical creatures and controllers at assembly; it is not a second creature model.
- `Topic` lowers to a co-located, living-actor ordinary action with a response and explicit effects. It takes one tick. Conditional responses do not implement unrestricted dialogue or persuasion.
- `Result` becomes an action response. Player feedback combines that response with observable before/after projections and witnessed resolution events. It does not narrate a global state diff.
- The browser and CLI execute the same campaign, action executor, scheduler, combat and CreatureStore. Browser asset discovery replaces manual per-content imports. The developer workbench remains separate.

### Time and lifetime policy

| Operation | Fictional duration |
|---|---|
| Internal tick | 10 minutes; campaign begins Day 1, 8 a.m. |
| Ordinary travel, topic, examination | authored ticks, normally 10 minutes |
| Encounter | one campaign tick; combat rounds are local resolution |
| Safe recovery | 36 ticks / six hours |

The normal interface shows dates/times and elapsed durations, not unexplained watches. Ordinary combat cooldowns reset at encounter entry. Persistent conditions retain their explicit combat-turn duration across encounters; poison is **not** a world-time disease simulation. Recovery removes bleeding, restores living companions' HP/mana, and retains poison and other unremoved conditions. It never revives a dead companion. Shelter failure during recovery consumes elapsed time and the ration without healing.

## What actually changed for an author

See [the source-package account](authoring/frontier-package.md). The new site is authored in [margin.kyr](../data/frontier/margin.kyr), with small reusable generation definitions and a bundle. It needs no scenario-specific TypeScript. Existing Saint Orra construction is retained through additive source arrays, rather than a risky rewrite. Automatic person construction, member bindings, ability bindings, action permissions and browser asset discovery remove several manual synchronization points.

## Evidence and limits

[Recorded histories, screenshots and task evaluation](playtests/frontier/README.md) distinguish actual browser play from headless experiments. [Compatibility](orsino-compatibility.md) distinguishes reused mechanics from adaptations and omissions.

This is a working preparation–expedition–reward–recovery–expedition loop, not evidence of enjoyment. There has been no independent first-time human test. Discovery often grants a complete, trusted conclusion; the second expedition still resembles a guardian-and-mechanism puzzle. Salvaging coins one at a time is tedious. Arbitrary NPC assistance, bargaining, hostile field magic, equipment progression, recruitment and full Orsino advancement remain unsupported. Descriptions of livelihood and sickness exceed the implemented economic/medical simulation. These are the next play-design constraints, not reasons to add an unrestricted narrator.
