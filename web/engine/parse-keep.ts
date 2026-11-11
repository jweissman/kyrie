import type { Module } from '../../src/lang/module';
import { BuildStamp } from '../../src/session/build-stamp';

// Parsed Kyr kept in the browser between visits, as a process with a file system keeps it on disk (ParseStore): a new
// game had parsed every adventure and rule afresh, every time, and that was most of Setting out's wait (M19-49). Kept
// by the edition that parsed it, so that a new edition reads every text afresh; read whole into memory as the engine
// starts (a parse is asked for at once, and cannot wait on the database), written as each text is parsed. A browser
// that keeps nothing (a private window, storage refused) is only slower.
// Each is kept by a hash of its text, not the text (a country's own files, megabytes, had been their own keys), and
// when each was last used is kept beside them: past a budget, those least lately used are let go as the engine starts,
// a country left behind before the rules every game reads (three countries begun had kept 372 parses, 33 MB, all
// read in at every start: the owner's iPad, 11 November). It is a cache: nothing kept here is a game.
export class ParseKeep {
  static readonly database = 'kyrie-parse';
  static readonly most = 240;
  private static readonly touchedKey = '\u0001touched';
  private constructor(private readonly db: IDBDatabase | undefined, private readonly kept: Map<string, Module>,
    private readonly touched: Map<string, number>) {}
  static async open(): Promise<ParseKeep> {
    try {
      const db = await this.request(indexedDB.open(this.database, 1), ParseKeep.made);
      const store = db.transaction('parsed', 'readwrite').objectStore('parsed');
      const [keys, values] = await Promise.all([this.request(store.getAllKeys()), this.request(store.getAll())]);
      const kept = new Map<string, Module>(), stale: IDBValidKey[] = [], prefix = `${BuildStamp.current}\u0002#`;
      let touched = new Map<string, number>();
      keys.forEach((k, i) => {
        const whole = String(k);
        if (whole === ParseKeep.touchedKey) { touched = new Map(Object.entries(values[i] as Record<string, number>)); }
        else if (whole.startsWith(prefix)) { kept.set(whole.slice(prefix.length), values[i] as Module); }
        else { stale.push(k); }
      });
      // What an earlier edition parsed, or kept by its text, is let go; and past the budget, the least lately used.
      const by = [...kept.keys()].sort((a, b) => (touched.get(a) ?? 0) - (touched.get(b) ?? 0));
      for (const h of by.slice(0, Math.max(0, by.length - ParseKeep.most))) { kept.delete(h); stale.push(`${prefix}${h}`); }
      if (stale.length) {
        const out = db.transaction('parsed', 'readwrite').objectStore('parsed');
        for (const k of stale) { out.delete(k); }
      }
      return new ParseKeep(db, kept, new Map([...touched].filter(([h]) => kept.has(h))));
    } catch { return new ParseKeep(undefined, new Map(), new Map()); }
  }
  private static made(this: void, r: IDBOpenDBRequest) { r.result.createObjectStore('parsed'); }
  // A text's hash and length: two texts alike in both are taken for the same (53 bits, and the length besides).
  static hash(text: string): string {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return `${(4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36)}.${text.length.toString(36)}`;
  }
  get(key: string): Module | undefined {
    const h = ParseKeep.hash(key), found = this.kept.get(h);
    if (found) { this.touch(h); }
    return found;
  }
  set(key: string, module: Module) {
    const h = ParseKeep.hash(key);
    this.kept.set(h, module); this.touch(h);
    try {
      this.db?.transaction('parsed', 'readwrite').objectStore('parsed').put(module, `${BuildStamp.current}\u0002#${h}`);
    } catch { /* Not kept: only slower next time. */ }
  }
  // When each was last used, written a moment after the last use, once for many.
  private timer?: ReturnType<typeof setTimeout>;
  private touch(h: string) {
    this.touched.set(h, Date.now());
    clearTimeout(this.timer);
    this.timer = setTimeout(this.keepTouched, 2000);
  }
  private readonly keepTouched = () => {
    try {
      this.db?.transaction('parsed', 'readwrite').objectStore('parsed')
        .put(Object.fromEntries(this.touched), ParseKeep.touchedKey);
    } catch { /* Not kept: what is let go is guessed less well. */ }
  };
  private static request<T>(r: IDBRequest<T> | IDBOpenDBRequest, upgrade?: (r: IDBOpenDBRequest) => void): Promise<T> {
    const { promise, resolve, reject } = Promise.withResolvers<T>();
    if (upgrade && 'onupgradeneeded' in r) { r.addEventListener('upgradeneeded', upgrade.bind(null, r)); }
    r.addEventListener('success', ParseKeep.succeeded.bind(undefined, r as IDBRequest, resolve as (v: unknown) => void));
    r.addEventListener('error', ParseKeep.failed.bind(undefined, r as IDBRequest, reject));
    return promise;
  }
  private static succeeded(this: void, r: IDBRequest, resolve: (v: unknown) => void) { resolve(r.result); }
  private static failed(this: void, r: IDBRequest, reject: (e: unknown) => void) {
    reject(r.error ?? new Error('IndexedDB request failed'));
  }
}
