import type { PlaySession } from '../../src/session/play-session';
import { ModuleWriter } from '../../src/lang/index';

// Wren's mine as its recorded descent knows it (test/fixtures/descent/wren.choices, re-recorded 27 November): the adit
// level's goblins at the crossing, their chief at the spring, and the gnolls who come in when the crossing is cleared
// (OR-1236). The other bands the denser deep put on that level (OR-1230 to OR-1234: wolves at the mouth and the shaft
// head, bats and a charge in the smithy, rats at the winze, spiders in the air shaft) are taken out of it, so that the
// record, a first life's expedition and its replay, plays as it was walked; the levels below are as drawn.
export class WrenRecord {
  static readonly kept = ['_crossing', '_race_head', '_beyond'];
  static clear(s: PlaySession): void {
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    const here = s.campaign.world.related('at').filter(r => r.args[0] !== 'party' && r.args[1]!.startsWith('region__w9_adit_')
      && !this.kept.some(k => r.args[1]!.endsWith(k))
      && s.campaign.module.entities.some(e => e.id === r.args[0] && e.type === 'group'));
    c.commit(c.world.apply(here.map(r => ({ kind: 'retract', call: ModuleWriter.call('at', ...r.args) }))));
  }
}
