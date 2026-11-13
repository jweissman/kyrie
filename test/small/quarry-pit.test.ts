import { describe, expect, it } from 'bun:test';
import { Laboratory } from '../../scripts/laboratory';
import { PlayTool } from '../../src/cli/play-tool';
import { Runner, type Said } from '../../src/cli/runner';
import { Costs } from '../../src/costs';

// The quarry pit at Lowmouth, a place worth returning to (M21's RI-01..03, in the laboratory): what a company finds
// there is its own (a ranger the fox-runs, a scholar the old mark, and only then the ivy to pull off it); an hour on
// the faces and a search each find once, and stay found; by night, the vixen, for one who knows her runs.
class Pit {
  private constructor(readonly r: Runner, private said: Said) {}
  static async as(build: string): Promise<Pit> {
    const mark = Costs.mark();
    const { journey } = await PlayTool.start(PlayTool.parse([Laboratory.file, '--as', build]));
    expect([Costs.since(mark).region, Costs.since(mark).world]).toEqual([undefined, undefined]);
    const r = new Runner(journey.session);
    return new Pit(r, r.said());
  }
  offered(label: RegExp): boolean {
    return [...this.said.offer.primary, ...this.said.offer.rest].some(o => label.test(o.label));
  }
  async do(label: RegExp): Promise<string> {
    const o = [...this.said.offer.primary, ...this.said.offer.rest].find(x => label.test(x.label));
    if (!o) { throw new Error(`not offered: ${label}`); }
    return this.told(await this.r.ask(JSON.stringify({ act: o.id })));
  }
  async look(): Promise<string> { return this.told(await this.r.ask(JSON.stringify({ look: true }))); }
  private told(out: Said | { error: string }): string {
    if ('error' in out) { throw new Error(out.error); }
    this.said = out;
    return out.scene.lines.join(' ');
  }
}
describe('the quarry pit', () => {
  it('shows a ranger the fox-runs and the vixen by night, and a scholar the wheel, the ivy then to be pulled', async () => {
    const ranger = await Pit.as('human/ranger/Aud'), mage = await Pit.as('human/mage/Wynn');
    await ranger.do(/old quarry pit/); await mage.do(/old quarry pit/);
    const [seen, read] = [await ranger.look(), await mage.look()];
    expect([/fox/.test(seen), /wheel with no wing/.test(seen)]).toEqual([true, false]);
    expect([/fox/.test(read), /wheel with no wing/.test(read)]).toEqual([false, true]);
    expect([ranger.offered(/Pull the ivy/), mage.offered(/Pull the ivy/)]).toEqual([false, true]);
    // The ivy pulled stays pulled: told on coming back.
    await mage.do(/Pull the ivy/); await mage.do(/landing/);
    expect(await mage.do(/old quarry pit/)).toMatch(/the word ROAD/);
    // By night, the vixen, for the one who knows her runs.
    await ranger.do(/landing/); await ranger.do(/Wait until dark/);
    expect(await ranger.do(/old quarry pit/)).toMatch(/vixen comes/i);
  });
  it('finds what an hour on the faces and a search find once, and then not again', async () => {
    const p = await Pit.as('human/warrior/Brann');
    await p.do(/old quarry pit/);
    expect(await p.do(/Work along the faces/)).toMatch(/two coins green with age/);
    expect(p.offered(/Work along the faces/)).toBe(false);
    expect(await p.do(/^Search/)).toMatch(/luck-stone|hole worn through it/);
    expect(p.offered(/^Search/)).toBe(false);
  });
});
