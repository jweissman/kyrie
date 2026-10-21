import { Spatial } from '../spatial';
import { ItemCatalog } from '../item-catalog';
import { PartyCapabilities } from '../campaign/party-capabilities';
import { LocalObservations } from './local-observations';
import type { Campaign, CampaignEvent } from '../campaign/campaign';
import type { Call, Change, Entity, MovementMode } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { World } from '../lang/world';
import { Discovery } from '../information/discovery';
import { CombatPresenter } from '../ui/combat-presenter';
import { CombatProjection } from '../combat-projection';
import { ActionPresentation, type PublicChoice } from './action-presentation';
import { ObservationText } from '../lang/observation-text';
import { Agency } from '../campaign/agency';
import { ActionTime } from '../campaign/action-time';

export interface SpatialScene {
  ancestry: { id: string; name: string; kind: string }[];
  exits: { id: string; destination: string; name: string; mode: MovementMode; available: boolean;
    reason?: string; command?: string; barrier?: string }[];
  enteredFrom?: { id: string; name: string; mode: MovementMode };
}
export interface SceneMetadata { kind?: string; zone?: string; zoneId?: string; scene?: 'town' | 'wild' | 'dungeon' }
export interface PartyMember {
  id: string; name: string; raceId: string; classId?: string; level: number; hp: number; maxHp: number;
  mana: number; maxMana: number; slots?: number[]; maxSlots?: number[]; gold: number; experience: number;
  prepared?: string[][]; ready?: string[][];
  conditions: string[];
  abilities?: string[]; attributes?: Record<string, number>; backgroundId?: string;
}
export interface PresentEntity {
  id: string; name: string; type: string;
  members?: { name: string; raceId: string; classId?: string; level: number; hp: number; maxHp: number }[];
  state?: 'dead' | 'incapacitated'; intact?: boolean; activity?: string; condition?: string;
}
export interface PlayerSnapshot {
  spatial?: SpatialScene;
  actor: string; title: string; situations: { name: string; description: string }[];
  elapsed: number; running: boolean; location?: { id: string; name: string } & SceneMetadata;
  observations: { id: string; text: string }[];
  present: PresentEntity[]; party: PartyMember[];
  resources?: { id: string; name: string; amount: number }[];
  items?: { id: string; name: string; description: string; owner: string;
    equipped: boolean; slot?: string; effects: string[] }[];
  carried?: { id: string; name: string }[];
  holdings: { text: string; value: number }[]; facts: string[];
  knowledge: { id: string; text: string }[]; assumptions: { id: string; text: string }[];
  deadlines: { situation: string; pressure: string; at: number; passed: boolean }[];
  capabilities?: { name: string; providers: string[] }[];
  choices: PublicChoice[];
  objectives?: { id: string; text: string }[];
  map: {
    places: ({ id: string; name: string; visited: boolean } & SceneMetadata)[];
    links: { from: string; to: string; status?: string }[];
  };
}
export interface ChronicleEntry { at: number; kind: 'player' | 'npc' | 'world' | 'observation' | 'discovery' | 'event'; text: string; detail: string[] }

// Player-safe projection of an omniscient campaign. Kyr has no declared observability, so this applies one
// conservative, documented locality policy: the player actor's own facts, its location, co-located entities,
// legal commands, its own declared effects and combats, NPC actions at its location, and public deadlines.
export class PlayerView {
  private static readonly ownHidden = ['at', 'distinct', 'knows', 'assumesFalse', 'mayExamine', 'operates', 'able', 'unladen', 'capable'];
  static readonly darkness = { id: 'darkness',
    text: 'It is pitch dark. You can feel the way you came and hear your own breathing; without a light you can see nothing here, and do nothing that needs seeing.' };
  static supported(campaign: Campaign): boolean { return campaign.persistent && !!campaign.playerActor; }
  private static actor(campaign: Campaign): string {
    if (!this.supported(campaign)) { throw new Error('No player view for this campaign'); }
    return campaign.playerActor!;
  }
  private static labels(campaign: Campaign): Map<string, string> {
    return new Map(campaign.module.entities.map(e => [e.id, e.name]));
  }
  // A topic someone can be asked about is spoken, not a thing lying in the room.
  private static spoken(world: World, source: string): boolean {
    return world.snapshot.relations.some(r => r.name === 'testimony' && r.args[1] === source);
  }
  private static test(world: World, name: string, ...args: string[]): boolean {
    return world.module.relations.some(r => r.name === name) && world.test(ModuleWriter.call(name, ...args));
  }
  static choices(campaign: Campaign) {
    const world = campaign.world;
    return ActionPresentation.choices(campaign.available(), campaign.schemas).map(row => {
      row.choice.time = ActionTime.of(row.action, world);
      if (row.action.resolve?.name === 'purchase') {
        const amount = campaign.world.number(ModuleWriter.call('price', row.action.resolve.args[0]!));
        row.choice.name += ` · ${amount} coin`;
      }
      return row;
    });
  }
  static resolve(campaign: Campaign, command: string): string {
    const match = this.choices(campaign).find(c => c.choice.id === command);
    if (!match) { throw new Error(`Unavailable command: ${command}`); }
    return match.action.id;
  }
  // Someone who stands across a way out of here, barring it, is met from this side of it.
  private static guarding(world: Campaign['world'], id: string, here: string): boolean {
    const ways = world.snapshot.relations.filter(r => r.name === 'guards' && r.args[0] === id).map(r => r.args[1]);
    return ways.length > 0 && this.test(world, 'able', id) && world.snapshot.relations.some(r => r.name === 'connects'
      && ways.includes(r.args[0]) && r.args[1] === here) && world.module.queries.some(q => q.name === 'watched')
      && ways.some(w => world.test(ModuleWriter.call('watched', w!)));
  }
  static observe(campaign: Campaign): PlayerSnapshot {
    const actor = this.actor(campaign), world = campaign.world, labels = this.labels(campaign);
    const entities = campaign.module.entities, state = campaign.state;
    const location = entities.find(e => e.type === 'place' && this.test(world, 'at', actor, e.id));
    const perceiving = this.test(world, 'able', actor), discovery = Discovery.supported(campaign.module);
    const dark = !!location && this.test(world, 'unlit', location.id) && !this.test(world, 'capable', actor, 'light');
    const situations = campaign.installations.length ?
      campaign.installations.map(m => ({ name: m.name, description: m.description ?? '' })) :
      [{ name: campaign.module.name, description: campaign.module.description }];
    const publicChoices = this.choices(campaign), metadata = this.metadata(world, labels);
    return { actor, title: campaign.module.name, situations, elapsed: state.elapsed, running: campaign.running,
      ...(location ? { location: { id: location.id, name: location.name, ...metadata.get(location.id),
        ...(location.space ? { kind: location.space.kind } : {}) } } : {}),
      ...(location?.space ? { spatial: this.spatial(campaign, actor, location, publicChoices) } : {}),
      // In an unlit place without a light, what is said here goes unseen; only who is here can be heard.
      observations: perceiving && location ? (dark ? [this.darkness] : LocalObservations.read(world, actor)) : [],
      present: entities.filter(e => perceiving && location && e.id !== actor && e.type !== 'place'
        && (!dark || e.type === 'group')
        && (this.test(world, 'at', e.id, location.id) || this.test(world, 'mounted', e.id, location.id)
          || (e.type === 'door' && this.test(world, 'doorHere', e.id, location.id))
          || (e.type === 'group' && this.guarding(world, e.id, location.id)))
        && (e.type !== 'source' || !discovery || (this.test(world, 'noticeable', e.id) && !this.spoken(world, e.id))))
        .map(e => this.entity(campaign, world, e)),
      items: state.creatures.filter(c => state.partyIds.includes(c.id)).flatMap(c =>
        (c.state.inventory ?? []).map(i => {
        const d = ItemCatalog.get(i.definition);
        return { id: i.id, name: d.name, description: d.description, owner: c.name, equipped: !!i.equipped,
          ...(d.slot ? { slot: d.slot } : {}), effects: [d.use ?? d.description] };
      })),
      party: state.party.map(f => ({ id: f.id, name: f.name, raceId: f.raceId, classId: f.classId, level: f.level,
        backgroundId: state.creatures.find(c => c.id === f.id)?.backgroundId,
        hp: f.hp, maxHp: f.maxHp, mana: f.mana, maxMana: f.maxMana, gold: f.gold, experience: f.experience,
        ...(f.maxSlots ? { slots: [...f.slots ?? []], maxSlots: [...f.maxSlots] } : {}),
        ...(f.prepared ? { prepared: structuredClone(f.prepared), ready: structuredClone(f.ready ?? []) } : {}),
        conditions: f.statuses.map(s => s.id), abilities: [...f.abilities],
        attributes: { strength: f.strength, dexterity: f.dexterity, constitution: f.constitution,
          intelligence: f.intelligence, wisdom: f.wisdom, charisma: f.charisma } })),
      resources: world.snapshot.measures.filter(m => m.call.name === 'quantity' && m.call.args[0] === actor)
        .map(m => ({ id: m.call.args[1]!, name: labels.get(m.call.args[1]!) ?? m.call.args[1]!, amount: m.value })),
      carried: world.snapshot.relations.filter(r => r.name === 'carrying' && r.args[0] === actor)
        .map(r => ({ id: r.args[1]!, name: labels.get(r.args[1]!) ?? r.args[1]! })),
      holdings: world.snapshot.measures.filter(m => m.call.args[0] === actor)
        .map(m => ({ text: m.call.args.length > 1 ? `${m.call.name}: ${this.rest(m.call, labels)}` : m.call.name, value: m.value })),
      facts: world.snapshot.relations.filter(r => r.args[0] === actor && !this.ownHidden.includes(r.name))
        .map(r => r.args.length > 1 ? `${r.name}: ${this.rest(r, labels)}` : r.name).sort(),
      knowledge: entities.filter(e => e.type === 'fact' && this.test(world, 'knows', actor, e.id))
        .map(e => ({ id: e.id, text: ObservationText.render(e.name, world) })),
      assumptions: entities.filter(e => e.type === 'fact' && this.test(world, 'assumesFalse', actor, e.id))
        .map(e => ({ id: e.id, text: ObservationText.render(e.name, world) })),
      deadlines: campaign.installations.filter(m => m.deadline !== undefined).flatMap(m => m.pressures.map(id => ({
        situation: m.name, pressure: labels.get(id) ?? id, at: m.deadline!, passed: state.elapsed >= m.deadline! }))),
      capabilities: campaign.module.entities.filter(e => e.type === 'capability'
        && this.test(world, 'capable', actor, e.id)).map(e => ({ name: e.name,
        providers: PartyCapabilities.providers(e.id, state.creatures.filter(c => state.partyIds.includes(c.id)))
          .map(c => `${c.name} (${c.raceId} ${c.classId})`) })),
      choices: publicChoices.map(c => c.choice),
      ...(campaign.module.objectives?.length ? { objectives: perceiving ? campaign.module.objectives
        .filter(o => world.test(o.when)).map(o => ({ id: o.id, text: ObservationText.render(o.text, world) }))
        : [] } : {}),
      map: this.map(campaign, actor, publicChoices.filter(c => c.choice.category === 'travel').map(c => c.action)) };
  }
  private static map(campaign: Campaign, actor: string, routes: { bindings?: Record<string, string> }[]):
    PlayerSnapshot['map'] {
    const visited = new Set<string>();
    for (const c of campaign.module.initial) {
      if (c.kind === 'assert' && c.call.name === 'at' && c.call.args[0] === actor) { visited.add(c.call.args[1]!); }
    }
    const at = new Map<string, string>();
    for (const event of campaign.events) {
      this.moves(event.changes, at);
      if (at.has(actor)) { visited.add(at.get(actor)!); }
    }
    const world = campaign.world;
    const links = world.snapshot.relations.flatMap(r => {
      const from = ['gate', 'hazardPassage'].includes(r.name) ? r.args[1] : r.args[0];
      const to = ['gate', 'hazardPassage'].includes(r.name) ? r.args[2] : r.args[1];
      if (!['route', 'gate', 'footway', 'informedPassage', 'climbingPassage', 'hazardPassage'].includes(r.name) || !from || !to
        || !visited.has(from) || (r.name === 'informedPassage' && !this.test(world, 'knows', actor, r.args[2]!))) {
        return [];
      }
      return [{ from, to }];
    });
    const here = world.snapshot.relations.find(r => r.name === 'at' && r.args[0] === actor)?.args[1];
    links.push(...campaign.module.entities.filter(e => e.exit
      && visited.has(e.exit.origin) && Spatial.visible(world, actor, e))
      .map(e => ({ from: e.exit!.origin, to: e.exit!.destination })));
    const described = links.map(l => ({ ...l, status: l.from !== here ? 'known connection; check it from there' :
      routes.some(a => a.bindings?.destination === l.to
        || ('movement' in a && (a.movement as { destination?: string })?.destination === l.to)) ? 'available from here' : 'blocked from here' }));
    const known = new Set([...visited, ...links.map(l => l.to)]);
    const metadata = this.metadata(world, this.labels(campaign));
    return { places: campaign.module.entities.filter(e => e.type === 'place' && known.has(e.id))
      .map(e => ({ id: e.id, name: e.name, visited: visited.has(e.id), ...metadata.get(e.id),
        ...(e.space ? { kind: e.space.kind } : {}) })), links: described };
  }
  private static spatial(campaign: Campaign, actor: string, location: Entity,
    choices: ReturnType<typeof PlayerView.choices>): SpatialScene {
    const entities = new Map(campaign.module.entities.map(e => [e.id, e])), world = campaign.world;
    const ancestry = Spatial.ancestry(entities, location.id).reverse()
      .map(e => ({ id: e.id, name: e.name, kind: e.space!.kind }));
    const exits = campaign.module.entities.filter(e => e.exit?.origin === location.id
      && Spatial.visible(world, actor, e)).map(e => {
      const exit = e.exit!, selected = choices.find(c => c.action.movement?.passage === e.id);
      const barrier = exit.door ? entities.get(exit.door)?.name ?? exit.door : undefined;
      const reason = selected ? undefined : exit.door && this.test(world, 'lockedDoor', exit.door) ? `${barrier} is locked` :
        exit.door && !this.test(world, 'openedDoor', exit.door) ? `${barrier} is closed` :
        this.test(world, 'closed', exit.destination) ? 'The destination is closed' : 'Access is unavailable';
      return { id: e.id, destination: exit.destination, name: e.name, mode: exit.mode, available: !!selected,
        ...(selected ? { command: selected.choice.id } : {}), ...(barrier ? { barrier } : {}),
        ...(reason ? { reason } : {}) };
    });
    const lastMove = [...campaign.events].reverse()
      .find(event => event.changes.includes(`+ at(${actor}, ${location.id})`));
    const action = lastMove ? campaign.operator(lastMove.action) : undefined;
    const movement = action?.movement;
    return { ancestry, exits, ...(movement ? { enteredFrom: { id: movement.origin,
      name: entities.get(movement.origin)?.name ?? movement.origin, mode: movement.mode } } : {}) };
  }
  private static metadata(world: World, labels: Map<string, string>): Map<string, SceneMetadata> {
    const relations = world.snapshot.relations;
    const classes = new Map(relations.filter(r =>
      ['townDistrict', 'wildernessDistrict', 'undergroundDistrict'].includes(r.name))
      .map(r => [r.args[0]!, r.name === 'townDistrict' ? 'town' as const :
        r.name === 'wildernessDistrict' ? 'wild' as const : 'dungeon' as const]));
    return new Map(relations.filter(r => r.name === 'district').map(r => {
      const zoneId = r.args[1]!;
      return [r.args[0]!, { zoneId, zone: labels.get(zoneId) ?? zoneId, scene: classes.get(zoneId) }];
    }));
  }
  private static rest(call: Call, labels: Map<string, string>): string {
    return call.args.slice(1).map(id => labels.get(id) ?? id).join(', ');
  }
  private static entity(campaign: Campaign, world: World, e: Entity): PresentEntity {
    if (e.type === 'group') {
      const read = campaign.readout, ids = read.inhabitants[e.id] ?? [], creatures = read.creatures;
      const activity = this.activity(campaign, world, e.id), condition = this.condition(world, e.id);
      return { id: e.id, name: e.name, type: e.type, ...(activity ? { activity } : {}),
        ...(condition ? { condition } : {}),
        members: ids.map(id => creatures.find(c => c.id === id)!).map(c => ({ name: c.name, raceId: c.raceId,
          classId: c.classId, level: c.base.level, hp: c.state.hp, maxHp: c.base.maxHp })),
        ...(this.test(world, 'dead', e.id) ? { state: 'dead' as const } :
          !this.test(world, 'able', e.id) ? { state: 'incapacitated' as const } : {}) };
    }
    const condition = this.condition(world, e.id);
    return { id: e.id, name: e.name, type: e.type, ...(condition ? { condition } : {}),
      ...(e.type === 'source' ? { intact: this.test(world, 'intact', e.id) } : {}) };
  }
  private static condition(world: World, id: string): string | undefined {
    if (this.test(world, 'routed', id)) { return 'routed'; }
    const state = world.snapshot.relations.find(r => r.name === 'state' && r.args[0] === id)?.args[1];
    return state ? world.module.entities.find(e => e.id === state)?.name : undefined;
  }
  // What a person in view is evidently trying to do: the label of the goal their next choice would serve.
  private static activity(campaign: Campaign, world: World, id: string): string | undefined {
    const actor = campaign.actors.find(a => a.id === id && !a.player);
    if (!actor || !world.module.relations.some(r => r.name === 'at') || !this.test(world, 'able', id)) { return undefined; }
    const explained = Agency.explain(world, actor, campaign.operators);
    const pursuing = explained.selected ?? explained.goals.find(g => g.applicable && !g.satisfied)?.id;
    const label = campaign.module.pursuits?.find(p => p.actor === id && p.id === pursuing)?.label;
    if (!label) { return undefined; }
    const text = ObservationText.render(label, world, false);
    return explained.selected ? text : `${text}, but no way is open to them`;
  }
  private static change(change: Change, labels: Map<string, string>): string {
    const call = { ...change.call, args: change.call.args.map(id => labels.get(id) ?? id) };
    return ModuleWriter.change({ ...change, call } as Change);
  }
  private static moves(changes: string[] | undefined, at: Map<string, string>) {
    for (const line of changes ?? []) {
      const match = /^([+-]) at\(([^,]+), ([^)]+)\)$/.exec(line);
      if (!match) { continue; }
      if (match[1] === '+') { at.set(match[2]!, match[3]!); }
      else if (at.get(match[2]!) === match[3]) { at.delete(match[2]!); }
    }
  }
  // Rebuilt from the authoritative event log, so it is identical after save/restore and in every host.
  static chronicle(campaign: Campaign): ChronicleEntry[] {
    const actor = this.actor(campaign), labels = this.labels(campaign), entries: ChronicleEntry[] = [];
    const at = new Map<string, string>();
    for (const c of campaign.module.initial) {
      if (c.kind === 'assert' && c.call.name === 'at') { at.set(c.call.args[0]!, c.call.args[1]!); }
    }
    const names = { combatants: campaign.readout.creatures.map(c => CombatProjection.fighter(c, 'fighters')),
      turn: 0, actor: '', outcome: null };
    const deadlines = campaign.installations.filter(m => m.deadline !== undefined);
    let previous = 0;
    const perceived = new Set<string>();
    for (const event of campaign.events) {
      entries.push(this.playerEntry(campaign, event, previous, { labels, names }));
      this.moves(event.changes.filter(line => line.includes(`at(${actor}, `)), at);
      const here = at.get(actor);
      for (const decision of event.npc ?? []) {
        const before = at.get(decision.actor);
        this.moves(decision.changes, at);
        const bindings = Object.values(campaign.operator(decision.action)?.bindings ?? {});
        if (here && (before === here || at.get(decision.actor) === here || bindings.includes(here))) {
          const act = campaign.operator(decision.action);
          const name = act?.name ?? decision.action;
          entries.push({ at: decision.elapsed ?? event.elapsed, kind: 'npc',
            text: act?.seen ? ObservationText.render(act.seen, campaign.world)
              : `${labels.get(decision.actor) ?? decision.actor}: ${name}`, detail: [] });
        }
      }
      this.moves(event.changes, at);
      for (const m of deadlines.filter(m => m.deadline! > previous && m.deadline! <= event.elapsed)) {
        entries.push({ at: m.deadline!, kind: 'world', detail: [],
          text: `Deadline reached: ${m.pressures.map(id => labels.get(id) ?? id).join(', ')} (${m.name})` });
      }
      // The chronicle is what happened; what places and people look like is the scene's to tell.
      for (const o of (event.perceptions ?? []).filter(p => p.kind !== 'observation')) {
        if (!perceived.has(`${o.id}:${o.text}`)) {
          perceived.add(`${o.id}:${o.text}`);
          entries.push({ at: event.elapsed, kind: o.kind, text: o.text, detail: [] });
        }
      }
      previous = event.elapsed;
    }
    return entries;
  }
  private static playerEntry(campaign: Campaign, event: CampaignEvent, previous: number, { labels, names }: {
    labels: Map<string, string>; names: Parameters<typeof CombatPresenter.format>[1]; }): ChronicleEntry {
    const action = campaign.operator(event.action);
    const declared = action ? (event.result === 'success' ? action.success : action.failure) : [];
    return { at: previous, kind: 'player',
      text: `${action?.name ?? event.action}${event.result === 'failure' ? ' — failed' : ''}`,
      detail: [...(event.response ? [event.response] : []), ...event.combat.map(c => CombatPresenter.format(c, names)),
        ...(campaign.module.observations?.length ? [] : declared.map(change => this.change(change, labels)))] };
  }
}
