import { describe, expect, it } from 'bun:test';
import { City, Q } from './support/quittance';
import type { Journey } from '../src/session/journey';

// Pip's Tin (pt_): a coal in a tin, going out by the end of the third day; to sit with it, to say the words, to carry it
// where a fire will love it (with the child's leave, or without), and the name it is to be given. Every resolution.
const gap = ['^To the foot of the outer wall', 'Pay the gap boys', '^To Salt Lane'];
const stair = [...gap, '^Into the tenement'];
const learn = ['Talk to Pip', 'Take your leave', 'the tin: Examine', 'Talk to Hester', 'why she calls it a lent coal', 'how long the coal has',
  'where else it could be kept', 'Take your leave'];
const nameGran = ['Talk to Hester', 'what the coal wants', 'Say that it is called for Hester', 'Take your leave'];
const namePip = ['Talk to Hester', 'what the coal wants', 'Say that it is called for Pip', 'Take your leave'];
const nameNone = ['Talk to Hester', 'what the coal wants', 'Say that it is not yours to name', 'Take your leave'];
const has = (j: Journey, rel: string) => City.has(j, rel, 'party');
const tin = (j: Journey, s: string) => City.state(j, 'pt_tin', s);
const dies = (j: Journey) => j.measure(Q('pt_dies_at'), Q('pt_pip'));
const coals = (j: Journey) => j.measure('quantity', 'party', 'coal');

describe("Pip's Tin", () => {
  it('is found in the world: the child will not let a rude company near it, and the old woman says what lent means', async () => {
    const j = await City.start();
    await j.play(...stair, 'Talk to Pip');
    expect(City.pages(j)).toContain('say please');
    expect(City.knows(j, 'd_lent_coal')).toBe(false);                    // a tin seen is not a Lent coal understood
    await j.play('Take your leave', 'Talk to Hester');
    expect(j.offers('why she calls it a lent coal')).toBe(false);        // and nothing said until the tin is looked at
  }, 120000);

  it('teaches what a Lent coal is only to a company that has looked, and heard what lent means', async () => {
    const j = await City.start();
    await j.play(...stair, 'Talk to Pip', 'Say please', 'Take your leave', 'the tin: Examine', 'Talk to Hester', 'why she calls it a lent coal');
    expect(City.knows(j, 'd_lent_coal')).toBe(true);
    expect(City.pages(j)).toContain('It means there is a lender');
    expect(tin(j, 'lit')).toBe(true);
  }, 120000);

  it('sits with it all night: the night is gone, the coal takes, and the child asleep on your arm trusts you', async () => {
    const j = await City.start();
    await j.play(...stair, ...learn, ...nameGran);
    expect(j.holds(Q('coalNamedGran'), 'party')).toBe(true);
    expect(j.holds(Q('coalNamedPip'), 'party')).toBe(false);
    expect(j.offers('Sit up with the coal')).toBe(false);                // by day there is nothing to sit through
    await j.play('=19:00');
    const before = j.watch();
    await j.play('Sit up with the coal');
    expect(j.watch() - before).toBeGreaterThanOrEqual(48);               // a night is eight hours
    expect(tin(j, 'steady')).toBe(true);
    expect(has(j, 'pt_saved')).toBe(true);
    expect(has(j, 'pt_trusted')).toBe(true);
    expect(dies(j)).toBe(9999);
    await j.play('=day 5 09:00');                                        // the third day comes and goes
    expect(tin(j, 'steady')).toBe(true);
    expect(has(j, 'pt_lost')).toBe(false);
  }, 120000);

  it('names it for Pip, or for Gran, or declines: exactly one of three is written', async () => {
    for (const [steps, which] of [[namePip, 'coalNamedPip'], [nameGran, 'coalNamedGran'], [nameNone, 'coalNamedNone']] as const) {
      const j = await City.start();
      await j.play(...stair, ...learn, ...steps);
      for (const w of ['coalNamedPip', 'coalNamedGran', 'coalNamedNone']) { expect(j.holds(Q(w), 'party')).toBe(w === which); }
      expect(j.offers('Say that it is called')).toBe(false);             // a name is given once
    }
  }, 180000);

  it('says the old words over it (if it can), which buys a day and no more', async () => {
    const j = await City.start('quittance');
    await j.play(...stair, ...learn, 'Say over the tin');
    expect(has(j, 'pt_rite_done')).toBe(true);
    expect(dies(j)).toBe(384 + 144);
    await j.play('=day 4 09:00');
    expect(has(j, 'pt_lost')).toBe(false);                               // past the end of the third day, and still red
    expect(tin(j, 'low') || tin(j, 'lit')).toBe(true);
    await j.play('=day 5 01:00');
    expect(tin(j, 'out')).toBe(true);                                    // a day was all the words bought
    expect(has(j, 'pt_lost')).toBe(true);
  }, 120000);

  it('the words of a stranger do not take; the old woman says what would', async () => {
    const j = await City.start('e');
    await j.play(...stair, ...learn, 'Say over the tin');
    expect(has(j, 'pt_rite_done')).toBe(false);
    expect(has(j, 'pt_rite_failed')).toBe(true);
    expect(j.offers('Say over the tin')).toBe(false);
    expect(City.said(j)).toContain('It wants ours');
    await j.play('Talk to Hester', 'how the family says it');
    expect(City.page(j)).toContain('It is not liturgy. It is manners.');
  }, 120000);

  it('left alone, the coal is out at the end of the third day, and the old woman does not blame anyone', async () => {
    const j = await City.start();
    await j.play(...stair, ...learn);
    await j.play('=day 3 09:00');
    expect(tin(j, 'low')).toBe(true);                                    // a thumb-joint of plum-coloured red
    await j.play('=day 4 01:00');
    expect(tin(j, 'out')).toBe(true);
    expect(has(j, 'pt_lost')).toBe(true);
    expect(has(j, 'pt_saved')).toBe(false);
    expect(j.offers('Sit up with the coal')).toBe(false);
    expect(j.offers('Say over the tin')).toBe(false);
    await j.play('Talk to Hester', 'Say you are sorry');
    expect(City.page(j)).toContain('wipe their hands');
    await j.play('what the coal wants', 'Say that it is not yours to name');   // the ash can still be named, or not
    expect(j.holds(Q('coalNamedNone'), 'party')).toBe(true);
    expect(has(j, 'pt_trusted')).toBe(false);                            // and a coal lost earns no trust
  }, 120000);

  // ── Carrying it ────────────────────────────────────────────────────────────────────────────────────────
  const talked = (seed: string) => async () => {
    const j = await City.start(seed);
    await j.play(...stair, ...learn, 'Sit down on the boards');
    return j;
  };

  it('Pip will not let it go for a company that argues badly', async () => {
    const j = await talked('quittance')();
    expect(has(j, 'pt_consent')).toBe(false);
    expect(j.offers('Take up the tin')).toBe(false);
    expect(j.offers('Sit down on the boards')).toBe(true);               // a second try is a later moment, a different die
  }, 120000);

  it('carries it to the Penny Mutual with the child\'s leave: near, and hers to visit; the Mutual keeps it', async () => {
    const j = await talked('a')();
    expect(has(j, 'pt_consent')).toBe(true);
    await j.play(...nameGran);
    await j.play('Take up the tin');
    expect(tin(j, 'away')).toBe(true);
    expect(has(j, 'pt_carried')).toBe(true);
    await j.play('^Out to Salt Lane', '^Into the Penny Mutual', 'Talk to Keturah');
    expect(j.offers("Lay Pip's coal")).toBe(false);                      // the Mutual lays a stranger's coal only if it can be proud
    await j.play('Offer the Mutual fourteen coin', "Lay Pip's coal");
    expect(has(j, 'pt_kept_penny')).toBe(true);
    expect(has(j, 'pt_carried')).toBe(false);
    expect(has(j, 'pt_saved')).toBe(true);
    expect(j.holds(Q('coalSource'), Q('penny_hall'))).toBe(true);
    expect(City.regard(j, 'wardsfolk')).toBe(1 + 2 + 1);                 // the Gap, the loan, the coal
    expect(has(j, 'pt_trusted')).toBe(true);
    await j.play('Take your leave', '^Out to Salt Lane', 'Into the tenement');
    expect(City.pages(j)).toContain('pale square');
  }, 120000);

  it('carries it to Auberon Hearn\'s hearth on the Hill, where an old man says the child is not to worry', async () => {
    const j = await talked('a')();
    await j.play(...namePip, 'Take up the tin', '>' + Q('hearn_hearth'));
    expect(j.watch()).toBeLessThan(36);
    await j.play('Talk to Auberon', "Set Pip's tin in Auberon");
    expect(has(j, 'pt_kept_hearn')).toBe(true);
    expect(j.holds(Q('coalSource'), Q('hearn_hearth'))).toBe(true);
    expect(City.said(j)).toContain('not alone');
    expect(has(j, 'pt_saved')).toBe(true);
    expect(j.holds(Q('coalNamedPip'), 'party')).toBe(true);
  }, 120000);

  it('carries it to the Lamp-house glass, where it will never go out and never be let be', async () => {
    const j = await talked('a')();
    await j.play(...nameNone, 'Take up the tin', '>' + Q('lamp_front'), "Set Pip's tin among the green glass lamps");
    expect(has(j, 'pt_kept_glass')).toBe(true);
    expect(has(j, 'pt_saved')).toBe(true);
    expect(j.holds(Q('coalSource'), Q('lamp_front'))).toBe(false);       // a caged coal is nobody's gift to the Night
    expect(City.said(j)).toContain('not humming in time');
  }, 120000);

  it('carries it to the Gasworks furnace, which feeds it for ever and writes it in the Company\'s book', async () => {
    const j = await talked('a')();
    const gasco = City.regard(j, 'gasco');
    await j.play(...namePip, 'Take up the tin', '>' + Q('retort_house'), 'Feed Pip.s coal into a retort-house furnace');
    expect(has(j, 'pt_kept_gas')).toBe(true);
    expect(j.holds(Q('coalSource'), Q('retort_house'))).toBe(true);
    expect(City.regard(j, 'gasco')).toBe(gasco + 1);
    expect(City.regard(j, 'wardsfolk')).toBe(0);                         // the Wards do not forgive a coal sold to the Company
    expect(j.holds(Q('pm_slighted_wards'), 'party')).toBe(true);
  }, 120000);

  it('a coal carried too slowly is ash in the tin', async () => {
    const j = await talked('a')();
    await j.play(...nameGran, 'Take up the tin', '^Out to Salt Lane', '=+37');
    expect(has(j, 'pt_lost')).toBe(true);
    expect(has(j, 'pt_carried')).toBe(false);
    expect(has(j, 'pt_saved')).toBe(false);
  }, 120000);

  it('a promise to a child, kept at the Mutual or broken on the Hill', async () => {
    const j = await City.start();
    await j.play(...stair, ...learn, 'Promise Pip');
    expect(has(j, 'pt_consent')).toBe(true);
    expect(has(j, 'pt_promised')).toBe(true);
    await j.play(...namePip, 'Take up the tin', '>' + Q('hearn_hearth'), 'Talk to Auberon', "Set Pip's tin in Auberon");
    expect(has(j, 'pt_wronged')).toBe(true);                             // somewhere she could not walk to
    expect(has(j, 'pt_trusted')).toBe(false);
    const kept = await City.start();
    await kept.play(...stair, ...learn, 'Promise Pip', ...nameGran, 'Take up the tin', '^Out to Salt Lane', '^Into the Penny Mutual',
      'Talk to Keturah', 'Offer the Mutual fourteen coin', "Lay Pip's coal");
    expect(has(kept, 'pt_wronged')).toBe(false);
    expect(has(kept, 'pt_trusted')).toBe(true);
  }, 180000);

  it('lifts it while she is at the pump: the coal is saved and the child is lost', async () => {
    const j = await City.start('quittance');
    await j.play(...stair, 'While Pip is at the pump');
    expect(tin(j, 'away')).toBe(true);
    expect(has(j, 'pt_wronged')).toBe(true);
    expect(j.holds(Q('pm_slighted_wards'), 'party')).toBe(true);
    expect(City.regard(j, 'wardsfolk')).toBe(0);
    await j.play('>' + Q('hearn_hearth'), 'Talk to Auberon', "Set Pip's tin in Auberon");
    expect(has(j, 'pt_saved')).toBe(true);
    expect(has(j, 'pt_trusted')).toBe(false);
    await j.play('>' + Q('pip_stair'));
    expect(City.pages(j)).toContain('The child is not at home');
  }, 120000);

  it('a thief who is heard is wronged all the same, and the child will not be talked round after', async () => {
    const j = await City.start('a');
    await j.play(...stair, ...learn, 'While Pip is at the pump');
    expect(tin(j, 'away')).toBe(false);
    expect(has(j, 'pt_wronged')).toBe(true);
    expect(j.offers('Sit down on the boards')).toBe(false);
    expect(j.offers('Promise Pip')).toBe(false);
    // The night is still there to be sat through; the child is not asked.
    await j.play('=19:00', 'Sit up with the coal');
    expect(has(j, 'pt_saved')).toBe(true);
    expect(has(j, 'pt_trusted')).toBe(false);
  }, 120000);

  // ── The Night: her coal, or her word, and not both ─────────────────────────────────────────────────────
  const trusted = async () => {
    const j = await City.start();
    await j.play(...stair, ...learn, 'Talk to Pip', 'what she does when', 'Take your leave', ...namePip, '=19:00', 'Sit up with the coal');
    return j;
  };
  it('on the sixth day she offers her coal for the Night, and the company may take it', async () => {
    const j = await trusted();
    expect(has(j, 'pt_trusted')).toBe(true);
    await j.play('=day 5 12:00');
    expect(j.offers('Ask Pip whether she would give her coal')).toBe(false);   // not before the sixth day
    await j.play('=day 7 09:00', 'Talk to Pip', 'Ask Pip whether she would give her coal');
    expect(j.offers('Accept Pip')).toBe(true);
    const regard = City.regard(j, 'wardsfolk');
    await j.play('Accept Pip');
    expect(coals(j)).toBe(1);
    expect(has(j, 'pt_gifted')).toBe(true);
    expect(tin(j, 'out')).toBe(true);                                    // her hearth is bare until the Return
    expect(City.regard(j, 'wardsfolk')).toBe(regard + 1);
    expect(j.offers('Ask Pip whether she would say')).toBe(false);       // she has nothing left to give the Five
  }, 180000);

  it('or the company says keep it, and she is the first to have been told so', async () => {
    const j = await trusted();
    await j.play('=day 7 09:00', 'Talk to Pip', 'Ask Pip whether she would give her coal', 'Tell Pip to keep her coal');
    expect(has(j, 'pt_gift_refused')).toBe(true);
    expect(coals(j)).toBe(0);
    expect(tin(j, 'steady')).toBe(true);
    expect(j.offers('Accept Pip')).toBe(true);                           // a refusal is not a door shut; she may still be asked
  }, 180000);

  it('or she is asked to say before the Five who chalked the pump, at the cost of her coal and her stair', async () => {
    const j = await trusted();
    await j.play('Talk to Pip', 'what she does when');
    expect(City.knows(j, 'pt_pump_seen')).toBe(true);
    await j.play('Ask Pip whether she would tell the Five', 'Ask Pip to say before the Five');
    expect(j.holds(Q('witness'), Q('pt_pip'))).toBe(true);
    expect(has(j, 'pt_witnessing')).toBe(true);
    await j.play('=day 7 09:00');
    expect(j.offers('Ask Pip whether she would give her coal')).toBe(false);   // her coal or her word, never both
    expect(coals(j)).toBe(0);
  }, 180000);
});
