import { beforeAll, describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { ObservationText } from '../src/lang/observation-text';
import { Itineraries } from '../src/ui/itinerary';
import { Travel } from '../src/session/travel';
import { GeneratedWorld } from './support/generated';

// What a starting town tells leads somewhere (the M16 deepening). Before, wren's first town told of seventeen things
// and only two march-stones could be set out for: word of a lone tower or a pit in the ground named a place that no
// way the company knew went to, and the way to a ruin deep in a wood, once told, was not a way it could set out along.
describe('word that leads somewhere', () => {
  let built: Awaited<ReturnType<typeof WorldAssembler.assemble>>;
  beforeAll(async () => {
    built = await WorldAssembler.assemble('wren', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
  }, 120000);
  const start = async () => {
    const s = await PlaySession.start(built.path, 'wren', built.source);
    await s.perform(PlayerView.choices(s.campaign).find(x => /^go\(/.test(x.choice.id))!.choice.id);
    return s;
  };
  // Told something, as a tale or a topic would tell it.
  const know = (s: PlaySession, fact: string) => {
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', fact) }]));
  };
  const go = (s: PlaySession, to: string) => Travel.go({ campaign: s.campaign,
    perform: command => s.perform(command) }, to);
  const zone = (s: PlaySession, id: string) => s.campaign.module.entities.find(e => e.id === id)!.space!.parent!;

  it('makes the place a trouble is at somewhere to set out for, called as it is known', async () => {
    const s = await start(), c = s.campaign;
    const tower = built.report.placements.find(p => p.scenario === 'unquiet-tower')!, id = `region__${tower.bindings.spire}`;
    expect(Itineraries.destinations(c).map(d => d.id)).not.toContain(id);
    await GeneratedWorld.hear(s, tower, 1);
    // Out of the taproom the carrier was found in, by its door (hear puts the company there unwalked).
    await GeneratedWorld.travel(s, GeneratedWorld.carrier(s, tower).room.replace(/_[a-z]+$/, '_green'));
    const d = Itineraries.destinations(c).find(x => x.id === id)!;
    // The way there is the way the word tells, through the wood to where the tower's track starts: not toward it.
    expect([d.toward, d.name]).toEqual([undefined, ObservationText.label(c.world, id)]);
    expect(d.name).not.toBe(c.module.entities.find(e => e.id === id)!.name);
    const done = await go(s, id);
    expect(done.legs.length).toBeGreaterThan(0);
    expect(done.arrived || !!done.stopped).toBe(true);
  }, 120000);

  it('sets out toward a place known only by name, as far as the wild country it lies in, and says so', async () => {
    const s = await start(), c = s.campaign;
    const deep = c.module.entities.filter(e => /^region__w\d+$/.test(e.id) && /^region__z\d+$/.test(e.space?.parent ?? ''))
      .find(e => { know(s, `${e.id}_named`); return Itineraries.plan(c, e.id)?.toward; })!;
    const plan = Itineraries.plan(c, deep.id)!;
    expect(plan.toward).toBe(ObservationText.label(c.world, zone(s, deep.id)));
    const done = await go(s, deep.id);
    expect(done.arrived).toBe(false);
    expect(done.stopped).toBe(`You know no way on to ${deep.name}`);
    expect(Itineraries.within(new Map(c.module.entities.map(e => [e.id, e])), c.world.one('at', 'party')!,
      zone(s, deep.id))).toBe(true);
  }, 120000);

  it('knows the paths of wild country whose lie it knows', async () => {
    const s = await start(), c = s.campaign;
    const heart = c.module.entities.find(e => /^region__z\d+_heart$/.test(e.id))!;
    // Not knowing them, it can go only as far as the edge of the country.
    expect(Itineraries.plan(c, heart.id)?.toward).toBe(ObservationText.label(c.world, zone(s, heart.id)));
    know(s, `${zone(s, heart.id)}_mapped`);
    const plan = Itineraries.plan(c, heart.id)!;
    expect([plan.toward, plan.to]).toEqual([undefined, heart.id]);
  }, 120000);

  it('makes where the willow grows somewhere to set out for', async () => {
    const s = await start(), c = s.campaign;
    const told = c.world.related('leadsTo').filter(r => /_willows$/.test(r.args[0]!));
    expect(told.length).toBeGreaterThan(0);
    know(s, told[0]!.args[0]!);
    const ids = Itineraries.destinations(c).map(d => d.id);
    expect(told.filter(r => r.args[0] === told[0]!.args[0]).some(r => ids.includes(r.args[1]!))).toBe(true);
  }, 120000);
});
