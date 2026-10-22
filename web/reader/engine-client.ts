import source from 'kyrie:engine';
import type { Envelope, Message, Request } from '../engine/protocol';

interface Waiting { resolve: (value: unknown) => void; reject: (error: Error) => void }

// The page's side of the engine: requests go to the worker and come back as promises; frames, saves and progress
// the engine sends of its own accord go to the listener.
export class EngineClient {
  private readonly worker: Worker;
  private serial = 0;
  private readonly waiting = new Map<number, Waiting>();
  constructor(private readonly listener: (message: Message) => void) {
    this.worker = new Worker(URL.createObjectURL(new Blob([source], { type: 'text/javascript' })));
    this.worker.onmessage = this.receive;
    this.worker.onerror = this.failed;
  }
  request<T>(request: Request): Promise<T> {
    const id = ++this.serial;
    return new Promise<T>((resolve, reject) => {
      this.waiting.set(id, { resolve: resolve as (value: unknown) => void, reject });
      this.worker.postMessage({ id, request } satisfies Envelope);
    });
  }
  private readonly receive = (event: MessageEvent<Message>) => {
    const message = event.data;
    if (message.kind !== 'reply') { this.listener(message); return; }
    const waiting = this.waiting.get(message.id);
    this.waiting.delete(message.id);
    if (message.error !== undefined) { waiting?.reject(new Error(message.error)); }
    else { waiting?.resolve(message.value); }
  };
  // A worker that fails to start or throws outside a request fails whatever is waiting on it.
  private readonly failed = (event: ErrorEvent) => {
    const error = new Error(event.message || 'The engine stopped');
    this.waiting.forEach(w => w.reject(error));
    this.waiting.clear();
  };
}
