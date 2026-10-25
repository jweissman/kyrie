import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ScreenModel } from '../src/ui/screen-model';
import { KyrLint } from '../src/cli/kyr-lint';
import { Journey as Driver } from '../src/session/journey';

// Hold One Season, a slice of The Patient Star written in Kyr by an author who did not make Kyr
// (doc/adventures/patient-star). Each journey plays by the labels a player sees, in the reader's own sections, and
// checks what the world did: the fiction, not the implementation.
class Journey {
  static readonly campaign = 'data/campaigns/hold-one-season.campaign.json';
  static async start(seed = 'p', campaign = Journey.campaign) { return new Journey(await Driver.start(campaign, seed)); }
  async waitUntil(test: () => boolean, label = 'Wait › An hour', most = 60) {
    for (let i = 0; i < most && !test(); i++) { await this.act(label); }
    return test();
  }
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
const me = 'season__member_party_1';

// The ways into Quell's life that most journeys share: felt on, a light, a stylus, Dagny's bargain.
const outfit = ['Rusk.*Buy › An umber felt', 'Pack › An umber felt cloak › Equip', 'Rusk.*Buy › A horn lantern',
  'Rusk.*Buy › A flask', 'Rusk.*Buy › A flask', 'Rusk.*Buy › A stillglass stylus'];
const bargain = ["To the Mutual's yard", "Into the Mutual's hall", 'Ask Dagny about Garret', 'Ask Dagny what',
  "Out to the Mutual's yard", 'To the Shift Market'];
const down = ['To the North Well head', 'Give Hal Brewin a crown', 'To the foot of the North Well', 'light a flask',
  'To the West Gallery, at the Neck', 'To the West Gate', 'To the Mirror Road, north', 'Mirror Road, south stretch',
  'To the Plate Hall', 'To the Granary Ring'];
const up = ['To the Plate Hall', 'Mirror Road, south stretch', 'Mirror Road, north stretch', 'To the West Gate',
  'To the West Gallery, at the Neck', 'To the foot of the North Well', 'To the North Well head', 'To the Shift Market',
  "To the Mutual's yard", "Into the Mutual's hall"];

describe('Hold One Season', () => {
  it('lints clean as a recommended campaign', async () => {
    const findings = await KyrLint.campaign(Journey.campaign, new NodeBundleSource());
    expect(findings.filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('J1, canonical: the shutter cord pulled from the doorway, Garret comes round, Dagny keeps her word', async () => {
    const j = await Journey.start();
    await j.play('knife: Take', ...outfit, ...bargain, ...down);
    expect(j.page).toMatch(/That blade has no stamp/);
    await j.play("Ways on: To the ninth vault$");
    expect(j.holds('heldDeep', 'season__garret')).toBe(true);
    await j.play('To the Granary Ring', 'pull the shutter cord', 'Ways on: To the ninth vault$');
    expect(j.holds('lit', 'season__vault')).toBe(false);
    expect(await j.waitUntil(() => !j.holds('asleep', 'season__garret'))).toBe(true);
    // The lantern burned out while he came round: in the dark nothing he does is seen, or heard.
    if (!/Where.s the light gone/.test(j.page)) { await j.play('light a flask'); }
    expect(j.page).toMatch(/Where.s the light gone/);
    await j.play('Ask Garret to join');
    expect(j.holds('travelsWith', 'season__garret', 'party')).toBe(true);
    await j.play('To the Granary Ring', ...up);
    expect(j.page).toMatch(/I keep my word/);
    expect(j.measure('owes', 'party', 'season__dagny')).toBe(14);
  }, 120000);

  it('J2, into the beam: whoever drags him out is dosed, and slowed goes at half pace', async () => {
    const j = await Journey.start();
    // No felt: the cutter goes in bare.
    await j.play('Rusk.*Buy › A horn lantern', 'Rusk.*Buy › A flask', ...down, "Ways on: To the ninth vault$");
    await j.play('The company: Wait › An hour', 'The company: Wait › An hour');
    expect(j.measure('dose', me)).toBeGreaterThanOrEqual(48);
    expect(j.page).toMatch(/footsteps sound late/);
    await j.play('Go into the beam and drag Garret out');
    expect(j.at('season__garret')).toBe('season__ring');
    // Out of the beam he comes round as he would with the shutter down; the light still stands in the vault.
    expect(j.holds('lit', 'season__vault')).toBe(true);
    // Slowed, the company goes at half its pace: the stilling sets the cutter's speed to half (ledger, 1).
    const clock = () => { const m = /(\d+):(\d+) (a|p)\.m\./.exec(ScreenModel.build(j.s.campaign).clock)!;
      return (Number(m[1]) % 12 + (m[3] === 'p' ? 12 : 0)) * 60 + Number(m[2]); };
    const t0 = clock();
    await j.play('To the Waking Ward');
    if (process.env.JOURNEY_TRACE) { console.log('doorway took', clock() - t0, 'minutes; laden', j.holds('laden', 'party')); }
    expect(clock() - t0).toBe(2);
  }, 120000);

  it('J3, the world does not wait: the crew goes down, argues, frees him; Ness takes the jars; no debt is forgiven', async () => {
    const j = await Journey.start();
    await j.play(...bargain, "To the Mutual's yard");
    expect(await j.waitUntil(() => j.holds('season__cameUp', 'season__garret'), 'The company: Wait › Until', 40)).toBe(true);
    expect(j.holds('keeps', 'season__ness', 'season__jars')).toBe(true);
    expect(j.measure('day', 'clock')).toBeGreaterThanOrEqual(7);
    await j.play("Into the Mutual's hall");
    expect(j.page).toMatch(/Your number on the board is the same/);
    expect(j.measure('owes', 'party', 'season__dagny')).toBe(28);
  }, 120000);

  it('J4, inference: the clerk on the plate says the Ennick prayer, and the company knows what it is', async () => {
    const j = await Journey.start();
    await j.play(...outfit, 'To the Ramp head', "To Ennick's lower road", "Into the holder's house", 'Ask Bren what is said');
    expect(j.holds('knows', 'party', 'season__prayer_heard')).toBe(true);
    await j.play("Out to Ennick's lower road", 'To the Ramp head', 'To the Shift Market', ...down.slice(0, 9));
    expect(j.holds('knows', 'party', 'season__prayer_label')).toBe(false);
    await j.play('granary racks: Draw a stylus along the granary');
    expect(j.holds('knows', 'party', 'season__tally_words')).toBe(true);
    expect(j.page).toMatch(/is the line the Holdfolk say over their dying/);
    expect(j.holds('knows', 'party', 'season__prayer_label')).toBe(true);
  }, 120000);

  it('J5, testimony: Ilis says what she has never told Bren, only to someone who has seen the jars', async () => {
    const j = await Journey.start();
    await j.play(...outfit, 'To the Ramp head', "To Ennick's lower road", "Into Ilis's house", 'Ask Ilis about the holding prayer');
    expect(j.offers('Tell Ilis about the words')).toBe(false);
    await j.play("Out to Ennick's lower road", 'To the Ramp head', 'To the Shift Market', ...down);
    expect(j.holds('knows', 'party', 'season__jars_painted')).toBe(true);
    await j.play(...up.slice(0, 8), 'To the Ramp head', "To Ennick's lower road", "Into Ilis's house", 'Tell Ilis about the words');
    expect(j.page).toMatch(/I have never told Bren/);
  }, 120000);

  it('J6, the Outfall: shut by the flood at first, open once it falls in Harvest, eight hours to the Flood Line', async () => {
    const j = await Journey.start();
    await j.play(...outfit, 'To the Ramp head', "To Ennick's lower road", 'To the shrine', 'To the Weeping Wall');
    expect(j.offers('Ways on: To the Flood Line')).toBe(false);
    expect(await j.waitUntil(() => j.offers('Ways on: To the Flood Line'), 'The company: Wait › Until', 40)).toBe(true);
    expect(j.measure('season', 'clock')).toBe(3);
    await j.play('Ways on: To the Flood Line');
    expect(j.at('party')).toBe('season__flood_line');
  }, 120000);

  it('J7, the Sluice: wound open, it washes out Ennick\'s lower road and drops Quell\'s wells', async () => {
    // The Outfall eels in the Flood Line kill a first-level cutter; this journey is played by a seasoned one.
    const j = await Journey.start('p', 'test/fixtures/patient/deep.campaign.json');
    await j.play(...outfit, ...down, 'To the Flood Line', 'To the Sluice');
    await j.play('Wind the Sluice open');
    expect(await j.waitUntil(() => j.holds('season__washedOut', 'season__lower_road'), 'The company: Wait › Until', 12)).toBe(true);
    expect(await j.waitUntil(() => j.holds('season__drained', 'season__quell_wells'), 'The company: Wait › Until', 12)).toBe(true);
  }, 120000);

  it('J8, the mirror: cranked away from the Bunks, the Bunks crew notice; the north garden browns over days', async () => {
    const j = await Journey.start();
    await j.play(...outfit, ...down.slice(0, 7), 'To the third lamp-chamber', 'Crank the mirror round to the Bunks');
    expect(j.holds('season__bright', 'season__bunks')).toBe(true);
    await j.play('The company: Wait › An hour', 'Crank the mirror round to the south', 'To the Mirror Road, north', 'Mirror Road, south stretch', 'To the Bunks');
    expect(j.page).toMatch(/Somebody.s been at the third mirror/);
    const green = j.measure('season__green', 'season__road_north');
    await j.play('The company: Wait › Until', 'The company: Wait › Until');
    expect(j.measure('season__green', 'season__road_north')).toBeLessThan(green);
  }, 120000);

  it('J9, the Neck: a mark scratched at the waterline is found dry days later', async () => {
    const j = await Journey.start();
    await j.play(...outfit, ...down.slice(0, 5), 'Scratch a mark');
    const dried = await j.waitUntil(() => j.measure('season__airGap', 'season__neck_water') >= j.measure('season__markedAt', 'party') + 2,
      'The company: Wait › Until', 60);
    if (process.env.JOURNEY_TRACE) { console.log('air', j.measure('season__airGap', 'season__neck_water'), 'mark', j.measure('season__markedAt', 'party'), j.measure('day', 'clock')); }
    expect(dried).toBe(true);
    // Three days on, the lantern is long out: the mark is there, but nobody sees it without a light.
    await j.play('To the West Gate', 'To the West Gallery, at the Neck');
    expect(j.holds('knows', 'party', 'season__water_falling')).toBe(false);
    await j.play('light a flask');
    expect(j.holds('knows', 'party', 'season__water_falling')).toBe(true);
  }, 120000);

  it('J10, Doran breathes: most of an hour of watching, nine hundred paces into the glass', async () => {
    const j = await Journey.start();
    await j.play(...outfit, 'To the Ramp head', "To Ennick's lower road", 'To the upper terraces', "To the holders' cord",
      'To the edge of the glass', 'To three hundred paces in', "To Doran's brick");
    expect(await j.waitUntil(() => j.holds('knows', 'party', 'season__doran_breathed'), 'The company: Wait › A while', 12)).toBe(true);
  }, 120000);

  it('J11, the wolves: they keep level with a company that can run, and come at one that cannot', async () => {
    const j = await Journey.start();
    // Bare, an hour on the glass is a point of dose: half speed, and the cord at dusk.
    await j.play('Rusk.*Buy › A horn lantern', 'To the Ramp head', "To Ennick's lower road", 'To the upper terraces',
      "To the holders' cord", 'To the edge of the glass');
    await j.waitUntil(() => j.holds('dark'), 'The company: Wait › An hour', 12);
    expect(j.measure('dose', me)).toBeGreaterThanOrEqual(24);
    await j.play("To the holders' cord");
    expect(j.page).toMatch(/wolves come at you/);
  }, 120000);

  it('J12, Saro: the light does not slow her, in the company or out of it', async () => {
    const j = await Journey.start();
    await j.play('Into the lazar house', 'Ask Saro what she wants');
    expect(j.offers('Tell Saro you are going down')).toBe(false);
    await j.play('Out to the Shift Market', ...bargain.slice(0, 3), "Out to the Mutual's yard", 'To the Shift Market', 'Into the lazar house',
      'Tell Saro you are going down', 'Ask Saro to join', 'Out to the Shift Market', 'To Old Quell', 'The company: Wait › An hour');
    expect(j.measure('dose', 'season__member_saro_person')).toBe(0);
    expect(j.measure('dose', me)).toBeGreaterThanOrEqual(24);
  }, 120000);

  it('J13, false felt: the barrow boy\'s cloak looks the same and stops nothing', async () => {
    const j = await Journey.start();
    await j.play('barrow.*Buy an umber felt', 'Pack › An umber felt cloak › Equip', 'To Old Quell', 'The company: Wait › An hour');
    expect(j.measure('dose', me)).toBeGreaterThanOrEqual(24);
  }, 120000);

  it('J14, the night way: past Hal Brewin without coin or licence', async () => {
    const j = await Journey.start();
    await j.play('To the North Well head', 'unhook the chain-gate');
    expect(j.page).toMatch(/No,. he says/);
    // By night Hal is asleep on his stool, and the chain is anyone's to unhook.
    await j.waitUntil(() => j.holds('asleep', 'season__hal'), 'The company: Wait › An hour', 24);
    await j.play('unhook the chain-gate', 'To the foot of the North Well');
    expect(j.at('party')).toBe('season__well_foot');
  }, 120000);
});
