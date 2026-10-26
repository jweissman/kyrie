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

// The Third Night (doc/adventures/the-third-night): each journey plays by the labels a player sees, from the steps in
// test/fixtures/wrayford, and checks what the world did. The homecoming starts at eight in the morning on watch 0.
// Its days turn at dawn: the first night's small hours are watches 102-120, the Remonstrance sits 168-180 on the
// second day, Kit's fire is at 240, the captain comes at 354, Maudie goes at 396 and the verdict is at 438.
const home = 'data/campaigns/the-third-night.campaign.json';
const build = (name: string) => `test/fixtures/wrayford/${name}.campaign.json`;
const fixture = (name: string): Record<string, string[]> =>
  JSON.parse(readFileSync(`test/fixtures/wrayford/${name}.json`, 'utf8')) as Record<string, string[]>;
const steps = (name: string, ...phases: string[]): string[] => {
  const f = fixture(name);
  return (phases.length ? phases : Object.keys(f)).flatMap(p => f[p]!);
};
const shared = new Set(['party', 'state', 'at', 'knows', 'travelsWith', 'following', 'asleep', 'captured', 'reached', 'kin']);
const w = (id: string) => shared.has(id) ? id : `wrayford__${id}`;
export class Wrayford {
  static async start(campaign = home, seed = 'wray') { return new Wrayford(await Journey.start(campaign, seed)); }
  constructor(readonly j: Journey) {}
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
  async fixture(name: string, ...phases: string[]) { return this.play(...steps(name, ...phases)); }
  holds(name: string, ...args: string[]) { return this.j.holds(w(name), ...args.map(w)); }
  knows(fact: string) { return this.j.holds('knows', 'party', w(fact)); }
  measure(name: string, ...args: string[]) { return this.j.measure(w(name), ...args.map(w)); }
  ending() { return this.j.campaign.world.related('reached').map(r => r.args[0]); }
  at(who: string) { return this.j.campaign.world.one('at', w(who)); }
  get page() { return this.j.taken.map(x => `[${x.label}] ${x.page} ${x.told}`).join('\n'); }
  get running() { return this.j.campaign.running; }
  experience() { return this.j.campaign.fighters.map(m => m.experience).reduce((a, b) => a + b, 0); }
  // Plays to the watch, or as far as the book goes: an ending closes it at the verdict.
  async until(watch: number) {
    try { await this.play(`=${watch}`); } catch (e) { if (this.running) { throw e; } }
    return this;
  }
}

describe('The Third Night', () => {
  it('lints clean, played alone and placed in a world', async () => {
    for (const c of [home, build('traveller'), build('continuing')]) {
      const findings = await KyrLint.campaign(c, new NodeBundleSource());
      expect(findings.filter(f => f.level === 'error')).toEqual([]);
    }
  }, 120000);

  it('left alone in the city: Kit is taken at the counting-house, Maudie goes on the third night and is hanged', async () => {
    const g = await Wrayford.start();
    await g.fixture('alone', 'in');
    await g.until(260);
    expect(g.holds('fireTried', 'wray')).toBe(true);
    expect(g.holds('kitTaken', 'kit')).toBe(true);
    expect(g.at('kit')).toBe(w('guild_cellar'));
    await g.until(400);
    expect(g.holds('maudieGone', 'maudie')).toBe(true);
    await g.until(440);
    expect(g.holds('maudieTaken', 'maudie')).toBe(true);
    expect(g.holds('maudieHanged', 'maudie')).toBe(true);
    expect(g.holds('kitHanged', 'kit')).toBe(true);
    expect(g.ending()).toEqual([w('third_night')]);
    expect(g.running).toBe(false);
    expect(g.page).toMatch(/the captain[’']s riders took her at the gate-ward[’']s door/);
  }, 240000);

  it('never coming into the city: the news reaches you later, from a drover in another country', async () => {
    const g = await Wrayford.start();
    await g.until(440);
    expect(g.ending()).toEqual([w('away')]);
  }, 240000);

  it('by night, alone: up the pier face with a rope, the three lowered to the bank, carried over the ford, buried', async () => {
    const g = await Wrayford.start();
    await g.fixture('night-ford', 'day1', 'night1');
    expect(g.holds('seenAtRail', 'party')).toBe(false);
    expect(g.holds('state', 'rail', 'cut')).toBe(true);
    expect(g.at('wat_dead')).toBe(w('wades_acre'));
    await g.fixture('night-ford', 'dawn');
    expect(g.holds('buriedByNight', 'wray')).toBe(true);
    // Somebody must answer for it at dawn: the reeve takes Kit, Wat's son.
    expect(g.holds('kitBlamed', 'kit')).toBe(true);
    await g.until(440);
    expect(g.ending()).toEqual([w('earth')]);
    expect(g.page).toMatch(/gains 600 experience: saw the three buried/);
  }, 240000);

  it('by night, and taking Kit\'s place: the reeve lets him go and the company is put out of the lord\'s country', async () => {
    const g = await Wrayford.start();
    await g.fixture('night-ford', 'day1', 'night1', 'dawn');
    await g.until(160);
    await g.play('Into Saint Wade', 'To Overbridge Street', 'To Bridge Street', 'To the Bridge End', 'To the Market Cross',
      'Into the Guildhall', 'not Kit');
    expect(g.holds('kitTaken', 'kit')).toBe(false);
    expect(g.at('party')).toBe(w('guild_cellar'));
    await g.until(440);
    expect(g.ending()).toEqual([w('earth')]);
    expect(g.holds('kitHanged', 'kit')).toBe(false);
    expect(g.holds('banished', 'party')).toBe(true);
  }, 240000);

  it('by day, the two mothers: ice, an hour sat by the bed, Kit\'s own telling, and the city behind them', async () => {
    const g = await Wrayford.start();
    await g.fixture('mothers', 'home', 'ice', 'jennet', 'evidence', 'print', 'kit', 'tell');
    expect(g.measure('jennetTrust', 'jennet')).toBeGreaterThanOrEqual(3);
    expect(g.holds('mothersMet', 'wray')).toBe(true);
    expect(g.measure('temper', 'wray')).toBeGreaterThanOrEqual(2);
    await g.fixture('mothers', 'walk');
    expect(g.holds('mothersWalked', 'wray')).toBe(true);
    expect(g.holds('buried', 'wat_dead')).toBe(true);
    expect(g.holds('nedBuried', 'jennet')).toBe(true);
    await g.until(440);
    expect(g.ending()).toEqual([w('mothers')]);
    expect(g.page).toMatch(/Let them be/);
  }, 240000);

  it('by day, the Liberty\'s charity: the Bench\'s clause, the Abbess\'s claim and the tithe ruled at the chain', async () => {
    const g = await Wrayford.start(build('bard'));
    await g.fixture('charity', 'day1', 'court', 'chain', 'bench');
    await g.until(440);
    expect(g.holds('clauseCharity', 'wray')).toBe(true);
    expect(g.holds('abbessClaims', 'abbess')).toBe(true);
    expect(g.holds('ruling', 'ruled_tithe')).toBe(true);
    expect(g.holds('lawfulRelease', 'wray')).toBe(true);
    expect(g.holds('buriedLawfully', 'wray')).toBe(true);
    expect(g.ending()).toEqual([w('charity')]);
  }, 240000);
});

describe('The Third Night: the other roads to the verdict', () => {
  it('the reeve\'s release, for a warrior: Gault tells a soldier who wrote the letter, Hal tells his father, Hulme cuts them down', async () => {
    const g = await Wrayford.start(build('warrior'));
    await g.fixture('reeve', 'day1', 'evening');
    expect(g.knows('letter_read')).toBe(true);
    expect(g.knows('hand_match')).toBe(true);
    expect(g.holds('halToldFather', 'hal')).toBe(true);
    await g.until(440);
    expect(g.holds('reeveRelease', 'wray')).toBe(true);
    expect(g.holds('maudieGone', 'maudie')).toBe(false);
    expect(g.ending()).toEqual([w('reeve')]);
  }, 240000);

  it('too late: the same reeve, moved only on the third evening, comes down the Cartway a quarter of an hour behind Maudie', async () => {
    const g = await Wrayford.start(build('warrior'));
    await g.fixture('too-late', 'day1', 'evening', 'day2');
    // The Bench's clause hardens him; putting it to him that it has made him its bailiff softens him again.
    expect(g.holds('clauseHardened', 'wray')).toBe(true);
    expect(g.measure('hulmeMoved', 'hulme')).toBe(1);
    await g.fixture('too-late', 'third');
    expect(g.measure('hulmeMoved', 'hulme')).toBe(3);
    await g.until(440);
    expect(g.holds('reeveRelease', 'wray')).toBe(false);
    expect(g.holds('tooLate', 'wray')).toBe(true);
    expect(g.ending()).toEqual([w('too_late')]);
  }, 240000);

  it('the Company\'s bargain: forty crowns for the brother who drove, and the dead given back at the captain\'s supper', async () => {
    const g = await Wrayford.start();
    await g.fixture('bargain', 'home', 'evidence', 'kit', 'sell');
    expect(g.holds('kitSold', 'kit')).toBe(true);
    expect(g.at('kit')).toBe(w('guild_cellar'));
    expect(g.measure('kitTrust', 'kit')).toBe(0);
    await g.until(440);
    expect(g.holds('releasedBy', 'wray', 'by_captain')).toBe(true);
    expect(g.holds('maudieGone', 'maudie')).toBe(false);
    expect(g.holds('kitHanged', 'kit')).toBe(true);
    expect(g.ending()).toEqual([w('bargain')]);
  }, 240000);

  it('the lime: Maudie kept at home on the third night, and nothing else done', async () => {
    const g = await Wrayford.start();
    await g.fixture('lime', 'hold');
    await g.until(440);
    expect(g.holds('maudieHeld', 'maudie')).toBe(true);
    expect(g.holds('maudieHanged', 'maudie')).toBe(false);
    expect(g.ending()).toEqual([w('lime')]);
  }, 240000);

  it('the fire that comes anyway: Kit turned to sinking the board, but his mother taken on the third night, and the carters rise', async () => {
    const g = await Wrayford.start();
    await g.fixture('fire', 'day1');
    expect(g.holds('kitTurned', 'kit')).toBe(true);
    await g.until(260);
    expect(g.holds('boardSunk', 'wray')).toBe(true);
    expect(g.holds('kitTaken', 'kit')).toBe(false);
    await g.until(440);
    expect(g.holds('riseNight', 'wray')).toBe(true);
    expect(g.holds('kitHanged', 'kit')).toBe(true);
    expect(g.ending()).toEqual([w('fire')]);
  }, 240000);

  it('by Dorcas\'s boat, for a thief: two kind lies, a picked door, the dead lowered to the ferry and claimed by charter', async () => {
    const g = await Wrayford.start(build('thief'), 'ferry');
    await g.fixture('boat', 'day1');
    expect(g.holds('reconciled', 'wray')).toBe(true);
    expect(g.holds('boatArranged', 'party')).toBe(true);
    await g.fixture('boat', 'night1', 'dawn');
    expect(g.holds('boatCrossed', 'wray')).toBe(true);
    expect(g.holds('seenAtRail', 'party')).toBe(false);
    expect(g.holds('buriedByNight', 'wray')).toBe(true);
    await g.until(440);
    expect(g.page).toMatch(/hers by charter/);
    expect(g.ending()).toEqual([w('earth')]);
  }, 240000);

  it('a failed lie closes that door: Dorcas will not be told twice what Corbin never said', async () => {
    const g = await Wrayford.start(build('thief'), 'boat');
    await g.fixture('boat', 'day1').catch(() => g);
    expect(g.holds('reconciled', 'wray')).toBe(false);
    expect(g.holds('boatArranged', 'party')).toBe(false);
  }, 240000);

  it('joining Kit\'s fire: alone, the company is beaten in the counting-house and is in the cellar when its mother goes', async () => {
    const g = await Wrayford.start(build('warrior'));
    await g.fixture('join', 'day1', 'night2', 'fight');
    expect(g.holds('fireFought', 'wray')).toBe(true);
    expect(g.holds('countingBurned', 'wray')).toBe(false);
    expect(g.at('party')).toBe(w('guild_cellar'));
    expect(g.page).not.toMatch(/the young carters went for the Company's counting-house at midnight/);
    await g.until(440);
    expect(g.holds('banished', 'party')).toBe(true);
    expect(g.ending()).toEqual([w('third_night')]);
  }, 240000);

  it('joining Kit\'s fire with a seasoned company of strangers: Gault and his riders beaten, and the counting-house burns', async () => {
    const g = await Wrayford.start(build('seasoned'));
    await g.fixture('join', 'day1', 'night2', 'fight');
    expect(g.holds('countingBurned', 'wray')).toBe(true);
    // The day-book that proved who burned the toll-house burns with it.
    expect(g.at('daybook')).toBeUndefined();
    await g.until(440);
    expect(g.ending()).toEqual([w('fire')]);
  }, 240000);
});

describe('The Third Night: saving, replaying, and the world it lies in', () => {
  it('kept in the small hours of the first night and opened again, the world goes on to the same end', async () => {
    const all = steps('night-ford');
    const whole = await Wrayford.start(home, 'kept');
    await whole.play(...all.slice(0, -1)); await whole.until(440);
    const split = await Wrayford.start(home, 'kept'), at = all.indexOf('Lower the three on a rope from the rail to the bank under the first arch');
    await split.play(...all.slice(0, at));
    const back = Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(split.j.session.checkpoint()))));
    const resumed = new Wrayford(back);
    await resumed.play(...all.slice(at, -1)); await resumed.until(440);
    expect(resumed.ending()).toEqual(whole.ending());
    expect(resumed.j.campaign.state.elapsed).toBe(whole.j.campaign.state.elapsed);
    expect(resumed.holds('kitBlamed', 'kit')).toBe(whole.holds('kitBlamed', 'kit'));
  }, 300000);

  it('played twice from the same seed, the same steps make the same history', async () => {
    const a = await Wrayford.start(home, 'twice'), b = await Wrayford.start(home, 'twice');
    const some = steps('mothers').slice(0, 50);
    await a.play(...some); await b.play(...some);
    expect(a.j.campaign.state.elapsed).toBe(b.j.campaign.state.elapsed);
    expect(a.j.taken.map(x => x.told)).toEqual(b.j.taken.map(x => x.told));
  }, 240000);

  it('a generated mountain country holds Wrayford beyond its south march, its innkeeper tells of it, and the road leads in', async () => {
    const world = await WorldAssembler.assemble('wray', NodeBundleSource.shared, { region: { terrain: 'mountain' } });
    expect(world.report.region.beyond!.south!.name).toBe('the vale of the Wray');
    const s = await PlaySession.start(world.path, 'wray', world.source);
    const told = s.campaign.module.actions.find(a => a.id.startsWith('region__edge_south_beyond_told_'))!;
    GeneratedWorld.put(s, s.campaign.world.one('at', told.speaker!)!.replace(/^region__/, ''));
    expect(await Journey.of(s).play('about the bridge at Wrayford')).toContain('hanged three of them off the gatehouse');
    expect(PlayerView.observe(s.campaign).knowledge.some(k => k.id === 'region__edge_south_beyond')).toBe(true);
    await GeneratedWorld.travel(s, 'edge_south');
    const drawn = await new Frontier('wray', NodeBundleSource.shared).expand(s.campaign);
    expect(s.campaign.installations.find(m => m.id === drawn!.rid)?.chapter).toBe(true);
    const j = Journey.of(s);
    await j.play('drove road, above Wrayford');
    expect(s.campaign.world.one('at', 'party')).toBe(`${drawn!.rid}__drove_road`);
    // A stranger: not told whose coat hangs by the door, nor called kin.
    const kitchen = await j.play('To Northgate', 'To Wain Row', 'Into the Pardoe house');
    expect(kitchen).toMatch(/a man.s coat on a hook/);
    expect(kitchen).not.toContain('your mother');
  }, 240000);
});
