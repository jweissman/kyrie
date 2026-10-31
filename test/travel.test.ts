import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Itineraries } from '../src/ui/itinerary';
import { Countries } from '../src/world/countries';
import { Travel } from '../src/session/travel';
import { GeneratedWorld } from './support/generated';
import { ScreenModel } from '../src/ui/screen-model';
import { Hours } from '../web/reader/hours';

// The way into adventure (Mission 16's Gate B): the first country's towns tell of the authored country beyond it,
// the notice is up where travellers are kept, and once it is known the way there is known too, over the country's
// roads; going there is one choice, made leg by leg as the page would make it.
describe('the way into Merrowdale', () => {
  // The map draws the towns the country's roads go to, and a town drawn there is somewhere to set out for: the map had
  // said "You know no way there yet" of a town at the end of a road it drew (Mission 17); and so are the march-stones
  // and the way into the province at the roads' ends, a single road away too (the navigation review).
  it('can set out from the map for any town the roads it knows go to, without it being a lead', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), c = s.campaign;
    const towns = w.report.region.settlements.map(t => `region__${t.id}`);
    const here = c.world.one('at', c.playerActor!)!.replace(/_[a-z]+$/, '');
    // Not leads: the place offers none to set out for yet; the map and the notes may set out for each town.
    const leads = Itineraries.destinations(c), roads = Itineraries.roads(c, leads);
    expect(roads.map(d => d.id).filter(id => towns.includes(id)).sort())
      .toEqual(towns.filter(t => !here.startsWith(t)).sort());
    expect(roads.map(d => d.id).filter(id => !towns.includes(id)).sort()).toEqual(['region__edge_east', 'region__edge_north',
      'region__edge_south', 'region__edge_west', ...Countries.list.map(x => `region__gate_${x.id}`)].sort());
    expect(roads.every(d => d.legs.length > 0 && d.minutes > 0)).toBe(true);
    expect(roads.some(d => leads.some(l => l.id === d.id))).toBe(false);
  }, 120000);
  it('is told in the town the protagonist comes to, and is one journey along known roads', async () => {
    const w = await WorldAssembler.assemble('wren', NodeBundleSource.shared, { origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    // Merrowdale a province of the country (Gate B: one country, every adventure in it).
    expect(w.report.region.provinces!.map(p => p.name)).toContain('Merrowdale');
    const s = await PlaySession.start(w.path, 'wren', w.source);
    const c = s.campaign, names = () => PlayerView.choices(c).map(x => x.choice.name);
    // Every town's keeper of travellers can tell it, named for what it is about.
    const told = c.module.actions.filter(a => a.id.startsWith('region__gate_longman_beyond_told_'));
    expect(told.length).toBe(w.report.region.settlements.length);
    await s.perform(PlayerView.choices(c).find(x => /bailey/.test(x.choice.name))!.choice.id);
    await s.perform(PlayerView.choices(c).find(x => /Wooden Wolf/.test(x.choice.name))!.choice.id);
    expect(names()).toContain('Read a notice from Merrowdale');
    expect(Itineraries.destinations(c)).toEqual([]);
    await s.perform(PlayerView.choices(c).find(x => x.choice.name === 'Ask Fargrim about the forty crowns in Merrowdale')!
      .choice.id);
    // Known, the way in is somewhere to set out for, by the country's roads.
    const [to] = Itineraries.destinations(c);
    expect(to?.name).toBe('the way into Merrowdale');
    expect(to!.legs.length).toBeGreaterThan(1);
    const done = await Travel.go({ campaign: c, perform: command => s.perform(command) }, to!.id);
    expect([done.arrived, done.stopped, done.legs.length]).toEqual([true, undefined, to!.legs.length]);
    // Told as one journey: it sets out once, not on every leg, and the land is not told twice over (the free play
    // read "You set out from …, and the rain sets out with you" on four legs running).
    const voiced = done.legs.flatMap(l => l.event.voiced ?? []);
    expect(voiced.filter(v => v.kind === 'journey-depart').length).toBe(1);
    const land = voiced.filter(v => v.kind === 'journey-land').map(v => v.text);
    expect(new Set(land).size).toBe(land.length);
    expect(c.world.one('at', c.playerActor!)).toBe('region__gate_longman');
    // Each leg is an ordinary command in the transcript, so the journey replays as it was made.
    expect(s.transcript.steps.slice(-done.legs.length).every(step => step.command.startsWith('go('))).toBe(true);
  }, 180000);
  // The free play crossed the bridge over the Karnahar "with your boots full": a road crosses its river as it is
  // built to, by its bridge or its ford.
  it('crosses a river as its road does, over the bridge and not through the water', async () => {
    const w = await WorldAssembler.assemble('f1', NodeBundleSource.shared, { origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'f1', w.source), c = s.campaign;
    await GeneratedWorld.travel(s, 's1_s4_way');
    const bridge = PlayerView.choices(c).find(x => x.choice.id.includes('region__road_s1_s4_on'))!;
    expect(bridge.choice.name).toStartWith('Take the bridge over the Alquarant');
    const land = ((await s.perform(bridge.choice.id)).voiced ?? []).filter(v => v.kind === 'journey-land');
    expect(land.map(v => v.id)).toEqual([expect.stringMatching(/^journey-land\.river\.bridge\./)]);
  }, 120000);
  // The Bushweald play read "By the track to {region__w13}" in the legs of a journey home from the site it led to.
  it('names each leg of a journey as the page names the way', async () => {
    const w = await WorldAssembler.assemble('wren', NodeBundleSource.shared, { origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'wren', w.source);
    await GeneratedWorld.travel(s, 'w1');
    const legs = (ScreenModel.build(s.campaign).destinations ?? []).flatMap(d => d.legs.map(l => l.way));
    expect([legs.includes('the track to Lapiscustod'), legs.some(l => l.includes('{'))]).toEqual([true, false]);
  }, 120000);
  // As the world keeps them: dark from nine (a journey's night had fallen at eight: the navigation review).
  it('reckons night as the dark hours, which stop a journey that runs into them', () => {
    expect([0, 11, 12, 13, 22].map(h => Hours.night(h * 60))).toEqual([false, false, false, true, false]);
  });
});
