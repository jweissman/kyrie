import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Gaunt, alone, build, phases, steps } from './support/gaunt';

// A Winter in Carth's principal journeys and what each must leave behind; the helper and the calendar are in
// test/support/gaunt.ts, the steps in test/fixtures/gaunt. The smaller journeys (Carth's ways through the night, the
// city's strands) are in test/winter-in-carth-small.test.ts; the generated world in test/winter-in-carth-placed.test.ts.
describe('A Winter in Carth: the road, the farm, the city and the Consistory', () => {
  it('lints clean as a recommended campaign', async () => {
    const findings = await KyrLint.campaign(alone, new NodeBundleSource());
    expect(findings.filter(f => f.level === 'error' || f.level === 'warning')).toEqual([]);
  }, 60000);

  it('left alone at the Penitent\'s Cross: Hern walks in by himself, Hal is sold, and Hern is put out', async () => {
    const g = await Gaunt.start();
    await g.until();
    expect(g.holds('hernGaoled', 'hern')).toBe(false);
    expect(g.holds('verdictPutOut', 'consistory')).toBe(true);
    expect(g.holds('halTaken', 'hal')).toBe(true);
    expect(g.holds('vigilEnded', 'carth_vigil')).toBe(false);
    expect(g.ending()).toEqual(['put_out']);
    // The company never went to Carth; the account does not pretend it did.
    expect(g.page).not.toMatch(/Dowsie Scaife is up and about/);
    expect(g.page).toMatch(/The Carth vigil goes on/);
  }, 180000);

  it('from above, for a bard: the byre fire, Annis at the gate, a clean tally, the masked Lady, two Determinations, and the Wood-reeve walks out for him', async () => {
    const g = await Gaunt.start();
    await g.fixture('above');
    await g.until();
    // The letter of the vigil kept: a fire in the byre, the hearth cold for the hand.
    expect(g.holds('byreFire', 'carth_vigil')).toBe(true);
    expect(g.page).toMatch(/Then he sniffs\. Smoke/);
    expect(g.holds('vigilBroken', 'carth_vigil')).toBe(false);
    // Thackray moved by people, not exhibits: Annis to his face and a children's rhyme.
    expect(g.holds('annisSaid', 'thackray')).toBe(true);
    expect(g.holds('verseToThackray', 'thackray')).toBe(true);
    expect(g.holds('vigilReleased', 'carth_vigil')).toBe(true);
    expect(g.holds('woodOpened', 'thackray')).toBe(true);
    // The Lady Penitentiary moved under her mask; the Faculty set against itself; the tower's course stands.
    expect(g.measure('hawiseReasons', 'hawise')).toBeGreaterThanOrEqual(2);
    expect(g.holds('crossed', 'consistory')).toBe(true);
    expect(g.holds('courseSet', 'joby')).toBe(true);
    // At the Consistory the company is heard, Hern refuses, and Thackray bears it.
    expect(g.holds('testifiedCarth', 'party')).toBe(true);
    expect(g.holds('thackrayBears', 'thackray')).toBe(true);
    expect(g.ending()).toEqual(['the_bearer']);
    expect(g.page).toMatch(/Hugh Thackray, Wood-reeve, who has been top of the Ladder of Merit for eleven years, walks out/);
    expect(g.page).toMatch(/splitting the oak he sent up the fell/);
  }, 300000);

  it('from below, for a thief: the hearth lit and the vigil broken, Heb\'s tally past the porter, the Ladder raised until the Stand is bought out, and the Row stays home on Ash Day', async () => {
    const g = await Gaunt.start(build('thief'), 'g1');
    await g.fixture('below');
    await g.until();
    expect(g.holds('vigilBroken', 'carth_vigil')).toBe(true);
    expect(g.holds('brokeVigil', 'party')).toBe(true);
    expect(g.page).toMatch(/Seventeen nights of a cold hearth/);
    expect(g.holds('porterPassed', 'party')).toBe(true);
    expect(g.holds('standCornered', 'dinsdale')).toBe(true);
    expect(g.holds('struck', 'barefoot')).toBe(true);
    expect(g.holds('dinsdaleWalked', 'dinsdale')).toBe(true);
    expect(g.ending()).toEqual(['the_fast']);
    expect(g.page).toMatch(/Adjourned\. Until the Commerce of Merit resumes/);
    // The debt is still owed: the forgery got the company in, and paid nothing.
    expect(g.measure('pains', 'party')).toBe(18);
    expect(g.page).toMatch(/Your tally is still notched/);
  }, 300000);

  it('the flight, for a warrior: the box-bed, Bess and Hern face to face, the serjeants fought in Gaol Lane, and the bars out of the window', async () => {
    const g = await Gaunt.start(build('warrior'), 'g1');
    await g.fixture('flight');
    await g.until();
    expect(g.holds('sharedBed', 'carth_vigil')).toBe(true);
    expect(g.holds('hernHeardBess', 'hern')).toBe(true);
    expect(g.holds('hernWillLive', 'hern')).toBe(true);
    expect(g.holds('barsOut', 'hern')).toBe(true);
    expect(g.holds('hernFled', 'hern')).toBe(true);
    expect(g.ending()).toEqual(['the_flight']);
    expect(g.page).toMatch(/This is a better story\. Nobody’ll believe it/);
  }, 300000);

  it('the company bears it, for a cleric: the beadle\'s foot, the fever nursed, the dead laid out, a barefoot mile, and the company put out of the Gate of Ash', async () => {
    const g = await Gaunt.start(build('cleric'), 'g1');
    await g.fixture('bearer');
    await g.until();
    expect(g.holds('footBound', 'beadle')).toBe(true);
    expect(g.holds('nursed', 'dowsie')).toBe(true);
    expect(g.holds('ralphLaid', 'carth_vigil')).toBe(true);
    expect(g.holds('companyBears', 'party')).toBe(true);
    expect(g.holds('putOut', 'party')).toBe(true);
    expect(g.ending()).toEqual(['the_bearer']);
    expect(g.page).toMatch(/You fool,’ he says\. ‘You lovely fool/);
    expect(g.page).toMatch(/It is going to be a long winter at Carth/);
    // Struck from the Register, the company cannot come back in by the Fell Gate; Hern can join it.
    expect(g.at('party')).toBe('levels_road');
    expect(g.j.find('^To the Fell Gate')).toBeUndefined();
    expect(g.j.holds('willing', 'gaunt__hern', 'party')).toBe(true);
  }, 300000);

  it('a ranger who does nothing at Carth: Hern gives the child his coat, is never tended, and is tried dead', async () => {
    const g = await Gaunt.start(build('ranger'), 'g1');
    await g.fixture('dead');
    await g.until();
    expect(g.holds('hernCoat', 'hern')).toBe(true);
    expect(g.holds('hernDead', 'hern')).toBe(true);
    expect(g.ending()).toEqual(['put_out_dead']);
    expect(g.page).toMatch(/Kept her warm,’ he says/);
    expect(g.page).toMatch(/Lady Penitentiary asks the coffin whether it recants/);
    // Nobody stopped the old woman: she was found on the twenty-sixth morning.
    expect(g.holds('grannyDead', 'granny')).toBe(true);
  }, 300000);
});

describe('A Winter in Carth, kept and replayed', () => {
  it('kept on Shrove Monday and opened again, goes on to the same end', async () => {
    const all = steps('below'), at = all.indexOf('Into Heb\'s cellar');
    const whole = await Gaunt.start(build('thief'), 'g1'); await whole.play(...all); await whole.until();
    const split = await Gaunt.start(build('thief'), 'g1'); await split.play(...all.slice(0, at));
    const back = new Gaunt(Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(split.j.session.checkpoint())))));
    await back.play(...all.slice(at)); await back.until();
    expect(back.ending()).toEqual(whole.ending());
    expect(back.j.campaign.state.elapsed).toBe(whole.j.campaign.state.elapsed);
    expect(back.measure('pains', 'party')).toBe(whole.measure('pains', 'party'));
  }, 400000);

  it('played twice from the same seed, the same steps make the same history', async () => {
    const a = await Gaunt.start(build('thief'), 'twice'), b = await Gaunt.start(build('thief'), 'twice');
    const some = [...phases('below').road!, ...phases('below').carth!];
    await a.play(...some); await b.play(...some);
    expect(a.j.campaign.state.elapsed).toBe(b.j.campaign.state.elapsed);
    expect(a.j.taken.map(x => x.told)).toEqual(b.j.taken.map(x => x.told));
  }, 240000);
});
