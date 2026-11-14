# What M22 should be: a short recommendation

The owner's thinking is that M22 should be extraordinarily narrow but maximalist about polish: a magnificent first
touch, and a deeply satisfying fundamental action. The research supports that focus, with one correction: the first
touch's worst moment is not a design problem.

## Yes: the narrow focus is right

**The fundamental action is close.**
- It answers within a frame, and the engine's answer comes back in about 160–200 ms.
- Its remaining faults were mechanical, not aesthetic, and are fixed (IG-17, IG-18):
  - a held key committed unread replies;
  - a resting hand lit rows it never chose.
- What separates it from "an exceptionally well-designed game" is now small and specific: sound, the taken state,
  the pacing of the answer before the next choices, and one inspect verb.

Those are polish, and they compound over every act of every session. That is the right place for maximal effort.

## The correction: setting out is an engine problem

**The first touch's single worst moment is 12–17 s of "Setting out…".**
- No page design makes that continuous. Journey and Outer Wilds manage continuity by never making the player wait
  between the menu and the first step.
- M22 should measure and move that time, for example:
  - begin the world's composition at "New game", while creation's choices are read;
  - or compose the first place before the whole country.
- This is the abstraction-tower and loading-boundaries work (`../loading-boundaries.md`), not the aesthetic line's.
- If it cannot move, M22's opening polish will be spent decorating a wait. Say so early.

## What M22 should do, in order

1. **The instrument, landed for everyone** (version a's answers):
   - the taken row and the quiet rest;
   - one commit tone, with a sound option;
   - the grammar's amendments 1–4 and 7 written into `GRAMMAR.md`, each held by a spec.

   Small, measured, and safe over hundreds of repetitions.
2. **The register on the exchange** (engine first): ordinary, speech, revelation, reckoning and loss, with
   deliberate continuation and delayed succession for the last three. Use one authored moment ("Gone under", the
   design review's content proof) as the acceptance case. This is the thing most likely to make a session
   *memorable* rather than smooth.
3. **One focus model and one commit path** (the grammar's architectural problems 1 and 2), as the precondition for a
   controller and for IG-03's inspect verb. It's a refactor of `ReaderKeys` and the commit handlers, not new
   behaviour, so do it before any controller support.
4. **The hold, only when Energy exists.**
   - Version b shows that a hold can be made to work: a tap on a held act is answered, an early release does
     nothing, and a held key commits once.
   - But a hold earns its friction only if something visible is spent. Build it with Energy in the same batch, and
     not before.
5. **The setting-out time** (above), as the first-touch item.

## What I would cut

- **A hold for any act that spends nothing.** Version b holds waits and searches, which spend nothing scarce today.
  Over a session that's friction with no meaning. The owner's IG-07 instinct was right: keep it flagged until Energy.
- **Version b's arrival beat as a default.** It adds about 0.36 s to every act, or about 43 s over the 120 acts of
  the repetition test. Keep the beat for the dramatic register's deliberate moments, where it means something, and
  let ordinary acts arrive at once.
- **Creation as a showpiece.** Creation's cards are adequate, and the blind playtest found them clear. Diegetic
  backgrounds (the owner's roadmap) are the better lever and belong to content, not to the interaction line. Don't
  spend M22's polish on card transitions.
- **The celestial observatory and the exceptional devices** (TO-04, TO-05). They're beautiful, and they're another
  program. They reuse this grammar when they come, but nothing about them is needed for the first touch.
- **More motion.** Every animation on the press path is paid for a hundred times a session. M22's polish should be
  light, sound and timing, not movement.

## The central question

**Can entering Westernesse and choosing an intention feel like operating a distinctive, exceptionally well-designed
game, rather than a sophisticated web application?**

Probably yes for choosing. With IG-17 and IG-18 in, the press is mechanically a game's press: once, at once, on its
own screen. Whether the tone and the taken state make it *feel* like one is for the owner's hand and ear on `?ix=a`.
A harness cannot judge that.
Entering will only feel like a game when the setting-out wait is gone, and that's an engine task. The page can't
solve it.
