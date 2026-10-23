import { FictionalTime } from '../../src/presentation/fictional-time';
import type { SaveSummary } from '../engine/protocol';

// A kept game: its state, and the world it was played in when that is kept apart from it (see KeptGame).
export interface SavedGame extends SaveSummary { text: string; world?: string }

// The game kept in this browser as it goes, so a reload continues where the company stands; and a save file to take
// elsewhere. Storage that is unavailable only means play goes on without it.
export class ReaderStore {
  static readonly key = 'kyrie.mono.v1';
  // What the kept game says about itself, beside it, so the title page need not open it.
  static readonly about = 'kyrie.mono.v1.summary';
  // The world the kept game is played in: its key, a line, and its text. Kept once, and again only when it changes.
  static readonly world = 'kyrie.mono.world';
  static read(): SavedGame | undefined {
    try {
      const text = localStorage.getItem(this.key), about = localStorage.getItem(this.about);
      if (!text) { return undefined; }
      const summary = about ? JSON.parse(about) as SaveSummary & { world?: string } : this.summary(text);
      const kept = localStorage.getItem(this.world), at = kept?.indexOf('\n') ?? -1;
      const world = kept && 'world' in summary && kept.slice(0, at) === summary.world ? kept.slice(at + 1) : undefined;
      return { text, ...summary, ...world ? { world } : {} };
    } catch { return undefined; }
  }
  static write(text: string, summary: SaveSummary, world?: { key: string; text: string }): SavedGame | undefined {
    try {
      if (world) { localStorage.setItem(this.world, `${world.key}\n${world.text}`); }
      const kept = localStorage.getItem(this.world), key = kept?.slice(0, kept.indexOf('\n'));
      localStorage.setItem(this.key, text);
      localStorage.setItem(this.about, JSON.stringify({ ...summary, ...key ? { world: key } : {} }));
      return { text, ...summary, ...kept ? { world: kept.slice(kept.indexOf('\n') + 1) } : {} };
    } catch { return undefined; }
  }
  static clear() {
    try { localStorage.removeItem(this.key); localStorage.removeItem(this.about); localStorage.removeItem(this.world); }
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
