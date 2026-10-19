import { expect, it } from 'bun:test';
import { HistoricalCampaign } from './support/historical-campaign';
import { PlaySession, type Transcript, type SessionCheckpoint } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { SerewaterRecord } from '../bin/record-serewater';

it.each(['fellowship', 'hired'])('replays the complete %s browser expedition and preserves canonical consequences', async kind => {
  const transcript = await Bun.file(`doc/playtests/serewater/${kind}.browser.replay.json`).json() as Transcript;
  const checkpoint = await Bun.file(`doc/playtests/serewater/${kind}.browser.save.json`).json() as SessionCheckpoint;
  const s = await PlaySession.start(transcript.scenario, transcript.seed, NodeBundleSource.shared, transcript.party);
  const before = s.campaign.state.creatures, money = SerewaterRecord.money(s);
  await s.replay(transcript.steps);
  const historical = PlaySession.resume(checkpoint);
  const catalog = new Set(checkpoint.save.module.entities.filter(e => e.type === 'ability').map(e => e.id));
  expect(HistoricalCampaign.gameplay(s.campaign.save(true), catalog))
    .toEqual(HistoricalCampaign.gameplay(historical.campaign.save(true), catalog));
  expect(s.canonical()).toBe(PlaySession.resume(s.checkpoint()).canonical());
  expect(SerewaterRecord.money(s)).toBe(money);
  expect(transcript.steps.length).toBeGreaterThan(80);
  expect(s.campaign.state.outcomes!['march.secret_stair_known']).toBe(true);
  expect(s.campaign.state.outcomes!['march.deep_return_route']).toBe(true);
  expect(s.campaign.state.outcomes!['march.surveyor_home']).toBe(true);
  expect(s.campaign.state.outcomes!['march.salvagers_withdrawn']).toBe(true);
  expect(s.campaign.world.test(ModuleWriter.call('armed', 'march__counterweight'))).toBe(false);
  expect(s.campaign.world.test(ModuleWriter.call('armed', 'march__miasma'))).toBe(false);
  const after = s.campaign.state.creatures;
  expect(after.every(c => JSON.stringify(c.base) === JSON.stringify(before.find(b => b.id === c.id)!.base))).toBe(true);
  expect(after.some(c => c.state.learnedAbilities.includes('serewater_training'))).toBe(true);
  expect(after.some(c => c.state.inventory?.some(i => i.id === 'march__line_cache' && i.equipped))).toBe(true);
  expect(after.some(c => c.state.inventory?.some(i => i.id === 'march__charm_cache' && i.equipped))).toBe(true);
  expect(after.some(c => c.state.inventory?.some(i => i.id === 'march__medicine_1'))).toBe(false);
  expect(s.campaign.state.outcomes!['march.guardian_destroyed']).toBe(kind === 'hired');
  expect(PlayerView.observe(s.campaign).location?.scene).toBe('town');
  expect(PlayerView.observe(s.campaign).map.places.filter(p => p.visited && p.scene === 'dungeon').length)
    .toBeGreaterThanOrEqual(14);
}, 60000);

it('constructs three levels and independent seeded inhabitants, relics, stock and flood context', async () => {
  const a = await PlaySession.start('data/serewater/campaign.json', 'serewater', NodeBundleSource.shared);
  const b = await PlaySession.start('data/serewater/rain.campaign.json', 'downpour', NodeBundleSource.shared);
  const entities = a.campaign.module.entities, facts = a.campaign.world.snapshot.relations;
  const levels = facts.filter(r => r.name === 'undergroundDistrict').map(r => r.args[0]);
  expect(levels).toHaveLength(3);
  for (const level of levels) { expect(facts.filter(r => r.name === 'district' && r.args[1] === level)).toHaveLength(6); }
  expect(entities.filter(e => e.type === 'place' && e.space?.kind === 'room')).toHaveLength(27);
  expect(entities.filter(e => e.space?.kind === 'level').map(e => e.name)).toEqual(['Level I · Foundry', 'Level II · Flood refuge', 'Level III · Ossuary']);
  expect(a.campaign.state.creatures.map(c => [c.raceId, c.base.level])).not.toEqual(
    b.campaign.state.creatures.map(c => [c.raceId, c.base.level]));
  expect(a.campaign.world.snapshot.measures).not.toEqual(b.campaign.world.snapshot.measures);
  expect(PlayerView.observe(a.campaign).map.places.some(p => p.id === 'march__vault')).toBe(false);
  expect(a.campaign.module.actions.length).toBeLessThan(10000);
}, 30000);

it('resumes the frozen historical ability catalog without inventing facts and still rejects creature inconsistency', async () => {
  const checkpoint = await Bun.file('doc/playtests/serewater/fellowship.browser.save.json').json() as SessionCheckpoint;
  const resumed = PlaySession.resume(checkpoint), save = resumed.campaign.save(true);
  expect(save.creatures).toEqual(checkpoint.save.creatures);
  expect(save.state.world).toEqual(checkpoint.save.state.world);
  const inconsistent = structuredClone(checkpoint);
  inconsistent.save.creatures.find(c => c.id === inconsistent.save.state.partyIds[0])!.state.hp = 0;
  expect(() => PlaySession.resume(inconsistent)).toThrow('Inconsistent saved creature facts');
});

it('does not let a rescued traveler be escorted away from home once there', async () => {
  const party = [{ name: 'Elen', raceId: 'elf', classId: 'ranger', backgroundId: 'forager' },
    { name: 'Bran', raceId: 'human', classId: 'fighter', backgroundId: 'surveyor' },
    { name: 'Dori', raceId: 'dwarf', classId: 'cleric', backgroundId: 'pilgrim' }] as const;
  const s = await PlaySession.start('data/serewater/campaign.json', 'serewater', NodeBundleSource.shared,
    party.map(p => ({ ...p })));
  for (const c of ['travel(march__causeway)', 'travel(march__ridge)', 'travel(march__yard)', 'travel(march__vestibule)',
    'free_obstruction(march__rack,march__pell)', 'escort(march__pell,march__yard)', 'escort(march__pell,march__ridge)',
    'escort(march__pell,march__causeway)', 'escort(march__pell,march__quay)']) { await s.perform(c); }
  expect(s.campaign.world.test(ModuleWriter.call('at', 'march__pell', 'march__quay'))).toBe(true);
  expect(PlayerView.choices(s.campaign).some(c => c.action.schema === 'escort')).toBe(false);
  await expect(s.perform('escort(march__pell,march__causeway)')).rejects.toThrow('Unavailable command');
}, 30000);
