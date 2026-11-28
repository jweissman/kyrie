import { Words } from './words';
import { Sentences } from './sentences';
import type { Campaign } from '../campaign/campaign';
import type { Module, Observation } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { EntityIndex } from '../lang/index';
import { ObservationText } from '../lang/observation-text';
import { FictionalTime } from '../campaign/fictional-time';
import type { Screen, TargetRow } from '../ui/screen-types';
import { Typography } from './typography';
import { Charge } from './charge';
import { PlayerView } from './player-view';
import type { CompanyRecall } from './company-recall';
import type { Arrival, Glance } from './glance-types';

type Line = { id: string; text: string };
export interface Lines { sight?: Glance['sight']; life?: Glance['life']; contents?: Glance['contents']; changed: string[];
  pointed: Set<string> }

// The glance's few lines (OWN-18): the place's own distinctive line (at most two sentences, never cut inside one), a
// sign of life now, and on a return what has changed. A line is the place's own when its installation's, set at it,
// about nothing in particular, and no one's here; it is someone's when it is set near or beside them, is about them,
// names them, or holds only while they are here (Callow's sermon). Read from what the narrator tells now and what the
// module declares, never from the words.
export class GlanceLines {
  static readonly words = 50;
  // changes: what the last act changed, by which whoever warned the company off just now is known, its warning told
  // as what happened (see here).
  // apart: what an opening told just before (Telling.apart), said again in no line here; where it met someone on the
  // road, what lies about them is its telling's, and no list of what is here follows it (OR-1687).
  static of(campaign: Campaign, screen: Screen, at: { arrival: Arrival; recall: CompanyRecall; kept: Line[];
    changed: string[]; changes?: readonly string[]; apart?: { texts: ReadonlySet<string>; met: boolean } }): Lines {
    const defs = this.defs(campaign.module), present = this.present(screen);
    // The place's own; else, where no line is its own (an opening's, an origin's), one set at it about nothing.
    // At the opening, only the company's charge (see Charge): the rest of the place is the second turn's.
    const charge = at.arrival === 'opening' && Charge.opening(campaign) && Charge.of(screen).size ? Charge.of(screen)
      : undefined;
    const own = this.owned(charge ? Charge.split(at.kept, charge).told : at.kept, defs,
      { here: screen.place.id, present });
    const sight = at.arrival === 'stay' ? undefined : this.sight(screen, own, { defs, recall: at.recall,
      back: ['return', 'resume'].includes(at.arrival) });
    // Staying, what was done leads: the place and its life are as they were.
    const lively = at.arrival === 'stay' ? undefined
      : this.life(screen, { defs, present, kept: at.kept, own, sight, arrival: at.arrival, recall: at.recall,
        warned: new Set((at.changes ?? []).flatMap(c => /^\+ warned\(([^,]+),/.exec(c)?.[1] ?? [])),
        told: at.apart?.texts });
    // Nor, at the opening, anyone's doings: the incident has just said who is at the company's elbow.
    const life = charge && own.length ? undefined : lively;
    const passing = new Set(screen.observed.filter(o => ['weather', 'ambience'].includes(this.def(defs, o.id)?.aspect ?? ''))
      .map(o => Typography.curl(FictionalTime.prose(o.text))));
    const back = ['return', 'resume'].includes(at.arrival);
    const told = back ? [...new Set([...at.changed, ...this.left(campaign, screen, defs)])] : [];
    const changed = told.map(t => Typography.curl(t))
      .filter(t => t !== sight?.text && !passing.has(t) && t !== life?.text).slice(0, 2);
    // What the lines told now name, of someone here or of the place (the taproom a dog lies at the door of).
    const pointed = new Set(screen.observed.flatMap(l => this.named(this.def(defs, l.id)?.text ?? '')));
    const contents = ['first', 'opening'].includes(at.arrival) && !screen.dark && !at.apart?.met
      ? this.contents(campaign, screen, { defs, told: [sight?.id, life?.id, life?.subject], charge }) : undefined;
    return { ...sight ? { sight } : {}, ...life ? { life } : {}, ...contents ? { contents } : {}, changed, pointed };
  }
  // The lines as the glance says them.
  static said({ sight, life, contents, changed }: Lines): Pick<Glance, 'sight' | 'life' | 'contents' | 'changed'> {
    return { ...sight ? { sight } : {}, ...life ? { life } : {}, ...contents ? { contents } : {}, changed };
  }
  // What lies here to be taken, read or opened, by name, the first time the company comes: three at most, those its
  // author set a line beside first, then what is worth having, then the rest (the look tells them whole). A room's
  // things had been in its acts alone: the dead party's pack, notebook and coins at the back-stone, the beads in the
  // passage, the net in the cross-chamber, so that "The notebook lies open by the dead fire where you left it" was the
  // first word of either (cold play 4, CL-42). Not what is for sale, someone's, inside something, or a way's own
  // works (a portal stone's counterweight, said with the way), nor what is told already.
  static readonly listed = 3;
  private static contents(campaign: Campaign, screen: Screen, at: { defs: Map<string, Observation>;
    told: (string | undefined)[]; charge?: ReadonlySet<string> }): Glance['contents'] {
    const byId = EntityIndex.of(campaign.module.entities).byId, works = this.works(campaign.module);
    const lined = new Set(screen.observed.flatMap(o => {
      const d = this.def(at.defs, o.id);
      return d?.anchor === 'near' && d.place && !at.told.includes(o.id) ? [d.place] : [];
    }));
    const here = screen.things.filter(t => t.acts.length && !t.note && !at.told.includes(t.id)
      && (!at.charge || Charge.holds(t.id, at.charge))
      && !works.has(t.id) && (byId.get(t.id)?.type === 'item' || (byId.get(t.id)?.type === 'thing' && lined.has(t.id))));
    const ranked = [...here.filter(t => lined.has(t.id)), ...here.filter(t => !lined.has(t.id) && t.valuable),
      ...here.filter(t => !lined.has(t.id) && !t.valuable)].slice(0, this.listed);
    if (!ranked.length) { return undefined; }
    const names = ranked.map(t => Typography.plain(t.name));
    const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0]!;
    return { text: this.curl(`You see ${list}.`), subjects: ranked.map(t => t.id) };
  }
  // What the company itself left changed here (a chest it opened), as it stands now: come back to, the place had been
  // told by its first sentence only, and what was done in it went unsaid (Quittance's QTC-10). By the world's record
  // of who changed what (changedBy), and the line's own subject, never the words.
  private static left(campaign: Campaign, screen: Screen, defs: Map<string, Observation>): string[] {
    const ours = new Set(['party', campaign.playerActor ?? '']);
    const w = campaign.world, changed = new Set(w.related('changedBy').filter(r => ours.has(r.args[1]!)).map(r => r.args[0]!));
    // Not whoever goes with the company: a shepherd's boy untied and following "rubs his wrists" had been news at
    // every place he came to (round 5).
    const along = new Set(['following', 'memberOf'].filter(n => w.relates(n))
      .flatMap(n => w.related(n).filter(r => ours.has(r.args[1]!)).map(r => r.args[0]!)));
    // Nor what was only read or looked at (a receipt, a body under a cloth: something read in it is a reading of it),
    // which had been read out again on coming back to the landing (cold play 6, CL-55).
    const read = new Set([...defs.values()].filter(d => d.aspect === 'reading' && d.about).map(d => d.about!));
    return screen.observed.filter(o => changed.has(this.def(defs, o.id)?.about ?? '')
      && !along.has(this.def(defs, o.id)?.about ?? '') && !read.has(this.def(defs, o.id)?.about ?? ''))
      .map(o => FictionalTime.prose(o.text));
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
  private static sentences(text: string): string[] { return Sentences.split(text); }
  // What is alive here now, the first that holds: a danger; whoever warns the company off; someone it has a stake in;
  // someone doing something; a line that is someone's; someone with something to be asked; and the first time only,
  // the place's passing life, or an animal's. Come back to, only what is new since.
  private static life(screen: Screen, at: { defs: Map<string, Observation>; present: Set<string>; kept: Line[];
    own: Line[]; sight?: Glance['sight']; arrival: Arrival; recall: CompanyRecall; warned: ReadonlySet<string>;
    told?: ReadonlySet<string> }): Glance['life'] {
    const people = screen.people.filter(p => !p.companion && !p.state), first = !['return', 'resume'].includes(at.arrival);
    const threat = people.find(p => p.reckoning);
    if (threat) {
      return { text: this.curl(threat.says?.[0] ?? this.here(threat, at.warned.has(threat.id))), subject: threat.id,
        danger: true };
    }
    const warner = screen.warned && people.find(p => p.id === screen.warned!.id);
    if (warner) { return { text: this.curl(warner.says?.[0] ?? this.here(warner)), subject: warner.id }; }
    const fresh = this.unheard.bind(this, first, at.recall, at.told ?? new Set());
    // Something heard from the next room, which the way there is marked by: the barrow's whetstone had been held for a
    // look, the north recess marked heard and nothing heard in the prose (cold play 4, CL-48).
    const sound = at.kept.find(l => this.def(at.defs, l.id)?.aspect === 'sound' && fresh(l.text));
    if (sound) { return { id: sound.id, text: this.curl(sound.text) }; }
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
  // Fresh, and not what the opening has just told (OR-1687).
  private static unheard(first: boolean, recall: CompanyRecall, told: ReadonlySet<string>, text: string): boolean {
    return !told.has(this.curl(text)) && this.fresh(first, recall, text);
  }
  // New since the company was last here: anything, the first time.
  private static fresh(first: boolean, recall: CompanyRecall, text: string): boolean {
    return first || !recall.read(text);
  }
  // Who is here with nothing else said of them: a creature by what it is, its kind as it varies (a barrow ghoul, not
  // a ghoul), where its name does not say it. "The keeper of the vault is here." had been all the vault said of what
  // killed the company (cold play 3, CL-13).
  // And what its kind looks like, once: "The snakes are here." had been all an ossuary said of what came at the
  // company, and a fight opened on their hit points (cold play 4, CL-42). One whose warning has just been told (the
  // king sitting up on his bier) is said by its looks alone, not labelled before it ("The king under the mound is
  // here: a mummy.": CL-44).
  private static here(row: TargetRow, warned = false): string {
    const name = row.name.split(', ')[0]!, kind = row.kind === 'person' ? undefined : row.entry?.name.toLowerCase();
    // By the kind's last word, one or many of it ("the wolves" says wolf, and is not told "wolfs").
    const last = kind?.split(' ').at(-1), lower = name.toLowerCase();
    const named = !kind || lower.includes(last!.replace(/s$/, '')) || lower.includes(Words.plural(last!));
    const what = named ? '' : `: ${row.many ? Words.plural(kind) : `${/^[aeiou]/.test(kind) ? 'an' : 'a'} ${kind}`}`;
    const called = `${name.charAt(0).toUpperCase()}${name.slice(1)} ${row.many ? 'are' : 'is'} here`;
    const looks = row.entry?.looks && Sentences.split(row.entry.looks)[0];
    if (!looks) { return `${called}${what}.`; }
    const like = `${looks.charAt(0).toLowerCase()}${looks.slice(1)}`;
    if (row.many) { return named ? `${called}, each ${like}` : `${called}${what}. Each is ${like}`; }
    return warned ? looks : `${called}${what}. ${looks}`;
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
  // What a way's opening turns on (a winch's wheel, a lever): said with the way, not as a thing lying here.
  private static readonly worked = new WeakMap<Module, Set<string>>();
  private static works(module: Module): Set<string> {
    let works = this.worked.get(module);
    if (!works) {
      const found = new Set<string>();
      for (const r of (module.rules ?? []).filter(x => x.id.endsWith('__opens'))) {
        ModuleWriter.conditionCalls(r.when, call => { if (call.name === 'state') { found.add(call.args[0]!); } return call; });
      }
      this.worked.set(module, works = found);
    }
    return works;
  }
  private static readonly cached = new WeakMap<Module, Map<string, Observation>>();
  static defs(module: Module): Map<string, Observation> {
    let defs = this.cached.get(module);
    if (!defs) { defs = new Map((module.observations ?? []).map(o => [o.id, o])); this.cached.set(module, defs); }
    return defs;
  }
}
