// Scratch: as Q did it — the crypt lit, the ring seen, then through the arch to the ossuary.
const W = process.env.W ?? '/var/tmp/kyrie/wt-m20';
const { DrawnWorld } = await import(`${W}/src/world/drawn-world`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
const { PlayerView } = await import(`${W}/src/presentation/player-view`);
const { ModuleWriter } = await import(`${W}/src/lang/module-writer`);
const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'R', raceId: 'catfolk', classId: 'mage' }] }, NodeBundleSource.shared);
const c = s.campaign as any, id = (suf: string) => c.module.entities.find((e: any) => e.id.endsWith(suf))!.id;
c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')) }, { kind: 'assert', call: ModuleWriter.call('at', 'party', id('_u_crypt')) }]));
const rows = () => PlayerView.choices(c);
const take = async (p: RegExp) => { const r = rows().find((x: any) => p.test(x.choice.name)); if (!r) { console.log('no', p, rows().map((x: any) => x.choice.name).slice(0, 30).join(' | ')); return; } const e = await s.leg(r.choice.id); console.log('>', r.choice.name); };
const k = (f: string) => c.world.test(ModuleWriter.call('knows', 'party', id(f)));
await take(/^Light|Have .* use Light/);
console.log('raised', k('_u_dead_raised'), 'read', k('_u_dead_read'));
await take(/ossuary/i);
console.log('at', c.world.one('at', 'party'), 'raised', k('_u_dead_raised'), 'read', k('_u_dead_read'));
console.log('ROWS:', rows().map((r: any) => r.choice.name).filter((n: string) => /candle|rite|book|ring|let you|Warn|Creep/i.test(n)).join(' | '));
