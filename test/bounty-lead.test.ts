import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Itineraries } from '../src/ui/itinerary';
import { ScreenModel } from '../src/ui/screen-model';
import { Obituary } from '../src/narrative/obituary';
import type { Act } from '../src/ui/screen-types';
import { GeneratedWorld } from './support/generated';

// A price on the raiders' chief says where the raiders are: the widow on her town's green looks toward their hold as
// she offers it, and her word puts it on the company's map, somewhere to set out toward (a fresh play of Mission 17
// took up her offer and found nothing to say where the raiders were, and nobody else would). A pedlar who knows the
// place says it by its name.
describe('a price on a power', () => {
  it('says where the power holds out, and that is somewhere to set out toward', async () => {
    const w = await WorldAssembler.assemble('ember', NodeBundleSource.shared, { origin: 'herbs',
      party: [{ name: 'Aud', raceId: 'elf', classId: 'ranger' }] });
    const s = await PlaySession.start(w.path, 'ember', w.source), c = s.campaign;
    await GeneratedWorld.travel(s, c.world.one('at', 'pricePatron__widow')!.replace(/^region__/, ''));
    const offer = PlayerView.choices(c).find(x => /what she is waiting for/.test(x.choice.name))!;
    expect((await s.perform(offer.choice.id)).response).toContain('looking toward a toll-house by the water');
    const hold = Itineraries.destinations(c).find(d => d.name === 'a toll-house by the water')!;
    expect([hold.toward, hold.legs.length]).toEqual(['Thornholt', 1]);
  }, 120000);
  // At the hold, the challenge to fight is weighed up before it is taken, as an attack is, and a fight it
  // brings on and loses is told as chosen, not as being set upon (a fresh play took it up unwarned and died).
  it('says what a challenge to its chief would come to, and tells a fight so begun as chosen', async () => {
    const w = await WorldAssembler.assemble('ember', NodeBundleSource.shared, { origin: 'herbs',
      party: [{ name: 'Aud', raceId: 'elf', classId: 'ranger' }] });
    const s = await PlaySession.start(w.path, 'ember', w.source), c = s.campaign;
    GeneratedWorld.put(s, 'w6');
    await s.perform('wait');
    const acts: Act[] = [], screen = ScreenModel.build(c);
    for (const a of [...screen.people, ...screen.things].flatMap(r => r.acts)) { acts.push(a, ...a.children ?? []); }
    expect(acts.find(a => /^Call Sir Hamo out/.test(a.label))?.reckoned)
      .toEqual({ danger: 'deadly', text: 'Sir Hamo Ashdown is more than you can take.' });
    await s.perform(PlayerView.choices(c).find(x => /^Call Sir Hamo out/.test(x.choice.name))!.choice.id);
    for (let i = 0; i < 12 && c.running; i++) {
      const strike = PlayerView.choices(c).find(x => /Strike/.test(x.choice.name)) ?? PlayerView.choices(c)[0]!;
      await s.perform(strike.choice.id);
    }
    expect(Obituary.of(c).lines).toContain('It began when you chose to call Sir Hamo out to fight.');
  }, 120000);
  // The pedlar at Naedltun knows the place too, by its name: what she says is what the note of it says (the note had
  // named Fyrsteport, which nobody had: NAR-12).
  it('is told of by a traveller by its name, as the note of it names it', async () => {
    const w = await WorldAssembler.assemble('ember', NodeBundleSource.shared, { origin: 'herbs',
      party: [{ name: 'Aud', raceId: 'elf', classId: 'ranger' }] });
    const s = await PlaySession.start(w.path, 'ember', w.source), c = s.campaign;
    await GeneratedWorld.travel(s, 's5_green');
    const ask = PlayerView.choices(c).find(x => /^Ask Maud about the country off the road/.test(x.choice.name))!;
    expect((await s.perform(ask.choice.id)).response).toContain('Fyrsteport, a toll-house by the water in Thornholt');
  }, 120000);
});
