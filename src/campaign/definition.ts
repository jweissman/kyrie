import type { CreatureGenerationContext } from '../content';
import type { BoundRole } from './role-requirements';
import type { Operator, Predicate } from '../lang/module';

export interface CampaignGoal {
  id: string; when: Predicate; target: Predicate; priority: number; urgent?: { when: Predicate; priority: number };
}
export interface CampaignActor {
  id: string; members: string[]; player?: boolean; allActions?: boolean;
  actions: string[]; horizon: number; goals: CampaignGoal[];
}
export interface InstalledModule {
  id: string; name: string; description?: string; seed: string; installedAt: number; deadline?: number;
  goal: Predicate; actors: string[]; pressures: string[]; roles?: BoundRole[];
  outcomes: { id: string; predicate: Predicate }[]; exports: Record<string, string>;
}
export interface CampaignDefinition {
  schemas?: Operator[];
  installations?: InstalledModule[];
  actors: CampaignActor[];
  creatures: { id: string; context: CreatureGenerationContext; gold: number; seed?: string;
    provenance?: Record<string, 'authored' | 'generated' | 'default'> }[];
  conflicts?: string[];
  outcomes: { id: string; predicate: Predicate }[];
  pressures: { id: string; at: number; measure: { kind: 'call'; name: string; args: string[] }; required: number }[];
}
