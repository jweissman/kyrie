import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { MenuModel } from '../web/reader/menu-model';
import { Attending } from '../src/ui/attention';
import { Wares } from '../web/reader/wares';
import { Glanced } from './support/glanced';

// What the page shows is what the engine can do (the architecture review's P0): every choice drawn either executes, its
// command one the engine offers now, or is an explicit refusal, saying why; each says what kind of act it is, and the
// page goes by that, never by its words; and a seller's wares are paired with what buys them by kind.
describe('the choices on the page', () => {
  it('are the engine’s own, each executable or refused, each of a kind', async () => {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared, {});
    const s = await PlaySession.start(w.path, 'a1', w.source);
    const g = Glanced.of(s);
    await g.to('region__s2_green');
    const frame = g.frame(), offered = new Set(PlayerView.choices(s.campaign).map(r => r.choice.id));
    const menus = [MenuModel.build(frame, 'here', []), MenuModel.build(frame, 'here', [],
      { attention: { kind: 'person', id: 'region__s2_merchant' } }),
      MenuModel.build(frame, 'here', [], { attention: { kind: 'person', id: 'region__s2_merchant' }, trading: true })];
    for (const menu of menus) {
      // The page's own (opening the world map) is not an act of the engine's.
      const leaves = Attending.all(menu.choices).filter(c => !c.children?.length && (c.command || c.disabled)
        && c.id !== MenuModel.country.id);
      expect(leaves.length).toBeGreaterThan(0);
      for (const c of leaves) {
        // A journey (travel:) and a page of the book (view:) are the page's to do; anything else is the engine's.
        const engine = !c.command || /^(travel|view):/.test(c.command) || offered.has(c.command);
        expect([c.label, engine, !!c.command !== !!c.disabled]).toEqual([c.label, true, true]);
        if (!/^(travel|view):/.test(c.command ?? '')) { expect([c.label, !!c.does]).toEqual([c.label, true]); }
      }
    }
    const talk = menus[1]!.talk!, counter = frame.screen.trade.find(c => c.id === 'region__s2_merchant')!;
    const { wares } = Wares.of(counter, talk.replies);
    expect(wares.filter(x => x.stock > 0).every(x => x.buy && x.buy.targets?.includes(x.kind))).toBe(true);
  }, 120000);
});
