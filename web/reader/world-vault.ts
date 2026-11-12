// The world a kept game is played in, kept in the browser's IndexedDB where it offers one: a country with its
// standing scenarios is about 3 MB packed, and with the game's two state slots that was more than localStorage holds
// (5 MB, counted twice over as UTF-16), so that nothing could be kept from the first command (the owner, 12 November,
// after the integration). Only the latest world is kept. Where there is no IndexedDB, the world stays in
// localStorage as before (see ReaderStore).
export class WorldVault {
  static available(): boolean { return typeof indexedDB !== 'undefined'; }
  private static open(): Promise<IDBDatabase> {
    return new Promise((done, failed) => {
      const request = indexedDB.open('kyrie', 1);
      request.addEventListener('upgradeneeded', () => { request.result.createObjectStore('worlds'); });
      request.addEventListener('success', () => done(request.result));
      request.addEventListener('error', () => failed(request.error));
    });
  }
  // The world kept, in place of any kept before it; whether it was.
  static async put(key: string, text: string): Promise<boolean> {
    try {
      const db = await this.open();
      await new Promise<void>((done, failed) => {
        const tx = db.transaction('worlds', 'readwrite'), store = tx.objectStore('worlds');
        store.clear(); store.put(text, key);
        tx.addEventListener('complete', () => done());
        tx.addEventListener('error', () => failed(tx.error));
        tx.addEventListener('abort', () => failed(tx.error));
      });
      db.close();
      return true;
    } catch { return false; }
  }
  static async get(key: string): Promise<string | undefined> {
    try {
      const db = await this.open();
      const text = await new Promise<string | undefined>((done, failed) => {
        const request = db.transaction('worlds', 'readonly').objectStore('worlds').get(key);
        request.addEventListener('success', () => done(typeof request.result === 'string' ? request.result : undefined));
        request.addEventListener('error', () => failed(request.error));
      });
      db.close();
      return text;
    } catch { return undefined; }
  }
  static async clear(): Promise<void> {
    if (!this.available()) { return; }
    try {
      const db = await this.open();
      await new Promise<void>(done => {
        const tx = db.transaction('worlds', 'readwrite');
        tx.objectStore('worlds').clear();
        tx.addEventListener('complete', () => done());
        tx.addEventListener('error', () => done());
      });
      db.close();
    } catch { /* storage may be refused */ }
  }
}
