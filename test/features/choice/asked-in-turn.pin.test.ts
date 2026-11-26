import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';
import { ScreenModel } from '../../../src/ui/screen-model';
import { ChoiceList, type Choice } from '../../../src/ui/choice-list';

// Feature pins: see test/features/choice/consequence.pin.test.ts. Choice › Asked in turn (the owner, 26 November:
// "enabling interlocutors to ask you things, pose puzzles, let you make use of skill checks"; OR-165, OR-850). A
// question someone has for the company, written as a topic put once whose condition is being spoken with them, is
// theirs to put: greeted, they ask it in their own words, and it is never a row to press. Its answers are offered
// under "Your answer" while it stands unanswered (asks), wherever the company comes back to them, a word that may not
// come off among them (a lie, rolled under the rules and told in the talk); one answer is given, and what it did is
// what later play reads. A second question of theirs waits until the first is answered, and is put then. A lesson
// for coin teaches a skill no development pays for (Resolve tutor), and what the skill notices is noticed.
const porch = `
  Place porch "the porch" is room at 0, 0 outdoors.
  Place ride "the old ride" is room at 1, 0 outdoors.
  Passage lane "the lane" is path between porch and ride.
  Company party "You" of 1 at porch.
  Person nell "Nell Arkle" at porch { Role "a herb-wife". Ancestry human. Peaceable. Pronouns she. }
  Relation met(group). Relation herbsShown(group). Relation shown(group). Relation doubted(group).
  Entity runs_known: fact "A boar's runs go off the old ride through the holly.".
  Topic nell_asks with nell "Nell asks what brings you up to the woods" when addressed(nell, actor) once {
    Says "'What brings you up to the woods?' Nell asks.".
    On discuss { Assert met(actor). }
  }
  Topic nell_herbs with nell "Say you have come for herbs" answering nell_asks when true {
    Says "'Then you want the old ride,' says Nell.".
    On discuss { Assert herbsShown(actor). }
  }
  Topic nell_stones with nell "Say you are looking for the old stones" answering nell_asks when true {
    Says "Nell looks at you a long time. 'Then mind the holly.'".
  }
  Action nell_lie(actor: group, site: place) "Say you are only passing through" {
    Speaker nell.
    Requires able(actor) and at(actor, site) and at(nell, site) and asks(nell, actor) and met(actor).
    Time 1 minute.
    Resolve check(actor, deception, dc_fair).
    On success { Assert knows(actor, runs_known). }
    On failure { Assert doubted(actor). }
    Result "'Then keep out of the holly,' says Nell. 'A boar runs there.'".
    Otherwise "'Passing through,' says Nell, and laughs.".
  }
  Topic nell_plant with nell "Nell asks what you carry" when addressed(nell, actor) and met(actor) once {
    Says "'Do you know what you've got in your pack?' Nell asks.".
    On discuss { Assert shown(actor). }
  }
  Action nell_name(actor: group, site: place) "Name the plant" {
    Speaker nell.
    Requires able(actor) and at(actor, site) and at(nell, site) and asks(nell, actor) and shown(actor).
    Time 1 minute.
    Resolve check(actor, woodcraft, dc_fair).
    Result "'Woundwort,' you say. Nell nods.".
    Otherwise "'Sorrel,' you say. 'Woundwort,' says Nell.".
  }
  Topic nell_unknown with nell "Say you do not know" answering nell_plant when true {
    Says "'Woundwort,' says Nell.".
  }
  Action nell_lesson(actor: group, pupil: member, site: place) "Pay Nell 5 coin to teach {pupil} to read the woods" {
    Speaker nell.
    Requires able(actor) and at(actor, site) and at(nell, site) and met(actor) and memberOf(pupil, actor) and awake(pupil) and not brings(pupil, woodcraft) and quantity(actor, gold) >= 5.
    Time 6.
    Resolve tutor(pupil, woodcraft).
    On success { Decrease quantity(actor, gold) by 5. }
    Result "Nell takes {pupil} out past the wall for an hour.".
  }
  Topic weather with nell "Ask Nell about the weather" when true { Says "'Rain by dark,' says Nell.". }
  Observe ride_scene at ride when true "Grass between the oaks.".
  Observe ride_tracks at ride as sign noticed by woodcraft when not knows(party, runs_known) "Cloven feet have churned the wet ground." teaches runs_known.
  Initially Set quantity(party, gold) to 20.
  Goal false.`;
const leaves = (list: Choice[]): Choice[] => list.flatMap(c => c.children ? leaves(c.children) : [c]);
const rows = (t: Tiny) => ChoiceList.explore(ScreenModel.build(t.campaign)).flatMap(s => leaves(s.choices));
const answers = (t: Tiny) => rows(t).filter(c => c.answer).map(c => c.label.replace(/ · .*$/, ''));
const said = (t: Tiny) => (t.leaf.exchange?.lines ?? []).map(l => `${l.kind}: ${l.text}`);
// Said as the page says it: the command the row does, and the exchange it is told in.
const say = async (t: Tiny, label: string) => {
  const o = t.journey.find(label);
  if (!o?.command) { throw new Error(`${label} not offered: ${rows(t).map(c => c.label).join(' | ')}`); }
  return t.perform(o.command);
};
const start = () => Tiny.start(porch, { party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] });
describe('Choice › Asked in turn', () => {
  it('is a question put by the one greeted, answered from the engine\'s rows, one answer given', async () => {
    const t = await start();
    // Nothing to press to be asked: the question is no row.
    expect(rows(t).map(c => c.label).filter(l => /Nell asks/.test(l))).toEqual([]);
    await say(t, 'Talk to Nell');
    // Her first words are her question: not the tables' greeting before it.
    expect(said(t)).toEqual(['speech: ‘What brings you up to the woods?’ Nell asks.']);
    expect(answers(t)).toEqual(['Say you have come for herbs', 'Say you are looking for the old stones',
      'Say you are only passing through']);
    // Gone off and come back, it is still asked.
    await t.play('Take your leave', 'Talk to Nell');
    expect(answers(t)).toHaveLength(3);
    await say(t, 'Say you have come for herbs');
    expect(t.journey.holds('t__herbsShown', 'party')).toBe(true);
    // Answered once: and her second question, which waited, is put now, with its own answers.
    expect(said(t).join(' ')).toContain('Do you know what you’ve got in your pack?');
    expect(answers(t).sort()).toEqual(['Name the plant', 'Say you do not know']);
  }, 30000);

  it('is put after whatever the company first asks her, a talk led for a question being that question', async () => {
    const t = await start();
    await say(t, 'Ask Nell about the weather');
    expect(said(t)).toEqual(['speech: ‘Rain by dark,’ says Nell.', 'speech: ‘What brings you up to the woods?’ Nell asks.']);
    expect(answers(t)).toHaveLength(3);
  }, 30000);

  it('takes a word that may not come off as an answer, rolled and told in the talk, either way leading on', async () => {
    for (const roll of ['pass', 'fail'] as const) {
      const t = await start();
      await t.play('Talk to Nell');
      t.journey.roll(roll);
      await say(t, 'Say you are only passing through');
      const lines = said(t);
      // The roll first, as the talk tells it, then what she says back.
      expect(lines[0]).toMatch(/^roll: Ama (makes|fails) the deception check/);
      expect(lines.join(' ')).toContain(roll === 'pass' ? 'A boar runs there.' : 'and laughs');
      expect(roll === 'pass' ? t.journey.holds('knows', 'party', 't__runs_known')
        : t.journey.holds('t__doubted', 'party')).toBe(true);
      // Answered, however it went: the other answers are gone, and the next question is put.
      expect(answers(t).sort()).toEqual(['Name the plant', 'Say you do not know']);
    }
  }, 30000);

  it('teaches for coin a skill that then notices what it is for', async () => {
    const t = await start();
    await t.play('Talk to Nell', 'Say you have come for herbs');
    expect(rows(t).some(c => /^Pay Nell 5 coin to teach Ama to read the woods/.test(c.label))).toBe(true);
    await t.play('Pay Nell 5 coin to teach Ama');
    // Taught: Ama brings woodcraft now, and is not offered the lesson again.
    expect(rows(t).some(c => /^Pay Nell/.test(c.label))).toBe(false);
    expect(t.campaign.world.number({ kind: 'call', name: 'quantity', args: ['party', 'gold'] })).toBe(15);
    await t.play('Take your leave', 'To the old ride');
    expect(t.journey.holds('knows', 'party', 't__runs_known')).toBe(true);
  }, 30000);

  it('without the lesson, the old ride shows nothing to one with no woodcraft', async () => {
    const t = await start();
    await t.play('To the old ride');
    expect(t.journey.holds('knows', 'party', 't__runs_known')).toBe(false);
  }, 30000);
});
