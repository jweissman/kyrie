import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Journey } from '../src/session/journey';
import { Frontier } from '../src/world/frontier';
import { GeneratedWorld } from './support/generated';
import { Kept } from './support/kept';

// The black square in the Nexus floor, the Slack beneath it, and the ship that lies there
// (doc/imbar/09-the-slack-as-adventure.md). The
// locks open to things that can be had in several adventures and in several forms; the ship is entered, sailed in and
// left by the ordinary travel of the world.
class Slack {
  static readonly seed = 'thorn';
  static readonly five = ['sennet', 'longman', 'lowwater', 'tolleth', 'skeel'];
  // The country with the five gates gone through, as a company would, and Tessary's after them where a case needs its
  // note: each made once in the file and resumed for each case after (see Kept.of). Every case had assembled its own
  // country and travelled its gates (two to six of them) before anything was tried; a case that needs fewer gates is
  // played in the five's country, the provinces it does not need lying beyond gates it never goes through.
  static gates(tessary = false): Promise<Journey> {
    if (tessary) {
      return Kept.of('slack six gates', async () => {
        const j = await Slack.gates();
        await Slack.through(j.session, 'tessary');
        return j;
      });
    }
    return Kept.of('slack five gates', async () => {
      const w = await WorldAssembler.assemble(Slack.seed, NodeBundleSource.shared, { region: { terrain: 'mountain' } });
      const s = await PlaySession.start(w.path, Slack.seed, w.source);
      for (const g of Slack.five) { await Slack.through(s, g); }
      return Journey.of(s);
    });
  }
  private static async through(s: PlaySession, gate: string) {
    await GeneratedWorld.travel(s, `gate_${gate}`);
    await new Frontier(Slack.seed, NodeBundleSource.shared).expand(s.campaign);
  }
  static async nexus(tessary = false): Promise<Journey> {
    const j = await Slack.gates(tessary);
    j.put('party', 'psennet__nexus');
    return j;
  }
}

describe('the black square', () => {
  it('stays shut to a company with none of the three, and opens to a reading, a measure and a standing however they were had', async () => {
    const j = await Slack.nexus();
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
  const open = (route: 'kinds' | 'costly') => Kept.of(`slack open ${route}`, async () => {
    const j = await Slack.nexus();
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
    return j;
  });
  it('goes down by what the company has brought from elsewhere: tally, table, rod and writ', async () => {
    const j = await open('kinds');
    await j.play('Open the black square');
    expect(j.holds('state', 'psennet__black_square', 'psennet__unsealed')).toBe(true);
    await j.play('Through to the foot of the black stair', 'the Quay of Hours');
    expect(j.campaign.world.one('at', 'party')).toBe('psennet__hours_quay');
  }, 600000);
  it('charges its interest on the stair: the climb takes as many watches as were spent below', async () => {
    const j = await open('kinds');
    await j.play('Open the black square', 'Through to the foot of the black stair', 'the Quay of Hours');
    await j.play(`==${j.campaign.state.elapsed + 30}`);
    const owed = j.measure('psennet__interestOwed', 'party');
    expect(owed).toBeGreaterThanOrEqual(30);
    await j.play('^To the foot of the black stair');
    const before = j.campaign.state.elapsed;
    await j.play('Climb the black stair back to the Nexus');
    expect(j.campaign.state.elapsed - before).toBeGreaterThanOrEqual(owed);
    expect(j.measure('psennet__interestOwed', 'party')).toBe(0);
  }, 600000);
  it('goes down by costly routes too: paid scribes, a keeper\'s face, the Prefect\'s table', async () => {
    const j = await open('costly');
    await j.play('Open the black square');
    expect(j.holds('state', 'psennet__black_square', 'psennet__unsealed')).toBe(true);
  }, 600000);
});

describe('the Remainder', () => {
  const down = () => Kept.of('slack down', async () => {
    const j = await Slack.nexus();
    j.give('pskeel__bench_rubbing'); j.give('ptolleth__rubbing'); j.give('plongman__rod'); j.give('plongman__writ_copy');
    j.give('plongman__mask'); j.give('plowwater__halm_letter');
    await j.play('Lay a keeper\'s tally and a Prefect\'s table', 'Lay the dyke-reeve\'s rod', 'Say the keeper\'s formula', 'Open the black square',
      'Through to the foot of the black stair', 'the Quay of Hours');
    return j;
  });
  it('is boarded by a gangway from a quay in the slack; her Captain and her Reckoner say what she is, and ask for surety', async () => {
    const j = await down();
    await j.play('^Into the Remainder');
    expect(j.campaign.world.one('at', 'party')).toBe('psennet__rem_deck');
    // Nobody speaks to a stranger before the second bell.
    expect(j.matches('Ask Captain Sabe where the ship is').length).toBe(0);
    // The hour with nobody to ask: the company sees the dishes on the lee rail and is told nothing.
    await j.play('=+3');
    expect(j.holds('psennet__railSeen', 'party')).toBe(true);
    expect(j.taken.map(t => t.told + ' ' + t.page).join(' ')).toContain('Whatever it is, you will have to look at it without being told');
    await j.play('=+4', 'Ask Captain Sabe where the ship is', 'Ask Captain Sabe about the names on the ship\'s roll');
    expect(j.holds('knows', 'party', 'psennet__roll_two')).toBe(true);
    await j.play('count-room', 'Ask Tamsin Quaye what she is trying to break', 'Ask Tamsin Quaye what she wants done');
    expect(j.holds('knows', 'party', 'psennet__surety_asked')).toBe(true);
  }, 900000);
  it('stands surety in the Prefect\'s formula, and the world records that a ship was harboured', async () => {
    const j = await down();
    await j.play('^Into the Remainder', '=+7', 'Ask Captain Sabe where the ship is', 'count-room', 'Ask Tamsin Quaye what she is trying to break',
      'Ask Tamsin Quaye what she wants done', 'Stand surety for the Remainder in the Prefect');
    expect(j.holds('befell', 'remainder_harboured')).toBe(true);
    expect(j.holds('befell', 'remainder_kept')).toBe(false);
  }, 900000);
  it('sails to Mechanus with the Captain, leaves a company ashore when she goes, and fetches it on her next call', async () => {
    const j = await down();
    await j.play('^Into the Remainder', '=+7', '=+7', 'Ask Captain Sabe where the ship is', 'Put out for Mechanus');
    expect(j.holds('at', 'psennet__remainder', 'outer_mechanus_threshold')).toBe(true);
    expect(j.holds('befell', 'mechanus_seen')).toBe(true);
    await j.play('^Through to|^Out to|Remainder.s gangway on Mechanus');
    expect(j.campaign.world.one('at', 'party')).toBe('outer_mechanus_threshold');
    const now = j.campaign.state.elapsed;
    await j.play(`==${now + 14}`);
    expect(j.holds('at', 'psennet__remainder', 'psennet__hours_quay')).toBe(true);
    expect(j.campaign.world.one('at', 'party')).toBe('outer_mechanus_threshold');
    await j.play(`==${now + 14 + 50}`);
    expect(j.holds('at', 'psennet__remainder', 'outer_mechanus_threshold')).toBe(true);
  }, 900000);

  const harbour = async (withNote: boolean) => {
    const j = await Slack.nexus(true);
    j.give('pskeel__bench_rubbing'); j.give('ptolleth__rubbing'); j.give('plongman__rod'); j.give('plongman__writ_copy');
    if (withNote) { j.give('ptessary__surety_note'); }
    await j.play('Lay a keeper\'s tally and a Prefect\'s table', 'Lay the dyke-reeve\'s rod', 'Say the keeper\'s formula', 'Open the black square',
      'Through to the foot of the black stair', 'the Quay of Hours', '^Into the Remainder', '=+7', 'Ask Captain Sabe where the ship is', 'count-room',
      'Ask Tamsin Quaye what she is trying to break', 'Ask Tamsin Quaye what she wants done', 'Stand surety for the Remainder in the Prefect');
    j.coin(40);
    return j;
  };
  it('binds a company that stood surety blind to the Watch\'s bread, every morning', async () => {
    const j = await harbour(false);
    await j.play('^Wait › An hour');
    expect(j.holds('psennet__liable', 'party')).toBe(true);
    const before = j.campaign.state.elapsed;
    await j.play(`==${Math.ceil(before / 144) * 144 + 60}`);
    expect(j.campaign.world.one('at', 'party')).toBeDefined();
    const gold = j.measure('quantity', 'party', 'gold') as number;
    expect(gold).toBeLessThan(40);
  }, 900000);
  it('does not bind one that had the Valuer\'s note on what a surety owes', async () => {
    const j = await harbour(true);
    await j.play('^Wait › An hour');
    expect(j.holds('psennet__liable', 'party')).toBe(false);
  }, 900000);
});

describe('the Slack, when it is lingered in', () => {
  const aboard = () => Kept.of('slack aboard', async () => {
    const j = await Slack.nexus();
    j.give('pskeel__bench_rubbing'); j.give('ptolleth__rubbing'); j.give('plongman__rod'); j.give('plongman__writ_copy');
    j.give('plongman__mask');
    await j.play('Lay a keeper\'s tally and a Prefect\'s table', 'Lay the dyke-reeve\'s rod', 'Say the keeper\'s formula', 'Open the black square',
      'Through to the foot of the black stair', 'the Quay of Hours', '^Into the Remainder', '=+7', 'Ask Captain Sabe where the ship is');
    return j;
  });
  // What is read after a wait of hours is the world it leaves, not what each hour said (==, see Journey).
  const wait = (j: Journey, n: number) => j.play(`==${j.campaign.state.elapsed + n}`);
  it('sends the count\'s Divider up the gangway after two days below', async () => {
    const j = await aboard();
    expect(j.holds('psennet__dividerCame', 'party')).toBe(false);
    await wait(j, 60);
    expect(j.holds('psennet__dividerCame', 'party')).toBe(true);
    expect(j.holds('at', 'psennet__divider', 'psennet__rem_deck')).toBe(true);
  }, 900000);
  it('can be answered with a complete count, which costs the slack something', async () => {
    const j = await aboard();
    await wait(j, 60);
    j.roll('pass');
    await j.play('Ask Captain Sabe for the bell-cord, and ring the twelfth');
    j.roll();
    expect(j.holds('at', 'psennet__divider', 'psennet__rem_deck')).toBe(false);
    expect(j.holds('psennet__thin', 'psennet__remainder')).toBe(true);
  }, 900000);
  it('can be turned by a sentence that does not divide, which the tern then has no more of', async () => {
    const j = await aboard();
    await j.play('^To the hold', 'Listen to the tern', '^To the Remainder|^Up to|deck');
    await wait(j, 60);
    await j.play('Say the tern.s sentence to the Divider');
    expect(j.holds('at', 'psennet__divider', 'psennet__rem_deck')).toBe(false);
    expect(j.holds('at', 'psennet__tern', 'psennet__rem_hold')).toBe(false);
  }, 900000);
  it('can be met by a Quartermaster who has been given a face, and who does not come back', async () => {
    const j = await aboard();
    await j.play('Into the Quay of Hours', 'Fit .* grey face to the Quartermaster', '^Into the Remainder');
    await wait(j, 70);
    expect(j.holds('psennet__stilled', 'psennet__quartermaster')).toBe(true);
    expect(j.holds('at', 'psennet__divider', 'psennet__rem_deck')).toBe(false);
  }, 900000);
});

describe('the lamp that was lent', () => {
  it('is carried for by a tally cut in the Slack and shown on Skerrow, and fitted to the mast, and the world records it', async () => {
    const j = await Slack.gates();
    j.put('party', 'ptolleth__pharos_lamp');
    j.give('psennet__tally_stick');
    await j.play('Show Marren Kestle the Watch.s tally-stick');
    expect(j.holds('ptolleth__lensGiven', 'ptolleth__kestle')).toBe(true);
    j.put('party', 'psennet__rem_deck');
    await j.play('Fit the green lens of the Pharos');
    expect(j.holds('psennet__steadied', 'psennet__remainder')).toBe(true);
    expect(j.holds('befell', 'remainder_steadied')).toBe(true);
  }, 900000);
});
