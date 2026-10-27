import { Content, type CreatureGenerationContext } from '../content';
import { Likeness } from '../paintings/likeness';
import { Creation } from '../rules/creation';
import type { ModuleDraft } from './module-namespace';
import { Formations } from '../rules/formations';
import { Canon } from '../canon/canon';
import { CreatureSchema } from '../creature';

// The companions chosen at character creation, checked and written into the first module's company.
export class CompanyChoices {
  // Three dice: from 3 to 18.
  private static die(v?: number): boolean { return Number.isInteger(v) && v! >= 3 && v! <= 18; }
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
      // A name is written into the world's text as a name: braces, quotes and backslashes cannot be (the review's A12).
      if (/[{}"\\]/.test(context.name ?? '')) {
        throw new Error(`A name may not have braces, quotes or a backslash in it: ${context.name}`);
      }
      if (!context.name?.trim() || context.name.length > 40 || !context.raceId || !context.classId
        || !Content.playableRaces.includes(context.raceId)
        || !Content.playableClasses.includes(Creation.classId(context.classId))) {
        throw new Error('Choose a name, playable ancestry and class for every companion');
      }
      // An experienced company (a preset of old hands) may begin above first level, and with gear from the catalog.
      const level = context.level;
      if (level !== undefined && (!Number.isInteger(level) || level < 1 || level > 20)) {
        throw new Error('A companion begins at a level from 1 to 20');
      }
      if ((context.gear ?? []).some(g => !Canon.items[Canon.resolve('items', g)])) {
        throw new Error('Unknown starting gear');
      }
      // A likeness chosen at creation is a painting of the collection's (see Likeness).
      if (context.likeness && !Likeness.ids.has(context.likeness)) { throw new Error('Unknown likeness'); }
      // Rolls placed at creation are six, one to each quality, each three dice.
      const rolled = context.rolled;
      if (rolled && (Object.keys(rolled).length !== 6
        || !CreatureSchema.attributes.every(q => CompanyChoices.die(rolled[q])))) {
        throw new Error('Place one roll of three dice on each of the six qualities');
      }
      entry.context = { name: context.name.trim(), raceId: context.raceId,
        classId: Creation.classId(context.classId), level: context.level ?? entry.context.level ?? 1,
        ...(context.gear?.length ? { gear: [...context.gear] } : {}),
        ...(context.backgroundId ? { backgroundId: context.backgroundId } : {}),
        ...(context.traits ? { traits: [...context.traits] } : {}),
        ...(formations.length ? { formations } : {}),
        ...(context.spells ? { spells: [...context.spells] } : {}),
        ...(context.weapon ? { weapon: context.weapon } : {}),
        ...(context.armor ? { armor: context.armor } : {}),
        ...(context.rolled ? { rolled: { ...context.rolled } } : {}),
        ...(context.likeness ? { likeness: context.likeness } : {}) };
      const entity = draft.instance.module.entities.find(e => e.creatureId === entry.id);
      if (entity) { entity.name = context.name; }
    });
  }
}
