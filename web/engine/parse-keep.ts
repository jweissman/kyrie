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
      const db = await this.request(indexedDB.open(this.database, 1), r => {
        r.result.createObjectStore('parsed');
      });
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
  get(key: string): Module | undefined { return this.kept.get(key); }
  set(key: string, module: Module) {
    this.kept.set(key, module);
    try {
      this.db?.transaction('parsed', 'readwrite').objectStore('parsed').put(module, `${BuildStamp.current}\u0002${key}`);
    } catch { /* Not kept: only slower next time. */ }
  }
  private static request<T>(r: IDBRequest<T> | IDBOpenDBRequest, upgrade?: (r: IDBOpenDBRequest) => void): Promise<T> {
    return new Promise((resolve, reject) => {
      if (upgrade && 'onupgradeneeded' in r) { r.onupgradeneeded = () => upgrade(r); }
      r.onsuccess = () => resolve(r.result as T);
      r.onerror = () => reject(r.error ?? new Error('IndexedDB request failed'));
    });
  }
}
