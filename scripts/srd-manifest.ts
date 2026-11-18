#!/usr/bin/env bun
// The SRD spell manifest (the SRD migration strategy of 18 November, Phase A; doc/architecture/reviews/
// srd-spell-migration-strategy-2026-11-18.md): every one of the extracted SRD's spell records made visible, none
// silently absent. Each is proposed a semantic family from its structured fields (school, descriptors, name, target,
// duration, save, dice: no rules text is extracted), the capabilities it would need, and an execution grade: E3 where
// its resolution passes the fidelity census and a focused test proves its play identity, E2 where its resolution
// passes, E1 where it is mapped and castable, E0 where it is unmapped (with what blocks it, or ready where it needs
// nothing the engine lacks). A family is a proposal, never an approval (the strategy's §9). Writes
// doc/architecture/mission-21/rules/srd-manifest.md and .json.
//   bun scripts/srd-manifest.ts [--check]
import { readFileSync, writeFileSync } from 'node:fs';
import srd from '../data/sources/srd35/spells.json';
import { SpellFidelity, type SrdSpell } from '../src/cli/srd-spell-fidelity';

type Grade = 'E0' | 'E1' | 'E2' | 'E3';
interface Entry { id: string; name: string; levels: string; school: string; family: string; needs: string[];
  missing: string[]; mapped?: string; grade: Grade }

export class SrdManifest {
  static readonly spells = (srd as unknown as { spells: Record<string, SrdSpell> }).spells;
  // What the engine has today (18 November): areas by burst, cone, line and chain, Hit Dice pools, partial and repeated
  // saves, damage and healing scaled by casting level, conditions with a duration, field casting and planar travel.
  // Everything else a record needs is missing, and blocks it.
  static readonly present = new Set(['area.burst', 'area.cone', 'area.line', 'area.chain', 'effect.harm', 'effect.heal',
    'effect.condition', 'effect.travel', 'duration.converted']);
  // Families by name first (what a spell is for), then by its fields.
  static readonly named: [string, RegExp][] = [
    ['summoning', /summon|nature's ally|planar ally|planar binding|^gate$|animate dead|create (greater )?undead/i],
    ['transformation', /polymorph|shapechange|alter self|baleful|flesh to stone|stone to flesh|tree shape|animal shape|statue|reduce person|enlarge person|righteous might/i],
    ['communication', /sending|message|tongues|speak with|whispering wind|telepathic|commune|contact other plane/i],
    ['movement', /teleport|plane shift|dimension door|word of recall|^fly|jump|haste|expeditious|passwall|etherealness|levitate|spider climb|water walk|wind walk|freedom of movement|phase door|shadow walk|astral projection|transport via plants|tree stride/i],
    ['creation', /^wall of|create (food|water)|fabricate|creation$|mansion|rope trick|secure shelter|tiny hut|unseen servant|floating disk|mage's (magnificent|faithful)|instant summons|forcecage|prismatic wall/i],
    ['removal', /dispel|remove (curse|disease|fear|blindness|paralysis)|break enchantment|neutralize poison|restoration|delay poison|disjunction|antimagic/i],
    ['divination', /detect|scry|identify|locate|see invisibility|true seeing|vision|augury|divination|clairaudience|legend lore|find the path|discern|arcane eye|prying eyes|analyze dweomer|status|know direction|read magic|comprehend/i],
    ['protection', /protection from|resist|shield|ward|globe|sanctuary|armor|endure|^aid$|bless|prayer|bull's|cat's|bear's|eagle's|fox's|owl's|heroism|magic vestment|magic weapon|magic fang|barkskin|stoneskin|mind blank|spell turning|death ward|freedom|nondetection|invisibility|blur|displacement|mirror image|false life|virtue|divine favor|bless weapon/i],
  ];
  static family(s: SrdSpell): string {
    if (s.damage) { return 'damage'; }
    if (s.heal) { return 'healing'; }
    const named = this.named.find(([, re]) => re.test(s.name));
    if (named) { return named[0]; }
    if (s.school === 'illusion') { return 'illusion'; }
    if (s.school === 'divination') { return 'divination'; }
    if (/negates|partial/i.test(s.save) && !/harmless/i.test(s.save) && !/instantaneous/i.test(s.duration)) {
      return 'control';
    }
    return 'world';
  }
  static readonly effects: Record<string, string> = { damage: 'effect.harm', healing: 'effect.heal',
    control: 'effect.condition', protection: 'effect.condition', summoning: 'effect.summon',
    transformation: 'effect.transform', communication: 'effect.contact', movement: 'effect.travel',
    creation: 'effect.create', removal: 'effect.dispel', divination: 'effect.reveal', illusion: 'effect.manifest',
    world: 'effect.world' };
  // What a record needs, from its fields.
  static needs(s: SrdSpell, family: string): string[] {
    const t = s.targets.toLowerCase(), d = s.duration.toLowerCase(), out = new Set([this.effects[family]!]);
    if (/^yes/i.test(s.sr) && !/harmless/i.test(s.sr)) { out.add('resist.spell'); }
    if (s.attack === 'melee touch') { out.add('attack.meleeTouch'); }
    if (s.attack === 'ranged touch') { out.add('attack.rangedTouch'); }
    if (/concentration/.test(d)) { out.add('duration.concentration'); }
    if (/level/.test(d)) { out.add('duration.converted'); }
    if (/object/.test(t)) { out.add('target.object'); }
    if (/cone/.test(t)) { out.add('area.cone'); } else if (/line/.test(t)) { out.add('area.line'); }
    else if (/primary target/.test(t)) { out.add('area.chain'); }
    else if (/spread|burst|radius|emanation|cylinder|cloud/.test(t)) { out.add('area.burst'); }
    if (/^see text/i.test(s.save) || /see text/i.test(t)) { out.add('review.text'); }
    return [...out].sort();
  }
  static entries(): Entry[] {
    const mapped = new Map(Object.entries(SpellFidelity.map).map(([ours, key]) => [key, ours]));
    const rows = new Map(SpellFidelity.rows().map(r => [r.srd, r]));
    return Object.entries(this.spells).map(([id, s]) => {
      const family = this.family(s), needs = this.needs(s, family);
      const missing = needs.filter(n => !this.present.has(n)), ours = mapped.get(id), row = rows.get(id);
      const passes = row?.grades.resolution === 'pass';
      const grade: Grade = !row ? 'E0' : passes && row.grades.identity === 'proved' ? 'E3' : passes ? 'E2' : 'E1';
      return { id, name: s.name, school: s.school, family, needs, missing, grade,
        levels: Object.entries(s.levels).map(([list, n]) => `${list} ${n}`).join(', '), ...ours ? { mapped: ours } : {} };
    }).sort((a, b) => a.id.localeCompare(b.id));
  }
  private static counter(es: Entry[]): (f: (e: Entry) => boolean) => number {
    return SrdManifest.tally.bind(undefined, es);
  }
  private static tally(this: void, es: Entry[], f: (e: Entry) => boolean): number { return es.filter(f).length; }
  static report(es: Entry[]): string {
    const count = this.counter(es), grades = ['E0', 'E1', 'E2', 'E3'] as const;
    const families = [...new Set(es.map(e => e.family))].sort();
    const caps = [...new Set(es.flatMap(e => e.missing))].sort();
    const demand = caps.map(c => ({ c, blocks: count(e => e.grade === 'E0' && e.missing.includes(c)),
      alone: count(e => e.grade === 'E0' && e.missing.length === 1 && e.missing[0] === c) }))
      .sort((a, b) => b.alone - a.alone || b.blocks - a.blocks);
    return ['# The SRD spell manifest', '',
      `Generated by \`bun scripts/srd-manifest.ts\` from data/sources/srd35/spells.json and the fidelity census (the`,
      'SRD migration strategy, Phase A). Families are proposed from structured fields, never approved; the catch-all',
      '`world` is what no field placed, to be reviewed. Grades: E3 resolution passes and play identity proved, E2',
      'resolution passes, E1 mapped and castable, E0 unmapped. Do not edit by hand.', '',
      `**${es.length} records**, every one visible: ${grades.map(g => `${g} ${count(e => e.grade === g)}`).join(', ')}.`,
      `Unmapped and needing nothing the engine lacks (E0, ready for a family adapter): ${count(e => e.grade === 'E0' && !e.missing.length)}.`,
      '', '## By family', '', '| Family | Records | Mapped (E1+) | E0 ready | E0 blocked |', '|---|---:|---:|---:|---:|',
      ...families.map(f => `| ${f} | ${count(e => e.family === f)} | ${count(e => e.family === f && e.grade !== 'E0')} | ${count(e => e.family === f && e.grade === 'E0' && !e.missing.length)} | ${count(e => e.family === f && e.grade === 'E0' && e.missing.length > 0)} |`),
      '', '## Capability demand', '', 'What each missing capability blocks among the unmapped records, and how many it alone blocks (built, they',
      'become ready).', '', '| Capability | Blocks | Alone |', '|---|---:|---:|',
      ...demand.map(d => `| ${d.c} | ${d.blocks} | ${d.alone} |`),
      '', '## Every record', '', '| SRD id | Name | Lists | Family | Grade | Missing | Westernesse |', '|---|---|---|---|---|---|---|',
      ...es.map(e => `| ${e.id} | ${e.name} | ${e.levels} | ${e.family} | ${e.grade} | ${e.missing.join(', ') || '—'} | ${e.mapped ?? '—'} |`),
      ''].join('\n');
  }
  static main(argv: string[]): number {
    const es = this.entries(), md = this.report(es), json = `${JSON.stringify(es, null, 1)}\n`;
    const base = 'doc/architecture/mission-21/rules/srd-manifest';
    if (argv.includes('--check')) {
      const same = readFileSync(`${base}.md`, 'utf8') === md && readFileSync(`${base}.json`, 'utf8') === json;
      console.log(same ? 'srd-manifest: current' : 'srd-manifest: stale (bun scripts/srd-manifest.ts)');
      return same ? 0 : 1;
    }
    writeFileSync(`${base}.md`, md); writeFileSync(`${base}.json`, json);
    console.log(md.split('\n').slice(6, 9).join('\n'));
    return 0;
  }
}
if (import.meta.main) { process.exit(SrdManifest.main(process.argv.slice(2))); }
