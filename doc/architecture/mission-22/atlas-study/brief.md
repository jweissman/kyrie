# The Colour Atlas and the atlas of intentions: a study commission (the owner, 17 November 2026, late)

Verbatim:

> We should think carefully about the color atlas as part of m22 focus on action menu item button. **Please do not implement a sixth color or a Heart lens yet.** Instead, commission an independent, evidence-based study of the current Color Atlas, the action-intention vocabulary, and how these might develop together.
>
> The purpose is to make the Color Atlas a more comprehensive and useful design instrument without sacrificing its sparseness, clarity, or established semantic meaning.
>
> ## 1. Recover the history and current design
>
> Begin by reading:
>
> - `doc/design/ATLAS.md`, `DOCTRINE.md`, and `GRAMMAR.md`.
> - `doc/architecture/mission-21/colour-atlas.md`.
> - `doc/architecture/mission-21/terminal/human-mode.md`, especially TP-03.
> - `doc/architecture/mission-22/phases-abc-brief.md`, Phase C.
> - `src/presentation/aspects.ts`, `emphasis.ts`, and `glance-types.ts`.
> - `src/ui/affordances.ts`, `promotion.ts`, and the existing lens and action-projection code.
>
> Recover the historical reasons for introducing, combining, and removing colors. Distinguish owner decisions, builder implementations, later corrections, and unresolved hypotheses.
>
> In particular, review why rose/coral and silver were removed, why companionship became an icon, why general exploration has no semantic hue, and why red was restricted to actual danger.
>
> Identify outdated documentation and comments, but do not silently rewrite the doctrine as part of the study.
>
> ## 2. Audit the Color Atlas in actual play
>
> Report the five current semantic colors and the opportunity aspects they represent, including their sources, precedence, combinations, and visual treatment.
>
> Examine a representative collection of actual generated and authored scenes, covering exploration, combat, dialogue, trade, investigation, recruitment, magic, and ordinary livelihoods.
>
> For each meaningful action, record:
>
> - Its underlying action kind and declared semantics.
> - Its player-facing intention and actual consequence.
> - Its opportunity aspect or aspects.
> - Its displayed hue, icon, and intensity or other treatment.
> - Whether it is promoted into the four foreground actions.
> - Whether the displayed treatment accurately represents what is possible.
>
> Look especially for false promises, ambiguous colors, missed opportunities, repetitive foregrounds, and semantically important actions presented as indistinguishable neutral choices.
>
> Do not reward the system merely for showing more colored actions.
>
> ## 3. Develop a provisional atlas of player intentions
>
> Inventory the actual action categories and verbs currently supported by Kyr, the campaign runtime, the presentation system, and existing adventures.
>
> From this evidence, develop a provisional taxonomy of approximately **10–12 broad intention families**, such as exploring, investigating, understanding, influencing, confronting, protecting, manipulating, acquiring, creating, exchanging, commanding, and enduring.
>
> These examples are starting points, not predetermined categories.
>
> For each family, establish what executable actions already exist; which character capabilities make them available or effective; which situations, stakes, costs, checks, and consequences they can involve; and which important actions or mechanisms remain missing.
>
> Compare the intention taxonomy with the existing Color Atlas.
>
> I would like to know whether the colors can act as broad families of intention, or whether they should remain an orthogonal description of what an opportunity promises.
>
> Pay special attention to gold, which currently represents advancement toward an undertaking rather than a type of action, and violet, which represents wonder rather than a particular verb.
>
> Do not force a one-to-one mapping if the resulting categories become misleading.
>
> ## 4. Reconsider rose, coral, and social influence
>
> Please investigate, without presuming the answer, whether social influence deserves a distinct semantic aspect.
>
> Distinguish:
>
> - The mere presence of another person.
> - Ordinary conversation or a willingness to cooperate.
> - A possible companion, already identified by a companionship icon.
> - A social challenge involving uncertainty, resistance, or meaningful stakes.
> - Leadership, inspiration, persuasion, recruitment, intimidation, deception, mediation, or speaking to a crowd.
> - Perceiving public sentiment, morale, loyalty, or other social information.
>
> One possibility is that an influence color should mean something narrow: **a consequential social challenge**, rather than every interaction involving a person.
>
> If that proves meaningful, investigate whether rose/coral is sufficiently distinct from danger red, or whether another restrained treatment would be more appropriate.
>
> But compare that proposal against retaining the existing five colors and using neutral person icons, action labels, context, and inspection details.
>
> I am not yet convinced we need another hue.
>
> Please also examine the underlying mechanics. When does influence require a Charisma-related check, a contested roll, a difficulty class, resources, persuasion through evidence, or simply the consent of a willing character?
>
> Do not adopt a universal DC or roll formula without examining the actual rules and intended behavior. The color should communicate a real mechanical or dramatic distinction, not create a rule that every interaction must obey.
>
> ## 5. Consider the Heart or Influence lens separately
>
> The idea of a Heart lens remains worth examining, especially if the game develops several distinct social verbs.
>
> It might provide a natural place for crowd sentiment, morale, inspiration, recruitment, negotiation, and leadership.
>
> But perhaps those actions belong more naturally within the existing People lens, or within a situational social instrument.
>
> Compare the alternatives with a small social scenario involving one individual, a potential recruit, and a group or crowd.
>
> Evaluate whether the proposed lens makes meaningful possibilities more discoverable, or merely introduces another mode that the player must learn.
>
> A lens should remain an instrument of attention over the authoritative action set, never a separate collection of invented actions.
>
> ## 6. Study the four-action foreground using both aspects and verbs
>
> Investigate whether the promotion system can select more experientially diverse opportunities when several candidates are similarly relevant.
>
> Compare diversity of colors, intention families, targets, methods, risks, and likely consequences.
>
> Maintain the overriding importance of urgent danger, immediate needs, the followed undertaking, and genuine salience.
>
> Do not enforce four different colors, or fabricate extra choices to meet a diversity target.
>
> We want to understand whether a scene presents four genuinely different possibilities, not simply four different-looking controls.
>
> ## 7. Include shade, intensity, and distance
>
> Review the earlier proposal to distinguish semantic **hue** from characteristics such as novelty, proximity, urgency, uncertainty, difficulty, depletion, and repetition.
>
> These should not automatically become new colors.
>
> Examine how brightness, contrast, opacity, animation, iconography, and other restrained treatments could express these qualities without undermining accessibility or the established meaning of the primary hues.
>
> A distant, uncertain opportunity should not be mistaken for an immediately executable action.
>
> ## 8. Deliver a recommendation, not a reimplementation
>
> Please produce:
>
> 1. A concise historical account of the Color Atlas and its prior design decisions.
> 2. A current-state audit grounded in code and actual scenes.
> 3. An inventory and proposed taxonomy of player intentions and executable verbs.
> 4. A matrix showing how intentions, opportunity aspects, action categories, character capabilities, and visible treatments relate.
> 5. A focused comparison of social influence with and without a sixth hue or dedicated lens.
> 6. Several candidate models for the future Color Atlas, with explicit advantages, disadvantages, and migration costs.
> 7. A recommendation for a smallest playable experiment, if one is warranted.
>
> The report should separate established facts, test findings, aesthetic judgment, and speculative design.
>
> **Do not alter the palette, introduce new lenses, change promotion policy, or revise the semantic contracts until the study has been reviewed.**
>
> The central question is:
>
> *Can the Color Atlas become a comprehensive, disciplined atlas of the meaningful things a player can intend and accomplish—without becoming a rainbow of arbitrary interface categories?*
>
> Its purpose remains to make Westernesse's possibilities legible, distinctive, and inviting, not merely to classify everything the engine can do.
