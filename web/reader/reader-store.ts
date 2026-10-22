import { FictionalTime } from '../../src/presentation/fictional-time';

export interface SavedGame { text: string; title: string; where: string; when: string; company: string }

// The game kept in this browser as it goes, so a reload continues where the company stands; and a save file to take
// elsewhere. Storage that is unavailable only means play goes on without it.
export class ReaderStore {
  static readonly key = 'kyrie.mono.v1';
  static read(): SavedGame | undefined {
    try {
      const text = localStorage.getItem(this.key);
      return text ? { text, ...this.summary(text) } : undefined;
    } catch { return undefined; }
  }
  static write(text: string): SavedGame | undefined {
    try {
      localStorage.setItem(this.key, text);
      return { text, ...this.summary(text) };
    } catch { return undefined; }
  }
  static clear() {
    try { localStorage.removeItem(this.key); } catch { /* storage may be refused */ }
  }
  // What a saved game says about itself on the title: where, when, and who.
  static summary(text: string): Omit<SavedGame, 'text'> {
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
