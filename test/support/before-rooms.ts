import type { PlaySession } from '../../src/session/play-session';
import { ModuleWriter } from '../../src/lang/module-writer';

// A recorded play kept from before the rooms under the first town had what lives in them come at the company (19
// November: the cellar's rats, the crypt's bats, the adit's beetles): replayed line for line, an assault nobody met
// then stalls it, and what they change of a room's offer moves it. Set aside, the play is the one it was; what it
// pins is still its own. The hand on the green and the culvert's and cutting's dangers are not set aside: the plays
// reach the same acts past them, asked as meant (test/support/as-meant, MT-15). Of the three, the crypt's bats are
// left (the first hour's beats, 21 November: fewer, stranger things below; the cellar's rats and the adit's beetles
// were taken out).
export class BeforeRooms {
  static readonly came = ['crypt_bats'];
  // In whichever town the company begins (the rooms are under that town's, its relation named for it).
  static set(s: PlaySession): PlaySession {
    const c = s.campaign, ids = new Set(c.module.entities.map(e => e.id));
    const towns = c.module.relations.flatMap(r => /_u_came$/.test(r.name) ? [r.name.slice(0, -'_u_came'.length)] : []);
    // Gone from their rooms, and come already, so nothing of them is there to be met or offered.
    const them = towns.flatMap(t => BeforeRooms.came.map(x => [t, `${t}_u_${x}`] as const).filter(([, id]) => ids.has(id)));
    c.commitWorld(c.world.apply(them.flatMap(([t, id]) => [
      { kind: 'assert' as const, call: ModuleWriter.call(`${t}_u_came`, id) },
      ...c.world.one('at', id) ? [{ kind: 'retract' as const, call: ModuleWriter.call('at', id, c.world.one('at', id)!) }] : []])));
    return s;
  }
}
