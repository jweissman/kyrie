# D. Annotated interface specification

All sketches are **D — proposed product behavior**, not screenshots or implementation. Current-world examples use Reedwake, Skellfold and Red Crag. Zones, commitments and advancement need their new contracts. The [modality comparison](../../playtests/cold-2026-10-19/presentation-concepts.md) remains supporting research; this document chooses a baseline.

## 1. Hierarchy and persistent shell

~~~text
Campaign entry / create or resume
          |
          v
ADVENTURE <--> PARTY <--> NOTES
   |            |           |
   |            + condition / recovery
   |            + equipment / pack
   |            + character / advancement
   + person / conversation / social offer
   + feature / mechanism / pending intention
   + Map: site or region (temporary view)
   + travel / rest -> interruption or result
   + encounter / combat -> aftermath -> scene or Party
~~~

Three primary destinations. Map opens from location, route or note and returns there. Conversation, objects, rest and combat are Adventure states, not additional permanent tabs. Desktop may show one temporary inspection sheet beside the primary surface; no map + character sheet + inventory + log dashboard. Narrow screens replace the surface with the contextual view and a clear Back destination.

**Persistent:** campaign identity, current place/compact parent location, clock, urgent known pressure when relevant, compact party condition alert, three destinations, save/menu access and saved/pending state. In combat, current actor/round gains prominence but location remains. One personally pinned priority is permitted; opportunities do not become a task ticker.

**Contextual:** full map, all character statistics, enemy roster, dice calculations, inventory, conversation history, mechanism methods, development choices. Full party meters are useful in battle/recovery; they need not precede scene prose on a phone.

## 2. View responsibilities

| View/state | Purpose / essential information | Primary actions | Transitions / retention |
|---|---|---|---|
| Adventure | Place/layout, salient activity, known local concern, people/features and named ways/status. | Inspect noun; choose complete verb/route; open Map/Party/Notes. | Back preserves selected entity/scroll; movement anchors arrival and result. |
| Conversation/social | Speaker/activity, current exchange, relevant topics/offers, terms and source. | Select, preview, speak/offer/accept/decline/end. | Reply survives speaker departure. Acceptance updates commitment; reading is not payment. |
| Feature | Perceived state, methods, providers/tools, duration and known risk. | Choose method/actor/target, commit/cancel. | Result stays before next methods; map/scene share changed state. |
| Site Map | Topology, levels, known/visited/traversed, barriers, age/source. | Select node/edge, inspect, plan itinerary; switch Region. | Node selection never moves party. Explicit route commit only. |
| Region Map | Known sites, distinct itineraries, full duration estimates, requirements and knowledge age. | Compare/inspect/prepare travel. | Return to invoking scene/note; no remote room reveal. |
| Party condition | HP/mana, life state, effects/clocks, useful care and providers. | Inspect companion, select care/item/service. | Keep invoking aftermath accessible. |
| Party equipment | Owner/location, ready/stowed/equipped, bulk, uses and requirements. | Compare, equip/swap/transfer/use/cache. | Preview costs and ability changes; no drag-only operation. |
| Party development | Role, attributes, learned capability, progress and available choices. | Inspect/plan, commit eligible advancement. | Before/after and costs visible; no silent XP spending. |
| Combat | Place/stakes, known zones/targets, actor queue, threats, resources, latest causal exchange. | Choose action/target, commit; inspect; withdrawal/surrender. | Back cancels selection, never exits encounter. End opens aftermath. |
| Aftermath | Outcome/reason, casualties, resources, objective/world/social changes, left entities. | Review Party, details, next intention or scene. | Does not disappear on automatic transition; Continue itself costs no time. |
| Notes | Matters, discoveries, relationships, sources, active/resolved/stale states. | Inspect evidence, pin priority, map known place/history. | Pinning is not promise acceptance. |
| Travel/rest | Complete duration/cost/benefit/risk, actual progress/interruption. | Commit route/rest/wait, respond to interruption. | Stop at actual time/place; report spent vs unfinished costs. |
| Entry/resume | Campaign premise, company, compatible choices, saved summary. | Create/customize, resume/import/export. | Resume shows meaningful last state; invalid setup explained before Begin. |

## 3. Scene and conversation — desktop

~~~text
CAUGHT BELOW    Reedwake quay · Reedwake       Day 1, 8:10  [Saved] [Menu]
Find Pell · Wren expects culvert closure about 1:40                 [Notes]
-----------------------------------------------------------------------
Reedwake quay
Barges nose into reed-fringed piles. ... The shrine porch faces the water.
Wren watches the way toward Censer Hill.

[Optional collapsible illustration: no exclusive information or controls]

People   [Wren — ferry-keeper, waiting]
Ways     [Willow causeway · 1h] [Nera's shop · 10m] [Returning Oar · 10m]
         [Shrine · 10m] [Ferry house · 10m]                       [Map]

Latest exchange
Wren: "... the rising river will close it about 1:40 p.m. ..."
[Conversation details]
-----------------------------------------------------------------------
Party: Elen 7/7 · Bran 12/12 · Dori 12/12 | 14 coin · 1 ration    [Party]
[Adventure] [Party] [Notes]
~~~

Place is the reading anchor. Nouns inspect; route selection reveals itinerary/commit inline. A fully labelled direct route action may commit because its preview is already visible. Latest response is a retained event, not another copy of scene state. Actual prose is shortened only for the sketch.

Selecting Wren replaces local choices with conversation:

~~~text
WREN · ferry-keeper at Reedwake quay                      [Back to scene]
Wren watches the way toward Censer Hill.
Ask about: [Pell's absence]                         [Earlier conversation]
Selected: ask what happened · 10m                       [Ask Wren — 10m]

After rescue:
Wren: "You brought them back yourselves. I won't forget it."
[Actual authored handover text]
Shared purse 14 -> 20                                [Mechanical detail]
Then: Wren and Pell head toward the ferry house.
[End conversation] [View rescue note]
~~~

Keep the actual authored reply verbatim where available. Departing disables unavailable future topics, not the response. A service is a separate offer with benefit, price and time. An explicit request has Accept/Decline; selecting a topic is not accepting its terms.

## 4. Physical problem and spell selection

~~~text
HOIST ROOM · Censer Hill foundry                         Day 1, 11:40
Pell lies pinned beneath the rack. ... "Don't just haul on it."

TIMBER RACK · pinning Pell
[Lever using bar] [Dig beneath — 40m] [Heave — choose lifter]

Pending: lever rack; company uses carried pry bar
Time: 10m · Known: Pell warned against hauling
[Lever rack — 10m] [Cancel]

AFTER COMMIT
"You get a pry bar under the fallen timber rack ... Pell drags the leg clear ..."
10m passed · Rack propped · Pell hurt, can walk                [Details]
[Ask Pell to come with us] [Speak to Pell] [Other features]
~~~

No hidden outcome spoiler or invented success chance. Name a provider only if bound/recorded. A single-method object still opens inspection; a newly available method cannot change a pending selection or commit itself.

~~~text
Selected: Binding sleep -> Calder
3 mana · enemy target(s) in listed range; Wisdom save resists stun
Known: dragon alert; exact save modifier unknown
[Cast Binding sleep] [Other action] [Rule details]

RESULT
Elen casts Binding sleep. Calder resists it.
Elen mana 7 -> 4 · save total 13 vs difficulty 13          [Calculation]
Then: Calder bites Elen. ...
~~~

Result uses recorded totals; preview uses only known information. Do not narrate successful sleep when the save passed. Exact calculation includes every component, unlike current category-save display.

## 5. Site and regional maps

~~~text
MAP / Skellfold high quarry                              [Back to scene]
[Site] [Region]                     Connections, not to scale   [Legend]

Quarry floor -- adit mouth -- upper gallery
     |               \              | secured ladder
  Smithy          incline head -- lower gallery [YOU]

Selected: ladder shaft
Observed: secured with line at 10:50; traversed at 11:00
[Inspect passage] [Plan travel to upper gallery]
~~~

Level grouping must reflect actual containment; this sketch simplifies layout, not connectivity. Preserve passage identity, parallel ways and vertical transitions. Selecting map entities is free. Colour is supplemented with text/symbols. Undiscovered passages are not named question marks.

~~~text
REGION / Thrale Highlands                         [Site] [Region] [Back]
Known connections: Thrale-Gorge-Crag; Thrale-Pastures-Crag

RETURN TO THRALE
x Bridge: blocked. Destroyed, seen today 10:30.
+ Pastures: goat path 10m + scree 2h + pasture track 1h
  Normal total 3h 10m · rope required
  Casualties/load: [review carrying before departure]
[Inspect route] [Review party] [Prepare journey]
~~~

Route totals derive from actual legs; intended load/pace rules can change them. If unable to carry everyone, require a truthful choice, not silent body transport.

~~~text
TRAVEL INTENTION
To Thrale green via shoulder -> sheepfold -> pasture track
Estimate: 3h 10m before load adjustment [basis]
Known: bridge gone; alternative last traversed today
Supplies due: ...  Carrying: ...  Planned next stop: ...
[Begin journey] [Change itinerary] [Cancel]

During: actual leg/place/time and events
Interruption: stop at actual time/place; explain spent/unfinished costs
~~~

One leg or the displayed multi-leg journey may be committed. Replanning begins from actual current location. An encounter or changed requirement stops onward movement at its authored boundary; no teleport, free refund or traversal of a closed crossing.

## 6. Party, inventory, recovery and development

~~~text
PARTY                              [Condition] [Equipment] [Development]
Elen — mage     1/9 HP · 7/7 mana · fireproof: 10 wearer combat turns
Bran — thief    INCAPACITATED · 0/7 · last known location: ...
Dori — cleric   INCAPACITATED · 0/6 · last known location: ...

Care options: [actual eligible providers / items / services]
[Inspect Elen] [Plan rescue/carrying] [Nearby services]
Latest aftermath remains accessible                              [Back]
~~~

These intended life states replace inconsistent zero-HP/dead language; do not relabel an explicitly dead character as incapacitated. Show who can actually benefit from a service. Fallen companions left elsewhere retain those locations.

~~~text
EQUIPMENT / Bran
Weapon: ...    Ready: ...    Load: ...
Carried: rope; chapel bell (bulky); ...
Selected: Longsword of Flames [only if owned and identified]
  Piercing strike + fire rider; specific attack-roll technique
  Compare actual current abilities / requirements / costs
[Equip — declared cost] [Use/transfer] [Cache] [Back]
~~~

This is a UI pattern, not a claim Bran owns this blade in the Red Crag branch. Combat equipment changes show action cost. Give-to-companion does not substitute for an NPC handover verb. Identification and unknown magic remain explicit.

~~~text
REST / Ember Hearth
Bed and supper · 3 coin · 8h
Will restore: Elen's 8 missing HP and eligible mana
Will not restore: [specific ineligible state, with reason]
Food due/covered: ...  Known ongoing matters: reported dragon routine
[Take lodging — 3 coin, 8h] [Other recovery] [Cancel]
~~~

A healthy party sees no current recovery benefit but can still choose food/shelter/time deliberately. Never auto-buy. Interrupted recovery reports what occurred rather than inventing a cost guarantee.

~~~text
FORM A COMPANY / selected campaign
Actual campaign premise and starting settlement
[Balanced preset] [Customize]
1 Name · calling · background · ancestry
  Combat role / expedition capability / kit / visible condition
  Incompatible options disabled with a plain reason
2 ...  3 ...
Company capability coverage, no promise of universal solutions
[Review company] [Begin adventure]       Advanced setup [seed]

DEVELOPMENT / safe preparation point
Earned progress -> next level; available choices
Selected gain: effects, prerequisite, costs/time
Before/after comparison for selected companion
[Confirm development] [Plan for later] [Back]
~~~

No XP deduction, teaching, ancestry change or reroll occurs while browsing. Numerical development curves are a rules/content dependency, not values a builder infers from a sketch.

## 7. Focused combat and aftermath

Zones below are proposed new data; existing content must use an honest abstract encounter until implemented.

~~~text
VALVE CHAMBER · known stakes                            Round 2 / 12 sec
Queue: Sentinel [acted] -> BRAN [now] -> Elen -> Dori

KNOWN ZONES — newly authored, not inferred from prose
[Arch] -- [Floor: sentinel, Bran] -- [Control: Elen, Dori]
Committed threat: sentinel prepares Floor sweep on next turn

Bran 10/12 · Elen 4/4 · Dori 8/9, mana 2
Sentinel: damaged; physical resistance known; Guard until next turn

[Attack] [Guard/Protect] [Move] [Item/Feature] [Other]
Pending: Protect Elen — not eligible from this zone
Requires same-zone reach; moving first is a separate action.
[Commit eligible chosen action] [Cancel] [Rules]

LATEST EXCHANGE
Action -> actual attack/save -> damage/condition -> response
[Calculation] [Earlier exchanges] [Withdrawal / surrender if available]
~~~

An ineligible intention must explain reach; it cannot silently move the actor. Exact enemy HP is not universal knowledge: show condition bands/established traits, with an optional transparent rules mode if selected. Party resources are exact. In current abstract encounters, omit invented zone/cover/intent displays and label the model.

~~~text
AFTERMATH — withdrawal
Who withdrew, actual destination, enemy/world response
Bridge lost to dragon fire.
Casualties: explicit life states at actual places
Gear/resources changed; left entities and exposure
Unfinished: bell still in cave; reported routine remains relevant
[Review rescue/carrying] [Party] [Encounter detail] [Continue scene]
~~~

Use actual ending semantics. Full defeat shows cause, disposition, losses/world changes and history/save choices. It must retain the fatal opening action, not just say everyone died. Acknowledging aftermath costs no time.

## 8. Notes and resume

~~~text
NOTES                         [Matters] [Places/people] [History]
Pinned: player's chosen priority
Active / opportunities
  Bell — last seen at ...; bell-ringer's request [source]
  Dragon routine — Tobin's report [time / confidence]
Resolved
  Tamsin freed; returned alone; Marrit gave 3 coin [evidence]
Consequences
  Bridge destroyed, last seen ...; pasture alternative [Map]
[Inspect thread] [Pin] [Exact dialogue/event] [Map known place]
~~~

Types are illustrated across separate campaigns; a real save never mixes their events. Pinning is not accepting. Resolved matters archive without disappearing; last-known state does not become a live remote tracker. History may sort newest groups first, but each group's causal events remain in order.

Resume summary: place/time, party/casualties, latest significant result, pinned priority and known unfinished matters. Exports/branches identify active history. If old evidence cannot be reconstructed, say earlier details unavailable rather than nothing happened.

## 9. Narrow screen and input contract

At 390px, place/task/result come before full party meters. Bottom navigation has three destinations. Maps and sheets open full-screen with a clear Back context. A single pending commit bar may be sticky only with safe-area/scroll padding; it cannot cover choices/history. Map has pan/zoom and an equivalent connection list.

~~~text
REEDWAKE QUAY        8:10  [Menu]
Find Pell · culvert ~1:40  [Notes]
Party alert: Elen hurt     [Party]
--------------------------------
Scene / speaker and retained reply
People
 Wren — waiting          [Inspect]
Ways
 Willow causeway · 1h
 Nera's shop · 10m
 ...                       [Map]
--------------------------------
Selected route / risk / cost
[Walk to Willow causeway — 1h]
[Adventure] [Party] [Notes]
~~~

~~~text
COMBAT / crag ledge       Round 1
Calder -> ELEN [now] -> ...
Elen 1/9; two companions down
Threat / known-zone selector
--------------------------------
Latest causal exchange [expand]
Choose action
 Binding sleep · 3 mana
 Siphon life · 2 mana
 Retreat [destination preview]
Pending spell -> target -> effect
[Cast Binding sleep]
[Party detail] [Rules / history]
~~~

Tab/arrows select/preview; Enter/Space activates the focused explicit control. Number shortcuts select, not execute. New actor/list changes must not allow a held key to commit another action. Escape cancels pending choice, then closes context; never retreats/abandons. Hover is optional only. Touch actions have full readable label/time/cost and do not rely on right-click.

Use semantic headings/buttons, visible focus, text/symbol status, grouped screen-reader result announcements, text scaling and reduced motion. Expanded History is an explicit overlay with Close and focus management, not a strip intercepting an underlying Attack control as observed at N78. A single narrow screenshot does not certify touch/accessibility behavior; validate these separately.

## 10. Illustration and remaining alternatives

Optional art identifies/evokes a place. It cannot exclusively reveal actions, hidden exits, exact geometry or cover, or show an incompatible state as present reality. Use accurate captions/state variants, collapse or omit when misleading. Every function works with art disabled.

Test book-led scenes versus compact site graph for dungeon routing; enemy condition bands versus optional exact rules values; abstract versus feature-zone battle with identical facts. These are bounded alternatives, not permission to retain every panel. Review evidence before choosing production layout.
