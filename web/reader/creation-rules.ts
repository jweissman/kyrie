import type { Catalog, Member } from '../engine/protocol';

type Calling = Catalog['callings'][number];
type Weapon = Calling['weapons'][number];

// What a choice at creation is by the rules, said exactly rather than as "+2 in a fight": what a quality's score adds
// to a blow and to a check, and what else rests on it; what a weapon does, what it is struck with, and what that
// comes to at the score you have. Fighting adds round((score − 10) / 2) (Orsino's), a check ⌊(score − 10) / 2⌋, so a
// score can add one to a blow and nothing to a roll (see Fighting, Checks).
export class CreationRules {
  static fight(score: number): number { return Math.round((score - 10) / 2) || 0; }
  static check(score: number): number { return Math.floor((score - 10) / 2); }
  static signed(n: number): string { return n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '+0'; }
  // A quality's score with what the people, the calling and the background add to the roll.
  static score(member: Member, catalog: Catalog, quality: string): number {
    const rolled = (member.rolled as Record<string, number> | undefined)?.[quality] ?? 10;
    const people = catalog.ancestries.find(a => a.id === member.raceId)?.qualities[quality] ?? 0;
    const calling = catalog.callings.find(c => c.id === member.classId)?.qualities[quality] ?? 0;
    const background = catalog.backgrounds.find(b => b.id === member.backgroundId)?.qualities[quality] ?? 0;
    return Math.max(1, rolled + people + calling + background);
  }
  // Where what is added to a roll comes from: "+1 elf, +2 warrior, +2 forester".
  // What adds to a quality, by whom: your people, your calling, and what you were before you came, said as that ("+2
  // once a scribe": "+2 scribe" had read as something chosen before anything called scribe was: the cold evaluation).
  static sources(member: Member, catalog: Catalog, quality: string): string {
    const before = catalog.backgrounds.find(b => b.id === member.backgroundId);
    const from = [catalog.ancestries.find(a => a.id === member.raceId),
      catalog.callings.find(c => c.id === member.classId),
      before && { ...before, name: `once ${/^[aeiou]/i.test(before.name) ? 'an' : 'a'} ${before.name}` }];
    return from.flatMap(x => x?.qualities[quality] ? [`${this.signed(x.qualities[quality]!)} ${x.name.toLowerCase()}`]
      : []).join(', ');
  }
  // What a quality does at a score, line by line, for someone of a calling. A save is the die, the quality's fighting
  // measure and the level (one, at creation), as the sheet's saves are; a sheet, which says its saves exactly with
  // what is worn counted, asks for the lines without them (play 7 read "Against madness: −1" over "+0 and the die").
  static quality(id: string, score: number, calling?: Calling, saves = true): string[] {
    return this.does(id, score, calling).map(l => saves ? l : l.replace(/ ?(Against|Getting out of the way)[^.:]*: [^.]*\./g, ''))
      .filter(Boolean);
  }
  private static does(id: string, score: number, calling?: Calling): string[] {
    const f = this.signed(this.fight(score)), harm = this.signed(Math.max(0, this.fight(score)));
    const k = this.signed(this.check(score)), spells = calling?.casts === id ? [this.casting(calling)] : [];
    const save = `${this.signed(this.fight(score) + 1)} and the die`;
    switch (id) {
      case 'strength': return [`A blow with a weapon in the hand: ${f} to hit, ${harm} to the harm it does.`,
        `Climbing, and lifting or forcing what is stuck: ${k} to the roll. Against paralysis: ${save}.`];
      case 'dexterity': return [this.dodge(this.fight(score)),
        `A shot with a bow, a sling or a dart: ${f} to hit, ${harm} to the harm it does.`,
        `Going unseen, locks and traps: ${k} to the roll. Getting out of the way of a blast: ${save}.`];
      case 'constitution': return [`Hit points: your calling's die${calling ? ` (${calling.hitDie})` : ''} at first level`
        + `${this.fight(score) > 0 ? `, and ${this.fight(score)} more` : ''}; half the die again at each level after, ${f}.`,
      `Against poison, disease, bleeding, stunning, breath and the cold: ${save}. Digging: ${k} to the roll.`];
      case 'intelligence': return [`Old histories, scripts and the workings of magic: ${k} to the roll. Against`
        + ` madness: ${save}.`, ...spells];
      case 'wisdom': return [`Searching a place: ${f}. Reading people and country, tending wounds, the rites, and the`
        + ` way across country: ${k} to the roll. Against magic, charms, fear and sleep: ${save}.`, ...spells];
      case 'charisma': return [`Talking people round, a lie that holds, or frightening someone: ${k} to the roll.`, ...spells];
      default: return [];
    }
  }
  // How much harder a quick body is to hit: what a blow at you must roll the more, or the less.
  private static dodge(n: number): string {
    return n > 0 ? `Harder to hit: blows at you need ${n} more to land.` : n < 0
      ? `Easier to hit: blows at you need ${-n} less to land.` : 'No harder or easier to hit than anyone.';
  }
  private static casting(calling: Calling): string {
    const of = { mage: 'spells', cleric: 'prayers', bard: 'songs' }[calling.id] ?? 'spells';
    return `A ${calling.name.toLowerCase()}'s ${of}: at 14 or more, one more first-level ${of.slice(0, -1)} a day.`;
  }
  // A weapon as the rules have it: its die and what it averages, the harm it does, and how it is struck with.
  static average(damage: string): number {
    const m = /^(\d+)d(\d+)(?:\+(\d+))?$/.exec(damage);
    return m ? Number(m[1]) * (Number(m[2]) + 1) / 2 + Number(m[3] ?? 0) : 0;
  }
  static weapon(w: Weapon, member: Member, catalog: Catalog): { harm: string; struck: string; also?: string } {
    const calling = catalog.callings.find(c => c.id === member.classId), by = w.missile ? 'dexterity' : 'strength';
    const mod = this.fight(this.score(member, catalog, by)), avg = this.average(w.damage) + Math.max(0, mod);
    return { harm: `${w.damage} ${w.type}, ${this.round(avg)} a blow on average with your ${by}`,
      struck: w.missile ? `Shot: by Dexterity, ${this.signed(mod)} to hit and ${this.signed(Math.max(0, mod))} harm.`
        : `In the hand: by Strength, ${this.signed(mod)} to hit and ${this.signed(Math.max(0, mod))} harm.`,
      ...w.intercept && calling?.braces ? { also: 'Braced against a charge (Set Spear): 3d8 and +4 to hit against a foe'
        + ' that charges you.' } : {} };
  }
  private static round(n: number): string { return Number.isInteger(n) ? String(n) : n.toFixed(1); }
  // The weapon struck with best, by the harm it does on average at your scores; the calling's own first, so that the
  // qualities rolled again do not trade a ranger's bow for a scythe unasked (the cold evaluation).
  static best(weapons: Weapon[], member: Member, catalog: Catalog): Weapon | undefined {
    return weapons.reduce<Weapon | undefined>((b, w) => !b || this.worth(w, member, catalog) > this.worth(b, member,
      catalog) ? w : b, undefined);
  }
  private static worth(w: Weapon, member: Member, catalog: Catalog): number {
    return this.average(w.damage) + this.fight(this.score(member, catalog, w.missile ? 'dexterity' : 'strength')) * 1.5
      + (w.own ? 3 : 0);
  }
  // The kinds weapons come in, as the page groups them.
  static readonly kinds: [string, string][] = [['blade', 'Blades'], ['axe', 'Axes'], ['mace', 'Maces'],
    ['warhammer', 'Hammers'], ['flail', 'Flails'], ['morningstar', 'Flails'], ['pick', 'Picks'], ['club', 'Clubs and staves'],
    ['staff', 'Clubs and staves'], ['spear', 'Spears and polearms'], ['polearm', 'Spears and polearms'], ['whip', 'Chains and whips'],
    ['bow', 'Bows'], ['crossbow', 'Crossbows'], ['sling', 'Thrown and slung'], ['dart', 'Thrown and slung']];
  static group(kind: string): string { return this.kinds.find(([k]) => k === kind)?.[1] ?? 'Other arms'; }
}
