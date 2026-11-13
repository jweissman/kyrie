import { Creation } from './creation';
import { CreationFlow, type CreationStep, type CreationStepId } from './creation-flow';
import type { Starting } from './engine-starts';
import type { Member, Setting } from './protocol';

// Where making a life stands, as the engine holds it for any client: every step as it now is (its question, its
// cards, the four it leads with first, which is chosen), whom the choices have made so far, why they came, and the
// country it is made for. A client shows it and sends back what was chosen; what a choice settles, what follows
// from it and what the next step is are the engine's (see CreationFlow).
export interface CreationState { steps: CreationStep[]; member: Member; origin?: string; country: string }
// The making of a life held by the engine (the owner, 14 November: Kyrie the source of truth for the structure and
// progression of player workflows; the terminal and the page consume the same decisions rather than each making
// them). Begun when a country is drawn for it; asked where it stands; given each choice; and, set out on, the start
// it asks for is the one the page's Begin asks (see EngineHost).
export class EngineCreation {
  private flow?: CreationFlow;
  private at?: { campaign: string; seed: string; terrain?: string };
  // The country a life is now made for: the flow begins again on it.
  begun(setting: Setting, at: { campaign: string; seed: string; terrain?: string }): Setting {
    this.flow = new CreationFlow(setting, Creation.catalog());
    this.at = at;
    return setting;
  }
  state(): CreationState {
    const flow = this.made();
    return { steps: flow.steps(), member: structuredClone(flow.member), ...flow.origin ? { origin: flow.origin } : {},
      country: this.at!.seed };
  }
  choose(step: CreationStepId, value: string): CreationState {
    this.made().choose(step, value);
    return this.state();
  }
  // What setting out begins: the country, and the life made, as it stands.
  starting(): Starting {
    const flow = this.made(), at = this.at!;
    return { campaign: at.campaign, seed: at.seed, party: [structuredClone(flow.member)],
      ...at.terrain ? { terrain: at.terrain } : {}, ...flow.origin ? { origin: flow.origin } : {} };
  }
  private made(): CreationFlow {
    if (!this.flow) { throw new Error('No country has been drawn to make a life for: ask for a world first.'); }
    return this.flow;
  }
}
