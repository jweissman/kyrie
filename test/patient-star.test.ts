import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { KyrLint } from '../src/cli/kyr-lint';
import { Journey as Driver } from '../src/session/journey';
import phases from './fixtures/patient/journeys.json';

// The Patient Star, all five tiers, written in Kyr by an author who did not make Kyr (doc/adventures/patient-star).
// Each journey plays by the labels a player sees; the phases are in test/fixtures/patient/journeys.json. A label
// starting with ~ is a move that is retried after a short wait if the way is not open yet (the Steam Stair's blast).
// The deep tiers are pitched at levels 4 to 12, so those journeys play a company of that level.
class Journey {
  static async start(campaign = 'test/fixtures/patient/deep.campaign.json') {
    return new Journey(await Driver.start(campaign, 'p'));
  }
  async phase(...names: (keyof typeof phases)[]) {
    for (const n of names) { await this.play(...phases[n]); }
    return this;
  }
  knows(fact: string) { return this.holds('knows', 'party', `season__${fact}`); }
  private constructor(readonly j: Driver) {}
  get s() { return this.j.session; }
  choices() { return this.j.choices().map(c => ({ ...c, label: c.full })); }
  offers(label: string) { return this.j.offers(label); }
  // What a step told: the page's telling, then what came back (perceptions and response).
  private static told(t: Driver['taken'][number]) { return `${t.page} ${t.told.trim()}`; }
  async act(label: string) { await this.j.step(label); const t = this.j.taken.at(-1); return t ? Journey.told(t) : ''; }
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
  holds(name: string, ...args: string[]) { return this.j.holds(name, ...args); }
  measure(name: string, ...args: string[]) { return this.j.measure(name, ...args); }
  at(who: string) { return this.j.at(who); }
  get page() { return this.j.taken.map(t => `[${t.label}] ${Journey.told(t)}`).join('\n'); }
}

describe('The Patient Star', () => {
  it('lints clean as a recommended campaign', async () => {
    const findings = await KyrLint.campaign('data/campaigns/the-patient-star.campaign.json', new NodeBundleSource());
    expect(findings.filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('S1, the Hour: the hour-names put together from two sources open the archive; the Wall names the murderers', async () => {
    const j = await Journey.start();
    await j.phase('quell_to_hour');
    expect(j.knows('hour_names')).toBe(true);
    await j.phase('hour');
    expect(j.knows('long_hour_read')).toBe(true);
    expect(j.knows('selane_murdered')).toBe(true);
    expect(j.holds('carries', 'party', 'season__veil')).toBe(true);
  }, 120000);

  it('S2, the Undersun: touch gives time, speech is laid, the name is the plan; down to the Tip', async () => {
    const j = await Journey.start();
    await j.phase('quell_to_hour', 'hour', 'crown_and_reach');
    // The ash, given time, shows the line; the fourth Dane says his own name; Selane argues a sentence at a touch.
    expect(j.knows('smoke_line')).toBe(true);
    expect(j.knows('dane_name')).toBe(true);
    expect(j.knows('seed_building')).toBe(true);
    // Speaking the Grammar door's syllable aloud gives the riot five seconds.
    expect(j.page).toMatch(/Two hundred people take up their riot/);
    await j.phase('shaft');
    await j.play('To the head of the Listeners', 'To the Keystone Gallery');
    expect(j.knows('held_feed')).toBe(true);
    await j.play('To the head of the Listeners', 'To the Fair', "Lay the door's beat", 'To the Tip');
    expect(j.at('party')).toBe('season__tip_dome');
  }, 180000);

  it('S3, the Way and the Keeping: four gates answered from history; the sigils seen; Ithmar bound tighter', async () => {
    const j = await Journey.start();
    await j.phase('quell_to_hour', 'hour', 'crown_and_reach', 'shaft', 'tip_and_back_to_stairhead', 'the_way');
    expect(j.at('party')).toBe('season__arbiter_vault');
    expect(j.holds('carries', 'party', 'season__tally')).toBe(true);
    await j.phase('keeping_inward');
    expect(j.knows('crown_map')).toBe(true);
    expect(j.knows('sigils_known')).toBe(true);
    // Weeks in the Keeping, and Imbar's clocks run: the Corbel is lower.
    expect(j.measure('season__corbelHeight', 'season__corbel_site')).toBeLessThan(3000);
    await j.phase('keeping_outward');
    await j.play('Bind Ithmar tighter, Saro');
    expect(j.holds('season__rebound', 'season__corbel_site')).toBe(true);
    expect(j.page).toMatch(/The plateau's troubles are its own again/);
  }, 300000);

  it('S4, the Corbel and the Masonry: the filament, the Interlocutor in your own voice, and Saro holding the Heart', async () => {
    const j = await Journey.start();
    await j.phase('corbel');
    // Up the filament in felt: about eight points of dose, as the source says.
    expect(j.knows('newest_backward')).toBe(true);
    expect(j.page).toMatch(/it is your own voice, out of the walls/);
    await j.phase('masonry');
    expect(j.holds('season__exiled', 'season__corbel_site')).toBe(true);
    expect(j.page).toMatch(/I know how to be still/);
  }, 300000);

  it('S5, the Concord: called when the Corbel is seen and the sinking proved; the Way shown, a descent passes', async () => {
    const j = await Journey.start();
    await j.phase('corbel_seen');
    expect(j.holds('season__convened', 'season__chapter')).toBe(true);
    await j.play('To the chapel', 'To the head of the Stair', 'To the platform', 'Search here', 'To the head of the Stair',
      'To the chapel', 'To the chapter house', 'Show the Concord that the Way', 'Ask the Concord to vote');
    expect(j.holds('season__passed', 'season__motion_descend')).toBe(true);
    expect(j.holds('season__passed', 'season__motion_cover')).toBe(false);
  }, 180000);

  it('S6, the Breach: a herd-mark in the culvert and a sluice pin on the holder\'s door name who cut it', async () => {
    const j = await Journey.start();
    await j.play('Rusk.*Buy › An umber felt', 'Pack › An umber felt cloak › Equip', 'To the Collar Road gate', 'To the market road',
      'To the top of the Collar', 'To the Breach', 'drainage culvert: Examine', 'To the top of the Collar',
      'To the market road', 'To the Collar Road gate', 'To the Shift Market', 'To the Ramp head', "To Ennick's lower road",
      "holder's door.*Look closely");
    expect(j.knows('breach_cut')).toBe(true);
  }, 180000);

  it('S7, the fourth Dane: his name taken by touch below, spoken at his tomb, and the Weirs\' dispute is settled', async () => {
    const j = await Journey.start();
    await j.phase('quell_to_hour', 'hour', 'crown_and_reach');
    await j.play('To the Riot Hall', 'To the head of the Seridane Reach', 'To the foot of the Crown', 'To the Burning Wood',
      'To where the Courses broke', 'To the Courses', 'To the hot gallery', 'To the Coverers', 'To the hot gallery',
      'To the Waiting Hall', '~To the head of the Steam Stair', 'To the Granary Ring', 'To the Plate Hall',
      'Mirror Road, south stretch', 'Mirror Road, north stretch', 'To the West Gate', 'To the West Gallery, at the Neck',
      'To the foot of the North Well', 'To the North Well head', 'To the Shift Market', 'To the Ramp head',
      "To Ennick's lower road", 'To the foot of the west cliff', 'To the lower name-tombs', 'To an empty name-tomb',
      "Speak the fourth Dane's name");
    expect(j.holds('season__reanchored', 'season__fourth_dane')).toBe(true);
  }, 300000);

  it('S8, the long clock: the Corbel comes down two metres a day while the company waits', async () => {
    const j = await Journey.start();
    const h0 = j.measure('season__corbelHeight', 'season__corbel_site');
    for (let i = 0; i < 10; i++) { await j.act('The company: Wait › Until'); }
    expect(h0 - j.measure('season__corbelHeight', 'season__corbel_site')).toBeGreaterThanOrEqual(8);
  }, 120000);

  it('S9, the king: Amaru wakes by the week, and in the eighth the Warden\'s men carry him up with a fever', async () => {
    const j = await Journey.start();
    expect(j.measure('season__amaruRate', 'season__amaru')).toBe(6);
    while (j.measure('day', 'clock') < 57) { await j.act('The company: Wait › Until'); }
    expect(j.measure('season__amaruRate', 'season__amaru')).toBe(3);
    expect(j.at('season__amaru')).toBe('season__barracks');
    expect(j.holds('season__fevered', 'season__amaru')).toBe(true);
    expect(j.at('season__halu')).toBe('season__split_ear_camp');
  }, 300000);
});
