import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Itineraries } from '../src/ui/itinerary';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlayerView } from '../src/presentation/player-view';
import { GeneratedWorld } from './support/generated';

// A door someone told of and the ruin behind it, once gone into, are one place to set out for: back in town, a fresh
// play was offered "Riwustagn" twice, its door and the stair inside it (play 7).
describe('places to set out for', () => {
  it('names a ruin once, though its door was told of and its inside has been gone into', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Aud', raceId: 'human', classId: 'ranger' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), c = s.campaign;
    const start = c.world.one('at', 'party')!.replace(/^region__/, '');
    const lead = c.world.related('leadsTo').find(r => r.args[1] === 'region__w2')!.args[0]!;
    const told = c as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    told.commit(told.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', lead) }]));
    GeneratedWorld.put(s, 'w2');
    const into = PlayerView.choices(c).find(x => /^go\(/.test(x.choice.id) && !/track/.test(x.choice.name))!;
    await s.perform(into.choice.id);
    GeneratedWorld.put(s, start);
    await s.perform('wait');
    expect(Itineraries.destinations(c).map(d => d.name).filter(n => n === 'Campancol')).toEqual(['Campancol']);
  }, 120000);
});
