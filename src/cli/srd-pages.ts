
// The Revised (v.3.5) SRD's monsters and spells as reference values (the concordance the SRD adaptation briefing
// asks for: raw source values kept apart from live records). Read from the HTML conversion at
// github.com/olimot/srd-v3.5, downloaded into a directory of its own: bun scripts/srd-extract.ts <that directory>.
// scripts/srd-extract.ts writes data/sources/srd35/monsters.json and spells.json from it. Only what the fidelity
// census compares is kept.
export interface Attack { name: string; count: number; dice: string; plus: number; touch?: boolean }
export interface Monster {
  name: string; page: string; type: string; hitDice: string; hp: number; ac: number; natural: number;
  attacks: Attack[]; specialAttacks: string[]; specialQualities: string[]; saves: Record<string, number>;
  scores: Record<string, number | null>; cr: string; reduction: { amount: number; unless: string[] }[];
  resistance: Record<string, number>; immunity: string[]; sr?: number; regeneration?: number; fastHealing?: number;
}
export interface Spell {
  name: string; school: string; descriptors: string[]; levels: Record<string, number>; range: string;
  targets: string; duration: string; save: string; sr: string;
  damage?: { dice: string; per?: 'level' | 'two levels'; max?: string; type: string; plus?: string };
  heal?: { dice: string; plus?: string; max?: string };
}
export class SrdPages {
  static text(s: string): string {
    return s.replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
      .replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
  }
  static slug(s: string): string { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  static readonly sizes = ['fine', 'diminutive', 'tiny', 'small', 'medium', 'large', 'huge', 'gargantuan', 'colossal'];
  // Every stat-block table on a page, each column one creature, named by its header or the heading over it.
  static monsters(file: string, html: string): [string, Monster][] {
    const out: [string, Monster][] = [];
    const parts = html.split(/(<h[23][^>]*>[\s\S]*?<\/h[23]>|<table[\s\S]*?<\/table>)/);
    let heading = '';
    for (const part of parts) {
      if (/^<h[23]/.test(part)) { heading = SrdPages.text(part); continue; }
      if (!/^<table/.test(part) || !/Hit Dice:/.test(part)) { continue; }
      out.push(...SrdPages.table(file, heading, part));
    }
    return out;
  }
  static table(file: string, heading: string, table: string): [string, Monster][] {
    const rows = [...table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(r => [...r[1]!
      .matchAll(/<t([hd])[^>]*>([\s\S]*?)<\/t[hd]>/g)].map(c => ({ th: c[1] === 'h', text: SrdPages.text(c[2]!) })));
    const named = rows[0]!.slice(1).every(c => c.th) ? rows.shift()!.slice(1).map(c => c.text) : [heading];
    const kinds = rows[0]![0]!.text === '' ? rows[0]!.slice(1).map(c => c.text) : [];
    return named.map((column, i) => {
      const name = this.sizes.some(s => column.toLowerCase().startsWith(s)) && !column.toLowerCase().includes(
        heading.toLowerCase().split(' ').at(-1)!) ? `${heading} (${column})` : column;
      return [SrdPages.slug(name), SrdPages.monster(file, name, kinds[i] ?? '', label => SrdPages.row(rows, label)[i] ?? '')];
    });
  }
  static row(rows: { th: boolean; text: string }[][], label: string): string[] {
    return rows.find(r => r[0]?.text.startsWith(label))?.slice(1).map(c => c.text) ?? [];
  }
  static monster(file: string, name: string, type: string, at: (label: string) => string): Monster {
    const hd = at('Hit Dice:'), ac = at('Armor Class:');
    const qualities = this.list(at('Special Qualities:')), defences = this.defences(qualities.join(', '));
    return { name, page: file, type, hitDice: (hd.match(/^([^(]+)\(/)?.[1] ?? hd).replace(/\s+/g, ''),
      hp: Number(hd.match(/\((\d+) hp\)/)?.[1] ?? 0), ac: Number(ac.match(/^(\d+)/)?.[1] ?? 0),
      natural: Number(ac.match(/\+(\d+) natural/)?.[1] ?? 0), attacks: this.attacks(at('Full Attack:')),
      specialAttacks: this.list(at('Special Attacks:')), specialQualities: qualities, saves: this.saves(at('Saves:')),
      scores: this.scores(at('Abilities:')), cr: at('Challenge Rating:'), ...defences };
  }
  static list(s: string): string[] { return s && s !== '-' ? s.split(/,\s*(?![^()]*\))/).map(x => x.trim()) : []; }
  // "Bite +2 melee (1d6+1 plus paralysis) and 2 claws +0 melee (1d3 plus paralysis)": the first routine only.
  // A blow of a routine: "2 claws +0 melee (1d3 plus paralysis)", its count, its name, and what it deals.
  static readonly blow = new RegExp("^(\\d+)?\\s*([A-Za-z' -]+?)\\s*[+-]\\d+(?:\\/[+-]\\d+)*\\s+(melee|ranged)"
    + '(?: touch)?,?\\s*\\(([^)]*)\\)');
  static attacks(s: string): Attack[] {
    const first = s.split(/;\s*or\s+|\bor\b/)[0]!;
    return first.split(/\s+and\s+|,\s+(?!\()/).flatMap(part => {
      const m = part.match(SrdPages.blow);
      if (!m) { return []; }
      const dice = m[4]!.match(/(\d+d\d+)([+-]\d+)?/);
      return dice ? [{ name: m[2]!.trim().toLowerCase(), count: Number(m[1] ?? 1), dice: dice[1]!,
        plus: Number(dice[2] ?? 0), ...part.includes('touch') ? { touch: true } : {} }] : [];
    });
  }
  static saves(s: string): Record<string, number> {
    return { fortitude: SrdPages.bonus(s, 'Fort'), reflex: SrdPages.bonus(s, 'Ref'), will: SrdPages.bonus(s, 'Will') };
  }
  static bonus(s: string, k: string): number { return Number(s.match(new RegExp(`${k} ([+-]\\d+)`))?.[1] ?? NaN); }
  static score(s: string, k: string): number | null {
    const m = s.match(new RegExp(`${k} (\\d+|-)`));
    return m && m[1] !== '-' ? Number(m[1]) : null;
  }
  static scores(s: string): Record<string, number | null> {
    const n = ['Str', 'Dex', 'Con', 'Int', 'Wis', 'Cha'].map(k => SrdPages.score(s, k));
    return { strength: n[0]!, dexterity: n[1]!, constitution: n[2]!, intelligence: n[3]!, wisdom: n[4]!,
      charisma: n[5]! };
  }
  static defences(s: string) {
    const reduction = [...s.matchAll(/damage reduction (\d+)\/([a-z -]+?)(?=,|$| and)/gi)].map(m => ({
      amount: Number(m[1]), unless: m[2]!.trim() === '-' ? [] : m[2]!.split(/ and | or /).map(x => x.trim()) }));
    const resistance = Object.fromEntries([...s.matchAll(/resistance to ([a-z ,]+?) (\d+)/gi)].flatMap(m =>
      m[1]!.split(/,\s*| and /).filter(Boolean).map(k => [k.trim(), Number(m[2])])));
    const immunity = [...s.matchAll(/immunity to ([a-z ,]+?)(?=,\s*[a-z]+ [a-z]|$|\.)/gi)].flatMap(m =>
      m[1]!.split(/,\s*| and /).map(x => x.trim()).filter(Boolean));
    const sr = s.match(/spell resistance (\d+)/i), regen = s.match(/regeneration (\d+)/i);
    const fast = s.match(/fast healing (\d+)/i);
    return { reduction, resistance, immunity, ...sr ? { sr: Number(sr[1]) } : {},
      ...regen ? { regeneration: Number(regen[1]) } : {}, ...fast ? { fastHealing: Number(fast[1]) } : {} };
  }
  static spells(file: string, html: string): [string, Spell][] {
    return html.split(/<h2 id="/).slice(1).flatMap(part => {
      const id = part.slice(0, part.indexOf('"'));
      const name = SrdPages.text(part.slice(part.indexOf('>') + 1, part.indexOf('</h2>')));
      const ps = [...part.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(p => SrdPages.text(p[1]!));
      const level = SrdPages.said(ps, 'Level');
      if (!level) { return []; }
      const head = ps[0]!, school = head.match(/^([A-Za-z]+)/)?.[1]?.toLowerCase() ?? '';
      const body = ps.filter(p => !/^[A-Z][a-zA-Z ]+:/.test(p)).join(' ');
      const spell: Spell = { name, school, descriptors: [...head.matchAll(/\[([^\]]+)\]/g)].flatMap(m => m[1]!
        .split(/,\s*/).map(x => x.toLowerCase())), levels: Object.fromEntries([...level.matchAll(/([A-Za-z/]+) (\d)/g)]
        .map(m => [m[1]!, Number(m[2])])), range: SrdPages.said(ps, 'Range'),
        targets: SrdPages.said(ps, 'Target') || SrdPages.said(ps, 'Targets') || SrdPages.said(ps, 'Area') || SrdPages.said(ps, 'Effect') || SrdPages.said(ps, 'Target or Targets'),
        duration: SrdPages.said(ps, 'Duration'), save: SrdPages.said(ps, 'Saving Throw'), sr: SrdPages.said(ps, 'Spell Resistance') };
      Object.assign(spell, this.harm(body, spell.descriptors));
      return [[id, spell] as [string, Spell]];
    });
  }
  static said(ps: string[], label: string): string {
    return ps.find(p => p.startsWith(`${label}:`))?.slice(label.length + 1).trim() ?? '';
  }
  static harm(body: string, descriptors: string[]): Pick<Spell, 'damage' | 'heal'> {
    const per = '(?: ?\\+ ?1 point per caster level \\(maximum \\+(\\d+)\\))?';
    const h = body.match(new RegExp(`cures? (\\d+d\\d+)(?:\\+(\\d+))? points of damage${per}`));
    const d = body.match(new RegExp('(\\d+d\\d+)(?: ?\\+ ?(\\d+))?(?: points?)?(?: of)? ?([a-z]+)? damage'
      + `(?: per (?:caster )?level| per two caster levels)?${per}(?:[^.(]*?\\(maximum (\\d+d\\d+)\\))?`));
    const types = ['fire', 'cold', 'electricity', 'acid', 'sonic', 'force', 'negative', 'positive'];
    const said = d?.[3] && types.includes(d[3]) ? d[3] : descriptors.find(x => types.includes(x)) ?? 'untyped';
    const levelled = d?.[0].replace(/ ?\+ ?1 point per caster level.*$/, '').match(/ per (caster )?level| per two caster levels/)?.[0];
    if (h) { return { heal: { dice: h[1]! + (h[2] ? `+${h[2]}` : ''), ...h[3] ? { plus: `level, maximum ${h[3]}` } : {} } }; }
    return d ? { damage: { dice: d[1]! + (d[2] ? `+${d[2]}` : ''), type: said,
      ...levelled ? { per: levelled.includes('two') ? 'two levels' : 'level' } : {},
      ...d[5] ? { max: d[5] } : {}, ...d[4] ? { plus: `level, maximum ${d[4]}` } : {} } } : {};
  }
}
