// What an aim of the company's asks to be asked: "Ask Brom about the rats in the corn-store" is "Ask about the rats in
// the corn-store" said to Brom (the fresh playtest of 7 November: it stood sixth, under Something else, behind three
// rumours, when the notice on the well-post had sent the company to ask him). And "Ask Aiden what is out in the
// country round", asked as the aim says it, with or without an about. One reading for the glance, which leads to
// whom an aim names for that question, and for the page, which draws the question in the aim's gold.
export class AimAsks {
  static asks(label: string, aims: readonly string[]): boolean {
    const about = label.replace(/^Ask (?:\S+ )?about /i, '').toLowerCase();
    const what = label.replace(/^Ask (?:\S+ )?/i, '').toLowerCase();
    return /^Ask /i.test(label) && aims.some(a => (about.length > 6 && a.toLowerCase().includes(` about ${about}`))
      || (!/^about /.test(what) && what.length > 12 && a.toLowerCase().includes(` ${what}`)));
  }
}
