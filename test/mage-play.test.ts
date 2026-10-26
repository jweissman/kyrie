import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { PartyCapabilities } from '../src/campaign/party-capabilities';
import { Obituary } from '../src/narrative/obituary';
import { Voice } from '../src/narrative/voice';
import { GeneratedWorld } from './support/generated';
import type { CreatureGenerationContext } from '../src/content';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';

// What a mage's first afternoon in cov7's king-barrow found. Tharash, a warrior, saw off three beetles that "were no
// match for you" while they bit Wenna, at seven hit points, down; her conjured light went out as she fell; she died
// of the fall at rest; and the page said she fell at the forecourt, where she was carried, struck "with a mandibles".
class Barrow {
  static async start(party: CreatureGenerationContext[]) {
    const w = await WorldAssembler.assemble('cov7', NodeBundleSource.shared, { party });
    return PlaySession.start(w.path, 'cov7', w.source, party);
  }
  static readonly mage = { name: 'Wenna', raceId: 'human', classId: 'mage' } as CreatureGenerationContext;
  static async take(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No ${pattern}`); }
    return s.perform(c.choice.id);
  }
  // Into a room, with light to see by.
  static put(s: PlaySession, room: string) {
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', `region__${room}`) },
      { kind: 'retract', call: ModuleWriter.call('unlit', `region__${room}`) }]));
  }
  static seen(s: PlaySession) { return PlayerView.observe(s.campaign).observations.map(o => o.text); }
}

describe('a mage in the king-barrow', () => {
  it('is told who could fall in a fight the company would win, and by whom', async () => {
    const s = await Barrow.start([Barrow.mage, { name: 'Tharash', raceId: 'human', classId: 'warrior' }]);
    GeneratedWorld.put(s, 'w9_barrow_back_stone');
    const beetles = ScreenModel.build(s.campaign).people.find(p => /beetles/.test(p.name))!;
    expect(beetles.reckoning).toEqual({ danger: 'hard', text: 'Tharash reckons you would likely beat them, but Wenna could fall.' });
  }, 60000);
  // Alone, the one who could fall is the one who plays, and no one would get them up: the laboratory's lone warrior
  // took on hobs reckoned only "someone could fall", and died.
  it('tells one who is alone that they could fall, with no one to get them up', async () => {
    const s = await Barrow.start([Barrow.mage]);
    GeneratedWorld.put(s, 'w9_barrow_back_stone');
    const beetles = ScreenModel.build(s.campaign).people.find(p => /beetles/.test(p.name))!;
    expect(beetles.reckoning?.text).not.toContain('someone');
    if (beetles.reckoning?.danger === 'hard') {
      expect(beetles.reckoning.text).toBe('You would likely beat them, but you could fall, with no one to get you up.');
    }
  }, 60000);
  it('keeps a conjured light over one who has fallen, where a torch falls with them', async () => {
    const s = await Barrow.start([Barrow.mage]), wenna = s.campaign.readout.creatures[0]!;
    const fallen = (condition: string) => ({ ...structuredClone(wenna),
      state: { ...structuredClone(wenna.state), hp: 0, conditions: [{ id: condition, remaining: 3 }] } });
    expect(PartyCapabilities.has('light', [fallen('lit')])).toBe(true);
    expect(PartyCapabilities.has('light', [fallen('torchlit')])).toBe(false);
  }, 60000);
  it('hears its leader as someone, and says what was read as read', async () => {
    const s = await Barrow.start([Barrow.mage]);
    Barrow.put(s, 'w9_barrow_chamber');
    expect(Barrow.seen(s).join(' ')).toContain('the scrape of a whetstone on steel');
    Barrow.put(s, 'w9_barrow_passage');
    await Barrow.take(s, /^Read the words on the passage stone$/);
    expect(Barrow.seen(s)).toContain('You have read the words cut on the passage stone.');
  }, 60000);
  it('sets out with the dew on the grass only early in the morning', () => {
    const early = Voice.tiers('journey-depart', { time: 'morning', sky: 'fair', light: 'early' }).flat();
    const late = Voice.tiers('journey-depart', { time: 'morning', sky: 'fair' }).flat();
    expect(early.some(l => /dew/.test(l.text))).toBe(true);
    expect(late.some(l => /dew|shadow long/.test(l.text))).toBe(false);
  });
  // The follow-up review: companions went from the page once everything had been asked of them.
  it('keeps a companion with the company when nothing is left to ask them', async () => {
    const w = await WorldAssembler.assemble('cov7', NodeBundleSource.shared, { origin: 'wanderer', party: [Barrow.mage] });
    const s = await PlaySession.start(w.path, 'cov7', w.source);
    Barrow.put(s, 's1_taproom');
    await Barrow.take(s, /^Ask Tharash what brings/);
    await Barrow.take(s, /^Ask Tharash to join the company$/);
    // Every question put to him once (each can be put again, for the same answer: NAR-03).
    for (let n = 0; n < 8; n++) {
      const ask = PlayerView.choices(s.campaign).find(c => /^Ask Tharash (?!again)/.test(c.choice.name));
      if (!ask) { break; }
      await s.perform(ask.choice.id);
    }
    expect(PlayerView.choices(s.campaign).some(c => /^Ask Tharash (?!again)/.test(c.choice.name))).toBe(false);
    expect(ScreenModel.build(s.campaign).people.filter(p => p.companion).map(p => p.name.split(',')[0])).toEqual(['Tharash']);
  }, 60000);
  // "The elders looks up, and puts their hands still": of many, only what can be said of many.
  it('is greeted by the elders of the town as many', async () => {
    const s = await Barrow.start([Barrow.mage]);
    Barrow.put(s, 's1_green');
    const event = await Barrow.take(s, /^Talk to the elders$/);
    expect(event.voiced?.map(v => v.text)).toContain('The elders break off talking among themselves to hear what you want.');
  }, 60000);
  it('says where one fell, and what struck them, when no one is left', async () => {
    const s = await Barrow.start([Barrow.mage]);
    GeneratedWorld.put(s, 'w9_barrow_back_stone');
    await Barrow.take(s, /^Attack the beetles$/);
    expect(s.campaign.running).toBe(false);
    const [fell, , struck] = Obituary.of(s.campaign).lines;
    expect(fell).toStartWith('Wenna fell at the back-stone');
    expect(struck).toMatch(/with its mandibles/);
  }, 60000);
});
