// What a creation card says under its name: who a people are, what a calling does, what a school, a god's domain or a
// way is for, in a few words (OWN-14: the cards had carried a gift's rules, or nothing). The sentence beneath the cards
// and the rules behind Details say the rest. A warrior's or a monk's way has a sentence of its own (its rules had been
// its sentence, "1 harder to hit, +2 against death"), and a word for the line of a life ("a dwarf warrior, tough as
// old boots"). And the trade one who comes over the hills with only their trade has until they choose another.
export class CardLines {
  static readonly lines: Record<string, string> = {
    human: 'Quick to any trade', elf: 'Light of foot, keen of eye', dwarf: 'Slow to anger, slower to die',
    warrior: 'Arms and any armour', mage: 'Spells learnt by study', thief: 'Locks, traps, a quick blade',
    cleric: 'A god’s prayers, in armour', bard: 'Songs, lore, a few spells', ranger: 'Bow, spear and woodcraft',
    monk: 'Bare hands, a quick step',
    abjurer: 'Wards and shields', conjurer: 'Acid, cold, called things', diviner: 'Omens and insight',
    enchanter: 'Charms and distraction', evoker: 'Fire, frost, lightning', illusionist: 'Blurs and dancing lights',
    necromancer: 'Hexes and drained life', transmuter: 'Drenching, slowing, opening',
    vitalist: 'Healing and blessing', deathspeaker: 'Curse and drain', lightbringer: 'Radiance and mending',
    shadowmancer: 'Cold and shadow', oathkeeper: 'Holding and guarding', wildcaller: 'Thorn and bark',
    chaotician: 'Ire and confusion', warbringer: 'Smiting and favour', oceanist: 'Water and salt',
    cherubist: 'Mending and calm', stormcaller: 'Wind and thunder', veneficium: 'Venom and fever',
    toughness: 'Hard to bring down', brave: 'Unshaken by fear', strong_willed: 'A mind that holds',
    wise: 'Perception and insight', compassion: 'A healer’s heart', discipline: 'Steady in everything',
  };
  static readonly sentences: Record<string, string> = {
    toughness: 'You take a beating and stay on your feet.', brave: 'You stand where others run, and are hard to sway.',
    strong_willed: 'Your mind is your own: magic and madness find little hold on it.',
    wise: 'You see what others miss, and keep your head when they lose theirs.',
    compassion: 'Your care mends more than others’ does, and fear moves you less.',
    discipline: 'A trained stillness steadies everything you do.',
  };
  static readonly manners: Record<string, string> = { toughness: 'tough as old boots', brave: 'afraid of nothing',
    strong_willed: 'of an iron will', wise: 'wise beyond their years', compassion: 'kind of heart',
    discipline: 'of a disciplined mind' };
  static readonly trades: Record<string, string> = { warrior: 'soldier', mage: 'apprentice', thief: 'cutpurse',
    cleric: 'acolyte', bard: 'minstrel', ranger: 'hunter', monk: 'mendicant' };
  static line(id: string): string { return this.lines[id] ?? ''; }
  // A way's rules in plain words, from what MechanicsText says of its modifiers ("1 harder to hit" is "Foes need 1
  // more to hit you"), each a sentence.
  static plain(said: string[]): string[] {
    return said.map(s => s.replace(/^(\d+) harder to hit$/, 'foes need $1 more to hit you')
      .replace(/^([+−-]\d+) against (.+)$/, '$1 to saves against $2')
      .replace(/^resists (\d+)% of all$/, 'all harm to you is lessened by $1%')
      .replace(/^\+(\d+d\d+) healing$/, 'your healing heals $1 more')
      .replace(/^([A-Z][a-z]+) ([+−-]\d+)$/, '$2 $1'))
      .map(s => `${s.charAt(0).toUpperCase()}${s.slice(1)}.`);
  }
}
