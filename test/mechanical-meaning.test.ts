import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { Battle } from '../src/battle';
import { AbilityUse } from '../src/ability-use';
import { Effects } from '../src/effects';
import { Expressions } from '../src/expressions';
import type { CombatEvent } from '../src/model';
import { LocalKinds } from '../src/canon/local-catalog';

// What a technique says is what it does (the architecture review's A5 and A15, from its probes): a cure lifts what
// it names, by what the condition is and not its name alone; a stance that ends on answering a blow ends; a stun laid
// on someone costs them a turn; a drainer the blow killed stays dead; and one foe of several getting away leaves the
// fight alone.
class Fight {
  static readonly all = Content.abilities.map(a => a.id);
  static context(actor: ReturnType<Content['character']>, fighters: ReturnType<Content['character']>[],
    events: CombatEvent[], content: Content) {
    return { actor, fighters, turn: 1, events, content, abilities: this.all, retreat: false, location: null,
      free: true };
  }
  static cured(cure: string, condition: string): boolean {
    const content = new Content(`cure-${cure}`), healer = content.character('cleric', 'healer', 'fighters');
    const sick = content.character('warrior', 'sick', 'fighters');
    sick.statuses.push({ id: condition, remaining: 9 });
    AbilityUse.perform(Content.abilities.find(a => a.id === cure)!, 'sick', new Expressions(`c-${cure}`),
      this.context(healer, [healer, sick], [], content) as never);
    return !sick.statuses.some(s => s.id === condition);
  }
}
describe('what a technique says', () => {
  it('a cure lifts what it names, by what the condition is', () => {
    expect(Fight.cured('cure_disease', 'disease')).toBe(true);
    expect(Fight.cured('remove_fear', 'fear')).toBe(true);
    expect(Fight.cured('minor_restoration', 'poisoned')).toBe(true);
    // And not a blade's poisoning, which is no harm to its holder.
    expect(Effects.removes({ kind: 'remove', status: '', pattern: 'poison|cursed|blinded', target: 'ally' },
      'poisoning_blade')).toBe(false);
  }, 120000);
  it('a stance that ends on answering a blow ends, the blow told or not', () => {
    for (const stance of ['overwatch', 'blade_barrier']) {
      const content = new Content(`r-${stance}`), events: CombatEvent[] = [];
      const striker = content.character('warrior', 'striker', 'fighters'), holder = content.character('warrior', 'holder', 'goblins');
      striker.hp = striker.maxHp = 999; holder.hp = holder.maxHp = 999;
      holder.statuses.push({ id: stance, remaining: 10 });
      const melee = Content.abilities.find(a => a.id === 'melee')!, ex = new Expressions(`r-${stance}`);
      for (let i = 0; i < 4; i++) {
        AbilityUse.perform(melee, 'holder', ex, { ...Fight.context(striker, [striker, holder], events, content), turn: i + 1 } as never);
      }
      expect(events.filter(e => e.type === 'react').length).toBe(1);
      expect(holder.statuses.some(s => s.id === stance)).toBe(false);
    }
  }, 120000);
  it('a stun costs the stunned a turn, whenever in the round it lands', () => {
    let stuns = 0, lost = 0;
    for (let s = 0; s < 60; s++) {
      const content = new Content(`stun-${s}`);
      const b = new Battle({ id: 'stun', combatants: [content.character('warrior', 'hero', 'fighters'),
        content.creature('frost_wolf', 'wolf', 'goblins')], abilities: Content.abilities }, `stun-${s}`, 200);
      while (!b.state.outcome) { b.step(b.chosen()); }
      b.events.forEach((e, i) => {
        if (e.type !== 'status' || e.detail !== 'stun' || e.target !== 'hero') { return; }
        stuns++;
        const rest = b.events.slice(i + 1), ends = rest.findIndex(x => x.type === 'expire' && x.target === 'hero' && x.detail === 'stun');
        if ((ends < 0 ? rest : rest.slice(0, ends)).some(x => x.type === 'skip' && x.actor === 'hero')) { lost++; }
        else if (ends < 0) { stuns--; }
      });
    }
    expect(stuns).toBeGreaterThan(5);
    expect(lost).toBe(stuns);
  }, 120000);
  it('a drainer killed by what answered its blow stays dead', () => {
    const drain = Content.abilities.find(a => a.id === 'life_drain')!;
    for (let s = 0; s < 60; s++) {
      const content = new Content(`d-${s}`), events: CombatEvent[] = [];
      const actor = content.character('warrior', 'drainer', 'fighters'), target = content.character('warrior', 'shielded', 'goblins');
      actor.hp = 1; target.statuses.push({ id: 'ion_shield', remaining: 5 });
      AbilityUse.perform(drain, 'shielded', new Expressions(`d-${s}`), Fight.context(actor, [actor, target], events, content) as never);
      const died = events.some(e => e.type === 'death' && e.actor === 'drainer');
      const saved = events.some(e => e.type === 'revive' && e.target === 'drainer');
      if (died && !saved) { expect(actor.hp).toBe(0); }
    }
  }, 120000);
  it('one foe of several getting away leaves the fight alone', () => {
    // The kinds a campaign run before in this process declared are its own, not these wolves' (the review's H7).
    LocalKinds.reset();
    const randomly = Object.entries(Content.statuses).find(([, c]) => c.modifiers.randomActions)![0];
    let fled = 0;
    for (let s = 0; s < 120; s++) {
      const content = new Content(`flee-${s}`);
      const combatants = [content.character('warrior', 'hero', 'fighters'), content.character('warrior', 'hero2', 'fighters'),
        ...['w1', 'w2', 'w3'].map(id => content.creature('wolf', id, 'goblins'))];
      combatants.slice(2).forEach(w => w.statuses.push({ id: randomly, remaining: 3 }));
      const b = new Battle({ id: 'flee', combatants, abilities: Content.abilities }, `flee-${s}`, 300);
      while (!b.state.outcome) { b.step(b.chosen()); }
      const end = b.events.find(e => e.type === 'end') as { fled?: { team: string } } | undefined;
      // Ended by a foe's getting away only when it was the last of them standing.
      if (end?.fled?.team === 'goblins') {
        fled++;
        expect(b.state.combatants.filter(f => f.team === 'goblins' && f.hp > 0).length).toBeLessThanOrEqual(1);
      }
    }
    expect(fled).toBeGreaterThan(0);
  }, 120000);
});
