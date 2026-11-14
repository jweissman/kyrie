import type { CreationCard, CreationStep } from '../../web/engine/creation-flow';
import type { CreationState } from '../../web/engine/engine-creation';
import type { EngineHost } from '../../web/engine/engine-host';
import type { Setting } from '../../web/engine/protocol';
import { Signs } from '../presentation/signs';
import { Typography } from '../presentation/typography';
import { TerminalInput, type Asking, type Picking } from './terminal-input';
import type { Menu, Row } from './terminal-picker';

// Who comes into the world, chosen in the terminal as the page chooses: by asking the engine where the making of a
// life stands and sending it each choice, through the same requests the page's worker answers (world, creation,
// set-out: see EngineCreation). Its steps, their cards, the four each leads with, what a choice settles and what the
// next step is are all the engine's; here they are shown as numbered lines, each with its emblem's character
// (Signs), and nothing of creation is decided (the owner, 14 November: no second character creator). An empty
// answer takes the card chosen already (or the first), and for the name the one drawn.
export class TerminalCreation {
  private all = false;
  constructor(private readonly input: Asking, private readonly say: (line: string) => void = console.log) {}
  async choose(host: EngineHost, seed: string): Promise<{ state: CreationState; setting: Setting }> {
    const setting = await host.handle({ kind: 'world', seed }) as Setting;
    let state = await host.handle({ kind: 'creation' }) as CreationState;
    // The steps are read again after each choice: a calling with ways adds a step for its way.
    for (let i = 0; i < state.steps.length; i++) {
      const step = state.steps[i]!;
      const value = step.id === 'name' ? await this.name(step) : (await this.card(step)).id;
      state = await host.handle({ kind: 'creation', step: step.id, value }) as CreationState;
    }
    return { state, setting };
  }
  // A step's cards by number, under their groups; a card that cannot be taken says why, and is not taken.
  private async card(step: CreationStep): Promise<CreationCard> {
    if (TerminalInput.picks(this.input)) { return this.picked(step, this.input); }
    this.say(`\n${Typography.plain(step.ask)}`);
    let group: string | undefined;
    // The four the step leads with, and the rest under `more`, numbered as they stand (the owner, 14 November).
    const shown = step.cards.length > 4 && !this.all ? step.cards.slice(0, 4) : step.cards;
    shown.forEach((c, i) => {
      if (c.group && c.group !== group) { group = c.group; this.say(`  ${Typography.plain(group)}`); }
      const sign = c.emblem && Signs.emblem(c.emblem);
      this.say(`  ${i + 1}. ${sign ? `${sign} ` : ''}${Typography.plain(c.name)}${c.line ? ` — ${Typography.plain(c.line)}` : ''}`
        + `${c.shut ? ` (${c.shut})` : ''}${c.id === step.chosen ? ' *' : ''}`);
    });
    if (shown.length < step.cards.length) { this.say(`  (${step.cards.length - shown.length} more: more)`); }
    const fallback = step.cards.find(c => c.id === step.chosen && !c.shut) ?? step.cards.find(c => !c.shut)!;
    for (;;) {
      const answer = (await this.input.ask('> '))?.trim() ?? '';
      if (answer === 'more' && shown.length < step.cards.length) {
        this.all = true;
        try { return await this.card(step); } finally { this.all = false; }
      }
      const card = answer ? step.cards[Number(answer) - 1] : fallback;
      if (card && !card.shut) { return card; }
      this.say(card?.shut ? `${card.shut}.` : `Choose a number from 1 to ${step.cards.length}.`);
    }
  }
  // The human mode: the same cards, the four the step leads with and the rest behind More, picked by the same keys as
  // a scene (TP-05: creation and navigation through one grammar). A card that cannot be taken says why, on Enter.
  private async picked(step: CreationStep, input: Picking): Promise<CreationCard> {
    const menu = TerminalCreation.menu(step), picked = await input.pick(menu);
    if (!picked) { throw new Error(TerminalCreation.left); }
    return step.cards.find(c => 'choice' in picked && c.id === picked.choice)
      ?? step.cards.find(c => c.id === menu.focus) ?? step.cards[0]!;
  }
  // A step as a picker's menu: its question, its four and the rest, each card by its emblem and name, its line under
  // it while focused, its whole on asking; the focus on the card chosen already.
  static menu(step: CreationStep): Menu {
    const rows: Row[] = step.cards.map(c => {
      const sign = c.emblem && Signs.emblem(c.emblem);
      return { id: c.id, label: `${sign ? `${sign} ` : ''}${Typography.plain(c.name)}`,
        ...c.line ? { note: Typography.plain(c.line) } : {}, ...c.group ? { group: Typography.plain(c.group) } : {},
        ...c.shut ? { shut: `${c.shut}.` } : {}, about: c.text ? [Typography.plain(c.text)] : [] };
    });
    const chosen = step.chosen ?? step.cards.find(c => !c.shut)?.id;
    return { title: Typography.plain(step.ask), rows: rows.slice(0, 4), rest: rows.slice(4),
      ...chosen ? { focus: chosen } : {} };
  }
  static readonly left = 'The player left before setting out.';
  private async name(step: CreationStep): Promise<string> {
    const drawn = step.names?.[0] ?? step.chosen ?? '';
    this.say(`\n${Typography.plain(step.ask)}${drawn ? ` (Enter for ${drawn})` : ''}`);
    return (await this.input.ask('> '))?.trim() ?? '';
  }
}
