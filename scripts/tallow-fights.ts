import { Journey } from '../src/session/journey';

// The weight of each fight in Tallow Deep, measured as the module's table (see tallow-deep.md) was: a fresh company at
// full health is put in the room and takes "Attack" (the fight resolves whole), once for each of N seeds, and what it
// cost is counted.
//   bun scripts/tallow-fights.ts 12 ossuary,quiet_gallery,gear_hall
type Readout = { readout: { creatures: { id: string; state: { hp: number } }[] }; current: { partyIds: string[] } };
type Cost = { won: boolean; lost: number; down: number };

class TallowFights {
  static readonly campaign = 'data/campaigns/tallow.campaign.json';
  static party(j: Journey): number[] {
    const c = j.campaign as unknown as Readout;
    return c.readout.creatures.filter(x => c.current.partyIds.includes(x.id)).map(x => x.state.hp);
  }
  static async fight(room: string, seed: string): Promise<Cost> {
    const j = await Journey.start(this.campaign, seed);
    j.put('party', room);
    const before = this.party(j);
    await j.step('Attack');
    const after = this.party(j);
    return { won: /fight is won/.test(j.latest), lost: before.reduce((sum, h, i) => sum + h - (after[i] ?? 0), 0),
      down: after.filter(h => h <= 0).length };
  }
  static async main(seeds: number, rooms: string[]) {
    for (const room of rooms) {
      const results: Cost[] = [];
      for (let s = 0; s < seeds; s++) { results.push(await this.fight(room, `f${s}`)); }
      const won = results.filter(r => r.won).length;
      console.log(`${room.padEnd(15)} won ${won}/${seeds}  hp lost ${results.map(r => r.lost).join(',')}  `
        + `members down ${results.map(r => r.down).join(',')}`);
    }
  }
}

await TallowFights.main(Number(process.argv[2] ?? 12), (process.argv[3] ?? 'ossuary').split(','));
