import type { Journey } from '../../src/session/journey';

// What is told of a land beyond, asked as the engine offers it (the owner's ruling, 20 November: CL-67's fold kept):
// by the land's own words where the company has reason to ask of it and the row says so, else by the one question for
// news, which tells the next not yet heard, until the land is told. Never a hidden ask of its own.
export class News {
  static readonly question = 'what news there is of the lands beyond';
  static async of(j: Journey, land: string, told: RegExp, most = 40): Promise<string> {
    for (let i = 0; i < most; i++) {
      const said = await j.step(`?${land}`) || await j.step(News.question);
      if (told.test(said)) { return said; }
    }
    throw new Error(`${land} not told in ${most} asks for news`);
  }
}
