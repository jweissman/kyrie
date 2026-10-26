import { describe, expect, it, spyOn } from 'bun:test';
import { CheckpointStore } from '../src/session/checkpoint-store';
import { MemoryStorage } from './support/memory-storage';
import { ActionSchemas } from '../src/campaign/action-schemas';
import { ModuleParser } from '../src/lang/module-parser';
import { EngineHost } from '../web/engine/engine-host';
import type { Message } from '../web/engine/protocol';
import { SaveCodec } from '../web/engine/save-codec';

// A failure is said, not taken for nothing (the architecture review's M8): a save slot that would not read vanished
// from the list; an action whose grounding threw was taken by lint for one with a target; and a game the engine could
// not keep was not kept, and nobody was told.
describe('a failure', () => {
  it('of a save slot is listed as unreadable', () => {
    const storage = new MemoryStorage();
    storage.setItem(`${CheckpointStore.prefix}broken`, '{ not json');
    expect(new CheckpointStore(storage).list()).toMatchObject([{ name: 'broken', unreadable: expect.any(String) }]);
  });
  it('to ground an action is said to lint', () => {
    const module = ModuleParser.parse(`Module m "M" { Kind group. Relation at(group, entity). Entity party: group "You".
      Action poke(actor: group) "Poke" { Requires at(actor, ?p). Time 1. } }`);
    const failed = new Map<string, string>();
    spyOn(ActionSchemas as unknown as { bindings: () => never }, 'bindings').mockImplementationOnce(() => {
      throw new Error('a measure that throws');
    });
    expect(ActionSchemas.targeted(module, undefined, failed).has('poke')).toBe(true);
    expect(failed.get('poke')).toContain('a measure that throws');
  });
  it('to keep the game is said to the page', async () => {
    const said: Message[] = [];
    const host = new EngineHost((m: Message) => { said.push(m); });
    const campaign = 'data/campaigns/the-long-man.campaign.json';
    const setting = await host.handle({ kind: 'setting', campaign }) as { party: never[] };
    const pack = spyOn(SaveCodec, 'pack').mockImplementation(() => Promise.reject(new Error('no room')));
    try {
      await host.handle({ kind: 'begin', campaign, seed: 'merrow', party: setting.party });
      for (let i = 0; i < 100 && !said.some(m => m.kind === 'unkept'); i++) { await new Promise(r => setTimeout(r, 20)); }
    } finally { pack.mockRestore(); }
    expect(said.find(m => m.kind === 'unkept')).toMatchObject({ kind: 'unkept', reason: expect.stringContaining('no room') });
  }, 240000);
});
