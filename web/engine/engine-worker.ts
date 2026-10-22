/// <reference lib="webworker" />
import { EngineHost } from './engine-host';
import type { Envelope, Message } from './protocol';

// The engine's worker: Kyrie runs here, away from the page, so the page answers at once whatever the engine is doing.
class EngineWorker {
  static readonly scope = self as unknown as DedicatedWorkerGlobalScope;
  static readonly host = new EngineHost(EngineWorker.post);
  static post(this: void, message: Message) { EngineWorker.scope.postMessage(message); }
  static async receive(this: void, event: MessageEvent<Envelope>) {
    const { id, request } = event.data;
    try {
      const value = await EngineWorker.host.handle(request);
      EngineWorker.post({ kind: 'reply', id, value });
    } catch (error) {
      EngineWorker.post({ kind: 'reply', id, error: error instanceof Error ? error.message : String(error) });
    }
  }
}
EngineWorker.scope.onmessage = EngineWorker.receive;
