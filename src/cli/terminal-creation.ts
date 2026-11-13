import { Creation } from '../../web/engine/creation';
import { CreationFlow, type CreationCard, type CreationStep } from '../../web/engine/creation-flow';
import type { Member, Setting } from '../../web/engine/protocol';
import { Signs } from '../presentation/signs';
import { Typography } from '../presentation/typography';
import type { Asking } from './terminal-input';

// Who comes into the world, chosen in the terminal: the engine's one creation flow (CreationFlow), its steps and cards
// shown as numbered lines, each with its emblem's character as the page draws its glyph (Signs), and each choice said
// back to it. Nothing of creation is decided here. `bin/kyrie adventure` had set out with a human ranger, without
// asking (the owner, 14 November: TM-06). An empty answer takes the card chosen already (or the first), and for the
// name the one drawn.
export class TerminalCreation {
  constructor(private readonly input: Asking, private readonly say: (line: string) => void = console.log) {}
  async choose(seed: string): Promise<{ member: Member; origin?: string; setting: Setting }> {
    const setting = await new Creation().generate(seed), flow = new CreationFlow(setting, Creation.catalog());
    // The steps are read again after each choice: a calling with ways adds a step for its way.
    for (let i = 0; i < flow.steps().length; i++) {
      const step = flow.steps()[i]!;
      flow.choose(step.id, step.id === 'name' ? await this.name(step) : (await this.card(step)).id);
    }
    return { member: flow.member, ...flow.origin ? { origin: flow.origin } : {}, setting };
  }
  // A step's cards by number, under their groups; a card that cannot be taken says why, and is not taken.
  private async card(step: CreationStep): Promise<CreationCard> {
    this.say(`\n${Typography.plain(step.ask)}`);
    let group: string | undefined;
    step.cards.forEach((c, i) => {
      if (c.group && c.group !== group) { group = c.group; this.say(`  ${Typography.plain(group)}`); }
      const sign = c.emblem && Signs.emblem(c.emblem);
      this.say(`  ${i + 1}. ${sign ? `${sign} ` : ''}${Typography.plain(c.name)}${c.line ? ` — ${Typography.plain(c.line)}` : ''}`
        + `${c.shut ? ` (${c.shut})` : ''}${c.id === step.chosen ? ' *' : ''}`);
    });
    const fallback = step.cards.find(c => c.id === step.chosen && !c.shut) ?? step.cards.find(c => !c.shut)!;
    for (;;) {
      const answer = (await this.input.ask('> '))?.trim() ?? '';
      const card = answer ? step.cards[Number(answer) - 1] : fallback;
      if (card && !card.shut) { return card; }
      this.say(card?.shut ? `${card.shut}.` : `Choose a number from 1 to ${step.cards.length}.`);
    }
  }
  private async name(step: CreationStep): Promise<string> {
    const drawn = step.names?.[0] ?? step.chosen ?? '';
    this.say(`\n${Typography.plain(step.ask)}${drawn ? ` (Enter for ${drawn})` : ''}`);
    return (await this.input.ask('> '))?.trim() ?? '';
  }
}
