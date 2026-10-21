import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Book, Entry, Section } from './model';
import { KyrDoc } from './kyr-doc';
import { OrsinoAppendix, type Definition } from './orsino-appendix';
import { HandbookText } from './text';

interface Kit { id: string; name: string; about: string; slots?: Record<string, { is: string }>;
  proposals?: Record<string, { table: string; by?: string }>; provides?: string[]; modules?: unknown[] }
interface Campaign { name: string; pitch?: { text: string }; modules: { id: string; bundle?: string; kit?: string }[] }

// The Dungeon Master's Guide: how the world runs (the rules modules every world loads, read from their source), how
// worlds are made (kits, frameworks, the generator's tables), the campaigns, and Orsino's world material.
export class DungeonMastersGuide {
  constructor(readonly appendix: OrsinoAppendix, readonly root: string) {}
  book(): Book {
    return { id: 'dmg', title: 'Dungeon Master\'s Guide', intro: [
      'How the world runs. Everything in a Kyr world is a fact (a relation or a measure) that actions and rules change. '
        + 'The rules modules below are loaded by every world; each entry gives the authors\' statement of a rule above '
        + 'the condition and the change the engine applies. A place, a person or a band behaves as these rules say, and '
        + 'nothing else decides for them.',
      'Time passes in watches of ten minutes. A rule fires as soon as its condition holds; an action takes its time and '
        + 'then makes its change, unless something interrupts it.'],
    sections: [this.rules(), this.making(), this.campaigns(), this.orsino()] };
  }
  rules(): Section {
    const dir = join(this.root, 'data/rules');
    const sections = readdirSync(dir).filter(f => f.endsWith('.kyr')).sort()
      .map(f => KyrDoc.section(f.replace(/\.kyr$/, ''), readFileSync(join(dir, f), 'utf8')));
    return { id: 'world-rules', title: 'The world\'s rules', sections };
  }
  making(): Section {
    const kits = readdirSync(join(this.root, 'data/kits')).map(k => join(this.root, 'data/kits', k, 'kit.json'))
      .filter(f => existsSync(f)).map(f => JSON.parse(readFileSync(f, 'utf8')) as Kit);
    const frameworks = readdirSync(join(this.root, 'data/frameworks')).map(f =>
      [f.replace(/\.json$/, ''), JSON.parse(readFileSync(join(this.root, 'data/frameworks', f), 'utf8'))] as
        [string, { about: string; kits: { id: string; kit: string }[] }]);
    return { id: 'making-worlds', title: 'Making worlds', intro: [
      'A generated world is assembled from a region\'s geography and kits. A kit is a situation that can be placed: '
        + 'slots it fills from the region (a road with a chokepoint, an inn within four hours), proposals it draws from its '
        + 'tables (who keeps the toll), and the facts it provides once placed. The assembler places a kit only where its '
        + 'slots can be filled, and records every choice it made in the world\'s report.'],
    sections: [{ id: 'kits', title: 'Kits', entries: kits.map(k => DungeonMastersGuide.kit(k)) },
      { id: 'frameworks', title: 'Frameworks', entries: frameworks.map(([id, f]): Entry => ({ id: `framework:${id}`,
        title: HandbookText.capital(id), status: 'kyr', text: [f.about],
        facts: [['Places', f.kits.map(k => k.id).join(', ')]] })) }] };
  }
  static kit(k: Kit): Entry {
    return { id: `kit:${k.id}`, title: k.name, status: 'kyr', text: [k.about],
      facts: [['Fills', Object.entries(k.slots ?? {}).map(([s, v]) => `${s} (${v.is})`).join('; ') || '—'],
        ['Draws', Object.entries(k.proposals ?? {}).map(([p, v]) => `${p} from ${v.table}${v.by ? ` by ${v.by}` : ''}`).join('; ')
          || '—'], ['Provides', `${k.provides?.length ?? 0} facts`], ['Modules', String(k.modules?.length ?? 0)]] };
  }
  campaigns(): Section {
    const dir = join(this.root, 'data/campaigns');
    const entries = readdirSync(dir).filter(f => f.endsWith('.campaign.json')).sort().map((f): Entry => {
      const c = JSON.parse(readFileSync(join(dir, f), 'utf8')) as Campaign;
      return { id: `campaign:${f.replace('.campaign.json', '')}`, title: c.name, status: 'kyr',
        text: c.pitch ? [c.pitch.text] : [],
        facts: [['Regions and sites', c.modules.filter(m => m.bundle).map(m => m.id).join(', ') || '—'],
          ['Kits placed', c.modules.filter(m => m.kit).map(m => m.id).join(', ') || '—']] };
    });
    return { id: 'campaigns', title: 'Campaigns', intro: ['The worlds that ship with the game.'], entries };
  }
  orsino(): Section {
    const a = this.appendix;
    return { id: 'orsino-world', title: 'Appendix: Orsino\'s world material', intro: [
      'Orsino\'s planes, traps, wonders, treasure and magic items, with how much of each Kyr holds.'],
    sections: [a.family('plane', 'Planes', DungeonMastersGuide.plane),
      a.table('trap', 'Traps', [['Springs', DungeonMastersGuide.trapEffects], ['Seen as', DungeonMastersGuide.trapText]]),
      a.table('wonder', 'Wonders', [['Does', DungeonMastersGuide.wonderEffects], ['Seen as', DungeonMastersGuide.wonderText]]),
      a.table('treasureTier', 'Treasure tiers', [['Worth', DungeonMastersGuide.treasureValue], ['Holds', DungeonMastersGuide.treasure]]),
      a.table('equipment', 'Magic items', [['Kind', DungeonMastersGuide.itemKind], ['Rarity', DungeonMastersGuide.rarity],
        ['Does', DungeonMastersGuide.itemEffect]]),
      a.table('consumable', 'Consumables', [['Kind', DungeonMastersGuide.itemKind], ['Does', DungeonMastersGuide.consumableEffect]]),
      a.table('gear', 'Gear', [['Worth', DungeonMastersGuide.value], ['Does', DungeonMastersGuide.gearEffect]]),
      a.table('status', 'Statuses', [['Does', DungeonMastersGuide.itemEffect]]),
      a.table('difficultyTier', 'Difficulty tiers', [['Ranks', DungeonMastersGuide.tier]]),
      a.table('dungeon', 'Dungeon kinds', [['Shapes', DungeonMastersGuide.dungeonTypes]])] };
  }
  static plane(this: void, d: Definition): [string, string][] {
    const m = (d.planeModifiers ?? {}) as Definition, global = (m.globalEffects ?? {}) as Definition;
    return [['Terrain', String(m.terrain ?? '—')], ['Alignment', `${String(m.order ?? '')} ${String(m.alignment ?? '')}`.trim()],
      ['Domain', String(m.domain ?? '—')], ['Weather', String(m.weather ?? '—')], ['Native', String(m.race ?? '—')],
      ['Laws', Object.entries(global).map(([k, v]) => `${k} ${String(v)}`).join(', ') || '—']];
  }
  static trapEffects(this: void, d: Definition): string { return OrsinoAppendix.effects(d.trapEffects); }
  static trapText(this: void, d: Definition): string { return String(d.trapPunishmentDescriptions ?? ''); }
  static wonderEffects(this: void, d: Definition): string { return OrsinoAppendix.effects(d.wonderEffects); }
  static wonderText(this: void, d: Definition): string { return String(d.wonderDescriptions ?? ''); }
  static treasureValue(this: void, d: Definition): string { return String(d.treasureValue ?? ''); }
  static treasure(this: void, d: Definition): string { return OrsinoAppendix.list(d.treasure); }
  static itemKind(this: void, d: Definition): string { return String(d.kind ?? '—'); }
  static rarity(this: void, d: Definition): string { return String(d.rarity ?? '—'); }
  static itemEffect(this: void, d: Definition): string { return OrsinoAppendix.effects(d.effect); }
  static consumableEffect(this: void, d: Definition): string { return OrsinoAppendix.effects(d.effects); }
  static gearEffect(this: void, d: Definition): string { return OrsinoAppendix.effects(d.effect) || String(d.description ?? ''); }
  static value(this: void, d: Definition): string { return String(d.value ?? '—'); }
  static tier(this: void, d: Definition): string { return OrsinoAppendix.list(d); }
  static dungeonTypes(this: void, d: Definition): string { return OrsinoAppendix.list(d.dungeonTypes); }
}
