import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { ChoiceList } from '../src/ui/choice-list';
import { Attending } from '../src/ui/attention';
import { Glanced } from './support/glanced';

// What a choice risks is said on it before it is chosen (the cold review's quick corrections): a way with no coming
// back, and a fight and how it would go, on the glance and wherever else the page draws the choice; the one that
// cannot be undone asks again. A gallery, a stair to the top of a pipe that goes down one way only, the aim at its
// foot, and goblins there.
class Pipe {
  static start() {
    const body = `Place start "the gallery" is room within field at 0, 0 outdoors.
      Place top "the top of the pipe" is room within field at 1, 0 outdoors.
      Place bottom "the bottom of the pipe" is room within field at 2, 0 outdoors.
      Passage stair "the stair" is path between start and top.
      Passage pipe "the great pipe" is path between top and bottom one way.
      Company party "You" of 2 at start.
      Person hobs "the hobs" at bottom { Role "hobs at the bottom of the pipe". Ancestry goblin. Calling thief. Level 1. Numbers 3. }
      Objective down when not at(party, bottom) "Get down to {bottom}.".`;
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'gm/site.kyr': `Module gm "Marked" { Place field "the field" is wilderness. ${body} Goal false. }`,
      'gm/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'gm.campaign.json': JSON.stringify({ version: 1, name: 'gm', modules: [{ id: 'g', bundle: 'gm/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }, { name: 'Bo', raceId: 'human', classId: 'warrior' }] }) });
    return PlaySession.start(source.resolve('gm.campaign.json'), 'gm', source);
  }
}
describe('marks before a choice is made', () => {
  it('marks the way with no coming back on the glance and among every way, and asks again', async () => {
    const g = Glanced.of(await Pipe.start());
    const top = await g.choose(/^go\(g__stair,g__top\)$/);
    const pipe = top.acts.find(a => a.exit === 'exit:g__bottom')!;
    expect(pipe).toMatchObject({ why: 'named', note: 'your aim' });
    expect(pipe.marks).toEqual([{ kind: 'one-way', said: ChoiceList.oneWay, ask: true }]);
    const drawn = ChoiceList.all(ChoiceList.explore(g.screen)).find(c => c.id === pipe.choice)!;
    expect(drawn.marks).toEqual(pipe.marks);
    expect(top.aimed).toContain('exit:g__bottom');
  }, 60000);
  it('marks a fight with how the company reckons it, and leads with it where the danger is', async () => {
    const g = Glanced.of(await Pipe.start());
    await g.choose(/^go\(g__stair,g__top\)$/);
    const bottom = await g.choose(/^go\(g__pipe,g__bottom\)$/);
    expect(bottom.life).toMatchObject({ subject: 'g__hobs', danger: true });
    const attack = bottom.acts.find(a => a.command?.startsWith('attack('))!;
    expect(attack.why).toBe('danger');
    expect(attack.marks).toEqual([expect.objectContaining({ kind: 'fight' })]);
    expect(attack.marks[0]!.said).toMatch(new RegExp(`^(${Object.values(ChoiceList.chances).join('|')})`));
    // There is no way back up the pipe to lead with; and waiting beside them is marked as what they will not allow.
    expect(bottom.acts.map(a => a.why)).not.toContain('retreat');
    const company = ChoiceList.explore(g.screen).find(s => s.id === 'company')!;
    expect(Attending.all(company.choices).filter(c => c.marks?.some(m => m.kind === 'warned')).length).toBeGreaterThan(0);
  }, 60000);
});
