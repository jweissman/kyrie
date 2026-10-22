import { FictionalTime } from '../../src/presentation/fictional-time';
import type { SaveSummary } from '../engine/protocol';

export interface SavedGame extends SaveSummary { text: string }

// The game kept in this browser as it goes, so a reload continues where the company stands; and a save file to take
// elsewhere. Storage that is unavailable only means play goes on without it.
export class ReaderStore {
  static readonly key = 'kyrie.mono.v1';
  // What the kept game says about itself, beside it, so the title page need not open it.
  static readonly about = 'kyrie.mono.v1.summary';
  static read(): SavedGame | undefined {
    try {
      const text = localStorage.getItem(this.key), about = localStorage.getItem(this.about);
      if (!text) { return undefined; }
      return { text, ...about ? JSON.parse(about) as SaveSummary : this.summary(text) };
    } catch { return undefined; }
  }
  static write(text: string, summary: SaveSummary): SavedGame | undefined {
    try {
      localStorage.setItem(this.key, text);
      localStorage.setItem(this.about, JSON.stringify(summary));
      return { text, ...summary };
    } catch { return undefined; }
  }
  static clear() {
    try { localStorage.removeItem(this.key); localStorage.removeItem(this.about); }
    catch { /* storage may be refused */ }
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
