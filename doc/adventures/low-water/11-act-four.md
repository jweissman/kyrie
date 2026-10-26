# Low Water: Act IV, the Hearing as a council of war

*2026-10-26. The scene the critique ([09](09-critique.md)) and the revision ([10](10-final-revision.md)) both named as
missing. The Hearing still runs on the same system: exhibits raise the Council's credence, witnesses speak when their
exhibit is laid, a cause is named, a remedy asked, and the Council decides on what it has been shown. Act IV adds
what the Assessor can now tell it about what reads the count, and three answers the city can give a creditor. It is
in `council.kyr`, loaded before `hearing.kyr` so that its verdicts are weighed before the Council's fall-back
rejection.*

## Before the Hearing

* **Registrar Fenn** (*Tell the Registrar the count is an account*): *Then it's a claim. Against the Bowl. By a party
  not resident… The Office hears claims.*
* **Harrow Quill** (*Tell Quill there is a creditor under the Mere*): *Every creditor can be dealt with… You won't like
  where that arithmetic goes. I don't.*

## New exhibits and witnesses

| Exhibit | Needs | Witness |
|---|---|---|
| The Reflected | `reflected_known` | If the Mere stood up to the fourth step, the Ward's benches: *We all saw it* (+1) |
| The Second Reader's footnotes | `pell_cipher` | Halm, if turned: *I thought I was his correspondent; I was his postman. I would like that minuted* (+1) |
| The account | `auditor_known`, the Reckoner laid | — |
| The creditor's question | `auditor_heard` (Act VI before day 7), the account laid | — |

## The cause, and Quill's arithmetic

*Name the cause: a creditor, reading the count through the last door, and a city that stopped singing the verses that
kept the door small and shut.* This is the first-pass cause (the machine and the hymn), with the party on the other
side of the door added.

Once that cause is named, Quill's usual answers (mockery, concession, bought support) give way to the one thing he
has been arguing all along, said for once without a smile. The Ward plots at the Guild's valuation are eleven
thousand crowns; the Bowl is four hundred thousand. *If it will take the Ward in settlement, give it the Ward… The
good of the many is a sum. I didn't say it was a kind one.*

## Three answers

| Remedy | Needs | Credence | Verdict | Ending |
|---|---|---|---|---|
| **Hold the door**: the Seventh and the Fourth every night | the creditor named | 6 | `verdictFourth`: Fourth restored, door held at the next eight o'clock | **The Held Door** (*Held, which is not a figure; she has had to rule a new column*); or *The Kept Count* if the census closes |
| **Inestimable**: the Ward entered as beyond any figure, read out in the square for thirty days | the creditor's question laid | 7 | `verdictInestimable`: `wardValued`, approach −3, Seventh restored, titles frozen | **Inestimable** (*the only entry in that column. She says she likes it there on its own*) |
| **The Settlement**: the Ward offered at Quill's valuation | Quill has priced it | 3 | `verdictSettle`: at midnight the Mere stands to the fourth step and stays. Tench Row is under it with its lamps lit; the clock stops and the heart is never taken | **The Settlement**: Quill frames the receipt; Isaura resigns: *Resigned. Not measured.* |

The settlement is the easiest of the three to win (credence 3), because it asks the city for the least courage. If
Isaura is with you she refuses to measure it. The Inestimable verdict is the hardest, and it means carrying the
Auditor's own question down from the top of the stair before day 7. Its echo is the point: a clerk on the fountain's
rim reading the rights aloud at noon, as after the Thirst Riots. The Auditor, if visited afterwards: *It is the
second time. I did not think I would hear it again… Tell them it is received.*

## Also

Halm's false footnote now comes back two days later. The Second Reader has written in the margin, in plain ink:
*Thank you. Most helpful. I shall go elsewhere this winter.* *He believed me… I've never lied to him before.*

## Evidence

Three journeys in `test/low-water.test.ts`:

1. **The Held Door.** The Accord route, with a look through the ninth arch during the descent and Halm told what it
   holds next morning, then the Finding with the account laid and the creditor named: `verdictFourth`, then *The Held
   Door*. Asserts that Quill's pricing speech is on the page and that his old concession joke is not.
2. **The Settlement.** The same, with the Ward offered: Isaura's dissent, `wardGiven` at midnight, the Mere at 64
   spans, the clock at zero, then *The Settlement*.
3. **Inestimable.** The same, plus the Lector's bell, the Mere at night, Ammerlin in the water, the stair, the
   Auditor's question, back down through the still water, and the Hearing: `verdictInestimable`, then *Inestimable*.
