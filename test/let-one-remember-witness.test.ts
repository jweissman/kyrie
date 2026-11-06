import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { Journey } from '../src/session/journey';

// The revision pass on Let One Remember: calling-keyed voices, the empty niche at Keld (a choice with a price), the dry
// shelf round the Old Silver (a way only a ranger reads), and the Finder of Wendmouth. Played by labels, as a player
// would.
class W {
  static start(campaign = 'data/campaigns/let-one-remember.campaign.json') { return PlaySession.start(campaign, 'corrow', NodeBundleSource.shared); }
  static play(s: PlaySession, steps: string[]) { return Journey.of(s).play(...steps); }
  static choices(s: PlaySession) { return Journey.of(s).choices(); }
  static holds(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static is(s: PlaySession, rel: string, ...args: string[]) { return this.holds(s, `corrow__${rel}`, ...args.map(a => a === 'party' ? a : `corrow__${a}`)); }
  static num(s: PlaySession, measure: string, of: string) { return s.campaign.world.number(ModuleWriter.call(measure, `corrow__${of}`)); }
}
const toKeld = ['^(Down |Up )?To the street of chimneys', '^(Down |Up )?To the drove-road gate', '^(Down |Up )?To the Keld end', '^(Down |Up )?To the sinkhole green'];
const learnCorin = [...toKeld, '^Into Mother Saska', 'Talk to Mother Saska', 'how many came back from Keld Hollow', 'Take your leave', '^Out to the sinkhole green'];
const toWendmouth = ['^(Down |Up )?To the foot of the Scarp', '^(Down |Up )?To Wendhead bridge', '^(Down |Up )?To the valley road below', '^(Down |Up )?To the well square'];

describe('Let One Remember, the revision pass', () => {
  it('a ranger reads the empty field and a warrior the cut tail: voices keyed to what the company is', async () => {
    const s = await W.start();
    let said = await W.play(s, [...toKeld, '^(Down |Up )?To the west field']);
    expect(said).toContain('No track in, no track out');
    said = await W.play(s, ['^(Down |Up )?To the sinkhole green', '^(Down |Up )?To the Keld end', '^(Down |Up )?To the drove-road gate', '^(Down |Up )?To the street of chimneys', '^(Down |Up )?To the Hawse',
      '^(Down |Up )?To the north edge', '^(Down |Up )?To the gate of the Askew', '^(Down |Up )?To the farm below', '^(Down |Up )?To the furrow$', '^(Down |Up )?To the tail']);
    expect(said).toContain('All from the east side');
  }, 300000);

  it('a cleric reads the empty niche and the Keld grammar; closing the niche is a mercy with a price', async () => {
    const s = await W.start();
    let said = await W.play(s, [...learnCorin, 'To the Hold chapel']);
    expect(said).toContain('burying nobody for a very long time');
    expect(said).toContain('CORIN, aun');
    expect(W.is(s, 'nicheClosed', 'keld')).toBe(false);
    said = await W.play(s, ['Read the empty niche']);
    expect(W.holds(s, 'knows', 'party', 'corrow__corin_niche')).toBe(true);
    expect(W.num(s, 'hire', 'teshen')).toBe(2);
    said = await W.play(s, ['Have Dori say the office']);
    expect(said).toContain('Nobody is waiting');
    expect(W.is(s, 'nicheClosed', 'keld')).toBe(true);
    expect(W.num(s, 'hire', 'teshen')).toBe(0);
    // The other answer is closed by this one.
    expect(W.choices(s).some(c => /trim the lamp/.test(c.full ?? c.label))).toBe(false);
    said = await W.play(s, ['The company: Search here|Wait']);
  }, 300000);

  it('trimming the lamp keeps the vigil, and Mother Saska says a thing kept', async () => {
    const s = await W.start();
    let said = await W.play(s, [...learnCorin, 'To the Hold chapel', 'Read the empty niche', 'Have Dori trim the lamp']);
    expect(said).toContain('Then it is a clean one');
    expect(W.is(s, 'nicheKept', 'keld')).toBe(true);
    expect(W.num(s, 'hire', 'teshen')).toBe(2);
    expect(W.choices(s).some(c => /say the office/.test(c.full ?? c.label))).toBe(false);
    said = await W.play(s, ['^(Down |Up )?To the sinkhole green', '^Into Mother Saska', 'Talk to Mother Saska', 'whom the empty niche is kept for']);
    expect(said).toContain('I will say a thing kept');
    expect(W.holds(s, 'knows', 'party', 'corrow__saska_saw')).toBe(true);
  }, 300000);

  it('the Finder of Wendmouth has never found anyone\'s, and holds a bell for a dale in the south', async () => {
    const s = await W.start();
    let said = await W.play(s, [...toWendmouth, 'Talk to Odo', 'on the great nail']);
    expect(said).toContain('I have offered her this doll nine times');
    said = await W.play(s, ['anybody ever takes anything back']);
    expect(said).toContain('people\'s opinion of what they used to be');
    said = await W.play(s, ['about the tinker from Corran']);
    expect(said).toContain('Collects');
  }, 300000);

  it('an Old Silver can be passed on the dry shelf with no rations spent, if a ranger leads', async () => {
    const s = await W.start();
    await W.play(s, [...toKeld, '^Into Mother Saska', 'Talk to Teshen', 'Ask Teshen what she wants', 'Ask Teshen to join', '^Out to the sinkhole green',
      '^(Down |Up )?To the Keld end', '^(Down |Up )?To the drove-road gate', '^(Down |Up )?To the street', '^(Down |Up )?To the Hawse',
      '^Into the Rope', 'Buy › A ration', 'Buy › A ration', '^Out', '^(Down |Up )?To the rim', '^(Down |Up )?To the third Forge', '?a torch: Light', '^(Down |Up )?To the Gaol',
      'Ask Teshen to read the lock']);
    await W.play(s, ['^(Down |Up )?To an inner cell', '?a torch: Light']);
    const said = await W.play(s, ['^(Down |Up )?To the Gaol', '^(Down |Up )?To the collapsed', '^(Down |Up )?To the edge of the Glass', '^(Down |Up )?To the Diggings', '?Shutter every light', '^(Down |Up )?To the trough',
      '^(Down |Up )?(To )?under the Breach', '?a torch: Light', '^(Down |Up )?To the Underfloor river', '?a torch: Light', '^(Down |Up )?To the neck of the sump', '?a torch: Light']);
    expect(said).toContain('It strikes where the water moves');
    const after = await W.play(s, ['Have Elen lead the company along the dry shelf']);
    expect(after).toContain('Eighty years in the dark');
    expect(W.holds(s, 'tolerates', 'corrow__old_silver', 'party')).toBe(true);
    expect(W.is(s, 'fed', 'old_silver')).toBe(false);
  }, 300000);

  it('with the niche closed, the Unsaid cannot be housed in the Hollow, but can still be told where its body went', async () => {
    const open = await W.start('test/fixtures/corrow/act2/act2.campaign.json');
    const closed = await W.start('test/fixtures/corrow/act2c/act2c.campaign.json');
    const way = ['Begin Act II', '?a torch: Light', '^(To|Through to) the grey shore', '^(Down |Up )?To the drifts', '^(Down |Up )?To the lanes of Keld Hollow',
      '^(Down |Up )?To the untitled library', '^(Down |Up )?To the mountain.s place', '^(Down |Up )?To the gathering'];
    await W.play(open, way);
    await W.play(closed, way);
    const labels = (s: PlaySession) => W.choices(s).map(c => c.full ?? c.label);
    expect(labels(open).some(l => /give the Unsaid a name/.test(l))).toBe(true);
    expect(W.is(closed, 'nicheClosed', 'keld')).toBe(true);
    expect(labels(closed).some(l => /give the Unsaid a name/.test(l))).toBe(false);
    expect(labels(closed).some(l => /Tell the Unsaid where its body went/.test(l))).toBe(true);
  }, 300000);
});
