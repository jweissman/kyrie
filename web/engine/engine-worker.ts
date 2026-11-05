/// <reference lib="webworker" />
import { EngineHost } from './engine-host';
import { ParseKeep } from './parse-keep';
import { ParseCache } from '../../src/lang/parse-cache';
import type { Envelope, Message } from './protocol';

// The engine's worker: Kyrie runs here, away from the page, so the page answers at once whatever the engine is doing.
class EngineWorker {
  static readonly scope = self as unknown as DedicatedWorkerGlobalScope;
  static readonly host = new EngineHost(EngineWorker.post);
  static post(this: void, message: Message) { EngineWorker.scope.postMessage(message); }
  static async receive(this: void, event: MessageEvent<Envelope>) {
    const { id, request } = event.data;
    try {
      await EngineWorker.keeping;
      const value = await EngineWorker.host.handle(request);
      EngineWorker.post({ kind: 'reply', id, value });
    } catch (error) {
      EngineWorker.post({ kind: 'reply', id, error: error instanceof Error ? error.message : String(error) });
    }
  }
  // What this browser parsed before, read in before anything is asked of the engine (see ParseKeep).
  static readonly keeping = ParseKeep.open().then(keep => { ParseCache.store = keep; });
}
EngineWorker.scope.onmessage = EngineWorker.receive;
// The rules are the same for every game: they are read as soon as the engine starts, while the title is up.
void EngineWorker.keeping.then(() => EngineWorker.host.warm());
