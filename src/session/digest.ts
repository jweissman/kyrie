import type { Campaign } from '../campaign/campaign';

// What a game is after a command, in a word: its facts and measures (the world's key, the same in whatever order they
// were written), its hour, and each creature's health, level and experience, which no build's way of keeping them
// changes. Kept with each step of a transcript, so that a replay that comes out otherwise, or a game opened that is
// not what its own record says, is said and not played on (the architecture review's H6: determinism asserted, not
// verified).
export class Digest {
  static of(campaign: Campaign): string {
    const read = campaign.readout;
    let hash = 2166136261;
    for (const c of read.creatures) {
      const part = `${c.id}:${c.state.hp}:${c.base.level}:${c.state.experience};`;
      for (let i = 0; i < part.length; i++) { hash = Math.imul(hash ^ part.charCodeAt(i), 16777619); }
    }
    return `${campaign.world.key()}.${read.elapsed}.${(hash >>> 0).toString(36)}`;
  }
}
