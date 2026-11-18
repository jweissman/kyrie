# Plain prose, and the journey as the unit of review (the owner, 17 November 2026, night)

Verbatim:

> I appreciate the narrow fix to the language for clarity of the scene; it's definitely an improvement. But I do want to register that I remain deeply dissatisfied with the mouthfeel of Westernesse's prose overall.
>
> The example I just encountered is:
>
> "The horse throws its head twice and then leans into the collar. With the wagoner roaring at the wheel, the cart comes up out of the ditch in a slither of meal."
>
> This is not acceptable prose. The imagery is strained, the physical event is obscured, and the sentence sounds unpleasant.
>
> Please locate and correct this passage, then investigate why similarly poor prose continues to survive despite our existing editorial guidance.
>
> **I would like a change of default literary policy.**
>
> For ordinary actions, travel, generated descriptions, observations, and consequences, favor plain, exact, literal English.
>
> Write what physically happens. Use concrete nouns, accurate verbs, and straightforward syntax. Do not invent metaphors or decorative sensory details merely to make a sentence sound literary.
>
> Good prose is not necessarily elaborate prose.
>
> In particular:
>
> 1. Review `doc/authoring/narratology.md`, the existing editorial standards, and the November prose-density audit. Identify why previously recognized problems persist.
> 2. Establish a source-level prose linter for exact banned expressions, known bad constructions, repeated filler, and errors in generated substitutions.
> 3. Maintain an evidence-based watchlist of suspicious constructions for editorial review. Do not globally ban useful ordinary words merely because they occur in one bad sentence.
> 4. Audit high-frequency first-hour action results, especially the generated origins, travel, conversations, and ordinary manipulation verbs. Rewrite mechanically ornate results into literal, causally intelligible prose.
> 5. Test filled templates rather than only their unexpanded source text.
> 6. Introduce a short editorial comparison using actual play transcripts: original sentence, proposed replacement, and the reason for the edit.
> 7. Read candidate passages aloud as part of human editorial acceptance. Mechanical tests cannot replace judgment about cadence, diction, emphasis, or sound.
>
> For the most frequently encountered passages, I'd prefer an explicit human-approved reference corpus to repeated autonomous polishing passes.
>
> Please do not respond by adding more adjectives, evocative metaphors, varied synonyms, or a new general-purpose prose generator.
>
> And please preserve genuinely excellent authored prose. A remarkable moment can deserve a remarkable sentence. I am specifically trying to eliminate the habit of treating **every** mundane event as an opportunity for strained poetic invention.
>
> **The acceptance standard is simple: I should be able to read a paragraph aloud without stumbling over its grammar, wondering what its imagery means, or wishing the author had just said what happened.**
>
> As part of this, I would like to explore a development-only facility for reading and reviewing actual Westernesse playthroughs.
>
> The core need is to let an editorial agent or human reviewer examine prose **in the sequence and presentation in which the player encountered it**, instead of editing disconnected strings and templates.
>
> Please investigate reusing the existing PlaySession transcripts, checkpoints, journey tooling, narrator projections, and browser reader.
>
> For a first proof, take one representative recorded opening and produce:
>
> 1. **A readable chronological account** of the journey, organized into places, choices, events, consequences, and changes in the player's understanding.
> 2. **A step inspector** showing the exact narration presented, what the player chose, and what the scene offered before and afterward.
> 3. **A scene view** that can reproduce a selected step through the normal game presentation, without replaying the entire adventure in a browser.
> 4. **Source provenance** connecting displayed prose back to its Kyr declaration or generating template, where this can be established reliably.
> 5. **Editorial annotations** for problems such as bad diction, duplication, confusing causality, excessive narration, or incorrect emphasis.
> 6. **A before-and-after comparison** of the same journey following a prose revision.
>
> Preserve the distinction between originally captured player-visible output and a fresh replay under changed code. Never silently substitute one for the other.
>
> Generate review artifacts headlessly wherever possible; reserve browser rendering for selected scene inspections.
>
> Do not build a complete editorial CMS or new replay engine. Begin with one useful reading experience over an existing recorded run.
>
> **The purpose is to make the whole journey, rather than the isolated sentence, the basic unit of literary review.**
