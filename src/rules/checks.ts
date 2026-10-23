import { Expressions } from '../expressions';
import { RandomStreams } from '../random-streams';
import { PartyCapabilities } from '../campaign/party-capabilities';
import type { Attribute, Creature } from '../creature';
import type { CombatEvent } from '../model';

export type Check = Extract<CombatEvent, { type: 'check' }>;
export type Odds = 'sure' | 'likely' | 'even' | 'unlikely' | 'beyond';

// A check: something the company tries that could go either way (talking goblins out of a gallery, telling a lie
// that holds, reading a motive in a face). The one of the company best placed to make it speaks or acts: a d20, and
// the modifier of the quality it rests on, and their proficiency when the skill is theirs. It is rolled only when it
// could go either way; when it cannot fail, or cannot succeed, it is not rolled at all, and is told so.
export class Checks {
  // The quality each skill rests on.
  static readonly qualities: Record<string, Attribute> = { persuasion: 'charisma', deception: 'charisma',
    intimidation: 'charisma', insight: 'wisdom', lore: 'intelligence', woodcraft: 'wisdom', perception: 'wisdom',
    stealth: 'dexterity', lockwork: 'dexterity', trapwork: 'dexterity', climbing: 'strength', brawn: 'strength',
    mending: 'wisdom', rites: 'wisdom', wayfinding: 'wisdom', digging: 'constitution' };
  // How hard, as Kyr names it (Resolve check(actor, persuasion, dc_hard)): the number to meet or beat.
  static readonly difficulties: Record<string, number> = { dc_easy: 10, dc_fair: 13, dc_hard: 16, dc_formidable: 19 };
  static difficulty(id: string): number {
    const found = Object.entries(this.difficulties).find(([k]) => id === k || id.endsWith(`__${k}`));
    if (!found) { throw new Error(`Unknown difficulty ${id}`); }
    return found[1];
  }
  static skill(id: string): string { return id.replace(/^.*__/, ''); }
  // What a member adds to the roll: the quality's modifier, and their proficiency where the skill is theirs.
  static bonus(c: Creature, skill: string): { modifier: number; stat: Attribute; trained: number } {
    const stat = this.qualities[skill] ?? 'wisdom', modifier = Math.floor((c.base[stat] - 10) / 2);
    const trained = PartyCapabilities.brings(skill, c) ? 2 + Math.floor((c.base.level - 1) / 4) : 0;
    return { modifier, stat, trained };
  }
  // Who makes it: of those standing, the one who adds most.
  static maker(creatures: Creature[], skill: string): Creature | undefined {
    const able = creatures.filter(c => c.state.hp > 0);
    return able.reduce<Creature | undefined>((best, c) => !best || this.total(c, skill) > this.total(best, skill) ? c
      : best, undefined);
  }
  static total(c: Creature, skill: string): number { const b = this.bonus(c, skill); return b.modifier + b.trained; }
  // How it looks before it is tried, to the one who would try it.
  static odds(creatures: Creature[], skill: string, difficulty: number): Odds {
    const c = this.maker(creatures, skill);
    if (!c) { return 'beyond'; }
    const b = this.bonus(c, skill), add = b.modifier + b.trained;
    if (1 + add >= difficulty) { return 'sure'; }
    if (20 + add < difficulty) { return 'beyond'; }
    const chance = (21 + add - difficulty) / 20;
    return chance >= 0.65 ? 'likely' : chance >= 0.4 ? 'even' : 'unlikely';
  }
  // The roll turns on who makes it and on what is tried (asking the goblins is not asking their chief).
  static make(creatures: Creature[], at: { skill: string; difficulty: string; seed: string; about?: string }):
    CombatEvent[] {
    const skill = this.skill(at.skill), difficulty = this.difficulty(at.difficulty), c = this.maker(creatures, skill);
    if (!c) { return [{ type: 'check', turn: 0, actor: '', skill, rolled: 0, difficulty, success: false }]; }
    const b = this.bonus(c, skill), add = b.modifier + b.trained;
    const sure = 1 + add >= difficulty, beyond = 20 + add < difficulty;
    if (sure || beyond) {
      return [{ type: 'check', turn: 0, actor: c.id, skill, rolled: sure ? 1 + add : 20 + add, difficulty,
        success: sure, unrolled: true, stat: b.stat, modifier: b.modifier, trained: b.trained }];
    }
    const die = new Expressions(RandomStreams.key(at.seed, 'check', skill, c.id, at.about ?? '')).number('1d20');
    return [{ type: 'check', turn: 0, actor: c.id, skill, rolled: die + add, die, difficulty,
      success: die + add >= difficulty, stat: b.stat, modifier: b.modifier, trained: b.trained }];
  }
  // Whether a command that turns on a check came through it.
  static passed(events: CombatEvent[]): boolean {
    const check = events.find((e): e is Check => e.type === 'check');
    return !check || check.success;
  }
}
