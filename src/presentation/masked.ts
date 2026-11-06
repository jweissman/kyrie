// A name said as it is known: where it stands as a whole name, never inside another word (Tibb in "Tibbet's yard",
// the handoff's §7), the longest names first where the caller gives them so.
export class Masked {
  static said(text: string, name: string, as: string): string {
    if (!name || !text.includes(name)) { return text; }
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'gu'), () => as);
  }
}
