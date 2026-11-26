# What we wish abilities could do, and how modules give the language its words (26 November)

The owner: "It could be interesting to think of an ability wishlist, ie things we wish the platform could do, and try
to build them starting with abilities.ohm and moving outwards. But it would be good to identify a good top-down pattern
where modules can contribute vocabulary and concepts." And earlier: perhaps "the SRD should be able to provide its own
noun/verb modules", while literalness still serves forecasting.

## The pattern: the grammar knows shapes, modules give the verbs

Today src/lang/Abilities.ohm hard-codes its verbs: Deal, Heal, Apply, Remove, Drain, Revive, Kill, Grant, Teach,
Summon, Travel, Cast, and now Try. Each new kind of effect is a grammar change, and its meaning lives in TypeScript
(src/effects.ts) over fighters.

**The proposal:**
- **The grammar knows sentence shapes:** a verb, its object, a target (now including `it` and `here`), an amount, a
  duration, a condition, a save and its outcomes. These are the ten or so forms the round-trip census names.
- **Verbs are declared in Kyr, by the module that owns them,** each saying what it lowers to in world changes, as a
  small macro over Kyr's own Assert, Set, Increase and Retract. For example, the fantasy domain's rules module:

```
Verb heal(amount, target) "Heal {amount} health to {target}" lowers to Increase hp(target) by amount up to maxHp(target).
Verb teach(spell, target) "Teach {spell} to {target}" lowers to Assert knowsSpell(target, spell).
Verb light(place) "Light {place}" lowers to Assert kindled(place). Set kindledUntil(place) to watch(clock) + 72.
```

  Tethys's would declare `overload`, `scan` and `jump` the same way.
- **The kernel forecasts by lowering, not by the word.** To foresee an act, infer its facet, or call it a threat or an
  opportunity, the engine reads the lowered changes. "Teach" means nothing to it; `knowsSpell(...)` written is a lesson
  (blue), and `hp` falling is a harm (red).
- **One grammar of statements.** An ability's effect and an act's consequence are both sentences of world changes. The
  scenario language and the ability language differ only in where they are written, and meet in one statement grammar.

**The pieces already begun:** the effects port's `lower` on the campaign's installed context (OR-1101), `Try <verb> on
<target>` taking its verb as a word (OR-1221), and the typed vocabulary (the compilation review's slice 6, OR-744),
which is where verb declarations belong.

**On speed:** the ability grammar's verbs cost nothing measurable today: each alternative opens with its own keyword,
and a PEG parser rejects it on the first token. Parse time at a world start (3.0 s) is the module grammar over every
module's text. Its levers are correct parse-cache keys (the compilation context) and generators that emit parsed form
(AX-04). Moving verbs to vocabulary leaves the ability grammar one shape rule and a lookup.

## The wishlist, from the ability language outwards

Each item says what it needs: a shape in the grammar, a verb in a domain, or a kernel concept.

| Wish | Needs | Where it comes from |
|---|---|---|
| What happens on a successful save (half damage, a lesser condition) | a shape | 11 hand abilities (the breaths) |
| A duration on any applied state; an amount on it (barkskin +2) | shapes | 9 hand abilities |
| A touch, a ray, a weapon attack as the delivery | a shape (delivery) | 8 hand abilities |
| Target by trait ("a person", "an animal", "the undead") | a shape (target filter) | hold person, hold animal; turn undead |
| Hit-dice pools (sleep, terror), counts (magic missile), chains | shapes | 5 hand abilities |
| **Light, open, seal, reveal, soothe, burn** | verbs (the kernel's) | OR-1102 to OR-1104, done in part |
| **Scan, keensense, divination in a fight** | verbs that reveal a creature's state | OR-1078 |
| **Polymorph, disguise, duplicate, clone, hologram** | the kernel's form apart from identity; verbs over it | OR-1205 |
| **Grant a lens or a sense for a while** (a wonder's quasi-sense, a perk's lens) | a verb writing `earned(company, surface)` with a duration | OR-1139, perks, earned surfaces |
| **Teach a spell, a skill, a word** | verbs writing knowledge; learning by shared clauses | OR-1207 |
| **Charm, frighten, befriend** (conversation-side) | verbs writing dispositions read by talk | OR-1104 |
| **Travel between planes, open a way that was not** | verbs over ways and places | the Mathematical Age's relics, violet |
| **Transform resources** (junk into machines, herbs into a draught) | verbs over quantities, charged to fatigue | OR-1204, OR-1206 |
| **Spend a budget** (fatigue, command points) | a cost shape every act may carry | OR-1200, OR-1202 |
| **Formation and group bonuses** | a condition shape over the company's makeup | OR-1203 |
| **Weather and terrain** | verbs over the sky and the land | OR-1106 |

## How to build outwards

1. **Shapes first,** in the census's order: they free 28 of the 41 hand abilities still in JSON.
2. **`Verb` declarations in Kyr** (with slice 6's typed vocabulary): move today's hard-coded verbs into the fantasy
   rules module one at a time, each with its lowering. Equivalence: the same ability, the same effect, before and
   after, over the census.
3. **The kernel's world verbs** (light, open, reveal, burn, travel) declared in data/rules, in no domain.
4. **The wishlist's concepts,** each as a proof slice in the reference game: form and identity, budgets, earned
   senses, transformations.
