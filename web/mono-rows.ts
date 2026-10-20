import type { Act, CombatScreen, ExitRow, Screen } from '../src/ui/screen-types';

export type Mode = 'create' | 'explore' | 'talk' | 'pack' | 'party' | 'journal' | 'combat';
export interface Row {
  id: string; group: string; glyph: string; label: string; note?: string; blocked?: string; about?: string; acts: Act[];
  tone?: 'exit' | 'person' | 'creature' | 'thing' | 'camp' | 'item' | 'member' | 'ability' | 'down';
}
export interface Talk { person: string; name: string; lines: { topic: string; reply: string }[] }

// The selectable rows for each screen mode. Shared by keyboard, pointer and tests so they agree on order.
export class MonoRows {
  static readonly glyphs: Record<string, string> = {
    walk: '→', enter: '⇥', leave: '⇤', level: '⇅', ascend: '↑', descend: '↓', travel: '⇢', cross_plane: '✶',
  };
  static explore(screen: Screen): Row[] {
    const exits = screen.exits.map(e => this.exit(e));
    // Two ways into the same place (a tower by its door and by its well) are told apart by where they arrive.
    const twice = new Set(exits.map(r => r.label).filter((l, i, all) => all.indexOf(l) !== i));
    exits.forEach((row, i) => { if (twice.has(row.label)) { row.label = `${row.label}: ${screen.exits[i]!.destination.name}`; } });
    return [
      ...exits,
      ...screen.people.map(p => ({ id: p.id, group: 'Here', glyph: p.state ? '✝' : p.kind === 'person' ? '☺' : '◆',
        label: p.name, ...(p.activity || p.note || p.state ? { note: [p.activity ?? p.note,
          p.state === 'dead' ? 'dead' : p.state ? 'down' : ''].filter(Boolean).join(' · ') } : {}),
        ...(p.activity ? { about: `${p.name.split(', ')[0]}: ${p.activity}.` } : p.look ? { about: p.look } : {}), acts: p.acts, tone: p.state ? 'down' as const : p.kind })),
      ...screen.things.map(t => ({ id: t.id, group: 'Here', glyph: t.kind === 'feature' ? '▣' : '·', label: t.name,
        ...(t.note ? { note: t.note } : {}), acts: t.acts, tone: 'thing' as const })),
      ...screen.camp.map(a => ({ id: `camp:${a.label}`, group: 'Company', glyph: '○', label: a.label,
        ...(a.minutes ? { note: this.minutes(a.minutes) } : {}), acts: [a], tone: 'camp' as const })),
      ...screen.unplaced.map(a => ({ id: `other:${a.label}`, group: 'Other', glyph: '?', label: a.label, acts: [a] })),
    ];
  }
  static exit(e: ExitRow): Row {
    const how = e.passage === 'open' ? '' : e.passage === 'guarded' ? 'past ' : e.passage === 'hazard' ? 'across ' :
      e.passage === 'climb' ? 'by ' : e.passage === 'door' ? 'through ' : 'via ';
    const room = e.destination.name;
    const label = e.transition === 'enter' && e.scope ? `Enter ${e.scope}` : e.transition === 'leave' ? `Out to ${room}`
      : room.charAt(0).toUpperCase() + room.slice(1);
    const where = e.transition === 'level' ? e.scope : ['enter', 'leave'].includes(e.transition) ? '' : e.scope;
    const note = [e.way ? `by ${e.way}` : where, e.via && e.via !== e.way ? `${how}${e.via}` : '', e.visited ? '' : 'new']
      .filter(Boolean).join(' · ');
    const minutes = Math.min(...e.acts.map(a => a.minutes ?? 0).filter(m => m > 0), Infinity);
    const near = !Number.isFinite(minutes) || minutes <= 10;
    const about = { walk: near ? `${room}, a few steps away.` : `${room}, ${this.span(minutes)} away${e.way ? ` by ${e.way}` : ''}.`, enter: `Into ${e.scope ?? room}: ${room}.`,
      leave: `Out of here, to ${room}${e.scope ? ` in ${e.scope}` : ''}.`, level: `To another level: ${e.scope ?? ''}, ${room}.`,
      ascend: `Up to ${room}.`, descend: `Down to ${room}.`, travel: `Across country to ${room}${e.scope ? `, ${e.scope}` : ''}.`,
      cross_plane: `Across a planar threshold to ${room}.` }[e.transition];
    const detail = [about, e.hazard ?? e.blocked].filter(Boolean).join(' ');
    return { id: e.id, group: 'Ways', glyph: this.glyphs[e.transition] ?? '→', label, about: detail,
      ...(note ? { note } : {}), ...(e.blocked ? { blocked: e.blocked } : {}), acts: e.acts, tone: 'exit' };
  }
  static talk(screen: Screen, talk: Talk): Row[] {
    const person = screen.people.find(p => p.id === talk.person);
    const topics = person?.acts.find(a => a.label === 'Talk')?.children ?? [];
    return [...topics.map(t => ({ id: `topic:${t.label}`, group: 'Ask', glyph: '»', label: t.label, acts: [t],
      tone: 'person' as const })),
    ...(person?.acts.filter(a => a.label !== 'Talk' && a.label !== 'Attack') ?? []).map(a => ({ id: `deal:${a.label}`,
      group: 'Deal', glyph: '¤', label: a.label, acts: a.children ?? [a], tone: 'thing' as const })),
    { id: 'leave', group: 'End', glyph: '⇤', label: 'End the conversation', acts: [] }];
  }
  static pack(screen: Screen): Row[] {
    return [
      ...screen.items.map(i => ({ id: i.id, group: i.ownerName, glyph: i.equipped ? '◉' : '○', label: i.name,
        note: i.equipped ? `equipped${i.slot ? ` · ${i.slot}` : ''}` : i.slot ?? 'carried', acts: i.acts, tone: 'item' as const })),
      ...screen.party.filter(m => m.acts.length).map(m => ({ id: `care:${m.id}`, group: 'Tend the company', glyph: '✚',
        label: `${m.name} tends…`, note: `${m.mana}/${m.maxMana} mana`, acts: m.acts, tone: 'member' as const })),
    ];
  }
  static party(screen: Screen): Row[] {
    return screen.party.map(m => ({ id: m.id, group: 'Company', glyph: m.hp ? '☺' : '✝', label: m.name,
      note: `${m.line} · lvl ${m.level}`, acts: m.acts, tone: m.hp ? 'member' as const : 'down' as const }));
  }
  static combat(combat: CombatScreen): Row[] {
    if (!combat.ours || combat.outcome) { return []; }
    return combat.abilities.map(a => ({ id: `ability:${a.id}`, group: combat.actorName, glyph: '⚔', label: a.name,
      note: [a.price, a.targets.length ? '' : a.scope].filter(Boolean).join(' · '), about: a.text,
      acts: a.targets.length ? a.targets.map(t => ({ key: t.id, label: t.name, command: `${a.id}>${t.id}` })) :
        [{ key: a.id, label: a.name, command: `${a.id}>` }], tone: 'ability' as const }));
  }
  // A walking distance in words: "half an hour", "an hour and a half".
  static span(m: number): string {
    const words: Record<number, string> = { 20: 'twenty minutes', 30: 'half an hour', 60: 'an hour', 90: 'an hour and a half',
      120: 'two hours' };
    return words[m] ?? this.minutes(m);
  }
  static minutes(m: number): string {
    return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}` : `${m}m`;
  }
}
