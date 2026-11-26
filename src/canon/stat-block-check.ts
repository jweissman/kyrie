// A record's fixed stat block as the canon's validation reads it (FixedStatBlock is how play reads it).
export class StatBlockCheck {
  static readonly attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
  // What is wrong with a record's fixed stat block, said as the validation says it: the three saves and a bonus, whole
  // numbers, and only where the record's Hit Dice make it fixed (an ordinary creature keeps the saves and blows its
  // level gives it); and its own six scores (srd-proving-cases.md case 65), each a whole number of one or more, beside
  // Hit Dice and with no attributes of its own to add to them.
  static refused(st: { saves?: object; attackBonus?: number; hitDice?: string; scores?: object;
    attributes?: object | string; attacks?: string[];
    strikes?: { attackBonus: number; damageBonus: number }[] }): string[] {
    const out: string[] = [], saves = Object.entries(st.saves ?? {}), scores = Object.entries(st.scores ?? {});
    if (st.saves && (saves.length !== 3 || saves.some(([k, n]) => !['fortitude', 'reflex', 'will'].includes(k)
      || !Number.isInteger(n)))) { out.push('saves are Fortitude, Reflex and Will, each a whole number'); }
    if (st.attackBonus !== undefined && !Number.isInteger(st.attackBonus)) { out.push('attack bonus not whole'); }
    if ((st.saves || st.attackBonus !== undefined) && !st.hitDice) {
      out.push('saves and an attack bonus are a fixed stat block\'s, and want its Hit Dice beside them');
    }
    if (st.strikes && (!st.hitDice || !Array.isArray(st.attacks) || !st.attacks.length
      || !Array.isArray(st.strikes) || st.strikes.length !== st.attacks.length
      || st.strikes.some(s => !s || !Number.isSafeInteger(s.attackBonus) || !Number.isSafeInteger(s.damageBonus)
        || Object.keys(s).some(k => k !== 'attackBonus' && k !== 'damageBonus')))) {
      out.push('strikes want Hit Dice and one pair of whole bonuses for each natural attack');
    }
    if (st.scores && (scores.length !== 6 || st.attributes || !st.hitDice
      || scores.some(([k, n]) => !this.attributes.includes(k) || !Number.isInteger(n) || (n as number) < 1))) {
      out.push('scores are the six, each a whole number of one or more, beside Hit Dice and no attributes');
    }
    return out;
  }
}
