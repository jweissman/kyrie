import type { Recruit } from './character-sheet';

// Someone who would join the company, said as the page's talk says it and the terminal says it: what they are, how
// seasoned, what they ask, and what they can do. The terminal and the runner had said nothing of a hireling's calling
// until a fight showed it (cold play 2: a ranger with a shortbow and an animal companion, met only in the fight's
// menu; CL-08).
export class RecruitSaid {
  static article(noun: string): string { return /^(a|an|the) /i.test(noun) ? noun : `${/^[aeiou]/i.test(noun) ? 'an' : 'a'} ${noun}`; }
  // "a human ranger of level 1, asking 6 coin" (", more than you have" when the purse is short).
  static summary(r: Recruit, coin: number): string {
    const ask = r.hire ? `${r.hire} coin${r.hire > coin ? ', more than you have' : ''}` : 'nothing';
    return `${this.article(r.line)} of level ${r.level}, asking ${ask}`;
  }
  // "Carlin would join the company: a human ranger of level 1, asking 6 coin. Can shoot, call animal companion."
  static line(name: string, r: Recruit, coin: number): string {
    const can = r.techniques.length ? ` Can ${r.techniques.map(t => t.name.toLowerCase()).join(', ')}.` : '';
    // By their name alone, as the page's talk heads them ("Wenna", not "Wenna, a girl with a bow").
    return `${name.split(', ')[0]} would join the company: ${this.summary(r, coin)}.${can}`;
  }
}
