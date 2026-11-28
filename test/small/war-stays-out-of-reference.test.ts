import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../src/cli/play-tool';

const war = new RegExp([
  'First Count', 'counting.coin', 'count_coin', 'ash_tally', 'twelfth seat', "Ferryman's board",
  'Assessor Ninefold', 'Ash.sworn', 'Sister Ondine', 'Corvin Hask', 'Tallymen of Wickering', 'Mother Quorn',
  'Iselt Brann', 'Aumery Fell', 'Gethin Redhand', 'Sabine of the Glass', 'Aeleth', 'Hollis Drey',
  'Wystan Pellow', 'Blue Cords', 'Ulpian Sarre', 'Lazar Maudrey', 'Wendel Orrage', 'Ebbel Thewlis'
].join('|'), 'i');
const worldEvents = ['ash_count_begun', 'company_sworn_ri', 'company_sworn_ash', 'ash_broken', 'ash_triumphs'];

describe('the war stays outside the reference first hour', () => {
  it('lets a new life reach the old woods without meeting its coins, agents or harms', async () => {
    const { journey: j } = await PlayTool.start(PlayTool.parse([
      '--world', 's0', '--as', 'human/warrior/Wenna', '--opening', 'none'
    ]));
    const seen: string[] = [];
    const look = () => {
      seen.push(...j.taken.flatMap(t => [t.label, t.page]), ...j.choices().map(c => c.label));
    };
    const holdsNoWar = () => {
      for (const event of worldEvents) { expect(j.holds('befell', event)).toBe(false); }
      expect(j.holds('holding', 'party', 'count_coin')).toBe(false);
      expect(j.holds('holding', 'party', 'ash_tally')).toBe(false);
    };

    holdsNoWar();
    look();
    await j.play('To the landing at Oakhythe');
    look();
    await j.play('Into the old woods above Oakhythe');
    look();
    await j.play('To the old ride');
    look();

    expect(j.watch()).toBe(6);
    expect(j.at('party')).toBe('region__s1_wood_ride');
    holdsNoWar();
    expect(seen.join('\n')).not.toMatch(war);
  }, 60000);
});
