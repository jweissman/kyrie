# Mission 16: plan and decisions

The brief (2026-10-25) asks for a game the owner can open, find and enter a proper dungeon in, understand their
character in, and spend an evening playing. This is the plan against the repository as it stands at `0e066e5`, with
the decisions that shape it. The running record is the [ledger](ledger.md).

## Where it starts: facts established against `main`

- **The opening is already one person.** Begin draws a country and asks for a name, a people, a calling, a reason
  for coming and a trade, then sets the protagonist down where that reason puts them. The authored campaigns still
  open with three companions, but only under `?dev`.
- **Authored adventures in generated worlds.** Of 40 seeds probed, 29 hold Merrowdale (The Long Man) beyond their
  first country's north march, and the same 29 also hold one independent adventure on another side. The other 11 hold
  one independent adventure only.
- **The lead does not reach the starting town.** An adventure's rumour is told only by the innkeeper of the town its
  border road leaves from, as a topic called "the road north". That is seldom the town the protagonist starts in.
  - In a baseline played from the public page (seed drawn by Begin: frost country, so no Merrowdale), the lead to
    Saltgrave (Thrume) was the eighth of the innkeeper's eleven topics.
  - From there it was one road and a march crossing (0.4 s). A player who did not know to ask about "the road east"
    would not find it.
- **No character view for one person.** The company page appears only once someone has joined.
- **Advancement raises numbers.** At each level a member gains a hit die, a point to put on a quality, the calling's
  techniques and traits for that level (given, not chosen), a spell for a specialist caster, and a feat every fifth
  level. The only choice in the first levels is which quality to raise, and nothing shows what it would change.
- **Portraits are cast without regard to what they show.** Every priest seen in the baseline and in M15's
  compositions was painted as *David with the Head of Goliath*.
- **The page is M14's walled field.** Ways are set round the edges, a grid of equal portraits fills the middle, the
  paper is cream, and the page goes dark underground and in fights.
- **Low Water** (`adventure/low-water`, 22 commits ahead of `main` and still moving at 01:30) is about 2,900 lines
  of Kyr, placed beside Merrowdale by its author, with its own dossier, critique and playtests.

## Decisions

1. **The principal adventure is The Long Man (Merrowdale).**
   - It is written for a small low-level company, with a three-day storm clock.
   - It has a village worth visiting and a real dungeon inside the dam: the galleries, the sluice chamber, the
     keeper's niche, the clay core, the gauge shaft. Under Hollow Water lies the drowned town.
   - It has an inhabitant, the Mower, that can be understood and left alone rather than fought, and a lead that
     explains itself (the steward's forty crowns).
   - It is already placeable.
2. **Every world Begin draws holds it, within a day of the starting town.**
   - It is a curated placement, not a compositor.
   - The rumour travels: every town of the first country has heard of the forty crowns, and the steward's notice is
     posted where the protagonist first arrives, as a thing to read.
   - Its topic is named for what it is about. Telling it teaches the way, so the route is known from the first
     conversation.
   - A second authored adventure (the independent one the world holds, and Low Water if it comes in) is told of in
     the starting town too, with its own route.
3. **Travel along known ways is assisted.**
   - The player chooses a known destination, sees the itinerary (legs, ways, time, what is known of the road and
     from whom), and commits once.
   - Each leg is still the engine's own going: time passes, the road is told, and the journey stops for anything
     that interrupts. That includes something met or seen, weariness, nightfall, a way shut, or a choice to make.
   - Exploring an unknown way stays leg by leg.
4. **The interface is the M15 hybrid, decided, in production.**
   - **The ground** is a literary column on white with a running head.
   - **The crowd.** A place's people and things are named in its own telling and can be addressed there. What is
     around is a few lines of names, grouped as people, things here, ways about the place and roads out, not a field
     of equal tiles.
   - **Conversation** is the existing painted page on white, only when the painting fits the person; otherwise the
     same page in type.
   - **An object** is set large as the page's subject.
   - **Travel** has its own composition: the route, the legs, what is passed, and what stopped it.
   - **A fight** is the two sides on white, the round told in prose, and each choice with its target, chance, cost
     and what it does.
   - **Rhythm.** Exceptional moments (coming into a new country, a death, a revelation, the end of an adventure)
     take the whole page.
   - **No dark theme.** Darkness is told in the fiction.
5. **The Character view exists from the start,** and advancement lives in it.
   - **First-stage advancement.** Each level gives its hit points and one development, chosen among:
     - a technique of the calling;
     - a competency (a skill that opens acts in the world, such as reading the old script, picking locks or tending
       wounds);
     - a point of a quality.

     Casters still learn spells.
   - **Every option shows what it changes,** worked out by the rules themselves: the current and new values, what
     depends on them, what it opens, and what it costs.
6. **Combat is made truthful and survivable for one person plus companions,** without a tactical rewrite.
   - Outcomes and casualties are told as the world records them.
   - Every ability shows its effect in plain text.
   - Companions act by their own repertoire.
   - The first expedition can be survived by an ordinary player who prepares and listens to the warnings.
7. **Return is told.**
   - Coming back to a place says that you have, and what has changed, through the people there.
   - What others did meanwhile reaches the company by witnesses, news and traces, never by an omniscient Notes.
   - The Story survives a save and a reload.
8. **Low Water is integrated if it is ready,** preserving its author's conception. It does not gate the primary
   acceptance.

## Gates and the work under each

| Gate | Work | Evidence |
|---|---|---|
| A. Interface | the production stages rewritten to the hybrid; tokens; crowd solution; portrait fit; Character view; references (Notes, Story, Pack, Map) as pages of the same book | free play at 1440, 900 and 390 px, by keys, without images; screenshots of real play |
| B. The way in | curated placement; the travelling rumour and the notice; topics named for their subject; route taught; assisted travel | a cold Begin to Merrowdale's road end by ordinary play, timed; several seeds by a policy that sees only the page |
| C. The expedition | The Long Man played in a generated world by one protagonist and recruited companions; mechanisms, clues, the Mower, the non-fighting way; combat truthful and survivable; withdrawal and return; save and reload mid-way | free play to an ending and back, with one deviation |
| D. Becoming and continuing | first-stage advancement with previews; return acknowledged; offstage traces; the second adventure discoverable and enterable | a level taken in the Character view after the expedition; the second adventure reached in the same game |
| E. Accounting | reconciliation of M15, the architecture review, the cold playtest and earlier missions; branches pruned once addressed; final report | the reconciliation table; independent play if available, said plainly if not |

## Order of work

1. The interface foundation (tokens, page, place, crowd, conversation, object), since everything is played through
   it.
2. The way in (placement, rumour, route, assisted travel) with its own composition.
3. The Character view and first-stage advancement.
4. The expedition, played through and repaired: combat, prose, mechanisms, return.
5. Low Water and the second adventure.
6. Reconciliation, free play across widths and keys, report.

Defects found on the journey are repaired where they are found, each with its probe.
