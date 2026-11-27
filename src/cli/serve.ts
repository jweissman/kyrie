import { createInterface } from 'node:readline';
import type { PlaySession, SessionCheckpoint } from '../session/play-session';
import { PlaySession as Session } from '../session/play-session';
import { DrawnWorld } from '../client/drawn-world';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import { ScreenModel } from '../ui/screen-model';
import { LandCrossing } from '../ui/land-crossing';
import { Itineraries } from '../ui/itinerary';
import { Narrator, type Told } from '../presentation/narrator';
import { ActionFeedbackView } from '../presentation/action-feedback';
import { PlayerView } from '../presentation/player-view';
import { PlayerFrame } from '../presentation/player-frame';
import { EntityCard } from '../presentation/entity-card';
import { Doable, type Row } from '../presentation/doable';
import type { Promoted } from '../presentation/glance-types';
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
  // What came of the last act, which the view is told from until the next (as the runner's turn is: MT-18, serve's
  // four had been the glance's of no act, where the runner's and the page's were of what had just come of one).
  private told?: Told;
  // What the company has before it: the screen and the glance the page draws from, as ids and typed reasons.
  view() { return Serve.of(this.session!, this.told); }
  // The view of a session, as one is answered (and as the parity measure reads it: scripts/client-parity.ts).
  static of(session: PlaySession, told?: Told) {
    const c = session.campaign, screen = ScreenModel.build(c), glance = Narrator.leaf(c, screen, told).glance;
    const rows = glance ? Doable.flat(Doable.of(glance, screen)) : [];
    // An act by its own row's words; a talk led for it is the four's, not the act's (its label, not what it is called).
    // And what a row is led for (a talk led for a question asks it: TB-01).
    const led = new Set(rows.flatMap(r => r.for ?? []));
    const words = new Map(rows.flatMap(r => r.does ? [[r.does, r.label] as const] : []).reverse());
    return { at: { id: screen.place.id, name: screen.place.name }, clock: screen.clock, running: c.running,
      aims: (screen.aims ?? []).map(a => ({ id: a.id, text: a.text, ...a.followed ? { followed: true } : {} })),
      // The four the engine leads with (Doable's led rows: MT-18, serve had led with the glance's acts, the notice
      // and a talk the four did not), why and how from the glance's act for each.
      led: rows.filter(r => r.led).map(r => Serve.led(r, glance?.acts ?? [])),
      // Every choice, and the aim to follow, which the glance offers as an act of the session (HeldActs.follow).
      // And the journeys from here, the engine's (Doable: DoableJourneys), less those on the map (MT-18: serve had
      // offered none, where the runner and the page set out by them).
      // Each said in the engine's words (MT-18: one wording, Doable's); only those the engine offers a row doing, where
      // it offers any (MT-18: serve had offered the world's every choice, a talk with someone who has nothing to say
      // and a gather "for Carlin" beside "for Wenna", which Doable leaves out).
      choices: [...PlayerFrame.of(c).rows.filter(r => !rows.length || words.has(r.choice.id) || led.has(r.choice.id))
        .map(r => ({
        id: r.choice.id, label: words.get(r.choice.id) ?? r.choice.name })),
        ...(glance?.acts ?? []).filter(a => a.command?.startsWith('follow:')).map(a => ({ id: a.command!, label: a.label })),
        ...Serve.journeys(rows)],
      // What the map may set out for across the country, as the page and the terminal offer it (LandCrossing).
      across: LandCrossing.offers(Itineraries.charted(c, screen)) };
  }
  private static led(r: Row, acts: Promoted[]) {
    const a = acts.find(x => x.choice === r.id || x.choice === `travel:${r.chart}`);
    return { choice: r.id, ...r.does ? { command: r.does } : {}, ...r.for ? { for: r.for } : {},
      label: r.called ?? r.label, ...a ? { why: a.why, aspects: a.aspects } : { aspects: [] },
      ...a?.continues ? { continues: true } : {} };
  }
  // The map opened at a place (a row led with across the country does view:map:<place>, Row.chart): every journey
  // from here, that one first, set out on by its id.
  private static charted(session: PlaySession, to: string): { at: string; journeys: { id: string; label: string }[] } {
    const c = session.campaign, screen = ScreenModel.build(c), glance = Narrator.leaf(c, screen).glance;
    const rows = glance ? Doable.flat(Doable.of(glance, screen)) : [], there = `travel:${to}`;
    const all = [...new Map(rows.filter(r => r.does?.startsWith('travel:'))
      .map(r => [r.does!, { id: r.does!, label: r.called ?? r.label }])).values()];
    return { at: to, journeys: [...all.filter(j => j.id === there), ...all.filter(j => j.id !== there)] };
  }
  private static journeys(rows: Row[]): { id: string; label: string }[] {
    // One led with across the country, by opening the map there (Row.chart: view:map:<place>).
    return [...new Map(rows.filter(r => (r.does?.startsWith('travel:') || r.chart || r.does === 'view:map') && !r.map)
      .map(r => [r.does!, { id: r.does!, label: r.called ?? r.label }])).values()];
  }
  static told(e: CampaignEvent): string[] {
    return [...(e.perceptions ?? []).map(p => p.text), ...e.response ? [e.response] : []];
  }
  async handle(r: Request): Promise<object> {
    if (r.op === 'start') {
      const [raceId = 'human', classId = 'warrior', name = 'Wren'] = (r.as ?? '').split('/');
      this.session = await DrawnWorld.start(r.world ?? 'kahitude', { origin: r.origin ?? 'debt',
        party: [{ name, raceId, classId }] }, NodeBundleSource.shared);
      this.told = undefined;
      return { view: this.view() };
    }
    if (r.op === 'resume') {
      this.session = Session.resume(r.checkpoint!); this.told = undefined;
      return { view: this.view() };
    }
    if (!this.session) { throw new Error('No game: start one first'); }
    switch (r.op) {
      case 'view': return { view: this.view() };
      case 'act': {
        const to = /^view:map(?::(.+))?$/.exec(r.id ?? '');
        if (to) { return { map: Serve.charted(this.session, to[1] ?? ''), view: this.view() }; }
        const c = this.session.campaign, before = PlayerView.observe(c);
        const e = await this.session.leg(r.id!);
        this.told = { event: e, feedback: ActionFeedbackView.read(c, e, before), said: r.id!,
          moved: before.location?.id !== c.world.one('at', c.playerActor ?? 'party') };
        return { result: e.result, told: Serve.told(e), view: this.view() };
      }
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
