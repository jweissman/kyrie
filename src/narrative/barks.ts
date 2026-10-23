import type { CombatEvent, Fighter } from '../model';
import { Canon } from '../canon/canon';
import { Voice } from './voice';
import { VoiceContext } from './voice-context';
import { Editor } from './editor';

// What a fighter says or does at a turning point of a fight: a blow that tells, a kill, a fall, a flight (Orsino's
// barks, and Kyr's own, in data/voice/combat.json). Said seldom: at most one an exchange, only at a turning point, now
// and then rather than every time, and never the same line twice in one fight. A companion speaks in their manner; a
// foe as what it is (a cultist, a bandit, a beast).
export class Barks {
  static readonly roles = ['novice', 'acolyte', 'cultist', 'gravedigger', 'bandit', 'tombrobber', 'necromancer'];
  // How often a turning point is remarked on, in hundredths: a fall always, a kill or a telling blow often, a miss
  // seldom.
  static readonly chance: Record<string, number> = { fall: 100, kill: 55, crit: 45, flee: 60, engage: 40, miss: 12 };
  private readonly used = new Set<string>();
  constructor(private readonly fighters: Fighter[], private readonly seed: string) {}
  // The bark for one exchange, if it has a turning point worth one.
  of(events: CombatEvent[], n: number): string | undefined {
    const moment = this.moment(events);
    if (!moment) { return undefined; }
    const [kind, who] = moment, fighter = this.fighters.find(f => f.id === who);
    if (!fighter || this.roll(`${n}:${kind}:${who}`) >= (Barks.chance[kind] ?? 0)) { return undefined; }
    // The telling already says who falls and who runs: of those, only what someone says is added.
    const fit = Voice.fitting(kind, this.context(fighter)).filter(l => !['fall', 'flee'].includes(kind) || /['‘"“]/.test(l.text));
    const line = Editor.choose(fit, `${this.seed}:${n}:${kind}`, this.used);
    if (!line || this.used.has(line.id)) { return undefined; }
    this.used.add(line.id);
    return Voice.render(line.text, { actor: fighter.name.replace(/^an? /, 'the '), pronoun: 'they' });
  }
  // The turning point of an exchange: someone falling, a kill, a blow that tells, a flight, a miss.
  private moment(events: CombatEvent[]): [string, string] | undefined {
    const death = events.find(e => e.type === 'death');
    const attack = events.find(e => e.type === 'attack');
    if (death && death.type === 'death') {
      const killer = attack && attack.type === 'attack' && attack.target === death.actor ? attack.actor : undefined;
      return killer && this.team(killer) === 'fighters' ? ['kill', killer] : ['fall', death.actor];
    }
    const flee = events.find(e => e.type === 'flee' && e.success);
    if (flee && flee.type === 'flee') { return ['flee', flee.actor]; }
    if (attack && attack.type === 'attack') { return attack.critical ? ['crit', attack.actor] : attack.success ? undefined : ['miss', attack.actor]; }
    return undefined;
  }
  private team(id: string): string | undefined { return this.fighters.find(f => f.id === id)?.team; }
  // Who a fighter is, as the barks know them: their side, their manner, and for a foe, what it is.
  private context(f: Fighter): Record<string, string> {
    const side = f.team === 'fighters' ? 'company' : 'foe';
    const role = Barks.roles.find(r => f.name.toLowerCase().includes(r) || f.classId === r);
    const kind = Canon.isSpecies(f.raceId) ? Canon.creature(f.raceId).kind ?? 'creature' : 'person';
    return { side, kind, manner: VoiceContext.manners[this.hash(f.id) % VoiceContext.manners.length]!,
      ...role ? { role } : {} };
  }
  private roll(key: string): number { return this.hash(`${this.seed}:${key}`) % 100; }
  private hash(key: string): number {
    let h = 2166136261;
    for (let i = 0; i < key.length; i++) { h = Math.imul(h ^ key.charCodeAt(i), 16777619); }
    return h >>> 0;
  }
}
