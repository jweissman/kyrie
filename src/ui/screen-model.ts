import { MechanicsText } from '../presentation/mechanics-text';
import { Canon } from '../canon/canon';
import { Content } from '../content';
import { ItemCatalog } from '../item-catalog';
import { ModuleWriter } from '../lang/module-writer';
import { FictionalTime } from '../presentation/fictional-time';
import { PlayerView, type PlayerSnapshot } from '../presentation/player-view';
import type { Campaign } from '../campaign/campaign';
import type { Entity } from '../lang/module';
import { ChoiceGrouping, type Grouped } from './choice-grouping';
import { Passages } from './passages';
import { ObservationText } from '../lang/observation-text';
import { ChartModel } from './chart-model';
import { Overlays } from '../overlays';
import type { ItemRow, MemberRow, Screen, TargetRow } from './screen-types';

// Builds the renderer-independent game screen from the authoritative campaign. Pure: same campaign, same screen.
export class ScreenModel {
  static build(campaign: Campaign): Screen {
    const view = PlayerView.observe(campaign), world = campaign.world;
    const entities = new Map(campaign.module.entities.map(e => [e.id, e]));
    const creatures = campaign.state.creatures;
    const names = new Map(campaign.module.entities.map(e =>
      [e.id, creatures.find(c => e.creatureId && c.id === e.creatureId)?.name ?? ObservationText.label(world, e.id)]));
    const priced = world.module.measures.some(m => m.name === 'price');
    const prices = new Map(campaign.module.entities.filter(e => priced && e.type === 'item')
      .map(e => [e.id, world.number(ModuleWriter.call('price', e.id))]));
    const present = new Set(view.present.map(p => p.id));
    const passageOf = this.passageOf(world, view.location?.id ?? '');
    const fees = new Map([
      ...campaign.module.entities.filter(e => e.type === 'service').map(e => [e.id, world.number(ModuleWriter.call('fee', e.id))] as const),
      ...world.snapshot.measures.filter(m => m.call.name === 'goodsPrice').map(m => [`${m.call.args[0]}:${m.call.args[1]}`, m.value] as const)]);
    const grouped = ChoiceGrouping.group(PlayerView.choices(campaign), { present, names, prices, passageOf, fees });
    const here = view.location?.id ?? '';
    const passages = new Passages(entities, world, view.actor);
    const visited = new Set(view.map.places.filter(p => p.visited).map(p => p.id));
    const unclaimed = new Map(grouped.targets);
    view.present.forEach(p => unclaimed.delete(p.id));
    const rows = this.stack(view.present.map(p => this.target(p, grouped, world)));
    return {
      title: view.title, clock: FictionalTime.at(view.elapsed), elapsed: view.elapsed, running: view.running,
      path: here ? passages.path(here) : [], place: passages.place(here),
      prose: view.observations.map(o => FictionalTime.prose(o.text)),
      exits: here ? passages.exits(here, grouped.exits,
        { ...(view.spatial ? { spatial: view.spatial } : {}), visited }) : [],
      people: rows.filter(r => r.kind === 'person' || r.kind === 'creature'),
      things: rows.filter(r => r.kind === 'thing' || r.kind === 'feature'),
      party: this.party(view, campaign, grouped),
      items: this.items(campaign, grouped, entities),
      camp: grouped.camp,
      purse: { coin: view.resources?.find(r => r.id === 'gold')?.amount ?? 0,
        rations: view.resources?.find(r => r.id === 'rations')?.amount ?? 0,
        other: (view.resources ?? []).filter(r => !['gold', 'rations'].includes(r.id) && r.amount > 0)
          .map(r => `${r.amount} ${r.name}`) },
      knowledge: view.knowledge.map(k => k.text),
      deadlines: view.deadlines.map(d => `${d.pressure}: ${FictionalTime.at(d.at)}${d.passed ? ' (passed)' : ''}`),
      capabilities: (view.capabilities ?? []).map(c => `${c.name} — ${c.providers.join(', ')}`),
      objectives: (view.objectives ?? []).map(o => FictionalTime.prose(o.text)),
      ...new ChartModel(world, view.actor, entities).build(visited, here),
      expedition: this.expedition(world, view.actor, view.elapsed),
      map: view.map.places.map(p => ({ id: p.id, name: p.name, visited: p.visited, here: p.id === here,
        zone: passages.path(p.id).slice(0, -1).at(-1)?.name ?? p.zone ?? '' })),
      unplaced: [...grouped.unplaced, ...[...unclaimed.entries()].flatMap(([id, acts]) =>
        acts.map(a => ({ ...a, label: `${entities.get(id)?.name ?? id}: ${a.label}` })))],
    };
  }
  // Things standing on a passage from here (a door, a ladder) are acted on from that exit.
  private static passageOf(world: Campaign['world'], here: string): Map<string, string> {
    const result = new Map<string, string>();
    if (!world.module.relations.some(r => r.name === 'on')) { return result; }
    for (const on of world.snapshot.relations.filter(r => r.name === 'on')) {
      const way = world.snapshot.relations.find(r => r.name === 'connects' && r.args[0] === on.args[1] && r.args[1] === here);
      if (way) { result.set(on.args[0]!, way.args[2]!); }
    }
    return result;
  }
  // What a provisioning party plans around: the hour, whether it is light, food in hand, and when they next must eat.
  private static expedition(world: Campaign['world'], actor: string, elapsed: number) {
    const hour = (8 + Math.floor(elapsed / 6)) % 24;
    const daylight = hour >= 6 && hour < 18 ? 'day' : hour >= 18 && hour < 21 ? 'evening' : 'night';
    const meal = world.module.measures.some(m => m.name === 'nextMeal') ? world.number(ModuleWriter.call('nextMeal', actor)) : 0;
    return { time: FictionalTime.at(elapsed), daylight,
      rations: world.module.measures.some(m => m.name === 'quantity') ? world.number(ModuleWriter.call('quantity', actor, 'rations')) : 0,
      hungry: world.module.relations.some(r => r.name === 'hungry') && world.test(ModuleWriter.call('hungry', actor)),
      ...(meal ? { nextMeal: FictionalTime.clock(meal) } : {}) };
  }
  // Identical wares on one shelf read as one row with a count; acting on the row acts on one of them.
  private static stack(rows: TargetRow[]): TargetRow[] {
    const out: TargetRow[] = [];
    for (const row of rows) {
      const twin = row.kind === 'thing' && row.note === 'for sale' ? out.find(o => o.name === row.name && o.note?.startsWith('for sale')) : undefined;
      if (!twin) { out.push(row); continue; }
      const count = Number(/×(\d+)/.exec(twin.note!)?.[1] ?? 1) + 1;
      twin.note = `for sale ×${count}`;
    }
    return out;
  }
  private static target(p: PlayerSnapshot['present'][number], grouped: Grouped, w: Campaign['world']): TargetRow {
    const acts = grouped.targets.get(p.id) ?? [];
    if (p.type === 'group') {
      const member = p.members?.[0];
      const playable = member && (Content.playableRaces as string[]).includes(member.raceId);
      const note = (p.state ? undefined : p.condition) ?? (member ? `${Content.races[member.raceId as keyof typeof Content.races]?.name ?? member.raceId}` : undefined);
      return { id: p.id, kind: playable ? 'person' : 'creature', name: p.name, ...(note ? { note } : {}),
        ...(!p.state && p.activity ? { activity: p.activity } : {}),
        ...(p.state ? { state: p.state === 'dead' ? 'dead' as const : 'down' as const } : {}), acts };
    }
    const counted = w.module.measures.some(m => m.name === 'quantity');
    const coin = counted ? w.number(ModuleWriter.call('quantity', p.id, 'gold')) : 0;
    const food = counted ? w.number(ModuleWriter.call('quantity', p.id, 'rations')) : 0;
    const forSale = w.module.relations.some(r => r.name === 'forSale') && w.test(ModuleWriter.call('forSale', p.id));
    const note = p.condition ? p.condition : forSale ? 'for sale' : p.type === 'source' ? (p.intact === false ? 'destroyed' : 'can be read')
      : coin ? `${coin} coin` : food ? `${food} ration${food === 1 ? '' : 's'} left` : p.type === 'mechanism' ? 'mechanism' : undefined;
    return { id: p.id, kind: ['mechanism', 'door'].includes(p.type) ? 'feature' : 'thing', name: p.name,
      ...(note ? { note } : {}), acts };
  }
  private static party(view: PlayerSnapshot, campaign: Campaign, grouped: Grouped): MemberRow[] {
    const entities = campaign.module.entities;
    return view.party.map(m => {
      const ref = entities.find(e => e.creatureId === m.id)?.id;
      const race = Content.races[m.raceId as keyof typeof Content.races]?.name ?? m.raceId;
      const klass = Content.classes[m.classId as keyof typeof Content.classes]?.name ?? m.classId;
      const background = m.backgroundId ? Canon.backgrounds[m.backgroundId]?.name : undefined;
      return { id: m.id, ...(ref ? { ref } : {}), name: m.name, line: `${race} ${klass}`.toLowerCase(),
        ...(background ? { background } : {}), level: m.level, hp: m.hp, maxHp: m.maxHp, mana: m.mana,
        maxMana: m.maxMana, experience: m.experience, gold: m.gold, conditions: m.conditions,
        abilities: (m.abilities ?? []).map(id => Content.abilities.find(a => a.id === id))
          .filter(a => !!a).map(a => ({ id: a.id, name: a.name, cost: a.cost ?? 0,
            text: MechanicsText.full(a, { ...m.attributes, level: m.level, bonusSpellDC: 0 }) })),
        attributes: m.attributes ?? {}, acts: ref ? grouped.members.get(ref) ?? [] : [],
        overlays: this.overlays(campaign, m.id) };
    });
  }
  // Each overlay and what it actually contributed, so a player can see why a companion can do something.
  private static overlays(campaign: Campaign, id: string) {
    const c = campaign.state.creatures.find(x => x.id === id);
    if (!c) { return []; }
    const all = Overlays.contributions(c);
    return Overlays.of(c).map(([oid, o]) => ({ id: oid, name: o.name, role: o.role,
      grants: all.filter(x => x.source === oid).map(x => x.kind === 'skill' ? `${campaign.module.entities.find(e => e.id === x.value)?.name ?? x.value} (skill)`
        : x.kind === 'gear' ? ItemCatalog.get(x.value).name : x.kind === 'gold' ? `+${x.value} coin` : x.value) }));
  }
  private static items(campaign: Campaign, grouped: Grouped, entities: Map<string, Entity>): ItemRow[] {
    const state = campaign.state;
    return state.creatures.filter(c => state.partyIds.includes(c.id)).flatMap(c => (c.state.inventory ?? []).map(i => {
      const d = ItemCatalog.get(i.definition);
      return { id: i.id, name: entities.get(i.id)?.name ?? d.name, kind: d.name, description: d.description,
        owner: c.id, ownerName: c.name, equipped: !!i.equipped, ...(d.slot ? { slot: d.slot } : {}),
        acts: grouped.items.get(i.id) ?? [] };
    }));
  }
}
