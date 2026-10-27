# Who the protagonist is: the build matrix

*A protagonist's background gives a craft (one of fourteen); its class and skills give capabilities (lore, lockwork,
rites, woodcraft, mending, climbing…) and the numbers checks are rolled on. In Calamy each of these is another way
through, never the only one. The rule kept throughout: **no gate that only one kind of person can pass**.*

## What each kind of person can do that others cannot

| Craft / capability | In the city | In the Commonplace and the chamber | The unlettered alternative |
|---|---|---|---|
| **learning** (scholar, scribe, librarian…) | sees the eye-skip in the scriveners' copies at a glance; settles the disputation in the form; Quarles teaches without a reading-aloud | answers the Scholiasts' SIC with a citation | lay both copies by the church's exemplar; read to Hennet; go round or through the Scholiasts |
| **lore** (skill) | knows the Ninth Plea is missing from the chained Roll; reads the ridge-marks on the saltings; Quarles' judgment | | pay Abel Snow a coin to read it out; ask Gil |
| **court** (lawyer, magistrate, herald…) | cites the Sixth Plea in Pask's suit | moves to divide the Recall (the Roll); sure at the fire | win the case with the Recorder page and Gil; the Court's ruling moves the Roll anyway |
| **faith** (priest, monk…) | | speaks to the Housebook of the soul; sure at the fire | the Canon's ruling does the same for her |
| **rites** (skill) | | binds the Lexicon's voice for the session (a check) | slack in its chain (lockwork); free it; or simply outvote it |
| **trade** (merchant, printer…) | | prices a licence as a toll for the Roll (→ licensed door) | bring Crake, who argues it himself |
| **margins** (beggar, prisoner…) | | tells the Second Canto what a body not chosen is | the Effusions move the Canto too |
| **roads** (messenger, guide, traveller…) | | tells the Physick of toll-gates (→ open door) | the Primer moves for the open door too |
| **arms** (soldier, warden, knight…) | | swears to the Physick to stand between books and the mob (→ by judgment) | Pardoe's seventeenth, or Rhule before her |
| **healing / mending** | guesses the burnt-off fourth herb and cures the ague without the Imprimatur's pages; knows the sheep are poisoned | tells the Physick Pardoe was right about the seventeenth | steal the excised pages from the Imprimatur's locked room |
| **wild / woodcraft** (hunter, ranger…) | knows Gil's sheep are poisoned at a glance | goes round the glosses like a wasps' nest | answer them, fight them, or skip the Fore-edge |
| **stage** (bard, poet, player…) | | sure at the fire | the Advocate, the Canon, or the Almanack spares the almanacks |
| **shadows / lockwork** (thief) | picks Crake's lock at night and lifts the ribbon; picks the Imprimatur's grey door; the Chained Room's lock | slack in the Lexicon's chain | trust (Crake), the roof or the cheese (the key), Rhule's warrant |
| **climbing** | mends the Lyceum roof (the Chained Room's key) | | the Provost's cheese |
| **persuasion / intimidation / lore** (checks) | argue a book's standing in court; speak against the Ordinance; face down Saul; dispute in the Schools | the fire | evidence everywhere instead |

**No-charisma, no-scholar builds** were the commission's worry. Tested: a soldier (`warrior`, `soldier`), a hunter
(`ranger`, `hunter`), a thief, a healer (`builds` test); a cleric-warden who binds the Lexicon and wins the Pleading
Accord, and a bard-messenger who wins the Open Door (`outcomes` test). The Parliament can be won by a company that
has never rolled a persuasion check: every vote in the Lending Accord journey moves on something found.

## Against the Ash

| Who | What they can do |
|---|---|
| **arms** | drive the burned out of the chamber's gangway; fight down through the pickets, the ranks and the Penknife (a level-8 soldier alone wins two seeds in three) and throw the Index into its furnace |
| **learning** | read the Index aloud whole, every cut and reason, until it is a history (otherwise only with Rhule beside you or her register in hand) |
| **anyone** | ask the Canon for a taper lit at the Lamp, and walk through the burned; borrow Rhule's register (if she trusts you) and read them their names; tell Rhule about her father's book and her candle, and let the Index starve; or carry its bargain in the chamber |

## Tested builds

`test/parliament-of-books-builds.test.ts`, one protagonist alone each time: scholar (mage/scholar), priest,
merchant, court, margins, healer, thief, soldier (warrior/soldier, level 3), hunter (ranger/hunter). Plus the
default bard (Wren, messenger) in every main-line journey; a level-4 hunter and a level-1 hunter for the Manuals
(`rewards` test); and the autoplay laboratory's random players of several classes.

## What is weaker than it should be

- **Elves, dwarves, halflings** are not distinguished by anything in Calamy. Ancestry matters nowhere.
- **Arcane casters** get nothing their class does; a mage is a scholar by background, not by spellbook. A
  wizard who could *read* the Black Letters as a spell would be the obvious addition.
- **Companions' crafts count** (the party's crafts are the union), which is right, but means a company of four sees
  most of the matrix at once and the identity of *the protagonist* fades.
