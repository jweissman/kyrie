import type { Module } from '../lang/index';
import type { CampaignDefinition } from './definition';

type Written = { definition?: CampaignDefinition; schemas?: 'actions' };
// The campaign's action schemas, written once in a save (MT-27): they are the module's actions, the very records (a
// campaign is assembled with the one list for both, and a fork copies each list but not its records), and a save had
// written them twice, a sixth of it (2.2 MB of a 12.9 MB checkpoint on iscoed). Where they are the actions a save
// says so (schemas: 'actions') and keeps the definition without them; opened, the definition takes the module's
// actions again. Where they are not (a game kept by an earlier build, opened), they are written as they are.
// The definition written is kept for the definition it was written from, so that each save of one campaign gives the
// same one (the page keeps the world it is played in once, by the module and definition: KeptGame.still).
export class SavedSchemas {
  private static readonly written = new WeakMap<CampaignDefinition, { actions: readonly unknown[]; as: Written }>();
  static of(definition: CampaignDefinition | undefined, module: Module): Written {
    if (!definition) { return {}; }
    const kept = this.written.get(definition);
    if (kept && kept.actions === module.actions) { return kept.as; }
    const schemas = definition.schemas, actions = module.actions;
    const shared = !!schemas && schemas.length === actions.length && schemas.every((s, i) => s === actions[i]);
    const as: Written = shared ? { definition: this.without(definition), schemas: 'actions' } : { definition };
    this.written.set(definition, { actions, as });
    return as;
  }
  // The definition of a save, its schemas the module's actions again where it says they are.
  static read(save: Written & { module: Module }): CampaignDefinition | undefined {
    return save.schemas === 'actions' && save.definition ? { ...save.definition, schemas: [...save.module.actions] }
      : save.definition;
  }
  private static without(definition: CampaignDefinition): CampaignDefinition {
    const rest = { ...definition };
    delete rest.schemas;
    return rest;
  }
}
