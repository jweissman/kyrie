# A terminal a person can comfortably play (the owner, 14 November, late)

The owner tried to play through the terminal. This is an existing playability defect, not a new workstream. It folds
into the shared-workflow and terminal work (§29, TB) and the interaction grammar.

**The principle:** the browser, the terminal and headless agents are projections of one authoritative experience.
They share the legal actions, knowledge, workflow states, action identities and consequences. They differ only in
presentation and input.

**Problems found in play:**
- Scenes and menus dump the whole observation and every action.
- Text gets little emphasis or colour.
- The left-border and pip grammar breaks down when there are many actions, or several indicators on one action.
- Instruments (the sky, provisions) don't say what they report.

**Wanted:**
1. **Two modes, one workflow.**
   - **Human mode** is chosen automatically on an interactive TTY; `--interactive` and `--headless` override it.
     - A navigable picker: stable focus, arrows and `j`/`k`, Enter to commit, a predictable back, and a way to unfold
       more legal actions.
     - The default view is economical: a few lines of scene, the promoted choices, and only the instruments that
       matter now.
     - ANSI colour and emphasis, used with restraint, that degrade gracefully on narrow terminals and long labels.
   - **Headless mode** stays plain, deterministic and cheap.
   - Both drive the same EngineHost requests.
2. **The action-indicator model, reconsidered** rather than more pips. The lead's decisions:
   - **One dominant semantic colour per action,** chosen by one precedence table from the engine's action metadata
     (Offer aspects, never label heuristics). Followed-undertaking gold first (strictly: only after Follow), then
     danger red, then the remaining atlas facets in the atlas's order. The table lives in one shared place that both
     clients read.
   - **At most two secondary properties as icons** (Signs, with unicode and plain-glyph fallbacks), or revealed in
     the action's detail.
   - **Companionship as an icon rather than a colour** is a question to assess, with both clients shown side by side,
     before anything changes.
   - **A true-colour gradient** across a label is a flag-only experiment, never the default.
   - The meaning must survive without colour.
3. **Instruments made intelligible.** The engine gives each instrument a short label and a gloss; a client only
   displays them, with a cheap way to inspect one (`?`). There is no terminal interpretation of astronomy or fatigue.
4. **The awkward cases, tested cheaply.** A tiny fixture holds them all:
   - many legal actions with few promoted;
   - one action with several opportunities;
   - long labels at a narrow width;
   - several instruments;
   - actions that change after a commit;
   - creation and navigation in the same grammar.

   It carries cheap regressions and serves direct review. Then an actual interactive session is assessed as a player.

**Not wanted:** a separate terminal rules engine, a general-purpose TUI framework, or a wholesale redesign.

**The bar:** a good terminal makes the game easier to enjoy, easier to understand, and dramatically cheaper to test.
It is Gate 1's cheapest tier, and the way blind agents play.

Register §39 TP-01..05.
