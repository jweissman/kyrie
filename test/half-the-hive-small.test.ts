import { describe, expect, it } from 'bun:test';
import { Hume, build, h } from './support/hume';

// Half the Hive's smaller stories, each played on its own by the labels a player sees: Nell Quarrie named on Agnes
// Mellor's word; the dark watch kept with a light, the moth fought, and leave won to carry the dead; a living cut from
// the honey linden, a Searcher's training, and a princess killed in her cell.
describe('Half the Hive: smaller stories', () => {
  it('Nell\'s oil, for a bard: the phial by Tobit\'s hand, who sat with him, Agnes\'s word, and Nell named; the Drewes paid; the mead talked round', async () => {
    const g = await Hume.start(build('bard'));
    await g.fixture('nell');
    expect(g.knows('nell_sat_tobit')).toBe(true);
    expect(g.holds('agnesVouches', 'agnes')).toBe(true);
    expect(g.holds('nellNamed', 'nell')).toBe(true);
    expect(g.page).toMatch(/In the afternoon! With the light coming down the arch/);
    expect(g.holds('drewesPaid', 'party')).toBe(true);
    expect(g.holds('meadSaved', 'huw')).toBe(true);
    expect(g.state('mead_barrel', 'working')).toBe(true);
    await g.until();
    expect(g.page).toMatch(/goes up the stair in the afternoons now/);
    expect(g.page).toMatch(/younger girl has named it after you/);
    expect(g.page).toMatch(/PENRY · THE YEAR HE WENT/);
  }, 300000);

  it('the dark watch with a light, for a company of three: Agnes appalled, the Deathshead fought, and leave won from Linnet to carry Tobit', async () => {
    const g = await Hume.start(build('company3'));
    await g.fixture('watch');
    expect(g.holds('lightAmongCapped', 'party')).toBe(true);
    expect(g.holds('mothDead', 'deathshead')).toBe(true);
    expect(g.holds('keptWatch', 'party')).toBe(true);
    expect(g.page).toMatch(/With a light, among them all/);
    expect(g.holds('linnetPermitsDead', 'linnet')).toBe(true);
    await g.until();
    expect(g.holds('goes', 'agnes')).toBe(true);
    expect(g.at('tobit_bier')).toBe('limbo');
    expect(g.page).toMatch(/the first of the dead ever to go with a Leaving/);
  }, 300000);

  it('a living and a wrong, for a thief: wild comb cut and sold, a Searcher\'s hiding learned, and the Breck princess killed in her cell', async () => {
    const g = await Hume.start(build('thief'));
    const before = g.gold();
    await g.fixture('living');
    expect(g.measure('combsCut', 'honey_oak')).toBe(1);
    expect(g.page).toMatch(/You learn hide/);
    expect(g.holds('breckPierced', 'brenna')).toBe(true);
    expect(g.gold()).toBeGreaterThan(before - 3);
    await g.until();
    expect(g.state('cell_candlish', 'open')).toBe(true);
    expect(g.page).toMatch(/The Candlish princess reigns in the Brow/);
    expect(g.j.holds('reached', h('lark_owned'))).toBe(true);
  }, 300000);
});
