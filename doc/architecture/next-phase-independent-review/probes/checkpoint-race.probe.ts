// Probe (review artifact; not a spec). Run: bun doc/architecture/next-phase-independent-review/probes/checkpoint-race.probe.ts
// PlaySession.perform awaits its expander (the frontier's drawing of the country beyond) after Campaign.executeAsync
// has returned and before the step is pushed. In that window Campaign.save() is allowed (executing is false, no
// leases), so a checkpoint taken then holds the command's effects but not its transcript step. EngineHost answers a
// 'checkpoint' request (the page's download) without asking whether a command is in progress (session.acting).
import { PlaySession } from '../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../src/campaign/node-bundle-source';
import { PlayerView } from '../../../../src/presentation/player-view';

const s = await PlaySession.start('test/fixtures/probes/ordinary/ordinary.campaign.json', 'race', NodeBundleSource.shared);
let release!: () => void, inside!: () => void;
const entered = new Promise<void>(r => { inside = r; });
let fail = false;
s.extend({ expand: async () => { inside(); await new Promise<void>(r => { release = r; }); if (fail) { throw new Error('expansion failed'); } } });
const go = PlayerView.choices(s.campaign).find(c => c.choice.id.startsWith('go('))!.choice.id;

// 1. A checkpoint taken while the command is between executing and being recorded.
const pending = s.perform(go);
await entered;
const mid = s.checkpoint();
console.log('acting during expansion:', s.acting);
console.log('mid-command checkpoint: transcript steps =', mid.transcript.steps.length, ', campaign events =', mid.save.events.length,
  ', party at =', JSON.stringify(mid.save.state.world.relations.find(r => r.name === 'at' && r.args[0] === 'party')?.args));
release(); await pending;
const done = s.checkpoint();
console.log('after command: transcript steps =', done.transcript.steps.length, ', campaign events =', done.save.events.length);

// 2. Resume the mid-command checkpoint and replay its (shorter) transcript in a fresh session: the save and the
// transcript disagree about what has happened.
const resumed = PlaySession.resume(mid);
const fresh = await PlaySession.start('test/fixtures/probes/ordinary/ordinary.campaign.json', 'race', NodeBundleSource.shared);
await fresh.replay(mid.transcript.steps);
console.log('resumed save location:', PlayerView.observe(resumed.campaign).location?.id,
  '| replay of its transcript location:', PlayerView.observe(fresh.campaign).location?.id);

// 3. The same window, and then the expansion fails: the command is undone, but a checkpoint taken in the window keeps it.
fail = true;
const back = PlayerView.choices(s.campaign).find(c => c.choice.id.startsWith('go('))!.choice.id;
const p2 = s.perform(back).catch(e => (e as Error).message);
await new Promise(r => setTimeout(r, 10));
const ghost = s.checkpoint();
release();
console.log('second command outcome:', await p2);
console.log('session after undo: events =', s.checkpoint().save.events.length, '| checkpoint taken in window: events =', ghost.save.events.length);
