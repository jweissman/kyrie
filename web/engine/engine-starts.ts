import { PlaySession } from '../../src/session/play-session';
import { Creation } from './creation';
import { ScreenModel } from '../../src/ui/screen-model';
import { StockOpenings } from '../../src/world/stock-openings';
import type { Message, Request } from '../../src/creation/protocol';
import { ModuleBundle } from '../../src/campaign/module-bundle';
import { CanonVocabulary } from '../../src/canon/canon-vocabulary';
import { Scenarios } from '../scenarios';

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
  phases: { texts?: number; draw?: number; place?: number } = {};
  constructor(private readonly creation: Creation, private readonly post: (message: Message) => void) {}
  warmRules(): void {
    const vocabulary = CanonVocabulary.context();
    setTimeout(() => void ModuleBundle.warmRules(vocabulary, Scenarios.source()).catch(() => undefined), 0);
  }
  static key(r: Starting): string {
    return JSON.stringify([r.campaign, r.seed, r.party, r.terrain ?? null, r.origin ?? null, r.memorial ?? null,
      r.chain ?? null, r.opening ?? null]);
  }
  // A start made ready a moment after the life made was last changed (OR-08): the engine's own making (EngineCreation)
  // asks for it at each choice, for the start its set-out will ask, so that setting out finds it made or under way.
  // First the country's texts are read, for the reason chosen (never wasted: what is parsed is kept, whatever is chosen
  // next); only then the start, whose installing is given up at its next step if the choices change again meanwhile.
  private soon?: ReturnType<typeof setTimeout>;
  private warm?: { key: string; done: Promise<unknown> };
  // Only read: the country just drawn, before any choice is made (what a start made for the life it begins with does
  // is wasted on the first choice, and a spec that draws a country and sets out on none paid for one).
  readying(r: Starting, only?: 'read'): void {
    clearTimeout(this.soon); this.soon = undefined;
    const key = EngineStarts.key(r), country = EngineStarts.country(r);
    if (this.ready && this.ready.key !== key) { this.ready = undefined; }
    if (this.foreseen !== key) { this.foreseen = undefined; }
    if (this.warm?.key !== country) {
      const before = this.warm?.done ?? Promise.resolve();
      this.warm = { key: country, done: before.then(() => this.warmed(r)).catch(() => undefined) };
    }
    const warm = this.warm.done;
    if (only) { this.next = undefined; return; }
    this.soon = setTimeout(() => {
      this.soon = undefined;
      void warm.then(() => { if (!this.soon && this.next === key) { this.prepare(r); } });
    }, EngineStarts.moment);
    this.next = key;
  }
  // The start the last change asked for: a warm finished after another change does not make ready the one before.
  private next?: string;
  // A start made ready before anything was asked of the country, while the title shows (OR-121: Set out now in under
  // a second): its texts read first, then the start itself, unless a choice or another country comes meanwhile.
  private foreseen?: string;
  foresee(r: Starting): void {
    this.readying(r, 'read');
    const key = EngineStarts.key(r);
    this.foreseen = key;
    void this.warm?.done.then(() => { if (this.foreseen === key) { this.prepare(r); } });
  }
  static readonly moment = 300;
  // What a new life's world is drawn for: what was chosen, and the stock opening creation begins it in (the one asked
  // for, none if "none", else its country's: StockOpenings.chosen), kept with it so that it is drawn again so.
  static at(r: Starting): Parameters<Creation['origin']>[3] {
    const opening = r.campaign === Creation.generated ? StockOpenings.chosen(r.seed, r.opening) : undefined;
    return { ...r.terrain ? { terrain: r.terrain } : {}, ...r.origin ? { origin: r.origin } : {},
      ...r.memorial ? { memorial: r.memorial } : {}, ...r.chain ? { chain: r.chain } : {},
      ...opening ? { opening } : {} };
  }
  // What the country's texts are drawn by: not the life, but the country and the reason for coming.
  static country(r: Starting): string {
    return JSON.stringify([r.campaign, r.seed, r.terrain ?? null, r.origin ?? null, r.memorial ?? null,
      r.chain ?? null, r.opening ?? null]);
  }
  // A turn of the worker's loop first, so that the answer to what asked for it is sent before the reading begins.
  private async warmed(r: Starting): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 0));
    if (r.campaign !== Creation.generated) { return; }
    const drawn = this.creation.origin(r.campaign, r.seed, r.party, EngineStarts.at(r));
    this.drawnFor = { key: EngineStarts.key(r), world: drawn };
    const world = await drawn;
    await Creation.warm(world.path, world.source);
  }
  // The world the texts were read for, kept for the start made for the same choices (OR-144): it had been drawn again
  // by the start, the same world a second time (a third of a second of a Set out now pressed while the country drew).
  // Taken once, and let go when another country is drawn.
  private drawnFor?: { key: string; world: ReturnType<Creation['origin']> };
  private origin(r: Starting, at: Parameters<Creation['origin']>[3]): ReturnType<Creation['origin']> {
    const kept = this.drawnFor?.key === EngineStarts.key(r) ? this.drawnFor.world : undefined;
    this.drawnFor = undefined;
    return kept ?? this.creation.origin(r.campaign, r.seed, r.party, at);
  }
  // Nothing more begun, and what is under way finished (the reading, a start made ready): for whatever must know the
  // engine is idle, as a spec that makes a life and sets out on none (its warming had run on into the next spec and
  // been counted there: small/dark-need on CI).
  async settled(): Promise<void> {
    clearTimeout(this.soon); this.soon = undefined; this.next = undefined;
    await this.warm?.done;
    await this.ready?.started.catch(() => undefined);
  }
  // Nothing made ready any longer: a new country is being drawn.
  drop(): void {
    clearTimeout(this.soon); this.soon = undefined; this.ready = undefined; this.next = undefined;
    this.foreseen = undefined; this.drawnFor = undefined;
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
    clearTimeout(this.soon); this.soon = undefined; this.next = undefined; this.foreseen = undefined;
    this.ready = undefined; this.waiting = key; this.saying = undefined;
    try {
      if (ready) { this.said('Placing its people'); }
      return await (ready?.catch(() => this.start(r, true)) ?? this.afresh(r));
    } finally { this.waiting = undefined; }
  }
  // A start begun now, once the country's texts being read for the same reason are read: begun beside the reading,
  // the two had parsed the same texts at once, each as slowly (a set-out at once after the last choice, 9–12 s).
  private async afresh(r: Starting): Promise<PlaySession> {
    const warm = this.warm?.key === EngineStarts.country(r) ? this.warm.done : undefined;
    // How long the texts were waited for is its own phase: said once, "Drawing the world" no longer marks their end
    // (OR-144), where test/cold-start had measured them between its two sayings.
    const waited = performance.now();
    if (warm) { this.said('Drawing the world'); await warm; }
    const texts = Math.round(performance.now() - waited), session = await this.start(r, true);
    if (warm) { this.phases = { texts, ...this.phases }; }
    return session;
  }
  // A stage said once: waited for, then begun, "Drawing the world" had been said twice running (OR-144).
  said(stage: string, step?: [number, number]): void {
    if (!step && stage === this.saying) { return; }
    this.saying = step ? undefined : stage;
    this.post({ kind: 'progress', stage, ...step ? { step } : {} });
  }
  private saying?: string;
  private async start(r: Starting, asked = false): Promise<PlaySession> {
    const at = EngineStarts.at(r), key = EngineStarts.key(r);
    if (asked) { this.said('Drawing the world'); }
    const began = performance.now();
    const origin = await this.origin(r, at);
    if (asked) { this.said('Placing its people'); }
    const drawn = performance.now();
    // An origin makes the protagonist what it says (their background, what they carry): the world's telling of them.
    const session = await PlaySession.start(origin.path, r.seed, origin.source,
      { ...r.origin ? {} : { party: r.party }, step: this.step.bind(this, key, asked) });
    this.phases = { draw: Math.round(drawn - began), place: Math.round(performance.now() - drawn) };
    // One made ready looks once at where it begins, as the first page will: the first look at a world is 0.4 s, a
    // second 0.05 s, and looking changes nothing of the game (test/set-out-ready: the checkpoint is a cold start's).
    if (!asked) { ScreenModel.build(session.campaign); }
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
