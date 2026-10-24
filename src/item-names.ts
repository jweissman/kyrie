// What a thing from the catalog is called in a sentence. The catalogs name kinds as headings ("Torch", "Scale Mail",
// "Bandages"); the page says "a torch", "scale mail", "bandages", as it says "a sack of bell-teeth".
export class ItemNames {
  // Kinds that are not counted one by one: "scale mail", not "a scale mail".
  static readonly uncounted = new Set(['mail', 'armor', 'armour', 'leather', 'clothing', 'clothes', 'gear', 'rope', 'oil',
    'chalk', 'water', 'incense', 'salve', 'ammunition', 'regalia', 'bread', 'meat', 'firewood', 'tinder', 'soap',
    'heather', 'comfrey', 'kingsfoil', 'ale', 'wine', 'vinegar', 'fire']);
  static called(name: string): string {
    const article = /^(the|a|an|some) /i.exec(name);
    if (article) { return `${article[1]!.toLowerCase()}${name.slice(article[1]!.length)}`; }
    const phrase = name.split(' ').map((w, i) => i === 0 || /^[A-Z][a-z'-]*$/.test(w) ? w.toLowerCase() : w).join(' ');
    // The thing itself, before what it is of: "a coil of rope", "a longsword of flames".
    const head = phrase.split(' of ')[0]!.split(' ').at(-1)!;
    if (/[^su']s$|s'$/.test(head) || this.uncounted.has(head)) { return phrase; }
    return `${/^[aeiou]/.test(phrase) ? 'an' : 'a'} ${phrase}`;
  }
}
