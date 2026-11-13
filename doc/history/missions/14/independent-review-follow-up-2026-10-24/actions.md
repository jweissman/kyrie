# Graphical play chronology and complete capture index

Read alongside [the report](report.md). All times below are EDT on 24 October 2026. These are **state captures**, not a count of distinct actions: some captures follow several clicks, and some record the same subject after inspection. The full [command log](evidence/commands.jsonl) preserves actual attempted selectors and actions; the [screen text log](evidence/screens.jsonl) preserves each captured visible screen. Selector failures and captures taken before a transition settled were not counted as game defects.

## Session chronology

- **12:53–1:00, Wenna:** create through the normal interface; read the shrine letter; inspect the altar and lockup; recruit Roondar; follow the fallen-wall lead; investigate Ferrumlapis; hear Garth's missing-sheep lead and take the offered torch. The location did not expose a usable descent. Stop rather than repeat search indefinitely.
- **1:00–1:09, Mira:** create a human ranger with debt; request an extension and discover its price after commitment; hear the tower rumor; recruit Epona; travel via the toll ford; see Epona welcomed at home; offer her historical account to Dayereth and recruit him after a successful argument.
- **1:09–1:16:** pursue Rosaturris, inspect portcullis and other approaches, read capability requirements, and fail to obtain a usable entrance. Return, recruit Rolen, ask the well question, rest, and follow Seren's lead to Argentumons.
- **1:16–1:21:39:** cautiously spring an entrance enchantment with a pole; light a torch; inspect a lamp; collect coins; read the explorer's notebook; take spare light; descend to the hounds. Exercise ally targeting, Guard, healing and offensive abilities. Pause during combat.
- **1:21:39–2:49:03:** interrupted; no play. The already loaded page remains on the first build. Exclude this interval from duration.
- **2:49–2:54:56:** finish the hounds, inspect the aftermath and party, retreat via a marsh shortcut, repay the debt, sell the lamp, buy and use bandages, inspect Notes, and export a normal save.
- **2:55–3:00, Ada:** clean browser context and new human warrior; recruit brother Ulric; hear his cart-wheel clue and Nan's news; pet the muddy dog; follow the ruts and find the father's body; tell the brother who witnessed it; take the knife; return to the mother and show it. Recruit Jade and ask about old script and the singing halls.
- **3:00–3:07:** follow the player-visible forest-edge route to Carmencaw; investigate and safely trigger the switch; light a torch; explore the listening room; take the cantor token; inspect and lift a seized pivot door; descend to the choir.
- **3:07–3:10:** encounter a banshee; attempt withdrawal twice unsuccessfully and once successfully; inspect Jade's injury and the inaccessible caster sheet; save and successfully restore in the same running application.
- **3:10–3:13:49:** retreat to Guldhricg; see Jade recognized; buy a torch and pay for healing; inspect remaining provisions. Later captures retain Pack, Story, and Notes for evidence, rather than extending adventure play.
- **3:16–3:18:** bounded final check in a fresh browser on the newest identified deployment. Two ordinary Ada saves fail to import with `Unknown item definition cantor_token`. No additional adventure or full retest on that build.

## Capture-by-capture index

The screenshots are original captures. Interpretive annotations live in [the evidence index](evidence.md) and report; the raw UI text remains available for checking them.

| Capture | EDT | Build / journey | Visible-state label | Screenshot |
| --- | --- | --- | --- | --- |
| 001 | 12:53:40 | 4ecc0e82 / audit | title | Text log only |
| 002 | 12:53:48 | 4ecc0e82 / audit | creation | Text log only |
| 003 | 12:54:06 | 4ecc0e82 / audit | audit-arrival | Text log only |
| 004 | 12:54:24 | 4ecc0e82 / audit | audit-letter | Text log only |
| 005 | 12:54:40 | 4ecc0e82 / audit | audit-altar | [image](evidence/005-audit-altar.png) |
| 006 | 12:54:51 | 4ecc0e82 / audit | audit-altar-examine | [image](evidence/006-audit-altar-examine.png) |
| 007 | 12:55:07 | 4ecc0e82 / audit | audit-town | Text log only |
| 008 | 12:55:23 | 4ecc0e82 / audit | audit-lockup-inspect | [image](evidence/008-audit-lockup-inspect.png) |
| 009 | 12:55:36 | 4ecc0e82 / audit | audit-lockup-look | Text log only |
| 010 | 12:55:57 | 4ecc0e82 / audit | audit-inn | Text log only |
| 011 | 12:56:17 | 4ecc0e82 / audit | audit-recruit-offer | Text log only |
| 012 | 12:56:41 | 4ecc0e82 / audit | audit-innkeeper-topics | Text log only |
| 013 | 12:56:49 | 4ecc0e82 / audit | audit-walls-lead | Text log only |
| 014 | 12:57:14 | 4ecc0e82 / audit | audit-road | Text log only |
| 015 | 12:57:26 | 4ecc0e82 / audit | audit-ruin | Text log only |
| 016 | 12:57:40 | 4ecc0e82 / audit | audit-ruin-search | [image](evidence/016-audit-ruin-search.png) |
| 017 | 12:58:00 | 4ecc0e82 / audit | audit-pit | Text log only |
| 018 | 12:58:30 | 4ecc0e82 / audit | audit-shepherd | Text log only |
| 019 | 12:58:43 | 4ecc0e82 / audit | audit-pit-lead | [image](evidence/019-audit-pit-lead.png) |
| 020 | 12:59:05 | 4ecc0e82 / audit | audit-torch-taken | Text log only |
| 021 | 12:59:20 | 4ecc0e82 / audit | audit-pit-search | [image](evidence/021-audit-pit-search.png) |
| 022 | 12:59:46 | 4ecc0e82 / Mira | audit-notes | Text log only |
| 023 | 13:00:03 | 4ecc0e82 / Mira | journey1-creation | Text log only |
| 024 | 13:00:28 | 4ecc0e82 / Mira | journey1-arrival | [image](evidence/024-journey1-arrival.png) |
| 025 | 13:00:45 | 4ecc0e82 / Mira | journey1-creditor | Text log only |
| 026 | 13:01:01 | 4ecc0e82 / Mira | journey1-extension | [image](evidence/026-journey1-extension.png) |
| 027 | 13:01:27 | 4ecc0e82 / Mira | journey1-market | [image](evidence/027-journey1-market.png) |
| 028 | 13:01:38 | 4ecc0e82 / Mira | journey1-inn | Text log only |
| 029 | 13:01:54 | 4ecc0e82 / Mira | journey1-inn-topics | Text log only |
| 030 | 13:02:10 | 4ecc0e82 / Mira | journey1-tower-rumor | Text log only |
| 031 | 13:02:33 | 4ecc0e82 / Mira | journey1-companion | Text log only |
| 032 | 13:02:58 | 4ecc0e82 / Mira | journey1-recruited | [image](evidence/032-journey1-recruited.png) |
| 033 | 13:03:09 | 4ecc0e82 / Mira | journey1-song | Text log only |
| 034 | 13:03:30 | 4ecc0e82 / Mira | journey1-map | [image](evidence/034-journey1-map.png) |
| 035 | 13:03:54 | 4ecc0e82 / Mira | journey1-woods-edge | Text log only |
| 036 | 13:04:09 | 4ecc0e82 / Mira | journey1-ford | Text log only |
| 037 | 13:04:24 | 4ecc0e82 / Mira | journey1-reeve | [image](evidence/037-journey1-reeve.png) |
| 038 | 13:04:46 | 4ecc0e82 / Mira | journey1-tatharimlad | [image](evidence/038-journey1-tatharimlad.png) |
| 039 | 13:05:00 | 4ecc0e82 / Mira | journey1-philosopher | Text log only |
| 040 | 13:05:19 | 4ecc0e82 / Mira | journey1-one | Text log only |
| 041 | 13:05:36 | 4ecc0e82 / Mira | journey1-argument | [image](evidence/041-journey1-argument.png) |
| 042 | 13:05:58 | 4ecc0e82 / Mira | journey1-philosopher-joins | Text log only |
| 043 | 13:06:20 | 4ecc0e82 / Mira | journey1-company | Text log only |
| 044 | 13:06:38 | 4ecc0e82 / Mira | journey1-pack | Text log only |
| 045 | 13:06:53 | 4ecc0e82 / Mira | journey1-spells | Text log only |
| 046 | 13:07:18 | 4ecc0e82 / Mira | journey1-recovery | Text log only |
| 047 | 13:07:36 | 4ecc0e82 / Mira | journey1-hills | Text log only |
| 048 | 13:07:51 | 4ecc0e82 / Mira | journey1-tower | [image](evidence/048-journey1-tower.png) |
| 049 | 13:08:08 | 4ecc0e82 / Mira | journey1-portcullis-options | Text log only |
| 050 | 13:08:26 | 4ecc0e82 / Mira | journey1-portcullis-look | [image](evidence/050-journey1-portcullis-look.png) |
| 051 | 13:08:54 | 4ecc0e82 / Mira | journey1-portcullis-push | Text log only |
| 052 | 13:09:11 | 4ecc0e82 / Mira | journey1-tower-search | [image](evidence/052-journey1-tower-search.png) |
| 053 | 13:09:30 | 4ecc0e82 / Mira | journey1-portcullis-listen | [image](evidence/053-journey1-portcullis-listen.png) |
| 054 | 13:10:44 | 4ecc0e82 / Mira | journey1-retreat-state | Text log only |
| 055 | 13:10:57 | 4ecc0e82 / Mira | journey1-resupply-inn | Text log only |
| 056 | 13:11:27 | 4ecc0e82 / Mira | journey1-soldier | Text log only |
| 057 | 13:11:43 | 4ecc0e82 / Mira | journey1-well-advice | [image](evidence/057-journey1-well-advice.png) |
| 058 | 13:12:40 | 4ecc0e82 / Mira | journey1-recruit-state | Text log only |
| 059 | 13:12:55 | 4ecc0e82 / Mira | journey1-return-alehouse | Text log only |
| 060 | 13:13:10 | 4ecc0e82 / Mira | journey1-seren | Text log only |
| 061 | 13:13:30 | 4ecc0e82 / Mira | journey1-deep-lead | [image](evidence/061-journey1-deep-lead.png) |
| 062 | 13:14:18 | 4ecc0e82 / Mira | journey1-mage-sheet | [image](evidence/062-journey1-mage-sheet.png) |
| 063 | 13:14:45 | 4ecc0e82 / Mira | journey1-light-prepared | Text log only |
| 064 | 13:15:08 | 4ecc0e82 / Mira | journey1-marsh | Text log only |
| 065 | 13:15:34 | 4ecc0e82 / Mira | journey1-mine | [image](evidence/065-journey1-mine.png) |
| 066 | 13:15:54 | 4ecc0e82 / Mira | journey1-adit-dark | Text log only |
| 067 | 13:16:01 | 4ecc0e82 / Mira | journey1-enchanted-options | Text log only |
| 068 | 13:16:08 | 4ecc0e82 / Mira | journey1-trap-examined | [image](evidence/068-journey1-trap-examined.png) |
| 069 | 13:16:15 | 4ecc0e82 / Mira | journey1-trap-sprung | [image](evidence/069-journey1-trap-sprung.png) |
| 070 | 13:16:27 | 4ecc0e82 / Mira | journey1-underground | Text log only |
| 071 | 13:16:45 | 4ecc0e82 / Mira | journey1-lit | [image](evidence/071-journey1-lit.png) |
| 072 | 13:17:08 | 4ecc0e82 / Mira | journey1-lamp | [image](evidence/072-journey1-lamp.png) |
| 073 | 13:17:18 | 4ecc0e82 / Mira | journey1-crossing | Text log only |
| 074 | 13:17:35 | 4ecc0e82 / Mira | journey1-coins | Text log only |
| 075 | 13:17:43 | 4ecc0e82 / Mira | journey1-coins-gathered | [image](evidence/075-journey1-coins-gathered.png) |
| 076 | 13:17:53 | 4ecc0e82 / Mira | journey1-winze | Text log only |
| 077 | 13:18:15 | 4ecc0e82 / Mira | journey1-notebook | Text log only |
| 078 | 13:18:21 | 4ecc0e82 / Mira | journey1-notebook-read | [image](evidence/078-journey1-notebook-read.png) |
| 079 | 13:18:53 | 4ecc0e82 / Mira | journey1-tools-collected | Text log only |
| 080 | 13:19:08 | 4ecc0e82 / Mira | journey1-light-inventory | [image](evidence/080-journey1-light-inventory.png) |
| 081 | 13:19:27 | 4ecc0e82 / Mira | journey1-below | Text log only |
| 082 | 13:19:52 | 4ecc0e82 / Mira | journey1-hounds-combat | Text log only |
| 083 | 13:20:01 | 4ecc0e82 / Mira | journey1-guard-targets | [image](evidence/083-journey1-guard-targets.png) |
| 084 | 13:20:20 | 4ecc0e82 / Mira | journey1-guard-applied | [image](evidence/084-journey1-guard-applied.png) |
| 085 | 13:20:31 | 4ecc0e82 / Mira | journey1-animal | Text log only |
| 086 | 13:20:44 | 4ecc0e82 / Mira | journey1-healing-targets | [image](evidence/086-journey1-healing-targets.png) |
| 087 | 13:20:52 | 4ecc0e82 / Mira | journey1-healed | Text log only |
| 088 | 13:21:13 | 4ecc0e82 / Mira | journey1-dancing-lights | Text log only |
| 089 | 13:21:22 | 4ecc0e82 / Mira | journey1-inspire | Text log only |
| 090 | 13:21:31 | 4ecc0e82 / Mira | journey1-second-wind | Text log only |
| 091 | 13:21:39 | 4ecc0e82 / Mira | journey1-hound-targets | Text log only |
| 092 | 14:49:03 | 4ecc0e82 / Mira | journey1-bow-targets | Text log only |
| 093 | 14:49:20 | 4ecc0e82 / Mira | journey1-bow-result | Text log only |
| 094 | 14:49:27 | 4ecc0e82 / Mira | journey1-scald | [image](evidence/094-journey1-scald.png) |
| 095 | 14:49:52 | 4ecc0e82 / Mira | journey1-round3-shot | Text log only |
| 096 | 14:50:12 | 4ecc0e82 / Mira | journey1-cold-snap | Text log only |
| 097 | 14:50:26 | 4ecc0e82 / Mira | journey1-epoca-strike | Text log only |
| 098 | 14:50:32 | 4ecc0e82 / Mira | journey1-preparation-options | [image](evidence/098-journey1-preparation-options.png) |
| 099 | 14:51:06 | 4ecc0e82 / Mira | journey1-hounds-finale | [image](evidence/099-journey1-hounds-finale.png) |
| 100 | 14:51:42 | 4ecc0e82 / Mira | journey1-postfight-sheet | [image](evidence/100-journey1-postfight-sheet.png) |
| 101 | 14:52:05 | 4ecc0e82 / Mira | journey1-outside-return | Text log only |
| 102 | 14:52:19 | 4ecc0e82 / Mira | journey1-shortcut | [image](evidence/102-journey1-shortcut.png) |
| 103 | 14:52:36 | 4ecc0e82 / Mira | journey1-creditor-return | Text log only |
| 104 | 14:52:46 | 4ecc0e82 / Mira | journey1-debt-paid | [image](evidence/104-journey1-debt-paid.png) |
| 105 | 14:53:05 | 4ecc0e82 / Mira | journey1-lamp-sold | [image](evidence/105-journey1-lamp-sold.png) |
| 106 | 14:53:48 | 4ecc0e82 / Mira | journey1-buy-healing | Text log only |
| 107 | 14:54:01 | 4ecc0e82 / Mira | journey1-bandages | Text log only |
| 108 | 14:54:19 | 4ecc0e82 / Mira | journey1-bandage-options | Text log only |
| 109 | 14:54:25 | 4ecc0e82 / Mira | journey1-bandage-targets | [image](evidence/109-journey1-bandage-targets.png) |
| 110 | 14:54:35 | 4ecc0e82 / Mira | journey1-bandaged | [image](evidence/110-journey1-bandaged.png) |
| 111 | 14:54:56 | 4ecc0e82 / Mira | journey1-notes-complete | [image](evidence/111-journey1-notes-complete.png) |
| 112 | 14:54:58 | 56216495 / Ada | journey2-creation | Text log only |
| 113 | 14:55:28 | 56216495 / Ada | journey2-creation-ready | Text log only |
| 114 | 14:55:40 | 56216495 / Ada | journey2-home-arrival | Text log only |
| 115 | 14:55:53 | 56216495 / Ada | journey2-home-ready | [image](evidence/115-journey2-home-ready.png) |
| 116 | 14:56:02 | 56216495 / Ada | journey2-landing | Text log only |
| 117 | 14:56:20 | 56216495 / Ada | journey2-brother | [image](evidence/117-journey2-brother.png) |
| 118 | 14:56:35 | 56216495 / Ada | journey2-family-plan | Text log only |
| 119 | 14:56:45 | 56216495 / Ada | journey2-brother-joins | [image](evidence/119-journey2-brother-joins.png) |
| 120 | 14:56:55 | 56216495 / Ada | journey2-father-route | [image](evidence/120-journey2-father-route.png) |
| 121 | 14:57:14 | 56216495 / Ada | journey2-nan | Text log only |
| 122 | 14:57:27 | 56216495 / Ada | journey2-news | [image](evidence/122-journey2-news.png) |
| 123 | 14:57:34 | 56216495 / Ada | journey2-work-topic | Text log only |
| 124 | 14:57:45 | 56216495 / Ada | journey2-news-revisit | [image](evidence/124-journey2-news-revisit.png) |
| 125 | 14:58:05 | 56216495 / Ada | journey2-grey-dog | [image](evidence/125-journey2-grey-dog.png) |
| 126 | 14:58:22 | 56216495 / Ada | journey2-road | [image](evidence/126-journey2-road.png) |
| 127 | 14:58:32 | 56216495 / Ada | journey2-ruts-searched | [image](evidence/127-journey2-ruts-searched.png) |
| 128 | 14:58:44 | 56216495 / Ada | journey2-grief | Text log only |
| 129 | 14:58:54 | 56216495 / Ada | journey2-tell-brother | [image](evidence/129-journey2-tell-brother.png) |
| 130 | 14:59:08 | 56216495 / Ada | journey2-knife | [image](evidence/130-journey2-knife.png) |
| 131 | 14:59:15 | 56216495 / Ada | journey2-knife-taken | [image](evidence/131-journey2-knife-taken.png) |
| 132 | 14:59:30 | 56216495 / Ada | journey2-road-witness | Text log only |
| 133 | 14:59:39 | 56216495 / Ada | journey2-country-advice | Text log only |
| 134 | 14:59:53 | 56216495 / Ada | journey2-notes | [image](evidence/134-journey2-notes.png) |
| 135 | 15:00:14 | 56216495 / Ada | journey2-mother-inn | Text log only |
| 136 | 15:00:32 | 56216495 / Ada | journey2-mother | [image](evidence/136-journey2-mother.png) |
| 137 | 15:00:48 | 56216495 / Ada | journey2-homecoming | [image](evidence/137-journey2-homecoming.png) |
| 138 | 15:00:59 | 56216495 / Ada | journey2-knife-returned | [image](evidence/138-journey2-knife-returned.png) |
| 139 | 15:01:24 | 56216495 / Ada | journey2-scholar | Text log only |
| 140 | 15:02:25 | 56216495 / Ada | journey2-scholar-joined | Text log only |
| 141 | 15:02:43 | 56216495 / Ada | journey2-old-script | [image](evidence/141-journey2-old-script.png) |
| 142 | 15:03:02 | 56216495 / Ada | journey2-inn-rumors | Text log only |
| 143 | 15:03:17 | 56216495 / Ada | journey2-halls-lead | [image](evidence/143-journey2-halls-lead.png) |
| 144 | 15:03:45 | 56216495 / Ada | journey2-map | [image](evidence/144-journey2-map.png) |
| 145 | 15:04:12 | 56216495 / Ada | journey2-wright | Text log only |
| 146 | 15:04:28 | 56216495 / Ada | journey2-wright-talk | Text log only |
| 147 | 15:04:55 | 56216495 / Ada | journey2-woods-edge | Text log only |
| 148 | 15:05:08 | 56216495 / Ada | journey2-old-bank | Text log only |
| 149 | 15:05:29 | 56216495 / Ada | journey2-hall-track | Text log only |
| 150 | 15:05:52 | 56216495 / Ada | journey2-carmencaw | [image](evidence/150-journey2-carmencaw.png) |
| 151 | 15:06:05 | 56216495 / Ada | journey2-hall-mouth | Text log only |
| 152 | 15:06:14 | 56216495 / Ada | journey2-switch-look | [image](evidence/152-journey2-switch-look.png) |
| 153 | 15:06:39 | 56216495 / Ada | journey2-hall-dark | Text log only |
| 154 | 15:06:55 | 56216495 / Ada | journey2-hall-lit | [image](evidence/154-journey2-hall-lit.png) |
| 155 | 15:07:07 | 56216495 / Ada | journey2-listening-room | [image](evidence/155-journey2-listening-room.png) |
| 156 | 15:07:27 | 56216495 / Ada | journey2-echoing-gallery | Text log only |
| 157 | 15:07:41 | 56216495 / Ada | journey2-token | [image](evidence/157-journey2-token.png) |
| 158 | 15:07:56 | 56216495 / Ada | journey2-stair-head | Text log only |
| 159 | 15:08:11 | 56216495 / Ada | journey2-pivot-inspect | [image](evidence/159-journey2-pivot-inspect.png) |
| 160 | 15:08:25 | 56216495 / Ada | journey2-door-lifted | [image](evidence/160-journey2-door-lifted.png) |
| 161 | 15:08:40 | 56216495 / Ada | journey2-lower-halls | Text log only |
| 162 | 15:09:03 | 56216495 / Ada | journey2-choir | [image](evidence/162-journey2-choir.png) |
| 163 | 15:09:33 | 56216495 / Ada | journey2-flee | [image](evidence/163-journey2-flee.png) |
| 164 | 15:09:51 | 56216495 / Ada | journey2-withdrawn | Text log only |
| 165 | 15:10:16 | 56216495 / Ada | journey2-retreat-result | [image](evidence/165-journey2-retreat-result.png) |
| 166 | 15:10:35 | 56216495 / Ada | journey2-injured-sheet | [image](evidence/166-journey2-injured-sheet.png) |
| 167 | 15:11:16 | 56216495 / Ada | journey2-before-resume | [image](evidence/167-journey2-before-resume.png) |
| 168 | 15:11:17 | 56216495 / Ada | journey2-title-for-resume | Text log only |
| 169 | 15:11:34 | 56216495 / Ada | journey2-restored | [image](evidence/169-journey2-restored.png) |
| 170 | 15:12:20 | 56216495 / Ada | journey2-retreat-town | [image](evidence/170-journey2-retreat-town.png) |
| 171 | 15:12:57 | 56216495 / Ada | journey2-smith-resupply | [image](evidence/171-journey2-smith-resupply.png) |
| 172 | 15:13:21 | 56216495 / Ada | journey2-smith-buy | [image](evidence/172-journey2-smith-buy.png) |
| 173 | 15:13:34 | 56216495 / Ada | journey2-shrine-care | Text log only |
| 174 | 15:13:48 | 56216495 / Ada | journey2-resupplied | [image](evidence/174-journey2-resupplied.png) |
| 175 | 15:14:27 | 56216495 / Ada | journey2-spare-light-proof | [image](evidence/175-journey2-spare-light-proof.png) |
| 176 | 15:14:28 | 56216495 / Ada | journey2-story | Text log only |
| 177 | 15:15:41 | 56216495 / Ada | journey2-final-notes | [image](evidence/177-journey2-final-notes.png) |
| 178 | 15:17:27 | aa06ad01 / cold restore | spot-aa06-load-state | [image](evidence/178-spot-aa06-load-state.png) |
| 179 | 15:18:02 | aa06ad01 / cold restore | spot-aa06-earlier-save | [image](evidence/179-spot-aa06-earlier-save.png) |
