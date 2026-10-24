// Turning the lines a command produced into what a player reads: sentences start with a capital, one fight is told
// by its turning points rather than every blow, and what everyone gained is said once.
export class Narration {
  static tidy(lines: string[], blows = 0): string[] {
    let clean = lines.map(l => this.sentence(l.replace(/ \((\d+) HP; [^)]*\)/, ' ($1 HP left)')
      .replace(/(passes|fails) the (\w+) save \([^)]*\)/, (_m, verb: string, stat: string) =>
        `${verb === 'passes' ? 'resists' : 'fails to resist'} (${stat})`)));
    // "Your company prevails" says no more than the encounter won does; who is down after it, it still says.
    if (clean.some(l => /wins the encounter/.test(l))) {
      clean = clean.map(l => l.replace(/^Your company prevails\. ?/, '')).filter(Boolean);
    }
    // "Wenna is down" after "Wenna falls" says it twice.
    clean = clean.filter(l => {
      const down = /^(.+) (?:is|are) down\.$/.exec(l)?.[1]?.split(/, | and /);
      return !down || !down.every(n => clean.includes(`${n} falls.`));
    });
    clean = this.shared(clean);
    // "Elen takes the silver." or "Nera hands Torch to Elen." says it already: "Elen gains 1 Torch." adds nothing.
    clean = clean.filter(l => {
      const m = /^(.+) gains 1 (.+)\.$/.exec(l);
      return !m || !clean.some(o => o !== l && o.includes(m[1]!) && o.includes(m[2]!));
    });
    // A fight was told blow by blow as it happened; afterwards only how it turned out is told again, and the blow
    // that felled each who fell, since the last of them was struck as the fight's own page closed.
    if (!blows || clean.length <= 6) { return clean; }
    const told = /falls|wins|withdraw|defeated|experience|dies|reaches level|flees|gets away|(is|are) down|at you/;
    return clean.filter((l, i) => told.test(l) || this.fell(clean, i + 1)
      || (this.fell(clean, i + 2) && this.struck(l, clean[i + 1]))).map(l => l.replace(/ \(d20 [^)]*\)/, ''));
  }
  private static fell(lines: string[], i: number): boolean { return / falls\.$/.test(lines[i] ?? ''); }
  // The strike the damage after it came from: one that hits whoever takes it ("Rharash hits the mud." before "The mud
  // takes 11 slashing damage"), not whatever else happened just before.
  private static struck(line: string, damage: string | undefined): boolean {
    const target = / takes \d+ /.test(damage ?? '') ? damage!.split(' takes ')[0]! : '';
    return !!target && line.toLowerCase().includes(`hits ${target.toLowerCase()}`);
  }
  static sentence(line: string): string { return line.charAt(0).toUpperCase() + line.slice(1); }
  // "Elen gains 10 experience. Bran gains 10 experience." → "Elen and Bran each gain 10 experience." (and the same for
  // experience for something seen through: "…each gain 300 experience: the fever, seen through.")
  static shared(lines: string[]): string[] {
    const out: string[] = [];
    for (const line of lines) {
      const m = /^(.+) gains (\d+) experience(: [^.]+)?\.$/.exec(line);
      const prior = m && out.length ? /^(.+?) (?:each gain|gains) (\d+) experience(: [^.]+)?\.$/.exec(out.at(-1)!)
        : null;
      if (m && prior && prior[2] === m[2] && prior[3] === m[3]) {
        const names = [...prior[1]!.split(/, | and /), m[1]!];
        out[out.length - 1] = `${names.slice(0, -1).join(', ')} and ${names.at(-1)} each gain ${m[2]} experience${m[3] ?? ''}.`;
      } else { out.push(line); }
    }
    return out;
  }
}
