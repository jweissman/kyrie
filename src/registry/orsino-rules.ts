export interface RuleEntry { family: string; key: string; file: string; definition: Record<string, unknown> }

// Rule vocabularies that live in Orsino's TypeScript rather than its JSON: save categories and their attributes,
// damage kinds, status modifier keys, effect and target kinds, and the core formulas. Parsed from source text so the
// registry can show which mechanics an entry depends on.
export class OrsinoRules {
  static extract(code: Record<string, string>): RuleEntry[] {
    const commands = this.text(code, 'src/orsino/rules/Commands.ts'), fighting = this.text(code, 'src/orsino/rules/Fighting.ts');
    const saveAttributes = Object.fromEntries([...commands.matchAll(/"(\w+)": Fighting\.statMod\(target\.(\w+)\)/g)]
      .map(m => [m[1]!, m[2]!]));
    const saves = this.arrayLiteral(this.text(code, 'src/orsino/types/SaveKind.ts'), 'SAVE_KINDS');
    const damage = this.arrayLiteral(this.text(code, 'src/orsino/types/DamageKind.ts'), 'DAMAGE_KINDS');
    const magic = this.arrayLiteral(this.text(code, 'src/orsino/types/DamageKind.ts'), 'magicKinds');
    const status = this.text(code, 'src/orsino/Status.ts');
    const body = status.slice(status.indexOf('export interface StatusModifications {'));
    const modifiers = [...body.slice(0, body.indexOf('\n}')).matchAll(/^ {2}(\w+)\?:\s*([^\n]+?);?$/gm)]
      .map(m => ({ key: m[1]!, type: m[2]!.trim() }));
    const ability = this.text(code, 'src/orsino/Ability.ts');
    return [
      ...saves.map(key => ({ family: 'saveKind', key, file: 'src/orsino/types/SaveKind.ts',
        definition: { attribute: saveAttributes[key] ?? null, modifier: `saveVersus${this.cap(key)}`,
          immunity: `immune${this.cap(key)}`, onSave: `onSaveVersus${this.cap(key)}` } })),
      ...damage.map(key => ({ family: 'damageKind', key, file: 'src/orsino/types/DamageKind.ts',
        definition: { magic: magic.includes(key), resistance: `resist${this.cap(key)}` } })),
      ...modifiers.map(m => ({ family: 'statusModifier', key: m.key, file: 'src/orsino/Status.ts',
        definition: { type: m.type } })),
      ...this.union(ability, 'AbilityType').map(key => ({ family: 'effectType', key, file: 'src/orsino/Ability.ts', definition: {} })),
      ...this.union(ability, 'TargetKind').map(key => ({ family: 'targetKind', key, file: 'src/orsino/Ability.ts', definition: {} })),
      ...([['statMod', /static statMod\(stat: number\): number \{[^}]*\}/],
        ['thac0', /static thac0\(level: number\): number \{[^}]*\}/],
        ['saveTarget', /const saveVersus = dc - saveValue - target\.level;/],
        ['saveValue', /const saveValue = [^;]*;/],
        ['maxSaves', /if \(saveCount >= 3\)/],
        ['attackTarget', /const whatNumberHits = thac0 - ac - toHitBonus;/],
        ['spellSaveDc', /const spellDC = 15 \+ [^;]*;/],
        ['debuffSaveDc', /const dc = \(effect\.saveDC \|\| 15\) \+ [^;]*;/],
      ] as const).map(([key, pattern]) => ({ family: 'formula', key,
        file: key === 'statMod' || key === 'thac0' || key === 'attackTarget' ? 'src/orsino/rules/Fighting.ts'
          : key.endsWith('Dc') ? 'src/orsino/Ability.ts' : 'src/orsino/rules/Commands.ts',
        definition: { source: this.find(key.endsWith('Dc') ? ability : `${fighting}\n${commands}`, pattern) } })),
    ];
  }
  private static text(code: Record<string, string>, path: string): string {
    const source = code[path];
    if (source === undefined) { throw new Error(`Missing Orsino source ${path}`); }
    return source.split('\n').filter(line => !line.trim().startsWith('//')).join('\n');
  }
  private static union(source: string, name: string): string[] {
    const start = source.indexOf(`export type ${name}`);
    return [...source.slice(start, source.indexOf(';', start)).matchAll(/"(\w+)"/g)].map(m => m[1]!);
  }
  private static find(source: string, pattern: RegExp): string {
    const match = source.match(pattern);
    if (!match) { throw new Error(`Orsino formula ${String(pattern)} not found`); }
    return match[0].replace(/\s+/g, ' ').trim();
  }
  private static arrayLiteral(source: string, name: string): string[] {
    const start = source.indexOf(name);
    if (start < 0) { throw new Error(`Orsino array ${name} not found`); }
    const open = source.indexOf('[', start), close = source.indexOf(']', open);
    return [...source.slice(open, close).matchAll(/"(\w+)"/g)].map(m => m[1]!);
  }
  private static cap(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
}
