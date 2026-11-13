# The owner, 14 November: continuity (verbatim)

A new human play attempt still broke down quickly. Please treat the following as high-value evidence for M21's dedicated playability and aesthetic lines.

**The central concern is continuity.** Westernesse should feel like one stable scene through which the player directs attention and acts, not a collection of pages for Look, Explore, Map, Talk, and Combat.

**1. Finish the attention-lens transformation.** Look/Things, People, and Places/Explore should foreground and rerank relevant actions within the same resting scene. Opening a lens should not create a distinct full page, consume world time, or reset the player's contextual understanding. Up to four promoted actions should be meaningfully selected from the authoritative available-action set, adapting to the current lens. Expanded detail and less prominent actions remain accessible.

**2. Repair interior and exterior navigation boundaries.** The player could open the world map from inside a building, with a confusing Back behavior and no obvious way to reach other local POIs. Do not offer direct overland fast travel from an interior when it bypasses the actual spatial graph. Make leaving a building or site unmistakably clear. Consider transforming the Map control into a local compass or route-out surface in enclosed contexts, switching to the larger map at appropriate exterior scales. Use directional symbols, paths, and chevrons, not an invented semantic atlas color. Route guidance must respect actual known connectivity and blocked or unknown passages.

**3. Unify interaction presentation, including combat.** Several combat controls still use legacy button treatments rather than the clean highlighted action-menu system. Audit all world-action surfaces and bring them onto the same authoritative action/availability/targeting presentation contract. Different modes may have different compositions, but should not have unrelated UI semantics.

**4. Stop target selection from changing layout geometry.** Selecting an enemy currently causes its card to expand vertically, distorts the target layout, and introduces visual bars over the painting. Selection should use stable-size highlighting, a marker/reticle, or a fixed details region; switching targets must not reflow the scene.

**5. Distinguish entity categories from atlas opportunities.** The current pink indication of People feels too similar to coral/red. Simply having a person nearby need not receive a semantic opportunity color. Prefer neutral entity icons, portraits, or a People lens; use actual atlas colors for derived meaningful opportunities such as knowledge and recruitment. Avoid creating a new color category to solve a presentation problem.

**6. Verify a real end-to-end interior scenario.** From a multi-room site, test lens switching, promoted actions, object examination, NPC interaction, clear exit routing, return to the settlement, combat target selection, and restoration of context afterward. Include iPad viewport verification and a focused regression test for any shared semantic defect.

Please coordinate this across the playability and aesthetic lines while keeping the fast-test phase progressing. These are concrete repairs to existing M21 objectives, not an invitation to expand the feature set.

**Desired result:** The player understands where they are, what they can do, and how to leave, while the painting and scene composition remain visually stable. Please elevate the following to the dedicated playability and aesthetic workstreams. The current action UI remains incomplete and inconsistent.

**Central objective: finish the transformation to one coherent, game-native interaction system across the whole application.** This is an existing M21 obligation, not a new feature expansion.

### 1. Inventory and replace legacy world-action controls

Conduct a concrete census of every place the player can issue a world action: resting scene, promoted actions, expanded lens actions, conversation, looking, searching, waiting, local navigation, Pack, object manipulation, combat, and contextual choices.

There are still many raw text links, old-style buttons, and inconsistent controls, including on the resting scene itself and particularly the Wait page.

Replace these with the shared highlighted action system or intentionally designed variants built from the same semantic and visual primitives.

Do not consider the migration complete merely because the four promoted actions use the new component.

Raw navigation links may remain for genuine non-game application navigation, but fictional actions should not look like links in a web document.

Preserve authoritative actions, stable IDs, availability, targeting, atlas facets, and accessibility. Do not recreate action semantics in individual views.

### 2. Finish scene-based lenses rather than separate action pages

Look/Things, People, Places/Explore, and potentially Time/Wait should foreground and unfold relevant actions within one continuous scene.

A lens is a change of attention, not a game action or a new location. Opening it should not advance time or cause a full page transition.

The four promoted scene actions should rerank appropriately to the selected lens; additional actions should expand predictably underneath.

For Wait, explore a compact temporal lens that offers existing supported behaviors such as waiting briefly, watching, listening, resting, or waiting for an event. The specific action may advance time; opening the lens does not.

Do not invent a separate elaborate time system merely to remove the legacy Wait page.

### 3. Give the compass a reliable routing contract

Inside a building, dungeon, tower, ship, or other enclosed site, the Map control should normally yield a local compass/routing surface rather than offering world-map travel that bypasses the site.

The compass should help the player answer, *Where can I go next, and how do I leave?*

It should identify a credible known next point of interest or a route back outside, and may guide the player along a known traversable path without forcing every intermediate junction to be selected manually.

As known local opportunities are exhausted, returning outside should become the natural recommendation. Do not mistake unexplored or hidden content for proven absence of opportunities.

Routes must respect real connectivity, knowledge, barriers, travel time, and interruptions. No teleporting through the spatial graph.

Provide neutral directional indications (compass arrows, chevrons, route lines), not a new atlas opportunity color.

Test actual interior-to-exterior and exterior-to-interior transitions, including the Back behavior and access to other local POIs.

### 4. Repair combat as a complete interaction experience

Combat is still visually and operationally inconsistent even where it nominally uses newer action components.

In particular:

- Legacy combat controls remain alongside modern ones.
- The highlighted menu unexpectedly becomes a horizontal row.
- Target selection makes enemy cards taller and reflows the painting.
- New information appears inside buttons and changes their dimensions or hierarchy.
- Switching target and action states creates distracting layout jumps.

Please audit the actual component tree and state transitions, not merely their final styling.

Establish one deliberate combat composition with stable geometry, consistent action-menu behavior, fixed places for secondary details, and restrained target highlighting.

Target focus and action expansion must not arbitrarily resize portrait cards, inject content into primary buttons, or move unrelated elements.

Test all major combat states, including changing targets, opening categories, choosing techniques, unavailable actions, damage, retreat, and returning to exploration.

### 5. Keep the atlas semantically disciplined

Use the atlas's actual opportunity facets consistently across action components.

Personhood itself need not have a pink semantic pip; neutral portraits, icons, and the People lens can identify people.

Do not invent additional semantic colors for routing or UI categories. The colors should indicate grounded opportunities and consequences, not merely decorate every interactive element.

Gold remains exclusive to the followed undertaking.

### 6. Acceptance evidence

Demonstrate a real, playable flow including:

- A resting scene with no stray legacy action links.
- Switching attention lenses without page navigation.
- Expanding less prominent actions without losing context.
- Waiting through the same unified interface.
- Using the compass to identify a useful local destination and return outside.
- Entering combat, changing targets, expanding actions, and returning to exploration without visual reflow.
- Consistent behavior on desktop and iPad viewports.

Include focused tests for shared behavior and actual browser verification for layout and interaction stability.

**Do not close this work as a completed component migration until the entire ordinary action path has been audited and demonstrated.**

The desired result is simple: every interaction feels like part of one game, the world remains spatially coherent, and the interface never fights the player's attention.
