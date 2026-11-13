import { AutoplayRun } from '../../../../src/autoplay/run';
import { AutoPlayer } from '../../../../src/autoplay/player';
import { Draw } from '../../../../src/autoplay/draw';
import { ScreenModel } from '../../../../src/ui/screen-model';
const [seed, origin, policy, cls, stepsArg, every] = process.argv.slice(2);
const steps = Number(stepsArg ?? 300), sampleEvery = Number(every ?? 10);
const metrics = (AutoplayRun as any).empty();
const s = await AutoplayRun.start({ seed, origin, protagonist: { name: 'P', raceId: 'human', classId: cls ?? 'warrior' }, policy: policy as any, steps }, metrics);
const c = s.campaign, player = new AutoPlayer(policy as any, new Draw(`${seed}:${origin}:${policy}`));
const rows: any[] = [];
const sample = (step: number, note = '') => {
  const sc: any = ScreenModel.build(c);
  const p = sc.party?.[0];
  rows.push({ step, min: sc.elapsed, coin: sc.purse?.coin, xp: p?.experience ?? 0, lvl: p?.level, hp: p?.hp, party: sc.party?.length,
    open: sc.objectives.length + sc.deadlines.length, done: sc.done.length, heard: sc.knowledge.filter((k: any) => k.kind === 'reported').length,
    dests: sc.destinations.length, fights: metrics.fights, lost: metrics.lost, note });
};
let failure = '';
sample(0);
for (let step = 0; step < steps && c.running; step++) {
  const move = player.next((AutoplayRun as any).situation(s, step));
  if (!move) { failure = 'softlock'; break; }
  try { await (AutoplayRun as any).apply(s, move, player, metrics); } catch (e) { failure = 'exception: ' + (e as Error).message; break; }
  if ((step + 1) % sampleEvery === 0) sample(step + 1);
}
sample(-1, c.running ? failure : 'dead');
const sc: any = ScreenModel.build(c);
console.log(JSON.stringify({ seed, origin, policy, cls, rows, done: sc.done, objectives: sc.objectives, kinds: metrics.kinds, metrics: { fights: metrics.fights, won: metrics.won, lost: metrics.lost, fled: metrics.fled, unchosen: metrics.unchosen, places: metrics.places }, failure }));
