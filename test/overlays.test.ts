import { describe, expect, it } from 'bun:test';
import { Content, type CreatureGenerationContext } from '../src/content';
import { Canon } from '../src/canon/canon';
import { Overlays } from '../src/overlays';
import { Cast } from '../src/campaign/cast';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { ModuleParser } from '../src/lang/module-parser';
import type { Person } from '../src/lang/module';

class Party {
  static readonly river = 'data/caught-below/river.campaign.json';
  static readonly quarry = 'data/caught-below/quarry.campaign.json';
  static start(manifest: string, party?: CreatureGenerationContext[]) {
    return PlaySession.start(manifest, 'overlays', NodeBundleSource.shared, party);
  }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  static readonly plain = [{ name: 'Ada', raceId: 'human', classId: 'fighter' }, { name: 'Bo', raceId: 'human', classId: 'fighter' },
    { name: 'Cy', raceId: 'human', classId: 'fighter' }] as CreatureGenerationContext[];
}

describe('backgrounds and professions are typed overlays from Orsino', () => {
  it('compose onto one character: Orsino stats, scaled gold, catalog gear and a skill, each with its source', () => {
    const base = new Content('overlay-test').createCreature('x', { raceId: 'elf', classId: 'ranger' });
    const hunter = new Content('overlay-test').createCreature('x', { raceId: 'elf', classId: 'ranger', backgroundId: 'hunter' });
    expect(hunter.base.dexterity - base.base.dexterity).toBe(2);
    expect(hunter.base.wisdom - base.base.wisdom).toBe(1);
    expect(hunter.state.gold - base.state.gold).toBe(2);
    expect(hunter.state.inventory).toEqual([{ id: 'x__rope', definition: 'rope' }]);
    expect(Overlays.contributions(hunter).filter(c => c.kind === 'skill')).toEqual([{ kind: 'skill', value: 'woodcraft', source: 'hunter' }]);
    expect(Canon.backgrounds.hunter!.source.orsino).toBe('background:hunter');
  });
  it('rejects compositions Orsino forbids or the model cannot mean', () => {
    const c = new Content('overlay-test');
    expect(() => c.createCreature('x', { raceId: 'human', classId: 'fighter', backgroundId: 'medic' })).toThrow('requires the cleric class');
    expect(() => c.createCreature('x', { raceId: 'human', classId: 'fighter', backgroundId: 'innkeeper' })).toThrow('is a profession');
    expect(() => c.createCreature('x', { raceId: 'human', classId: 'fighter', professionId: 'hunter' })).toThrow('is a background');
  });
  it('the same overlay means the same thing in both installations', async () => {
    for (const manifest of [Party.river, Party.quarry]) {
      const s = await Party.start(manifest);
      const elen = s.campaign.state.creatures.find(c => c.name === 'Elen')!;
      expect(elen.backgroundId).toBe('hunter');
      expect(elen.state.inventory?.map(i => i.definition)).toEqual(['rope']);
      expect(s.campaign.world.test({ kind: 'call', name: 'capable', args: ['party', 'woodcraft'] })).toBe(true);
    }
  }, 60000);
  it('change what a company can do: lockwork opens the stores, mending sets a bone, woodcraft calms the hound', async () => {
    const toWorkshop = ['go(world__causeway_path,world__causeway)', 'go(world__low_path,world__drain_mouth)', 'go(world__culvert,world__workshop)'];
    const trained = await Party.start(Party.river), plain = await Party.start(Party.river, Party.plain);
    for (const s of [trained, plain]) { for (const c of toWorkshop) { await s.perform(c); } }
    expect(Party.legal(trained)).toContain('change_thing(world__padlock_pick)');
    expect(Party.legal(plain)).not.toContain('change_thing(world__padlock_pick)');
    for (const s of [trained, plain]) { await s.perform('go(world__gallery_steps,world__gallery)'); }
    expect(Party.legal(trained)).toContain('change_thing(world__hound_soothe)');
    expect(Party.legal(plain)).not.toContain('change_thing(world__hound_soothe)');
    expect(Party.legal(plain)).toContain('change_thing_paying(world__hound_feed)');
    await trained.perform('change_thing(world__hound_soothe)'); await trained.perform('go(world__hoist_passage,world__hoist)');
    await trained.perform('rescue__heave_free(world__member_party_2)');
    expect(Party.legal(trained)).toContain('rescue__set_leg(party,world__hoist)');
  }, 90000);
  it('wayfinding puts the region\'s roads on the map before the company has walked them', async () => {
    const explorer = await Party.start(Party.river, [{ name: 'Elen', raceId: 'elf', classId: 'ranger', backgroundId: 'explorer' },
      ...Party.plain.slice(1)]);
    const walker = await Party.start(Party.river, Party.plain);
    const regions = (s: PlaySession) => ScreenModel.build(s.campaign).region?.areas.map(a => a.name) ?? [];
    expect(regions(explorer)).toContain('Censer Hill foundry');
    expect(regions(walker)).not.toContain('Censer Hill foundry');
  }, 60000);
  it('a profession gives a person offers and a routine; an authored offer of the same kind wins', async () => {
    const s = await Party.start(Party.river);
    await s.perform('go(world__oar_door,world__taproom)');
    const maud = ScreenModel.build(s.campaign).people.find(p => p.id === 'world__maud')!;
    expect(maud.acts.map(a => a.label)).toContain('Take a bed and supper — 3 coin');
    expect(s.campaign.module.pursuits?.some(p => p.actor === 'world__maud' && p.label === 'keeping the inn')).toBe(true);
    const own = { id: 'm', name: 'M', place: 'p', raceId: 'human', classId: 'commoner', level: 1, actions: [],
      professionId: 'innkeeper', offers: [{ kind: 'lodging', text: 'a cot', fee: 1 }] } as Person;
    const module = ModuleParser.parse('Module t "T" { Relation offers(group, service). Goal false. }');
    Cast.professions(module, [own]);
    expect(module.entities.some(e => e.type === 'service')).toBe(false);
  }, 60000);
});

describe('authored identity is never overwritten by generation', () => {
  it('keeps authored fields, fills open ones, records provenance and reports conflicts', () => {
    const p = { id: 'nera', name: 'Nera', place: 'shop', raceId: 'human', classId: 'commoner', level: 2, actions: [],
      authored: ['raceId', 'level'] } as Person;
    const conflicts: string[] = [];
    const cast = Cast.person(p, { name: 'Nerys', raceId: 'dwarf', classId: 'fighter' }, conflicts);
    expect(cast.context).toMatchObject({ name: 'Nerys', raceId: 'human', classId: 'fighter', level: 2 });
    expect(cast.provenance).toMatchObject({ name: 'generated', raceId: 'authored', classId: 'generated', level: 'authored' });
    expect(conflicts).toEqual(['nera.raceId: generated dwarf ignored; authored human kept']);
    expect(() => Cast.person(p, { hitPoints: 4 })).toThrow('not a field of a person');
  });
});
