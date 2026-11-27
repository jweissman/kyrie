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
  // after: where the world now asks more of the run than it did, the acts it asks, played after the recording's line
  // (by its number, from one), as the run's player would have played them. instead: where the protagonist now sets
  // out otherwise than the run's did, the act the run's player would have played in place of the recording's line.
  static async played(as: string, file: string, upto: number,
    { after = {}, instead = {} }: { after?: Record<number, string[]>; instead?: Record<number, string> } = {}):
    Promise<{ at: Said[]; c: Campaign }> {
    const lines = readFileSync(`doc/architecture/mission-22/s3-0/${file}`, 'utf8').split('\n').filter(Boolean)
      .slice(0, upto).flatMap((line, i) => [instead[i + 1] ?? line, ...after[i + 1] ?? []]);
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'iscoed', '--as', as]));
    const r = new Runner(journey.session), at: Said[] = [];
    for (const line of lines) {
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
  // The journey home from the sea-bank (line 50) had gone past Gatesend's green, where the town was out thanking the
  // company, to the bridge over the Whitewater, where the company was weary. It stops at the green now, for the paper
  // the reeve's levy sit under, a sign newly there of people the company can speak with (ArrivalAttention's sign; the
  // old glance led them for the place's life alone, OR-748); the company sets out home again from there, as the run
  // had (the same line again), and comes to the bridge weary as before.
  beforeAll(async () => {
    ({ at } = await Route.played('human/warrior/Wenna', 'warrior-lines.txt', 52,
      { after: { 50: [JSON.stringify({ act: 'travel:region__s1' })] } }));
  }, 180000);
  it('leads out of the Wardens\' gatehouse toward the reeve, and to her at the landing', () => {
    // Step 48, the claim followed in the gatehouse: the way out to the sea-bank, gold on the page, is led.
    expect([at[47]!.at, at[47]!.led]).toEqual(['gate__gatehouse', ['go(gate__gate_door,gate__bank)']]);
    // Step 52, come to the landing (one later for the stop at Gatesend): the claim itself, said to the reeve.
    expect([at[52]!.at, at[52]!.led]).toEqual(['region__s1_green', ['gate__claim_whole']]);
    // And says no need of another aim's there: the corn-store's padlock is nothing to the claim (GR-11).
    expect(at[52]!.scene.lines.join(' ')).not.toContain('Pick the corn-store padlock');
  });
  it('says why the journey home stopped short', () => {
    expect([at[49]!.at, at[50]!.at, at[50]!.scene.lines])
      .toEqual(['region__s4_green', 'region__s5_s2_way', expect.arrayContaining(['You are weary'])]);
  });
  // What a place passed on the way said is said with where (GR-07), not as if where the company stopped. Gatesend's
  // thanks, which had been said so as the company passed its green, are said at the green itself now that the journey
  // stops there, as its own. The pedlar once met on the woodland south of Reedbridge on the last leg home is met by
  // the rover's fortune for that stretch and day now (OR-1345), which that day does not bring; the last leg passes
  // nothing that speaks, and nothing is said at the landing as if passed (test/small/travel-passed holds GR-07's
  // telling with its place).
  it('tells what a place passed on the way said with that place', () => {
    const thanks = (i: number) => at[i]!.scene.lines.filter(l => /Doors are open all along the lane\./.test(l));
    expect([thanks(49), thanks(50), thanks(52)])
      .toEqual([[expect.stringMatching(/^Doors are open all along the lane\. Someone has chalked/)], [], []]);
    expect(at[52]!.scene.lines.filter(l => /^At [^:]+: /.test(l))).toEqual([]);
  });
});
describe('the road home, on the mage\'s route', () => {
  let at: Said[] = [], c: Campaign;
  // Ilse is a diviner, her first-level spells drawn by her own seed, each spell ranked by its own hash
  // (SpellSelection.ranked). Her one pick of divination was Second Sight until Comprehend Languages came into the
  // catalog (b40e30950, OR-1099), the other spell of the school, which wins that draw; every other spell she knows is
  // as it was. Her step 33 prepares Siphon Life in place of her divination, which is Comprehend Languages now.
  const prepared = 'prepare_spell(region__member_party_1,siphon_life,comprehend_languages,circle_1)';
  beforeAll(async () => {
    ({ at, c } = await Route.played('elf/mage/Ilse/scholar', 'mage-lines.txt', 51,
      { instead: { 33: JSON.stringify({ act: prepared }) } }));
  }, 180000);
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
