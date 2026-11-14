import { ChoiceList, type Choice } from '../ui/choice-list';
import { Signs } from '../presentation/signs';
import { Grave } from '../presentation/grave';
import type { Aspect, Glance } from '../presentation/glance-types';
import type { Screen } from '../ui/screen-types';

// What the page draws beside a choice's words, read where the page reads it: its marks (ChoiceList, as Marks puts
// them on), whether it is done by holding, what is perceived off along the way it is (Glance.sensed: drawn faint),
// and whether the place it goes has nothing new (Glance.idle: drawn dim). A terminal row had carried its tones alone,
// and a way with no coming back or a search that is held had read like any other (the owner, 14 November: the
// terminal a fallback for every text-adjacent treatment, from one shared game definition).
// tags: each mark's words, all of them, since the terminal has no line beneath to say what cannot be undone.
// crosses: it goes over into the next stretch of country, as the page's journey glyph says (not a walk about a town).
// asks: what it says when chosen once, a grave act asking before it is done (Grave, the page's own rule).
// shown, note: the choice's words and its note as the page draws them (ChoiceList: a price said beside the act, not run
// into its words).
// far: how many places off along the way what is sensed lies.
// bearing: a way's bearing in a site said in a word (Signs.bearing: "unexplored", "back").
export interface Signed { tags?: string[]; hold?: true; sensed?: Aspect; far?: number; idle?: true; crosses?: true;
  asks?: string; shown?: string; note?: string; bearing?: string }
export class TerminalSigns {
  private readonly choices: Map<string, Choice>;
  private readonly idle: Set<string>;
  // The choices that stand at the top of a list, whose words say the whole act ("A while" is a wait's, under Wait).
  private readonly whole: Set<string>;
  constructor(private readonly screen: Screen, private readonly glance: Glance | undefined) {
    const top = ChoiceList.explore(screen).flatMap(s => s.choices);
    this.choices = new Map(top.flatMap(c => TerminalSigns.leaves(c)).map(c => [c.command!, c]));
    this.whole = new Set(top.flatMap(c => c.command && !c.children?.length ? [c.command] : []));
    this.idle = new Set(glance?.idle ?? []);
  }
  private bearing(id: string): { bearing?: string } {
    const b = Signs.bearing(this.glance, id);
    return b ? { bearing: b.said } : {};
  }
  on(id: string): Signed {
    const c = this.choices.get(id), to = TerminalSigns.to(this.screen, id);
    const off = this.glance?.sensed?.find(x => x.to === to), sensed = off?.aspect;
    const tags = (c?.marks ?? []).map(m => Signs.marks[m.kind]);
    const said = c && Grave.asks(c), asks = said && Grave.asked(said, !!c.grave);
    return { ...tags.length ? { tags } : {}, ...c?.hold ? { hold: true as const } : {},
      ...sensed ? { sensed, far: off.far } : {}, ...this.idle.has(to) ? { idle: true as const } : {},
      ...this.crosses(id) ? { crosses: true as const } : {}, ...asks ? { asks } : {},
      ...c && (c.alone ?? this.whole.has(id)) ? { shown: c.alone ?? c.label } : {},
      ...c?.note ? { note: c.note } : {}, ...this.bearing(id) };
  }
  // As the page reads it (GlanceStage.Icons): a journey set out on that is not a walk about the town, or a way
  // marked so.
  private crosses(id: string): boolean {
    const walk = (this.screen.around ?? []).some(d => `travel:${d.id}` === id);
    return (id.startsWith('travel:') && !walk) || !!this.screen.exits.find(e => e.id === id)?.crosses;
  }
  // Where a choice goes: its way's destination, or the place it sets out for.
  private static to(screen: Screen, id: string): string {
    return screen.exits.find(e => e.acts.some(a => a.command === id))?.destination.id ?? id.replace(/^travel:/, '');
  }
  private static leaves(c: Choice): Choice[] {
    return c.children?.length ? c.children.flatMap(k => this.leaves(k)) : c.command ? [c] : [];
  }
}
