// How a name in the old tongue is worn down in the folk's mouths over the centuries, as Latin names wore down into
// English ones: the ending goes, unstressed vowels in the middle fall out, hard sounds soften, doubled letters run
// together. "Palusporta" becomes "Palsport"; "Aquacustodia", "Acacstod".
export class Wearing {
  static wear(name: string): string {
    let s = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');
    s = s.replace(/(us|um|is|ae|a|e|i|o)$/, '').replace(/[aeiou]$/, '');
    s = s.replace(/qu/g, 'c').replace(/ph/g, 'f').replace(/v/g, 'w').replace(/x/g, 'cs').replace(/ct/g, 'ht')
      .replace(/pt/g, 'ft').replace(/c(?=[ei])/g, 'ch');
    if (s.length > 7) { s = this.syncope(s); }
    s = s.replace(/(.)\1+/g, '$1');
    return s ? s[0]!.toUpperCase() + s.slice(1) : name;
  }
  // A vowel of the middle syllables falls out, the first of them that leaves no more than two consonants together.
  private static syncope(s: string): string {
    const third = Math.floor(s.length / 3);
    for (let i = third; i < s.length - third; i++) {
      if (!'aeiou'.includes(s[i]!)) { continue; }
      const worn = s.slice(0, i) + s.slice(i + 1);
      if (!/[^aeiouy]{3}/.test(worn)) { return worn; }
    }
    return s;
  }
}
