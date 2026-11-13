import { ChoiceList, type Choice } from '../ui/choice-list';
import { Signs } from '../presentation/signs';
import type { Aspect, Glance } from '../presentation/glance-types';
import type { Screen } from '../ui/screen-types';

// What the page draws beside a choice's words, read where the page reads it: its marks (ChoiceList, as Marks puts
// them on), whether it is done by holding, what is perceived off along the way it is (Glance.sensed: drawn faint),
// and whether the place it goes has nothing new (Glance.idle: drawn dim). A terminal row had carried its tones alone,
// and a way with no coming back or a search that is held had read like any other (the owner, 14 November: the
// terminal a fallback for every text-adjacent treatment, from one shared game definition).
// tags: each mark's words, all of them, since the terminal has no line beneath to say what cannot be undone.
export interface Signed { tags?: string[]; hold?: true; sensed?: Aspect; idle?: true }
export class TerminalSigns {
  private readonly choices: Map<string, Choice>;
  private readonly idle: Set<string>;
  constructor(private readonly screen: Screen, private readonly glance: Glance | undefined) {
    this.choices = new Map(ChoiceList.explore(screen).flatMap(s => s.choices).flatMap(c => TerminalSigns.leaves(c))
      .map(c => [c.command!, c]));
    this.idle = new Set(glance?.idle ?? []);
  }
  on(id: string): Signed {
    const c = this.choices.get(id), to = TerminalSigns.to(this.screen, id);
    const sensed = this.glance?.sensed?.find(x => x.to === to)?.aspect;
    const tags = (c?.marks ?? []).map(m => Signs.marks[m.kind]);
    return { ...tags.length ? { tags } : {}, ...c?.hold ? { hold: true as const } : {},
      ...sensed ? { sensed } : {}, ...this.idle.has(to) ? { idle: true as const } : {} };
  }
  // Where a choice goes: its way's destination, or the place it sets out for.
  private static to(screen: Screen, id: string): string {
    return screen.exits.find(e => e.acts.some(a => a.command === id))?.destination.id ?? id.replace(/^travel:/, '');
  }
  private static leaves(c: Choice): Choice[] {
    return c.children?.length ? c.children.flatMap(k => this.leaves(k)) : c.command ? [c] : [];
  }
}
