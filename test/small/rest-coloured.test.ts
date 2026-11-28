import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Attest } from '../../src/presentation/attest';
import { Doable } from '../../src/presentation/doable';
import { Fold } from '../../src/presentation/fold';
import { TerminalDoable } from '../../src/cli/terminal-doable';
import { MenuModel } from '../../src/frame/menu-model';
import { GlanceStage } from '../../web/reader/stage/glance';
import type { AppState, ReaderApp } from '../../web/reader/reader-app';
import { Glanced } from '../support/glanced';

// A row past the four is coloured by one owner (AT-07 §5 step 4; the lead's call of 19 November: real witnesses): the
// offer's reading of it is a witness Attest issues, folded as every other row is, so the terminal and the page draw
// it alike. The terminal had coloured the rest by the offer's aspects and the page, which Attest never indexed them
// for, had drawn them plain (123 rows at the drove road).
const rooms = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const lane = `
  Place lane "the lane" is room at 0, 0 outdoors.
  ${rooms.map((id, i) => `
  Place ${id} "the ${id} yard" is room at ${i + 1}, 1 outdoors.
  Passage to_${id} "the way to the ${id} yard" is path between lane and ${id}.
  Thing tablet_${id} "a wax tablet, ${id}" at lane {
    State shut "A wax tablet lies on the step.".
    State read "Rows of notches.".
    Change read "Read the strokes on ${id}" from shut to read.
  }`).join('\n')}
  Company party "You" of 1 at lane.
  Goal false.`;
// The page's menu, as the page draws a row by it.
class Page {
  constructor(readonly state: AppState) {}
  get menu() { return MenuModel.build(this.state.frame, 'here', []); }
  get app(): ReaderApp { return this as unknown as ReaderApp; }
  static of(t: Tiny): Page {
    return new Page({ frame: Glanced.of(t.session).frame(), view: 'here', open: [], cursor: 0 } as unknown as AppState);
  }
}

describe('a row past the four', () => {
  it('is witnessed as the offer reads it, and drawn so alike by the page\'s fold and the terminal', async () => {
    const t = await Tiny.start(lane, { horizon: ['probing'] });
    const page = Page.of(t), rest = t.glance.offer!.rest.filter(o => o.aspects.length);
    expect(rest.length).toBeGreaterThan(0);
    // A tablet not looked at, past the four, is worth a look by the reading inside it (Promotion.inside, now the
    // offer's too): lit alike on both, by that row; it had been lit by its own reason, which no row inside it bore.
    const looks = rest.filter(o => /tablet_.#look$/.test(o.choice));
    expect(looks.length).toBeGreaterThan(2);
    expect(looks.every(o => Doable.borne(t.glance, t.screen, o.choice).includes('exploration'))).toBe(true);
    const { aspects } = TerminalDoable.kinds(t.glance, t.screen), key = TerminalDoable.keyed(t.glance, t.screen);
    for (const o of rest) {
      expect(Attest.witness(t.glance, o.choice)?.aspects).toEqual(expect.arrayContaining(o.aspects));
      const leaves = Fold.of(t.glance, GlanceStage.choice(page.app, o.choice), o.choice, false);
      const said = [...aspects.get(key(o)) ?? []].sort();
      const drawn = [...new Set(leaves.flatMap(l => l.witnesses.flatMap(w => w.aspects)))].sort();
      expect([o.choice, drawn]).toEqual([o.choice, said]);
      expect(Doable.borne(t.glance, t.screen, o.choice).sort()).toEqual([...aspects.get(key(o)) ?? []].sort());
    }
  });
});
