// Prints what the page's glance leads with, and why, for a kept checkpoint. bun glance.ts <save.json>
import { readFileSync } from 'node:fs';
const W = '/var/tmp/kyrie/wt-m21-play/src';
const { PlaySession } = await import(`${W}/session/play-session.ts`);
const { ScreenModel } = await import(`${W}/ui/screen-model.ts`);
const { Narrator } = await import(`${W}/presentation/narrator.ts`);
const { Undertakings } = await import(`${W}/presentation/undertakings.ts`);
const s = PlaySession.resume(JSON.parse(readFileSync(process.argv[2]!, 'utf8')));
const c = s.campaign, screen = ScreenModel.build(c), leaf = Narrator.leaf(c, screen);
const g = leaf.glance!;
console.log('followed:', Undertakings.followed(c)?.id, '| held:', Undertakings.held(c).map((o: any) => o.id));
console.log('aim said:', g.aim, '| aimed:', g.aimed, '| following:', g.following, '| back:', g.back);
for (const a of g.acts) console.log(' act', a.label, '|', a.why, a.tier, a.aspects, a.continues ? 'CONTINUES' : '', a.inside ?? '');
console.log(' ways', g.ways);
const { PlayerView } = await import(`${W}/presentation/player-view.ts`);
for (const ch of PlayerView.observe(c).choices) if (/Mistshaw and Millholm|much of/.test(ch.name)) console.log(' choice', ch.id, ch.name);
for (const r of PlayerView.choices(c)) if (/cairn/.test(r.choice.name)) console.log(' row', r.choice.id, JSON.stringify(r.action.bindings), r.action.schema);
