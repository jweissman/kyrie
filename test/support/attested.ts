import { Attest, type Attested, type Projected } from '../../src/presentation/attest';
import type { Aspect, Promoted } from '../../src/presentation/glance-types';

// An indicator for a page spec, made as the page makes one: of the witness a glance gives for an act it leads with
// (Attest), never of a colour. The glance is a fixture with that one act.
export class Attested_ {
  static of(aspects: readonly Aspect[], gilded = true, id = 'fixture'): Attested | undefined {
    const g = { acts: [{ choice: id, aspects: [...aspects] } as unknown as Promoted] } as Projected;
    return Attest.of([Attest.witness(g, id)], gilded);
  }
  // Perceived only, off along a way (a glance's sensed): faint.
  static faint(aspects: readonly Aspect[]): Attested | undefined {
    const g = { sensed: aspects.map(a => ({ to: 'there', aspect: a, far: 1 })) } as Projected;
    return Attest.of([Attest.sensed(g, 'there')], true);
  }
}
