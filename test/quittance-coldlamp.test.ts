import { describe, expect, it } from 'bun:test';
import { City } from './support/quittance';

// The Cold-Lamp Demonstration (doc/adventures/quittance/quests/coldlamp.md): a hundred lamps to be shown to the
// Offices on the fourth day at three, a spark in each that must be vented nightly, and a Gas Company that needs them
// to fail. The clock's day is one on the first morning: day 4 is the day of the demonstration.
const row = [...City.honest, '>quittance__foundry_row'];
const toWynne = ['>quittance__wynne_lab', 'Talk to Perpetua Wynne', 'Ask Wynne about the demonstration', '?Take your leave'];
const crate = ['Talk to Perpetua Wynne', 'Offer to vent the lamps', '?Take your leave'];
const vent = ['>quittance__demo_hall', 'Vent the hundred lamps'];
const tell = ['>quittance__wynne_lab', 'Talk to Perpetua Wynne', 'Tell Wynne what the sparks did', '?Take your leave'];
const gaunt = ['>quittance__board_room', 'Talk to Lord Gaunt-Halloran'];
const flatter = [...gaunt, 'Admire the gasometer', '?Take your leave'];
const key = ['>quittance__booths', 'Have a gilt first-lamp key struck'];
const flatterAndKey = [...flatter, ...key, '>quittance__board_room', 'Talk to Lord Gaunt-Halloran', 'Offer Lord Gaunt-Halloran the honour', '?Take your leave'];
const demoAt = '=day 4 17:00';
const ventedBy = (...rest: string[]) => [...row, '=day 3 14:00', ...toWynne, ...crate, '=day 3 19:00', ...vent, ...rest];
const said = (j: any, t: string) => expect(City.said(j)).toContain(t);
const has = (j: any, r: string, who = 'wynne') => City.has(j, r, who);

describe('Quittance: the Cold-Lamp Demonstration', () => {
  it('is on the Slate and also at the Lamp-house shopfront', async () => {
    const j = await City.start();
    await j.play(...City.slip, '^Wait › A while');
    expect(City.knows(j, 'cl_claim')).toBe(true);
    const k = await City.start();
    await k.play(...row, '>quittance__lamp_front', 'Talk to Lemuel Quarrell', 'what the Lamp-house is showing');
    expect(City.knows(k, 'cl_claim')).toBe(true);
  }, 120000);

  it('shows the lamps sickening, and the demonstration lost by a company that does nothing', async () => {
    const j = await City.start();
    await j.play(...row, '>quittance__demo_hall');
    expect(City.state(j, 'cl_rack', 'sickening')).toBe(true);
    expect(City.knows(j, 'cl_sickening')).toBe(true);
    await j.play(demoAt);
    expect(has(j, 'cl_demoDone')).toBe(true);
    expect(has(j, 'cl_gaswon')).toBe(true);
    expect(has(j, 'cl_ruined')).toBe(true);
    expect(City.regard(j, 'gasco')).toBe(0);
    expect((City.regard(j, 'phoenix') - 1)).toBe(0);
    await j.play('>quittance__wynne_lab');
    expect(City.page(j)).toContain('packing');
  }, 240000);

  it('leaving them, once Wynne is met, is an honest sabotage the Gas Company repays', async () => {
    const j = await City.start();
    await j.play(...row, ...toWynne, demoAt);
    expect(has(j, 'cl_gaswon')).toBe(true);
    expect(City.regard(j, 'gasco')).toBe(1);
    expect(City.knows(j, 'd_cold_lamp_bound')).toBe(false);
  }, 240000);

  describe('the venting', () => {
    it('is a night of work for the company with Wynne\'s crate, and the sparks notice', async () => {
      const j = await City.start();
      await j.play(...row, ...toWynne, ...crate);
      expect(j.find('Vent the hundred lamps')).toBeUndefined();
      await j.play('>quittance__demo_hall');
      expect(City.knows(j, 'd_cold_lamp_bound')).toBe(false);
      const from = j.taken.length, w = j.watch();
      await j.play('Vent the hundred lamps');
      expect(j.watch() - w).toBeGreaterThanOrEqual(36);
      expect(City.knows(j, 'd_cold_lamp_bound')).toBe(true);
      expect(City.state(j, 'cl_rack', 'bright')).toBe(true);
      said(j, 'all stop turning');
      expect(City.pages(j, from)).toContain('hum like a hive');
    }, 240000);
    it('is offered no crate to a company that has not offered to help, and none after the demonstration', async () => {
      const j = await City.start();
      await j.play(...row, ...toWynne, demoAt);
      expect(j.find('Offer to vent')).toBeUndefined();
    }, 240000);
    it('vented too early, the lamps sicken again before the demonstration', async () => {
      const j = await City.start();
      await j.play(...row, '=day 1 14:00', ...toWynne, ...crate, ...vent, ...flatterAndKey);
      expect(City.state(j, 'cl_rack', 'bright')).toBe(true);
      await j.play('=day 4 10:00');
      expect(City.state(j, 'cl_rack', 'sickening')).toBe(true);
      await j.play(demoAt);
      expect(has(j, 'cl_gaswon')).toBe(true);
    }, 300000);
  });

  describe('the chairman', () => {
    it('is flattered by a performance or an eye for his chandelier, and a failure leaves the other', async () => {
      const j = await City.start();
      await j.play(...row, ...gaunt);
      expect(City.arc(j, 'gaunt')).toBe(0);
      await j.play('?Admire the gasometer');
      if (City.arc(j, 'gaunt') === 0) {
        expect(j.find('Admire the gasometer')).toBeUndefined();
        expect(j.find('Notice aloud that the chandelier')).toBeDefined();
        await j.play('?Notice aloud that the chandelier');
      }
      expect([0, 1]).toContain(City.arc(j, 'gaunt'));
    }, 120000);
    it('is bought in by profit or by a role, and never moved by the stokers\' hours', async () => {
      const j = await City.start();
      await j.play(...row, ...flatterAndKey);
      expect(City.arc(j, 'gaunt')).toBe(2);
      await j.play('>quittance__board_room', 'Talk to Lord Gaunt-Halloran', 'Mention the stokers');
      expect(City.arc(j, 'gaunt')).toBe(2);
      said(j, 'a matter for Mr Gudgeon');
    }, 240000);
    it('will not be offered the role without the key, nor profit before flattery', async () => {
      const j = await City.start();
      await j.play(...row, ...gaunt);
      expect(j.find('Put it to Lord Gaunt-Halloran')).toBeUndefined();
      expect(j.find('Offer Lord Gaunt-Halloran the honour')).toBeUndefined();
    }, 120000);
    it('bought in, he lifts the Inspectorate\'s notice and the lamps are adopted', async () => {
      const j = await City.start();
      await j.play(...ventedBy(), ...flatterAndKey, demoAt);
      expect(City.arc(j, 'gaunt')).toBe(2);
      expect(has(j, 'cl_noticeUp')).toBe(false);
      expect(has(j, 'cl_adopted')).toBe(true);
      expect(has(j, 'cl_adoptedOpen')).toBe(false);
      expect((City.regard(j, 'phoenix') - 1)).toBe(2);
      await j.play('>quittance__board_room', 'Ask Lord Gaunt-Halloran how the Company finds');
      said(j, 'a lamp that burns for ever in a ledger');
      expect(has(j, 'cl_ordinanceTight')).toBe(true);
      await j.play('>quittance__slip_room');
      expect(City.page(j)).toContain('read a fourth time');
    }, 400000);
  });

  describe('the Gas Company\'s notice', () => {
    it('shuts the hall at noon on the fourth day against bright lamps that nobody has defended', async () => {
      const j = await City.start();
      await j.play(...ventedBy(), '=day 4 13:00');
      expect(has(j, 'cl_noticeUp')).toBe(true);
      expect(City.state(j, 'cl_rack', 'bright')).toBe(true);
      await j.play('>quittance__lamp_front');
      expect(City.page(j)).toContain('CLOSED PENDING EXAMINATION');
      await j.play(demoAt);
      expect(has(j, 'cl_gaswon')).toBe(true);
      expect(has(j, 'cl_adopted')).toBe(false);
      expect(City.regard(j, 'gasco')).toBe(1);
      expect((City.regard(j, 'phoenix') - 1)).toBe(-1);
    }, 400000);
  });

  describe('the boiler', () => {
    it('costs the company the goodwill it had with the Gas Company, and the Gas Company knows whose jars these were', async () => {
      const j = await City.start();
      await j.play(...row, '>quittance__round_steps', 'Pay the Company for a second bracket');
      expect(City.regard(j, 'gasco')).toBe(1);
      await j.play('=day 3 14:00', ...toWynne, ...crate, '=day 3 19:00', ...vent, '=day 4 05:00', '>quittance__retort_house', 'Slip the padlock');
      expect(has(j, 'cl_boiled')).toBe(true);
      expect(City.regard(j, 'gasco')).toBe(0);
    }, 400000);
    it('stood empty at the whistle, the retort-house takes the jars through a picked padlock', async () => {
      const j = await City.start();
      await j.play(...row, '=day 3 14:00', ...toWynne, ...crate, '=day 3 19:00', ...vent);
      await j.play('=day 4 05:00', '>quittance__retort_house');
      expect(j.at('quittance__mallow')).not.toBe('quittance__retort_house');
      await j.play('Slip the padlock');
      expect(has(j, 'cl_boiled')).toBe(true);
      expect(City.state(j, 'cl_firedoor', 'open')).toBe(true);
      expect(has(j, 'cl_slighted_gasco', 'party')).toBe(true);
      said(j, 'ride');
      await j.play('=day 4 17:00');
      expect(has(j, 'cl_adopted')).toBe(true);
      expect(has(j, 'cl_noticeUp')).toBe(false);
    }, 400000);
    it('can be bribed through with five coin while a stoker is on, and a stoker is always on by day', async () => {
      const j = await City.start();
      await j.play(...row, '=day 3 14:00', ...toWynne, ...crate, '=day 3 19:00', ...vent);
      await j.play('=day 4 09:00', '>quittance__retort_house');
      expect(j.at('quittance__mallow')).toBe('quittance__retort_house');
      expect(j.find('Slip the padlock')).toBeUndefined();
      const gold = City.gold(j);
      await j.play('Give the stoker on duty five coin');
      expect(City.gold(j)).toBe(gold - 5);
      expect(has(j, 'cl_boiled')).toBe(true);
    }, 400000);
    it('sends the stokers where the whistle puts them, six and six', async () => {
      const j = await City.start();
      await j.play(...row);
      const where = async (t: string, d = 3) => { await j.play(`=day ${d} ${t}`); return [j.at('quittance__mallow'), j.at('quittance__hesketh'), j.at('quittance__gudgeon')].map(x => x?.replace('quittance__', '')); };
      expect(await where('10:00')).toEqual(['retort_house', 'nowhere', 'gas_yard']);
      expect(await where('17:00')).toEqual(['gas_yard', 'gas_yard', 'gas_yard']);
      expect(await where('22:00')).toEqual(['nowhere', 'retort_house', 'nowhere']);
      expect(await where('05:00', 4)).toEqual(['gas_yard', 'gas_yard', 'nowhere']);
      expect(await where('06:00', 4)).toEqual(['retort_house', 'nowhere', 'gas_yard']);
    }, 300000);
  });

  describe('Perpetua Wynne', () => {
    it('realises what her lamps are when told, and will not demonstrate them', async () => {
      const j = await City.start();
      await j.play(...ventedBy(), ...tell);
      expect(City.arc(j, 'wynne') ?? 0).toBe(0);
      expect(j.measure('quittance__cl_stage', 'quittance__wynne')).toBe(1);
      said(j, 'Show me another way');
      await j.play(...flatterAndKey, demoAt);
      expect(has(j, 'cl_refused')).toBe(true);
      expect(has(j, 'cl_adopted')).toBe(false);
      expect(has(j, 'cl_ruined')).toBe(false);
      expect(City.regard(j, 'gasco')).toBe(1);
      expect((City.regard(j, 'phoenix') - 1)).toBe(-1);
    }, 400000);
    it('and what then: shown the flame in the glaziers\' shed after she has refused, she builds a lamp with a door', async () => {
      const j = await City.start();
      await j.play(...ventedBy(), ...tell, ...flatterAndKey, demoAt);
      await j.play('>quittance__wynne_lab', 'Talk to Perpetua Wynne', 'Ask Wynne to come and look at a flame', '?Take your leave', '>quittance__round_glaziers', 'Show Wynne the flame');
      expect(j.measure('quittance__cl_stage', 'quittance__wynne')).toBe(2);
      await j.play('>quittance__wynne_lab', 'Talk to Perpetua Wynne', 'Ask Wynne about the lamp with a door');
      expect(City.page(j)).toBeDefined();
      expect(j.holds('quittance__cl_lanternGiven', 'quittance__wynne')).toBe(true);
      expect(j.holds('holding', 'party', 'salamander_lantern')).toBe(true);
    }, 500000);
    it('shown the flame before the demonstration, she shows the Offices lamps that will have doors', async () => {
      const j = await City.start();
      await j.play(...ventedBy(), ...tell, '>quittance__wynne_lab', 'Talk to Perpetua Wynne', 'Ask Wynne to come and look at a flame', '?Take your leave',
        '>quittance__round_glaziers', 'Show Wynne the flame', ...flatterAndKey, demoAt);
      expect(has(j, 'cl_adopted')).toBe(true);
      expect(has(j, 'cl_adoptedOpen')).toBe(true);
      expect((City.regard(j, 'phoenix') - 1)).toBe(2);
      await j.play('>quittance__wynne_lab', 'Ask Wynne how the order stands');
      said(j, 'Three hundred, with doors');
      expect(City.knows(j, 'cl_shed_shown')).toBe(true);
    }, 500000);
    it('exposed to the Offices, she is ruined and the Gas Company pays the company in goodwill', async () => {
      const j = await City.start();
      await j.play(...row, '=day 1 14:00', '>quittance__gas_yard');
      await j.play('>quittance__round_steps', 'Pay the Company for a second bracket');
      await j.play(...ventedBy().slice(row.length), '>quittance__phoenix_floor', 'Talk to Ottoline Prewitt', 'Show Ottoline Prewitt a sickened lamp');
      expect(has(j, 'cl_exposed')).toBe(true);
      expect(has(j, 'cl_slighted_wynne', 'party')).toBe(true);
      expect(has(j, 'cl_slighted_phoenix', 'party')).toBe(true);
      await j.play('=day 4 17:00');
      expect(has(j, 'cl_gaswon')).toBe(true);
      expect(has(j, 'cl_ruined')).toBe(true);
    }, 500000);
    it('does not let a company expose what it has not learned', async () => {
      const j = await City.start();
      await j.play(...row, '>quittance__phoenix_floor', 'Talk to Ottoline Prewitt');
      expect(j.find('Show Ottoline Prewitt a sickened lamp')).toBeUndefined();
    }, 120000);
  });

  describe('the freeing of the sparks', () => {
    const freed = () => [...ventedBy(), ...tell, '>quittance__round_furnace', 'Open the catch-jars'];
    it('empties the lamps, and Wynne, who knew, stands up and tells the Offices what they were', async () => {
      const j = await City.start();
      await j.play(...freed());
      expect(has(j, 'cl_freed')).toBe(true);
      expect(City.state(j, 'cl_rack', 'empty')).toBe(true);
      await j.play(demoAt);
      expect(has(j, 'cl_confessed')).toBe(true);
      expect(has(j, 'cl_ruined')).toBe(false);
      expect(has(j, 'cl_adopted')).toBe(false);
      expect((City.regard(j, 'phoenix') - 1)).toBe(-1);
      said(j, 'referred to a committee');
    }, 500000);
    it('gives a coal from day six, once, to a company that told her it let them go', async () => {
      const j = await City.start();
      await j.play(...freed(), '>quittance__wynne_lab', 'Talk to Perpetua Wynne', 'Tell Wynne you let the sparks go', '?Take your leave');
      await j.play(demoAt);
      expect(j.find('Ask Wynne for the spark that stayed')).toBeUndefined();
      await j.play('=day 6 10:00', '>quittance__wynne_lab', 'Talk to Perpetua Wynne');
      const coal = () => j.measure('quantity', 'party', 'coal');
      expect(coal()).toBe(0);
      await j.play('Ask Wynne for the spark that stayed');
      expect(coal()).toBe(1);
      expect(j.find('Ask Wynne for the spark that stayed')).toBeUndefined();
    }, 500000);
    it('shows nothing to a company that freed them without a word: the lamps are dark and she is ruined', async () => {
      const j = await City.start();
      await j.play(...ventedBy(), '>quittance__round_furnace', 'Open the catch-jars', demoAt);
      expect(has(j, 'cl_gaswon')).toBe(true);
      expect(has(j, 'cl_ruined')).toBe(true);
      expect(has(j, 'cl_slighted_wynne', 'party')).toBe(true);
      expect(City.regard(j, 'gasco')).toBe(1);
      await j.play('>quittance__wynne_lab', 'Ask Wynne what she will do now');
      said(j, 'my sister in the country');
    }, 500000);
  });

  describe('the stokers\' steward', () => {
    it('is on the Stokers\' Steps by day, and up at the Gasworks on the fourth afternoon', async () => {
      const j = await City.start();
      await j.play(...row, '=day 3 10:00');
      expect(j.at('quittance__threlfall')).toBe('quittance__round_steps');
      await j.play('=day 4 14:30');
      expect(j.at('quittance__threlfall')).toBe('quittance__board_room');
      await j.play('=day 4 18:00');
      expect(j.at('quittance__threlfall')).toBe('quittance__nowhere');
    }, 300000);
    it('takes the company\'s side once it has seen the pilots breathe, and then the Inspectorate\'s notice is lost and the lamps are adopted', async () => {
      const j = await City.start();
      const round = ['>quittance__round_tinkers', 'Buy a gas mantle', 'Knot a new mantle', 'Light the Tinkers', '>quittance__round_steps', 'Swing the Steps lamp to light the stair', 'Light the Stokers',
        '>quittance__round_glaziers', "Hold Hob's taper", 'Light the Glaziers', '>quittance__round_furnace', 'Sit by the lamp-house', 'Light the Furnace Wharf lamp', 'Wait › A while', 'Wait › A while', 'Wait › A while'];
      await j.play(...row, '=day 2 17:00', 'Talk to Hob Tansy', 'what he is doing with that pole', 'about the four lamps', 'Offer to walk', '?Take your leave', ...round);
      expect(City.knows(j, 'd_pilots_step')).toBe(true);
      await j.play('=day 3 10:00', '>quittance__round_steps', 'Talk to Amos Threlfall', 'what ails the stokers', 'Tell Threlfall the pilots go out in step', '?Take your leave');
      expect(has(j, 'cl_stewardSide')).toBe(true);
      await j.play('=day 3 14:00', ...toWynne, ...crate, '=day 3 19:00', ...vent, '=day 4 17:00');
      expect(has(j, 'cl_noticeUp')).toBe(false);
      expect(has(j, 'cl_adopted')).toBe(true);
    }, 600000);
    it('lets the stokers\' men turn their backs at the boiler once he is the company\'s', async () => {
      const j = await City.start();
      const lamps = ['>quittance__round_tinkers', 'Buy a gas mantle', 'Knot a new mantle', 'Light the Tinkers', '>quittance__round_steps', 'Swing the Steps lamp to light the stair', 'Light the Stokers',
        '>quittance__round_glaziers', "Hold Hob's taper", 'Light the Glaziers', '>quittance__round_furnace', 'Sit by the lamp-house', 'Light the Furnace Wharf lamp', 'Wait › A while', 'Wait › A while', 'Wait › A while'];
      await j.play(...row, '=day 2 17:00', 'Talk to Hob Tansy', 'what he is doing with that pole', 'about the four lamps', 'Offer to walk', '?Take your leave', ...lamps);
      await j.play('=day 3 10:00', '>quittance__round_steps', 'Talk to Amos Threlfall', 'what ails the stokers', 'Tell Threlfall the pilots go out in step', '?Take your leave');
      await j.play('=day 3 14:00', ...toWynne, ...crate, '=day 3 19:00', ...vent, '=day 4 09:00', '>quittance__retort_house');
      expect(j.at('quittance__mallow')).toBe('quittance__retort_house');
      await j.play('Ask Threlfall');
      expect(has(j, 'cl_boiled')).toBe(true);
    }, 600000);
    it('names his grievance, and takes the company\'s side only when it has seen the pilots breathe in step', async () => {
      const j = await City.start();
      await j.play(...row, '=day 2 10:00', '>quittance__round_steps', 'Talk to Amos Threlfall', 'what ails the stokers');
      said(j, 'Half a day');
      expect(j.find('Tell Threlfall the pilots go out in step')).toBeUndefined();
    }, 120000);
  });
});
