// Probe (741240d): a Milestone's experience is given once (observations key `<id>.achieved`), to each living member,
// and not again after a checkpoint is resumed; and it is given even when the condition is met by the world (a timed
// rule) far from the company, unlike a module's own experience (Progression.present). Usage: bun new-milestone-once.ts
import { PlaySession } from '../../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../../../../src/campaign/overlay-bundle-source';
import { PlayerView } from '../../../../../src/presentation/player-view';

const files: Record<string, string> = {
  'ms/site.kyr': `Module ms "Milestones" { Place field "Field" is wilderness.
    Place room "Room" is room within field at 0, 0. Place far "Far away" is room within field at 5, 5.
    Company party "You" of 2 at room. Relation done(group). Relation happened().
    Action deed(actor: group, site: place) "Do the deed" { Requires at(actor, site) and at(actor, room) and not done(actor). Time 1 minute. On success { Assert done(actor). } }
    Rule elsewhere at far when watch(clock) >= 3 and not happened() says "Far away, something happens." { Assert happened(). }
    Milestone deed_done "did the deed" worth 100 when done(party).
    Milestone far_off "something far away" worth 50 when happened().
    Goal false. }`,
  'ms/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'], exports: { party: 'party' } }),
  'ms.campaign.json': JSON.stringify({ version: 1, name: 'ms', modules: [{ id: 'p', bundle: 'ms/module.json' }],
    party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }, { name: 'Bo', raceId: 'human', classId: 'cleric' }] }),
};
const overlay = new OverlayBundleSource(NodeBundleSource.shared, files);
const xp = (s: PlaySession) => s.campaign.readout.creatures.filter(c => s.campaign.readout.partyIds.includes(c.id)).map(c => `${c.name}:${c.state.experience}`).join(' ');
const ids = (s: PlaySession) => PlayerView.choices(s.campaign).map(c => c.choice.id);
const s = await PlaySession.start(overlay.resolve('ms.campaign.json'), 'seed', overlay);
console.log('start', xp(s));
await s.perform(ids(s).find(i => i.includes('deed'))!);
console.log('after deed', xp(s));
const cp = structuredClone(s.checkpoint());
const r = PlaySession.resume(cp, { trusted: false });
for (const x of [s, r]) { for (let i = 0; i < 4; i++) { await x.perform('wait'); } }
console.log('continued after 4 waits', xp(s), '| resumed after 4 waits', xp(r), '| equal', s.canonical() === r.canonical());
