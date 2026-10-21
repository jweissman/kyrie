import { Content, type CreatureGenerationContext } from '../content';
import { Creation } from '../rules/creation';
import type { ModuleDraft } from './module-namespace';
import { Formations } from '../rules/formations';

// The companions chosen at character creation, checked and written into the first module's company.
export class CompanyChoices {
  static apply(draft: ModuleDraft, party: CreatureGenerationContext[]) {
    const player = draft.instance.campaign!.actors.find(a => a.player)!;
    if (party.length !== player.members.length) { throw new Error(`Choose ${player.members.length} companions`); }
    if (new Set(party.map(c => c.name?.trim().toLowerCase())).size !== party.length) {
      throw new Error('Give each companion a distinct name');
    }
    // What the company forms together (Orsino's assignPartyPassives), held by every member.
    const formations = Formations.recognize(party.map(c => ({ raceId: c.raceId, classId: Creation.classId(c.classId ?? '') })));
    party.forEach((context, i) => {
      const entry = draft.instance.campaign!.creatures.find(c => c.id === player.members[i])!;
      if (!context.name?.trim() || context.name.length > 40 || !context.raceId || !context.classId
        || !Content.playableRaces.includes(context.raceId)
        || !Content.playableClasses.includes(Creation.classId(context.classId))) {
        throw new Error('Choose a name, playable ancestry and class for every companion');
      }
      entry.context = { name: context.name.trim(), raceId: context.raceId,
        classId: Creation.classId(context.classId), level: entry.context.level ?? 1,
        ...(context.backgroundId ? { backgroundId: context.backgroundId } : {}),
        ...(context.traits ? { traits: [...context.traits] } : {}),
        ...(formations.length ? { formations } : {}),
        ...(context.spells ? { spells: [...context.spells] } : {}),
        ...(context.weapon ? { weapon: context.weapon } : {}),
        ...(context.armor ? { armor: context.armor } : {}) };
      const entity = draft.instance.module.entities.find(e => e.creatureId === entry.id);
      if (entity) { entity.name = context.name; }
    });
  }
}
