// The fourth cold play's lines (doc/architecture/mission-22/cold/cold-4-lines.txt), the warrior's golden route, with
// what the world now asks of the play played after the line that meets it, as the cold player would have played it
// (the line's number, from one, and the acts after it):
// - the journey the play took to Holyking in one act (line 27) walked past two footpads standing in the road at the
//   fen of Addermoss. It stops for them now (the lead's ruling, 25 November: a journey stops for a threat that blocks
//   the way; walking through it was a lie). The company asks them to let it by, as the engine leads, gets nowhere,
//   and fights them to the end; by then night has come, and the road to Holyking stops for it, so the company waits
//   for first light and goes on by the play's own next line (28), arriving at Holyking as the play did.
// - the ghouls' fight in the bone hall rolls otherwise after that fight and that night, and is still going after the
//   play's last blow (line 54): it is pressed on to its end, as the play pressed it.
// - the robbers' tunnel out of the ossuary is hidden now until the robbers' captain tells of it or the ossuary is
//   searched (OR-1443): the company searches the ossuary once its fight is over (line 82), and takes the tunnel by the
//   play's own next line (83), as it did.
import { readFileSync } from 'node:fs';

const act = (id: string) => JSON.stringify({ act: id });
export class ColdFour {
  static readonly path = 'doc/architecture/mission-22/cold/cold-4-lines.txt';
  static readonly after: Readonly<Record<number, readonly string[]>> = {
    27: [act('region__wr173r/0:Ask two footpads to let you by · an even chance · one try'), act('fight:through'),
      act('travel:region__w8'), act('company/0:Wait until first light')],
    54: [act('fight:through')],
    82: [act('search(region__w8_halls_ossuary)')],
  };
  static lines(): string[] { return readFileSync(this.path, 'utf8').split('\n').filter(Boolean); }
  // The play's first n lines, each followed by what the world now asks after it.
  static played(n: number): string[] {
    return this.lines().slice(0, n).flatMap((line, i) => [line, ...this.after[i + 1] ?? []]);
  }
}
