import type { Offered, Runner, Said } from '../../src/cli/runner';
import { RunnerOffer } from '../../src/cli/runner-offer';
import { TalkWay } from './talk-way';

// An act found by its words as a player finds it: among what is offered, else under the talk of one of the people here
// (turned to, taking no time, or talked to by their own row: the runner holds what is said to someone under their
// talk, CL-07), or under an opener (TB-12), or among the journeys or the pack's acts folded behind their lens (CL-33,
// CL-67).
export class RunnerFind {
  static async find(r: Runner, s: Said, label: RegExp): Promise<{ said: Said; o?: Offered }> {
    const all = (x: Said) => RunnerOffer.flat([...x.offer.primary, ...x.offer.rest]);
    const here = all(s).find(x => label.test(x.label));
    if (here) { return { said: s, o: here }; }
    // As the turn stands now (a talk already turned to since s was said): in it, on another page, under its Trade, or
    // at the place once the talk is put by (TalkWay: focus:place, no time).
    const now = await TalkWay.find(r, r.said(), x => label.test(x.label));
    if (now.o) { return { said: now.said, o: now.o }; }
    if (now.said !== s && !TalkWay.talking(now.said)) { s = now.said; }
    // Each person here talked to (talk_to), else turned to (talk:<person>, no time): a talk is their row
    // (<person>#talk, led for something within it or not) or one that talks to them.
    const talks = all(s).filter(x => RunnerFind.whom(x));
    for (const talk of talks) {
      const turned = await RunnerFind.turn(r, RunnerFind.whom(talk)!);
      if ('error' in turned) { continue; }
      const o = RunnerFind.paged(all, turned, label);
      if (o) { return { said: turned, o }; }
      // On another page of their talk (focus:page, the engine's question: OR-1451).
      for (let pages = 0, at: Said | { error: string } = turned; pages < 8 && !('error' in at); pages++) {
        const next = all(at).find(x => x.does?.startsWith('focus:page:'));
        if (!next) { break; }
        at = await r.ask(JSON.stringify({ act: next.does }));
        const found = 'error' in at ? undefined : RunnerFind.paged(all, at, label);
        if (found && !('error' in at)) { return { said: at, o: found }; }
      }
      // Or under their Trade (the engine's question, OR-1451: what is had of them for coin).
      const trading = all(turned).some(x => x.does === 'focus:trade:on')
        ? await r.ask(JSON.stringify({ act: 'focus:trade:on' })) : undefined;
      const sold = trading && !('error' in trading) ? all(trading).find(x => label.test(x.label)) : undefined;
      if (trading && !('error' in trading) && sold) { return { said: trading, o: sold }; }
    }
    // A journey folded out of the rest, through the journeys' lens (CL-33), or what is done with a thing carried,
    // through the pack (CL-67), as the turn still stands.
    for (const lens of ['journeys', 'pack']) {
      const lensed = await r.ask(JSON.stringify({ lens })), far = 'error' in lensed ? undefined : all(lensed)
        .find(x => label.test(x.label));
      if (far) { return { said: s, o: far }; }
    }
    return { said: s };
  }
  private static paged(all: (x: Said) => Offered[], s: Said, label: RegExp): Offered | undefined {
    return all(s).find(x => label.test(x.label));
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
