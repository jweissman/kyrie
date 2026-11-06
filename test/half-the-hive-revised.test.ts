import { describe, expect, it } from 'bun:test';
import { Hume, build, h } from './support/hume';

// Half the Hive, revised against doc/imbar/14-bible.md (see doc/imbar/adventures/half-the-hive.md): a company of
// five callings finds what each of them would find (data/adventures/half-the-hive/wake.kyr), a cleric has two ways
// through that nobody else has, and the seventh Leaving's last page is a choice of wax.
const scent = ['>hume__scenting_room', 'Ask Elspet to scent you'];
describe('Half the Hive: the Account, kept', () => {
  it('each calling sees its own thing: the rows, the cart-road, the filed pan, the grooves and the seventh run', async () => {
    const g = await Hume.start(build('revised'));
    await g.play(...scent, '>hume__dancing_hall');
    expect(g.page).toMatch(/It scans/);
    expect(g.page).toMatch(/The seventh runs out east, farther than all the rest/);
    await g.play('>hume__capped_gallery');
    expect(g.page).toMatch(/Standing,/);
    expect(g.page).toMatch(/The seventh place is smooth wax/);
    await g.play('>hume__leavers_yard');
    expect(g.page).toMatch(/Filed,/);
    expect(g.knows('beam_filed')).toBe(true);
    expect(g.page).toMatch(/COLLEGIUM OF MEASURES/);
    expect(g.page).toMatch(/SIXWAYS/);
    await g.play('>hume__gallow_knoll');
    expect(g.page).toMatch(/A cart-road,/);
    expect(g.knows('east_staged')).toBe(true);
  }, 300000);

  it('a thief takes the factor\'s coin, or a company tells the Drewes: not both', async () => {
    const g = await Hume.start(build('revised'));
    await g.play('>hume__leavers_yard', 'Talk to Crispin', 'Tell Crispin Polglaze you have seen the file-marks', 'Take Crispin Polglaze\'s four coin');
    expect(g.holds('beamHushed', 'party')).toBe(true);
    await g.play('^Take your leave');
    expect(g.j.matches('Tell the mother of the Drewes').length).toBe(0);
    const t = await Hume.start(build('revised'));
    await t.play('>hume__leavers_yard', 'Talk to the Drewes', 'Tell the mother of the Drewes', '^Take your leave');
    expect(t.holds('drewesTold', 'party')).toBe(true);
    expect(t.page).toMatch(/We.ll carry them ourselves/);
    expect(t.j.matches('Tell Crispin Polglaze').length).toBe(0);
  }, 300000);

  it('a cleric says the carrying office to Linnet, and Agnes may carry Tobit without anyone sitting the watch', async () => {
    const g = await Hume.start(build('revised'));
    await g.play(...scent, '>hume__mothers_chamber');
    expect(g.holds('linnetPermitsDead', 'linnet')).toBe(false);
    await g.play('Have Dori say the lowland office');
    expect(g.holds('linnetPermitsDead', 'linnet')).toBe(true);
    expect(g.page).toMatch(/Somewhere that is written down/);
    // A company with no cleric has no such choice.
    const w = await Hume.start(build('warrior'));
    await w.play('>hume__scenting_room', 'Ask Elspet to scent you', '>hume__mothers_chamber');
    expect(w.j.matches('say the lowland office').length).toBe(0);
  }, 300000);

  it('the seventh Leaving: Merrit capped in the white comb, so that Eben cannot have it; Hannet knows, and the account says so', async () => {
    const g = await Hume.start(build('revised'));
    await g.play(...scent, '>hume__gallow_hollow',
      'the capped of the seventh Leaving: Examine — Look closely', 'the one by the door: Examine — Look closely',
      '?Climb the old comb', '?Climb the old comb', '?Climb the old comb', '?Climb the old comb');
    expect(g.knows('merrit_found')).toBe(true);
    expect(g.j.matches("cap her in").length).toBeGreaterThan(0);
    await g.play('cap her in the seventh Leaving.s own white');
    expect(g.holds('merritWhite', 'party')).toBe(true);
    expect(g.j.matches('cap her in a cake').length).toBe(0);
    await g.play('>hume__dancing_hall');
    expect(g.page).toMatch(/under the smear/);
    await g.play('>hume__capped_gallery');
    expect(g.page).toMatch(/M\. COKE/);
    await g.until();
    expect(g.page).toMatch(/stands in white wax with her hands folded/);
  }, 300000);
});
