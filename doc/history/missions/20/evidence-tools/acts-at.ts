// Scratch: the glance's acts where a world starts (SEED, ORIGIN), with aspects and what is inside each.
const W = '/var/tmp/kyrie/wt-m20';
const { DrawnWorld } = await import(`${W}/src/world/drawn-world`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
const { Glanced } = await import(`${W}/test/support/glanced`);
const { MenuModel } = await import(`${W}/web/reader/menu-model`);
const s = await DrawnWorld.start(process.env.SEED ?? 'a1', { origin: process.env.ORIGIN ?? 'kin', party: [{ name: 'X', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared);
const g = Glanced.of(s), f = g.frame(), m = MenuModel.build(f, 'here', []);
console.log('at', s.campaign.world.one('at', 'party'));
for (const a of f.leaf.glance?.acts ?? []) { console.log(a.choice, a.subject, a.why, a.aspects.join(','), JSON.stringify(a.inside ?? []), a.label); }
console.log('leads', (m.leads ?? []).map((a: any) => a.choice).join(' '));
const { SceneModel } = await import(`${W}/src/ui/scene`);
const { Attending } = await import(`${W}/src/ui/attention`);
const sc = Attending.place(SceneModel.build(f.screen));
for (const x of sc.subjects.filter((y: any) => y.kind === 'person')) { const t = x.choices.find((k: any) => /#talk$/.test(k.id)); console.log(x.id, Attending.all(t?.children ?? []).map((k: any) => `${k.command}|${k.label}`).join(' ; ')); }
const { GeneratedWorld } = await import(`${W}/test/support/generated`);
await GeneratedWorld.travel(s, 'region__s2_green');
const g2 = Glanced.of(s), f2 = g2.frame();
for (const a of f2.leaf.glance?.acts ?? []) { console.log('GREEN', a.choice, a.subject, a.why, a.aspects.join(','), JSON.stringify(a.inside ?? []), a.label); }
const sc2 = Attending.place(SceneModel.build(f2.screen)); const dog = sc2.subjects.find((x: any) => x.id === 'drover__dog'); console.log(JSON.stringify(dog?.choices.map((k: any) => ({ id: k.id, command: k.command, kids: (k.children ?? []).map((j: any) => j.command) }))));
