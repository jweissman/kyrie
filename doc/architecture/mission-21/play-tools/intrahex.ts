// For a kept save: every place the map offers in the company's own hex, set out for (travel:), from a fresh resume each
// time; reports any journey whose legs leave the settlement/site it started in, or that stops short.
// bun intrahex.ts <save.json>
import { readFileSync } from 'node:fs';
const W = '/var/tmp/kyrie/wt-m21-play/src';
const { PlaySession } = await import(`${W}/session/play-session.ts`);
const { ScreenModel } = await import(`${W}/ui/screen-model.ts`);
const { Spatial } = await import(`${W}/spatial.ts`);
const { EntityIndex } = await import(`${W}/lang/entity-index.ts`);
const { HexBoundary } = await import(`${W}/hex-boundary.ts`);
const raw = JSON.parse(readFileSync(process.argv[2]!, 'utf8'));
const first = PlaySession.resume(raw);
const c0 = first.campaign, screen = ScreenModel.build(c0);
const here = c0.world.one('at', c0.playerActor ?? 'party')!;
const byId = EntityIndex.of(c0.module.entities).byId;
const top = (id: string) => Spatial.ancestry(byId, id).map((e: any) => `${e.id}:${e.type === 'place' ? e.kind ?? '' : ''}`);
console.log('here', here, top(here).slice(0, 4));
const dests = [...screen.destinations ?? [], ...screen.around ?? [], ...screen.roads ?? []]
  .filter((d: any) => !HexBoundary.crosses(c0.module, here, d.id));
console.log('same-hex destinations', dests.length);
for (const d of dests) {
  const s = PlaySession.resume(raw), c = s.campaign;
  const start = top(here);
  await s.leg(`travel:${d.id}`);
  const legs = s.journeyed?.legs ?? [];
  const places = legs.map((l: any) => l.event.location ?? '').filter(Boolean);
  const at = c.world.one('at', c.playerActor ?? 'party');
  const left = legs.some((l: any) => /across country|out into|the country about|to the road between|stakes out|path into/.test(l.said));
  console.log(`${at === d.id ? 'ok  ' : 'SHORT'} ${left ? 'LEFT' : '    '} ${d.name}: ${legs.map((l: any) => l.said).join(' / ')}${s.journeyed?.stopped ? ` [${s.journeyed.stopped}]` : ''}`);
}
