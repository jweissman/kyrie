import { describe, expect, it } from 'bun:test';
import { City, Q } from './support/quittance';

describe('Quittance: the Receipt, the rhyme, and the Great Tithe', () => {
  it('fades the Receipt by the day, on every visit', async () => {
    const j = await City.start('receipt');
    await j.play(...City.honest, '^To the Brokers', '^To Policy Row', '^To the court of the Old Exchange');
    expect(City.knows(j, 'd_bell_rule')).toBe(true);
    expect(City.state(j, 'receipt', 'full')).toBe(true);
    await j.play('=day 5 12:00');
    expect(City.state(j, 'receipt', 'fading')).toBe(true);
    await j.play('=day 8 12:00');
    expect(City.state(j, 'receipt', 'faint')).toBe(true);
    // What it has faded to is told with the court, not behind a close look that would find only that (LookAnswers).
    expect(City.pages(j)).toContain('RECEIVED OF THE CITY');
  }, 240000);

  it('sings the day\'s line in Brick Lane', async () => {
    const j = await City.start('rhyme');
    await j.play(...City.honest, '=10:00', '^To Brick Lane');
    expect(City.pages(j)).toContain('Nine for the Offices');
  }, 120000);

  it('puts six men with oil in the Cinder Ward on Reckoning night, who can be turned by the people there', async () => {
    const j = await City.start('tithe');
    await j.play('^To the foot of the outer wall', 'Pay the gap boys', '=day 9 22:50', '>quittance__cinder_ward');
    expect(j.holds(Q('tithePrepared'), Q('city'))).toBe(true);
    expect(j.at(Q('tithe_burners'))).toBe(Q('cinder_ward'));
    expect(j.matches('Call the Ward out of its houses').length).toBe(1);
    await j.play('Call the Ward out of its houses');
    expect(j.holds(Q('titheEvacuated'), 'party')).toBe(true);
    await j.play('=day 9 23:58', '=+4');
    expect(j.holds(Q('burned'), Q('cinder_ward'))).toBe(true);
    expect(j.measure(Q('casualties'), Q('city'))).toBe(50); // Candlewick's nineteen and Gasket's thirty-one, unwarned; the Ward's three thousand are on the Cinderwall
  }, 240000);
});
