// An act asked for by an id a turn offered, which the turn now offers under another (OR-686, cold plays 1, 3 and 4:
// "Gather up the coins", offered within the coins once looked at closely, was "not offered" a turn later, the coins'
// one act then standing as the coins' own row; exit:…hall against exit:…hall/0:Go; a torch bought only one at a time,
// each torch on the shelf its own id). Asked for by any id it was offered by, the same act is done: what that id did,
// where it is offered still; else the same act with a thing like the one it named (the next torch of the same shelf,
// the same seller's); else a way's one step by the way's own id. Nothing is done that the turn does not offer.
export interface Asked { id: string; does?: string }
export class RunnerAgain {
  private readonly seen = new Map<string, string>();
  // What each row offered did, by its id.
  keep(rows: readonly Asked[]): void {
    for (const r of rows) { if (r.does) { this.seen.set(r.id, r.does); } }
  }
  // The id or command to do for what was asked: itself where the turn offers it.
  find(all: readonly Asked[], asked: string): string {
    if (RunnerAgain.has(all, asked)) { return asked; }
    const did = this.seen.get(asked) ?? asked;
    if (RunnerAgain.has(all, did)) { return did; }
    const like = all.find(o => o.does && RunnerAgain.like(o.does, did));
    if (like) { return like.id; }
    const ways = all.filter(o => o.id.startsWith(`${asked}/`) && /^go\(/.test(o.does ?? ''));
    return ways.length === 1 ? ways[0]!.id : asked;
  }
  private static has(all: readonly Asked[], a: string): boolean { return all.some(o => o.id === a || o.does === a); }
  // The same act, with things of one shelf in place of each other: the copies of a ware laid out for sale, which are
  // its seller's and its kind's by their ids (<seller>_<kind>_<n>, as a trader's wares are written), read off no world.
  private static like(a: string, b: string): boolean {
    const [x, y] = [a, b].map(c => /^(\w+)\((.*)\)$/.exec(c));
    if (!x || !y || x[1] !== y[1]) { return false; }
    const [p, q] = [x[2]!.split(','), y[2]!.split(',')];
    const apart = p.filter((v, i) => v !== q[i]);
    return p.length === q.length && apart.length === 1 && p.every((v, i) => v === q[i] || RunnerAgain.copy(v, q[i]!));
  }
  private static copy(a: string, b: string): boolean {
    return !/__member_/.test(a) && !!RunnerAgain.stem(a) && RunnerAgain.stem(a) === RunnerAgain.stem(b);
  }
  private static stem(id: string): string | undefined { return /^(.+)_\d+$/.exec(id)?.[1];
  }
}
