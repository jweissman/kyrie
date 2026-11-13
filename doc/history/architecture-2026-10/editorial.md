# Editorial standards, with examples from mission 7

Kyr's text follows five rules:

1. Say each thing once, where it happened.
2. Never state what the game cannot vouch for.
3. Keep the player's knowledge honest about its source.
4. Keep system guidance apart from the fiction.
5. Never let the implementation show.

The examples below are changes made in this mission. Each was found by playing or by reading generated text.

## Knowledge keeps its provenance

The journal used to sort facts into "Seen for yourselves" and "Heard from others" by matching words ("told you",
"said") in the line that described how a fact was learned. It now sorts by where each fact came from:

| Before | After |
|---|---|
| Two groups, found by wording. A report the company had since seen for itself stayed under "Heard". | **Seen for yourselves** (witnessed, or found in a source)<br>**Heard, and since seen for yourselves** (a report borne out)<br>**Heard, not yet seen for yourselves** (only heard, so possibly untrue) |

A topic records who taught a fact (`toldBy`), and an observation or a search records that the company saw or found
it. So a report stays a report until the company sees the thing itself.

## A scene does not state what something else reports

| Before (after paying the Toll) | After |
|---|---|
| "The road runs straight into a gatehouse built across the Gap. **The gate is shut.** A board nailed to it reads TOLL…" and, below it, "The outer gate stands open." | "The road runs straight into a gatehouse built across the Gap. A board nailed to the gate reads TOLL…" and "The outer gate stands open." |

The gate reports its own state. The scene describes only what does not change.

## A passage's name does not point one way

| Before | After |
|---|---|
| Take the lane to the ford to Crake's Ford | Take the ford lane to Crake's Ford |
| Take the last pull to the Toll to the Toll gate | Take the last pull to the Toll gate |
| Take the salt road down the Varrow to the sea to the salt pans | Take the salt road to the salt pans |
| Take the slope down into the cinders to the ash road | Take the slope of the cinder hollow to the ash road |

A passage is walked both ways, and its label already names where it leads. Eighteen passages were renamed.

## Being stopped is told once

| Before | After |
|---|---|
| Response: "The dust at the Mere's edge breathes in, and out…" and the same words again among what happened. | Response: "The thing under the Mere stops you." The warning appears once, among what happened. |

## A place's law is the place's, not each creature's

| Before | After |
|---|---|
| A red "The Unlit's law" chip on every companion and every foe, styled like a harmful condition. | One line under the fight's heading: "The Unlit's law: In the Unlit fire burns small and cold, wounds close slowly, and fear comes easily." |

## People do not say what they cannot know

| Before | After |
|---|---|
| The Hollow Warden: "The Lanthorn's, which you came by." He says this even to a company that came up the drowned stair. | "The Lanthorn's, under its deep cellar." |

## Labels distinguish what they do

| Before | After |
|---|---|
| Two identical choices, "Have Maeve prepare Hex in place of Light", for a spell held in two slots. | "Have Maeve prepare Hex in place of Light, in a fifth-level slot" |
| "a level 7-level slot", "a eighth-level slot" | "a seventh-level slot", "an eighth-level slot" |
| "2 different enemies, drawn at random gains paralyzed" | "each of them gains paralyzed" |
| "One of these, drawn at random: 4d6 fire damage to one enemy / 3d12 cold damage to one enemy…" | "On one enemy, one of these, drawn at random: 4d6 fire damage to it / 3d12 cold damage to it…" |

## The manuals say what the game runs

The Player's Handbook, Dungeon Master's Guide and Monster Manual are generated from the definitions the game plays.
An entry's rules text comes from its typed mechanics, never from Orsino prose describing something Kyr does not run.

Snipe is an example. Orsino describes it as "a vital spot" with bonus damage, but Orsino's own attack ignores that
bonus. The registry now judges the field cosmetic, and the handbook says Snipe is a weapon attack.

A creature's description is written from its definition, for example: "A beast of Orsino's bestiary. It fights with
claws, armoured in hide armor, and knows Maul, Charge, Rage, Poison Bite and Stomp." No lore is invented for it.
