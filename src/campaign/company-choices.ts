import { Content, type CreatureGenerationContext } from '../content';
import { Callings } from '../ports/callings';
import { Traits } from '../ports/traits';
import { SettingPort } from '../setting-port';
import { PresentationResources } from '../ports/presentation-resources';
import { Creation } from '../rules/creation';
import type { ModuleDraft } from './module-namespace';
import { Formations } from '../rules/formations';
import { Canon } from '../canon/canon';
import { CreatureSchema } from '../creature';
import { ModuleWriter } from '../lang/module-writer';

interface ItemCatalogReader {
  has(id: string): boolean;
  itemId(id: string): string;
}

// The companions chosen at character creation, checked and written into the first module's company.
export class CompanyChoices {
  // Three dice: from 3 to 18.
  private static die(v?: number): boolean { return Number.isInteger(v) && v! >= 3 && v! <= 18; }
  // What of a companion cannot be played, said by name with what can (the Grand Tour's friction D1 and D2: refused,
  // an author learned neither which ancestry nor which could be). A campaign of a setting of its own (no canon) may
  // make its company of any of the catalog's callings, one of no adventuring calling among them: a plot-holder at an
  // allotment society's meeting is a commoner, not a warrior (BX-01's L1, its first half).
  static refused(c: CreatureGenerationContext, own = false): string | undefined {
    const callings = own ? Object.keys(Callings.table()) : Content.playableClasses;
    return this.one(c, 'ancestry', c.raceId!, Content.playableRaces)
      ?? this.one(c, 'calling', Creation.classId(c.classId!), callings)
      ?? (c.backgroundId ? this.one(c, 'background', c.backgroundId, Object.keys(Canon.backgrounds)) : undefined);
  }
  private static one(c: CreatureGenerationContext, what: string, id: string, ids: string[]): string | undefined {
    return ids.includes(id) ? undefined : `${c.name}: ${id} is no playable ${what}; ${this.near(id, ids).join(', ')}?`;
  }
  // The ids nearest one not known: those sharing its start first, then the fewest letters apart; all, if there are few.
  static near(id: string, ids: string[]): string[] {
    if (ids.length <= 8) { return ids; }
    return [...ids].sort((a, b) => this.score(id, a) - this.score(id, b)).slice(0, 3);
  }
  private static score(id: string, x: string): number {
    return (x.startsWith(id.slice(0, 3)) ? 0 : 100) + [...id].filter((ch, i) => x[i] !== ch).length
      + Math.abs(id.length - x.length);
  }
  static apply(draft: ModuleDraft, party: CreatureGenerationContext[], own: boolean, catalog: ItemCatalogReader) {
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
      if (!context.name?.trim() || context.name.length > 40 || !context.raceId || !context.classId) {
        throw new Error('Choose a name, playable ancestry and class for every companion');
      }
      const refused = CompanyChoices.refused(context, own);
      if (refused) { throw new Error(refused); }
      // An experienced company (a preset of old hands) may begin above first level, and with gear from the catalog.
      const level = context.level;
      if (level !== undefined && (!Number.isInteger(level) || level < 1 || level > 20)) {
        throw new Error('A companion begins at a level from 1 to 20');
      }
      if ((context.gear ?? []).some(g => !catalog.has(catalog.itemId(g)))) {
        throw new Error('Unknown starting gear');
      }
      // A likeness chosen at creation is a painting of the collection's (see PresentationResources).
      if (context.likeness && !PresentationResources.likeness().ids.has(context.likeness)) {
        throw new Error('Unknown likeness');
      }
      // So is a sign one of Imbar's sky's (OR-13: chosen at creation, it had reached no creature).
      if (context.sign && !SettingPort.sky.signs.some(x => x.id === context.sign)) { throw new Error('Unknown sign'); }
      if (context.perk && Traits.of(context.perk)?.category !== 'perk') { throw new Error('Unknown perk'); }
      // Rolls placed at creation are six, one to each quality, each three dice.
      const rolled = context.rolled;
      if (rolled && (Object.keys(rolled).length !== 6
        || !CreatureSchema.attributes.every(q => CompanyChoices.die(rolled[q])))) {
        throw new Error('Place one roll of three dice on each of the six qualities');
      }
      entry.context = { name: context.name.trim(), raceId: context.raceId,
        classId: Creation.classId(context.classId), level: context.level ?? entry.context.level ?? 1,
        ...(context.gear?.length ? { gear: [...context.gear] } : {}),
        ...(context.outfit ? { outfit: context.outfit } : {}),
        ...(context.backgroundId ? { backgroundId: context.backgroundId } : {}),
        ...(context.traits ? { traits: [...context.traits] } : {}),
        ...(formations.length ? { formations } : {}),
        ...(context.spells ? { spells: [...context.spells] } : {}),
        ...(context.weapon ? { weapon: context.weapon } : {}),
        ...(context.armor ? { armor: context.armor } : {}),
        ...(context.rolled ? { rolled: { ...context.rolled } } : {}),
        ...(context.likeness ? { likeness: context.likeness } : {}),
        ...(context.sign ? { sign: context.sign } : {}),
        // The perk chosen at creation (CreationPerks), a trait borne (Content.borne): it had been left out here, so no
        // perk chosen was ever held in play (OR-1882).
        ...(context.perk ? { perk: context.perk } : {}),
        ...(context.pronouns ? { pronouns: context.pronouns } : {}) };
      const entity = draft.instance.module.entities.find(e => e.creatureId === entry.id);
      if (entity) { entity.name = context.name; }
    });
    CompanyChoices.pronounce(draft, party, player.id);
  }
  // How the one who comes alone presents, as chosen at creation, is said of the company: "You" of one is them, and is
  // spoken of in their words (VoiceContext reads a group's pronouns, and their portrait its member's group's: see
  // CompanyPortraits.said). A company of more is spoken of as many, each of them in what their own group is said in.
  private static pronounce(draft: ModuleDraft, party: CreatureGenerationContext[], company: string) {
    if (party.some(c => c.pronouns && !['she', 'he', 'they'].includes(c.pronouns))) {
      throw new Error('A companion is spoken of as she, he or they');
    }
    const said = party.length === 1 ? party[0]!.pronouns : undefined, module = draft.instance.module;
    if (!said) { return; }
    module.initial = module.initial.filter(c => !(c.call.name === 'pronouns' && c.call.args[0] === company));
    module.initial.push({ kind: 'assert', call: ModuleWriter.call('pronouns', company, `pron_${said}`) });
  }
}
