import type { Operator } from '../lang/module';
import type { PublicChoice } from '../presentation/action-presentation';
import type { ExitActs } from './passages';
import type { Act, Passage } from './screen-types';

type Slot = 'exit' | 'target' | 'item' | 'member' | 'camp';
interface Rule {
  slot: Slot; param?: string; path: string[]; passage?: Passage; via?: string; risk?: boolean;
  also?: { param: string; path: string[] };
  // The binding whose own account (a spell's) is what the choice means, rather than the action's description.
  tells?: string;
}
export interface Grouped {
  exits: Map<string, ExitActs>; targets: Map<string, Act[]>; items: Map<string, Act[]>;
  members: Map<string, Act[]>; camp: Act[]; unplaced: Act[];
}
// A legal command, or one the company could make with a skill it lacks (wanting says which), and who it needs.
export interface Row { choice: PublicChoice; action: Operator; wanting?: string; by?: string[] }
export interface GroupingContext {
  names: Map<string, string>; prices: Map<string, number>; present: Set<string>; passageOf: Map<string, string>;
  fees?: Map<string, number>; several?: Set<string>;
  tell?: (id: string) => string | undefined;
}

// Organizes legal commands by what the player is acting on. It never adds, removes or reinterprets a command;
// an unrecognized schema falls back to its own authored label under its first present binding, or "Other".
export class ChoiceGrouping {
  static readonly rules: Record<string, Rule> = {
    travel: { slot: 'exit', param: 'destination', path: ['Go'] },
    go: { slot: 'exit', param: 'destination', path: ['Go'] },
    risk: { slot: 'exit', param: 'destination', path: ['Risk {trap}', '{victim} goes first'], passage: 'hazard',
      via: '{trap}', risk: true },
    change_thing: { slot: 'target', param: 'thing', path: ['{how}'] },
    change_thing_paying: { slot: 'target', param: 'thing', path: ['{how}'] },
    lead: { slot: 'target', param: 'companion', path: ['Ask them to come with you'] },
    buy_goods: { slot: 'target', param: 'seller', path: ['Buy', 'one {goods} — {goodsfee} coin'] },
    take_lodging: { slot: 'target', param: 'host', path: ['Take {service} — {fee} coin'] },
    take_healing: { slot: 'target', param: 'healer', path: ['Ask for {service} — {fee} coin'] },
    camp: { slot: 'camp', path: ['Make camp for the night'] },
    part_ways: { slot: 'target', param: 'companion', path: ['Let them make their own way'] },
    walk: { slot: 'exit', param: 'destination', path: ['Walk'] },
    cross: { slot: 'exit', param: 'destination', path: ['Go past {defender}'], passage: 'guarded', via: '{defender}' },
    slip_past: { slot: 'exit', param: 'destination', path: ['Slip past {gatekeeper}'], passage: 'guarded', via: '{gatekeeper}' },
    passage: { slot: 'exit', param: 'destination', path: ['Take the concealed way'], passage: 'hidden' },
    climb: { slot: 'exit', param: 'destination', path: ['Climb, roped to {bearer}'], passage: 'climb', via: '{kit}' },
    cleared_passage: { slot: 'exit', param: 'destination', path: ['Cross the spent {trap}'], passage: 'hazard' },
    risk_passage: { slot: 'exit', param: 'destination', path: ['Risk {trap}', '{victim} goes first'],
      passage: 'hazard', via: '{trap}', risk: true },
    disarm: { slot: 'exit', param: 'destination', path: ['Disarm {trap}'], passage: 'hazard', via: '{trap}' },
    brace: { slot: 'exit', param: 'destination', path: ['Brace {trap} with {kit}'], passage: 'hazard', via: '{trap}' },
    escort: { slot: 'exit', param: 'destination', path: ['Escort {companion}'] },
    pay: { slot: 'target', param: 'recipient', path: ['Give', 'one coin'] },
    give_food: { slot: 'target', param: 'recipient', path: ['Give', 'one ration'] },
    attack: { slot: 'target', param: 'opponent', path: ['Attack'], risk: true },
    buy: { slot: 'target', param: 'merchant', path: ['Buy', '{goods} — 2 coin'] },
    buy_item: { slot: 'target', param: 'merchant', path: ['Buy', '{find} — {price} coin', 'for {recipient}'],
      also: { param: 'find', path: ['Buy from {merchant} — {price} coin', 'for {recipient}'] } },
    approach_wildlife: { slot: 'target', param: 'animal', path: ['Approach calmly ({skill})'] },
    request_passage: { slot: 'target', param: 'keeper', path: ['Invoke {identity}'] },
    request_custody: { slot: 'target', param: 'keeper', path: ['Present the writ and register'] },
    train_member: { slot: 'target', param: 'mentor', path: ['Train', '{lesson}', '{student}'] },
    fulfill_commission: { slot: 'target', param: 'buyer', path: ['Deliver {cargo}'] },
    free_obstruction: { slot: 'target', param: 'companion', path: ['Free them: shift {device}'] },
    tell: { slot: 'target', param: 'recipient', path: ['Tell', '{statement}'] },
    ask: { slot: 'target', param: 'informant', path: ['Ask about {topic}'] },
    endorse: { slot: 'target', param: 'recipient', path: ['Pledge support'] },
    release: { slot: 'camp', path: ['{choice}'] },
    examine: { slot: 'target', param: 'witness', path: ['Examine'] },
    destroy_source: { slot: 'target', param: 'witness', path: ['Destroy'], risk: true },
    take_item: { slot: 'target', param: 'find', path: ['Take', 'for {recipient}'] },
    salvage_coin: { slot: 'target', param: 'store', path: ['Gather a coin'] },
    forage: { slot: 'target', param: 'patch', path: ['Forage a ration'] },
    collect: { slot: 'target', param: 'store', path: ['Collect {goods}'] },
    put: { slot: 'target', param: 'store', path: ['Deposit {goods}'] },
    fulfill_job: { slot: 'target', param: 'store', path: ['Deliver {goods}'] },
    learn_reward: { slot: 'target', param: 'gift', path: ['Accept', '{recipient}'] },
    give: { slot: 'target', param: 'recipient', path: ['Give {gift}'] },
    sell: { slot: 'target', param: 'buyer', path: ['Sell {ware}'] },
    open_door: { slot: 'target', param: 'door', path: ['Open'] },
    close_door: { slot: 'target', param: 'door', path: ['Close'] },
    unlock_door: { slot: 'target', param: 'door', path: ['Unlock with {key}'] },
    pick_door: { slot: 'target', param: 'door', path: ['Pick the lock'] },
    take_control: { slot: 'target', param: 'device', path: ['Take the key from {keeper}'] },
    disable: { slot: 'target', param: 'device', path: ['Disable'] },
    shut: { slot: 'target', param: 'device', path: ['Close'] },
    open: { slot: 'target', param: 'device', path: ['Open'] },
    use_item: { slot: 'item', param: 'dose', path: ['Use on', '{recipient}'] },
    equip_item: { slot: 'item', param: 'tool', path: ['Equip'] },
    transfer_item: { slot: 'item', param: 'cargo', path: ['Give to', '{recipient}'] },
    put_item: { slot: 'item', param: 'cargo', path: ['Set down here'] },
    field_spell: { slot: 'member', param: 'caster', path: ['{technique}', 'on {recipient}'] },
    prepare_spell: { slot: 'member', param: 'caster', path: ['Prepare spells', 'In place of {outgoing} ({tier})', '{incoming}'],
      tells: 'incoming' },
    raise_quality: { slot: 'member', param: 'member', path: ['Advance', 'Raise a quality', '{quality}'] },
    learn_spell: { slot: 'member', param: 'member', path: ['Advance', 'Learn a spell', '{spell}'], tells: 'spell' },
    wait: { slot: 'camp', path: ['Wait a while'] },
    wait_hour: { slot: 'camp', path: ['Wait an hour'] },
    wait_for_light: { slot: 'camp', path: ['Wait until first light'] },
    eat: { slot: 'camp', path: ['Eat a ration'] },
    rest: { slot: 'camp', path: ['Rest six hours'] },
  };
  static group(rows: Row[], context: GroupingContext): Grouped {
    const out: Grouped = { exits: new Map(), targets: new Map(), items: new Map(), members: new Map(),
      camp: [], unplaced: [] };
    // A place reached by more than one way offers each by name: a shaft needing rope, a postern needing a picked lock.
    const ways = new Map<string, Set<string>>();
    for (const { action } of rows) {
      const b = action.bindings ?? {}, rule = this.rules[action.schema ?? action.id];
      const to = action.movement?.destination ?? (rule?.slot === 'exit' ? b.destination : undefined);
      const way = action.movement?.passage ?? b.way;
      if (to && way) { ways.set(to, (ways.get(to) ?? new Set()).add(way)); }
    }
    const several = new Set([...ways].filter(([, w]) => w.size > 1).map(([d]) => d));
    for (const row of rows) { this.place(out, row, { ...context, several }); }
    return out;
  }
  private static place(out: Grouped, row: Row, context: GroupingContext) {
    const { choice, action } = row;
    const leaf = { ...(row.wanting ? { disabled: row.wanting } : { command: choice.id }), minutes: choice.time * 10,
      ...(action.description ? { about: action.description } : {}), ...(row.by?.length ? { by: row.by } : {}) };
    const schema = action.schema ?? action.id, b = action.bindings ?? {};
    if (action.movement) {
      const verb = b.escorted_group ? `Escort ${context.names.get(b.escorted_group) ?? b.escorted_group}` : 'Go';
      const way = action.movement.passage ?? b.way;
      const path = [way && context.several?.has(action.movement.destination)
        ? `${verb} by ${context.names.get(way) ?? way}` : verb];
      this.exit(out, action.movement.destination, { acts: [], path, leaf });
      return;
    }
    if (action.searchPlace) { this.insert(out.camp, ['Search this place'], leaf); return; }
    if (action.speaker) { this.insert(this.slot(out.targets, action.speaker), ['Talk', choice.name], leaf); return; }
    const rule = this.rules[schema];
    if (!rule) { this.fallback(out, row, context, leaf); return; }
    const told = rule.tells && b[rule.tells] ? context.tell?.(b[rule.tells]!) : undefined;
    if (told) { leaf.about = told; }
    const data = { choice: choice.name, b, context };
    const path = rule.path.map(text => this.fill(text, data));
    if (rule.slot === 'exit' && path.length === 1 && b.way && context.several?.has(b.destination ?? '')) {
      path[0] = `${path[0]} by ${context.names.get(b.way) ?? b.way}`;
    }
    const risky = { ...leaf, ...(rule.risk ? { risk: true } : {}) };
    const subject = rule.param ? b[rule.param] : undefined;
    const also = rule.also ? b[rule.also.param] : undefined;
    if (rule.also && also) {
      this.insert(this.slot(out.targets, also), rule.also.path.map(t => this.fill(t, data)), risky);
    }
    if (rule.slot === 'exit' && subject) {
      this.exit(out, subject, { acts: [], path, leaf: risky, ...(rule.passage ? { passage: rule.passage } : {}),
        ...(rule.via ? { via: this.fill(rule.via, data) } : {}) });
    } else if (rule.slot === 'target' && subject && context.passageOf.has(subject)) {
      this.exit(out, context.passageOf.get(subject)!, { acts: [], path, leaf: risky });
    } else if (rule.slot === 'target' && subject) { this.insert(this.slot(out.targets, subject), path, risky); }
    else if (rule.slot === 'item' && subject) { this.insert(this.slot(out.items, subject), path, risky); }
    else if (rule.slot === 'member' && subject) { this.insert(this.slot(out.members, subject), path, risky); }
    else { this.insert(out.camp, path, risky); }
  }
  private static fallback(out: Grouped, row: Row, context: GroupingContext, leaf: Partial<Act>) {
    const changed = [...row.action.success].flatMap(c => c.call.args).find(id => context.present.has(id));
    const subject = changed ?? Object.entries(row.action.bindings ?? {})
      .find(([k, v]) => k !== 'actor' && k !== 'site' && context.present.has(v))?.[1];
    const path = row.choice.name.split('; ');
    // An action about no one and nothing in view is something the company does here.
    if (subject) { this.insert(this.slot(out.targets, subject), path, leaf); }
    else { this.insert(out.camp, path, leaf); }
  }
  private static fill(text: string, data: { choice: string; b: Record<string, string>; context: GroupingContext }) {
    return text.replace(/\{(\w+)\}/g, (_, key: string) => key === 'choice' ? data.choice :
      key === 'price' ? String(data.context.prices.get(data.b.find ?? '') ?? 0) :
      key === 'fee' ? String(data.context.fees?.get(data.b.service ?? '') ?? 0) :
      key === 'goodsfee' ? String(data.context.fees?.get(`${data.b.seller}:${data.b.goods}`) ?? 0) :
        data.context.names.get(data.b[key] ?? key) ?? data.b[key] ?? key);
  }
  private static slot(map: Map<string, Act[]>, id: string): Act[] {
    if (!map.has(id)) { map.set(id, []); }
    return map.get(id)!;
  }
  private static exit(out: Grouped, destination: string, meta: ExitActs & { path: string[]; leaf: Partial<Act> }) {
    const prior = out.exits.get(destination) ?? { acts: [] };
    const next: ExitActs = { acts: prior.acts };
    const passage = prior.passage && prior.passage !== 'open' ? prior.passage : meta.passage ?? prior.passage;
    const via = passage === prior.passage ? prior.via ?? meta.via : meta.via ?? prior.via;
    if (passage) { next.passage = passage; }
    if (via) { next.via = via; }
    out.exits.set(destination, next);
    this.insert(next.acts, meta.path, meta.leaf);
  }
  static insert(acts: Act[], path: string[], leaf: Partial<Act>) {
    const [head, ...rest] = path;
    if (head === undefined) { return; }
    let node = acts.find(a => a.label === head);
    if (!node) { node = { key: `${acts.length}:${head}`, label: head }; acts.push(node); }
    if (!rest.length) {
      if (node.command) { return; }
      if (node.children) { node = { key: `${acts.length}:${head}`, label: head }; acts.push(node); }
      Object.assign(node, leaf);
      return;
    }
    if (node.command) {
      const moved: Act = { key: `${node.key}/0`, label: node.label, command: node.command, minutes: node.minutes,
        ...(node.about ? { about: node.about } : {}) };
      delete node.command; delete node.minutes; delete node.about; node.children = [moved];
    }
    this.insert(node.children ??= [], rest, leaf);
  }
  static leaves(acts: Act[]): Act[] { return acts.flatMap(a => a.children ? this.leaves(a.children) : [a]); }
}
