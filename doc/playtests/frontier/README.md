# Saint Orra and the northern margin: recorded evaluation

This is a **developer task walkthrough**, not an independent first-time-player usability study. Real Chromium exercised the built static page at desktop 1440×1000 and mobile 390×844. Screenshots were inspected for scene hierarchy and mobile flow. Automated completion, deterministic outcomes and screenshots do not establish enjoyment or human comprehension.

Build with `bun run web:build` and open `site/index.html`. The default campaign is `data/orra/play.campaign.json`. `workbench.html` remains the separate developer interface.

## What was actually exercised in the player

Both runs chose an editable three-person example through the creator, entered the same seeded world, spoke with Mere and Ys, investigated the accusation, explored the watchtower, recovered Ys, selected a recipient for the cinder seal, rested, reloaded the saved journey, travelled north, spoke with the guide, bought supplies, fought the altered wolf, stopped the ice-pump, collected salvage and returned for recovery. Combat choices were made through the encounter interface; the learned fire invocation was actually used. The Fellowship also exercised institutional passage, ally-targeted healing and field care.

| Task | Observed evidence | Remaining concern |
|---|---|---|
| Locate party and understand arrival | Dominant place heading, visible people, changing scene and explicit travel destinations | Introductory prose gives unusually exact conclusions/deadlines; not all are independently discovered |
| Find and speak with an NPC | Co-located named topics; Mere explains the accusation; Ys explains the drain and her return | Flat topic lists and generic sharing become long; no unrestricted conversation |
| Identify two concerns | Refuge water/accusation, missing healer and northern frost appear through scene/topics | We have not asked an unfamiliar human to describe them |
| Recognize action consequences | Immediate result, supply deltas, discoveries and changed options directly beneath scene heading | Some generic action phrasing remains stilted; not every unavailable intention has an explanation |
| Travel | Explicit destination buttons; secondary map distinguishes local route availability from remote unconfirmed connections | Geography remains abstract; long pages can hide exits below interactions |
| Understand time | Day/time header, command duration and six-hour recovery; actual deadlines continue | An encounter's local rounds all occupy one campaign tick; this is an abstraction |
| Create a meaningful party | Data-backed ancestry/class choices; actual capability providers visible; Fellowship passage and ranger access differ | Fixed three-member company; no recruiting; composition explanation is not a full rules tutorial |
| Interpret encounter | Named abilities, targets, rolls/saves, damage, conditions, resolution and aftermath | Long logs and signed resistance values still require interpretation |
| Continue after reward and recovery | Cinder becomes a usable learned ability in expedition two; rest restores survivors; a dead companion stays dead | XP does not yet produce automatic levels; no equipment progression |

### Screenshots

| Stage | Desktop / primary view | Mobile / contrasting view |
|---|---|---|
| Party creation | [Fellowship creator](fellowship-creator-desktop.png) | [Creator, mobile](fellowship-creator-mobile.png) |
| Arrival | [Location-first arrival](fellowship-arrival-desktop.png) | [Later scene, mobile](fellowship-scene-mobile.png) |
| Conversation and feedback | [Conversation](fellowship-conversation.png) | [Hearing consequence](fellowship-hearing-feedback.png) |
| Reward and recovery | [Cinder seal](fellowship-reward.png) | [Recovery](fellowship-recovery.png) |
| Encounter | [Learned invocation available](fellowship-learned-spell-encounter.png) | [Hired company aftermath](hired-combat-aftermath.png) |
| Party continuity | [Fellowship sheet](fellowship-party-desktop.png) | [Hired party, mobile](hired-party-mobile.png) |
| Field use | [Actual field healing result](fellowship-field-care.png) | [Fellowship party, mobile](fellowship-party-mobile.png) |

[Browser measurements](browser-results.json) record no page errors or horizontal overflow in either run. Both resumed after reload. The Fellowship used Cinder once and targeted healing once in combat; the hired company used Cinder twice. Six-hour rests completed in roughly 0.95–1.08 seconds on this Chromium environment, not a general performance guarantee. Mobile screenshots show a real remaining problem: a returned party can have many lengthy “Tell Mere…” options. The hierarchy is clearer, but prioritization and conversational pacing need human testing.

## Divergent headless histories

These use the same initial seed and canonical lifecycle; automated combat decisions differ from some manual browser choices.

| History | Material result |
|---|---|
| [Fellowship expeditions](fellowship-expeditions.md) | Clears accusation, stops both machines, saves camp, kills wolf; all three survive and recover. Stopping kiln also loses refuge heat. |
| [Hired expeditions](hired-expeditions.md) | Same environmental interventions, different combat kit; Nell dies and remains dead after recovery. |
| [Scout bypass](scout-bypass.md) | Uses learned ledge; stops frost without killing wolf; the guardian remains a persistent living creature. |
| [Unresolved and abandoned](unresolved-and-abandoned.md) | Returns healer but leaves accusation/water unresolved. Water spoils, Tamsin is expelled, guide relocates, camp freezes. Recovery attempted across the freeze deadline fails; campaign continues. |

[Comparison](comparison.json) includes exact final resources, conditions, learned abilities and independent outcome dimensions. Each history has adjacent `.replay.json` and `.save.json` files. Actual UI histories are [Fellowship replay](fellowship.browser.replay.json) and [hired replay](hired.browser.replay.json), with corresponding `.browser.save.json` checkpoints. They include manual combat choices and party creation inputs. Both actual browser checkpoints were also compared against CLI replay and matched canonical state exactly.

```sh
bun run bin/record-frontier.ts
bun run kyrie replay doc/playtests/frontier/fellowship.browser.replay.json
bun run check
# Enable actual Chromium parity when a Chromium binary is installed:
KYRIE_CHROMIUM=/path/to/chromium bun test test/browser-parity.test.ts
```

The final check passed **149 tests, 3,211 assertions**, with one optional Chromium test skipped. The separate Chromium-enabled parity suite passed **13 tests, 48 assertions**, including eleven histories replayed across hosts. Focused loop tests verify field healing/removal and mana cost, conversations/private knowledge, persistent reward/death/conditions, rest interrupted by deadline, bypass, generation composition and source roundtripping. Currency transfers conserve finite coin; salvage comes from a finite stock, not invented narrative rewards.

## Instantiated region and authoring evidence

The author-only [fen dossier](fen.dossier.json) and [pine dossier](pine.dossier.json) expose generated people, attributes, knowledge, resources, schedules and bindings. These are omniscient artifacts and are not player information. Their [fen](fen.lowered.kyr) and [pine](pine.lowered.kyr) lowered source makes executable relationships inspectable. Both use the same site and rules; contexts change independent generation inputs rather than select complete regional profiles.

Read the [player journey](../../frontier-player-journey.md), [actual source-package analysis](../../authoring/frontier-package.md) and [updated Orsino audit](../../orsino-compatibility.md).

## Honest assessment

The useful gain is a complete continuing loop with legible consequences and a mechanically relevant reward, not a proven compelling campaign. The north is still largely a guardian/mechanism problem. Clues are unusually conclusive, trustworthy communication often changes a goal immediately, and posted-price trade has no negotiation. Coin-by-coin salvage is repetitive. Party choices produce real options and casualties, but many objectives can still be completed with identical interventions. The fiction mentions illness, livelihood and institutional motives beyond the current medical/economic mechanics. Equipment, advancement, richer uncertainty and NPC commitments remain gaps. A first-time human task test is the necessary next evidence before expanding the region further.
