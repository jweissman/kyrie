import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Runner, type Said } from '../../src/cli/runner';
import { RunnerFight } from '../../src/cli/runner-fight';
import { TerminalWalk } from '../../src/cli/terminal-walk';
import { WalkStyle } from '../../src/cli/walk-style';

// A company that falls is told how, wherever it is played (AB-04, the adventure branch's R80: "a fallen company is left
// with nothing offered and no ending"). The page had its last page (Obituary); the terminal had said only "The story
// has ended", the runner an empty offer, and both had gone on giving the dead the barrow-king's ten minutes. A warrior
// alone against a king he cannot beat, pressed to the end.
const hall = `
  Place hall "the hall" is room at 0, 0 underground.
  Company party "You" of 1 at hall.
  Person king "the barrow-king" at hall {
    Role "the last king". Species revenant. Level 8. Temperament territorial. Lair hall.
  }
  Goal false.`;
const party = [{ name: 'Ama', raceId: 'human', classId: 'warrior' }];
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };

describe('a company fallen', () => {
  it('is told its ending by the runner, and given no time by those who killed it', async () => {
    const t = await Tiny.start(hall, { party }), r = new Runner(t.session);
    const attack = r.said().offer.primary.find(o => o.type === 'fight')!;
    let turn = said(await r.ask(JSON.stringify({ act: attack.id })));
    if (turn.moment === 'fight') { turn = said(await r.ask(JSON.stringify({ act: RunnerFight.through }))); }
    expect([turn.end, t.campaign.running]).toEqual([true, false]);
    expect(turn.ending?.title).toBe('Ama is dead');
    expect(turn.ending?.lines.join(' ')).toMatch(/It began when you attacked the barrow-king/);
    expect(turn.scene.lines.join(' ')).not.toMatch(/will give you|will be on you/);
  });
  it('is told its ending by the terminal', async () => {
    const t = await Tiny.start(hall, { party });
    const walked = await TerminalWalk.run(t.session, WalkStyle.scripted(['Attack the barrow-king', 'Press on to the end']));
    const text = walked.transcript.join('\n');
    expect(text).toMatch(/^Ama is dead$/m);
    expect(text).toMatch(/Ama fell at the hall/);
    expect(text).not.toMatch(/will give you|will be on you/);
  });
});
