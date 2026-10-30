import type { Campaign } from '../campaign/campaign';
import type { Module, Observation } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';
import { FictionalTime } from '../campaign/fictional-time';
import type { Screen, TargetRow } from '../ui/screen-types';
import { Typography } from './typography';
import { PlayerView } from './player-view';
import type { CompanyRecall } from './company-recall';
import type { Arrival, Glance } from './glance-types';

type Line = { id: string; text: string };
export interface Lines { sight?: Glance['sight']; life?: Glance['life']; changed: string[]; pointed: Set<string> }

// The glance's few lines (OWN-18): the place's own distinctive line (at most two sentences, never cut inside one), a
// sign of life now, and on a return what has changed. A line is the place's own when its installation's, set at it,
// about nothing in particular, and no one's here; it is someone's when it is set near or beside them, is about them,
// names them, or holds only while they are here (Callow's sermon). Read from what the narrator tells now and what the
// module declares, never from the words.
export class GlanceLines {
  static readonly words = 50;
  static of(campaign: Campaign, screen: Screen, at: { arrival: Arrival; recall: CompanyRecall; kept: Line[];
    changed: string[] }): Lines {
    const defs = this.defs(campaign.module), present = this.present(screen);
    // The place's own; else, where no line is its own (an opening's, an origin's), one set at it about nothing.
    const own = this.owned(at.kept, defs, { here: screen.place.id, present });
    const sight = at.arrival === 'stay' ? undefined : this.sight(screen, own, { defs, recall: at.recall,
      back: ['return', 'resume'].includes(at.arrival) });
    // Staying, what was done leads: the place and its life are as they were.
    const life = at.arrival === 'stay' ? undefined
      : this.life(screen, { defs, present, kept: at.kept, own, sight, arrival: at.arrival, recall: at.recall });
    const passing = new Set(screen.observed.filter(o => ['weather', 'ambience'].includes(this.def(defs, o.id)?.aspect ?? ''))
      .map(o => Typography.curl(FictionalTime.prose(o.text))));
    const changed = ['return', 'resume'].includes(at.arrival) ? at.changed.map(t => Typography.curl(t))
      .filter(t => t !== sight?.text && !passing.has(t) && t !== life?.text).slice(0, 2) : [];
    // What the lines told now name, of someone here or of the place (the taproom a dog lies at the door of).
    const pointed = new Set(screen.observed.flatMap(l => this.named(this.def(defs, l.id)?.text ?? '')));
    return { ...sight ? { sight } : {}, ...life ? { life } : {}, changed, pointed };
  }
  // The place's lead line: in the dark, the dark; else its own lasting line before its passing life, the first written.
  // Come back to, a line never seen here before (the night's, an authored "again") is told whole, and is no change; one
  // seen before is recalled by its first sentence.
  private static sight(screen: Screen, own: Line[], at: { defs: Map<string, Observation>; recall: CompanyRecall;
    back: boolean }): Glance['sight'] {
    const dark = screen.dark ? screen.observed.find(o => o.id === PlayerView.darkness.id) : undefined;
    const line = dark ?? own.find(l => (this.def(at.defs, l.id)?.aspect ?? 'fixture') === 'fixture')
      ?? own.find(l => this.def(at.defs, l.id)?.aspect === 'ambience');
    if (!line) { return undefined; }
    const text = Typography.curl(FictionalTime.prose(line.text));
    const recalled = at.back && !dark && at.recall.saw(line.id);
    return { id: line.id, text: recalled ? this.sentences(text)[0]! : this.trim(text) };
  }
  // At most two sentences and fifty words: two that run longer are one; one sentence is never cut.
  static trim(text: string): string {
    const [first, second] = this.sentences(text);
    const two = second ? `${first} ${second}` : first!;
    return second && two.split(/\s+/).length <= this.words ? two : first!;
  }
  private static sentences(text: string): string[] { return text.split(/(?<=[.!?][’”]?)\s+(?=[A-Z‘“])/); }
  // What is alive here now, the first that holds: a danger; whoever warns the company off; someone it has a stake in;
  // someone doing something; a line that is someone's; someone with something to be asked; and the first time only,
  // the place's passing life, or an animal's. Come back to, only what is new since.
  private static life(screen: Screen, at: { defs: Map<string, Observation>; present: Set<string>; kept: Line[];
    own: Line[]; sight?: Glance['sight']; arrival: Arrival; recall: CompanyRecall }): Glance['life'] {
    const people = screen.people.filter(p => !p.companion && !p.state), first = !['return', 'resume'].includes(at.arrival);
    const threat = people.find(p => p.reckoning);
    if (threat) { return { text: this.curl(threat.says?.[0] ?? this.here(threat)), subject: threat.id, danger: true }; }
    const warner = screen.warned && people.find(p => p.id === screen.warned!.id);
    if (warner) { return { text: this.curl(warner.says?.[0] ?? this.here(warner)), subject: warner.id }; }
    const fresh = this.fresh.bind(this, first, at.recall);
    const stake = people.find(p => p.stake && p.says?.some(fresh));
    if (stake) { return { text: this.curl(stake.says!.find(fresh)!), subject: stake.id }; }
    const busy = first ? people.find(p => p.kind === 'person' && p.activity) : undefined;
    if (busy) { return { text: this.curl(`${busy.name.split(', ')[0]} ${busy.activity}.`), subject: busy.id }; }
    const theirs = at.kept.map(l => ({ l, who: this.whose(this.def(at.defs, l.id), l.id, at.present) }))
      .find(x => x.who && !at.own.includes(x.l) && fresh(x.l.text));
    if (theirs) { return { id: theirs.l.id, text: this.curl(theirs.l.text), subject: theirs.who! }; }
    const asked = people.find(p => p.asked && p.says?.some(fresh));
    if (asked) { return { text: this.curl(asked.says!.find(fresh)!), subject: asked.id }; }
    if (!first) { return undefined; }
    const passing = at.own.find(l => this.def(at.defs, l.id)?.aspect === 'ambience' && l.id !== at.sight?.id);
    if (passing) { return { id: passing.id, text: this.curl(FictionalTime.prose(passing.text)) }; }
    const animal = people.find(p => p.kind === 'animal' && p.says?.length);
    return animal ? { text: this.curl(animal.says![0]!), subject: animal.id } : undefined;
  }
  // New since the company was last here: anything, the first time.
  private static fresh(first: boolean, recall: CompanyRecall, text: string): boolean {
    return first || !recall.read(text);
  }
  private static here(row: TargetRow): string {
    const name = row.name.split(', ')[0]!;
    return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${row.many ? 'are' : 'is'} here.`;
  }
  private static curl(text: string): string { return Typography.curl(FictionalTime.prose(text)); }
  private static owned(kept: Line[], defs: Map<string, Observation>,
    at: { here: string; present: Set<string> }): Line[] {
    const set = kept.filter(l => this.own(l, defs, at, false));
    return set.length ? set : kept.filter(l => this.own(l, defs, at, true));
  }
  // The place's own: its installation's (the place's id's own prefix), or any set at the place itself; set at it,
  // about nothing, no one's.
  private static own(l: Line, defs: Map<string, Observation>, at: { here: string; present: Set<string> },
    any: boolean): boolean {
    const def = this.def(defs, l.id);
    const theirs = any ? def?.place === at.here : l.id.split('__')[0] === at.here.split('__')[0];
    return !!def && theirs && (!def.anchor || def.anchor === 'at') && !def.about && !this.whose(def, l.id, at.present);
  }
  // Whose a line is, of those here: set near or beside them, about them, naming them, or holding while they are here.
  static whose(def: Observation | undefined, id: string, present: Set<string>): string | undefined {
    if (!def) { return undefined; }
    const subject = id.split('@')[1];
    if (def.anchor === 'near' || def.anchor === 'beside') { return [subject, def.place].find(x => x && present.has(x)); }
    if (def.about && present.has(def.about)) { return def.about; }
    const named = this.named(def.text).find(x => present.has(x));
    if (named) { return named; }
    let there: string | undefined;
    ModuleWriter.conditionCalls(def.when, call => {
      if (call.name === 'at' && present.has(call.args[0]!)) { there ??= call.args[0]; }
      return call;
    });
    return there;
  }
  // The ids a line names ({taproom}, {hoard(beasts)}).
  static named(text: string): string[] {
    const ids: string[] = [];
    ObservationText.map(text, call => { ids.push(...call.args); return ''; }, ref => { ids.push(ref); return ''; });
    return ids;
  }
  private static present(screen: Screen): Set<string> {
    return new Set([...screen.people.filter(p => !p.companion), ...screen.things].map(t => t.id));
  }
  private static def(defs: Map<string, Observation>, id: string): Observation | undefined {
    return defs.get(id.split('@')[0]!);
  }
  private static readonly cached = new WeakMap<Module, Map<string, Observation>>();
  static defs(module: Module): Map<string, Observation> {
    let defs = this.cached.get(module);
    if (!defs) { defs = new Map((module.observations ?? []).map(o => [o.id, o])); this.cached.set(module, defs); }
    return defs;
  }
}
