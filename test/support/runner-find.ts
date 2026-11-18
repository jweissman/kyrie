import type { Offered, Runner, Said } from '../../src/cli/runner';
import { RunnerOffer } from '../../src/cli/runner-offer';

// An act found by its words as a player finds it: among what is offered, else under the talk of one of the people here
// (turned to, taking no time, or talked to by their own row: the runner holds what is said to someone under their
// talk, CL-07), or under an opener (TB-12).
export class RunnerFind {
  static async find(r: Runner, s: Said, label: RegExp): Promise<{ said: Said; o?: Offered }> {
    const all = (x: Said) => RunnerOffer.flat([...x.offer.primary, ...x.offer.rest]);
    const here = all(s).find(x => label.test(x.label));
    if (here) { return { said: s, o: here }; }
    // As the turn stands now (a talk already turned to since s was said).
    const now = r.said(), held = all(now).find(x => label.test(x.label));
    if (held) { return { said: now, o: held }; }
    const talks = [...all(s).filter(x => x.id.startsWith('talk:')), ...all(s).filter(x => /^talk_to\(/.test(x.id))];
    for (const talk of talks) {
      const turned = await r.ask(JSON.stringify({ act: talk.id }));
      if ('error' in turned) { continue; }
      const o = all(turned).find(x => label.test(x.label));
      if (o) { return { said: turned, o }; }
    }
    return { said: s };
  }
  static async act(r: Runner, s: Said, label: RegExp): Promise<Said> {
    const { o } = await RunnerFind.find(r, s, label);
    if (!o) { throw new Error(`no ${label} among ${[...s.offer.primary, ...s.offer.rest].map(x => x.label).join(' | ')}`); }
    const done = await r.ask(JSON.stringify({ act: o.id }));
    if ('error' in done) { throw new Error(done.error); }
    return done;
  }
}
