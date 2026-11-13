# The owner on the title and onboarding (14 November, night)

Focused aesthetic feedback from another attempt to enter the game, kept as given. Register §30 (TO-01 to TO-06). The
aesthetic line carries it, under the doctrine (`doc/design/DOCTRINE.md`); the engine side of any new creation step is
the lead's.

> I'm increasingly dissatisfied with the title page. It doesn't seem to have been brought into the modern interaction
> language we're developing elsewhere in Westernesse, and the interaction itself is distracting. In particular, the
> two little golden boxes that move around the choices feel awkward and immersion-breaking. **The title is where I
> just bounced off before even beginning to play.** This deserves more serious attention than incidental styling.

## 1. Treat the title as the first expression of the game's design language

> Please reconsider the title composition and its interaction design, not merely its colors and spacing. The choices
> should probably be rendered using our modern, highlighted menu components or a carefully designed variant of them.
> I'd like **Play** to have a strong, elegant gold marker or focus treatment, rather than the current moving double-box
> decoration. The title can use ceremonial gold as an entry-point emphasis, while preserving the stricter semantic
> meaning of gold for followed undertakings once we're inside the game. Focus and selection should be stable, clear,
> and satisfying. We should not have multiple indicators jumping around, shifting geometry, or drawing attention to
> the widgets themselves. The opening should immediately teach the player the visual and tactile interaction grammar
> they'll encounter during character creation and ordinary play.

## 2. Explore motion more ambitiously, but put the complexity behind the interaction

> My instinct is for a **quiet, extremely legible foreground over a deeper, more complex, subtly moving background**.
> Consider layered atmospheric movement, perspective changes, lighting transitions, color shifts, or other cinematic
> responses to the currently focused menu choice. Perhaps focusing Play, Continue, or another entry changes the
> perspective or emotional quality of the background in some restrained way. The scene can respond over a few hundred
> milliseconds, while the actual menu focus should be immediate. The player should never feel that input is waiting
> for an animation to catch up. Avoid constant visual busyness, gratuitous particles, excessive camera movement, and
> large compositional changes. I'd rather have one exceptionally beautiful, responsive transition than many competing
> flourishes. Please explore art direction, not merely animation technology.

## 3. Reconsider the studio stab

> It should establish tone and confidence: deliberate timing, typography, movement, perhaps a memorable image or
> transition. It needn't be longer or more elaborate. A few expertly composed seconds could be much more effective than
> additional ornament. Please consider how it flows into the title, and how the title flows into creation, rather than
> designing each as a disconnected screen. It should be skippable and respect reduced-motion preferences.

## 4. Explore richer interaction patterns during onboarding

> One possible experiment is a **celestial observatory for choosing an astrological birth sign**. Imagine a deep
> starfield or celestial dome, rendered through Three.js or another appropriate visual technique. Moving focus among
> the available birth signs smoothly shifts the sky's perspective, identifies the relevant constellation, and brings
> its shape into view. The chosen sign might illuminate or resolve into a beautiful composition as the player commits.
> A video or animated sky could provide atmospheric depth, with interactive constellations or camera movement layered
> over it. The player's interaction remains simple and comprehensible. The richness is in the world responding to
> their attention. This shouldn't require a new character-creation rules system. The engine remains authoritative
> about the available signs, what the selection means, and the next question. The celestial presentation is a visual
> realization of those existing decisions.

## 5. Think beyond the observatory: expressive interactions with particular things

> For instance, when examining a complicated lock, hovering over different legitimate actions might cause a
> three-dimensional rendering of the mechanism to rotate, reveal another angle, illuminate the relevant moving part, or
> show which component the character is attending to. Other good candidates might be an armillary sphere, an
> unfamiliar artifact, a navigational instrument, or a spatial diagram of an architectural mechanism. These would be
> **read-only projections of authoritative engine state and player focus**, not independent physics puzzles or
> parallel game logic. Focusing an action can animate its associated visual element. Committing the action goes
> through the real Kyrie engine. The result then determines what the visual representation shows. These experiences
> should be exceptional, memorable moments within a predominantly painterly game, not compulsory 3D renderings of
> every ordinary object.

## 6. Keep the underlying player workflow unified

> The title and onboarding improvements must preserve our architectural principle: one authoritative workflow for
> browser, terminal, and headless clients. The client chooses how to present an available choice. It does not
> independently decide the next character-creation question, available signs, selection rules, consequences, or
> progression. The terminal must still be able to perform the same creation and gameplay sequence through the shared
> interaction projection, without needing the 3D artwork. Beautiful and specialized visualizations should be possible
> precisely because they don't own the gameplay logic.

## 7. Make this a bounded but genuine M21 aesthetic experiment

> I'm not commissioning a general 3D engine, an elaborate new animation framework, or a completely new onboarding
> system. But I would like the aesthetic workstream to do more than make existing buttons tidier. Please make a serious
> new title-page composition, improve the studio-to-title-to-creation transition, and prototype at least one richer
> responsive visual interaction if it can be done without displacing urgent playability repairs. Evaluate the result
> on desktop and tablet, with keyboard, touch, and reduced-motion support. Watch the actual transitions, not just
> screenshots. The result should feel designed as one experience, and it should be beautiful at rest as well as in
> motion.
>
> **The larger ambition:** Westernesse should have an exceptionally quiet, readable interaction surface, but
> occasionally reveal extraordinary visual and spatial depth in response to the player's attention. I want the title
> and onboarding to begin establishing that promise immediately. The interface should not merely stop getting in the
> way. It should sometimes produce a sense of discovery and astonishment.
