import type { Fighter } from './model';
import type { BodyStatistics } from './item-catalog';

export class FighterBody {
  static of(fighter: Pick<Fighter, 'equipment'>): BodyStatistics | null {
    const body = fighter.equipment?.body;
    if (body === undefined) {
      throw new Error('A fighter requires its catalog body projection (null for no body)');
    }
    return body;
  }
}
