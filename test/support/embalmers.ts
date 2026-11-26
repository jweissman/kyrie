import { PlayTool } from '../../src/cli/play-tool';
import { Runner, type Said } from '../../src/cli/runner';
import type { CreatureStore } from '../../src/creature-store';
import type { Journey } from '../../src/session/journey';
import { Placed } from './placed';

type Row = { id: string; label: string; aspects: string[]; opens?: Row[] };
const flat = (rs: Row[]): Row[] => rs.flatMap(r => [r, ...flat(r.opens ?? [])]);
// The reference game's dungeon's embalmers' room on the halls' level, where the resined linen is that fire takes
// (OR-1100, OR-1101): a company set down in the gallery outside it, those who keep both rooms gone for the while (a
// fire in the fight with them would let fire loose there just the same), that lights one and goes in by the way.
export class Embalmers {
  static rows(s: Said): Row[] {
    return flat([...s.offer?.primary ?? [], ...s.offer?.rest ?? [],
      ...Object.values(s.offer?.lenses ?? {}).flat()] as Row[]);
  }
  static async enter(as: string, light: RegExp, setUp?: (j: Journey) => void) {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 's0', '--as', as, '--opening', 'none']));
    const r = new Runner(journey.session), c = journey.session.campaign;
    const room = c.module.entities.find(e => e.type === 'place' && /_ud_halls_embalmers$/.test(e.id))!.id;
    setUp?.(journey);
    Placed.at(journey, room.replace(/_embalmers$/, '_gallery'), false);
    const here = [room, room.replace(/_embalmers$/, '_gallery')];
    const bands = new Set(c.module.entities.filter(e => e.type === 'group').map(e => e.id));
    c.commitWorld(c.world.apply(c.world.related('at').filter(x => here.includes(x.args[1]!) && x.args[0] !== 'party'
      && bands.has(x.args[0]!)).map(x => ({ kind: 'retract' as const,
      call: { kind: 'call' as const, name: 'at', args: [x.args[0]!, x.args[1]!] } }))));
    const at = { journey, runner: r, campaign: c, room, linen: `${room}_kindling`, said: r.said('look') };
    await this.act(at, light);
    await this.say(at, `exit:${room}`);
    return at;
  }
  static async say(at: { runner: Runner; said: Said }, id: string) {
    const said = await at.runner.ask(JSON.stringify({ act: id }));
    if ('error' in said) { throw new Error(said.error); }
    at.said = said as Said;
  }
  static row(at: { said: Said }, words: RegExp): Row {
    const found = this.rows(at.said).find(x => words.test(x.label));
    if (!found) { throw new Error(`${words} not among ${this.rows(at.said).map(x => x.label).join(' | ')}`); }
    return found;
  }
  static async act(at: { runner: Runner; said: Said }, words: RegExp) { await this.say(at, this.row(at, words).id); }
  // A mage who has learned Fire Bolt.
  static firebolt(j: Journey) {
    const store = (j.campaign as unknown as { creatures: CreatureStore }).creatures;
    const lease = store.acquire([j.campaign.state.partyIds[0]!]);
    try {
      lease.creatures[0]!.state.learnedAbilities.push('firebolt');
      lease.commit(lease.creatures);
    } finally { lease.release(); }
  }
}
