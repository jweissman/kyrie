# Conversation and combat, from first principles (a design note, 25 November)

The owner, from playtests of 24 and 25 November: conversation needs "a more active participant: someone who will ask
me questions, pose skill challenges, create situations. Not just a topic dispenser. This seems so close to the heart
of the game, right up there with combat in terms of what draws people in and creates pull." And: "the player knows
too much": the first person met offered some seventeen specific questions about things the character had never
heard of (OR-423). And reflection: a way to join evidence into an insight (OR-424). Combat: "experiment with automated
combat, although I don't want to cheapen it: maybe only when you're clearly overmatching".

This note says what the two activities should be for the player, then how the engine already supports it, then the
smallest proof for beta. It is written against the doctrine (doc/design/DOCTRINE.md: does this help the player forget
the interface and become interested in what happens next?) and the rulings in AGENTS.md (the engine owns the question;
the page invents no controls; colour only on action rows).

## 1. What a conversation is for the player

A conversation is an encounter with a person who wants something. It is not a browser of what they know.

**The person acts.** Each turn of a conversation is the other person's move as much as the player's:
- **They ask.** "You're not from the dale. What brings you up the drove road?" The answer is a choice, and what they
  think of you follows from it (trust, suspicion, interest).
- **They test.** A bluff called, an appeal to their pride, a riddle, a knowledge check ("You say you're a cleric: who
  keeps the shrine at Brockfield?"). A skill challenge spoken in the scene, decided by the ordinary rules, its odds
  said plainly, its failure interesting.
- **They make situations.** An offer, a demand, a deal, a dare, an invitation ("Walk with me to the mill"), a refusal
  that leaves a door ajar. The conversation ends by changing what the player can do next, not by running out of rows.

**The player asks only what they could ask.** A new character begins with a few broad, natural questions: who are
you, what is this place, what is the matter. Specific questions open on what the character has learnt: seen,
been told, read, found, remembered from their background, heard in an earlier talk. A rumour lets a question be asked
without making it true.

**Few rows, each a real move.** A turn offers the person's question or challenge and two to four answers or
approaches, plus leaving, which is always clear. Topics the player has exhausted, and words that change nothing, do
not stand as rows (the inert-acts census already holds this for authored adventures).

## 2. What a fight is for the player

A fight is a short story of risk with a decision in each round: whom to strike, what to spend, when to give ground,
whether to talk instead. Its pull is that the cost is real and the danger was legible beforehand.

**Automated resolution, only where it cannot cheapen.**
- Offered only where the reckoning says the fight is slight: the company clearly overmatches it.
- Never offered for a fair, hard, deadly or mortal fight. Those are already asked before they begin (OR-322).
- Resolved by the same rules, round by round, and told as a short account: who struck, what it cost, how it ended.
- The player can step in at any round, and the costs (wounds, spent uses, time) stay real.
- The lead's view: this removes tedium where the outcome isn't in doubt, and leaves every fight that matters in the
  player's hands. It is the opposite of cheapening if the slight fights stop crowding the hard ones out.

Minigames (a lock picked, a way found through a maze) come after these two; the pull is here first.

## 3. How the engine already supports it

None of this needs a parallel dialogue engine.
- **Engine-owned questions** (the TB-09 direction): a conversation becomes a sequence of engine questions the person
  puts, each with its rows, its hints (the speaker's painting large) and its receipt. The page draws them and invents
  nothing. The terminal and the runner see the same rows.
- **Kyr's `Occasion`** is the construct for an exchange with phases, participants and stakes, and it survives
  compilation as a first-class object (the semantic-tracing ruling). A conversation's phases (greeting, the person's
  question, the challenge, the offer, the parting) are an Occasion's.
- **Knowledge is already facts:** `knows(actor, X)` and `Discovery`. A topic's legality already reads the world; the
  fix for OR-423 is authoring and generation (topics behind `knows`), held by a census, not a new mechanism. What a
  character believes or suspects, as against what is true, is a second relation (`believes`, `heard`) where a
  rumour needs it.
- **Checks in conversation** exist (Checks put in conversation, in the feature map). A challenge is one, put by the
  person rather than chosen from a list.
- **The reckoning** (OR-322's shared one) already rates a fight slight, fair, hard, deadly or mortal; the automated
  offer reads it.

## 4. Reflection (OR-424)

A bounded act, "Gather your thoughts" or a long rest, that joins evidence the character holds into an insight: a
hypothesis, a connection, the answer to a small mystery.
- It is authored, not generic: a Kyr rule that some combination of `knows` facts yields a `Discovery` when the
  character reflects (or rests, or studies a written source).
- It is offered only when there is something to join, so it is never an endless clue button. The Atlas mark on it is
  the true knowledge opportunity, and only then.
- Other self-directed acts (prayer, a study of the stars, recalling one's training) can be its later cases.

## 5. The smallest proof for beta

- **One opening conversation, rebuilt:** the first person a new life meets asks the character a question, poses one
  challenge and makes one offer; the player's questions are a few broad ones, with specific ones opening on what the
  opening teaches.
- **One small mystery:** three pieces of evidence, two found and one heard, joined by reflection into one insight that
  opens one new act.
- **The regression** (OR-423): a census of the questions the first people of a fresh life offer, by seed, held to
  fall, the opening's own at no more than four before anything is learnt.
- **Automated resolution** on the slight fights of the golden walk, told and interruptible, the costs equal to the
  same fights played by hand (a property spec).
- **Acceptance:** cold-play agents rate the conversation as a person who wanted something; the Atlas truthful across
  headless walks and the page.

## 6. Order

After the platform's current items land (the engine path, the ports, the player protocol's first activity), so that
these are built on the engine-owned question rather than on today's topic lists. The Game stream takes them in this
order: the knowledge census and the opening's questions (OR-423); the active participant in that one conversation
(OR-149, OR-165); reflection in one mystery (OR-424); automated resolution of slight fights.
