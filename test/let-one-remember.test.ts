import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { Journey } from '../src/session/journey';

// Let One Remember, played by the labels a player sees (and the item panel's acts), by the shared driver (Journey:
// '=N' waits an hour or a while at a time until watch N, '=+N' that many watches more, '~N' until dark or first
// light at a time until watch N, '?label' is taken if it is offered).
class T {
  static start(campaign = 'data/campaigns/let-one-remember.campaign.json') {
    return PlaySession.start(campaign, 'corrow', NodeBundleSource.shared);
  }
  static async act(n: number) {
    const s = await this.start(`test/fixtures/corrow/act${n}/act${n}.campaign.json`);
    await this.play(s, [`Begin Act ${['', 'I', 'II', 'III', 'IV', 'V'][n]}`]);
    return s;
  }
  static choices(s: PlaySession) { return Journey.of(s).choices(); }
  static watch(s: PlaySession) { return Journey.of(s).watch(); }
  static play(s: PlaySession, steps: string[]): Promise<string> { return Journey.of(s).play(...steps); }
  static holds(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static knows(s: PlaySession, fact: string) { return this.holds(s, 'knows', 'party', `corrow__${fact}`); }
  static hightown(s: PlaySession, measure: string) {
    return s.campaign.world.number(ModuleWriter.call(`corrow__${measure}`, 'corrow__hightown'));
  }
  static measureOf(s: PlaySession, measure: string, of: string) {
    return s.campaign.world.number(ModuleWriter.call(`corrow__${measure}`, `corrow__${of}`));
  }
  static is(s: PlaySession, relation: string, ...args: string[]) {
    return this.holds(s, `corrow__${relation}`, ...args.map(a => a === 'party' ? a : `corrow__${a}`));
  }
}

// Ways there and back that several journeys share.
const toKeld = ['^To the street of chimneys', '^To the drove-road gate', '^To the Keld end', '^To the sinkhole green'];
const fetchTeshen = [...toKeld, '^Into Mother Saska', 'Talk to Teshen', 'Ask Teshen what she wants', 'Ask Teshen to join'];
const keldToDrag = ['^Out to the sinkhole green', '^To the Keld end', '^To the drove-road gate', '^To the street of chimneys', '^To the Collar',
  '^To the north edge', '^To the gate of the Askew'];
const toWendmouth = ['^To the foot of the Scarp', '^To Wendhead bridge', '^To the valley road below', '^To the well square'];

describe('Let One Remember', () => {
  it('left alone, brings Hightown down on the Socket\'s shore, and the secretary goes down the Well', async () => {
    const s = await T.start();
    const said = await T.play(s, ['~4040']);
    expect(said).toContain('there has been a theft at the hospice');
    expect(said).toContain('a link of the tail');
    expect(said).toContain('Hightown is not where it was');
    expect(said).toContain('the north hoist-tower at Hornwake goes over');
    expect(said).toContain('The Grounders are going up to the rim');
    expect(said).toContain('three hundred people look down at the lake');
    expect(said).toContain('took the three Strays out of the west field');
    expect(said).toContain('It does not sink. It drops.');
    expect(T.is(s, 'fellOnShore', 'hightown')).toBe(true);
    expect(said).toContain('lies on the south shore of the Socket');
    expect(said).toContain('the consul\'s secretary, licensed for one');
    // Left alone into Act II: the Open Hand have seven syllables at the Seam, and the name crosses.
    const later = await T.play(s, ['~5700']);
    expect(later).toContain('wore a hundred lost coats');
    expect(T.is(s, 'unsaidCrossed', 'margin')).toBe(true);
    // And into Act III: the star breaks, the Unfolded come down with the Unsaid at their head, and read the band.
    const war = await T.play(s, ['~7300']);
    expect(war).toContain('the slow star in the north-east breaks');
    expect(war).toContain('Hornwake runs to the Stake ruins');
    expect(war).toContain('They know where she went');
    expect(T.is(s, 'bandRead', 'corrow')).toBe(true);
  }, 300000);

  it('reads the Drag with a Keld, and Hightown comes down one mind at a time', async () => {
    const s = await T.start();
    let said = await T.play(s, [...fetchTeshen, ...keldToDrag]);
    expect(T.holds(s, 'travelsWith', 'corrow__teshen', 'party')).toBe(true);
    // A Meaningful Discovery: the gatepost is Jory's, and reading it costs five silver.
    said = await T.play(s, ['Talk to Jory', 'about his gatepost', 'Pay Jory', 'Ask Teshen to read the chain']);
    expect(said).toContain('Let one remember at a time');
    expect(T.knows(s, 'method_known')).toBe(true);
    // A First Anomaly, on the way north.
    said = await T.play(s, ['^To the farm below Hesk Dene']);
    expect(said).toContain('That\'s my grandmother\'s dog');
    said = await T.play(s, ['^To the toppled', 'Ask Teshen to read the chains']);
    expect(T.knows(s, 'origin_known')).toBe(true);
    // Up to Hightown by the hoist, and to the Grounders.
    said = await T.play(s, ['^To the farm below', '^To the furrow$', '^To the tail', '^To the horn', '^To the hoist-feet',
      'Talk to Lene', 'Pay Lene', 'Take your leave', '^To the hoist-house', '^To the rim and', '^To the terraces', '^To the Grounders',
      'Talk to Aron', 'Tell Aron', 'Take your leave']);
    expect(said).toContain('A roster, then');
    // The roster runs a Counterweight a day; with twenty, the horn bites and the drift stops short of the Socket.
    said = await T.play(s, ['~4040']);
    expect(said).toContain('the horn stops dragging');
    expect(T.is(s, 'bitten', 'hightown')).toBe(true);
    expect(T.is(s, 'crashed', 'hightown')).toBe(false);
    expect(T.is(s, 'overSocket', 'hightown')).toBe(false);
    expect(said).toContain('One Counterweight a day comes to know where the mountain came from');
  }, 300000);

  it('buys the Registry a reckoning with coal, and the runners, the Hartmark and the hoists act on the number', async () => {
    const s = await T.start();
    let said = await T.play(s, [...toWendmouth, '^To the quay', '^Into the Ninepan', 'Talk to Clemence', 'Buy.*coal', 'Take your leave',
      '^Out', '^To the well square', '^To the valley road', '^To Wendhead bridge', '^To the foot', '^To the eighth', '^To the street',
      '^To the Collar', '^To the rim', '^To the Fourth Gate', 'Talk to the Assessor', 'how many links', 'Give.*coal', 'say the reckoning again']);
    expect(said).toContain('ONE MORE CUT IS THE LIMIT');
    expect(T.knows(s, 'cut_limit')).toBe(true);
    said = await T.play(s, ['Take your leave', '^To the rim', '^To the Collar', '^To the north edge', '^To the gate of the Askew', '^To the farm below',
      '^To the furrow$', '^To the tail', 'Talk to Ruth', 'Tell Ruth', 'Take your leave']);
    expect(said).toContain('Downtools');
    expect(T.is(s, 'filing', 'ruth')).toBe(false);
    said = await T.play(s, ['^To the horn', '^To the horseshoe|^To the wagon', '^Into the Hartmark|^To the Hartmark', 'Talk to Esk', 'Tell Esk', 'Take your leave']);
    expect(said).toContain('Of course I stop');
    said = await T.play(s, ['^Out|^To the wagon', '^To the horn', '^To the hoist-feet', 'Talk to Lene', 'about the hoists']);
    expect(said).toContain('nobody has to cut anything');
    said = await T.play(s, ['Put it to Lene']);
    expect(T.is(s, 'ballasting', 'lene')).toBe(true);
    said = await T.play(s, ['Take your leave', '~4040']);
    expect(T.hightown(s, 'tailLinks')).toBe(143);
    expect(T.hightown(s, 'ballast')).toBeGreaterThan(1500);
    expect(T.is(s, 'crashed', 'hightown')).toBe(false);
    expect(T.is(s, 'lost', 'hightown')).toBe(false);
    expect(said).toContain('rides out the turn of the year');
  }, 300000);

  it('goes down the low road by the grammar of its marks, wakes the court\'s deeds at the Seam, and comes up another way', async () => {
    const s = await T.start();
    let said = await T.play(s, [...toWendmouth, '^To the quay', '^Into the Ninepan', 'Talk to Clemence', 'Buy.*diving', 'Take your leave', '^Out',
      '^To the well square', '^Into the Keepstone', 'Talk to Judge', 'her ruling', '^To the valley road|Out', '^To the valley road', '^Into the Coyle',
      'Talk to Bram', 'drawer', 'Take your leave', '^Out', '^To the well square', '^Into the Keepstone', 'Talk to Judge', 'blank stone reads', '^Take$',
      'Take your leave', '^Out', '^To the valley road', '^To Wendhead bridge', '^Into the Wendhead hospice', '^To the hospice archive',
      'Letting prayer', '^To the hospice hall', '^Out', '^To the foot', '^To the eighth', '^To the street', '^To the Collar',
      '^Into the Rope', ...Array(8).fill('Buy › A torch'), '^Out', '^To the rim', '^To the Fourth Gate', 'Buy a licence']);
    expect(T.knows(s, 'evidential_known')).toBe(true);
    expect(T.is(s, 'licensed', 'party')).toBe(true);
    // Through the Ring to the Glass Floor; Ida Wishart takes the light when the chimeflies come (A Dangerous
    // Encounter).
    said = await T.play(s, ['^To the lowest', '?a torch: Light', '^To the third Forge', '^To the Gaol', '^To the collapsed', '^To the edge of the Glass',
      'Talk to Ida', 'across the Diggings', 'Ask Ida.*join', '^To the Diggings']);
    expect(said).toContain('Don\'t breathe in');
    said = await T.play(s, ['^To the trough', '^To under the Breach', '?a torch: Light', '^To Lamplighter', 'journals', '^To the head of the low road',
      '?a torch: Light', '^To the first way-mark']);
    expect(said).toContain('calve tel lue senneth: kept');
    // Left, right, left: the ways marked kept.
    said = await T.play(s, ['^To the left-hand passage', '^To the right-hand passage', '^To the third way-mark', '^To the left-hand passage', '?a torch: Light']);
    expect(said).toContain('a cup of calcite shaped around something that is not there');
    said = await T.play(s, ['Lay your hands on the newest', 'Lay a crate']);
    expect(said).toContain('If nobody follows, it ends with me');
    expect(T.knows(s, 'wenna_band')).toBe(true);
    // Lights out: the grey shore, and a Stray saying its syllable.
    said = await T.play(s, ['^To the third way-mark', '^To the left-hand passage|^To the Seam']);
    // Up by the dive under the Scarp, which the Registry never sees.
    said = await T.play(s, ['^To the third way-mark', '?a torch: Light', '^To the Fork', '^To the second way-mark', '^To the first way-mark', '^To the head of the low road',
      '^To Lamplighter', '^To under the Breach', '^To the Underfloor river', '?a torch: Light', '^To the Wendhead pool']);
    expect(T.is(s, 'unclosed', 'party')).toBe(true);
    said = await T.play(s, ['^To Wendhead bridge', '^To the valley road below', '^To the well square', '^Into the Keepstone', 'Talk to Judge', '^Give']);
    expect(said).toContain('And my house is mine');
    said = await T.play(s, ['Take your leave', '^Out', '=600', '^To the valley road', '^To Wendhead bridge', '^To the foot', '^To the eighth', '^To the street',
      '^To the Collar', '^Into the Rope']);
    // A Return to a Changed Place.
    expect(said).toContain('The Registry has you down as not come back');
  }, 300000);
});

describe('Let One Remember: names, the Chain and the rim', () => {
  it('finds the man whose place Corin Webb took, and a Keld gives Webb back his own name', async () => {
    const s = await T.start();
    let said = await T.play(s, ['^To the foot of the Scarp', '^To Wendhead bridge', '^Into the Wendhead hospice', '^To the long ward', 'Talk to the nameless',
      'who he is', 'Take your leave', '^To the hospice hall', '^Out', '^To the foot', '^To the eighth', ...fetchTeshen, 'consul.s secretary']);
    expect(said).toContain('Somebody\'s wrong, and it isn\'t me');
    said = await T.play(s, ['Talk to Mother Saska', 'how many came back']);
    expect(T.knows(s, 'hollow_missing')).toBe(true);
    said = await T.play(s, ['Take your leave', '^Out', '^To the Keld end', '^To the drove-road gate', '^To the street', '^To the Collar', '^To the rim',
      '^To the Fourth Gate', '^To the counting', '^To the contract', 'payroll']);
    expect(T.knows(s, 'webb_is_stray')).toBe(true);
    said = await T.play(s, ['^To the counting', '^To the Fourth', '^To the rim', '^To the Collar', '^To the street', '^To the eighth', '^To the foot',
      '^To Wendhead bridge', '^Into the Wendhead hospice', 'Talk to Prioress', 'Tell Prioress Rook what Corin Webb is', 'Take your leave', '^Out',
      '^To the valley road below', '^To the well square', '^Into the Lusk', 'Ask Teshen to give Corin Webb']);
    expect(said).toContain('Corin Webb puts his face in his hands');
    expect(T.is(s, 'guarded', 'rook')).toBe(true);
    said = await T.play(s, ['^Out', '^To the valley road', '^To Wendhead bridge', '^Into the Wendhead hospice', '^To the long ward']);
    expect(said).toContain('Absalom Prew');
    said = await T.play(s, ['~1600']);
    expect(said).not.toContain('there has been a theft at the hospice');
  }, 300000);

  it('tells the Grounders\' hall all at once, and Hightown comes down where it is', async () => {
    const s = await T.start();
    await T.play(s, [...fetchTeshen, ...keldToDrag, '^To the farm below', '^To the toppled', 'Ask Teshen to read the chains',
      '^To the farm below', '^To the furrow$', '^To the tail', '^To the horn', '^To the hoist-feet', 'Talk to Lene', 'Pay Lene', 'Take your leave',
      '^To the hoist-house', '^To the rim and', '^To the terraces', '^To the Grounders']);
    const said = await T.play(s, ['Tell the Grounders where Hightown came from']);
    expect(said).toContain('the mountain groans like a ship');
    expect(said).toContain('Hightown is coming down');
    expect(T.is(s, 'grounded', 'hightown')).toBe(true);
    expect(T.is(s, 'crashed', 'hightown')).toBe(false);
    expect(said).toContain('sits on the open plateau short of the Socket');
  }, 300000);

  it('opens the sealed room in the dark, and a name said on the rim drops the mountain', async () => {
    const s = await T.start();
    await T.play(s, [...fetchTeshen, '^Out to the sinkhole green', '^To the Keld end', '^To the drove-road gate', '^To the street', '^To the Collar',
      '^To the north edge', '^To the gate of the Askew', '^To the farm below', '^To the furrow$', '^To the tail', '^To the horn', '^To the hoist-feet',
      'Talk to Lene', 'Pay Lene', 'Take your leave', '^To the hoist-house', '^To the rim and', '^To the terraces', '^To the hall of the Charge',
      '^To the archive', 'Read Cassen']);
    expect(T.knows(s, 'cassen_notes')).toBe(true);
    let said = await T.play(s, ['~400', '?Wait › Until dark', 'Ask Teshen to read the sealed door', '^To the sealed room']);
    expect(T.knows(s, 'mountain_name')).toBe(true);
    expect(T.knows(s, 'method_known')).toBe(true);
    said = await T.play(s, ['^To the archive', '^To the hall of the Charge', '^To the terraces', '^To the rim and', 'Say the mountain\'s name']);
    expect(said).toContain('It does not sink. It drops.');
    expect(T.is(s, 'crashed', 'hightown')).toBe(true);
    expect(said).toContain('The mountain came down where it happened to be');
  }, 300000);

  it('climbs the Chain to the links that remember, and Hask tells the number', async () => {
    const s = await T.start();
    const said = await T.play(s, ['^To the street of chimneys', '^To the Collar', '^To the north edge', '^To the gate of the Askew', '^To the farm below',
      '^To the furrow$', '^To the tail', '^To the horn', '^To the runners', '^To a Concord rest-cradle', 'Talk to Hask', 'what happened to the Chain']);
    expect(said).toContain('Two, and we all go up and never stop');
    expect(T.knows(s, 'cut_limit')).toBe(true);
  }, 300000);

  it('goes in by the Lettings\' door, takes the Commonplace\'s gift at the Root, and hears the Seam with the lights out', async () => {
    const s = await T.start();
    let said = await T.play(s, ['^To the street of chimneys', '^To the Collar', '^Into the Rope', ...Array(6).fill('Buy › A torch'), '^Out', '^To the street',
      '^To the eighth', '^To the foot of the Scarp', '^To Wendhead bridge', '^Into the Wendhead hospice', '^To the hospice archive', 'Letting prayer',
      '^To the hospice hall', 'Talk to Prioress', 'where the road under the water begins', '^Take$', 'Take your leave', '^Into the hospice cellars|^To the hospice cellar',
      '?a torch: Light', 'Unlock the oak door', '^To the bright galleries']);
    expect(said).toContain('They are blank');
    said = await T.play(s, ['?a torch: Light', '^To the Root', '?a torch: Light', 'Lay your hands on the wet wall']);
    expect(said).toContain('Stars are falling in the north-east, nine of them');
    expect(T.knows(s, 'root_gift')).toBe(true);
    said = await T.play(s, ['?a torch: Light', '^To the Fork', '?a torch: Light', '^To the third way-mark', '?a torch: Light', '^To the left-hand passage']);
    expect(said).toContain('a cup of calcite');
    // With every light out, the grey shore, and a Stray saying its syllable.
    said = await T.play(s, ['Put out every light']);
    expect(T.knows(s, 'seam_syllable')).toBe(true);
    expect(said).toContain('There is a shore instead, grey');
  }, 300000);

  it('reads the Socket chart against Hightown\'s underside through Wenna\'s lens', async () => {
    const s = await T.start();
    await T.play(s, [...toWendmouth, '^To the valley road', '^Into the Coyle', 'Talk to Bram', 'drawer', 'loan', '^Take$', 'Take your leave', '^Out',
      '^To Wendhead bridge', '^To the foot', '^To the eighth', '^To the street', '^To the Collar', '^To the north edge', '^To the gate of the Askew',
      '^To the farm below', '^To the furrow$', '^To the tail', '^To the horn', '^To the south shore', 'Talk to Wil', 'what she is measuring',
      'Take your leave', '^To the Lusk survey', '^Take$']);
    expect(T.knows(s, 'chart_seen')).toBe(true);
    const said = await T.play(s, ['^To the south shore', '^To the horn']);
    expect(said).toContain('the same broken rib on the eastern side');
    expect(T.knows(s, 'origin_known')).toBe(true);
  }, 300000);

  it('feeds the Old Silver at the neck of the sump, and a Keld opens a cell of the Quiet Gaol by touch', async () => {
    const s = await T.start();
    await T.play(s, [...fetchTeshen, '^Out to the sinkhole green', '^To the Keld end', '^To the drove-road gate', '^To the street', '^To the Collar',
      '^Into the Rope', 'Buy › A ration', 'Buy › A ration', '^Out', '^To the rim', '^To the third Forge', '?a torch: Light', '^To the Gaol',
      'Ask Teshen to read the lock']);
    expect(T.holds(s, 'state', 'corrow__cell_lock', 'corrow__open')).toBe(true);
    let said = await T.play(s, ['^To an inner cell', '?a torch: Light']);
    expect(said).toContain('a mage\'s robe gone stiff and red with rust');
    said = await T.play(s, ['^To the Gaol', '^To the collapsed', '^To the edge of the Glass', '^To the Diggings', '?Shutter every light', '^To the trough',
      '^To under the Breach', '?a torch: Light', '^To the Underfloor river', '?a torch: Light', '^To the neck of the sump', '?a torch: Light',
      'Throw the Old Silver']);
    expect(said).toContain('lies on the bottom of the neck like a fallen tree');
    said = await T.play(s, ['^To the head of the low road', '?a torch: Light']);
    expect(T.holds(s, 'at', 'party', 'corrow__road_head')).toBe(true);
  }, 300000);

  it('stands on the rim over the Socket with the engineers\' words, and three hundred people go down the steps one by one', async () => {
    const s = await T.start();
    await T.play(s, [...fetchTeshen, ...keldToDrag, 'Pay Jory', 'Ask Teshen to read the chain', '^To the farm below', '^To the furrow$', '^To the tail',
      '^To the horn', '^To the hoist-feet', 'Talk to Lene', 'Pay Lene', 'Take your leave', '^To the hoist-house', '^To the rim and']);
    // Wait on the rim for the lake to come under the mountain.
    let said = '';
    while (!T.is(s, 'gathering', 'grounders') && T.watch(s) < 4000) { said += await T.play(s, ['~' + (T.watch(s) + 60)]); }
    expect(said).toContain('The Grounders are going up to the rim');
    said = await T.play(s, ['Stand up beside Aron']);
    expect(said).toContain('he tears up his speech');
    said = await T.play(s, ['~4040']);
    expect(T.is(s, 'crashed', 'hightown')).toBe(false);
    expect(T.is(s, 'roster', 'aron')).toBe(true);
    expect(said).toContain('hanging over the Socket with its shadow on the water');
  }, 300000);
});

const intoTheGrey = ['?a torch: Light', '^(To|Through to) the grey shore', '^To the drifts', '^To the lanes of Keld Hollow'];
const toTheGathering = ['^To the untitled library', '^To the mountain.s place', '^To the gathering'];

describe('Act II, the Grey Country', () => {
  it('crosses on the anchors\' voices, gives the Unsaid the empty house in Keld Hollow, and comes home with the mountain\'s place', async () => {
    const s = await T.act(2);
    let said = await T.play(s, [...intoTheGrey]);
    expect(said).toContain('voices are saying your names');
    said = await T.play(s, ['^To the reeve.s house']);
    expect(said).toContain('The hearth is cold for the first time in two hundred years');
    said = await T.play(s, ['^To the lanes', '^To the untitled library', 'Read an untitled plate', '^To the mountain.s place', '^Take$', '^To the gathering',
      'Talk to the Unsaid', 'what it wants']);
    expect(said).toContain('I AM THE SAYING WITHOUT THE THING');
    expect(T.knows(s, 'way_home_rite')).toBe(true);
    said = await T.play(s, ['Ask Teshen to give the Unsaid']);
    expect(said).toContain('your place is the reeve\'s house in the Hollow');
    expect(T.is(s, 'unsaidHoused', 'margin')).toBe(true);
    expect(T.knows(s, 'road_fragments')).toBe(true);
    await T.play(s, ['^To the mountain.s place', '^To the untitled library', '^To the lanes', '^To the drifts', '^(To|Through to) the grey shore', '^Through to the Seam']);
    expect(T.holds(s, 'at', 'party', 'corrow__seam')).toBe(true);
    expect(T.holds(s, 'carries', 'party', 'corrow__absence')).toBe(true);
  }, 300000);

  it('tears the forgotten things off the Unsaid, and everything it took goes home at once, Hightown\'s place with it', async () => {
    const s = await T.act(2);
    const said = await T.play(s, [...intoTheGrey, ...toTheGathering, 'Tear the forgotten things']);
    expect(T.is(s, 'unsaidSlain', 'margin')).toBe(true);
    expect(said).toContain('every Counterweight on Hightown stops what they are doing');
    expect(T.is(s, 'crashed', 'hightown')).toBe(true);
  }, 300000);

  it('tells the Unsaid where its body went, and it goes', async () => {
    const s = await T.act(2);
    const said = await T.play(s, [...intoTheGrey, ...toTheGathering, 'Tell the Unsaid where its body went']);
    expect(said).toContain('after its body');
    expect(T.is(s, 'unsaidSent', 'margin')).toBe(true);
  }, 300000);

  it('stays too long, and the voices stop', async () => {
    const s = await T.act(2);
    const said = await T.play(s, [...intoTheGrey, '~' + (T.watch(s) + 720)]);
    expect(said).toContain('Nobody takes it up');
    expect(T.is(s, 'stranded', 'party')).toBe(true);
    expect(T.choices(s).some(c => /the Seam/.test(c.label))).toBe(false);
  }, 300000);

  it('lets Teshen stay in the grey, a stranger at last', async () => {
    const s = await T.act(2);
    const said = await T.play(s, [...intoTheGrey, 'Let Teshen stay']);
    expect(said).toContain('Nobody\'s looking at me');
    expect(T.holds(s, 'travelsWith', 'corrow__teshen', 'party')).toBe(false);
  }, 300000);
});

describe('Act III, the Kin Fall', () => {
  it('gathers three hundred who can forget, and holds the Forgetting of the Way Home across the Drag', async () => {
    const s = await T.act(3);
    let said = await T.play(s, ['~5910']);
    expect(said).toContain('the slow star in the north-east breaks');
    said = await T.play(s, ['Talk to Prioress', 'for her sisters', 'Take your leave', '^Out', '^To the Grey Mile', 'Talk to Ferran', 'for the Open Hand',
      'Take your leave', '^To Wendhead bridge', '^To the foot', '^To the eighth', '^To the street', '^To the Collar', '^To the north edge',
      '^To the gate of the Askew', '^To the farm below', '^To the furrow$', '^To the tail', '^To the horn', '^To the hoist-feet', 'Talk to Lene',
      'bring Hornwake', 'Take your leave', '^To the hoist-house', '^To the rim and', '^To the terraces', '^To the Unasked', 'Talk to Speaker',
      'bring the Unaskers']);
    expect(said).toContain('The doctrine was always correct');
    expect(T.measureOf(s, 'riteMinds', 'corrow')).toBe(420);
    said = await T.play(s, ['Take your leave', '^To the terraces', '^To the rim and', '^To the hoist-house', '^To the hoist-feet', '^To the horn', '^To the tail', '^To the furrow$',
      '^To the farm below', '^To the gate of the Askew', 'pay with the names of the dead']);
    expect(said).toContain('the pages are blank');
    expect(T.is(s, 'kinLost', 'corrow')).toBe(true);
    said = await T.play(s, ['~' + (T.watch(s) + 600)]);
    expect(said).not.toContain('They know where she went');
    expect(T.is(s, 'hornwakeFled', 'corrow')).toBe(false);
  }, 300000);

  it('breaks Wenna\'s band with Drevka\'s hammer before the Unfolded reach the Seam, and they lose the way there', async () => {
    const s = await T.act(3);
    await T.play(s, ['^Out', '^To the foot', '^To the eighth', ...toKeld, '^Into Bede', 'Talk to Bede', 'Ask Bede Orrisk for the loan', '^Take$',
      'Take your leave', '^Out', '^To the Keld end', '^To the drove-road gate', '^To the street', '^To the Collar', '^Into the Rope',
      ...Array(6).fill('Buy › A torch'), '^Out', '^To the rim', '^To the edge of the Glass', '^To the Diggings', '?Shutter every light', '^To the trough',
      '^To under the Breach', '?a torch: Light', '^To Lamplighter', 'journals', '^To the head of the low road', '?a torch: Light',
      '^To the first way-mark', '?a torch: Light', '^To the left-hand passage', '?a torch: Light', '^To the right-hand passage', '?a torch: Light',
      '^To the third way-mark', '?a torch: Light', '^To the (left-hand passage|Seam)', '?a torch: Light']);
    expect(T.holds(s, 'at', 'party', 'corrow__seam')).toBe(true);
    let said = await T.play(s, ['Break Wenna']);
    expect(said).toContain('nothing in Imbar can read it now but the horn');
    said = await T.play(s, ['^To the third way-mark', '^To the Fork', '^To the second way-mark', '^To the first way-mark', '^To the head', '^To Lamplighter',
      '^To under the Breach', '^To the Underfloor river', '?a torch: Light', '~8400']);
    expect(said).toContain('as if they could not think where to go next');
    expect(T.is(s, 'bandRead', 'corrow')).toBe(false);
  }, 300000);
});

describe('Act IV, Under Way', () => {
  it('cuts a needle from the horn, casts Hightown off its Chain, steers it by memory up the burnt road, and passes the Gate as one', async () => {
    const s = await T.act(4);
    let said = await T.play(s, ['^Take$', 'Cut a needle', '^Take$']);
    expect(said).toContain('pointing north-north-east and up');
    expect(T.holds(s, 'carries', 'party', 'corrow__needle')).toBe(true);
    said = await T.play(s, ['^To the hoist-feet', '^To the hoist-house', '^To the rim and', '^To the cradle gallery', '^To the cable-cradles', 'Strike out the pin']);
    expect(said).toContain('the Chain goes');
    expect(T.is(s, 'underWay', 'hightown')).toBe(true);
    said = await T.play(s, ['^To the rim and', '^To the terraces', '^To the hall of the Charge', ...Array(2).fill('let one of them forget'), '=' + (T.watch(s) + 60)]);
    expect(said).toContain('Hightown goes over the Teskarn');
    said = await T.play(s, [...Array(3).fill('let one of them forget'), '=' + (T.watch(s) + 60)]);
    expect(said).toContain('a sea of it');
    said = await T.play(s, [...Array(2).fill('let one of them forget'), '=' + (T.watch(s) + 60)]);
    expect(said).toContain('the road the star came down');
    said = await T.play(s, [...Array(6).fill('let one of them forget'), '=' + (T.watch(s) + 90)]);
    expect(said).toContain('a door');
    said = await T.play(s, ['^To the terraces', '^To the rim and', '^To the Gate of Being', 'Talk to an Arbiter', 'open the door', 'never none, never two']);
    expect(said).toContain('Make it one');
    said = await T.play(s, ['Take your leave', 'take the road out of all of you but one', 'Talk to an Arbiter', 'never none, never two']);
    expect(said).toContain('One of you knows the way. One. Go through.');
    expect(T.is(s, 'gateOpen', 'hightown')).toBe(true);
  }, 300000);
});

describe('Act V, the Road the Star Came Down', () => {
  const toWenna = ['^Take$', '^Take$', '^Take$', '^Through to the far side|^To the far side', '^To the burnt road', '^To the Nail', '^To where the road stops'];
  it('gives Wenna her lens and her name, takes the charge as one, and brings the mountain home to its own place', async () => {
    const s = await T.act(5);
    let said = await T.play(s, toWenna.slice(0, 6));
    expect(said).toContain('It has no name to see you with');
    said = await T.play(s, [toWenna[6]!, 'Talk to the old woman', 'who she is']);
    expect(said).toContain('My name was the last thing');
    said = await T.play(s, ['Put Wenna.s lens']);
    expect(said).toContain('Somebody followed');
    said = await T.play(s, ['why she came this way', 'Take your leave', 'Take the charge from Wenna']);
    expect(said).toContain('It will fall as slowly as it fell for two thousand years');
    expect(said).toContain('settles into the Socket like a stone into its own print');
    expect(T.is(s, 'endedOne', 'beyond')).toBe(true);
  }, 300000);

  it('gives the Hush to the thing that follows', async () => {
    const s = await T.act(5);
    const said = await T.play(s, [...toWenna, 'Take the Hush from Wenna']);
    expect(said).toContain('eight new stars');
    expect(T.is(s, 'endedGiven', 'beyond')).toBe(true);
  }, 300000);

  it('lets the road go out of every mind, and the Margin comes undone', async () => {
    const s = await T.act(5);
    const said = await T.play(s, [...toWenna, 'Let the road go out of the last of you']);
    expect(said).toContain('everything forgotten there is home at once');
    expect(T.is(s, 'endedNone', 'beyond')).toBe(true);
  }, 300000);
});

describe('The Road the Star Came Down, in one run', () => {
  it('plays from the cart on the Scarp road to the end of the road beyond the gates of being', async () => {
    const s = await T.start();
    const { steps } = JSON.parse(readFileSync('test/fixtures/corrow/grand-journey.json', 'utf8')) as { steps: string[] };
    const said = await T.play(s, steps);
    // Act I
    expect(T.is(s, 'roster', 'aron')).toBe(true);
    expect(T.is(s, 'webbNamed', 'webb')).toBe(true);
    expect(T.is(s, 'crashed', 'hightown')).toBe(false);
    // Act II
    expect(T.is(s, 'unsaidHoused', 'margin')).toBe(true);
    expect(T.is(s, 'unsaidCrossed', 'margin')).toBe(false);
    // Act III
    expect(said).toContain('the slow star in the north-east breaks');
    expect(T.is(s, 'kinLost', 'corrow')).toBe(true);
    // Act IV
    expect(said).toContain('the road the star came down');
    expect(T.is(s, 'gateOpen', 'hightown')).toBe(true);
    // Act V
    expect(said).toContain('Somebody followed');
    expect(said).toContain('settles into the Socket like a stone into its own print');
    expect(T.is(s, 'endedOne', 'beyond')).toBe(true);
  }, 600000);
});
