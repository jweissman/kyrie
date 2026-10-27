import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { KyrLint } from '../src/cli/kyr-lint';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { WorldAssembler } from '../src/world/world-assembler';
import { Frontier } from '../src/world/frontier';
import { GeneratedWorld } from './support/generated';

// Gosse's Company (doc/adventures/gosses-company): each journey plays by the labels a player sees, from the steps in
// test/fixtures/gosse, and checks what the world did. The city campaign starts at the Westgate road at eight in the
// morning on watch 0; Gosse's night is the fourth evening, from watch 492, and the Bench reads its verdict at 588.
const city = 'test/fixtures/gosse/city.campaign.json';
const build = (name: string) => `test/fixtures/gosse/${name}.campaign.json`;
const steps = (name: string): string[] => {
  const phases = JSON.parse(readFileSync(`test/fixtures/gosse/${name}.json`, 'utf8')) as Record<string, string[]> | string[];
  return Array.isArray(phases) ? phases : Object.values(phases).flat();
};
const phase = (name: string, key: string): string[] =>
  (JSON.parse(readFileSync(`test/fixtures/gosse/${name}.json`, 'utf8')) as Record<string, string[]>)[key]!;
const p = (id: string) => `pentrice__${id}`;
class Gosse {
  static async start(campaign = city, seed = 'g1') { return new Gosse(await Journey.start(campaign, seed)); }
  constructor(readonly j: Journey) {}
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
  async fixture(name: string) { return this.play(...steps(name)); }
  holds(name: string, ...args: string[]) { return this.j.holds(p(name), ...args.map(a => a === 'party' ? a : p(a))); }
  state(thing: string, value: string) { return this.j.holds('state', p(thing), p(value)); }
  knows(fact: string) { return this.j.holds('knows', 'party', p(fact)); }
  measure(name: string, ...args: string[]) { return this.j.measure(p(name), ...args.map(p)); }
  regard(who: string) { return this.measure('regard', who); }
  voters() { return ['clay', 'gammage', 'mallory', 'callow'].filter(b => this.holds('votedFor', b)); }
  ending() { return this.j.campaign.world.related('reached').map(r => r.args[0]); }
  at(who: string) { return this.j.campaign.world.one('at', p(who)); }
  get page() { return this.j.taken.map(x => `[${x.label}] ${x.page} ${x.told}`).join('\n'); }
}

describe("Gosse's Company", () => {
  it('lints clean as a recommended campaign, from Wending Cross over the march', async () => {
    const findings = await KyrLint.campaign('data/campaigns/gosses-company.campaign.json', new NodeBundleSource());
    expect(findings.filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('left alone: Dorcas goes to the wardrobe, Swale plays a Ghost he does not understand, the play falls flat, and the company breaks', async () => {
    const g = await Gosse.start();
    await g.fixture('alone');
    // Nobody told Swale what his lines mean, so he does not walk out; he plays them, and leaves after.
    expect(g.holds('swaleGone', 'swale')).toBe(false);
    expect(g.holds('dorcasGone', 'dorcas')).toBe(true);
    expect(g.page).toMatch(/carrying a spear in the Siege of Arle/);
    expect(g.measure('votes', 'pentrice')).toBe(0);
    expect(g.measure('temper', 'pentrice')).toBeLessThan(7);
    expect(g.ending()).toEqual([p('broken')]);
    // Nobody paid the Office's fines: Gosse goes to the Clink, and the crier counts no voices.
    expect(g.page).toMatch(/goes to the Clink of the Soke at noon/);
    expect(g.page).toMatch(/Not one of the four voices was Gosse.s/);
    expect(g.page).not.toMatch(/played whole at the Wheel all that summer/);
  }, 120000);

  it('the Book: a bard licenses the Ghost through the Office, and a licensed play wins Clay, Gammage and the Canon', async () => {
    const g = await Gosse.start();
    await g.fixture('book');
    expect(g.state('book', 'copy_licensed')).toBe(true);
    expect(g.holds('ghostRestored', 'pentrice')).toBe(true);
    expect(g.holds('reconciled', 'swale')).toBe(true);
    expect(g.holds('plays', 'dorcas', 'part_widow')).toBe(true);
    expect(g.knows('author_known')).toBe(true);
    expect(g.voters()).toEqual(['clay', 'gammage', 'mallory']);
    // A licensed book is fined only for what was said that was not in it.
    expect(g.measure('fines', 'pentrice')).toBeLessThanOrEqual(2);
    expect(g.ending()).toEqual([p('patent')]);
    expect(g.page).toMatch(/as the Office licensed it, with the Tallyman struck out/);
    expect(g.page).toMatch(/GIVES THE PATENT OF THE WHEEL TO GOSSE.S COMPANY/);
  }, 240000);

  it('the Liberty: a soldier who signed on at Wending Cross plays the Ghost whole in the Soke, and Callow votes for it', async () => {
    const g = await Gosse.start(build('warrior'), 'w1');
    await g.fixture('liberty');
    expect(g.knows('players__joined') || g.j.holds('knows', 'party', 'players__joined')).toBe(true);
    expect(g.holds('libertyChosen', 'pentrice')).toBe(true);
    expect(g.state('book', 'copy_fair')).toBe(true);
    expect(g.voters()).toEqual(['clay', 'gammage', 'callow']);
    // The whole play is fined line by line, and the house pays.
    expect(g.measure('fines', 'pentrice')).toBeGreaterThan(15);
    expect(g.ending()).toEqual([p('patent')]);
    expect(g.page).toMatch(/played whole at the Wheel all that summer/);
  }, 240000);

  it("the Author's Bow: the Master of Plain Speech comes up on the stage, and the tallymen break their sticks", async () => {
    const g = await Gosse.start();
    await g.fixture('bow');
    expect(g.holds('clemBowed', 'clemency')).toBe(true);
    expect(g.measure('fines', 'pentrice')).toBe(0);
    expect(g.measure('votes', 'pentrice')).toBe(4);
    expect(g.ending()).toEqual([p('bow')]);
    expect(g.page).toMatch(/Gentles: the author/);
  }, 240000);

  it('the Patent Refused: whoever knocked the wedge from under the Siege, Gosse gives the house back', async () => {
    const g = await Gosse.start();
    await g.fixture('refused');
    expect(g.holds('siegeFell', 'fallow')).toBe(true);
    expect(g.holds('gosseAshamed', 'gosse')).toBe(true);
    expect(g.measure('votes', 'pentrice')).toBeGreaterThanOrEqual(3);
    expect(g.holds('patentWon', 'pentrice')).toBe(false);
    expect(g.ending()).toEqual([p('refused')]);
    expect(g.page).toMatch(/Jem saw you/);
  }, 240000);

  it('the Road Again: a licensed play, half rehearsed, is well liked and nothing more', async () => {
    const g = await Gosse.start();
    await g.fixture('road');
    expect(g.state('book', 'copy_licensed')).toBe(true);
    expect(g.measure('votes', 'pentrice')).toBeLessThan(3);
    expect(g.measure('temper', 'pentrice')).toBeGreaterThanOrEqual(7);
    expect(g.ending()).toEqual([p('road')]);
  }, 240000);

  it('the Pension: told to take Fallow\'s offer, Gosse signs, and the Trial goes on without him', async () => {
    const g = await Gosse.start();
    await g.fixture('pension');
    expect(g.holds('pensionTaken', 'gosse')).toBe(true);
    expect(g.j.offers('Rehearse the first act')).toBe(false);
    await g.play('=594');
    expect(g.holds('crossed', 'pentrice')).toBe(false);
    expect(g.ending()).toEqual([p('pension')]);
  }, 240000);

  it('the Fair Copy Burned: the pirate quarto goes to Fallow, the Office seizes the book, and Galt is played instead', async () => {
    const g = await Gosse.start();
    await g.fixture('burned');
    expect(g.holds('quartoPrinted', 'pentrice')).toBe(true);
    expect(g.state('book', 'copy_burned')).toBe(true);
    expect(g.holds('galtPlay', 'pentrice')).toBe(true);
    expect(g.holds('ghostPlay', 'pentrice')).toBe(false);
    expect(g.ending()).toEqual([p('burned')]);
  }, 240000);
});

describe("Gosse's Company: the stranger on the grey bench", () => {
  it('a stranger signs on as a tallyman, lets the angel off, and lays the stick down on the night', async () => {
    const g = await Gosse.start();
    await g.fixture('tallyman');
    expect(g.holds('inCompany', 'party')).toBe(false);
    expect(g.holds('tallyLet', 'party')).toBe(true);
    expect(g.holds('stickStill', 'party')).toBe(true);
    // Eight notches the Office does not have, whatever was cut after.
    expect(g.measure('spared', 'pentrice')).toBe(8);
    expect(g.page).toMatch(/Bum/);
    expect(g.page).toMatch(/takes your stick, quite gently/);
    // Nobody helped the company, and it breaks.
    expect(g.ending()).toEqual([p('broken')]);
  }, 240000);

  it('no choice is hidden by a critic thinking less of the company: only coin and honey are spent by a choice', async () => {
    const j = await Journey.start(city, 'g1');
    const spends = j.campaign.module.actions.filter(a => a.id.startsWith('pentrice__')).flatMap(a => [...a.success, ...a.failure ?? []])
      .filter(e => e.kind === 'decrease').map(e => (e as { call: { name: string; args: string[] } }).call);
    expect(spends.every(c => c.name === 'quantity')).toBe(true);
  }, 60000);
});

describe("Gosse's Company: the small stories of the week", () => {
  it('Patience gets loose in the Gullet, is fetched home with honey, and Pudding is not the one who led her', async () => {
    const g = await Gosse.start(build('warrior'), 'w1');
    await g.play(...phase('liberty', 'green'), ...phase('liberty', 'road'), ...phase('liberty', 'bear').slice(0, 2));
    expect(g.holds('bearLoose', 'the_bear')).toBe(true);
    await g.play(...phase('liberty', 'bear').slice(2));
    expect(g.holds('bearHome', 'the_bear')).toBe(true);
  }, 240000);

  it("the siege-tower's wedge: mended, Fallow is in the company's debt and does not hire the heckler", async () => {
    const g = await Gosse.start();
    await g.fixture('book');
    expect(g.holds('siegeHeld', 'fallow')).toBe(true);
    expect(g.holds('fallowGrateful', 'fallow')).toBe(true);
    expect(g.holds('garlickHired', 'garlick')).toBe(false);
    expect(g.page).toMatch(/I am in your debt, which I dislike very much/);
  }, 240000);

  it('the players on the green at Wending Cross: freed with the hat from the lime-kiln, then signed on for the road west', async () => {
    const j = await Journey.start(build('warrior'), 'g2');
    await j.play(...phase('green', 'green'));
    expect(j.holds('knows', 'party', 'players__joined')).toBe(true);
    // Lem took his four coin, and is kept on to mind the bear.
    expect(j.holds('knows', 'party', 'players__lem_kept')).toBe(true);
    await j.play(...phase('green', 'west'));
    expect(j.holds(p('inCompany'), 'party')).toBe(true);
    expect(j.holds(p('arrived'), 'party')).toBe(true);
  }, 120000);
});

describe("Gosse's Company: who plays it", () => {
  it('one of the profession is offered what a player can say to players, on the green and in the loft', async () => {
    const g = await Gosse.start(build('player'));
    expect(g.j.offers('Tell Gosse you are of the profession')).toBe(true);
    await g.play(...phase('liberty', 'green'), ...phase('liberty', 'road').slice(0, 6));
    expect(g.j.offers('Tell Dorcas, as one player to another')).toBe(true);
    await g.play('Tell Dorcas, as one player to another');
    expect(g.page).toMatch(/Dorcas/);
  }, 120000);

  it('a soldier with no charm is not offered the player\'s word, and has to do it with the old notice instead', async () => {
    const g = await Gosse.start(build('warrior'), 'w1');
    await g.play(...phase('liberty', 'green'), ...phase('liberty', 'road'));
    expect(g.j.offers('Tell Dorcas, as one player to another')).toBe(false);
    await g.play(...phase('liberty', 'bear'));
    expect(g.holds('plays', 'dorcas', 'part_widow')).toBe(true);
  }, 240000);

  it('a locksmith can pick the bear-pen, and a reader of the ordinances can find the law of the dead', async () => {
    const thief = await Gosse.start(build('thief'));
    await thief.play('To the Westgate', 'To the Chepe', 'To the Gullet', '=52');
    await thief.play('To the Water Stairs', 'To the Soke landing', 'To Soke Lane', 'bear-garden');
    expect(thief.j.offers('Pick the padlock on Patience')).toBe(true);
    const mage = await Gosse.start(build('scholar'));
    await mage.play(...phase('book', 'arrive'), ...phase('book', 'book').slice(0, 1), 'Out to the yard', 'Out to the Westgate', 'To the Chepe',
      'To Guildhall Square', '=36', 'Office', 'Give Tunstall the fair copy');
    expect(mage.j.find('Search the chained Ordinances')?.label).toMatch(/likely|even chance|almost certain/);
  }, 240000);
});

describe("Gosse's Company: saving, replaying, and the world it lies in", () => {
  it('kept mid-week and opened again, the world goes on to the same end as one never kept', async () => {
    const whole = await Gosse.start(city, 'g1');
    const all = steps('book');
    await whole.play(...all);
    const split = await Gosse.start(city, 'g1'), at = all.indexOf(phase('book', 'day3')[0]!, all.indexOf(phase('book', 'home2')[0]!));
    await split.play(...all.slice(0, at));
    const back = PlaySession.resume(JSON.parse(JSON.stringify(split.j.session.checkpoint())));
    const resumed = new Gosse(Journey.of(back));
    await resumed.play(...all.slice(at));
    expect(resumed.ending()).toEqual(whole.ending());
    expect(resumed.j.campaign.state.elapsed).toBe(whole.j.campaign.state.elapsed);
    expect(resumed.voters()).toEqual(whole.voters());
  }, 300000);

  it('played twice from the same seed, the same steps make the same history', async () => {
    const a = await Gosse.start(city, 'twice'), b = await Gosse.start(city, 'twice');
    const some = steps('book').slice(0, 80);
    await a.play(...some); await b.play(...some);
    expect(a.j.campaign.state.elapsed).toBe(b.j.campaign.state.elapsed);
    expect(a.j.taken.map(x => x.told)).toEqual(b.j.taken.map(x => x.told));
  }, 240000);

  it('a generated forest country holds the vale of the Arle beyond its west march, the players stuck on a green on the road there, and the road in', async () => {
    const w = await WorldAssembler.assemble('gosse', NodeBundleSource.shared, { region: { terrain: 'forest' } });
    expect(w.report.region.beyond!.west!.name).toBe('the vale of the Arle');
    // The herald: the players are on the green of the town the west road leaves from, and the inns have heard.
    const herald = w.report.placements.find(pl => pl.scenario === 'players')!;
    expect(herald).toBeDefined();
    const s = await PlaySession.start(w.path, 'gosse', w.source);
    expect(s.campaign.installations.some(m => m.id === 'players')).toBe(true);
    const green = s.campaign.world.one('at', 'players__gosse')!;
    GeneratedWorld.put(s, green.replace(/^region__/, ''));
    const j = Journey.of(s);
    expect(await j.play('Ask Gosse what has happened')).toMatch(/chain/i);
    // The innkeeper tells of the country to the west.
    const told = s.campaign.module.actions.find(a => a.id.startsWith('region__edge_west_beyond_told_'))!;
    GeneratedWorld.put(s, s.campaign.world.one('at', told.speaker!)!.replace(/^region__/, ''));
    expect(await j.play('about the Midsummer Trial at Pentrice')).toMatch(/Trial|Pentrice|players/);
    await GeneratedWorld.travel(s, 'edge_west');
    const drawn = await new Frontier('gosse', NodeBundleSource.shared).expand(s.campaign);
    expect(s.campaign.installations.find(m => m.id === drawn!.rid)?.chapter).toBe(true);
    await j.play('West Road above Pentrice');
    expect(s.campaign.world.one('at', 'party')).toBe(`${drawn!.rid}__road_end`);
    expect(await j.play('To the Westgate')).toMatch(/Westgate/);
  }, 240000);
});

describe("Gosse's Company: what the page shows", () => {
  it('the night is offered as it happens, and what is said in a scene is shown only while the scene is on', async () => {
    const g = await Gosse.start();
    const all = steps('book');
    await g.play(...all.slice(0, all.indexOf('Take your place in the right-hand wing') + 1));
    const scene = () => PlayerView.observe(g.j.campaign).observations.map(o => o.text).join(' ');
    expect(scene()).not.toMatch(/Bell Gudgeon/);
    expect(g.holds('stand', 'party', 'post_wing') || g.holds('inWing', 'party')).toBe(true);
  }, 240000);
});
