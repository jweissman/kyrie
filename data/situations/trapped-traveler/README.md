# Trapped traveler

Extracted from Pell's physical rescue and escort in Serewater. The original Serewater source remains executable and unchanged.

Bind the five manifest imports to canonical entities exported by an installed site. `guest` must be a real group controlled by that site, already at `captive_room` and trapped by the bound `restraint`. `safe_home` is a destination, not a teleport instruction. The package creates no people, places, inventory or controller copies.

Required initial site facts are checked by the manifest role contract: `trapped(guest)`, `at(guest,captive_room)`, `mounted(restraint,captive_room)`, `obstruction(restraint)` and `restrainedBy(guest,restraint)`. The site supplies actual routes, barriers and creature state. A fallen or stunned rescuer cannot perform the shared action. Death remains canonical, and the package independently reports `traveler_dead` rather than resurrecting anyone to preserve its topic sequence.

The ordinary shared `free_obstruction` action removes the restraint and records rescue. `escort` moves both parties along each actual route. Topics explain these mechanics without generating hidden goals or automatic following. Independent outcome dimensions are freed, returned and dead. No reward, final campaign termination, unique solution action or private TypeScript runner is installed.

The package keeps the broad physical rescue/escort behavior. Pell's personal map, salvage faction relationships and payment/training rewards remain local Serewater content. They are not presumed to belong to every trapped traveler.
