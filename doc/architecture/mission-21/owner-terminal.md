# The owner, 14 November: the terminal as the cheapest place to catch it (verbatim)

A few ideas on the terminal experience you could explore if you have bandwidth. It would be nice to be able to use it to verify invariants.

1. Build a deterministic terminal/headless walker that exercises representative gameplay over several seeds, starting backgrounds, and play styles.

For each run independently, measure automatically displayed scene narration and fail if the average exceeds three sentences per scene presentation.

Report the average, median, and worst outliers, so a few severely verbose scenes cannot disappear behind the average.

Instrument the real narrative output rather than testing isolated example strings.

Distinguish scene narration from player-requested detailed inspection, action outcomes, dialogue, and explicit reference screens. Do not evade the budget by moving introductory prose into another automatically displayed field.

We want concise initial scenes, not a prohibition on substantial writing when a player chooses to investigate or converse.

2. Stop repeating unchanged information

A common problem in the terminal is that nearly every command produces another full description of where the player is, the day, the hour, and familiar surroundings.

Treat arrival, deliberate observation, and action resolution differently.

On arrival, present the scene briefly.

After an action, primarily present what happened, what changed, what became newly significant, and what the player can do next.

Do not automatically repeat full scene narration, location headers, date, time, party status, or unchanged facts on every turn.

Show calendar and time information when it changes meaningfully, when context makes it important, or when the player explicitly asks. Ordinary repetition of the current date is not useful.

Add regression checks for redundant narration and repeated static context. Include a walker that spends several turns within the same location. Ideally this also results in a simplification of the browser UI as well; we don't need static rails everywhere with unchanging information; "Day 1" is a good opportunity for a dramatic stab at dawn, not a component always rendered to the screen.

3. Make ANSI color semantically identical to the browser

The terminal should use the established atlas faithfully, preferably with ANSI true color and graceful reduced-color/plain-text fallback.

There should be one authoritative opportunity projection, not separate terminal and browser interpretations.

The terminal and browser should agree on:

Which actions are available.

Their stable identifiers, targets, and semantic facets.

Which opportunities belong to which people, objects, and locations.

Which concrete actions realize advertised opportunities.

Which undertaking, if any, is followed.

Which action legitimately carries golden-path emphasis.

Which opportunities are exhausted, unavailable, uncertain, or distant.

Use the canonical atlas palette and established multifacet treatment, including restrained prismatic indications where genuinely appropriate.

Do not use string matching, action-label heuristics, or terminal-specific color classifications.

Personhood, navigation markers, and UI categories should not acquire invented semantic colors.

A terminal action highlighted blue should carry the same knowledge facet as its browser counterpart. No followed undertaking means no gold in either client.

4. Exercise every major observation and action surface

The walker should go beyond repeatedly choosing the top action.

Exercise resting scenes, People/Things/Places lenses, expanded actions, examination, searching, dialogue, companionship, undertaking following, local travel, routing, waiting, inventory, and combat where the fixture supports them.

A lens changes what is foregrounded, not the underlying truth of available actions.

Ensure the terminal can show both the small promoted action set and the fuller available action set without presenting a giant undifferentiated catalogue every turn.

Also verify that action outcomes remain succinct and specific rather than repeating the complete observation snapshot.

5. Keep the tests cheap and meaningful

Most prose-budget, atlas-parity, and projection tests should use tiny Kyr fixtures or saved deterministic observations. These belong in the fast suite.

Add a smaller number of complete terminal playthroughs using actual Westernesse composition to the appropriate headless/full-confidence tier.

Do not burden the under-30-second quick-suite objective with multiple expensive world initializations.

Preserve captured readable transcripts as review artifacts. They should let a human judge rhythm, legibility, repetition, meaningful choice, and the actual use of color.

6. Provide a clear acceptance report

Demonstrate:

Several independently passing walker runs, each averaging no more than three sentences of automatically presented scene prose.

No routine restatement of unchanged location/time/status information after every action.

Exact parity of underlying observer/action/atlas semantics between terminal and browser for matched game states.

Faithful ANSI coloring of those semantics.

Readable, concise transcripts showing arrivals, investigation, conversation, movement, waiting, and combat.

Regression tests that make subsequent verbosity and projection drift visible.

The terminal should become the cheapest place to catch an oververbose, misleading, repetitive, or semantically inconsistent presentation of the game. It would be nice too if we could run full character creation flow via `bin/kyrie adventure` (currently it just lands you in town with a random character).
