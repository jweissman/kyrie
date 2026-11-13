# From adventure to career: the owner's direction after the first hour

The owner, 11 November 2026 (late). This is a design direction for the authoring and character-development roadmap
that follows Mission 20. It does not change what Mission 20 must do first, which is to make the existing first hour
stable, understandable and enjoyable.

> Westernesse should begin as an adventure and grow into a career, rather than beginning as a predetermined biography
> and struggling to become an adventure.

## The direction, in brief

1. **The prologue.** Repeated play shows the fixed origin quest lines for what they are. They set up a personal
   obligation, send the character toward a place, and lose momentum before enough combat, puzzles, people or
   discoveries are met. They need not be kept just because they exist.
   - Begin with an interesting situation, not an account of a character's history.
   - For example: in medias res, underground after a failed expedition, with the immediate undertaking of reaching
     the surface.
   - Give the opening several intelligible ways forward, dangerous and safe ones. Include discoveries, obstacles,
     combat or evasion, and possible companions. Curiosity is rewarded within the first few decisions.
   - One exceptionally strong opening is a better foundation than many thin ones.
   - Mine the origin material for its people, places and conflicts.
2. **Creation stays broad.** Ancestry, calling, a broad background family, and starting abilities and equipment by
   intelligible defaults or concise choices. A caster's first spells come by thematic kits, never a long list.
3. **Backgrounds unfold in play.** A family holds several specific roles; a noble household's might be squire,
   steward, tutor or falconer.
   - The role is chosen at a plausible moment: a conversation, a memory, an institution, or a practical challenge.
   - The choice sets durable facts, skills and proficiencies, social recognition, and future undertakings.
   - It is bounded: a few unresolved history slots per family. Once set, it is permanent.
4. **Companions, early.** One or two recruitments can be found in the first adventure as part of the world's
   ordinary life, not a tutorial.
   - Each companion has reasons, capabilities that matter, a personality and obligations.
   - Recruitment may need trust, payment, protection, persuasion, or a problem solved. Some join for a while, others
     for good.
   - The protagonist and two companions is the first formation threshold to test.
   - Companionship is its own facet in the atlas; Gregarious and the Bard extend how far it is perceived.
5. **The company is a character.** A formation is read along three dimensions: classes, ancestries and backgrounds.
   - Neither homogeneity nor diversity is better than the other.
   - Every class triple deserves consideration in time: all the same, two and one, all different.
   - Recover the Orsino/Morcino party-composition ideas before designing a new catalogue.
   - Example: three clerics are a **Synod**, with collective rites, stronger divination, religious authority and
     standing with religious institutions.
   - Perks change tactics, perception, access, relationships, rituals and undertakings, more than numbers. Some
     carry obligations.
6. **Formations become careers.**
   - Some abilities come from presence alone. Others need an initiation, a vow, a quest, recognition, or a shared
     achievement.
   - Identity and current ability are kept apart: with a member absent, the Synod still exists, but its three-person
     rites wait.
   - Careers are tied to the generated world's circumstances, not to one fixed chain.
7. **Individual careers grow alongside.** Examples: Knightly or Berserker paths, a magical school, a background's
   vocation.
   - Feats may open perception, collective abilities, social access, or a prestige career's first step.
   - A career comes from where these meet: class and feats, background, ancestry, company, and the world.
   - One well-composed situation can serve several careers; there is no separate chain for each identity.
8. **Replayability is structural.** Vary situations, causal histories, encounters, recruitment, puzzles,
   institutions and consequences, not just names and places.
   - Different characters and companies perceive and attract different adventures.
   - Deem composes dossiers and situations; Kyr governs interactions, rules, observations and consequences.
   - Study Orsino/Morcino's whole-circumstance generation without inheriting its weaknesses.
9. **Perception has three tiers:**
   - **Ambient:** what is obvious, plus what this character notices, with no menu.
   - **Directed:** listening at a door, reading tracks, examining a body or a mechanism; promoted among the principal
     actions when relevant.
   - **Sustained:** the Eye, which costs time, skill, and a risk of interruption.

   Each tier gives useful information, not atmosphere. All of them vary by class, background, feats and formation,
   and the atlas stays grounded in what the engine knows.
10. **A stately-home murder mystery is a systems test.**
    - It has a coherent causal history (who, why, how, when) and the evidence that history left.
    - The player reasons; it is not a hunt for N highlighted objects.
    - Backgrounds and companions open avenues, and several approaches each make progress.
    - It varies across worlds and stays consistent. It complements the dungeon by stressing different parts of the
      engine.
11. **A Company page in the Book** shows:
    - the party and companions;
    - its composition along the three dimensions;
    - the formations it qualifies for, and why;
    - its collective abilities and their limits;
    - its careers;
    - what changes when the composition changes.

    The terminal shows the same through the headless player view.

## Sequence

1. Stabilize the first hour and its action, perception, navigation and persistence contracts (Mission 20).
2. Build a dense alternative opening as a playable experiment, and compare it with the origin introductions.
3. Make one or two early recruitments genuinely discoverable, and add a minimal Company page.
4. Build the three-dimensional formation model through a few distinctive working examples, including a Synod.
5. Show one background specialization revealed in a natural conversation, with real mechanical and narrative effects.
6. Show one formation- or background-linked career opportunity that varies with the generated world.
7. Then extend the library of formations, specializations, prestige careers and openings, using the mechanisms
   already proven.

Prove each system before attempting combinatorial coverage. Keep one canonical application on `main`, and never build
a second runtime mechanism beside an existing one.

## Where it meets what exists (to be completed in Mission 20's handoff)

- **Companionship facet:** Companions (src/presentation/companions.ts) already marks only genuine recruitment, rose in
  the atlas.
- **Perception range:** Perception (src/presentation/perception.ts) is one node by default and three for Gregarious.
- **The Eye:** already a deliberate search (assess only), the third tier above.
- **Origins:** origin aims (`origin__…`) and their opening lines are the material the new opening would mine.
- **Party composition:** Orsino/Morcino catalogues live in data/catalog/orsino and the registry ledger. They should be
  read before a formation catalogue is designed.
