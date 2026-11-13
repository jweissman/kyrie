// Scratch: at the churchyard without the key, what the way down and its lock say.
const W = '/var/tmp/kyrie/wt-m20';
const { DrawnWorld } = await import(`${W}/src/world/drawn-world`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
const { ScreenModel } = await import(`${W}/src/ui/screen-model`);
const { ChoiceList } = await import(`${W}/src/ui/choice-list`);
const { ModuleWriter } = await import(`${W}/src/lang/module-writer`);
const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'R', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared);
const c = s.campaign as any, id = (suf: string) => c.module.entities.find((e: any) => e.id.endsWith(suf))!.id;
c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')) }, { kind: 'assert', call: ModuleWriter.call('at', 'party', id('_u_yard')) }]));
const sc = ScreenModel.build(c);
for (const e of sc.exits.filter((e: any) => /crypt|stair/i.test(e.destination.name + e.name))) console.log('exit', e.name, '→', e.destination.name, '| blocked:', e.blocked, '|', JSON.stringify(e.acts?.map((a: any) => [a.label, a.disabled])).slice(0, 300));
const flat = (cs: any[]): any[] => cs.flatMap(x => [x, ...flat(x.children ?? [])]);
console.log(flat(ChoiceList.all(ChoiceList.explore(sc))).filter((x: any) => /stone door|crypt|lock/i.test(x.label)).map((x: any) => `${x.label}${x.disabled ? ' [' + x.disabled + ']' : ''}`).join('\n'));
