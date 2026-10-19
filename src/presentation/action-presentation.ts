import { ActionSchemas } from '../campaign/action-schemas';
import type { Operator, ExitDefinition } from '../lang/module';

export interface PublicChoice {
  interaction?: 'inventory' | 'training' | 'spell' | 'door' | 'search';
  id: string; name: string; time: number; encounter: boolean;
  description?: string; speaker?: string; category?: string; targets?: string[]; movement?: ExitDefinition;
}
// Author label templates name the parameters a player may see; the rest stay implied by the situation.
export class ActionPresentation {
  static present(action: Operator, schemas: Operator[]): PublicChoice {
    const schema = schemas.find(s => s.id === action.schema);
    const encounter = action.resolve?.name === 'combat', time = action.time;
    const kind = action.schema ?? action.id;
    const category = ['pay', 'give_food'].includes(kind) ? 'gift' : action.speaker || ['tell', 'ask'].includes(kind) ? 'conversation' :
      action.movement || ['travel', 'walk', 'cross', 'passage', 'climb', 'risk_passage',
        'cleared_passage', 'escort'].includes(kind) ? 'travel' :
        ['rest', 'field_spell', 'eat'].includes(kind) ? 'care' : ['learn_reward', 'take_item', 'buy_item'].includes(kind) ? 'reward' :
          encounter ? 'combat' : kind === 'wait' ? 'wait' : kind === 'examine' ? 'investigate' : 'interact';
    const detail = { ...(this.interaction(action) ? { interaction: this.interaction(action) } : {}),
      targets: [...new Set([...(Object.entries(action.bindings ?? {}).filter(([key]) => key !== 'actor'
        && schema?.parameters?.find(p => p.name === key)?.type !== 'fact')
        .map(([, value]) => value)),
      ...(action.movement ? [action.movement.destination,
        ...(action.movement.door ? [action.movement.door] : [])] : []),
      ...(action.searchPlace ? [action.searchPlace] : [])])],
      ...(action.movement ? { movement: action.movement } : {}),
      ...(action.description ? { description: action.description } : {}), category,
      ...(action.speaker ? { speaker: action.speaker } : {}) };
    if (!schema || !action.bindings) { return { id: action.id, name: action.name, time, encounter, ...detail }; }
    const shown = ActionSchemas.placeholders(schema.name).filter(name => schema.parameters?.some(p => p.name === name));
    const implicit = !!action.speaker || (schema.parameters ?? []).every(p => p.name === 'actor');
    if (!shown.length && !implicit) { return { id: action.id, name: action.name, time, encounter, ...detail }; }
    const id = shown.length ? `${schema.id}(${shown.map(name => action.bindings![name]).join(',')})` : schema.id;
    return { id, name: action.name, time, encounter, ...detail };
  }
  private static interaction(action: Operator): PublicChoice['interaction'] {
    if (['acquire', 'purchase', 'equip', 'consume', 'transfer_item', 'drop'].includes(action.resolve?.name ?? '')) {
      return 'inventory';
    }
    if (action.resolve?.name === 'train') { return 'training'; }
    if (action.resolve?.name === 'invoke') { return 'spell'; }
    if (['open_door', 'close_door', 'unlock_door', 'pick_door'].includes(action.schema ?? action.id)) { return 'door'; }
    if (action.searchPlace) { return 'search'; }
    return undefined;
  }
  static choices(available: Operator[], schemas: Operator[]): { choice: PublicChoice; action: Operator }[] {
    const choices = available.map(action => ({ choice: this.present(action, schemas), action }));
    if (new Set(choices.map(c => c.choice.id)).size !== choices.length) {
      throw new Error('Ambiguous public command: an action label hides a parameter that distinguishes choices');
    }
    return choices;
  }
}
