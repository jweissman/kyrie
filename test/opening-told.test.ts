import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import type { Frame, Member, Message } from '../web/engine/protocol';
import { Origins } from '../src/world/origins';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { FictionalTime } from '../src/campaign/fictional-time';
import { Typography } from '../src/presentation/typography';

// A new game's opening, told apart before the first place where the page asks (the owner's OWN-17): the origin's
// chapter, why the company came in the origin's own words, then the arrival, naming the town; then the first place,
// which tells neither again but what is there as the company comes. Every origin there is opens so (Kite holds them
// all); a campaign whose origin says nothing as it opens (an authored one) has no opening, and a page that does not
// ask (automation) is told it all in the place, as before.
class Opened {
  static readonly party: Member[] = [{ name: 'Aud', raceId: 'human', classId: 'warrior' }];
  static readonly origins = ['kin', 'order', 'debt', 'herbs', 'wanderer'];
  static async begin(origin: string, apart: boolean, host = new EngineHost(() => undefined)): Promise<Frame> {
    return await host.handle({ kind: 'begin', campaign: 'world', seed: 'kite', party: this.party, origin,
      apart }) as Frame;
  }
  // What the origin says in the first moment, as a page sets it.
  static said(frame: Frame): string[] {
    return frame.screen.observed.filter(o => o.id.startsWith('origin__'))
      .map(o => Typography.curl(FictionalTime.prose(o.text)));
  }
  static first(text: string): string { return /^.*?[.!?](?=\s|$)/.exec(text)?.[0] ?? text; }
}

describe('a new game\'s opening', () => {
  it('is had by every origin there is', async () => {
    const all = (await Origins.load(NodeBundleSource.shared)).map(o => o.manifest.id);
    expect([...Opened.origins].sort()).toEqual(all.sort());
  });
  it.each(Opened.origins)('of %s is its chapter and its own first lines, and the place opens on what is there',
    async origin => {
      const frame = await Opened.begin(origin, true), told = frame.leaf.prologue!;
      const title = (await Origins.load(NodeBundleSource.shared)).find(o => o.manifest.id === origin)!.manifest.title;
      // Its chapter heads the opening, and not the place again.
      expect([told.title, frame.leaf.heading]).toEqual([title, undefined]);
      // Why the company came first, in the origin's words; then the arrival, naming the town.
      const town = frame.screen.path.find(p => p.kind === 'settlement')!.name;
      expect(told.beats.length).toBe(2);
      expect(told.beats.every(b => Opened.said(frame).includes(b))).toBe(true);
      expect(told.beats[1]).toContain(Typography.curl(town));
      // The place tells neither, not even in brief (it had opened on the arrival's first sentence), nor who at the
      // inn is looking for work (that is in the notes); but it does not open on nothing.
      const place = [...frame.leaf.situation, ...frame.leaf.presence].join(' ');
      for (const beat of told.beats) { expect(place).not.toContain(Opened.first(beat)); }
      expect(place).not.toContain('looking for work');
      expect(place.length).toBeGreaterThan(0);
      // What the company means to do is in its notes from the first: the herb-wife's errand had been told in the
      // opening and then nowhere.
      expect(frame.screen.objectives.length).toBeGreaterThan(0);
      if (origin === 'herbs') { expect(frame.screen.objectives.join(' ')).toContain('feverwort you carry'); }
      // The story begins with the opening, under its chapter.
      expect([frame.entries[0]?.placeName, frame.entries[0]?.lines]).toEqual([title, told.beats]);
    }, 120000);
  it('is told in the place, as it always was, where the page does not ask for it apart', async () => {
    const frame = await Opened.begin('kin', false);
    expect(frame.leaf.prologue).toBeUndefined();
    expect(frame.leaf.heading).toEqual({ kind: 'opening', title: 'Coming home' });
    expect(frame.leaf.situation.join(' ')).toContain('letter took a week to find you');
    expect(frame.entries).toEqual([]);
  }, 120000);
  it('is told again, and nothing recapped, to a game kept before anything was done in it', async () => {
    const saves: string[] = [];
    const host = new EngineHost((m: Message) => { if (m.kind === 'saved') { saves.push(m.save); } });
    const begun = await Opened.begin('debt', true, host);
    for (let i = 0; i < 500 && !saves.length; i++) { await new Promise(r => setTimeout(r, 20)); }
    const saved = await host.handle({ kind: 'checkpoint' }) as string;
    const opened = await new EngineHost(() => undefined).handle({ kind: 'resume', saved, apart: true }) as Frame;
    expect([opened.leaf.prologue, opened.leaf.recap]).toEqual([begun.leaf.prologue, undefined]);
    expect(opened.entries.length).toBe(1);
  }, 120000);
  it('is not had by an authored campaign, which opens on its first place', async () => {
    const host = new EngineHost(() => undefined), campaign = 'data/campaigns/the-long-man.campaign.json';
    const setting = await host.handle({ kind: 'setting', campaign }) as { party: Member[] };
    const frame = await host.handle({ kind: 'begin', campaign, seed: 'merrow', party: setting.party,
      apart: true }) as Frame;
    expect(frame.leaf.prologue).toBeUndefined();
    expect(frame.leaf.situation.length).toBeGreaterThan(0);
  }, 120000);
});
