import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Journey } from '../src/session/journey';
import { Frontier } from '../src/world/frontier';
import { GeneratedWorld } from './support/generated';
import { Kept } from './support/kept';

// The Founders' Exchange as an opponent (doc/imbar/10-exchange.md): a Deem-cast organisation whose factor knows what is
// said at her table and what her carter and hands see, and answers by what she has: a lot got out of the way, a hand
// posted, a coin offered, a rival's word at the inn bought or the yard closed. What she does outlasts the visit and is
// read by other adventures.
class Ring {
  static async world(seed: string, terrain: string, gates: string[]) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { region: { terrain } });
    const s = await PlaySession.start(w.path, seed, w.source), frontier = new Frontier(seed, NodeBundleSource.shared);
    for (const g of gates) { await GeneratedWorld.travel(s, `gate_${g}`); await frontier.expand(s.campaign); }
    const town = (w.report.placements.find(p => p.scenario === 'factors')!.bindings as { town: string }).town;
    return { w, s, j: Journey.of(s), frontier, town };
  }
  // The Long Man's bronze goes downriver and into the factor's keeping, and the company comes to her table: made once
  // in the file for each country and resumed for each case after (see Kept.of), where each case had assembled the
  // country, gone through its gates and waited the two days again. The wait is told only as it ends (==): what is read
  // after it is the world it leaves.
  static async lotAtTable(seed: string, terrain: string, extra: string[] = []) {
    const name = `exchange ${seed} ${terrain} ${extra.join(' ')}`;
    const j = await Kept.of(name, async () => {
      const { s, j, frontier, town } = await this.world(seed, terrain, ['longman', ...extra]);
      await GeneratedWorld.travel(s, 'gate_longman'); await frontier.expand(s.campaign);
      const c = PlayerView.choices(s.campaign).find(x => /^Take the road on into Merrowdale/.test(x.choice.name))!;
      await s.leg(c.choice.id);
      const t0 = s.campaign.state.elapsed;
      await j.play(`==${t0 + 330}`);
      await GeneratedWorld.travel(s, `${town}_taproom`);
      Ring.made.set(name, { town, t0 });
      return j;
    });
    return { s: j.session, j, frontier: new Frontier(seed, NodeBundleSource.shared), ...Ring.made.get(name)! };
  }
  private static readonly made = new Map<string, { town: string; t0: number }>();
  static holds(j: Journey, name: string, ...a: string[]) { return j.holds(name, ...a); }
}

describe('the Exchange answers being asked', () => {
  it('moves a lot out of the way at once when it is asked after, and without the muscle to post a hand', async () => {
    const { j, t0 } = await Ring.lotAtTable('thorn', 'mountain');
    expect(j.holds('keeps', 'factors__factor', 'plongman__teeth')).toBe(true);
    expect(j.holds('factors__carterGone', 'factors__carter')).toBe(false);
    await j.play('Ask .* where the bronze comes from, in the north');
    expect(j.holds('factors__suspects', 'factors__factor', 'party')).toBe(true);
    await j.play('^Wait › An hour');
    expect(j.holds('factors__carterGone', 'factors__carter')).toBe(true);
    expect(j.holds('keeps', 'factors__carter', 'plongman__teeth')).toBe(true);
    // Three yardmen is not enough to spare one for a gate.
    expect(j.holds('factors__postedHand', 'factors__hands')).toBe(false);
    expect(j.campaign.state.elapsed).toBeLessThan(t0 + 330 + 3 * 144);
  }, 600000);

  it('posts a hand at the yard gate if it has the muscle, and the price of a lot goes up for the company that asks', async () => {
    const { j } = await Ring.lotAtTable('ash', 'frost');
    expect(j.measure('factors__muscle', 'factors__hands')).toBeGreaterThanOrEqual(4);
    await j.play('Ask .* where the bronze comes from, in the north');
    expect(j.holds('factors__postedHand', 'factors__hands')).toBe(true);
    expect(j.matches('yard gate').length).toBe(0);
  }, 600000);

  it('closes up and goes if a poor house is named at the inn, and the Collegium and the island read it', async () => {
    const { s, j, frontier } = await Ring.lotAtTable('thorn', 'mountain');
    expect(j.measure('factors__stock', 'factors__factor')).toBeLessThan(9);
    await j.play('^Wait › An hour');
    await j.play('Tell .* the factor buys bronze that was not hers to sell');
    await j.play('^Wait › An hour');
    expect(j.holds('routed', 'factors__hands')).toBe(true);
    expect(j.holds('at', 'factors__factor', 'factors__gone') || j.campaign.world.one('at', 'factors__factor') === 'factors__gone').toBe(true);
    await j.play('^Wait › An hour');
    // Low Water, entered later, finds no lot and a bare cloth; Halm says why.
    await GeneratedWorld.travel(s, 'gate_lowwater'); await frontier.expand(s.campaign);
    await GeneratedWorld.travel(s, 'plowwater__dig');
    await s.leg('wait');
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ')).toContain('there is nothing. A tin tag lies on it');
    expect(j.holds('keeps', 'plowwater__halm', 'plongman__teeth')).toBe(false);
    // The island's agent has lost his buyer: the Dorothea, entered later, brings it to Skerrow.
    await GeneratedWorld.travel(s, 'gate_tolleth'); await frontier.expand(s.campaign);
    expect(j.holds('routed', 'factors__hands')).toBe(true);
  }, 900000);

  it('buys the inn if it is rich, and the company is not served in the largest town any more', async () => {
    const { s, j, town } = await Ring.lotAtTable('ash', 'frost');
    const keeper = `region__${town}_innkeeper`;
    expect(j.measure('factors__stock', 'factors__factor')).toBeGreaterThanOrEqual(9);
    await j.play('Ask .* where the bronze comes from, in the north');
    await j.play('Tell .* the factor buys bronze that was not hers to sell');
    await j.play('^Wait › An hour');
    expect(j.holds('refusesService', keeper, 'party')).toBe(true);
    expect(j.holds('routed', 'factors__hands')).toBe(false);
    // And it keeps, across a reload.
    const back = Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint()))));
    expect(back.session.canonical()).toBe(s.canonical());
    expect(back.holds('refusesService', keeper, 'party')).toBe(true);
    expect(back.holds('keeps', 'factors__carter', 'plongman__teeth') || back.holds('keeps', 'factors__factor', 'plongman__teeth')).toBe(true);
  }, 600000);
});


describe('the Exchange\'s other answers', () => {
  it('names a dearer price to a company it suspects, and offers it coin to stop asking', async () => {
    const { j } = await Ring.lotAtTable('thorn', 'mountain');
    j.coin(40);
    await j.play('Ask .* where the bronze comes from, in the north');
    // The carter has been told to go; before he does, the dear price is the only price.
    expect(j.matches('Buy .* back from .* at fourteen to the pound').length).toBe(0);
    await j.play('Ask .* why the yardmen watch you');
    const before = j.measure('quantity', 'party', 'gold') as number;
    await j.play('Take the Exchange.s twelve coin');
    expect(j.measure('quantity', 'party', 'gold')).toBe(before + 12);
    expect(j.holds('factors__suspects', 'factors__factor', 'party')).toBe(false);
  }, 600000);
});

describe('what the Exchange\'s fall does on an island', () => {
  it('leaves the factor\'s agent on Skerrow with a lot of bronze and no foundry, so the lamp is not sold', async () => {
    const { s, j, frontier } = await Ring.lotAtTable('thorn', 'mountain');
    await j.play('^Wait › An hour', 'Tell .* the factor buys bronze that was not hers to sell', '^Wait › An hour');
    expect(j.holds('routed', 'factors__hands')).toBe(true);
    await GeneratedWorld.travel(s, 'gate_tolleth'); await frontier.expand(s.campaign);
    const c = PlayerView.choices(s.campaign).find(x => /^Take the road on into/.test(x.choice.name))!;
    await s.leg(c.choice.id);
    const t0 = Math.ceil(s.campaign.state.elapsed / 144) * 144;
    await j.play('^To Tolleth quay', 'Ask Captain Bascom for passage', 'Pay Captain Bascom six', "^To the Dorothea's waist");
    j.assert('ptolleth__seaQuiet', 'ptolleth__hull'); // fixed timeline: the sea table (weather.kyr) is off
    await j.play(`=${t0 + 180}`, '^To the quarterdeck', 'lie off', `=${t0 + 216}`, "^To the Dorothea's waist", '^To Skerrow jetty', '^To Skerrow green', '^Into the Gull');
    await j.play('Ask Silas Quillon what he wants');
    await j.play(`=${t0 + 222}`);
    expect(j.holds('ptolleth__keptLamp', 'party')).toBe(true);
    expect(j.holds('ptolleth__tableSold', 'party')).toBe(false);
    // And nobody is paid to sell it however long the company stays.
    await j.play(`=${t0 + 330}`);
    expect(j.holds('ptolleth__tableSold', 'party')).toBe(false);
  }, 900000);
});
