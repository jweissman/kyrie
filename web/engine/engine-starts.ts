import { PlaySession } from '../../src/session/play-session';
import { Creation } from './creation';
import type { Message, Request } from './protocol';

// What setting out asks for: the campaign (or the generated region), and who comes, and why.
export type Starting = Omit<Extract<Request, { kind: 'begin' }>, 'kind'>;

// The engine's starts of a game: one made ready while the player reads the page, for the choices as they then stood,
// and the one Begin asks for, said to the page step by step while the player waits. A start made ready for choices
// since changed is given up at its next step: the worker does one thing at a time, and one had run on to its end
// before the start asked for could begin (the owner's iPad, twenty seconds, 11 November).
export class EngineStarts {
  private ready?: { key: string; started: Promise<PlaySession> };
  // The choices a Begin waits on, while it waits: a start made ready for them says how far it has got.
  private waiting?: string;
  // How long each step of the last start took, kept for its first frame (M19-49: where the wait goes).
  phases: { draw?: number; place?: number } = {};
  constructor(private readonly creation: Creation, private readonly post: (message: Message) => void) {}
  static key(r: Starting): string {
    return JSON.stringify([r.campaign, r.seed, r.party, r.terrain ?? null, r.origin ?? null, r.memorial ?? null]);
  }
  prepare(r: Starting): void {
    const key = EngineStarts.key(r);
    if (this.ready?.key === key) { return; }
    const started = this.start(r);
    started.catch(() => { if (this.ready?.started === started) { this.ready = undefined; } });
    this.ready = { key, started };
  }
  // The start Begin asks for: the one made ready for the same choices, what is left of it, or a fresh one.
  async take(r: Starting): Promise<PlaySession> {
    const key = EngineStarts.key(r), ready = this.ready?.key === key ? this.ready.started : undefined;
    this.ready = undefined; this.waiting = key;
    try {
      if (ready) { this.said('Placing its people'); }
      return await (ready?.catch(() => this.start(r, true)) ?? this.start(r, true));
    } finally { this.waiting = undefined; }
  }
  said(stage: string, step?: [number, number]): void {
    this.post({ kind: 'progress', stage, ...step ? { step } : {} });
  }
  private async start(r: Starting, asked = false): Promise<PlaySession> {
    const at = { ...r.terrain ? { terrain: r.terrain } : {}, ...r.origin ? { origin: r.origin } : {},
      ...r.memorial ? { memorial: r.memorial } : {} }, key = EngineStarts.key(r);
    if (asked) { this.said('Drawing the world'); }
    const began = performance.now();
    const origin = await this.creation.origin(r.campaign, r.seed, r.party, at);
    if (asked) { this.said('Placing its people'); }
    const drawn = performance.now();
    // An origin makes the protagonist what it says (their background, what they carry): the world's telling of them.
    const session = await PlaySession.start(origin.path, r.seed, origin.source,
      { ...r.origin ? {} : { party: r.party }, step: this.step.bind(this, key, asked) });
    this.phases = { draw: Math.round(drawn - began), place: Math.round(performance.now() - drawn) };
    // A generated world keeps what it was drawn for, so that its transcript can be replayed (see DrawnWorld).
    return r.campaign === Creation.generated ? session.drawnFor({ party: r.party, ...at }) : session;
  }
  // Each part of the world taken in: said while it is waited for; given up if made ready for choices since changed.
  // It yields first, a turn of the worker's own loop, so that a Begin asked meanwhile is heard (an await alone does not
  // let a message in, and the stale start had run on to its end unheard).
  private async step(key: string, asked: boolean, n: number, of: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 0));
    if (asked || this.waiting === key) { this.said('Placing its people', [n, of]); return; }
    if (this.ready?.key !== key) { throw new Error('A start made ready for other choices was given up.'); }
  }
}
