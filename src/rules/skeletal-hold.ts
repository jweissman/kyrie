import { Canon } from '../canon/canon';

// A skeletal kind made for a company of the first three levels keeps Orsino's defenses until a blunt weapon is on offer
// in the first town (srd-proving-cases.md case 53, the lead's rule of 19 November): one of the third level or lower is
// made under skeletal_held, the template's twin without the SRD skeleton's reduction 5/bludgeoning and proof against
// cold, whether its kind names it (the bone hound), a template makes it (a den's dead, drawn in a barrow or a ruin) or
// a variation does. Above the third it is the SRD's skeleton; an author may hold one by naming skeletal_held.
export class SkeletalHold {
  static readonly through = 3;
  static of<T extends { raceId?: string; template?: string; variations?: string[]; level?: number }>(context: T): T {
    const body = context.raceId && Canon.isBody(context.raceId) ? context.raceId : undefined;
    const level = context.level ?? (body ? Canon.creature(body).statistics?.level : undefined) ?? 1;
    if (level > SkeletalHold.through) { return context; }
    return { ...context, ...body ? { raceId: SkeletalHold.twin(body) } : {},
      ...context.template ? { template: SkeletalHold.twin(context.template) } : {},
      ...context.variations ? { variations: context.variations.map(SkeletalHold.twin) } : {} };
  }
  private static twin(id: string): string {
    return id.split('/').map(p => p === 'skeletal' ? 'skeletal_held' : p).join('/');
  }
}
