import type { Offered, Runner, Said } from '../../src/cli/runner';
import { RunnerOffer } from '../../src/cli/runner-offer';

// A row found as a player of the page finds it, a talk open (OR-1451: what is offered in a talk is the talk's question,
// what is said to them, as on the page): on another page of the talk, under its Trade, else at the place once the
// talk is put by (focus:place, which takes no time and changes nothing of the world, so a walk kept comes where it
// came). Undefined where none of these has it.
export class TalkWay {
  static rows(s: Said): Offered[] {
    return RunnerOffer.flat([...s.offer?.primary ?? [], ...s.offer?.rest ?? [],
      ...Object.values(s.offer?.lenses ?? {}).flat()] as Offered[]);
  }
  static talking(s: Said): boolean {
    return TalkWay.rows(s).some(o => /^(take_leave\(|focus:place$|focus:trade:)/.test(o.does ?? ''));
  }
  static async find(r: Runner, s: Said, match: (o: Offered) => boolean, depth = 0):
    Promise<{ said: Said; o?: Offered }> {
    const here = TalkWay.rows(s).find(match);
    if (here) { return { said: s, o: here }; }
    if (!TalkWay.talking(s)) { return TalkWay.turned(r, s, match, depth); }
    for (let at: Said = s, n = 0; n < 8; n++) {
      const next = TalkWay.rows(at).find(o => o.does?.startsWith('focus:page:'));
      if (!next) { break; }
      const page = await r.ask(JSON.stringify({ act: next.does }));
      if ('error' in page) { break; }
      at = page;
      const found = TalkWay.rows(at).find(match);
      if (found) { return { said: at, o: found }; }
    }
    // (Trade may stand on another page of the talk: it is opened by its command wherever it stands.)
    {
      const trading = await r.ask(JSON.stringify({ act: 'focus:trade:on' }));
      const found = 'error' in trading ? undefined : TalkWay.rows(trading).find(match);
      if (found && !('error' in trading)) { return { said: trading, o: found }; }
    }
    const placed = await r.ask(JSON.stringify({ act: 'focus:place' }));
    if ('error' in placed) { return { said: s }; }
    const there = TalkWay.rows(placed).find(match);
    return there || depth ? { said: placed, o: there } : TalkWay.turned(r, placed, match, depth);
  }
  // Not at the place: in the talk of someone here, as the page's player turns to
  // them to find what they have (a trader's wares are within their talk).
  private static async turned(r: Runner, s: Said, match: (o: Offered) => boolean, depth: number):
    Promise<{ said: Said; o?: Offered }> {
    if (depth) { return { said: s }; }
    const people = [...new Set(TalkWay.rows(s).flatMap(o => /^(.+)#talk$/.exec(o.id)?.[1]
      ?? /^talk_to\((.+)\)$/.exec(o.does ?? '')?.[1] ?? []))];
    // By "Talk to …", greeting them where the world has a greeting (as the page's row does), else turned to.
    for (const p of people) {
      const greeted = await r.ask(JSON.stringify({ act: `talk_to(${p})` }));
      const turned = 'error' in greeted ? await r.ask(JSON.stringify({ act: `talk:${p}` })) : greeted;
      if ('error' in turned) { continue; }
      const found = await TalkWay.find(r, turned, match, depth + 1);
      if (found.o) { return found; }
    }
    const placed = people.length ? await r.ask(JSON.stringify({ act: 'focus:place' })) : s;
    return { said: 'error' in placed ? s : placed };
  }
}
