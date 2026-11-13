import { createInterface } from 'node:readline';
import type { PlaySession, SessionCheckpoint } from '../session/play-session';
import { PlaySession as Session } from '../session/play-session';
import { DrawnWorld } from '../world/drawn-world';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import { ScreenModel } from '../ui/screen-model';
import { LandCrossing } from '../ui/land-crossing';
import { Narrator } from '../presentation/narrator';
import { PlayerView } from '../presentation/player-view';
import { EntityCard } from '../presentation/entity-card';
import type { CampaignEvent } from '../campaign/campaign';

// One long-lived game over standard input and output, a JSON object a line each way (the forward-design record's
// second prototype): a world started once, then looked at and played by the same choice ids the page sends, without
// starting again or reading a terminal. Every answer is what the engine already says to the page, made small: where
// the company is, its aims, the acts the page leads with and why, every choice by id, and what was told.
//   bin/kyrie serve
//   {"op":"start","world":"kahitude","origin":"debt","as":"human/warrior/Ralf"}
//   {"op":"act","id":"talk_to(region__s1_merchant)"}   {"op":"view"}   {"op":"card","id":"region__s1_merchant"}
//   {"op":"checkpoint"}   {"op":"resume","checkpoint":{…}}
export interface Request { op: string; id?: string; world?: string; origin?: string; as?: string; mode?: string;
  checkpoint?: SessionCheckpoint }
export class Serve {
  private session?: PlaySession;
  // What the company has before it: the screen and the glance the page draws from, as ids and typed reasons.
  view() {
    const c = this.session!.campaign, screen = ScreenModel.build(c), glance = Narrator.leaf(c, screen).glance;
    return { at: { id: screen.place.id, name: screen.place.name }, clock: screen.clock, running: c.running,
      aims: (screen.aims ?? []).map(a => ({ id: a.id, text: a.text, ...a.followed ? { followed: true } : {} })),
      led: (glance?.acts ?? []).map(a => ({ choice: a.choice, ...a.command ? { command: a.command } : {},
        ...a.for ? { for: a.for } : {}, label: a.label, why: a.why, aspects: a.aspects,
        ...a.continues ? { continues: true } : {} })),
      choices: PlayerView.choices(c).map(r => ({ id: r.choice.id, label: r.choice.name })),
      // What the map may set out for across the country, as the page and the terminal offer it (LandCrossing).
      across: LandCrossing.offers(screen) };
  }
  static told(e: CampaignEvent): string[] {
    return [...(e.perceptions ?? []).map(p => p.text), ...e.response ? [e.response] : []];
  }
  async handle(r: Request): Promise<object> {
    if (r.op === 'start') {
      const [raceId = 'human', classId = 'warrior', name = 'Wren'] = (r.as ?? '').split('/');
      this.session = await DrawnWorld.start(r.world ?? 'kahitude', { origin: r.origin ?? 'debt',
        party: [{ name, raceId, classId }] }, NodeBundleSource.shared);
      return { view: this.view() };
    }
    if (r.op === 'resume') { this.session = Session.resume(r.checkpoint!); return { view: this.view() }; }
    if (!this.session) { throw new Error('No game: start one first'); }
    switch (r.op) {
      case 'view': return { view: this.view() };
      case 'act': { const e = await this.session.leg(r.id!); return { result: e.result, told: Serve.told(e), view: this.view() }; }
      case 'card': return { card: EntityCard.of(this.session.campaign, r.id!, r.mode === 'author' ? 'author' : 'player') };
      case 'checkpoint': return { checkpoint: this.session.checkpoint() };
      default: throw new Error(`No such op: ${r.op}`);
    }
  }
  static async main(): Promise<number> {
    const serve = new Serve(), lines = createInterface({ input: process.stdin });
    for await (const line of lines) {
      if (!line.trim()) { continue; }
      const started = performance.now();
      try {
        const answer = await serve.handle(JSON.parse(line) as Request);
        process.stdout.write(`${JSON.stringify({ ok: true, ms: Math.round(performance.now() - started), ...answer })}\n`);
      } catch (error) { process.stdout.write(`${JSON.stringify({ ok: false, error: (error as Error).message })}\n`); }
    }
    return 0;
  }
}
