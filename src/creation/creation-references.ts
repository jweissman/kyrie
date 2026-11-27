import type { CreationEntry } from './creation-flow';

export interface CreationReferences {
  reference(id: string): CreationEntry | undefined;
  kind(id: string): Pick<CreationEntry, 'facts' | 'rules'>;
  ability(id: string): string;
  trait(id: string): string[];
}
