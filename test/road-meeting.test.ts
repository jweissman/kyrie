import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import type { Frame, Member } from '../web/engine/protocol';

// Someone met on the way in, with something that wants deciding (the owner, 7 November: a decision on the road that
// reveals your character early, diegetically): the opening sets them apart before the first place, with what can be
// done about them, each by its command (data/origins/prologue.kyrt, Prologue.meeting). Each answer changes something
// that stays: what the company knows of itself (its notes keep it, as the town will), and what it carries or its purse;
// and once answered the meeting is not told again. A thief is offered what a warrior is not. One who begins under a
// roof (a debt, the brothers' errand) meets no one on a road.
class Road {
  static readonly warrior: Member[] = [{ name: 'Aud', raceId: 'human', classId: 'warrior' }];
  static async begin(seed: string, origin = 'wanderer', party = Road.warrior): Promise<{ host: EngineHost; f: Frame }> {
    const host = new EngineHost(() => undefined);
    const f = await host.handle({ kind: 'begin', campaign: 'world', seed, party, origin, apart: true }) as Frame;
    return { host, f };
  }
  static knows(f: Frame): string[] { return f.screen.knowledge.map(k => k.text); }
  static lifts(f: Frame): boolean { return f.leaf.prologue!.meeting!.choices.some(c => /Lift a sack/.test(c.label)); }
  static held(f: Frame): string { return `${f.screen.purse.coin}:${f.screen.purse.rations}:${f.screen.items.length}`; }
}

describe('the meeting on the road in', () => {
  it.each([['kite', 'origin__carter'], ['mere', 'origin__pedlar'], ['fen', 'origin__poacher']])(
    'in %s is %s, with answers, and an answer changes what the company knows and holds', async (seed, who) => {
      const { host, f } = await Road.begin(seed);
      const meeting = f.leaf.prologue!.meeting!;
      expect(meeting.who).toBe(who);
      expect(meeting.choices.length).toBeGreaterThanOrEqual(3);
      // The place does not tell the meeting again under the opening.
      expect(f.leaf.situation.join(' ')).not.toContain(meeting.text.slice(0, 40));
      const before = { knows: Road.knows(f), held: Road.held(f) };
      // The second answer is never the one that walks on: a bargain, a sack, holding the boy.
      const after = await host.handle({ kind: 'perform', command: meeting.choices[1]!.command }) as Frame;
      expect(after.leaf.exchange?.lines.length).toBeGreaterThan(0);
      expect(Road.knows(after).filter(k => !before.knows.includes(k)).some(k => /^On the way into/.test(k))
        || Road.held(after) !== before.held).toBe(true);
      expect(after.screen.observed.some(o => o.id === 'origin__meeting')).toBe(false);
    }, 120000);
  it('is answered differently by walking on, which the company knows of itself too', async () => {
    const { host, f } = await Road.begin('mere');
    const walk = f.leaf.prologue!.meeting!.choices.at(-1)!;
    expect(walk.label).toMatch(/walk on/i);
    const after = await host.handle({ kind: 'perform', command: walk.command }) as Frame;
    expect(Road.knows(after).join(' ')).toContain('kept to the far side of the road');
    expect(Road.held(after)).toBe(Road.held(f));
  }, 120000);
  it('offers a thief a sack off the cart, which a warrior is not offered', async () => {
    const thief = (await Road.begin('kite', 'wanderer', [{ name: 'Aud', raceId: 'human', classId: 'thief' }])).f;
    const warrior = (await Road.begin('kite')).f;
    expect([Road.lifts(thief), Road.lifts(warrior)]).toEqual([true, false]);
  }, 120000);
  it('is not had by one who begins under a roof', async () => {
    const { f } = await Road.begin('kite', 'debt');
    expect(f.leaf.prologue?.meeting).toBeUndefined();
    expect(f.leaf.prologue?.aim).toMatch(/owe/);
  }, 120000);
});
