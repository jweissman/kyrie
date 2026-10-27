# Who you are on the ice: the build matrix

Kyrie's checks are made by whoever in the company adds most (a d20, the quality's modifier, and proficiency where
the skill is theirs; a check that cannot fail or cannot succeed is not rolled). A step "for anyone" needs no roll or
only time, coin, a thing or a companion. The rule the design set itself (01-editorial F11): every principal approach
has at least one step only a skill, calling or quality opens, and at least one anyone can take.

## What each kind of protagonist has that others do not

| Who | Skill or craft | What it opens in Pellam |
|---|---|---|
| **A liar** (bard, fabulist; any charmer) | deception, persuasion; the stage | Hawsfold told well (+1 belief); the Liars' Bench lie; Abel brought to believe; Kemble sent after the drowned to the downs; the wharf man at the North Bar talked past; the stairs argued; the alderman's rhyme; Absolute danced home (stage craft only); speaking for Callow alone, without having found the argument with him |
| **A thief** (cutpurse, smuggler) | stealth, lockwork | the purse lifted back (Ursel's regard); Harker's desk picked; the bondhouse lock picked while Fowke sleeps; out past the searchers on the Reach, unseen (so not followed to the hulk); out of the North Bar behind a hay-sledge; the hired kept silent under the wharf |
| **A strong back** (warrior, labourer) | brawn | down Swan Stairs over the plank without paying; the iced bar broken off the river door alone; Absolute held on his chain; the searchers beaten on the ice (they take prisoners, not lives) |
| **A woodsman** (ranger, hunter) | woodcraft | the tracks by the black hole (the drowned walked away); Absolute approached as a bear in a wood |
| **A scholar** (mage, scholar) | lore; learning | the tally ruled as a factor's own (+1 belief); the Exchange shown why a tub is not a river (the Frost Company falls, Harker is short of coin); Gant's counterpart read, and a three made thirty shown at the Landing; Quarle told what his salts are for |
| **A priest** (cleric, acolyte) | rites; faith; insight | the old register lent free "as one of the cloth"; insight, as below |
| **Someone who reads people** (cleric, monk, any wise) | insight | the purse seen taken (Ursel's regard); Ursel seen looking for one face at the Ring; the slip in Kemble's line seen at noon; ink on Thessaly's finger |
| **A climber** (monk) | climbing | over the bridge rail and down the starling face: onto the ice untolled (anyone with Saffery's rope can too) |
| **A tradesman** (any trade background) | trade | Quarle told about cream before his ruin |

## The two principal approaches, by build

| | Front Door (the Squire) | Ring (the hired) |
|---|---|---|
| Who it suits | a liar, a scholar, a charmer, or anyone with props | a strong back, a plain face, anyone with no charm |
| Skill-only steps | Hawsfold told (deception); the tally ruled (lore); Abel made to believe (deception) | the bar alone (brawn); silent under the wharf (stealth); the searchers beaten (arms) |
| Anyone's steps | the printed tally (3 coin); fell wool (Abel gives it); Sir Lionel's coat (earned); Gosling's letter (earned by a rhyme, persuasion easy); Ursel's tedium (a partner); supper; the tour of the stock; the trade of the flock for the hired | standing in the Ring; reading Kemble's bond book; telling Tansy Hobb; the bar off with twenty pairs of hands and a kettle; walking the hired down the Reach on the first night, when the searchers are not out |
| Risk | collision (Abel), exposure, the pillory, the Landing binding you to a flock | your own year at Gallowmoor if nothing is done; the wharf men; the searchers |
| What it costs | a landed debt of two hundred ewes (unless made true) | a hand shaken to Harker (melted, if you get out) |

## The three levers at the Landing, by build

| Lever | Needs | Skill-only path | Anyone's path |
|---|---|---|---|
| **The trick** (the Long Con) | the Squire believed; the hired asked for against the flock; the indentures carried to the Landing | the props above | wool, coat, letter, Ursel |
| **The law** (the Unswearing) | the knowing doctrine argued; Harker's ledger or bond book in hand; a witness the Reeve will rule on (the alderman freed, or the Gazette, or Broom already told, or Harker shown a forger) | the desk picked; Callow defended alone (persuasion, hard) | Callow's custody and the third answer; Thessaly's key; the Liars' Bench truth |
| **The flight** (Not Landed) | the hired out of the bondhouse and down the sledge road before the Landing | the bar (brawn), the lock (lockwork), silence (stealth), a fight | twenty pairs of hands; Tredgold's sledges for the truth; the bear lent; the first night, when nobody walks the Reach |

## Played by build

| Build | Journey | Test |
|---|---|---|
| Bard, fabulist | The Long Con: tally ruled, Hawsfold told, Ursel vouches, supper, the stock, the trade, Callow's third answer, the hired released | `liberty-of-the-ice.test.ts` |
| Warrior, labourer | The Ring: hired, the bond book, Tansy told, the bar with the others, out on the first night | `liberty-of-the-ice.test.ts` |
| Warrior, labourer | Hired: shaken and left | `liberty-of-the-ice.test.ts` |
| Thief, cutpurse | The Score: the purse lifted back, fell wool, the half, past Harker's man | `liberty-of-the-ice.test.ts` |
| Thief, cutpurse | Ursel's arc to the handfast landed | `liberty-of-the-ice-small.test.ts` |
| Thief, smuggler | The watermen's sledges and the bondhouse emptied by the front | `liberty-of-the-ice-small.test.ts` |
| Mage, scholar | The Unswearing: the key, the ledger, the Bench truth, the doctrine, the books | `liberty-of-the-ice.test.ts` |
| Mage, scholar | The Exchange and frost-cream; Gant's counterpart at the Landing | `small`, `builds` |
| Cleric, acolyte | The register lent free | `builds` |
| Ranger, hunter | The tracks; the bear by woodcraft | `builds` |
| Warrior, farmer (no charm) | The drowned found; the Silver Tongue won with the truth | `builds` |
