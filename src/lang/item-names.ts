// What a thing from the catalog is called in a sentence. The catalogs name kinds as headings ("Torch", "Scale Mail",
// "Bandages"); the page says "a torch", "scale mail", "bandages", as it says "a sack of bell-teeth". The language's
// own: an item a module places by its kind alone is given this name as the module is read (see WorldConstructs).
export class ItemNames {
  // Kinds that are not counted one by one: "scale mail", not "a scale mail".
  static readonly uncounted = new Set(['mail', 'armor', 'armour', 'leather', 'clothing', 'clothes', 'gear', 'rope', 'oil',
    'chalk', 'water', 'incense', 'salve', 'ammunition', 'regalia', 'bread', 'meat', 'firewood', 'tinder', 'soap',
    'heather', 'comfrey', 'kingsfoil', 'ale', 'wine', 'vinegar', 'fire', 'dice']);
  // A thing carried, by its own name, or as its kind is called when its name is only its kind's: a lantern given
  // had been "Lantern" in the pack beside "A torch" (M19-29).
  static shown(own: string | undefined, kind: string): string {
    return own && own !== kind ? own : this.called(kind);
  }
  static called(name: string): string {
    const article = /^(the|a|an|some) /i.exec(name);
    if (article) { return `${article[1]!.toLowerCase()}${name.slice(article[1]!.length)}`; }
    // One named for whose it is ("Tegwen's lease") is said by that name, as it is written: "a tegwen's lease" in the
    // pack (OR-262). A catalog's heading has every word capitalized ("Healer's Kit"), and is a kind like any other.
    if (this.owned(name)) { return name; }
    const phrase = name.split(' ').map((w, i) => i === 0 || /^[A-Z][a-z'-]*$/.test(w) ? w.toLowerCase() : w).join(' ');
    // The thing itself, before what it is of: "a coil of rope", "a longsword of flames".
    const head = phrase.split(' of ')[0]!.split(' ').at(-1)!;
    if (/[^su']s$|s'$/.test(head) || this.uncounted.has(head)) { return phrase; }
    return `${/^[aeiou]/.test(phrase) ? 'an' : 'a'} ${phrase}`;
  }
  // A name led by someone's own ("Tegwen's", "Bran's"), the rest of it not a heading's capitals.
  private static owned(name: string): boolean {
    const [first, ...rest] = name.split(' ');
    return /^\p{Lu}[\p{L}-]*['’]s$/u.test(first ?? '') && rest.some(w => /^\p{Ll}/u.test(w));
  }
}
