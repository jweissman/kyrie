import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';
import { Stakes } from '../src/ui/stakes';

// An aim's target, said by its author and resolved once (the quest-intent and travel-contract review, 9 November): its
// subject, where what it asks is done, and where a way toward it leads; an aim with none read as before, said to be a
// reading. A target is never knowledge: the map is given the town someone is in, not their room.
describe('an aim’s target', () => {
  const tiny = (toward: string) => `Module m "m" { Kind group. Entity party: group "You". Entity keeper: group "The keeper".
    Entity inn: group "The inn". Relation done(group).
    Objective ask when not done(party) ${toward} "Ask at the inn.". }`;
  it('is parsed as its author writes it, and refused when it names nothing', () => {
    expect(ModuleParser.parse(tiny('toward keeper, inn')).objectives?.[0]?.toward).toEqual(['keeper', 'inn']);
    expect(ModuleParser.parse(tiny('')).objectives?.[0]?.toward).toBeUndefined();
    expect(() => new ModuleCompiler().instantiate(ModuleParser.parse(tiny('toward nobody')), 'seed'))
      .toThrow(/toward nobody, which is not an entity/);
  });
  it('is the installed entities, resolved once, its author’s or read from its words', async () => {
    const w = await WorldAssembler.assemble('kahitude', NodeBundleSource.shared, { origin: 'courier',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'kahitude', w.source), c = s.campaign;
    const def = (id: string) => c.module.objectives!.find(o => o.id === id)!;
    // The courier's letter: toward whoever it is for, installed as the town's own merchant.
    const carry = Stakes.target(c, def('origin__carry'));
    expect(carry).toEqual({ subject: 'region__s3_merchant', source: 'authored' });
    // The first town's rats: where the job is done, the cellar, never the corn-store over it.
    const rats = Stakes.target(c, def('region__s1_u_rats_job_aim'));
    expect([rats.actionAt, rats.routeTo, rats.source]).toEqual(['region__s1_u_cellar', 'region__s1_u_cellar', 'authored']);
    // One its author gave none is read from its words, and says so.
    const legacy = c.module.objectives!.find(o => !o.toward && /\{/.test(o.text))!;
    expect(Stakes.target(c, legacy).source).toBe('legacy');
    // The map is given Elmham, where the letter goes, and not the room its addressee keeps.
    const aim = ScreenModel.build(c).aims!.find(a => a.id === 'origin__carry')!;
    expect(aim.places).toContain('region__s3');
    expect(aim.places).not.toContain(c.world.one('at', 'region__s3_merchant'));
  }, 120000);
});
