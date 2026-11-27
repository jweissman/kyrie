import { HandbookCreationReferences } from '../../src/client/creation-references';
import { Creation } from './creation';
import { CreationDefaults } from '../../src/creation/creation-defaults';
import { CreationRules } from '../../src/creation/creation-rules';
import { CreationFlow, type CreationChoice, type CreationStep, type CreationStepId } from '../../src/creation/creation-flow';
import type { Starting } from './engine-starts';
import type { Catalog, Member, Setting } from '../../src/creation/protocol';

// Where making a life stands, as the engine holds it for any client: every step as it now is (its question, its
// cards, the four it leads with first, which is chosen), whom the choices have made so far, why they came, and the
// country it is made for. A client shows it and sends back what was chosen; what a choice settles, what follows
// from it and what the next step is are the engine's (see CreationFlow).
// life: the life as made so far, in a few sentences (CreationFlow.life), as setting out tells it.
// at: the step asked now, or setting out ('go'); on: the step a card chosen there goes on to; back: the one before it,
// where there is one (so that a client shows a press at once, before the engine's answer: see ReaderOpening.pressed).
type At = CreationStepId | 'go';
export interface CreationState {
  steps: CreationStep[]; member: Member; origin?: string; country: string; at: At; on: At; back?: At; life: string[];
}
// The making of a life held by the engine (the owner, 14 November: Kyrie the source of truth for the structure and
// progression of player workflows; the terminal and the page consume the same decisions rather than each making
// them). Begun when a country is drawn for it; asked where it stands; given each choice; and, set out on, the start
// it asks for is the one the page's Begin asks (see EngineHost).
export class EngineCreation {
  private flow?: CreationFlow;
  private readonly references = new HandbookCreationReferences();
  // The choices a life is made from, read once (80 ms each time: Set out now's click had waited on it, OR-120); the
  // flow only reads it.
  private static catalog?: Catalog;
  private at?: { campaign: string; seed: string; terrain?: string };
  // The country a life is now made for: the flow begins again on it.
  begun(setting: Setting, at: { campaign: string; seed: string; terrain?: string }): Setting {
    this.flow = new CreationFlow(setting, EngineCreation.catalog ??= Creation.catalog(), this.references);
    // The first reason for having come is chosen to begin with, as the page's own making had it: set out at once, a
    // life comes by its country's first origin, not by none (a drawn country had begun in its town square, unarrived).
    if (setting.origins?.[0]) { this.flow.origin = setting.origins[0].id; }
    this.at = at;
    return setting;
  }
  state(): CreationState {
    const flow = this.made();
    return { steps: flow.steps(), member: structuredClone(flow.member), ...flow.origin ? { origin: flow.origin } : {},
      country: this.at!.seed, at: flow.current(), on: flow.beside(1)!, life: flow.life(),
      ...flow.beside(-1) ? { back: flow.beside(-1) } : {} };
  }
  choose(step: CreationChoice, value: string): CreationState {
    this.made().choose(step, value);
    return this.state();
  }
  // What setting out begins: the country, and the life made, as it stands and as the name page shows it: named (a
  // name left empty is the first drawn), and with the weapon in hand, theirs or the one they strike best with. The
  // engine's set-out had carried no weapon, so a warrior shown "A battleaxe in hand" set out with the calling's
  // longsword, and no start made ready for the page's choices was ever the one set out on (OR-08).
  starting(): Starting {
    const flow = this.made(), at = this.at!, member = structuredClone(flow.member), catalog = flow.catalog;
    // Where the life begins, as the world gives it (see CreationFlow.circumstance).
    flow.origin = flow.circumstance();
    const calling = catalog.callings.find(c => c.id === member.classId);
    const weapon = !member.weapon && calling ? CreationRules.best(calling.weapons, member, catalog)?.id : undefined;
    return { campaign: at.campaign, seed: at.seed,
      party: [{ ...member, name: CreationDefaults.named(member, flow.setting), ...weapon ? { weapon } : {} }],
      ...at.terrain ? { terrain: at.terrain } : {}, ...flow.origin ? { origin: flow.origin } : {} };
  }
  // The life drawn whole from the flow's own defaults, to set out with at once (see CreationFlow.rolled).
  rolled(): Starting { this.made().rolled(); return this.starting(); }
  private made(): CreationFlow {
    if (!this.flow) { throw new Error('No country has been drawn to make a life for: ask for a world first.'); }
    return this.flow;
  }
}
