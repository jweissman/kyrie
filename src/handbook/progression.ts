import { Canon } from '../canon/canon';
import { Advancement } from '../rules/advancement';
import { Creation } from '../rules/creation';
import { Fighting } from '../rules/fighting';
import type { Problem, Section } from './model';

interface Level { level: number; slots: number[]; gains: string[] }

// Each calling from level 1 to 20: what a level brings in kind (a technique, a calling trait, a new spell level, a
// feat) beside the hit die and the quality point every level gives. A stretch of levels that brings nothing in kind
// is reported, so that a dead level is a known fact rather than a surprise.
export class Progression {
  static readonly top = 20;
  static readonly dead = 4;
  static levels(classId: string): Level[] {
    const c = Canon.classes[classId]!;
    let held: string[] = [], previous: number[] = [];
    return Array.from({ length: this.top }, (_, i) => i + 1).map(level => {
      const slots = c.spellcasting ? c.spellcasting.slots[Math.min(level, c.spellcasting.slots.length) - 1] ?? [] : [];
      const features = level > 1 ? Creation.features(classId, level - 1, level) : { abilities: [], traits: [] };
      const gains = [...features.abilities.map(a => Canon.abilities[a]!.name),
        ...features.traits.map(t => Canon.traits[t]!.name), ...slots.length > previous.length ? [`level ${slots.length} spells`] : []];
      if (level % 5 === 0 && level < 20) {
        const feat = this.feat(classId, level, held);
        if (feat) { held = [...held, feat]; gains.push(`a feat (${Canon.traits[feat]!.name}, or another)`); }
      }
      previous = slots;
      return { level, slots, gains };
    });
  }
  // The first feat a companion could take at a level, given those already taken: enough to know one is offered.
  static feat(classId: string, level: number, held: string[]): string | undefined {
    return Object.entries(Canon.traits).find(([id, t]) => t.category === 'feat' && !t.unsupported
      && t.requires?.class === classId && (t.requires?.level ?? 1) <= level && !held.includes(id)
      && !(t.excludes ?? []).some(x => held.includes(x))
      && !held.some(h => Canon.traits[h]?.excludes?.includes(id)))?.[0];
  }
  static section(classId: string): Section {
    const c = Canon.classes[classId]!, rows = this.levels(classId);
    const head = ['Level', 'Experience', 'THAC0', ...c.spellcasting ? ['Slots'] : [], 'New in kind'];
    return { id: `progression-${classId}`, title: c.name, table: { head, rows: rows.map(r => [String(r.level),
      String(Advancement.threshold(r.level)), String(Fighting.thac0(r.level)), ...c.spellcasting ? [r.slots.join('/')] : [],
      r.gains.join('; ') || '—']) } };
  }
  // Runs of levels after the first in which a calling gains nothing in kind.
  static stretches(classId: string): [number, number][] {
    const out: [number, number][] = [];
    let start = 0;
    for (const r of this.levels(classId).slice(1)) {
      if (r.gains.length) { if (start && r.level - start >= this.dead) { out.push([start, r.level - 1]); } start = 0; }
      else if (!start) { start = r.level; }
    }
    if (start && this.top + 1 - start >= this.dead) { out.push([start, this.top]); }
    return out;
  }
  static problems(): Problem[] {
    return Object.entries(Canon.classes).filter(([, c]) => c.playable).flatMap(([id, c]) => this.stretches(id)
      .map(([a, b]): Problem => ({ book: 'phb', entry: `class:${id}`, kind: 'dead levels',
        text: `${c.name}: levels ${a}–${b} bring nothing new in kind.` })));
  }
}
