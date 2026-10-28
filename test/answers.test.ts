import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList, type Choice } from '../src/ui/choice-list';

// Low Water's 5 and the Liberty of the Ice's 10 (AUT-03, ICE-10): a topic could not take an answer, so a question put
// to the company was a topic that opened three more, and the page could not show them as answers to it. A topic
// `answering` a question is offered once the question has been put, as an answer, and one answer is given.
describe('a question put to the company', () => {
  const leaves = (list: Choice[]): Choice[] => list.flatMap(c => c.children ? leaves(c.children) : [c]);
  it('is answered by its answers, offered as answers once it is put, and only one of them', async () => {
    const j = await Journey.start('test/fixtures/probes/question/probe.campaign.json');
    expect(j.offers('Say that you are')).toBe(false);
    await j.play('Ask Callow what he wants');
    const answers = ChoiceList.explore(ScreenModel.build(j.campaign)).flatMap(s => leaves(s.choices))
      .filter(c => c.answer).map(c => c.label);
    expect(answers).toEqual(['Say that you are', 'Say that none of you is']);
    expect(await j.play('Say that you are')).toContain('the Court will want you');
    expect(j.holds('p__bound', 'party')).toBe(true);
    expect(j.offers('Say that none of you is')).toBe(false);
  }, 30000);
});
