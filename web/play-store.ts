import { PlaySession } from '../src/session/play-session';
import { FictionalTime } from '../src/presentation/fictional-time';
import { ChoiceList } from '../src/ui/choice-list';
import type { Entry } from './play-types';
import type { Opening } from './play-opening';

export interface Saved { checkpoint: Parameters<typeof PlaySession.resume>[0]; log?: Entry[] }

// The game kept in this browser as it goes, so a reload continues where the company stands; and a save file to take
// elsewhere. Storage that is unavailable only means play goes on without it.
export class PlayStore {
  static readonly key = 'kyrie.mono.v1';
  static read(): Saved | undefined {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? this.upgrade(JSON.parse(raw) as Saved) : undefined;
    } catch { return undefined; }
  }
  static write(session: PlaySession, log: Entry[]): Saved | undefined {
    try {
      const saved = { checkpoint: session.checkpoint(), log: log.slice(-80) };
      localStorage.setItem(this.key, JSON.stringify(saved));
      return saved;
    } catch { return undefined; }
  }
  // A log saved by the earlier client: each line had a title and lines, and no place.
  private static upgrade(saved: Saved): Saved {
    const log = (saved.log ?? []).map(e => ({ ...e, elapsed: e.elapsed ?? 0, place: e.place ?? '', placeName: e.placeName ?? '',
      notes: e.notes ?? [], ...(e.said || e.title?.startsWith('→') ? {} : { said: e.title }) }));
    return { ...saved, log };
  }
  // What a saved game says about itself on the title: where, when, and who.
  static summary(saved: Saved): Opening['saved'] {
    interface Fact { name: string; args: string[] }
    const save = (saved.checkpoint as { save?: { module?: { name?: string; entities?: { id: string; name: string }[] };
      state?: { elapsed?: number; world?: { relations?: Fact[] } } } }).save;
    const party = (saved.checkpoint as { transcript?: { party?: { name?: string }[] } }).transcript?.party ?? [];
    const here = save?.state?.world?.relations?.find(r => r.name === 'at' && r.args[0] === 'party')?.args[1];
    const place = save?.module?.entities?.find(e => e.id === here)?.name ?? '';
    return { title: save?.module?.name ?? 'your expedition', where: ChoiceList.upper(place),
      when: FictionalTime.at(save?.state?.elapsed ?? 0), company: party.map(p => p.name).filter(Boolean).join(', ') };
  }
  static download(session: PlaySession) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(session.checkpoint())], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = `kyr-${session.campaign.state.elapsed}.json`; a.click();
    URL.revokeObjectURL(url);
  }
}
