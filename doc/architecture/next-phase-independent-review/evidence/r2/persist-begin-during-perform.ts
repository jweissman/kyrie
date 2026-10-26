// Probe (r2): the worker runs requests concurrently and EngineHost keeps per-game state on itself (log, told, turn,
// working). A 'begin' (title page -> new game) arriving while a slow command is still under way (a country beyond
// being drawn; the Journal's "Back to the title" is reachable while a command is pending) lets the old command finish
// into the NEW game: its journal entry and its telling land in the new game's log, frame and autosave.
import { EngineHost } from '../../../../../web/engine/engine-host';
import type { Frame, Message } from '../../../../../web/engine/protocol';
import { PlaySession } from '../../../../../src/session/play-session';
import { PlayerView } from '../../../../../src/presentation/player-view';

const saves: string[] = [];
const host = new EngineHost((m: Message) => { if (m.kind === 'saved') { saves.push(m.save); } });
const inner = host as unknown as { session: PlaySession; log: { title: string; placeName: string }[] };
const campaign = 'data/campaigns/the-long-man.campaign.json';
const setting = await host.handle({ kind: 'setting', campaign }) as { party: never[] };
await host.handle({ kind: 'begin', campaign, seed: 'merrow', party: setting.party });
const old = inner.session;
// Stand in for a slow frontier draw (as test/checkpoint-race.test.ts does).
let release!: () => void; const entered = new Promise<void>(r => { old.extend({ expand: async () => { r(); await new Promise<void>(x => { release = x; }); } }); });
const go = PlayerView.choices(old.campaign).find(c => c.choice.id.startsWith('go('))!.choice;
const performing = host.handle({ kind: 'perform', command: go.id, said: `OLD GAME: ${go.name}`, move: true }) as Promise<Frame>;
await entered;
const other = 'data/campaigns/thrume.campaign.json';
const s2 = await host.handle({ kind: 'setting', campaign: other }) as { party: never[] };
const begun = await host.handle({ kind: 'begin', campaign: other, seed: 'saltgrave', party: s2.party }) as Frame;
console.log('new game begun:', begun.title, '; its log entries:', inner.log.length);
release();
const late = await performing;
console.log('old perform resolved with a frame titled', JSON.stringify(late.title), 'whose last entry says', JSON.stringify(late.entries.at(-1)?.title));
console.log('NEW game log now:', JSON.stringify(inner.log.map(e => e.title)), '; new session steps:', inner.session.transcript.steps.length);
await new Promise(r => setTimeout(r, 300));
const { SaveCodec } = await import('../../../../../web/engine/save-codec');
const last = JSON.parse(await SaveCodec.unpack(saves.at(-1)!));
console.log('latest autosave: scenario', last.checkpoint.transcript.scenario, '; log in it:', JSON.stringify(last.log.map((e: { title: string }) => e.title)));
process.exit(0);
