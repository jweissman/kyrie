# Mission 20: external review and mitigations

**Status:** post-mission synthesis, 12 November 2026. This is not a new commission, an acceptance report, or a claim
that the findings below were previously unknown. It is a read-only review of the creative vision, Mission 20 records,
and cold rounds 1–11, followed by proposed mitigations for the recurring classes of failure.

The review was made after Mission 20's implementation cutoff. Several concrete examples below were subsequently fixed
in E190–E214. They remain evidence for a class of problem; they are not reopened as present defects. The handoff and
open register remain authoritative about what is currently done or open.

## Conclusion

The intended game is already visible in isolated sequences. It is strongest when several systems converge on one
particular situation: a person supplies partial knowledge; money, a companion, a calling or a tool changes what can
be attempted; a place can be learned; the outcome alters what is possible afterwards. The bard's quarry expedition
in round 11 and the circus around Wapshott are examples.

It is weakest when the same systems present inventories without a causal composition: a row of people with one topic
each, a list of aims related only by a place-name, a journey that selects a destination but offers no passage, or a
physical verb that ends in a generic refusal. The recurring risk is therefore not chiefly insufficient content. It is
that the page makes a promise which the state, content or presentation cannot keep intelligibly.

The most useful mitigation is a common contract for those promises, applied to aims, signals, people, tools, danger
and consequences. The second is to model an undertaking as purpose, evidence and leads, rather than as a route into
successively deeper places. The third is to budget the player's attention at a scene instead of treating every valid
piece of content as equally ready to present.

## What this review corroborates

These are established Mission 20 findings, not new discoveries.

1. **Composition, not scarcity.** The opening-design checkpoint already names the common fault: everything is
   present at once and at one weight. The first-steps integration gives a measured example: four more standing people
   add roughly 170–190 words to the first green, and a newcomer reaches the lead in 46 commands instead of 24.
2. **People are the strongest material.** Every round praises particular conversations and the players' company.
   It also repeatedly meets selectable people who have only one quip, no response to what just happened, or nothing
   to say.
3. **Guidance must be trustworthy.** Gold, coloured signals and aim identity received extensive work during M20.
   Rounds 9–11 still found cases in which gold led beyond the evidence sought, back out of a site, or to an empty
   niche. E190, E194 and E197 fixed those cases.
4. **Difficulty needs warning, agency and an honest account.** The early rounds found trivial fights and unreliable
   summaries. Later rounds found tense fights, but still caught incorrect loss totals, misleading forecasts and
   essentially free recovery. E191 and E214 fixed two concrete causes.
5. **The visual and spatial account must agree with state.** Reused paintings contradict time, weather, light and
   architecture; maps have misplaced a company inside a site; narration has been told where the company could not
   witness it. M20 fixed parts of each class, not the class as a whole.
6. **Human acceptance is still absent.** Eleven cold rounds were agent play. Their agreement is useful diagnostic
   evidence, not PD-14 acceptance.

## The promise contract

Any prominent presentation is a promise: a gold act, a coloured pip, a portrait, an enabled physical verb, a danger
forecast, a stated consequence, or a character-specific opportunity. Each should answer the same questions from
typed state.

| Part | Required answer |
|---|---|
| Source | What fact, perception, aim, capability or event caused this to be presented? |
| Offer | What does the page say the player may learn, change, obtain or risk? |
| Preconditions | Why is it legal now, and what relevant limitation is known? |
| Resolution | Which typed event records success, failure, refusal or interruption? |
| Account | What did the player learn about why the result occurred? |
| Continuation | What became possible, impossible or newly relevant afterwards? |

The contract does not require every attempt to succeed. It requires failure to update the player's understanding. A
crowbar that cannot open a door should teach that its strap passes through the stone, that the hinges are exposed on
the far side, or that greater leverage is required. A generic "nothing gives" terminates the plan without making the
world more intelligible.

### Mitigation P1: carry provenance through presentation

Extend a promoted or marked act's typed projection with enough provenance to inspect why it is present. The exact
shape belongs to the existing model, but conceptually it needs:

```text
promise:
  source: followed aim | perceived aspect | capability | held object | relationship | event
  source id
  offered change: learn | move | alter | exchange | recruit | confront | recover
  target ids
  expected resolution kinds
```

This should be diagnostic data first, not prose shown to the player. A development view can answer “why is this gold?”
or “why does this likeness have a blue pip?” without reproducing the state by hand.

**Acceptance:** for every foreground act and every non-neutral signal in four reference worlds, the diagnostic names
one source, one target and at least one legal resolution kind. No presentation role is derived from its label.

### Mitigation P2: make promises survive the opening act

Turning to a person, opening Look, entering Trade or opening Go must not consume the fact that caused the container to
be marked. E185 fixed this for a conversation by preserving the led state. Apply the same invariant to every
container: the marked inner act remains present, marked and in view until it is taken, becomes unavailable for a
typed reason, or the underlying world state changes.

**Acceptance:** open each marked container, take an unrelated act, close and reopen it. The promised act remains in
place; if it vanished, the trace names the state change that withdrew it.

### Mitigation P3: maintain a false-promise corpus

Every cold-play occurrence of “Nothing to say,” an empty marked container, a vanished promised reply, an inapplicable
tool, a spent gold waypoint, or a forecast/account disagreement becomes a small replay fixture. Classify it by the
contract part that failed rather than by the page on which it appeared.

The corpus should be cheap enough to run as a recurring diagnostic. It is complementary to the gold walker: the
walker proves progress along a policy; the corpus proves that a particular promise remains honest across changes.

## Undertakings: purpose, evidence and leads

The rounds expose a limit in treating an aim's next step principally as a place or way. “Find what became of your
sister at the ruined keep” may concern the keep, but going deeper into it is not necessarily progress. The relevant
act may be to search the door where she was last seen, ask the witness again, read a trace, or conclude that no lead
is presently known.

Several undertakings may also share a place without being duplicates: find a sister in Albustagn; find the springs
beneath Albustagn; learn who built Albustagn. Their geography is shared; their purposes and evidence are not.

### Mitigation U1: distinguish destination, lead and route

- A **destination** is a place believed to concern the undertaking.
- A **lead** is an act expected to produce evidence or change the undertaking.
- A **route** is the present sequence of movement needed to reach that act.

Gold should belong to the lead. Route presentation may inherit the gold while it is the only way to reach that lead,
but it should retain the lead as its explanation. Entering a named site is not evidence by itself and should not cause
the system to choose an arbitrary deeper way.

When no lead is known, say so. An honest “No further lead is known” preserves mystery and invites inquiry; invented
forward motion teaches the player to distrust gold.

**Acceptance:** in the dead-man's-map and lost-sister openings, the diagnostic at every gold step names the same
outstanding evidence or effect until it is obtained. No deeper way becomes gold merely because it is deeper or lies
inside the destination.

### Mitigation U2: give evidence identity and provenance

An undertaking should record what is known, who or what taught it, and which question it bears on. This permits Notes
to distinguish:

- a report not yet verified;
- an observation made by the company;
- an inference from several observations;
- a completed effect in the world;
- an unresolved contradiction.

This would prevent a player’s own deed being filed as something the pedlar told them, and lets the Book explain why
two undertakings at one place remain distinct.

**Acceptance:** the Book can render the source of each next lead without parsing its prose; two aims sharing a place
remain separate; completing evidence for one does not advance the other unless the evidence explicitly bears on it.

### Mitigation U3: show related undertakings without merging them

Group undertakings by a typed shared person, place, object or event. A small nested presentation is sufficient:

```text
Albustagn
  Find what became of your sister — last known at the door
  Learn whether the old springs survive — rumoured below
```

This removes apparent duplication while preserving the possibility that one discovery advances several purposes.

## People as participants

The best conversations disclose actionable knowledge, change a relationship, make or answer a request, or enable an
act elsewhere. A selectable portrait with no such possibility reads as a broken promise, especially immediately
after the player helped that person.

### Mitigation C1: an interaction contract for foreground people

For every person promoted into the foreground, answer in data or derivation:

1. Why are they foregrounded now?
2. What can change by addressing them?
3. What will they remember about the exchange?
4. Under what condition will they have something new to say?

People with no present exchange remain part of the scene and prose but need not be selectable. “Nothing new for now”
is suitable for a known person whose exhausted relationship matters; it should not be the first response from a
stranger or someone the player just affected.

**Acceptance:** every promoted likeness opens on at least one act matching the reason it was promoted. After a road
meeting, the met person recognizes the outcome at their next meeting, even if only in one line.

### Mitigation C2: capabilities transform situations, not just labels

For the reference expedition, make a small matrix of calling/background capabilities against situation facets. A
bard at a stranded company might perform for hospitality, recognize a professional quarrel, mediate, exchange news,
or notice that a public account is rehearsed. A scribe may distinguish hands, copy a fragile inscription or notice an
erasure. These do not all need bespoke outcomes; they need shared capability verbs with authored consequences where
the situation is important.

**Acceptance:** two ordinary starting characters take the same undertaking and differ at three consequential points:
information obtained, preparation possible, route or resolution. The difference must be visible in the resulting
state, not only in flavour prose or odds.

## Attention as a finite resource

The first-steps measurement demonstrates that correct additional content can make the opening worse. Visibility
therefore needs a budget independent of how much content is valid.

### Mitigation A1: scene attention budget

For the first scene and other high-density arrivals, compose at most:

- one immediate situation;
- two secondary curiosities;
- one presently relevant recruitment or service opportunity;
- one legible way toward practical work;
- up to four foreground acts, as M20 already moved toward.

Everything else remains available through People, Look, Go, time, conversation and return visits. The budget governs
promotion, not world existence.

**Acceptance:** adding a standing module does not increase the first green's foreground people, acts or word count
unless it displaces something by an explicit priority rule. A composition diagnostic records what was deferred and
why.

### Mitigation A2: priority from pressure and readiness

Rank material by:

1. immediate pressure or change in the scene;
2. bearing on the followed undertaking;
3. a capability the company can use now;
4. a relationship or event changed since the last visit;
5. novelty to the company;
6. ambient availability.

Do not rank a receipt, notice or person first merely because the module was integrated later or has a valid act.

## Travel as a decision

Repeated three- to seven-hour journeys pass instantly and reveal little. Adding an encounter roll to every hex would
increase incident frequency without necessarily producing the practical art of adventuring promised by the vision.

### Mitigation T1: a departure reckoning

Before commitment, show from authoritative journey data:

- route and terrain;
- expected duration and arrival light;
- rations and other certain costs;
- known exposure or danger;
- relevant company knowledge;
- meaningful route alternatives.

Example:

```text
Neblalac — about seven hours
Across open fields and the Mistshaw road; arrive near dusk
Two people: two rations
Krex knows a safer ford
```

**Acceptance:** preview, animation/account and arrival agree on route, duration, cost, light and company position.
The player can distinguish consulting a route from setting out.

### Mitigation T2: interrupt only for a decision or material event

A hex may reveal landscape without stopping. Stop when the company can choose: camp before dark, investigate a sign,
take a safer route, spend a resource, avoid known danger, aid someone, or press on under a cost. An uneventful journey
may remain uneventful, but it should still account for what was crossed and reveal what ordinary passage would show.

**Acceptance:** a reference journey of several hexes produces a concise passage account and reveals its traversed
landscape. Injected events cannot stop the journey unless they offer an act, impose a typed consequence, or change
the route.

## Danger and recovery

Win rate alone is not a sufficient measure of fair old-school danger. A good fight requires stakes, a useful
forecast, agency before and during it, and an accurate account afterwards.

### Mitigation D1: expand the combat diagnostic

For each first-hour band against ordinary starting companies, record:

- win, retreat and incapacitation rates;
- chance of incapacitation before the character's first act;
- turns and resources spent;
- harm by target and probability of reaching a fragile rear member;
- the effect of formation, one relevant item, and one relevant spell or capability;
- recovery time and cost;
- forecast category versus the outcome distribution.

The diagnostic should report distributions, not use them to auto-scale encounters. Its purpose is to identify bands
whose authored warning, composition or available counterplay does not match their actual danger.

**Acceptance:** every first-hour danger category has defined outcome bounds and a calibration case. A material change
to combat constants shows which bands cross a category boundary.

### Mitigation D2: reconcile every fight from events

The opening forecast, fight log, turning-point narration and “what it cost” summary must be projections of the same
typed events. No separate calculation may say damage, remaining harm or outcome in different terms.

**Acceptance:** property tests over simulated fights reconcile starting and ending HP, conditions, resources, deaths,
experience and spoils exactly. The prose may omit events but cannot contradict the ledger.

### Mitigation D3: make recovery part of expedition cost

Review at-will healing, resting and condition expiry together. If harm can be removed between every fight without
time, supply, prepared capacity or exposure, expedition attrition disappears and only sudden defeat matters.

This need not make recovery punitive. A heal may cost time, consume a daily use, require safety, spend a supply, or
risk interruption. The page should preview that cost.

**Acceptance:** after each calibration fight, the diagnostic reports the cheapest legal return to effective health.
That cost is neither zero for every company nor so high that ordinary success ends the expedition by default.

## Pictures as evidence

In a game where light, weather, terrain and material conditions matter, a literal-looking painting is part of the
player's evidence. A sunny inhabited castle cannot safely stand for a broken keep in a storm without signalling that
the image is only an illustration.

### Mitigation V1: compatibility before specificity

Give a painting typed compatibility claims where relevant: interior/exterior, day/night range, weather tolerance,
place kind, depth, inhabited/ruined and light source. Select in this order:

1. a compatible specific painting;
2. a compatible generic or deliberately abstract plate;
3. typography and atmosphere without a painting.

A missing image is preferable to a confident contradiction. Dimming can reconcile outdoor time of day, as E207
began, but cannot turn a drawing room into a mine shaft or an intact palace into a ruin.

**Acceptance:** a rendered census reports every visible state contradiction. The reference hour has none for time,
light, interior/exterior, ruin/inhabited and site kind.

## One exemplary expedition

The mitigations above should be proved together in one compact expedition rather than dispersed across unrelated
fixtures. The hobs' toll-house is a stronger candidate than the cellar rats because it already contains parley,
stealth, force, a captive, a material weakness, alternate access, treasure, history and consequences in town.

The slice should demonstrate:

1. a particular human or strange reason to care;
2. partial information from more than one source;
3. a preparation decision that changes the expedition;
4. a place whose geography and inhabitants can be learned;
5. at least three resolutions, not all combat;
6. an honest return account and visible local consequence;
7. a new undertaking made possible by the outcome;
8. two character builds whose capabilities change the course.

The acceptance question is:

> Can a player form a plan from evidence, execute it using the particular person and resources they chose, and
> recognize the resulting change without understanding the implementation?

A replay should assert the typed facts. A rendered journey should confirm that the facts were perceptible. Cold agent
play should test policies the builders did not script. PD-14 alone decides whether people understand and enjoy it.

## Suggested sequence

1. Add promise provenance and the diagnostic view; begin the false-promise corpus.
2. Separate destination, lead and route for the exemplary expedition.
3. Give its foreground people interaction contracts and its evidence provenance.
4. Apply the scene attention budget to its town and return.
5. Add departure reckoning and a decision-bearing passage to it.
6. Calibrate its dangers and recovery with the expanded diagnostic.
7. Enforce painting compatibility through its rendered journey.
8. Run two deliberately different characters, then cold agents, then PD-14 humans on one fixed build.

This sequence does not require more adventures or a broader world. It makes the strongest existing material a
dependable grammar for later content.

## What would be new work

Most findings in this report already exist in the Mission 20 record. The proposals that appear to go beyond the
current recorded remedies are:

- one shared, inspectable promise-provenance contract across presentation roles;
- a false-promise corpus organized by failed contract rather than UI page;
- destination, lead and route as explicit distinct relations;
- typed evidence provenance and related-but-separate undertaking groups;
- an interaction contract deciding which people become selectable;
- an explicit attention budget with a record of what composition deferred;
- combat diagnostics that include first-act incapacitation, target reach, forecast calibration and recovery cost;
- typed compatibility claims for paintings;
- proving the contracts together in one exemplary expedition before expanding their application.

They are proposals for consideration, not accepted architecture.
