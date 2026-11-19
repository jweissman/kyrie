import { Attest, type Attested, type Projected } from '../../src/presentation/attest';
import { Fold, type Leaf } from '../../src/presentation/fold';
import type { Aspect, Promoted } from '../../src/presentation/glance-types';

// An indicator for a page spec, made as the page makes one: the fold of a leaf the glance witnesses for an act it
// leads with (Attest, Fold), never of a colour. The glance is a fixture with that one act.
export class Attested_ {
  static leaves(aspects: readonly Aspect[], id = 'fixture'): Leaf[] {
    const g = { acts: [{ choice: id, aspects: [...aspects] } as unknown as Promoted] } as Projected;
    return [Fold.leaf({ id }, [Attest.witness(g, id)])];
  }
  static of(aspects: readonly Aspect[], gilded = true, id = 'fixture'): Attested | undefined {
    return Fold.mark(this.leaves(aspects, id), gilded);
  }
  // Perceived only, off along a way (a glance's sensed): faint.
  static faint(aspects: readonly Aspect[]): Attested | undefined {
    const g = { sensed: aspects.map(a => ({ to: 'there', aspect: a, far: 1 })) } as Projected;
    return Fold.mark([Fold.step('sensed:there', [Attest.sensed(g, 'there')])], true);
  }
}
