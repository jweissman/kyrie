import type { Campaign } from '../campaign/campaign';
import type { ItemCatalog } from '../item-catalog';
import type { World } from '../lang/index';
import { Installed } from './installed';

export interface Face { id: string; src: string; medium: string; at?: [number, number] }
export interface Portrait { src: string; large: string; focus: number; credit?: string }
export interface EmblemSet { about?: string; paths: Record<string, string>; text?: Record<string, string> }
export interface EmblemTable { sets: Record<string, EmblemSet> }
export interface PaintingLook { shows?: string; light?: string; season?: string; weather?: string }
export interface PaintingFitTable { rules: unknown[]; paintings: Record<string, PaintingLook> }
export interface LikenessResources {
  readonly ids: ReadonlySet<string>;
  src(id: string): string;
  portrait(id: string): Portrait | undefined;
}
export interface CompanyPortraitResources {
  said(world: World, ref: string): string | undefined;
  member(member: { id: string; name: string; raceId: string; classId?: string; backgroundId?: string },
    said: { pronoun?: string; likeness?: string }, taken?: Set<string>): Face | undefined;
}
export interface CreaturePortraitResources {
  face(catalog: ItemCatalog, raceId: string): Face | undefined;
  of(catalog: ItemCatalog, raceId: string): Portrait | undefined;
}
export interface SittingResources {
  painted(campaign: Campaign, id: string): boolean;
  of(campaign: Campaign, id: string): string | undefined;
}
export interface ItemPlateResources {
  of(world: World, item: string, catalog: ItemCatalog): Portrait | undefined;
  kind(kind: string, catalog: ItemCatalog): Portrait | undefined;
}
export interface PresentationDomain {
  voiceIds: readonly string[];
  voice<T>(id: string): T | undefined;
  emblems: EmblemTable;
  paintingFit: PaintingFitTable;
  likeness: LikenessResources;
  companyPortraits: CompanyPortraitResources;
  creaturePortraits: CreaturePortraitResources;
  sittings: SittingResources;
  itemPlates: ItemPlateResources;
}

// Presentation resources belong to the installed setting. Readers keep plain behaviour when none has been installed:
// no lines, no emblems or paintings, and no fit rule that refuses a painting.
export class PresentationResources {
  private static readonly ids = new Set<string>();
  private static noVoice<T>(): T | undefined { return undefined; }
  private static noSrc(id: string): string { return `paintings/${id}.webp`; }
  private static noPortrait(): Portrait | undefined { return undefined; }
  private static noSaid(): string | undefined { return undefined; }
  private static noMember(): Face | undefined { return undefined; }
  private static noFace(): Face | undefined { return undefined; }
  private static noCreature(): Portrait | undefined { return undefined; }
  private static unpainted(): boolean { return false; }
  private static noSitting(): string | undefined { return undefined; }
  private static noItem(): Portrait | undefined { return undefined; }
  private static noKind(): Portrait | undefined { return undefined; }
  private static current(): PresentationDomain { return Installed.optional('presentation') ?? absent; }
  static provide(parts: Partial<PresentationDomain>): void {
    Installed.provide('presentation', { ...absent, ...this.current(), ...parts });
  }
  static domain(): PresentationDomain { return this.current(); }
  static voice<T>(id: string): T | undefined { return this.current().voice(id); }
  static readonly emblems = (): EmblemTable => this.current().emblems;
  static readonly paintingFit = (): PaintingFitTable => this.current().paintingFit;
  static readonly likeness = (): LikenessResources => this.current().likeness;
  static readonly companyPortraits = (): CompanyPortraitResources => this.current().companyPortraits;
  static readonly creaturePortraits = (): CreaturePortraitResources => this.current().creaturePortraits;
  static readonly sittings = (): SittingResources => this.current().sittings;
  static readonly itemPlates = (): ItemPlateResources => this.current().itemPlates;
  static defaults(): PresentationDomain {
    return {
      voiceIds: [],
      voice: this.noVoice,
      emblems: { sets: {} },
      paintingFit: { rules: [], paintings: {} },
      likeness: { ids: this.ids, src: this.noSrc, portrait: this.noPortrait },
      companyPortraits: { said: this.noSaid, member: this.noMember },
      creaturePortraits: { face: this.noFace, of: this.noCreature },
      sittings: { painted: this.unpainted, of: this.noSitting },
      itemPlates: { of: this.noItem, kind: this.noKind },
    };
  }
}
const absent = PresentationResources.defaults();
