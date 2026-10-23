import { Canon } from '../canon/canon';
import { ModuleWriter } from '../lang/module-writer';
import { Narrator } from '../presentation/narrator';
import type { Campaign } from '../campaign/campaign';
import type { Happening } from './happening';

// The circumstances a happening is told in, as the voice tables name them (see data/voice): who the actor is to the
// one who plays (bond), their manner and the words they are spoken of in, what kind of creature they are, the hour,
// the shelter, whether it has happened with them before, and what brought it about.
export class VoiceContext {
  static readonly manners = ['proud', 'grim', 'cheerful', 'acerbic', 'compassionate', 'stoic', 'jovial'];
  // Domestic kinds a local species may be like ("the hall dog", like dog): it is spoken of as its kind is.
  static readonly kinds = ['dog', 'cat', 'horse', 'goat', 'sheep', 'hen', 'pig', 'cow', 'pony', 'ram'];
  // pairs: each kind of happening already told of each actor ("pet:o__bolt").
  static of(campaign: Campaign, h: Happening, pairs: Set<string>): Record<string, string> {
    const actor = h.actor ?? '', world = campaign.world, company = campaign.playerActor ?? 'party';
    const species = this.species(campaign, actor), kind = species ? Canon.creature(species).kind ?? 'creature' : 'person';
    const place = world.one('at', company);
    return { bond: this.bond(campaign, actor, company), manner: this.manner(campaign, actor),
      pronoun: this.pronoun(campaign, actor, kind), kind, ...species ? { species: this.base(species) } : {},
      time: world.test(ModuleWriter.call('dark')) ? 'night' : 'day',
      shelter: (place && Narrator.shelter(campaign, place)) ?? 'outdoors',
      moment: pairs.has(`${h.kind}:${actor}`) ? 'again' : 'first', ...h.cause ? { cause: this.cause(h.cause) } : {} };
  }
  // Family first; then someone the one who plays has come to with a letter or an errand (who has not met them),
  // someone they owe, someone they have done a good turn, someone paid to come, someone being seen home, a traveller
  // of the country who would come for nothing, someone of the place they grew up in, or a stranger. An animal is
  // never family, expected, a creditor, a friend or a neighbour, however glad of you it is: those are said in words.
  static bond(campaign: Campaign, actor: string, company: string): string {
    const person = !this.species(campaign, actor);
    if (person && (this.holds(campaign, 'kin', company, actor) || this.holds(campaign, 'kin', actor, company))) { return 'kin'; }
    if (person && this.holds(campaign, 'expects', actor, company)) { return 'expected'; }
    if (person && this.holds(campaign, 'inDebtTo', company, actor)) { return 'creditor'; }
    if (person && this.holds(campaign, 'grateful', actor, company)) { return 'friend'; }
    if (campaign.world.number(ModuleWriter.call('hire', actor)) > 0) { return 'hire'; }
    if (this.holds(campaign, 'acceptsEscort', actor, company)) { return 'escort'; }
    const traveller = campaign.module.entities.find(e => e.id === actor)?.name.includes(', ') && /_traveller$/.test(actor);
    if (traveller) { return 'fellow'; }
    return person && this.neighbour(campaign, actor, company) ? 'neighbour' : 'stranger';
  }
  // Someone of the settlement the one who plays grew up in, met there.
  private static neighbour(campaign: Campaign, actor: string, company: string): boolean {
    const home = campaign.world.module.relations.some(r => r.name === 'homeOf')
      && campaign.world.related('homeOf').find(r => r.args[0] === company)?.args[1];
    const entities = campaign.module.entities;
    for (let at = campaign.world.one('at', actor); home && at; at = entities.find(e => e.id === at)?.space?.parent) {
      if (at === home) { return true; }
    }
    return false;
  }
  private static holds(campaign: Campaign, name: string, ...args: string[]): boolean {
    return campaign.world.module.relations.some(r => r.name === name)
      && campaign.world.test(ModuleWriter.call(name, ...args));
  }
  // Their manner as the world says it; or one of Orsino's seven, the same one each time for the same person.
  static manner(campaign: Campaign, actor: string): string {
    const given = campaign.world.one('manner', actor)?.replace(/^manner_/, '');
    if (given) { return given; }
    let hash = 0;
    for (const c of actor.replace(/^.*__/, '')) { hash = (hash * 31 + c.charCodeAt(0)) >>> 0; }
    return this.manners[hash % this.manners.length]!;
  }
  static pronoun(campaign: Campaign, actor: string, kind: string): string {
    const given = campaign.world.one('pronouns', actor)?.replace(/^pron_/, '');
    if (given) { return given; }
    if ((campaign.readout.inhabitants?.[actor]?.length ?? 1) > 1) { return 'they'; }
    return kind === 'person' ? 'they' : 'it';
  }
  // The species a group is of, when it is a species rather than people with an ancestry and calling.
  static species(campaign: Campaign, actor: string): string | undefined {
    const readout = campaign.readout, member = readout.inhabitants?.[actor]?.[0];
    const id = member ? readout.creatures.find(c => c.id === member)?.raceId : undefined;
    return id && Canon.isSpecies(id) ? id : undefined;
  }
  // A species is spoken of as the domestic kind it is, or is like: "the hall dog" is a dog.
  static base(species: string): string {
    let at: string | undefined = species;
    for (let n = 0; at && n < 6; n++) {
      if (this.kinds.includes(at)) { return at; }
      at = Canon.species[at]?.variantOf;
    }
    return species;
  }
  // What the command that brought it about was: an attack, a spell, a theft, running a toll.
  static cause(action: string): string {
    const name = action.split('(')[0]!.replace(/^.*__/, '');
    if (/attack|assail|fight/.test(name)) { return 'attack'; }
    if (/spell|cast/.test(name)) { return 'spell'; }
    if (/take|steal|pick/.test(name)) { return 'theft'; }
    if (/toll|run/.test(name)) { return 'toll'; }
    return name;
  }
}
