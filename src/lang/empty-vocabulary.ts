import type { KindMade, KindsMade, LocalKindSpec, LocalSpeciesSpec, SpeciesMade, Vocabulary } from './vocabulary';

export class EmptyVocabulary implements Vocabulary {
  readonly id = 'none';
  fork(): Vocabulary { return new EmptyVocabulary(); }
  fingerprint(): string { return ''; }
  kind(): undefined { return undefined; }
  item(_module: string, spec: LocalKindSpec): KindMade {
    throw new Error(`Kind ${spec.id}: no vocabulary context was supplied`);
  }
  species(_module: string, spec: LocalSpeciesSpec): SpeciesMade {
    throw new Error(`Species ${spec.id}: no vocabulary context was supplied`);
  }
  install(catalog: KindsMade | undefined): void {
    if (catalog) { throw new Error('Cannot install local kinds without a vocabulary context'); }
  }
  signature(): undefined { return undefined; }
  ability(): undefined { return undefined; }
}
