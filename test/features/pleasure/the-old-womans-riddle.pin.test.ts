import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { ScreenModel } from '../../../src/ui/screen-model';
import { GeneratedWorld } from '../../support/generated';
import { RunnerFind } from '../../support/runner-find';
import { RunnerOffer } from '../../../src/cli/runner-offer';
import { Glanced } from '../../support/glanced';
import { MenuModel } from '../../../src/frame/menu-model';
import type { Choice } from '../../../src/ui/choice-list';

// The old woman's riddle on Porthalen's green as an engagement (the owner's playtest, 21 November: "listening to an
// old lady's riddle doesn't enter a clear focused engagement. The possible answers are mixed with unrelated world
// actions rather than presented together, with a way to leave or refuse"; OR-177's focus continuity). Stopped for,
// the frame is her riddle (Screen.engaged): its three answers together and the ways off the green, nothing else of
// the place. The right answer wins a plum; a wrong one or none, and she tells it; walked off from, she remembers.
const rows = (s: Said) => [...s.offer.primary, ...s.offer.rest].flatMap(o => [o, ...o.opens ?? []]).map(o => o.label);
async function green() {
  const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
  GeneratedWorld.put(journey.session, 's1_green');
  const r = new Runner(journey.session), c = journey.session.campaign;
  return { r, s: r.said('look'), engaged: () => ScreenModel.build(c).engaged?.id, session: journey.session };
}
describe('the old woman\'s riddle', () => {
  it('is the whole frame once stopped for: its answers together, the ways off, and nothing else', async () => {
    const { r, s: at, engaged } = await green();
    const before = rows(at).length;
    let s = await RunnerFind.act(r, at, /^Stop for the old woman's riddle/);
    expect(s.scene.lines.join(' ')).toContain('What has a mouth and never eats');
    expect(engaged()).toMatch(/_pl_riddle$/);
    const answers = rows(s).filter(l => /^(Tell her it is|Say you do not know)/.test(l));
    expect(new Set(answers).size).toBe(3);
    // Besides the answers only the ways off the green (to leave is to refuse it).
    const off = /^(To |Into |Out |Up |Down |Set out)|riddle/;
    expect(rows(s).filter(l => !answers.includes(l) && !off.test(l))).toEqual([]);
    expect(rows(s).length).toBeLessThan(before);
    s = await RunnerFind.act(r, s, /^Tell her it is a river/);
    expect(s.scene.lines.join(' ')).toContain('a dried plum');
    expect(engaged()).toBeUndefined();
  }, 120000);

  // The page draws the same frame, the riddle leading it (OR-177: the drove's aim to take up, "Ask Owain how many head
  // came down", had led the page's menu above her answers, the glance's own act where the runner offered none, and
  // the aim's way after it): her answers first, then only the ways off, nothing the runner does not offer.
  it('is drawn on the page as the runner offers it, her answers first', async () => {
    const { r, s: at, session } = await green();
    const s = await RunnerFind.act(r, at, /^Stop for the old woman's riddle/);
    const offered = new Set(RunnerOffer.flat([...s.offer.primary, ...s.offer.rest]).map(o => RunnerOffer.act(o)));
    const flat = (cs: Choice[]): Choice[] => cs.flatMap(c => [c, ...flat(c.children ?? [])]);
    // The riddle leads the page, and since a thing's acts are its own page's (one flat level outside a fight,
    // OR-1295), her answers are drawn on the riddle's page, first, one act from the scene (OR-1463: that an engaged
    // frame open on its engagement's page is the frame's to say).
    const frame = Glanced.of(session).frame(), scene = MenuModel.build(frame, 'here', []).choices;
    expect(scene[0]!.label).toBe('the old woman\'s riddle');
    const id = scene[0]!.id.replace(/#.*$/, '');
    const drawn = flat(MenuModel.build(frame, 'here', [], { attention: { kind: 'thing', id } }).choices)
      .filter(c => c.command);
    expect(drawn.filter(c => !offered.has(c.command!)).map(c => c.label)).toEqual([]);
    expect(drawn.slice(0, 3).map(c => c.label).every(l => /^(Tell her it is|Say you do not know)/.test(l))).toBe(true);
  }, 120000);

  it('is refused by walking off, and remembered', async () => {
    const { r, s: at, engaged } = await green();
    let s = await RunnerFind.act(r, at, /^Stop for the old woman's riddle/);
    const way = rows(s).find(l => /^(To |Into )/.test(l))!;
    s = await RunnerFind.act(r, s, new RegExp(`^${way.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    expect(engaged()).toBeUndefined();
    expect(rows(s).some(l => /^Tell her it is/.test(l))).toBe(false);
  }, 120000);
});
