import { FictionalTime } from '../../src/campaign/fictional-time';
import type { SaveSummary } from '../engine/protocol';
import { WorldVault } from './world-vault';

// A kept game: its state, and the world it was played in when that is kept apart from it (see KeptGame).
// vaulted: the world is kept in IndexedDB by this key (see WorldVault), to be fetched when the game is taken up.
export interface SavedGame extends SaveSummary { text: string; world?: string; vaulted?: string }
// Which of two slots holds the kept state, and which the world it names (with that world's key).
interface Pointer { stateSlot?: Slot; worldSlot?: Slot; worldKey?: string; world?: string; vaulted?: boolean }
type Slot = 'a' | 'b';

// The game kept in this browser as it goes, so a reload continues where the company stands; and a save file to take
// elsewhere. Storage that is unavailable only means play goes on without it, and the player is told so (the
// architecture review of 26 October, N1). Each new state, and each new world, is written to the slot not in use, and
// the summary that names the slots in use is written last: a write that fails part-way (the browser's quota, reached
// by a growing world) leaves the game as it was last kept, whole, and never a new world beside an old state.
export class ReaderStore {
  static readonly key = 'kyrie.mono.v1';
  // What the kept game says about itself, beside it, so the title page need not open it; and which slots it is in.
  static readonly about = 'kyrie.mono.v1.summary';
  // The world the kept game is played in: kept once, and again only when it changes.
  static readonly world = 'kyrie.mono.world';
  static read(): SavedGame | undefined {
    try {
      const about = localStorage.getItem(this.about);
      const pointer = about ? JSON.parse(about) as SaveSummary & Pointer : undefined;
      if (pointer?.stateSlot) {
        const text = localStorage.getItem(`${this.key}.${pointer.stateSlot}`);
        const world = pointer.worldSlot ? localStorage.getItem(`${this.world}.${pointer.worldSlot}`) : undefined;
        const vaulted = pointer.vaulted && pointer.worldKey ? { vaulted: pointer.worldKey } : {};
        return text ? { text, ...this.summaryOf(pointer), ...world ? { world } : {}, ...vaulted } : undefined;
      }
      // As kept before slots: the state and the world each in one place, the world's key on its first line.
      const text = localStorage.getItem(this.key);
      if (!text) { return undefined; }
      const summary = pointer ?? this.summary(text);
      const kept = localStorage.getItem(this.world), at = kept?.indexOf('\n') ?? -1;
      const world = kept && pointer?.world && kept.slice(0, at) === pointer.world ? kept.slice(at + 1) : undefined;
      return { text, ...this.summaryOf(summary), ...world ? { world } : {} };
    } catch { return undefined; }
  }
  // vaulted: the key of a world kept in IndexedDB (WorldVault) for this state, whose localStorage slots are let go.
  static write(text: string, summary: SaveSummary, world?: { key: string; text: string },
    vaulted?: string): SavedGame | undefined {
    try {
      const was = this.pointer(), state: Slot = was.stateSlot === 'a' ? 'b' : 'a';
      if (vaulted || (was.vaulted && !world)) {
        return this.besideVault(text, summary, state, vaulted ?? was.worldKey!);
      }
      let worldSlot = was.worldSlot, worldKey = was.worldKey, worldText: string | undefined;
      // A world new to this kept game goes into the free slot; one kept before slots is carried into one.
      const fresh = world ?? (!worldSlot ? this.legacyWorld() : undefined);
      if (fresh) {
        worldSlot = was.worldSlot === 'a' ? 'b' : 'a';
        this.room(`${this.world}.${worldSlot}`, fresh.text, was.worldSlot);
        [worldKey, worldText] = [fresh.key, fresh.text];
      }
      localStorage.setItem(`${this.key}.${state}`, text);
      localStorage.setItem(this.about, JSON.stringify({ ...summary, stateSlot: state,
        ...worldSlot ? { worldSlot, worldKey } : {} }));
      this.release(state, worldSlot);
      worldText ??= worldSlot ? localStorage.getItem(`${this.world}.${worldSlot}`) ?? undefined : undefined;
      return { text, ...summary, ...worldText ? { world: worldText } : {} };
    } catch { return undefined; }
  }
  // A state kept beside a world in the vault: the summary names the world by its key; any world kept in localStorage
  // is let go, for the room.
  private static besideVault(text: string, summary: SaveSummary, state: Slot, key: string): SavedGame {
    for (const k of [`${this.world}.a`, `${this.world}.b`, this.world]) { localStorage.removeItem(k); }
    localStorage.setItem(`${this.key}.${state}`, text);
    localStorage.setItem(this.about, JSON.stringify({ ...summary, stateSlot: state, worldKey: key, vaulted: true }));
    this.release(state, undefined);
    return { text, ...summary, vaulted: key };
  }
  // A new world written beside the one kept before it, or, where the two do not fit together, in place of it: a
  // country with its standing scenarios is a world of three megabytes, and two of them had filled the browser's
  // storage, so that nothing more was kept (the integration of the adventure branch, the safe zone at 390 by 844).
  // The old world goes only when the new would not fit beside it.
  private static room(key: string, text: string, old: Slot | undefined) {
    try { localStorage.setItem(key, text); } catch (full) {
      const was = old && localStorage.getItem(`${this.world}.${old}`);
      if (!was) { throw full; }
      localStorage.removeItem(`${this.world}.${old}`);
      // Not even alone: the old world is put back, and the game stays as it was last kept.
      try { localStorage.setItem(key, text); } catch (still) { localStorage.setItem(`${this.world}.${old}`, was); throw still; }
    }
  }
  // Whether the world kept here is this one: a state is kept beside its own world, and no other.
  static holds(key: string): boolean {
    const pointer = this.pointer();
    return pointer.worldKey === key || (!pointer.worldSlot && this.legacyWorld()?.key === key);
  }
  // The slots in use now, as the summary names them.
  private static pointer(): Pointer {
    try { return JSON.parse(localStorage.getItem(this.about) ?? '{}') as Pointer; } catch { return {}; }
  }
  private static legacyWorld(): { key: string; text: string } | undefined {
    const kept = localStorage.getItem(this.world), at = kept?.indexOf('\n') ?? -1;
    return kept && at > 0 ? { key: kept.slice(0, at), text: kept.slice(at + 1) } : undefined;
  }
  // What the summary no longer names is let go, for the room: the other state slot, the other world slot once a new
  // world is kept, and the places a game was kept before slots.
  private static release(state: Slot, world: Slot | undefined) {
    localStorage.removeItem(`${this.key}.${state === 'a' ? 'b' : 'a'}`);
    if (world) { localStorage.removeItem(`${this.world}.${world === 'a' ? 'b' : 'a'}`); }
    localStorage.removeItem(this.key); localStorage.removeItem(this.world);
  }
  private static summaryOf(s: SaveSummary & Pointer): SaveSummary {
    return { title: s.title, where: s.where, when: s.when, company: s.company };
  }
  static clear() {
    try {
      for (const k of [this.key, this.about, this.world, `${this.key}.a`, `${this.key}.b`, `${this.world}.a`,
        `${this.world}.b`]) { localStorage.removeItem(k); }
    } catch { /* storage may be refused */ }
    void WorldVault.clear();
  }
  // What a game kept before summaries were kept beside it says about itself: where, when, and who.
  static summary(text: string): SaveSummary {
    if (!text.startsWith('{')) { return { title: 'your expedition', where: '', when: '', company: '' }; }
    interface Fact { name: string; args: string[] }
    interface Checkpoint {
      save?: { module?: { name?: string; entities?: { id: string; name: string }[] };
        state?: { elapsed?: number; world?: { relations?: Fact[] } } };
      transcript?: { party?: { name?: string }[] };
    }
    const parsed = JSON.parse(text) as { checkpoint?: Checkpoint } & Checkpoint;
    const checkpoint = parsed.checkpoint ?? parsed, save = checkpoint.save;
    const here = save?.state?.world?.relations?.find(r => r.name === 'at' && r.args[0] === 'party')?.args[1];
    const place = save?.module?.entities?.find(e => e.id === here)?.name ?? '';
    return { title: (save?.module?.name ?? 'your expedition').split(': ')[0]!,
      where: place.charAt(0).toUpperCase() + place.slice(1), when: FictionalTime.at(save?.state?.elapsed ?? 0),
      company: (checkpoint.transcript?.party ?? []).map(p => p.name).filter(Boolean).join(', ') };
  }
  static download(text: string, name: string) {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }
}
