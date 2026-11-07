import type { Journey, Offered } from '../../src/session/journey';
import type { Screen } from '../../src/ui/screen-types';
import { Narrator } from '../../src/presentation/narrator';
import { ChoiceList, type Choice } from '../../src/ui/choice-list';

// One who plays from what the page shows and nothing else (the owner, 7 November: "our tests often possess
// information that an ordinary player does not: the correct destination identity, the relevant NPC, the operator
// that advances the quest, or the required order of actions"). It reads an aim's words; if someone the words name is
// here, it asks them what shares most words with the aim; else it goes where the words name a place, or the way the
// page marks for it; else it waits a while, as one does for someone not yet come. It never names an id, never moves
// the company by hand, and never chooses by a command's name. What it could not do, and why, is the finding.
export interface Pursuit { aim: string; done: boolean; steps: string[]; stuck?: string }

export class ColdPlayer {
  static readonly most = 14;
  // The aims the page holds now, by their words.
  static aims(j: Journey): string[] { return (j.screen().aims ?? []).map(a => a.text); }
  // Read whatever the place has posted where the company stands (a notice on the well-post), as anyone would.
  static async read(j: Journey): Promise<void> {
    const notice = j.choices().find(c => /^Read /.test(c.label) && !/^Pack/.test(c.label));
    if (notice) { await j.perform(notice.command, notice.label); }
  }
  // Follow one aim until the page no longer holds it (it was done, or became the next), or nothing on the page
  // answers its words.
  static async pursue(j: Journey, aim: string): Promise<Pursuit> {
    const steps: string[] = [];
    for (let n = 0; n < ColdPlayer.most; n++) {
      if (!ColdPlayer.aims(j).includes(aim)) { return { aim, done: true, steps }; }
      const next = ColdPlayer.next(j, aim, steps);
      if (!next) { return { aim, done: false, steps, stuck: ColdPlayer.why(j, aim) }; }
      steps.push(next.label);
      await j.perform(next.command, next.label);
    }
    return { aim, done: !ColdPlayer.aims(j).includes(aim), steps, stuck: 'went round without the aim changing' };
  }
  private static next(j: Journey, aim: string, steps: string[]): Offered | undefined {
    const screen = j.screen(), said = ColdPlayer.words(aim), all = j.choices();
    // Someone the aim names, here: what to say to them that is most about the aim.
    for (const p of screen.people.filter(x => ColdPlayer.names(aim, x.name))) {
      const theirs = all.filter(c => c.full.startsWith(`${p.name}`) && !steps.includes(c.label)
        && !/^(Attack|Give|Pack)/.test(c.label));
      const best = ColdPlayer.best(theirs, said);
      if (best) { return best; }
    }
    // A way to a place the aim names, or to a person it names who is known to be there; else the way marked for it.
    const ways = all.filter(c => /^(go\(|travel:|enter\()/.test(c.command) && !steps.includes(c.label));
    const named = ways.find(c => ColdPlayer.place(aim, c.label));
    if (named) { return named; }
    const marked = ColdPlayer.marked(j).map(command => ways.find(c => c.command === command)).find(Boolean);
    if (marked) { return marked; }
    // What the page leads with, as one who trusts it would (the ruts at the bridge-foot, "about" the aim).
    const led = ColdPlayer.led(j).flatMap(command => all.filter(c => c.command === command || c.label === command))
      .find(c => !steps.includes(c.label));
    if (led) { return led; }
    // Nothing here answers it: wait a while, once, for whoever is not here yet.
    return steps.at(-1) === 'Wait a while' ? undefined : all.find(c => c.label === 'Wait a while');
  }
  // The ways the page marks as going where the company's aims go (the glance's aimed), as the engine's commands.
  private static marked(j: Journey): string[] {
    const screen = j.screen(), ids = Narrator.leaf(j.campaign, screen).glance?.aimed ?? [];
    const flat = ChoiceList.explore(screen).flatMap(section => ColdPlayer.flat(section.choices));
    return ids.flatMap(id => flat.find(c => c.id === id)?.command ?? (/^travel:/.test(id) ? [id] : []));
  }
  // What the glance leads with, as commands (a thing looked at is its first act: the ruts looked at closely).
  private static led(j: Journey): string[] {
    const screen = j.screen(), g = Narrator.leaf(j.campaign, screen).glance;
    const flat = ChoiceList.explore(screen).flatMap(section => ColdPlayer.flat(section.choices));
    return (g?.acts ?? []).flatMap(a => {
      const c = flat.find(x => x.id === a.choice);
      return c?.command ? [c.command] : (c?.children ?? []).flatMap(k => k.command ? [k.command] : []).slice(0, 1);
    });
  }
  private static flat(choices: Choice[]): Choice[] {
    return choices.flatMap(c => [c, ...ColdPlayer.flat(c.children ?? [])]);
  }
  // The choice whose words are most the aim's (two words at least).
  private static best(choices: Offered[], said: Set<string>): Offered | undefined {
    const scored = choices.map(c => [[...ColdPlayer.words(c.label)].filter(w => said.has(w)).length, c] as const)
      .filter(([n]) => n >= 2).sort((a, b) => b[0] - a[0]);
    return scored[0]?.[1];
  }
  // Whether the aim's words name someone by the name the page gives them (their first name will do).
  private static names(aim: string, name: string): boolean {
    const first = name.replace(/^(the|a|an) /i, '').split(/[ ,]/)[0]!;
    return first.length > 2 && new RegExp(`\\b${first}\\b`, 'i').test(aim);
  }
  // Whether a way's words name a place the aim's words name: "To the churchyard" of "under the churchyard at Elmford".
  private static place(aim: string, label: string): boolean {
    const to = label.replace(/^(To|Into|Go|Take the \S+ to|Travel to|Out to|Up to|Down to) /i, '')
      .replace(/^(the|a|an) /i, '').replace(/ · .*$/, '').replace(/[…(].*$/, '').trim().toLowerCase();
    return to.length > 3 && aim.toLowerCase().includes(to);
  }
  private static words(text: string): Set<string> {
    const common = new Set(['the', 'a', 'an', 'of', 'to', 'at', 'in', 'on', 'and', 'what', 'about', 'ask', 'tell',
      'is', 'are', 'has', 'for', 'with', 'your', 'you', 'it', 'its', 'from', 'by', 'up', 'out', 'who', 'how']);
    return new Set(text.toLowerCase().split(/[^a-z']+/).filter(w => w.length > 2 && !common.has(w)));
  }
  // What the page offered where it stuck: where the company stood, who was there, and where it could go.
  private static why(j: Journey, aim: string): string {
    const s: Screen = j.screen(), ways = j.choices().filter(c => /^(go\(|travel:|enter\()/.test(c.command));
    const g = Narrator.leaf(j.campaign, s).glance;
    return `at ${s.place.name}; aim "${aim}"; the page's aim line: ${g?.aim ?? 'none'}; led: `
      + `${(g?.acts ?? []).map(a => `${a.choice} (${a.why})`).join(', ') || 'nothing'}; `
      + `here: ${s.people.map(p => p.name).join(', ') || 'no one'}; ways: ${ways.map(w => w.label).slice(0, 8).join(' | ')}`;
  }
}
