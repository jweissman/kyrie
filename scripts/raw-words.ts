// Sweeps each authored campaign for raw identifiers on the page (the register's M19-25): the company stood in every
// room, the screen and the narrator's leaf built, and every word shown searched for snake_case, `__` and braces.
//   bun scripts/raw-words.ts [campaign name part]
import { readdirSync } from 'node:fs';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';

class RawWords {
  static readonly root = new URL('../data/campaigns/', import.meta.url).pathname;
  static readonly raw = /\b[a-z][a-z0-9]*_[a-z0-9_]+\b|__|[{}]/g;
  // A screen's wiring, not words shown: ids, sources, what a choice does and to whom.
  static readonly wiring = new RegExp('^(id|ids|src|large|medium|source|subject|choice|pick|kind|tone|transition|key|'
    + 'emblem|place|destination|target|targets|does|moves|of|holds|for|heart|places|quarter|zone|aimed|actor|state|'
    + 'weather|by)$');
  static words(x: unknown, out: string[] = []): string[] {
    if (typeof x === 'string') { out.push(x); }
    else if (Array.isArray(x)) { for (const v of x) { this.words(v, out); } }
    else if (x && typeof x === 'object') {
      for (const [k, v] of Object.entries(x)) { if (!this.wiring.test(k)) { this.words(v, out); } }
    }
    return out;
  }
  // Words a reader sees have a space in them; a command (go(…)) or a way's key (exit:…/1:…) is the page's own.
  static shown(w: string): boolean {
    return /\s/.test(w) && !/^[\w:.-]+\(.*\)$/.test(w) && !/^exit:\S+\/\d+:/.test(w);
  }
  static async sweep(file: string) {
    const name = file.replace('.campaign.json', '');
    const s = await PlaySession.start(this.root + file, `raw-${name}`, NodeBundleSource.shared), c = s.campaign;
    const rooms = c.module.entities.filter(e => e.space?.kind === 'room'), found = new Map<string, Set<string>>();
    for (const room of rooms) {
      c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', c.playerActor ?? 'party', room.id) }]));
      let screen;
      try { screen = ScreenModel.build(c); } catch { continue; }
      const all = [...this.words({ ...screen, map: undefined, plan: undefined }),
        ...this.words(Narrator.leaf(c, screen)), ...PlayerView.choices(c).map(r => r.choice.name)];
      for (const w of all.filter(x => this.shown(x))) {
        for (const m of w.match(this.raw) ?? []) {
          (found.get(m) ?? found.set(m, new Set()).get(m)!).add(`${room.id}: ${w.slice(0, 90)}`);
        }
      }
    }
    console.log(`== ${name}: ${rooms.length} rooms, ${found.size} raw words`);
    for (const [m, at] of [...found].slice(0, 25)) { console.log(`  ${m} ×${at.size} — ${[...at][0]}`); }
  }
}

const only = process.argv[2];
for (const file of readdirSync(RawWords.root).filter(f => f.endsWith('.campaign.json') && (!only || f.includes(only)))) {
  await RawWords.sweep(file);
}
