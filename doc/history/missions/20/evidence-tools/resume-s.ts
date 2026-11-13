// Scratch: resume round 10 S's browser save headlessly; the glance where the company is (or at PLACE).
const W = '/var/tmp/kyrie/wt-m20';
const { SaveCodec } = await import(`${W}/web/engine/save-codec`);
const { KeptGame } = await import(`${W}/web/engine/kept-game`);
const { PlaySession } = await import(`${W}/src/session/play-session`);
const { Glanced } = await import(`${W}/test/support/glanced`);
const raw = JSON.parse(await Bun.file('/var/tmp/kyrie/m20/s-save/raw.json').text());
const world = JSON.parse(await SaveCodec.unpack(raw.w)), state = JSON.parse(await SaveCodec.unpack(raw.v));
const whole = KeptGame.join(state, (world as any).part ?? world);
const s = PlaySession.resume((whole as any).checkpoint, { owned: true, trusted: true });
export { s };
const c = s.campaign as any;
if (process.env.PLACE) { c.commitWorld(c.world.apply([{ kind: 'assert', call: { name: 'at', args: ['party', process.env.PLACE] } }])); }
console.log('at', c.world.one('at', 'party'));
const g = Glanced.of(s), f = g.frame();
for (const a of f.leaf.glance?.acts ?? []) { console.log(a.choice, a.why, a.aspects.join(','), a.continues ? 'GOLD' : '', a.label, a.for ?? ''); }
console.log('aims', (f.screen.aims ?? []).map((a: any) => `${a.followed ? '*' : ''}${a.id}: ${a.text}`).join('\n  '));
console.log('path', f.screen.path.map((p: any) => p.id).join(' < '), 'exits', f.screen.exits.map((e: any) => `${e.destination.id}${e.visited ? '' : '(new)'}`).join(' '));
const w = c.world;
const rb = w.related('revealedBy'); console.log('revealedBy', rb.filter((r: any) => /w6|origin/.test(r.args.join())).map((r: any) => r.args.join('<-')).join(' '));
const facts = new Set(rb.map((r: any) => r.args[1]));
console.log('obs', (c.module.observations ?? []).filter((o: any) => o.teaches && facts.has(o.teaches)).map((o: any) => `${o.id} @${o.place} teaches ${o.teaches}`).join('\n'));
console.log('carries waited', JSON.stringify((c.module.objectives ?? []).find((o: any) => o.id === 'origin__marked')?.complete ?? (c.module.objectives ?? []).find((o: any) => o.id === 'origin__marked')).slice(0, 600));
