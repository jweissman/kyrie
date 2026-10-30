import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import type { Frame } from '../web/engine/protocol';
import type { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { GeneratedWorld } from './support/generated';
import { ScreenModel } from '../src/ui/screen-model';
import { Words } from '../web/reader/words';

// As you were told: what the innkeeper said of a place is borne out when the company comes to it, and the page says
// so once, under the place, naming who told it; the Book's notes have it as heard and since seen. Coming to it is
// read from the log (a company only put there has not come to it), and only what was heard is borne out.
class Told {
  static async begin() {
    const host = new EngineHost(() => undefined);
    await host.handle({ kind: 'begin', campaign: 'world', seed: 'a1', origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return { host, s: (host as unknown as { session: PlaySession }).session };
  }
  // The sites an innkeeper tells of, nearest the company first, with the keeper and the room they keep.
  static sites(s: PlaySession) {
    const world = s.campaign.world, here = world.one('at', 'party')!;
    return world.related('leadsTo').filter(r => /_named$/.test(r.args[0]!)).map(r => r.args[1]!)
      .map(site => ({ site, keeper: s.campaign.module.actions.find(a => a.id === `${site}_asked`)?.speaker }))
      .filter((x): x is { site: string; keeper: string } => !!x.keeper && world.one('at', x.keeper) !== undefined)
      .map(x => ({ ...x, room: world.one('at', x.keeper)!, legs: this.legs(s, x.site) }))
      .filter(x => x.legs > 0 && x.legs < Infinity && x.site !== here).sort((a, b) => a.legs - b.legs);
  }
  static legs(s: PlaySession, place: string): number {
    try { return GeneratedWorld.path(s, place).length; } catch { return Infinity; }
  }
  static async perform(host: EngineHost, command: string): Promise<Frame> {
    return await host.handle({ kind: 'perform', command }) as Frame;
  }
  // Goes to the innkeeper where they are now, waiting for them as need be (asleep, or about their day), and asks of
  // the site; and what the page noted.
  static async ask(host: EngineHost, s: PlaySession, at: { site: string; keeper: string }): Promise<string[]> {
    for (let tries = 0; tries < 30; tries++) {
      GeneratedWorld.put(s, s.campaign.world.one('at', at.keeper)!.replace(/^region__/, ''));
      await this.perform(host, 'wait');
      const ask = PlayerView.choices(s.campaign).find(c => c.choice.id.includes(`${at.site}_asked`));
      if (ask) { return (await this.perform(host, ask.choice.id)).leaf.exchange?.notes ?? []; }
    }
    throw new Error(`No asking ${at.keeper} of ${at.site}`);
  }
  // Walks there leg by leg, as the company would, and every note the page made on the way.
  static async walk(host: EngineHost, s: PlaySession, place: string): Promise<string[]> {
    const notes: string[] = [];
    for (const [passage, to] of GeneratedWorld.path(s, place)) {
      notes.push(...(await this.perform(host, `go(${passage},${to})`)).leaf.exchange?.notes ?? []);
    }
    return notes;
  }
  static fact(s: PlaySession, id: string) {
    return PlayerView.observe(s.campaign).knowledge.find(k => k.id === id);
  }
  static borne(notes: string[]): string[] { return notes.filter(n => n.startsWith('Borne out: ')); }
}

describe('as you were told', () => {
  it('bears out what the innkeeper said, once, naming the teller, when the company comes to it', async () => {
    const { host, s } = await Told.begin(), [at] = Told.sites(s);
    expect(at).toBeDefined();
    await Told.ask(host, s, at!);
    const named = `${at!.site}_named`, before = Told.fact(s, named)!;
    expect(before).toMatchObject({ source: 'heard' });
    expect(before.confirmed).toBeUndefined();
    const notes = await Told.walk(host, s, at!.site), borne = Told.borne(notes);
    expect(borne).toHaveLength(1);
    expect(borne[0]).toContain(`(${before.from!})`);
    expect(Words.label(borne[0]!)).toBe('As you were told');
    expect(Told.fact(s, named)!.confirmed).toBe(true);
    expect(ScreenModel.build(s.campaign).knowledge.find(k => k.text === Told.fact(s, named)!.text)?.kind)
      .toBe('confirmed');
    // Said once: not on the next thing done there, nor on coming back.
    expect(Told.borne((await Told.perform(host, 'wait')).leaf.exchange?.notes ?? [])).toEqual([]);
    const away = GeneratedWorld.path(s, at!.room)[0]!;
    await Told.perform(host, `go(${away[0]},${away[1]})`);
    expect(Told.borne(await Told.walk(host, s, at!.site))).toEqual([]);
  }, 90000);
  it('bears out nothing seen for itself, and what is heard of a place come to already is heard and seen at once',
    async () => {
      const { host, s } = await Told.begin(), [first] = Told.sites(s), site = first!.site;
      // Come to unheard of, a site says its own name (it is seen for itself), and nothing is borne out.
      expect(Told.borne(await Told.walk(host, s, site))).toEqual([]);
      expect(Told.fact(s, `${site}_named`)!.source).toBe('seen');
      // Told the way to it once it has been come to, it is heard and since seen as soon as it is known, and the page
      // has nothing to bear out after.
      const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
      c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', `${site}_found`) },
        { kind: 'assert', call: ModuleWriter.call('toldBy', 'party', first!.keeper, `${site}_found`) }]));
      expect(Told.fact(s, `${site}_found`)).toMatchObject({ source: 'heard', confirmed: true });
      expect(Told.borne((await Told.perform(host, 'wait')).leaf.exchange?.notes ?? [])).toEqual([]);
    }, 90000);
});
