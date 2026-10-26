// Probe: a quota error between ReaderStore.write's setItem calls leaves an unloadable kept game.
import { ReaderStore } from '../../../../web/reader/reader-store';
const store = new Map<string, string>(); const QUOTA = 5_000_000;
const used = () => [...store].reduce((n, [k, v]) => n + k.length + v.length, 0);
(globalThis as any).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => {
    const next = used() - (store.get(k)?.length ?? 0) + v.length;
    if (next > QUOTA) { throw new DOMException('quota', 'QuotaExceededError'); }
    store.set(k, v);
  },
  removeItem: (k: string) => store.delete(k),
};
const summary = { title: 't', where: 'w', when: '', company: '' };
// Turn 1: a 1.5 MB world and a 1 MB state, fits.
console.log('write 1:', !!ReaderStore.write('S1'.padEnd(1_000_000, 'x'), summary, { key: 'W1', text: 'w'.padEnd(1_500_000, 'w') }));
// Turn 2: the company crossed a march: a new 2.5 MB world, state now 2.6 MB. The world write succeeds, the state does not.
console.log('write 2:', !!ReaderStore.write('S2'.padEnd(2_600_000, 'x'), summary, { key: 'W2', text: 'w'.padEnd(2_500_000, 'w') }));
const back = ReaderStore.read()!;
console.log('state kept:', back.text.slice(0, 2), '| world key stored:', store.get(ReaderStore.world)!.slice(0, 2),
  '| summary names world:', JSON.parse(store.get(ReaderStore.about)!).world, '| world returned to resume:', back.world !== undefined);
console.log('back.world =', JSON.stringify(back.world).slice(0,40));
