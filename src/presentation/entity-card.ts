import type { Campaign } from '../campaign/campaign';
import type { Entity } from '../lang/module';
import { ObservationText } from '../lang/observation-text';
import { World } from '../lang/world';
import { PlayerView } from './player-view';
import { ScreenModel } from '../ui/screen-model';
import { SceneModel } from '../ui/scene';
import { Narrator } from './narrator';

// One thing in the world as a card: whoever or whatever it is, as the company knows it, or as the engine holds it.
// A prototype after Mission 20 (the forward-design record's first): the card, the act the page leads with, and a
// headless tester's question of what an act would change are read here from one place, the entity, the company's
// knowledge and the typed actions offered on it, so as to find whether they share one path through the engine.
export interface CardFact { id: string; text: string; source?: string; from?: string; at?: number; confirmed?: true }
export interface CardAct {
  // The choice's id, as the page and a headless client send it, and its words.
  choice: string; label: string;
  // Why the page leads with it, where it does (see Glance): the promoted act's own typed reasons.
  why?: string; aspects?: string[];
  // What doing it would change, if it succeeds: the action's own effects (author mode, and a tester's question).
  changes?: string[];
}
export interface Card {
  id: string; type: string; mode: 'player' | 'author';
  // As the company names it: an alias until the fact that names it is known; who someone is now, by their roles.
  name: string;
  // Whether it is before the company now, and what can be seen of it.
  here: boolean; seen?: string[];
  // What the company knows that names it: each with how it was learned, from whom, and when.
  known: CardFact[];
  // The company's own standing with it (what it owes them, its kin, its hire): facts whose subject is the company.
  ties: string[];
  acts: CardAct[];
  // Author mode only: what the engine holds of it.
  truth?: { name: string; alias?: string; roles?: string[]; module: string; at?: string; facts: string[];
    measures: string[] };
}

export class EntityCard {
  static of(campaign: Campaign, id: string, mode: 'player' | 'author' = 'player'): Card | undefined {
    const world = campaign.world, entity = campaign.module.entities.find(e => e.id === id);
    if (!entity) { return undefined; }
    const company = campaign.playerActor ?? 'party', here = world.one('at', company);
    const screen = ScreenModel.build(campaign), subject = SceneModel.build(screen).subjects.find(s => s.id === id);
    const present = !!subject || (!!here && world.one('at', id) === here);
    const author = mode === 'author';
    return { id, type: entity.type, mode, name: author ? entity.name : this.named(world, entity), here: present,
      ...subject?.says?.length ? { seen: [...subject.says] } : {},
      known: this.known(campaign, entity), ties: this.ties(world, company, id),
      acts: this.acts(campaign, screen, id, author),
      ...author ? { truth: this.truth(world, entity) } : {} };
  }
  // The name the company would use now (see ObservationText.knownAs and known).
  private static named(world: World, entity: Entity): string {
    return ObservationText.render(ObservationText.knownAs(world, entity) ?? ObservationText.known(world, entity), world,
      false);
  }
  // Every fact the company knows whose words name this entity, or which leads to it or is shown by it: by reference,
  // never by searching the words.
  private static known(campaign: Campaign, entity: Entity): CardFact[] {
    const world = campaign.world, byId = new Map(campaign.module.entities.map(e => [e.id, e]));
    return PlayerView.observe(campaign).knowledge
      .filter(k => this.references(byId.get(k.id)?.name ?? '').has(entity.id) || this.linked(world, k.id, entity.id))
      .map(k => ({ ...k }));
  }
  // A fact that leads to it (word of a place), or that it shows (a thing hidden until the fact is known).
  private static linked(world: World, fact: string, id: string): boolean {
    return (world.relates('leadsTo') && world.related('leadsTo').some(r => r.args[0] === fact && r.args[1] === id))
      || (world.relates('revealedBy') && world.related('revealedBy').some(r => r.args[0] === id && r.args[1] === fact));
  }
  // Facts of the company itself that name it, but not its knowing (which is `known`). Kyr does not say which relations
  // the company knows of: this is the prototype's line, not a contract (see the forward-design record).
  private static readonly unsaid = new Set(['knows', 'assumesFalse', 'toldBy', 'learnedFrom', 'witnessed', 'readIn']);
  private static ties(world: World, company: string, id: string): string[] {
    return world.view.relations.filter(c => c.args[0] === company && c.args.includes(id) && !this.unsaid.has(c.name))
      .map(c => World.format(c));
  }
  static references(text: string): Set<string> {
    const refs = new Set<string>();
    ObservationText.map(text, () => '', id => { refs.add(id); return ''; });
    return refs;
  }
  // What the company could do with it now: each offered action bound to it, with the page's reasons where it leads
  // with it, and what it would change.
  private static acts(campaign: Campaign, screen: ReturnType<typeof ScreenModel.build>, id: string,
    author: boolean): CardAct[] {
    const led = Narrator.leaf(campaign, screen).glance?.acts ?? [];
    return PlayerView.choices(campaign)
      .filter(r => Object.entries(r.action.bindings ?? {}).some(([k, v]) => v === id && !['actor', 'site'].includes(k)))
      .map(r => {
        const lead = led.find(a => a.command === r.choice.id || a.for === r.choice.id);
        return { choice: r.choice.id, label: r.choice.name,
          ...lead ? { why: lead.why, aspects: [...lead.aspects] } : {},
          ...author ? { changes: (r.action.success ?? []).flatMap(c => c.call
            ? [`${c.kind === 'retract' ? '-' : '+'} ${World.format(c.call)}`] : []) } : {} };
      });
  }
  // What the engine holds of it: its own name, its alias and roles, the module that declared it, where it is, and
  // every fact and measure it is in.
  private static truth(world: World, entity: Entity): NonNullable<Card['truth']> {
    const facts = world.view.relations.filter(c => c.args.includes(entity.id)).map(c => World.format(c));
    const measures = world.view.measures.filter(m => m.call.args.includes(entity.id))
      .map(m => `${World.format(m.call)} = ${m.value}`);
    const at = world.one('at', entity.id);
    return { name: entity.name, ...entity.alias ? { alias: entity.alias.name } : {},
      ...entity.roles?.length ? { roles: entity.roles.map(r => r.name) } : {},
      module: /^(.+?)__/.exec(entity.id)?.[1] ?? '(the base module)', ...at ? { at } : {}, facts, measures };
  }
}
