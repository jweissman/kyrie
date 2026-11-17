import type { Envelope, Message, Request } from '../engine/protocol';

interface Waiting { resolve: (value: unknown) => void; reject: (error: Error) => void }

// The page's side of the engine: requests go to the worker and come back as promises; frames, saves and progress
// the engine sends of its own accord go to the listener.
// The engine is its own script beside the page's (engine.js, see src/cli/site-build.ts), never inside it: inside, its
// 17 MB were compiled before the title could be drawn (OR-09: 2.9 s cold, 11.9 s at a quarter of the speed). Served,
// the worker loads it itself; from file://, where a worker may not be started from a file, it is read in as a script
// once the title is up and the worker started from its text. What is asked before it runs waits for it.
export class EngineClient {
  private worker?: Worker;
  private readonly queued: Envelope[] = [];
  private serial = 0;
  private readonly waiting = new Map<number, Waiting>();
  constructor(private readonly listener: (message: Message) => void) {
    try { this.started(new Worker(EngineClient.script)); } catch { EngineClient.drawn(this.read); }
  }
  static readonly script = 'engine.js';
  // Once the page has drawn its first frame (two frames on, then a turn of the loop: the title is up).
  private static drawn(then: () => void) {
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(then, 0)));
  }
  request<T>(request: Request): Promise<T> {
    const id = ++this.serial;
    return new Promise<T>((resolve, reject) => {
      this.waiting.set(id, { resolve: resolve as (value: unknown) => void, reject });
      const envelope = { id, request } satisfies Envelope;
      if (this.worker) { this.worker.postMessage(envelope); } else { this.queued.push(envelope); }
    });
  }
  private started(worker: Worker) {
    this.worker = worker;
    worker.onmessage = this.receive;
    worker.onerror = this.failed;
    this.queued.splice(0).forEach(e => worker.postMessage(e));
  }
  // From file://: the engine's script read in, which names its body (kyrieEngine) without running it in the page.
  private readonly read = () => {
    const tag = document.createElement('script');
    tag.src = EngineClient.script; tag.async = true;
    tag.onload = this.loaded.bind(this, tag);
    tag.onerror = this.unloaded.bind(this, 'The engine could not be loaded');
    document.head.append(tag);
  };
  private loaded(tag: HTMLScriptElement) {
    const scope = window as unknown as { kyrieEngine?: () => void }, body = scope.kyrieEngine;
    if (!body) { this.unloaded('The engine did not load'); return; }
    this.started(new Worker(URL.createObjectURL(new Blob([`(${body.toString()})();`], { type: 'text/javascript' }))));
    delete scope.kyrieEngine; tag.remove();
  }
  private unloaded(message: string) { this.failed(new ErrorEvent('error', { message })); }
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
