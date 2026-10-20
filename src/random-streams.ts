export class RandomStreams {
  static key(seed: string, domain: string, ...identity: (string | number)[]): string {
    return JSON.stringify([seed, domain, ...identity]);
  }
}
