import { WorldAssembler } from '../../../../../../src/world/world-assembler';
import { NodeBundleSource } from '../../../../../../src/campaign/node-bundle-source';
import { PlaySession } from '../../../../../../src/session/play-session';
import { PlayerView } from '../../../../../../src/presentation/player-view';
import { ModuleWriter } from '../../../../../../src/lang/module-writer';
const put = (s: any, calls: any[]) => s.campaign.commit(s.campaign.world.apply(calls.map(call => ({ kind: 'assert', call }))));
const w = await WorldAssembler.assemble('ash', NodeBundleSource.shared, { scenarios: 0, towns: 0, framework: null });
for (const prior of [false, true]) {
  const s = await PlaySession.start(w.path, 'ash', w.source);
  const keep = w.report.region.sites.find((x: any) => x.work?.plan === 'keep')!;
  put(s, [ModuleWriter.call('at', 'party', `region__${keep.id}_solar`)]);
  if (prior) put(s, [ModuleWriter.call('knows', 'party', 'region__history_successors')]);
  await s.perform('wait');
  const c = PlayerView.choices(s.campaign).find(x => /^Untie the castle roll/.test(x.choice.name))!;
  const r: any = await s.perform(c.choice.id);
  console.log(`--- prior knowledge=${prior}`);
  for (const p of r.perceptions ?? []) console.log(p.kind, '|', p.id, '|', p.text.slice(0, 140));
  console.log('readIn:', s.campaign.world.test(ModuleWriter.call('readIn', 'party', 'region__history_successors')),
    'witnessed:', s.campaign.world.test(ModuleWriter.call('witnessed', 'party', 'region__history_successors')));
}
{
  const s = await PlaySession.start(w.path, 'ash', w.source);
  const keep = w.report.region.sites.find((x: any) => x.work?.plan === 'keep')!;
  put(s, [ModuleWriter.call('at', 'party', `region__${keep.id}_solar`)]);
  await s.perform('wait');
  const c = PlayerView.choices(s.campaign).find(x => /^Untie the castle roll/.test(x.choice.name))!;
  await s.perform(c.choice.id);
  const k = (PlayerView.observe(s.campaign) as any).knowledge.find((e: any) => e.id === 'region__history_successors');
  console.log('knowledge entry:', JSON.stringify({ ...k, text: undefined }));
  const teachers = (s.campaign.module.observations ?? []).filter((o: any) => o.teaches === 'region__history_successors').map((o: any) => `${o.id}[${o.aspect ?? ''}] about=${o.about ?? ''}`);
  console.log('observations teaching history_successors:', teachers.length, teachers.slice(0, 6));
}
