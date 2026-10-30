import type { ArenaAbility, Effect, Target } from '../lang/parse';

export type SpellKind = typeof SpellKinds.kinds[number];
export type SpellEmblem = typeof SpellKinds.emblems[number];

// What a spell is for, in a word, for the emblem drawn beside it (OWN-15): harm, ward, heal, light, sight, charm,
// fear, sleep, move, summon, curse or craft. Read from what it does first: a spell that hurts is harm whatever else it
// does; one laid on an enemy is named by what it lays (a charm, a fear, a sleep, else a curse); one laid on yourself or
// a friend is a ward, unless it lights, lifts, sharpens or opens; one that ends something on a friend heals, and on an
// enemy reveals. Its emblem says the same, and of harm, what kind: a flame, frost, a spark, a clap of thunder, venom
// (acid or poison), a draining (necrotic, or life drawn off), else a burst (OWN-15: an evoker's every row had been one
// star).
export class SpellKinds {
  static readonly kinds = ['harm', 'ward', 'heal', 'light', 'sight', 'charm', 'fear', 'sleep', 'move', 'summon', 'curse',
    'craft'] as const;
  static readonly emblems = [...SpellKinds.kinds, 'fire', 'frost', 'spark', 'thunder', 'venom', 'drain'] as const;
  private static readonly elements: Record<string, SpellEmblem> = { fire: 'fire', cold: 'frost', lightning: 'spark',
    electric: 'spark', sonic: 'thunder', thunder: 'thunder', acid: 'venom', poison: 'venom', necrotic: 'drain' };
  private static readonly laid: Record<string, SpellKind> = {
    lit: 'light', flight: 'move', unbarring: 'craft', luminous_blade: 'craft', keen: 'craft', ghost_touch: 'harm',
    augured: 'sight', insight: 'sight', charmed: 'charm', distracted: 'charm', mocked: 'charm', confused: 'charm',
    calm: 'sleep', asleep: 'sleep', paralyzed: 'sleep', stun: 'sleep', fear: 'fear', fleeing: 'fear', despair: 'fear' };
  private static readonly friends: Target[] = ['self', 'ally', 'allies', 'party', 'dead ally'];
  static of(spell: ArenaAbility): SpellKind {
    if (/^(dancing )?lights?$/i.test(spell.name)) { return 'light'; }
    const first = spell.effects[0];
    return first ? this.effect(first) : 'craft';
  }
  static emblem(spell: ArenaAbility): SpellEmblem {
    const kind = this.of(spell), hurt = spell.effects.find(e => e.kind === 'damage' || e.kind === 'drain');
    if (kind !== 'harm' || !hurt) { return kind; }
    return hurt.kind === 'drain' ? 'drain' : this.elements[hurt.damageType] ?? 'harm';
  }
  private static effect(e: Effect): SpellKind {
    switch (e.kind) {
      case 'damage': case 'drain': case 'attack': case 'kill': return 'harm';
      case 'heal': case 'gain': return 'heal';
      case 'revive': return e.traits?.includes('undead') ? 'summon' : 'heal';
      case 'summon': return 'summon';
      case 'remove': return this.friends.includes(e.target) ? 'heal' : 'sight';
      case 'travel': case 'flee': return 'move';
      case 'defend': return 'ward';
      case 'random': case 'cycle': {
        const hurts = e.effects.find(x => x.kind === 'damage');
        return hurts ? 'harm' : e.effects[0] ? this.effect(e.effects[0]) : 'craft';
      }
      case 'apply': return this.laid[e.status] ?? (this.friends.includes(e.target) ? 'ward' : 'curse');
      default: return 'craft';
    }
  }
}
