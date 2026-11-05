import type { Module } from '../../src/lang/module';
import { BuildStamp } from '../../src/session/build-stamp';

// Parsed Kyr kept in the browser between visits, as a process with a file system keeps it on disk (ParseStore): a new
// game had parsed every adventure and rule afresh, every time, and that was most of Setting out's wait (M19-49). Kept
// by the edition that parsed it, so that a new edition reads every text afresh; read whole into memory as the engine
// starts (a parse is asked for at once, and cannot wait on the database), written as each text is parsed. A browser
// that keeps nothing (a private window, storage refused) is only slower.
export class ParseKeep {
  static readonly database = 'kyrie-parse';
  static readonly most = 600;
  private constructor(private readonly db: IDBDatabase | undefined, private readonly kept: Map<string, Module>) {}
  static async open(): Promise<ParseKeep> {
    try {
      const db = await this.request(indexedDB.open(this.database, 1), ParseKeep.made);
      const store = db.transaction('parsed', 'readwrite').objectStore('parsed');
      const [keys, values] = await Promise.all([this.request(store.getAllKeys()), this.request(store.getAll())]);
      const kept = new Map<string, Module>(), stale: IDBValidKey[] = [];
      keys.forEach((k, i) => {
        const whole = String(k), at = whole.indexOf('\u0002');
        if (at > 0 && whole.slice(0, at) === BuildStamp.current) { kept.set(whole.slice(at + 1), values[i] as Module); }
        else { stale.push(k); }
      });
      // What an earlier edition parsed is let go; and all of it, once it has grown past what a few countries need (each
      // new country's own files are parsed once, and kept).
      if (kept.size > ParseKeep.most) {
        stale.push(...[...kept.keys()].map(k => `${BuildStamp.current}\u0002${k}`)); kept.clear();
      }
      if (stale.length) {
        const out = db.transaction('parsed', 'readwrite').objectStore('parsed');
        for (const k of stale) { out.delete(k); }
      }
      return new ParseKeep(db, kept);
    } catch { return new ParseKeep(undefined, new Map()); }
  }
  private static made(this: void, r: IDBOpenDBRequest) { r.result.createObjectStore('parsed'); }
  get(key: string): Module | undefined { return this.kept.get(key); }
  set(key: string, module: Module) {
    this.kept.set(key, module);
    try {
      this.db?.transaction('parsed', 'readwrite').objectStore('parsed').put(module, `${BuildStamp.current}\u0002${key}`);
    } catch { /* Not kept: only slower next time. */ }
  }
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
