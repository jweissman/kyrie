import { beforeAll, describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { Narrator } from '../src/presentation/narrator';
import { ScreenModel } from '../src/ui/screen-model';
import type { Campaign } from '../src/campaign/campaign';
import { AsMeant } from './support/as-meant';

// The road home on S3-0's two clean runs (mission-22/s3-0-run-2026-11-20.md: the warrior's drove and the mage's weir,
// their lines in mission-22/s3-0/), where the run met what the owner would: two golds at once (GR-01), a journey
// stopped short with nothing said of why (GR-02), and the aim followed led in gold on the page and not in the runner's
// account of it (GR-03). Each turn as the recording has it, by its step.
class Route {
  static async played(as: string, file: string, upto: number): Promise<{ at: Said[]; c: Campaign }> {
    const lines = readFileSync(`doc/architecture/mission-22/s3-0/${file}`, 'utf8').split('\n').filter(Boolean);
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', as]));
    const r = new Runner(journey.session), at: Said[] = [];
    for (const line of lines.slice(0, upto)) {
      let s = await AsMeant.ask(r, line);
      if ('error' in s) { s = await Route.answer(r, line, at) ?? s; }
      if ('error' in s) { throw new Error(`${line}: ${s.error}`); }
      at.push(s);
    }
    return { at, c: journey.session.campaign };
  }
  // A line the recording took that a warning now holds (OR-163: under a warning only its answers are offered): the
  // warning answered as the engine's rows offer it. Going on elsewhere is leaving by the way the company came, and
  // then the line (the mage's drain, the centipede warning her off); anything else is standing its ground, which lets
  // what warns come on, as the line had (the warrior's search of the gate-well, the conger coming at the search).
  static async answer(r: Runner, line: string, at: Said[]): Promise<Said | undefined> {
    const s = r.said(), rows = [...s.offer.primary, ...s.offer.rest].flatMap(o => [o, ...o.opens ?? []]);
    const stand = rows.find(o => o.label === 'Stand your ground');
    if (!stand) { return undefined; }
    // Where it was before, not a turn of a fight (which stands nowhere: the buck fought on past the recording's blows).
    const before = [...at].reverse().find(x => x.at && x.at !== s.at)?.at;
    const back = rows.find(o => /^go\(/.test(o.does ?? o.id) && !!before && (o.does ?? o.id).endsWith(`,${before})`));
    const done = (x: Said | { error: string }) => ('error' in x ? undefined : x);
    if (line.includes('travel:') && back) {
      return done(await r.ask(JSON.stringify({ act: back.id }))) && done(await AsMeant.ask(r, line));
    }
    return done(await r.ask(JSON.stringify({ act: stand.id })));
  }
  // What the page draws in gold toward the aim followed: the glance's acts drawn for it.
  static gold(c: Campaign): string[] {
    const g = Narrator.leaf(c, ScreenModel.build(c)).glance!;
    return g.acts.filter(a => a.facets?.includes('aimed') && ['named', 'toward', 'advance'].includes(a.why))
      .map(a => a.choice);
  }
}
describe('the road home, on the warrior\'s route', () => {
  let at: Said[] = [];
  beforeAll(async () => { ({ at } = await Route.played('human/warrior/Wenna', 'warrior-lines.txt', 52)); }, 180000);
  it('leads out of the Wardens\' gatehouse toward the reeve, and to her at the landing', () => {
    // Step 48, the claim followed in the gatehouse: the way out to the sea-bank, gold on the page, is led.
    expect([at[47]!.at, at[47]!.led]).toEqual(['gate__gatehouse', ['go(gate__gate_door,gate__bank)']]);
    // Step 52, come to the landing: the claim itself, said to the reeve.
    expect([at[51]!.at, at[51]!.led]).toEqual(['region__s1_green', ['gate__claim_whole']]);
    // And says no need of another aim's there: the corn-store's padlock is nothing to the claim (GR-11).
    expect(at[51]!.scene.lines.join(' ')).not.toContain('Pick the corn-store padlock');
  });
  it('says why the journey home stopped short', () => {
    expect([at[49]!.at, at[49]!.scene.lines]).toEqual(['region__s5_s2_way', expect.arrayContaining(['You are weary'])]);
  });
  // Gatesend's thanks, said as the company passed its green, said with where (GR-07), not as if on the Reedbridge road.
  it('tells what a place passed on the way said with that place', () => {
    const lines = at[49]!.scene.lines;
    expect(lines.filter(l => /Doors are open all along the lane/.test(l)))
      .toEqual([expect.stringMatching(/^At the gate-yard of Gatesend: Doors are open/)]);
  });
});
describe('the road home, on the mage\'s route', () => {
  let at: Said[] = [], c: Campaign;
  beforeAll(async () => { ({ at, c } = await Route.played('elf/mage/Ilse/scholar', 'mage-lines.txt', 51)); }, 180000);
  it('says why the journey home stopped short', () => {
    expect([at[49]!.at, at[49]!.scene.lines]).toEqual(['region__s5_s2_way',
      expect.arrayContaining(['Night has come on'])]);
  });
  it('has one gold on the road beside Porthalen: the landing, not a journey to the country it is in', () => {
    expect(at[50]!.at).toBe('region__s1_s5_way');
    expect(Route.gold(c)).toEqual(['exit:region__s1_green']);
    // Led across into the next hex, it opens the map at the landing, every client alike (the owner's ruling, MT-18).
    expect(at[50]!.led).toEqual(['view:map:region__s1_green']);
  });
});
