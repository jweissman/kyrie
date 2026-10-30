import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Lull, home, k } from './support/lull';

// The Lull (doc/adventures/the-lull), played by the labels a player sees from the steps in test/fixtures/the-lull.
// The company comes down the march road into Sixways at eight on the first morning (watch 0). The Lull keeps its own
// sennight: its first Lullday dawns at six on the third morning (watch 276), and every seventh after (1284, 2292). The
// story counts Lulldays from the first the company spends inside: the first, the second, and the Working Day.
describe('The Lull', () => {
  it('lints clean', async () => {
    const findings = await KyrLint.campaign(home, new NodeBundleSource());
    expect(findings.filter(f => f.level === 'error' || f.level === 'warning')).toEqual([]);
  }, 120000);

  it('keeps one day in seven: the road shut, then open at six; a wait at the stone; a night inside is a week outside', async () => {
    const g = await Lull.start();
    await g.play('Sixways street$', 'To the Fold-stone$');
    expect(g.j.matches("To the Tump's shoulder").length).toBe(0);
    expect(g.page).toMatch(/the Lull is two days off/);
    await g.play('Sit down by the Fold-stone');
    expect(g.j.campaign.state.elapsed).toBe(276);
    expect(g.j.matches("To the Tump's shoulder").length).toBe(1);
    await g.play("To the Tump's shoulder");
    expect(g.page).toMatch(/the whole valley is below you at once/);
    await g.play('To Linger green', '=20:30', 'Lie down Lull-fashion');
    expect(g.j.campaign.state.elapsed).toBe(1284);
    expect(g.j.campaign.world.test({ kind: 'call', name: 'weary', args: ['party'] })).toBe(false);
    expect(g.page).toMatch(/outside, it has been a week/);
    // Out at midnight on the Lull's day, the road goes round the hill: whoever stayed awake is shut in.
    await g.play('=23:50', "To the Tump's shoulder", '=+3');
    expect(g.at('party')).toBe(k('tump_shoulder'));
    expect(g.j.matches('To the Fold-stone').length).toBe(0);
  }, 300000);

  it('shows the law at the Watching, and lets it be found out: a cairn for a coin falls, a skep for a coin stands, a gift to win comes apart', async () => {
    const g = await Lull.start();
    await g.fixture('law');
    expect(g.knows('wage_ravels')).toBe(true);
    expect(g.knows('loved_wage_holds')).toBe(true);
    expect(g.knows('given_to_win')).toBe(true);
    expect(g.holds('letticeShamed', 'lettice')).toBe(true);
    expect(g.page).toMatch(/the worst thing that has happened to Lettice Pryce in fifty years/);
    expect(g.knows('meaning_law')).toBe(true);
    expect(g.page).toMatch(/THAT WHAT HOLDS IS WHAT IS MEANT/);
  }, 300000);

  it('the Seventh Day: poppy for Hester, a clock that holds, Tobias comes down for love, and the week comes back with the Lullday kept', async () => {
    const g = await Lull.start();
    await g.fixture('seventh');
    expect(g.holds('hesterEased', 'hester')).toBe(true);
    expect(g.holds('hesterDead', 'hester')).toBe(false);
    expect(g.holds('corinClockHeld', 'corin')).toBe(true);
    expect(g.holds('tobiasLovePath', 'tobias')).toBe(true);
    expect(g.holds('wardensAside', 'wardens')).toBe(true);
    expect(g.measure('handsMeaning', 'lull_country')).toBeGreaterThanOrEqual(5);
    expect(g.holds('weekReturned', 'lull_country')).toBe(true);
    expect(g.holds('lawGone', 'lull_country')).toBe(false);
    expect(g.ending()).toEqual([k('seventh_day')]);
    expect(g.page).toMatch(/AND THEN MONDAY/);
  }, 600000);

  it('Monday: Tobias gave Hester her Monday himself, and comes down in grief; the Lull ends and its law with it', async () => {
    const g = await Lull.start();
    await g.fixture('monday');
    expect(g.holds('diedBy', 'hester', 'tobias')).toBe(true);
    expect(g.knows('tobias_killed')).toBe(true);
    expect(g.holds('tobiasGrief', 'tobias')).toBe(true);
    expect(g.holds('lawGone', 'lull_country')).toBe(true);
    expect(g.ending()).toEqual([k('monday')]);
    expect(g.page).toMatch(/where the work is/);
  }, 600000);

  it('the Long Sunday: the Club works, the wardens sit down for Kezia, and the bridge holds without the Lull ending', async () => {
    const g = await Lull.start();
    await g.fixture('sunday');
    expect(g.holds('bridgeBuilt', 'club')).toBe(true);
    expect(g.holds('joins', 'tobias')).toBe(false);
    expect(g.holds('weekReturned', 'lull_country')).toBe(false);
    expect(g.ending()).toEqual([k('long_sunday')]);
  }, 600000);

  it('the Bridge in the Leat: nobody kept the wardens off, and a warden meant it', async () => {
    const g = await Lull.start();
    await g.fixture('broken');
    expect(g.holds('wardensBroke', 'club')).toBe(true);
    expect(g.holds('corinHurt', 'corin')).toBe(true);
    expect(g.ending()).toEqual([k('broken_bridge')]);
    expect(g.page).toMatch(/He meant it/);
  }, 600000);

  it('the Sixnight: awake at midnight, the Hands set you to the loom for the six days, and you come out with the cloth you wove', async () => {
    const g = await Lull.start();
    await g.fixture('loom');
    expect(g.j.campaign.state.elapsed).toBe(1284);
    expect(g.at('party')).toBe(k('mill_yard'));
    expect(g.carries('shift_bolt')).toBe(true);
    expect(g.page).toMatch(/this is what the strikers stopped/);
  }, 300000);

  it('the Sixnight, lain down in: the beam read, the Overseer passed open-handed, and out by the Weaver\'s Gap into Sixways', async () => {
    const g = await Lull.start();
    await g.fixture('sixnight');
    expect(g.knows('beam_names')).toBe(true);
    expect(g.page).toMatch(/There is no Tobias Lindsell/);
    expect(g.holds('restingBefore', 'party')).toBe(true);
    expect(g.at('party')).toBe(k('sx_spring'));
    expect(g.holds('sixnightLived', 'party')).toBe(true);
    // The world outside is in its week: it is the small hours of the night after the first Lullday.
    expect(g.j.campaign.state.elapsed).toBeLessThan(420);
  }, 300000);

  it('the ribbons: a sale comes undone whoever loves whom, and the mothers of Linger are set right; Nan is put out', async () => {
    const g = await Lull.start();
    await g.fixture('ribbons');
    expect(g.knows('nan_ribbons_ravel')).toBe(true);
    expect(g.carries('nan_ribbon')).toBe(false);
    expect(g.holds('jenetHealed', 'jenet')).toBe(true);
    expect(g.holds('nanBanned', 'nan')).toBe(true);
  }, 300000);

  it('the Old Brock: honey at the sett, a truce, and Hob Linsey will feed him every Lullday', async () => {
    const g = await Lull.start();
    await g.fixture('brock');
    expect(g.holds('brockTruce', 'brock')).toBe(true);
    expect(g.holds('brockFed', 'brock')).toBe(true);
  }, 300000);

  it('the Bride-Gift: told what each of them wants, Abel makes a cart-seat, it holds, and they are married at the Watching', async () => {
    const g = await Lull.start();
    await g.fixture('wedding');
    expect(g.holds('abelMeans', 'abel')).toBe(true);
    expect(g.holds('wedded', 'wenna')).toBe(true);
    expect(g.page).toMatch(/Go you, go you/);
  }, 300000);

  it('the Waiting Woman: told that Dorcas is ill, Piran goes out over the Tump with her that night', async () => {
    const g = await Lull.start();
    await g.fixture('dorcas');
    expect(g.holds('piranKnowsIll', 'piran')).toBe(true);
    expect(g.at('piran')).toBe(k('sx_taproom'));
  }, 300000);

  it('Simeon: turned back by the wardens on the shoulder in the morning, and brought home after eleven', async () => {
    const g = await Lull.start();
    await g.fixture('simeon');
    expect(g.holds('simeonTurned', 'simeon')).toBe(true);
    expect(g.holds('simeonHome', 'simeon')).toBe(true);
    expect(g.page).toMatch(/They.ve painted the Glossary/);
  }, 300000);

  it('Linnet: a carving made meaning it, a tune with a next bit, and a promise to stay', async () => {
    const g = await Lull.start();
    await g.fixture('linnet');
    expect(g.holds('linnetLoves', 'linnet')).toBe(true);
    expect(g.holds('keepsakeKept', 'keepsake')).toBe(true);
    expect(g.holds('linnetTune', 'linnet')).toBe(true);
    expect(g.holds('stayPromised', 'party')).toBe(true);
  }, 300000);
});
