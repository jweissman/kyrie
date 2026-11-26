import type { CreationCard, CreationStep } from '../creation/creation-flow';
import type { CreationState } from '../../web/engine/engine-creation';
import type { EngineHost } from '../../web/engine/engine-host';
import type { Setting } from '../creation/protocol';
import { Signs } from '../presentation/signs';
import { Typography } from '../presentation/typography';
import { TerminalInput, type Asking, type Picking } from './terminal-input';
import type { Menu, Row } from './terminal-picker';
import { FirstChoice, type FirstStep, type Where } from '../creation/first-choice';
import { FreshSeeds } from '../world/fresh-seeds';
import type { EnginePage } from '../creation/opening-pages';

// A step as it is asked: creation's (CreationFlow), or how the game begins (FirstChoice).
type Asked = Pick<CreationStep, 'ask' | 'cards' | 'chosen' | 'all' | 'many' | 'picked' | 'place'>;

// Who comes into the world, chosen in the terminal as the page chooses: by asking the engine where the making of a
// life stands and sending it each choice, through the same requests the page's worker answers (world, creation,
// set-out: see EngineCreation). Its steps, their cards, the four each leads with, what a choice settles and what the
// next step is are all the engine's; here they are shown as numbered lines, each with its emblem's character
// (Signs), and nothing of creation is decided (the owner, 14 November: no second character creator). An empty
// answer takes the card chosen already (or the first), and for the name the one drawn.
export class TerminalCreation {
  private all = false;
  constructor(private readonly input: Asking, private readonly say: (line: string) => void = console.log) {}
  // How the game begins, asked first of one at the keys, as the page asks it (FirstChoice, OR-120): a life built step
  // by step, or one drawn whole from creation's defaults and set out with at once (set-out's rolled). The country is
  // drawn while the question is read, and the start Set out now asks made ready behind it (see EngineForesight).
  // named: the country asked for (--world); kept: the seed of the one kept here, which the acts that set out say they
  // replace (OR-1271); a new life always begins in a country never seen. Back is the title again (undefined).
  async begin(host: EngineHost, named?: string, kept?: string): Promise<{ rolled: boolean } | undefined> {
    const where: Where = kept ? { kept } : {};
    const seed = named ?? FreshSeeds.seed(FirstChoice.seed);
    await host.handle({ kind: 'ahead', seed });
    const id = (await this.card(await host.handle({ kind: 'beginning', ...where }) as FirstStep)).id;
    if (id === 'back') { return undefined; }
    if (id === 'build') { await this.choose(host, seed); return { rolled: false }; }
    await host.handle({ kind: 'world', seed });
    return { rolled: true };
  }
  // A page of the engine's (OpeningPages, OR-382), its rows asked as numbered lines, as the page draws them: the
  // title's Continue, New Game, Options and Quit.
  async row(page: EnginePage): Promise<string> {
    return (await this.card({ ask: page.ask, chosen: page.chosen, all: true,
      cards: page.rows.map(r => ({ id: r.id, name: r.label })) })).id;
  }
  async choose(host: EngineHost, seed: string): Promise<{ state: CreationState; setting: Setting }> {
    const setting = await host.handle({ kind: 'world', seed }) as Setting;
    let state = await host.handle({ kind: 'creation' }) as CreationState;
    // The step asked is the engine's (CreationState.at), read again after each choice: a card chosen goes on, and a
    // name written is gone on from.
    for (let step = TerminalCreation.asked(state); step; step = TerminalCreation.asked(state)) {
      const value = step.id === 'name' ? await this.name(step) : (await this.card(step)).id;
      state = await host.handle({ kind: 'creation', step: step.id, value }) as CreationState;
      if (step.id === 'name') { state = await host.handle({ kind: 'creation', step: 'onward' }) as CreationState; }
    }
    return { state, setting };
  }
  // A step's cards by number, under their groups; a card that cannot be taken says why, and is not taken.
  private async card(step: Asked): Promise<CreationCard> {
    if (TerminalInput.picks(this.input)) { return this.picked(step, this.input); }
    if (step.place) { this.say(`\nStep ${step.place.at} of ${step.place.of}`); }
    this.say(`\n${Typography.plain(step.ask)}`);
    let group: string | undefined;
    // The four the step leads with, and the rest under `more`, numbered as they stand (the owner, 14 November).
    const shown = step.cards.length > 4 && !this.all && !step.all ? step.cards.slice(0, 4) : step.cards;
    shown.forEach((c, i) => {
      if (c.group && c.group !== group) { group = c.group; this.say(`  ${Typography.plain(group)}`); }
      const sign = c.emblem && Signs.emblem(c.emblem);
      this.say(`  ${i + 1}. ${sign ? `${sign} ` : ''}${Typography.plain(c.name)}${c.line ? ` — ${Typography.plain(c.line)}` : ''}`
        + `${c.shut ? ` (${c.shut})` : ''}${c.id === step.chosen || step.picked?.includes(c.id) ? ' *' : ''}`);
    });
    if (shown.length < step.cards.length) { this.say(`  (${step.cards.length - shown.length} more: more)`); }
    // Enter takes the card chosen already, or the first; at a step of many its last, which goes on.
    const last = step.many ? step.cards.at(-1) : undefined;
    const fallback = last ?? step.cards.find(c => c.id === step.chosen && !c.shut) ?? step.cards.find(c => !c.shut)!;
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
  private async picked(step: Asked, input: Picking): Promise<CreationCard> {
    const menu = TerminalCreation.menu(step), picked = await input.pick(menu);
    if (!picked) { throw new Error(TerminalCreation.left); }
    return step.cards.find(c => 'choice' in picked && c.id === picked.choice)
      ?? step.cards.find(c => c.id === menu.focus) ?? step.cards[0]!;
  }
  // A step as a picker's menu: its question, its four and the rest, each card by its emblem and name, its line under
  // it while focused, its whole on asking; the focus on the card chosen already.
  static menu(step: Asked): Menu {
    const rows: Row[] = step.cards.map(c => {
      const sign = c.emblem && Signs.emblem(c.emblem);
      const taken = step.picked?.includes(c.id) ? ' *' : '';
      return { id: c.id, label: `${Typography.plain(c.name)}${taken}`, ...sign ? { icon: sign } : {},
        ...c.line ? { note: Typography.plain(c.line) } : {}, ...c.group ? { group: Typography.plain(c.group) } : {},
        ...c.shut ? { shut: `${c.shut}.` } : {}, about: c.text ? [Typography.plain(c.text)] : [] };
    });
    // At a step of many the focus is on going on, once it can be gone on (CreationStep.many).
    const last = step.many ? step.cards.at(-1) : undefined, at = step.all ? rows.length : 4;
    const chosen = (last && !last.shut ? last.id : undefined) ?? step.chosen ?? step.cards.find(c => !c.shut)?.id;
    return { title: Typography.plain(step.ask), rows: rows.slice(0, at), rest: rows.slice(at),
      ...chosen ? { focus: chosen } : {} };
  }
  static readonly left = 'The player left before setting out.';
  static asked(state: CreationState): CreationStep | undefined { return state.steps.find(x => x.id === state.at); }
  private async name(step: CreationStep): Promise<string> {
    const drawn = step.names?.[0] ?? step.chosen ?? '';
    this.say(`\n${Typography.plain(step.ask)}${drawn ? ` (Enter for ${drawn})` : ''}`);
    return (await this.input.ask('> '))?.trim() ?? '';
  }
}
