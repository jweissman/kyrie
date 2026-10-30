import type { CampaignSave } from '../campaign/campaign';
import type { SessionCheckpoint } from './play-session';
import { Identity } from '../presentation/identity';

// The subset of the Web Storage API this store needs; browsers pass localStorage, tests pass a fake.
export interface KeyValueStorage {
  getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void;
  key(index: number): string | null; readonly length: number;
}
// unreadable: why a slot would not read (it was left out of the list: the architecture review's M8).
export interface SlotSummary {
  name: string; scenario: string; seed: string; elapsed: number; savedAt: string; unreadable?: string;
}
interface StoredSlot { savedAt: string; checkpoint: SessionCheckpoint }

export class CheckpointStore {
  static readonly prefix = 'kyrie:slot:';
  static readonly autosave = 'autosave';
  constructor(private readonly storage: KeyValueStorage, private readonly now: () => string = CheckpointStore.clock) {}
  private static clock(this: void): string { return new Date().toISOString(); }
  write(name: string, checkpoint: SessionCheckpoint) {
    if (!/^[\w .:-]{1,60}$/.test(name)) { throw new Error('Slot names use 1-60 letters, digits, spaces, . : _ or -'); }
    const slot: StoredSlot = { savedAt: this.now(), checkpoint };
    this.storage.setItem(CheckpointStore.prefix + name, JSON.stringify(slot));
  }
  read(name: string): SessionCheckpoint {
    const text = this.storage.getItem(CheckpointStore.prefix + name);
    if (text === null) { throw new Error(`No saved slot ${name}`); }
    return CheckpointStore.checkpoint((JSON.parse(text) as StoredSlot).checkpoint);
  }
  remove(name: string) { this.storage.removeItem(CheckpointStore.prefix + name); }
  list(): SlotSummary[] {
    const slots: SlotSummary[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (!key?.startsWith(CheckpointStore.prefix)) { continue; }
      try {
        const slot = JSON.parse(this.storage.getItem(key)!) as StoredSlot;
        const { transcript, save } = slot.checkpoint;
        slots.push({ name: key.slice(CheckpointStore.prefix.length), scenario: transcript.scenario,
          seed: transcript.seed, elapsed: save.state.elapsed, savedAt: slot.savedAt });
      } catch (error) {
        slots.push({ name: key.slice(CheckpointStore.prefix.length), scenario: '', seed: '', elapsed: 0, savedAt: '',
          unreadable: error instanceof Error ? error.message : String(error) });
      }
    }
    return slots.sort((a, b) => b.savedAt < a.savedAt ? -1 : b.savedAt > a.savedAt ? 1 : 0);
  }
  // Accepts either a session checkpoint or a bare Kyr CampaignSave (as written by the CLI `save` command).
  static parse(text: string): SessionCheckpoint | CampaignSave {
    const value = JSON.parse(text) as Partial<SessionCheckpoint & CampaignSave>;
    if (value && typeof value === 'object' && 'transcript' in value && 'save' in value) {
      return CheckpointStore.checkpoint(value as SessionCheckpoint);
    }
    if (value?.version === 1 && value.module && value.state && Array.isArray(value.events)) {
      return value as CampaignSave;
    }
    throw new Error(`Not a ${Identity.spoken()} session checkpoint or campaign save`);
  }
  private static checkpoint(value: SessionCheckpoint): SessionCheckpoint {
    const t = value?.transcript;
    if (value?.version !== 1 || t?.version !== 1 || typeof t.scenario !== 'string' || typeof t.seed !== 'string'
      || !Array.isArray(t.steps) || t.steps.some(s => typeof s?.command !== 'string') || value.save?.version !== 1) {
      throw new Error('Invalid session checkpoint');
    }
    return value;
  }
}
