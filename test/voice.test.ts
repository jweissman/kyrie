import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { Voice } from '../src/narrative/voice';
import type { CampaignEvent } from '../src/campaign/campaign-types';

// The household: you come home to the farm; the dog meets you in the yard; your brother is in the kitchen and will
// come with you when you ask. What the voice tables say of each, and that it is said as a narrator should say it.
class Household {
  static start() { return PlaySession.start('test/fixtures/household/household.campaign.json', 'h', NodeBundleSource.shared); }
  static async act(s: PlaySession, label: string): Promise<CampaignEvent> {
    const c = PlayerView.choices(s.campaign).find(x => new RegExp(label, 'i').test(x.choice.name));
    if (!c) { throw new Error(`No /${label}/ among ${PlayerView.choices(s.campaign).map(x => x.choice.name).join(' | ')}`); }
    return s.perform(c.choice.id);
  }
}

describe('The voice of the household', () => {
  it('a dog meets you as a dog, once, and is patted as a dog, never twice the same way', async () => {
    const s = await Household.start();
    const yard = await Household.act(s, 'yard gate');
    expect(yard.voiced?.map(v => v.kind)).toEqual(['greet']);
    expect(yard.voiced![0]!.id).toMatch(/^greet\.dog\./);
    const pats: string[] = [];
    for (let i = 0; i < 4; i++) {
      const e = await Household.act(s, 'Make much of Fly');
      expect(e.voiced?.length).toBe(1);
      pats.push(e.voiced![0]!.id);
    }
    expect(pats[0]).toMatch(/^pet\.dog\.first\./);
    expect(pats.slice(1).every(id => /^pet\.dog\.again\./.test(id))).toBe(true);
    expect(new Set(pats).size).toBe(pats.length);
    // Back through the gate and in again: Fly has met you already, and says nothing of it.
    await Household.act(s, 'yard gate'); const again = await Household.act(s, 'yard gate');
    expect(again.voiced ?? []).toEqual([]);
  }, 60000);

  it('your brother comes with you as family, not as a hireling, and is still himself on the road', async () => {
    const s = await Household.start();
    await Household.act(s, 'yard gate'); await Household.act(s, 'back door');
    const joined = await Household.act(s, 'Ask Wat to join');
    const told = joined.voiced?.map(v => v.text).join(' ') ?? '';
    expect(joined.voiced?.[0]?.id).toMatch(/^join\.kin\./);
    expect(told).toContain('Wat');
    expect(told).not.toMatch(/shakes on it|is one of you|hire|coin/);
    expect(s.campaign.world.test(ModuleWriter.call('travelsWith', 'h__brother', 'party'))).toBe(true);
    await Household.act(s, 'back door');
    const asked = await Household.act(s, 'Ask Wat about Father');
    expect(asked.response).toContain('The cart came back');
  }, 60000);

  it('no line is said of someone the company cannot see or is not with', async () => {
    const s = await Household.start();
    for (const step of ['yard gate', 'Make much of Fly', 'back door', 'Ask Wat to join', 'back door', 'yard gate']) {
      const e = await Household.act(s, step), world = s.campaign.world, here = world.one('at', 'party');
      for (const v of e.voiced ?? []) {
        const with_ = world.test(ModuleWriter.call('travelsWith', v.actor!, 'party')) || world.one('at', v.actor!) === here;
        expect(with_).toBe(true);
      }
    }
  }, 60000);
});

describe('The voice tables', () => {
  const keys = ['bond', 'manner', 'pronoun', 'kind', 'species', 'time', 'shelter', 'moment', 'cause', 'side', 'role'];
  it('every line has its own id, names only circumstances the narrator knows, and says where it came from', () => {
    const ids = Voice.tables.flatMap(t => t.lines.map(l => l.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const line of Voice.tables.flatMap(t => t.lines)) {
      expect(Object.keys(line.when ?? {}).filter(k => !keys.includes(k))).toEqual([]);
      if (line.id.includes('.orsino.')) { expect(line.source?.orsino).toMatch(/^barks:/); }
    }
  });
  it('every line reads whole in every person it may be said of', () => {
    for (const line of Voice.tables.flatMap(t => t.lines)) {
      for (const pronoun of ['he', 'she', 'they', 'it']) {
        const text = Voice.render(line.text, { actor: 'Wat', target: 'the boar', pronoun, place: 'the yard' });
        expect(text).not.toMatch(/[{}[\]|]/);
      }
    }
  });
});
