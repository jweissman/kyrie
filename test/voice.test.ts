import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { Voice } from '../src/narrative/voice';
import { VoiceReview } from '../src/narrative/voice-review';
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
  const keys = ['bond', 'manner', 'pronoun', 'kind', 'species', 'time', 'shelter', 'moment', 'cause', 'side', 'role',
    'sky', 'land', 'crossing', 'size', 'temper', 'light', 'number', 'present'];
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
        const text = Voice.render(line.text, { actor: 'Wat', target: 'the boar', pronoun, place: 'the yard',
          values: { from: 'Hollin', to: 'Brough', way: 'path' } });
        expect(text).not.toMatch(/[{}[\]|]/);
      }
    }
  });
  it('no line reads wrong as told: no doubled word, verb out of agreement, stray space or sentence left open', () => {
    expect(VoiceReview.review().filter(r => r.faults.length).map(r => `${r.id}: ${r.faults.join('; ')}`)).toEqual([]);
    expect(VoiceReview.faults('Wren swears under their their breath ,and they is gone')).toEqual(['a word doubled: their their',
      'a verb that does not agree', 'a space out of place', 'no end to the sentence']);
  });
});

describe('a way across country, told as it goes', () => {
  it('says the land the road runs through, and coming in sight of where it ends', async () => {
    const { WorldAssembler } = await import('../src/world/world-assembler');
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'thorn', w.source);
    const go = async (re: RegExp) =>
      s.perform(PlayerView.choices(s.campaign).find(c => re.test(c.choice.name) || re.test(c.choice.id))!.choice.id);
    await go(/_green\)$/);
    const out = await go(/^Take the road to the road between/);
    const kinds = (out.voiced ?? []).map(v => v.kind);
    expect(kinds).toContain('journey-depart');
    expect(kinds).toContain('journey-land');
    // On to the town at the far end, not back to the one it left.
    const left = out.action.split(',')[1]!, onward = PlayerView.choices(s.campaign)
      .find(c => /_green\)$/.test(c.choice.id) && !c.choice.id.startsWith(`go(${left},`))!;
    const on = await s.perform(onward.choice.id);
    expect((on.voiced ?? []).some(v => v.kind === 'journey-arrive')).toBe(true);
    // Never the same sentence twice in a row of journeys.
    const said = [...out.voiced ?? [], ...on.voiced ?? []].map(v => v.id);
    expect(new Set(said).size).toBe(said.length);
    // Back the way it came, a way taken before is told by its setting out: not the land again, nor the town coming
    // in sight (the follow-up review read familiar journeys in full).
    const back = (e: { action: string }) => {
      const [, way, from] = /^go\((.+)\)$/.exec(e.action)![1]!.split(',');
      return s.perform(`go(${way},${from})`);
    };
    for (const e of [await back(on), await back(out)]) {
      expect((e.voiced ?? []).map(v => v.kind).filter(k => k === 'journey-land' || k === 'journey-arrive')).toEqual([]);
    }
  }, 60000);
});

describe('the turning points of a fight', () => {
  it('are remarked on now and then, in the fighter\'s own manner, and never twice the same', async () => {
    const { Barks } = await import('../src/narrative/barks');
    const fighters = [{ id: 'a', name: 'Wenna', team: 'fighters', raceId: 'human' },
      { id: 'b', name: 'a cultist', team: 'goblins', raceId: 'human' }] as never[];
    const barks = new Barks(fighters, 'k'), said: string[] = [];
    for (let n = 0; n < 40; n++) {
      const b = barks.of([{ type: 'attack', turn: n, actor: n % 2 ? 'a' : 'b', target: n % 2 ? 'b' : 'a', die: 20, need: 10,
        toHit: 0, armorClass: 10, weapon: 'x', success: true, critical: true }] as never[], n);
      if (b) { said.push(b); }
    }
    expect(said.length).toBeGreaterThan(0);
    expect(said.length).toBeLessThan(40);
    expect(new Set(said).size).toBe(said.length);
  });
});

// Under the ground there is no hour to speak of: Tessary's clerks in a hall under the sea said "Mind how you go in the
// dark" (TS-W19, NAR-06). wren's old workings at night, and its green at the same hour.
describe('the hour, as the voice tables have it', () => {
  it('is night above ground at night, and no hour below it', async () => {
    const { WorldAssembler } = await import('../src/world/world-assembler');
    const { VoiceContext } = await import('../src/narrative/voice-context');
    const { GeneratedWorld } = await import('./support/generated');
    const w = await WorldAssembler.assemble('wren', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'wren', w.source);
    await s.perform('wait_for_dark');
    const hour = () => { const v = VoiceContext.of(s.campaign, { kind: 'farewell' } as never, new Set()); return [v.time, v.shelter]; };
    expect(hour()).toEqual(['night', 'outdoors']);
    GeneratedWorld.put(s, 'w9_adit_crossing');
    expect(hour()).toEqual(['day', 'underground']);
  }, 120000);
});
