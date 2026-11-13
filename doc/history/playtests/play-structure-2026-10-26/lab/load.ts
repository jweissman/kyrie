import { AutoplayRun } from '../../../../src/autoplay/run';
import { AutoPlayer } from '../../../../src/autoplay/player';
import { Draw } from '../../../../src/autoplay/draw';
import { ScreenModel } from '../../../../src/ui/screen-model';
const [seed, steps] = [process.argv[2]!, Number(process.argv[3] ?? 120)];
const metrics = (AutoplayRun as any).empty();
const s = await AutoplayRun.start({ seed, origin: 'wanderer', protagonist: { name: 'P', raceId: 'human', classId: 'warrior' }, policy: 'wander', steps }, metrics);
const c = s.campaign, player = new AutoPlayer('wander', new Draw(seed));
const rows: any[] = [];
for (let step = 0; step < steps && c.running; step++) {
  const sit = (AutoplayRun as any).situation(s, step);
  const sc: any = ScreenModel.build(c);
  const kind = /^region__s\d+/.test(sc.place.id) ? 'town' : /^region__w\d+/.test(sc.place.id) ? 'site' : 'country';
  const top = sc.people.length + sc.things.length + sc.exits.length + (sc.destinations?.length ?? 0);
  rows.push({ kind, offered: sit.offered.length, top, people: sc.people.length, exits: sc.exits.length, dests: sc.destinations?.length ?? 0, prose: sc.prose.join(' ').length });
  const move = player.next(sit); if (!move) break;
  try { await (AutoplayRun as any).apply(s, move, player, metrics); } catch { break; }
}
console.log(JSON.stringify(rows));
