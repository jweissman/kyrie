# The casting-fiction invariant

From the owner, 15 November: the rats under the corn-store can be put to sleep "with a mage's charm", and none of the
questions a player should be able to ask beneath that prose has an answer. This is a **causal-legibility** problem, not a
prose problem and not merely an SRD one. The player must always be able to answer:

> Who did this, by what learned capability, at what cost, under what rules, and what actually happened?

## The distinction

- A **calling** grants education, perception, vocabulary and perhaps explicitly defined techniques.
- An **ability** produces a supernatural effect.
- An **authored action** arranges circumstances and invokes capabilities; it does not invent an unnamed power because a
  calling is present.

"A mage recognizes the ward" may depend on `hasCalling(mage)`. "The rats fall asleep" may not.

## The invariant

Every authored action that produces a magical state change resolves through a **named** ability, item, ritual,
environmental mechanism or canonical calling technique. Its event keeps the acting character, the named means, the source
ability or item, the targets, the cost expended, the attack, resistance and save results, the effects produced, and the
SRD adaptations that applied, and these are inspectable after save and reload where the consequences persist.

Corollaries:
1. **Prose is downstream of mechanics.** The label is derived from the invocation ("Have Ysabel cast Sleep over the rats in
   the run"), not the invocation inferred from the label.
2. **A calling is not a bag of permissions.** If all mages have minor magecraft, model it (`soporific_charm`, `kindle`,
   `sense_enchantment`), each with scope, cost, availability, limits and presentation. If an author can use a thing to
   bypass danger, consume an obstacle, alter another creature or change persistent state, it needs a named capability.
3. **Invocation and aftermath are separate.** Casting Sleep makes rats asleep; "Kill the sleeping rats" is a separate,
   deliberate action (the player may instead pass, bind, search, wake one, or be interrupted).
4. **One invocation route** for field casting, combat casting, items and scripted opportunities:
   authorization → target selection → cost → attack/SR/save → effects → events → authored aftermath.
5. **Context alters applicability, never identity.** The scene may gather the rats in the area or make them unaware; it
   may not make Sleep succeed, kill, be approximated by any mage, or be free.

## What exists

- **`Resolve invoke(ability, caster, target)`** in an action is the ordinary rules' route (AbilityUse). `field_spell`
  (data/rules/care.kyr) uses it, and `canCast(member, ability)` is projected by the engine (CreatureFacts) as "this member
  can cast it now: known, awake, resourced". Today it takes **members** as targets and **field-usable** techniques
  (healings, cleansings, wards).
- Combat casting (Battle, Spellcasting.slotFor/spend, DailyUses) and the page's fight menu, and, since OP-05, a known spell
  castable from any ready slot of its level or higher.

## What the audit found (scripts/casting-audit.ts)

Begun from the consequence (an action that slays or restores), not from the words "spell" or "charm":

| Means | Actions | |
|---|---:|---|
| `invoke` (the ordinary route) | **0** | no authored action invokes an ability |
| `item` (holds and spends a thing) | 4 | firebombs for the nest, the brood and the spiders; the tallow names read |
| `calling` (gated on calling or learned alone) | **2** | both undertown: `_u_rats_slept`, `_u_brood_spelled` |
| `bare` (no named means) | 8 | a rite, a spring, a battle: legitimate mechanisms to review, not all violations |

Beyond slaying: **52** authored actions are gated on `hasCalling` or `learned`, nearly all asserting a fact (opening,
revealing, learning). Each needs the table below answered, or to be declared a plain recognition.

### The two undertown actions, against the owner's table

| Question | `_u_rats_slept` ("a mage's charm") | `_u_nest_burned`, `_u_brood_burned` (firebomb) |
|---|---|---|
| Who acts? | any awake member who has the calling (`?m`), not bound | the company; no member bound |
| What is the means? | **none named**: "a mage's charm, not the Sleep spell" (the comment says the spell was avoided on purpose) | an item, `oil_firebomb`, named and held |
| Presently usable? | `hasCalling(mage)` or learned: nothing about a prepared or known sleep, awake aside | holding the item |
| Target? | every rat in the warren | the buck rat; the brood |
| Cost? | **free** (one minute) | the item is spent |
| Resolves how? | **declared**: `Slay` the whole band; no area, no save, no resistance, no Hit Dice limit | **declared**: `Slay`; the item's own attack, save and damage never run |
| What persists? | the rats dead; no sleep ever existed | the same |
| What is authored? | situation and result prose | the same |

`_u_brood_spelled` ("a magician's fire") is the same shape on the brood chamber: any mage, or anyone who has learned
firebolt, burning hands or scald, slays the brood's mother outright and burns the eggs, free, with no attack, save or damage
rolled. It does name three real spells as ways in (the better half of it), but a mage who has none of them is offered it.

So: sleep and kill are conflated; the power is invisible (no canon names it, no handbook lists it, no forecast knows it);
and a mage who has never learned Sleep and one who has are offered the same free kill. The firebomb is the better shape (a
named, spent item) but still skips the item's own resolution.

## What would make it right (the owner's order, with what each needs)

1. This document, the audit and its ratchet (test/small/casting-audit): **done**.
2. **Bind a caster** in authored magical actions (a member, as `field_spell` does).
3. **Invoke an ordinary ability against a band.** `Resolve invoke` must take the creatures of a group as targets. This is
   the real engine change: legal-target selection, the cost, attack/SR/save and effects through the one route.
4. Keep the normal cost and resolution **events**, retained in the record.
5. **Sleep as a persistent state,** not a death: the engine projects a `sleeping(group)` fact from the creature's
   condition, so that survivors and resisters stay active, and a separate authored action ("Kill the sleeping rats") is
   offered on it.
6. Convert the rats through the real Sleep spell; the brood chamber through a selected fire ability or the firebomb's own
   catalog effect.
7. Review the remaining 52 + 8; add a lint once the accepted patterns are known.

The acceptance test for the rats is the owner's eleven-point list (a mage without Sleep is not offered it; one who can cast
it is named; Sleep by its canonical name; the same resource and rules as elsewhere; events recorded; resisters stay
active; sleepers are asleep, not dead; killing is distinct; save and reload preserves it; terminal, browser, forecast and
handbook agree).

## Not done here

Steps 2–7 are an engine change (the band as a target, a projected `sleeping` fact, the event record) and are not begun.
The cheapest honest next step is step 3 with a tiny Kyr fixture: a tiny world, a mage who knows Sleep, three rats, and
`Resolve invoke(sleep, caster, rats)`, to see exactly what the kernel needs.
