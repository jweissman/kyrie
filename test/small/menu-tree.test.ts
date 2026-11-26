import { describe, expect, it } from 'bun:test';
import { Atlas, type Kind, type Where } from '../support/atlas';
import { Glanced } from '../support/glanced';
import { MenuOracle } from '../support/menu-oracle';
import { MenuTree } from '../../src/frame/menu-tree';
import { MenuModel } from '../../src/frame/menu-model';

// The resting scene's menu is the frame's (OR-1071): over the atlas's grid of kinds and places, with and without an
// aim followed, the frame's tree drawn with each fold open, and with all of them, is the menu the page had built, and
// its marks are the page's old folds (MenuOracle). The walks hold it at every turn (test/menu-tree).
describe('the frame holds the resting menu', () => {
  for (const kind of ['companion', 'danger', 'payoff', 'knowledge', 'sign'] as Kind[]) {
    for (const at of ['green', 'lane', 'yard'] as Where[]) {
      for (const aim of [false, true]) {
        it(`with ${kind} at the ${at}${aim ? ', its aim followed' : ''}`, async () => {
          const t = await Atlas.start(kind, at, { aim }), frame = Glanced.of(t.session).frame();
          expect(MenuOracle.differences(frame)).toEqual([]);
        });
      }
    }
  }
  // The page reads it: the resting menu is the frame's, drawn with the folds open, and nothing is built again.
  it('is what the page draws, and it survives the worker', async () => {
    const t = await Atlas.start('payoff', 'green', { aim: true }), frame = Glanced.of(t.session).frame();
    const sent = structuredClone(frame);
    expect(MenuModel.build(sent, 'here', [])).toEqual(MenuTree.opened(frame.menu, []));
    expect(JSON.parse(JSON.stringify(frame.menu))).toEqual(frame.menu);
  });
});
