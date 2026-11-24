import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { ModuleWriter } from '../src/lang/module-writer';
import { ObservationText } from '../src/lang/observation-text';
import { Spatial } from '../src/lang/spatial';

// Someone the company takes home is someone (OR-304; the owner's playtest of 23-24 November, "the boy. And just like
// a level one commoner. Like, well, okay. I have no idea who that is. Who do I return him to?"). The hobs' captive,
// untied in their pens and taken home, had been "the shepherd's boy" in the party and in every line: no name, no one
// he belonged to. He is a shepherd's son of the settlement the hobs rob, his name drawn for the world by the hobs'
// own generation (keyed by the module's identity, apart from the names it has: data/kits/raider-hold/hobs), the same
// name in his creature and his entity; penned he is only a boy among the sheep, and untied he says who he is and
// where home is, and the aim to take him there names him.
describe('a person the company takes home', () => {
  it('has a name of his own, says whose he is and where home is, and keeps them', async () => {
    const start = () => PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const c = (await start()).journey.session.campaign, w = c.world;
    const boy = c.module.entities.find(e => e.id === 'raidersFolk__captive')!;
    const [member] = c.readout.inhabitants[boy.id]!, name = c.readout.creatures.find(k => k.id === member)!.name;
    expect(name).not.toMatch(/boy|shepherd/);
    expect(boy.name.split(', ')[0]).toBe(name);
    expect(ObservationText.label(w, boy.id)).toBe('the shepherd\'s boy');
    const loose = w.apply([{ kind: 'retract', call: ModuleWriter.call('state', boy.id, 'raidersFolk__penned') },
      { kind: 'assert', call: ModuleWriter.call('state', boy.id, 'raidersFolk__loose') }]);
    expect(ObservationText.label(loose, boy.id)).toBe(name);
    const home = w.one('home', boy.id)!, by = new Map(c.module.entities.map(e => [e.id, e]));
    expect(Spatial.ancestry(by, home).some(e => e.space?.kind === 'settlement')).toBe(true);
    const follows = c.module.rules!.find(r => r.id === 'raidersFolk__boy_follows')!;
    expect(JSON.stringify(follows)).toContain('I\'m {raidersFolk__captive}, the shepherd\'s, from {');
    const aim = c.module.objectives!.find(o => o.id === 'raidersFolk__boy_home_aim')!;
    expect(aim.text).toMatch(/^\{raidersFolk__captive\}, the shepherd's son/);
    // And whoever on the green of the first town would come along (the drover's lad of a drove life, the eel-boy of
    // the weir's) is someone too, named for the town (RegionUndertown.hand), as a creature and in the rows.
    const hands = c.module.entities.filter(e => /_u_hand$/.test(e.id));
    expect(hands.length).toBeGreaterThan(0);
    for (const h of hands) {
      const [one] = c.readout.inhabitants[h.id] ?? [];
      const called = c.readout.creatures.find(k => k.id === one)!.name;
      expect(called).not.toMatch(/^the |^a |\{/);
      expect(called.split(' ').length).toBeGreaterThanOrEqual(2);
    }
    const again = (await start()).journey.session.campaign;
    const [other] = again.readout.inhabitants[boy.id]!;
    expect(again.readout.creatures.find(k => k.id === other)!.name).toBe(name);
  }, 120000);
});
