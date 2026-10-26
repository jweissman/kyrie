import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { WorkPlans } from '../src/world/history/work-plans';

// What a failed exposure says (the architecture review's L1): fixed English that the company "does not cross" was said
// of a rack heaved off a guest, and over an author's own Otherwise. And a work's words go into its Kyr as words (its
// M3: a value with a quote in it was put into a quoted Kyr string as it was).
class Exposed {
  static start() {
    const body = `Hazard strain "A strain" means "Deal (100) physical damage to ally.".
      Action heave(actor: group, lifter: member) "Heave; {lifter} lifts" {
        Requires company(actor) and memberOf(lifter, actor) and awake(lifter). Resolve expose(strain, lifter). }
      Action lift(actor: group, lifter: member) "Lift; {lifter} lifts" {
        Requires company(actor) and memberOf(lifter, actor) and awake(lifter). Resolve expose(strain, lifter).
        Otherwise "The weight wins.". }`;
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'fx/site.kyr': `Module fx "Exposed" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 2 at yard. ${body} }`,
      'fx/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'fx.campaign.json': JSON.stringify({ version: 1, name: 'fx', modules: [{ id: 'p', bundle: 'fx/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }, { name: 'Bo', raceId: 'human', classId: 'warrior' }] }) });
    return PlaySession.start(source.resolve('fx.campaign.json'), 'fx', source);
  }
  static async choose(s: PlaySession, name: RegExp) {
    return s.perform(PlayerView.choices(s.campaign).find(c => name.test(c.choice.name))!.choice.id);
  }
}
describe('a failed exposure', () => {
  it('says what its author wrote, or what came of it, and nothing of a crossing', async () => {
    const s = await Exposed.start();
    const heaved = await Exposed.choose(s, /^Heave; Ama/);
    expect(heaved.result).toBe('failure');
    expect(heaved.response).toContain('Ama');
    expect(heaved.response).not.toContain('cross');
    expect((await Exposed.choose(s, /^Lift; Bo/)).response).toBe('The weight wins.');
  }, 60000);
  it('takes a work\'s words as words', () => {
    expect(WorkPlans.fill(['  Observe x at y when true "The {name} hall".'], { name: 'Wen"na' }))
      .toEqual(['  Observe x at y when true "The Wen\\"na hall".']);
  });
});
