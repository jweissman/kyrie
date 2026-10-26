import type { Campaign } from '../campaign/campaign';
import type { Operator } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { World } from '../lang/world';
import { Discovery } from './discovery';
import { PlayerView } from '../presentation/player-view';
import { ObservationText } from '../lang/observation-text';

export interface InformationChoice { id: string; name: string; time: number }
export interface InformationSnapshot {
  actor: string; elapsed: number; location?: { id: string; name: string };
  people: { id: string; name: string }[];
  sources: { id: string; name: string; intact: boolean }[];
  knowledge: { id: string; text: string }[];
  assumptions: { id: string; text: string; value: false }[];
  choices: InformationChoice[];
}
export class InformationView {
  static supported(campaign: Campaign): boolean { return Discovery.supported(campaign.module); }
  private static test(world: World, name: string, ...args: string[]): boolean {
    return world.test(ModuleWriter.call(name, ...args));
  }
  // The choices as the page offers them: what the company sees, named as it would name them.
  private static choices(campaign: Campaign): { public: InformationChoice; action: Operator }[] {
    return PlayerView.choices(campaign)
      .map(({ choice, action }) => ({ public: { id: choice.id, name: choice.name, time: choice.time }, action }));
  }
  static observe(campaign: Campaign): InformationSnapshot {
    if (!this.supported(campaign) || !campaign.playerActor) { throw new Error('No discovery view for this campaign'); }
    const world = campaign.world, actor = campaign.playerActor;
    const entities = campaign.module.entities;
    const location = entities.find(e => e.type === 'place' && this.test(world, 'at', actor, e.id));
    const perceiving = this.test(world, 'able', actor);
    const local = entities.filter(e => perceiving && location && this.test(world, 'at', e.id, location.id));
    const choices = this.choices(campaign).map(choice => choice.public);
    // Places and people as the company would name them (the architecture review's A13).
    return { actor, elapsed: campaign.state.elapsed,
      ...(location ? { location: { id: location.id, name: ObservationText.label(world, location.id) } } : {}),
      people: local.filter(e => e.type === 'group').map(e => ({ id: e.id, name: ObservationText.label(world, e.id) })),
      sources: local.filter(e => e.type === 'source' && this.test(world, 'noticeable', e.id))
        .map(e => ({ id: e.id, name: e.name, intact: this.test(world, 'intact', e.id) })),
      knowledge: entities.filter(e => e.type === 'fact' && this.test(world, 'knows', actor, e.id))
        .map(e => ({ id: e.id, text: e.name })),
      assumptions: entities.filter(e => e.type === 'fact' && this.test(world, 'assumesFalse', actor, e.id))
        .map(e => ({ id: e.id, text: e.name, value: false })), choices };
  }
  static resolve(campaign: Campaign, command: string): string {
    const matches = this.choices(campaign).filter(choice => choice.public.id === command);
    if (matches.length !== 1) { throw new Error('Unavailable information command'); }
    return matches[0]!.action.id;
  }
  static execute(campaign: Campaign, command: string): InformationSnapshot {
    campaign.execute(this.resolve(campaign, command));
    return this.observe(campaign);
  }
}
