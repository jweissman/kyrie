# The owner's rulings on the seven decisions (16 November)

Design rulings, not preferences: where a change is inconvenient, the ruling wins over the current implementation, and old
mechanisms are removed rather than excepted around. Source: the owner's reply to decisions-for-owner.md.

1. **Fight dice: B, but not another action row.** Outcome stays in vivid prose; the calculation is a deliberate, accessible
   *informational disclosure* of a completed exchange ("How it fell"), never a fifth gameplay action. Probability and danger
   stay legible before consequential choices; nothing needed for judgment hides behind hover alone.
2. **Lens "All N": B, unequivocally.** Four foreground items in every context (people, things, exits, time, spells,
   inventory, conversations, lenses). Opening a lens replaces the foreground; more than four are paged (navigation, not an
   act), never unfolded. Prefer fewer meaningful actions to dozens of similar ones (a broad inquiry of a traveller yields a
   contextual answer; specific topics stay available). Never drop legal actions. Replace the specs that required the unfold.
3. **Hold to commit: B, honest.** A ring appears only when holding matters; sustained input only where cost or
   irreversibility warrants (a night's rest, a camp; consider grave actions with foreseeable consequences), from authoritative
   action metadata, never page-label guesses. Keyboard, touch, pointer and accessibility alternatives equally dependable;
   never a dexterity-only long press.
4. **Commander: A, through normal actions.** The companion's sheet (a lens on the world) exposes the real orders (Stay here,
   Come on) as authoritative actions through the same menu, not independent buttons; dialogue may voice an order but never
   a second implementation; respect where the companion physically is and how they can return.
5. **Phone narration: C with a legibility fallback.** A painterly gradient scrim, not a bordered rectangle; a softer local
   backdrop where a painting is difficult; verify on phone viewports with bright and complex backgrounds; never trade away
   contrast.
6. **First-hour mage: B+C, without changing the rules for the mage.** Keep the danger and class asymmetry; do not secretly
   weaken foes by class; ensure viable, discoverable, executable alternatives (an affordable companion, preparation, a spell,
   another approach, retreat, negotiation, a less hazardous first undertaking); a concise creation line says the mage is
   fragile alone; test the whole route (discover, afford, recruit, understand, journey, survive or retreat).
7. Prose: (unanswered; the three rows to fix first still wanted).

## Acceptance (uninterrupted browser play and the same headless actions)

No screen grows an expanded list beneath the four; all game actions use one menu and one commit mechanism; informational
disclosure never masquerades as an action; the hold ring never promises what it does not do; companion orders work in
real circumstances; the first-hour mage has an intelligible, viable way to take part with the danger intact.

## Status (16 November)

| # | State |
|---|---|
| 2 | **Done**: lenses are paged four at a time (GlanceStage.Lens, a non-act "More… n of N"); the unfold is gone; the specs and driver turn pages (test/support/lens-pages.ts) |
| 3 | **Mostly done**: the engine marks only rest and camp (ChoiceList.sustaining); the hold, its ring, its armed second press and an assistive click work for them by default (no `?ix=b`); the idle ring on every press is removed. **Not verified in a browser:** no spec reaches a camp or rest yet (the opening has none; the probe fixtures did not load) |
| 1 | **Done in the page, not browser-checked:** each exchange's roll line is a `<details class="how">` "How it fell", closed by default, reachable by keyboard and reader, not an act (fight-stage.tsx, fight.css); the odds before a choice are words on the card (CB-13). Not yet: the fight log's roll text is still a hover title |
| 4 | not begun (engine pin exists: test/small/commander) |
| 5 | **Done for the phone scene** (rest.css): a full-width gradient scrim, no border or box, the text inside the safe margins and above the rail; checked on 390×844 and 820×1180 screenshots (kite opening, a soft painting). **Not checked:** bright or busy paintings, talk and fight panels; the telling is clipped by the fade on a phone where it is long (scrollable) |
| 6 | not begun |
