import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Journey } from '../src/session/journey';
import { Frontier } from '../src/world/frontier';
import { GeneratedWorld } from './support/generated';

// The black square in the Nexus floor, the Slack beneath it, and the ship that lies there (doc/imbar/09-slack.md). The
// locks open to things that can be had in several adventures and in several forms; the ship is entered, sailed in and
// left by the ordinary travel of the world.
class Slack {
  static async world(gates: string[], seed = 'thorn') {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { region: { terrain: 'mountain' } });
    const s = await PlaySession.start(w.path, seed, w.source), frontier = new Frontier(seed, NodeBundleSource.shared);
    for (const g of gates) { await GeneratedWorld.travel(s, `gate_${g}`); await frontier.expand(s.campaign); }
    return { w, s, j: Journey.of(s), frontier };
  }
}

describe('the black square', () => {
  it('stays shut to a company with none of the three, and opens to a reading, a measure and a standing however they were had', async () => {
    const { j } = await Slack.world(['sennet', 'longman']);
    j.put('party', 'psennet__nexus');
    await j.play('^Wait › An hour');
    expect(j.matches('Open the black square').length).toBe(0);
    // A reading by lore is no use to a company without lore; by rubbings it is, wherever they came from.
    j.give('plongman__writ_copy');
    await j.play('Say the keeper\'s formula');
    expect(j.holds('psennet__squareVouched', 'party')).toBe(true);
    expect(j.matches('Open the black square').length).toBe(0);
  }, 300000);
});

describe('the way down', () => {
  const open = async (route: 'kinds' | 'costly') => {
    const world = await Slack.world(['sennet', 'longman', 'lowwater', 'tolleth', 'skeel']);
    const { j } = world;
    j.put('party', 'psennet__nexus');
    if (route === 'kinds') {
      // A reading from two rubbings of two notations; the Hesk measure by the reeve's rod;
      // a standing by a Prefect's writ.
      j.give('pskeel__bench_rubbing'); j.give('ptolleth__rubbing'); j.give('plongman__rod'); j.give('plongman__writ_copy');
      await j.play('Lay a keeper\'s tally and a Prefect\'s table', 'Lay the dyke-reeve\'s rod', 'Say the keeper\'s formula');
    } else {
      // No tally, no rod, no writ: a keeper's own face for the standing, the table for the measure, and paid scribes.
      j.give('plongman__mask'); j.give('ptolleth__rubbing'); j.coin(40);
      await j.play('Pay the Collegium of Measures', 'Read the black square\'s scale against', 'Hold a keeper\'s grey face');
      expect(j.holds('psennet__squareTalk', 'psennet__sennet_bay')).toBe(true);
    }
    return world;
  };
  it('goes down by what the company has brought from elsewhere: tally, table, rod and writ', async () => {
    const { j } = await open('kinds');
    await j.play('Open the black square');
    expect(j.holds('state', 'psennet__black_square', 'psennet__unsealed')).toBe(true);
    await j.play('Through to the foot of the black stair', 'the Quay of Hours');
    expect(j.campaign.world.one('at', 'party')).toBe('psennet__hours_quay');
  }, 600000);
  it('goes down by costly routes too: paid scribes, a keeper\'s face, the Prefect\'s table', async () => {
    const { j } = await open('costly');
    await j.play('Open the black square');
    expect(j.holds('state', 'psennet__black_square', 'psennet__unsealed')).toBe(true);
  }, 600000);
});

describe('the Remainder', () => {
  const down = async () => {
    const world = await Slack.world(['sennet', 'longman', 'lowwater', 'tolleth', 'skeel']);
    const { j } = world;
    j.put('party', 'psennet__nexus');
    j.give('pskeel__bench_rubbing'); j.give('ptolleth__rubbing'); j.give('plongman__rod'); j.give('plongman__writ_copy');
    j.give('plongman__mask'); j.give('plowwater__halm_letter');
    await j.play('Lay a keeper\'s tally and a Prefect\'s table', 'Lay the dyke-reeve\'s rod', 'Say the keeper\'s formula', 'Open the black square',
      'Through to the foot of the black stair', 'the Quay of Hours');
    return world;
  };
  it('is boarded by a gangway from a quay in the slack; her Captain and her Reckoner say what she is, and ask for surety', async () => {
    const { j } = await down();
    await j.play('^Into the Remainder');
    expect(j.campaign.world.one('at', 'party')).toBe('psennet__rem_deck');
    await j.play('Ask Captain Sabe where the ship is', 'Ask Captain Sabe about the names on the ship\'s roll');
    expect(j.holds('knows', 'party', 'psennet__roll_two')).toBe(true);
    await j.play('count-room', 'Ask Tamsin Quaye what she is trying to break', 'Ask Tamsin Quaye what she wants done');
    expect(j.holds('knows', 'party', 'psennet__surety_asked')).toBe(true);
  }, 900000);
  it('stands surety in the Prefect\'s formula, and the world records that a ship was harboured', async () => {
    const { j } = await down();
    await j.play('^Into the Remainder', 'Ask Captain Sabe where the ship is', 'count-room', 'Ask Tamsin Quaye what she is trying to break',
      'Ask Tamsin Quaye what she wants done', 'Stand surety for the Remainder in the Prefect');
    expect(j.holds('befell', 'remainder_harboured')).toBe(true);
    expect(j.holds('befell', 'remainder_kept')).toBe(false);
  }, 900000);
  it('sails to Mechanus with the Captain, leaves a company ashore when she goes, and fetches it on her next call', async () => {
    const { j } = await down();
    await j.play('^Into the Remainder', 'Ask Captain Sabe where the ship is', 'Put out for Mechanus');
    expect(j.holds('at', 'psennet__remainder', 'outer_mechanus_threshold')).toBe(true);
    expect(j.holds('befell', 'mechanus_seen')).toBe(true);
    await j.play('^Through to|^Out to|Remainder.s gangway on Mechanus');
    expect(j.campaign.world.one('at', 'party')).toBe('outer_mechanus_threshold');
    const now = j.campaign.state.elapsed;
    await j.play(`=${now + 14}`);
    expect(j.holds('at', 'psennet__remainder', 'psennet__hours_quay')).toBe(true);
    expect(j.campaign.world.one('at', 'party')).toBe('outer_mechanus_threshold');
    await j.play(`=${now + 14 + 50}`);
    expect(j.holds('at', 'psennet__remainder', 'outer_mechanus_threshold')).toBe(true);
  }, 900000);

  const harbour = async (withNote: boolean) => {
    const world = await Slack.world(['sennet', 'longman', 'lowwater', 'tolleth', 'skeel', 'tessary']);
    const { j } = world;
    j.put('party', 'psennet__nexus');
    j.give('pskeel__bench_rubbing'); j.give('ptolleth__rubbing'); j.give('plongman__rod'); j.give('plongman__writ_copy');
    if (withNote) { j.give('ptessary__surety_note'); }
    await j.play('Lay a keeper\'s tally and a Prefect\'s table', 'Lay the dyke-reeve\'s rod', 'Say the keeper\'s formula', 'Open the black square',
      'Through to the foot of the black stair', 'the Quay of Hours', '^Into the Remainder', 'Ask Captain Sabe where the ship is', 'count-room',
      'Ask Tamsin Quaye what she is trying to break', 'Ask Tamsin Quaye what she wants done', 'Stand surety for the Remainder in the Prefect');
    j.coin(40);
    return world;
  };
  it('binds a company that stood surety blind to the Watch\'s bread, every morning', async () => {
    const { j } = await harbour(false);
    await j.play('^Wait › An hour');
    expect(j.holds('psennet__liable', 'party')).toBe(true);
    const before = j.campaign.state.elapsed;
    await j.play(`=${Math.ceil(before / 144) * 144 + 60}`);
    expect(j.campaign.world.one('at', 'party')).toBeDefined();
    const gold = j.measure('quantity', 'party', 'gold') as number;
    expect(gold).toBeLessThan(40);
  }, 900000);
  it('does not bind one that had the Valuer\'s note on what a surety owes', async () => {
    const { j } = await harbour(true);
    await j.play('^Wait › An hour');
    expect(j.holds('psennet__liable', 'party')).toBe(false);
  }, 900000);
});
