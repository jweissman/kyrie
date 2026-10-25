import { WorldAssembler } from '../../../../../../src/world/world-assembler';
import { NodeBundleSource } from '../../../../../../src/campaign/node-bundle-source';
import { PlaySession } from '../../../../../../src/session/play-session';
import { ScreenModel } from '../../../../../../src/ui/screen-model';
import { Bearings } from '../../../../../../src/ui/bearings';
import { Routes } from '../../../../../../src/ui/route';
process.chdir('/home/user/kyrie');
const seed = process.argv[2] ?? 'thorn', terrain = process.argv[3];
const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, terrain ? { region: { terrain } } : {});
const s = await PlaySession.start(w.path, seed, w.source);
console.log('region', w.report.region.name, w.report.region.terrain, 'beyond', JSON.stringify(Object.fromEntries(Object.entries(w.report.region.beyond ?? {}).map(([k, v]: any) => [k, v.name]))));
function show(tag: string) {
  const sc: any = ScreenModel.build(s.campaign), b = Bearings.of(sc);
  console.log(`--- ${tag}: at ${sc.place.id} "${sc.place.name}"`);
  for (const e of sc.exits) console.log(`  [${b.get(e.id)}] ${e.transition} -> "${e.destination.name}" | ${e.acts.map((a: any) => `${a.label}${a.minutes ? ' ('+a.minutes+'m)' : ''}`).join('; ')}${e.blocked ? ' BLOCKED '+e.blocked : ''}`);
  console.log('  region chart areas:', sc.region?.areas?.map((a: any) => `${a.name}${a.visited ? '*' : ''}`).join(', '), '| edges:', sc.region?.edges?.map((e: any) => e.label).join(' ; '));
  const r = Routes.of(sc); if (r) console.log('  route:', r.from.destination.name, '->', r.to.destination.name);
}
show('start');
const road = s.campaign.world.related('connects').find(r => r.args[1] === s.campaign.world.one('at','party') && /road_s/.test(r.args[0]!));
if (road) { await s.perform(`go(${road.args[0]},${road.args[2]})`); show('on the road'); }
