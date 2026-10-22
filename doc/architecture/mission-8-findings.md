# Mission 8: why the game is not working

These are first findings from playing the Serewater March in Chromium at 1440×900 and 390×844. The playthrough
covered the title, company creation, talking to Wren, Nera's shop, the causeway, the boar fight, and the company,
pack, journal and map views. I also read the old modules as an author would. Every claim below was reproduced, and
each names its cause where one was found.

## The interface

1. **Hover rebuilds the whole screen.** A pointer moving over a choice changes the cursor and calls `render()`.
   That rebuilds the screen model from the campaign (80–160 ms) and replaces the root's `innerHTML`. The newest
   story entry's `rise` animation replays, so its text vanishes and fades back 16 ms after the hover (screenshot
   `h-hover-16ms`). Scroll positions survive only through manual restoration, and keyboard focus is lost on every
   render.
2. **Nothing answers a click on Begin.** Loading the Serewater March takes 5.2 s in the browser. Under Node, 3.45 s
   of a 5.6 s load is Ohm parsing and 1.2 s is garbage collection. Each module's source is parsed three times: once
   for its id, once to merge, and once more after being written back to text for `ModuleAssembly.compose`. The
   shared rules files are parsed again for every one of the eleven modules. All of it runs on the main thread, so
   the page cannot paint.
3. **Every action costs about 0.5 s:** talking 560 ms, a one-hour walk 820 ms. The engine's step takes 50–200 ms,
   rebuilding the screen model another 80–180 ms, and a full re-render and a full save follow.
4. **It looks like an admin console.** The prose has 45% of the width. A two-column grid of nine numbered choices,
   with section icons, takes the lower half. A rail holds HP bars, a map with 7-pixel labels, a region chart whose
   label overlaps its node, a legend, and "Daylight until 6 p.m. · Eat by 8:00 p.m.". A footer of key hints sits on
   top of all that. The phone layout clips the party bar and hides choices under the footer.
5. **Things are told twice, and in the program's voice:**
   - the time sits in the header and again on every entry;
   - "To Brackenholt landing — barred" is listed beside "To Brackenholt landing — look at Wren's ferry";
   - a creature's prose ends "Marsh boar; level 1; 7 HP; unhurt";
   - after a fight: "1 blow over the fight; the journal keeps every one", then "Your company wins the encounter";
   - "Sets Spear";
   - an empty "Wait" description;
   - "Needs stealth: no one in the company has it."
6. **A dead boar stays a person to talk to:** "a reedbank boar, a boar rooting in the reeds — Nothing to do with
   them now."
7. **Fights read as forms.** The fight page is two-thirds empty. Foes and intents sit in the rail as "⚑ Rending bite
   → Elen". The turn order is a line of names, and the exchange is not told until the fight is over.

## The rules

8. **Charge.** In combat, `Battle.usable` now gates Charge correctly: Prepare Charge, then only Charge. The
   2026-10-20 recording (`doc/playtests/rededge-2026-10-20/19-fight.txt`) shows Charge offered beside Prepare
   Charge, so the defect was real. Nothing yet stops another prerequisite from going the same way: the legality of
   what is offered is not audited across abilities, field uses and authored actions.
9. **Movement arrives first.** `Spatial.lowerExit` puts the company at its destination, and only then does the
   move's time pass, at the destination. Anything there gets the whole journey to act. Mission 7 papered over this
   with `halts` for warnings.
10. **Hostile creatures are inert unless a place gives them words.** The inhabitants rules need per-place warning
    and onslaught texts. A boar or a brigand without them does nothing until the player chooses Attack.

## The adventures

11. **Brack shows the general fault: a single verb stands in for a situation.**
    - "Pay Pim ten coin to leave the strongroom key on his desk" sets the lock to open. There is no key, no desk,
      no taking it, and nobody to notice.
    - "Tell Dame Marrick" exposes Hale, makes her a patron and moves him to the gate in one topic. It even describes
      her reading a ledger the company may have sold.
    
    Censer Hill tells the player its mechanics in the scenery: "Its plated body resists steel and cannot be
    poisoned… nothing compels you to fight it"; "A trapwork hand can pin it; a line can lash it."
12. **The campaigns are wide and shallow.**
    - Most places are a sentence and a door.
    - People offer one topic each.
    - History is labels: "the flood compact", "the Lamplighters".
    - Little that is found changes what the company understands; it mostly unlocks a way.

## What follows from this

- The client gets a stable renderer: keyed components, where hover is CSS and the cursor is focus.
- The engine stops parsing what it has already parsed.
- The screen becomes a reading surface with contextual views.
- Moves let time pass before arrival, and hostile creatures act by temperament everywhere.
- The legality of offered actions is audited across all three kinds.
- The old campaigns leave the recommended experience in favour of small fixtures and one new adventure, designed
  in prose first.
