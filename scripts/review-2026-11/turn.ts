#!/usr/bin/env bun
// The architecture review of November 2026: after a start, what a turn costs as a client pays it. The first
// observation (ScreenModel.build, Narrator.leaf) and again with nothing changed (is anything kept?); a save
// (Campaign.save, the checkpoint a page keeps) and how large it is; `campaign.state` (which copies the whole state);
// and one command (`wait`) through PlaySession.perform, then the screen and leaf after it.
//   bun scripts/review-2026-11/turn.ts full|scenario|tiny
import { Costs } from '../../src/costs';
import { PlaySession } from '../../src/session/play-session';
import { ReviewScales } from './scales';
import { ScreenModel } from '../../src/ui/screen-model';
import { Narrator } from '../../src/presentation/narrator';
import { PlayerView } from '../../src/presentation/player-view';

const scale = process.argv[2] ?? 'full';
const session = await ReviewScales.start(scale);
const c = session.campaign;
class Turn {
  static ms(f: () => unknown): number { const t = performance.now(); f(); return Math.round(performance.now() - t); }
}
const out: Record<string, unknown> = { scale };
out.entities = c.module.entities.length; out.actions = c.module.actions.length;
out.relations = c.module.relations.length;
out.facts = c.world.relationNames().reduce((n, r) => n + c.world.related(r).length, 0);
out.offered = c.offered().length;
out['screen 1st'] = Turn.ms(() => ScreenModel.build(c)); out['screen 2nd'] = Turn.ms(() => ScreenModel.build(c));
const screen = ScreenModel.build(c);
out['leaf 1st'] = Turn.ms(() => Narrator.leaf(c, screen)); out['leaf 2nd'] = Turn.ms(() => Narrator.leaf(c, screen));
out['PlayerView.observe'] = Turn.ms(() => PlayerView.observe(c));
out['campaign.state'] = Turn.ms(() => c.state);
let text = '';
out['save (copied)'] = Turn.ms(() => c.save());
out['checkpoint + JSON'] = Turn.ms(() => { text = JSON.stringify(session.checkpoint()); });
out['save KB'] = Math.round(text.length / 1024);
const save = session.checkpoint().save;
out['of which module KB'] = Math.round(JSON.stringify(save.module).length / 1024);
out['of which creatures KB'] = Math.round(JSON.stringify(save.creatures).length / 1024);
out['restore'] = Turn.ms(() => PlaySession.resume(JSON.parse(text), {}));
const mark = Costs.mark();
const wait = ReviewScales.wait(session);
const t = performance.now();
await session.perform(wait);
out[`perform ${wait}`] = Math.round(performance.now() - t);
out['screen after'] = Turn.ms(() => ScreenModel.build(c));
out['leaf after'] = Turn.ms(() => Narrator.leaf(c, ScreenModel.build(c)));
out['perform crossed'] = Costs.said(Costs.since(mark));
console.log(JSON.stringify(out, null, 1));
