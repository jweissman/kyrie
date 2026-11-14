import { Tiny } from './tiny';

// The terminal's awkward cases in one tiny world (the owner, 14 November: TP-05), for cheap regressions and for
// looking at directly. A green at Hythe on the fifth of Haysel, with:
// - more legal acts than the four led with (three people, a door, a stair down, the company's gear);
// - one act that is several things at once (the companion's asking, the aim's question once it is followed);
// - a question too long for a narrow terminal;
// - two instruments, both bearing on the moment once night comes on;
// - acts that change once one is done (a question asked once, a companion who will come along once asked).
// Creation goes through the same picker from the engine's own steps (see TerminalCreation.menu).
export class Awkward {
  static readonly kyr = `
  Place hythe "Hythe" is settlement.
  Place green "the green" is room within hythe at 0, 0 outdoors.
  Place inn "the Eel and Anchor" is room within hythe at 1, 0.
  Place cellar "the inn's cellar" is room within hythe at 1, 1 underground 1 down.
  Passage inn_door "the inn door" is door between green and inn.
  Passage cellar_stair "the cellar stair" is path between inn and cellar.
  Company party "You" of 1 at green.
  Entity ford_known: fact "where the old ford is".
  Person osric "Osric" at green { Role "an old eel-man". Ancestry human. Peaceable. Pronouns he. }
  Topic osric_ford with osric "Ask Osric whether the old ford below the alders is still passable now that the spring floods have taken the causeway" when true once {
    Says "'Below the alders,' says Osric. 'Where the water's brown. Mind the step.'".
    On discuss { Assert knows(actor, ford_known). }
  }
  Person wenna "Wenna" at green { Role "a girl with a bow". Ancestry human. Peaceable. Pronouns she. }
  Entity mill_burned: fact "The mill at the ford burned in the spring.".
  Topic wenna_mill with wenna "Ask Wenna about the mill" when true once {
    Says "'Burned in the spring,' says Wenna. 'Nobody knows who lit it.'".
    On discuss { Assert knows(actor, mill_burned). }
  }
  Topic wenna_come with wenna "Ask Wenna whether she would come along" when true once {
    Says "'If you're going past the mill,' says Wenna, 'I'm coming.'".
    On discuss { Assert willing(wenna, actor). }
  }
  Person dunn "Dunn" at green { Role "a wagoner". Ancestry human. Peaceable. Pronouns he. }
  Topic dunn_hand with dunn "Offer Dunn a hand with the wheel" when true {
    Says "'I've got it,' says Dunn. He hasn't.".
  }
  Person rats "the rats" at cellar { Role "rats, fat and bold". Species rat. Numbers 3. Level 1. Lair cellar. }
  Observe green_scene at green when true "A green by the river, and a wagon with a wheel off.".
  Objective ford when not knows(party, ford_known) toward green "Find out where the old ford is.".
  Goal false.`;
  static start(): Promise<Tiny> {
    return Tiny.start(this.kyr, { calendar: { year: 1312, month: 6, day: 5 },
      party: [{ name: 'Aud', raceId: 'human', classId: 'ranger' }] });
  }
}
