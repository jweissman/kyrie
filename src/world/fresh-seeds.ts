import { WorldGrid } from './world-grid';
import { ReferenceSettlement } from './reference-settlement';
import { StrategicAtlas } from './strategic-atlas';

// The seed a new life's world is drawn from, where none is named (the owner's playtest, 25 November: "it takes way too
// long to start up a new world; and once you do it's all very sweaty and unclear how to get to the dungeon"): drawn
// at random as ever (the draw given: FirstChoice.seed, as the player draws one), and drawn again until its first
// country is of a terrain the reference game's settlement is written for (ReferenceSettlement.terrains), so that every
// new life begins in the reference game, the old woods and the way down beside its first town. A seed named (a kept
// world, a gate world, a spec's) is never changed: this is only what an unnamed new life rolls, and the seed alone
// still draws its world. The first country's terrain is the cheap part of its drawing (WorldGrid.land: its Deem record,
// no land laid), a few draws in all, since a forest is the first country's most common terrain (16 of 40).
export class FreshSeeds {
  static readonly tries = 64;
  static seed(draw: () => string): string {
    let seed = draw();
    for (let i = 1; i < this.tries && !this.referenced(seed); i++) { seed = draw(); }
    return seed;
  }
  // Whether a world's first country is of a terrain the reference game is written for.
  static referenced(seed: string): boolean {
    return !StrategicAtlas.keepsFirstTown(seed)
      && ReferenceSettlement.terrains.has(WorldGrid.land(seed, [0, 0]).terrain);
  }
}
