import { PlaceQuestion, type PlaceAsked } from '../frame/place-question';
import type { PlaySession } from '../session/play-session';
import type { Question } from '../frame/talk-question';
import type { Listed, Offered } from './terminal';

// The place's page as the terminal draws it (OR-1494: one projection): the page's rows, from the same question the
// page and the runner read (PlaceQuestion), each as the turn lists its act and marked as the question marks it; what
// the turn would have led with beside it in the rest, every act under all; Something else… typed as next.
export class TerminalPlace {
  static offered(place: PlaceAsked, byId: Map<string, Listed>, at: { all: Listed[]; shown: Listed[] }):
    Offered | undefined {
    // The first page's four are the glance's, the turn's own already (test/small/one-projection): Something else…
    // beside them.
    const next = PlaceQuestion.next(place);
    if (!place.page.at) { return next && at.shown.length ? { all: at.all, first: at.shown, more: at.all.length
      - at.shown.length, next } : undefined; }
    const first = PlaceQuestion.paged(place).map(r => ({ ...byId.get(r.command) ?? { id: r.command, name: r.label,
      time: 0 }, aspects: r.aspects }) as Listed);
    if (!first.length) { return undefined; }
    const on = new Set(first.map(c => c.id));
    return { all: at.all, first, rest: at.shown.filter(c => !on.has(c.id)), more: at.all.length - first.length,
      ...next ? { next } : {} };
  }
  static said(next: NonNullable<Offered['next']>): string { return `(${next.label} ${next.at + 1} of ${next.of}: next)`; }
  // The place's next page, as the page's Something else… turns it: no time.
  static async next(session: PlaySession, answer: string, turn: { current?: { question?: Question } }):
    Promise<boolean> {
    const place = answer === 'next' ? turn.current?.question?.place : undefined, next = place && PlaceQuestion.next(place);
    if (!next) { return false; }
    await session.perform(next.command);
    turn.current = undefined;
    return true;
  }
}
