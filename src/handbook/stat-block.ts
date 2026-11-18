import type { Entry } from './model';

// An entry drawn as a stat block, as the SRD draws a people (the owner, 18 November: "Ancestries need a more SRD-like
// stat box"): its qualities as a row of the six, under a rule, then its facts as lines, under another; in the book's
// own ink. Only for an entry that has its qualities as the six (Entry.abilities); the rest keep their table of facts.
export class StatBlock {
  static readonly six = [['strength', 'STR'], ['dexterity', 'DEX'], ['constitution', 'CON'], ['intelligence', 'INT'],
    ['wisdom', 'WIS'], ['charisma', 'CHA']] as const;
  static html(e: Entry, esc: (s: string) => string): string | undefined {
    if (!e.abilities) { return undefined; }
    const row = this.six.map(([k, short]) => `<div><b>${short}</b><span>${this.signed(e.abilities![k] ?? 0)}</span></div>`)
      .join('');
    const lines = (e.facts ?? []).map(([k, v]) => `<p><b>${esc(k)}.</b> ${esc(v)}</p>`).join('');
    return `<div class="statblock"><div class="six">${row}</div><div class="lines">${lines}</div></div>`;
  }
  // The qualities as words, for the plain-text book.
  static line(e: Entry): string | undefined {
    return e.abilities ? this.six.map(([k, short]) => `${short} ${this.signed(e.abilities![k] ?? 0)}`).join(' · ') : undefined;
  }
  private static signed(n: number): string { return n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0'; }
  // Its rules and labels in the book's own red: the encyclopedia's oxblood, the handbooks' rose.
  static css(red: string): string {
    return `.statblock { margin: 10px 0; border-top: 2px solid ${red}; border-bottom: 2px solid ${red};
  padding: 6px 0; } .statblock .six { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); text-align: center;
  padding-bottom: 6px; border-bottom: 1px solid ${red}; } .statblock .six b { display: block; font-size: 0.8em;
  color: ${red}; letter-spacing: 0.06em; } .statblock .lines p { margin: 4px 0; } .statblock .lines b { color: ${red}; }`;
  }
}
