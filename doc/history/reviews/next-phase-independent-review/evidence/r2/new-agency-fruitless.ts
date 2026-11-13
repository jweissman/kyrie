// Probe (a02ee33): Agency's "fruitless" cache is a process-global static Map keyed by `${actor.id}\0${goal.id}`, with
// an `until` (watch) that is honoured before the world-line check. Does it (1) make a continued game differ from the
// same game restored from its checkpoint, and (2) make a fresh campaign depend on an earlier one in the same process?
// The NPC has 10 independent flips (2^10 states > maxNodes/4 = 500), so a failed search is "spent" and retried only an
// hour later. Its goal needs bridge(), which the player can build, or which campaign "open" starts with.
// Usage: bun new-agency-fruitless.ts
import { PlaySession } from '../../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../../../../src/campaign/overlay-bundle-source';
import { PlayerView } from '../../../../../src/presentation/player-view';
import { Agency } from '../../../../../src/campaign/agency';
import { ModuleWriter } from '../../../../../src/lang/module-writer';

const flips = Array.from({ length: 10 }, (_, i) => i + 1);
function source(open: boolean) {
  return `Module fr "Fruitless" { Place field "Field" is wilderness.
  Place room "Room" is room within field at 0, 0. Company party "You" of 1 at room.
  Relation bridge(). Relation done(group). ${flips.map(k => `Relation f${k}(group).`).join(' ')}
  ${open ? 'Initially Assert bridge().' : ''}
  ${flips.map(k => `Action flip${k}(actor: group) "Flip ${k}" { Requires not f${k}(actor). Time 1 minute. On success { Assert f${k}(actor). } }`).join('\n  ')}
  Action finish(actor: group) "Finish" { Requires bridge() and not done(actor). Time 1 minute. On success { Assert done(actor). } }
  Action build(actor: group, site: place) "Build the bridge" { Requires at(actor, site) and not bridge(). Time 1 minute. On success { Assert bridge(). } }
  Person npc "the clerk" at room { Role "a clerk". Ancestry human. Calling warrior. Level 1. Peaceable. Plans 12 steps. Uses ${flips.map(k => `flip${k}`).join(', ')}, finish. }
  Pursuit get_done for npc "getting it done" priority 20 when true seeks done(npc).
  Goal false. }`;
}
const files: Record<string, string> = {};
for (const [dir, open] of [['shut', false], ['open', true]] as const) {
  files[`fr/${dir}/site.kyr`] = source(open);
  files[`fr/${dir}/module.json`] = JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'], exports: { party: 'party' } });
  files[`fr/${dir}.campaign.json`] = JSON.stringify({ version: 1, name: dir, modules: [{ id: 'p', bundle: `${dir}/module.json` }],
    party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] });
}
const overlay = new OverlayBundleSource(NodeBundleSource.shared, files);
const fruitless = (Agency as unknown as { fruitless: Map<string, unknown> }).fruitless;
const done = (s: PlaySession) => s.campaign.world.test(ModuleWriter.call('p__done', 'p__npc'));
const watch = (s: PlaySession) => s.campaign.world.number(ModuleWriter.call('watch', 'clock'));
const wait = async (s: PlaySession) => {
  const id = PlayerView.choices(s.campaign).map(c => c.choice.id).find(i => /^wait/.test(i))!;
  await s.perform(id);
};
const start = (dir: string) => PlaySession.start(overlay.resolve(`fr/${dir}.campaign.json`), 'seed', overlay);

// (1) Continued vs restored. Wait (the NPC searches 1024 states and fails), build the bridge, then wait.
fruitless.clear();
const s = await start('shut');
await wait(s);
console.log('after first wait: watch', watch(s), 'cache', JSON.stringify([...fruitless.entries()].map(([k, v]) => [k.replace('\u0000', '|'), (v as { until?: number }).until])));
const build = PlayerView.choices(s.campaign).map(c => c.choice.id).find(i => i.includes("build"))!;
await s.perform(build);
const cp = structuredClone(s.checkpoint());
await wait(s);
console.log('(1) continued:  watch', watch(s), 'npc done =', done(s));
fruitless.clear(); // what a fresh worker or CLI process resuming this checkpoint starts with
const r = PlaySession.resume(cp, { trusted: true });
await wait(r);
console.log('(1) restored:   watch', watch(r), 'npc done =', done(r), '; canonical equal:', r.canonical() === s.canonical());

// (2) A fresh "open" campaign alone, and after a "shut" one in the same process.
fruitless.clear();
const alone = await start('open'); await wait(alone);
console.log('(2) open alone:          watch', watch(alone), 'npc done =', done(alone));
fruitless.clear();
const a = await start('shut'); for (let i = 0; i < 12; i++) { await wait(a); }
console.log('    shut played first to watch', watch(a));
const b = await start('open'); let n = 0;
while (!done(b) && n < 40) { await wait(b); n++; }
console.log('(2) open after shut:     npc done only at watch', watch(b), 'after', n, 'waits; alone it was done after 1');
