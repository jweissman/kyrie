import { readFileSync } from 'node:fs';
import { StockOpenings } from '../../src/world/stock-openings';

// The warrior's golden walk (doc/architecture/mission-22/golden/warrior-walk.txt): a new life on Iscoed begun as
// creation begins one, in its country's stock opening (the adit: StockOpenings.chosen), then down the drove road. The
// arguments that start it, for every spec and script that replays it; a cold capture (mission-22/cold) was played
// before there was an opening and is replayed without one, as it was played.
export class GoldenWalk {
  static readonly file = 'doc/architecture/mission-22/golden/warrior-walk.txt';
  static readonly as = 'human/warrior/Wenna';
  static readonly opening = StockOpenings.chosen('iscoed') ?? StockOpenings.none;
  // The walk's lines; and how many of them are the opening's, up to coming down to the green, where the drove's own
  // first lines (the walk as it was before the opening) begin.
  static lines(): string[] { return readFileSync(this.file, 'utf8').split('\n').filter(l => l.trim() && !l.startsWith('#')); }
  static readonly green = '{"act":"exit:region__s1_green"}';
  static opened(): number { return this.lines().indexOf(this.green) + 1; }
  // A life on Iscoed as the walk in this file was played: the golden walk's in the opening, any other's without.
  // On the earned stage (OR-1245): the walk goes across the country by the map, which a life has not earned yet.
  static args(as = this.as, file = this.file): string[] {
    return ['--world', 'iscoed', '--as', as, '--opening', file === this.file ? this.opening : StockOpenings.none,
      '--earned'];
  }
}
