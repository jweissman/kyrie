import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Itineraries } from '../src/ui/itinerary';
import { GeneratedWorld } from './support/generated';

// A price on the raiders' chief says where the raiders are: the widow at Naedltun looks toward their hold as she
// offers it, and her word puts it on the company's map, somewhere to set out toward (a fresh play of Mission 17 took
// up her offer and found nothing to say where the raiders were, and nobody else would).
describe('a price on a power', () => {
  it('says where the power holds out, and that is somewhere to set out toward', async () => {
    const w = await WorldAssembler.assemble('ember', NodeBundleSource.shared, { origin: 'herbs',
      party: [{ name: 'Aud', raceId: 'elf', classId: 'ranger' }] });
    const s = await PlaySession.start(w.path, 'ember', w.source), c = s.campaign;
    await GeneratedWorld.travel(s, 's5_green');
    const offer = PlayerView.choices(c).find(x => /what she is waiting for/.test(x.choice.name))!;
    expect((await s.perform(offer.choice.id)).response).toContain('looking toward a toll-house by the water');
    const hold = Itineraries.destinations(c).find(d => d.name === 'a toll-house by the water')!;
    expect([hold.toward, hold.legs.length]).toEqual(['Thyrnebearwas', 1]);
  }, 120000);
});
