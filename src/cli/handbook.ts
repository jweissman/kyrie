// Builds the Player's Handbook, Dungeon Master's Guide and Monster Manual from the game's definitions:
// Markdown and coverage.json into doc/handbook, and (with --html <dir>) the site pages (bin/kyrie handbook).
import { resolve } from 'node:path';
import { Handbooks } from '../handbook/handbooks';
import { HandbookPublisher } from '../handbook/publish';

export class HandbookTool {
  static readonly root = resolve(import.meta.dir, '../..');
  static async main(args: string[]): Promise<number> {
    const handbooks = new Handbooks(this.root);
    await HandbookPublisher.markdown(handbooks, resolve(this.root, 'doc/handbook'));
    const at = args.indexOf('--html');
    if (at >= 0) { await HandbookPublisher.html(handbooks, resolve(args[at + 1] ?? 'site/handbook')); }
    const coverage = handbooks.coverage();
    console.log(`${coverage.entries.length} entries; ${coverage.problems.length} problems`);
    return 0;
  }
}
