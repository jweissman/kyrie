import { Expressions } from '../expressions';
import { RandomStreams } from '../random-streams';
import { PartyCapabilities } from '../campaign/party-capabilities';
import { Canon } from '../canon/canon';
import type { ItemCatalog } from '../item-catalog';
import type { Attribute, Creature } from '../creature';
import type { CombatEvent } from '../model';

export type Check = Extract<CombatEvent, { type: 'check' }>;
export type Odds = 'sure' | 'likely' | 'even' | 'unlikely' | 'beyond';

// A check: something the company tries that could go either way (talking goblins out of a gallery, telling a lie
// that holds, reading a motive in a face). The one of the company best placed to make it speaks or acts: a d20, and
// the modifier of the quality it rests on, and their proficiency when the skill is theirs. It is rolled only when it
// could go either way; when it cannot fail, or cannot succeed, it is not rolled at all, and is told so.
export class Checks {
  // The quality each skill rests on, as the catalog says (skills.json's `rests`), and keen eyes, which no one learns,
  // on wisdom. A new skill had been written in four shared places, one of them here (Wapshott's Circus, WPC-X03).
  private static readonly skills = Canon.skills;
  static readonly qualities: Record<string, Attribute> = { perception: 'wisdom', ...Object.fromEntries(
    Object.entries(this.skills).flatMap(([id, s]) => s.rests ? [[id, s.rests]] : [])) };
  // A skill's name, as the setting has it; none for one it does not have.
  static named(id: string): string | undefined { return this.skills[id]?.name; }
  // How hard, as Kyr names it (Resolve check(actor, persuasion, dc_hard)): the number to meet or beat. Or as the world
  // measures it: a difficulty of a module's own is as hard as its toBeat, which its rules set from what they read (a
  // debt's size, a keeper's temper: OB-11), read by `measured` where it is made and where its odds are told.
  static readonly difficulties: Record<string, number> = { dc_easy: 10, dc_fair: 13, dc_hard: 16, dc_formidable: 19 };
  static difficulty(id: string, measured?: (id: string) => number): number {
    const n = this.known(id, measured);
    if (n === undefined) { throw new Error(`Unknown difficulty ${id}: none of the four, and no toBeat set for it`); }
    return n;
  }
  // The number, if it is one of the four or has been set.
  static known(id: string, measured?: (id: string) => number): number | undefined {
    const found = Object.entries(this.difficulties).find(([k]) => id === k || id.endsWith(`__${k}`));
    const n = found?.[1] ?? measured?.(id) ?? 0;
    return n >= 1 ? n : undefined;
  }
  static skill(id: string): string { return id.replace(/^.*__/, ''); }
  // What a tool adds: the right one to hand does the work better, and no more (the owner, 7 November).
  static readonly toolBonus = 2;
  // What a member adds to the roll: the quality's modifier, as they have it with what they wear; their proficiency
  // where the skill is theirs; and a tool's help, where they have one they can use (see PartyCapabilities.tool):
  // thieves' tools help a thief at a lock, and one who never learnt to pick one not at all.
  // A capability of a campaign's own rests on the quality it names (restsOn, in the world: BX-01's L5), the
  // catalog's skills on theirs, anything else on wisdom.
  static bonus(catalog: ItemCatalog, c: Creature, skill: string, rests?: Attribute): { modifier: number;
    stat: Attribute; trained: number; tool: number; using?: string; usingName?: string } {
    const stat = this.qualities[skill] ?? rests ?? 'wisdom', modifier = Math.floor((catalog.quality(c, stat) - 10) / 2);
    const trained = PartyCapabilities.skilled(catalog, skill, c) ? this.proficiency(c.base.level) : 0;
    const using = PartyCapabilities.tool(catalog, skill, c);
    return { modifier, stat, trained, tool: using ? this.toolBonus : 0, ...using ? { using,
      usingName: catalog.get(using).name } : {} };
  }
  // What knowing a skill adds to its checks, by level: two at the first, one more each four levels.
  static proficiency(level: number): number { return 2 + Math.floor((level - 1) / 4); }
  private static added(b: { modifier: number; trained: number; tool: number }): number {
    return b.modifier + b.trained + b.tool;
  }
  // What a check event says of how its roll was made up.
  private static parts(b: ReturnType<typeof Checks.bonus>): Partial<Check> {
    const tool = b.using ? { tool: b.tool, using: b.using, usingName: b.usingName } : {};
    return { stat: b.stat, modifier: b.modifier, trained: b.trained, ...tool };
  }
  // Who makes it: of those standing, the one who adds most.
  static maker(catalog: ItemCatalog, creatures: Creature[], skill: string, rests?: Attribute): Creature | undefined {
    const able = creatures.filter(c => c.state.hp > 0);
    return able.reduce<Creature | undefined>((best, c) => !best
      || this.total(catalog, c, skill, rests) > this.total(catalog, best, skill, rests) ? c : best, undefined);
  }
  static total(catalog: ItemCatalog, c: Creature, skill: string, rests?: Attribute): number {
    return this.added(this.bonus(catalog, c, skill, rests));
  }
  // The quality a capability of the world's own rests on, where it says (Initially Assert restsOn(systems,
  // intelligence)).
  static rests(world: { relates(name: string): boolean; one(name: string, arg: string): string | undefined },
    capability: string): Attribute | undefined {
    return world.relates('restsOn') ? world.one('restsOn', capability) as Attribute | undefined : undefined;
  }
  // How it looks before it is tried, to the one who would try it.
  static odds(catalog: ItemCatalog, creatures: Creature[], skill: string,
    { difficulty, rests }: { difficulty: number; rests?: Attribute }): Odds {
    const c = this.maker(catalog, creatures, skill, rests);
    if (!c) { return 'beyond'; }
    const add = this.total(catalog, c, skill, rests);
    if (1 + add >= difficulty) { return 'sure'; }
    if (20 + add < difficulty) { return 'beyond'; }
    const chance = (21 + add - difficulty) / 20;
    return chance >= 0.65 ? 'likely' : chance >= 0.4 ? 'even' : 'unlikely';
  }
  // The roll turns on who makes it and on what is tried (asking the goblins is not asking their chief). A test may
  // have it come out as it asks (forced: a natural twenty, or a one), whatever the odds: a test of a failed check had
  // been a search over seeds, pinned to the steps before it (Quittance's friction 7, QTC-07).
  static make(catalog: ItemCatalog, creatures: Creature[],
    at: { skill: string; difficulty: string | number; seed: string; about?: string;
    forced?: 'pass' | 'fail'; rests?: Attribute }): CombatEvent[] {
    const skill = this.skill(at.skill), c = this.maker(catalog, creatures, skill, at.rests);
    const difficulty = typeof at.difficulty === 'number' ? at.difficulty : this.difficulty(at.difficulty);
    if (!c) { return [{ type: 'check', turn: 0, actor: '', skill, rolled: 0, difficulty, success: false }]; }
    const b = this.bonus(catalog, c, skill, at.rests), add = this.added(b), parts = this.parts(b);
    if (at.forced) {
      const die = at.forced === 'pass' ? 20 : 1;
      return [{ type: 'check', turn: 0, actor: c.id, skill, rolled: die + add, die, difficulty,
        success: at.forced === 'pass', ...parts }];
    }
    const sure = 1 + add >= difficulty, beyond = 20 + add < difficulty;
    if (sure || beyond) {
      return [{ type: 'check', turn: 0, actor: c.id, skill, rolled: sure ? 1 + add : 20 + add, difficulty,
        success: sure, unrolled: true, ...parts }];
    }
    const die = new Expressions(RandomStreams.key(at.seed, 'check', skill, c.id, at.about ?? '')).number('1d20');
    return [{ type: 'check', turn: 0, actor: c.id, skill, rolled: die + add, die, difficulty,
      success: die + add >= difficulty, ...parts }];
  }
  // Whether a command that turns on a check came through it.
  static passed(events: CombatEvent[]): boolean {
    const check = events.find((e): e is Check => e.type === 'check');
    return !check || check.success;
  }
}
