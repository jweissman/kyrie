import type { Effect } from '../lang/parse';

// What a success at a save does to what an effect would do: negates it (the default); halves it, for harm only; or,
// marked `lesser`, leaves what it lays for so many rounds, fewer than its own (the SRD's partial: Cause Fear's round
// shaken for whoever saves). The lesser hold is laid by AbilityUse.effectOn, never on whoever is proof against it.
export class SaveOutcome {
  static validate(effect: Effect) {
    const save = effect.save;
    if (save?.success && (!['negate', 'half'].includes(save.success)
      || (save.success === 'half' && effect.kind !== 'damage'))) {
      throw new Error('Half saves require a damage effect');
    }
    if (save?.lesser !== undefined && (effect.kind !== 'apply' || !Number.isSafeInteger(save.lesser)
      || save.lesser < 1 || save.lesser >= effect.duration)) {
      throw new Error('A lesser save shortens an applied status');
    }
  }
}
