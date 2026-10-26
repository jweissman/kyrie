// Probe (r2): a 'perform' that arrives while a fight waits on the player's choice is refused by PlaySession
// ('A command is already in progress'), but EngineHost.perform's finally clears this.turn (engine-host.ts:157), so
// the fight in progress can never be answered: the game is wedged until reload. (Set-up as test/fight-held.test.ts.)
import { EngineHost } from '../../../../../web/engine/engine-host';
import type { Frame, Message } from '../../../../../web/engine/protocol';
import { PlaySession } from '../../../../../src/session/play-session';
import { PlayerView } from '../../../../../src/presentation/player-view';
import { ModuleWriter } from '../../../../../src/lang/module-writer';
import { CreatureFacts } from '../../../../../src/campaign/creature-facts';
import { CreatureStore } from '../../../../../src/creature-store';
import { World } from '../../../../../src/lang/world';

let fightFrames = 0, saved = 0;
const host: EngineHost = new EngineHost((m: Message) => {
  if (m.kind === 'frame' && m.frame.combat) { fightFrames++; }
  if (m.kind === 'saved') { saved++; }
});
await host.handle({ kind: 'begin', campaign: 'world', seed: 'a1', origin: 'wanderer',
  party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
const held = host as unknown as { session: PlaySession; turn?: unknown }, checkpoint = held.session.checkpoint();
const save = checkpoint.save, room = 'region__w8_halls_mourners';
const world = new World(save.module, save.state.world).apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', room) },
  { kind: 'retract', call: ModuleWriter.call('unlit', room) }]);
save.state.world = CreatureFacts.project(world, save.definition!.actors, new CreatureStore(save.creatures)).snapshot;
held.session = PlaySession.resume(checkpoint);
const attack = PlayerView.choices(held.session.campaign).find(c => /^Attack/.test(c.choice.name))!;
const fight = host.handle({ kind: 'perform', command: attack.choice.id, said: 'Attack', move: false, named: true }) as Promise<Frame>;
let settled = false; void fight.then(() => { settled = true; }, () => { settled = true; });
await new Promise(r => setTimeout(r, 50));
console.log('fight frames posted:', fightFrames, '; turn held:', !!held.turn);
const other = attack.choice.id; // any command: the busy check comes before resolving it
try { await host.handle({ kind: 'perform', command: other, said: 'x', move: false }); console.log('second perform succeeded?!'); }
catch (e) { console.log('second perform rejected:', (e as Error).message); }
console.log('after the rejected perform, turn held:', !!held.turn, '; session acting:', held.session.acting);
console.log('fight choice now returns:', await host.handle({ kind: 'fight' }));
await new Promise(r => setTimeout(r, 500));
console.log('original attack settled:', settled);
try { await host.handle({ kind: 'perform', command: other, said: 'x', move: false }); } catch (e) { console.log('any later command:', (e as Error).message); }
const checkpointing = host.handle({ kind: 'checkpoint' }).then(() => 'returned', e => `REJECTED at once: ${(e as Error).message} (this.working was replaced by the rejected perform's promise)`);
console.log('download (checkpoint) after 500 ms:', await Promise.race([checkpointing, new Promise(r => setTimeout(() => r('still waiting'), 500))]), '; autosaves posted:', saved);
process.exit(0);
