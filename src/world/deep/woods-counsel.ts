
// What the shrine-keeper of the reference town can say of each level below the first of the deep place under the old
// woods, once the company has been down to the level above it (the owner, 25 November: "the early levels teach
// combat, light, provisions, traps, equipment, retreat and recovery; deeper levels expose resistant and unusual
// creatures, … strategic preparation"; register OR-646). Read from what the deep place's generator wrote, never
// declared: bones that turn an edge want something blunt (a reduction unless bludgeoning), the wrapped dead that
// shrug off iron burn (a resistance to physical harm, a weakness to fire), and words written on the ways (an arcane
// glyph, a magical rune) want a long pole or someone who knows the old letters. Each depth so gives a different reason
// to prepare in the town before going down, and the keeper says only what is so of that depth.
interface Depth { id: string; name: string; wants: Set<Want> }
type Want = 'blunt' | 'fire' | 'pole';
export interface Defense { kind: string; unless?: string[]; to?: string[]; amount?: number }
export class WoodsCounsel {
  static readonly said: Record<Want, string> = {
    blunt: 'Bones turn a blade down there. Take something that breaks them: a club, or a mace.',
    fire: 'The wrapped dead hardly feel iron. They burn, though. Take fire.',
    pole: 'The ways down there are written on, and a word on a wall is read by whoever passes it. Carry a long pole, or take someone who knows the old letters.',
  };
  // defenses: a kind of creature's defenses, as the catalog has them (DeepSites.defenses).
  static lines(at: { t: string; w: string; priest: string }, written: string[],
    defenses: (species: string) => Defense[]): string[] {
    const q = JSON.stringify, depths = this.depths(at.w, written, defenses);
    return depths.slice(1).flatMap((d, i) => {
      const above = depths[i]!, wants = [...d.wants];
      if (!wants.length) { return []; }
      const id = `${at.w}_counsel_${i + 2}`;
      return [`  Topic ${id} with ${at.priest} ${q(`Ask {${at.priest}} what lies past ${above.name}`)}`
        + ` when been(party, ?p) and deepLevelOf(?p, ${above.id}) once {`,
        `    Says ${q(`'Past ${above.name} it is worse,' says {${at.priest}}. '${wants.map(w => this.said[w]).join(' ')}'`)}.`,
        '  }'];
    });
  }
  // The deep place's levels in order, each with its rooms and what its dwellers and its ways want.
  static depths(w: string, written: string[], defenses: (species: string) => Defense[]): Depth[] {
    const depths: Depth[] = [], of = new Map<string, Depth>();
    for (const line of written) {
      const level = new RegExp(`^\\s*Place (\\S+) "([^"]+)" is level within ${w}_site\\.`).exec(line);
      if (!level) { continue; }
      const d = { id: level[1]!, name: level[2]!, wants: new Set<Want>() };
      depths.push(d); of.set(d.id, d);
    }
    const room = new Map<string, Depth>();
    for (const line of written) {
      const m = /^\s*Initially Assert deepLevelOf\((\S+), (\S+)\)\./.exec(line);
      if (m && of.has(m[2]!)) { room.set(m[1]!, of.get(m[2]!)!); }
    }
    for (const line of written) {
      const person = /^\s*Person (\S+) "[^"]*" at (\S+) \{.*?\bSpecies (\w+)\./.exec(line);
      const d = person && room.get(person[2]!);
      if (d) { this.wanted(defenses(person[3]!)).forEach(x => d.wants.add(x)); }
      const hazard = /^\s*Hazard (\S+)_trap "the (arcane glyph|magical rune)"/.exec(line);
      if (hazard && room.get(hazard[1]!)) { room.get(hazard[1]!)!.wants.add('pole'); }
    }
    return depths;
  }
  // What a kind of creature's defenses want of whoever fights it, by the catalog's own defenses.
  static wanted(defenses: Defense[]): Want[] {
    return [
      ...defenses.some(d => d.kind === 'reduction' && d.unless?.includes('bludgeoning')) ? ['blunt' as const] : [],
      ...defenses.some(d => d.kind === 'resistance' && d.to?.includes('fire') && (d.amount ?? 0) < 0) ? ['fire' as const] : [],
    ];
  }
}
