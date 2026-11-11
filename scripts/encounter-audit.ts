import { writeFileSync } from 'node:fs';
import { Battle } from '../src/battle';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import type { Creature } from '../src/creature';
import type { CombatEvent } from '../src/model';
import { BestiaryTool } from '../src/cli/bestiary-tool';

// Encounter audit: what a fight is, in numbers. For each foe (a kind at a level, or a band of a world or an
// adventure) it reports hit points, armour class and the damage it deals, and plays the fight against two
// representative companies by the game's own choices (Battle.chosen), many times over a seed:
//   solo: one level-1 human warrior; four: a level-3 warrior, cleric, mage and thief.
// Per company: rounds the company takes to end it, rounds it takes to end the company, how often the fight is over in
// the company's first round ("one hit": the whole band down or driven off before it has acted twice), how often the
// company is wiped out, and the foes' hit points left on the company's hardest-hit member (how hurt it is when it
// wins). Output is JSON (--out) and a table on stdout.
//   bun scripts/encounter-audit.ts kinds [--levels 1,3,5] [--trials 20] [--out f.json] [--only a,b]
//   bun scripts/encounter-audit.ts sites [--seeds 6] [--trials 12] [--out f.json]
//   bun scripts/encounter-audit.ts adventures [--trials 12] [--out f.json] [--only tallow,hessel]
//   bun scripts/encounter-audit.ts scenarios [--trials 12] [--out f.json]
export interface Foe { label: string; creatures: Creature[] }
export interface Result {
  rounds: number; endRounds: number; oneHit: number; wiped: number; won: number; fled: number; hurt: number;
}
export interface Row {
  group: string; label: string; foes: number; hp: number; ac: number; dmg: number; solo: Result; four: Result;
}
export class EncounterAudit {
  static readonly content = new Content('audit');
  static party(size: 'solo' | 'four'): Creature[] {
    const calls = size === 'solo' ? [['warrior', 1]] as const
      : [['warrior', 3], ['cleric', 3], ['mage', 3], ['thief', 3]] as const;
    return calls.map(([classId, level], i) => this.content.createCreature(`pc${i + 1}`,
      { classId, raceId: 'human', level } as never, `audit:pc${i + 1}`) as Creature);
  }
  static kind(kind: string, level: number, count = 1): Foe {
    return { label: `${kind} L${level}${count > 1 ? ` x${count}` : ''}`, creatures: Array.from({ length: count }, (_, i) =>
      this.content.createCreature(`foe${i}`, { raceId: kind, level } as never, `audit:${kind}:${i}`) as Creature) };
  }
  static average(dice: string): number {
    const m = /^(\d+)d(\d+)([+-]\d+)?$/.exec(dice);
    return m ? Number(m[1]) * (Number(m[2]) + 1) / 2 + Number(m[3] ?? 0) : Number(dice) || 0;
  }
  static fight(company: Creature[], foes: Creature[], seed: string) {
    const ours = company.map(c => structuredClone(c));
    const theirs = foes.map((c, i) => ({ ...structuredClone(c), id: `foe${i}` }));
    const store = new CreatureStore([...ours, ...theirs]);
    const battle = Battle.encounter(store, [...ours.map(c => ({ creatureId: c.id, team: 'fighters' as const })),
      ...theirs.map(c => ({ creatureId: c.id, team: 'goblins' as const }))], { seed, maxTurns: 150, laws: [] });
    const start = new Map(battle.state.combatants.map(f => [f.id, f.hp]));
    while (!battle.state.outcome) { battle.step(battle.chosen()); }
    const events: CombatEvent[] = battle.events;
    const rounds = events.filter(e => e.type === 'initiative').length;
    const ids = new Set(ours.map(c => c.id));
    const hits = new Map<string, number>();
    for (const e of events) { if (e.type === 'damage' && ids.has(e.actor)) { hits.set(e.target, (hits.get(e.target) ?? 0) + 1); } }
    const left = battle.state.combatants.filter(f => f.team === 'fighters').map(f => 1 - f.hp / (start.get(f.id) || 1));
    return { outcome: battle.state.outcome, rounds, hurt: Math.max(...left), hits, fighters: ours.length,
      foesDown: battle.state.combatants.filter(f => f.team === 'goblins' && f.hp <= 0).length };
  }
  static measure(company: Creature[], foes: Creature[], seed: string, trials: number): Result {
    const r: Result = { rounds: 0, endRounds: 0, oneHit: 0, wiped: 0, won: 0, fled: 0, hurt: 0 };
    let wins = 0, losses = 0;
    for (let t = 0; t < trials; t++) {
      const f = this.fight(company, foes, `${seed}:${t}`);
      if (f.outcome === 'fighters') { wins++; r.won++; r.rounds += f.rounds; }
      else if (f.outcome === 'goblins') { losses++; r.wiped++; r.endRounds += f.rounds; }
      else { r.fled++; }
      if (f.outcome === 'fighters' && f.rounds <= 1) { r.oneHit++; }
      r.hurt += f.hurt;
    }
    return { rounds: wins ? +(r.rounds / wins).toFixed(1) : 0,
      endRounds: losses ? +(r.endRounds / losses).toFixed(1) : 0,
      oneHit: +(r.oneHit / trials).toFixed(2), wiped: +(r.wiped / trials).toFixed(2), won: +(r.won / trials).toFixed(2),
      fled: +(r.fled / trials).toFixed(2), hurt: +(r.hurt / trials).toFixed(2) };
  }
  static row(group: string, foe: Foe, trials: number): Row {
    const fs = foe.creatures.map(c => new CreatureStore([structuredClone(c)])).map(s => s.live[0]!);
    const named = fs.map((c, i) => ({ ...structuredClone(c), id: `foe${i}` }));
    const probe = Battle.encounter(new CreatureStore([...this.party('solo'), ...named]),
      [{ creatureId: 'pc1', team: 'fighters' }, ...named.map(c => ({ creatureId: c.id, team: 'goblins' as const }))],
      { seed: 'p', maxTurns: 10, laws: [] });
    const f = probe.state.combatants.filter(x => x.team === 'goblins');
    const hp = f.reduce((s, x) => s + x.maxHp, 0);
    const ac = f.length ? f.reduce((s, x) => s + (x.equipment.armorAc ?? 0), 0) / f.length : 0;
    const dmg = f.reduce((s, x) => s + this.average(x.equipment.weapon?.damage ?? '0'), 0);
    return { group, label: foe.label, foes: f.length, hp, ac: +ac.toFixed(1), dmg: +dmg.toFixed(1),
      solo: this.measure(this.party('solo'), foe.creatures, `${group}:${foe.label}:solo`, trials),
      four: this.measure(this.party('four'), foe.creatures, `${group}:${foe.label}:four`, trials) };
  }
  static table(rows: Row[]): string {
    const head = 'group | foe | n | HP | AC | dmg/rd | solo: rds-to-kill / rds-to-die / 1-round / wiped'
      + ' | four: rds-to-kill / rds-to-die / 1-round / wiped';
    return [head, ...rows.map(r => `${r.group} | ${r.label} | ${r.foes} | ${r.hp} | ${r.ac} | ${r.dmg} | `
      + `${r.solo.rounds} / ${r.solo.endRounds} / ${r.solo.oneHit} / ${r.solo.wiped} | `
      + `${r.four.rounds} / ${r.four.endRounds} / ${r.four.oneHit} / ${r.four.wiped}`)].join('\n');
  }
  static option(args: string[], name: string, fallback: string): string {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] ?? fallback : fallback;
  }
  static async main(args: string[]): Promise<number> {
    const mode = args[0] ?? 'kinds', trials = Number(this.option(args, 'trials', '16'));
    const only = this.option(args, 'only', '').split(',').filter(Boolean);
    const rows: Row[] = [];
    if (mode === 'kinds') {
      const levels = this.option(args, 'levels', '1,3,5').split(',').map(Number);
      const kinds = BestiaryTool.measurable().filter(k => !only.length || only.includes(k));
      for (const kind of kinds) {
        for (const level of levels) {
          try { rows.push(this.row('kind', this.kind(kind, level), trials)); }
          catch (e) { console.error(kind, String(e).slice(0, 80)); }
        }
      }
    } else {
      const { EncounterBands } = await import('./encounter-bands');
      rows.push(...await EncounterBands.rows(mode, { args, trials, only }, this));
    }
    console.log(this.table(rows));
    const out = this.option(args, 'out', '');
    if (out) { writeFileSync(out, `${JSON.stringify(rows)}\n`); }
    return 0;
  }
}
if (import.meta.main) { process.exitCode = await EncounterAudit.main(process.argv.slice(2)); }
