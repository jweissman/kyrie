import { beforeAll, describe, expect, it } from 'bun:test';
import { Glanced } from './support/glanced';
import { DecisionFrame, type Acted } from '../src/presentation/decision-frame';
import type { ActionFeedback } from '../src/presentation/action-feedback';
import type { Promoted } from '../src/presentation/glance-types';

// After every act the glance carries one frame (the cold review's REV-05, the systemic review's SYS-01): what was
// attempted, what came of it, what changed in the company's state, and the act it has made relevant, when it has
// made one. Played in kite, come home as kin: the bridge-foot come to, Alfric asked what he means to do, the notice
// on the well-post read; and on acts made up for it.
class Made {
  static feedback(extra: Partial<ActionFeedback> = {}): ActionFeedback {
    return { attempt: 'Pull the lever', result: '', resources: [], time: '', immediate: [], discoveries: [], rolls: [],
      observations: [], available: [], unavailable: [], events: [], ...extra };
  }
  static act(choice: string, why: Promoted['why'], extra: Partial<Promoted> = {}): Promoted {
    return { choice, command: choice, label: choice, why, facets: ['here'], tier: 3, marks: [], ...extra };
  }
  static acted(extra: Partial<ActionFeedback> = {}, moved = false, failed = false): Acted {
    return { feedback: Made.feedback(extra), moved, failed, place: 'the mill' };
  }
  static readonly standing = { names: new Map([['miller', 'Odo']]), choices: [
    { command: 'take_leave(miller)', label: 'Take your leave', schema: 'take_leave' },
    { command: 'climb(ladder)', label: 'Climb the ladder', schema: 'climb' }] };
}

describe('the frame after an act, in kite', () => {
  let g: Glanced;
  beforeAll(async () => { g = await Glanced.country('kite'); }, 120000);
  it('comes somewhere: where it now is, the aims it gave, and what the place leads with', async () => {
    const v = await g.choose(/,region__s2_green\)$/);
    expect(v.after).toMatchObject({ attempt: 'Take the road to the bridge-foot at Brightbridge',
      result: 'You arrive at the bridge-foot at Brightbridge.' });
    expect(v.after!.changed[0]).toBe('Now at the bridge-foot at Brightbridge');
    expect(v.after!.changed).toContainEqual(expect.stringMatching(/^Aim: Hobs took a bell/));
    expect(v.after!.next).toEqual({ command: 'talk_to(drover__son)', label: 'Talk to your brother',
      choice: 'drover__son#talk', why: 'kin' });
  });
  // A company of one is led to whoever would join it (M19-59: a lone cleric had turned back from every fight of the
  // first town's jobs, never told the traveller at the inn would come): the answer opened it, and the glance leads it.
  it('says what an answer opened, and leads a company of one to the brother who would now join it', async () => {
    await g.perform('talk_to(drover__son)');
    const v = await g.perform('drover__son_plan');
    expect(v.after).toMatchObject({ attempt: 'Ask Alfric what he means to do', result: '\'Go after him,\' says Alfric.' });
    expect(v.after!.next).toMatchObject({ choice: 'drover__son#talk', command: 'recruit(drover__son)', why: 'means' });
    expect(v.acts.find(a => a.choice === 'drover__son#talk')).toMatchObject({ for: 'recruit(drover__son)',
      note: 'would join you' });
  });
  it('reads the notice: the aims it gave and what was learnt, and no act made up for people not here', async () => {
    const v = await g.choose(/notice/);
    expect(v.after!.changed).toContainEqual(expect.stringMatching(/^Aim: Ask Adran about the rats/));
    expect(v.after!.changed).toContainEqual(expect.stringMatching(/^Learnt: A notice on the post by the well/));
    expect(v.after!.next).toBeUndefined();
  });
});

describe('the frame after an act, made up', () => {
  it('leads with an answer, then whoever a new aim names, then what it opened', () => {
    const acts = [Made.act('ladder', 'own', { command: 'climb(ladder)' }), Made.act('odo#talk', 'asked',
      { subject: 'miller', command: 'talk_to(miller)' }), Made.act('reply', 'answer')];
    expect(DecisionFrame.after(Made.acted(), acts, Made.standing).next?.choice).toBe('reply');
    const aimed = Made.acted({ aims: ['Odo at the mill wants his sacks back.'], opened: ['climb(ladder)'] });
    expect(DecisionFrame.after(aimed, acts.slice(0, 2), Made.standing).next?.choice).toBe('odo#talk');
    expect(DecisionFrame.after(Made.acted({ opened: ['climb(ladder)'] }), acts.slice(0, 2), Made.standing).next)
      .toEqual({ command: 'climb(ladder)', label: 'ladder', choice: 'ladder', why: 'own' });
  });
  it('makes none up: a farewell opened is not one, and staying with nothing new has none', () => {
    expect(DecisionFrame.after(Made.acted({ opened: ['take_leave(miller)'] }), [], Made.standing).next).toBeUndefined();
    expect(DecisionFrame.after(Made.acted({ opened: ['climb(ladder)'] }), [], Made.standing).next)
      .toEqual({ command: 'climb(ladder)', label: 'Climb the ladder' });
  });
  it('says a failure, its result in a sentence, and what it cost', () => {
    const f = DecisionFrame.after(Made.acted({ result: 'It will not move. The lever is rusted fast.',
      resources: ['Coin: 12 → 10'] }, false, true), [], Made.standing);
    expect(f).toEqual({ attempt: 'Pull the lever', result: 'It will not move.', failed: true,
      changed: ['Coin: 12 → 10'] });
  });
});
