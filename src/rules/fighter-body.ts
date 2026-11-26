import type { Fighter } from '../model';
import type { SpeciesBodies } from './creation';

export class FighterBody {
  static of(fighter: { raceId: string; body?: Fighter['body'] },
    bodies?: SpeciesBodies): NonNullable<Fighter['body']> | undefined {
    if ('body' in fighter) { return fighter.body ?? undefined; }
    if (!bodies) { throw new Error('A fighter without a body snapshot needs a species catalog'); }
    return bodies.isBody(fighter.raceId) ? bodies.creature(fighter.raceId) : undefined;
  }
}
