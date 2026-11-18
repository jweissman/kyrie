import { beforeAll, describe, expect, it } from 'bun:test';
import { PlayTool } from '../../src/cli/play-tool';
import { Runner, type Offered, type Said } from '../../src/cli/runner';
import { TerminalDoable } from '../../src/cli/terminal-doable';
import { ModuleWriter } from '../../src/lang/module-writer';
import { RegionRiddles } from '../../src/world/region-riddles';
import type { PlaySession } from '../../src/session/play-session';
import { MenuModel } from '../../web/reader/menu-model';
import { GlanceStage } from '../../web/reader/stage/glance';
import type { ReaderApp } from '../../web/reader/reader-app';
import { Glanced } from '../support/glanced';

// The speaking door, focused (the owner, 18 November, P0, CL-34): "I don't see the questions; I only see two answers
// and 'Look at the speaking door' … it won't let me select it, it seems to be warning me (the text is cut off)". The
// gold "Look at the speaking door" had been done by its first try (push), two of its four words stood loose in the
// four, the riddle was the barred way's reason, cut to a line, and nowhere else. Now the look is a focus the engine
// gives (Choice.focus, Doable's Row.says): opened, it reads out the riddle whole, and every word is a row of it, on
// the page, the runner and the terminal alike. a1 with the order's errand, walked by its gold to Mistlake.
const door = 'exit:region__w2_stair/0:Look at the speaking door';
let session: PlaySession, runner: Runner, arrived: Said, question: string, answer: string;
const words = (os: Offered[]) => os.filter(o => /^Press the word/.test(o.label));
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
beforeAll(async () => {
  session = (await PlayTool.start(PlayTool.parse(['--world', 'a1', '--origin', 'order', '--as', 'human/warrior/Wenna'])))
    .journey.session;
  runner = new Runner(session);
  let s = runner.said();
  if (!s.aims?.some(a => a.followed)) { s = said(await runner.ask(JSON.stringify({ follow: s.aims![0]!.id }))); }
  for (let t = 0; t < 6 && s.at !== 'region__w2'; t++) {
    const gold = s.offer.primary.find(o => o.aspects.includes('undertaking'))!;
    s = said(await runner.ask(JSON.stringify({ act: gold.id })));
  }
  arrived = s;
  const exit = Glanced.of(session).screen.exits.find(e => e.id === 'exit:region__w2_stair')!;
  const riddle = Object.values(RegionRiddles.riddles).flat().find(r => exit.blocked!.includes(r.question))!;
  [question, answer] = [riddle.question, riddle.answer];
}, 120000);
describe('the speaking door, focused', () => {
  it('is gold as a focus to open, never a try, and its words are not loose in the four', () => {
    expect(arrived.at).toBe('region__w2');
    const gold = arrived.offer.primary.filter(o => o.aspects.includes('undertaking'));
    expect(gold.map(o => o.id)).toEqual([door]);
    expect(gold[0]!.says).toContain(question);
    expect(words(arrived.offer.primary)).toEqual([]);
    expect(arrived.going).toEqual({ kind: 'step', act: door });
  });
  it('on the page: the gold row opens in place (no try pressed), its riddle whole, the way barred said in a line', () => {
    const g = Glanced.of(session), frame = g.frame();
    const app = { state: { frame }, menu: MenuModel.build(frame, 'here', []), props: {} } as unknown as ReaderApp;
    const a = g.glance.acts.find(x => x.choice === door)!;
    expect(a.continues).toBe(true);
    expect(a.command).toBeUndefined();
    const c = MenuModel.lead(app.menu, door)!;
    expect(GlanceStage.acted(a, c)).toBe(c);
    expect(c.focus).toContain(question);
    expect(c.children!.filter(k => /^Press the word/.test(k.label))).toHaveLength(4);
    expect(MenuModel.lead(app.menu, 'exit:region__w2_stair')?.disabled).toBe('The speaking door bars the way.');
  });
  it('in the terminal: the opener reads the riddle out over every word', () => {
    const g = Glanced.of(session);
    const o = TerminalDoable.openers(g.glance, g.screen).find(x => x.id === door)!;
    expect(TerminalDoable.heading({ opened: o.name, says: o.says }).join('\n')).toContain(question);
    expect(o.opens.filter(id => /_word\d\(/.test(id))).toHaveLength(4);
    expect(TerminalDoable.unfolded(o.opens, o.says).rest).toEqual([]);
  });
  it('in the runner: opened, the riddle is on the screen, every word a row, and the right one opens the door', async () => {
    const focused = said(await runner.ask(JSON.stringify({ act: door })));
    expect(focused.scene.lines.join(' ')).toContain(question);
    const answers = words(focused.offer.primary);
    expect(answers).toHaveLength(4);
    expect(answers.map(o => o.label).join(' ')).toContain(`“${answer}”`);
    const right = answers.find(o => o.label.includes(`“${answer}”`))!;
    const open = () => session.campaign.world.test(ModuleWriter.call('state', 'region__w2_riddle', 'region__open'));
    expect(open()).toBe(false);
    said(await runner.ask(JSON.stringify({ act: right.id })));
    expect(open()).toBe(true);
  });
});
