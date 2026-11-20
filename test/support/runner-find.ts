import type { Offered, Runner, Said } from '../../src/cli/runner';
import { RunnerOffer } from '../../src/cli/runner-offer';

// An act found by its words as a player finds it: among what is offered, else under the talk of one of the people here
// (turned to, taking no time, or talked to by their own row: the runner holds what is said to someone under their
// talk, CL-07), or under an opener (TB-12), or among the journeys folded behind their lens (CL-33).
export class RunnerFind {
  static async find(r: Runner, s: Said, label: RegExp): Promise<{ said: Said; o?: Offered }> {
    const all = (x: Said) => RunnerOffer.flat([...x.offer.primary, ...x.offer.rest]);
    const here = all(s).find(x => label.test(x.label));
    if (here) { return { said: s, o: here }; }
    // As the turn stands now (a talk already turned to since s was said).
    const now = r.said(), held = all(now).find(x => label.test(x.label));
    if (held) { return { said: now, o: held }; }
    // Each person here talked to (talk_to), else turned to (talk:<person>, no time): a talk is their row
    // (<person>#talk, led for something within it or not) or one that talks to them.
    const talks = all(s).filter(x => RunnerFind.whom(x));
    for (const talk of talks) {
      const turned = await RunnerFind.turn(r, RunnerFind.whom(talk)!);
      if ('error' in turned) { continue; }
      const o = all(turned).find(x => label.test(x.label));
      if (o) { return { said: turned, o }; }
    }
    // A journey folded out of the rest, through the journeys' lens (CL-33), as the turn still stands.
    const lensed = await r.ask('{"lens":"journeys"}'), far = 'error' in lensed ? undefined : all(lensed)
      .find(x => label.test(x.label));
    return far ? { said: s, o: far } : { said: s };
  }
  private static async turn(r: Runner, whom: string): Promise<Said | { error: string }> {
    const talked = await r.ask(JSON.stringify({ act: `talk_to(${whom})` }));
    return 'error' in talked ? r.ask(JSON.stringify({ act: `talk:${whom}` })) : talked;
  }
  static whom(o: Offered): string | undefined {
    return /^(.+)#talk$/.exec(o.id)?.[1] ?? /^talk_to\((.+)\)$/.exec(RunnerOffer.act(o))?.[1];
  }
  static async act(r: Runner, s: Said, label: RegExp): Promise<Said> {
    const { o } = await RunnerFind.find(r, s, label);
    if (!o) { throw new Error(`no ${label} among ${[...s.offer.primary, ...s.offer.rest].map(x => x.label).join(' | ')}`); }
    const done = await r.ask(JSON.stringify({ act: o.id }));
    if ('error' in done) { throw new Error(done.error); }
    return done;
  }
}
